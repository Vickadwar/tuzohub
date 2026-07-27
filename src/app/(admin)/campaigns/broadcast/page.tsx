"use client";

import React, { useState } from "react";
import Link from "next/link";
import Badge from "@/components/ui/badge/Badge";
import { useApi } from "@/hooks/useApi";

interface DispatchLog {
  id: string;
  timestamp: string;
  phoneNumber: string;
  message: string;
  status: "SUCCESS" | "SIMULATED" | "ERROR";
  responseDetails?: string;
}

const QUICK_TEMPLATES = [
  {
    title: "🎁 Double Points Weekend",
    badge: "Most Popular",
    badgeColor: "success" as const,
    text: "🎁 Flash Sale! Earn 2x loyalty points on all purchases this weekend at TuZo Hub! Dial *617*85# to check your balance and redeem rewards.",
  },
  {
    title: "🚀 Flash Voucher Drop",
    badge: "High Conversion",
    badgeColor: "info" as const,
    text: "🚀 Surprise Voucher Drop! Show code TUZO500 at checkout today to get KSh 500 off your order of KSh 3,000+. Hurry, valid while stocks last!",
  },
  {
    title: "🎂 VIP Birthday Bonus",
    badge: "Retention",
    badgeColor: "warning" as const,
    text: "🎂 Happy Birthday from our team! You have unlocked an exclusive 500 bonus points gift. Visit any branch or dial *617*85# to claim your reward today.",
  },
  {
    title: "📢 New Product Launch",
    badge: "Announcement",
    badgeColor: "primary" as const,
    text: "📢 Introducing our new premium line! Be among the first 50 customers to purchase this week and receive triple loyalty points instantly. Dial *617*85# to learn more.",
  },
];

