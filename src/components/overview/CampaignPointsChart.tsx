"use client";
import { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";
import { MoreDotIcon } from "@/icons";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { useState, useMemo } from "react";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { useApi } from "@/hooks/useApi";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

interface CampaignPointsChartProps {
  stats?: any;
  isLoading?: boolean;
}

export default function CampaignPointsChart({ stats: propStats, isLoading: propIsLoading }: CampaignPointsChartProps = {}) {
  const { data: apiStats, isLoading: apiIsLoading } = useApi(propStats ? null : "/loyalty/stats/overview");
  const stats = propStats || apiStats;
  const isLoading = propIsLoading !== undefined ? propIsLoading : apiIsLoading;
  const [isOpen, setIsOpen] = useState(false);

  const { categories, series } = useMemo(() => {
    const rawData = stats?.chartData || [];
    const monthsSet = new Set<string>();
    const creditMap: Record<string, number> = {};
    const debitMap: Record<string, number> = {};

    rawData.forEach((row: any) => {
      monthsSet.add(row.month);
      if (row.type === "CREDIT") creditMap[row.month] = parseFloat(row.total);
      if (row.type === "DEBIT") debitMap[row.month] = parseFloat(row.total);
    });

    const categoriesList = Array.from(monthsSet);
    
    return {
      categories: categoriesList.length > 0 ? categoriesList : ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
      series: [
        {
          name: "Points Issued",
          data: categoriesList.map(m => creditMap[m] || 0),
        },
        {
          name: "Points Redeemed",
          data: categoriesList.map(m => debitMap[m] || 0),
        }
      ]
    };
  }, [stats]);

  const options: ApexOptions = {
    colors: ["#217a99", "#88c2d8"],
    chart: {
      fontFamily: "inherit",
      type: "bar",
      height: 280,
      toolbar: {
        show: false,
      },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "48%",
        borderRadius: 6,
        borderRadiusApplication: "end",
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      show: true,
      width: 3,
      colors: ["transparent"],
    },
    xaxis: {
      categories,
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
    },
    legend: {
      show: true,
      position: "top",
      horizontalAlign: "left",
      fontSize: "11px",
      fontWeight: 600,
    },
    yaxis: {
      labels: {
        formatter: (val) => val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val.toString(),
      }
    },
    grid: {
      borderColor: "rgba(148, 163, 184, 0.1)",
      strokeDashArray: 3,
    },
    fill: {
      opacity: 1,
    },
    tooltip: {
      y: {
        formatter: (val: number) => `${val.toLocaleString()} PTS`,
      },
    },
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200/80 bg-white p-5 dark:border-white/[0.06] dark:bg-white/[0.02] flex flex-col h-full shadow-sm">
      <div className="flex items-center justify-between border-b border-gray-100 dark:border-white/5 pb-3 mb-2">
        <div className="flex items-center gap-2">
          <span className="p-1 bg-brand-500/10 text-brand-600 rounded text-xs">📊</span>
          <h3 className="text-xs font-semibold text-gray-700 dark:text-gray-300">
            Monthly Points Emission &amp; Redemption Velocity
          </h3>
        </div>

        <div className="relative inline-block">
          <button onClick={() => setIsOpen(!isOpen)} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 transition">
            <MoreDotIcon className="w-4 h-4 text-gray-400" />
          </button>
          <Dropdown isOpen={isOpen} onClose={() => setIsOpen(false)} className="w-36 p-1">
            <DropdownItem onItemClick={() => setIsOpen(false)} className="text-xs">
              Sync Telemetry
            </DropdownItem>
          </Dropdown>
        </div>
      </div>

      <div className="max-w-full overflow-x-auto custom-scrollbar flex-1">
        <div className="-ml-3 min-w-[500px] xl:min-w-full">
          {isLoading ? (
            <div className="h-64 w-full bg-gray-50 dark:bg-white/5 rounded-xl animate-pulse flex items-center justify-center text-xs text-gray-400">
              Loading Points Velocity...
            </div>
          ) : (
            <ReactApexChart
              options={options}
              series={series}
              type="bar"
              height={260}
            />
          )}
        </div>
      </div>
    </div>
  );
}
