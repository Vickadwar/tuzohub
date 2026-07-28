import React from "react";
import Link from "next/link";

export default function ApiDocsPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-white font-satoshi selection:bg-brand-500 selection:text-white flex flex-col transition-colors">
      
      {/* 1. Navbar */}
      <header className="sticky top-0 z-50 py-3 px-4 sm:px-6 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-b border-gray-200/80 dark:border-white/[0.08] flex justify-between items-center shrink-0">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-500 text-white font-black text-xs shadow-sm">
              TZ
            </div>
            <span className="text-base font-extrabold tracking-tight text-gray-900 dark:text-white">
              TuZoHub <span className="font-semibold text-gray-400 text-xs ml-1">Developer API</span>
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-3 text-xs font-semibold">
          <Link href="/" className="text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition">
            Back to website
          </Link>
          <div className="h-4 w-px bg-gray-200 dark:bg-white/10" />
          <Link
            href="/auth/login"
            className="px-3 py-1.5 rounded-full bg-brand-600 hover:bg-brand-700 text-white shadow-2xs transition"
          >
            Dashboard
          </Link>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden h-[calc(100vh-57px)]">
        
        {/* 2. Sidebar Navigation */}
        <aside className="w-64 bg-gray-50/50 dark:bg-gray-900/50 border-r border-gray-200/80 dark:border-white/[0.08] overflow-y-auto hidden lg:block shrink-0 px-4 py-6">
          <div className="mb-6 space-y-2">
            <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-2">
              Getting started
            </h4>
            <ul className="space-y-0.5">
              <li>
                <a href="#introduction" className="block px-2.5 py-1.5 text-xs font-semibold text-brand-600 dark:text-brand-400 bg-brand-500/10 rounded-xl">
                  Introduction
                </a>
              </li>
              <li>
                <a href="#authentication" className="block px-2.5 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 rounded-xl">
                  Authentication
                </a>
              </li>
              <li>
                <a href="#idempotency" className="block px-2.5 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 rounded-xl">
                  Idempotency
                </a>
              </li>
            </ul>
          </div>

          <div className="mb-6 space-y-2">
            <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-2">
              Core API
            </h4>
            <ul className="space-y-0.5">
              <li>
                <a href="#record-purchase" className="block px-2.5 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 rounded-xl">
                  Record a purchase
                </a>
              </li>
              <li>
                <a href="#redeem-voucher" className="block px-2.5 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 rounded-xl">
                  Redeem physical voucher
                </a>
              </li>
            </ul>
          </div>

          <div className="space-y-2">
            <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-2">
              Webhooks & events
            </h4>
            <ul className="space-y-0.5">
              <li>
                <a href="#webhooks" className="block px-2.5 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 rounded-xl">
                  Event signatures
                </a>
              </li>
            </ul>
          </div>
        </aside>

        {/* 3. Main Documentation Content */}
        <main className="flex-1 overflow-y-auto scroll-smooth">
          <div className="max-w-7xl mx-auto">
            
            {/* Introduction & Auth */}
            <div id="introduction" className="grid grid-cols-1 xl:grid-cols-2 border-b border-gray-200/80 dark:border-white/[0.08]">
              <div className="p-6 sm:p-10">
                <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-3">
                  TuZoHub API reference
                </h1>
                <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed mb-6">
                  The TuZoHub API is structured around REST principles with predictable JSON request and response payloads. Provide your secret key in the Authorization header to start integrating.
                </p>
                
                <h2 id="authentication" className="text-lg font-bold text-gray-900 dark:text-white mt-8 mb-2">
                  Authentication
                </h2>
                <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                  Pass your API key as a Bearer token in the request headers:
                </p>
                <div className="p-3 bg-brand-500/10 border border-brand-500/20 rounded-xl text-xs text-brand-600 dark:text-brand-400 font-medium">
                  <strong>Security requirement:</strong> Keep your API keys safe. Never expose them in public repositories or client-side web apps.
                </div>
              </div>

              {/* Code Example */}
              <div className="bg-[#0c111d] p-6 sm:p-10 border-l border-gray-800 font-mono text-xs text-gray-300">
                <div className="text-gray-500 uppercase text-[10px] font-bold mb-3">Base API URL</div>
                <div className="p-3 bg-gray-900 border border-gray-800 rounded-xl mb-6 text-emerald-400">
                  https://api.tuzohub.com/v1
                </div>

                <div className="text-gray-500 uppercase text-[10px] font-bold mb-3">Authentication header</div>
                <div className="p-3 bg-gray-900 border border-gray-800 rounded-xl text-sky-400">
                  Authorization: Bearer sk_live_abc123...
                </div>
              </div>
            </div>

            {/* Record Purchase */}
            <div id="record-purchase" className="grid grid-cols-1 xl:grid-cols-2 border-b border-gray-200/80 dark:border-white/[0.08]">
              <div className="p-6 sm:p-10">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                  Record a purchase
                </h2>
                <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed mb-6">
                  Logs a purchase event for a consumer. Calculates points and evaluates real-time fraud rules.
                </p>
                
                <h4 className="text-xs font-bold text-gray-900 dark:text-white uppercase mb-3">
                  Body parameters
                </h4>
                <div className="space-y-3 text-xs">
                  <div>
                    <span className="font-mono font-bold text-gray-900 dark:text-white">consumer_id</span>
                    <span className="ml-2 text-[10px] font-bold text-rose-500">REQUIRED</span>
                    <p className="text-gray-500">The consumer ID string (UUID).</p>
                  </div>
                  <div>
                    <span className="font-mono font-bold text-gray-900 dark:text-white">total_amount</span>
                    <span className="ml-2 text-[10px] font-bold text-rose-500">REQUIRED</span>
                    <p className="text-gray-500">Gross purchase amount in KES.</p>
                  </div>
                </div>
              </div>

              <div className="bg-[#0c111d] p-6 sm:p-10 border-l border-gray-800 font-mono text-xs text-gray-300">
                <div className="flex items-center gap-2 mb-4">
                  <span className="bg-emerald-500 text-white font-bold px-2 py-0.5 rounded text-[10px]">POST</span>
                  <span className="text-gray-300 font-bold">/v1/purchases</span>
                </div>

                <div className="p-4 bg-gray-900 border border-gray-800 rounded-xl space-y-1">
                  <div className="text-gray-400">{`{`}</div>
                  <div className="ml-4"><span className="text-pink-400">"consumer_id"</span>: <span className="text-emerald-400">"cons_01H9Z"</span>,</div>
                  <div className="ml-4"><span className="text-pink-400">"total_amount"</span>: <span className="text-amber-400">2500.00</span></div>
                  <div className="text-gray-400">{`}`}</div>
                </div>
              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
}