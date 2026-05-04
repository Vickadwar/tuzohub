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

export default function ProductionBatches() {
  const [searchTerm, setSearchTerm] = useState("");
  const { data: result, isLoading, isError, mutate } = useApi<any>("/product-batches");
  const { data: products } = useApi<any>("/products");
  const { data: campaignRes } = useApi<any>("/campaigns");
  const campaigns = Array.isArray(campaignRes) ? campaignRes : (campaignRes?.data || []);
  
  // Only pending voucher batches can be linked at production time
  const { data: voucherBatchesRes, mutate: mutateVouchers } = useApi<any>("/vouchers/batches");
  const voucherBatchesArray = Array.isArray(voucherBatchesRes) ? voucherBatchesRes : (voucherBatchesRes?.data || []);
  const pendingVoucherBatches: any[] = voucherBatchesArray.filter((b: any) => !b.isActivated && b.metadata?.status === "IN_TRANSIT");

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
    
    // Validation: Total quantity of selected voucher batches must not exceed tins produced
    if (formData.voucherBatchIds.length > 0) {
      const selectedBatches = pendingVoucherBatches.filter(b => formData.voucherBatchIds.includes(b.id));
      const totalVouchersInBatches = selectedBatches.reduce((sum, b) => sum + (b.quantity || 0), 0);
      if (totalVouchersInBatches > qtyProduced) {
        return setError(`Cannot activate ${totalVouchersInBatches} vouchers for only ${qtyProduced} tins produced.`);
      }
    }

    setIsSubmitting(true);
    try {
      // Record the production batch & auto activate links
      await authenticatedFetch("/api/product-batches", {
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

  if (isError) return <div className="p-4 text-sm text-error-600">Failed to load production batches.</div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Production Batches</h1>
          <p className="text-sm text-gray-500 mt-1">Record daily manufacturing runs and match them to voucher card batches</p>
        </div>
        <button
          onClick={() => setShowNewForm(v => !v)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-brand-500 text-white text-sm font-semibold rounded-xl hover:bg-brand-600 transition shadow-md shadow-brand-500/10"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
          Record Production Run
        </button>
      </div>

      {/* Form */}
      {showNewForm && (
        <div className="bg-white dark:bg-white/[0.02] border border-brand-500/20 rounded-2xl p-6 shadow-xl">
          <h2 className="text-base font-bold text-gray-900 dark:text-white mb-1">New Production Run</h2>
          <p className="text-xs text-gray-400 mb-5">
            Record what was produced today. If scratch cards were inserted into these tins, select the voucher batch — this will automatically activate those codes.
          </p>
          {error && <p className="text-xs font-medium text-error-600 bg-error-50 rounded-lg px-3 py-2 mb-4">{error}</p>}
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Product */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Paint Product</label>
              <ModernSelect
                options={products?.map((p: any) => ({ value: p.id, label: `${p.name}` })) || []}
                value={formData.productId}
                onChange={(val) => setFormData(f => ({ ...f, productId: val }))}
                placeholder="e.g. Silk 4 Litres"
              />
            </div>

            {/* Campaign Options */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Campaign Link (Optional)</label>
              <ModernSelect
                options={campaigns?.map((c: any) => ({ value: c.id, label: `${c.name} (x${parseFloat(c.pointsMultiplier || "1.0").toFixed(1)})` })) || []}
                value={formData.campaignId}
                onChange={(val) => setFormData(f => ({ ...f, campaignId: val }))}
                placeholder="Select a Campaign"
              />
              <p className="text-[10px] text-gray-400">Consumers will earn multiplier points if redeemed while active</p>
            </div>

            {/* Production Batch Number */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Production Batch No.</label>
              <input
                type="text"
                value={formData.batchNumber}
                onChange={(e) => setFormData(f => ({ ...f, batchNumber: e.target.value }))}
                placeholder="e.g. B2026-SILK-001"
                className="w-full h-10 px-3 rounded-xl border border-gray-200 dark:border-white/[0.1] bg-transparent text-sm font-mono uppercase focus:border-brand-400 focus:outline-none"
              />
              <p className="text-[10px] text-gray-400">Printed on the tin label for traceability</p>
            </div>

            {/* Quantity */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Tins Produced</label>
              <input
                type="number"
                min="1"
                value={formData.quantityProduced}
                onChange={(e) => setFormData(f => ({ ...f, quantityProduced: e.target.value }))}
                placeholder="e.g. 5000"
                className="w-full h-10 px-3 rounded-xl border border-gray-200 dark:border-white/[0.1] bg-transparent text-sm focus:border-brand-400 focus:outline-none"
              />
            </div>

            {/* Voucher Batch Link (Multiple) */}
            <div className="space-y-1.5 md:col-span-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                Voucher Batches Inserted <span className="normal-case text-gray-400 font-normal">(optional)</span>
              </label>
              
              <div className="space-y-2">
                <ModernSelect
                  options={[
                    { value: "", label: "— Add a voucher batch —" },
                    ...pendingVoucherBatches
                      .filter((b: any) => !formData.voucherBatchIds.includes(b.id))
                      .map((b: any) => ({
                        value: b.id,
                        label: `${b.batchNumber}  ·  ${b.quantity} cards  ·  AWAITING ACTIVATION`
                      }))
                  ]}
                  value=""
                  onChange={(val) => {
                    if (val && !formData.voucherBatchIds.includes(val)) {
                      setFormData(f => ({ ...f, voucherBatchIds: [...f.voucherBatchIds, val] }));
                    }
                  }}
                  placeholder="Select voucher batch if cards were inserted"
                />

                {/* Selected Voucher Batches */}
                {formData.voucherBatchIds.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2 border border-gray-100 dark:border-white/[0.05] p-3 rounded-lg bg-gray-50/50 dark:bg-white/[0.02]">
                    {formData.voucherBatchIds.map(id => {
                      const batch = pendingVoucherBatches.find(b => b.id === id);
                      return (
                        <div key={id} className="flex items-center gap-1.5 bg-white dark:bg-[#18181b] border border-brand-500/30 px-3 py-1.5 rounded-md shadow-sm">
                          <span className="text-xs font-semibold text-gray-800 dark:text-gray-200">{batch?.batchNumber || "Unknown Batch"}</span>
                          <span className="text-[10px] text-gray-400 border-l border-gray-200 dark:border-white/10 pl-1.5">{batch?.quantity || "?"} cards</span>
                          <button
                            type="button"
                            onClick={() => setFormData(f => ({ ...f, voucherBatchIds: f.voucherBatchIds.filter(vId => vId !== id) }))}
                            className="ml-1 text-gray-400 hover:text-error-500 transition"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {formData.voucherBatchIds.length > 0 && (
                <p className="text-[10px] text-success-600 font-medium mt-1">
                  ✓ Selected batches will be automatically activated.
                </p>
              )}
              {pendingVoucherBatches.length === 0 && formData.voucherBatchIds.length === 0 && (
                <p className="text-[10px] text-gray-400 mt-1">No pending voucher batches. Generate one in the Voucher Center first.</p>
              )}
            </div>

            {/* Date */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Production Date</label>
              <input
                type="date"
                value={formData.productionDate}
                onChange={(e) => setFormData(f => ({ ...f, productionDate: e.target.value }))}
                className="w-full h-10 px-3 rounded-xl border border-gray-200 dark:border-white/[0.1] bg-transparent text-sm focus:border-brand-400 focus:outline-none"
              />
            </div>

            {/* Actions — full width */}
            <div className="md:col-span-3 flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setShowNewForm(false)} className="h-10 px-5 rounded-xl text-sm font-bold text-gray-500 hover:bg-gray-100 transition">
                Cancel
              </button>
              <button type="submit" disabled={isSubmitting} className="h-10 px-8 bg-brand-500 text-white rounded-xl text-sm font-bold shadow-md transition disabled:opacity-50">
                {isSubmitting ? "Saving..." : formData.voucherBatchIds.length > 0 ? `Save & Activate ${formData.voucherBatchIds.length} Batch(es)` : "Save Production Run"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Table */}
      <div className="bg-white dark:bg-white/[0.02] border border-gray-200/80 dark:border-white/[0.06] rounded-2xl overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-white/[0.05] flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-sm">
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input type="text" placeholder="Search batches..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-10 rounded-xl border border-gray-200 dark:border-white/[0.08] bg-transparent pl-10 pr-4 text-sm focus:border-brand-400 focus:outline-none transition" />
          </div>
          <span className="text-xs text-gray-400 bg-gray-100 dark:bg-white/5 px-2.5 py-1 rounded-full">{filtered.length} runs</span>
        </div>

        {isLoading ? (
          <div className="h-48 flex items-center justify-center"><div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" /></div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50/50 dark:bg-white/[0.01]">
                <TableCell isHeader className="py-4 px-6 text-xs font-semibold text-gray-500">Production batch</TableCell>
                <TableCell isHeader className="py-4 px-6 text-xs font-semibold text-gray-500">Product</TableCell>
                <TableCell isHeader className="py-4 px-6 text-xs font-semibold text-gray-500 text-right">Tins</TableCell>
                <TableCell isHeader className="py-4 px-6 text-xs font-semibold text-gray-500">Date</TableCell>
                <TableCell isHeader className="py-4 px-6 text-xs font-semibold text-gray-500">Status</TableCell>
                <TableCell isHeader className="py-4 px-6 text-xs font-semibold text-gray-500 text-right">Actions</TableCell>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.04]">
              {filtered.length > 0 ? filtered.map((batch) => (
                <TableRow key={batch.id} className="hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition-colors">
                  <TableCell className="py-4 px-6">
                    <p className="text-sm font-bold font-mono text-gray-900 dark:text-white">{batch.batchNumber}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">{batch.id?.slice(0, 8)}</p>
                  </TableCell>
                  <TableCell className="py-4 px-6">
                    <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">{batch.productName}</p>
                    <p className="text-xs text-gray-400">{batch.productSku}</p>
                  </TableCell>
                  <TableCell className="py-4 px-6 text-right font-mono text-sm font-black text-gray-900 dark:text-white">
                    {batch.quantityProduced?.toLocaleString()}
                  </TableCell>
                  <TableCell className="py-4 px-6 text-xs text-gray-500">
                    {new Date(batch.productionDate || batch.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="py-4 px-6">
                    <Badge size="sm" color={batch.status === "active" ? "success" : "warning"}>{batch.status === "active" ? "Active" : batch.status}</Badge>
                  </TableCell>
                  <TableCell className="py-4 px-6 text-right">
                    <Link href={`/production/${batch.id}`} className="text-xs font-medium text-brand-600 hover:text-brand-700 transition">View details</Link>
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={5} className="py-20 text-center text-gray-400 italic text-sm">No production runs recorded yet.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
