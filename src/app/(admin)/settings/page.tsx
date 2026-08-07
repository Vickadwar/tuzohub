"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { authenticatedFetch, useApi } from "@/hooks/useApi";
import Checkbox from "@/components/form/input/Checkbox";
import IntegrationsManager from "@/components/admin/settings/IntegrationsManager";
import KenyaPhoneInput from "@/components/ui/KenyaPhoneInput";
import { useTenant } from "@/context/TenantContext";
import { resolveRewardTerminology } from "@/lib/rewardTerminology";

function SectionHeader({ icon, title, subtitle }: { icon: React.ReactNode; title: string; subtitle: string }) {
  return (
    <div className="flex items-center gap-3 border-b border-gray-200 dark:border-gray-800 pb-4 mb-6">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-800 text-brand-600 dark:text-brand-400 font-bold text-sm border border-gray-200 dark:border-gray-700 shadow-xs">
        {icon}
      </div>
      <div>
        <h2 className="text-base font-bold text-gray-900 dark:text-white">{title}</h2>
        <p className="text-xs text-gray-500 dark:text-gray-400">{subtitle}</p>
      </div>
    </div>
  );
}

function Field({ label, hint, action, className, children }: { label: string; hint?: React.ReactNode; action?: React.ReactNode; className?: string; children: React.ReactNode }) {
  return (
    <div className={`flex flex-col ${className || ""}`}>
      <div className="mb-1.5 flex items-center justify-between">
        <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200">{label}</label>
        {action && <div>{action}</div>}
      </div>
      {children}
      {hint && <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">{hint}</div>}
    </div>
  );
}

function LocalTextInput({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`h-10 w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3.5 text-sm font-medium text-gray-900 dark:text-white shadow-xs transition-all placeholder:text-gray-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 ${className || ""}`}
    />
  );
}

// Enhanced Brand Primary Color Picker
function EnhancedColorPicker({ value, onChange }: { value: string; onChange: (hex: string) => void }) {
  const presetSwatches = [
    { name: "Indigo", hex: "#4f46e5" },
    { name: "Emerald", hex: "#059669" },
    { name: "Sapphire", hex: "#0284c7" },
    { name: "Violet", hex: "#7c3aed" },
    { name: "Rose", hex: "#e11d48" },
    { name: "Amber", hex: "#d97706" },
    { name: "Obsidian", hex: "#18181b" },
  ];

  return (
    <div className="space-y-3">
      {/* Preset Brand Swatches */}
      <div className="flex flex-wrap items-center gap-2">
        {presetSwatches.map((swatch) => {
          const isSelected = value?.toLowerCase() === swatch.hex.toLowerCase();
          return (
            <button
              key={swatch.hex}
              type="button"
              onClick={() => onChange(swatch.hex)}
              className={`h-7 px-2.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition border ${isSelected
                  ? "border-gray-900 dark:border-white ring-2 ring-brand-500/40 text-gray-900 dark:text-white shadow-xs"
                  : "border-gray-200 dark:border-gray-700 hover:border-gray-300 text-gray-600 dark:text-gray-400"
                }`}
            >
              <span className="h-3.5 w-3.5 rounded-full border border-black/10 shadow-2xs" style={{ backgroundColor: swatch.hex }} />
              {swatch.name}
            </button>
          );
        })}
      </div>

      {/* Custom Color Input & Wheel */}
      <div className="flex items-center gap-3">
        <label
          className="relative flex h-10 w-10 shrink-0 cursor-pointer rounded-full border-2 border-white dark:border-gray-800 shadow-md ring-2 ring-gray-200 dark:ring-gray-700 transition-transform hover:scale-105 overflow-hidden items-center justify-center"
          style={{ backgroundColor: value || "#4f46e5" }}
          title="Click to select custom color"
        >
          <input
            type="color"
            value={value || "#4f46e5"}
            onChange={(e) => onChange(e.target.value)}
            className="absolute inset-0 h-full w-full opacity-0 cursor-pointer"
          />
        </label>
        <LocalTextInput
          type="text"
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder="#4f46e5"
          className="font-mono uppercase text-sm"
        />
      </div>
    </div>
  );
}

