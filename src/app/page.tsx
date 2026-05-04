import React from "react";
import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-gray-900 font-satoshi selection:bg-brand-100 selection:text-brand-900 overflow-x-hidden">
      
      {/* 1. Header (Sticky & Light) */}
      <header className="fixed top-0 left-0 right-0 z-50 py-4 px-6 md:px-12 backdrop-blur-xl bg-white/80 border-b border-gray-200/60 flex justify-between items-center transition-all duration-300">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-brand-500 flex items-center justify-center font-bold text-white shadow-theme-sm">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <span className="text-xl font-bold tracking-tight text-gray-900">
            TuzoHub <span className="text-brand-500 font-semibold text-sm bg-brand-50 px-2 py-0.5 rounded-full ml-1">Enterprise</span>
          </span>
        </div>
        
        <nav className="hidden md:flex items-center gap-8">
          <a href="#solutions" className="text-sm font-semibold text-gray-600 hover:text-brand-600 transition-colors">Solutions</a>
          <a href="#features" className="text-sm font-semibold text-gray-600 hover:text-brand-600 transition-colors">Platform</a>
          <a href="#security" className="text-sm font-semibold text-gray-600 hover:text-brand-600 transition-colors">Fraud Prevention</a>
          <a href="#developers" className="text-sm font-semibold text-gray-600 hover:text-brand-600 transition-colors">Developers</a>
        </nav>

        <div className="flex items-center gap-4">
          <Link href="/auth/login" className="hidden sm:block text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors">
            Sign In
          </Link>
          <Link href="/auth/register" className="px-5 py-2.5 text-sm font-semibold rounded-full bg-gray-900 hover:bg-gray-800 text-white shadow-theme-md transition-all duration-300 hover:-translate-y-0.5">
            Get Started
          </Link>
        </div>
      </header>

      {/* 2. Hero Section */}
      <main className="pt-32 pb-20 px-4 flex flex-col items-center text-center relative">
        {/* Soft light background accents */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-[500px] bg-gradient-to-b from-brand-50/80 to-transparent -z-10 rounded-b-full"></div>
        
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-gray-200 text-brand-600 mb-8 shadow-theme-xs text-sm font-semibold animate-fade-in-up">
          <span className="flex h-2 w-2 rounded-full bg-brand-500 animate-pulse"></span>
          Next-Gen B2B2C Loyalty OS
        </div>
        
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-gray-900 max-w-5xl mb-6 leading-[1.1] animate-fade-in-up" style={{animationDelay: '100ms'}}>
          Scale your enterprise rewards.<br className="hidden md:block"/> 
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-blue-light-500">Secure your liability.</span>
        </h1>
        
        <p className="text-lg md:text-xl text-gray-600 max-w-3xl mb-10 leading-relaxed animate-fade-in-up" style={{animationDelay: '200ms'}}>
          The only multi-tenant platform built for complex distribution networks. Manage sales hierarchies, orchestrate physical voucher batches, and automate gamified campaigns—all protected by an enterprise fraud engine.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center animate-fade-in-up" style={{animationDelay: '300ms'}}>
          <Link href="/auth/register" className="w-full sm:w-auto px-8 py-3.5 text-base font-semibold rounded-full bg-brand-600 text-white shadow-theme-lg hover:bg-brand-700 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            Build Your Platform
          </Link>
          <Link href="/developer" className="w-full sm:w-auto px-8 py-3.5 text-base font-semibold rounded-full bg-white text-gray-700 border border-gray-200 shadow-theme-xs hover:bg-gray-50 transition-all duration-300 flex items-center justify-center gap-2">
            <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
            Explore API Docs
          </Link>
        </div>

        {/* Clean Dashboard Interface Mockup */}
        <div className="mt-20 w-full max-w-6xl rounded-2xl border border-gray-200/80 bg-white p-2 shadow-theme-xl relative group z-10 animate-fade-in-up" style={{animationDelay: '400ms'}}>
           <div className="rounded-xl overflow-hidden border border-gray-100 bg-gray-50 flex flex-col h-[500px]">
              {/* Fake Window Controls */}
              <div className="h-12 border-b border-gray-200 bg-white flex items-center px-4 justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-gray-300"></div>
                  <div className="w-3 h-3 rounded-full bg-gray-300"></div>
                  <div className="w-3 h-3 rounded-full bg-gray-300"></div>
                </div>
                <div className="text-xs font-semibold text-gray-500 bg-gray-100 px-3 py-1 rounded-md">TuzoHub Enterprise Console</div>
                <div className="w-16"></div> {/* Spacer for balance */}
              </div>
              
              {/* Mock Dashboard Body */}
              <div className="flex flex-1 overflow-hidden text-left">
                {/* Sidebar */}
                <div className="w-64 bg-white border-r border-gray-200 p-4 space-y-1 hidden md:block">
                  <div className="flex items-center gap-3 px-3 py-2 bg-brand-50 text-brand-600 rounded-lg font-semibold text-sm border border-brand-100">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
                    Overview
                  </div>
                  {['Campaigns & Promotions', 'Voucher Batches', 'Sales Hierarchy', 'Redemption Queue', 'Fraud Rules', 'API Logs'].map((item, i) => (
                    <div key={i} className="px-3 py-2 text-gray-500 hover:bg-gray-50 rounded-lg font-medium text-sm cursor-pointer">{item}</div>
                  ))}
                </div>
                
                {/* Main Content */}
                <div className="flex-1 p-6 overflow-y-auto bg-gray-50/50">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-gray-900">Tenant Analytics</h2>
                    <div className="text-sm border border-gray-200 bg-white px-3 py-1.5 rounded-md font-medium text-gray-600 shadow-theme-xs">Last 30 Days ▼</div>
                  </div>
                  
                  {/* Metric Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-theme-xs">
                      <div className="text-gray-500 text-sm font-medium mb-2">Total Points Liability</div>
                      <div className="text-3xl font-extrabold text-gray-900">12.4M</div>
                      <div className="text-success-600 text-sm font-semibold mt-2 flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                        +4.2% Earned Velocity
                      </div>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-theme-xs relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-4 opacity-10"><svg className="w-16 h-16 text-warning-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg></div>
                      <div className="text-gray-500 text-sm font-medium mb-2">Active Fraud Flags</div>
                      <div className="text-3xl font-extrabold text-gray-900">14</div>
                      <div className="text-warning-600 text-sm font-semibold mt-2">Requires Admin Review</div>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-theme-xs">
                      <div className="text-gray-500 text-sm font-medium mb-2">Pending Redemptions</div>
                      <div className="text-3xl font-extrabold text-gray-900">$42,800</div>
                      <div className="text-brand-600 text-sm font-semibold mt-2">94 Queued to Mobile Money</div>
                    </div>
                  </div>

                  {/* Chart Area */}
                  <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-theme-xs h-48 flex flex-col justify-between">
                    <div className="text-sm font-bold text-gray-800">Redemption vs Issuance Trends</div>
                    <div className="w-full h-full mt-4 relative flex items-end gap-2 border-b border-gray-100">
                       {/* Abstract Bar Chart */}
                       {[30, 50, 40, 70, 60, 90, 80, 100].map((h, i) => (
                         <div key={i} className="flex-1 flex gap-1 justify-center items-end h-full">
                           <div className="w-1/2 bg-brand-200 rounded-t-sm" style={{height: `${h}%`}}></div>
                           <div className="w-1/2 bg-brand-500 rounded-t-sm" style={{height: `${h * 0.7}%`}}></div>
                         </div>
                       ))}
                    </div>
                  </div>
                </div>
              </div>
           </div>
        </div>
      </main>

      {/* 3. Social Proof */}
      <section className="py-12 border-b border-gray-100 bg-white">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-sm font-bold tracking-widest text-gray-400 uppercase mb-8">Trusted by scalable enterprises & distribution networks</p>
          <div className="flex flex-wrap justify-center gap-12 md:gap-20 items-center opacity-60 grayscale">
            <h3 className="text-xl font-black font-satoshi text-gray-800">AgriCorp</h3>
            <h3 className="text-xl font-bold font-serif text-gray-800">BuildMatrix</h3>
            <h3 className="text-xl font-extrabold tracking-tighter text-gray-800">FMCG Global</h3>
            <h3 className="text-xl font-semibold italic text-gray-800">RetailLink</h3>
            <h3 className="text-xl font-bold text-gray-800 uppercase tracking-widest">AutoParts</h3>
          </div>
        </div>
      </section>

      {/* 4. Core Features / Platform Capabilities */}
      <section id="features" className="py-24 px-6 md:px-12 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-5xl font-extrabold text-gray-900 tracking-tight mb-6">Built for the complexity of real-world commerce.</h2>
            <p className="text-lg text-gray-600">
              Basic loyalty apps fail at scale. TuzoHub provides the architectural backbone for multi-tier sales channels, deep hardware integration, and robust compliance.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            
            {/* Feature 1: Hierarchies */}
            <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-theme-sm hover:shadow-theme-md transition-shadow">
              <div className="w-12 h-12 rounded-lg bg-blue-light-50 flex items-center justify-center mb-6 border border-blue-light-100">
                <svg className="w-6 h-6 text-blue-light-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">B2B Sales Hierarchies</h3>
              <p className="text-gray-600 leading-relaxed">
                Map your exact operational structure. Assign roles from Regional Managers down to floor operators. Track point issuance across distributors, dealers, and contractors.
              </p>
            </div>

            {/* Feature 2: Physical Vouchers */}
            <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-theme-sm hover:shadow-theme-md transition-shadow">
              <div className="w-12 h-12 rounded-lg bg-orange-50 flex items-center justify-center mb-6 border border-orange-100">
                <svg className="w-6 h-6 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Voucher Batch Logistics</h3>
              <p className="text-gray-600 leading-relaxed">
                Generate highly secure, hashed voucher batches. Track lifecycle statuses (Printed, In Transit, Active, Redeemed) to prevent internal shrinkage and supply chain theft.
              </p>
            </div>

            {/* Feature 3: Omnichannel */}
            <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-theme-sm hover:shadow-theme-md transition-shadow">
              <div className="w-12 h-12 rounded-lg bg-success-50 flex items-center justify-center mb-6 border border-success-100">
                <svg className="w-6 h-6 text-success-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Offline & USSD Ready</h3>
              <p className="text-gray-600 leading-relaxed">
                Don't limit loyalty to smartphones. Create custom USSD menus, SMS keywords, and offline POS sync queues to reach every consumer in emerging markets.
              </p>
            </div>

            {/* Feature 4: Gamification */}
            <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-theme-sm hover:shadow-theme-md transition-shadow">
              <div className="w-12 h-12 rounded-lg bg-theme-pink-50 flex items-center justify-center mb-6 border border-pink-200">
                <svg className="w-6 h-6 text-theme-pink-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Stackable Promotions & Gamification</h3>
              <p className="text-gray-600 leading-relaxed">
                Compound promotions (Buy X Get Y + Multipliers). Launch behavioral challenges (spend-based or transaction-based) and award custom digital badges.
              </p>
            </div>

            {/* Feature 5: Accounting */}
            <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-theme-sm hover:shadow-theme-md transition-shadow">
              <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center mb-6 border border-gray-200">
                <svg className="w-6 h-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">FIFO Point Banking Ledger</h3>
              <p className="text-gray-600 leading-relaxed">
                Every point is tracked like currency. Native FIFO logic handles expiry dates automatically. Let consumers "bank" points to lock them for high-value redemptions.
              </p>
            </div>

            {/* Feature 6: Payout Integrations */}
            <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-theme-sm hover:shadow-theme-md transition-shadow">
              <div className="w-12 h-12 rounded-lg bg-brand-50 flex items-center justify-center mb-6 border border-brand-100">
                <svg className="w-6 h-6 text-brand-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Automated Partner Payouts</h3>
              <p className="text-gray-600 leading-relaxed">
                Map rewards directly to Mobile Money, Airtime, or Bank APIs. Redemptions queue instantly, handle retries automatically, and settle across tenant boundaries.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Deep Dive: Enterprise Fraud Engine (Darker accent section to break the layout) */}
      <section id="security" className="py-24 bg-gray-900 relative overflow-hidden">
        {/* Background Graphic */}
        <div className="absolute top-0 right-0 w-1/2 h-full bg-brand-900/40 rounded-l-full blur-[100px] pointer-events-none"></div>
        
        <div className="max-w-7xl mx-auto px-6 md:px-12 flex flex-col lg:flex-row items-center gap-16 relative z-10">
          <div className="flex-1 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-error-500/10 border border-error-500/20 text-error-400 text-sm font-bold tracking-wide uppercase mb-6">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
              Enterprise Security Engine
            </div>
            <h2 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight mb-6">
              Protect your rewards liability from abuse.
            </h2>
            <p className="text-lg text-gray-400 mb-8 leading-relaxed">
              Loyalty points are currency. Our automated rule engine monitors every earning and redemption event in real-time, catching brute-force voucher attempts and impossible velocity metrics before payout.
            </p>
            
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center flex-shrink-0 text-white font-bold">1</div>
                <div>
                  <h4 className="text-lg font-bold text-white">Configurable Velocity Rules</h4>
                  <p className="text-gray-400 mt-1 text-sm">Limit maximum points earned or redeemed per hour, day, or lifetime per consumer segment.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center flex-shrink-0 text-white font-bold">2</div>
                <div>
                  <h4 className="text-lg font-bold text-white">Granular Access Locks</h4>
                  <p className="text-gray-400 mt-1 text-sm">Disable specific user actions (e.g., block point transfers or require MFA for high-value redemptions) without blocking their ability to purchase.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center flex-shrink-0 text-white font-bold">3</div>
                <div>
                  <h4 className="text-lg font-bold text-white">Real-time Alert Resolution</h4>
                  <p className="text-gray-400 mt-1 text-sm">Alerts are assigned severities (LOG, FLAG, BLOCK, REQUIRE_REVIEW) and routed to administrators instantly.</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex-1 w-full relative">
            <div className="bg-gray-950 border border-gray-800 rounded-2xl p-6 shadow-2xl relative">
               <div className="absolute -top-3 -right-3">
                 <span className="flex h-6 w-6 relative">
                   <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-error-400 opacity-75"></span>
                   <span className="relative inline-flex rounded-full h-6 w-6 bg-error-500 border-2 border-gray-900"></span>
                 </span>
               </div>
               <div className="flex items-center justify-between border-b border-gray-800 pb-4 mb-4">
                 <span className="text-white font-semibold">Active Fraud Rules Queue</span>
               </div>
               
               <div className="space-y-3">
                 {/* Mock UI Alert Rows */}
                 <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex justify-between items-start">
                   <div>
                     <div className="text-white font-semibold text-sm mb-1">Rule Triggered: Brute Force SN</div>
                     <div className="text-gray-500 text-xs font-mono">Consumer ID: c-8821a • IP: 192.168.1.1</div>
                   </div>
                   <span className="bg-error-500/20 text-error-400 px-2.5 py-1 rounded-md text-xs font-bold uppercase">Blocked</span>
                 </div>
                 
                 <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex justify-between items-start">
                   <div>
                     <div className="text-white font-semibold text-sm mb-1">Rule Triggered: Velocity Earning</div>
                     <div className="text-gray-500 text-xs font-mono">Wallet ID: w-402 • 150K Pts in 1hr</div>
                   </div>
                   <span className="bg-warning-500/20 text-warning-400 px-2.5 py-1 rounded-md text-xs font-bold uppercase">Req Review</span>
                 </div>

                 <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 flex justify-between items-start opacity-50">
                   <div>
                     <div className="text-white font-semibold text-sm mb-1">Rule Triggered: IP Mismatch</div>
                     <div className="text-gray-500 text-xs font-mono">Admin Action logged</div>
                   </div>
                   <span className="bg-gray-800 text-gray-400 px-2.5 py-1 rounded-md text-xs font-bold uppercase">Logged</span>
                 </div>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Developer & Integration (Clean Data Section) */}
      <section id="developers" className="py-24 px-6 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-16 items-center">
          <div className="flex-1 w-full order-2 md:order-1">
            <div className="bg-[#0c111d] rounded-2xl p-6 shadow-theme-xl border border-gray-800 overflow-hidden font-mono text-sm leading-relaxed">
              <div className="flex gap-2 mb-4 border-b border-gray-800 pb-4">
                <div className="w-3 h-3 rounded-full bg-error-500"></div>
                <div className="w-3 h-3 rounded-full bg-warning-500"></div>
                <div className="w-3 h-3 rounded-full bg-success-500"></div>
              </div>
              <div className="text-blue-light-400">POST <span className="text-white">/api/v1/loyalty/purchases</span></div>
              <div className="text-gray-400 mt-2">{`{`}</div>
              <div className="text-gray-300 ml-4">
                <span className="text-theme-pink-500">"tenant_api_key"</span>: <span className="text-success-400">"sk_test_8f92..."</span>,<br/>
                <span className="text-theme-pink-500">"consumer_id"</span>: <span className="text-success-400">"usr_98x12"</span>,<br/>
                <span className="text-theme-pink-500">"total_amount"</span>: <span className="text-orange-400">1500.00</span>,<br/>
                <span className="text-theme-pink-500">"idempotency_key"</span>: <span className="text-success-400">"tx_u82ha_001"</span>,<br/>
                <span className="text-theme-pink-500">"metadata"</span>: {`{`} <br/>
                <span className="ml-4 text-theme-pink-500">"pos_terminal"</span>: <span className="text-success-400">"TERM_04"</span> <br/>
                {`}`}
              </div>
              <div className="text-gray-400">{`}`}</div>
              
              <div className="mt-4 border-t border-gray-800 pt-4 text-gray-500">
                // System automatically applies active multi-tier promotions,<br/>
                // triggers webhooks, and updates point lots (FIFO).
              </div>
            </div>
          </div>
          
          <div className="flex-1 order-1 md:order-2">
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight mb-4">
              Developer-First API & Webhooks
            </h2>
            <p className="text-lg text-gray-600 mb-6">
              Connect your existing ERP, CRM, or POS seamlessly. TuzoHub provides robust external webhook delivery with automated retries and deep API access.
            </p>
            <ul className="space-y-3 mb-8">
              <li className="flex items-center gap-3 text-gray-700 font-medium">
                <svg className="w-5 h-5 text-brand-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>
                Idempotency keys to guarantee safe POS retries
              </li>
              <li className="flex items-center gap-3 text-gray-700 font-medium">
                <svg className="w-5 h-5 text-brand-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>
                Complete Audit logs for governance and compliance
              </li>
              <li className="flex items-center gap-3 text-gray-700 font-medium">
                <svg className="w-5 h-5 text-brand-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>
                GDPR & Consent Record management built-in
              </li>
            </ul>
            <Link href="/docs" className="text-brand-600 font-bold hover:text-brand-700 flex items-center gap-2">
              Read the Documentation <span>→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* 7. Numbers/ROI Block */}
      <section className="py-20 bg-brand-900 relative">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
        <div className="max-w-7xl mx-auto px-6 relative z-10 grid grid-cols-1 md:grid-cols-4 gap-8 divide-y md:divide-y-0 md:divide-x divide-brand-700 text-center">
          <div className="p-4">
            <div className="text-4xl md:text-5xl font-black text-white mb-2">10+</div>
            <div className="text-brand-200 font-medium text-sm">Reward Types Supported <br/>(Airtime to Cash)</div>
          </div>
          <div className="p-4">
            <div className="text-4xl md:text-5xl font-black text-white mb-2">100%</div>
            <div className="text-brand-200 font-medium text-sm">Data Ownership & <br/>Tenant Isolation</div>
          </div>
          <div className="p-4">
            <div className="text-4xl md:text-5xl font-black text-white mb-2">&lt;50ms</div>
            <div className="text-brand-200 font-medium text-sm">Real-time Rule & <br/>Fraud Evaluation</div>
          </div>
          <div className="p-4">
            <div className="text-4xl md:text-5xl font-black text-white mb-2">Unlimited</div>
            <div className="text-brand-200 font-medium text-sm">Custom Segments & <br/>Dynamic Audiences</div>
          </div>
        </div>
      </section>

      {/* 8. Final CTA (High Conversion Focus) */}
      <section className="py-24 px-6 relative bg-gray-50">
        <div className="max-w-5xl mx-auto bg-gradient-to-br from-brand-600 to-brand-800 rounded-[2rem] p-10 md:p-16 text-center shadow-theme-xl relative overflow-hidden">
          {/* Abstract blobs inside the card */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-light-400/30 blur-[60px] rounded-full"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-brand-400/30 blur-[60px] rounded-full"></div>
          
          <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-6 relative z-10">Stop outgrowing your loyalty stack.</h2>
          <p className="text-brand-100 text-lg md:text-xl mb-10 max-w-2xl mx-auto relative z-10 font-medium">
            Migrate to the B2B SaaS platform engineered for multi-tier sales channels, unbreakable security, and limitless scale.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 relative z-10">
            <Link href="/auth/register" className="w-full sm:w-auto px-8 py-4 text-lg font-bold rounded-full bg-white text-brand-900 hover:bg-gray-50 shadow-theme-lg transition-transform duration-300 hover:scale-105">
              Launch Your Portal
            </Link>
            <Link href="/contact" className="w-full sm:w-auto px-8 py-4 text-lg font-bold rounded-full bg-transparent text-white border border-white/30 hover:bg-white/10 transition-colors duration-300">
              Schedule Architecture Review
            </Link>
          </div>
          <p className="text-brand-200/80 text-sm mt-6 relative z-10">No credit card required. Full API access included.</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white py-16 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          <div className="col-span-2 md:col-span-2 pr-8">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-8 w-8 rounded-lg bg-brand-500 flex items-center justify-center font-bold text-white shadow-theme-xs">
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              </div>
              <span className="text-xl font-bold text-gray-900">TuzoHub Enterprise</span>
            </div>
            <p className="text-gray-500 leading-relaxed text-sm mb-6 max-w-sm">
              The advanced multi-tenant B2B loyalty management infrastructure. Powering distributor networks and retail brands globally.
            </p>
          </div>
          
          <div>
            <h4 className="text-gray-900 font-bold mb-4 uppercase tracking-wider text-xs">Platform</h4>
            <ul className="space-y-3 text-sm text-gray-500 font-medium">
              <li><Link href="#" className="hover:text-brand-600 transition-colors">Campaign Engine</Link></li>
              <li><Link href="#" className="hover:text-brand-600 transition-colors">Voucher Security</Link></li>
              <li><Link href="#" className="hover:text-brand-600 transition-colors">Fraud Protection</Link></li>
              <li><Link href="#" className="hover:text-brand-600 transition-colors">API & Webhooks</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-gray-900 font-bold mb-4 uppercase tracking-wider text-xs">Solutions</h4>
            <ul className="space-y-3 text-sm text-gray-500 font-medium">
              <li><Link href="#" className="hover:text-brand-600 transition-colors">For Distributors</Link></li>
              <li><Link href="#" className="hover:text-brand-600 transition-colors">For Retail Networks</Link></li>
              <li><Link href="#" className="hover:text-brand-600 transition-colors">Partner Programs</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-gray-900 font-bold mb-4 uppercase tracking-wider text-xs">Company</h4>
            <ul className="space-y-3 text-sm text-gray-500 font-medium">
              <li><Link href="#" className="hover:text-brand-600 transition-colors">About Us</Link></li>
              <li><Link href="#" className="hover:text-brand-600 transition-colors">Privacy Policy</Link></li>
              <li><Link href="#" className="hover:text-brand-600 transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center text-sm text-gray-500 font-medium">
          <p>© {new Date().getFullYear()} TuzoHub Inc. All rights reserved.</p>
          <div className="flex gap-4 mt-4 md:mt-0 bg-gray-50 px-4 py-2 rounded-full border border-gray-200">
             <span className="flex items-center gap-2">
               <div className="w-2.5 h-2.5 rounded-full bg-success-500 animate-pulse"></div> 
               System Status: All Systems Operational
             </span>
          </div>
        </div>
      </footer>
    </div>
  );
}