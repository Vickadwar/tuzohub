"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authenticatedFetch } from "@/hooks/useApi";
import ModernSelect from "@/components/ui/ModernSelect";

function Field({ label, hint, action, children }: { label: string; hint?: React.ReactNode; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex flex-col">
      <div className="mb-1.5 flex items-center justify-between">
        <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">{label}</label>
        {action && <div>{action}</div>}
      </div>
      {children}
      {hint && <div className="mt-1.5 text-[11px] text-gray-400">{hint}</div>}
    </div>
  );
}

function LocalFormSection({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-gray-200/80 bg-white shadow-sm dark:border-white/[0.06] dark:bg-white/[0.02]">
      <div className="border-b border-gray-100 px-6 py-4 dark:border-white/5">
        <h2 className="text-sm font-bold text-gray-900 dark:text-white">{title}</h2>
        <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">{description}</p>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

function LocalTextInput({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`h-10 w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3.5 text-xs font-medium text-gray-900 shadow-2xs transition-colors placeholder:text-gray-400 focus:border-brand-500/40 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/30 dark:border-white/10 dark:bg-white/[0.03] dark:text-white dark:placeholder:text-white/30 dark:focus:bg-transparent ${className || ""}`}
    />
  );
}

export default function NewRegionPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    countryId: "",
  });
  const [countriesList, setCountriesList] = useState<{ id: string; name: string }[]>([]);
  const [countryName, setCountryName] = useState("Kenya");
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const [tenantRes, countriesRes] = await Promise.all([
          authenticatedFetch("/api/tenants/me").catch(() => null),
          authenticatedFetch("/api/locations/countries").catch(() => null),
        ]);

        let loadedCountries: any[] = [];
        if (countriesRes?.success && Array.isArray(countriesRes.data) && countriesRes.data.length > 0) {
          loadedCountries = countriesRes.data;
        } else {
          const masterCountriesRes = await authenticatedFetch("/api/tenants/countries").catch(() => null);
          if (masterCountriesRes?.success && Array.isArray(masterCountriesRes.data)) {
            loadedCountries = masterCountriesRes.data;
          }
        }
        setCountriesList(loadedCountries);

        let selectedCountryId = "";
        let selectedCountryName = "Kenya";

        if (tenantRes?.success && tenantRes?.data) {
          selectedCountryId = tenantRes.data.countryId || "";
          selectedCountryName = tenantRes.data.countryName || "Kenya";
        }

        if (!selectedCountryId && loadedCountries.length > 0) {
          selectedCountryId = loadedCountries[0].id;
          selectedCountryName = loadedCountries[0].name;
        }

        setFormData(prev => ({ ...prev, countryId: selectedCountryId }));
        setCountryName(selectedCountryName);
      } catch (err: any) {
        // Fallback default
        setCountryName("Kenya");
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError("Region name is required.");
      return;
    }
    setIsSubmitting(true);
    setError("");

    try {
      const payload: any = { name: formData.name.trim() };
      if (formData.countryId) payload.countryId = formData.countryId;

      const data = await authenticatedFetch("/api/locations/regions", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      if (data) {
        router.push("/settings/regions");
      } else {
        setError("Failed to add region.");
      }
    } catch (err: any) {
      setError(err.message || "Network error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 animate-fadeIn pb-12">
      {/* ── Page Header ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-200/80 dark:border-white/[0.06] pb-5">
        <div className="flex items-center gap-4">
          <Link
            href="/settings/regions"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors text-gray-500 dark:text-gray-400"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </Link>

          {/* Rounded Avatar Badge */}
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-xs border border-emerald-500/20 shadow-2xs">
            +
          </div>

          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
                Register Region
              </h1>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold border border-emerald-500/20">
                Territory Setup
              </span>
            </div>
            <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
              Add a geographic region to divide operations into logical territories.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/settings/regions"
            className="px-4 py-2.5 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300 text-xs font-semibold rounded-xl transition"
          >
            Cancel
          </Link>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold rounded-xl shadow-md shadow-brand-500/20 transition disabled:opacity-50"
          >
            {isSubmitting ? "Processing..." : "Save region"}
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-semibold">
          {error}
        </div>
      )}

      <div className="grid grid-cols-12 gap-6">
        <form onSubmit={handleSubmit} className="col-span-12 xl:col-span-8 space-y-6">
          <LocalFormSection title="Region Details" description="Information regarding the new geographic area">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <Field label="Region Name" hint="e.g. Rift Valley, Coast, Central">
                <LocalTextInput
                  placeholder="e.g. Central Highland"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </Field>
              <Field label="Country" hint="Assigned country territory">
                {countriesList.length > 0 ? (
                  <ModernSelect
                    options={countriesList.map(c => ({ value: c.id, label: c.name }))}
                    value={formData.countryId}
                    onChange={(val) => setFormData({ ...formData, countryId: val })}
                    placeholder="Select country..."
                  />
                ) : (
                  <div className="h-10 flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50/50 px-3.5 text-xs font-semibold text-gray-700 dark:border-white/10 dark:bg-white/[0.03] dark:text-gray-300">
                    <span>{countryName && countryName !== "Not configured" ? countryName : "Kenya"}</span>
                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">Default</span>
                  </div>
                )}
              </Field>
            </div>
          </LocalFormSection>
        </form>

        <div className="col-span-12 xl:col-span-4 space-y-6">
          <div className="bg-gradient-to-br from-gray-900 via-gray-950 to-black border border-gray-800 p-6 rounded-2xl text-white shadow-xl space-y-3 relative overflow-hidden">
            <span className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wider">Territory Scope</span>
            <h3 className="text-sm font-bold text-white">Sales Mapping</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Users and entities map to these regions to define ownership and report analytics. Regions break down into Towns.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
