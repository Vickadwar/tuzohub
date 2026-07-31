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
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Logo size="md" href="/" />
          <div className="flex items-center gap-4 text-xs font-semibold">
            <Link href="/terms" className="text-gray-600 dark:text-gray-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
              Terms of Service
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
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold border border-emerald-500/20">
              Data Privacy Standard
            </span>
            <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
              Privacy &amp; Data Protection Policy
            </h1>
            <p className="mt-2 text-xs font-medium text-gray-500 dark:text-gray-400">
              Effective Date: {lastUpdated} | Compliant with Kenya Data Protection Act 2019.
            </p>
          </div>

          {/* Privacy Content Sections */}
          <div className="mt-8 space-y-8 text-xs leading-relaxed text-gray-700 dark:text-gray-300">
            
            <section className="space-y-2">
              <h2 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">1. Overview &amp; Data Controller Status</h2>
              <p>
                TuzoHub provides enterprise loyalty software infrastructure. In processing consumer reward redemptions, <strong>Tenant Organizations act as Data Controllers</strong>, and <strong>TuzoHub acts as a Data Processor</strong> operating under tenant instructions.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">2. Information Collected &amp; Processed</h2>
              <p>
                To execute B2C cash payouts and reward programs, TuzoHub processes:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-gray-600 dark:text-gray-400">
                <li><strong>Mobile Phone Numbers (MSISDNs):</strong> Used to route M-Pesa payouts and send SMS receipts.</li>
                <li><strong>Transaction Audit Records:</strong> M-Pesa B2C ConversationIDs, voucher PIN codes, timestamps, and payout amounts.</li>
                <li><strong>Device &amp; Telecommunication Telemetry:</strong> USSD session identifiers and IP addresses for fraud velocity checks.</li>
              </ul>
            </section>

            <section className="space-y-2">
              <h2 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">3. Data Isolation &amp; Security Standards</h2>
              <p>
                TuzoHub employs industry-standard encryption protocols (TLS 1.3 in transit and AES-256 for sensitive credential storage at rest). Multi-tenant records are logically isolated using tenant-scoped database constraints.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">4. Third-Party Integrations &amp; Telecommunications Aggregators</h2>
              <p>
                Data processed through TuzoHub is transmitted securely to licensed telecommunication operators (Safaricom PLC, Africa&apos;s Talking, Olive Tree Media) solely for the purpose of completing payment dispatches and SMS delivery.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">5. Consumer Rights under Data Protection Law</h2>
              <p>
                Participants have the right to request access to, correction of, or deletion of their personal information processed within a tenant&apos;s loyalty program by contacting the respective tenant administrator or emailing <a href="mailto:privacy@tuzohub.com" className="text-brand-600 dark:text-brand-400 underline">privacy@tuzohub.com</a>.
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
