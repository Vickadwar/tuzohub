"use client";

import React from "react";
import Link from "next/link";
import { Logo } from "@/components/common/Logo";

export default function TermsOfServicePage() {
  const lastUpdated = "July 31, 2026";

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors">
      {/* Header Bar */}
      <header className="sticky top-0 z-30 border-b border-gray-200/80 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md dark:border-white/10">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          <Logo size="md" href="/" />
          <div className="flex items-center gap-6 text-sm font-semibold">
            <Link href="/privacy" className="text-gray-600 dark:text-gray-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
              Privacy Policy
            </Link>
            <Link href="/security" className="text-gray-600 dark:text-gray-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
              Security Policy
            </Link>
            <Link href="/docs" className="text-gray-600 dark:text-gray-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
              Developer Docs
            </Link>
            <Link href="/auth/login" className="px-5 py-2.5 rounded-xl bg-brand-600 text-white hover:bg-brand-700 transition-colors font-bold shadow-2xs">
              Sign In
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="rounded-2xl border border-gray-200 bg-white p-8 sm:p-14 shadow-sm dark:border-white/10 dark:bg-gray-900">
          
          {/* Document Header */}
          <div className="border-b border-gray-100 dark:border-white/5 pb-8">
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400 text-sm font-bold border border-brand-500/20">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h6m-6 4h6m-6 4h6" /></svg>
                Developed by Oduktech
              </span>
              <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 text-sm font-medium border border-gray-200 dark:border-white/10">
                Master SaaS Agreement
              </span>
            </div>
            <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
              TuzoHub Terms of Service
            </h1>
            <p className="mt-3 text-base font-medium text-gray-500 dark:text-gray-400">
              Effective Date: {lastUpdated} | Governing Product Ownership, SaaS Subscriptions, and B2B2C Payout Orchestration.
            </p>
          </div>

          {/* Legal Notice Alert */}
          <div className="mt-8 rounded-xl border border-amber-200 bg-amber-50/70 p-6 dark:border-amber-500/20 dark:bg-amber-500/10 text-base text-amber-900 dark:text-amber-300 leading-relaxed space-y-2">
            <div className="flex items-center gap-2.5 font-bold text-lg mb-1">
              <svg className="w-6 h-6 text-amber-600 dark:text-amber-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" /></svg>
              <span>Product Ownership &amp; Developer Attribution Notice</span>
            </div>
            <p>
              <strong>TuzoHub</strong> is an enterprise software product designed, developed, owned, and operated exclusively by <strong>Oduktech</strong> (&quot;Oduktech Company Limited&quot;). This Master Agreement governs the relationship between Oduktech, subscribing <strong>Tenant Organizations (&quot;Tenants&quot;)</strong>, and authorized platform administrators.
            </p>
          </div>

          {/* Terms Content Sections */}
          <div className="mt-10 space-y-10 text-base sm:text-lg leading-relaxed text-gray-700 dark:text-gray-300">
            
            <section className="space-y-3">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white uppercase tracking-wider">1. Platform Ownership &amp; Developer Attribution</h2>
              <p>
                TuzoHub, including all associated web interfaces, backend API proxies, database schemas, mobile USSD menu scripts, algorithms, source code, and design assets, is the sole proprietary intellectual property of <strong>Oduktech</strong>.
              </p>
              <p className="text-gray-600 dark:text-gray-400">
                Subscribing to TuzoHub grants Tenant Organizations a non-exclusive, non-transferable, revocable license to access the SaaS platform for commercial loyalty management during the active subscription period.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white uppercase tracking-wider">2. Services Scope &amp; Multi-Tenant Architecture</h2>
              <p>
                TuzoHub provides a cloud-native software suite that enables enterprise tenants to:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-600 dark:text-gray-400">
                <li>Manage multi-tier B2B sales hierarchies, regional supervisors, and trade agents.</li>
                <li>Generate and validate cryptographically hashed physical voucher scratch card batches.</li>
                <li>Configure automated cashback campaigns, instant airtime, and banked trade reward points.</li>
                <li>Orchestrate Safaricom M-Pesa B2C disbursements and USSD menu interactions (*483#).</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white uppercase tracking-wider">3. Tenant Credential Security &amp; Financial Float Responsibilities</h2>
              <p>
                Each Tenant Organization is strictly responsible for:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-600 dark:text-gray-400">
                <li>Safeguarding administrative credentials, API keys, Daraja Consumer Keys, Consumer Secrets, and RSA Security Certificates.</li>
                <li>Maintaining adequate liquid funds and working account float in their registered Safaricom M-Pesa B2C Paybill or Shortcode.</li>
                <li>Ensuring all promotional campaigns adhere to local trade regulations, gaming/lottery laws, and tax withholding obligations.</li>
                <li>Publishing and maintaining clear Consumer Terms &amp; Conditions for end-reward participants.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white uppercase tracking-wider">4. Financial Disbursement Disclaimer</h2>
              <p>
                TuzoHub and Oduktech function exclusively as a technical software orchestration engine proxy. <strong>Neither Oduktech nor TuzoHub holds, custodies, transfers, or manages tenant money or float balances.</strong>
              </p>
              <p className="text-gray-600 dark:text-gray-400">
                All financial disbursements (M-Pesa B2C, Bank dispatches) are executed directly between the Tenant Organization&apos;s registered financial shortcode and the recipient&apos;s mobile wallet via licensed payment service providers (Safaricom PLC, Jenga/Equity Bank). Oduktech shall not be held liable for payout failures caused by insufficient float balances, invalid initiator credentials, or third-party bank gateway downtime.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white uppercase tracking-wider">5. Acceptable Use &amp; Anti-Fraud Policy</h2>
              <p>
                Tenants are strictly prohibited from using TuzoHub for:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-600 dark:text-gray-400">
                <li>Unlawful pyramid schemes, money laundering, or unauthorized deposit-taking.</li>
                <li>Simulating fraudulent voucher redemption scans or attacking USSD menu endpoints.</li>
                <li>Transmitting spam SMS broadcasts violating Communications Authority of Kenya (CAK) regulations.</li>
              </ul>
              <p className="text-amber-800 dark:text-amber-400 font-medium">
                Oduktech reserves the right to immediately suspend or terminate any tenant account violating these anti-fraud standards without prior notice.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white uppercase tracking-wider">6. Service Level Commitment (SLA) &amp; Telecommunication Dependencies</h2>
              <p>
                Oduktech targets a 99.9% service availability for the TuzoHub cloud backend. However, system uptime is dependent on third-party infrastructure providers including AWS/Vercel, Supabase, Safaricom Daraja API, Airtel, and Africa&apos;s Talking. Oduktech is not responsible for dispatches delayed by cellular network outages or core telecommunication maintenance.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white uppercase tracking-wider">7. Limitation of Liability</h2>
              <p>
                To the maximum extent permitted by Kenyan law, Oduktech shall not be liable for any indirect, incidental, consequential, or punitive damages (including loss of business profits, lost data, or operational disruption) arising out of or related to the use of TuzoHub. Oduktech&apos;s total aggregate liability shall be capped at the total SaaS subscription fees paid by the Tenant Organization to Oduktech in the three (3) months preceding the claim.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white uppercase tracking-wider">8. Governing Law &amp; Dispute Resolution</h2>
              <p>
                These Terms shall be governed by and construed in accordance with the Laws of the Republic of Kenya. Any dispute or claim arising out of these Terms shall be settled through good-faith negotiation, failing which it shall be referred to binding arbitration under the Nairobi Centre for International Arbitration (NCIA) rules.
              </p>
            </section>

            <section className="space-y-4 pt-8 border-t border-gray-100 dark:border-white/5">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white uppercase tracking-wider">9. Developer &amp; Corporate Contact Details</h2>
              <p className="text-gray-600 dark:text-gray-400">
                TuzoHub is developed and supported by <strong>Oduktech</strong>. For platform subscriptions, custom enterprise integrations, or legal inquiries, please contact us through:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-6 rounded-xl bg-gray-50 dark:bg-white/[0.02] border border-gray-200/80 dark:border-white/10 text-base">
                <div>
                  <span className="font-bold text-gray-900 dark:text-white block">Developer &amp; Publisher:</span>
                  <span className="text-gray-600 dark:text-gray-300">Oduktech</span>
                </div>
                <div>
                  <span className="font-bold text-gray-900 dark:text-white block">Official Product:</span>
                  <span className="text-gray-600 dark:text-gray-300">TuzoHub Enterprise Loyalty Switch</span>
                </div>
                <div>
                  <span className="font-bold text-gray-900 dark:text-white block">Email Support:</span>
                  <a href="mailto:info@oduktech.com" className="text-brand-600 dark:text-brand-400 font-semibold underline">
                    info@oduktech.com
                  </a>
                </div>
                <div>
                  <span className="font-bold text-gray-900 dark:text-white block">Phone / WhatsApp:</span>
                  <a href="tel:0726444005" className="text-brand-600 dark:text-brand-400 font-semibold underline">
                    0726444005
                  </a>
                </div>
              </div>
            </section>

          </div>

          {/* Footer Back Link */}
          <div className="mt-12 border-t border-gray-100 dark:border-white/5 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-base text-gray-500">
            <Link href="/" className="font-semibold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
              Return to TuzoHub Home
            </Link>
            <span>© {new Date().getFullYear()} TuzoHub by Oduktech. All rights reserved.</span>
          </div>

        </div>
      </main>
    </div>
  );
}
