import type { Metadata } from "next";
import React from "react";
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
    <div className="w-full flex flex-col gap-6">
      {/* Clean, Frameless Header */}
      <header className="w-full">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
              Overview
            </h1>
            <p className="text-sm font-medium text-gray-500 mt-1">
              Your Loyalty OS command center.
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* Decorative status indicator */}
            <div className="flex items-center gap-2 px-3 py-1.5 bg-success-50 border border-success-100 rounded-lg">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-success-500"></span>
              </span>
              <span className="text-xs font-semibold text-success-700 uppercase tracking-wider">
                System Healthy
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Bento Grid Layout */}
      <main className="w-full pb-8">
        <div className="grid grid-cols-12 gap-6 md:gap-8 auto-rows-max">

          {/* TOP ROW: Core Metrics (Spans full width) */}
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

          {/* THIRD ROW: 4-Column / 8-Column Split (Reversed rhythm for Bento look) */}
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