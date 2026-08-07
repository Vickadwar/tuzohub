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
import ModernSelect from "@/components/ui/ModernSelect";
import { BoxCubeIcon } from "@/icons";

const STATUS_COLORS: Record<string, any> = {
  GENERATED: "light",
  "At Printer Press": "warning",
  AT_PRINTER: "warning",
  "In Transit": "purple",
  IN_TRANSIT: "purple",
  "In Stock": "info",
  IN_STOCK: "info",
  Active: "success",
  ACTIVE: "success",
  Redeemed: "success",
  REDEEMED: "success",
  CANCELLED: "error",
  EXPIRED: "error",
};

const formatStatusLabel = (status: string): string => {
  if (!status) return "Generated";
  const map: Record<string, string> = {
    GENERATED: "Generated",
    AT_PRINTER: "At Printer Press",
    IN_TRANSIT: "In Transit",
    IN_STOCK: "In Stock",
    ACTIVE: "Active",
    REDEEMED: "Redeemed",
    CANCELLED: "Cancelled",
    EXPIRED: "Expired",
    PENDING: "Pending",
    PROCESSING: "Processing",
    SUCCESS: "Success",
    FAILED: "Failed",
  };
  if (map[status.toUpperCase()]) return map[status.toUpperCase()];
  const cleaned = status.replace(/_/g, " ").toLowerCase();
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
};

