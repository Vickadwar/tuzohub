"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authenticatedFetch } from "@/hooks/useApi";

// Premium Components
import ModernSelect from "@/components/ui/ModernSelect";
import DatePicker from "@/components/ui/DatePicker";

// ─── Field Component ─────────────────────────────────────────────────────────
function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
        {label}
      </label>
      {children}
      {hint && <p className="text-[11px] text-gray-400">{hint}</p>}
    </div>
  );
}

// ─── Text Input ──────────────────────────────────────────────────────────────
function TextInput({
  placeholder,
  type = "text",
  value,
  onChange,
}: {
  placeholder?: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-white/10 rounded-xl text-xs font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/40"
    />
  );
}

// ─── Form Section Card (No overflow-hidden to allow dropdown popovers) ──────
function FormSection({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white dark:bg-white/[0.02] border border-gray-200/80 dark:border-white/[0.06] rounded-2xl shadow-sm relative">
      <div className="border-b border-gray-100 dark:border-white/5 px-6 py-4">
        <h2 className="text-sm font-bold text-gray-900 dark:text-white">{title}</h2>
        <p className="text-xs text-gray-400 mt-0.5">{description}</p>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

// ─── Page Component ───────────────────────────────────────────────────────────
export default function NewCampaign() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    campaignType: "EARNING",
    pointsMultiplier: "1.0",
    startDate: new Date().toISOString().split("T")[0],
    endDate: "",
    isRecurring: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSubmitting(true);
    setError("");

    if (!formData.name || !formData.startDate) {
      setError("Campaign name and launch start date are required.");
      setIsSubmitting(false);
      return;
    }

    try {
      const res = await authenticatedFetch("/api/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json().catch(() => res);

      if (data.success || res.ok) {
        router.push("/campaigns");
      } else {
        setError(data.error || "Failed to launch campaign.");
      }
    } catch (err: any) {
      setError(err.message || "Network error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const calcMultiplier = parseFloat(formData.pointsMultiplier) || 1.0;

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
            <Link href="/campaigns" className="hover:text-brand-500 transition-colors">
              Campaigns
            </Link>
            <span>/</span>
            <span className="text-gray-700 dark:text-gray-300">New Campaign</span>
          </nav>

          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
              Create Marketing Campaign
            </h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 text-xs font-semibold border border-purple-500/20">
              Rule Builder
            </span>
          </div>
          <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
            Define point multiplier rules, target timelines, and participant engagement rules.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/campaigns"
            className="px-4 py-2 text-xs font-semibold text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition"
          >
            Cancel
          </Link>
          <button
            onClick={() => handleSubmit()}
            disabled={isSubmitting}
            className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold rounded-xl transition shadow-md shadow-brand-500/20 disabled:opacity-50 flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Launching...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Launch Campaign
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

      {/* ── Main Form Layout: 12-Column Grid ────────────────────────────────── */}
      <div className="grid grid-cols-12 gap-6">

        {/* ── Left Column: Form Cards (Spans 8 columns) ───────────────────── */}
        <div className="col-span-12 xl:col-span-8 space-y-6">
          <form id="campaign-form" onSubmit={handleSubmit} className="space-y-6">

            <FormSection
              title="Campaign Identity &amp; Blueprint"
              description="Name and details describing this marketing promotion."
            >
              <div className="space-y-4">
                <Field label="Campaign Name">
                  <TextInput
                    placeholder="e.g. End of Year Double Points Bonus"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </Field>
                <Field label="Campaign Description">
                  <textarea
                    placeholder="Describe the rules, target audience, or requirements..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full p-3 bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-white/10 rounded-xl text-xs font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/40 leading-relaxed min-h-[90px]"
                  />
                </Field>
              </div>
            </FormSection>

            <FormSection
              title="Engagement &amp; Multiplier Logic"
              description="Define reward types and point accumulation factors."
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Campaign Promotion Type">
                  <ModernSelect
                    options={[
                      { value: "EARNING", label: "Standard Points Earning" },
                      { value: "CASHBACK", label: "Cashback Reward" },
                      { value: "DOUBLE_POINTS", label: "Double Points Multiplier" },
                      { value: "TIER_UPGRADE", label: "Tier Progression Bonus" },
                    ]}
                    value={formData.campaignType}
                    onChange={(val) => setFormData({ ...formData, campaignType: val })}
                    placeholder="Select promotion type"
                  />
                </Field>
                <Field label="Points Multiplier Factor" hint="Base points multiplied by this number">
                  <TextInput
                    placeholder="e.g. 1.5 or 2.0"
                    value={formData.pointsMultiplier}
                    onChange={(e) => setFormData({ ...formData, pointsMultiplier: e.target.value })}
                  />
                </Field>
              </div>
            </FormSection>

            <FormSection
              title="Campaign Active Timeline"
              description="Set the launch date and expiry window for this rule."
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Launch Start Date">
                  <DatePicker
                    value={formData.startDate}
                    onChange={(val) => setFormData({ ...formData, startDate: val })}
                  />
                </Field>
                <Field label="Expiry Date (Optional)" hint="Leave blank for ongoing campaign rules">
                  <DatePicker
                    value={formData.endDate}
                    onChange={(val) => setFormData({ ...formData, endDate: val })}
                    placeholder="Select expiry date"
                  />
                </Field>
              </div>
            </FormSection>

          </form>
        </div>

        {/* ── Right Column: Rules Preview & Guidance (Spans 4 columns) ────── */}
        <div className="col-span-12 xl:col-span-4 space-y-6">
          {/* Live Preview Calculation */}
          <div className="bg-gradient-to-br from-gray-900 via-gray-950 to-black border border-gray-800 p-6 rounded-2xl text-white shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <span className="text-xs font-semibold text-brand-400">Rule Output Preview</span>
              <span className="text-[10px] font-mono text-gray-500">Live Engine Test</span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-gray-400">
                <span>Base Transaction:</span>
                <span className="font-mono text-white font-bold">1,000 Points</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>Applied Multiplier:</span>
                <span className="font-mono text-brand-400 font-bold">{calcMultiplier}x</span>
              </div>
              <div className="pt-2 border-t border-gray-800 flex justify-between items-center">
                <span className="font-semibold text-gray-200">Credited to Member:</span>
                <span className="text-sm font-bold font-mono text-emerald-400">
                  {Math.round(1000 * calcMultiplier).toLocaleString()} PTS
                </span>
              </div>
            </div>
          </div>

          {/* Campaign Guidelines */}
          <div className="bg-white dark:bg-white/[0.02] border border-gray-200/80 dark:border-white/[0.06] p-6 rounded-2xl shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-white/5 pb-3">
              Rules &amp; Guidelines
            </h3>
            <div className="space-y-4">
              {[
                { title: "Point Multipliers", desc: "Setting a 2.0x multiplier immediately doubles earnings for valid items during the campaign window.", color: "bg-brand-500/10 text-brand-600 dark:text-brand-400" },
                { title: "Priority Resolution", desc: "If multiple campaigns overlap, the platform applies the rule with the highest multiplier automatically.", color: "bg-purple-500/10 text-purple-600 dark:text-purple-400" },
                { title: "Instant Deployment", desc: "Active rules deploy instantly across all USSD, mobile apps, and web APIs.", color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" },
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