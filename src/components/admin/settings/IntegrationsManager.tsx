"use client";

import React, { useState } from "react";

export interface IntegrationsManagerProps {
  credentials: Record<string, any>;
  onChange: (updated: Record<string, any>) => void;
  tenantId?: string;
  tenantSlug?: string;
}

function SecretInput({
  value,
  onChange,
  placeholder,
  multiline = false,
  rows = 4,
}: {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  multiline?: boolean;
  rows?: number;
}) {
  const [show, setShow] = useState(false);

  if (multiline) {
    return (
      <div className="relative">
        <textarea
          rows={rows}
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 p-3.5 text-sm font-medium text-gray-900 dark:text-white shadow-xs transition-colors placeholder:text-gray-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
        />
      </div>
    );
  }

  return (
    <div className="relative flex items-center">
      <input
        type={show ? "text" : "password"}
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || "••••••••••••••••••••••••"}
        className="h-10 w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 pl-3.5 pr-10 font-mono text-sm text-gray-900 dark:text-white shadow-xs transition-colors placeholder:text-gray-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
      />
      <button
        type="button"
        onClick={() => setShow(!show)}
        className="absolute right-3 rounded p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
        title={show ? "Hide secret" : "Show secret"}
      >
        {show ? (
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
          </svg>
        ) : (
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
        )}
      </button>
    </div>
  );
}

function TextInput({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
}) {
  return (
    <input
      type="text"
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="h-10 w-full rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 px-3.5 text-sm font-medium text-gray-900 dark:text-white shadow-xs transition-colors placeholder:text-gray-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
    />
  );
}

function Field({ label, hint, action, children }: { label: string; hint?: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex flex-col">
      <div className="mb-1.5 flex items-center justify-between">
        <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200">{label}</label>
        {action && <div>{action}</div>}
      </div>
      {children}
      {hint && <span className="mt-1 text-xs text-gray-500 dark:text-gray-400">{hint}</span>}
    </div>
  );
}

function CopyBox({ label, url }: { label: string; url: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-800/40">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">{label}</span>
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1 text-xs font-medium text-gray-700 shadow-xs hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
        >
          {copied ? (
            <>
              <svg className="h-3.5 w-3.5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-emerald-600 dark:text-emerald-400">Copied!</span>
            </>
          ) : (
            <>
              <svg className="h-3.5 w-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Copy URL
            </>
          )}
        </button>
      </div>
      <div className="mt-2 font-mono text-xs text-gray-800 break-all dark:text-gray-200">{url}</div>
    </div>
  );
}

