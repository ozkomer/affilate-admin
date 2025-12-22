import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createClient as createSupabaseServerClient } from '@/lib/supabase/server';

// Generate short URL slug
function generateShortUrl(): string {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

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
        listUrls: {
          include: {
            ecommerceBrand: true,
          },
          orderBy: [
            { isPrimary: 'desc' },
            { order: 'asc' },
          ],
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
      shortUrl: list.shortUrl,
      description: list.description,
      coverImage: list.coverImage,
      youtubeUrl: list.youtubeUrl,
      isFeatured: list.isFeatured,
      showDirectLinks: list.showDirectLinks || false,
      clickCount: list.clickCount || 0,
      categoryId: list.categoryId,
      category: list.category ? {
        id: list.category.id,
        name: list.category.name,
        color: list.category.color,
      } : null,
      linkCount: list.links.length,
      listUrls: list.listUrls || [],
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
    const { title, description, coverImage, youtubeUrl, categoryId, isFeatured, showDirectLinks, linkIds, listUrls } = body;

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

    // Generate short URL
    let shortUrl = generateShortUrl();
    // Check if short URL already exists (check both AffiliateLink and CuratedList)
    let shortUrlExists = await prisma.affiliateLink.findUnique({
      where: { shortUrl },
    }) || await prisma.curatedList.findUnique({
      where: { shortUrl },
    });

    while (shortUrlExists) {
      shortUrl = generateShortUrl();
      shortUrlExists = await prisma.affiliateLink.findUnique({
        where: { shortUrl },
      }) || await prisma.curatedList.findUnique({
        where: { shortUrl },
      });
    }

    // Create the list
    const list = await prisma.curatedList.create({
      data: {
        title,
        slug,
        shortUrl,
        description,
        coverImage,
        youtubeUrl,
        isFeatured: isFeatured || false,
        showDirectLinks: showDirectLinks || false,
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

    // Add listUrls if provided
    if (listUrls && Array.isArray(listUrls) && listUrls.length > 0) {
      await prisma.listUrl.createMany({
        data: listUrls.map((lu: any) => ({
          listId: list.id,
          ecommerceBrandId: lu.ecommerceBrandId,
          url: lu.url,
          isPrimary: lu.isPrimary || false,
          order: lu.order || 0,
        })),
      });
    }

    // Fetch the created list with all relations
    const createdList = await prisma.curatedList.findUnique({
      where: { id: list.id },
      include: {
        category: true,
        links: {
          include: {
            link: true,
          },
        },
        listUrls: {
          include: {
            ecommerceBrand: true,
          },
        },
      },
    });

    return NextResponse.json(createdList, { status: 201 });
  } catch (error) {
    console.error('Error creating list:', error);
    return NextResponse.json(
      { error: 'Failed to create list', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

