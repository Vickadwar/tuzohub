"use client";
import { ApexOptions } from "apexcharts";
import dynamic from "next/dynamic";
import { MoreDotIcon } from "@/icons";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { useState, useMemo } from "react";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { useApi } from "@/hooks/useApi";

// Dynamically import the ReactApexChart component
const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

export default function CampaignPointsChart() {
  const { data: stats, isLoading } = useApi("/loyalty/stats/overview");
  const [isOpen, setIsOpen] = useState(false);

  // Process chart data from API
  const { categories, series } = useMemo(() => {
    const rawData = stats?.chartData || [];
    
    // Group by month
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
      fontFamily: "Satoshi, sans-serif",
      type: "bar",
      height: 280,
      toolbar: {
        show: false,
      },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "50%",
        borderRadius: 5,
        borderRadiusApplication: "end",
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      show: true,
      width: 4,
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
      fontFamily: "Satoshi",
    },
    yaxis: {
      title: {
        text: undefined,
      },
      labels: {
        formatter: (val) => val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val.toString(),
      }
    },
    grid: {
      yaxis: {
        lines: {
          show: true,
        },
      },
    },
    fill: {
      opacity: 1,
    },
    tooltip: {
      x: {
        show: true,
      },
      y: {
        formatter: (val: number) => `${val.toLocaleString()} pts`,
      },
    },
  };

  function toggleDropdown() {
    setIsOpen(!isOpen);
  }

  function closeDropdown() {
    setIsOpen(false);
  }

  if (isLoading) {
    return (
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="h-6 w-32 bg-gray-100 dark:bg-white/5 rounded animate-pulse mb-6"></div>
        <div className="h-64 w-full bg-gray-50 dark:bg-white/5 rounded animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6 flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Points Dynamics
        </h3>

        <div className="relative inline-block">
          <button onClick={toggleDropdown} className="dropdown-toggle">
            <MoreDotIcon className="text-gray-400 hover:text-gray-700 dark:hover:text-gray-300" />
          </button>
          <Dropdown
            isOpen={isOpen}
            onClose={closeDropdown}
            className="w-40 p-2"
          >
            <DropdownItem
              onItemClick={closeDropdown}
              className="flex w-full font-normal text-left text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
            >
              Sync Data
            </DropdownItem>
          </Dropdown>
        </div>
      </div>

      <div className="max-w-full overflow-x-auto custom-scrollbar">
        <div className="-ml-5 min-w-[650px] xl:min-w-full pl-2">
          <ReactApexChart
            options={options}
            series={series}
            type="bar"
            height={280}
          />
        </div>
      </div>
    </div>
  );
}
