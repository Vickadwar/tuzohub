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

  // Because useApi strips pagination dynamically to return arrays:
  const vouchers: any[] = Array.isArray(result) ? result : (result?.data || []);
  const pagination = result && !Array.isArray(result) ? result.pagination : null;

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-500">

      {/* ── Page Header ──────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">Voucher Inventory</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Browse every individual scratch card code in your system</p>
        </div>
        <Link
          href="/vouchers"
          className="inline-flex items-center gap-2 rounded-md bg-white px-4 py-2.5 text-sm font-medium text-gray-700 border border-gray-300 shadow-sm hover:bg-gray-50 dark:bg-white/5 dark:border-white/10 dark:text-gray-300 dark:hover:bg-white/10 transition-colors"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
          Back to batches
        </Link>
      </div>

      {/* ── Filters ──────────────────────────────────────────────────────── */}
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
        <span className="ml-auto text-xs text-gray-400 dark:text-gray-500">
          {pagination?.total?.toLocaleString() ?? "—"} vouchers total
        </span>
      </div>

      {/* ── Table ─────────────────────────────────────────────────────────── */}
      <div className="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-white/10 dark:bg-[#18181b] overflow-hidden">
        {isLoading ? (
          <div className="flex h-48 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent"></div>
          </div>
        ) : (
          <Table className="w-full">
            <TableHeader className="bg-gray-50/50 dark:bg-white/5">
              <TableRow className="border-none">
                <TableCell isHeader className="py-3 px-6 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Serial no.</TableCell>
                <TableCell isHeader className="py-3 px-6 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Batch</TableCell>
                <TableCell isHeader className="py-3 px-6 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Product</TableCell>
                <TableCell isHeader className="py-3 px-6 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Status</TableCell>
                <TableCell isHeader className="py-3 px-6 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Claimed</TableCell>
                <TableCell isHeader className="py-3 px-6 text-right text-xs font-medium text-gray-500 dark:text-gray-400">Actions</TableCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vouchers.length > 0 ? vouchers.map((v: any) => (
                <TableRow key={v.id} className="border-b border-gray-100 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/[0.02]">
                  <TableCell className="py-3 px-6">
                    <span className="font-mono text-sm font-bold text-gray-900 dark:text-white tracking-widest">{v.serialNumber}</span>
                  </TableCell>
                  <TableCell className="py-3 px-6">
                    <span className="font-mono text-xs text-gray-600 dark:text-gray-400">{v.batchNumber}</span>
                  </TableCell>
                  <TableCell className="py-3 px-6 text-sm text-gray-600 dark:text-gray-400">
                    {v.productName || <span className="text-gray-300 dark:text-gray-600 italic">Not linked</span>}
                  </TableCell>
                  <TableCell className="py-3 px-6">
                    <Badge size="sm" color={STATUS_COLORS[v.status] || "light"}>{v.status}</Badge>
                  </TableCell>
                  <TableCell className="py-3 px-6 text-xs text-gray-500 dark:text-gray-400">
                    {v.redeemedAt ? new Date(v.redeemedAt).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" }) : <span className="text-gray-300 dark:text-gray-600">—</span>}
                  </TableCell>
                  <TableCell className="py-3 px-6 text-right">
                    <Link href={`/vouchers/${v.id}`} className="text-sm font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300 transition-colors">
                      View details →
                    </Link>
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={6} className="py-16 text-center text-sm text-gray-500 dark:text-gray-400">
                    No vouchers found. {!batchFilter && "Generate a batch first, then view individual vouchers here."}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </div>

      {/* ── Pagination ────────────────────────────────────────────────────── */}
      {pagination && pagination.total > 50 && (
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-500 dark:text-gray-400">Page {page} of {Math.ceil(pagination.total / 50)}</span>
          <div className="flex items-center gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage(p => p - 1)}
              className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-white/5 dark:border-white/10 dark:text-gray-300 dark:hover:bg-white/10"
            >
              Previous
            </button>
            <button
              disabled={page * 50 >= pagination.total}
              onClick={() => setPage(p => p + 1)}
              className="rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-white/5 dark:border-white/10 dark:text-gray-300 dark:hover:bg-white/10"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
