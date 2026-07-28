"use client";
import React from "react";
import { useApi } from "@/hooks/useApi";
import Link from "next/link";

export default function ActiveCampaignsWidget() {
  const { data: stats, isLoading } = useApi("/loyalty/stats/overview");

  const campaigns = stats?.activeCampaigns || [];

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-gray-200/80 bg-white p-5 dark:border-white/[0.06] dark:bg-white/[0.02] w-full h-full flex flex-col animate-pulse">
        <div className="h-4 w-40 bg-gray-100 dark:bg-white/5 rounded mb-4"></div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-12 w-full bg-gray-50 dark:bg-white/5 rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-gray-200/80 bg-white p-5 dark:border-white/[0.06] dark:bg-white/[0.02] w-full h-full flex flex-col justify-between shadow-sm">
      <div>
        <div className="flex items-center justify-between border-b border-gray-100 dark:border-white/5 pb-3 mb-3">
          <div className="flex items-center gap-2">
            <span className="p-1 bg-amber-500/10 text-amber-600 rounded text-xs">🚀</span>
            <h3 className="text-xs font-semibold text-gray-700 dark:text-gray-300">
              Active Campaigns Engine
            </h3>
          </div>
          <Link href="/campaigns" className="text-xs font-bold text-brand-600 hover:text-brand-700 dark:text-brand-400 transition-colors">
            View All &rarr;
          </Link>
        </div>

        <div className="space-y-3">
          {campaigns.length > 0 ? (
            campaigns.map((c: any) => {
              const issued = parseFloat(c.issued) || 0;
              const budget = 100000;
              const percent = Math.min(100, Math.round((issued / budget) * 100));
              const daysLeft = c.endDate
                ? Math.max(0, Math.ceil((new Date(c.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))
                : 0;

              return (
                <div
                  key={c.id}
                  className="group p-3 rounded-xl border border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/[0.01] hover:border-brand-500/30 transition-colors"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      <h4 className="text-xs font-bold text-gray-900 dark:text-white truncate group-hover:text-brand-500 transition-colors">
                        {c.name}
                      </h4>
                    </div>
                    <span className="text-[10px] font-mono text-gray-400">
                      {daysLeft}d left
                    </span>
                  </div>

                  <div className="w-full h-1.5 rounded-full bg-gray-200/80 dark:bg-white/10 overflow-hidden mb-2">
                    <div
                      className="h-full rounded-full bg-brand-500 transition-all duration-1000"
                      style={{ width: `${percent}%` }}
                    ></div>
                  </div>

                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-gray-400">Points Emission</span>
                    <span className="font-mono font-bold text-gray-900 dark:text-white">
                      {issued.toLocaleString()} / {budget.toLocaleString()} PTS
                    </span>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="py-8 text-center text-xs font-bold text-gray-400">
              No active campaigns running right now.
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-gray-100 dark:border-white/5 flex items-center justify-between text-[11px]">
        <span className="text-gray-400 font-medium">Orchestration Health</span>
        <span className="font-bold text-emerald-500 flex items-center gap-1">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
          Optimal Engine Output
        </span>
      </div>
    </div>
  );
}