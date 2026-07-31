"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Logo } from "@/components/common/Logo";

interface DocSection {
  id: string;
  title: string;
  group: "Overview" | "Core Endpoints" | "Events" | "Reference";
  badge?: string;
  description: string;
  keywords: string[];
}

export default function ApiDocsPage() {
  const [activeTab, setActiveTab] = useState<"curl" | "node" | "python" | "php">("curl");
  const [activeSection, setActiveSection] = useState<string>("quickstart");
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Exact 10 sections
  const sections: DocSection[] = [
    {
      id: "quickstart",
      title: "Quickstart & Base Environments",
      group: "Overview",
      description: "Base URLs, server environments, and operational health check endpoint.",
      keywords: ["base", "url", "health", "production", "sandbox", "quickstart", "environment"]
    },
    {
      id: "authentication",
      title: "API Authentication & Security",
      group: "Overview",
      description: "Tenant secret API key headers and security best practices.",
      keywords: ["auth", "key", "api key", "header", "x-tenant-api-key", "bearer", "token", "security"]
    },
    {
      id: "headers-idempotency",
      title: "Headers & Idempotency Keys",
      group: "Overview",
      description: "Prevent duplicate financial dispatches using unique UUID request headers.",
      keywords: ["idempotency", "header", "uuid", "retry", "duplicate", "financial"]
    },
    {
      id: "voucher-redeem",
      title: "Redeem Scratch Voucher",
      group: "Core Endpoints",
      badge: "POST",
      description: "Validate 10-16 digit scratch card PIN codes and dispatch recipient cash/points rewards.",
      keywords: ["voucher", "redeem", "scratch", "pin", "msisdn", "cashback", "points"]
    },
    {
      id: "mpesa-b2c",
      title: "Safaricom M-Pesa B2C Payout",
      group: "Core Endpoints",
      badge: "POST",
      description: "Direct B2C mobile money payout from Daraja shortcode to recipient phone.",
      keywords: ["mpesa", "b2c", "safaricom", "payout", "disbursement", "cash", "daraja", "promotionpayment"]
    },
    {
      id: "record-purchase",
      title: "Log Trade Purchase",
      group: "Core Endpoints",
      badge: "POST",
      description: "Record B2B trade invoices and compute loyalty points accumulation.",
      keywords: ["purchase", "invoice", "trade", "points", "b2b", "agent", "sku"]
    },
    {
      id: "ussd-gateway",
      title: "USSD Gateway Contract (*483#)",
      group: "Core Endpoints",
      badge: "GATEWAY",
      description: "Telecommunication callback handlers for Bonga, Africa's Talking, and Olive Tree Media.",
      keywords: ["ussd", "483", "bonga", "callback", "session", "text", "con", "end"]
    },
    {
      id: "webhooks",
      title: "Webhooks & Event Signatures",
      group: "Events",
      badge: "LISTEN",
      description: "Receive real-time transaction notifications and verify HMAC-SHA256 signatures.",
      keywords: ["webhook", "event", "hmac", "sha256", "signature", "notification", "listener"]
    },
    {
      id: "errors",
      title: "HTTP Errors & Response Matrix",
      group: "Reference",
      description: "Standard HTTP status codes, error payloads, and resolution guides.",
      keywords: ["errors", "http", "200", "400", "401", "422", "429", "rate limit", "matrix"]
    },
    {
      id: "support",
      title: "Developer & Engineering Support",
      group: "Reference",
      description: "Direct contact channels with Oduktech enterprise engineering team.",
      keywords: ["support", "contact", "email", "phone", "oduktech", "help", "engineering"]
    },
  ];

  // Filter sections based on search query
  const filteredSections = searchQuery.trim() === ""
    ? sections
    : sections.filter(
        (s) =>
          s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          s.keywords.some((k) => k.toLowerCase().includes(searchQuery.toLowerCase()))
      );

  // Helper for Prev / Next step navigation
  const currentIndex = sections.findIndex((s) => s.id === activeSection);
  const prevSection = currentIndex > 0 ? sections[currentIndex - 1] : null;
  const nextSection = currentIndex < sections.length - 1 ? sections[currentIndex + 1] : null;

  // Keyboard shortcut Ctrl+K or Cmd+K to focus search input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Handle URL hash on initial page load
  useEffect(() => {
    const hash = window.location.hash.replace("#", "");
    if (hash && sections.some((s) => s.id === hash)) {
      setActiveSection(hash);
      setTimeout(() => scrollToSection(hash), 200);
    }
  }, []);

  // Smooth IntersectionObserver for 100% natural ScrollSpy
  useEffect(() => {
    const observerCallback: IntersectionObserverCallback = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    };

    const observerOptions: IntersectionObserverInit = {
      root: null,
      rootMargin: "-15% 0px -50% 0px",
      threshold: 0.1,
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    sections.forEach((sec) => {
      const el = document.getElementById(sec.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [sections]);

  // Smooth scroll handler using native Element.scrollIntoView
  const scrollToSection = (id: string) => {
    setActiveSection(id);
    window.history.replaceState(null, "", `#${id}`);

    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    setMobileMenuOpen(false);
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-gray-950 text-gray-900 dark:text-white font-satoshi selection:bg-brand-500 selection:text-white flex flex-col transition-colors">
      
      {/* 1. Header Bar */}
      <header className="sticky top-0 z-50 py-3.5 px-6 bg-white/95 dark:bg-gray-950/95 backdrop-blur-md border-b border-gray-200/80 dark:border-white/[0.08] flex justify-between items-center shrink-0 shadow-2xs w-full">
        <div className="flex items-center gap-3">
          <Logo size="md" href="/" />
          <span className="hidden sm:inline-block text-sm font-bold text-gray-400 dark:text-gray-500">|</span>
          <span className="text-sm font-bold text-brand-600 dark:text-brand-400 tracking-wide uppercase flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
            Developer API Reference
          </span>
        </div>

        {/* Global Live Search Input */}
        <div className="hidden md:flex items-center relative w-72 lg:w-96">
          <svg className="w-4 h-4 text-gray-400 absolute left-3.5 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search API docs... (Press ⌘K)"
            className="w-full pl-10 pr-12 py-2 bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-full text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500/50 transition"
          />
          <span className="absolute right-3 text-[11px] font-mono font-bold text-gray-400 bg-gray-200 dark:bg-gray-800 px-1.5 py-0.5 rounded">
            ⌘K
          </span>
        </div>

        <div className="flex items-center gap-4 text-sm font-semibold">
          <Link href="/" className="hidden sm:flex items-center gap-1.5 text-gray-600 dark:text-gray-400 hover:text-brand-600 dark:hover:text-brand-400 transition">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
            Home
          </Link>
          <Link href="/terms" className="hidden lg:block text-gray-600 dark:text-gray-400 hover:text-brand-600 dark:hover:text-brand-400 transition">
            Terms
          </Link>
          <Link href="/privacy" className="hidden lg:block text-gray-600 dark:text-gray-400 hover:text-brand-600 dark:hover:text-brand-400 transition">
            Privacy
          </Link>
          <Link href="/security" className="hidden lg:block text-gray-600 dark:text-gray-400 hover:text-brand-600 dark:hover:text-brand-400 transition">
            Security
          </Link>
          
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg border border-gray-200 dark:border-white/10 text-gray-600 dark:text-gray-300"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>

          <Link
            href="/auth/login"
            className="px-5 py-2 rounded-full bg-brand-600 hover:bg-brand-700 text-white shadow-sm transition font-bold"
          >
            Sign In
          </Link>
        </div>
      </header>

      {/* Mobile Nav Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-white/10 p-4 space-y-3 text-sm">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search documentation..."
              className="w-full pl-9 pr-4 py-2 bg-white dark:bg-gray-950 border border-gray-200 dark:border-white/10 rounded-xl text-sm"
            />
            <svg className="w-4 h-4 text-gray-400 absolute left-3 top-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          <div className="font-bold text-gray-400 uppercase text-xs px-2">API Documentation Menu</div>
          {filteredSections.map((sec) => (
            <button
              key={sec.id}
              onClick={() => scrollToSection(sec.id)}
              className={`w-full text-left px-3.5 py-2.5 rounded-xl transition flex items-center justify-between ${
                activeSection === sec.id
                  ? "bg-brand-600 text-white font-bold shadow-2xs"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/5"
              }`}
            >
              <span>{sec.title}</span>
              {sec.badge && (
                <span className="px-2 py-0.5 text-xs rounded font-mono bg-white/20 text-white font-bold">
                  {sec.badge}
                </span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Expanded Layout: Full Screen Span with Edge Padding (Breathing Space without pinched center box) */}
      <div className="w-full flex-1 flex px-6 py-6 gap-6">
        
        {/* 2. Sticky Sidebar Navigation */}
        <aside className="w-64 sm:w-72 bg-white dark:bg-gray-900/80 border border-gray-200/80 dark:border-white/10 rounded-2xl overflow-y-auto hidden lg:block shrink-0 px-4 py-6 text-sm sticky top-[85px] h-[calc(100vh-110px)] shadow-2xs">
          
          {/* Group 1: Overview */}
          <div className="mb-8 space-y-1.5">
            <h4 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest px-3 mb-3">
              Overview &amp; Setup
            </h4>
            {filteredSections.filter(s => s.group === "Overview").map((sec) => {
              const isActive = activeSection === sec.id;
              return (
                <button
                  key={sec.id}
                  onClick={() => scrollToSection(sec.id)}
                  className={`w-full text-left px-3.5 py-2.5 rounded-xl transition-all duration-200 flex items-center justify-between text-sm font-medium group ${
                    isActive
                      ? "bg-brand-500/10 text-brand-600 dark:text-brand-400 font-bold border border-brand-500/20 shadow-2xs translate-x-1"
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5"
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <span className={`w-2 h-2 rounded-full shrink-0 ${isActive ? "bg-brand-500 animate-pulse" : "bg-gray-300 dark:bg-gray-700"}`} />
                    <span className="truncate">{sec.title}</span>
                  </div>
                  {isActive && (
                    <svg className="w-4 h-4 text-brand-600 dark:text-brand-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                  )}
                </button>
              );
            })}
          </div>

          {/* Group 2: Core REST Endpoints */}
          <div className="mb-8 space-y-1.5">
            <h4 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest px-3 mb-3">
              Core REST Endpoints
            </h4>
            {filteredSections.filter(s => s.group === "Core Endpoints").map((sec) => {
              const isActive = activeSection === sec.id;
              return (
                <button
                  key={sec.id}
                  onClick={() => scrollToSection(sec.id)}
                  className={`w-full text-left px-3.5 py-2.5 rounded-xl transition-all duration-200 flex items-center justify-between text-sm font-medium group ${
                    isActive
                      ? "bg-brand-500/10 text-brand-600 dark:text-brand-400 font-bold border border-brand-500/20 shadow-2xs translate-x-1"
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5"
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <span className={`w-2 h-2 rounded-full shrink-0 ${isActive ? "bg-brand-500 animate-pulse" : "bg-gray-300 dark:bg-gray-700"}`} />
                    <span className="truncate">{sec.title}</span>
                  </div>
                  {sec.badge && (
                    <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold shrink-0 ${
                      isActive ? "bg-brand-500 text-white" : "bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                    }`}>
                      {sec.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Group 3: Webhooks & Reference */}
          <div className="space-y-1.5">
            <h4 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest px-3 mb-3">
              Webhooks &amp; Reference
            </h4>
            {filteredSections.filter(s => s.group === "Events" || s.group === "Reference").map((sec) => {
              const isActive = activeSection === sec.id;
              return (
                <button
                  key={sec.id}
                  onClick={() => scrollToSection(sec.id)}
                  className={`w-full text-left px-3.5 py-2.5 rounded-xl transition-all duration-200 flex items-center justify-between text-sm font-medium group ${
                    isActive
                      ? "bg-brand-500/10 text-brand-600 dark:text-brand-400 font-bold border border-brand-500/20 shadow-2xs translate-x-1"
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5"
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <span className={`w-2 h-2 rounded-full shrink-0 ${isActive ? "bg-brand-500 animate-pulse" : "bg-gray-300 dark:bg-gray-700"}`} />
                    <span className="truncate">{sec.title}</span>
                  </div>
                  {isActive && (
                    <svg className="w-4 h-4 text-brand-600 dark:text-brand-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                  )}
                </button>
              );
            })}
          </div>
        </aside>

        {/* 3. Main Expanded Documentation Workspace (Occupies the majority of the screen) */}
        <main className="flex-1 min-w-0 space-y-8">
          
          {/* 1. Quickstart & Base Environments */}
          <div id="quickstart" className="bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-white/10 rounded-2xl overflow-hidden shadow-2xs scroll-mt-24">
            <div className="grid grid-cols-1 xl:grid-cols-2">
              <div className="p-8 sm:p-10">
                <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-600 dark:text-brand-400 font-bold text-xs uppercase tracking-wider mb-3">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
                  TuzoHub REST API v1
                </div>
                <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white mt-2 mb-4 tracking-tight">
                  Quickstart &amp; Base Environments
                </h1>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 leading-relaxed mb-8">
                  TuzoHub provides a high-availability RESTful API for multi-tenant loyalty management, voucher verification, USSD menu routing, and automated Safaricom M-Pesa B2C disbursements. Developed by <strong>Oduktech</strong>.
                </p>
                
                <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-3">
                  Base API Endpoints
                </h3>
                <div className="space-y-3 text-sm font-mono">
                  <div className="p-4 bg-gray-50 dark:bg-white/[0.02] border border-gray-200/80 dark:border-white/5 rounded-xl flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 block font-sans uppercase">PRODUCTION BASE URL</span>
                      <span className="text-gray-900 dark:text-white font-bold text-base">https://tuzohub.vercel.app/api</span>
                    </div>
                    <span className="px-3 py-1 rounded bg-emerald-500/10 text-emerald-600 text-xs font-bold font-sans">Live</span>
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-white/[0.02] border border-gray-200/80 dark:border-white/5 rounded-xl flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-amber-600 dark:text-amber-400 block font-sans uppercase">DARAJA SANDBOX</span>
                      <span className="text-gray-900 dark:text-white font-bold text-base">https://tuzohub.vercel.app/api/sandbox</span>
                    </div>
                    <span className="px-3 py-1 rounded bg-amber-500/10 text-amber-600 text-xs font-bold font-sans">Testing</span>
                  </div>
                </div>
              </div>

              {/* Code Snippet Box */}
              <div className="bg-[#0c111d] p-8 sm:p-10 border-t xl:border-t-0 xl:border-l border-gray-800 font-mono text-sm text-gray-300 space-y-4">
                <div className="flex justify-between items-center text-gray-400 uppercase text-xs font-bold mb-2">
                  <span>Sample Health Check Request</span>
                  <button
                    onClick={() => copyToClipboard('curl https://tuzohub.vercel.app/api/health', 'health')}
                    className="text-gray-400 hover:text-white transition bg-gray-800 px-3 py-1 rounded-lg text-xs"
                  >
                    {copiedId === 'health' ? '✓ Copied' : 'Copy cURL'}
                  </button>
                </div>
                <div className="p-4 bg-gray-900 border border-gray-800 rounded-xl text-sky-300 font-bold">
                  curl https://tuzohub.vercel.app/api/health
                </div>
                <div className="p-4 bg-gray-900 border border-gray-800 rounded-xl space-y-2">
                  <div className="text-gray-500">// Response 200 OK</div>
                  <div className="text-emerald-400 leading-relaxed">{`{\n  "status": "operational",\n  "version": "2026.4.23",\n  "tenant_mode": "multi-tenant"\n}`}</div>
                </div>
              </div>
            </div>
          </div>

          {/* 2. Authentication */}
          <div id="authentication" className="bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-white/10 rounded-2xl overflow-hidden shadow-2xs scroll-mt-24">
            <div className="grid grid-cols-1 xl:grid-cols-2">
              <div className="p-8 sm:p-10">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-500/20">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 0121 9z" /></svg>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                    API Key Authentication &amp; Security
                  </h2>
                </div>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 leading-relaxed mb-6">
                  All REST requests must include your organization&apos;s unique Tenant API Key passed via the <code className="font-mono text-brand-600 dark:text-brand-400 font-bold bg-brand-500/10 px-2 py-0.5 rounded text-sm">x-tenant-api-key</code> request header.
                </p>
                
                <div className="p-5 bg-amber-500/10 border border-amber-500/20 rounded-xl text-sm text-amber-900 dark:text-amber-300 leading-relaxed space-y-2">
                  <span className="font-bold block text-base">🔒 Secret Key Hygiene:</span>
                  <p>Never publish your live API secret keys in public GitHub repositories or front-end JavaScript bundles. Store them safely in environment variables (`.env.local`).</p>
                </div>
              </div>

              <div className="bg-[#0c111d] p-8 sm:p-10 border-t xl:border-t-0 xl:border-l border-gray-800 font-mono text-sm text-gray-300 space-y-4">
                <div className="text-gray-400 uppercase text-xs font-bold">Authentication Header Example</div>
                <div className="p-4 bg-gray-900 border border-gray-800 rounded-xl text-sky-400 font-bold">
                  x-tenant-api-key: sk_live_8f92a0194bc84a29...
                </div>
                <div className="p-4 bg-gray-900 border border-gray-800 rounded-xl text-emerald-400 font-bold">
                  Authorization: Bearer sk_live_8f92a0194bc84a29...
                </div>
              </div>
            </div>
          </div>

          {/* 3. Headers & Idempotency */}
          <div id="headers-idempotency" className="bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-white/10 rounded-2xl overflow-hidden shadow-2xs scroll-mt-24">
            <div className="grid grid-cols-1 xl:grid-cols-2">
              <div className="p-8 sm:p-10">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-3">
                  Headers &amp; Idempotency Keys
                </h2>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 leading-relaxed mb-6">
                  TuzoHub supports idempotency keys to prevent duplicate M-Pesa dispatches caused by network retry attempts. Include a unique UUID in the <code className="font-mono text-brand-600 dark:text-brand-400 font-bold bg-brand-500/10 px-2 py-0.5 rounded text-sm">Idempotency-Key</code> header.
                </p>
              </div>

              <div className="bg-[#0c111d] p-8 sm:p-10 border-t xl:border-t-0 xl:border-l border-gray-800 font-mono text-sm text-gray-300">
                <div className="text-gray-400 uppercase text-xs font-bold mb-3">Idempotency Header Example</div>
                <div className="p-4 bg-gray-900 border border-gray-800 rounded-xl text-amber-400 font-bold">
                  Idempotency-Key: tx_req_77a9140b-331e-4c7b
                </div>
              </div>
            </div>
          </div>

          {/* 4. Voucher Redeem API */}
          <div id="voucher-redeem" className="bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-white/10 rounded-2xl overflow-hidden shadow-2xs scroll-mt-24">
            <div className="grid grid-cols-1 xl:grid-cols-2">
              <div className="p-8 sm:p-10">
                <div className="flex items-center gap-3 mb-3">
                  <span className="px-2.5 py-1 rounded bg-emerald-500 text-white font-bold text-xs uppercase">
                    POST
                  </span>
                  <span className="text-sm font-mono text-gray-400">/api/vouchers/redeem</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-3">
                  Redeem Physical Scratch Card Voucher
                </h2>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 leading-relaxed mb-6">
                  Validates a scratch card PIN, verifies velocity security limits, and dispatches the reward (instant M-Pesa cashback or trade points).
                </p>
                
                <h4 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-4">
                  JSON Body Parameters
                </h4>
                <div className="space-y-3 text-sm">
                  <div className="p-4 bg-gray-50 dark:bg-white/[0.02] border border-gray-200/80 dark:border-white/5 rounded-xl">
                    <span className="font-mono font-bold text-gray-900 dark:text-white text-base">pin_code</span>
                    <span className="ml-2 text-xs font-bold text-rose-500 uppercase">REQUIRED</span>
                    <p className="text-gray-500 mt-1 text-sm">The 10-to-16 digit scratch card PIN number.</p>
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-white/[0.02] border border-gray-200/80 dark:border-white/5 rounded-xl">
                    <span className="font-mono font-bold text-gray-900 dark:text-white text-base">msisdn</span>
                    <span className="ml-2 text-xs font-bold text-rose-500 uppercase">REQUIRED</span>
                    <p className="text-gray-500 mt-1 text-sm">Recipient Kenyan phone number (e.g. 254712345678 or 0712345678).</p>
                  </div>
                </div>
              </div>

              <div className="bg-[#0c111d] p-8 sm:p-10 border-t xl:border-t-0 xl:border-l border-gray-800 font-mono text-sm text-gray-300">
                <div className="flex items-center justify-between mb-4 border-b border-gray-800 pb-3">
                  <span className="text-emerald-400 font-bold text-base">POST /api/vouchers/redeem</span>
                  <div className="flex gap-2 text-xs">
                    {(["curl", "node", "python", "php"] as const).map((lang) => (
                      <button
                        key={lang}
                        onClick={() => setActiveTab(lang)}
                        className={`px-3 py-1 rounded uppercase font-bold transition ${
                          activeTab === lang ? "bg-brand-600 text-white shadow-2xs" : "bg-gray-800 text-gray-400 hover:text-white"
                        }`}
                      >
                        {lang}
                      </button>
                    ))}
                  </div>
                </div>

                {activeTab === "curl" && (
                  <pre className="p-5 bg-gray-900 border border-gray-800 rounded-xl overflow-x-auto text-amber-300 text-sm leading-relaxed">
{`curl -X POST https://tuzohub.vercel.app/api/vouchers/redeem \\
  -H "Content-Type: application/json" \\
  -H "x-tenant-api-key: sk_live_8f92a01..." \\
  -d '{
    "pin_code": "981240182741",
    "msisdn": "254726444005"
  }'`}
                  </pre>
                )}

                {activeTab === "node" && (
                  <pre className="p-5 bg-gray-900 border border-gray-800 rounded-xl overflow-x-auto text-sky-300 text-sm leading-relaxed">
{`const response = await fetch('https://tuzohub.vercel.app/api/vouchers/redeem', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-tenant-api-key': process.env.TUZOHUB_API_KEY,
  },
  body: JSON.stringify({
    pin_code: '981240182741',
    msisdn: '254726444005',
  }),
});`}
                  </pre>
                )}

                {activeTab === "python" && (
                  <pre className="p-5 bg-gray-900 border border-gray-800 rounded-xl overflow-x-auto text-emerald-300 text-sm leading-relaxed">
{`import requests

url = "https://tuzohub.vercel.app/api/vouchers/redeem"
headers = {
    "Content-Type": "application/json",
    "x-tenant-api-key": "sk_live_8f92a01..."
}
payload = {
    "pin_code": "981240182741",
    "msisdn": "254726444005"
}
response = requests.post(url, json=payload, headers=headers)`}
                  </pre>
                )}

                {activeTab === "php" && (
                  <pre className="p-5 bg-gray-900 border border-gray-800 rounded-xl overflow-x-auto text-purple-300 text-sm leading-relaxed">
{`$ch = curl_init('https://tuzohub.vercel.app/api/vouchers/redeem');
curl_setopt($ch, CURLOPT_HTTPHEADER, [
  'Content-Type: application/json',
  'x-tenant-api-key: sk_live_8f92a01...'
]);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
  'pin_code' => '981240182741',
  'msisdn' => '254726444005'
]));
$res = curl_exec($ch);`}
                  </pre>
                )}

              </div>
            </div>
          </div>

          {/* 5. Safaricom M-Pesa B2C Payout */}
          <div id="mpesa-b2c" className="bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-white/10 rounded-2xl overflow-hidden shadow-2xs scroll-mt-24">
            <div className="grid grid-cols-1 xl:grid-cols-2">
              <div className="p-8 sm:p-10">
                <div className="flex items-center gap-3 mb-3">
                  <span className="px-2.5 py-1 rounded bg-emerald-500 text-white font-bold text-xs uppercase">
                    POST
                  </span>
                  <span className="text-sm font-mono text-gray-400">/api/mpesa/b2c-payout</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-3">
                  Safaricom M-Pesa B2C Cash Payout
                </h2>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 leading-relaxed mb-6">
                  Executes a direct mobile money payout from the tenant&apos;s M-Pesa B2C Paybill to a recipient.
                </p>
                <div className="p-4 bg-gray-50 dark:bg-white/[0.02] border border-gray-200/80 dark:border-white/5 rounded-xl text-sm space-y-2">
                  <span className="font-bold text-gray-900 dark:text-white text-base">CommandID Types:</span>
                  <p className="text-gray-500 font-mono text-sm">`BusinessPayment` | `SalaryPayment` | `PromotionPayment`</p>
                </div>
              </div>

              <div className="bg-[#0c111d] p-8 sm:p-10 border-t xl:border-t-0 xl:border-l border-gray-800 font-mono text-sm text-gray-300">
                <div className="text-gray-400 uppercase text-xs font-bold mb-3">Request Body</div>
                <pre className="p-5 bg-gray-900 border border-gray-800 rounded-xl text-emerald-400 overflow-x-auto text-sm leading-relaxed">
{`{\n  "amount": 250,\n  "msisdn": "254726444005",\n  "command_id": "PromotionPayment",\n  "remarks": "TuZoHub Reward Cashback"\n}`}
                </pre>
              </div>
            </div>
          </div>

          {/* 6. Log Trade Purchase */}
          <div id="record-purchase" className="bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-white/10 rounded-2xl overflow-hidden shadow-2xs scroll-mt-24">
            <div className="grid grid-cols-1 xl:grid-cols-2">
              <div className="p-8 sm:p-10">
                <div className="flex items-center gap-3 mb-3">
                  <span className="px-2.5 py-1 rounded bg-emerald-500 text-white font-bold text-xs uppercase">
                    POST
                  </span>
                  <span className="text-sm font-mono text-gray-400">/api/purchases</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-3">
                  Log Trade Purchase &amp; Award Points
                </h2>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 leading-relaxed mb-6">
                  Records a B2B trade purchase or invoice and calculates point accumulation for distributors or retail agents based on active campaign rules.
                </p>
                <div className="p-4 bg-gray-50 dark:bg-white/[0.02] border border-gray-200/80 dark:border-white/5 rounded-xl text-sm space-y-2">
                  <span className="font-bold text-gray-900 dark:text-white text-base">Required Fields:</span>
                  <p className="text-gray-500 font-mono text-sm">`invoice_number`, `agent_msisdn`, `purchase_amount`, `product_id`</p>
                </div>
              </div>

              <div className="bg-[#0c111d] p-8 sm:p-10 border-t xl:border-t-0 xl:border-l border-gray-800 font-mono text-sm text-gray-300">
                <div className="text-gray-400 uppercase text-xs font-bold mb-3">Sample Request Payload</div>
                <pre className="p-5 bg-gray-900 border border-gray-800 rounded-xl text-sky-300 overflow-x-auto text-sm leading-relaxed">
{`{\n  "invoice_number": "INV-2026-9901",\n  "agent_msisdn": "254712345678",\n  "purchase_amount": 15000,\n  "product_sku": "CEMENT-50KG-BAG"\n}`}
                </pre>
              </div>
            </div>
          </div>

          {/* 7. USSD Gateway Contract */}
          <div id="ussd-gateway" className="bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-white/10 rounded-2xl overflow-hidden shadow-2xs scroll-mt-24">
            <div className="grid grid-cols-1 xl:grid-cols-2">
              <div className="p-8 sm:p-10">
                <div className="flex items-center gap-3 mb-3">
                  <span className="px-2.5 py-1 rounded bg-sky-500 text-white font-bold text-xs uppercase">
                    USSD GATEWAY
                  </span>
                  <span className="text-sm font-mono text-gray-400">/api/ussd/callback</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-3">
                  Bonga / Africa&apos;s Talking USSD Handler
                </h2>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 leading-relaxed mb-6">
                  Endpoint designed for telecommunication USSD gateway callbacks (*483#). Automatically routes session text prompts (`CON` or `END`).
                </p>
              </div>

              <div className="bg-[#0c111d] p-8 sm:p-10 border-t xl:border-t-0 xl:border-l border-gray-800 font-mono text-sm text-gray-300">
                <div className="text-gray-400 uppercase text-xs font-bold mb-3">Sample USSD Gateway Response</div>
                <div className="p-5 bg-gray-900 border border-gray-800 rounded-xl space-y-2.5 text-sm">
                  <div className="text-emerald-400 font-bold text-base">CON Welcome to TuzoHub Rewards</div>
                  <div className="text-gray-300">1. Enter Scratch Card PIN</div>
                  <div className="text-gray-300">2. Check Points Balance</div>
                  <div className="text-gray-300">3. Contact Support (0726444005)</div>
                </div>
              </div>
            </div>
          </div>

          {/* 8. Webhooks & Event Signatures */}
          <div id="webhooks" className="bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-white/10 rounded-2xl overflow-hidden shadow-2xs scroll-mt-24">
            <div className="grid grid-cols-1 xl:grid-cols-2">
              <div className="p-8 sm:p-10">
                <div className="flex items-center gap-3 mb-3">
                  <span className="px-2.5 py-1 rounded bg-purple-500 text-white font-bold text-xs uppercase">
                    WEBHOOKS
                  </span>
                  <span className="text-sm font-mono text-gray-400">/webhooks/listener</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-3">
                  Webhook Dispatch &amp; Cryptographic Signatures
                </h2>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 leading-relaxed mb-6">
                  Receive real-time notifications for payout dispatches, voucher redemptions, and fraud alerts. Verify authenticity using the <code className="font-mono text-brand-600 dark:text-brand-400 font-bold bg-brand-500/10 px-2 py-0.5 rounded text-sm">X-TuzoHub-Signature</code> HMAC-SHA256 header.
                </p>
                <div className="p-4 bg-gray-50 dark:bg-white/[0.02] border border-gray-200/80 dark:border-white/5 rounded-xl text-sm space-y-2">
                  <span className="font-bold text-gray-900 dark:text-white text-base">Supported Webhook Events:</span>
                  <p className="text-gray-500 font-mono text-sm">`payout.success`, `payout.failed`, `voucher.redeemed`, `fraud.flagged`</p>
                </div>
              </div>

              <div className="bg-[#0c111d] p-8 sm:p-10 border-t xl:border-t-0 xl:border-l border-gray-800 font-mono text-sm text-gray-300">
                <div className="text-gray-400 uppercase text-xs font-bold mb-3">Sample Webhook Event Payload</div>
                <pre className="p-5 bg-gray-900 border border-gray-800 rounded-xl text-purple-300 overflow-x-auto text-sm leading-relaxed">
{`{\n  "event": "payout.success",\n  "timestamp": "2026-07-31T14:30:00Z",\n  "data": {\n    "transaction_id": "TX_99182301",\n    "msisdn": "254726444005",\n    "amount": 500,\n    "mpesa_receipt": "QK8192830"\n  }\n}`}
                </pre>
              </div>
            </div>
          </div>

          {/* 9. HTTP Errors Matrix */}
          <div id="errors" className="bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-white/10 rounded-2xl overflow-hidden shadow-2xs p-8 sm:p-10 scroll-mt-24">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-4">
              HTTP Response Error Matrix
            </h2>
            <div className="overflow-x-auto mt-4">
              <table className="w-full text-left text-sm border border-gray-200 dark:border-white/10 rounded-xl overflow-hidden">
                <thead className="bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white font-bold">
                  <tr>
                    <th className="p-4 border-b border-gray-200 dark:border-white/10">Code</th>
                    <th className="p-4 border-b border-gray-200 dark:border-white/10">Status</th>
                    <th className="p-4 border-b border-gray-200 dark:border-white/10">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-white/5 text-gray-600 dark:text-gray-300 font-mono text-sm">
                  <tr>
                    <td className="p-4 text-emerald-600 dark:text-emerald-400 font-bold">200 OK</td>
                    <td className="p-4 font-sans font-semibold">SUCCESS</td>
                    <td className="p-4 font-sans">Request processed successfully.</td>
                  </tr>
                  <tr>
                    <td className="p-4 text-amber-600 dark:text-amber-400 font-bold">400 Bad Request</td>
                    <td className="p-4 font-sans font-semibold">INVALID_PAYLOAD</td>
                    <td className="p-4 font-sans">Missing required body parameters (e.g. invalid MSISDN format).</td>
                  </tr>
                  <tr>
                    <td className="p-4 text-rose-600 dark:text-rose-400 font-bold">401 Unauthorized</td>
                    <td className="p-4 font-sans font-semibold">UNAUTHORIZED</td>
                    <td className="p-4 font-sans">Missing or invalid `x-tenant-api-key`.</td>
                  </tr>
                  <tr>
                    <td className="p-4 text-rose-600 dark:text-rose-400 font-bold">422 Unprocessable</td>
                    <td className="p-4 font-sans font-semibold">PIN_ALREADY_USED</td>
                    <td className="p-4 font-sans">Voucher PIN has already been redeemed or expired.</td>
                  </tr>
                  <tr>
                    <td className="p-4 text-amber-600 dark:text-amber-400 font-bold">429 Rate Limit</td>
                    <td className="p-4 font-sans font-semibold">VELOCITY_EXCEEDED</td>
                    <td className="p-4 font-sans">Velocity limit exceeded for user phone number.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* 10. Developer Support */}
          <div id="support" className="bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-white/10 rounded-2xl p-8 sm:p-10 scroll-mt-24 shadow-2xs">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center border border-brand-500/20">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                Developer &amp; Engineering Support
              </h2>
            </div>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mb-6">
              Need help integrating TuzoHub into your ERP, POS, or custom mobile application? Contact the developer engineering team at <strong>Oduktech</strong>:
            </p>
            <div className="flex flex-wrap gap-4 text-sm font-semibold">
              <a href="mailto:info@oduktech.com" className="px-5 py-3 rounded-xl bg-brand-600 text-white hover:bg-brand-700 transition flex items-center gap-2 text-base shadow-sm">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                Email info@oduktech.com
              </a>
              <a href="tel:0726444005" className="px-5 py-3 rounded-xl bg-gray-900 dark:bg-white/10 text-white hover:bg-gray-800 transition flex items-center gap-2 text-base shadow-sm">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                Call 0726444005
              </a>
            </div>
          </div>

          {/* 4. Sequential Step Navigation Bar (Prev / Next Topic Buttons) */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-white/10 rounded-2xl p-6 sm:p-8 shadow-2xs">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-sm">
              
              {/* Previous Step Button */}
              {prevSection ? (
                <button
                  type="button"
                  onClick={() => scrollToSection(prevSection.id)}
                  className="w-full sm:w-auto p-4 rounded-xl border border-gray-200/80 dark:border-white/10 bg-gray-50 dark:bg-gray-950 hover:bg-brand-50 dark:hover:bg-brand-500/10 hover:border-brand-500/30 transition flex items-center gap-4 text-left shadow-2xs group"
                >
                  <div className="w-9 h-9 rounded-lg bg-gray-200 dark:bg-white/10 flex items-center justify-center text-gray-600 dark:text-gray-300 group-hover:bg-brand-500 group-hover:text-white transition shrink-0">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">← Previous Topic</span>
                    <span className="font-bold text-gray-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition text-sm sm:text-base">{prevSection.title}</span>
                  </div>
                </button>
              ) : <div />}

              {/* Back To Top Button */}
              <button
                type="button"
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                className="px-5 py-2.5 rounded-full border border-gray-200 dark:border-white/10 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white text-sm font-semibold shadow-2xs flex items-center gap-2 transition hover:bg-gray-50"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
                Back to Top
              </button>

              {/* Next Step Button */}
              {nextSection ? (
                <button
                  type="button"
                  onClick={() => scrollToSection(nextSection.id)}
                  className="w-full sm:w-auto p-4 rounded-xl border border-gray-200/80 dark:border-white/10 bg-gray-50 dark:bg-gray-950 hover:bg-brand-50 dark:hover:bg-brand-500/10 hover:border-brand-500/30 transition flex items-center gap-4 text-right shadow-2xs group justify-end"
                >
                  <div>
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">Next Topic →</span>
                    <span className="font-bold text-gray-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition text-sm sm:text-base">{nextSection.title}</span>
                  </div>
                  <div className="w-9 h-9 rounded-lg bg-gray-200 dark:bg-white/10 flex items-center justify-center text-gray-600 dark:text-gray-300 group-hover:bg-brand-500 group-hover:text-white transition shrink-0">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                  </div>
                </button>
              ) : <div />}

            </div>
          </div>

        </main>
      </div>
    </div>
  );
}