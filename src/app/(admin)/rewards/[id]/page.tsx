"use client";

import React, { use, useState, useEffect } from "react";
import Link from "next/link";
import Badge from "@/components/ui/badge/Badge";
import { useApi } from "@/hooks/useApi";
import ModernSelect from "@/components/ui/ModernSelect";
import { BoxCubeIcon, PieChartIcon } from "@/icons";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function RewardDetail({ params }: PageProps) {
  const resolvedParams = use(params as any) as any;
  const id = resolvedParams?.id;

  const { data: rewardRes, isLoading, mutate } = useApi<any>(`/rewards/items/${id}`);
  const [formData, setFormData] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (rewardRes?.success) {
      setFormData(rewardRes.data);
    }
  }, [rewardRes]);

  if (isLoading || !formData) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-500 border-t-transparent"></div>
      </div>
    );
  }

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch(`/api/rewards/items/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        mutate();
        alert("Reward updated successfully");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const rewardTypeOptions = [
    { value: "AIRTIME", label: "Mobile Airtime" },
    { value: "MOBILE_MONEY", label: "Mobile Money" },
    { value: "BANK_TRANSFER", label: "Bank Transfer" },
    { value: "INTERNAL_VOUCHER", label: "Internal Voucher" },
    { value: "PHYSICAL", label: "Physical Product" },
    { value: "CASH", label: "Cash" },
    { value: "GIFT_CARD", label: "Gift Card" },
  ];

  const fulfillmentOptions = [
    { value: "AUTOMATED_PAYOUT", label: "Automated Payout (API)" },
    { value: "INTERNAL_VOUCHER", label: "Internal Voucher" },
    { value: "MANUAL_FULFILLMENT", label: "Manual Fulfillment" },
    { value: "WALLET_BANKING", label: "Wallet Banking" },
  ];

  return (
    <div className="w-full space-y-6 animate-fadeIn pb-12">
      {/* ── Page Header Card ─────────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-white/[0.02] border border-gray-200/80 dark:border-white/[0.06] p-6 rounded-2xl shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
        <div className="flex items-center gap-4">
          <Link
            href="/rewards"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors text-gray-500 dark:text-gray-400"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </Link>

          {/* Circular Badge Icon */}
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400 font-bold text-sm border border-brand-500/20 shadow-2xs">
            <BoxCubeIcon className="w-5 h-5" />
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-lg font-bold tracking-tight text-gray-900 dark:text-white">
                {formData.name}
              </h1>
              <Badge color="success" size="sm">
                Active Reward
              </Badge>
            </div>
            <p className="mt-0.5 text-xs text-gray-400 capitalize font-medium">
              {formData.rewardType?.replace(/_/g, " ").toLowerCase()} • {formData.fulfillmentStrategy?.replace(/_/g, " ").toLowerCase()}
            </p>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={isSaving}
          className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold rounded-xl transition shadow-md shadow-brand-500/20 disabled:opacity-50 flex items-center gap-2 shrink-0"
        >
          {isSaving ? (
            <>
              <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              Saving...
            </>
          ) : (
            "Update Reward Item"
          )}
        </button>
      </div>

      {/* ── Main Layout: Grid ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-12 gap-6">

        {/* Left Column (8 Columns) */}
        <div className="col-span-12 space-y-6 xl:col-span-8">
          <div className="bg-white dark:bg-white/[0.02] border border-gray-200/80 dark:border-white/[0.06] rounded-2xl shadow-sm relative p-6 space-y-6">
            
            {/* Core Identity */}
            <div>
              <h2 className="text-xs font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-white/5 pb-3 mb-4">
                Core Identity &amp; Type
              </h2>
              <div className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                    Display Name
                  </label>
                  <input
                    type="text"
                    value={formData.name || ""}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-white/10 rounded-xl text-xs font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/40"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                      Reward Type
                    </label>
                    <ModernSelect
                      options={rewardTypeOptions}
                      value={formData.rewardType || ""}
                      onChange={(val) => setFormData({ ...formData, rewardType: val })}
                      placeholder="Select reward type"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                      Fulfillment Strategy
                    </label>
                    <ModernSelect
                      options={fulfillmentOptions}
                      value={formData.fulfillmentStrategy || ""}
                      onChange={(val) => setFormData({ ...formData, fulfillmentStrategy: val })}
                      placeholder="Select fulfillment strategy"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Economics */}
            <div className="pt-6 border-t border-gray-100 dark:border-white/5">
              <h2 className="text-xs font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-white/5 pb-3 mb-4">
                Economics &amp; Costing
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                    Redemption Cost (PTS)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={formData.requiredPoints || ""}
                      onChange={(e) => setFormData({ ...formData, requiredPoints: e.target.value })}
                      className="w-full pl-3.5 pr-12 py-2.5 bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-white/10 rounded-xl text-xs font-mono font-bold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/40"
                    />
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-gray-400">PTS</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Promotional Thumbnail Card */}
            <div className="pt-6 border-t border-gray-100 dark:border-white/5">
              <h2 className="text-xs font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-white/5 pb-3 mb-4">
                Promotional Asset
              </h2>
              <div className="p-8 flex flex-col items-center justify-center border-2 border-dashed border-gray-200 dark:border-white/10 rounded-2xl group hover:border-brand-500/50 transition-colors bg-gray-50/50 dark:bg-white/[0.01]">
                <div className="w-12 h-12 bg-white dark:bg-white/5 rounded-full flex items-center justify-center mb-3 shadow-xs group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6 text-gray-400 group-hover:text-brand-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a1 1 0 011.414 0L15 21M17 9l4.586-4.586a1 1 0 011.414 0L24 12" /></svg>
                </div>
                <p className="text-xs font-bold text-gray-900 dark:text-white">Promotional Thumbnail</p>
                <p className="text-[11px] text-gray-400 mt-0.5">PNG or JPG up to 2MB</p>
              </div>
            </div>

          </div>
        </div>

        {/* Right Column (4 Columns) */}
        <div className="col-span-12 space-y-6 xl:col-span-4">

          {/* Redemption Stats */}
          <div className="bg-white dark:bg-white/[0.02] border border-gray-200/80 dark:border-white/[0.06] p-6 rounded-2xl shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-white/5 pb-3">
              Redemption Stats
            </h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3.5 p-3 rounded-xl border border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/[0.01]">
                <div className="w-10 h-10 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/20 shadow-2xs">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">Successful Claims</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">412 Claims</p>
                </div>
              </div>

              <div className="flex items-center gap-3.5 p-3 rounded-xl border border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/[0.01]">
                <div className="w-10 h-10 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center shrink-0 border border-brand-500/20 shadow-2xs">
                  <PieChartIcon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">Redemption Rate</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">12.5%</p>
                </div>
              </div>
            </div>
          </div>

          {/* Fulfillment Banner */}
          <div className="bg-gradient-to-br from-gray-900 via-gray-950 to-black border border-gray-800 p-6 rounded-2xl text-white shadow-xl space-y-3 relative overflow-hidden">
            <div className="flex items-center gap-2 text-brand-400 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-brand-400 animate-pulse" />
              Fulfillment Engine
            </div>
            <h4 className="text-base font-bold text-white">Automated Router Ready</h4>
            <p className="text-xs text-gray-400 leading-relaxed">
              Configured for <span className="font-semibold text-white capitalize">{formData.fulfillmentStrategy?.replace(/_/g, " ").toLowerCase()}</span>.
              The automated payout engine triggers transactions immediately upon redemption confirmation.
            </p>
            <div className="pt-3 border-t border-gray-800 flex justify-between items-center text-xs">
              <span className="text-gray-400 font-medium">Avg Dispatch Latency:</span>
              <span className="font-mono font-bold text-emerald-400">420ms</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
