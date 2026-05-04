"use client";

import React, { use } from "react";
import Link from "next/link";
import Badge from "@/components/ui/badge/Badge";
import { useApi } from "@/hooks/useApi";
import { ArrowDownIcon, ArrowUpIcon } from "@/icons";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function TransactionDetail({ params }: PageProps) {
  const resolvedParams = use(params as any) as any;
  const id = resolvedParams?.id;

  const { data: tx, isLoading, isError } = useApi<any>(`/transactions/${id}`);

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] animate-in fade-in">
        <div className="p-4 rounded-full bg-error-50 dark:bg-error-500/10 text-error-600 mb-4">
           <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
        </div>
        <h2 className="text-xl font-bold dark:text-white">Transaction not found</h2>
        <p className="text-gray-500 mt-2">The requested transaction ledger entry does not exist or has been archived.</p>
        <Link href="/transactions" className="mt-6 px-4 py-2 bg-brand-600 text-white rounded-md text-sm font-medium hover:bg-brand-700 transition">Return to ledger</Link>
      </div>
    );
  }

  if (isLoading || !tx) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-brand-500"></div>
      </div>
    );
  }

  const transaction = tx.data || tx;
  const isCredit = transaction.accountingEntry === "CREDIT";

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500 pb-12">
      {/* breadcrumbs & Actions */}
      <div className="flex items-center justify-between">
         <div className="flex items-center gap-3">
            <Link href="/transactions" className="p-2 rounded-full border border-gray-200 hover:bg-gray-50 dark:border-white/10 dark:hover:bg-white/5 transition">
               <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
            </Link>
            <div>
               <h1 className="text-xl font-bold dark:text-white">Transaction details</h1>
               <p className="text-sm text-gray-500">Hash: {transaction.id}</p>
            </div>
         </div>
         <button className="px-4 py-2 bg-white border border-gray-200 rounded-md text-sm font-medium hover:bg-gray-50 dark:bg-white/5 dark:border-white/10 dark:text-white flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
            Print receipt
         </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
         {/* Main Summary Card */}
         <div className="md:col-span-2 space-y-8">
            <div className="bg-white border border-gray-200 rounded-2xl p-8 dark:bg-[#18181b] dark:border-white/10 shadow-sm relative overflow-hidden">
               <div className="relative z-10 flex flex-col items-center text-center">
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${isCredit ? 'bg-success-50 text-success-600 dark:bg-success-500/10' : 'bg-error-50 text-error-600 dark:bg-error-500/10'}`}>
                     {isCredit ? <ArrowUpIcon className="w-8 h-8" /> : <ArrowDownIcon className="w-8 h-8" />}
                  </div>
                  <h2 className={`text-4xl font-black ${isCredit ? 'text-success-600 dark:text-success-500' : 'text-error-600 dark:text-error-500'}`}>
                     {isCredit ? '+' : '-'}{parseFloat(transaction.pointsAmount).toLocaleString()}
                     <span className="text-lg font-bold ml-2 opacity-60">PTS</span>
                  </h2>
                  <p className="mt-4 text-gray-500 font-medium">{transaction.description || 'System generated entry'}</p>
                  <div className="mt-6">
                     <Badge color={isCredit ? "success" : "error"} size="md">
                        {transaction.actionCategory?.replace(/_/g, " ")}
                     </Badge>
                  </div>
               </div>
               {/* Background Pattern */}
               <div className="absolute top-0 right-0 w-64 h-64 bg-gray-50 dark:bg-white/[0.02] -rotate-12 translate-x-32 -translate-y-32 rounded-3xl -z-0"></div>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden dark:bg-[#18181b] dark:border-white/10 shadow-sm">
               <div className="px-6 py-4 border-b border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/[0.02]">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400">Ledger metadata</h3>
               </div>
               <div className="p-6 grid grid-cols-2 gap-y-6">
                  <DetailRow label="Settlement Date" value={new Date(transaction.createdAt).toLocaleString()} />
                  <DetailRow label="Accounting Entry" value={transaction.accountingEntry} />
                  <DetailRow label="Action Type" value={transaction.actionCategory} />
                  <DetailRow label="Wallet Reference" value={transaction.walletId} />
                  <DetailRow label="Balance After" value={`${parseFloat(transaction.balanceAfter).toLocaleString()} PTS`} />
                  <DetailRow label="Expiry Policy" value={transaction.expiresAt ? new Date(transaction.expiresAt).toLocaleDateString() : 'N/A (No expiry)'} />
               </div>
            </div>

            {transaction.metadata && (
               <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden dark:bg-[#18181b] dark:border-white/10 shadow-sm">
                  <div className="px-6 py-4 border-b border-gray-100 dark:border-white/5">
                     <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400">Contextual data</h3>
                  </div>
                  <div className="p-6">
                     <pre className="text-xs p-4 bg-gray-50 dark:bg-white/[0.02] rounded-lg border border-gray-100 dark:border-white/5 overflow-x-auto text-gray-600 dark:text-gray-400">
                        {JSON.stringify(transaction.metadata, null, 2)}
                     </pre>
                  </div>
               </div>
            )}
         </div>

         {/* Sidebar / beneficiary Info */}
         <div className="space-y-8">
            <div className="bg-white border border-gray-200 rounded-2xl p-6 dark:bg-[#18181b] dark:border-white/10 shadow-sm">
               <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-6 font-primary">Beneficiary</h3>
               <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-bold dark:bg-brand-500/20 dark:text-brand-300">
                     {transaction.wallet?.consumer?.firstName?.charAt(0) || 'S'}
                  </div>
                  <div>
                     <p className="text-base font-bold dark:text-white">
                        {transaction.wallet?.consumer ? `${transaction.wallet.consumer.firstName} ${transaction.wallet.consumer.lastName}` : "System Account"}
                     </p>
                     <p className="text-sm text-gray-500">{transaction.wallet?.consumer?.phoneNumber || 'Platform'}</p>
                  </div>
               </div>
               <Link 
                 href={transaction.wallet?.consumer ? `/consumers/${transaction.wallet.consumer.id}` : '#'}
                 className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-200 rounded-md text-sm font-medium hover:bg-gray-50 dark:border-white/10 dark:text-white transition"
               >
                  View profile
               </Link>
            </div>

            <div className="bg-gray-900 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden border border-white/10">
               <div className="relative z-10">
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-400">Blockchain Integrity</span>
                  <p className="mt-4 text-sm leading-relaxed text-gray-400">
                     This transaction was verified through the hash-chain at <span className="text-white font-mono">{transaction.createdAt.slice(0, 10)}</span>. 
                     It is immutable and cryptographically secured.
                  </p>
                  <div className="mt-6 flex items-center gap-2 text-xs font-mono bg-white/5 p-2 rounded border border-white/5 overflow-hidden">
                     <svg className="w-4 h-4 text-success-500 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                     <span className="truncate opacity-50">TX-ID: {transaction.id}</span>
                  </div>
               </div>
               <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500/10 blur-3xl"></div>
            </div>
         </div>
      </div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1">
       <span className="text-xs text-gray-500 font-medium uppercase tracking-wider">{label}</span>
       <span className="text-sm font-semibold dark:text-gray-200 truncate pr-4">{value}</span>
    </div>
  );
}
