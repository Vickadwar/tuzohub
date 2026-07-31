"use client";

import React, { useState } from "react";
import Link from "next/link";

interface TopicSection {
  id: string;
  title: string;
  category: "getting-started" | "workflows" | "integrations" | "roles";
  icon: string;
  summary: string;
  content: React.ReactNode;
}

export default function DocumentationPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [activeTopicId, setActiveTopicId] = useState<string>("system-overview");

  const topics: TopicSection[] = [
    {
      id: "system-overview",
      title: "TuzoHub System Overview",
      category: "getting-started",
      icon: "🌐",
      summary: "Understand how TuzoHub connects physical products, vouchers, customer interactions, and instant M-Pesa payouts.",
      content: (
        <div className="space-y-6">
          <div className="rounded-xl border border-brand-500/20 bg-brand-50/50 p-5 dark:bg-brand-500/10 dark:border-brand-500/20">
            <h3 className="text-base font-bold text-brand-900 dark:text-brand-200">What is TuzoHub?</h3>
            <p className="mt-2 text-sm leading-relaxed text-brand-800 dark:text-brand-300">
              TuzoHub is an enterprise <strong>Loyalty & Instant Financial Disbursement Platform</strong> designed for consumer goods, manufacturing, and distribution networks. It bridges physical product vouchers (QR codes or scratch card PINs) directly to instant mobile money (M-Pesa B2C) cash payouts or reward points.
            </p>
          </div>

          <h4 className="text-sm font-bold uppercase tracking-wider text-gray-900 dark:text-white">How the System Works in 4 Steps</h4>
          
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-white/5">
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 font-bold text-xs text-brand-700 dark:bg-brand-500/20 dark:text-brand-300">1</span>
                <h5 className="font-semibold text-gray-900 dark:text-white text-sm">Product & Vouchers</h5>
              </div>
              <p className="mt-2 text-xs text-gray-600 dark:text-gray-400">
                You create products (e.g. Paint Cans) and generate unique voucher batches. Each voucher receives a secure, scannable QR code or numeric PIN code printed on factory packaging.
              </p>
            </div>

            <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-white/5">
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 font-bold text-xs text-brand-700 dark:bg-brand-500/20 dark:text-brand-300">2</span>
                <h5 className="font-semibold text-gray-900 dark:text-white text-sm">Customer Interaction</h5>
              </div>
              <p className="mt-2 text-xs text-gray-600 dark:text-gray-400">
                Painters, retailers, or consumers buy the product and reveal the code. They claim rewards by dialing USSD (<code className="bg-gray-100 dark:bg-white/10 px-1 py-0.5 rounded text-brand-600 dark:text-brand-400">*483*55#</code>), scanning with Web QR, or sending SMS.
              </p>
            </div>

            <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-white/5">
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 font-bold text-xs text-brand-700 dark:bg-brand-500/20 dark:text-brand-300">3</span>
                <h5 className="font-semibold text-gray-900 dark:text-white text-sm">Automated Rule Engine</h5>
              </div>
              <p className="mt-2 text-xs text-gray-600 dark:text-gray-400">
                TuzoHub verifies voucher authenticity, checks fraud velocity rules, and calculates the reward value (e.g., KES 100 or 50 Points) based on your active Campaign Rules.
              </p>
            </div>

            <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-white/5">
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 font-bold text-xs text-brand-700 dark:bg-brand-500/20 dark:text-brand-300">4</span>
                <h5 className="font-semibold text-gray-900 dark:text-white text-sm">Instant M-Pesa Cash</h5>
              </div>
              <p className="mt-2 text-xs text-gray-600 dark:text-gray-400">
                The gateway automatically triggers a Safaricom Daraja B2C payout directly to the user&apos;s M-Pesa phone number in seconds, recording an audit receipt.
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "creating-campaigns",
      title: "Creating & Managing Campaigns",
      category: "workflows",
      icon: "📢",
      summary: "Learn how to configure reward campaigns, assign point values, and set up automated M-Pesa payouts.",
      content: (
        <div className="space-y-6">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Campaigns define <strong>how much reward money or points</strong> a user receives when they redeem a voucher from a specific product line or region.
          </p>

          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Steps to Create a New Campaign</h4>

            <ol className="space-y-3 pl-4 list-decimal text-xs text-gray-700 dark:text-gray-300">
              <li className="pl-1">
                Go to <strong>Campaigns & Marketing $\rightarrow$ Campaigns list</strong> and click <strong>New Campaign</strong>.
              </li>
              <li className="pl-1">
                <strong>Basic Details:</strong> Enter a campaign title (e.g. <em>Gamma Coatings Painter Cash Promo</em>) and select start/end dates.
              </li>
              <li className="pl-1">
                <strong>Reward Strategy:</strong> Choose between:
                <ul className="mt-1.5 ml-4 list-disc space-y-1 text-gray-600 dark:text-gray-400">
                  <li><strong>Instant B2C Payout:</strong> Customer receives cash directly to M-Pesa upon scanning.</li>
                  <li><strong>Banked Points:</strong> Points accumulate in the user&apos;s wallet until they request cash out.</li>
                </ul>
              </li>
              <li className="pl-1">
                <strong>Prerequisites & Rules:</strong> Set minimum point redemption thresholds, max daily limits, or limit payouts to verified painters/contractors.
              </li>
              <li className="pl-1">
                <strong>Save & Activate:</strong> Click <strong>Create Campaign</strong>. The engine will now automatically apply these reward rules to all incoming voucher scans.
              </li>
            </ol>
          </div>
        </div>
      ),
    },
    {
      id: "vouchers-and-inventory",
      title: "Generating & Printing Vouchers",
      category: "workflows",
      icon: "📦",
      summary: "How to generate factory voucher batches, export QR/PIN CSV files, and track printed inventory.",
      content: (
        <div className="space-y-6">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Vouchers are generated in <strong>Production Batches</strong> tied to specific products. Each voucher code is cryptographically unique and idempotent (cannot be reused).
          </p>

          <div className="rounded-lg bg-amber-50 p-4 border border-amber-200 dark:bg-amber-500/10 dark:border-amber-500/20">
            <h4 className="text-xs font-bold text-amber-900 dark:text-amber-300">💡 Important Printing Rule</h4>
            <p className="mt-1 text-xs text-amber-800 dark:text-amber-400">
              Export CSV files directly to your packaging printer. Never share plain PIN lists publicly. Once vouchers leave the factory, they start in state <code>GENERATED</code> or <code>ACTIVE</code>.
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Voucher Lifecycle Statuses</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-lg border border-gray-200 dark:border-white/10">
                <span className="inline-block px-2 py-0.5 rounded bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-300 font-mono font-semibold text-[10px]">GENERATED</span>
                <p className="mt-1 text-gray-600 dark:text-gray-400">Created in database, awaiting factory packaging or print output.</p>
              </div>
              <div className="p-3 rounded-lg border border-gray-200 dark:border-white/10">
                <span className="inline-block px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-300 font-mono font-semibold text-[10px]">ACTIVE</span>
                <p className="mt-1 text-gray-600 dark:text-gray-400">Live in circulation and ready to be redeemed by consumers.</p>
              </div>
              <div className="p-3 rounded-lg border border-gray-200 dark:border-white/10">
                <span className="inline-block px-2 py-0.5 rounded bg-purple-100 text-purple-800 dark:bg-purple-500/20 dark:text-purple-300 font-mono font-semibold text-[10px]">REDEEMED</span>
                <p className="mt-1 text-gray-600 dark:text-gray-400">Claimed by a consumer; cash/points dispatches are logged.</p>
              </div>
              <div className="p-3 rounded-lg border border-gray-200 dark:border-white/10">
                <span className="inline-block px-2 py-0.5 rounded bg-rose-100 text-rose-800 dark:bg-rose-500/20 dark:text-rose-300 font-mono font-semibold text-[10px]">FLAGGED / FRAUD</span>
                <p className="mt-1 text-gray-600 dark:text-gray-400">Blocked by system due to excessive rapid entries or invalid code guesses.</p>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "mpesa-b2c-setup",
      title: "Safaricom M-Pesa B2C Integration Guide",
      category: "integrations",
      icon: "💳",
      summary: "How to connect your Safaricom Daraja B2C credentials for Sandbox testing and Live production cash payouts.",
      content: (
        <div className="space-y-6">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            TuzoHub supports multi-tenant M-Pesa B2C payouts. Each organization inserts their own Daraja keys, and payouts disburse automatically to customers.
          </p>

          <div className="rounded-lg bg-blue-50 p-4 border border-blue-200 dark:bg-blue-500/10 dark:border-blue-500/20">
            <h4 className="text-xs font-bold text-blue-900 dark:text-blue-300">Step 1: Get Credentials from Safaricom Portal</h4>
            <p className="mt-1 text-xs text-blue-800 dark:text-blue-400">
              Log into <a href="https://developer.safaricom.co.ke" target="_blank" rel="noreferrer" className="underline font-semibold">developer.safaricom.co.ke</a>, create a B2C application, and copy your <strong>Consumer Key</strong> &amp; <strong>Consumer Secret</strong>.
            </p>
          </div>

          <div className="space-y-3 text-xs text-gray-700 dark:text-gray-300">
            <h4 className="font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 text-[11px]">Step 2: Enter Details in Integrations Manager</h4>
            <p>Go to <strong>Setup &amp; masters $\rightarrow$ Platform settings $\rightarrow$ Financial Payouts</strong>:</p>
            <ul className="list-disc pl-5 space-y-1.5 text-gray-600 dark:text-gray-400">
              <li><strong>Environment:</strong> Pick <code>Sandbox (Testing)</code> for development or <code>Production (Live)</code> for real cash payouts.</li>
              <li><strong>ShortCode:</strong> Enter <code>600997</code> for Sandbox testing or your official Paybill for Production.</li>
              <li><strong>Consumer Key &amp; Secret:</strong> Paste keys generated from Safaricom portal.</li>
              <li><strong>Initiator Details:</strong> Enter <code>testapi</code> and <code>SafaricomInitiatorPassword</code> for Sandbox, or your organization&apos;s live operator credentials.</li>
            </ul>
          </div>

          <div className="rounded-lg bg-emerald-50 p-4 border border-emerald-200 dark:bg-emerald-500/10 dark:border-emerald-500/20">
            <h4 className="text-xs font-bold text-emerald-900 dark:text-emerald-300">Step 3: Test OAuth Connection</h4>
            <p className="mt-1 text-xs text-emerald-800 dark:text-emerald-400">
              Click <strong>⚡ Test Daraja OAuth Connection</strong>. Once you see <code>✅ Successfully authenticated</code>, click <strong>Save Changes</strong>. You are live!
            </p>
          </div>
        </div>
      ),
    },
    {
      id: "ussd-and-messaging",
      title: "USSD & SMS Channels Guide",
      category: "integrations",
      icon: "📱",
      summary: "How consumers interact via USSD dialing strings (*483*55#) and SMS shortcodes.",
      content: (
        <div className="space-y-6">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            TuzoHub integrates with telecommunication aggregators (Africa&apos;s Talking, Olive Tree Media / Bonga SMS) to support feature phones via USSD menus.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="rounded-lg border border-gray-200 p-4 bg-white dark:border-white/10 dark:bg-white/5">
              <h4 className="font-bold text-gray-900 dark:text-white text-sm">USSD Menu Dialing</h4>
              <p className="mt-1 text-gray-600 dark:text-gray-400">
                Consumers dial <strong>*483*55#</strong> on any feature phone (Safaricom/Airtel/Telkom). The menu presents options to enter voucher PIN, view point balance, or request cash payouts.
              </p>
            </div>

            <div className="rounded-lg border border-gray-200 p-4 bg-white dark:border-white/10 dark:bg-white/5">
              <h4 className="font-bold text-gray-900 dark:text-white text-sm">SMS Automated Notifications</h4>
              <p className="mt-1 text-gray-600 dark:text-gray-400">
                Whenever a cash payout or redemption succeeds or fails, TuzoHub automatically dispatches an SMS receipt directly to the customer&apos;s mobile phone.
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "user-roles",
      title: "Roles & Access Control",
      category: "roles",
      icon: "🔐",
      summary: "Overview of user roles and what each team member can see and manage in TuzoHub.",
      content: (
        <div className="space-y-6">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            TuzoHub uses Role-Based Access Control (RBAC) to ensure staff members only see menus relevant to their responsibilities.
          </p>

          <div className="space-y-3">
            <div className="p-3.5 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 flex items-start gap-3">
              <span className="px-2 py-1 rounded bg-rose-100 text-rose-800 dark:bg-rose-500/20 dark:text-rose-300 font-mono text-[10px] font-bold">SYSTEM_ADMIN</span>
              <div>
                <h5 className="text-xs font-bold text-gray-900 dark:text-white">Platform Super Admin</h5>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">Full governance across all tenants, SaaS billing, platform security logs, and tenant provisioning.</p>
              </div>
            </div>

            <div className="p-3.5 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 flex items-start gap-3">
              <span className="px-2 py-1 rounded bg-brand-100 text-brand-800 dark:bg-brand-500/20 dark:text-brand-300 font-mono text-[10px] font-bold">TENANT_ADMIN</span>
              <div>
                <h5 className="text-xs font-bold text-gray-900 dark:text-white">Organization Administrator</h5>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">Manages organization settings, M-Pesa credentials, team members, roles, and platform rules.</p>
              </div>
            </div>

            <div className="p-3.5 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 flex items-start gap-3">
              <span className="px-2 py-1 rounded bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-300 font-mono text-[10px] font-bold">MANAGER</span>
              <div>
                <h5 className="text-xs font-bold text-gray-900 dark:text-white">Operations / Campaign Manager</h5>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">Creates campaigns, manages products &amp; voucher batches, monitors redemptions, and views reports.</p>
              </div>
            </div>

            <div className="p-3.5 rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 flex items-start gap-3">
              <span className="px-2 py-1 rounded bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-300 font-mono text-[10px] font-bold">OPERATOR / AGENT</span>
              <div>
                <h5 className="text-xs font-bold text-gray-900 dark:text-white">Field Agent / Terminal Operator</h5>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">Uses Terminal to manually redeem vouchers for over-the-counter customers and register new consumers.</p>
              </div>
            </div>
          </div>
        </div>
      ),
    },
  ];

  const filteredTopics = topics.filter((t) => {
    const matchesCategory = activeCategory === "all" || t.category === activeCategory;
    const matchesSearch =
      searchQuery === "" ||
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.summary.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const activeTopic = topics.find((t) => t.id === activeTopicId) || topics[0];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-xl border border-gray-200/80 bg-gradient-to-r from-brand-600 to-indigo-700 p-6 sm:p-8 text-white shadow-sm dark:border-white/10">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold backdrop-blur-md">
              <span>📖 Knowledge Base & User Guide</span>
            </div>
            <h1 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">TuzoHub User Guide</h1>
            <p className="mt-2 text-sm text-brand-100 max-w-2xl">
              Everything you need to know about setting up products, generating vouchers, managing marketing campaigns, and disbuing automated M-Pesa cash payouts.
            </p>
          </div>
          <div className="shrink-0">
            <Link
              href="/overview"
              className="inline-flex items-center gap-2 rounded-lg bg-white/20 px-4 py-2.5 text-xs font-semibold text-white backdrop-blur-md hover:bg-white/30 transition-colors"
            >
              <span>Back to Command Center</span>
              <span>→</span>
            </Link>
          </div>
        </div>

        {/* Quick Search Input */}
        <div className="mt-6 max-w-xl relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search documentation (e.g. B2C, M-Pesa, Vouchers, USSD, Campaigns)..."
            className="w-full rounded-lg border border-white/20 bg-white/10 pl-10 pr-4 py-3 text-sm text-white placeholder-brand-200 backdrop-blur-md focus:bg-white focus:text-gray-900 focus:placeholder-gray-400 focus:outline-none transition-all shadow-inner"
          />
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Topic Selector Sidebar */}
        <div className="lg:col-span-4 space-y-4">
          {/* Category Filter Pills */}
          <div className="flex flex-wrap gap-1.5 pb-1 border-b border-gray-200 dark:border-white/10">
            <button
              onClick={() => setActiveCategory("all")}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                activeCategory === "all"
                  ? "bg-brand-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-white/5 dark:text-gray-300"
              }`}
            >
              All Topics
            </button>
            <button
              onClick={() => setActiveCategory("getting-started")}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                activeCategory === "getting-started"
                  ? "bg-brand-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-white/5 dark:text-gray-300"
              }`}
            >
              Getting Started
            </button>
            <button
              onClick={() => setActiveCategory("workflows")}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                activeCategory === "workflows"
                  ? "bg-brand-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-white/5 dark:text-gray-300"
              }`}
            >
              Workflows
            </button>
            <button
              onClick={() => setActiveCategory("integrations")}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                activeCategory === "integrations"
                  ? "bg-brand-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-white/5 dark:text-gray-300"
              }`}
            >
              Integrations
            </button>
          </div>

          {/* Topic List */}
          <div className="space-y-2">
            {filteredTopics.map((topic) => {
              const isSelected = topic.id === activeTopicId;
              return (
                <button
                  key={topic.id}
                  onClick={() => setActiveTopicId(topic.id)}
                  className={`w-full text-left p-3.5 rounded-lg border transition-all ${
                    isSelected
                      ? "border-brand-500 bg-brand-50/50 shadow-sm dark:bg-brand-500/10 dark:border-brand-500/30"
                      : "border-gray-200 bg-white hover:border-gray-300 dark:border-white/10 dark:bg-white/5 dark:hover:border-white/20"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{topic.icon}</span>
                    <div className="flex-1 min-w-0">
                      <h4 className={`text-xs font-bold truncate ${isSelected ? "text-brand-900 dark:text-brand-200" : "text-gray-900 dark:text-white"}`}>
                        {topic.title}
                      </h4>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400 line-clamp-1 mt-0.5">
                        {topic.summary}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}

            {filteredTopics.length === 0 && (
              <div className="p-8 text-center rounded-lg border border-dashed border-gray-300 dark:border-white/10">
                <p className="text-xs text-gray-500 dark:text-gray-400">No matching topics found for &quot;{searchQuery}&quot;</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Topic Reader Body */}
        <div className="lg:col-span-8">
          <div className="rounded-xl border border-gray-200 bg-white shadow-sm dark:border-white/10 dark:bg-[#18181b] p-6 sm:p-8">
            <div className="flex items-center gap-3 pb-5 border-b border-gray-100 dark:border-white/5">
              <span className="text-3xl">{activeTopic.icon}</span>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
                  {activeTopic.category.replace("-", " ")}
                </span>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">{activeTopic.title}</h2>
              </div>
            </div>

            <div className="mt-6">
              {activeTopic.content}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
