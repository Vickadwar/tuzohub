"use client";
import React from "react";
import { useApi } from "@/hooks/useApi";

export default function GeographicInsights() {
  const { data: stats, isLoading } = useApi("/loyalty/stats/overview");

  const regions = stats?.geographicReach || [];

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-gray-200/80 bg-white p-5 dark:border-white/[0.06] dark:bg-white/[0.02] w-full h-full animate-pulse">
        <div className="h-4 w-32 bg-gray-100 dark:bg-white/5 rounded mb-4"></div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-8 w-full bg-gray-50 dark:bg-white/5 rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-gray-200/80 bg-white p-5 dark:border-white/[0.06] dark:bg-white/[0.02] w-full h-full flex flex-col justify-between shadow-sm">
      <div>
        <div className="flex items-center justify-between border-b border-gray-100 dark:border-white/5 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <span className="p-1 bg-emerald-500/10 text-emerald-600 rounded text-xs">🗺️</span>
            <h3 className="text-xs font-semibold text-gray-700 dark:text-gray-300">
              Geographic Participant Reach
            </h3>
          </div>
          <span className="text-[10px] font-mono text-gray-400">Regional Distribution</span>
        </div>

        <div className="space-y-4">
          {regions.length > 0 ? (
            regions.map((r: any, idx: number) => {
              const colors = ["bg-brand-500", "bg-purple-500", "bg-blue-500", "bg-emerald-500", "bg-amber-500"];
              const color = colors[idx % colors.length];
              return (
                <div key={r.regionName} className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-800 dark:text-gray-200">
                      {r.regionName}
                    </span>
                    <span className="text-xs font-bold font-mono text-gray-900 dark:text-white">
                      {parseInt(r.consumerCount).toLocaleString()} Members
                    </span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-gray-100 dark:bg-white/10 overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${color}`} 
                      style={{ width: `${Math.min(100, (parseInt(r.consumerCount) / 100) * 100)}%` }}
                    ></div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="py-6 text-center text-xs font-bold text-gray-400">
              No regional distribution data available.
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 p-3 bg-gray-50/50 dark:bg-white/[0.01] border border-gray-100 dark:border-white/5 rounded-xl">
        <p className="text-[11px] text-gray-400 leading-relaxed">
          Geographic telemetry tracks active consumer registrations across designated regional hubs.
        </p>
      </div>
    </div>
  );
}
