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
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Logo size="md" href="/" />
          <div className="flex items-center gap-4 text-xs font-semibold">
            <Link href="/privacy" className="text-gray-600 dark:text-gray-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
              Privacy Policy
            </Link>
            <Link href="/auth/login" className="px-3.5 py-2 rounded-lg bg-brand-600 text-white hover:bg-brand-700 transition-colors">
              Sign In
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 sm:p-10 shadow-sm dark:border-white/10 dark:bg-gray-900">
          
          {/* Document Header */}
          <div className="border-b border-gray-100 dark:border-white/5 pb-6">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400 text-xs font-bold border border-brand-500/20">
              Master SaaS Agreement
            </span>
            <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
              Platform Terms of Service
            </h1>
            <p className="mt-2 text-xs font-medium text-gray-500 dark:text-gray-400">
              Effective Date: {lastUpdated} | Applies to all TuzoHub SaaS Tenant Organizations and Platform Users.
            </p>
          </div>

          {/* Legal Notice Alert */}
          <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50/70 p-4 dark:border-amber-500/20 dark:bg-amber-500/10 text-xs text-amber-900 dark:text-amber-300 leading-relaxed">
            <p className="font-bold mb-1">⚖️ Important Multi-Tenant Legal Notice:</p>
            This Master Agreement governs the relationship between <strong>TuzoHub (&quot;Platform Provider&quot;)</strong> and <strong>Tenant Organizations (&quot;Tenants&quot;)</strong> subscribing to the TuzoHub B2B2C Loyalty &amp; Disbursement Orchestration Platform. End-consumer reward participants are governed by their respective Tenant Organization&apos;s Consumer Reward Terms.
          </div>

          {/* Terms Content Sections */}
          <div className="mt-8 space-y-8 text-xs leading-relaxed text-gray-700 dark:text-gray-300">
            
            <section className="space-y-2">
              <h2 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">1. Platform Services &amp; Architecture</h2>
              <p>
                TuzoHub provides a cloud-based, multi-tenant software-as-a-service (SaaS) platform enabling enterprise tenants to orchestrate product vouchers, consumer reward logic, USSD menu routing, and automated financial disbursements (via integrations including Safaricom Daraja M-Pesa B2C).
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">2. Tenant Responsibilities &amp; Credentials Isolation</h2>
              <p>
                Each Tenant Organization is solely responsible for:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-gray-600 dark:text-gray-400">
                <li>Securing API credentials, Consumer Keys, Consumer Secrets, and Initiator Passwords inputted into the platform.</li>
                <li>Maintaining adequate liquid M-Pesa B2C float balances with Safaricom or Jenga payment gateways to fund cash payouts.</li>
                <li>Ensuring all promotional campaigns comply with local trade laws, consumer protection acts, and tax regulations in their operating country.</li>
              </ul>
            </section>

            <section className="space-y-2">
              <h2 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">3. Financial Disbursement Disclaimer &amp; Liability Boundaries</h2>
              <p>
                TuzoHub functions exclusively as an automated orchestration software proxy. TuzoHub does <strong>not</strong> hold, custody, or manage tenant financial funds or M-Pesa float balances. All cash disbursements are executed directly from the Tenant Organization&apos;s own registered Safaricom M-Pesa B2C Paybill or Shortcode.
              </p>
              <p className="text-gray-500 dark:text-gray-400">
                TuzoHub shall not be liable for payout delays, insufficient float errors, or telecommunication network downtime originating from third-party networks (Safaricom, Airtel, Africa&apos;s Talking, or Jenga API).
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">4. Data Protection &amp; Kenya Data Protection Act Compliance</h2>
              <p>
                TuzoHub processes consumer data (including phone numbers/MSISDNs, transaction receipts, and reward history) in strict compliance with the <strong>Kenya Data Protection Act, 2019</strong> and applicable regional data protection frameworks.
              </p>
              <ul className="list-disc pl-5 space-y-1 text-gray-600 dark:text-gray-400">
                <li>Tenant data is logically isolated using database row-level tenant security keys.</li>
                <li>API keys and sensitive authentication secrets are encrypted at rest.</li>
                <li>TuzoHub does not monetize, sell, or share tenant consumer database records with unauthorized third parties.</li>
              </ul>
            </section>

            <section className="space-y-2">
              <h2 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">5. Acceptable Use &amp; Anti-Fraud Policy</h2>
              <p>
                Tenants shall not use TuzoHub to conduct fraudulent promotions, pyramid schemes, illegal lotteries, or unauthorized financial solicitation. TuzoHub reserves the right to suspend any tenant account exhibiting malicious velocity attacks, unverified shortcodes, or breach of telecommunication guidelines.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">6. Service Level Agreement (SLA) &amp; Maintenance</h2>
              <p>
                TuzoHub strives to maintain a 99.9% platform availability SLA. Scheduled infrastructure upgrades and routine maintenance will be communicated to tenant administrators in advance via the Notifications Center.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">7. Governing Law &amp; Dispute Resolution</h2>
              <p>
                This Agreement shall be governed by and construed in accordance with the Laws of the Republic of Kenya. Any dispute arising out of or in connection with these Terms shall be subject to arbitration in Nairobi under the Nairobi Centre for International Arbitration (NCIA) rules.
              </p>
            </section>

            <section className="space-y-2 pt-4 border-t border-gray-100 dark:border-white/5">
              <h2 className="text-sm font-bold text-gray-900 dark:text-white">Questions &amp; Legal Support</h2>
              <p className="text-gray-600 dark:text-gray-400">
                For legal inquiries, contract amendments, or tenant compliance questions, please contact our legal team at <a href="mailto:legal@tuzohub.com" className="text-brand-600 dark:text-brand-400 underline">legal@tuzohub.com</a>.
              </p>
            </section>

          </div>

          {/* Footer Back Link */}
          <div className="mt-10 border-t border-gray-100 dark:border-white/5 pt-6 flex items-center justify-between text-xs text-gray-500">
            <Link href="/" className="font-semibold text-brand-600 dark:text-brand-400 hover:underline">
              ← Return to TuzoHub Home
            </Link>
            <span>© {new Date().getFullYear()} TuzoHub. All rights reserved.</span>
          </div>

        </div>
      </main>
    </div>
  );
}
