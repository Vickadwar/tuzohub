"use client";

import React, { useState } from "react";
import Badge from "@/components/ui/badge/Badge";
import { authenticatedFetch } from "@/hooks/useApi";

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
    id: "double-points",
    title: "🎁 Double Points Weekend",
    badge: "Most Popular",
    badgeColor: "success" as const,
    icon: "⚡",
    category: "Promotional",
    text: "🎁 Flash Sale! Earn 2x loyalty points on all purchases this weekend at TuZo Hub! Dial *617*85# to check your balance and redeem rewards.",
  },
  {
    id: "voucher-drop",
    title: "🚀 Flash Voucher Drop",
    badge: "High Conversion",
    badgeColor: "info" as const,
    icon: "🔥",
    category: "Discounts",
    text: "🚀 Surprise Voucher Drop! Show code TUZO500 at checkout today to get KSh 500 off your order of KSh 3,000+. Hurry, valid while stocks last!",
  },
  {
    id: "birthday-bonus",
    title: "🎂 VIP Birthday Bonus",
    badge: "Retention",
    badgeColor: "warning" as const,
    icon: "🎉",
    category: "Personalized",
    text: "🎂 Happy Birthday from our team! You have unlocked an exclusive 500 bonus points gift. Visit any branch or dial *617*85# to claim your reward today.",
  },
  {
    id: "product-launch",
    title: "📢 New Product Launch",
    badge: "Announcement",
    badgeColor: "primary" as const,
    icon: "📦",
    category: "Product Launch",
    text: "📢 Introducing our new premium line! Be among the first 50 customers to purchase this week and receive triple loyalty points instantly. Dial *617*85# to learn more.",
  },
];

