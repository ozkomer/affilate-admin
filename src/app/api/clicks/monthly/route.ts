import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient as createSupabaseServerClient } from "@/lib/supabase/server";

// GET - Fetch monthly click statistics for current user
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
      dbUser = await prisma.user.create({
        data: {
          supabaseUserId: user.id,
          email: user.email || "",
          name: user.user_metadata?.full_name || user.email?.split("@")[0],
        },
      });
    }

    // Get all links for the user
    const links = await prisma.affiliateLink.findMany({
      where: {
        userId: dbUser.id,
      },
      select: {
        id: true,
      },
    });

    const linkIds = links.map((link) => link.id);

    if (linkIds.length === 0) {
      // Return zeros for all months if no links
      const monthlyData = Array(12).fill(0);
      return NextResponse.json(monthlyData);
    }

    // Get current year
    const currentYear = new Date().getFullYear();

    // Initialize monthly data array (12 months)
    const monthlyData = Array(12).fill(0);

    // Fetch clicks for the current year, grouped by month
    const clicks = await prisma.click.findMany({
      where: {
        linkId: {
          in: linkIds,
        },
        timestamp: {
          gte: new Date(`${currentYear}-01-01`),
          lt: new Date(`${currentYear + 1}-01-01`),
        },
      },
      select: {
        timestamp: true,
      },
    });

    // Group clicks by month (0-11)
    clicks.forEach((click) => {
      const month = new Date(click.timestamp).getMonth();
      monthlyData[month]++;
    });

    return NextResponse.json(monthlyData);
  } catch (error: any) {
    console.error("Error fetching monthly clicks:", error);
    return NextResponse.json(
      { error: "Failed to fetch monthly clicks", details: error.message },
      { status: 500 }
    );
  }
}


