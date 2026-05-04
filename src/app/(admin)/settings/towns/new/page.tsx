"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authenticatedFetch } from "@/hooks/useApi";

// ─── Reusable Field Component ────────────────────────────────────────
function Field({ label, hint, action, children }: { label: string; hint?: React.ReactNode; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex flex-col">
      <div className="mb-1.5 flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
        {action && <div>{action}</div>}
      </div>
      {children}
      {hint && <div className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">{hint}</div>}
    </div>
  );
}

// ─── Reusable Form Section ────────────────────────────────────────────────────
function LocalFormSection({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
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

function LocalTextInput({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-900 shadow-sm transition-colors placeholder:text-gray-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-white/30 ${className || ""}`}
    />
  );
}

function LocalSelect({ className, children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={`h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-900 shadow-sm transition-colors focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-white/10 dark:bg-white/5 dark:text-white ${className || ""}`}
    >
      {children}
    </select>
  );
}

export default function NewTownPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    regionId: "",
  });
  const [regionsList, setRegionsList] = useState<{ id: string; name: string }[]>([]);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // Load regions for dropdown
  useEffect(() => {
    const load = async () => {
      try {
        const regionsRes = await authenticatedFetch("/api/locations/regions");
        if (regionsRes.success) {
          setRegionsList(regionsRes.data || []);
        }
      } catch (err: any) {
        setError("Failed to load regions: " + (err.message || ""));
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.regionId) {
      setError("Please select a region.");
      return;
    }
    setIsSubmitting(true);
    setError("");

    try {
      const data = await authenticatedFetch("/api/locations/towns", {
        method: "POST",
        body: JSON.stringify(formData),
      });

      if (data.success) {
        router.push("/settings/towns");
      } else {
        setError(data.error || "Failed to add town.");
      }
    } catch (err: any) {
      setError(err.message || "Network error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-[1200px] px-4 pb-12 sm:px-6 lg:px-8 pt-6">
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
          <span className="ml-3 text-sm text-gray-500">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1200px] px-4 pb-12 sm:px-6 lg:px-8">
      {/* ── Header & Breadcrumbs ────────────────────────────────────────────── */}
      <div className="mb-8 pt-6">
        <nav className="mb-2 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <Link href="/overview" className="hover:text-brand-600 transition-colors">Dashboard</Link>
          <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
          </svg>
          <Link href="/settings/towns" className="hover:text-brand-600 transition-colors">Towns</Link>
          <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
          </svg>
          <span className="font-medium text-gray-900 dark:text-gray-200">New Town</span>
        </nav>
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Register Town</h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Add a town inside a specific region.</p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/settings/towns"
              className="rounded-md bg-white px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 shadow-sm hover:bg-gray-50 dark:bg-white/5 dark:border-white/10 dark:text-gray-300 dark:hover:bg-white/10 transition-colors"
            >
              Cancel
            </Link>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="inline-flex items-center justify-center rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 disabled:opacity-60 transition-colors"
            >
              {isSubmitting ? "Processing..." : "Save Town"}
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-6 rounded-md bg-error-50 p-4 border border-error-200 dark:bg-error-500/10 dark:border-error-500/20 text-error-700 dark:text-error-400 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_320px]">
        {/* ── Left Column: Form ────────────────────────────────────────────── */}
        <form onSubmit={handleSubmit} className="space-y-6">

          <LocalFormSection title="Town Details" description="Information regarding the new geographical point">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <Field label="Town Name" hint="e.g. Nakuru, Mombasa">
                <LocalTextInput
                  placeholder="e.g. Nakuru"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </Field>
              <Field label="Region" hint="Select the parent region for this town">
                <LocalSelect
                  required
                  value={formData.regionId}
                  onChange={(e) => setFormData({ ...formData, regionId: e.target.value })}
                >
                  <option value="">Select a region</option>
                  {regionsList.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </LocalSelect>
                {regionsList.length === 0 && (
                  <p className="mt-2 text-xs text-amber-600 dark:text-amber-400">
                    No regions found. <Link href="/settings/regions/new" className="underline">Add a region first</Link>.
                  </p>
                )}
              </Field>
            </div>
          </LocalFormSection>

        </form>

        {/* ── Right Column: Sidebar ────────────────────────────────────────── */}
        <div className="space-y-6">
          <div className="rounded-lg bg-gray-900 p-6 text-white shadow-sm dark:bg-[#121212] dark:border dark:border-white/10">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-brand-400">Micro-targeting</h3>
            <p className="mt-2 text-lg font-medium">Hyper-local Data</p>
            <p className="mt-2 text-sm leading-relaxed text-gray-400">
              Users tied to towns help run localized promotions or target campaigns geographically across districts.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
