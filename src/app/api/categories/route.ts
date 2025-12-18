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
    const maxRetries = 3;
    let retryCount = 0;
    
    while (retryCount <= maxRetries) {
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
        break; // Success, exit retry loop
      } catch (queryError: any) {
        // Retry if it's a pool error
        if (
          (queryError.message?.includes("MaxClientsInSessionMode") ||
            queryError.message?.includes("max clients reached")) &&
          retryCount < maxRetries
        ) {
          retryCount++;
          const delay = retryCount * 1000; // Exponential backoff: 1s, 2s, 3s
          console.warn(`Pool error detected (attempt ${retryCount}/${maxRetries}), retrying after ${delay}ms...`);
          await new Promise((resolve) => setTimeout(resolve, delay));
        } else {
          throw queryError; // Not a pool error or max retries reached
        }
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

