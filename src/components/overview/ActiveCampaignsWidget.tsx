"use client";
import React from "react";
import Badge from "../ui/badge/Badge";
import { useApi } from "@/hooks/useApi";
import Link from "next/link";

export default function ActiveCampaignsWidget() {
  const { data: stats, isLoading } = useApi("/loyalty/stats/overview");

  const campaigns = stats?.activeCampaigns || [];

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-[#0A0A0A] w-full h-full flex flex-col">
        <div className="h-5 w-40 bg-gray-100 dark:bg-white/5 rounded animate-pulse mb-8"></div>
        <div className="space-y-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-3 animate-pulse">
              <div className="flex justify-between items-center">
                <div className="h-4 w-32 bg-gray-50 dark:bg-white/5 rounded"></div>
                <div className="h-3 w-12 bg-gray-50 dark:bg-white/5 rounded"></div>
              </div>
              <div className="h-1.5 w-full bg-gray-50 dark:bg-white/5 rounded-full"></div>
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
          Active Campaigns
        </h3>
        <Link href="/campaigns" className="text-xs font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300 transition-colors">
          View All &rarr;
        </Link>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar -mx-2 px-2">
        <div className="flex flex-col">
          {campaigns.length > 0 ? (
            campaigns.map((c: any) => {
              const issued = parseFloat(c.issued);
              const budget = 100000;
              const percent = Math.min(100, Math.round((issued / budget) * 100));
              const daysLeft = c.endDate
                ? Math.max(0, Math.ceil((new Date(c.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))
                : 0;

              return (
                <div
                  key={c.id}
                  className="group py-3.5 border-b border-gray-100 dark:border-white/5 last:border-0 hover:bg-gray-50 dark:hover:bg-white/[0.02] rounded-xl px-3 transition-colors"
                >

                  {/* Info Header */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 min-w-0">
                      {/* Subdued Status Dot */}
                      <span className={`size-1.5 rounded-full ${c.status ? 'bg-emerald-500' : 'bg-gray-400'}`}></span>
                      <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                        {c.name}
                      </h4>
                    </div>
                    <span className="text-xs font-medium text-gray-500 shrink-0">
                      {daysLeft}d left
                    </span>
                  </div>

                  {/* Ultra-thin Minimal Progress Bar */}
                  <div className="w-full h-1.5 rounded-full bg-gray-100 dark:bg-white/10 overflow-hidden mb-2.5">
                    <div
                      className="h-full rounded-full bg-gray-900 dark:bg-white transition-all duration-1000"
                      style={{ width: `${percent}%` }}
                    ></div>
                  </div>

                  {/* Clean Footer Row */}
                  <div className="flex items-center justify-between">
                    <div className="flex -space-x-1.5">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="size-5 rounded-full ring-2 ring-white dark:ring-[#0A0A0A] bg-gray-100 dark:bg-white/10 flex items-center justify-center text-[8px] text-gray-600 dark:text-gray-300 font-medium">
                          {String.fromCharCode(64 + i)}
                        </div>
                      ))}
                    </div>
                    <div className="text-[11px] text-gray-500 font-medium tabular-nums">
                      <span className="text-gray-900 dark:text-gray-200">{issued.toLocaleString()}</span> / {budget.toLocaleString()}
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="py-8 text-center">
              <p className="text-sm text-gray-500">No active campaigns.</p>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-4 pt-4 border-t border-gray-100 dark:border-white/5 flex items-center justify-between">
        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Total Engagement</span>
        <span className="text-sm font-semibold text-brand-600 dark:text-brand-400">
          High Volume
        </span>
      </div>
    </div>
  );
}