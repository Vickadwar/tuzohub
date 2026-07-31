"use client";

import React, { use } from "react";
import Link from "next/link";
import Badge from "@/components/ui/badge/Badge";
import { useApi } from "@/hooks/useApi";

interface PageProps {
  params: Promise<{ id: string }>;
}

const STATUS_CONFIG: Record<string, { color: string; label: string }> = {
  GENERATED: { color: "light", label: "Generated" },
  PRINTED: { color: "warning", label: "Printed" },
  AT_PRINTER: { color: "warning", label: "At Printer Press" },
  IN_TRANSIT: { color: "purple", label: "In Transit" },
  IN_STOCK: { color: "info", label: "In Stock" },
  ACTIVE: { color: "success", label: "Active" },
  REDEEMED: { color: "success", label: "Redeemed" },
  CANCELLED: { color: "error", label: "Cancelled" },
  EXPIRED: { color: "error", label: "Expired" },
};

export default function VoucherDetail({ params }: PageProps) {
  const resolvedParams = use(params as any) as any;
  const id = resolvedParams?.id;

  const { data: voucher, isLoading, isError } = useApi<any>(`/vouchers/${id}`);

  if (isError) {
    return (
      <div className="w-full">
        <div className="flex items-center gap-3 rounded-md bg-error-50 p-4 border border-error-200 dark:bg-error-500/10 dark:border-error-500/20">
          <svg className="h-5 w-5 shrink-0 text-error-600 dark:text-error-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <p className="text-sm font-medium text-error-800 dark:text-error-300">Failed to load voucher. Please try again.</p>
        </div>
      </div>
    );
  }

  if (isLoading || !voucher) {
    return (
      <div className="flex min-h-[60vh] w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-brand-500 dark:border-white/10 dark:border-t-brand-400"></div>
      </div>
    );
  }

  const statusConf = STATUS_CONFIG[voucher?.status] || { color: "light", label: voucher?.status || "Unknown" };

  // Timeline steps — computed from voucher data
  const steps = buildTimeline(voucher);

  // Calculate redemption delta (time from printed to redeemed)
  let redemptionDelta = "—";
  if (voucher.redeemedAt && voucher.createdAt) {
    const printed = new Date(voucher.createdAt).getTime();
    const redeemed = new Date(voucher.redeemedAt).getTime();
    const diffMs = redeemed - printed;
    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    redemptionDelta = days > 0 ? `${days}d ${hours}h` : `${hours}h`;
  }

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-500">

      {/* ── Page Header ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5 rounded-lg bg-white p-6 border border-gray-200 shadow-sm dark:bg-[#18181b] dark:border-white/10">
        <div className="flex items-center gap-5">
          <Link
            href="/vouchers"
            className="group flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-gray-200 bg-white shadow-sm transition-all hover:bg-gray-50 dark:border-white/10 dark:bg-[#18181b] dark:hover:bg-white/5"
          >
            <svg className="h-4 w-4 text-gray-500 transition-transform group-hover:-translate-x-0.5 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </Link>

          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-100 shadow-sm dark:bg-indigo-500/20">
            <svg className="h-6 w-6 text-indigo-700 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M7.5 15h3M3.375 5.25c-.621 0-1.125.504-1.125 1.125v3.026a2.999 2.999 0 010 5.198v3.026c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-3.026a2.999 2.999 0 010-5.198V6.375c0-.621-.504-1.125-1.125-1.125H3.375z" />
            </svg>
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-xl font-semibold tracking-tight text-gray-900 dark:text-white font-mono">
                {voucher.serialNumber}
              </h1>
              <Badge color={statusConf.color as any} size="sm">{statusConf.label}</Badge>
            </div>
            <p className="mt-1 text-sm font-medium text-gray-500 dark:text-gray-400">
              Batch {voucher.batchNumber} · {voucher.productName || "No product linked"}
            </p>
          </div>
        </div>
      </div>

      {/* ── Main Layout: 12-Column Grid ───────────────────────────────────── */}
      <div className="grid grid-cols-12 gap-6">

        {/* Left Column — Timeline */}
        <div className="col-span-12 space-y-6 xl:col-span-8">

          {/* Voucher Lifecycle Timeline */}
          <div className="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-white/10 dark:bg-[#18181b] overflow-hidden">
            <div className="border-b border-gray-100 px-6 py-5 dark:border-white/5">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">Voucher lifecycle</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Complete journey from print to redemption.</p>
            </div>
            <div className="p-6">
              <div className="relative">
                {steps.map((step, idx) => (
                  <div key={idx} className="relative flex gap-5 pb-8 last:pb-0">
                    {/* Vertical line */}
                    {idx < steps.length - 1 && (
                      <div className={`absolute left-[15px] top-[32px] w-0.5 h-[calc(100%-20px)] ${step.completed ? "bg-brand-200 dark:bg-brand-500/40" : "bg-gray-200 dark:bg-white/10"}`}></div>
                    )}

                    {/* Circle */}
                    <div className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-300 ${
                      step.completed
                        ? "border-brand-500 bg-brand-500 text-white dark:border-brand-400 dark:bg-brand-400"
                        : step.active
                        ? "border-brand-500 bg-white text-brand-500 dark:border-brand-400 dark:bg-[#121212] dark:text-brand-400 ring-4 ring-brand-500/20"
                        : "border-gray-300 bg-white text-gray-400 dark:border-white/20 dark:bg-[#121212] dark:text-gray-500"
                    }`}>
                      {step.completed ? (
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <span className="text-xs font-bold">{idx + 1}</span>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 pt-0.5">
                      <h4 className={`text-sm font-semibold ${step.completed || step.active ? "text-gray-900 dark:text-white" : "text-gray-400 dark:text-gray-500"}`}>
                        {step.title}
                      </h4>
                      {step.description && (
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{step.description}</p>
                      )}
                      {step.timestamp && (
                        <p className="mt-1.5 inline-flex items-center gap-1.5 text-xs font-medium text-gray-400 dark:text-gray-500">
                          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {new Date(step.timestamp).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}
                        </p>
                      )}
                      {step.extra && (
                        <div className="mt-3 rounded-md border border-gray-100 bg-gray-50 p-3 dark:border-white/5 dark:bg-white/5 space-y-1.5">
                          {step.extra.map((item: any, i: number) => (
                            <div key={i} className="flex justify-between items-center text-sm">
                              <span className="text-gray-500 dark:text-gray-400">{item.label}</span>
                              <span className="font-medium text-gray-900 dark:text-white">{item.value}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Product Information */}
          <div className="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-white/10 dark:bg-[#18181b] overflow-hidden">
            <div className="border-b border-gray-100 px-6 py-5 dark:border-white/5">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">Product information</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-1 p-6">
              <InfoRow label="Product" value={voucher.productName || "Not linked"} />
              <InfoRow label="SKU" value={voucher.productSku || "—"} />
              <InfoRow label="Campaign" value={voucher.campaignName || "No campaign"} />
              <InfoRow label="Batch number" value={voucher.batchNumber} />
              <InfoRow label="Batch activation" value={voucher.isActivated ? "Activated" : "Pending activation"} />
              <InfoRow label="Expiry date" value={voucher.expiryDate ? new Date(voucher.expiryDate).toLocaleDateString() : "No expiry"} />
            </div>
          </div>
        </div>

        {/* Right Column — Metrics */}
        <div className="col-span-12 space-y-6 xl:col-span-4">
          {/* Key Metrics */}
          <div className="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-white/10 dark:bg-[#18181b]">
            <div className="border-b border-gray-100 px-6 py-5 dark:border-white/5">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">Key metrics</h3>
            </div>
            <div className="flex flex-col p-6 space-y-4">
              <div className="flex flex-col gap-1 rounded-md border border-gray-100 bg-gray-50 p-4 dark:border-white/5 dark:bg-white/5">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</span>
                <span className="text-lg font-semibold text-gray-900 dark:text-white capitalize">{statusConf.label}</span>
              </div>
              <div className="flex flex-col gap-1 rounded-md border border-gray-100 bg-gray-50 p-4 dark:border-white/5 dark:bg-white/5">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Time to redemption</span>
                <span className="text-lg font-semibold text-gray-900 dark:text-white">{redemptionDelta}</span>
              </div>
              <div className="flex flex-col gap-1 rounded-md border border-gray-100 bg-gray-50 p-4 dark:border-white/5 dark:bg-white/5">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Created</span>
                <span className="text-sm font-semibold text-gray-900 dark:text-white">
                  {new Date(voucher.createdAt).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}
                </span>
              </div>
            </div>
          </div>

          {/* Redeemer Info */}
          <div className="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-white/10 dark:bg-[#18181b]">
            <div className="border-b border-gray-100 px-6 py-5 dark:border-white/5">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">Redeemed by</h3>
            </div>
            <div className="p-6">
              {voucher.redeemedBy ? (
                <div className="flex items-center gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-700 dark:bg-brand-500/20 dark:text-brand-400">
                    {voucher.consumerFirstName?.charAt(0) || "?"}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                      {voucher.consumerFirstName} {voucher.consumerLastName}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{voucher.consumerPhone}</p>
                    <p className="text-xs font-mono text-gray-400 dark:text-gray-500 mt-0.5">
                      Loyalty #{voucher.consumerLoyaltyNumber}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-4 text-center">
                  <svg className="mb-2 h-8 w-8 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                  </svg>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Not yet redeemed</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">This voucher is awaiting redemption</p>
                </div>
              )}
            </div>
          </div>

          {/* Insights */}
          <div className="relative overflow-hidden rounded-lg bg-gray-900 p-6 text-white shadow-sm dark:bg-[#121212] dark:border dark:border-white/10">
            <div className="relative z-10">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-brand-400">Traceability</h4>
              <p className="mt-2 text-lg font-semibold leading-tight text-white">Full audit trail</p>
              <p className="mt-2 text-sm leading-relaxed text-gray-400">
                Every stage of this voucher&apos;s journey is tracked — from printing through the supply chain to the end consumer&apos;s mobile wallet.
              </p>
            </div>
            <div className="absolute -right-8 -bottom-8 h-32 w-32 rounded-full bg-brand-500/20 blur-2xl pointer-events-none"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Timeline Builder ────────────────────────────────────────────────────────

function buildTimeline(v: any) {
  const statusOrder = ["GENERATED", "AT_PRINTER", "IN_TRANSIT", "IN_STOCK", "ACTIVE", "REDEEMED"];
  const currentIdx = v.isActivated ? 4 : Math.max(0, statusOrder.indexOf(v.status));

  const steps = [
    {
      title: "1. Voucher token generated",
      description: `Serial ${v.serialNumber} cataloged in batch ${v.batchNumber}`,
      timestamp: v.createdAt,
      completed: currentIdx >= 0,
      active: currentIdx === 0,
      extra: null,
    },
    {
      title: "2. At commercial printer press",
      description: "Scratch-card printing & security coating at commercial press.",
      timestamp: null,
      completed: currentIdx >= 1,
      active: currentIdx === 1,
      extra: null,
    },
    {
      title: "3. Dispatched / In transit",
      description: "Dispatched from printer press to factory warehouse inventory.",
      timestamp: null,
      completed: currentIdx >= 2,
      active: currentIdx === 2,
      extra: null,
    },
    {
      title: "4. Received in factory stock",
      description: "Confirmed in stock and ready for factory packaging run.",
      timestamp: null,
      completed: currentIdx >= 3,
      active: currentIdx === 3,
      extra: null,
    },
    {
      title: "5. Activated in factory production run",
      description: v.isActivated || v.status === "ACTIVE" || v.status === "REDEEMED"
        ? `Batch & card confirmed active — vouchers are live for consumer redemption.`
        : "Pending insertion into product tins & activation by production team.",
      timestamp: v.activatedAt,
      completed: currentIdx >= 4,
      active: currentIdx === 4,
      extra: v.productName ? [
        { label: "Product", value: v.productName },
        { label: "SKU", value: v.productSku || "—" },
      ] : null,
    },
    {
      title: "6. Redeemed by consumer",
      description: v.redeemedBy
        ? `Redeemed by ${v.consumerFirstName} ${v.consumerLastName} (${v.consumerPhone})`
        : "Awaiting consumer redemption via USSD or web terminal.",
      timestamp: v.redeemedAt,
      completed: currentIdx >= 5,
      active: currentIdx === 5,
      extra: v.redeemedBy ? [
        { label: "Consumer", value: `${v.consumerFirstName} ${v.consumerLastName}` },
        { label: "Phone", value: v.consumerPhone || "—" },
        { label: "Loyalty #", value: v.consumerLoyaltyNumber || "—" },
      ] : null,
    },
  ];

  return steps;
}

// ─── Reusable Row ────────────────────────────────────────────────────────────

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1.5 py-3 border-b border-gray-50 dark:border-white/5">
      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</span>
      <span className="text-sm font-medium text-gray-900 dark:text-gray-200">{value}</span>
    </div>
  );
}
