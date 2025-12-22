import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient as createSupabaseServerClient } from "@/lib/supabase/server";

// GET - Fetch a single custom link
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

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

    const link = await prisma.customLink.findFirst({
      where: {
        id,
        userId: dbUser.id,
      },
    });

    if (!link) {
      return NextResponse.json({ error: "Link not found" }, { status: 404 });
    }

    return NextResponse.json(link);
  } catch (error: any) {
    console.error("Error fetching custom link:", error);
    return NextResponse.json(
      { error: "Failed to fetch custom link", details: error.message },
      { status: 500 }
    );
  }
}

// PUT - Update a custom link
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { title, targetUrl, shortUrl, description, tags, notes, isActive } = body;

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

    // Check if link exists and belongs to user
    const existingLink = await prisma.customLink.findFirst({
      where: {
        id,
        userId: dbUser.id,
      },
    });

    if (!existingLink) {
      return NextResponse.json({ error: "Link not found" }, { status: 404 });
    }

    // If shortUrl is being changed, check if new one exists
    if (shortUrl && shortUrl !== existingLink.shortUrl) {
      const urlExists = await prisma.customLink.findUnique({
        where: { shortUrl },
      });

      if (urlExists) {
        return NextResponse.json(
          { error: "Short URL already exists" },
          { status: 400 }
        );
      }
    }

    const updatedLink = await prisma.customLink.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(targetUrl && { targetUrl }),
        ...(shortUrl && { shortUrl }),
        ...(description !== undefined && { description: description || null }),
        ...(tags !== undefined && { tags: tags || [] }),
        ...(notes !== undefined && { notes: notes || null }),
        ...(isActive !== undefined && { isActive }),
      },
    });

    return NextResponse.json(updatedLink);
  } catch (error: any) {
    console.error("Error updating custom link:", error);
    return NextResponse.json(
      { error: "Failed to update custom link", details: error.message },
      { status: 500 }
    );
  }
}

// DELETE - Delete a custom link
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

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

    // Check if link exists and belongs to user
    const existingLink = await prisma.customLink.findFirst({
      where: {
        id,
        userId: dbUser.id,
      },
    });

    if (!existingLink) {
      return NextResponse.json({ error: "Link not found" }, { status: 404 });
    }

    await prisma.customLink.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting custom link:", error);
    return NextResponse.json(
      { error: "Failed to delete custom link", details: error.message },
      { status: 500 }
    );
  }
}

