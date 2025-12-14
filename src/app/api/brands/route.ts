import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient as createSupabaseServerClient } from "@/lib/supabase/server";


// GET - Fetch all brands
export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const brands = await prisma.ecommerceBrand.findMany({
      include: {
        _count: {
          select: {
            links: true,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json(brands);
  } catch (error: any) {
    console.error("Error fetching brands:", error);
    return NextResponse.json(
      { error: "Failed to fetch brands", details: error.message },
      { status: 500 }
    );
  }
}

// POST - Create new brand
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
    const { name, slug, logo, color, website, description, isActive } = body;

    if (!name || !slug) {
      return NextResponse.json(
        { error: "Name and slug are required" },
        { status: 400 }
      );
    }

    // Check if slug already exists
    if (!prisma || !prisma.ecommerceBrand) {
      console.error('Prisma client error:', {
        prisma: typeof prisma,
        ecommerceBrand: typeof prisma?.ecommerceBrand,
        prismaKeys: prisma ? Object.keys(prisma) : 'prisma is undefined'
      });
      throw new Error('Prisma client is not properly initialized. ecommerceBrand model is missing.');
    }

    const existingBrand = await prisma.ecommerceBrand.findUnique({
      where: { slug },
    });

    if (existingBrand) {
      return NextResponse.json(
        { error: "This slug is already taken" },
        { status: 400 }
      );
    }

    const brand = await prisma.ecommerceBrand.create({
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

    return NextResponse.json(brand, { status: 201 });
  } catch (error: any) {
    console.error("Error creating brand:", error);
    console.error("Error stack:", error.stack);
    console.error("Prisma client:", typeof prisma);
    console.error("EcommerceBrand:", typeof prisma?.ecommerceBrand);
    return NextResponse.json(
      { 
        error: "Failed to create brand", 
        details: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}

