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

interface TenantItem {
  id: string;
  name: string;
  slug: string;
  plan: "BASIC" | "SILVER" | "GOLD";
  status: "ACTIVE" | "SUSPENDED" | "PENDING";
  onboardedAt: string;
}

export default function TenantManagement() {
  const [searchTerm, setSearchTerm] = useState("");

  const tenants: TenantItem[] = [
    { id: "t-001", name: "Bamburi Cement", slug: "bamburi", plan: "GOLD", status: "ACTIVE", onboardedAt: "2026-01-15" },
    { id: "t-002", name: "Crown Paints", slug: "crown-paints", plan: "SILVER", status: "ACTIVE", onboardedAt: "2026-02-10" },
    { id: "t-003", name: "Savannah Cement", slug: "savannah", plan: "BASIC", status: "SUSPENDED", onboardedAt: "2026-03-01" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white/90">
            Tenant Management
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Global registry of all organizations onboarded onto the TuzoHub Platform.
          </p>
        </div>
        
        <button
          className="px-5 py-2.5 text-sm font-medium text-white bg-brand-500 rounded-lg shadow-theme-xs hover:bg-brand-600 transition flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          Onboard New Client
        </button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="mb-5">
          <input
            type="text"
            placeholder="Filter by name or slug..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full max-w-sm rounded-lg border border-gray-200 bg-transparent px-4 py-2.5 text-sm text-gray-800 focus:border-brand-300 focus:outline-none focus:ring-2 focus:ring-brand-500/10 dark:border-gray-800 dark:text-white/90"
          />
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableCell isHeader className="font-medium text-xs text-gray-500 uppercase tracking-wider">Organization</TableCell>
                <TableCell isHeader className="font-medium text-xs text-gray-500 uppercase tracking-wider">Access slug</TableCell>
                <TableCell isHeader className="font-medium text-xs text-gray-500 uppercase tracking-wider">Subscription</TableCell>
                <TableCell isHeader className="font-medium text-xs text-gray-500 uppercase tracking-wider">Status</TableCell>
                <TableCell isHeader className="font-medium text-xs text-gray-500 uppercase tracking-wider">Join Date</TableCell>
                <TableCell isHeader className="font-medium text-xs text-gray-500 uppercase tracking-wider text-right pr-5">Control</TableCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tenants
                .filter(t => t.name.toLowerCase().includes(searchTerm.toLowerCase()) || t.slug.includes(searchTerm))
                .map((t) => (
                <TableRow key={t.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition">
                  <TableCell className="py-4">
                     <p className="text-sm font-bold text-gray-800 dark:text-gray-200">{t.name}</p>
                     <p className="text-[10px] text-gray-400 font-mono">{t.id}</p>
                  </TableCell>
                  <TableCell className="py-4">
                     <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs font-mono">{t.slug}.tuzohub.com</span>
                  </TableCell>
                  <TableCell className="py-4">
                     <Badge color={t.plan === 'GOLD' ? 'success' : 'primary'} size="sm">{t.plan}</Badge>
                  </TableCell>
                  <TableCell className="py-4">
                    <Badge color={t.status === 'ACTIVE' ? 'success' : 'error'} size="sm">
                      {t.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-4 text-sm text-gray-500">
                    {t.onboardedAt}
                  </TableCell>
                  <TableCell className="py-4 text-right pr-5">
                    <div className="flex justify-end gap-2">
                       <button className="text-xs font-bold text-gray-400 hover:text-gray-900 transition">Settings</button>
                       <button className="text-xs font-bold text-error-500 hover:underline">Suspend</button>
                    </div>
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
