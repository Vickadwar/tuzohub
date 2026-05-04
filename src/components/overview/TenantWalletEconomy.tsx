"use client";
import React from "react";
import dynamic from "next/dynamic";
import { ApexOptions } from "apexcharts";
import { useApi } from "@/hooks/useApi";

const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});

export default function TenantWalletEconomy() {
  const { data: stats, isLoading } = useApi("/loyalty/stats/overview");

  const economy = stats?.walletEconomy || {
    totalCirculation: "0",
    averageBalance: "0",
  };

  const metrics = stats?.metrics || {
    totalPointsIssued: "0",
    totalPointsRedeemed: "0",
  };

  const issued = parseFloat(metrics.totalPointsIssued);
  const redeemed = parseFloat(metrics.totalPointsRedeemed);
  const circulation = parseFloat(economy.totalCirculation);

  const options: ApexOptions = {
    chart: {
      type: "donut",
      fontFamily: "Satoshi, sans-serif",
    },
    colors: ["#217a99", "#ef4444", "#e5e7eb"],
    labels: ["Active Circulation", "Redeemed points", "Unissued Pool"],
    legend: {
      show: true,
      position: "bottom",
    },
    plotOptions: {
      pie: {
        donut: {
          size: "70%",
          labels: {
            show: true,
            name: {
              show: true,
              fontSize: "14px",
            },
            value: {
              show: true,
              fontSize: "20px",
              fontWeight: 700,
              formatter: (val) => `${Number(val).toLocaleString()}`,
            },
            total: {
              show: true,
              showAlways: true,
              label: "Total Supply (Estimated)",
              fontSize: "12px",
              fontWeight: 500,
              formatter: function () {
                return (issued * 1.5).toLocaleString(); // Estimated based on issuance
              },
            },
          },
        },
      },
    },
    dataLabels: {
      enabled: false,
    },
    stroke: {
      show: false,
    },
  };

  const series = [circulation, redeemed, Math.max(0, issued * 0.5)];

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03] w-full h-full animate-pulse">
        <div className="h-6 w-32 bg-gray-100 dark:bg-white/5 rounded mb-4"></div>
        <div className="flex-1 flex items-center justify-center">
            <div className="h-48 w-48 rounded-full border-8 border-gray-100 dark:border-white/5"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6 w-full h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          Point Economy
        </h3>
      </div>
      
      <div className="flex-1 flex items-center justify-center">
        <ReactApexChart options={options} series={series} type="donut" height={280} />
      </div>

      <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 flex justify-between gap-4">
        <div className="text-center flex-1">
            <p className="text-[10px] text-gray-500 uppercase font-semibold">Circulation</p>
            <p className="text-lg font-bold text-brand-500">{circulation.toLocaleString()}</p>
        </div>
        <div className="text-center flex-1 border-x border-gray-100 dark:border-gray-800">
            <p className="text-[10px] text-gray-500 uppercase font-semibold">Avg/Holder</p>
            <p className="text-lg font-bold text-gray-800 dark:text-white/90">{parseFloat(economy.averageBalance).toFixed(0)}</p>
        </div>
        <div className="text-center flex-1">
            <p className="text-[10px] text-gray-500 uppercase font-semibold">Value Issued</p>
            <p className="text-lg font-bold text-success-600">
              KES {(issued * parseFloat(metrics.defaultPointValue)).toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </p>
        </div>
      </div>
    </div>
  );
}
