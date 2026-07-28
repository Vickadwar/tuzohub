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
    defaultPointValue: "0.1",
  };

  const issued = parseFloat(metrics.totalPointsIssued) || 0;
  const redeemed = parseFloat(metrics.totalPointsRedeemed) || 0;
  const circulation = parseFloat(economy.totalCirculation) || 0;

  const options: ApexOptions = {
    chart: {
      type: "donut",
      fontFamily: "inherit",
    },
    colors: ["#217a99", "#ef4444", "#94a3b8"],
    labels: ["Active Circulation", "Redeemed Points", "Unissued Pool"],
    legend: {
      show: true,
      position: "bottom",
      fontSize: "11px",
      fontWeight: 600,
    },
    plotOptions: {
      pie: {
        donut: {
          size: "72%",
          labels: {
            show: true,
            name: {
              show: true,
              fontSize: "11px",
              fontWeight: 600,
              color: "#94a3b8",
            },
            value: {
              show: true,
              fontSize: "18px",
              fontWeight: 800,
              fontFamily: "monospace",
              formatter: (val) => `${Number(val).toLocaleString()}`,
            },
            total: {
              show: true,
              showAlways: true,
              label: "Estimated Pool",
              fontSize: "10px",
              fontWeight: 700,
              color: "#94a3b8",
              formatter: function () {
                return (issued * 1.5).toLocaleString();
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
      <div className="rounded-2xl border border-gray-200/80 bg-white p-6 dark:border-white/[0.06] dark:bg-white/[0.02] w-full h-full animate-pulse flex flex-col justify-center items-center">
        <div className="h-4 w-32 bg-gray-100 dark:bg-white/5 rounded mb-4"></div>
        <div className="h-40 w-40 rounded-full border-8 border-gray-100 dark:border-white/5"></div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-gray-200/80 bg-white p-5 dark:border-white/[0.06] dark:bg-white/[0.02] w-full h-full flex flex-col justify-between shadow-sm">
      <div className="flex items-center justify-between border-b border-gray-100 dark:border-white/5 pb-3">
        <div className="flex items-center gap-2">
          <span className="p-1 bg-brand-500/10 text-brand-600 rounded text-xs">🪙</span>
          <h3 className="text-xs font-semibold text-gray-700 dark:text-gray-300">
            Point Economy Distribution
          </h3>
        </div>
        <span className="text-[10px] font-mono text-gray-400">Live Ledger</span>
      </div>
      
      <div className="my-2 flex-1 flex items-center justify-center">
        <ReactApexChart options={options} series={series} type="donut" height={240} />
      </div>

      <div className="pt-3 border-t border-gray-100 dark:border-white/5 grid grid-cols-3 gap-2 text-center">
        <div className="p-2 rounded-xl bg-gray-50/50 dark:bg-white/[0.01] border border-gray-100 dark:border-white/5">
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">Circulation</p>
          <p className="text-sm font-bold font-mono text-brand-500 mt-0.5">{circulation.toLocaleString()}</p>
        </div>
        <div className="p-2 rounded-xl bg-gray-50/50 dark:bg-white/[0.01] border border-gray-100 dark:border-white/5">
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">Avg / Holder</p>
          <p className="text-sm font-bold font-mono text-gray-900 dark:text-white mt-0.5">{parseFloat(economy.averageBalance).toFixed(0)}</p>
        </div>
        <div className="p-2 rounded-xl bg-gray-50/50 dark:bg-white/[0.01] border border-gray-100 dark:border-white/5">
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">Issued Value</p>
          <p className="text-sm font-bold font-mono text-emerald-500 mt-0.5">
            KES {(issued * parseFloat(metrics.defaultPointValue || "0.1")).toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </p>
        </div>
      </div>
    </div>
  );
}
