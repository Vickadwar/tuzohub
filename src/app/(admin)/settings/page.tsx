"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { authenticatedFetch } from "@/hooks/useApi";
import ModernSelect from "@/components/ui/ModernSelect";

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



export default function PlatformSettingsPage() {
  const [tenantSlug, setTenantSlug] = useState("");
  const [formData, setFormData] = useState({
    countryId: "",
    baseCurrency: "",
    defaultPointValue: "1.00",
    pointExpiryMonths: "12",
    atUsername: "",
    atApiKey: "",
    atSenderId: "",
    darajaConsumerKey: "",
    darajaConsumerSecret: "",
    darajaShortCode: "",
    darajaInitiatorName: "",
  });
  const [countriesList, setCountriesList] = useState<{ id: string; name: string; code: string }[]>([]);
  const [currenciesList, setCurrenciesList] = useState<{ code: string; name: string; symbol: string }[]>([]);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Load tenant data + master lists on mount
  useEffect(() => {
    const load = async () => {
      try {
        const [tenantRes, countriesRes, currenciesRes] = await Promise.all([
          authenticatedFetch("/api/tenants/me"),
          authenticatedFetch("/api/tenants/countries"),
          authenticatedFetch("/api/tenants/currencies"),
        ]);

        if (tenantRes.success && tenantRes.data) {
          const t = tenantRes.data;
          setTenantSlug(t.slug || "");
          setFormData({
            countryId: t.countryId || "",
            baseCurrency: t.baseCurrency || "",
            defaultPointValue: t.defaultPointValue || "1.00",
            pointExpiryMonths: String(t.pointExpiryMonths || 12),
            atUsername: t.settings?.credentials?.atUsername || "",
            atApiKey: t.settings?.credentials?.atApiKey || "",
            atSenderId: t.settings?.credentials?.atSenderId || "",
            darajaConsumerKey: t.settings?.credentials?.darajaConsumerKey || "",
            darajaConsumerSecret: t.settings?.credentials?.darajaConsumerSecret || "",
            darajaShortCode: t.settings?.credentials?.darajaShortCode || "",
            darajaInitiatorName: t.settings?.credentials?.darajaInitiatorName || "",
          });
        }

        if (countriesRes.success) setCountriesList(countriesRes.data || []);
        if (currenciesRes.success) setCurrenciesList(currenciesRes.data || []);
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
    if (!tenantSlug) {
      setError("Tenant not loaded yet. Please wait.");
      return;
    }
    setIsSubmitting(true);
    setError("");
    setSuccess("");

    try {
      const data = await authenticatedFetch(`/api/tenants/${tenantSlug}/settings`, {
        method: "PUT",
        body: JSON.stringify({
          baseCurrency: formData.baseCurrency,
          defaultPointValue: formData.defaultPointValue,
          pointExpiryMonths: parseInt(formData.pointExpiryMonths),
          credentials: {
            atUsername: formData.atUsername,
            atApiKey: formData.atApiKey,
            atSenderId: formData.atSenderId,
            darajaConsumerKey: formData.darajaConsumerKey,
            darajaConsumerSecret: formData.darajaConsumerSecret,
            darajaShortCode: formData.darajaShortCode,
            darajaInitiatorName: formData.darajaInitiatorName,
          }
        }),
      });

      if (data.success) {
        setSuccess("Settings updated successfully!");
      } else {
        setError(data.error || "Failed to update settings.");
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
          <span className="ml-3 text-sm text-gray-500">Loading settings...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1200px] px-4 pb-12 sm:px-6 lg:px-8">
      {/* ── Header & Breadcrumbs ────────────────────────────────────────────── */}
      <div className="mb-8 pt-6">
        <nav className="mb-2 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <Link href="/overview" className="hover:text-brand-600 transition-colors">
            Dashboard
          </Link>
          <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
          </svg>
          <span className="font-medium text-gray-900 dark:text-gray-200">Organization Settings</span>
        </nav>
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
              Platform Configurations
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Manage core tenant rules for loyalty programs, currency, and point behaviours.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="inline-flex items-center justify-center rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 disabled:opacity-60 transition-colors"
            >
              {isSubmitting ? "Saving..." : "Save Settings"}
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-6 rounded-md bg-error-50 p-4 border border-error-200 dark:bg-error-500/10 dark:border-error-500/20 text-error-700 dark:text-error-400 text-sm">
          {error}
        </div>
      )}
      
      {success && (
        <div className="mb-6 rounded-md bg-success-50 p-4 border border-success-200 dark:bg-success-500/10 dark:border-success-500/20 text-success-700 dark:text-success-400 text-sm">
          {success}
        </div>
      )}

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_320px]">
        {/* ── Left Column: Form ────────────────────────────────────────────── */}
        <form onSubmit={handleSubmit} className="space-y-6">

          <LocalFormSection
            title="Finance Setup"
            description="Tenant base currency and limits"
          >
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <Field label="Country" hint="Default tenant operating country">
                <ModernSelect
                  options={countriesList.map((c) => ({
                    value: c.id,
                    label: `${c.name} (${c.code})`,
                  }))}
                  value={formData.countryId}
                  onChange={(val) => setFormData({ ...formData, countryId: val })}
                  placeholder="Select a country"
                />
              </Field>
              <Field label="Base Currency" hint="Primary operating currency">
                <ModernSelect
                  options={currenciesList.map((c) => ({
                    value: c.code,
                    label: `${c.symbol} — ${c.name} (${c.code})`,
                  }))}
                  value={formData.baseCurrency}
                  onChange={(val) => setFormData({ ...formData, baseCurrency: val })}
                  placeholder="Select currency"
                />
              </Field>
            </div>
          </LocalFormSection>

          <LocalFormSection
            title="Loyalty Engine Rules"
            description="Global parameters for points and engagement"
          >
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <Field label="Default Point Value (KES)" hint="Currency value in fiat for each point">
                <LocalTextInput
                  type="number"
                  step="0.01"
                  value={formData.defaultPointValue}
                  onChange={(e) => setFormData({ ...formData, defaultPointValue: e.target.value })}
                />
              </Field>
              <Field label="Point Expiry (Months)" hint="How long points live before burning">
                <LocalTextInput
                  type="number"
                  value={formData.pointExpiryMonths}
                  onChange={(e) => setFormData({ ...formData, pointExpiryMonths: e.target.value })}
                />
              </Field>
            </div>
          </LocalFormSection>

          <LocalFormSection
            title="Africa's Talking Credentials"
            description="Required for USSD and SMS onboarding"
          >
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <Field label="AT Username" hint="Usually 'sandbox' for testing">
                <LocalTextInput
                  value={formData.atUsername}
                  onChange={(e) => setFormData({ ...formData, atUsername: e.target.value })}
                  placeholder="e.g. sandbox"
                />
              </Field>
              <Field label="AT API Key">
                <LocalTextInput
                  type="password"
                  value={formData.atApiKey}
                  onChange={(e) => setFormData({ ...formData, atApiKey: e.target.value })}
                  placeholder="atsk_..."
                />
              </Field>
              <Field label="AT Sender ID" hint="Your Short Code or Alpha-numeric ID">
                <LocalTextInput
                  value={formData.atSenderId}
                  onChange={(e) => setFormData({ ...formData, atSenderId: e.target.value })}
                  placeholder="e.g. 23456"
                />
              </Field>
            </div>
          </LocalFormSection>

          <LocalFormSection
            title="Safaricom Daraja (M-Pesa)"
            description="B2C Payout credentials for automated rewards"
          >
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <Field label="Consumer Key">
                <LocalTextInput
                  value={formData.darajaConsumerKey}
                  onChange={(e) => setFormData({ ...formData, darajaConsumerKey: e.target.value })}
                />
              </Field>
              <Field label="Consumer Secret">
                <LocalTextInput
                  type="password"
                  value={formData.darajaConsumerSecret}
                  onChange={(e) => setFormData({ ...formData, darajaConsumerSecret: e.target.value })}
                />
              </Field>
              <Field label="B2C Short Code">
                <LocalTextInput
                  value={formData.darajaShortCode}
                  onChange={(e) => setFormData({ ...formData, darajaShortCode: e.target.value })}
                />
              </Field>
              <Field label="Initiator Name">
                <LocalTextInput
                  value={formData.darajaInitiatorName}
                  onChange={(e) => setFormData({ ...formData, darajaInitiatorName: e.target.value })}
                />
              </Field>
            </div>
          </LocalFormSection>
        </form>

        {/* ── Right Column: Sidebar ────────────────────────────────────────── */}
        <div className="space-y-6">
          <div className="rounded-lg bg-gray-900 p-6 text-white shadow-sm dark:bg-[#121212] dark:border dark:border-white/10">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-brand-400">
              Impact Zone
            </h3>
            <p className="mt-2 text-lg font-medium">Global Rule Updates</p>
            <p className="mt-2 text-sm leading-relaxed text-gray-400">
              Changes applied here will immediately affect point accrual rates and expiry CRON jobs. Be careful when updating point values in production.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
