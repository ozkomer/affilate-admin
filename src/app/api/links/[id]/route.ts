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
        productUrls: {
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

    if (!link) {
      return NextResponse.json({ error: "Link not found" }, { status: 404 });
    }

    // Get lists that contain this link
    const listedLinks = await prisma.listedLink.findMany({
      where: { linkId: id },
      select: { listId: true },
    });

    const listIds = listedLinks.map(ll => ll.listId);

    // Return link with listIds
    return NextResponse.json({
      ...link,
      listIds,
    });
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
    const { title, description, customSlug, tags, isActive, imageUrl, youtubeUrl, listIds, productUrls } =
      body;

    // Build update data object
    const updateData: any = {
      title: title !== undefined ? title : existingLink.title,
      description: description !== undefined ? description : existingLink.description,
      customSlug: customSlug !== undefined ? customSlug : existingLink.customSlug,
      tags: tags !== undefined ? tags : existingLink.tags,
      isActive: isActive !== undefined ? isActive : existingLink.isActive,
      imageUrl: imageUrl !== undefined ? imageUrl : existingLink.imageUrl,
    };

    // Only update youtubeUrl if it's provided
    if (youtubeUrl !== undefined) {
      updateData.youtubeUrl = youtubeUrl || null;
    }

    // Validate and prepare productUrls if provided
    let validProductUrls: any[] = [];
    if (productUrls !== undefined && Array.isArray(productUrls)) {
      console.log("Received productUrls:", JSON.stringify(productUrls, null, 2));
      
      if (productUrls.length === 0) {
        return NextResponse.json(
          { error: "At least one product URL is required" },
          { status: 400 }
        );
      }

      // Filter out empty entries and validate productUrls
      validProductUrls = productUrls.filter((pu: any) => {
        return pu && pu.ecommerceBrandId && pu.ecommerceBrandId.trim() !== '' && pu.url && pu.url.trim() !== '';
      });

      if (validProductUrls.length === 0) {
        return NextResponse.json(
          { error: "At least one valid product URL is required (with brand and URL)" },
          { status: 400 }
        );
      }

      console.log("Valid productUrls:", JSON.stringify(validProductUrls, null, 2));

      // Delete existing productUrls
      try {
        await prisma.productUrl.deleteMany({
          where: { linkId: id },
        });
      } catch (deleteError: any) {
        console.error("Error deleting productUrls:", deleteError);
        // Continue anyway - we'll create new ones
      }

      // Get primary URL for backward compatibility
      const primaryUrl = validProductUrls.find((pu: any) => pu.isPrimary) || validProductUrls[0];
      updateData.originalUrl = primaryUrl.url;
      // Use relation connect instead of direct ecommerceBrandId
      if (primaryUrl.ecommerceBrandId) {
        updateData.ecommerceBrand = {
          connect: { id: primaryUrl.ecommerceBrandId },
        };
      }
    }

    // Update the link first (without productUrls)
    const link = await prisma.affiliateLink.update({
      where: {
        id,
      },
      data: updateData,
      include: {
        category: true,
        ecommerceBrand: true,
      },
    });

    // Now create productUrls separately if they were provided
    if (productUrls !== undefined && Array.isArray(productUrls) && validProductUrls.length > 0) {
      try {
        await prisma.productUrl.createMany({
          data: validProductUrls.map((pu: any, index: number) => ({
            linkId: id,
            ecommerceBrandId: pu.ecommerceBrandId,
            url: pu.url.trim(),
            isPrimary: pu.isPrimary === true || (index === 0 && !validProductUrls.some((p: any) => p.isPrimary === true)),
            order: pu.order !== undefined ? pu.order : index,
          })),
          skipDuplicates: true,
        });
      } catch (createError: any) {
        console.error("Error creating productUrls:", createError);
        // Continue - at least the link was updated
      }
    }

    // Fetch the updated link with productUrls
    const updatedLink = await prisma.affiliateLink.findUnique({
      where: { id },
      include: {
        category: true,
        ecommerceBrand: true,
        productUrls: {
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

    // Update list associations
    if (listIds !== undefined) {
      // Remove all existing list associations
      await prisma.listedLink.deleteMany({
        where: { linkId: id },
      });

      // Add new list associations
      if (Array.isArray(listIds) && listIds.length > 0) {
        // Get max order for each list
        const listOrders = await Promise.all(
          listIds.map(async (listId: string) => {
            const maxOrder = await prisma.listedLink.findFirst({
              where: { listId },
              orderBy: { order: 'desc' },
              select: { order: true },
            });
            return {
              listId,
              order: maxOrder ? maxOrder.order + 1 : 0,
            };
          })
        );

        // Create ListedLink entries
        await prisma.listedLink.createMany({
          data: listOrders.map(({ listId, order }) => ({
            listId,
            linkId: id,
            order,
          })),
          skipDuplicates: true,
        });
      }
    }

    return NextResponse.json(updatedLink || link);
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

