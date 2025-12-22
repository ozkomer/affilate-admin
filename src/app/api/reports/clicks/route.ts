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

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const type = searchParams.get("type"); // "all" | "product" | "list"
    const categoryId = searchParams.get("categoryId");

    // Build date filter
    const dateFilter: any = {};
    if (startDate) {
      dateFilter.gte = new Date(startDate);
    }
    if (endDate) {
      dateFilter.lte = new Date(endDate);
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

    // Fetch product clicks
    let productClicks: any[] = [];
    if (type === "all" || type === "product" || !type) {
      try {
        const whereClause: any = {
          timestamp: Object.keys(dateFilter).length > 0 ? dateFilter : undefined,
        };

        if (linkIds.length > 0) {
          whereClause.linkId = { in: linkIds };
        } else {
          whereClause.linkId = { in: [] }; // Empty array to return no results
        }

        productClicks = await prisma.click.findMany({
          where: whereClause,
          include: {
            link: {
              select: {
                id: true,
                title: true,
                shortUrl: true,
                category: {
                  select: {
                    id: true,
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
        });

        // Filter by category if specified
        if (categoryId && categoryId !== "all") {
          productClicks = productClicks.filter(
            (click) => click.link.category?.id === categoryId
          );
        }
      } catch (error: any) {
        console.error("Error fetching product clicks:", error.message);
      }
    }

    // Fetch list clicks
    let listClicks: any[] = [];
    if (type === "all" || type === "list" || !type) {
      try {
        const whereClause: any = {
          timestamp: Object.keys(dateFilter).length > 0 ? dateFilter : undefined,
        };

        listClicks = await prisma.listClick.findMany({
          where: whereClause,
          include: {
            list: {
              select: {
                id: true,
                title: true,
                slug: true,
                shortUrl: true,
                category: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
          orderBy: {
            timestamp: "desc",
          },
        });

        // Filter by category if specified
        if (categoryId && categoryId !== "all") {
          listClicks = listClicks.filter(
            (click) => click.list.category?.id === categoryId
          );
        }
      } catch (error: any) {
        console.error("Error fetching list clicks:", error.message);
      }
    }

    // Format product clicks
    const formattedProductClicks = productClicks.map((click) => ({
      id: click.id,
      type: "Ürün",
      title: click.link.title,
      shortUrl: click.link.shortUrl,
      category: click.link.category?.name || "Kategori Yok",
      brand: click.link.ecommerceBrand?.name || "Marka Yok",
      timestamp: click.timestamp,
      country: click.country || "Bilinmiyor",
      city: click.city || "Bilinmiyor",
      device: click.device || "Bilinmiyor",
      browser: click.browser || "Bilinmiyor",
      ipAddress: click.ipAddress || "Bilinmiyor",
      referrer: click.referrer || "Direkt",
    }));

    // Format list clicks
    const formattedListClicks = listClicks.map((click) => ({
      id: click.id,
      type: "Liste",
      title: click.list.title,
      shortUrl: click.list.shortUrl || click.list.slug,
      category: click.list.category?.name || "Kategori Yok",
      brand: "Liste",
      timestamp: click.timestamp,
      country: click.country || "Bilinmiyor",
      city: click.city || "Bilinmiyor",
      device: click.device || "Bilinmiyor",
      browser: click.browser || "Bilinmiyor",
      ipAddress: click.ipAddress || "Bilinmiyor",
      referrer: click.referrer || "Direkt",
    }));

    // Combine and sort by timestamp (most recent first)
    const allClicks = [...formattedProductClicks, ...formattedListClicks].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    return NextResponse.json({
      clicks: allClicks,
      total: allClicks.length,
      productCount: formattedProductClicks.length,
      listCount: formattedListClicks.length,
    });
  } catch (error: any) {
    console.error("Error fetching click reports:", error);
    return NextResponse.json(
      { error: "Failed to fetch reports", details: error.message },
      { status: 500 }
    );
  }
}

