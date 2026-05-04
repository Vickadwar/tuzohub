"use client";

import React, { useState } from "react";
import Badge from "@/components/ui/badge/Badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface InvoiceItem {
  id: string;
  tenant: string;
  plan: string;
  amount: number;
  dueDate: string;
  status: "PAID" | "PENDING" | "OVERDUE";
}

export default function PlatformBilling() {
  const invoices: InvoiceItem[] = [
    { id: "INV-9901", tenant: "Bamburi Cement", plan: "Enterprise Gold", amount: 550000, dueDate: "Apr 01, 2026", status: "PAID" },
    { id: "INV-9902", tenant: "Crown Paints", plan: "SME Silver", amount: 250000, dueDate: "Apr 15, 2026", status: "PENDING" },
    { id: "INV-9903", tenant: "Savannah Cement", plan: "Basic Tier", amount: 120000, dueDate: "Mar 30, 2026", status: "OVERDUE" },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PAID": return "success";
      case "PENDING": return "warning";
      case "OVERDUE": return "error";
      default: return "light";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white/90">
            SaaS Billing & Invoicing
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Centralized revenue control for the TuzoHub Multi-tenant platform.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg shadow-theme-xs hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700 dark:hover:bg-gray-700 transition">
             Export Financial Sheet
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
         <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03] shadow-theme-xs">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Projected MRR</p>
            <p className="text-2xl font-black text-gray-800 dark:text-white">KSH 2,450,000</p>
            <p className="text-xs text-success-500 font-bold mt-1">↑ 12.5% from last month</p>
         </div>
         <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03] shadow-theme-xs">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Overdue Invoices</p>
            <p className="text-2xl font-black text-error-600">KSH 120,000</p>
            <p className="text-xs text-gray-500 font-bold mt-1">1 across-all tenants</p>
         </div>
         <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03] shadow-theme-xs">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Active Subscriptions</p>
            <p className="text-2xl font-black text-brand-500">38 Active</p>
            <p className="text-xs text-gray-500 font-bold mt-1">across-all tenants</p>
         </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
        <h3 className="text-sm font-bold text-gray-400 uppercase mb-4 pl-1">Global Subscription Ledger</h3>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableCell isHeader className="font-medium text-xs text-gray-500 uppercase tracking-wider">Invoice #</TableCell>
                <TableCell isHeader className="font-medium text-xs text-gray-500 uppercase tracking-wider">Client Organization</TableCell>
                <TableCell isHeader className="font-medium text-xs text-gray-500 uppercase tracking-wider">Billing Amount</TableCell>
                <TableCell isHeader className="font-medium text-xs text-gray-500 uppercase tracking-wider font-mono">Due On</TableCell>
                <TableCell isHeader className="font-medium text-xs text-gray-500 uppercase tracking-wider">Status</TableCell>
                <TableCell isHeader className="font-medium text-xs text-gray-500 uppercase tracking-wider text-right pr-5">Invoice</TableCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.map((inv) => (
                <TableRow key={inv.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition">
                  <TableCell className="py-4 font-mono text-sm font-semibold text-gray-800 dark:text-white/90">
                    {inv.id}
                  </TableCell>
                  <TableCell className="py-4">
                     <p className="text-sm font-bold text-gray-800 dark:text-gray-200">{inv.tenant}</p>
                     <p className="text-xs text-gray-400 font-medium">{inv.plan}</p>
                  </TableCell>
                  <TableCell className="py-4 text-sm font-black text-gray-800 dark:text-gray-100">
                    KSH {inv.amount.toLocaleString()}
                  </TableCell>
                  <TableCell className="py-4 text-xs font-mono font-medium text-gray-500">
                    {inv.dueDate}
                  </TableCell>
                  <TableCell className="py-4 font-bold">
                    <Badge color={getStatusColor(inv.status)} size="sm">
                      {inv.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-4 text-right pr-5">
                    <button className="text-xs font-bold text-brand-500 hover:underline">Download PDF</button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
