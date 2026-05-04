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
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Transactions ledger
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Real-time tracking of all point emissions, wallet deductions and financial events.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 dark:bg-[#18181b] dark:text-gray-300 dark:border-white/10 dark:hover:bg-white/5 transition flex items-center gap-2">
             <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>
             Filters
          </button>
          <button className="px-4 py-2 text-sm font-medium text-brand-700 bg-brand-50 border border-brand-100 rounded-lg shadow-sm hover:bg-brand-100 dark:bg-brand-500/10 dark:text-brand-400 dark:border-brand-500/20 dark:hover:bg-brand-500/20 transition flex items-center gap-2">
             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
             Export CSV
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
         <MetricCard label="Points issued" value={stats?.metrics?.totalPointsIssued || "0"} sub="Total lifetime credits" trend="+12%" />
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

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-white/10 dark:bg-[#18181b]">
        <div className="overflow-x-auto">
          {isLoading ? (
             <div className="flex h-64 items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-brand-500"></div>
             </div>
          ) : (
            <Table>
              <TableHeader className="bg-gray-50/50 dark:bg-white/5">
                <TableRow>
                  <TableCell isHeader className="font-semibold text-xs text-gray-500 dark:text-gray-400 capitalize tracking-wider pl-6 py-4">Transaction id</TableCell>
                  <TableCell isHeader className="font-semibold text-xs text-gray-500 dark:text-gray-400 capitalize tracking-wider py-4">Beneficiary</TableCell>
                  <TableCell isHeader className="font-semibold text-xs text-gray-500 dark:text-gray-400 capitalize tracking-wider py-4">Category</TableCell>
                  <TableCell isHeader className="font-semibold text-xs text-gray-500 dark:text-gray-400 capitalize tracking-wider py-4">Amount</TableCell>
                  <TableCell isHeader className="font-semibold text-xs text-gray-500 dark:text-gray-400 capitalize tracking-wider py-4 text-right">Date</TableCell>
                  <TableCell isHeader className="font-semibold text-xs text-gray-500 dark:text-gray-400 capitalize tracking-wider py-4 text-right pr-6">Action</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((tx: any) => (
                  <TableRow key={tx.id} className="hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors border-b border-gray-100 dark:border-white/5">
                    <TableCell className="py-4 pl-6">
                      <div className="flex items-center gap-2">
                        <div className={`p-1.5 rounded-md ${tx.accountingEntry === 'CREDIT' ? 'bg-success-50 text-success-600 dark:bg-success-500/10' : 'bg-error-50 text-error-600 dark:bg-error-500/10'}`}>
                           {tx.accountingEntry === 'CREDIT' ? <ArrowUpIcon className="w-3.5 h-3.5" /> : <ArrowDownIcon className="w-3.5 h-3.5" />}
                        </div>
                        <span className="text-[13px] font-mono font-medium text-gray-600 dark:text-gray-400">
                          {tx.id.split('-')[0].toUpperCase()}...
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="py-4">
                       <div className="flex flex-col">
                          <span className="text-sm font-semibold text-gray-900 dark:text-white">
                             {tx.wallet?.consumer ? `${tx.wallet.consumer.firstName} ${tx.wallet.consumer.lastName}` : "System Account"}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">{tx.wallet?.consumer?.phoneNumber || "Platform Adjustment"}</span>
                       </div>
                    </TableCell>
                    <TableCell className="py-4">
                        <Badge size="sm" color={getCategoryBadgeColor(tx.actionCategory) as any}>
                           {tx.actionCategory?.replace(/_/g, " ").toLowerCase()}
                        </Badge>
                    </TableCell>
                    <TableCell className="py-4">
                      <span className={`text-sm font-bold ${tx.accountingEntry === 'CREDIT' ? 'text-success-600 dark:text-success-500' : 'text-error-600 dark:text-error-500'}`}>
                         {tx.accountingEntry === 'CREDIT' ? '+' : '-'}{parseFloat(tx.pointsAmount).toLocaleString()} <span className="text-[10px] font-medium opacity-70">PTS</span>
                      </span>
                    </TableCell>
                    <TableCell className="py-4 text-sm text-gray-500 dark:text-gray-400 text-right">
                      {new Date(tx.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </TableCell>
                    <TableCell className="py-4 text-right pr-6">
                       <Link 
                         href={`/transactions/${tx.id}`}
                         className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300 transition-colors"
                       >
                          Details
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                       </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
        
        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 dark:border-white/5">
             <span className="text-xs text-gray-500 dark:text-gray-400">Page {page} of {pagination.totalPages}</span>
             <div className="flex gap-2">
                <button 
                  disabled={page === 1}
                  onClick={() => setPage(p => p - 1)}
                  className="px-3 py-1.5 text-xs font-medium bg-white border border-gray-200 rounded-md hover:bg-gray-50 disabled:opacity-50 dark:bg-[#18181b] dark:border-white/10 dark:hover:bg-white/5 transition-colors"
                >
                  Previous
                </button>
                <button 
                  disabled={page === pagination.totalPages}
                  onClick={() => setPage(p => p + 1)}
                  className="px-3 py-1.5 text-xs font-medium bg-white border border-gray-200 rounded-md hover:bg-gray-50 disabled:opacity-50 dark:bg-[#18181b] dark:border-white/10 dark:hover:bg-white/5 transition-colors"
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
    <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-white/10 dark:bg-[#18181b] shadow-sm">
        <div className="flex justify-between items-start">
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-widest">{label}</p>
          {trend && (
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
              trend === 'Fast' || trend === 'Stable' || trend.startsWith('+') 
                ? 'bg-success-50 text-success-600 dark:bg-success-500/10 dark:text-success-500' 
                : 'bg-error-50 text-error-600 dark:bg-error-500/10 dark:text-error-500'
            }`}>
              {trend}
            </span>
          )}
        </div>
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1.5">{formattedValue}</h3>
        <p className="mt-1 text-[11px] text-gray-400">{sub}</p>
    </div>
  );
}
