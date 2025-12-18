import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient as createSupabaseServerClient } from "@/lib/supabase/server";


// GET - Fetch all categories
export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let categories;
    try {
      categories = await prisma.category.findMany({
        include: {
          _count: {
            select: {
              links: true,
            },
          },
        },
        orderBy: [
          { order: "asc" as const },
          { name: "asc" as const },
        ],
      });
    } catch (queryError: any) {
      // Retry once if it's a pool error
      if (
        queryError.message?.includes("MaxClientsInSessionMode") ||
        queryError.message?.includes("max clients reached")
      ) {
        console.warn("Pool error detected, retrying after 1 second...");
        await new Promise((resolve) => setTimeout(resolve, 1000));
        categories = await prisma.category.findMany({
          include: {
            _count: {
              select: {
                links: true,
              },
            },
          },
          orderBy: [
            { order: "asc" as const },
            { name: "asc" as const },
          ],
        });
      } else {
        throw queryError;
      }
    }

    return NextResponse.json(categories);
  } catch (error: any) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      { error: "Failed to fetch categories", details: error.message },
      { status: 500 }
    );
  }
}

// POST - Create new category
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
    const { name, description, color, imageUrl, order } = body;

    if (!name) {
      return NextResponse.json(
        { error: "Category name is required" },
        { status: 400 }
      );
    }

    // If order is not provided, set it to the max order + 1
    let categoryOrder = order;
    if (categoryOrder === undefined || categoryOrder === null) {
      const maxOrderCategory = await prisma.category.findFirst({
        orderBy: { order: "desc" },
        select: { order: true },
      });
      categoryOrder = (maxOrderCategory?.order ?? -1) + 1;
    }

    const category = await prisma.category.create({
      data: {
        name,
        description: description || null,
        color: color || null,
        imageUrl: imageUrl || null,
        order: categoryOrder,
      },
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error: any) {
    console.error("Error creating category:", error);
    return NextResponse.json(
      { error: "Failed to create category", details: error.message },
      { status: 500 }
    );
  }
}

