import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient as createSupabaseServerClient } from "@/lib/supabase/server";


// GET - Get single link
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

    const dbUser = await prisma.user.findUnique({
      where: { supabaseUserId: user.id },
    });

    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const link = await prisma.affiliateLink.findFirst({
      where: {
        id,
        userId: dbUser.id,
      },
      include: {
        category: true,
        ecommerceBrand: true,
      },
    });

    if (!link) {
      return NextResponse.json({ error: "Link not found" }, { status: 404 });
    }

    return NextResponse.json(link);
  } catch (error: any) {
    console.error("Error fetching link:", error);
    return NextResponse.json(
      { error: "Failed to fetch link", details: error.message },
      { status: 500 }
    );
  }
}

// PUT - Update link
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

    const dbUser = await prisma.user.findUnique({
      where: { supabaseUserId: user.id },
    });

    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if link exists and belongs to user
    const existingLink = await prisma.affiliateLink.findFirst({
      where: {
        id,
        userId: dbUser.id,
      },
    });

    if (!existingLink) {
      return NextResponse.json({ error: "Link not found" }, { status: 404 });
    }

    const body = await request.json();
    const { title, originalUrl, description, categoryId, ecommerceBrandId, customSlug, tags, isActive } =
      body;

    const link = await prisma.affiliateLink.update({
      where: {
        id,
      },
      data: {
        title: title || existingLink.title,
        originalUrl: originalUrl || existingLink.originalUrl,
        description: description !== undefined ? description : existingLink.description,
        categoryId: categoryId !== undefined ? categoryId : existingLink.categoryId,
        ecommerceBrandId: ecommerceBrandId !== undefined ? ecommerceBrandId : existingLink.ecommerceBrandId,
        customSlug: customSlug !== undefined ? customSlug : existingLink.customSlug,
        tags: tags || existingLink.tags,
        isActive: isActive !== undefined ? isActive : existingLink.isActive,
      },
      include: {
        category: true,
        ecommerceBrand: true,
      },
    });

    return NextResponse.json(link);
  } catch (error: any) {
    console.error("Error updating link:", error);
    return NextResponse.json(
      { error: "Failed to update link", details: error.message },
      { status: 500 }
    );
  }
}

// DELETE - Delete link
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

    const dbUser = await prisma.user.findUnique({
      where: { supabaseUserId: user.id },
    });

    if (!dbUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if link exists and belongs to user
    const existingLink = await prisma.affiliateLink.findFirst({
      where: {
        id,
        userId: dbUser.id,
      },
    });

    if (!existingLink) {
      return NextResponse.json({ error: "Link not found" }, { status: 404 });
    }

    await prisma.affiliateLink.delete({
      where: {
        id,
      },
    });

    return NextResponse.json({ message: "Link deleted successfully" });
  } catch (error: any) {
    console.error("Error deleting link:", error);
    return NextResponse.json(
      { error: "Failed to delete link", details: error.message },
      { status: 500 }
    );
  }
}

