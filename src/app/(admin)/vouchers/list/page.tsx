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
import { useApi } from "@/hooks/useApi";
import ModernSelect from "@/components/ui/ModernSelect";
import { BoxCubeIcon } from "@/icons";

const STATUS_COLORS: Record<string, any> = {
  PRINTED: "light",
  ACTIVE: "info",
  REDEEMED: "success",
  USED: "success",
  VOID: "error",
  EXPIRED: "error",
};

export default function VoucherList() {
  const [batchFilter, setBatchFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);

  const params = new URLSearchParams({ page: String(page), limit: "50" });
  if (statusFilter) params.set("status", statusFilter);
  if (batchFilter) params.set("batchId", batchFilter);

  const { data: result, isLoading } = useApi<any>(`/vouchers?${params}`);
  const { data: batchesRes } = useApi<any>("/vouchers/batches");

  const batchOptions = (Array.isArray(batchesRes) ? batchesRes : (batchesRes?.data || [])).map((b: any) => ({
    value: b.id,
    label: `${b.batchNumber} (${b.quantity} cards)`,
  }));

  const statusOptions = [
    { value: "PRINTED", label: "Printed" },
    { value: "ACTIVE", label: "Active" },
    { value: "REDEEMED", label: "Redeemed" },
    { value: "VOID", label: "Void" },
    { value: "EXPIRED", label: "Expired" },
  ];

  const vouchers: any[] = Array.isArray(result) ? result : (result?.data || []);
  const pagination = result && !Array.isArray(result) ? result.pagination : null;

  return (
    <div className="w-full space-y-6 animate-fadeIn pb-12">

      {/* ── Page Header ──────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-200/80 dark:border-white/[0.06] pb-5">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">Voucher Inventory</h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400 text-xs font-semibold border border-brand-500/20">
              Serial Ledger
            </span>
          </div>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Browse and inspect every individual scratch card security token in your platform catalog.
          </p>
        </div>
        <Link
          href="/vouchers"
          className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-white/5 dark:hover:bg-white/10 text-gray-900 dark:text-white text-xs font-semibold rounded-xl border border-gray-200/80 dark:border-white/10 transition flex items-center gap-2"
        >
          <svg className="h-4 w-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
          Back to Batches
        </Link>
      </div>

      {/* ── Filters Toolbar ────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="w-64">
          <ModernSelect
            options={batchOptions}
            value={batchFilter}
            onChange={(val) => { setBatchFilter(val); setPage(1); }}
            placeholder="All batches"
          />
        </div>
        <div className="w-48">
          <ModernSelect
            options={statusOptions}
            value={statusFilter}
            onChange={(val) => { setStatusFilter(val); setPage(1); }}
            placeholder="All statuses"
          />
        </div>
        <span className="ml-auto text-xs font-semibold text-gray-500 dark:text-gray-400">
          {pagination?.total?.toLocaleString() ?? vouchers.length} Vouchers Cataloged
        </span>
      </div>

      {/* ── Table ─────────────────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-white/[0.02] border border-gray-200/80 dark:border-white/[0.06] rounded-2xl overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="flex h-48 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-500 border-t-transparent"></div>
          </div>
        ) : (
          <Table className="w-full">
            <TableHeader>
              <TableRow className="bg-gray-50/50 dark:bg-white/[0.01]">
                <TableCell isHeader className="py-3.5 px-6 text-xs font-semibold text-gray-500 dark:text-gray-400">Serial Number</TableCell>
                <TableCell isHeader className="py-3.5 px-6 text-xs font-semibold text-gray-500 dark:text-gray-400">Batch Code</TableCell>
                <TableCell isHeader className="py-3.5 px-6 text-xs font-semibold text-gray-500 dark:text-gray-400">Linked Product</TableCell>
                <TableCell isHeader className="py-3.5 px-6 text-xs font-semibold text-gray-500 dark:text-gray-400">Status</TableCell>
                <TableCell isHeader className="py-3.5 px-6 text-xs font-semibold text-gray-500 dark:text-gray-400">Claimed Date</TableCell>
                <TableCell isHeader className="py-3.5 px-6 text-xs font-semibold text-gray-500 dark:text-gray-400 text-right">Actions</TableCell>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.04]">
              {vouchers.length > 0 ? vouchers.map((v: any) => (
                <TableRow key={v.id} className="hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition-colors">
                  <TableCell className="py-3.5 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center font-bold text-xs border border-brand-500/20 shrink-0 shadow-2xs">
                        <BoxCubeIcon className="w-3.5 h-3.5" />
                      </div>
                      <span className="font-mono text-xs font-bold text-gray-900 dark:text-white tracking-wider">{v.serialNumber}</span>
                    </div>
                  </TableCell>
                  <TableCell className="py-3.5 px-6">
                    <span className="font-mono text-xs font-semibold text-gray-600 dark:text-gray-300">{v.batchNumber}</span>
                  </TableCell>
                  <TableCell className="py-3.5 px-6 text-xs text-gray-600 dark:text-gray-300 font-medium">
                    {v.productName || <span className="text-gray-400 italic">Not linked</span>}
                  </TableCell>
                  <TableCell className="py-3.5 px-6">
                    <Badge size="sm" color={STATUS_COLORS[v.status] || "light"}>{v.status}</Badge>
                  </TableCell>
                  <TableCell className="py-3.5 px-6 text-xs text-gray-500 font-medium">
                    {v.redeemedAt ? new Date(v.redeemedAt).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" }) : <span className="text-gray-400">—</span>}
                  </TableCell>
                  <TableCell className="py-3.5 px-6 text-right">
                    <Link href={`/vouchers/${v.id}`} className="text-xs font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400 transition">
                      Details
                    </Link>
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={6} className="py-16 text-center text-xs text-gray-400 italic font-medium">
                    No vouchers found. {!batchFilter && "Generate a batch first to see serial items."}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </div>

      {/* ── Pagination ────────────────────────────────────────────────────── */}
      {pagination && pagination.total > 50 && (
        <div className="flex items-center justify-between pt-2">
          <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Page {page} of {Math.ceil(pagination.total / 50)}</span>
          <div className="flex items-center gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage(p => p - 1)}
              className="px-3.5 py-1.5 text-xs font-semibold rounded-xl bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-gray-300 hover:bg-gray-200 transition disabled:opacity-50"
            >
              Previous
            </button>
            <button
              disabled={page * 50 >= pagination.total}
              onClick={() => setPage(p => p + 1)}
              className="px-3.5 py-1.5 text-xs font-semibold rounded-xl bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-gray-300 hover:bg-gray-200 transition disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
