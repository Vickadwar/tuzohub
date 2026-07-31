"use client";

import React from "react";
import Badge from "@/components/ui/badge/Badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useApi } from "@/hooks/useApi";

export default function PlatformBilling() {
  const { data: statsData } = useApi<any>("/system/stats");
  const stats = statsData?.data || statsData;

  const { data: invoiceData, isLoading } = useApi<any>("/billing/invoices");
  const invoices: any[] = invoiceData?.data || invoiceData || [];

  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case "PAID": return "success";
      case "PENDING": case "DRAFT": return "warning";
      case "OVERDUE": return "error";
      default: return "light";
    }
  };

  const totalRevenue = invoices
    .filter((inv) => inv.status === "PAID")
    .reduce((sum, inv) => sum + parseFloat(inv.totalAmount || "0"), 0);

  const overdueTotalAmount = invoices
    .filter((inv) => inv.status === "OVERDUE")
    .reduce((sum, inv) => sum + parseFloat(inv.totalAmount || "0"), 0);

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-200/80 dark:border-white/[0.06] pb-5">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
            SaaS Billing &amp; Invoicing Control
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Centralized revenue control, recurring tenant subscriptions, and global invoice ledgers.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3.5 py-1.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold rounded-full border border-emerald-500/20">
            KES {totalRevenue.toLocaleString()} Revenue Collected
          </span>
        </div>
      </div>

      {/* Summary Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="rounded-2xl border border-gray-200/80 bg-white p-6 dark:border-white/[0.06] dark:bg-white/[0.02] shadow-sm">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Collected Platform Revenue</p>
          <p className="text-3xl font-black text-gray-900 dark:text-white">
            KES {totalRevenue.toLocaleString()}
          </p>
          <p className="text-xs text-emerald-600 dark:text-emerald-400 font-bold mt-1.5">
            {invoices.filter(i => i.status === "PAID").length} settled platform invoices
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200/80 bg-white p-6 dark:border-white/[0.06] dark:bg-white/[0.02] shadow-sm">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Overdue SaaS Subscriptions</p>
          <p className="text-3xl font-black text-rose-600 dark:text-rose-400">
            KES {overdueTotalAmount.toLocaleString()}
          </p>
          <p className="text-xs text-rose-500 font-bold mt-1.5">
            {invoices.filter(i => i.status === "OVERDUE").length} pending collection
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200/80 bg-white p-6 dark:border-white/[0.06] dark:bg-white/[0.02] shadow-sm">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Active Enterprise Nodes</p>
          <p className="text-3xl font-black text-brand-600 dark:text-brand-400">
            {stats?.activeTenants ?? 0}
          </p>
          <p className="text-xs text-gray-500 font-bold mt-1.5">
            Out of {stats?.totalTenants ?? 0} registered organizations
          </p>
        </div>
      </div>

      {/* Global Invoice Ledger Table */}
      <div className="bg-white dark:bg-white/[0.02] border border-gray-200/80 dark:border-white/[0.06] rounded-2xl p-5 shadow-sm space-y-4">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-1">
          Global Subscription &amp; Fee Ledger
        </h3>

        {isLoading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50/50 dark:bg-white/[0.01]">
                  <TableCell isHeader className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-widest">Invoice #</TableCell>
                  <TableCell isHeader className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-widest">Organization</TableCell>
                  <TableCell isHeader className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-widest">Amount</TableCell>
                  <TableCell isHeader className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-widest">Due Date</TableCell>
                  <TableCell isHeader className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-widest text-right">Status</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.04]">
                {invoices.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="py-16 text-center text-gray-400 italic text-sm">
                      No invoices generated in the global ledger yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  invoices.map((inv) => (
                    <TableRow key={inv.id} className="hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition-colors">
                      <TableCell className="py-4 px-6 font-mono text-xs font-bold text-gray-900 dark:text-white">
                        {inv.invoiceNumber}
                      </TableCell>
                      <TableCell className="py-4 px-6">
                        <span className="text-sm font-bold text-gray-900 dark:text-white block">{inv.tenant?.name || "—"}</span>
                        <span className="text-xs text-gray-400">{inv.tenant?.subscriptionPlan || "ENTERPRISE"}</span>
                      </TableCell>
                      <TableCell className="py-4 px-6 text-sm font-black text-gray-900 dark:text-white">
                        KES {parseFloat(inv.totalAmount || "0").toLocaleString()}
                      </TableCell>
                      <TableCell className="py-4 px-6 text-xs font-mono font-medium text-gray-500">
                        {inv.dueDate ? new Date(inv.dueDate).toLocaleDateString() : "N/A"}
                      </TableCell>
                      <TableCell className="py-4 px-6 text-right">
                        <Badge color={getStatusColor(inv.status)} size="sm">
                          {inv.status?.toUpperCase() || "PAID"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}
