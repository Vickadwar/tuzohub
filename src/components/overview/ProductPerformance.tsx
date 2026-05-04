"use client";
import React from "react";
import { useApi } from "@/hooks/useApi";

export default function ProductPerformance() {
  const { data: stats, isLoading } = useApi("/loyalty/stats/overview");

  const products = stats?.topProducts || [];

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-[#0A0A0A] w-full h-full flex flex-col">
        <div className="h-5 w-40 bg-gray-100 dark:bg-white/5 rounded animate-pulse mb-8"></div>
        <div className="space-y-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex justify-between items-center animate-pulse">
              <div className="h-4 w-32 bg-gray-50 dark:bg-white/5 rounded"></div>
              <div className="h-4 w-16 bg-gray-50 dark:bg-white/5 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-[#0A0A0A] w-full h-full flex flex-col">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-base font-semibold text-gray-900 dark:text-white">
          Product Leaderboard
        </h3>
        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
          Last 30 Days
        </span>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar -mx-2 px-2">
        <div className="flex flex-col">
          {products.length > 0 ? (
            products.map((p: any, idx: number) => (
              <div
                key={p.id}
                className="group flex items-center gap-4 py-3.5 border-b border-gray-100 dark:border-white/5 last:border-0 hover:bg-gray-50 dark:hover:bg-white/[0.02] rounded-xl px-3 transition-colors cursor-default"
              >
                {/* Sleek Typographic Rank */}
                <span className="text-xs font-medium text-gray-400 dark:text-gray-500 w-4 text-center group-hover:text-brand-500 transition-colors">
                  {String(idx + 1).padStart(2, '0')}
                </span>

                {/* Product Info */}
                <div className="flex-1 min-w-0 flex flex-col justify-center">
                  <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                    {p.name}
                  </p>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5 flex items-center gap-1.5">
                    {parseInt(p.totalVolume).toLocaleString()} Units
                    <span className="size-1 rounded-full bg-gray-300 dark:bg-gray-700"></span>
                    <span className="text-brand-600 dark:text-brand-400 font-medium">Hot SKU</span>
                  </p>
                </div>

                {/* Revenue Metrics */}
                <div className="text-right flex flex-col justify-center">
                  <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 tabular-nums">
                    ${parseFloat(p.totalRevenue) > 0 ? parseFloat(p.totalRevenue).toLocaleString() : "0.00"}
                  </p>
                  {parseFloat(p.totalRevenue) > 0 ? (
                    <p className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 mt-0.5">
                      +12.4%
                    </p>
                  ) : (
                    <p className="text-[11px] font-medium text-gray-400 mt-0.5">
                      Pending
                    </p>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="py-8 text-center">
              <p className="text-sm text-gray-500">No product data available.</p>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-4 pt-4 border-t border-gray-100 dark:border-white/5 flex items-center justify-between">
        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Total Volume</span>
        <span className="text-sm font-semibold text-gray-900 dark:text-white tabular-nums">
          {products.reduce((acc: number, p: any) => acc + parseInt(p.totalVolume), 0).toLocaleString()} MT
        </span>
      </div>
    </div>
  );
}