import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createClient as createSupabaseServerClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const categoryId = searchParams.get('categoryId');

    const where: any = {};
    if (categoryId) {
      where.categoryId = categoryId;
    }

    const lists = await prisma.curatedList.findMany({
      where,
      include: {
        category: true,
        links: {
          include: {
            link: {
              include: {
                category: true,
                ecommerceBrand: true,
              },
            },
          },
          orderBy: {
            order: 'asc',
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Format response to include link count
    const formattedLists = lists.map(list => ({
      id: list.id,
      title: list.title,
      slug: list.slug,
      description: list.description,
      coverImage: list.coverImage,
      youtubeUrl: list.youtubeUrl,
      isFeatured: list.isFeatured,
      categoryId: list.categoryId,
      category: list.category ? {
        id: list.category.id,
        name: list.category.name,
        color: list.category.color,
      } : null,
      linkCount: list.links.length,
      createdAt: list.createdAt,
      updatedAt: list.updatedAt,
    }));

    return NextResponse.json(formattedLists);
  } catch (error) {
    console.error('Error fetching lists:', error);
    return NextResponse.json(
      { error: 'Failed to fetch lists', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { title, description, coverImage, youtubeUrl, categoryId, isFeatured, linkIds } = body;

    if (!title) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      );
    }

    // Generate slug from title
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    // Check if slug already exists
    const existingList = await prisma.curatedList.findUnique({
      where: { slug },
    });

    if (existingList) {
      return NextResponse.json(
        { error: 'A list with this title already exists' },
        { status: 400 }
      );
    }

    // Create the list
    const list = await prisma.curatedList.create({
      data: {
        title,
        slug,
        description,
        coverImage,
        youtubeUrl,
        isFeatured: isFeatured || false,
        categoryId: categoryId || null,
      },
    });

    // Add links to the list if provided
    if (linkIds && Array.isArray(linkIds) && linkIds.length > 0) {
      await prisma.listedLink.createMany({
        data: linkIds.map((linkId: string, index: number) => ({
          listId: list.id,
          linkId,
          order: index,
        })),
      });
    }

    return NextResponse.json(list, { status: 201 });
  } catch (error) {
    console.error('Error creating list:', error);
    return NextResponse.json(
      { error: 'Failed to create list', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

