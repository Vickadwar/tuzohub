"use client";

import React from "react";
import Badge from "../ui/badge/Badge";
import { ArrowUpIcon, GroupIcon, BoxIconLine } from "@/icons";
import { useApi } from "@/hooks/useApi";

interface OverviewMetricsProps {
  stats?: any;
  isLoading?: boolean;
}

export default function OverviewMetrics({ stats: propStats, isLoading: propIsLoading }: OverviewMetricsProps = {}) {
  const { data: apiStats, isLoading: apiIsLoading, isError } = useApi(propStats ? null : "/loyalty/stats/overview");

  const stats = propStats || apiStats;
  const isLoading = propIsLoading !== undefined ? propIsLoading : apiIsLoading;

  const formatNumber = (num: number | string) => {
    const value = typeof num === "string" ? parseFloat(num) : num;
    if (isNaN(value)) return "0";
    if (value >= 1000000) return (value / 1000000).toFixed(1) + "M";
    if (value >= 1000) return (value / 1000).toFixed(1) + "k";
    return value.toLocaleString();
  };

  const metrics = stats?.metrics || {
    registeredConsumers: 0,
    totalPointsIssued: "0",
    activeCampaigns: 0,
    pendingRedemptions: 0,
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 animate-pulse">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-28 rounded-2xl bg-gray-100 dark:bg-white/5"></div>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="col-span-12 p-4 rounded-2xl border border-rose-500/20 bg-rose-500/10 text-rose-600">
        <p className="text-xs font-semibold">Failed to load overview metrics. Please check connection.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {/* Metric 1: Consumers */}
      <div className="rounded-2xl border border-gray-200/80 bg-white p-5 shadow-sm dark:border-white/[0.06] dark:bg-white/[0.02] flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
            Registered Consumers
          </span>
          <div className="flex items-center justify-center w-8 h-8 bg-brand-500/10 text-brand-600 rounded-xl dark:bg-brand-500/20 dark:text-brand-400">
            <GroupIcon className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline justify-between mt-4">
          <h4 className="text-2xl font-bold font-mono tracking-tight text-gray-900 dark:text-white">
            {formatNumber(metrics.registeredConsumers)}
          </h4>
          <Badge color="success" size="sm">
            <ArrowUpIcon className="w-3 h-3" />
            Live
          </Badge>
        </div>
      </div>

      {/* Metric 2: Points Issued */}
      <div className="rounded-2xl border border-gray-200/80 bg-white p-5 shadow-sm dark:border-white/[0.06] dark:bg-white/[0.02] flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
            Total Points Issued
          </span>
          <div className="flex items-center justify-center w-8 h-8 bg-blue-500/10 text-blue-600 rounded-xl dark:bg-blue-500/20 dark:text-blue-400">
            <BoxIconLine className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline justify-between mt-4">
          <h4 className="text-2xl font-bold font-mono tracking-tight text-gray-900 dark:text-white">
            {formatNumber(metrics.totalPointsIssued)}
          </h4>
          <Badge color="success" size="sm">
            <ArrowUpIcon className="w-3 h-3" />
            Points
          </Badge>
        </div>
      </div>

      {/* Metric 3: Active Campaigns */}
      <div className="rounded-2xl border border-gray-200/80 bg-white p-5 shadow-sm dark:border-white/[0.06] dark:bg-white/[0.02] flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
            Active Campaigns
          </span>
          <div className="flex items-center justify-center w-8 h-8 bg-amber-500/10 text-amber-600 rounded-xl dark:bg-amber-500/20 dark:text-amber-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" /></svg>
          </div>
        </div>
        <div className="flex items-baseline justify-between mt-4">
          <h4 className="text-2xl font-bold font-mono tracking-tight text-gray-900 dark:text-white">
            {metrics.activeCampaigns}
          </h4>
          <Badge color="primary" size="sm">
            Active
          </Badge>
        </div>
      </div>

      {/* Metric 4: Pending Redemptions */}
      <div className="rounded-2xl border border-gray-200/80 bg-white p-5 shadow-sm dark:border-white/[0.06] dark:bg-white/[0.02] flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
            Pending Redemptions
          </span>
          <div className="flex items-center justify-center w-8 h-8 bg-rose-500/10 text-rose-600 rounded-xl dark:bg-rose-500/20 dark:text-rose-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
        </div>
        <div className="flex items-baseline justify-between mt-4">
          <h4 className="text-2xl font-bold font-mono tracking-tight text-gray-900 dark:text-white">
            {metrics.pendingRedemptions}
          </h4>
          {metrics.pendingRedemptions > 0 ? (
            <Badge color="warning" size="sm">
              Action Needed
            </Badge>
          ) : (
            <Badge color="success" size="sm">
              Cleared
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
}
