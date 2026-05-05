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
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white/90">
            SaaS Billing &amp; Invoicing
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Centralized revenue control for the TuzoHub Multi-tenant platform.
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03] shadow-theme-xs">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Collected Revenue</p>
          <p className="text-2xl font-black text-gray-800 dark:text-white">
            KES {totalRevenue.toLocaleString()}
          </p>
          <p className="text-xs text-success-500 font-bold mt-1">{invoices.filter(i => i.status === "PAID").length} paid invoices</p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03] shadow-theme-xs">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Overdue Amount</p>
          <p className="text-2xl font-black text-error-600">
            KES {overdueTotalAmount.toLocaleString()}
          </p>
          <p className="text-xs text-gray-500 font-bold mt-1">{invoices.filter(i => i.status === "OVERDUE").length} overdue</p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03] shadow-theme-xs">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Active Tenants</p>
          <p className="text-2xl font-black text-brand-500">{stats?.activeTenants ?? "—"}</p>
          <p className="text-xs text-gray-500 font-bold mt-1">of {stats?.totalTenants ?? "—"} registered</p>
        </div>
      </div>

      {/* Invoice Table */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
        <h3 className="text-sm font-bold text-gray-400 uppercase mb-4 pl-1">Global Subscription Ledger</h3>
        {isLoading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableCell isHeader className="font-medium text-xs text-gray-500 uppercase tracking-wider">Invoice #</TableCell>
                  <TableCell isHeader className="font-medium text-xs text-gray-500 uppercase tracking-wider">Client</TableCell>
                  <TableCell isHeader className="font-medium text-xs text-gray-500 uppercase tracking-wider">Amount</TableCell>
                  <TableCell isHeader className="font-medium text-xs text-gray-500 uppercase tracking-wider">Due Date</TableCell>
                  <TableCell isHeader className="font-medium text-xs text-gray-500 uppercase tracking-wider">Status</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="py-16 text-center text-gray-400 text-sm italic">
                      No invoices generated yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  invoices.map((inv) => (
                    <TableRow key={inv.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition">
                      <TableCell className="py-4 font-mono text-sm font-semibold text-gray-800 dark:text-white/90">
                        {inv.invoiceNumber}
                      </TableCell>
                      <TableCell className="py-4">
                        <p className="text-sm font-bold text-gray-800 dark:text-gray-200">{inv.tenant?.name || "—"}</p>
                        <p className="text-xs text-gray-400">{inv.tenant?.subscriptionPlan || "BASIC"}</p>
                      </TableCell>
                      <TableCell className="py-4 text-sm font-black text-gray-800 dark:text-gray-100">
                        KES {parseFloat(inv.totalAmount || "0").toLocaleString()}
                      </TableCell>
                      <TableCell className="py-4 text-xs font-mono font-medium text-gray-500">
                        {inv.dueDate ? new Date(inv.dueDate).toLocaleDateString() : "N/A"}
                      </TableCell>
                      <TableCell className="py-4">
                        <Badge color={getStatusColor(inv.status)} size="sm">
                          {inv.status}
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
