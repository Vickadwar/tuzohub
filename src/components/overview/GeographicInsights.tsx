"use client";
import React from "react";
import { useApi } from "@/hooks/useApi";

export default function GeographicInsights() {
  const { data: stats, isLoading } = useApi("/loyalty/stats/overview");

  const regions = stats?.geographicReach || [];

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03] w-full h-full animate-pulse">
        <div className="h-6 w-32 bg-gray-100 dark:bg-white/5 rounded mb-4"></div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-10 w-full bg-gray-50 dark:bg-white/5 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6 w-full h-full">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90 mb-6">
        Geographic Reach
      </h3>

      <div className="space-y-6">
        {regions.length > 0 ? (
          regions.map((r: any, idx: number) => {
            const colors = ["bg-brand-500", "bg-orange-500", "bg-blue-light-500", "bg-success-500", "bg-purple-500"];
            const color = colors[idx % colors.length];
            return (
              <div key={r.regionName} className="relative">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {r.regionName}
                  </span>
                  <span className="text-sm font-bold text-gray-800 dark:text-white">
                    {parseInt(r.consumerCount).toLocaleString()} consumers
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-gray-100 dark:bg-gray-800">
                  <div 
                    className={`h-full rounded-full ${color}`} 
                    style={{ width: `${Math.min(100, (parseInt(r.consumerCount) / 100) * 100)}%` }} // Placeholder scaling
                  ></div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="py-8 text-center text-gray-500 dark:text-gray-400 border border-dashed border-gray-200 dark:border-gray-800 rounded-xl">
             No regional data yet.
          </div>
        )}
      </div>

      <div className="mt-8 p-4 bg-gray-50 dark:bg-white/5 rounded-xl">
        <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
          Geographic reach is calculated based on registered consumer town associations within your defined regions.
        </p>
      </div>
    </div>
  );
}
