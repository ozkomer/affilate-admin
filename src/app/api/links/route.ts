import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient as createSupabaseServerClient } from "@/lib/supabase/server";


// Generate short URL slug
function generateShortUrl(): string {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// GET - Fetch all links for current user
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

    // Try to fetch links with productUrls
    let links: any[];
    try {
      links = await prisma.affiliateLink.findMany({
        where: {
          userId: dbUser.id,
        },
        include: {
          category: true,
          ecommerceBrand: true,
          productUrls: {
            include: {
              ecommerceBrand: true,
            },
            orderBy: [
              { isPrimary: 'desc' },
              { order: 'asc' },
            ],
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });
    } catch (error: any) {
      // Fallback: fetch without productUrls if Prisma client doesn't recognize it
      console.log("productUrls include failed, fetching separately:", error.message);
      links = await prisma.affiliateLink.findMany({
        where: {
          userId: dbUser.id,
        },
        include: {
          category: true,
          ecommerceBrand: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      // Fetch productUrls separately using raw SQL
      const linkIds = links.map(l => l.id);
      if (linkIds.length > 0) {
        try {
          const productUrlsData = await prisma.$queryRaw<any[]>`
            SELECT 
              pu.*,
              json_build_object(
                'id', eb.id,
                'name', eb.name,
                'slug', eb.slug,
                'logo', eb.logo,
                'color', eb.color
              ) as "ecommerceBrand"
            FROM "ProductUrl" pu
            JOIN "EcommerceBrand" eb ON pu."ecommerceBrandId" = eb.id
            WHERE pu."linkId" = ANY(${linkIds}::text[])
            ORDER BY pu."isPrimary" DESC, pu."order" ASC
          `;

          // Group productUrls by linkId
          const productUrlsByLinkId: Record<string, any[]> = {};
          productUrlsData.forEach((pu: any) => {
            if (!productUrlsByLinkId[pu.linkId]) {
              productUrlsByLinkId[pu.linkId] = [];
            }
            productUrlsByLinkId[pu.linkId].push({
              ...pu,
              ecommerceBrand: typeof pu.ecommerceBrand === 'string' ? JSON.parse(pu.ecommerceBrand) : pu.ecommerceBrand,
            });
          });

          // Add productUrls to links
          links = links.map(link => ({
            ...link,
            productUrls: productUrlsByLinkId[link.id] || [],
          }));
        } catch (sqlError: any) {
          console.error("Error fetching productUrls:", sqlError);
          // Continue without productUrls
          links = links.map(link => ({
            ...link,
            productUrls: [],
          }));
        }
      } else {
        // No links, add empty productUrls array
        links = links.map(link => ({
          ...link,
          productUrls: [],
        }));
      }
    }

    return NextResponse.json(links);
  } catch (error: any) {
    console.error("Error fetching links:", error);
    return NextResponse.json(
      { error: "Failed to fetch links", details: error.message },
      { status: 500 }
    );
  }
}

// POST - Create new link
export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { title, originalUrl, description, categoryId, ecommerceBrandId, customSlug, tags, imageUrl, youtubeUrl, listIds, productUrls } =
      body;

    if (!title) {
      return NextResponse.json(
        { error: "Title is required" },
        { status: 400 }
      );
    }

    // Validate productUrls if provided
    if (productUrls && Array.isArray(productUrls)) {
      if (productUrls.length === 0) {
        return NextResponse.json(
          { error: "At least one product URL is required" },
          { status: 400 }
        );
      }
      for (const pu of productUrls) {
        if (!pu.ecommerceBrandId || !pu.url) {
          return NextResponse.json(
            { error: "Each product URL must have a brand and URL" },
            { status: 400 }
          );
        }
      }
    } else if (!originalUrl) {
      return NextResponse.json(
        { error: "Either productUrls or originalUrl is required" },
        { status: 400 }
      );
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

    // Generate short URL
    let shortUrl = customSlug || generateShortUrl();

    // Check if short URL already exists
    let existingLink = await prisma.affiliateLink.findUnique({
      where: { shortUrl },
    });

    // If custom slug exists, try to generate a new one
    if (existingLink && !customSlug) {
      let attempts = 0;
      while (existingLink && attempts < 10) {
        shortUrl = generateShortUrl();
        existingLink = await prisma.affiliateLink.findUnique({
          where: { shortUrl },
        });
        attempts++;
      }
    }

    if (existingLink) {
      return NextResponse.json(
        { error: "This short URL is already taken" },
        { status: 400 }
      );
    }

    // Determine primary URL and brand for backward compatibility
    let primaryUrl = originalUrl;
    let primaryBrandId = ecommerceBrandId;
    
    if (productUrls && productUrls.length > 0) {
      const primaryProductUrl = productUrls.find((pu: any) => pu.isPrimary) || productUrls[0];
      primaryUrl = primaryProductUrl.url;
      primaryBrandId = primaryProductUrl.ecommerceBrandId;
    }

    const link = await prisma.affiliateLink.create({
      data: {
        title,
        originalUrl: primaryUrl || null, // For backward compatibility
        description: description || null,
        shortUrl,
        customSlug: customSlug || null,
        userId: dbUser.id,
        categoryId: categoryId || null,
        ecommerceBrandId: primaryBrandId || null, // For backward compatibility
        tags: tags || [],
        imageUrl: imageUrl || null,
        youtubeUrl: youtubeUrl || null,
        isActive: true,
        clickCount: 0,
        productUrls: productUrls && productUrls.length > 0 ? {
          create: productUrls.map((pu: any, index: number) => ({
            ecommerceBrandId: pu.ecommerceBrandId,
            url: pu.url,
            isPrimary: pu.isPrimary || index === 0,
            order: pu.order !== undefined ? pu.order : index,
          })),
        } : undefined,
      },
      include: {
        category: true,
        ecommerceBrand: true,
        productUrls: {
          include: {
            ecommerceBrand: true,
          },
          orderBy: [
            { isPrimary: 'desc' },
            { order: 'asc' },
          ],
        },
      },
    });

    // Add link to selected lists
    if (listIds && Array.isArray(listIds) && listIds.length > 0) {
      // Get max order for each list
      const listOrders = await Promise.all(
        listIds.map(async (listId: string) => {
          const maxOrder = await prisma.listedLink.findFirst({
            where: { listId },
            orderBy: { order: 'desc' },
            select: { order: true },
          });
          return {
            listId,
            order: maxOrder ? maxOrder.order + 1 : 0,
          };
        })
      );

      // Create ListedLink entries
      await prisma.listedLink.createMany({
        data: listOrders.map(({ listId, order }) => ({
          listId,
          linkId: link.id,
          order,
        })),
        skipDuplicates: true,
      });
    }

    return NextResponse.json(link, { status: 201 });
  } catch (error: any) {
    console.error("Error creating link:", error);
    return NextResponse.json(
      { error: "Failed to create link", details: error.message },
      { status: 500 }
    );
  }
}

