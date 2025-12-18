import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient as createSupabaseServerClient } from "@/lib/supabase/server";

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
async function checkLink(url: string): Promise<{
  status: "valid" | "invalid" | "error";
  statusCode?: number;
  finalUrl?: string;
  error?: string;
}> {
  try {
    // Use HEAD request first for efficiency
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    try {
      const response = await fetch(url, {
        method: "HEAD",
        redirect: "follow",
        signal: controller.signal,
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        },
      });

      clearTimeout(timeoutId);
      const finalUrl = response.url || url;

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

        // Add small delay to avoid overwhelming the server
        await new Promise((resolve) => setTimeout(resolve, 500));
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

