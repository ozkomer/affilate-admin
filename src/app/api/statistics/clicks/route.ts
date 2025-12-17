import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") || "monthly"; // monthly, quarterly, annually

    const now = new Date();
    let startDate: Date;
    let groupBy: "month" | "quarter" | "year";

    // Determine date range and grouping based on period
    if (period === "annually") {
      // Last 5 years
      startDate = new Date(now.getFullYear() - 4, 0, 1);
      groupBy = "year";
    } else if (period === "quarterly") {
      // Last 4 quarters (1 year)
      startDate = new Date(now.getFullYear() - 1, now.getMonth(), 1);
      groupBy = "quarter";
    } else {
      // Last 12 months (default)
      startDate = new Date(now.getFullYear(), now.getMonth() - 11, 1);
      groupBy = "month";
    }

    // Fetch all clicks in the date range
    const clicks = await prisma.click.findMany({
      where: {
        timestamp: {
          gte: startDate,
        },
      },
      select: {
        timestamp: true,
      },
      orderBy: {
        timestamp: "asc",
      },
    });

    // Group clicks by period
    const groupedData: Record<string, number> = {};

    clicks.forEach((click) => {
      const date = new Date(click.timestamp);
      let key: string;

      if (groupBy === "year") {
        key = date.getFullYear().toString();
      } else if (groupBy === "quarter") {
        const quarter = Math.floor(date.getMonth() / 3) + 1;
        key = `${date.getFullYear()}-Q${quarter}`;
      } else {
        // month
        const monthNames = [
          "Jan",
          "Feb",
          "Mar",
          "Apr",
          "May",
          "Jun",
          "Jul",
          "Aug",
          "Sep",
          "Oct",
          "Nov",
          "Dec",
        ];
        key = `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
      }

      groupedData[key] = (groupedData[key] || 0) + 1;
    });

    // Generate labels and data arrays
    const labels: string[] = [];
    const data: number[] = [];

    if (groupBy === "year") {
      for (let year = startDate.getFullYear(); year <= now.getFullYear(); year++) {
        labels.push(year.toString());
        data.push(groupedData[year.toString()] || 0);
      }
    } else if (groupBy === "quarter") {
      // Generate last 4 quarters
      for (let i = 3; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i * 3, 1);
        const quarter = Math.floor(date.getMonth() / 3) + 1;
        const year = date.getFullYear();
        const key = `${year}-Q${quarter}`;
        labels.push(key);
        data.push(groupedData[key] || 0);
      }
    } else {
      // month
      const monthNames = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];
      for (let i = 0; i < 12; i++) {
        const date = new Date(now.getFullYear(), now.getMonth() - (11 - i), 1);
        const key = `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
        labels.push(key);
        data.push(groupedData[key] || 0);
      }
    }

    return NextResponse.json({
      labels,
      data,
      period,
    });
  } catch (error: any) {
    console.error("Error fetching click statistics:", error);
    return NextResponse.json(
      { error: "Failed to fetch statistics", details: error.message },
      { status: 500 }
    );
  }
}

