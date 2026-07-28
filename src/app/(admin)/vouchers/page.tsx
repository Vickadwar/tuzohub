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
import { BoxCubeIcon } from "@/icons";

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

  if (isError) return <div className="p-6 text-xs font-semibold text-rose-500">Failed to load voucher batches.</div>;

  return (
    <div className="w-full space-y-6 animate-fadeIn pb-12">

      {/* ── Page Header ──────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-200/80 dark:border-white/[0.06] pb-5">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">Voucher Center &amp; Batch Generation</h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400 text-xs font-semibold border border-brand-500/20">
              Security Tokens
            </span>
          </div>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Generate encrypted scratch-card code batches. Activation happens downstream at production packaging.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/vouchers/list"
            className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-white/5 dark:hover:bg-white/10 text-gray-900 dark:text-white text-xs font-semibold rounded-xl border border-gray-200/80 dark:border-white/10 transition flex items-center gap-2"
          >
            <svg className="h-4 w-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010 3.75H5.625a1.875 1.875 0 010-3.75z" />
            </svg>
            View All Vouchers
          </Link>
          <button
            onClick={() => setShowNewForm(v => !v)}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-xs font-semibold text-white shadow-md shadow-brand-500/20 hover:bg-brand-700 transition-all shrink-0"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Generate Batch
          </button>
        </div>
      </div>

      {/* ── How It Works Steps ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { step: "1", label: "Generate Batch", desc: "Create a batch of unique scratch card tokens.", icon: "🎟️", active: true },
          { step: "2", label: "Print & Insert", desc: "Print physical cards and insert into product tins.", icon: "🏭", active: false },
          { step: "3", label: "Approve & Activate", desc: "Activate batch upon production run to go live.", icon: "✅", active: false },
        ].map(s => (
          <div key={s.step} className="bg-white dark:bg-white/[0.02] border border-gray-200/80 dark:border-white/[0.06] p-4 rounded-2xl shadow-sm flex items-start gap-3">
            <div className="w-9 h-9 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center font-bold text-xs border border-brand-500/20 shrink-0 shadow-2xs">
              {s.step}
            </div>
            <div>
              <p className="text-xs font-bold text-gray-900 dark:text-white">{s.label}</p>
              <p className="text-[11px] text-gray-400 mt-0.5">{s.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── New Batch Form ────────────────────────────────────────────────── */}
      {showNewForm && (
        <div className="bg-white dark:bg-white/[0.02] border border-gray-200/80 dark:border-white/[0.06] rounded-2xl p-6 shadow-sm relative space-y-4">
          <div>
            <h2 className="text-sm font-bold text-gray-900 dark:text-white">Generate Voucher Batch</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Assign a batch reference code and card count. Serial pattern: <span className="font-mono bg-gray-100 dark:bg-white/10 px-1 py-0.5 rounded text-[11px]">BATCHREF-0001</span>
            </p>
          </div>
          {error && <p className="text-xs font-semibold text-rose-600 bg-rose-500/10 rounded-xl p-3 border border-rose-500/20">{error}</p>}
          <form onSubmit={handleGenerate} className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1 space-y-1">
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Batch Reference Code</label>
              <input
                type="text"
                value={formData.batchNumber}
                onChange={(e) => setFormData(f => ({ ...f, batchNumber: e.target.value }))}
                placeholder="e.g. BHTSYS002"
                className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-white/10 rounded-xl text-xs font-mono font-bold uppercase tracking-wider text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/40"
              />
            </div>
            <div className="w-48 space-y-1">
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Number of Cards</label>
              <input
                type="number"
                min="1"
                max="5000"
                value={formData.quantity}
                onChange={(e) => setFormData(f => ({ ...f, quantity: e.target.value }))}
                placeholder="e.g. 500"
                className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-white/10 rounded-xl text-xs font-mono font-bold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/40"
              />
            </div>
            <div className="flex gap-3 shrink-0">
              <button type="button" onClick={() => setShowNewForm(false)} className="px-4 py-2 text-xs font-semibold text-gray-600 dark:text-gray-400 hover:text-gray-900 transition">Cancel</button>
              <button type="submit" disabled={isSubmitting} className="px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold rounded-xl shadow-md shadow-brand-500/20 transition disabled:opacity-50">
                {isSubmitting ? "Generating..." : "Generate Codes"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── Batches Table ─────────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-white/[0.02] border border-gray-200/80 dark:border-white/[0.06] rounded-2xl overflow-hidden shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-100 p-4 dark:border-white/5 sm:px-6 sm:py-4">
          <div className="relative w-full max-w-sm">
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search by batch ref or product..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-white/10 rounded-xl text-xs font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/40"
            />
          </div>
          <span className="shrink-0 ml-4 text-xs font-semibold text-gray-500 dark:text-gray-400">
            {filteredBatches.filter((b: any) => !b.isActivated).length} Pending · {filteredBatches.filter((b: any) => b.isActivated).length} Active
          </span>
        </div>

        {isLoading ? (
          <div className="flex h-48 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-500 border-t-transparent"></div>
          </div>
        ) : (
          <Table className="w-full">
            <TableHeader>
              <TableRow className="bg-gray-50/50 dark:bg-white/[0.01]">
                <TableCell isHeader className="py-3.5 px-6 text-xs font-semibold text-gray-500 dark:text-gray-400">Batch Reference</TableCell>
                <TableCell isHeader className="py-3.5 px-6 text-xs font-semibold text-gray-500 dark:text-gray-400">Code Format</TableCell>
                <TableCell isHeader className="py-3.5 px-6 text-xs font-semibold text-gray-500 dark:text-gray-400 text-right">Card Count</TableCell>
                <TableCell isHeader className="py-3.5 px-6 text-xs font-semibold text-gray-500 dark:text-gray-400">Linked Product</TableCell>
                <TableCell isHeader className="py-3.5 px-6 text-xs font-semibold text-gray-500 dark:text-gray-400">Status</TableCell>
                <TableCell isHeader className="py-3.5 px-6 text-xs font-semibold text-gray-500 dark:text-gray-400">Actions</TableCell>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.04]">
              {filteredBatches.length > 0 ? filteredBatches.map((batch: any) => {
                const cleanRef = batch.batchNumber?.replace(/[^A-Z0-9]/gi, "").toUpperCase().slice(0, 8);
                return (
                  <TableRow key={batch.id} className="hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition-colors">
                    <TableCell className="py-3.5 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center font-bold text-xs border border-brand-500/20 shrink-0 shadow-2xs">
                          <BoxCubeIcon className="w-4 h-4" />
                        </div>
                        <span className="text-xs font-bold font-mono text-gray-900 dark:text-white tracking-wider">{batch.batchNumber}</span>
                      </div>
                    </TableCell>
                    <TableCell className="py-3.5 px-6">
                      <p className="text-xs text-gray-500 dark:text-gray-400">Serial: <span className="font-mono text-gray-700 dark:text-gray-300 font-semibold">{cleanRef}-0001 … {cleanRef}-{String(batch.quantity).padStart(4, "0")}</span></p>
                      <p className="text-[11px] text-gray-400 mt-0.5">Code: <span className="font-mono text-gray-500">XXXXX-XXXXX</span></p>
                    </TableCell>
                    <TableCell className="py-3.5 px-6 text-right font-mono text-xs font-bold text-brand-600 dark:text-brand-400">
                      {batch.quantity?.toLocaleString()} <span className="text-[10px] text-gray-400 font-sans">CARDS</span>
                    </TableCell>
                    <TableCell className="py-3.5 px-6 text-xs text-gray-600 dark:text-gray-300 font-medium">
                      {batch.productName || <span className="text-gray-400 italic">Not linked yet</span>}
                    </TableCell>
                    <TableCell className="py-3.5 px-6">
                      <Badge size="sm" color={batch.status === "ACTIVE" ? "success" : batch.status === "IN_TRANSIT" ? "warning" : "light"}>
                        {batch.status === "ACTIVE" ? "Active" : batch.status === "IN_TRANSIT" ? "In Transit" : "Printed"}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-3.5 px-6">
                       {batch.status === "PRINTED" && (
                          <button
                            onClick={async () => {
                              if (confirm("Mark this batch as In Transit?")) {
                                await authenticatedFetch(`/api/vouchers/batches/${batch.id}/status`, { method: "PATCH", body: JSON.stringify({ status: "IN_TRANSIT" }) });
                                mutate();
                              }
                            }}
                            className="px-3 py-1 bg-brand-500/10 text-brand-600 dark:text-brand-400 text-xs font-semibold rounded-full border border-brand-500/20 hover:bg-brand-500 hover:text-white transition-all"
                          >
                            Dispatch &rarr;
                          </button>
                       )}
                      {(!batch.isActivated && batch.status === "IN_TRANSIT") && (
                        <button
                          onClick={() => handleActivate(batch.id, batch.batchNumber)}
                          disabled={activatingId === batch.id}
                          className="px-3 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold rounded-full border border-emerald-500/20 hover:bg-emerald-500 hover:text-white transition-all disabled:opacity-50"
                        >
                          {activatingId === batch.id ? "Activating..." : "Cards Inserted — Activate"}
                        </button>
                      )}
                      {batch.isActivated && (
                        <span className="text-xs text-gray-400 font-medium">
                          Activated {new Date(batch.activatedAt || batch.createdAt).toLocaleDateString()}
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                );
              }) : (
                <TableRow>
                  <TableCell colSpan={6} className="py-16 text-center text-xs text-gray-400 italic font-medium">
                    No voucher batches generated yet. Click &quot;Generate Batch&quot; to begin.
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
