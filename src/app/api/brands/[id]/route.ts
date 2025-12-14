import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient as createSupabaseServerClient } from "@/lib/supabase/server";


// GET - Get single brand
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

    const brand = await prisma.ecommerceBrand.findUnique({
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

    if (!brand) {
      return NextResponse.json({ error: "Brand not found" }, { status: 404 });
    }

    return NextResponse.json(brand);
  } catch (error: any) {
    console.error("Error fetching brand:", error);
    return NextResponse.json(
      { error: "Failed to fetch brand", details: error.message },
      { status: 500 }
    );
  }
}

// PUT - Update brand
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
    const { name, slug, logo, color, website, description, isActive } = body;

    if (!name || !slug) {
      return NextResponse.json(
        { error: "Name and slug are required" },
        { status: 400 }
      );
    }

    // Check if slug is taken by another brand
    const existingBrand = await prisma.ecommerceBrand.findFirst({
      where: {
        slug,
        NOT: {
          id,
        },
      },
    });

    if (existingBrand) {
      return NextResponse.json(
        { error: "This slug is already taken" },
        { status: 400 }
      );
    }

    const brand = await prisma.ecommerceBrand.update({
      where: {
        id,
      },
      data: {
        name,
        slug,
        logo: logo || null,
        color: color || null,
        website: website || null,
        description: description || null,
        isActive: isActive !== undefined ? isActive : true,
      },
    });

    return NextResponse.json(brand);
  } catch (error: any) {
    console.error("Error updating brand:", error);
    return NextResponse.json(
      { error: "Failed to update brand", details: error.message },
      { status: 500 }
    );
  }
}

// DELETE - Delete brand
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

    // Check if brand has links
    const brand = await prisma.ecommerceBrand.findUnique({
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

    if (!brand) {
      return NextResponse.json({ error: "Brand not found" }, { status: 404 });
    }

    if (brand._count.links > 0) {
      return NextResponse.json(
        { error: "Bu markaya ait linkler var. Önce linkleri silin veya başka bir markaya taşıyın." },
        { status: 400 }
      );
    }

    await prisma.ecommerceBrand.delete({
      where: {
        id,
      },
    });

    return NextResponse.json({ message: "Brand deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting brand:", error);
    return NextResponse.json(
      { error: "Failed to delete brand", details: error.message },
      { status: 500 }
    );
  }
}


