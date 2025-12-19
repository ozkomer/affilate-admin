import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient as createSupabaseServerClient } from "@/lib/supabase/server";

// Force Node.js runtime for Vercel (better for external fetch requests)
export const runtime = 'nodejs';
export const maxDuration = 60; // Vercel Pro plan allows up to 60 seconds

interface LinkCheckResult {
  linkId: string;
  productUrlId: string;
  title: string;
  url: string;
  status: "valid" | "invalid" | "error";
  statusCode?: number;
  finalUrl?: string;
  error?: string;
}

// Check if a URL redirects to Hepsiburada homepage (invalid link)
async function checkLink(url: string, retryCount: number = 0): Promise<{
  status: "valid" | "invalid" | "error";
  statusCode?: number;
  finalUrl?: string;
  error?: string;
}> {
  try {
    // Use GET request with realistic browser headers to avoid bot detection
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000); // 20 second timeout for Vercel

    try {
      // Randomize User-Agent slightly to avoid detection
      const userAgents = [
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0",
      ];
      const randomUserAgent = userAgents[Math.floor(Math.random() * userAgents.length)];

      const response = await fetch(url, {
        method: "GET",
        redirect: "follow",
        signal: controller.signal,
        headers: {
          "User-Agent": randomUserAgent,
          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
          "Accept-Language": "tr-TR,tr;q=0.9,en-US;q=0.8,en;q=0.7",
          "Accept-Encoding": "gzip, deflate, br",
          "Connection": "keep-alive",
          "Upgrade-Insecure-Requests": "1",
          "Sec-Fetch-Dest": "document",
          "Sec-Fetch-Mode": "navigate",
          "Sec-Fetch-Site": "none",
          "Sec-Fetch-User": "?1",
          "Cache-Control": "max-age=0",
          "DNT": "1",
        },
      });

      clearTimeout(timeoutId);
      const finalUrl = response.url || url;

      // Handle 403 Forbidden - retry once with delay if first attempt
      if (response.status === 403 && retryCount < 1) {
        // Wait a bit and retry once
        await new Promise((resolve) => setTimeout(resolve, 2000 + Math.random() * 3000));
        return checkLink(url, retryCount + 1);
      }

      // If still 403 after retry, mark as error
      if (response.status === 403) {
        return {
          status: "error",
          statusCode: 403,
          finalUrl,
          error: "403 Forbidden - Bot detection (link kontrol edilemedi)",
        };
      }

      // Check if final URL is Hepsiburada homepage
      const hepsiburadaHomePatterns = [
        /^https?:\/\/(www\.)?hepsiburada\.com\/?$/,
        /^https?:\/\/(www\.)?hepsiburada\.com\/index\.html$/,
        /^https?:\/\/(www\.)?hepsiburada\.com\/anasayfa/,
      ];

      const isHomepage = hepsiburadaHomePatterns.some((pattern) =>
        pattern.test(finalUrl)
      );

      if (isHomepage) {
        return {
          status: "invalid",
          statusCode: response.status,
          finalUrl,
        };
      }

      // If status is OK and not homepage, consider it valid
      if (response.status >= 200 && response.status < 400) {
        return {
          status: "valid",
          statusCode: response.status,
          finalUrl,
        };
      }

      return {
        status: "error",
        statusCode: response.status,
        finalUrl,
        error: `HTTP ${response.status}`,
      };
    } catch (fetchError: any) {
      clearTimeout(timeoutId);
      if (fetchError.name === "AbortError") {
        return {
          status: "error",
          error: "Timeout: Request took too long",
        };
      }
      throw fetchError;
    }
  } catch (error: any) {
    return {
      status: "error",
      error: error.message || "Unknown error",
    };
  }
}

// GET - Check all Hepsiburada links
export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get or create user in database
    let dbUser = await prisma.user.findUnique({
      where: { supabaseUserId: user.id },
    });

    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Find Hepsiburada brand
    const hepsiburadaBrand = await prisma.ecommerceBrand.findFirst({
      where: {
        OR: [
          { slug: "hepsiburada" },
          { name: { contains: "Hepsiburada", mode: "insensitive" } },
        ],
      },
    });

    if (!hepsiburadaBrand) {
      return NextResponse.json(
        { error: "Hepsiburada brand not found" },
        { status: 404 }
      );
    }

    // Get all links for the user with Hepsiburada product URLs
    const links = await prisma.affiliateLink.findMany({
      where: {
        userId: dbUser.id,
      },
      include: {
        productUrls: {
          where: {
            ecommerceBrandId: hepsiburadaBrand.id,
          },
        },
      },
    });

    // Filter links that have Hepsiburada URLs
    const linksWithHepsiburada = links.filter(
      (link) => link.productUrls.length > 0
    );

    if (linksWithHepsiburada.length === 0) {
      return NextResponse.json({
        results: [],
        summary: {
          total: 0,
          valid: 0,
          invalid: 0,
          error: 0,
        },
      });
    }

    // Check each link
    const results: LinkCheckResult[] = [];
    let validCount = 0;
    let invalidCount = 0;
    let errorCount = 0;

    for (const link of linksWithHepsiburada) {
      for (const productUrl of link.productUrls) {
        const checkResult = await checkLink(productUrl.url);

        results.push({
          linkId: link.id,
          productUrlId: productUrl.id,
          title: link.title,
          url: productUrl.url,
          ...checkResult,
        });

        if (checkResult.status === "valid") validCount++;
        else if (checkResult.status === "invalid") invalidCount++;
        else errorCount++;

        // Add delay to avoid overwhelming the server and bot detection
        // Longer delay on Vercel to avoid rate limiting
        const delay = process.env.VERCEL ? 2000 : 1000;
        await new Promise((resolve) => setTimeout(resolve, delay + Math.random() * 1000));
      }
    }

    return NextResponse.json({
      results,
      summary: {
        total: results.length,
        valid: validCount,
        invalid: invalidCount,
        error: errorCount,
      },
    });
  } catch (error: any) {
    console.error("Error checking links:", error);
    return NextResponse.json(
      { error: "Failed to check links", details: error.message },
      { status: 500 }
    );
  }
}




