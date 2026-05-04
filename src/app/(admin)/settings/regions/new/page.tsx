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

export default function NewRegionPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    countryId: "",
  });
  const [countryName, setCountryName] = useState("");
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // Load tenant data to get the country
  useEffect(() => {
    const load = async () => {
      try {
        const tenantRes = await authenticatedFetch("/api/tenants/me");
        if (tenantRes.success && tenantRes.data) {
          setFormData(prev => ({ ...prev, countryId: tenantRes.data.countryId || "" }));
          setCountryName(tenantRes.data.countryName || "Not configured");
        }
      } catch (err: any) {
        setError("Failed to load tenant data: " + (err.message || ""));
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.countryId) {
      setError("No country configured for your tenant. Please update Platform Settings first.");
      return;
    }
    setIsSubmitting(true);
    setError("");

    try {
      const data = await authenticatedFetch("/api/locations/regions", {
        method: "POST",
        body: JSON.stringify(formData),
      });

      if (data.success) {
        router.push("/settings/regions");
      } else {
        setError(data.error || "Failed to add region.");
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
          <Link href="/settings/regions" className="hover:text-brand-600 transition-colors">Regions</Link>
          <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
          </svg>
          <span className="font-medium text-gray-900 dark:text-gray-200">New Region</span>
        </nav>
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Register Region</h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Add a geographic region to divide operations into logical territories.</p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/settings/regions"
              className="rounded-md bg-white px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 shadow-sm hover:bg-gray-50 dark:bg-white/5 dark:border-white/10 dark:text-gray-300 dark:hover:bg-white/10 transition-colors"
            >
              Cancel
            </Link>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="inline-flex items-center justify-center rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 disabled:opacity-60 transition-colors"
            >
              {isSubmitting ? "Processing..." : "Save Region"}
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

          <LocalFormSection title="Region Details" description="Information regarding the new geographic area">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <Field label="Region Name" hint="e.g. Rift Valley, Coast">
                <LocalTextInput
                  placeholder="e.g. Central"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </Field>
              <Field label="Country" hint="Inherited from your tenant's platform settings">
                <div className="h-10 flex items-center rounded-md border border-gray-200 bg-gray-50 px-3 text-sm text-gray-700 dark:border-white/10 dark:bg-white/5 dark:text-gray-300">
                  {countryName || "Loading..."}
                </div>
              </Field>
            </div>
          </LocalFormSection>

        </form>

        {/* ── Right Column: Sidebar ────────────────────────────────────────── */}
        <div className="space-y-6">
          <div className="rounded-lg bg-gray-900 p-6 text-white shadow-sm dark:bg-[#121212] dark:border dark:border-white/10">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-brand-400">Hierarchy Flow</h3>
            <p className="mt-2 text-lg font-medium">Sales Maps</p>
            <p className="mt-2 text-sm leading-relaxed text-gray-400">
              Users and entities map to these regions to define ownership and report analytics. Regions break down into Towns.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
