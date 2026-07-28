"use client";

import React, { use, useState } from "react";
import Link from "next/link";
import Badge from "@/components/ui/badge/Badge";
import { useApi } from "@/hooks/useApi";
import { ArrowDownIcon, ArrowUpIcon, BoxCubeIcon } from "@/icons";

interface PageProps {
  params: Promise<{ id: string }>;
}

function TruncatedId({ id }: { id: string }) {
  const [copied, setCopied] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const shortId = id ? `${id.slice(0, 8)} •••• ${id.slice(-6)}` : "—";

  const handleCopy = () => {
    if (!id) return;
    navigator.clipboard.writeText(id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleCopy}
      className="relative inline-flex items-center gap-2 px-2.5 py-1 bg-gray-100 hover:bg-gray-200 dark:bg-white/5 dark:hover:bg-white/10 rounded-lg border border-gray-200 dark:border-white/10 cursor-pointer group transition-all"
      title="Click to copy full Transaction ID"
    >
      <span className="font-mono text-xs font-bold text-gray-800 dark:text-gray-200 transition-all">
        {isHovered ? id : shortId}
      </span>
      
      {/* Copy / Eye Icon */}
      <svg className="w-3.5 h-3.5 text-gray-400 group-hover:text-brand-500 transition-colors shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
        {copied ? (
          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
        ) : (
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v2.25A2.25 2.25 0 0113.5 21.75h-9a2.25 2.25 0 01-2.25-2.25v-9A2.25 2.25 0 014.5 8.25h2.25m11.25 11.25h2.25a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9a2.25 2.25 0 00-2.25 2.25v2.25" />
        )}
      </svg>

      {/* Copy notification tooltip */}
      {copied && (
        <span className="absolute -top-7 left-1/2 -translate-x-1/2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-[10px] font-bold px-2 py-0.5 rounded shadow-md animate-fadeIn whitespace-nowrap">
          Copied to clipboard!
        </span>
      )}
    </div>
  );
}