export default function PromoSmsBroadcastPage() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [logs, setLogs] = useState<DispatchLog[]>([]);
  const [activeTab, setActiveTab] = useState<"broadcast" | "daraja-guide">("broadcast");
  const [filterStatus, setFilterStatus] = useState<"ALL" | "SUCCESS" | "SIMULATED" | "ERROR">("ALL");

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
      const res = await authenticatedFetch("/api/sms/send-promo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumber, message }),
      });

      const data = await res.json().catch(() => ({}));

      if (!data.success) {
        throw new Error(data.error || "Failed to dispatch SMS");
      }

      const isSimulated = data.result?.simulated === true;
      const status = isSimulated ? "SIMULATED" : "SUCCESS";
      const details = isSimulated
        ? "Simulated (Placeholder mode or testing gateway active)"
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

      setPhoneNumber("");
    } catch (error: any) {
      const errorMsg = error.message || "Network dispatch failure";
      setLogs((prev) => [
        {
          id: newLogId,
          timestamp: now,
          phoneNumber,
          message,
          status: "ERROR",
          responseDetails: errorMsg,
        },
        ...prev,
      ]);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredLogs = logs.filter((log) => {
    if (filterStatus === "ALL") return true;
    return log.status === filterStatus;
  });

  return (
    <div className="w-full space-y-6 animate-fadeIn pb-12">
      {/* ── Header Bar ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200/80 dark:border-white/[0.06] pb-5">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
              Promotional SMS &amp; Broadcast Hub
            </h1>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Gateway Active
            </span>
          </div>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Compose instant SMS campaigns, test promotional templates, and monitor real-time gateway telemetry.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex rounded-xl bg-gray-100 dark:bg-white/[0.03] p-1 border border-gray-200/80 dark:border-white/[0.08] shrink-0">
          <button
            onClick={() => setActiveTab("broadcast")}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition-all ${
              activeTab === "broadcast"
                ? "bg-white dark:bg-brand-600 text-brand-600 dark:text-white shadow-xs"
                : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
            }`}
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
            SMS Dispatcher
          </button>
          <button
            onClick={() => setActiveTab("daraja-guide")}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition-all ${
              activeTab === "daraja-guide"
                ? "bg-white dark:bg-brand-600 text-brand-600 dark:text-white shadow-xs"
                : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
            }`}
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Daraja B2C Strategy
          </button>
        </div>
      </div>

      {/* ── Top Gateway Metrics Banner ───────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-white/[0.02] border border-gray-200/80 dark:border-white/[0.06] p-4 rounded-2xl shadow-sm flex items-center gap-3">
          <div className="p-3 bg-brand-500/10 text-brand-600 dark:text-brand-400 rounded-xl shrink-0">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">Primary Provider</p>
            <p className="text-sm font-bold text-gray-900 dark:text-white">BongaSMS / Africa&apos;s Talking</p>
          </div>
        </div>

        <div className="bg-white dark:bg-white/[0.02] border border-gray-200/80 dark:border-white/[0.06] p-4 rounded-2xl shadow-sm flex items-center gap-3">
          <div className="p-3 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl shrink-0">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">Total Dispatched</p>
            <p className="text-sm font-bold text-gray-900 dark:text-white">{logs.length} Messages</p>
          </div>
        </div>

        <div className="bg-white dark:bg-white/[0.02] border border-gray-200/80 dark:border-white/[0.06] p-4 rounded-2xl shadow-sm flex items-center gap-3">
          <div className="p-3 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-xl shrink-0">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">Avg Delivery Speed</p>
            <p className="text-sm font-bold text-gray-900 dark:text-white">&lt; 1.2 Seconds</p>
          </div>
        </div>

        <div className="bg-white dark:bg-white/[0.02] border border-gray-200/80 dark:border-white/[0.06] p-4 rounded-2xl shadow-sm flex items-center gap-3">
          <div className="p-3 bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-xl shrink-0">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">Preset Templates</p>
            <p className="text-sm font-bold text-gray-900 dark:text-white">{QUICK_TEMPLATES.length} Ready</p>
          </div>
        </div>
      </div>

      {activeTab === "broadcast" ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left 7 Columns: Compose Form & Presets */}
          <div className="lg:col-span-7 space-y-6">
            {/* Quick Templates Card */}
            <div className="bg-white dark:bg-white/[0.02] border border-gray-200/80 dark:border-white/[0.06] p-6 rounded-2xl shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 dark:border-white/5 pb-3">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 bg-brand-500/10 text-brand-600 rounded-lg text-xs">✨</span>
                  <h2 className="text-sm font-bold text-gray-900 dark:text-white">Quick Promotional Presets</h2>
                </div>
                <span className="text-[11px] text-gray-400 font-medium">Click any card to populate composer</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {QUICK_TEMPLATES.map((tmpl) => (
                  <button
                    key={tmpl.id}
                    type="button"
                    onClick={() => handleTemplateClick(tmpl.text)}
                    className="flex flex-col justify-between p-3.5 rounded-xl border border-gray-200/80 dark:border-white/10 bg-gray-50/50 dark:bg-white/[0.01] hover:border-brand-500/60 dark:hover:border-brand-500/50 hover:bg-brand-50/20 dark:hover:bg-brand-500/5 transition-all text-left group"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold text-gray-900 dark:text-white group-hover:text-brand-500 transition-colors flex items-center gap-1.5">
                          <span>{tmpl.icon}</span>
                          {tmpl.title}
                        </span>
                        <Badge size="sm" color={tmpl.badgeColor}>{tmpl.badge}</Badge>
                      </div>
                      <p className="mt-2 text-[11px] leading-relaxed text-gray-500 dark:text-gray-400 line-clamp-2">
                        {tmpl.text}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Composer Form & Realtime Device Preview */}
            <div className="bg-white dark:bg-white/[0.02] border border-gray-200/80 dark:border-white/[0.06] p-6 rounded-2xl shadow-sm space-y-5">
              <div className="flex items-center justify-between border-b border-gray-100 dark:border-white/5 pb-3">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 bg-emerald-500/10 text-emerald-600 rounded-lg text-xs">🚀</span>
                  <h2 className="text-sm font-bold text-gray-900 dark:text-white">Compose Promotional Message</h2>
                </div>
                <div className="flex items-center gap-2 text-xs font-mono text-gray-400">
                  <span>{charCount} chars</span>
                  <span className="px-2 py-0.5 bg-brand-500/10 text-brand-600 dark:text-brand-400 rounded font-bold">
                    {smsCount} SMS Segment{smsCount > 1 ? "s" : ""}
                  </span>
                </div>
              </div>

              <form onSubmit={handleSendBroadcast} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                    Recipient Mobile Number (MSISDN)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 0712345678 or 254712345678"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-white/10 rounded-xl text-sm font-mono text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/40"
                  />
                  <p className="text-[11px] text-gray-400">
                    Auto-normalizes Kenyan prefixes (`07...`, `01...`, `254...`, `+254...`).
                  </p>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                    Broadcast Message Body
                  </label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Type your promotional message here..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full p-3.5 bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-white/10 rounded-xl text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/40 leading-relaxed"
                  />
                </div>

                {/* Form Controls */}
                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={() => { setMessage(""); setPhoneNumber(""); }}
                    className="px-3.5 py-2 text-xs font-semibold text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition"
                  >
                    Clear Composer
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || !phoneNumber || !message}
                    className="px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold rounded-xl transition shadow-md shadow-brand-500/20 disabled:opacity-50 flex items-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Dispatching SMS...
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                        Dispatch Promotional SMS
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Right 5 Columns: Live Mobile Device Mockup & Telemetry Console */}
          <div className="lg:col-span-5 space-y-6">
            {/* Realtime Customer Phone Screen Preview */}
            <div className="bg-gradient-to-b from-gray-900 via-gray-950 to-black p-5 rounded-2xl border border-gray-800 text-white shadow-2xl space-y-3 relative overflow-hidden">
              <div className="flex items-center justify-between border-b border-gray-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs font-semibold text-gray-300">Realtime SMS Mockup</span>
                </div>
                <span className="text-[10px] text-gray-500 font-mono">BongaSMS Gateway</span>
              </div>

              <div className="bg-gray-900/90 border border-gray-800 p-4 rounded-xl space-y-2">
                <div className="flex items-center justify-between text-[11px] text-gray-400">
                  <span className="font-bold text-emerald-400">TUZO_HUB (Sender)</span>
                  <span>Just now</span>
                </div>
                <p className="text-xs font-sans leading-relaxed text-gray-200 min-h-[50px] italic">
                  {message || "Message content will appear here in real-time as you type..."}
                </p>
              </div>
            </div>

            {/* Live Telemetry Log Card */}
            <div className="bg-white dark:bg-white/[0.02] border border-gray-200/80 dark:border-white/[0.06] p-6 rounded-2xl shadow-sm space-y-4 flex flex-col h-[400px]">
              <div className="flex items-center justify-between border-b border-gray-100 dark:border-white/5 pb-3">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 bg-amber-500/10 text-amber-600 rounded-lg text-xs">⚡</span>
                  <h2 className="text-sm font-bold text-gray-900 dark:text-white">Dispatch Telemetry Console</h2>
                </div>
                {logs.length > 0 && (
                  <button
                    onClick={() => setLogs([])}
                    className="text-[11px] font-semibold text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                  >
                    Clear Logs
                  </button>
                )}
              </div>

              {/* Status Filter Tabs */}
              <div className="flex items-center gap-1.5 bg-gray-100 dark:bg-white/[0.03] p-1 rounded-xl">
                {(["ALL", "SUCCESS", "SIMULATED", "ERROR"] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => setFilterStatus(st)}
                    className={`flex-1 py-1 text-[10px] font-semibold rounded-lg transition-all ${
                      filterStatus === st
                        ? "bg-white dark:bg-white/10 text-gray-900 dark:text-white shadow-xs"
                        : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                    }`}
                  >
                    {st === "ALL" ? "All" : st === "SUCCESS" ? "Success" : st === "SIMULATED" ? "Simulated" : "Error"}
                  </button>
                ))}
              </div>

              {/* Log Items Scroll List */}
              <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 custom-scrollbar">
                {filteredLogs.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center py-12 text-center">
                    <div className="p-3 bg-gray-50 dark:bg-white/5 rounded-full mb-2 text-gray-400">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                    </div>
                    <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">No Dispatches Recorded</p>
                    <p className="text-[11px] text-gray-400 mt-0.5">Send a test SMS to view provider logs.</p>
                  </div>
                ) : (
                  filteredLogs.map((log) => (
                    <div
                      key={log.id}
                      className={`p-3 rounded-xl border transition-all ${
                        log.status === "SUCCESS"
                          ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-950 dark:text-emerald-200"
                          : log.status === "SIMULATED"
                          ? "bg-blue-500/5 border-blue-500/20 text-blue-950 dark:text-blue-200"
                          : "bg-rose-500/5 border-rose-500/20 text-rose-950 dark:text-rose-200"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-mono text-xs font-bold">{log.phoneNumber}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-gray-400 font-mono">{log.timestamp}</span>
                          <Badge
                            size="sm"
                            color={log.status === "SUCCESS" ? "success" : log.status === "SIMULATED" ? "info" : "error"}
                          >
                            {log.status}
                          </Badge>
                        </div>
                      </div>
                      <p className="text-xs font-sans line-clamp-2 text-gray-700 dark:text-gray-300 bg-white/50 dark:bg-black/20 p-2 rounded-lg border border-gray-100 dark:border-white/5 my-1.5">
                        &ldquo;{log.message}&rdquo;
                      </p>
                      <p className="text-[10px] font-mono text-gray-500 dark:text-gray-400">
                        {log.responseDetails}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* ── Daraja B2C Protocol Strategy Tab ───────────────────────────────── */
        <div className="bg-white dark:bg-white/[0.02] border border-gray-200/80 dark:border-white/[0.06] p-8 rounded-2xl shadow-sm space-y-8">
          <div className="border-b border-gray-100 dark:border-white/5 pb-5">
            <div className="flex items-center gap-3">
              <span className="w-9 h-9 rounded-full bg-emerald-500/10 text-emerald-600 font-bold flex items-center justify-center text-sm border border-emerald-500/20 shadow-2xs">
                M
              </span>
              <div>
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                  Safaricom Daraja B2C Automated Payout Protocol
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Follow this strategy to verify and demonstrate automated M-Pesa loyalty disbursements for client onboarding.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-5 rounded-2xl border border-gray-200/80 dark:border-white/10 bg-gray-50/50 dark:bg-white/[0.01] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-brand-600 dark:text-brand-400">Phase 1: Sandbox</span>
                <Badge size="sm" color="info">Zero Cost</Badge>
              </div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">1. Developer Sandbox App</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                Create a sandbox app at <code>developer.safaricom.co.ke</code>. Under <strong>Settings &rarr; Integrations</strong>, configure:
              </p>
              <div className="text-[11px] font-mono bg-white dark:bg-black/30 p-3 rounded-xl border border-gray-200 dark:border-white/5 space-y-1">
                <p>• Shortcode: <strong>600000</strong></p>
                <p>• Initiator: <strong>testapi</strong></p>
                <p>• Security: Sandbox Credential Hash</p>
              </div>
            </div>

            <div className="p-5 rounded-2xl border border-gray-200/80 dark:border-white/10 bg-gray-50/50 dark:bg-white/[0.01] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-brand-600 dark:text-brand-400">Phase 2: Live Penny Test</span>
                <Badge size="sm" color="warning">Client Proof</Badge>
              </div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">2. Live B2C Payout Verification</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                Once the client receives their production Paybill/Till with B2C enabled:
              </p>
              <div className="text-[11px] font-mono bg-white dark:bg-black/30 p-3 rounded-xl border border-gray-200 dark:border-white/5 space-y-1">
                <p>• Input live Daraja B2C credentials</p>
                <p>• Trigger a KES 10 test redemption</p>
                <p>• Verify instant M-Pesa cash receipt</p>
              </div>
            </div>

            <div className="p-5 rounded-2xl border border-gray-200/80 dark:border-white/10 bg-gray-50/50 dark:bg-white/[0.01] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-brand-600 dark:text-brand-400">Phase 3: Webhooks</span>
                <Badge size="sm" color="success">Automated</Badge>
              </div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">3. Asynchronous Webhooks</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                Safaricom posts completion telemetry directly to our public webhook:
              </p>
              <div className="text-[11px] font-mono bg-white dark:bg-black/30 p-3 rounded-xl border border-gray-200 dark:border-white/5">
                POST /api/mpesa/b2c/callback
              </div>
              <p className="text-[11px] text-gray-400">
                Automatically reconciles wallet transactions to <code>SUCCESS</code> and updates float balance.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