export default function VoucherCenter() {
  const { data: batchesRes, isLoading, isError, mutate } = useApi<any>("/vouchers/batches");
  const { data: analyticsRes, mutate: mutateAnalytics } = useApi<any>("/vouchers/analytics");
  const { data: productsRes } = useApi<any>("/products?limit=200");
  const { data: campaignsRes } = useApi<any>("/campaigns");

  const [showNewForm, setShowNewForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activatingId, setActivatingId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // Live Progress Modal State
  const [progressModalOpen, setProgressModalOpen] = useState(false);
  const [progressStep, setProgressStep] = useState(0); // 0: Init, 1: HMAC Hash, 2: DB Commit, 3: Done
  const [progressPercent, setProgressPercent] = useState(0);
  const [progressRef, setProgressRef] = useState("");
  const [progressQty, setProgressQty] = useState(0);
  const [progressError, setProgressError] = useState("");

  // Form State
  const [formData, setFormData] = useState({
    batchNumber: "",
    quantity: "",
    productId: "",
    campaignId: "",
  });

  // Export State for generated batch
  const [generatedExport, setGeneratedExport] = useState<{
    batchRef: string;
    rows: any[];
  } | null>(null);

  // Unpack useApi unwrapped payload safely
  const batches: any[] = Array.isArray(batchesRes)
    ? batchesRes
    : batchesRes?.data || [];

  const productsList: any[] = Array.isArray(productsRes)
    ? productsRes
    : productsRes?.data || [];

  const campaignsList: any[] = Array.isArray(campaignsRes)
    ? campaignsRes
    : campaignsRes?.data || [];

  const stats = analyticsRes || {
    totalBatches: 0,
    totalCardsGenerated: 0,
    activeCardsInMarket: 0,
    totalRedeemed: 0,
    redemptionRate: "0.0",
    totalDenominationValue: 0,
  };

  const filteredBatches = batches.filter(
    (b: any) =>
      !searchTerm ||
      b.batchNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.productName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.campaignName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const downloadCSV = (rows: any[], filename: string) => {
    if (!rows || !rows.length) return;
    const headers = ["Serial Number", "Scratch Code (Secret)", "Batch Reference", "Product SKU"];
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [
        headers.join(","),
        ...rows.map((r) =>
          [
            `"${r.serialNumber}"`,
            `"${r.secureCode}"`,
            `"${r.batchNumber}"`,
            `"${r.productSku || "Generic Pool"}"`,
          ].join(",")
        ),
      ].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!formData.batchNumber.trim()) return setError("Batch reference code is required.");
    const qty = parseInt(formData.quantity);
    if (!qty || qty < 1 || qty > 50000) return setError("Quantity must be between 1 and 50,000 cards.");

    const cleanRef = formData.batchNumber.toUpperCase().trim();
    setProgressRef(cleanRef);
    setProgressQty(qty);
    setProgressStep(0);
    setProgressPercent(10);
    setProgressError("");
    setProgressModalOpen(true);
    setIsSubmitting(true);

    try {
      // Step 1: Initializing
      await new Promise((r) => setTimeout(r, 300));
      setProgressStep(1);
      setProgressPercent(35);

      const res = await authenticatedFetch("/api/vouchers/batches", {
        method: "POST",
        body: JSON.stringify({
          batchNumber: cleanRef,
          quantity: qty,
          productId: formData.productId || undefined,
          campaignId: formData.campaignId || undefined,
        }),
      });

      // Step 2: DB Commit
      setProgressStep(2);
      setProgressPercent(80);

      const dataObj = res?.data !== undefined ? res.data : res;
      if (res && (res.success || dataObj?.batch || dataObj?.exportRows)) {
        await new Promise((r) => setTimeout(r, 400));
        setProgressStep(3);
        setProgressPercent(100);

        mutate();
        mutateAnalytics();
        if (typeof window !== "undefined") {
          window.dispatchEvent(new Event("tuzohub_metrics_updated"));
        }
        setShowNewForm(false);
        const exportRows = dataObj?.exportRows || res?.exportRows || [];
        if (exportRows.length > 0) {
          setGeneratedExport({
            batchRef: cleanRef,
            rows: exportRows,
          });
        }
        setFormData({
          batchNumber: "",
          quantity: "",
          productId: "",
          campaignId: "",
        });
      } else {
        const msg = res?.error || "Failed to generate vouchers.";
        setProgressError(msg);
        setError(msg);
      }
    } catch (err: any) {
      const msg = err.message || "Failed to generate vouchers.";
      setProgressError(msg);
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const closeProgressModal = () => {
    if (isSubmitting) return;
    setProgressModalOpen(false);
    setProgressError("");
  };

  const handleDeleteBatch = async (batchId: string, batchRef: string) => {
    if (
      !confirm(
        `Are you sure you want to delete unused batch "${batchRef}"?\n\nThis will remove all associated unredeemed voucher codes from your inventory.`
      )
    )
      return;

    try {
      const res = await authenticatedFetch(`/api/vouchers/batches/${batchId}`, {
        method: "DELETE",
      });

      if (res) {
        mutate();
        mutateAnalytics();
      }
    } catch (err: any) {
      alert(err.message || "Failed to delete batch.");
    }
  };

  return (
    <div className="w-full space-y-6 animate-fadeIn pb-12 relative">
      {/* ── Page Header ──────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-200/80 dark:border-white/[0.06] pb-5">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">Voucher Center &amp; Security Tokens</h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400 text-xs font-semibold border border-brand-500/20">
              Enterprise Ledger
            </span>
          </div>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Generate encrypted scratch-card code batches. Serial pattern: <span className="font-mono text-brand-600 dark:text-brand-400 font-bold">BATCHREF-0001</span>.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/vouchers/list"
            className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-white/5 dark:hover:bg-white/10 text-gray-900 dark:text-white text-xs font-semibold rounded-xl border border-gray-200/80 dark:border-white/10 transition flex items-center gap-2"
          >
            <svg className="h-4 w-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 010-3.75z" />
            </svg>
            View All Vouchers
          </Link>
          <button
            onClick={() => setShowNewForm((v) => !v)}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-xs font-semibold text-white shadow-md shadow-brand-500/20 hover:bg-brand-700 transition-all shrink-0"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Generate Batch
          </button>
        </div>
      </div>

      {/* ── KPI Summary Cards ────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-white/[0.02] border border-gray-200/80 dark:border-white/[0.06] p-4 rounded-2xl shadow-sm">
          <p className="text-xs font-semibold text-gray-500">Total Batches</p>
          <p className="text-xl font-bold font-mono text-gray-900 dark:text-white mt-1">
            {stats.totalBatches} <span className="text-xs font-normal text-gray-400">Batches</span>
          </p>
          <p className="text-[11px] text-gray-400 mt-1">{(stats.totalCardsGenerated || 0).toLocaleString()} total cards generated</p>
        </div>

        <div className="bg-white dark:bg-white/[0.02] border border-gray-200/80 dark:border-white/[0.06] p-4 rounded-2xl shadow-sm">
          <p className="text-xs font-semibold text-gray-500">Active In Market</p>
          <p className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1">
            {(stats.activeCardsInMarket || 0).toLocaleString()} <span className="text-xs font-normal text-gray-400">Cards</span>
          </p>
          <p className="text-[11px] text-gray-400 mt-1">Activated via factory packaging</p>
        </div>

        <div className="bg-white dark:bg-white/[0.02] border border-gray-200/80 dark:border-white/[0.06] p-4 rounded-2xl shadow-sm">
          <p className="text-xs font-semibold text-gray-500">Total Redeemed</p>
          <p className="text-xl font-bold font-mono text-brand-600 dark:text-brand-400 mt-1">
            {(stats.totalRedeemed || 0).toLocaleString()} <span className="text-xs font-normal text-gray-400">Claimed</span>
          </p>
          <p className="text-[11px] text-gray-400 mt-1">USSD &amp; Web redemptions</p>
        </div>

        <div className="bg-white dark:bg-white/[0.02] border border-gray-200/80 dark:border-white/[0.06] p-4 rounded-2xl shadow-sm">
          <p className="text-xs font-semibold text-gray-500">Redemption Rate</p>
          <p className="text-xl font-bold font-mono text-amber-500 mt-1">
            {stats.redemptionRate || "0.0"}%
          </p>
          <p className="text-[11px] text-gray-400 mt-1">Total claimed vs generated</p>
        </div>
      </div>

      {/* ── Printing Export Prompt Banner ────────────────────────────────────── */}
      {generatedExport && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-fadeIn">
          <div>
            <p className="text-xs font-bold">🎉 Batch &quot;{generatedExport.batchRef}&quot; Generated ({generatedExport.rows.length.toLocaleString()} Cards)</p>
            <p className="text-xs mt-0.5">Download the scratch-card dataset for your commercial printing press.</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => downloadCSV(generatedExport.rows, `Vouchers_Printing_${generatedExport.batchRef}`)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-sm transition flex items-center gap-2"
            >
              📥 Download Printing CSV
            </button>
            <button onClick={() => setGeneratedExport(null)} className="px-3 py-2 text-xs text-gray-500 hover:text-gray-700">Dismiss</button>
          </div>
        </div>
      )}

      {/* ── New Batch Form ────────────────────────────────────────────────── */}
      {showNewForm && (
        <div className="bg-white dark:bg-white/[0.02] border border-gray-200/80 dark:border-white/[0.06] rounded-2xl p-6 shadow-sm relative space-y-4">
          <div>
            <h2 className="text-sm font-bold text-gray-900 dark:text-white">Generate Voucher Batch</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Assign a batch reference code. Cards will follow serial pattern: <span className="font-mono bg-gray-100 dark:bg-white/10 px-1 py-0.5 rounded text-[11px]">BATCHREF-0001</span>
            </p>
          </div>

          {error && <p className="text-xs font-semibold text-rose-600 bg-rose-500/10 rounded-xl p-3 border border-rose-500/20">{error}</p>}

          <form onSubmit={handleGenerate} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Batch Reference Code</label>
                <input
                  type="text"
                  value={formData.batchNumber}
                  onChange={(e) => setFormData((f) => ({ ...f, batchNumber: e.target.value }))}
                  placeholder="e.g. BHT2026-01"
                  className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-white/10 rounded-xl text-xs font-mono font-bold uppercase tracking-wider text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/40"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Number of Cards (Quantity)</label>
                <input
                  type="number"
                  min="1"
                  max="50000"
                  value={formData.quantity}
                  onChange={(e) => setFormData((f) => ({ ...f, quantity: e.target.value }))}
                  placeholder="e.g. 5000"
                  className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-white/10 rounded-xl text-xs font-mono font-bold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/40"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Target Product (Optional)</label>
                <ModernSelect
                  options={[
                    { value: "", label: "— Generic Pool (Link at factory) —" },
                    ...productsList.map((p) => ({ value: p.id, label: `${p.name} (${p.sku || "No SKU"})` })),
                  ]}
                  value={formData.productId}
                  onChange={(val) => setFormData({ ...formData, productId: val })}
                  placeholder="Select product item"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Campaign Link (Optional)</label>
                <ModernSelect
                  options={[
                    { value: "", label: "— Default Rules —" },
                    ...campaignsList.map((c) => ({ value: c.id, label: c.name })),
                  ]}
                  value={formData.campaignId}
                  onChange={(val) => setFormData({ ...formData, campaignId: val })}
                  placeholder="Select campaign"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2 border-t border-gray-100 dark:border-white/5">
              <button
                type="button"
                onClick={() => setShowNewForm(false)}
                className="px-4 py-2 text-xs font-semibold text-gray-600 dark:text-gray-400 hover:text-gray-900 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold rounded-xl shadow-md shadow-brand-500/20 transition disabled:opacity-50 flex items-center gap-2"
              >
                <span>⚡ Launch Generation Process</span>
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
              placeholder="Search by batch ref, product, or campaign..."
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
                <TableCell isHeader className="py-3.5 px-6 text-xs font-semibold text-gray-500 dark:text-gray-400">Serial Range</TableCell>
                <TableCell isHeader className="py-3.5 px-6 text-xs font-semibold text-gray-500 dark:text-gray-400 text-right">Card Count</TableCell>
                <TableCell isHeader className="py-3.5 px-6 text-xs font-semibold text-gray-500 dark:text-gray-400">Linked Product / Campaign</TableCell>
                <TableCell isHeader className="py-3.5 px-6 text-xs font-semibold text-gray-500 dark:text-gray-400">Status</TableCell>
                <TableCell isHeader className="py-3.5 px-6 text-xs font-semibold text-gray-500 dark:text-gray-400">Actions</TableCell>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.04]">
              {filteredBatches.length > 0 ? (
                filteredBatches.map((batch: any) => {
                  const cleanRef = batch.batchNumber?.replace(/[^A-Z0-9]/gi, "").toUpperCase().slice(0, 8);
                  const generatedCount = batch.generated || 0;
                  return (
                    <TableRow key={batch.id} className="hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition-colors">
                      <TableCell className="py-3.5 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center font-bold text-xs border border-brand-500/20 shrink-0 shadow-2xs">
                            <BoxCubeIcon className="w-4 h-4" />
                          </div>
                          <div>
                            <Link href={`/vouchers/batches/${batch.id}`} className="text-xs font-bold font-mono text-brand-600 dark:text-brand-400 hover:underline tracking-wider">
                              {batch.batchNumber}
                            </Link>
                            <p className="text-[11px] text-gray-400">{new Date(batch.createdAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell className="py-3.5 px-6">
                        <p className="text-xs font-mono text-gray-700 dark:text-gray-300 font-semibold">
                          {cleanRef}-0001 … {cleanRef}-{String(batch.quantity).padStart(4, "0")}
                        </p>
                        <p className="text-[11px] text-gray-400 mt-0.5">Scratch Code: <span className="font-mono text-gray-400">XXXXX-XXXXX</span></p>
                      </TableCell>

                      <TableCell className="py-3.5 px-6 text-right font-mono text-xs font-bold text-brand-600 dark:text-brand-400">
                        <div>
                          <span>{(generatedCount || batch.quantity)?.toLocaleString()}</span>
                          <span className="text-[10px] text-gray-400 font-sans block">
                            {generatedCount < batch.quantity ? `(${generatedCount}/${batch.quantity} Provisioned)` : "CARDS ACTIVE"}
                          </span>
                        </div>
                      </TableCell>

                      <TableCell className="py-3.5 px-6 text-xs text-gray-600 dark:text-gray-300 font-medium">
                        {batch.productName ? (
                          <div>
                            <span className="font-bold text-gray-900 dark:text-white">{batch.productName}</span>
                            {batch.campaignName && <p className="text-[11px] text-brand-600 dark:text-brand-400">{batch.campaignName}</p>}
                          </div>
                        ) : (
                          <span className="text-amber-600 dark:text-amber-400 italic">Generic Pool (Linked at factory)</span>
                        )}
                      </TableCell>

                      <TableCell className="py-3.5 px-6">
                        <Badge size="sm" color={STATUS_COLORS[batch.status] || "light"}>
                          {formatStatusLabel(batch.status)}
                        </Badge>
                      </TableCell>

                      <TableCell className="py-3.5 px-6">
                        <Link
                          href={`/vouchers/batches/${batch.id}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 dark:bg-white/5 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300 text-xs font-semibold rounded-xl border border-gray-200/80 dark:border-white/10 transition"
                        >
                          View Batch Audit &rarr;
                        </Link>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
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

      {/* ── LIVE BATCH GENERATION PROGRESS MODAL ──────────────────────────── */}
      {progressModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-950/70 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-6 relative overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Top Glowing Bar */}
            <div
              className={`absolute top-0 left-0 right-0 h-1.5 ${
                progressError
                  ? "bg-rose-500"
                  : progressStep === 3
                  ? "bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600"
                  : "bg-gradient-to-r from-brand-500 via-purple-500 to-amber-500 animate-pulse"
              }`}
            />

            {/* Header Info */}
            <div className="flex items-start justify-between gap-4 pt-1">
              <div className="flex items-center gap-3.5">
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg border ${
                    progressError
                      ? "bg-rose-500/10 text-rose-500 border-rose-500/30"
                      : progressStep === 3
                      ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/30"
                      : "bg-brand-500/10 text-brand-500 border-brand-500/30"
                  }`}
                >
                  {progressError ? "✕" : progressStep === 3 ? "✓" : "⚡"}
                </div>
                <div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/20">
                    {progressError ? "Generation Error" : progressStep === 3 ? "Process Completed" : "Generating Batch..."}
                  </span>
                  <h3 className="text-lg font-bold font-mono text-gray-900 dark:text-white mt-1">
                    {progressRef}
                  </h3>
                  <p className="text-xs text-gray-400 font-mono">
                    {progressQty.toLocaleString()} Scratch-Card Vouchers
                  </p>
                </div>
              </div>

              {!isSubmitting && (
                <button
                  onClick={closeProgressModal}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition text-lg"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Progress Bar & Dynamic Percentage */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-gray-500 dark:text-gray-400 font-bold">
                  {progressError
                    ? "Generation interrupted"
                    : progressStep === 3
                    ? "100% Completed"
                    : `Processing Batch Vector...`}
                </span>
                <span className={`font-bold text-sm ${progressError ? "text-rose-500" : "text-brand-500"}`}>
                  {progressPercent}%
                </span>
              </div>
              <div className="w-full bg-gray-100 dark:bg-white/5 h-2.5 rounded-full overflow-hidden p-0.5 border border-gray-200/50 dark:border-white/5">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    progressError
                      ? "bg-rose-500"
                      : progressStep === 3
                      ? "bg-emerald-500 shadow-lg shadow-emerald-500/50"
                      : "bg-gradient-to-r from-brand-500 to-amber-400"
                  }`}
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* Steps Log Checklist */}
            <div className="bg-gray-50 dark:bg-black/40 border border-gray-200/80 dark:border-white/5 rounded-2xl p-4 space-y-2.5 text-xs font-mono">
              <div className="flex items-center justify-between text-[11px] text-gray-400 uppercase font-bold tracking-wider border-b border-gray-200/50 dark:border-white/5 pb-2">
                <span>Execution Steps</span>
                <span>Status</span>
              </div>

              <div className="flex items-center justify-between text-gray-700 dark:text-gray-300">
                <span className="flex items-center gap-2">
                  <span className={progressStep >= 0 ? "text-emerald-500 font-bold" : "text-gray-400"}>
                    {progressStep >= 0 ? "✓" : "○"}
                  </span>
                  <span>1. Initialize Security Seeds &amp; Serial Range</span>
                </span>
                <span className="text-[10px] text-emerald-500 font-bold">READY</span>
              </div>

              <div className="flex items-center justify-between text-gray-700 dark:text-gray-300">
                <span className="flex items-center gap-2">
                  <span className={progressStep >= 1 ? "text-emerald-500 font-bold" : "text-gray-400"}>
                    {progressStep >= 1 ? "✓" : "○"}
                  </span>
                  <span>2. Generate HMAC-SHA256 Secret Tokens</span>
                </span>
                <span className="text-[10px] text-brand-500 font-bold">
                  {progressStep >= 1 ? "COMPLETED" : "PENDING"}
                </span>
              </div>

              <div className="flex items-center justify-between text-gray-700 dark:text-gray-300">
                <span className="flex items-center gap-2">
                  <span className={progressStep >= 2 ? "text-emerald-500 font-bold" : "text-gray-400"}>
                    {progressStep >= 2 ? "✓" : "○"}
                  </span>
                  <span>3. Vector Insert to PostgreSQL Ledger</span>
                </span>
                <span className="text-[10px] text-amber-500 font-bold">
                  {progressStep >= 2 ? "COMMITTED" : "PENDING"}
                </span>
              </div>

              <div className="flex items-center justify-between text-gray-700 dark:text-gray-300">
                <span className="flex items-center gap-2">
                  <span className={progressStep >= 3 ? "text-emerald-500 font-bold" : "text-gray-400"}>
                    {progressStep >= 3 ? "✓" : "○"}
                  </span>
                  <span>4. Activate Inventory &amp; Export Link</span>
                </span>
                <span className="text-[10px] text-emerald-500 font-bold">
                  {progressStep >= 3 ? "ACTIVE" : "QUEUED"}
                </span>
              </div>
            </div>

            {/* Error Banner inside Modal if failed */}
            {progressError && (
              <div className="p-3.5 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-600 dark:text-rose-400 text-xs font-semibold">
                {progressError}
              </div>
            )}

            {/* Bottom Actions */}
            <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-100 dark:border-white/5">
              {progressStep === 3 && generatedExport?.rows?.length ? (
                <button
                  type="button"
                  onClick={() => downloadCSV(generatedExport.rows, `Vouchers_Printing_${progressRef}`)}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition shadow-lg shadow-emerald-600/20 flex items-center gap-2"
                >
                  <span>📥 Download Printing CSV ({generatedExport.rows.length.toLocaleString()} Cards)</span>
                </button>
              ) : null}

              <button
                type="button"
                disabled={isSubmitting}
                onClick={closeProgressModal}
                className="px-5 py-2.5 bg-gray-900 text-white dark:bg-white dark:text-gray-900 text-xs font-bold rounded-xl transition disabled:opacity-50"
              >
                {isSubmitting ? "Generating in Progress..." : "Close & View Inventory"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
