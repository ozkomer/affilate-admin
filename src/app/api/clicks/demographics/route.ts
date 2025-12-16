import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient as createSupabaseServerClient } from "@/lib/supabase/server";

// GET - Fetch demographic statistics (country/city) for current user
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
      return NextResponse.json({ countries: [], cities: [] });
    }

    // Fetch all clicks with country and city information
    const clicks = await prisma.click.findMany({
      where: {
        linkId: {
          in: linkIds,
        },
        OR: [
          { country: { not: null } },
          { city: { not: null } },
        ],
      },
      select: {
        country: true,
        city: true,
      },
    });

    // Group by country
    const countryMap = new Map<string, number>();
    clicks.forEach((click) => {
      if (click.country) {
        const current = countryMap.get(click.country) || 0;
        countryMap.set(click.country, current + 1);
      }
    });

    // Group by city
    const cityMap = new Map<string, number>();
    clicks.forEach((click) => {
      if (click.city) {
        const key = click.country ? `${click.city}, ${click.country}` : click.city;
        const current = cityMap.get(key) || 0;
        cityMap.set(key, current + 1);
      }
    });

    // Convert to array and sort by count (descending)
    const countries = Array.from(countryMap.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10); // Top 10 countries

    const cities = Array.from(cityMap.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10); // Top 10 cities

    // Calculate total for percentage calculation
    const totalClicks = clicks.length;

    return NextResponse.json({
      countries: countries.map((country) => ({
        ...country,
        percentage: totalClicks > 0 ? Math.round((country.count / totalClicks) * 100) : 0,
      })),
      cities: cities.map((city) => ({
        ...city,
        percentage: totalClicks > 0 ? Math.round((city.count / totalClicks) * 100) : 0,
      })),
      totalClicks,
    });
  } catch (error: any) {
    console.error("Error fetching demographics:", error);
    return NextResponse.json(
      { error: "Failed to fetch demographics", details: error.message },
      { status: 500 }
    );
  }
}


