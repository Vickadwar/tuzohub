import type { Metadata } from "next";
import React from "react";
import Link from "next/link";
import OverviewMetrics from "@/components/overview/OverviewMetrics";
import CampaignPointsChart from "@/components/overview/CampaignPointsChart";
import PendingRedemptions from "@/components/overview/PendingRedemptions";
import ActiveCampaignsWidget from "@/components/overview/ActiveCampaignsWidget";
import TenantWalletEconomy from "@/components/overview/TenantWalletEconomy";
import GeographicInsights from "@/components/overview/GeographicInsights";
import ProductPerformance from "@/components/overview/ProductPerformance";

export const metadata: Metadata = {
  title: "Overview | TuzoHub Loyalty OS",
  description: "TuzoHub Loyalty and Rewards platform overview",
};

export default function Overview() {
  return (
    <div className="w-full flex flex-col gap-6 animate-fadeIn pb-12">
      {/* ── Page Header Bar ────────────────────────────────────────────────── */}
      <header className="w-full border-b border-gray-200/80 dark:border-white/[0.06] pb-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
                Loyalty OS Command Center
              </h1>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live Telemetry
              </span>
            </div>
            <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
              Real-time campaign performance, participant engagement, and M-Pesa float wallet metrics.
            </p>
          </div>

          <div className="flex items-center gap-3">
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
              href="/campaigns/new"
              className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold transition shadow-lg shadow-brand-500/20 flex items-center gap-1.5"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              New Campaign
            </Link>
          </div>
        </div>
      </header>

      {/* ── Main Bento Grid Layout ────────────────────────────────────────── */}
      <main className="w-full">
        <div className="grid grid-cols-12 gap-6 auto-rows-max">

          {/* TOP ROW: Core Metrics (Spans full 12 columns) */}
          <div className="col-span-12 min-w-0">
            <OverviewMetrics />
          </div>

          {/* SECOND ROW: 8-Column / 4-Column Split */}
          <div className="col-span-12 xl:col-span-8 min-w-0 flex flex-col h-full">
            <CampaignPointsChart />
          </div>

          <div className="col-span-12 xl:col-span-4 min-w-0 flex flex-col h-full">
            <TenantWalletEconomy />
          </div>

          {/* THIRD ROW: 4-Column / 8-Column Split */}
          <div className="col-span-12 xl:col-span-4 min-w-0 flex flex-col h-full">
            <ActiveCampaignsWidget />
          </div>

          <div className="col-span-12 xl:col-span-8 min-w-0 flex flex-col h-full">
            <ProductPerformance />
          </div>

          {/* BOTTOM ROW: 8-Column / 4-Column Split */}
          <div className="col-span-12 xl:col-span-8 min-w-0 flex flex-col h-full">
            <PendingRedemptions />
          </div>

          <div className="col-span-12 xl:col-span-4 min-w-0 flex flex-col h-full">
            <GeographicInsights />
          </div>

        </div>
      </main>
    </div>
  );
}