export default function TransactionDetail({ params }: PageProps) {
  const resolvedParams = use(params as any) as any;
  const id = resolvedParams?.id;

  const { data: tx, isLoading, isError } = useApi<any>(`/transactions/${id}`);
  const [showMetadata, setShowMetadata] = useState(true);

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] p-6 animate-fadeIn">
        <div className="p-4 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 mb-3 border border-rose-500/20">
           <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
        </div>
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">Transaction Record Not Found</h2>
        <p className="text-xs text-gray-500 mt-1">The requested transaction ledger entry does not exist or has been archived.</p>
        <Link href="/transactions" className="mt-4 px-4 py-2 bg-brand-600 text-white rounded-xl text-xs font-semibold hover:bg-brand-700 transition">Return to Ledger</Link>
      </div>
    );
  }

  if (isLoading || !tx) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-500 border-t-transparent"></div>
      </div>
    );
  }

  const transaction = tx.data || tx;
  const isCredit = transaction.accountingEntry === "CREDIT";
  const beneficiaryName = transaction.wallet?.consumer ? `${transaction.wallet.consumer.firstName} ${transaction.wallet.consumer.lastName}` : "System Account";
  const avatarLetter = beneficiaryName.charAt(0);

  return (
    <div className="w-full space-y-6 animate-fadeIn pb-12">

      {/* ── Header Toolbar ─────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-200/80 dark:border-white/[0.06] pb-5">
         <div className="flex items-center gap-4">
            <Link
              href="/transactions"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors text-gray-500 dark:text-gray-400"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
            </Link>
            <div className="space-y-1">
               <div className="flex items-center gap-3">
                 <h1 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">Transaction Entry</h1>
                 <Badge color={isCredit ? "success" : "error"} size="sm">
                   {transaction.accountingEntry}
                 </Badge>
               </div>
               
               {/* Innovative Truncated ID with Hover/Click Expansion */}
               <div className="flex items-center gap-2">
                 <span className="text-xs text-gray-400 font-medium">Ref ID:</span>
                 <TruncatedId id={transaction.id} />
               </div>
            </div>
         </div>

         <div className="flex items-center gap-3">
            <button
              onClick={() => window.print()}
              className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-white/5 dark:hover:bg-white/10 text-gray-900 dark:text-white text-xs font-semibold rounded-xl border border-gray-200/80 dark:border-white/10 transition flex items-center gap-2"
            >
               <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
               Print Statement
            </button>
         </div>
      </div>

      <div className="grid grid-cols-12 gap-6">

         {/* Left Column (Spans 8 columns) */}
         <div className="col-span-12 xl:col-span-8 space-y-6">

            {/* Summary Hero Banner */}
            <div className="bg-white dark:bg-white/[0.02] border border-gray-200/80 dark:border-white/[0.06] rounded-2xl p-8 shadow-sm flex flex-col items-center text-center space-y-3 relative overflow-hidden">
               <div className={`w-12 h-12 rounded-full flex items-center justify-center border shadow-2xs ${isCredit ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'}`}>
                  {isCredit ? <ArrowUpIcon className="w-6 h-6" /> : <ArrowDownIcon className="w-6 h-6" />}
               </div>
               <div>
                 <h2 className={`text-3xl font-black font-mono tracking-tight ${isCredit ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                    {isCredit ? '+' : '-'}{parseFloat(transaction.pointsAmount).toLocaleString()} <span className="text-sm font-sans font-normal opacity-70">PTS</span>
                 </h2>
                 <p className="text-xs text-gray-500 font-medium mt-1">{transaction.description || 'System-generated ledger allocation entry'}</p>
               </div>
               <div className="pt-2">
                  <Badge color={isCredit ? "success" : "error"} size="md">
                     {transaction.actionCategory?.replace(/_/g, " ").toLowerCase()}
                  </Badge>
               </div>
            </div>

            {/* Innovative Double-Entry Visual Flow diagram */}
            <div className="bg-white dark:bg-white/[0.02] border border-gray-200/80 dark:border-white/[0.06] rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 dark:border-white/5 pb-3">
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">Double-Entry Accounting Flow</h3>
                <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
                  Verified Double-Entry
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center pt-2">
                {/* Source Account */}
                <div className="bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-white/10 rounded-xl p-4 text-center space-y-1">
                  <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Debit Source</span>
                  <p className="text-xs font-bold text-gray-900 dark:text-white truncate">
                    {isCredit ? "Loyalty Campaign Treasury" : beneficiaryName}
                  </p>
                  <p className="text-[11px] font-mono text-gray-400">Account: 0xLEDGER_PLATFORM</p>
                </div>

                {/* Transfer Pipeline */}
                <div className="flex flex-col items-center justify-center space-y-1.5 py-2">
                  <span className="text-xs font-mono font-bold text-brand-600 dark:text-brand-400">
                    {isCredit ? "+" : "-"}{parseFloat(transaction.pointsAmount).toLocaleString()} PTS
                  </span>
                  <div className="w-full flex items-center gap-1">
                    <div className="h-0.5 flex-1 bg-gradient-to-r from-brand-500/20 via-brand-500 to-brand-500/20"></div>
                    <div className="w-6 h-6 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center text-xs font-bold border border-brand-500/20 shadow-2xs">
                      ➔
                    </div>
                  </div>
                  <span className="text-[10px] text-gray-400">{new Date(transaction.createdAt).toLocaleTimeString()}</span>
                </div>

                {/* Destination Account */}
                <div className="bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-white/10 rounded-xl p-4 text-center space-y-1">
                  <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Credit Beneficiary</span>
                  <p className="text-xs font-bold text-gray-900 dark:text-white truncate">
                    {isCredit ? beneficiaryName : "Platform Redemption Vault"}
                  </p>
                  <p className="text-[11px] font-mono text-gray-400">Wallet: {transaction.walletId?.slice(0, 12)}...</p>
                </div>
              </div>
            </div>

            {/* Metadata Grid */}
            <div className="bg-white dark:bg-white/[0.02] border border-gray-200/80 dark:border-white/[0.06] rounded-2xl overflow-hidden shadow-sm">
               <div className="border-b border-gray-100 dark:border-white/5 px-6 py-4">
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white">Ledger Specifications</h3>
               </div>
               <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <DetailRow label="Settlement Date" value={new Date(transaction.createdAt).toLocaleString()} />
                  <DetailRow label="Accounting Entry" value={transaction.accountingEntry} />
                  <DetailRow label="Action Category" value={transaction.actionCategory} />
                  <DetailRow label="Wallet Reference" value={transaction.walletId} />
                  <DetailRow label="Balance After Event" value={`${parseFloat(transaction.balanceAfter).toLocaleString()} PTS`} />
                  <DetailRow label="Expiry Policy" value={transaction.expiresAt ? new Date(transaction.expiresAt).toLocaleDateString() : 'No expiration policy'} />
               </div>
            </div>

            {transaction.metadata && (
               <div className="bg-white dark:bg-white/[0.02] border border-gray-200/80 dark:border-white/[0.06] rounded-2xl overflow-hidden shadow-sm">
                  <div className="border-b border-gray-100 dark:border-white/5 px-6 py-4 flex items-center justify-between">
                     <h3 className="text-sm font-bold text-gray-900 dark:text-white">Contextual Payload Data</h3>
                     <button
                       onClick={() => setShowMetadata(v => !v)}
                       className="text-xs font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400 transition"
                     >
                       {showMetadata ? "Hide JSON" : "Show JSON"}
                     </button>
                  </div>
                  {showMetadata && (
                    <div className="p-6">
                       <pre className="text-xs p-4 bg-gray-50 dark:bg-white/[0.03] rounded-xl border border-gray-200 dark:border-white/10 font-mono text-gray-700 dark:text-gray-300 overflow-x-auto">
                          {JSON.stringify(transaction.metadata, null, 2)}
                       </pre>
                    </div>
                  )}
               </div>
            )}
         </div>

         {/* Right Column (Spans 4 columns) */}
         <div className="col-span-12 xl:col-span-4 space-y-6">

            {/* Beneficiary Card */}
            <div className="bg-white dark:bg-white/[0.02] border border-gray-200/80 dark:border-white/[0.06] rounded-2xl p-6 shadow-sm space-y-4">
               <h3 className="text-sm font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-white/5 pb-3">Beneficiary Profile</h3>
               <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center font-bold text-xs shrink-0 border border-brand-500/20 shadow-2xs">
                     {avatarLetter}
                  </div>
                  <div>
                     <p className="text-xs font-bold text-gray-900 dark:text-white">
                        {beneficiaryName}
                     </p>
                     <p className="text-[11px] font-mono text-gray-400 mt-0.5">{transaction.wallet?.consumer?.phoneNumber || 'System Account'}</p>
                  </div>
               </div>
               {transaction.wallet?.consumer && (
                  <Link 
                    href={`/consumers/${transaction.wallet.consumer.id}`}
                    className="w-full inline-flex items-center justify-center px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-white/5 dark:hover:bg-white/10 text-gray-900 dark:text-white text-xs font-semibold rounded-xl border border-gray-200/80 dark:border-white/10 transition"
                  >
                     View Consumer Profile
                  </Link>
               )}
            </div>

            {/* Ledger Security Card */}
            <div className="bg-gradient-to-br from-gray-900 via-gray-950 to-black border border-gray-800 p-6 rounded-2xl text-white shadow-xl space-y-3 relative overflow-hidden">
               <div className="relative z-10 space-y-2">
                  <span className="text-[10px] font-semibold text-brand-400">Ledger Security &amp; Audit</span>
                  <p className="text-xs text-gray-400 leading-relaxed">
                     Verified through double-entry accounting ledger rules on <span className="text-white font-mono">{transaction.createdAt.slice(0, 10)}</span>.
                  </p>
                  <div className="pt-1 flex items-center gap-2 text-[11px] font-mono text-emerald-400 bg-white/5 p-2 rounded-xl border border-white/10 overflow-hidden">
                     <svg className="w-4 h-4 text-emerald-400 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                     <span className="truncate">TX-ID: {transaction.id}</span>
                  </div>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1">
       <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">{label}</span>
       <span className="text-xs font-bold text-gray-900 dark:text-white font-mono truncate">{value}</span>
    </div>
  );
}
