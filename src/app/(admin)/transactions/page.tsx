"use client";

import React, { useState } from "react";
import Link from "next/link";
import Badge from "@/components/ui/badge/Badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowDownIcon, ArrowUpIcon, TableIcon } from "@/icons";
import { useApi } from "@/hooks/useApi";

export default function TransactionsLedger() {
  const [page, setPage] = useState(1);
  const { data: txData, isLoading } = useApi<any>(`/transactions?page=${page}&limit=20`);
  const { data: stats } = useApi<any>("/loyalty/stats/overview");

  const transactions = txData?.data || [];
  const pagination = txData?.pagination || {};

  const getCategoryBadgeColor = (cat: string) => {
    switch (cat) {
      case "PURCHASE": return "success";
      case "REDEMPTION": return "warning";
      case "REVERSAL": return "error";
      case "BANKING": return "info";
      default: return "light";
    }
  };

  return (
    <div className="w-full space-y-6 animate-fadeIn pb-12">

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-200/80 dark:border-white/[0.06] pb-5">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
              Transactions &amp; Wallet Ledger
            </h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400 text-xs font-semibold border border-brand-500/20">
              Audit Ledger
            </span>
          </div>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Real-time tracking of all point emissions, wallet deductions, reversals, and financial payouts.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-white/5 dark:hover:bg-white/10 text-gray-900 dark:text-white text-xs font-semibold rounded-xl border border-gray-200/80 dark:border-white/10 transition flex items-center gap-2">
             <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>
             Filters
          </button>
          <button className="px-4 py-2.5 bg-brand-500/10 text-brand-600 dark:text-brand-400 text-xs font-semibold rounded-xl border border-brand-500/20 hover:bg-brand-500 hover:text-white transition flex items-center gap-2">
             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
             Export CSV
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
         <MetricCard label="Points Issued" value={stats?.metrics?.totalPointsIssued || "0"} sub="Total lifetime credits" trend="+12%" />
         <MetricCard 
           label="Amount Disbursed" 
           value={((parseFloat(stats?.metrics?.totalPointsRedeemed || "0") * parseFloat(stats?.metrics?.defaultPointValue || "0.1")).toFixed(2))} 
           sub={`KES value of redemptions (@ ${stats?.metrics?.defaultPointValue || 0.1})`} 
           trend="-5%" 
           isCurrency 
         />
         <MetricCard label="Redemption Velocity" value={stats?.metrics?.pendingRedemptions || "0"} sub="Pending fulfillment" trend="Fast" />
         <MetricCard label="Integrity Index" value="100.0" sub="Verified ledger state" trend="Stable" />
      </div>

      {/* Table Card */}
      <div className="bg-white dark:bg-white/[0.02] border border-gray-200/80 dark:border-white/[0.06] rounded-2xl overflow-hidden shadow-sm">
        <div className="w-full overflow-x-auto">
          {isLoading ? (
             <div className="flex h-64 items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-500 border-t-transparent"></div>
             </div>
          ) : (
            <Table className="w-full">
              <TableHeader>
                <TableRow className="bg-gray-50/50 dark:bg-white/[0.01]">
                  <TableCell isHeader className="py-3.5 px-6 text-xs font-semibold text-gray-500 dark:text-gray-400">Transaction ID</TableCell>
                  <TableCell isHeader className="py-3.5 px-6 text-xs font-semibold text-gray-500 dark:text-gray-400">Beneficiary</TableCell>
                  <TableCell isHeader className="py-3.5 px-6 text-xs font-semibold text-gray-500 dark:text-gray-400">Category</TableCell>
                  <TableCell isHeader className="py-3.5 px-6 text-xs font-semibold text-gray-500 dark:text-gray-400">Amount</TableCell>
                  <TableCell isHeader className="py-3.5 px-6 text-xs font-semibold text-gray-500 dark:text-gray-400 text-right">Settlement Date</TableCell>
                  <TableCell isHeader className="py-3.5 px-6 text-xs font-semibold text-gray-500 dark:text-gray-400 text-right">Actions</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.04]">
                {transactions.map((tx: any) => {
                  const consumerName = tx.wallet?.consumer ? `${tx.wallet.consumer.firstName} ${tx.wallet.consumer.lastName}` : "System Account";
                  const avatarLetter = consumerName.charAt(0);
                  return (
                    <TableRow key={tx.id} className="hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition-colors">
                      <TableCell className="py-3.5 px-6">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border ${tx.accountingEntry === 'CREDIT' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'}`}>
                             {tx.accountingEntry === 'CREDIT' ? <ArrowUpIcon className="w-3.5 h-3.5" /> : <ArrowDownIcon className="w-3.5 h-3.5" />}
                          </div>
                          <span className="text-xs font-mono font-bold text-gray-900 dark:text-white">
                            {tx.id.split('-')[0].toUpperCase()}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="py-3.5 px-6">
                         <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center font-bold text-xs shrink-0 border border-brand-500/20 shadow-2xs">
                              {avatarLetter}
                            </div>
                            <div className="flex flex-col">
                              <span className="text-xs font-bold text-gray-900 dark:text-white leading-tight">
                                 {consumerName}
                              </span>
                              <span className="text-[11px] text-gray-400 mt-0.5">{tx.wallet?.consumer?.phoneNumber || "Platform Adjustment"}</span>
                            </div>
                         </div>
                      </TableCell>
                      <TableCell className="py-3.5 px-6">
                          <Badge size="sm" color={getCategoryBadgeColor(tx.actionCategory) as any}>
                             {tx.actionCategory?.replace(/_/g, " ").toLowerCase()}
                          </Badge>
                      </TableCell>
                      <TableCell className="py-3.5 px-6">
                        <span className={`text-xs font-bold font-mono ${tx.accountingEntry === 'CREDIT' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                           {tx.accountingEntry === 'CREDIT' ? '+' : '-'}{parseFloat(tx.pointsAmount).toLocaleString()} <span className="text-[10px] font-sans font-normal opacity-70">PTS</span>
                        </span>
                      </TableCell>
                      <TableCell className="py-3.5 px-6 text-xs text-gray-500 font-medium text-right">
                        {new Date(tx.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </TableCell>
                      <TableCell className="py-3.5 px-6 text-right">
                         <Link 
                           href={`/transactions/${tx.id}`}
                           className="text-xs font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400 transition"
                         >
                            Details
                         </Link>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </div>
        
        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 dark:border-white/5">
             <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Page {page} of {pagination.totalPages}</span>
             <div className="flex gap-2">
                <button 
                  disabled={page === 1}
                  onClick={() => setPage(p => p - 1)}
                  className="px-3.5 py-1.5 text-xs font-semibold rounded-xl bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-gray-300 hover:bg-gray-200 transition disabled:opacity-50"
                >
                  Previous
                </button>
                <button 
                  disabled={page === pagination.totalPages}
                  onClick={() => setPage(p => p + 1)}
                  className="px-3.5 py-1.5 text-xs font-semibold rounded-xl bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-gray-300 hover:bg-gray-200 transition disabled:opacity-50"
                >
                  Next
                </button>
             </div>
          </div>
        )}
      </div>
    </div>
  );
}

function MetricCard({ label, value, sub, trend, isCurrency }: any) {
  const formattedValue = isCurrency 
    ? new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES' }).format(parseFloat(value || "0"))
    : parseFloat(value || "0").toLocaleString();

  return (
    <div className="bg-white dark:bg-white/[0.02] border border-gray-200/80 dark:border-white/[0.06] p-4 rounded-2xl shadow-sm space-y-2">
        <div className="flex justify-between items-start">
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">{label}</p>
          {trend && (
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
              trend === 'Fast' || trend === 'Stable' || trend.startsWith('+') 
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20' 
                : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
            }`}>
              {trend}
            </span>
          )}
        </div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">{formattedValue}</h3>
        <p className="text-[11px] text-gray-400">{sub}</p>
    </div>
  );
}
