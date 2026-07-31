"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Logo } from "@/components/common/Logo";

export default function LandingPage() {
  const [activeTab, setActiveTab] = useState<"analytics" | "telemetry" | "ussd">("analytics");

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-white font-satoshi selection:bg-brand-500 selection:text-white overflow-x-hidden transition-colors scroll-smooth">
      
      {/* 1. Header (Sticky & Glassmorphic) */}
      <header className="fixed top-0 left-0 right-0 z-50 py-4 px-4 sm:px-8 backdrop-blur-md bg-white/90 dark:bg-gray-950/90 border-b border-gray-200/80 dark:border-white/[0.08] flex justify-between items-center transition-all">
        <Logo size="md" href="/" />
        
        <nav className="hidden md:flex items-center gap-8 text-sm font-bold text-gray-600 dark:text-gray-300">
          <a href="#solutions" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">Solutions</a>
          <a href="#features" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">Platform</a>
          <a href="#security" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">Fraud prevention</a>
          <a href="#developers" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">Developers</a>
          <Link href="/terms" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">Terms</Link>
        </nav>

        <div className="flex items-center gap-4">
          <Link
            href="/auth/login"
            className="text-sm font-bold text-gray-700 dark:text-gray-200 hover:text-brand-600 dark:hover:text-brand-400 transition-colors px-3 py-2"
          >
            Sign in
          </Link>
          <Link
            href="/auth/register"
            className="px-5 py-2.5 text-sm font-bold rounded-full bg-gray-900 hover:bg-gray-800 dark:bg-brand-600 dark:hover:bg-brand-500 text-white shadow-sm transition hover:-translate-y-0.5"
          >
            Get started
          </Link>
        </div>
      </header>

      {/* 2. Enhanced Hero Section */}
      <main className="pt-32 sm:pt-40 pb-20 px-4 flex flex-col items-center text-center relative overflow-hidden">
        
        {/* Glowing Background Radial Orbs */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-full max-w-6xl h-[600px] bg-gradient-to-b from-brand-500/15 via-sky-500/5 to-transparent -z-10 rounded-b-full blur-3xl pointer-events-none" />
        <div className="absolute top-32 left-10 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-40 right-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Live Network Pill Badge */}
        <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-600 dark:text-brand-400 mb-6 text-sm font-bold tracking-wide animate-fadeIn shadow-2xs">
          <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
          Next-gen B2B2C Loyalty Switch · Safaricom M-Pesa B2C Live
        </div>
        
        {/* Hero Headline */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-gray-900 dark:text-white max-w-5xl mb-6 leading-[1.1] animate-fadeIn">
          Scale your enterprise rewards.<br className="hidden sm:block"/> 
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 via-sky-500 to-indigo-600 dark:from-brand-400 dark:via-sky-400 dark:to-indigo-400">
            Secure your liability.
          </span>
        </h1>
        
        {/* Subhead Paragraph */}
        <p className="text-base sm:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mb-10 leading-relaxed animate-fadeIn">
          Built for complex distribution networks. Manage multi-tier sales hierarchies, orchestrate physical voucher batches, and automate campaign payouts—all protected by a real-time anti-fraud rules engine.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center animate-fadeIn mb-16">
          <Link
            href="/auth/register"
            className="w-full sm:w-auto px-8 py-4 text-sm sm:text-base font-bold rounded-full bg-brand-600 hover:bg-brand-700 text-white shadow-xl shadow-brand-500/25 transition hover:-translate-y-0.5 flex items-center justify-center gap-2"
          >
            <span>Build your platform</span>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
          </Link>
          <Link
            href="/docs"
            className="w-full sm:w-auto px-8 py-4 text-sm sm:text-base font-bold rounded-full bg-white dark:bg-white/5 text-gray-700 dark:text-gray-200 border border-gray-200/80 dark:border-white/10 shadow-2xs hover:bg-gray-50 dark:hover:bg-white/10 transition flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            Explore API Reference
          </Link>
        </div>

        {/* 3. Interactive Command Center Dashboard Preview */}
        <div className="w-full max-w-6xl rounded-2xl border border-gray-200/80 dark:border-white/10 bg-white dark:bg-gray-900 p-2.5 shadow-2xl relative group z-10 animate-fadeIn">
           
           {/* Floating Accent Card Left (Desktop) */}
           <div className="hidden lg:flex absolute -left-8 top-1/4 -translate-y-1/2 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border border-gray-200/80 dark:border-white/10 p-4 rounded-2xl shadow-xl z-20 items-center gap-3 animate-bounce-slow">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center font-bold">
                🛡️
              </div>
              <div className="text-left">
                <div className="text-xs font-bold text-gray-900 dark:text-white">Anti-Fraud Engine</div>
                <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">&lt; 45ms rule evaluation</div>
              </div>
           </div>

           {/* Floating Accent Card Right (Desktop) */}
           <div className="hidden lg:flex absolute -right-8 bottom-1/4 translate-y-1/2 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border border-gray-200/80 dark:border-white/10 p-4 rounded-2xl shadow-xl z-20 items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center justify-center font-bold">
                💸
              </div>
              <div className="text-left">
                <div className="text-xs font-bold text-gray-900 dark:text-white">Instant M-Pesa Dispatches</div>
                <div className="text-[11px] text-gray-400 font-medium">Safaricom B2C shortcode connected</div>
              </div>
           </div>

           <div className="rounded-xl overflow-hidden border border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-gray-950 flex flex-col h-[540px]">
              
              {/* Window Bar with Interactive Tabs */}
              <div className="h-13 border-b border-gray-200/80 dark:border-white/10 bg-white dark:bg-gray-900 flex items-center px-4 justify-between gap-4 overflow-x-auto">
                <div className="flex items-center gap-2 shrink-0">
                  <div className="w-3.5 h-3.5 rounded-full bg-rose-400/80" />
                  <div className="w-3.5 h-3.5 rounded-full bg-amber-400/80" />
                  <div className="w-3.5 h-3.5 rounded-full bg-emerald-400/80" />
                </div>
                
                {/* View Toggles */}
                <div className="flex items-center gap-1.5 bg-gray-100 dark:bg-white/5 p-1 rounded-xl shrink-0">
                  <button
                    onClick={() => setActiveTab("analytics")}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
                      activeTab === "analytics"
                        ? "bg-white dark:bg-gray-800 text-brand-600 dark:text-brand-400 shadow-2xs"
                        : "text-gray-500 hover:text-gray-900 dark:hover:text-white"
                    }`}
                  >
                    📊 Tenant Analytics
                  </button>
                  <button
                    onClick={() => setActiveTab("telemetry")}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
                      activeTab === "telemetry"
                        ? "bg-white dark:bg-gray-800 text-brand-600 dark:text-brand-400 shadow-2xs"
                        : "text-gray-500 hover:text-gray-900 dark:hover:text-white"
                    }`}
                  >
                    ⚡ Live Fraud Telemetry
                  </button>
                  <button
                    onClick={() => setActiveTab("ussd")}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
                      activeTab === "ussd"
                        ? "bg-white dark:bg-gray-800 text-brand-600 dark:text-brand-400 shadow-2xs"
                        : "text-gray-500 hover:text-gray-900 dark:hover:text-white"
                    }`}
                  >
                    📲 USSD (*483*55#) Simulator
                  </button>
                </div>

                <div className="text-xs font-mono text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-full shrink-0 font-bold">
                  ● LIVE
                </div>
              </div>
              
              {/* Mock Dashboard Body */}
              <div className="flex flex-1 overflow-hidden text-left">
                
                {/* Sidebar Navigation */}
                <div className="w-60 bg-white dark:bg-gray-900 border-r border-gray-200/80 dark:border-white/10 p-4 space-y-1.5 hidden md:block">
                  <div className="flex items-center gap-3 px-3.5 py-2.5 bg-brand-500/10 text-brand-600 dark:text-brand-400 rounded-xl font-bold text-sm border border-brand-500/20">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
                    Overview
                  </div>
                  {['Consumers CRM', 'Campaign Master', 'Rewards Catalog', 'Voucher Batches', 'Fraud Console', 'API Credentials'].map((item, i) => (
                    <div key={i} className="px-3.5 py-2.5 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 rounded-xl font-medium text-sm cursor-pointer">
                      {item}
                    </div>
                  ))}
                </div>
                
                {/* Dynamic Content Views */}
                <div className="flex-1 p-6 overflow-y-auto bg-gray-50/50 dark:bg-gray-950/50">
                  
                  {/* TAB 1: ANALYTICS */}
                  {activeTab === "analytics" && (
                    <div className="space-y-6 animate-fadeIn">
                      <div className="flex justify-between items-center">
                        <div>
                          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Tenant Executive Analytics</h2>
                          <p className="text-xs sm:text-sm text-gray-400">Real-time liability balance and campaign payout velocity</p>
                        </div>
                        <div className="text-sm border border-gray-200/80 dark:border-white/10 bg-white dark:bg-gray-900 px-3.5 py-2 rounded-xl font-medium text-gray-600 dark:text-gray-300 shadow-2xs">
                          Last 30 days ▼
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-white/10 rounded-2xl p-5 shadow-2xs">
                          <div className="text-gray-400 text-xs font-semibold mb-1">Total points liability</div>
                          <div className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white">12.4M pts</div>
                          <div className="text-emerald-600 dark:text-emerald-400 text-xs font-bold mt-2 flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                            +4.2% Earned velocity
                          </div>
                        </div>
                        
                        <div className="bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-white/10 rounded-2xl p-5 shadow-2xs">
                          <div className="text-gray-400 text-xs font-semibold mb-1">Active fraud flags</div>
                          <div className="text-2xl sm:text-3xl font-black text-amber-500">14 alerts</div>
                          <div className="text-amber-600 dark:text-amber-400 text-xs font-bold mt-2">100% blocked automatically</div>
                        </div>

                        <div className="bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-white/10 rounded-2xl p-5 shadow-2xs">
                          <div className="text-gray-400 text-xs font-semibold mb-1">M-Pesa B2C Cash Dispatches</div>
                          <div className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white">KES 428,000</div>
                          <div className="text-brand-600 dark:text-brand-400 text-xs font-bold mt-2">94 Queued mobile payouts</div>
                        </div>
                      </div>

                      <div className="bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-white/10 rounded-2xl p-5 shadow-2xs h-40 flex flex-col justify-between">
                        <div className="text-sm font-bold text-gray-800 dark:text-gray-200">Redemption vs issuance velocity</div>
                        <div className="w-full h-full mt-3 relative flex items-end gap-2 border-b border-gray-100 dark:border-white/5">
                          {[35, 55, 45, 75, 65, 95, 85, 100].map((h, i) => (
                            <div key={i} className="flex-1 flex gap-1 justify-center items-end h-full">
                              <div className="w-1/2 bg-brand-500/20 rounded-t-sm" style={{ height: `${h}%` }} />
                              <div className="w-1/2 bg-brand-500 rounded-t-sm" style={{ height: `${h * 0.7}%` }} />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB 2: LIVE TELEMETRY */}
                  {activeTab === "telemetry" && (
                    <div className="space-y-4 animate-fadeIn">
                      <div className="flex justify-between items-center mb-2">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Live Event Stream</h2>
                        <span className="text-xs font-mono text-emerald-500">Listening to webhooks...</span>
                      </div>
                      
                      <div className="space-y-3 font-mono text-xs">
                        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="px-2 py-0.5 rounded bg-emerald-500 text-white font-bold">M-PESA B2C</span>
                            <span className="text-gray-900 dark:text-white font-bold">Dispatched KES 1,500</span>
                            <span className="text-gray-400">MSISDN: 254712***891</span>
                          </div>
                          <span className="text-emerald-500 font-bold">CONFIRMED (TX_901)</span>
                        </div>

                        <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="px-2 py-0.5 rounded bg-amber-500 text-white font-bold">FRAUD RULE</span>
                            <span className="text-amber-900 dark:text-amber-200 font-bold">Duplicate Scratch PIN Blocked</span>
                            <span className="text-gray-400 font-bold">PIN: 981240182741</span>
                          </div>
                          <span className="text-amber-600 font-bold">REJECTED (403)</span>
                        </div>

                        <div className="p-3.5 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="px-2 py-0.5 rounded bg-blue-500 text-white font-bold">POINTS SCAN</span>
                            <span className="text-gray-900 dark:text-white font-bold">+250 Trade Points Credited</span>
                            <span className="text-gray-400">Dealer: BuildMatrix Westlands</span>
                          </div>
                          <span className="text-blue-500 font-bold">SUCCESS</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB 3: USSD SIMULATOR */}
                  {activeTab === "ussd" && (
                    <div className="space-y-4 animate-fadeIn flex flex-col items-center justify-center min-h-[320px]">
                      <div className="w-full max-w-md bg-gray-900 text-white p-6 rounded-2xl font-mono text-sm border border-gray-800 shadow-xl space-y-4">
                        <div className="flex justify-between items-center text-xs text-gray-400 border-b border-gray-800 pb-2">
                          <span>Safaricom USSD Gateway</span>
                          <span className="text-emerald-400 font-bold">*483*55#</span>
                        </div>
                        <div className="space-y-2 text-gray-200">
                          <p className="text-emerald-400 font-bold">Welcome to TuzoHub Rewards!</p>
                          <p>1. Enter Scratch Card PIN</p>
                          <p>2. Check Points Balance</p>
                          <p>3. Redeem M-Pesa Cashback</p>
                        </div>
                        <div className="bg-gray-800 p-2.5 rounded-xl text-gray-400 text-xs border border-gray-700 flex justify-between">
                          <span>Input: 1 (Scratch PIN)</span>
                          <span className="text-brand-400 font-bold">SEND</span>
                        </div>
                      </div>
                    </div>
                  )}

                </div>
              </div>
           </div>
        </div>

        {/* 4. High-Trust Metric Bar below Hero */}
        <div className="w-full max-w-5xl mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 text-center border-t border-gray-200/80 dark:border-white/10 pt-10">
          <div>
            <div className="text-3xl font-black text-gray-900 dark:text-white">99.99%</div>
            <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mt-1">Enterprise API Uptime</div>
          </div>
          <div>
            <div className="text-3xl font-black text-brand-600 dark:text-brand-400">&lt; 45ms</div>
            <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mt-1">Fraud Rule Evaluation</div>
          </div>
          <div>
            <div className="text-3xl font-black text-gray-900 dark:text-white">5.8M+</div>
            <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mt-1">Vouchers Hashed &amp; Dispatched</div>
          </div>
          <div>
            <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400">100%</div>
            <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mt-1">KDPA 2019 Compliant</div>
          </div>
        </div>

      </main>

      {/* 3. Trusted Enterprises Banner */}
      <section className="py-14 border-y border-gray-200/80 dark:border-white/10 bg-gray-50/50 dark:bg-gray-900/50">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-xs sm:text-sm font-bold tracking-widest text-gray-400 uppercase mb-8">
            Trusted by scalable enterprise distribution networks
          </p>
          <div className="flex flex-wrap justify-center gap-10 md:gap-16 items-center opacity-60">
            <h3 className="text-xl font-black tracking-tight text-gray-800 dark:text-gray-200">AgriCorp East Africa</h3>
            <h3 className="text-xl font-bold font-serif text-gray-800 dark:text-gray-200">BuildMatrix Cement</h3>
            <h3 className="text-xl font-extrabold tracking-tighter text-gray-800 dark:text-gray-200">FMCG Global Holdings</h3>
            <h3 className="text-xl font-semibold italic text-gray-800 dark:text-gray-200">RetailLink Kenya</h3>
            <h3 className="text-xl font-bold uppercase tracking-widest text-gray-800 dark:text-gray-200">AutoParts Direct</h3>
          </div>
        </div>
      </section>

      {/* 3.5 Innovative Human Impact Feature Spotlight Section */}
      <section className="py-24 px-4 sm:px-8 bg-white dark:bg-gray-950 overflow-hidden relative">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          
          {/* Left Column: Image with Floating Live Overlays */}
          <div className="lg:col-span-6 relative">
            
            {/* Background Glow Ring */}
            <div className="absolute -inset-4 bg-gradient-to-r from-brand-500/20 via-sky-500/10 to-purple-500/20 rounded-3xl blur-2xl -z-10 pointer-events-none" />
            
            <div className="relative rounded-3xl overflow-hidden border border-gray-200/80 dark:border-white/10 bg-gray-900 shadow-2xl group">
              <img
                src="/images/landing/landing1.jpg"
                alt="African Retail & Loyalty Beneficiary"
                className="w-full h-[480px] sm:h-[560px] object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-gray-950/80 via-transparent to-black/20" />

              {/* Overlay Badge Top Right */}
              <div className="absolute top-5 right-5 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border border-gray-200/80 dark:border-white/10 px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-3 animate-fadeIn">
                <span className="flex h-3 w-3 rounded-full bg-emerald-500 animate-pulse" />
                <div className="text-left">
                  <div className="text-xs font-bold text-gray-900 dark:text-white">M-PESA B2C Disbursement</div>
                  <div className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">+ KES 2,500 Instant Cash</div>
                </div>
              </div>

              {/* Overlay Badge Bottom Left */}
              <div className="absolute bottom-6 left-6 right-6 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md border border-gray-200/80 dark:border-white/10 p-4 rounded-2xl shadow-xl flex items-center justify-between gap-4 animate-fadeIn">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center font-bold text-lg border border-brand-500/20">
                    ⭐
                  </div>
                  <div>
                    <div className="text-xs font-bold text-gray-900 dark:text-white">Verified Retail Partner</div>
                    <div className="text-[11px] text-gray-500 dark:text-gray-400">Nairobi, Kenya · 5,000 Points Redeemed</div>
                  </div>
                </div>
                <div className="px-3 py-1 bg-brand-600 text-white rounded-full text-xs font-bold shrink-0">
                  Active User
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Narrative Content */}
          <div className="lg:col-span-6 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-600 dark:text-brand-400 text-xs font-bold uppercase tracking-wider">
              Human-Centric Impact · Instant Value
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 dark:text-white tracking-tight leading-[1.15]">
              Connecting Enterprises to Real Tradespeople &amp; Consumers
            </h2>

            <p className="text-base sm:text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
              TuzoHub bridges enterprise manufacturer distribution channels with everyday painters, contractors, stockists, and consumers. Deliver tangible, instant value directly into their mobile wallets.
            </p>

            <div className="space-y-4 pt-2">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/20 font-bold">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <div>
                  <h4 className="text-base font-bold text-gray-900 dark:text-white">Zero-Delay M-Pesa Cashbacks</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                    No waiting weeks for manual claim approvals. Scans immediately trigger automated Daraja B2C mobile money payouts.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0 border border-purple-500/20 font-bold">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                </div>
                <div>
                  <h4 className="text-base font-bold text-gray-900 dark:text-white">USSD &amp; Offline Accessibility</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                    Reach tradespeople and retailers using basic feature phones via automated USSD menus (*483*55#) and SMS.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-4">
              <Link
                href="/auth/register"
                className="inline-flex items-center gap-2.5 text-sm sm:text-base font-bold text-brand-600 dark:text-brand-400 hover:underline"
              >
                <span>Launch your consumer loyalty campaign</span>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
              </Link>
            </div>
          </div>

        </div>
      </section>


      {/* 4. Enterprise Solutions Section (#solutions) */}
      <section id="solutions" className="py-24 px-4 sm:px-8 bg-gray-50/50 dark:bg-gray-900/30 scroll-mt-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <span className="text-sm font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">Tailored Enterprise Solutions</span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              Multi-Tenant Architecture for Every Sales Layer
            </h2>
            <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
              Whether you are paying instant M-Pesa cashbacks to painters, accumulating trade points for cement dealers, or running consumer promo campaigns, TuzoHub isolates every tenant&apos;s data and credentials.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-white/10 rounded-2xl p-8 space-y-4 shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold border border-blue-500/20">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Safaricom M-Pesa B2C Cashbacks</h3>
              <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 leading-relaxed">
                Connect your Safaricom B2C shortcodes to automatically dispatch cash rewards directly to contractors upon valid scratch-card scans.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-white/10 rounded-2xl p-8 space-y-4 shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold border border-purple-500/20">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Tiered Points Accumulation</h3>
              <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 leading-relaxed">
                Bank points across multiple purchases, configure expiration rules, and let distributors redeem points from a customized rewards catalog.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-white/10 rounded-2xl p-8 space-y-4 shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold border border-emerald-500/20">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">USSD (*483*55#) &amp; SMS Channels</h3>
              <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400 leading-relaxed">
                Reach non-smartphone users in rural distribution networks with automated USSD menus and instant SMS receipt confirmations.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Core Platform Features (#features) */}
      <section id="features" className="py-24 px-4 sm:px-8 bg-white dark:bg-gray-950 scroll-mt-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              Built for the complexity of real-world commerce
            </h2>
            <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400">
              Basic loyalty apps fail at scale. TuzoHub provides the architectural backbone for multi-tier sales channels, hardware integration, and compliance.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            
            {/* Feature 1 */}
            <div className="bg-gray-50 dark:bg-white/[0.02] border border-gray-200/80 dark:border-white/10 rounded-2xl p-8 hover:shadow-md transition">
              <div className="w-12 h-12 rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center mb-5 border border-brand-500/20 font-bold">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">B2B sales hierarchies</h3>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 leading-relaxed">
                Map operational structures with precision. Assign roles from regional supervisors down to field agents and dealers.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-gray-50 dark:bg-white/[0.02] border border-gray-200/80 dark:border-white/10 rounded-2xl p-8 hover:shadow-md transition">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-5 border border-amber-500/20 font-bold">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Voucher batch logistics</h3>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 leading-relaxed">
                Generate hashed physical scratch card batches. Track lifecycle statuses from print to redemption to prevent inventory shrinkage.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-gray-50 dark:bg-white/[0.02] border border-gray-200/80 dark:border-white/10 rounded-2xl p-8 hover:shadow-md transition">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-5 border border-emerald-500/20 font-bold">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">USSD &amp; Kenya phone input</h3>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 leading-relaxed">
                Seamlessly format Kenyan contact credentials (+254) and integrate offline USSD queues to reach every distributor.
              </p>
            </div>

          </div>

          {/* Retail Scan Visual Feature Block using landing2.jpg */}
          <div className="mt-16 rounded-3xl border border-gray-200/80 dark:border-white/10 bg-gray-50/70 dark:bg-gray-900/50 p-8 sm:p-12 overflow-hidden grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-6 space-y-5 text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider">
                ⚡ Instant Mobile Verification
              </div>
              <h3 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                Seamless Point-of-Sale &amp; Retail Scratch Verification
              </h3>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 leading-relaxed">
                Enable store clerks, painters, and retail customers to scan scratch-cards or QR codes on site. TuzoHub validates card authenticity instantly before authorizing cash payouts or points accrual.
              </p>
              <div className="flex items-center gap-6 pt-2 text-sm font-bold text-gray-800 dark:text-gray-200">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  Instant QR/PIN Reader
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-brand-500" />
                  Safaricom M-Pesa Integrated
                </div>
              </div>
            </div>

            <div className="lg:col-span-6 relative">
              <div className="rounded-2xl overflow-hidden border border-gray-200 dark:border-white/10 shadow-2xl relative group">
                <img
                  src="/images/landing/landing2.jpg"
                  alt="Store Clerk Scanning Retail Scratch Card"
                  className="w-full h-80 sm:h-96 object-cover object-center group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-950/70 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 bg-white/90 dark:bg-gray-900/90 backdrop-blur-md p-3.5 rounded-xl border border-gray-200/80 dark:border-white/10 flex items-center justify-between text-xs font-bold">
                  <span className="text-gray-900 dark:text-white">SCAN &amp; WIN Scratch Card</span>
                  <span className="text-emerald-500 bg-emerald-500/10 px-2.5 py-1 rounded-md">VERIFIED ✔</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 6. Fraud Prevention & Security Section (#security) */}
      <section id="security" className="py-24 px-4 sm:px-8 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200/80 dark:border-white/10 scroll-mt-20">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-5">
            <span className="text-sm font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">Anti-Fraud Engine</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">Real-Time Velocity &amp; Fraud Prevention</h2>
            <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
              Protect your brand against redemption abuse. TuzoHub continuously evaluates scan velocities, failed attempts, and geographic anomalies to flag suspicious activity before dispatches are authorized.
            </p>
            <div className="pt-3 flex flex-col gap-3 text-sm sm:text-base text-gray-700 dark:text-gray-300 font-semibold">
              <div className="flex items-center gap-3">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                Max failed redemption thresholds per hour
              </div>
              <div className="flex items-center gap-3">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                Row-level database tenant isolation &amp; RSA payload encryption
              </div>
              <div className="flex items-center gap-3">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                Immutable audit logs compliant with Kenya Data Protection Act 2019
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-gray-950 p-8 shadow-xl space-y-5">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-white/5 pb-4">
              <span className="text-sm font-bold text-gray-900 dark:text-white">Live Fraud Telemetry</span>
              <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 text-xs font-bold">Active Engine</span>
            </div>
            <div className="space-y-4 text-sm">
              <div className="p-4 rounded-xl bg-gray-50 dark:bg-white/[0.02] flex items-center justify-between border border-gray-100 dark:border-white/5">
                <div>
                  <div className="font-bold text-gray-900 dark:text-white text-base">Velocity Check</div>
                  <div className="text-xs text-gray-400 mt-0.5">Max 5 redemptions / hour / MSISDN</div>
                </div>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">PASSED</span>
              </div>
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between">
                <div>
                  <div className="font-bold text-amber-900 dark:text-amber-300 text-base">Duplicate PIN Attempt</div>
                  <div className="text-xs text-amber-700 dark:text-amber-400 mt-0.5">Flagged &amp; Blocked</div>
                </div>
                <span className="text-amber-600 font-bold">BLOCKED</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Developer & API Section (#developers) featuring landing3.jpg */}
      <section id="developers" className="py-24 px-4 sm:px-8 bg-gray-900 text-white relative overflow-hidden scroll-mt-20">
        <div className="max-w-7xl mx-auto space-y-12">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Developer Text Info */}
            <div className="lg:col-span-6 space-y-5">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-500/20 border border-brand-500/30 text-brand-400 text-sm font-bold uppercase tracking-wider">
                Developer First Platform
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-[1.15]">
                REST API &amp; Webhook Infrastructure
              </h2>
              <p className="text-base sm:text-lg text-gray-300 leading-relaxed">
                Build custom rewards workflows or integrate existing ERP, POS, or Mobile Money gateways using our predictable RESTful endpoints and secure event signatures.
              </p>
              <div className="flex items-center gap-4 pt-2">
                <Link
                  href="/docs"
                  className="px-6 py-3.5 rounded-full bg-brand-600 hover:bg-brand-500 text-white font-bold text-sm transition shadow-lg flex items-center gap-2"
                >
                  <span>Explore Developer Portal</span>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                </Link>
              </div>
            </div>

            {/* Developer Photo Card using landing3.jpg */}
            <div className="lg:col-span-6 relative">
              <div className="rounded-2xl overflow-hidden border border-gray-800 shadow-2xl relative group">
                <img
                  src="/images/landing/landing3.jpg"
                  alt="Developer working on TuzoHub API integration"
                  className="w-full h-80 sm:h-[380px] object-cover object-center group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-950/80 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 bg-gray-950/90 backdrop-blur-md p-3.5 rounded-xl border border-gray-800 flex items-center justify-between text-xs font-mono">
                  <span className="text-brand-400 font-bold">SDK: TypeScript &amp; Python</span>
                  <span className="text-emerald-400 font-bold">● REST API v1 Live</span>
                </div>
              </div>
            </div>

          </div>

          {/* Interactive Code Snippet Window */}
          <div className="bg-[#0c111d] rounded-2xl p-6 border border-gray-800 font-mono text-sm shadow-2xl max-w-4xl mx-auto">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3 mb-4">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-rose-500" />
                <div className="w-3 h-3 rounded-full bg-amber-500" />
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
              </div>
              <span className="text-xs text-gray-500 font-bold">POST /api/vouchers/redeem</span>
            </div>
            <div className="text-sky-400 mb-2 font-bold text-base">POST <span className="text-white">/api/vouchers/redeem</span></div>
            <div className="text-gray-400">{`{`}</div>
            <div className="text-gray-300 ml-4 space-y-1.5">
              <div><span className="text-pink-400">&quot;x-tenant-api-key&quot;</span>: <span className="text-emerald-400">&quot;sk_live_8f92...&quot;</span>,</div>
              <div><span className="text-pink-400">&quot;pin_code&quot;</span>: <span className="text-emerald-400">&quot;981240182741&quot;</span>,</div>
              <div><span className="text-pink-400">&quot;msisdn&quot;</span>: <span className="text-emerald-400">&quot;254726444005&quot;</span>,</div>
              <div><span className="text-pink-400">&quot;idempotency_key&quot;</span>: <span className="text-emerald-400">&quot;tx_u82ha_001&quot;</span></div>
            </div>
            <div className="text-gray-400">{`}`}</div>
          </div>

        </div>
      </section>

      {/* 8. Comprehensive Accessible Footer */}
      <footer className="border-t border-gray-200/80 dark:border-white/10 bg-white dark:bg-gray-950 pt-16 pb-12 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10 mb-14 text-sm">
          {/* Col 1: Brand */}
          <div className="space-y-4 md:col-span-1">
            <Logo size="md" href="/" />
            <p className="text-gray-500 dark:text-gray-400 leading-relaxed text-sm">
              Multi-tenant B2B2C loyalty platform orchestrating product vouchers, points, and Safaricom M-Pesa cash disbursements.
            </p>
          </div>

          {/* Col 2: Navigation Links */}
          <div className="space-y-3">
            <h4 className="font-bold text-gray-900 dark:text-white uppercase tracking-wider text-xs">Platform</h4>
            <ul className="space-y-2.5 text-gray-600 dark:text-gray-400 font-medium">
              <li><a href="#solutions" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">Solutions</a></li>
              <li><a href="#features" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">Platform Features</a></li>
              <li><a href="#security" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">Fraud Prevention Engine</a></li>
              <li><a href="#developers" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">Developers &amp; API</a></li>
            </ul>
          </div>

          {/* Col 3: Resources & Docs */}
          <div className="space-y-3">
            <h4 className="font-bold text-gray-900 dark:text-white uppercase tracking-wider text-xs">Resources</h4>
            <ul className="space-y-2.5 text-gray-600 dark:text-gray-400 font-medium">
              <li><Link href="/docs" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">Developer API Docs</Link></li>
              <li><Link href="/auth/login" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">Tenant Sign In</Link></li>
              <li><Link href="/auth/register" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">Create Tenant Account</Link></li>
            </ul>
          </div>

          {/* Col 4: Legal & Compliance */}
          <div className="space-y-3">
            <h4 className="font-bold text-gray-900 dark:text-white uppercase tracking-wider text-xs">Legal &amp; Compliance</h4>
            <ul className="space-y-2.5 text-gray-600 dark:text-gray-400">
              <li>
                <Link href="/terms" className="font-semibold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="font-semibold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/security" className="font-semibold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                  Security &amp; Compliance
                </Link>
              </li>
              <li className="text-xs text-gray-400 pt-1">
                Kenya Data Protection Act, 2019 Compliant
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="max-w-7xl mx-auto pt-8 border-t border-gray-100 dark:border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500">
          <p>© {new Date().getFullYear()} TuzoHub by Oduktech. All rights reserved.</p>
          
          <div className="flex items-center gap-2.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-4 py-1.5 rounded-full border border-emerald-500/20 font-bold text-xs">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
            System Status: All Systems Operational
          </div>
        </div>
      </footer>
    </div>
  );
}