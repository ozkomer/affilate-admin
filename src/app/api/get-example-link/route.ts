import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET - Get an example AffiliateLink (product)
export async function GET(request: NextRequest) {
  try {
    // Get first active AffiliateLink
    const link = await prisma.affiliateLink.findFirst({
      where: {
        isActive: true,
      },
      select: {
        id: true,
        title: true,
        shortUrl: true,
        originalUrl: true,
        isActive: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (!link) {
      return NextResponse.json({
        found: false,
        message: "No active AffiliateLink found in database",
      });
    }

    return NextResponse.json({
      found: true,
      type: "affiliate-link",
      data: link,
      exampleUrl: `https://eneso.cc/${link.shortUrl}`,
    });
  } catch (error: any) {
    console.error("Error fetching example link:", error);
    return NextResponse.json(
      { error: "Failed to fetch example link", details: error.message },
      { status: 500 }
    );
  }
}

