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

    const links = await prisma.affiliateLink.findMany({
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
    const { title, originalUrl, description, categoryId, ecommerceBrandId, customSlug, tags, imageUrl, youtubeUrl, listIds } =
      body;

    if (!title || !originalUrl) {
      return NextResponse.json(
        { error: "Title and original URL are required" },
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

    const link = await prisma.affiliateLink.create({
      data: {
        title,
        originalUrl,
        description: description || null,
        shortUrl,
        customSlug: customSlug || null,
        userId: dbUser.id,
        categoryId: categoryId || null,
        ecommerceBrandId: ecommerceBrandId || null,
        tags: tags || [],
        imageUrl: imageUrl || null,
        youtubeUrl: youtubeUrl || null,
        isActive: true,
        clickCount: 0,
      },
      include: {
        category: true,
        ecommerceBrand: true,
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

