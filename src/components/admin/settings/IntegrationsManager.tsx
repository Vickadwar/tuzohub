"use client";

import React, { useState } from "react";
import ModernSelect from "@/components/ui/ModernSelect";

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
          className="w-full rounded-md border border-gray-300 bg-white p-3 font-mono text-xs text-gray-900 shadow-sm transition-colors placeholder:text-gray-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-white/30"
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
        className="h-10 w-full rounded-md border border-gray-300 bg-white pl-3 pr-10 font-mono text-sm text-gray-900 shadow-sm transition-colors placeholder:text-gray-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-white/30"
      />
      <button
        type="button"
        onClick={() => setShow(!show)}
        className="absolute right-2.5 rounded p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
        title={show ? "Hide Secret" : "Show Secret"}
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
      className="h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-900 shadow-sm transition-colors placeholder:text-gray-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-white/30"
    />
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col">
      <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
      {children}
      {hint && <span className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">{hint}</span>}
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
    <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-white/10 dark:bg-white/5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">{label}</span>
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center gap-1.5 rounded bg-white px-2.5 py-1 text-xs font-medium text-gray-700 shadow-sm hover:bg-gray-50 dark:bg-white/10 dark:text-gray-200 dark:hover:bg-white/20"
        >
          {copied ? (
            <>
              <svg className="h-3.5 w-3.5 text-success-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-success-600 dark:text-success-400">Copied!</span>
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

  const updateField = (key: string, val: any) => {
    onChange({
      ...credentials,
      [key]: val,
    });
  };

  const updateFields = (updates: Record<string, any>) => {
    onChange({
      ...credentials,
      ...updates,
    });
  };

  const smsProvider = (credentials.smsProvider || "africastalking").toLowerCase();
  const ussdProvider = (credentials.ussdProvider || "africastalking").toLowerCase();
  const payoutProvider = (credentials.payoutProvider || "daraja").toLowerCase();

  const origin = typeof window !== "undefined" ? window.location.origin : "https://tuzohub.com";
  const tidParam = tenantId || tenantSlug || "your-tenant-id";

  return (
    <div className="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-white/10 dark:bg-[#18181b]">
      {/* ── Header ── */}
      <div className="border-b border-gray-100 px-6 py-5 dark:border-white/5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">Enterprise Integration Command Center</h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Configure provider-agnostic gateways for messaging, USSD menus, and financial disbursements.
            </p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700 dark:bg-brand-500/10 dark:text-brand-300">
            <span className="h-2 w-2 rounded-full bg-success-500"></span>
            Multi-Tenant Isolated Gateways
          </div>
        </div>

        {/* ── Tabs ── */}
        <div className="mt-6 flex flex-wrap gap-2 border-b border-gray-200 pb-px dark:border-white/10">
          <button
            type="button"
            onClick={() => setActiveTab("sms")}
            className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${
              activeTab === "sms"
                ? "border-brand-600 text-brand-600 dark:border-brand-400 dark:text-brand-400"
                : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            }`}
          >
            💬 SMS & Messaging
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("ussd")}
            className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${
              activeTab === "ussd"
                ? "border-brand-600 text-brand-600 dark:border-brand-400 dark:text-brand-400"
                : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            }`}
          >
            📱 USSD Gateway
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("payout")}
            className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${
              activeTab === "payout"
                ? "border-brand-600 text-brand-600 dark:border-brand-400 dark:text-brand-400"
                : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            }`}
          >
            💳 Financial Payouts
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("webhooks")}
            className={`flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${
              activeTab === "webhooks"
                ? "border-brand-600 text-brand-600 dark:border-brand-400 dark:text-brand-400"
                : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            }`}
          >
            🔗 Webhook Endpoints
          </button>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="p-6">
        {/* ── 1. SMS & MESSAGING TAB ── */}
        {activeTab === "sms" && (
          <div className="space-y-6">
            <div className="max-w-md">
              <Field label="Active Messaging Provider" hint="Select the primary SMS gateway for OTPs and reward notifications">
                <ModernSelect
                  options={[
                    { value: "africastalking", label: "Africa's Talking" },
                    { value: "bongasms", label: "Olive Tree Media (BongaSMS)" },
                  ]}
                  value={smsProvider}
                  onChange={(val) => updateField("smsProvider", val)}
                  placeholder="Select SMS Provider"
                />
              </Field>
            </div>

            <div className="rounded-lg border border-gray-100 bg-gray-50/50 p-5 dark:border-white/5 dark:bg-white/[0.02]">
              {smsProvider === "africastalking" ? (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <Field label="AT Username" hint="Your Africa's Talking application username (e.g., sandbox or production app name)">
                    <TextInput
                      value={credentials.atUsername || ""}
                      onChange={(val) => updateField("atUsername", val)}
                      placeholder="e.g. sandbox or myapp"
                    />
                  </Field>
                  <Field label="AT Sender ID / Short Code" hint="Alphanumeric Sender ID registered with telcos">
                    <TextInput
                      value={credentials.atSenderId || ""}
                      onChange={(val) => updateField("atSenderId", val)}
                      placeholder="e.g. TUZOHUB or 20880"
                    />
                  </Field>
                  <div className="sm:col-span-2">
                    <Field label="AT API Key" hint="Production or sandbox API key from Africa's Talking portal">
                      <SecretInput
                        value={credentials.atApiKey || ""}
                        onChange={(val) => updateField("atApiKey", val)}
                        placeholder="e.g. ats_xxxxxxxxx..."
                      />
                    </Field>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <Field label="Olive / Bonga API Client ID" hint="Your client identifier issued by Olive Tree Media">
                    <TextInput
                      value={credentials.apiClientID || credentials.bongaApiClientID || credentials.oliveClientId || ""}
                      onChange={(val) => updateFields({ apiClientID: val, bongaApiClientID: val, oliveClientId: val })}
                      placeholder="e.g. 1045"
                    />
                  </Field>
                  <Field label="Olive / Bonga Service ID" hint="Default service channel ID (typically 1)">
                    <TextInput
                      value={credentials.serviceID || credentials.bongaServiceID || credentials.oliveServiceId || "1"}
                      onChange={(val) => updateFields({ serviceID: val, bongaServiceID: val, oliveServiceId: val })}
                      placeholder="e.g. 1"
                    />
                  </Field>
                  <Field label="Bonga API Key" hint="Client API Key from Olive Tree Media dashboard">
                    <SecretInput
                      value={credentials.key || credentials.bongaApiKey || credentials.oliveApiKey || ""}
                      onChange={(val) => updateFields({ key: val, bongaApiKey: val, oliveApiKey: val })}
                      placeholder="e.g. xxxxxxxx-xxxx-xxxx..."
                    />
                  </Field>
                  <Field label="Bonga API Secret" hint="Client API Secret from Olive Tree Media dashboard">
                    <SecretInput
                      value={credentials.secret || credentials.bongaApiSecret || credentials.oliveApiSecret || ""}
                      onChange={(val) => updateFields({ secret: val, bongaApiSecret: val, oliveApiSecret: val })}
                      placeholder="e.g. yyyyyyyy-yyyy-yyyy..."
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
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <Field label="USSD Gateway Protocol" hint="Determines parameter structure and HTTP method expectation">
                <ModernSelect
                  options={[
                    { value: "olive", label: "Olive Tree Media / Bonga USSD (GET Protocol)" },
                    { value: "africastalking", label: "Africa's Talking / Jenga API (POST Protocol)" },
                  ]}
                  value={ussdProvider}
                  onChange={(val) => updateField("ussdProvider", val)}
                  placeholder="Select Protocol"
                />
              </Field>
              <Field label="USSD Service Code" hint="Dialing string assigned by your telco aggregator">
                <TextInput
                  value={credentials.ussdServiceCode || credentials.serviceCode || "*453*34#"}
                  onChange={(val) => {
                    updateField("ussdServiceCode", val);
                    updateField("serviceCode", val);
                  }}
                  placeholder="e.g. *453*34#"
                />
              </Field>
            </div>

            <div className="rounded-lg border border-brand-200 bg-brand-50/40 p-4 dark:border-brand-500/20 dark:bg-brand-500/5">
              <h4 className="text-sm font-semibold text-brand-900 dark:text-brand-200">USSD Town Pagination Setup</h4>
              <p className="mt-1 text-xs text-brand-700 dark:text-brand-300">
                This tenant is configured with <strong>Option A (Top Commercial Hubs + Pagination)</strong>. Regions and towns configured in your Master Data will automatically display 5 items per screen with <code>8. Next Page</code> and <code>9. Other</code> options.
              </p>
            </div>
          </div>
        )}

        {/* ── 3. FINANCIAL PAYOUTS TAB ── */}
        {activeTab === "payout" && (
          <div className="space-y-6">
            <div className="max-w-md">
              <Field label="Active Disbursement Gateway" hint="Select the primary banking or mobile money rail for voucher rewards">
                <ModernSelect
                  options={[
                    { value: "daraja", label: "Safaricom M-Pesa (Daraja B2C)" },
                    { value: "jenga", label: "Equity Bank Jenga API" },
                    { value: "webhook", label: "Custom HTTP Webhook" },
                  ]}
                  value={payoutProvider}
                  onChange={(val) => updateField("payoutProvider", val)}
                  placeholder="Select Payout Gateway"
                />
              </Field>
            </div>

            <div className="rounded-lg border border-gray-100 bg-gray-50/50 p-5 dark:border-white/5 dark:bg-white/[0.02]">
              {payoutProvider === "daraja" && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <Field label="Daraja Environment" hint="Target API server for B2C disbursement requests">
                      <ModernSelect
                        options={[
                          { value: "https://sandbox.safaricom.co.ke", label: "Sandbox (Testing)" },
                          { value: "https://api.safaricom.co.ke", label: "Production (Live)" },
                        ]}
                        value={credentials.darajaBaseUrl || "https://sandbox.safaricom.co.ke"}
                        onChange={(val) => updateField("darajaBaseUrl", val)}
                        placeholder="Select Environment"
                      />
                    </Field>
                    <Field label="B2C ShortCode / Paybill" hint="M-Pesa Organization ShortCode (PartyA)">
                      <TextInput
                        value={credentials.darajaShortCode || ""}
                        onChange={(val) => updateField("darajaShortCode", val)}
                        placeholder="e.g. 600997 or 123456"
                      />
                    </Field>
                    <Field label="Daraja Consumer Key" hint="OAuth App Consumer Key from Safaricom portal">
                      <TextInput
                        value={credentials.darajaConsumerKey || ""}
                        onChange={(val) => updateField("darajaConsumerKey", val)}
                        placeholder="e.g. 1a2b3c4d5e6f7g8h9i0j..."
                      />
                    </Field>
                    <Field label="Daraja Consumer Secret" hint="OAuth App Consumer Secret from Safaricom portal">
                      <SecretInput
                        value={credentials.darajaConsumerSecret || ""}
                        onChange={(val) => updateField("darajaConsumerSecret", val)}
                        placeholder="e.g. k1l2m3n4o5p6q7r8s9t0..."
                      />
                    </Field>
                    <Field label="Initiator Name" hint="Operator username with B2C disbursement rights">
                      <TextInput
                        value={credentials.darajaInitiatorName || ""}
                        onChange={(val) => updateField("darajaInitiatorName", val)}
                        placeholder="e.g. testapi or admin"
                      />
                    </Field>
                    <Field label="Initiator Plain Password" hint="Optional: Plain password for dynamic RSA PKCS#1 encryption">
                      <SecretInput
                        value={credentials.darajaInitiatorPassword || ""}
                        onChange={(val) => updateField("darajaInitiatorPassword", val)}
                        placeholder="Leave blank if providing raw SecurityCredential below"
                      />
                    </Field>
                  </div>
                  <Field label="Security Credential (Encrypted Base64)" hint="Optional if Plain Password is provided above. The gateway auto-encrypts plaintext passwords using Safaricom's public certificate.">
                    <SecretInput
                      value={credentials.darajaSecurityCredential || ""}
                      onChange={(val) => updateField("darajaSecurityCredential", val)}
                      placeholder="e.g. AAIBBCCDDEEFFGGHH..."
                      multiline={true}
                      rows={2}
                    />
                  </Field>
                </div>
              )}

              {payoutProvider === "jenga" && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <Field label="Jenga Merchant Code" hint="Assigned Equity Bank Merchant ID">
                      <TextInput
                        value={credentials.jengaMerchantCode || ""}
                        onChange={(val) => updateField("jengaMerchantCode", val)}
                        placeholder="e.g. 12345678"
                      />
                    </Field>
                    <Field label="Jenga Consumer Key" hint="API Consumer Key from Equity Jenga portal">
                      <TextInput
                        value={credentials.jengaConsumerKey || ""}
                        onChange={(val) => updateField("jengaConsumerKey", val)}
                        placeholder="e.g. jenga_key_xxxx..."
                      />
                    </Field>
                  </div>
                  <Field label="Jenga Consumer Secret" hint="API Secret for OAuth token generation">
                    <SecretInput
                      value={credentials.jengaConsumerSecret || ""}
                      onChange={(val) => updateField("jengaConsumerSecret", val)}
                      placeholder="e.g. jenga_secret_yyyy..."
                    />
                  </Field>
                  <Field label="RSA Private Key (PEM Format)" hint="Paste your Private Key PEM string used for signing financial transfer requests">
                    <SecretInput
                      value={credentials.jengaPrivateKey || ""}
                      onChange={(val) => updateField("jengaPrivateKey", val)}
                      placeholder="-----BEGIN RSA PRIVATE KEY-----..."
                      multiline={true}
                      rows={5}
                    />
                  </Field>
                </div>
              )}

              {payoutProvider === "webhook" && (
                <div className="space-y-6">
                  <Field label="Target Webhook URL" hint="HTTPS endpoint receiving JSON disbursement payloads">
                    <TextInput
                      value={credentials.webhookUrl || ""}
                      onChange={(val) => updateField("webhookUrl", val)}
                      placeholder="https://your-server.com/api/payouts"
                    />
                  </Field>
                  <Field label="Webhook Signing Secret" hint="Secret key used to sign HMAC-SHA256 headers for authentication">
                    <SecretInput
                      value={credentials.webhookSecret || ""}
                      onChange={(val) => updateField("webhookSecret", val)}
                      placeholder="e.g. whsec_xxxxxxxxxxxx..."
                    />
                  </Field>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── 4. WEBHOOK ENDPOINTS TAB ── */}
        {activeTab === "webhooks" && (
          <div className="space-y-6">
            <div className="rounded-lg bg-blue-50 p-4 border border-blue-100 dark:bg-blue-500/10 dark:border-blue-500/20">
              <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-300">Gateway Callback Configuration</h4>
              <p className="mt-1 text-xs text-blue-700 dark:text-blue-400">
                Copy and register the following endpoint URLs directly into your telco or banking provider developer dashboards. Each URL contains your unique tenant identifier (<code>{tidParam}</code>) to route asynchronous responses automatically to your organization's isolated ledger.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <CopyBox
                label="USSD Menu Callback URL (GET / POST)"
                url={`${origin}/api/ussd/callback?tenantId=${tidParam}`}
              />
              <CopyBox
                label="Daraja M-Pesa B2C Result URL (Success / Failure)"
                url={`${origin}/api/mpesa/b2c/callback?tenantId=${tidParam}`}
              />
              <CopyBox
                label="Daraja M-Pesa B2C Queue Timeout URL"
                url={`${origin}/api/mpesa/b2c/timeout?tenantId=${tidParam}`}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
