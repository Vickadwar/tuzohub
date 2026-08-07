"use client";

import React, { useState } from "react";
import Link from "next/link";
import OverviewMetrics from "@/components/overview/OverviewMetrics";
import VoucherPipelineWidget from "@/components/overview/VoucherPipelineWidget";
import SecurityAuditWidget from "@/components/overview/SecurityAuditWidget";
import CampaignPointsChart from "@/components/overview/CampaignPointsChart";
import PendingRedemptions from "@/components/overview/PendingRedemptions";
import ActiveCampaignsWidget from "@/components/overview/ActiveCampaignsWidget";
import TenantWalletEconomy from "@/components/overview/TenantWalletEconomy";
import GeographicInsights from "@/components/overview/GeographicInsights";
import ProductPerformance from "@/components/overview/ProductPerformance";

import { useApi } from "@/hooks/useApi";

export default function OverviewDashboardContent() {
  const { data: stats, isLoading, mutate } = useApi("/loyalty/stats/overview", {
    refreshInterval: 10000,
  });

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState<string>(
    new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })
  );

  const handleManualRefresh = () => {
    setIsRefreshing(true);
    mutate();
    window.dispatchEvent(new Event("tuzohub_metrics_updated"));
    setTimeout(() => {
      setIsRefreshing(false);
      setLastRefreshed(
        new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })
      );
    }, 600);
  };

  return (
    <div className="w-full flex flex-col gap-6 animate-fadeIn pb-12">
      {/* ── Page Header Bar with Real-Time Refresh Controls ──────────────────── */}
      <header className="w-full border-b border-gray-200/80 dark:border-white/[0.06] pb-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
                Loyalty OS Command Center
              </h1>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live Sync (10s)
              </span>
            </div>
            <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400 flex items-center gap-2">
              <span>Real-time campaign performance, voucher pipeline, and float wallet telemetry.</span>
              <span className="text-[10px] text-gray-400 dark:text-gray-500 font-mono">
                Last updated: {lastRefreshed}
              </span>
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Manual Sync Trigger */}
            <button
              onClick={handleManualRefresh}
              disabled={isRefreshing}
              className="px-3 py-2 rounded-xl bg-gray-100 dark:bg-white/[0.06] border border-gray-200/80 dark:border-white/10 text-xs font-bold text-gray-700 dark:text-gray-200 hover:bg-gray-200/80 dark:hover:bg-white/10 transition flex items-center gap-1.5"
              title="Click to force-refresh metrics across all cards"
            >
              <svg
                className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-brand-500" : "text-gray-400"}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
              </svg>
              {isRefreshing ? "Syncing..." : "Sync Metrics"}
            </button>

            <Link
              href="/redemptions"
              className="px-3.5 py-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs font-bold hover:bg-emerald-500/20 transition flex items-center gap-1.5"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Float &amp; Disbursements
            </Link>

            <Link
              href="/vouchers/batches"
              className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold transition shadow-lg shadow-brand-500/20 flex items-center gap-1.5"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Voucher Batches
            </Link>
          </div>
        </div>
      </header>

      {/* ── Main Bento Grid Layout ────────────────────────────────────────── */}
      <main className="w-full">
        <div className="grid grid-cols-12 gap-6 auto-rows-max">

          {/* TOP ROW: Core Metrics (Spans full 12 columns) */}
          <div className="col-span-12 min-w-0">
            <OverviewMetrics stats={stats} isLoading={isLoading} />
          </div>

          {/* NEW ROW: Voucher Pipeline & Logistics Breakdown */}
          <div className="col-span-12 min-w-0">
            <VoucherPipelineWidget stats={stats} isLoading={isLoading} />
          </div>

          {/* SECOND ROW: 8-Column / 4-Column Split */}
          <div className="col-span-12 xl:col-span-8 min-w-0 flex flex-col h-full">
            <CampaignPointsChart stats={stats} isLoading={isLoading} />
          </div>

          <div className="col-span-12 xl:col-span-4 min-w-0 flex flex-col h-full">
            <TenantWalletEconomy stats={stats} isLoading={isLoading} />
          </div>

          {/* THIRD ROW: Security & Audit + Active Campaigns */}
          <div className="col-span-12 xl:col-span-5 min-w-0 flex flex-col h-full">
            <SecurityAuditWidget />
          </div>

          <div className="col-span-12 xl:col-span-7 min-w-0 flex flex-col h-full">
            <ActiveCampaignsWidget stats={stats} isLoading={isLoading} />
          </div>

          {/* FOURTH ROW: Product Performance & Pending Redemptions */}
          <div className="col-span-12 xl:col-span-7 min-w-0 flex flex-col h-full">
            <ProductPerformance stats={stats} isLoading={isLoading} />
          </div>

          <div className="col-span-12 xl:col-span-5 min-w-0 flex flex-col h-full">
            <GeographicInsights stats={stats} isLoading={isLoading} />
          </div>

          {/* BOTTOM ROW: Pending Queue Details */}
          <div className="col-span-12 min-w-0 flex flex-col h-full">
            <PendingRedemptions stats={stats} isLoading={isLoading} />
          </div>

        </div>
      </main>
    </div>
  );
}
