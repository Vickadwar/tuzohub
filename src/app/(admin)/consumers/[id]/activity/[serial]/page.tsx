"use client";

import React, { use } from "react";
import Link from "next/link";
import { useApi } from "@/hooks/useApi";

interface PageProps { params: Promise<{ id: string; serial: string }>; }

export default function ActivityExplorer({ params }: PageProps) {
  const resolvedParams = use(params as any) as any;
  const { id: consumerId, serial } = resolvedParams;

  const { data: journey, isLoading, isError } = useApi<any>(`/consumers/${consumerId}/activity/${serial}`);

  if (isLoading) return <div className="flex min-h-[60vh] justify-center items-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-brand-500"></div></div>;
  if (isError || !journey) return <div className="p-8">Journey not found</div>;

  const { transactions, voucher, metadata, isVoucherRedemption } = journey;
  const earnTx = transactions.find((t: any) => t.accountingEntry === "CREDIT");
  const payoutTx = transactions.find((t: any) => t.accountingEntry === "DEBIT");
  const isComplete = payoutTx && transactions.length >= 2;

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-500">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 border-b border-gray-200/60 dark:border-white/[0.08] pb-8">
        <div>
          <nav className="mb-3 flex items-center gap-2 text-[13px] font-medium text-gray-500 dark:text-gray-400">
            <Link href={`/consumers/${consumerId}`} className="hover:text-gray-900 dark:hover:text-white transition-colors">Consumer Details</Link>
            <svg className="h-3.5 w-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
            <span className="text-gray-900 dark:text-gray-200">Timeline</span>
          </nav>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            Activity Explorer
          </h1>
          <p className="mt-2 text-base text-gray-500 dark:text-gray-400 font-mono text-[14px]">
            {isVoucherRedemption ? `Voucher: ${serial}` : `Ref: ${serial}`}
          </p>
        </div>
        <div className={`px-4 py-1.5 rounded-full text-sm font-semibold border ${isComplete ? 'bg-success-50 text-success-700 border-success-200 dark:bg-success-500/10 dark:text-success-400 dark:border-success-500/20' : 'bg-warning-50 text-warning-700 border-warning-200 dark:bg-warning-500/10 dark:text-warning-400 dark:border-warning-500/20'}`}>
          {isComplete ? "Journey Complete" : "In Progress"}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">

        {/* Main Timeline Col */}
        <div className="lg:col-span-2 space-y-12">

          <div className="relative space-y-10 before:absolute before:inset-0 before:ml-[1.4rem] before:h-full before:w-[2px] before:bg-gray-200 dark:before:bg-white/[0.08]">
            {/* Step 1 */}
            <div className="relative pl-16">
              <div className="absolute left-0 top-0 flex h-12 w-12 items-center justify-center rounded-full bg-white dark:bg-[#111113] border-4 border-gray-100 dark:border-[#1a1a1c] z-10 shadow-sm">
                <div className="h-4 w-4 rounded-full bg-gray-900 dark:bg-white"></div>
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Initiated Activity</h3>
                <p className="text-[15px] text-gray-500 dark:text-gray-400 mt-1">{earnTx?.description || "Initial scan or activity recorded."}</p>
                {earnTx && <div className="mt-3 inline-flex items-center bg-gray-50 dark:bg-white/[0.03] px-3 py-1.5 rounded-lg border border-gray-200 dark:border-white/[0.08] text-sm font-mono"><span className="text-gray-500 mr-3">{new Date(earnTx.createdAt).toLocaleTimeString()}</span><span className="text-success-600 font-bold">+{Number(earnTx.pointsAmount)} pts</span></div>}
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative pl-16">
              <div className="absolute left-0 top-0 flex h-12 w-12 items-center justify-center rounded-full bg-white dark:bg-[#111113] border-4 border-gray-100 dark:border-[#1a1a1c] z-10 shadow-sm">
                <div className={`h-4 w-4 rounded-full ${payoutTx ? 'bg-gray-900 dark:bg-white' : 'bg-gray-300 dark:bg-gray-700'}`}></div>
              </div>
              <div>
                <h3 className={`text-lg font-bold ${payoutTx ? 'text-gray-900 dark:text-white' : 'text-gray-400'}`}>Payout Triggered</h3>
                <p className="text-[15px] text-gray-500 dark:text-gray-400 mt-1">{payoutTx ? "System converted points to fulfillment." : "Awaiting trigger..."}</p>
                {payoutTx && <div className="mt-3 inline-flex items-center bg-gray-50 dark:bg-white/[0.03] px-3 py-1.5 rounded-lg border border-gray-200 dark:border-white/[0.08] text-sm font-mono"><span className="text-gray-500 mr-3">{new Date(payoutTx.createdAt).toLocaleTimeString()}</span><span className="text-gray-900 dark:text-white font-bold">-{Number(payoutTx.pointsAmount)} pts</span></div>}
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative pl-16">
              <div className="absolute left-0 top-0 flex h-12 w-12 items-center justify-center rounded-full bg-white dark:bg-[#111113] border-4 border-gray-100 dark:border-[#1a1a1c] z-10 shadow-sm">
                <div className={`h-4 w-4 rounded-full ${isComplete ? 'bg-success-500' : 'bg-gray-300 dark:bg-gray-700'}`}></div>
              </div>
              <div>
                <h3 className={`text-lg font-bold ${isComplete ? 'text-gray-900 dark:text-white' : 'text-gray-400'}`}>Fulfillment Complete</h3>
                <p className="text-[15px] text-gray-500 dark:text-gray-400 mt-1">{metadata.mpesaRef ? `Confirmed M-PESA: ${metadata.mpesaRef}` : isComplete ? "Successfully fulfilled." : "Pending confirmation..."}</p>
              </div>
            </div>
          </div>

          {/* Audit Log Table */}
          <div className="pt-8 border-t border-gray-200/60 dark:border-white/[0.08]">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Terminal Audit Log</h3>
            <div className="rounded-xl border border-gray-200/80 bg-white dark:bg-[#111113] dark:border-white/[0.08] overflow-hidden">
              <table className="w-full text-left text-[13px] font-mono">
                <thead className="bg-gray-50/50 dark:bg-white/[0.02] text-gray-500 border-b border-gray-100 dark:border-white/[0.05]">
                  <tr><th className="px-5 py-3 font-medium">Timestamp</th><th className="px-5 py-3 font-medium">Operation</th><th className="px-5 py-3 font-medium text-right">Value</th></tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                  {transactions.map((t: any, i: number) => (
                    <tr key={i}>
                      <td className="px-5 py-3 text-gray-500">{new Date(t.createdAt).toISOString().replace('T', ' ').substring(0, 19)}</td>
                      <td className="px-5 py-3 text-gray-900 dark:text-gray-300">{t.actionCategory}</td>
                      <td className={`px-5 py-3 text-right ${t.accountingEntry === 'CREDIT' ? 'text-success-600' : 'text-gray-900 dark:text-white'}`}>{t.accountingEntry === 'CREDIT' ? '+' : '-'}{Number(t.pointsAmount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Col: Context Sidebar */}
        <div className="space-y-6 sticky top-8">
          <div className="rounded-2xl border border-gray-200/80 bg-gray-50/50 p-6 dark:border-white/[0.08] dark:bg-white/[0.02]">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6">Product Attributes</h3>
            {voucher?.batch?.product ? (
              <div className="space-y-5">
                <div>
                  <span className="text-[13px] text-gray-500 block mb-1">Product</span>
                  <span className="text-[15px] font-semibold text-gray-900 dark:text-white">{voucher.batch.product.name}</span>
                </div>
                <div>
                  <span className="text-[13px] text-gray-500 block mb-1">Yield</span>
                  <span className="text-[15px] font-semibold text-gray-900 dark:text-white">{voucher.batch.product.pointsPerUnit} base pts</span>
                </div>
              </div>
            ) : (
              <p className="text-[14px] text-gray-500">Non-voucher driven activity.</p>
            )}
          </div>

          <div className="rounded-2xl border border-gray-200/80 bg-gray-50/50 p-6 dark:border-white/[0.08] dark:bg-white/[0.02]">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6">Security Context</h3>
            <div className="space-y-4">
              <div className="flex justify-between text-[14px]">
                <span className="text-gray-500">Channel</span>
                <span className="font-semibold text-gray-900 dark:text-white capitalize">{metadata.channel || "Admin"}</span>
              </div>
              <div className="flex justify-between text-[14px]">
                <span className="text-gray-500">Fraud Check</span>
                <span className="font-semibold text-success-600">Passed</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}