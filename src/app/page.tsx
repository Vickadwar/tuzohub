import React from "react";
import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-white font-satoshi selection:bg-brand-500 selection:text-white overflow-x-hidden transition-colors">
      
      {/* 1. Header (Sticky & Glassmorphic) */}
      <header className="fixed top-0 left-0 right-0 z-50 py-3.5 px-4 sm:px-8 backdrop-blur-md bg-white/90 dark:bg-gray-950/90 border-b border-gray-200/80 dark:border-white/[0.08] flex justify-between items-center transition-all">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-500 text-white font-black text-xs shadow-md shadow-brand-500/30">
            TZ
          </div>
          <span className="text-lg font-extrabold tracking-tight text-gray-900 dark:text-white">
            TuZo<span className="text-brand-500">Hub</span>
            <span className="text-[10px] font-bold text-brand-600 dark:text-brand-400 bg-brand-500/10 border border-brand-500/20 px-2 py-0.5 rounded-full ml-2 uppercase tracking-wide">
              Enterprise
            </span>
          </span>
        </div>
        
        <nav className="hidden md:flex items-center gap-8 text-xs font-semibold text-gray-600 dark:text-gray-300">
          <a href="#solutions" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">Solutions</a>
          <a href="#features" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">Platform</a>
          <a href="#security" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">Fraud prevention</a>
          <a href="#developers" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">Developers</a>
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/auth/login"
            className="text-xs font-semibold text-gray-700 dark:text-gray-200 hover:text-brand-600 dark:hover:text-brand-400 transition-colors px-3 py-2"
          >
            Sign in
          </Link>
          <Link
            href="/auth/register"
            className="px-4 py-2 text-xs font-semibold rounded-full bg-gray-900 hover:bg-gray-800 dark:bg-brand-600 dark:hover:bg-brand-500 text-white shadow-sm transition hover:-translate-y-0.5"
          >
            Get started
          </Link>
        </div>
      </header>

      {/* 2. Hero Section */}
      <main className="pt-28 sm:pt-36 pb-20 px-4 flex flex-col items-center text-center relative">
        {/* Soft light background accents */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-[500px] bg-gradient-to-b from-brand-500/10 via-brand-500/5 to-transparent -z-10 rounded-b-full blur-3xl pointer-events-none" />
        
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-600 dark:text-brand-400 mb-6 text-xs font-bold tracking-wide animate-fadeIn">
          <span className="flex h-2 w-2 rounded-full bg-brand-500 animate-pulse" />
          Next-gen B2B2C loyalty platform
        </div>
        
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-gray-900 dark:text-white max-w-5xl mb-6 leading-[1.1] animate-fadeIn">
          Scale your enterprise rewards.<br className="hidden sm:block"/> 
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-sky-500 dark:from-brand-400 dark:to-sky-400">
            Secure your liability.
          </span>
        </h1>
        
        <p className="text-sm sm:text-lg text-gray-600 dark:text-gray-300 max-w-3xl mb-10 leading-relaxed animate-fadeIn">
          Built for complex distribution networks. Manage multi-tier sales hierarchies, orchestrate physical voucher batches, and automate campaign payouts—all protected by a real-time anti-fraud rules engine.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full justify-center animate-fadeIn">
          <Link
            href="/auth/register"
            className="w-full sm:w-auto px-7 py-3.5 text-xs font-semibold rounded-full bg-brand-600 hover:bg-brand-700 text-white shadow-lg shadow-brand-500/25 transition hover:-translate-y-0.5"
          >
            Build your platform
          </Link>
          <Link
            href="/docs"
            className="w-full sm:w-auto px-7 py-3.5 text-xs font-semibold rounded-full bg-white dark:bg-white/5 text-gray-700 dark:text-gray-200 border border-gray-200/80 dark:border-white/10 shadow-2xs hover:bg-gray-50 dark:hover:bg-white/10 transition flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
            Explore API docs
          </Link>
        </div>

        {/* Dashboard Preview Interface Mockup */}
        <div className="mt-16 w-full max-w-6xl rounded-2xl border border-gray-200/80 dark:border-white/10 bg-white dark:bg-gray-900 p-2 shadow-2xl relative group z-10 animate-fadeIn">
           <div className="rounded-xl overflow-hidden border border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-gray-950 flex flex-col h-[480px]">
              {/* Window Bar */}
              <div className="h-11 border-b border-gray-200/80 dark:border-white/10 bg-white dark:bg-gray-900 flex items-center px-4 justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-rose-400/80" />
                  <div className="w-3 h-3 rounded-full bg-amber-400/80" />
                  <div className="w-3 h-3 rounded-full bg-emerald-400/80" />
                </div>
                <div className="text-[11px] font-bold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-white/5 px-3 py-1 rounded-full">
                  TuZoHub Command Center
                </div>
                <div className="w-16" />
              </div>
              
              {/* Mock Dashboard Body */}
              <div className="flex flex-1 overflow-hidden text-left">
                {/* Mock Sidebar */}
                <div className="w-56 bg-white dark:bg-gray-900 border-r border-gray-200/80 dark:border-white/10 p-3 space-y-1 hidden md:block">
                  <div className="flex items-center gap-2.5 px-3 py-2 bg-brand-500/10 text-brand-600 dark:text-brand-400 rounded-xl font-bold text-xs border border-brand-500/20">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
                    Overview
                  </div>
                  {['Consumers', 'Campaigns & marketing', 'Rewards catalog', 'Production batches', 'Voucher inventory', 'Terminal', 'Transactions log'].map((item, i) => (
                    <div key={i} className="px-3 py-2 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 rounded-xl font-medium text-xs cursor-pointer">
                      {item}
                    </div>
                  ))}
                </div>
                
                {/* Main Content View */}
                <div className="flex-1 p-6 overflow-y-auto bg-gray-50/50 dark:bg-gray-950/50">
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <h2 className="text-lg font-bold text-gray-900 dark:text-white">Tenant analytics</h2>
                      <p className="text-xs text-gray-400">Live points liability and fraud telemetry</p>
                    </div>
                    <div className="text-xs border border-gray-200/80 dark:border-white/10 bg-white dark:bg-gray-900 px-3 py-1.5 rounded-xl font-medium text-gray-600 dark:text-gray-300 shadow-2xs">
                      Last 30 days ▼
                    </div>
                  </div>
                  
                  {/* Metric Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-white/10 rounded-2xl p-4 shadow-2xs">
                      <div className="text-gray-400 text-xs font-semibold mb-1">Total points liability</div>
                      <div className="text-2xl font-black text-gray-900 dark:text-white">12.4M pts</div>
                      <div className="text-emerald-600 dark:text-emerald-400 text-xs font-bold mt-2 flex items-center gap-1">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                        +4.2% Earned velocity
                      </div>
                    </div>
                    
                    <div className="bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-white/10 rounded-2xl p-4 shadow-2xs">
                      <div className="text-gray-400 text-xs font-semibold mb-1">Active fraud flags</div>
                      <div className="text-2xl font-black text-amber-500">14 alerts</div>
                      <div className="text-amber-600 dark:text-amber-400 text-xs font-bold mt-2">Requires admin review</div>
                    </div>

                    <div className="bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-white/10 rounded-2xl p-4 shadow-2xs">
                      <div className="text-gray-400 text-xs font-semibold mb-1">Pending payouts</div>
                      <div className="text-2xl font-black text-gray-900 dark:text-white">KES 428,000</div>
                      <div className="text-brand-600 dark:text-brand-400 text-xs font-bold mt-2">94 Queued mobile money payouts</div>
                    </div>
                  </div>

                  {/* Chart Area */}
                  <div className="bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-white/10 rounded-2xl p-5 shadow-2xs h-40 flex flex-col justify-between">
                    <div className="text-xs font-bold text-gray-800 dark:text-gray-200">Redemption vs issuance velocity</div>
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
              </div>
           </div>
        </div>
      </main>

      {/* 3. Trusted Enterprises Banner */}
      <section className="py-12 border-y border-gray-200/80 dark:border-white/10 bg-gray-50/50 dark:bg-gray-900/50">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-xs font-bold tracking-widest text-gray-400 uppercase mb-8">
            Trusted by scalable enterprise distribution networks
          </p>
          <div className="flex flex-wrap justify-center gap-10 md:gap-16 items-center opacity-60">
            <h3 className="text-lg font-black tracking-tight text-gray-800 dark:text-gray-200">AgriCorp East Africa</h3>
            <h3 className="text-lg font-bold font-serif text-gray-800 dark:text-gray-200">BuildMatrix Cement</h3>
            <h3 className="text-lg font-extrabold tracking-tighter text-gray-800 dark:text-gray-200">FMCG Global Holdings</h3>
            <h3 className="text-lg font-semibold italic text-gray-800 dark:text-gray-200">RetailLink Kenya</h3>
            <h3 className="text-lg font-bold uppercase tracking-widest text-gray-800 dark:text-gray-200">AutoParts Direct</h3>
          </div>
        </div>
      </section>

      {/* 4. Core Features */}
      <section id="features" className="py-20 px-4 sm:px-8 bg-white dark:bg-gray-950">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              Built for the complexity of real-world commerce
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Basic loyalty apps fail at scale. TuzoHub provides the architectural backbone for multi-tier sales channels, hardware integration, and compliance.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Feature 1 */}
            <div className="bg-gray-50 dark:bg-white/[0.02] border border-gray-200/80 dark:border-white/10 rounded-2xl p-6 hover:shadow-md transition">
              <div className="w-10 h-10 rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center mb-4 border border-brand-500/20 font-bold">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
              </div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white mb-2">B2B sales hierarchies</h3>
              <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                Map operational structures with precision. Assign roles from regional supervisors down to field agents and dealers.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-gray-50 dark:bg-white/[0.02] border border-gray-200/80 dark:border-white/10 rounded-2xl p-6 hover:shadow-md transition">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-4 border border-amber-500/20 font-bold">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
              </div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white mb-2">Voucher batch logistics</h3>
              <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                Generate hashed physical scratch card batches. Track lifecycle statuses from print to redemption to prevent inventory shrinkage.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-gray-50 dark:bg-white/[0.02] border border-gray-200/80 dark:border-white/10 rounded-2xl p-6 hover:shadow-md transition">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4 border border-emerald-500/20 font-bold">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
              </div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white mb-2">USSD & Kenya phone input</h3>
              <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                Seamlessly format Kenyan contact credentials (+254) and integrate offline USSD queues to reach every distributor.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* 5. Developer & API Section */}
      <section id="developers" className="py-20 px-4 sm:px-8 bg-gray-900 text-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/20 border border-brand-500/30 text-brand-400 text-xs font-bold uppercase tracking-wider">
              Developer first
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight">REST API & Webhook Infrastructure</h2>
            <p className="text-xs text-gray-400 leading-relaxed">
              Connect existing ERP, POS, or Mobile Money payout gateways using predictable RESTful endpoints and secure event signatures.
            </p>
            <Link
              href="/docs"
              className="inline-flex items-center gap-2 text-xs font-bold text-brand-400 hover:text-brand-300"
            >
              Read full API documentation →
            </Link>
          </div>

          <div className="bg-[#0c111d] rounded-2xl p-5 border border-gray-800 font-mono text-xs shadow-2xl">
            <div className="flex gap-2 mb-3 border-b border-gray-800 pb-3">
              <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            </div>
            <div className="text-sky-400 mb-2">POST <span className="text-white">/api/v1/loyalty/purchases</span></div>
            <div className="text-gray-400">{`{`}</div>
            <div className="text-gray-300 ml-4 space-y-1">
              <div><span className="text-pink-400">"tenant_api_key"</span>: <span className="text-emerald-400">"sk_test_8f92..."</span>,</div>
              <div><span className="text-pink-400">"consumer_id"</span>: <span className="text-emerald-400">"usr_98x12"</span>,</div>
              <div><span className="text-pink-400">"total_amount"</span>: <span className="text-amber-400">1500.00</span>,</div>
              <div><span className="text-pink-400">"idempotency_key"</span>: <span className="text-emerald-400">"tx_u82ha_001"</span></div>
            </div>
            <div className="text-gray-400">{`}`}</div>
          </div>
        </div>
      </section>

      {/* 6. Footer */}
      <footer className="border-t border-gray-200/80 dark:border-white/10 bg-white dark:bg-gray-950 py-12 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6 text-xs text-gray-500">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-500 text-white font-black text-[10px]">
              TZ
            </div>
            <span className="font-bold text-gray-900 dark:text-white">TuZoHub Enterprise</span>
          </div>
          
          <p>© {new Date().getFullYear()} TuZoHub Inc. All rights reserved.</p>
          
          <div className="flex items-center gap-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-3 py-1 rounded-full border border-emerald-500/20 font-semibold text-[11px]">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            System Status: All Systems Operational
          </div>
        </div>
      </footer>
    </div>
  );
}