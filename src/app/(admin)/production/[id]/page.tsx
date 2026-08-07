"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useApi } from "@/hooks/useApi";
import Badge from "@/components/ui/badge/Badge";
import { Table, TableBody, TableCell, TableHeader, TableRow } from "@/components/ui/table";
import { BoxCubeIcon } from "@/icons";

const STATUS_COLORS: Record<string, any> = {
  ACTIVE: "success",
  REDEEMED: "success",
  PRINTED: "light",
  IN_TRANSIT: "purple",
  IN_STOCK: "info",
  CANCELLED: "error",
};

export default function ProductionBatchDetail() {
  const params = useParams();
  const id = params?.id as string;
  const [page, setPage] = useState(1);

  const { data: batch, isLoading, isError } = useApi<any>(id ? `/product-batches/${id}?page=${page}&limit=50` : null);

  if (isLoading) {
    return (
      <div className="p-12 flex justify-center items-center">
        <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (isError || !batch) {
    return (
      <div className="p-8 text-center text-xs font-semibold text-rose-500">
        Failed to load production run details. <Link href="/production" className="underline ml-2">Back to production list</Link>
      </div>
    );
  }

  const activatedCount = batch.allocatedVouchersCount || batch.activatedVouchersCount || 0;
  const linkedBatches = batch.linkedBatches || [];
  const allocatedVouchers: any[] = batch.allocatedVouchers || [];
  const pagination = batch.pagination || { total: activatedCount, page: 1, limit: 50, totalPages: 1 };

  const firstSerial = allocatedVouchers[0]?.serialNumber;
  const lastSerial = allocatedVouchers[allocatedVouchers.length - 1]?.serialNumber;

  return (
    <div className="w-full space-y-6 animate-fadeIn pb-12">
      {/* ── Breadcrumb Header ────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-200/80 dark:border-white/[0.06] pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
            <Link href="/production" className="hover:text-brand-600 dark:hover:text-white transition">Production Runs</Link>
            <span>/</span>
            <span className="font-mono font-bold text-gray-900 dark:text-white">#{batch.batchNumber}</span>
          </div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-2">
              Production Run
              <span className="font-mono text-brand-600 dark:text-brand-400 bg-brand-500/10 px-2.5 py-0.5 rounded-lg text-sm">
                #{batch.batchNumber}
              </span>
            </h1>
            <Badge color={batch.status === "active" ? "success" : "warning"} size="sm">
              {batch.status === "active" ? "Completed Run" : batch.status}
            </Badge>
          </div>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Manufacturing telemetry, paint tin packaging metrics, and scratch-card binding logs.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/vouchers"
            className="px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold rounded-xl shadow-md shadow-brand-500/20 transition"
          >
            Voucher Batches &rarr;
          </Link>
          <Link
            href="/production"
            className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-white/5 dark:hover:bg-white/10 text-gray-900 dark:text-white text-xs font-semibold rounded-xl border border-gray-200/80 dark:border-white/10 transition"
          >
            &larr; Back
          </Link>
        </div>
      </div>

      {/* ── KPI Summary Cards ────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-white/[0.02] border border-gray-200/80 dark:border-white/[0.06] p-4 rounded-2xl shadow-sm">
          <p className="text-xs font-semibold text-gray-500">Tins Produced</p>
          <p className="text-xl font-bold font-mono text-gray-900 dark:text-white mt-1">
            {batch.quantityProduced?.toLocaleString()} <span className="text-xs font-normal text-gray-400">Tins</span>
          </p>
          <p className="text-[11px] text-gray-400 mt-1">Manufactured &amp; sealed</p>
        </div>

        <div className="bg-white dark:bg-white/[0.02] border border-gray-200/80 dark:border-white/[0.06] p-4 rounded-2xl shadow-sm">
          <p className="text-xs font-semibold text-gray-500">Bound Scratch Cards</p>
          <p className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1">
            {activatedCount.toLocaleString()} <span className="text-xs font-normal text-gray-400">Cards</span>
          </p>
          <p className="text-[11px] text-gray-400 mt-1">Inserted inside product tins</p>
        </div>

        <div className="bg-white dark:bg-white/[0.02] border border-gray-200/80 dark:border-white/[0.06] p-4 rounded-2xl shadow-sm">
          <p className="text-xs font-semibold text-gray-500">Allocated Serial Range</p>
          <p className="text-xs font-mono font-bold text-brand-600 dark:text-brand-400 mt-2 truncate">
            {firstSerial && lastSerial ? `${firstSerial} … ${lastSerial}` : "Range Pending"}
          </p>
          <p className="text-[11px] text-gray-400 mt-1">Sequential card allocation</p>
        </div>

        <div className="bg-white dark:bg-white/[0.02] border border-gray-200/80 dark:border-white/[0.06] p-4 rounded-2xl shadow-sm">
          <p className="text-xs font-semibold text-gray-500">Linked Product SKU</p>
          <p className="text-sm font-bold font-mono text-gray-900 dark:text-white mt-1">
            {batch.product?.sku || "SILK-4L-01"}
          </p>
          <p className="text-[11px] text-gray-400 mt-1">{batch.product?.name || "Silk Emulsion 4L"}</p>
        </div>
      </div>

      {/* ── Run Specifics & Linked Voucher Batches ────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Run Details */}
        <div className="bg-white dark:bg-white/[0.02] border border-gray-200/80 dark:border-white/[0.06] rounded-2xl p-6 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider border-b border-gray-100 dark:border-white/5 pb-2">
            Manufacturing Run Telemetry
          </h2>
          <dl className="space-y-4">
            <div className="grid grid-cols-3">
              <dt className="text-xs font-medium text-gray-500">Product Name</dt>
              <dd className="text-xs font-bold text-gray-900 dark:text-white col-span-2">{batch.product?.name || "Unknown Product"}</dd>
            </div>
            <div className="grid grid-cols-3">
              <dt className="text-xs font-medium text-gray-500">Product SKU</dt>
              <dd className="text-xs font-mono font-bold text-brand-600 dark:text-brand-400 col-span-2">{batch.product?.sku || "GENERIC-SKU"}</dd>
            </div>
            <div className="grid grid-cols-3">
              <dt className="text-xs font-medium text-gray-500">Tins Manufactured</dt>
              <dd className="text-xs font-semibold text-gray-900 dark:text-white col-span-2 font-mono">{batch.quantityProduced?.toLocaleString()} Tins</dd>
            </div>
            <div className="grid grid-cols-3">
              <dt className="text-xs font-medium text-gray-500">Production Date</dt>
              <dd className="text-xs font-semibold text-gray-900 dark:text-white col-span-2">
                {new Date(batch.productionDate || batch.createdAt).toLocaleDateString("en-KE", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
              </dd>
            </div>
          </dl>
        </div>

        {/* Linked Voucher Pools */}
        <div className="bg-white dark:bg-white/[0.02] border border-gray-200/80 dark:border-white/[0.06] rounded-2xl p-6 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider border-b border-gray-100 dark:border-white/5 pb-2">
            Linked Voucher Card Pools
          </h2>
          {linkedBatches.length > 0 ? (
            <div className="space-y-3">
              {linkedBatches.map((b: any) => {
                const original = b.originalQuantity ?? b.quantity ?? 0;
                const consumedThisRun = b.consumedByThisRun ?? 0;
                const remaining = b.remainingBalance ?? Math.max(0, original - consumedThisRun);
                return (
                  <div key={b.id} className="p-4 bg-gray-50 dark:bg-white/[0.02] border border-gray-200/60 dark:border-white/5 rounded-2xl space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Link href={`/vouchers/batches/${b.id}`} className="text-xs font-bold font-mono text-brand-600 dark:text-brand-400 hover:underline">
                          Batch: {b.batchNumber}
                        </Link>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                          {remaining.toLocaleString()} Cards Stock Balance
                        </span>
                      </div>
                      <Link href={`/vouchers/batches/${b.id}`} className="text-xs font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400">
                        Inspect &rarr;
                      </Link>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-xs font-mono">
                      <div className="bg-white dark:bg-black/20 p-2 rounded-xl border border-gray-100 dark:border-white/5">
                        <span className="text-[10px] text-gray-400 block font-sans">Original Pool</span>
                        <span className="font-bold text-gray-900 dark:text-white">{original.toLocaleString()} Cards</span>
                      </div>
                      <div className="bg-white dark:bg-black/20 p-2 rounded-xl border border-gray-100 dark:border-white/5">
                        <span className="text-[10px] text-gray-400 block font-sans">Bound to this Run</span>
                        <span className="font-bold text-brand-600 dark:text-brand-400">{consumedThisRun.toLocaleString()} Cards</span>
                      </div>
                      <div className="bg-white dark:bg-black/20 p-2 rounded-xl border border-gray-100 dark:border-white/5">
                        <span className="text-[10px] text-gray-400 block font-sans">Stock Balance</span>
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">{remaining.toLocaleString()} Cards</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-xs text-gray-400 italic py-4">No voucher card pools were linked during this production run.</p>
          )}
        </div>
      </div>

      {/* ── Allocated Scratch Cards Table (Paginated) ────────────────────── */}
      <div className="bg-white dark:bg-white/[0.02] border border-gray-200/80 dark:border-white/[0.06] rounded-2xl overflow-hidden shadow-sm space-y-0">
        <div className="flex items-center justify-between border-b border-gray-100 p-4 dark:border-white/5 sm:px-6 sm:py-4">
          <div>
            <h2 className="text-sm font-bold text-gray-900 dark:text-white">Allocated Scratch Cards in this Run</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Exact sequential cards assigned to these {batch.quantityProduced?.toLocaleString()} paint tins.
            </p>
          </div>
          <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 font-mono">
            {pagination.total?.toLocaleString()} Total Bound Cards
          </span>
        </div>

        <Table className="w-full">
          <TableHeader>
            <TableRow className="bg-gray-50/50 dark:bg-white/[0.01]">
              <TableCell isHeader className="py-3.5 px-6 text-xs font-semibold text-gray-500 dark:text-gray-400">Serial Number</TableCell>
              <TableCell isHeader className="py-3.5 px-6 text-xs font-semibold text-gray-500 dark:text-gray-400">Parent Voucher Batch</TableCell>
              <TableCell isHeader className="py-3.5 px-6 text-xs font-semibold text-gray-500 dark:text-gray-400">Status</TableCell>
              <TableCell isHeader className="py-3.5 px-6 text-xs font-semibold text-gray-500 dark:text-gray-400">Redemption Status</TableCell>
              <TableCell isHeader className="py-3.5 px-6 text-xs font-semibold text-gray-500 dark:text-gray-400 text-right">Actions</TableCell>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.04]">
            {allocatedVouchers.length > 0 ? (
              allocatedVouchers.map((v: any) => (
                <TableRow key={v.id} className="hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition-colors">
                  <TableCell className="py-3.5 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center font-bold text-xs border border-brand-500/20 shrink-0">
                        <BoxCubeIcon className="w-3.5 h-3.5" />
                      </div>
                      <span className="font-mono text-xs font-bold text-gray-900 dark:text-white tracking-wider">{v.serialNumber}</span>
                    </div>
                  </TableCell>
                  <TableCell className="py-3.5 px-6">
                    <span className="font-mono text-xs font-semibold text-gray-600 dark:text-gray-300">{v.batchNumber || "—"}</span>
                  </TableCell>
                  <TableCell className="py-3.5 px-6">
                    <Badge size="sm" color={STATUS_COLORS[v.status] || "success"}>
                      {v.status || "ACTIVE"}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-3.5 px-6 text-xs text-gray-500 font-medium">
                    {v.redeemedAt ? (
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                        Claimed on {new Date(v.redeemedAt).toLocaleDateString()}
                      </span>
                    ) : (
                      <span className="text-gray-400 italic">Unclaimed in Market</span>
                    )}
                  </TableCell>
                  <TableCell className="py-3.5 px-6 text-right">
                    <Link href={`/vouchers/${v.id}`} className="text-xs font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400 transition">
                      Details &rarr;
                    </Link>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="py-12 text-center text-xs text-gray-400 italic font-medium">
                  No vouchers bound to this production run yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {/* Table Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between p-4 border-t border-gray-100 dark:border-white/5">
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 font-mono">
              Page {page} of {pagination.totalPages} ({pagination.total?.toLocaleString()} Cards)
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-3.5 py-1.5 text-xs font-semibold rounded-xl bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-gray-300 hover:bg-gray-200 transition disabled:opacity-50"
              >
                Previous
              </button>
              <button
                disabled={page >= pagination.totalPages}
                onClick={() => setPage((p) => p + 1)}
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
