import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient as createSupabaseServerClient } from "@/lib/supabase/server";
import * as XLSX from "xlsx";

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

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const type = searchParams.get("type"); // "all" | "product" | "list"
    const categoryId = searchParams.get("categoryId");

    // Build date filter
    const dateFilter: any = {};
    if (startDate) {
      dateFilter.gte = new Date(startDate);
    }
    if (endDate) {
      dateFilter.lte = new Date(endDate);
    }

    // Get all links for the user
    const links = await prisma.affiliateLink.findMany({
      where: {
        userId: dbUser.id,
      },
      select: {
        id: true,
      },
    });

    const linkIds = links.map((link) => link.id);

    // Fetch product clicks
    let productClicks: any[] = [];
    if (type === "all" || type === "product" || !type) {
      try {
        const whereClause: any = {
          timestamp: Object.keys(dateFilter).length > 0 ? dateFilter : undefined,
        };

        if (linkIds.length > 0) {
          whereClause.linkId = { in: linkIds };
        } else {
          whereClause.linkId = { in: [] };
        }

        productClicks = await prisma.click.findMany({
          where: whereClause,
          include: {
            link: {
              select: {
                id: true,
                title: true,
                shortUrl: true,
                category: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
                ecommerceBrand: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
          orderBy: {
            timestamp: "desc",
          },
        });

        if (categoryId && categoryId !== "all") {
          productClicks = productClicks.filter(
            (click) => click.link.category?.id === categoryId
          );
        }
      } catch (error: any) {
        console.error("Error fetching product clicks:", error.message);
      }
    }

    // Fetch list clicks
    let listClicks: any[] = [];
    if (type === "all" || type === "list" || !type) {
      try {
        const whereClause: any = {
          timestamp: Object.keys(dateFilter).length > 0 ? dateFilter : undefined,
        };

        listClicks = await prisma.listClick.findMany({
          where: whereClause,
          include: {
            list: {
              select: {
                id: true,
                title: true,
                slug: true,
                shortUrl: true,
                category: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
          orderBy: {
            timestamp: "desc",
          },
        });

        if (categoryId && categoryId !== "all") {
          listClicks = listClicks.filter(
            (click) => click.list.category?.id === categoryId
          );
        }
      } catch (error: any) {
        console.error("Error fetching list clicks:", error.message);
      }
    }

    // Format data for Excel
    const excelData: Array<{
      Tip: string;
      Başlık: string;
      "Kısa URL": string;
      Kategori: string;
      Marka: string;
      Tarih: string;
      Ülke: string;
      Şehir: string;
      Cihaz: string;
      Tarayıcı: string;
      "IP Adresi": string;
      Referrer: string;
    }> = [];

    // Add product clicks
    productClicks.forEach((click) => {
      excelData.push({
        Tip: "Ürün",
        Başlık: click.link.title,
        "Kısa URL": click.link.shortUrl,
        Kategori: click.link.category?.name || "Kategori Yok",
        Marka: click.link.ecommerceBrand?.name || "Marka Yok",
        Tarih: new Date(click.timestamp).toLocaleString("tr-TR"),
        Ülke: click.country || "Bilinmiyor",
        Şehir: click.city || "Bilinmiyor",
        Cihaz: click.device || "Bilinmiyor",
        Tarayıcı: click.browser || "Bilinmiyor",
        "IP Adresi": click.ipAddress || "Bilinmiyor",
        Referrer: click.referrer || "Direkt",
      });
    });

    // Add list clicks
    listClicks.forEach((click) => {
      excelData.push({
        Tip: "Liste",
        Başlık: click.list.title,
        "Kısa URL": click.list.shortUrl || click.list.slug,
        Kategori: click.list.category?.name || "Kategori Yok",
        Marka: "Liste",
        Tarih: new Date(click.timestamp).toLocaleString("tr-TR"),
        Ülke: click.country || "Bilinmiyor",
        Şehir: click.city || "Bilinmiyor",
        Cihaz: click.device || "Bilinmiyor",
        Tarayıcı: click.browser || "Bilinmiyor",
        "IP Adresi": click.ipAddress || "Bilinmiyor",
        Referrer: click.referrer || "Direkt",
      });
    });

    // Sort by timestamp (most recent first)
    excelData.sort(
      (a, b) =>
        new Date(b.Tarih).getTime() - new Date(a.Tarih).getTime()
    );

    // Create workbook and worksheet
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(excelData);

    // Set column widths
    const columnWidths = [
      { wch: 10 }, // Tip
      { wch: 30 }, // Başlık
      { wch: 15 }, // Kısa URL
      { wch: 20 }, // Kategori
      { wch: 20 }, // Marka
      { wch: 20 }, // Tarih
      { wch: 15 }, // Ülke
      { wch: 15 }, // Şehir
      { wch: 12 }, // Cihaz
      { wch: 15 }, // Tarayıcı
      { wch: 18 }, // IP Adresi
      { wch: 30 }, // Referrer
    ];
    worksheet["!cols"] = columnWidths;

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, "Tıklama Raporu");

    // Generate Excel file buffer
    const excelBuffer = XLSX.write(workbook, {
      type: "buffer",
      bookType: "xlsx",
    });

    // Generate filename with date range
    const filename = `tiklama-raporu_${startDate || "tumu"}_${endDate || "tumu"}.xlsx`;

    // Return Excel file
    return new NextResponse(excelBuffer, {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error: any) {
    console.error("Error exporting click reports:", error);
    return NextResponse.json(
      { error: "Failed to export reports", details: error.message },
      { status: 500 }
    );
  }
}

