"use client";

import React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useApi } from "@/hooks/useApi";
import Badge from "@/components/ui/badge/Badge";

export default function ProductionBatchDetail() {
  const params = useParams();
  const id = params?.id as string;
  const { data: batch, isLoading, isError } = useApi<any>(id ? `/product-batches/${id}` : null);
  
  if (isLoading) return <div className="p-10 flex justify-center"><div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" /></div>;
  if (isError || !batch) return <div className="p-10 text-center text-error-600">Failed to load production run details.</div>;

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-500 max-w-4xl">
      
      {/* ── Page Header ──────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5 rounded-lg bg-white p-6 border border-gray-200 shadow-sm dark:bg-[#18181b] dark:border-white/10">
        <div className="flex items-center gap-5">
          <Link
            href="/production"
            className="group flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-gray-200 bg-white shadow-sm transition-all hover:bg-gray-50 dark:border-white/10 dark:bg-[#18181b] dark:hover:bg-white/5"
          >
            <svg className="h-4 w-4 text-gray-500 transition-transform group-hover:-translate-x-0.5 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </Link>

          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-2">
                Production Run
                <span className="text-brand-500 px-2 py-0.5 bg-brand-50 dark:bg-brand-500/10 rounded-md text-sm font-mono tracking-wider">
                  {batch.batchNumber}
                </span>
              </h1>
              <Badge color={batch.status === "active" ? "success" : "warning"} size="sm">{batch.status === "active" ? "Active" : batch.status}</Badge>
            </div>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Overview of physical production run characteristics and linked traceability tracking.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Run Details */}
        <div className="bg-white dark:bg-[#18181b] border border-gray-200 dark:border-white/10 rounded-xl p-6 shadow-sm">
           <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wider mb-4 border-b border-gray-100 dark:border-white/5 pb-2">Run Specifics</h3>
           <dl className="space-y-4">
             <div className="grid grid-cols-3">
                 <dt className="text-sm font-medium text-gray-500">Linked Product</dt>
                 <dd className="text-sm font-bold text-gray-900 dark:text-white col-span-2">{batch.product?.name || "Unknown Product"}</dd>
             </div>
             <div className="grid grid-cols-3">
                 <dt className="text-sm font-medium text-gray-500">Tins Produced</dt>
                 <dd className="text-sm font-semibold text-gray-900 dark:text-white col-span-2 font-mono">{batch.quantityProduced?.toLocaleString()}</dd>
             </div>
             <div className="grid grid-cols-3">
                 <dt className="text-sm font-medium text-gray-500">Production Date</dt>
                 <dd className="text-sm font-semibold text-gray-900 dark:text-white col-span-2">{new Date(batch.productionDate || batch.createdAt).toLocaleDateString("en-KE", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</dd>
             </div>
           </dl>
        </div>

      </div>

    </div>
  );
}
