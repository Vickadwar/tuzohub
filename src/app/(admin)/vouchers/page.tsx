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
import { useApi, authenticatedFetch } from "@/hooks/useApi";

export default function VoucherCenter() {
  const { data: batchesRes, isLoading, isError, mutate } = useApi<any>("/vouchers/batches");
  const [showNewForm, setShowNewForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activatingId, setActivatingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({ batchNumber: "", quantity: "" });
  const [searchTerm, setSearchTerm] = useState("");

  const batches: any[] = Array.isArray(batchesRes) ? batchesRes : (batchesRes?.data || []);

  const filteredBatches = batches.filter(
    (b: any) =>
      !searchTerm ||
      b.batchNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.productName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!formData.batchNumber.trim()) return setError("Batch reference is required.");
    const qty = parseInt(formData.quantity);
    if (!qty || qty < 1 || qty > 5000) return setError("Quantity must be between 1 and 5,000.");
    setIsSubmitting(true);
    try {
      await authenticatedFetch("/api/vouchers/batches", {
        method: "POST",
        body: JSON.stringify({ batchNumber: formData.batchNumber.toUpperCase(), quantity: qty }),
      });
      mutate();
      setShowNewForm(false);
      setFormData({ batchNumber: "", quantity: "" });
    } catch (err: any) {
      setError(err.message || "Failed to generate vouchers.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleActivate = async (id: string, batchNumber: string) => {
    if (!confirm(`Approve & Activate batch "${batchNumber}"?\n\nDo this ONLY after the scratch cards have been inserted into the paint tins. Once activated, consumers can claim codes via USSD.`)) return;
    setActivatingId(id);
    try {
      await authenticatedFetch(`/api/vouchers/batches/${id}/activate`, { method: "POST" });
      mutate();
    } catch (err: any) {
      alert(err.message || "Activation failed.");
    } finally {
      setActivatingId(null);
    }
  };

  if (isError) return <div className="p-4 text-sm text-error-600">Failed to load voucher batches.</div>;

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-500">

      {/* ── Page Header ──────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">Voucher Center</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Generate scratch-card code batches. Activation happens later at production.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/vouchers/list"
            className="inline-flex items-center gap-2 rounded-md bg-white px-4 py-2.5 text-sm font-medium text-gray-700 border border-gray-300 shadow-sm hover:bg-gray-50 dark:bg-white/5 dark:border-white/10 dark:text-gray-300 dark:hover:bg-white/10 transition-colors"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z" />
            </svg>
            View all vouchers
          </Link>
          <button
            onClick={() => setShowNewForm(v => !v)}
            className="inline-flex items-center gap-2 rounded-md bg-brand-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-brand-700 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Generate batch
          </button>
        </div>
      </div>

      {/* ── How it works ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { step: "1", label: "Generate", desc: "Create a batch of coded scratch cards here. No product link yet.", icon: "🎟️", active: true },
          { step: "2", label: "Print & Insert", desc: "Print the codes, insert cards into paint tins at the factory.", icon: "🏭", active: false },
          { step: "3", label: "Approve & Activate", desc: "Come back here and activate the batch. Codes go live for USSD claims.", icon: "✅", active: false },
        ].map(s => (
          <div key={s.step} className={`flex items-start gap-3 p-4 rounded-lg border ${s.active ? "border-brand-200 bg-brand-50 dark:bg-brand-500/10 dark:border-brand-500/20" : "border-gray-200 bg-white dark:border-white/10 dark:bg-[#18181b]"}`}>
            <span className="text-2xl">{s.icon}</span>
            <div>
              <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-0.5">Step {s.step}</p>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">{s.label}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{s.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── New Batch Form ────────────────────────────────────────────────── */}
      {showNewForm && (
        <div className="rounded-lg border border-brand-200 bg-white p-6 shadow-sm dark:border-brand-500/20 dark:bg-[#18181b]">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-1">New voucher batch</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-5">
            Give this batch a reference code and say how many cards to generate. Serial format: <span className="font-mono bg-gray-100 dark:bg-white/10 px-1 py-0.5 rounded text-xs">BATCHREF-0001</span>
          </p>
          {error && <p className="text-xs font-medium text-error-600 bg-error-50 rounded-md px-3 py-2 mb-4 dark:bg-error-500/10 dark:text-error-400">{error}</p>}
          <form onSubmit={handleGenerate} className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1 space-y-1.5">
              <label className="text-xs font-medium text-gray-700 dark:text-gray-300">Batch reference</label>
              <input
                type="text"
                value={formData.batchNumber}
                onChange={(e) => setFormData(f => ({ ...f, batchNumber: e.target.value }))}
                placeholder="e.g. BHTSYS002"
                className="w-full h-10 rounded-md border border-gray-300 bg-white px-3 text-sm font-mono uppercase tracking-widest shadow-sm transition-colors placeholder:text-gray-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-white/30"
              />
            </div>
            <div className="w-48 space-y-1.5">
              <label className="text-xs font-medium text-gray-700 dark:text-gray-300">Number of cards</label>
              <input
                type="number"
                min="1"
                max="5000"
                value={formData.quantity}
                onChange={(e) => setFormData(f => ({ ...f, quantity: e.target.value }))}
                placeholder="e.g. 500"
                className="w-full h-10 rounded-md border border-gray-300 bg-white px-3 text-sm shadow-sm transition-colors placeholder:text-gray-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-white/30"
              />
            </div>
            <div className="flex gap-3 shrink-0">
              <button type="button" onClick={() => setShowNewForm(false)} className="h-10 px-4 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors dark:text-gray-300 dark:hover:bg-white/5">Cancel</button>
              <button type="submit" disabled={isSubmitting} className="h-10 px-6 rounded-md bg-brand-600 text-white text-sm font-medium shadow-sm hover:bg-brand-700 transition-colors disabled:opacity-50">
                {isSubmitting ? "Generating..." : "Generate codes"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── Batches Table ─────────────────────────────────────────────────── */}
      <div className="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-white/10 dark:bg-[#18181b] overflow-hidden">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4 dark:border-white/5">
          <div className="relative w-full max-w-sm">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search by batch # or product..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-9 w-full rounded-md border border-gray-300 bg-white pl-10 pr-3 text-sm text-gray-900 shadow-sm placeholder:text-gray-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-white/30"
            />
          </div>
          <span className="shrink-0 ml-4 text-xs text-gray-400 dark:text-gray-500">
            {filteredBatches.filter((b: any) => !b.isActivated).length} pending · {filteredBatches.filter((b: any) => b.isActivated).length} active
          </span>
        </div>

        {isLoading ? (
          <div className="flex h-48 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent"></div>
          </div>
        ) : (
          <Table className="w-full">
            <TableHeader className="bg-gray-50/50 dark:bg-white/5">
              <TableRow className="border-none">
                <TableCell isHeader className="py-3 px-6 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Batch ref</TableCell>
                <TableCell isHeader className="py-3 px-6 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Code format</TableCell>
                <TableCell isHeader className="py-3 px-6 text-right text-xs font-medium text-gray-500 dark:text-gray-400">Cards</TableCell>
                <TableCell isHeader className="py-3 px-6 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Product</TableCell>
                <TableCell isHeader className="py-3 px-6 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Status</TableCell>
                <TableCell isHeader className="py-3 px-6 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Action</TableCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBatches.length > 0 ? filteredBatches.map((batch: any) => {
                const cleanRef = batch.batchNumber?.replace(/[^A-Z0-9]/gi, "").toUpperCase().slice(0, 8);
                return (
                  <TableRow key={batch.id} className="border-b border-gray-100 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/[0.02]">
                    <TableCell className="py-3 px-6">
                      <span className="text-sm font-bold font-mono text-gray-900 dark:text-white tracking-widest">{batch.batchNumber}</span>
                    </TableCell>
                    <TableCell className="py-3 px-6">
                      <p className="text-xs text-gray-500 dark:text-gray-400">Serial: <span className="font-mono text-gray-700 dark:text-gray-300">{cleanRef}-0001 … {cleanRef}-{String(batch.quantity).padStart(4, "0")}</span></p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Code: <span className="font-mono text-gray-700 dark:text-gray-300">XXXXX-XXXXX</span></p>
                    </TableCell>
                    <TableCell className="py-3 px-6 text-right font-mono text-sm font-bold text-gray-900 dark:text-white">
                      {batch.quantity?.toLocaleString()}
                    </TableCell>
                    <TableCell className="py-3 px-6 text-sm text-gray-600 dark:text-gray-400">
                      {batch.productName || <span className="text-gray-300 dark:text-gray-600 italic">Not linked</span>}
                    </TableCell>
                    <TableCell className="py-3 px-6">
                      <Badge size="sm" color={batch.status === "ACTIVE" ? "success" : batch.status === "IN_TRANSIT" ? "warning" : "light"}>
                        {batch.status === "ACTIVE" ? "Active" : batch.status === "IN_TRANSIT" ? "In Transit" : "Printed"}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-3 px-6 flex items-center gap-2">
                       {batch.status === "PRINTED" && (
                          <button
                            onClick={async () => {
                              if (confirm("Mark this batch as In Transit?")) {
                                const res = await authenticatedFetch(`/api/vouchers/batches/${batch.id}/status`, { method: "PATCH", body: JSON.stringify({ status: "IN_TRANSIT" }) });
                                mutate();
                              }
                            }}
                            className="inline-flex items-center gap-1.5 rounded-md bg-brand-50 px-3 py-1.5 text-xs font-medium text-brand-700 border border-brand-200 hover:bg-brand-600 hover:text-white transition-all whitespace-nowrap"
                          >
                            Dispatch &rarr;
                          </button>
                       )}
                      {(!batch.isActivated && batch.status === "IN_TRANSIT") && (
                        <button
                          onClick={() => handleActivate(batch.id, batch.batchNumber)}
                          disabled={activatingId === batch.id}
                          className="inline-flex items-center gap-1.5 rounded-md bg-success-50 px-3 py-1.5 text-xs font-medium text-success-700 border border-success-200 hover:bg-success-500 hover:text-white hover:border-success-500 transition-all disabled:opacity-50 whitespace-nowrap dark:bg-success-500/10 dark:text-success-400 dark:border-success-500/20 dark:hover:bg-success-500 dark:hover:text-white"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {activatingId === batch.id ? "Activating..." : "Cards inserted — Activate"}
                        </button>
                      )}
                      {batch.isActivated && (
                        <span className="text-xs text-gray-400 dark:text-gray-500">
                          Activated {new Date(batch.activatedAt || batch.createdAt).toLocaleDateString()}
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                );
              }) : (
                <TableRow>
                  <TableCell colSpan={6} className="py-16 text-center text-sm text-gray-500 dark:text-gray-400">
                    No voucher batches yet. Click &quot;Generate batch&quot; to start.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