export default function PlatformSettingsPage() {
  const { tenant: contextTenant, settings: contextSettings, refreshTenant } = useTenant();

  // Real Database Overview Stats
  const { data: statsData } = useApi("/loyalty/stats/overview");

  const [tenantName, setTenantName] = useState("");
  const [tenantId, setTenantId] = useState("");
  const [tenantSlug, setTenantSlug] = useState("");
  const [countryDisplay, setCountryDisplay] = useState("");
  const [currencyDisplay, setCurrencyDisplay] = useState("");
  const [ussdStrategyDisplay, setUssdStrategyDisplay] = useState("DEFAULT");
  const [shortcodeDisplay, setShortcodeDisplay] = useState("*384*20#");
  const [isDedicatedDisplay, setIsDedicatedDisplay] = useState(false);

  const defaultFormValues = {
    defaultPointValue: "1.00",
    pointExpiryMonths: "12",

    // Promotional & Reward Model
    defaultRewardMode: "POINTS",
    rewardUnitLabel: "PTS",

    // Consumer Controls
    defaultCanPurchase: true,
    defaultCanEarnPoints: true,
    defaultCanRedeemPoints: true,
    defaultCanBankPoints: true,
    defaultCanTransferPoints: false,

    // Fraud & Security
    maxFailedRedemptionsPerHour: 5,
    requireMfaForRedemption: false,
    mfaHighValueThreshold: "5000",
    redemptionVelocityCheckMinutes: 60,
    maxPointsEarnedPerDay: "1000",

    // Branding
    brandPrimaryColor: "#4f46e5",
    brandLogoUrl: "",

    // Tenant Legal & Consumer T&Cs
    consumerTermsUrl: "",
    consumerTermsSummary: "",
    supportContactPhone: "",
    supportContactEmail: "",

    // Credentials
    credentials: {} as Record<string, any>,
  };

  const [formData, setFormData] = useState(defaultFormValues);
  const [initialFormData, setInitialFormData] = useState(defaultFormValues);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Check if form has unsaved changes (smart dirtiness check)
  const isDirty = useMemo(() => {
    return JSON.stringify(formData) !== JSON.stringify(initialFormData);
  }, [formData, initialFormData]);

  useEffect(() => {
    const load = async () => {
      try {
        const tenant = await authenticatedFetch("/api/tenants/me");

        if (tenant) {
          const s = tenant.settings || {};

          setTenantName(tenant.name || "Organization");
          setTenantId(tenant.id || "");
          setTenantSlug(tenant.slug || "");
          setCountryDisplay(tenant.countryName ? `${tenant.countryName}` : tenant.countryId || "Kenya");
          setCurrencyDisplay(tenant.baseCurrency ? `${tenant.baseCurrency} (${tenant.currencySymbol || ""})` : "KES");

          setUssdStrategyDisplay(s.ussdHandlerStrategy || (tenant.slug === "gamma-coatings" ? "GAMMA_COATINGS" : "DEFAULT"));
          setShortcodeDisplay(s.primaryShortcode || (s.credentials?.ussdServiceCode) || "Not Set");
          setIsDedicatedDisplay(s.isDedicatedShortcode ?? false);

          const loaded = {
            defaultPointValue: tenant.defaultPointValue || "1.00",
            pointExpiryMonths: String(tenant.pointExpiryMonths || 12),

            defaultRewardMode: s.defaultRewardMode || "POINTS",
            rewardUnitLabel: s.rewardUnitLabel || (s.defaultRewardMode === "INSTANT_CASHBACK" ? "KES" : "PTS"),

            defaultCanPurchase: s.defaultCanPurchase ?? true,
            defaultCanEarnPoints: s.defaultCanEarnPoints ?? true,
            defaultCanRedeemPoints: s.defaultCanRedeemPoints ?? true,
            defaultCanBankPoints: s.defaultCanBankPoints ?? true,
            defaultCanTransferPoints: s.defaultCanTransferPoints ?? false,

            maxFailedRedemptionsPerHour: s.maxFailedRedemptionsPerHour ?? 5,
            requireMfaForRedemption: s.requireMfaForRedemption ?? false,
            mfaHighValueThreshold: s.mfaHighValueThreshold || "5000",
            redemptionVelocityCheckMinutes: s.redemptionVelocityCheckMinutes ?? 60,
            maxPointsEarnedPerDay: s.maxPointsEarnedPerDay ?? "1000",

            brandPrimaryColor: s.brandPrimaryColor || "#4f46e5",
            brandLogoUrl: s.brandLogoUrl || "",

            consumerTermsUrl: s.consumerTermsUrl || "",
            consumerTermsSummary: s.consumerTermsSummary || "",
            supportContactPhone: s.supportContactPhone || tenant.phone || "",
            supportContactEmail: s.supportContactEmail || tenant.email || "",

            credentials: s.credentials || {},
          };

          setFormData(loaded);
          setInitialFormData(loaded);
        }
      } catch (err: any) {
        setError("Failed to load tenant configurations: " + (err.message || ""));
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!tenantSlug) {
      setError("Tenant record not loaded yet. Please wait.");
      return;
    }
    if (!isDirty) return;

    setIsSubmitting(true);
    setError("");
    setSuccess("");

    try {
      const payload = {
        defaultPointValue: formData.defaultPointValue,
        pointExpiryMonths: parseInt(formData.pointExpiryMonths) || 12,

        defaultRewardMode: formData.defaultRewardMode,
        rewardUnitLabel: formData.rewardUnitLabel,

        defaultCanPurchase: formData.defaultCanPurchase,
        defaultCanEarnPoints: formData.defaultCanEarnPoints,
        defaultCanRedeemPoints: formData.defaultCanRedeemPoints,
        defaultCanBankPoints: formData.defaultCanBankPoints,
        defaultCanTransferPoints: formData.defaultCanTransferPoints,

        maxFailedRedemptionsPerHour: formData.maxFailedRedemptionsPerHour,
        requireMfaForRedemption: formData.requireMfaForRedemption,
        mfaHighValueThreshold: formData.mfaHighValueThreshold,
        redemptionVelocityCheckMinutes: formData.redemptionVelocityCheckMinutes,
        maxPointsEarnedPerDay: formData.maxPointsEarnedPerDay,

        brandPrimaryColor: formData.brandPrimaryColor,
        brandLogoUrl: formData.brandLogoUrl,

        consumerTermsUrl: formData.consumerTermsUrl,
        consumerTermsSummary: formData.consumerTermsSummary,
        supportContactPhone: formData.supportContactPhone,
        supportContactEmail: formData.supportContactEmail,

        credentials: formData.credentials || {},
      };

      await authenticatedFetch(`/api/tenants/${tenantSlug}/settings`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });

      setSuccess("Platform settings saved successfully!");
      setInitialFormData(formData);
      refreshTenant();
    } catch (err: any) {
      setError(err.message || "Network error occurred while saving.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelChanges = () => {
    setFormData(initialFormData);
    setError("");
    setSuccess("Unsaved changes discarded.");
  };

  const handleSelectRewardMode = (modeId: string, defaultUnit: string) => {
    const isInstant = modeId === "INSTANT_CASHBACK" || modeId === "INSTANT_AIRTIME";
    setFormData({
      ...formData,
      defaultRewardMode: modeId,
      rewardUnitLabel: defaultUnit,
      defaultCanTransferPoints: isInstant ? false : formData.defaultCanTransferPoints,
      defaultCanBankPoints: isInstant ? false : formData.defaultCanBankPoints,
    });
  };

  const previewTerminology = resolveRewardTerminology({
    tenantSettings: {
      defaultRewardMode: formData.defaultRewardMode,
      rewardUnitLabel: formData.rewardUnitLabel,
    },
  });

  const getFriendlyRewardModeLabel = (mode: string) => {
    switch (mode) {
      case "INSTANT_CASHBACK":
        return "Instant Cashback";
      case "INSTANT_AIRTIME":
        return "Instant Airtime";
      case "HYBRID":
        return "Hybrid Engine";
      case "POINTS":
      default:
        return "Points Accumulation";
    }
  };

  const getDailyCapLabel = () => {
    switch (formData.defaultRewardMode) {
      case "INSTANT_CASHBACK":
        return `Max cashback earned per day (${formData.rewardUnitLabel || "KES"})`;
      case "INSTANT_AIRTIME":
        return `Max airtime earned per day (${formData.rewardUnitLabel || "Airtime"})`;
      case "HYBRID":
        return `Max rewards earned per day (${formData.rewardUnitLabel || "PTS / KES"})`;
      case "POINTS":
      default:
        return `Max points earned per day (${formData.rewardUnitLabel || "PTS"})`;
    }
  };

  const getDailyCapHint = () => {
    switch (formData.defaultRewardMode) {
      case "INSTANT_CASHBACK":
        return "Cap instant cash payouts per consumer in a 24-hour period";
      case "INSTANT_AIRTIME":
        return "Cap instant airtime top-ups per consumer in a 24-hour period";
      case "HYBRID":
        return "Cap combined points and instant dispatches per consumer in 24 hours";
      case "POINTS":
      default:
        return "Cap points earned per consumer in a 24-hour period";
    }
  };

  const isInstantMode = formData.defaultRewardMode === "INSTANT_CASHBACK" || formData.defaultRewardMode === "INSTANT_AIRTIME";

  const featureRulesList = [
    {
      key: "defaultCanPurchase",
      title: "Product purchasing",
      desc: "Consumers can purchase catalog items",
      disabled: false,
      badge: null,
    },
    {
      key: "defaultCanEarnPoints",
      title: formData.defaultRewardMode === "INSTANT_CASHBACK"
        ? "Instant cashback qualification"
        : formData.defaultRewardMode === "INSTANT_AIRTIME"
          ? "Instant airtime qualification"
          : "Point earning",
      desc: isInstantMode
        ? "Consumers qualify for instant dispatches upon scan/activity"
        : "Consumers earn points via scans or purchases",
      disabled: false,
      badge: null,
    },
    {
      key: "defaultCanRedeemPoints",
      title: formData.defaultRewardMode === "INSTANT_CASHBACK"
        ? "Direct M-Pesa disbursement"
        : formData.defaultRewardMode === "INSTANT_AIRTIME"
          ? "Direct airtime disbursement"
          : "Point redemption",
      desc: isInstantMode
        ? "Automated instant disbursements to consumer phone"
        : "Consumers can redeem points for catalog vouchers",
      disabled: false,
      badge: null,
    },
    {
      key: "defaultCanBankPoints",
      title: "Point banking",
      desc: isInstantMode
        ? "Instant dispatches bypass wallet banking"
        : "Allow points to roll over safely in consumer wallet",
      disabled: isInstantMode,
      badge: isInstantMode ? "Direct dispatches" : null,
    },
    {
      key: "defaultCanTransferPoints",
      title: "Peer point transfer",
      desc: isInstantMode
        ? "Peer point transfer unavailable for instant payout modes"
        : "Allow transferring points between consumer accounts",
      disabled: isInstantMode,
      badge: isInstantMode ? "Not applicable" : null,
    },
  ];

  // Real Database Numbers from statsData
  const activeBalanceNum = statsData?.overview?.totalPointsIssued ?? statsData?.totalPoints ?? 0;
  const totalEarnedNum = statsData?.overview?.totalPointsEarned ?? statsData?.earned ?? 0;
  const totalRedeemedNum = statsData?.overview?.totalPointsRedeemed ?? statsData?.redeemed ?? 0;

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
        <div className="h-10 w-10 animate-spin rounded-full border-3 border-brand-500 border-t-transparent" />
        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Loading platform settings...</p>
      </div>
    );
  }

  const rewardModes = [
    {
      id: "POINTS",
      title: "Points Accumulation",
      badge: "Loyalty engine",
      defaultUnit: "PTS",
      svgIcon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      desc: "Consumers earn points per scan or purchase, bank them in their wallet, and redeem against reward catalog items.",
    },
    {
      id: "INSTANT_CASHBACK",
      title: "Instant Cashback",
      badge: "Instant payout",
      defaultUnit: "KES",
      svgIcon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      desc: "Consumers scan or qualify and instantly receive direct Safaricom M-Pesa cash dispatches sent to their phone.",
    },
    {
      id: "INSTANT_AIRTIME",
      title: "Instant Airtime",
      badge: "Telco top-up",
      defaultUnit: "Airtime",
      svgIcon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      ),
      desc: "Consumers receive direct telco airtime recharges immediately upon promotional scan or activity qualification.",
    },
    {
      id: "HYBRID",
      title: "Hybrid Engine",
      badge: "Combined engine",
      defaultUnit: "PTS / KES",
      svgIcon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
      ),
      desc: "Supports both points accumulation and instant cash/airtime disbursements simultaneously based on campaign rules.",
    },
  ];

  return (
    <div className="w-full space-y-6 animate-fadeIn pb-20">
      {/* ── Header ────────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 dark:border-gray-800 pb-5">
        <div className="flex items-center gap-3.5">
          <Link
            href="/overview"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-600 dark:text-gray-300 shadow-xs"
          >
            <svg className="h-4.5 w-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </Link>

          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                Platform settings
              </h1>
              <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400 text-xs font-bold border border-brand-500/20">
                <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse" />
                {tenantName}
              </span>
            </div>
            <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
              Manage organization rules, promotional models, branding assets, and security controls.
            </p>
          </div>
        </div>

        {/* ── Action Buttons with Cancel / Discard & Save ── */}
        <div className="flex items-center gap-3">
          {isDirty && (
            <>
              <button
                type="button"
                onClick={handleCancelChanges}
                disabled={isSubmitting}
                className="px-4 py-2 text-xs font-semibold rounded-xl border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
              >
                Cancel / Discard
              </button>
              <span className="text-xs font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-1.5 animate-pulse hidden sm:flex">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                Unsaved changes
              </span>
            </>
          )}

          <button
            onClick={() => handleSubmit()}
            disabled={!isDirty || isSubmitting}
            className={`px-5 py-2.5 text-xs font-bold rounded-xl transition flex items-center gap-2 ${isDirty && !isSubmitting
                ? "bg-brand-600 hover:bg-brand-700 text-white shadow-md ring-2 ring-brand-500/30 cursor-pointer"
                : "bg-gray-200 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed border border-gray-300 dark:border-gray-700"
              }`}
          >
            {isSubmitting ? (
              <>
                <svg className="w-4 h-4 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Saving settings...
              </>
            ) : isDirty ? (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
                Save settings
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                Settings saved
              </>
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-sm font-semibold flex items-center gap-2">
          <svg className="w-4.5 h-4.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          {error}
        </div>
      )}

      {success && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-sm font-semibold flex items-center gap-2">
          <svg className="w-4.5 h-4.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
          {success}
        </div>
      )}

      <div className="grid grid-cols-12 gap-6">

        {/* Main Settings Column (8 Columns) */}
        <div className="col-span-12 xl:col-span-8 space-y-6">

          {/* ── 1. Organization Identity ── */}
          <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-xs">
            <SectionHeader
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5m3 0v-4a1 1 0 011-1h2a1 1 0 011 1v4m-4 0h4" />
                </svg>
              }
              title="Organization identity & territory"
              subtitle="Core details established during onboarding (Protected & Read-Only)"
            />

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
              <Field
                label="Organization name"
                hint="Established on registration"
                action={<span className="text-xs font-semibold text-gray-400 dark:text-gray-500">🔒 Protected</span>}
              >
                <div className="h-10 w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-100 dark:bg-gray-800/60 px-3.5 flex items-center text-sm font-semibold text-gray-700 dark:text-gray-300 cursor-not-allowed">
                  {tenantName}
                </div>
              </Field>

              <Field
                label="Operating country"
                hint="Primary region"
                action={<span className="text-xs font-semibold text-gray-400 dark:text-gray-500">🔒 Protected</span>}
              >
                <div className="h-10 w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-100 dark:bg-gray-800/60 px-3.5 flex items-center text-sm font-semibold text-gray-700 dark:text-gray-300 cursor-not-allowed">
                  {countryDisplay}
                </div>
              </Field>

              <Field
                label="Base currency"
                hint="Settlement currency"
                action={<span className="text-xs font-semibold text-gray-400 dark:text-gray-500">🔒 Protected</span>}
              >
                <div className="h-10 w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-100 dark:bg-gray-800/60 px-3.5 flex items-center text-sm font-semibold text-gray-700 dark:text-gray-300 cursor-not-allowed">
                  {currencyDisplay}
                </div>
              </Field>
            </div>

            {/* Telco USSD Allocation Sub-card */}
            <div className="mt-5 pt-5 border-t border-gray-200 dark:border-gray-800">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <svg className="w-4 h-4 text-brand-600 dark:text-brand-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  Allocated telco shortcode & USSD strategy
                </h3>
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                  🔒 Managed by Platform Owner
                </span>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="p-3.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/40">
                  <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 block mb-0.5">Assigned Shortcode</span>
                  <span className="font-mono text-sm font-bold text-brand-600 dark:text-brand-400">
                    {shortcodeDisplay}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/40">
                  <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 block mb-0.5">USSD Strategy Handler</span>
                  <span className="text-xs font-bold text-gray-800 dark:text-gray-200">
                    {ussdStrategyDisplay === "GAMMA_COATINGS" ? "Gamma Coatings Enterprise Flow" : "Standard Modular Engine"}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/40">
                  <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 block mb-0.5">Channel Allocation</span>
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    {isDedicatedDisplay ? "Dedicated Shortcode" : "Shared Aggregator Channel"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ── 2. Promotional & Reward Engine Model ── */}
          <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-xs">
            <SectionHeader
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5a2 2 0 10-2 2h2zm0 13C10.832 21 2 20 2 12V8a2 2 0 012-2h16a2 2 0 012 2v4c0 8-8.832 9-10 9z" />
                </svg>
              }
              title="Promotional & reward engine model"
              subtitle="Select how consumer profiles, reward balances, and payouts display across the platform"
            />

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2.5">
                  Default reward engine mode
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {rewardModes.map((mode) => {
                    const isSelected = formData.defaultRewardMode === mode.id;
                    return (
                      <div
                        key={mode.id}
                        onClick={() => handleSelectRewardMode(mode.id, mode.defaultUnit)}
                        className={`p-4 rounded-xl border cursor-pointer transition-all flex items-start gap-3.5 ${isSelected
                            ? "border-brand-600 bg-brand-50/40 dark:bg-brand-950/20 ring-1 ring-brand-500/20"
                            : "border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800/40 hover:border-gray-300 dark:hover:border-gray-700"
                          }`}
                      >
                        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${isSelected
                            ? "bg-brand-600 text-white"
                            : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                          }`}>
                          {mode.svgIcon}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-bold text-gray-900 dark:text-white">
                              {mode.title}
                            </span>
                            <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${isSelected ? "bg-brand-600 text-white" : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                              }`}>
                              {mode.badge}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                            {mode.desc}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 pt-4 border-t border-gray-200 dark:border-gray-800">
                <Field label="Reward unit symbol" hint="Displayed on balance cards (e.g. PTS, KES, Airtime)">
                  <LocalTextInput
                    type="text"
                    value={formData.rewardUnitLabel}
                    onChange={(e) => setFormData({ ...formData, rewardUnitLabel: e.target.value })}
                    placeholder="PTS"
                  />
                </Field>

                <Field label="Default point value (KES)" hint="Fiat value equivalent per point">
                  <LocalTextInput
                    type="number"
                    step="0.01"
                    value={formData.defaultPointValue}
                    onChange={(e) => setFormData({ ...formData, defaultPointValue: e.target.value })}
                  />
                </Field>

                <Field label="Point expiry (months)" hint="Expiration window for points">
                  <LocalTextInput
                    type="number"
                    value={formData.pointExpiryMonths}
                    onChange={(e) => setFormData({ ...formData, pointExpiryMonths: e.target.value })}
                  />
                </Field>
              </div>
            </div>
          </div>

          {/* ── 3. Consumer Feature Rules ── */}
          <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-xs">
            <SectionHeader
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                </svg>
              }
              title="Consumer feature rules"
              subtitle="Enable or restrict consumer capabilities based on active reward engine"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {featureRulesList.map((item) => (
                <div
                  key={item.key}
                  className={`flex items-center justify-between p-4 rounded-xl border transition-all ${item.disabled
                      ? "border-gray-200 dark:border-gray-800 bg-gray-100/60 dark:bg-gray-800/20 opacity-60 cursor-not-allowed"
                      : "border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30"
                    }`}
                >
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="text-sm font-bold text-gray-900 dark:text-white">{item.title}</p>
                      {item.badge && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                          {item.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{item.desc}</p>
                  </div>
                  <Checkbox
                    checked={item.disabled ? false : (formData as any)[item.key]}
                    onChange={(val) => !item.disabled && setFormData({ ...formData, [item.key]: val })}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* ── 4. Fraud & Security Controls ── */}
          <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-xs">
            <SectionHeader
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              }
              title="Security & anti-fraud controls"
              subtitle="Velocity safeguards and rate-limiting thresholds"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Field label="Max failed redemptions per hour" hint="Blocks suspected brute-force attempts">
                <LocalTextInput
                  type="number"
                  value={formData.maxFailedRedemptionsPerHour}
                  onChange={(e) => setFormData({ ...formData, maxFailedRedemptionsPerHour: parseInt(e.target.value) || 5 })}
                />
              </Field>

              <Field label="Velocity check window (minutes)" hint="Window for duplicate scan checks">
                <LocalTextInput
                  type="number"
                  value={formData.redemptionVelocityCheckMinutes}
                  onChange={(e) => setFormData({ ...formData, redemptionVelocityCheckMinutes: parseInt(e.target.value) || 60 })}
                />
              </Field>

              {/* Dynamic Daily Cap Field */}
              <Field label={getDailyCapLabel()} hint={getDailyCapHint()}>
                <LocalTextInput
                  type="number"
                  value={formData.maxPointsEarnedPerDay}
                  onChange={(e) => setFormData({ ...formData, maxPointsEarnedPerDay: e.target.value })}
                />
              </Field>

              {/* High Value MFA Controls */}
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30">
                  <div>
                    <p className="text-sm font-bold text-gray-900 dark:text-white">Require MFA for high-value payouts</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">OTP verification for large disbursements</p>
                  </div>
                  <Checkbox
                    checked={formData.requireMfaForRedemption}
                    onChange={(val) => setFormData({ ...formData, requireMfaForRedemption: val })}
                  />
                </div>

                {formData.requireMfaForRedemption && (
                  <Field
                    label="High-value payout MFA threshold (KES)"
                    hint="Disbursements exceeding this amount will require OTP verification"
                  >
                    <LocalTextInput
                      type="number"
                      value={formData.mfaHighValueThreshold}
                      onChange={(e) => setFormData({ ...formData, mfaHighValueThreshold: e.target.value })}
                      placeholder="5000"
                    />
                  </Field>
                )}
              </div>
            </div>
          </div>

          {/* ── 5. Integrations & Credentials ── */}
          <IntegrationsManager
            credentials={formData.credentials}
            onChange={(creds: Record<string, any>) => setFormData({ ...formData, credentials: creds })}
            tenantId={tenantId || contextTenant?.id}
            tenantSlug={tenantSlug || contextTenant?.slug}
          />

        </div>

        {/* Right Preview Column (4 Columns) */}
        <div className="col-span-12 xl:col-span-4 space-y-6">

          {/* Live Database Terminology Preview Widget */}
          <div className="rounded-2xl border border-brand-500/20 bg-brand-50/30 dark:bg-brand-950/10 p-6 shadow-xs sticky top-6">
            <SectionHeader
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              }
              title="Live database terminology preview"
              subtitle="Real-time preview rendered using actual database stats"
            />

            <div className="space-y-4">
              <div className="p-4.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-xs space-y-3.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                    {previewTerminology.balanceHeader}
                  </span>
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/20">
                    {getFriendlyRewardModeLabel(previewTerminology.rewardMode)}
                  </span>
                </div>

                <div className="text-2xl font-bold font-mono text-gray-900 dark:text-white">
                  {Number(activeBalanceNum).toLocaleString()}{" "}
                  <span className="text-xs font-semibold text-brand-600 dark:text-brand-400">
                    {previewTerminology.unitLabel}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-3 border-t border-gray-100 dark:border-gray-700/50 text-xs">
                  <div>
                    <span className="text-gray-400 block font-medium">{previewTerminology.actionEarnLabel}</span>
                    <span className="font-bold text-gray-900 dark:text-white">
                      +{Number(totalEarnedNum).toLocaleString()} {previewTerminology.unitLabel}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400 block font-medium">{previewTerminology.actionRedeemLabel}</span>
                    <span className="font-bold text-gray-900 dark:text-white">
                      -{Number(totalRedeemedNum).toLocaleString()} {previewTerminology.unitLabel}
                    </span>
                  </div>
                </div>
              </div>

              {/* Branding Assets inside sidebar card with Enhanced Color Picker */}
              <div className="p-4.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-xs space-y-4">
                <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                  Brand theme & logo
                </h3>

                <Field label="Brand primary color" hint="Applies tenant theme color across all inner pages">
                  <EnhancedColorPicker
                    value={formData.brandPrimaryColor}
                    onChange={(hex) => setFormData({ ...formData, brandPrimaryColor: hex })}
                  />
                </Field>

                <Field label="Brand logo image URL">
                  <LocalTextInput
                    type="text"
                    value={formData.brandLogoUrl}
                    onChange={(e) => setFormData({ ...formData, brandLogoUrl: e.target.value })}
                    placeholder="https://example.com/logo.png"
                  />
                </Field>

                {formData.brandLogoUrl && (
                  <div className="p-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 flex items-center justify-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={formData.brandLogoUrl} alt="Brand logo preview" className="max-h-12 object-contain" />
                  </div>
                )}
              </div>

              {/* Support & Legal Details with KenyaPhoneInput */}
              <div className="p-4.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-xs space-y-4">
                <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                  Legal & support contacts
                </h3>

                <Field label="Support email">
                  <LocalTextInput
                    type="email"
                    value={formData.supportContactEmail}
                    onChange={(e) => setFormData({ ...formData, supportContactEmail: e.target.value })}
                    placeholder="support@tenant.com"
                  />
                </Field>

                <Field label="Support phone number" hint="Official helpline contact">
                  <KenyaPhoneInput
                    value={formData.supportContactPhone}
                    onChange={(val) => setFormData({ ...formData, supportContactPhone: val })}
                    placeholder="7XX XXX XXX"
                    size="md"
                  />
                </Field>

                <Field label="Terms & conditions URL">
                  <LocalTextInput
                    type="text"
                    value={formData.consumerTermsUrl}
                    onChange={(e) => setFormData({ ...formData, consumerTermsUrl: e.target.value })}
                    placeholder="https://tenant.com/terms"
                  />
                </Field>
              </div>

            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
