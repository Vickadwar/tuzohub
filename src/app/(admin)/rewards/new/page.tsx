"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ModernSelect from "@/components/ui/ModernSelect";

// ─── Field Component ─────────────────────────────────────────────────────────
function Field({
  label,
  hint,
  required,
  children,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
        {label} {required && <span className="text-rose-500">*</span>}
      </label>
      {children}
      {hint && <p className="text-[11px] text-gray-400">{hint}</p>}
    </div>
  );
}

// ─── Form Section Card (No overflow-hidden to allow dropdown popovers) ──────
function FormSection({
  step,
  title,
  description,
  children,
}: {
  step: string;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white dark:bg-white/[0.02] border border-gray-200/80 dark:border-white/[0.06] rounded-2xl shadow-sm relative">
      <div className="border-b border-gray-100 dark:border-white/5 px-6 py-4 flex items-center gap-3">
        <div className="w-6 h-6 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center text-xs font-bold border border-brand-500/20 shrink-0 shadow-2xs">
          {step}
        </div>
        <div>
          <h2 className="text-sm font-bold text-gray-900 dark:text-white">{title}</h2>
          <p className="text-xs text-gray-400 mt-0.5">{description}</p>
        </div>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

// ─── Main Page Component ──────────────────────────────────────────────────────
export default function NewReward() {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    rewardType: "MOBILE_MONEY",
    fulfillmentStrategy: "AUTOMATED_PAYOUT",
    requiredPoints: "",
    categoryId: null
  });

  const rewardTypeOptions = [
    { value: "AIRTIME", label: "Mobile Airtime" },
    { value: "MOBILE_MONEY", label: "Mobile Money (M-Pesa)" },
    { value: "BANK_TRANSFER", label: "Bank Transfer" },
    { value: "PHYSICAL", label: "Physical Product / Merch" },
    { value: "CASH", label: "Cash Payout" },
    { value: "GIFT_CARD", label: "Digital Gift Card" },
  ];

  const fulfillmentOptions = [
    { value: "AUTOMATED_PAYOUT", label: "Automated Payout (Daraja B2C API)" },
    { value: "INTERNAL_VOUCHER", label: "Internal Voucher Code" },
    { value: "MANUAL_FULFILLMENT", label: "Manual Processing" },
    { value: "WALLET_BANKING", label: "Wallet Banking Transfer" },
  ];

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError("");

    if (!formData.name || !formData.requiredPoints) {
      setError("Reward name and required points are mandatory.");
      return;
    }
    
    setIsSaving(true);
    try {
      const res = await fetch("/api/rewards/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json().catch(() => ({}));

      if (res.ok && (data.success !== false)) {
        router.push("/rewards");
      } else {
        setError(data.error || "Failed to create reward item.");
      }
    } catch (err: any) {
      setError(err.message || "Network error occurred.");
    } finally {
      setIsSaving(false);
    }
  };

  const ptsValue = parseInt(formData.requiredPoints) || 0;
  const estimatedValue = (ptsValue * 0.1).toFixed(2);

  return (
    <div className="w-full pb-12 animate-fadeIn space-y-6">

      {/* ── Breadcrumb & Top Bar ────────────────────────────────────────────── */}
      <div className="border-b border-gray-200/80 dark:border-white/[0.06] pb-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <nav className="flex items-center gap-2 text-xs font-semibold text-gray-400 mb-1">
            <Link href="/overview" className="hover:text-brand-500 transition-colors">
              Dashboard
            </Link>
            <span>/</span>
            <Link href="/rewards" className="hover:text-brand-500 transition-colors">
              Rewards Catalog
            </Link>
            <span>/</span>
            <span className="text-gray-700 dark:text-gray-300">New Reward</span>
          </nav>

          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
              Create New Reward Item
            </h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400 text-xs font-semibold border border-brand-500/20">
              Catalog Builder
            </span>
          </div>
          <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
            Define point redemption requirements, payout types, and automated fulfillment logic.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/rewards"
            className="px-4 py-2 text-xs font-semibold text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition"
          >
            Cancel
          </Link>
          <button
            onClick={() => handleSubmit()}
            disabled={isSaving}
            className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold rounded-xl transition shadow-md shadow-brand-500/20 disabled:opacity-50 flex items-center gap-2"
          >
            {isSaving ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Deploying...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Deploy Reward Item
              </>
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 text-xs font-semibold">
          {error}
        </div>
      )}

      {/* ── Main Layout: 12-Column Grid ─────────────────────────────────────── */}
      <div className="grid grid-cols-12 gap-6">

        {/* ── Left Column: Form Cards (Spans 8 columns) ───────────────────── */}
        <div className="col-span-12 xl:col-span-8 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Section 1 */}
            <FormSection
              step="1"
              title="Reward Foundation &amp; Identity"
              description="Basic parameters defining the reward title and category."
            >
              <div className="space-y-4">
                <Field label="Reward Item Display Name" required>
                  <input
                    type="text"
                    placeholder="e.g. KES 500 M-Pesa Cash Cashback"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-white/10 rounded-xl text-xs font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/40"
                  />
                </Field>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Fulfillment Type">
                    <ModernSelect
                      options={rewardTypeOptions}
                      value={formData.rewardType}
                      onChange={(val) => setFormData({ ...formData, rewardType: val })}
                      placeholder="Select fulfillment type"
                    />
                  </Field>

                  <Field label="Fulfillment Strategy">
                    <ModernSelect
                      options={fulfillmentOptions}
                      value={formData.fulfillmentStrategy}
                      onChange={(val) => setFormData({ ...formData, fulfillmentStrategy: val })}
                      placeholder="Select strategy"
                    />
                  </Field>
                </div>
              </div>
            </FormSection>

            {/* Section 2 */}
            <FormSection
              step="2"
              title="Economic &amp; Cost Mapping"
              description="Set required points for redemptions."
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Required Points for Redemption" required hint="Points deducted from consumer wallet upon claim">
                  <div className="relative">
                    <input
                      type="number"
                      placeholder="e.g. 1000"
                      value={formData.requiredPoints}
                      onChange={(e) => setFormData({ ...formData, requiredPoints: e.target.value })}
                      required
                      className="w-full pl-3.5 pr-12 py-2.5 bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-white/10 rounded-xl text-xs font-mono font-bold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/40"
                    />
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-gray-400">PTS</span>
                  </div>
                </Field>
              </div>
            </FormSection>

            {/* Section 3 */}
            <FormSection
              step="3"
              title="Visual Presentation Asset"
              description="Upload item artwork for USSD &amp; mobile showcase."
            >
              <div className="rounded-2xl border-2 border-dashed border-gray-200 dark:border-white/10 p-8 flex flex-col items-center justify-center text-center group hover:border-brand-500/50 transition-all bg-gray-50/50 dark:bg-white/[0.01]">
                <div className="w-12 h-12 bg-white dark:bg-white/5 rounded-full flex items-center justify-center mb-3 shadow-xs group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6 text-gray-400 group-hover:text-brand-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a1 1 0 011.414 0L15 21M17 9l4.586-4.586a1 1 0 011.414 0L24 12" />
                  </svg>
                </div>
                <p className="text-xs font-bold text-gray-900 dark:text-white">Upload Promotional Thumbnail</p>
                <p className="text-[11px] text-gray-400 mt-0.5">Recommended size: 800x800px (PNG/JPG)</p>
              </div>
            </FormSection>

          </form>
        </div>

        {/* ── Right Column: Live Output & Guidelines (Spans 4 columns) ────── */}
        <div className="col-span-12 xl:col-span-4 space-y-6">
          {/* Live Preview Card */}
          <div className="bg-gradient-to-br from-gray-900 via-gray-950 to-black border border-gray-800 p-6 rounded-2xl text-white shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <span className="text-xs font-semibold text-brand-400">Redemption Card Preview</span>
              <span className="text-[10px] font-mono text-gray-500">Live Simulator</span>
            </div>

            <div className="space-y-3">
              <div className="p-3 bg-gray-900/90 rounded-xl border border-gray-800 space-y-1">
                <span className="text-[10px] text-gray-400 font-semibold">Reward Title:</span>
                <p className="text-xs font-bold text-white truncate">
                  {formData.name || "Untitled Reward Item"}
                </p>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-gray-400">
                  <span>Points Required:</span>
                  <span className="font-mono text-brand-400 font-bold">{ptsValue.toLocaleString()} PTS</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Est. Cash Equivalent:</span>
                  <span className="font-mono text-emerald-400 font-bold">KES {estimatedValue}</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Strategy:</span>
                  <span className="font-sans text-gray-200 capitalize font-medium">
                    {formData.fulfillmentStrategy?.replace(/_/g, " ").toLowerCase()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Fulfillment Guidelines */}
          <div className="bg-white dark:bg-white/[0.02] border border-gray-200/80 dark:border-white/[0.06] p-6 rounded-2xl shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-white/5 pb-3">
              Fulfillment Rules
            </h3>
            <div className="space-y-4">
              {[
                { title: "Automated Payouts", desc: "Selecting Daraja B2C triggers instant automated cash disbursements directly to MSISDN.", color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" },
                { title: "Internal Vouchers", desc: "Generates a unique 8-digit single-use promo code for in-store checkout.", color: "bg-brand-500/10 text-brand-600 dark:text-brand-400" },
                { title: "Manual Review", desc: "Routes high-value physical rewards to the admin queue for dispatch approval.", color: "bg-amber-500/10 text-amber-600 dark:text-amber-400" },
              ].map((item, i) => (
                <div key={i} className="flex gap-3 items-start">
                  <div className={`p-1.5 rounded-lg shrink-0 ${item.color}`}>
                    <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-gray-900 dark:text-white">{item.title}</h4>
                    <p className="mt-0.5 text-[11px] leading-relaxed text-gray-400">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
