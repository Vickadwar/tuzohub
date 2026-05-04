"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authenticatedFetch } from "@/hooks/useApi";

// Premium Components
import ModernSelect from "@/components/ui/ModernSelect";
import DatePicker from "@/components/ui/DatePicker";

// ─── Refined Reusable Field Component ─────────────────────────────────────────
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
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
      </label>
      {children}
      {hint && <p className="text-xs text-gray-500 dark:text-gray-400">{hint}</p>}
    </div>
  );
}

// ─── Standardized Text Input ──────────────────────────────────────────────────
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
      className="h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-900 shadow-sm transition-colors placeholder:text-gray-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-white/30"
    />
  );
}

// ─── Reusable Form Section ────────────────────────────────────────────────────
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
    <div className="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-white/10 dark:bg-[#18181b]">
      <div className="border-b border-gray-100 px-6 py-5 dark:border-white/5">
        <h2 className="text-base font-semibold text-gray-900 dark:text-white">{title}</h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{description}</p>
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
      setError("Campaign name and start date are required.");
      setIsSubmitting(false);
      return;
    }

    try {
      const data = await authenticatedFetch("/api/campaigns", {
        method: "POST",
        body: JSON.stringify(formData),
      });

      if (data.success) {
        router.push("/campaigns");
      } else {
        setError(data.error || "Failed to launch campaign.");
      }
    } catch (err: any) {
      setError(err.info?.error || err.message || "Network error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full pb-12 animate-in fade-in duration-500">

      {/* ── Header & Top Actions ────────────────────────────────────────────── */}
      <div className="mb-8 pt-6">
        <nav className="mb-2 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <Link href="/overview" className="hover:text-brand-600 transition-colors">
            Dashboard
          </Link>
          <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
          </svg>
          <Link href="/campaigns" className="hover:text-brand-600 transition-colors">
            Campaigns
          </Link>
          <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
          </svg>
          <span className="font-medium text-gray-900 dark:text-gray-200">New campaign</span>
        </nav>

        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-white">
              Create marketing campaign
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Define points, multipliers, and duration for participant engagement.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/campaigns"
              className="rounded-md bg-white px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 shadow-sm hover:bg-gray-50 dark:bg-white/5 dark:border-white/10 dark:text-gray-300 dark:hover:bg-white/10 transition-colors"
            >
              Cancel
            </Link>
            <button
              onClick={() => handleSubmit()}
              disabled={isSubmitting}
              className="inline-flex items-center justify-center rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 disabled:opacity-60 transition-colors"
            >
              {isSubmitting ? "Launching..." : "Launch campaign"}
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-6 flex items-start gap-3 rounded-md bg-error-50 p-4 border border-error-200 dark:bg-error-500/10 dark:border-error-500/20">
          <svg className="mt-0.5 h-5 w-5 shrink-0 text-error-600 dark:text-error-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div className="flex-1">
            <p className="text-sm font-medium text-error-800 dark:text-error-300">{error}</p>
          </div>
        </div>
      )}

      {/* ── Main Layout: 12-Column Grid ────────────────────────────────────── */}
      <div className="grid grid-cols-12 gap-6">

        {/* ── Left Column: Form (Spans 8 columns) ────────────────────────── */}
        <div className="col-span-12 xl:col-span-8 space-y-6">
          <form id="campaign-form" onSubmit={handleSubmit} className="space-y-6">

            <FormSection
              title="Campaign blueprint"
              description="Basic identity and information for the promotion."
            >
              <div className="space-y-6">
                <Field label="Campaign name">
                  <TextInput
                    placeholder="e.g. End of Year Double Points"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </Field>
                <Field label="Description">
                  <textarea
                    placeholder="Explain the rules or purpose of this campaign..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="min-h-[100px] w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm transition-colors placeholder:text-gray-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-white/30"
                  />
                </Field>
              </div>
            </FormSection>

            <FormSection
              title="Engagement logic"
              description="Set the rules for points multiplier and behavior."
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <Field label="Campaign type">
                  <ModernSelect
                    options={[
                      { value: "EARNING", label: "Standard points earning" },
                      { value: "CASHBACK", label: "Cashback reward" },
                      { value: "DOUBLE_POINTS", label: "Double points multiplier" },
                      { value: "TIER_UPGRADE", label: "Tier progression bonus" },
                    ]}
                    value={formData.campaignType}
                    onChange={(val) => setFormData({ ...formData, campaignType: val })}
                    placeholder="Select type"
                  />
                </Field>
                <Field label="Points multiplier" hint="Base points will be multiplied by this factor">
                  <TextInput
                    placeholder="e.g. 1.0 or 2.0"
                    value={formData.pointsMultiplier}
                    onChange={(e) => setFormData({ ...formData, pointsMultiplier: e.target.value })}
                  />
                </Field>
              </div>
            </FormSection>

            <FormSection
              title="Active timeline"
              description="Define the duration this campaign will run."
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <Field label="Launch date">
                  <DatePicker
                    value={formData.startDate}
                    onChange={(val) => setFormData({ ...formData, startDate: val })}
                  />
                </Field>
                <Field label="Expiry date" hint="Leave blank for ongoing campaigns">
                  <DatePicker
                    value={formData.endDate}
                    onChange={(val) => setFormData({ ...formData, endDate: val })}
                    placeholder="Select date (Optional)"
                  />
                </Field>
              </div>
            </FormSection>

          </form>
        </div>

        {/* ── Right Column: Sidebar (Spans 4 columns) ─────────────────────── */}
        <div className="col-span-12 xl:col-span-4 space-y-6">
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#18181b]">
            <h3 className="mb-5 text-sm font-semibold text-gray-900 dark:text-white">Campaign guidelines</h3>
            <div className="space-y-6">
              {[
                { title: "Point multipliers", desc: "Setting a 2.0x multiplier immediately doubles all earnings for valid products during the window.", color: "bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400" },
                { title: "Priority engine", desc: "If multiple campaigns overlap, the platform applies the one with the highest multiplier automatically.", color: "bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-gray-400" },
                { title: "Real-time deployment", desc: "Changes to active campaigns take effect instantly across all USSD and API channels.", color: "bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-gray-400" },
              ].map((item, i) => (
                <div key={i} className="flex gap-3">
                  <div className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${item.color}`}>
                    <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 dark:text-gray-200">{item.title}</h4>
                    <p className="mt-1 text-xs leading-relaxed text-gray-500 dark:text-gray-400">{item.desc}</p>
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