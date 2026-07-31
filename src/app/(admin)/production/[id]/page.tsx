"use client";

import React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useApi } from "@/hooks/useApi";
import Badge from "@/components/ui/badge/Badge";
import { BoxCubeIcon, PieChartIcon } from "@/icons";

export default function ProductionBatchDetail() {
  const params = useParams();
  const id = params?.id as string;
  const { data: batch, isLoading, isError } = useApi<any>(id ? `/product-batches/${id}` : null);

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

  const activatedCount = batch.activatedVouchersCount || 0;
  const linkedBatches = batch.linkedBatches || [];
  const totalVouchersInLinkedBatches = linkedBatches.reduce((acc: number, b: any) => acc + (b.quantity || 0), 0);
  const rolledOverCount = Math.max(0, totalVouchersInLinkedBatches - activatedCount);

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
          <p className="text-xs font-semibold text-gray-500">Activated Scratch Cards</p>
          <p className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1">
            {activatedCount.toLocaleString()} <span className="text-xs font-normal text-gray-400">Cards</span>
          </p>
          <p className="text-[11px] text-gray-400 mt-1">Inserted inside product tins</p>
        </div>

        <div className="bg-white dark:bg-white/[0.02] border border-gray-200/80 dark:border-white/[0.06] p-4 rounded-2xl shadow-sm">
          <p className="text-xs font-semibold text-gray-500">Rolled-Over Warehouse Stock</p>
          <p className="text-xl font-bold font-mono text-brand-600 dark:text-brand-400 mt-1">
            {rolledOverCount.toLocaleString()} <span className="text-xs font-normal text-gray-400">Cards</span>
          </p>
          <p className="text-[11px] text-gray-400 mt-1">Reserved for next production run</p>
        </div>

        <div className="bg-white dark:bg-white/[0.02] border border-gray-200/80 dark:border-white/[0.06] p-4 rounded-2xl shadow-sm">
          <p className="text-xs font-semibold text-gray-500">Linked Product SKU</p>
          <p className="text-sm font-bold font-mono text-gray-900 dark:text-white mt-1">
            {batch.product?.sku || "SILK-4L-01"}
          </p>
          <p className="text-[11px] text-gray-400 mt-1">{batch.product?.name || "Silk Emulsion 4L"}</p>
        </div>
      </div>

      {/* ── Partial Allocation Roll-Over Banner ──────────────────────────── */}
      {rolledOverCount > 0 && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-fadeIn">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-sm shrink-0">
              ⚡
            </div>
            <div>
              <p className="text-xs font-bold">Partial Batch Allocation Active</p>
              <p className="text-xs mt-0.5 opacity-90">
                Out of {totalVouchersInLinkedBatches} cards in the linked voucher pool, <span className="font-bold underline">{activatedCount} cards</span> were bound to this {batch.quantityProduced}-tin run. The remaining <span className="font-bold underline">{rolledOverCount} cards</span> roll over in stock for your next manufacturing run.
              </p>
            </div>
          </div>
        </div>
      )}

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
              {linkedBatches.map((b: any) => (
                <div key={b.id} className="p-3.5 bg-gray-50 dark:bg-white/[0.02] border border-gray-200/60 dark:border-white/5 rounded-xl flex items-center justify-between">
                  <div>
                    <Link href={`/vouchers/batches/${b.id}`} className="text-xs font-bold font-mono text-brand-600 dark:text-brand-400 hover:underline">
                      Batch: {b.batchNumber}
                    </Link>
                    <p className="text-[11px] text-gray-400 mt-0.5">{b.quantity} Total Cards in Pool</p>
                  </div>
                  <Link href={`/vouchers/batches/${b.id}`} className="text-xs font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400">
                    Inspect Batch &rarr;
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-gray-400 italic py-4">No voucher card pools were linked during this production run.</p>
          )}
        </div>
      </div>
    </div>
  );
}
