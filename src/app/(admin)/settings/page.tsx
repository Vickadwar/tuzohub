"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { authenticatedFetch } from "@/hooks/useApi";
import ModernSelect from "@/components/ui/ModernSelect";
import Checkbox from "@/components/form/input/Checkbox";

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

            atUsername: s.credentials?.atUsername || "",
            atApiKey: s.credentials?.atApiKey || "",
            atSenderId: s.credentials?.atSenderId || "",
            darajaConsumerKey: s.credentials?.darajaConsumerKey || "",
            darajaConsumerSecret: s.credentials?.darajaConsumerSecret || "",
            darajaShortCode: s.credentials?.darajaShortCode || "",
            darajaInitiatorName: s.credentials?.darajaInitiatorName || "",
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
      {/* ── Header ────────────────────────────────────────────────────────── */}
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
              Manage core tenant rules for loyalty programs, security, and branding.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleSubmit()}
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
        <div className="space-y-6">
          {/* ── Finance & Core ── */}
          <LocalFormSection title="Finance & Core Setup" description="Primary operating country and currency">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <Field label="Country">
                <ModernSelect
                  options={countriesList.map((c) => ({ value: c.id, label: `${c.name} (${c.code})` }))}
                  value={formData.countryId}
                  onChange={(val) => setFormData({ ...formData, countryId: val })}
                  placeholder="Select a country"
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
          <LocalFormSection title="Consumer Permissions" description="Global toggles for consumer actions">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div className="flex items-center gap-3">
                <Checkbox checked={formData.defaultCanEarnPoints} onChange={(val) => setFormData({ ...formData, defaultCanEarnPoints: val })} />
                <span className="text-sm text-gray-700 dark:text-gray-300">Allow Earning Points</span>
              </div>
              <div className="flex items-center gap-3">
                <Checkbox checked={formData.defaultCanRedeemPoints} onChange={(val) => setFormData({ ...formData, defaultCanRedeemPoints: val })} />
                <span className="text-sm text-gray-700 dark:text-gray-300">Allow Point Redemptions</span>
              </div>
              <div className="flex items-center gap-3">
                <Checkbox checked={formData.defaultCanBankPoints} onChange={(val) => setFormData({ ...formData, defaultCanBankPoints: val })} />
                <span className="text-sm text-gray-700 dark:text-gray-300">Enable Point Banking</span>
              </div>
              <div className="flex items-center gap-3">
                <Checkbox checked={formData.defaultCanTransferPoints} onChange={(val) => setFormData({ ...formData, defaultCanTransferPoints: val })} />
                <span className="text-sm text-gray-700 dark:text-gray-300">Enable Peer-to-Peer Transfers</span>
              </div>
            </div>
          </LocalFormSection>

          {/* ── Fraud & Security ── */}
          <LocalFormSection title="Fraud & Security" description="Rules to prevent system abuse">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
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
              <div className="flex items-center gap-3 pt-6">
                <Checkbox checked={formData.requireMfaForRedemption} onChange={(val) => setFormData({ ...formData, requireMfaForRedemption: val })} />
                <span className="text-sm text-gray-700 dark:text-gray-300">Require MFA for Redemptions</span>
              </div>
            </div>
          </LocalFormSection>

          {/* ── Branding ── */}
          <LocalFormSection title="Branding & Assets" description="Customize the look and feel of your portal">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <Field label="Brand Primary Color">
                <div className="flex gap-2">
                  <input
                    type="color"
                    className="h-10 w-12 rounded border border-gray-300 dark:border-white/10"
                    value={formData.brandPrimaryColor}
                    onChange={(e) => setFormData({ ...formData, brandPrimaryColor: e.target.value })}
                  />
                  <LocalTextInput
                    value={formData.brandPrimaryColor}
                    onChange={(e) => setFormData({ ...formData, brandPrimaryColor: e.target.value })}
                  />
                </div>
              </Field>
              <Field label="SMS Sender ID" hint="Used for outbound SMS alerts">
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

          {/* ── Integration Credentials ── */}
          <LocalFormSection title="External Integrations" description="Credentials for Africa's Talking and M-Pesa">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <Field label="AT Username">
                <LocalTextInput value={formData.atUsername} onChange={(e) => setFormData({ ...formData, atUsername: e.target.value })} />
              </Field>
              <Field label="AT API Key">
                <LocalTextInput type="password" value={formData.atApiKey} onChange={(e) => setFormData({ ...formData, atApiKey: e.target.value })} />
              </Field>
              <Field label="M-Pesa Consumer Key">
                <LocalTextInput value={formData.darajaConsumerKey} onChange={(e) => setFormData({ ...formData, darajaConsumerKey: e.target.value })} />
              </Field>
              <Field label="M-Pesa Consumer Secret">
                <LocalTextInput type="password" value={formData.darajaConsumerSecret} onChange={(e) => setFormData({ ...formData, darajaConsumerSecret: e.target.value })} />
              </Field>
            </div>
          </LocalFormSection>
        </div>

        {/* ── Right Column ── */}
        <div className="space-y-6">
          <div className="rounded-lg bg-gray-900 p-6 text-white shadow-sm dark:bg-[#121212] dark:border dark:border-white/10">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-brand-400">Impact Zone</h3>
            <p className="mt-2 text-lg font-medium">Platform-Wide Rules</p>
            <p className="mt-2 text-sm leading-relaxed text-gray-400">
              Changes applied here immediately affect consumer behavior, point accrual, and redemption flows across all your branches and regions.
            </p>
            <div className="mt-6 pt-6 border-t border-white/10">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Tenant Slug:</span>
                <span className="font-mono text-brand-400">{tenantSlug}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
