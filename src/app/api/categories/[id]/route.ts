import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient as createSupabaseServerClient } from "@/lib/supabase/server";


// GET - Get single category
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const category = await prisma.category.findUnique({
      where: {
        id,
      },
      include: {
        _count: {
          select: {
            links: true,
          },
        },
      },
    });

    if (!category) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    return NextResponse.json(category);
  } catch (error: any) {
    console.error("Error fetching category:", error);
    return NextResponse.json(
      { error: "Failed to fetch category", details: error.message },
      { status: 500 }
    );
  }
}

// PUT - Update category
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

    const updateData: any = {
      name,
      description: description || null,
      color: color || null,
      imageUrl: imageUrl || null,
    };

    if (order !== undefined && order !== null) {
      updateData.order = order;
    }

    const category = await prisma.category.update({
      where: {
        id,
      },
      data: updateData,
    });

    return NextResponse.json(category);
  } catch (error: any) {
    console.error("Error updating category:", error);
    return NextResponse.json(
      { error: "Failed to update category", details: error.message },
      { status: 500 }
    );
  }
}

// DELETE - Delete category
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if category has links
    const category = await prisma.category.findUnique({
      where: {
        id,
      },
      include: {
        _count: {
          select: {
            links: true,
          },
        },
      },
    });

    if (!category) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    if (category._count.links > 0) {
      return NextResponse.json(
        { error: "Bu kategoriye ait linkler var. Önce linkleri silin veya başka bir kategoriye taşıyın." },
        { status: 400 }
      );
    }

    await prisma.category.delete({
      where: {
        id,
      },
    });

    return NextResponse.json({ message: "Category deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting category:", error);
    return NextResponse.json(
      { error: "Failed to delete category", details: error.message },
      { status: 500 }
    );
  }
}

// PATCH - Update category order (move up/down)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { direction } = body; // "up" or "down"

    if (!direction || (direction !== "up" && direction !== "down")) {
      return NextResponse.json(
        { error: "Direction must be 'up' or 'down'" },
        { status: 400 }
      );
    }

    const currentCategory = await prisma.category.findUnique({
      where: { id },
      select: { id: true, order: true, name: true },
    });

    if (!currentCategory) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    // Get all categories ordered by order
    const allCategories = await prisma.category.findMany({
      orderBy: [{ order: "asc" }, { name: "asc" }],
      select: { id: true, order: true },
    });

    const currentIndex = allCategories.findIndex((cat) => cat.id === id);

    if (currentIndex === -1) {
      return NextResponse.json({ error: "Category not found in list" }, { status: 404 });
    }

    // Determine target index
    let targetIndex: number;
    if (direction === "up") {
      targetIndex = currentIndex - 1;
      if (targetIndex < 0) {
        return NextResponse.json(
          { error: "Category is already at the top" },
          { status: 400 }
        );
      }
    } else {
      targetIndex = currentIndex + 1;
      if (targetIndex >= allCategories.length) {
        return NextResponse.json(
          { error: "Category is already at the bottom" },
          { status: 400 }
        );
      }
    }

    const targetCategory = allCategories[targetIndex];

    // Swap orders using a transaction
    await prisma.$transaction([
      prisma.category.update({
        where: { id },
        data: { order: targetCategory.order },
      }),
      prisma.category.update({
        where: { id: targetCategory.id },
        data: { order: currentCategory.order },
      }),
    ]);

    return NextResponse.json({ message: "Category order updated successfully" });
  } catch (error: any) {
    console.error("Error updating category order:", error);
    return NextResponse.json(
      { error: "Failed to update category order", details: error.message },
      { status: 500 }
    );
  }
}


