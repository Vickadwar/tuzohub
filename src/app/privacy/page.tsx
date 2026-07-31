"use client";

import React from "react";
import Link from "next/link";
import { Logo } from "@/components/common/Logo";

export default function PrivacyPolicyPage() {
  const lastUpdated = "July 31, 2026";

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors">
      {/* Header Bar */}
      <header className="sticky top-0 z-30 border-b border-gray-200/80 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md dark:border-white/10">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          <Logo size="md" href="/" />
          <div className="flex items-center gap-4 text-sm font-semibold">
            <Link href="/terms" className="text-gray-600 dark:text-gray-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
              Terms of Service
            </Link>
            <Link href="/security" className="text-gray-600 dark:text-gray-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
              Security Policy
            </Link>
            <Link href="/docs" className="text-gray-600 dark:text-gray-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
              Developer Docs
            </Link>
            <Link href="/auth/login" className="px-4 py-2 rounded-lg bg-brand-600 text-white hover:bg-brand-700 transition-colors font-bold">
              Sign In
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="rounded-2xl border border-gray-200 bg-white p-8 sm:p-12 shadow-sm dark:border-white/10 dark:bg-gray-900">
          
          {/* Document Header */}
          <div className="border-b border-gray-100 dark:border-white/5 pb-8">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold border border-emerald-500/20">
                Developed by Oduktech
              </span>
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 text-xs font-medium border border-gray-200 dark:border-white/10">
                Kenya Data Protection Act 2019 Compliant
              </span>
            </div>
            <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
              Privacy &amp; Data Protection Policy
            </h1>
            <p className="mt-3 text-sm font-medium text-gray-500 dark:text-gray-400">
              Effective Date: {lastUpdated} | Governs Data Collection, Storage, and Processing on TuzoHub.
            </p>
          </div>

          {/* Privacy Content Sections */}
          <div className="mt-10 space-y-10 text-sm sm:text-base leading-relaxed text-gray-700 dark:text-gray-300">
            
            <section className="space-y-3">
              <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white uppercase tracking-wider">1. Corporate Identity &amp; Roles</h2>
              <p>
                <strong>TuzoHub</strong> is an enterprise SaaS platform designed, developed, and operated exclusively by <strong>Oduktech</strong> (&quot;Oduktech Company Limited&quot;).
              </p>
              <p className="text-gray-600 dark:text-gray-400">
                In operating the TuzoHub platform:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-600 dark:text-gray-400">
                <li><strong>Tenant Organizations</strong> act as the <em>Data Controller</em> responsible for determining the purpose of consumer reward campaigns.</li>
                <li><strong>Oduktech (TuzoHub)</strong> acts as the <em>Data Processor</em> executing transaction routing, USSD session handling, and disbursement dispatches in strict compliance with the Data Controller&apos;s instructions.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white uppercase tracking-wider">2. Information Collected &amp; Processed</h2>
              <p>
                To provide payout dispatches, USSD interfaces, and fraud telemetry, TuzoHub processes the following categories of data:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-600 dark:text-gray-400">
                <li><strong>Mobile Phone Numbers (MSISDNs):</strong> Required for Safaricom M-Pesa B2C disbursements and SMS notification delivery.</li>
                <li><strong>Voucher &amp; Transaction Hashes:</strong> Hashed scratch card PINs, redemption timestamps, payout amounts, and Safaricom B2C ConversationIDs.</li>
                <li><strong>Network &amp; Device Identifiers:</strong> USSD SessionIDs, IP addresses, and user-agent details utilized for velocity security algorithms.</li>
                <li><strong>Tenant Administrative Profile Data:</strong> Name, work email, and login credentials of tenant staff administrators.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white uppercase tracking-wider">3. Purpose &amp; Lawful Basis of Processing</h2>
              <p>
                Oduktech processes data on TuzoHub based on contractual necessity and legitimate business interest to:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-600 dark:text-gray-400">
                <li>Automate instant M-Pesa cash transfers and airtime top-ups requested by users.</li>
                <li>Prevent voucher PIN recycling, duplicate scanning attacks, and fraudulent velocity exploits.</li>
                <li>Provide real-time telemetry dashboards and audit trails for tenant compliance.</li>
                <li>Fulfill mandatory legal recordkeeping obligations under Kenyan commercial law.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white uppercase tracking-wider">4. Multi-Tenant Data Isolation &amp; Security Standards</h2>
              <p>
                Oduktech implements technical and organizational safeguards to protect tenant data:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-600 dark:text-gray-400">
                <li><strong>Logical Database Isolation:</strong> Row-level tenant keys ensure tenant data cannot be accessed across tenant boundaries.</li>
                <li><strong>Encryption at Rest &amp; Transit:</strong> TLS 1.3 encryption for all Web/API traffic; AES-256 encryption for integration credentials and RSA PKCS#1 v1.5 for Safaricom Security Credentials.</li>
                <li><strong>No Commercial Monetization:</strong> Oduktech does NOT sell, rent, or trade tenant consumer contact lists or transaction histories to third parties.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white uppercase tracking-wider">5. Third-Party Integrations &amp; Telecommunication Operators</h2>
              <p>
                Data is shared strictly on a need-to-know basis with licensed telecommunication operators and aggregators (Safaricom PLC, Africa&apos;s Talking, Olive Tree Media, Jenga/Equity Bank) solely to complete financial disbursements and SMS transmissions.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white uppercase tracking-wider">6. Consumer Rights &amp; Data Subject Requests</h2>
              <p>
                Under Section 26 of the <strong>Kenya Data Protection Act, 2019</strong>, data subjects have the right to:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-600 dark:text-gray-400">
                <li>Request confirmation of whether their personal data is being processed.</li>
                <li>Request correction or deletion of inaccurate, incomplete, or obsolete personal data.</li>
                <li>Object to direct marketing SMS broadcasts.</li>
              </ul>
              <p className="text-gray-600 dark:text-gray-400">
                Consumer inquiries may be directed to the respective Tenant Organization or submitted to Oduktech&apos;s Data Protection team at <a href="mailto:info@oduktech.com" className="text-brand-600 dark:text-brand-400 font-semibold underline">info@oduktech.com</a> or call <a href="tel:0726444005" className="text-brand-600 dark:text-brand-400 font-semibold underline">0726444005</a>.
              </p>
            </section>

            <section className="space-y-4 pt-8 border-t border-gray-100 dark:border-white/5">
              <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white uppercase tracking-wider">7. Oduktech Contact Information</h2>
              <p className="text-gray-600 dark:text-gray-400">
                For questions regarding this Privacy Policy, data protection compliance, or to exercise your data subject rights, please reach out to Oduktech:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-5 rounded-xl bg-gray-50 dark:bg-white/[0.02] border border-gray-200/80 dark:border-white/10 text-sm">
                <div>
                  <span className="font-bold text-gray-900 dark:text-white block">Developer &amp; Platform Operator:</span>
                  <span className="text-gray-600 dark:text-gray-300">Oduktech</span>
                </div>
                <div>
                  <span className="font-bold text-gray-900 dark:text-white block">Product:</span>
                  <span className="text-gray-600 dark:text-gray-300">TuzoHub Enterprise Loyalty Platform</span>
                </div>
                <div>
                  <span className="font-bold text-gray-900 dark:text-white block">Official Email:</span>
                  <a href="mailto:info@oduktech.com" className="text-brand-600 dark:text-brand-400 font-semibold underline">
                    info@oduktech.com
                  </a>
                </div>
                <div>
                  <span className="font-bold text-gray-900 dark:text-white block">Official Phone:</span>
                  <a href="tel:0726444005" className="text-brand-600 dark:text-brand-400 font-semibold underline">
                    0726444005
                  </a>
                </div>
              </div>
            </section>

          </div>

          {/* Footer Back Link */}
          <div className="mt-12 border-t border-gray-100 dark:border-white/5 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-500">
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
