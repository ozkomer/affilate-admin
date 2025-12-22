import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient as createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get total product clicks count from Click table
    let totalProductClicks = 0;
    try {
      totalProductClicks = await prisma.click.count();
      console.log('Total Click records:', totalProductClicks);
    } catch (error: any) {
      console.error('Error counting Click records:', error.message);
    }

    // Get total links count
    const totalLinks = await prisma.affiliateLink.count();
    console.log('Total AffiliateLink records:', totalLinks);

    // Get total click count from AffiliateLink clickCount field (sum)
    const linksWithClicks = await prisma.affiliateLink.aggregate({
      _sum: {
        clickCount: true,
      },
    });

    const totalClickCount = linksWithClicks._sum.clickCount || 0;
    console.log('Total clickCount sum from AffiliateLink:', totalClickCount);

    // Get recent product clicks (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    let recentProductClicks = 0;
    try {
      recentProductClicks = await prisma.click.count({
        where: {
          timestamp: {
            gte: thirtyDaysAgo,
          },
        },
      });
    } catch (error: any) {
      console.error('Error counting recent Click records:', error.message);
    }

    return NextResponse.json({
      totalProductClicks,
      totalLinks,
      totalClickCount,
      recentProductClicks,
    });
  } catch (error: any) {
    console.error("Error fetching product click statistics:", error);
    return NextResponse.json(
      { error: "Failed to fetch statistics", details: error.message },
      { status: 500 }
    );
  }
}