export default function IntegrationsManager({
  credentials,
  onChange,
  tenantId,
  tenantSlug,
}: IntegrationsManagerProps) {
  const [activeTab, setActiveTab] = useState<"sms" | "ussd" | "payout" | "webhooks">("sms");
  const [testingDaraja, setTestingDaraja] = useState(false);
  const [darajaTestResult, setDarajaTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const darajaEnv = credentials.darajaEnv || "sandbox";

  const updateField = (key: string, val: any) => {
    onChange({
      ...credentials,
      [key]: val,
    });
  };

  const handleTestDaraja = async () => {
    setTestingDaraja(true);
    setDarajaTestResult(null);
    try {
      const res = await fetch("/api/mpesa/test-connection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          consumerKey: credentials.darajaConsumerKey,
          consumerSecret: credentials.darajaConsumerSecret,
          baseUrl: credentials.darajaBaseUrl || (darajaEnv === "production" ? "https://api.safaricom.co.ke" : "https://sandbox.safaricom.co.ke"),
        }),
      });
      const data = await res.json();
      if (data.success) {
        setDarajaTestResult({ success: true, message: data.message || "Connection successful!" });
      } else {
        setDarajaTestResult({ success: false, message: data.error || "Connection failed" });
      }
    } catch (err: any) {
      setDarajaTestResult({ success: false, message: err.message || "Network error" });
    } finally {
      setTestingDaraja(false);
    }
  };

  const smsProviderKey = (credentials.smsProvider || "custom").toLowerCase();
  const ussdProviderKey = (credentials.ussdProvider || "custom").toLowerCase();
  const payoutProviderKey = (credentials.payoutProvider || "daraja").toLowerCase();

  const getSmsLabel = (key: string) => {
    if (key === "africastalking") return "Africa's Talking SMS";
    if (key === "bongasms") return "Olive Tree Media (BongaSMS)";
    return "Custom Gateway (SMS)";
  };

  const getUssdLabel = (key: string) => {
    if (key === "africastalking") return "Africa's Talking USSD";
    if (key === "bongasms") return "Olive Tree Media (BongaSMS USSD)";
    return "Custom Gateway (USSD)";
  };

  const getPayoutLabel = (key: string) => {
    if (key === "jenga") return "Equity Bank (Jenga API v3)";
    if (key === "webhook") return "Generic Partner Webhook";
    return "Safaricom M-Pesa (Daraja B2C)";
  };

  const [origin, setOrigin] = useState("http://localhost:3000");

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      setOrigin(window.location.origin);
    }
  }, []);

  const tidParam = tenantId || tenantSlug || "your-tenant-id";

  return (
    <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-xs">
      {/* ── Header ── */}
      <div className="border-b border-gray-200 dark:border-gray-800 px-6 py-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold text-sm border border-gray-200 dark:border-gray-700 shadow-xs">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 4a2 2 0 114 0v1a2 2 0 002 2h1a2 2 0 110 4h-1a2 2 0 00-2 2v1a2 2 0 11-4 0v-1a2 2 0 00-2-2H7a2 2 0 110-4h1a2 2 0 002-2V4z" />
              </svg>
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900 dark:text-white">Enterprise integrations & API credentials</h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Configure provider-agnostic gateways for messaging, USSD menus, and financial payouts.
              </p>
            </div>
          </div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 dark:bg-gray-800 px-3 py-1 text-xs font-semibold text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700">
            Assigned Gateways
          </div>
        </div>

        {/* ── Tabs ── */}
        <div className="mt-5 flex flex-wrap gap-2 border-b border-gray-200 dark:border-gray-800 pb-px">
          {[
            {
              id: "sms", label: "SMS & Messaging", icon: (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              )
            },
            {
              id: "ussd", label: "USSD Gateway", icon: (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              )
            },
            {
              id: "payout", label: "Financial Payouts", icon: (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a2 2 0 002-2V7a2 2 0 00-2-2H6a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              )
            },
            {
              id: "webhooks", label: "Webhook Endpoints", icon: (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
              )
            },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 border-b-2 px-3.5 py-2 text-xs font-semibold transition-colors ${isActive
                    ? "border-brand-600 text-brand-600 dark:border-brand-400 dark:text-brand-400"
                    : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Body ── */}
      <div className="p-6">
        {/* ── 1. SMS & MESSAGING TAB ── */}
        {activeTab === "sms" && (
          <div className="space-y-6">
            <div className="max-w-md">
              <Field
                label="Active messaging provider"
                hint="Assigned by Platform Owner (Super Admin)"
                action={<span className="text-xs font-semibold text-gray-400 dark:text-gray-500">🔒 Managed by Platform Owner</span>}
              >
                <div className="h-10 w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-100 dark:bg-gray-800/60 px-3.5 flex items-center text-sm font-semibold text-gray-700 dark:text-gray-300 cursor-not-allowed">
                  {getSmsLabel(smsProviderKey)}
                </div>
              </Field>
            </div>

            <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30 p-5">
              {smsProviderKey === "africastalking" ? (
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <Field label="AT username" hint="Your Africa's Talking username">
                    <TextInput
                      value={credentials.atUsername || ""}
                      onChange={(val) => updateField("atUsername", val)}
                      placeholder="sandbox"
                    />
                  </Field>
                  <Field label="AT sender ID / short code" hint="Sender ID registered with telcos">
                    <TextInput
                      value={credentials.atSenderId || ""}
                      onChange={(val) => updateField("atSenderId", val)}
                      placeholder="TUZOHUB"
                    />
                  </Field>
                  <div className="col-span-1 sm:col-span-2">
                    <Field label="AT API key" hint="API key generated from Africa's Talking dashboard">
                      <SecretInput
                        value={credentials.atApiKey || ""}
                        onChange={(val) => updateField("atApiKey", val)}
                        placeholder="atsk_..."
                      />
                    </Field>
                  </div>
                </div>
              ) : smsProviderKey === "bongasms" ? (
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <Field label="BongaSMS API Key" hint="API Key issued by Olive Tree Media / BongaSMS">
                    <SecretInput
                      value={credentials.bongaApiKey || ""}
                      onChange={(val) => updateField("bongaApiKey", val)}
                      placeholder="bonga_api_..."
                    />
                  </Field>
                  <Field label="BongaSMS API Secret" hint="API Secret issued by Olive Tree Media">
                    <SecretInput
                      value={credentials.bongaApiSecret || ""}
                      onChange={(val) => updateField("bongaApiSecret", val)}
                      placeholder="bonga_secret_..."
                    />
                  </Field>
                  <Field label="BongaSMS Client ID" hint="Client account ID (apiClientID)">
                    <TextInput
                      value={credentials.bongaClientId || ""}
                      onChange={(val) => updateField("bongaClientId", val)}
                      placeholder="client_123"
                    />
                  </Field>
                  <Field label="BongaSMS Service ID" hint="Bulk SMS Service ID (default: 1)">
                    <TextInput
                      value={credentials.bongaServiceId || ""}
                      onChange={(val) => updateField("bongaServiceId", val)}
                      placeholder="1"
                    />
                  </Field>
                  <Field label="Sender ID / Shortcode" hint="Registered Alpha-Numeric Sender ID">
                    <TextInput
                      value={credentials.bongaSenderId || ""}
                      onChange={(val) => updateField("bongaSenderId", val)}
                      placeholder="TUZOHUB"
                    />
                  </Field>
                </div>
              ) : (
                <div className="space-y-4">
                  <Field label="Custom SMS Endpoint URL">
                    <TextInput
                      value={credentials.customSmsUrl || ""}
                      onChange={(val) => updateField("customSmsUrl", val)}
                      placeholder="https://api.yourprovider.com/sms/send"
                    />
                  </Field>
                  <Field label="API Key / Auth Header">
                    <SecretInput
                      value={credentials.customSmsKey || ""}
                      onChange={(val) => updateField("customSmsKey", val)}
                      placeholder="Bearer token or API key"
                    />
                  </Field>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── 2. USSD GATEWAY TAB ── */}
        {activeTab === "ussd" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Field
                label="Active USSD gateway provider"
                hint="Assigned by Platform Owner (Super Admin)"
                action={<span className="text-xs font-semibold text-gray-400 dark:text-gray-500">🔒 Managed by Platform Owner</span>}
              >
                <div className="h-10 w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-100 dark:bg-gray-800/60 px-3.5 flex items-center text-sm font-semibold text-gray-700 dark:text-gray-300 cursor-not-allowed">
                  {getUssdLabel(ussdProviderKey)}
                </div>
              </Field>

              <Field
                label="USSD Engine Strategy"
                hint="Assigned by Platform Owner (Super Admin)"
                action={<span className="text-xs font-semibold text-gray-400 dark:text-gray-500">🔒 Managed by Platform Owner</span>}
              >
                <div className="h-10 w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-100 dark:bg-gray-800/60 px-3.5 flex items-center text-sm font-semibold text-gray-700 dark:text-gray-300 cursor-not-allowed">
                  {(credentials.ussdHandlerStrategy === "GAMMA_COATINGS" || credentials.ussdHandlerStrategy === "GAMMA")
                    ? "Gamma Coatings Custom Flow (GammaUssdService)"
                    : "Standard Universal Modular Engine"}
                </div>
              </Field>
            </div>

            <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30 p-5 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <Field label="USSD Primary Shortcode" hint="Telco assigned code (e.g. *384*20# or *789#)">
                  <TextInput
                    value={credentials.ussdServiceCode || ""}
                    onChange={(val) => updateField("ussdServiceCode", val)}
                    placeholder="*384*20#"
                  />
                </Field>

                <Field label="Shared Sub-Prefix (Optional)" hint="For shared shortcodes (e.g. *384*20*10#)">
                  <TextInput
                    value={credentials.sharedSubPrefix || ""}
                    onChange={(val) => updateField("sharedSubPrefix", val)}
                    placeholder="*384*20*10#"
                  />
                </Field>
              </div>

              <Field label="USSD Welcome Greeting Text" hint="First header line displayed when consumers dial shortcode">
                <TextInput
                  value={credentials.ussdGreeting || ""}
                  onChange={(val) => updateField("ussdGreeting", val)}
                  placeholder="Welcome to TuZo Rewards!"
                />
              </Field>

              <CopyBox
                label="USSD Session Callback Webhook URL (Configure in Telco Portal)"
                url={`${origin}/api/ussd/callback?tenantId=${tidParam}`}
              />
            </div>
          </div>
        )}

        {/* ── 3. FINANCIAL PAYOUTS TAB ── */}
        {activeTab === "payout" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Field
                label="Active payout provider"
                hint="Assigned by Platform Owner (Super Admin)"
                action={<span className="text-xs font-semibold text-gray-400 dark:text-gray-500">🔒 Managed by Platform Owner</span>}
              >
                <div className="h-10 w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-100 dark:bg-gray-800/60 px-3.5 flex items-center text-sm font-semibold text-gray-700 dark:text-gray-300 cursor-not-allowed">
                  {getPayoutLabel(payoutProviderKey)}
                </div>
              </Field>

              {/* Environment Selector Switcher */}
              <Field label="Environment Target Mode" hint="Switch between Safaricom Sandbox staging & Live production">
                <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                  <button
                    type="button"
                    onClick={() => {
                      onChange({
                        ...credentials,
                        darajaEnv: "sandbox",
                        darajaBaseUrl: "https://sandbox.safaricom.co.ke",
                      });
                    }}
                    className={`h-8 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${darajaEnv === "sandbox"
                        ? "bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-xs border border-gray-300 dark:border-gray-600"
                        : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                      }`}
                  >
                    Sandbox Mode
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      onChange({
                        ...credentials,
                        darajaEnv: "production",
                        darajaBaseUrl: "https://api.safaricom.co.ke",
                      });
                    }}
                    className={`h-8 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${darajaEnv === "production"
                        ? "bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-xs border border-gray-300 dark:border-gray-600"
                        : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                      }`}
                  >
                    Production Live
                  </button>
                </div>
              </Field>
            </div>

            <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30 p-5 space-y-5">
              {payoutProviderKey === "daraja" ? (
                <>
                  <div className="flex items-center justify-between p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-xs font-semibold text-gray-800 dark:text-gray-200">
                    <span>
                      Target API Base URL ({darajaEnv === "production" ? "Production Live" : "Sandbox Staging"}):
                    </span>
                    <span className="font-mono text-[11px] font-bold text-gray-900 dark:text-white">
                      {credentials.darajaBaseUrl || (darajaEnv === "production" ? "https://api.safaricom.co.ke" : "https://sandbox.safaricom.co.ke")}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <Field
                      label={`Daraja Consumer Key (${darajaEnv === "production" ? "Production" : "Sandbox"})`}
                      hint={darajaEnv === "production" ? "Live production consumer key from Safaricom Daraja portal" : "Sandbox test consumer key"}
                    >
                      <SecretInput
                        value={credentials.darajaConsumerKey || ""}
                        onChange={(val) => updateField("darajaConsumerKey", val)}
                        placeholder={darajaEnv === "production" ? "Live consumer key" : "Sandbox consumer key"}
                      />
                    </Field>

                    <Field
                      label={`Daraja Consumer Secret (${darajaEnv === "production" ? "Production" : "Sandbox"})`}
                      hint={darajaEnv === "production" ? "Live production consumer secret" : "Sandbox test consumer secret"}
                    >
                      <SecretInput
                        value={credentials.darajaConsumerSecret || ""}
                        onChange={(val) => updateField("darajaConsumerSecret", val)}
                        placeholder={darajaEnv === "production" ? "Live consumer secret" : "Sandbox consumer secret"}
                      />
                    </Field>

                    <Field
                      label={`B2C Initiator Name (${darajaEnv === "production" ? "Production" : "Sandbox"})`}
                      hint={darajaEnv === "production" ? "Live production initiator username registered on Safaricom portal" : "Sandbox test initiator name (e.g. test_api)"}
                    >
                      <TextInput
                        value={credentials.darajaInitiatorName || ""}
                        onChange={(val) => updateField("darajaInitiatorName", val)}
                        placeholder={darajaEnv === "production" ? "live_initiator_username" : "test_api"}
                      />
                    </Field>

                    <Field
                      label={`Paybill / B2C Shortcode (${darajaEnv === "production" ? "Production" : "Sandbox"})`}
                      hint={darajaEnv === "production" ? "Live production B2C Paybill / Shortcode assigned by Safaricom" : "Sandbox test shortcode (e.g. 600000)"}
                    >
                      <TextInput
                        value={credentials.darajaShortcode || ""}
                        onChange={(val) => updateField("darajaShortcode", val)}
                        placeholder={darajaEnv === "production" ? "601234" : "600000"}
                      />
                    </Field>

                    <div className="col-span-1 sm:col-span-2">
                      <Field
                        label={`Security Credential (${darajaEnv === "production" ? "Production Encrypted Certificate" : "Sandbox Password"})`}
                        hint={darajaEnv === "production" ? "Encrypted security credential generated using Safaricom Production Certificate" : "Sandbox password or security credential string"}
                      >
                        <SecretInput
                          multiline
                          rows={3}
                          value={credentials.darajaSecurityCredential || ""}
                          onChange={(val) => updateField("darajaSecurityCredential", val)}
                          placeholder={darajaEnv === "production" ? "Production encrypted certificate string..." : "Sandbox security credential string..."}
                        />
                      </Field>
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={handleTestDaraja}
                      disabled={testingDaraja}
                      className="px-4 py-2 bg-gray-900 hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-100 text-white dark:text-gray-900 text-xs font-semibold rounded-lg shadow-xs transition disabled:opacity-50 flex items-center gap-2"
                    >
                      {testingDaraja ? (
                        <>
                          <svg className="w-3.5 h-3.5 animate-spin text-white dark:text-gray-900" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                          Testing M-Pesa Connection...
                        </>
                      ) : (
                        `Test ${darajaEnv === "production" ? "Production" : "Sandbox"} M-Pesa Connection`
                      )}
                    </button>

                    {darajaTestResult && (
                      <span className={`text-xs font-semibold ${darajaTestResult.success ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
                        {darajaTestResult.message}
                      </span>
                    )}
                  </div>
                </>
              ) : payoutProviderKey === "jenga" ? (
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <Field label="Jenga API key / Merchant token">
                    <SecretInput
                      value={credentials.jengaApiKey || ""}
                      onChange={(val) => updateField("jengaApiKey", val)}
                      placeholder="jenga_api_..."
                    />
                  </Field>
                  <Field label="Equity Account Number">
                    <TextInput
                      value={credentials.jengaAccountNo || ""}
                      onChange={(val) => updateField("jengaAccountNo", val)}
                      placeholder="011000000000"
                    />
                  </Field>
                </div>
              ) : (
                <div className="space-y-4">
                  <Field label="Partner Webhook Payout URL">
                    <TextInput
                      value={credentials.customPayoutUrl || ""}
                      onChange={(val) => updateField("customPayoutUrl", val)}
                      placeholder="https://api.partner.com/payouts/b2c"
                    />
                  </Field>
                  <Field label="Authorization Header Secret">
                    <SecretInput
                      value={credentials.customPayoutKey || ""}
                      onChange={(val) => updateField("customPayoutKey", val)}
                      placeholder="Bearer token or API Secret"
                    />
                  </Field>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── 4. WEBHOOKS TAB ── */}
        {activeTab === "webhooks" && (
          <div className="space-y-5">
            <CopyBox
              label="M-Pesa B2C result callback URL"
              url={`${origin}/api/mpesa/b2c/result?tenantId=${tidParam}`}
            />
            <CopyBox
              label="M-Pesa B2C timeout callback URL"
              url={`${origin}/api/mpesa/b2c/queue-timeout?tenantId=${tidParam}`}
            />
            <CopyBox
              label="M-Pesa C2B validation callback URL"
              url={`${origin}/api/mpesa/c2b/validation?tenantId=${tidParam}`}
            />
            <CopyBox
              label="M-Pesa C2B confirmation callback URL"
              url={`${origin}/api/mpesa/c2b/confirmation?tenantId=${tidParam}`}
            />
          </div>
        )}
      </div>
    </div>
  );
}
