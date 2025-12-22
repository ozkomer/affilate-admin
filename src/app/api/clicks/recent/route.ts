import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient as createSupabaseServerClient } from "@/lib/supabase/server";

// GET - Fetch recent clicks for current user
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
      return NextResponse.json([]);
    }

    // Fetch recent product clicks (last 20) with link information
    let productClicks: any[] = [];
    try {
      productClicks = await prisma.click.findMany({
        where: {
          linkId: {
            in: linkIds,
          },
        },
        include: {
          link: {
            select: {
              id: true,
              title: true,
              shortUrl: true,
              category: {
                select: {
                  name: true,
                },
              },
              ecommerceBrand: {
                select: {
                  name: true,
                  logo: true,
                },
              },
            },
          },
        },
        orderBy: {
          timestamp: "desc",
        },
        take: 20,
      });
    } catch (error: any) {
      console.error('Error fetching product clicks:', error.message);
    }

    // Fetch recent list clicks (last 20) with list information
    let listClicks: any[] = [];
    try {
      listClicks = await prisma.listClick.findMany({
        include: {
          list: {
            select: {
              id: true,
              title: true,
              slug: true,
              shortUrl: true,
              category: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
        orderBy: {
          timestamp: "desc",
        },
        take: 20,
      });
    } catch (error: any) {
      console.error('Error fetching list clicks:', error.message);
    }

    // Format product clicks
    const formattedProductClicks = productClicks.map((click) => ({
      id: click.id,
      type: 'product' as const,
      linkTitle: click.link.title,
      shortUrl: click.link.shortUrl,
      category: click.link.category?.name || "Kategori Yok",
      brand: click.link.ecommerceBrand?.name || "Marka Yok",
      brandLogo: click.link.ecommerceBrand?.logo || null,
      timestamp: click.timestamp,
      country: click.country || "Bilinmiyor",
      device: click.device || "Bilinmiyor",
    }));

    // Format list clicks
    const formattedListClicks = listClicks.map((click) => ({
      id: click.id,
      type: 'list' as const,
      linkTitle: click.list.title,
      shortUrl: click.list.shortUrl || click.list.slug,
      category: click.list.category?.name || "Kategori Yok",
      brand: "Liste",
      brandLogo: null,
      timestamp: click.timestamp,
      country: click.country || "Bilinmiyor",
      device: click.device || "Bilinmiyor",
    }));

    // Combine and sort by timestamp (most recent first)
    const allClicks = [...formattedProductClicks, ...formattedListClicks]
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 10); // Take top 10 most recent

    return NextResponse.json(allClicks);
  } catch (error: any) {
    console.error("Error fetching recent clicks:", error);
    return NextResponse.json(
      { error: "Failed to fetch recent clicks", details: error.message },
      { status: 500 }
    );
  }
}


