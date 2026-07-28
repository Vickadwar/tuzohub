"use client";
import React from "react";
import { useApi } from "@/hooks/useApi";

export default function ProductPerformance() {
  const { data: stats, isLoading } = useApi("/loyalty/stats/overview");

  const products = stats?.topProducts || [];

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-gray-200/80 bg-white p-5 dark:border-white/[0.06] dark:bg-white/[0.02] w-full h-full flex flex-col animate-pulse">
        <div className="h-4 w-40 bg-gray-100 dark:bg-white/5 rounded mb-4"></div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-10 w-full bg-gray-50 dark:bg-white/5 rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-gray-200/80 bg-white p-5 dark:border-white/[0.06] dark:bg-white/[0.02] w-full h-full flex flex-col shadow-sm">
      <div className="flex items-center justify-between border-b border-gray-100 dark:border-white/5 pb-3 mb-3">
        <div className="flex items-center gap-2">
          <span className="p-1 bg-purple-500/10 text-purple-600 rounded text-xs">📦</span>
          <h3 className="text-xs font-semibold text-gray-700 dark:text-gray-300">
            Top Product SKUs
          </h3>
        </div>
        <span className="text-[10px] font-mono text-gray-400">Last 30 Days</span>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="flex flex-col space-y-1">
          {products.length > 0 ? (
            products.map((p: any, idx: number) => (
              <div
                key={p.id}
                className="group flex items-center gap-3 p-2.5 rounded-xl border border-transparent hover:border-gray-200/80 dark:hover:border-white/10 hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition-colors"
              >
                <span className="text-xs font-mono font-bold text-gray-400 w-5 text-center">
                  0{idx + 1}
                </span>

                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-gray-900 dark:text-white truncate group-hover:text-brand-500 transition-colors">
                    {p.name}
                  </p>
                  <p className="text-[11px] text-gray-400 flex items-center gap-1.5 mt-0.5">
                    <span className="font-mono">{parseInt(p.totalVolume).toLocaleString()}</span> Units
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-xs font-mono font-bold text-gray-900 dark:text-white">
                    KES {parseFloat(p.totalRevenue) > 0 ? parseFloat(p.totalRevenue).toLocaleString() : "0.00"}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="py-8 text-center text-xs text-gray-400 font-medium">
              No product sales activity logged yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}