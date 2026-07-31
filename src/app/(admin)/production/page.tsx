"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Badge from "@/components/ui/badge/Badge";
import { useApi, authenticatedFetch } from "@/hooks/useApi";
import ModernSelect from "@/components/ui/ModernSelect";
import { BoxCubeIcon, PieChartIcon } from "@/icons";

export default function ProductionBatches() {
  const [searchTerm, setSearchTerm] = useState("");
  const { data: result, isLoading, isError, mutate } = useApi<any>("/product-batches");
  const { data: products } = useApi<any>("/products");
  const { data: campaignRes } = useApi<any>("/campaigns");
  const campaigns = Array.isArray(campaignRes) ? campaignRes : (campaignRes?.data || []);
  
  // Only IN_STOCK voucher batches (delivered to warehouse) can be loaded into production tins
  const { data: voucherBatchesRes, mutate: mutateVouchers } = useApi<any>("/vouchers/batches");
  const voucherBatchesArray = Array.isArray(voucherBatchesRes) ? voucherBatchesRes : (voucherBatchesRes?.data || []);
  const availableStockBatches: any[] = voucherBatchesArray.filter(
    (b: any) => !b.isActivated && (b.status === "IN_STOCK" || b.metadata?.status === "IN_STOCK")
  );

  const [showNewForm, setShowNewForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState<{
    productId: string;
    campaignId: string;
    batchNumber: string;
    quantityProduced: string;
    voucherBatchIds: string[];
    productionDate: string;
  }>({
    productId: "",
    campaignId: "",
    batchNumber: "",
    quantityProduced: "",
    voucherBatchIds: [],   // the voucher batches being inserted
    productionDate: new Date().toISOString().split("T")[0],
  });

  const batches: any[] = Array.isArray(result) ? result : (result?.data || []);
  const filtered = batches.filter((b: any) =>
    b.batchNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.productName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!formData.productId) return setError("Please select a product.");
    if (!formData.batchNumber.trim()) return setError("Batch number is required.");
    const qtyProduced = parseInt(formData.quantityProduced);
    if (!qtyProduced || qtyProduced < 1) return setError("Enter a valid quantity.");

    setIsSubmitting(true);
    try {
      // Record the production batch & auto activate links
      const res = await authenticatedFetch("/api/product-batches", {
        method: "POST",
        body: JSON.stringify({
          productId: formData.productId,
          campaignId: formData.campaignId || undefined,
          batchNumber: formData.batchNumber.toUpperCase(),
          quantityProduced: qtyProduced,
          productionDate: new Date(formData.productionDate).toISOString(),
          status: "active",
          voucherBatchIds: formData.voucherBatchIds
        }),
      });

      // Dispatch in-app notification to Admin Bell
      const activatedCount = res.data?.activatedVouchersCount || 0;
      const notificationItem = {
        id: `notif-${Date.now()}`,
        title: `Production Run #${formData.batchNumber.toUpperCase()} Completed`,
        message: `${qtyProduced} tins produced. ${activatedCount} scratch cards activated for market redemption.`,
        href: `/production/${res.data?.id || ""}`,
        time: "Just now",
        unread: true,
      };

      try {
        const existing = JSON.parse(localStorage.getItem("tuzohub_notifications") || "[]");
        localStorage.setItem("tuzohub_notifications", JSON.stringify([notificationItem, ...existing]));
        window.dispatchEvent(new Event("tuzohub_notification_updated"));
      } catch (err) {
        console.error("Failed to save notification:", err);
      }

      if (formData.voucherBatchIds.length > 0) mutateVouchers();

      mutate();
      setShowNewForm(false);
      setFormData({ productId: "", campaignId: "", batchNumber: "", quantityProduced: "", voucherBatchIds: [], productionDate: new Date().toISOString().split("T")[0] });
    } catch (err: any) {
      setError(err.message || "Failed to save batch.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isError) return <div className="p-6 text-xs font-semibold text-rose-500">Failed to load production batches.</div>;

  return (
    <div className="w-full space-y-6 animate-fadeIn pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-200/80 dark:border-white/[0.06] pb-5">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
              Production Runs &amp; Logistics Batches
            </h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400 text-xs font-semibold border border-brand-500/20">
              Factory Logistics
            </span>
          </div>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Record daily manufacturing runs and match product tins to issued voucher card batches.
          </p>
        </div>
        <button
          onClick={() => setShowNewForm(v => !v)}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-xs font-semibold text-white shadow-md shadow-brand-500/20 hover:bg-brand-700 transition-all shrink-0"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
          Record Production Run
        </button>
      </div>

      {/* Form */}
      {showNewForm && (
        <div className="bg-white dark:bg-white/[0.02] border border-gray-200/80 dark:border-white/[0.06] rounded-2xl p-6 shadow-sm relative space-y-4">
          <div>
            <h2 className="text-sm font-bold text-gray-900 dark:text-white">Record New Production Run</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Record manufacturing output. If scratch cards were inserted into tins, select the voucher batch to automatically activate codes.
            </p>
          </div>
          {error && <p className="text-xs font-semibold text-rose-600 bg-rose-500/10 rounded-xl p-3 border border-rose-500/20">{error}</p>}
          
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Product */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Product Item</label>
              <ModernSelect
                options={products?.map((p: any) => ({ value: p.id, label: `${p.name}` })) || []}
                value={formData.productId}
                onChange={(val) => setFormData(f => ({ ...f, productId: val }))}
                placeholder="Select product"
              />
            </div>

            {/* Campaign Options */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Campaign Link (Optional)</label>
              <ModernSelect
                options={campaigns?.map((c: any) => ({ value: c.id, label: `${c.name} (x${parseFloat(c.pointsMultiplier || "1.0").toFixed(1)})` })) || []}
                value={formData.campaignId}
                onChange={(val) => setFormData(f => ({ ...f, campaignId: val }))}
                placeholder="Select a campaign"
              />
            </div>

            {/* Production Batch Number */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Production Batch No.</label>
              <input
                type="text"
                value={formData.batchNumber}
                onChange={(e) => setFormData(f => ({ ...f, batchNumber: e.target.value }))}
                placeholder="e.g. B2026-SILK-001"
                className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-white/10 rounded-xl text-xs font-mono font-bold uppercase text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/40"
              />
            </div>

            {/* Quantity */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Quantity Produced (Tins)</label>
              <input
                type="number"
                min="1"
                value={formData.quantityProduced}
                onChange={(e) => setFormData(f => ({ ...f, quantityProduced: e.target.value }))}
                placeholder="e.g. 5000"
                className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-white/10 rounded-xl text-xs font-mono font-bold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/40"
              />
            </div>

            {/* Voucher Batch Link (Multiple) */}
            <div className="space-y-1 md:col-span-2">
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                Voucher Batches Inserted <span className="text-gray-400 font-normal">(Optional)</span>
              </label>
              
              <div className="space-y-2">
                <ModernSelect
                  options={[
                    { value: "", label: "— Select a voucher batch —" },
                    ...availableStockBatches
                      .filter((b: any) => !formData.voucherBatchIds.includes(b.id))
                      .map((b: any) => {
                        const isValue = b.metadata?.batchType === "VALUE_BASED" || !b.productId;
                        const labelDetail = isValue
                          ? `Generic Pool (KES ${b.metadata?.rewardDenomination || "50"})`
                          : (b.productName || "SKU Bound");
                        return {
                          value: b.id,
                          label: `${b.batchNumber}  ·  ${b.quantity} cards  ·  ${labelDetail}`
                        };
                      })
                  ]}
                  value=""
                  onChange={(val) => {
                    if (val && !formData.voucherBatchIds.includes(val)) {
                      setFormData(f => ({ ...f, voucherBatchIds: [...f.voucherBatchIds, val] }));
                    }
                  }}
                  placeholder="Select IN_STOCK voucher batch"
                />

                {availableStockBatches.length === 0 && (
                  <p className="text-[11px] text-amber-600 dark:text-amber-400 bg-amber-500/10 p-2.5 rounded-xl border border-amber-500/20">
                    📦 No voucher batches are currently marked as &quot;IN_STOCK&quot; in warehouse inventory. Go to <Link href="/vouchers" className="underline font-bold">Voucher Batches</Link> to mark delivered cards as &quot;IN_STOCK&quot;.
                  </p>
                )}

                {/* Selected Voucher Batches */}
                {formData.voucherBatchIds.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {formData.voucherBatchIds.map(id => {
                      const batch = availableStockBatches.find((b: any) => b.id === id) || voucherBatchesArray.find((b: any) => b.id === id);
                      return (
                        <div key={id} className="flex items-center gap-1.5 bg-brand-500/10 border border-brand-500/20 px-3 py-1 rounded-full">
                          <span className="text-xs font-bold text-brand-600 dark:text-brand-400">{batch?.batchNumber || "Unknown Batch"}</span>
                          <span className="text-[10px] text-gray-400 border-l border-brand-500/20 pl-1.5">{batch?.quantity || "?"} cards</span>
                          <button
                            type="button"
                            onClick={() => setFormData(f => ({ ...f, voucherBatchIds: f.voucherBatchIds.filter(vId => vId !== id) }))}
                            className="ml-1 text-gray-400 hover:text-rose-500 transition"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Date */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Production Date</label>
              <input
                type="date"
                value={formData.productionDate}
                onChange={(e) => setFormData(f => ({ ...f, productionDate: e.target.value }))}
                className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-white/10 rounded-xl text-xs font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/40"
              />
            </div>

            {/* Actions — full width */}
            <div className="md:col-span-3 flex justify-end items-center gap-3 pt-3 border-t border-gray-100 dark:border-white/5">
              <button type="button" onClick={() => setShowNewForm(false)} className="px-4 py-2 text-xs font-semibold text-gray-600 dark:text-gray-400 hover:text-gray-900 transition">
                Cancel
              </button>
              <button type="submit" disabled={isSubmitting} className="px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold rounded-xl shadow-md shadow-brand-500/20 transition disabled:opacity-50">
                {isSubmitting ? "Saving..." : "Save Production Run"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Table */}
      <div className="bg-white dark:bg-white/[0.02] border border-gray-200/80 dark:border-white/[0.06] rounded-2xl overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-white/5 flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-sm">
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input type="text" placeholder="Search production runs..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-white/10 rounded-xl text-xs font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/40" />
          </div>
          <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">{filtered.length} Runs Recorded</span>
        </div>

        {isLoading ? (
          <div className="h-48 flex items-center justify-center"><div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" /></div>
        ) : (
          <Table className="w-full">
            <TableHeader>
              <TableRow className="bg-gray-50/50 dark:bg-white/[0.01]">
                <TableCell isHeader className="py-3.5 px-6 text-xs font-semibold text-gray-500 dark:text-gray-400">Production Batch</TableCell>
                <TableCell isHeader className="py-3.5 px-6 text-xs font-semibold text-gray-500 dark:text-gray-400">Product Details</TableCell>
                <TableCell isHeader className="py-3.5 px-6 text-xs font-semibold text-gray-500 dark:text-gray-400 text-right">Tins Produced</TableCell>
                <TableCell isHeader className="py-3.5 px-6 text-xs font-semibold text-gray-500 dark:text-gray-400">Date</TableCell>
                <TableCell isHeader className="py-3.5 px-6 text-xs font-semibold text-gray-500 dark:text-gray-400">Status</TableCell>
                <TableCell isHeader className="py-3.5 px-6 text-xs font-semibold text-gray-500 dark:text-gray-400 text-right">Actions</TableCell>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.04]">
              {filtered.length > 0 ? filtered.map((batch) => (
                <TableRow key={batch.id} className="hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition-colors">
                  <TableCell className="py-3.5 px-6">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center font-bold text-xs border border-brand-500/20 shrink-0 shadow-2xs">
                        <BoxCubeIcon className="w-4 h-4" />
                      </div>
                      <div className="flex flex-col">
                        <p className="text-xs font-bold font-mono text-gray-900 dark:text-white">{batch.batchNumber}</p>
                        <p className="text-[10px] text-gray-400 font-mono mt-0.5">{batch.id?.slice(0, 8)}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="py-3.5 px-6">
                    <p className="text-xs font-bold text-gray-900 dark:text-white">{batch.productName}</p>
                    <p className="text-[11px] font-mono text-gray-400">{batch.productSku}</p>
                  </TableCell>
                  <TableCell className="py-3.5 px-6 text-right font-mono text-xs font-bold text-brand-600 dark:text-brand-400">
                    {batch.quantityProduced?.toLocaleString()} <span className="text-[10px] text-gray-400 font-sans">TINS</span>
                  </TableCell>
                  <TableCell className="py-3.5 px-6 text-xs text-gray-500 font-medium">
                    {new Date(batch.productionDate || batch.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="py-3.5 px-6">
                    <Badge size="sm" color={batch.status === "active" ? "success" : "warning"}>{batch.status === "active" ? "Active" : batch.status}</Badge>
                  </TableCell>
                  <TableCell className="py-3.5 px-6 text-right">
                    <Link href={`/production/${batch.id}`} className="text-xs font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400 transition">Details</Link>
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={6} className="py-16 text-center text-xs text-gray-400 italic font-medium">No production runs recorded yet.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
