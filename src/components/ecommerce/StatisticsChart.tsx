"use client";
import React, { useState, useEffect } from "react";
// import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import ChartTab from "../common/ChartTab";
import dynamic from "next/dynamic";

// Dynamically import the ReactApexChart component
const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

export default function StatisticsChart() {
  const [period, setPeriod] = useState<"monthly" | "quarterly" | "annually">("monthly");
  const [labels, setLabels] = useState<string[]>([]);
  const [clickData, setClickData] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/statistics/clicks?period=${period}`);
        if (response.ok) {
          const data = await response.json();
          setLabels(data.labels || []);
          setClickData(data.data || []);
        }
      } catch (error) {
        console.error("Error fetching click statistics:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [period]);
  const options: ApexOptions = {
    legend: {
      show: false, // Hide legend
      position: "top",
      horizontalAlign: "left",
    },
    colors: ["#465FFF"], // Define line color
    chart: {
      fontFamily: "Outfit, sans-serif",
      height: 310,
      type: "line", // Set the chart type to 'line'
      toolbar: {
        show: false, // Hide chart toolbar
      },
    },
    stroke: {
      curve: "smooth", // Define the line style (straight, smooth, or step)
      width: 2, // Line width
    },

    fill: {
      type: "gradient",
      gradient: {
        opacityFrom: 0.55,
        opacityTo: 0,
      },
    },
    markers: {
      size: 0, // Size of the marker points
      strokeColors: "#fff", // Marker border color
      strokeWidth: 2,
      hover: {
        size: 6, // Marker size on hover
      },
    },
    grid: {
      xaxis: {
        lines: {
          show: false, // Hide grid lines on x-axis
        },
      },
      yaxis: {
        lines: {
          show: true, // Show grid lines on y-axis
        },
      },
    },
    dataLabels: {
      enabled: false, // Disable data labels
    },
    tooltip: {
      enabled: true, // Enable tooltip
      y: {
        formatter: (value: number) => `${value} tıklama`,
      },
    },
    xaxis: {
      type: "category", // Category-based x-axis
      categories: labels.length > 0 ? labels : [],
      axisBorder: {
        show: false, // Hide x-axis border
      },
      axisTicks: {
        show: false, // Hide x-axis ticks
      },
      tooltip: {
        enabled: false, // Disable tooltip for x-axis points
      },
    },
    yaxis: {
      labels: {
        style: {
          fontSize: "12px", // Adjust font size for y-axis labels
          colors: ["#6B7280"], // Color of the labels
        },
      },
      title: {
        text: "", // Remove y-axis title
        style: {
          fontSize: "0px",
        },
      },
    },
  };

  const series = [
    {
      name: "Tıklamalar",
      data: clickData.length > 0 ? clickData : [],
    },
  ];

  const handlePeriodChange = (newPeriod: "optionOne" | "optionTwo" | "optionThree") => {
    if (newPeriod === "optionOne") {
      setPeriod("monthly");
    } else if (newPeriod === "optionTwo") {
      setPeriod("quarterly");
    } else {
      setPeriod("annually");
    }
  };
  return (
    <div className="rounded-2xl border border-gray-200 bg-white px-5 pb-5 pt-5 dark:border-gray-800 dark:bg-white/[0.03] sm:px-6 sm:pt-6">
      <div className="flex flex-col gap-5 mb-6 sm:flex-row sm:justify-between">
        <div className="w-full">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Tıklama Trendi
          </h3>
          <p className="mt-1 text-gray-500 text-theme-sm dark:text-gray-400">
            Zaman içindeki tıklama trendi
          </p>
        </div>
        <div className="flex items-start w-full gap-3 sm:justify-end">
          <ChartTab onPeriodChange={handlePeriodChange} />
        </div>
      </div>

      <div className="max-w-full overflow-x-auto custom-scrollbar">
        <div className="min-w-[1000px] xl:min-w-full">
          {loading ? (
            <div className="flex items-center justify-center h-[310px]">
              <div className="text-gray-500 dark:text-gray-400">Yükleniyor...</div>
            </div>
          ) : (
            <ReactApexChart
              options={options}
              series={series}
              type="area"
              height={310}
            />
          )}
        </div>
      </div>
    </div>
  );
}
