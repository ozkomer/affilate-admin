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
    // Reduced timeout to 8 seconds to avoid Vercel function timeout
    const timeoutId = setTimeout(() => controller.abort(), 8000);

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
        // Wait a bit and retry once (reduced delay for timeout)
        await new Promise((resolve) => setTimeout(resolve, 1000 + Math.random() * 1000));
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

    // Check each link with timeout protection
    const results: LinkCheckResult[] = [];
    let validCount = 0;
    let invalidCount = 0;
    let errorCount = 0;
    
    // Limit processing time - if we have too many links, process in batches
    const startTime = Date.now();
    const maxProcessingTime = 50000; // 50 seconds max (leave 10 seconds buffer)
    const totalLinks = linksWithHepsiburada.reduce((sum, link) => sum + link.productUrls.length, 0);
    
    // Calculate max links to check based on estimated time per link (8s timeout + 0.5s delay = ~8.5s per link)
    const estimatedTimePerLink = 8500; // milliseconds
    const maxLinksToCheck = Math.floor(maxProcessingTime / estimatedTimePerLink);
    
    let linksChecked = 0;
    let shouldStop = false;

    for (const link of linksWithHepsiburada) {
      if (shouldStop) break;
      
      for (const productUrl of link.productUrls) {
        // Check if we're approaching timeout
        if (Date.now() - startTime > maxProcessingTime) {
          shouldStop = true;
          break;
        }
        
        // Limit number of links if too many
        if (linksChecked >= maxLinksToCheck) {
          shouldStop = true;
          break;
        }

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

        linksChecked++;

        // Add delay to avoid overwhelming the server and bot detection
        // Reduced delay to prevent timeout on Vercel
        const delay = process.env.VERCEL ? 500 : 300;
        await new Promise((resolve) => setTimeout(resolve, delay + Math.random() * 500));
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
      ...(shouldStop && linksChecked < totalLinks ? {
        warning: `Sadece ${linksChecked} link kontrol edildi (toplam ${totalLinks} link). Timeout nedeniyle durduruldu.`,
        checked: linksChecked,
        total: totalLinks,
      } : {}),
    });
  } catch (error: any) {
    console.error("Error checking links:", error);
    return NextResponse.json(
      { error: "Failed to check links", details: error.message },
      { status: 500 }
    );
  }
}




