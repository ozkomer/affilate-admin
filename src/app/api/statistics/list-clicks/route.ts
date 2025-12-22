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

    // Get total list clicks count from ListClick table
    let totalListClicks = 0;
    try {
      totalListClicks = await prisma.listClick.count();
      console.log('Total ListClick records:', totalListClicks);
    } catch (error: any) {
      console.error('Error counting ListClick records (table might not exist):', error.message);
      // If table doesn't exist, try to get from CuratedList clickCount instead
    }

    // Get total lists count
    const totalLists = await prisma.curatedList.count();
    console.log('Total CuratedList records:', totalLists);

    // Get total click count from CuratedList clickCount field (sum)
    const listsWithClicks = await prisma.curatedList.aggregate({
      _sum: {
        clickCount: true,
      },
    });

    const totalClickCount = listsWithClicks._sum.clickCount || 0;
    console.log('Total clickCount sum from CuratedList:', totalClickCount);

    // Get recent list clicks (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    let recentListClicks = 0;
    try {
      recentListClicks = await prisma.listClick.count({
        where: {
          timestamp: {
            gte: thirtyDaysAgo,
          },
        },
      });
    } catch (error: any) {
      console.error('Error counting recent ListClick records:', error.message);
    }

    return NextResponse.json({
      totalListClicks,
      totalLists,
      totalClickCount,
      recentListClicks,
    });
  } catch (error: any) {
    console.error("Error fetching list click statistics:", error);
    return NextResponse.json(
      { error: "Failed to fetch statistics", details: error.message },
      { status: 500 }
    );
  }
}

