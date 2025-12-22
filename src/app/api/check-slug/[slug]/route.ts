import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET - Check if slug exists as AffiliateLink or CuratedList
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    // Check AffiliateLink
    const link = await prisma.affiliateLink.findFirst({
      where: {
        shortUrl: slug,
      },
      select: {
        id: true,
        title: true,
        shortUrl: true,
        isActive: true,
      },
    });

    if (link) {
      return NextResponse.json({
        type: "affiliate-link",
        found: true,
        data: link,
      });
    }

    // Check CuratedList
    const list = await prisma.curatedList.findFirst({
      where: {
        shortUrl: slug,
      },
      select: {
        id: true,
        title: true,
        slug: true,
        shortUrl: true,
      },
    });

    if (list) {
      return NextResponse.json({
        type: "curated-list",
        found: true,
        data: list,
      });
    }

    // Try case-insensitive for AffiliateLink
    const linkCI = await prisma.$queryRaw<Array<{ id: string; title: string; shortUrl: string; isActive: boolean }>>`
      SELECT id, title, "shortUrl", "isActive"
      FROM "AffiliateLink"
      WHERE LOWER("shortUrl") = LOWER(${slug})
      LIMIT 1
    `;

    if (linkCI && linkCI.length > 0) {
      return NextResponse.json({
        type: "affiliate-link",
        found: true,
        caseSensitive: false,
        data: linkCI[0],
      });
    }

    // Try case-insensitive for CuratedList
    const listCI = await prisma.$queryRaw<Array<{ id: string; title: string; slug: string; shortUrl: string }>>`
      SELECT id, title, slug, "shortUrl"
      FROM "CuratedList"
      WHERE LOWER("shortUrl") = LOWER(${slug})
      LIMIT 1
    `;

    if (listCI && listCI.length > 0) {
      return NextResponse.json({
        type: "curated-list",
        found: true,
        caseSensitive: false,
        data: listCI[0],
      });
    }

    return NextResponse.json({
      type: null,
      found: false,
      message: "Slug not found in AffiliateLink or CuratedList",
    });
  } catch (error: any) {
    console.error("Error checking slug:", error);
    return NextResponse.json(
      { error: "Failed to check slug", details: error.message },
      { status: 500 }
    );
  }
}

