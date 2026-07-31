"use client";

import React from "react";
import Link from "next/link";
import { useApi } from "@/hooks/useApi";

export default function VoucherPipelineWidget() {
  const { data: stats, isLoading, isError } = useApi("/loyalty/stats/overview", {
    refreshInterval: 10000,
  });

  const pipeline = stats?.voucherPipeline || {
    GENERATED: 0,
    AT_PRINTER: 0,
    IN_TRANSIT: 0,
    IN_STOCK: 0,
    ACTIVE: 0,
    REDEEMED: 0,
  };

  const totalDisbursed = stats?.metrics?.totalDisbursedKes || 0;
  const pendingPayout = stats?.metrics?.pendingPayoutKes || 0;

  const totalVouchers = Object.values(pipeline).reduce((acc: number, curr: any) => acc + Number(curr), 0);

  const stages = [
    { label: "Generated", count: pipeline.GENERATED, color: "bg-gray-500", text: "text-gray-600 dark:text-gray-400" },
    { label: "At Printer Press", count: pipeline.AT_PRINTER, color: "bg-indigo-500", text: "text-indigo-600 dark:text-indigo-400" },
    { label: "In Transit", count: pipeline.IN_TRANSIT, color: "bg-amber-500", text: "text-amber-600 dark:text-amber-400" },
    { label: "In Stock (Ready)", count: pipeline.IN_STOCK, color: "bg-blue-500", text: "text-blue-600 dark:text-blue-400" },
    { label: "Active", count: pipeline.ACTIVE, color: "bg-emerald-500", text: "text-emerald-600 dark:text-emerald-400" },
    { label: "Redeemed", count: pipeline.REDEEMED, color: "bg-purple-500", text: "text-purple-600 dark:text-purple-400" },
  ];

  if (isLoading) {
    return <div className="h-44 rounded-2xl bg-gray-100 dark:bg-white/5 animate-pulse" />;
  }

  return (
    <div className="w-full rounded-2xl border border-gray-200/80 bg-white p-5 shadow-xs dark:border-white/[0.06] dark:bg-white/[0.02] flex flex-col justify-between gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-brand-500/10 text-brand-600 dark:bg-brand-500/20 dark:text-brand-400 flex items-center justify-center font-bold">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-12v.75m0 3v.75m0 3v.75m0 3V18M3 7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v9a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 16.5v-9z" />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
              Voucher Supply Chain &amp; Cash Payouts
            </h3>
            <p className="text-[11px] text-gray-500 dark:text-gray-400">
              Real-time batch states and M-Pesa B2C dispatches
            </p>
          </div>
        </div>

        <Link
          href="/vouchers/batches"
          className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1"
        >
          Manage Batches →
        </Link>
      </div>

      {/* Stage Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {stages.map((stg) => (
          <div key={stg.label} className="p-3 rounded-xl bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.05] flex flex-col justify-between">
            <span className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 truncate">
              {stg.label}
            </span>
            <div className="flex items-baseline justify-between mt-2">
              <span className={`text-lg font-black font-mono ${stg.text}`}>
                {stg.count.toLocaleString()}
              </span>
              <span className={`w-2 h-2 rounded-full ${stg.color}`} />
            </div>
          </div>
        ))}
      </div>

      {/* Disbursed Cash Sub-Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between p-3 rounded-xl bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent border border-emerald-500/20 gap-3">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-xs">
            KES
          </div>
          <div>
            <div className="text-xs font-bold text-gray-900 dark:text-white">
              KES {totalDisbursed.toLocaleString("en-KE", { minimumFractionDigits: 2 })} Total M-Pesa Disbursed
            </div>
            <div className="text-[10px] text-gray-500 dark:text-gray-400">
              Pending in queue: KES {pendingPayout.toLocaleString("en-KE")}
            </div>
          </div>
        </div>

        <Link
          href="/redemptions"
          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-xs shrink-0"
        >
          View Disbursed Payouts
        </Link>
      </div>
    </div>
  );
}
