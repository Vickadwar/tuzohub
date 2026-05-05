"use client";
import React from "react";
import Badge from "../ui/badge/Badge";
import { ArrowDownIcon, ArrowUpIcon, GroupIcon, BoxIconLine } from "@/icons";
import { useApi } from "@/hooks/useApi";

export default function OverviewMetrics() {
  const { data: stats, isLoading, isError } = useApi("/loyalty/stats/overview");

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
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-2 md:gap-6 animate-pulse">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-32 rounded-2xl bg-gray-100 dark:bg-white/5"></div>
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div className="col-span-12 p-6 rounded-2xl border border-error-100 bg-error-50 text-error-700">
        <p className="text-sm font-medium">Failed to load overview metrics. Please check your connection or try again later.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-2 md:gap-6">
      {/* Metric 1: Consumers */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-brand-50 text-brand-500 rounded-xl dark:bg-brand-500/10 dark:text-brand-400">
          <GroupIcon className="size-6" />
        </div>
        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Registered Consumers
            </span>
            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
              {formatNumber(metrics.registeredConsumers)}
            </h4>
          </div>
          <Badge color="success">
            <ArrowUpIcon />
            Live
          </Badge>
        </div>
      </div>

      {/* Metric 2: Points Issued */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-blue-light-50 text-blue-light-600 rounded-xl dark:bg-blue-light-500/10 dark:text-blue-light-400">
          <BoxIconLine className="size-6" />
        </div>
        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Total Points Issued
            </span>
            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
              {formatNumber(metrics.totalPointsIssued)}
            </h4>
          </div>
          <Badge color="success">
            <ArrowUpIcon />
            Points
          </Badge>
        </div>
      </div>

      {/* Metric 3: Active Campaigns */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-orange-50 text-orange-500 rounded-xl dark:bg-orange-500/10 dark:text-orange-400">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" /></svg>
        </div>
        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Active Campaigns
            </span>
            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
              {metrics.activeCampaigns}
            </h4>
          </div>
          <Badge color="primary">
            Active
          </Badge>
        </div>
      </div>

      {/* Metric 4: Pending Redemptions */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
        <div className="flex items-center justify-center w-12 h-12 bg-error-50 text-error-500 rounded-xl dark:bg-error-500/10 dark:text-error-400">
           <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        </div>
        <div className="flex items-end justify-between mt-5">
          <div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Pending Redemptions
            </span>
            <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
              {metrics.pendingRedemptions}
            </h4>
          </div>
          {metrics.pendingRedemptions > 0 ? (
            <Badge color="warning">
              Action Needed
            </Badge>
          ) : (
            <Badge color="success">
              Cleared
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
}
