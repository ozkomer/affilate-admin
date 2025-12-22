import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createClient as createSupabaseServerClient } from '@/lib/supabase/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createSupabaseServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const list = await prisma.curatedList.findUnique({
      where: { id },
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
    });

    if (!list) {
      return NextResponse.json(
        { error: 'List not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(list);
  } catch (error) {
    console.error('Error fetching list:', error);
    return NextResponse.json(
      { error: 'Failed to fetch list', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

    // Check if list exists
    const existingList = await prisma.curatedList.findUnique({
      where: { id },
    });

    if (!existingList) {
      return NextResponse.json(
        { error: 'List not found' },
        { status: 404 }
      );
    }

    // Generate slug from title if title changed
    let slug = existingList.slug;
    if (title && title !== existingList.title) {
      slug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

      // Check if new slug already exists
      const slugExists = await prisma.curatedList.findUnique({
        where: { slug },
      });

      if (slugExists && slugExists.id !== id) {
        return NextResponse.json(
          { error: 'A list with this title already exists' },
          { status: 400 }
        );
      }
    }

    // Update the list
    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (slug !== existingList.slug) updateData.slug = slug;
    if (description !== undefined) updateData.description = description;
    if (coverImage !== undefined) updateData.coverImage = coverImage;
    if (youtubeUrl !== undefined) updateData.youtubeUrl = youtubeUrl;
    if (categoryId !== undefined) updateData.categoryId = categoryId;
    if (isFeatured !== undefined) updateData.isFeatured = isFeatured;
    if (showDirectLinks !== undefined) updateData.showDirectLinks = showDirectLinks;

    const list = await prisma.curatedList.update({
      where: { id },
      data: updateData,
    });

    // Update links if provided
    if (linkIds && Array.isArray(linkIds)) {
      // Delete existing links
      await prisma.listedLink.deleteMany({
        where: { listId: id },
      });

      // Create new links
      if (linkIds.length > 0) {
        await prisma.listedLink.createMany({
          data: linkIds.map((linkId: string, index: number) => ({
            listId: id,
            linkId,
            order: index,
          })),
        });
      }
    }

    // Update listUrls if provided
    if (listUrls && Array.isArray(listUrls)) {
      // Delete existing listUrls
      await prisma.listUrl.deleteMany({
        where: { listId: id },
      });

      // Create new listUrls
      if (listUrls.length > 0) {
        await prisma.listUrl.createMany({
          data: listUrls.map((lu: any) => ({
            listId: id,
            ecommerceBrandId: lu.ecommerceBrandId,
            url: lu.url,
            isPrimary: lu.isPrimary || false,
            order: lu.order || 0,
          })),
        });
      }
    }

    // Fetch the updated list with all relations
    const updatedList = await prisma.curatedList.findUnique({
      where: { id },
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

    return NextResponse.json(updatedList);
  } catch (error) {
    console.error('Error updating list:', error);
    return NextResponse.json(
      { error: 'Failed to update list', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createSupabaseServerClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if list exists
    const list = await prisma.curatedList.findUnique({
      where: { id },
      include: {
        links: true,
      },
    });

    if (!list) {
      return NextResponse.json(
        { error: 'List not found' },
        { status: 404 }
      );
    }

    // Delete the list (cascade will delete ListedLink entries)
    await prisma.curatedList.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'List deleted successfully' });
  } catch (error) {
    console.error('Error deleting list:', error);
    return NextResponse.json(
      { error: 'Failed to delete list', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