export default function PromoSmsBroadcastPage() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [logs, setLogs] = useState<DispatchLog[]>([]);
  const [activeTab, setActiveTab] = useState<"broadcast" | "daraja-guide">("broadcast");

  // Character calculation
  const charCount = message.length;
  const smsCount = Math.max(1, Math.ceil(charCount / 160));

  const handleTemplateClick = (text: string) => {
    setMessage(text);
  };

  const handleSendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber || !message) return;

    setIsSubmitting(true);
    const newLogId = Math.random().toString(36).substring(7);
    const now = new Date().toLocaleTimeString();

    try {
      const res = await fetch("/api/sms/send-promo", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
        },
        body: JSON.stringify({ phoneNumber, message }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to dispatch SMS");
      }

      const isSimulated = data.result?.simulated === true;
      const status = isSimulated ? "SIMULATED" : "SUCCESS";
      const details = isSimulated
        ? "Simulated (No live API keys found or placeholder mode active)"
        : `Provider ID: ${data.result?.messageId || data.result?.id || "OK"}`;

      setLogs((prev) => [
        {
          id: newLogId,
          timestamp: now,
          phoneNumber,
          message,
          status,
          responseDetails: details,
        },
        ...prev,
      ]);

      // Clear input on success
      setPhoneNumber("");
    } catch (error: any) {
      setLogs((prev) => [
        {
          id: newLogId,
          timestamp: now,
          phoneNumber,
          message,
          status: "ERROR",
          responseDetails: error.message || "Network dispatch failure",
        },
        ...prev,
      ]);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full space-y-8 animate-in fade-in duration-500 pb-12">
      {/* ── Page Header ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-200 pb-6 dark:border-white/10">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
              Promotional SMS Command Center
            </h1>
            <span className="inline-flex items-center rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-semibold text-brand-700 dark:bg-brand-500/10 dark:text-brand-300">
              Live Gateway
            </span>
          </div>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 max-w-2xl">
            Dispatch real-time promotional SMS broadcasts to consumers using your tenant&apos;s configured gateway (BongaSMS or Africa&apos;s Talking).
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex rounded-lg bg-gray-100 p-1 dark:bg-white/5 border border-gray-200 dark:border-white/10 shrink-0">
          <button
            onClick={() => setActiveTab("broadcast")}
            className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-all ${
              activeTab === "broadcast"
                ? "bg-white text-brand-600 shadow-sm dark:bg-brand-600 dark:text-white"
                : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
            }`}
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
            SMS Dispatcher
          </button>
          <button
            onClick={() => setActiveTab("daraja-guide")}
            className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-all ${
              activeTab === "daraja-guide"
                ? "bg-white text-brand-600 shadow-sm dark:bg-brand-600 dark:text-white"
                : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
            }`}
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Daraja B2C Strategy
          </button>
        </div>
      </div>

      {activeTab === "broadcast" ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Dispatch Form & Templates */}
          <div className="lg:col-span-7 space-y-6">
            {/* Quick Templates Card */}
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#18181b]">
              <h2 className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <svg className="h-5 w-5 text-brand-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m3.75 9v6m3-3H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                </svg>
                Quick Promotional Templates
              </h2>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Click any card to instantly load a high-converting promotional message into the dispatcher.
              </p>

              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                {QUICK_TEMPLATES.map((tmpl, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleTemplateClick(tmpl.text)}
                    className="flex flex-col items-start rounded-lg border border-gray-200 p-3.5 text-left transition-all hover:border-brand-500 hover:bg-brand-50/30 dark:border-white/10 dark:hover:border-brand-500/50 dark:hover:bg-brand-500/5 group"
                  >
                    <div className="flex w-full items-center justify-between gap-2">
                      <span className="text-xs font-bold text-gray-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400">
                        {tmpl.title}
                      </span>
                      <Badge size="sm" color={tmpl.badgeColor}>
                        {tmpl.badge}
                      </Badge>
                    </div>
                    <p className="mt-2 text-[11px] leading-relaxed text-gray-600 dark:text-gray-300 line-clamp-2">
                      {tmpl.text}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Dispatcher Form */}
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#18181b]">
              <h2 className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <svg className="h-5 w-5 text-brand-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                </svg>
                Compose &amp; Dispatch Message
              </h2>

              <form onSubmit={handleSendBroadcast} className="mt-5 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-1.5">
                    Target Phone Number (MSISDN)
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      placeholder="e.g. 0712345678 or 254712345678"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="h-11 w-full rounded-lg border border-gray-300 bg-white px-4 text-sm font-mono text-gray-900 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-white/10 dark:bg-white/5 dark:text-white placeholder:text-gray-400"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-gray-400">
                      Auto-normalizes
                    </span>
                  </div>
                  <p className="mt-1 text-[11px] text-gray-500 dark:text-gray-400">
                    Enter the consumer phone number. Our dispatcher automatically handles Kenyan MSISDN prefixes (`07...`, `254...`, `+254...`).
                  </p>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                      Message Content
                    </label>
                    <span className="text-xs font-mono text-gray-500 dark:text-gray-400">
                      {charCount} chars <span className="font-semibold text-brand-600 dark:text-brand-400">({smsCount} SMS)</span>
                    </span>
                  </div>
                  <textarea
                    required
                    rows={4}
                    placeholder="Type your promotional broadcast message here..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 bg-white p-4 text-sm text-gray-900 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-white/10 dark:bg-white/5 dark:text-white placeholder:text-gray-400 leading-relaxed"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => { setMessage(""); setPhoneNumber(""); }}
                    className="px-4 py-2.5 rounded-lg border border-gray-300 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-white/10 dark:text-gray-300 dark:hover:bg-white/5 transition-colors"
                  >
                    Clear Form
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || !phoneNumber || !message}
                    className="inline-flex items-center gap-2 rounded-lg bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                        Dispatching...
                      </>
                    ) : (
                      <>
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                        </svg>
                        Send Broadcast SMS
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Right Column: Live Telemetry & Execution Log */}
          <div className="lg:col-span-5 space-y-6">
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#18181b] flex flex-col h-full min-h-[450px]">
              <div className="flex items-center justify-between border-b border-gray-100 pb-4 dark:border-white/5">
                <h2 className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <svg className="h-5 w-5 text-brand-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                  </svg>
                  Live Dispatch Telemetry
                </h2>
                {logs.length > 0 && (
                  <button
                    onClick={() => setLogs([])}
                    className="text-xs font-medium text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                  >
                    Clear Logs
                  </button>
                )}
              </div>

              <div className="mt-4 flex-1 overflow-y-auto space-y-3 max-h-[550px] pr-1">
                {logs.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full py-16 text-center">
                    <div className="rounded-full bg-gray-50 p-4 dark:bg-white/5 mb-3">
                      <svg className="h-8 w-8 text-gray-300 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
                      </svg>
                    </div>
                    <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                      No Broadcasts Sent Yet
                    </span>
                    <p className="mt-1 text-[11px] text-gray-400 max-w-xs">
                      Send a promotional message using the compose form to inspect real-time provider responses.
                    </p>
                  </div>
                ) : (
                  logs.map((log) => (
                    <div
                      key={log.id}
                      className={`rounded-lg border p-3.5 transition-all ${
                        log.status === "SUCCESS"
                          ? "border-success-200 bg-success-50/30 dark:border-success-500/20 dark:bg-success-500/5"
                          : log.status === "SIMULATED"
                          ? "border-info-200 bg-info-50/30 dark:border-info-500/20 dark:bg-info-500/5"
                          : "border-error-200 bg-error-50/30 dark:border-error-500/20 dark:bg-error-500/5"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <span className="font-mono text-xs font-bold text-gray-900 dark:text-white">
                          {log.phoneNumber}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono text-gray-400">{log.timestamp}</span>
                          <Badge
                            size="sm"
                            color={
                              log.status === "SUCCESS"
                                ? "success"
                                : log.status === "SIMULATED"
                                ? "info"
                                : "error"
                            }
                          >
                            {log.status}
                          </Badge>
                        </div>
                      </div>
                      <p className="text-xs text-gray-700 dark:text-gray-300 font-sans line-clamp-2 mb-2 bg-white/60 dark:bg-black/20 p-2 rounded border border-gray-100 dark:border-white/5">
                        &ldquo;{log.message}&rdquo;
                      </p>
                      <div className="text-[10px] font-mono text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                        <span className="font-semibold text-gray-700 dark:text-gray-300">Response:</span>
                        {log.responseDetails}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* ── Daraja B2C Strategy Guide Tab ────────────────────────────────────── */
        <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm dark:border-white/10 dark:bg-[#18181b] space-y-8">
          <div className="border-b border-gray-100 pb-5 dark:border-white/5">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400 font-bold text-sm">
                M
              </span>
              Safaricom Daraja B2C Automated Payout Testing Strategy
            </h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Follow this step-by-step enterprise protocol to verify and demonstrate automated M-Pesa loyalty payouts for clients (Jopiny Paints, Gamma Coatings, or Crown Paints).
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Phase 1 */}
            <div className="rounded-lg border border-gray-200 p-5 dark:border-white/10 bg-gray-50/50 dark:bg-white/[0.02]">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
                  Phase 1: Sandbox
                </span>
                <Badge size="sm" color="info">Zero Cost</Badge>
              </div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-2">
                1. Developer Portal Sandbox
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed space-y-2">
                Create a sandbox app at <code>developer.safaricom.co.ke</code>. Navigate to <strong>Settings &rarr; Integrations</strong> and input:
              </p>
              <ul className="mt-2 text-[11px] font-mono bg-white dark:bg-black/30 p-2.5 rounded border border-gray-200 dark:border-white/5 space-y-1 text-gray-700 dark:text-gray-300">
                <li>• Shortcode: <strong>600000</strong></li>
                <li>• Initiator: <strong>testapi</strong></li>
                <li>• Security: Sandbox Credential Hash</li>
              </ul>
            </div>

            {/* Phase 2 */}
            <div className="rounded-lg border border-gray-200 p-5 dark:border-white/10 bg-gray-50/50 dark:bg-white/[0.02]">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
                  Phase 2: Live Penny Test
                </span>
                <Badge size="sm" color="warning">Client Proof</Badge>
              </div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-2">
                2. Live Gateway Verification
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                Once the client receives their official M-Pesa Org Shortcode (Paybill/Till with B2C enabled) and Initiator Account:
              </p>
              <ul className="mt-2 text-[11px] font-mono bg-white dark:bg-black/30 p-2.5 rounded border border-gray-200 dark:border-white/5 space-y-1 text-gray-700 dark:text-gray-300">
                <li>• Enter production Daraja credentials</li>
                <li>• Execute a KSh 10 live redemption</li>
                <li>• Verify instant M-Pesa SMS receipt</li>
              </ul>
            </div>

            {/* Phase 3 */}
            <div className="rounded-lg border border-gray-200 p-5 dark:border-white/10 bg-gray-50/50 dark:bg-white/[0.02]">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
                  Phase 3: Webhooks
                </span>
                <Badge size="sm" color="success">Automated</Badge>
              </div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-2">
                3. Reconciliations &amp; Retries
              </h3>
              <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                Safaricom asynchronous results hit our public webhook endpoint:
              </p>
              <div className="mt-2 text-[11px] font-mono bg-white dark:bg-black/30 p-2.5 rounded border border-gray-200 dark:border-white/5 text-gray-700 dark:text-gray-300">
                POST /api/mpesa/b2c/callback
              </div>
              <p className="mt-2 text-[11px] text-gray-500 dark:text-gray-400">
                Our database automatically reconciles wallet transaction statuses to <code>COMPLETED</code> upon receipt.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
