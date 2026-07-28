"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { authenticatedFetch } from "@/hooks/useApi";
import ModernSelect from "@/components/ui/ModernSelect";
import Checkbox from "@/components/form/input/Checkbox";
import IntegrationsManager from "@/components/admin/settings/IntegrationsManager";

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

export default function PlatformSettingsPage() {
  const [tenantSlug, setTenantSlug] = useState("");
  const [tenantId, setTenantId] = useState("");
  const [formData, setFormData] = useState({
    countryId: "",
    baseCurrency: "",
    defaultPointValue: "1.00",
    pointExpiryMonths: "12",
    
    // Consumer Controls
    defaultCanPurchase: true,
    defaultCanEarnPoints: true,
    defaultCanRedeemPoints: true,
    defaultCanBankPoints: true,
    defaultCanTransferPoints: false,

    // Fraud & Security
    maxFailedRedemptionsPerHour: 5,
    requireMfaForRedemption: false,
    redemptionVelocityCheckMinutes: 60,
    maxPointsEarnedPerDay: "1000",

    // Branding
    brandPrimaryColor: "#4f46e5",
    brandLogoUrl: "",
    smsSenderId: "",

    // Credentials
    credentials: {} as Record<string, any>,
  });
  const [countriesList, setCountriesList] = useState<{ id: string; name: string; code: string }[]>([]);
  const [currenciesList, setCurrenciesList] = useState<{ code: string; name: string; symbol: string }[]>([]);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

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
          const s = t.settings || {};
          setTenantSlug(t.slug || "");
          setTenantId(t.id || "");
          setFormData({
            countryId: t.countryId || "",
            baseCurrency: t.baseCurrency || "",
            defaultPointValue: t.defaultPointValue || "1.00",
            pointExpiryMonths: String(t.pointExpiryMonths || 12),
            
            defaultCanPurchase: s.defaultCanPurchase ?? true,
            defaultCanEarnPoints: s.defaultCanEarnPoints ?? true,
            defaultCanRedeemPoints: s.defaultCanRedeemPoints ?? true,
            defaultCanBankPoints: s.defaultCanBankPoints ?? true,
            defaultCanTransferPoints: s.defaultCanTransferPoints ?? false,

            maxFailedRedemptionsPerHour: s.maxFailedRedemptionsPerHour ?? 5,
            requireMfaForRedemption: s.requireMfaForRedemption ?? false,
            redemptionVelocityCheckMinutes: s.redemptionVelocityCheckMinutes ?? 60,
            maxPointsEarnedPerDay: s.maxPointsEarnedPerDay ?? "1000",

            brandPrimaryColor: s.brandPrimaryColor || "#4f46e5",
            brandLogoUrl: s.brandLogoUrl || "",
            smsSenderId: s.smsSenderId || "",

            credentials: s.credentials || {},
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

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
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
          
          defaultCanPurchase: formData.defaultCanPurchase,
          defaultCanEarnPoints: formData.defaultCanEarnPoints,
          defaultCanRedeemPoints: formData.defaultCanRedeemPoints,
          defaultCanBankPoints: formData.defaultCanBankPoints,
          defaultCanTransferPoints: formData.defaultCanTransferPoints,

          maxFailedRedemptionsPerHour: formData.maxFailedRedemptionsPerHour,
          requireMfaForRedemption: formData.requireMfaForRedemption,
          redemptionVelocityCheckMinutes: formData.redemptionVelocityCheckMinutes,
          maxPointsEarnedPerDay: formData.maxPointsEarnedPerDay,

          brandPrimaryColor: formData.brandPrimaryColor,
          brandLogoUrl: formData.brandLogoUrl,
          smsSenderId: formData.smsSenderId,

          credentials: formData.credentials || {},
        }),
      });

      if (data.success) {
        setSuccess("Platform settings updated successfully!");
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
            href="/overview"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors text-gray-500 dark:text-gray-400"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </Link>

          {/* Rounded Avatar Badge */}
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400 font-bold text-xs border border-brand-500/20 shadow-2xs">
            {tenantSlug?.charAt(0).toUpperCase() || "T"}
          </div>

          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
                Platform Configurations
              </h1>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400 text-xs font-semibold border border-brand-500/20">
                Setup &amp; Rules
              </span>
            </div>
            <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
              Manage core tenant rules for loyalty programs, security parameters, and branding.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => handleSubmit()}
            disabled={isSubmitting}
            className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold rounded-xl shadow-md shadow-brand-500/20 transition disabled:opacity-50"
          >
            {isSubmitting ? "Saving..." : "Save Settings"}
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-semibold">
          {error}
        </div>
      )}
      
      {success && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
          {success}
        </div>
      )}

      <div className="grid grid-cols-12 gap-6">
        
        {/* Left Column (8 Columns) */}
        <div className="col-span-12 xl:col-span-8 space-y-6">
          
          {/* ── Finance & Core ── */}
          <LocalFormSection title="Finance & Core Setup" description="Primary operating country and currency configurations">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <Field label="Operating Country">
                <ModernSelect
                  options={countriesList.map((c) => ({ value: c.id, label: `${c.name} (${c.code})` }))}
                  value={formData.countryId}
                  onChange={(val) => setFormData({ ...formData, countryId: val })}
                  placeholder="Select country"
                />
              </Field>
              <Field label="Base Currency">
                <ModernSelect
                  options={currenciesList.map((c) => ({ value: c.code, label: `${c.symbol} — ${c.name} (${c.code})` }))}
                  value={formData.baseCurrency}
                  onChange={(val) => setFormData({ ...formData, baseCurrency: val })}
                  placeholder="Select currency"
                />
              </Field>
              <Field label="Default Point Value (KES)" hint="Value in fiat for each point earned">
                <LocalTextInput
                  type="number" step="0.01"
                  value={formData.defaultPointValue}
                  onChange={(e) => setFormData({ ...formData, defaultPointValue: e.target.value })}
                />
              </Field>
              <Field label="Point Expiry (Months)" hint="Points expire after this duration">
                <LocalTextInput
                  type="number"
                  value={formData.pointExpiryMonths}
                  onChange={(e) => setFormData({ ...formData, pointExpiryMonths: e.target.value })}
                />
              </Field>
            </div>
          </LocalFormSection>

          {/* ── Consumer Controls ── */}
          <LocalFormSection title="Consumer Permissions" description="Global toggles for participant capabilities">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50/50 dark:bg-white/[0.01] border border-gray-100 dark:border-white/5">
                <Checkbox checked={formData.defaultCanEarnPoints} onChange={(val) => setFormData({ ...formData, defaultCanEarnPoints: val })} />
                <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Allow Earning Points</span>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50/50 dark:bg-white/[0.01] border border-gray-100 dark:border-white/5">
                <Checkbox checked={formData.defaultCanRedeemPoints} onChange={(val) => setFormData({ ...formData, defaultCanRedeemPoints: val })} />
                <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Allow Point Redemptions</span>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50/50 dark:bg-white/[0.01] border border-gray-100 dark:border-white/5">
                <Checkbox checked={formData.defaultCanBankPoints} onChange={(val) => setFormData({ ...formData, defaultCanBankPoints: val })} />
                <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Enable Point Banking</span>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50/50 dark:bg-white/[0.01] border border-gray-100 dark:border-white/5">
                <Checkbox checked={formData.defaultCanTransferPoints} onChange={(val) => setFormData({ ...formData, defaultCanTransferPoints: val })} />
                <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Enable Peer-to-Peer Transfers</span>
              </div>
            </div>
          </LocalFormSection>

          {/* ── Fraud & Security ── */}
          <LocalFormSection title="Fraud & Security Controls" description="Rules to prevent unauthorized system access or abuse">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <Field label="Max Failed Redemptions / Hour">
                <LocalTextInput
                  type="number"
                  value={formData.maxFailedRedemptionsPerHour}
                  onChange={(e) => setFormData({ ...formData, maxFailedRedemptionsPerHour: parseInt(e.target.value) })}
                />
              </Field>
              <Field label="Max Points Earned Per Day">
                <LocalTextInput
                  type="number"
                  value={formData.maxPointsEarnedPerDay}
                  onChange={(e) => setFormData({ ...formData, maxPointsEarnedPerDay: e.target.value })}
                />
              </Field>
              <div className="flex items-center gap-3 sm:col-span-2 p-3 rounded-xl bg-gray-50/50 dark:bg-white/[0.01] border border-gray-100 dark:border-white/5">
                <Checkbox checked={formData.requireMfaForRedemption} onChange={(val) => setFormData({ ...formData, requireMfaForRedemption: val })} />
                <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">Require Multi-Factor Authentication for Redemptions</span>
              </div>
            </div>
          </LocalFormSection>

          {/* ── Branding ── */}
          <LocalFormSection title="Branding & Assets" description="Customize portal styling and communications header">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <Field label="Brand Primary Color">
                <div className="flex gap-2">
                  <input
                    type="color"
                    className="h-10 w-12 rounded-xl border border-gray-200 dark:border-white/10 shrink-0 cursor-pointer"
                    value={formData.brandPrimaryColor}
                    onChange={(e) => setFormData({ ...formData, brandPrimaryColor: e.target.value })}
                  />
                  <LocalTextInput
                    value={formData.brandPrimaryColor}
                    onChange={(e) => setFormData({ ...formData, brandPrimaryColor: e.target.value })}
                  />
                </div>
              </Field>
              <Field label="SMS Sender ID" hint="Used for outbound USSD and SMS notifications">
                <LocalTextInput
                  value={formData.smsSenderId}
                  onChange={(e) => setFormData({ ...formData, smsSenderId: e.target.value })}
                  placeholder="e.g. TUZOHUB"
                />
              </Field>
              <Field label="Logo URL" hint="Direct link to your organization logo">
                <LocalTextInput
                  value={formData.brandLogoUrl}
                  onChange={(e) => setFormData({ ...formData, brandLogoUrl: e.target.value })}
                  placeholder="https://..."
                />
              </Field>
            </div>
          </LocalFormSection>

          {/* ── Enterprise Multi-Tenant Gateway & Integration Credentials ── */}
          <IntegrationsManager
            credentials={formData.credentials || {}}
            onChange={(newCreds) => setFormData({ ...formData, credentials: newCreds })}
            tenantId={tenantId}
            tenantSlug={tenantSlug}
          />
        </div>

        {/* Right Column (4 Columns) */}
        <div className="col-span-12 xl:col-span-4 space-y-6">
          <div className="bg-gradient-to-br from-gray-900 via-gray-950 to-black border border-gray-800 p-6 rounded-2xl text-white shadow-xl space-y-3 relative overflow-hidden">
            <div className="relative z-10 space-y-3">
              <span className="text-[10px] font-semibold text-brand-400 uppercase tracking-wider">Tenant Scope</span>
              <h3 className="text-sm font-bold text-white">Platform-Wide Governance</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Configurations updated on this screen take effect immediately across all regional branches, dealers, and USSD dispatch gateways.
              </p>
              <div className="pt-2 border-t border-gray-800 flex items-center justify-between text-xs font-mono">
                <span className="text-gray-500">Tenant Slug</span>
                <span className="text-brand-400 font-bold">{tenantSlug || "default"}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
