"use client";
import React from "react";
import { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

interface EcosystemCirculationChartProps {
  data: { name: string; value: number }[];
  loading?: boolean;
}

export default function EcosystemCirculationChart({ data, loading }: EcosystemCirculationChartProps) {
  if (loading) {
    return (
      <div className="h-80 flex items-center justify-center bg-gray-50 dark:bg-gray-900/40 rounded-2xl animate-pulse">
        <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="h-80 flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900/40 rounded-2xl border border-dashed border-gray-200 dark:border-gray-800">
        <p className="text-sm text-gray-400 font-medium">No distribution data available</p>
      </div>
    );
  }

  const series = data.map(d => d.value);
  const labels = data.map(d => d.name);

  const options: ApexOptions = {
    chart: {
      type: "donut",
      fontFamily: "Satoshi, sans-serif",
    },
    colors: ["#217a99", "#88c2d8", "#eab308", "#22c55e", "#ef4444", "#a855f7"],
    labels: labels,
    legend: {
      position: "bottom",
      fontFamily: "Satoshi",
      fontWeight: 500,
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
        show: false
    },
    plotOptions: {
      pie: {
        donut: {
          size: "75%",
          labels: {
            show: true,
            name: {
                show: true,
                fontSize: "14px",
                fontWeight: 600,
                color: "#64748b"
            },
            value: {
                show: true,
                fontSize: "20px",
                fontWeight: 800,
                color: "#1e293b",
                formatter: (val) => Number(val).toLocaleString()
            },
            total: {
                show: true,
                label: "Total Points",
                fontSize: "12px",
                fontWeight: 600,
                color: "#94a3b8",
                formatter: (w) => {
                    return w.globals.seriesTotals.reduce((a: number, b: number) => a + b, 0).toLocaleString();
                }
            }
          }
        }
      }
    },
    tooltip: {
      y: {
        formatter: (val) => `${val.toLocaleString()} Points`
      }
    }
  };

  return (
    <div className="h-80 w-full flex items-center justify-center">
      <ReactApexChart
        options={options}
        series={series}
        type="donut"
        height={320}
        width="100%"
      />
    </div>
  );
}
