"use client";

import React from "react";
import Link from "next/link";
import { Logo } from "@/components/common/Logo";

export default function SecurityCompliancePage() {
  const lastUpdated = "July 31, 2026";

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 transition-colors">
      {/* Header Bar */}
      <header className="sticky top-0 z-30 border-b border-gray-200/80 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md dark:border-white/10">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          <Logo size="md" href="/" />
          <div className="flex items-center gap-6 text-sm font-semibold">
            <Link href="/terms" className="text-gray-600 dark:text-gray-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
              Terms
            </Link>
            <Link href="/privacy" className="text-gray-600 dark:text-gray-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
              Privacy Policy
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
              <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-sm font-bold border border-blue-500/20">
                Developed by Oduktech
              </span>
              <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-sm font-bold border border-emerald-500/20">
                100% Enterprise Security Standard
              </span>
            </div>
            <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
              Platform Security &amp; Compliance Policy
            </h1>
            <p className="mt-3 text-base font-medium text-gray-500 dark:text-gray-400">
              Effective Date: {lastUpdated} | Architecture, Data Minimization, and Encryption Protocols.
            </p>
          </div>

          {/* Content Sections */}
          <div className="mt-10 space-y-10 text-base sm:text-lg leading-relaxed text-gray-700 dark:text-gray-300">
            
            <section className="space-y-3">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white uppercase tracking-wider">1. Platform Architecture &amp; Developer Attribution</h2>
              <p>
                <strong>TuzoHub</strong> is built and maintained by <strong>Oduktech</strong> as a high-security, multi-tenant B2B2C loyalty and payout orchestration switch. The platform is designed from the ground up to isolate tenant environments, protect customer credentials, and enforce zero-trust API access controls.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white uppercase tracking-wider">2. Data Minimization &amp; Voluntarily High Standard Privacy</h2>
              <p>
                Oduktech adheres strictly to the principle of <strong>Data Minimization</strong> under the Kenya Data Protection Act 2019. TuzoHub collects and processes only the minimum data fields necessary to complete transaction rewards:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-600 dark:text-gray-400">
                <li>Recipient phone number (MSISDN) for payout routing and SMS receipts.</li>
                <li>Hashed voucher PIN codes and payout amount.</li>
                <li>USSD SessionIDs and IP telemetry for velocity fraud detection.</li>
              </ul>
              <p className="text-gray-600 dark:text-gray-400">
                No personal identification numbers (national IDs, passwords, or banking details) are stored on TuzoHub servers.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white uppercase tracking-wider">3. Multi-Tenant Logical Data Isolation</h2>
              <p>
                Every tenant organization operating on TuzoHub is assigned a unique system identifier (`tenant_id`). Database access is strictly regulated using <strong>Row Level Security (RLS)</strong> policies. Tenant A cannot read, query, or mutate Tenant B&apos;s data under any circumstances.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white uppercase tracking-wider">4. Cryptographic Encryption Standards</h2>
              <p>
                TuzoHub implements enterprise-grade cryptography:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-600 dark:text-gray-400">
                <li><strong>Encryption in Transit:</strong> TLS 1.3 for all Web portal and REST API endpoints.</li>
                <li><strong>Encryption at Rest:</strong> AES-256 for database fields and sensitive integration parameters.</li>
                <li><strong>Safaricom Daraja PKI:</strong> RSA PKCS#1 v1.5 public key certificate encryption for M-Pesa B2C `SecurityCredential` generation.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white uppercase tracking-wider">5. Real-Time Anti-Fraud &amp; Velocity Control Engine</h2>
              <p>
                TuzoHub guards tenant financial liability through an automated rules engine:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-600 dark:text-gray-400">
                <li>Configurable maximum scan velocity per MSISDN per hour/day.</li>
                <li>Cryptographic SHA-256 voucher PIN hashing to prevent PIN recycling.</li>
                <li>Automated account locking upon repeated invalid PIN attempts.</li>
                <li>Immutable financial transaction audit logging.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white uppercase tracking-wider">6. Vulnerability Disclosure &amp; Incident Response</h2>
              <p>
                Oduktech maintains a 24/7 security monitoring team. If you discover a potential vulnerability in TuzoHub, please report it immediately to our security response team at <a href="mailto:info@oduktech.com" className="text-brand-600 dark:text-brand-400 font-semibold underline">info@oduktech.com</a> or call <a href="tel:0726444005" className="text-brand-600 dark:text-brand-400 font-semibold underline">0726444005</a>.
              </p>
            </section>

            <section className="space-y-4 pt-8 border-t border-gray-100 dark:border-white/5">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white uppercase tracking-wider">7. Corporate Contact Details</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-6 rounded-xl bg-gray-50 dark:bg-white/[0.02] border border-gray-200/80 dark:border-white/10 text-base">
                <div>
                  <span className="font-bold text-gray-900 dark:text-white block">Developer &amp; Security Operator:</span>
                  <span className="text-gray-600 dark:text-gray-300">Oduktech</span>
                </div>
                <div>
                  <span className="font-bold text-gray-900 dark:text-white block">Product:</span>
                  <span className="text-gray-600 dark:text-gray-300">TuzoHub Enterprise Loyalty Platform</span>
                </div>
                <div>
                  <span className="font-bold text-gray-900 dark:text-white block">Security Email:</span>
                  <a href="mailto:info@oduktech.com" className="text-brand-600 dark:text-brand-400 font-semibold underline">
                    info@oduktech.com
                  </a>
                </div>
                <div>
                  <span className="font-bold text-gray-900 dark:text-white block">Support Hotline:</span>
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
