import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient as createSupabaseServerClient } from "@/lib/supabase/server";

// GET - Fetch all custom links for current user
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

    const links = await prisma.customLink.findMany({
      where: {
        userId: dbUser.id,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(links);
  } catch (error: any) {
    console.error("Error fetching custom links:", error);
    return NextResponse.json(
      { error: "Failed to fetch custom links", details: error.message },
      { status: 500 }
    );
  }
}

// POST - Create a new custom link
export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const { title, targetUrl, shortUrl, description, tags, notes, isActive } = body;

    if (!title || !targetUrl || !shortUrl) {
      return NextResponse.json(
        { error: "Title, targetUrl, and shortUrl are required" },
        { status: 400 }
      );
    }

    // Check if shortUrl already exists
    const existingLink = await prisma.customLink.findUnique({
      where: { shortUrl },
    });

    if (existingLink) {
      return NextResponse.json(
        { error: "Short URL already exists" },
        { status: 400 }
      );
    }

    const link = await prisma.customLink.create({
      data: {
        title,
        targetUrl,
        shortUrl,
        description: description || null,
        tags: tags || [],
        notes: notes || null,
        isActive: isActive !== undefined ? isActive : true,
        userId: dbUser.id,
      },
    });

    return NextResponse.json(link, { status: 201 });
  } catch (error: any) {
    console.error("Error creating custom link:", error);
    return NextResponse.json(
      { error: "Failed to create custom link", details: error.message },
      { status: 500 }
    );
  }
}

