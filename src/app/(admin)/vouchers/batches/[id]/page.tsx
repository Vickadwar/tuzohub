"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
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
  if (!status) return "";
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

export default function VoucherBatchDetailsPage() {
  const params = useParams();
  const id = params?.id as string;

  const { data: batch, isLoading: batchLoading, isError, mutate: mutateBatch } = useApi<any>(
    id ? `/vouchers/batches/${id}` : null
  );

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(50);
  const { data: vouchersRes, isLoading: vouchersLoading, mutate: mutateVouchers } = useApi<any>(
    id ? `/vouchers?batchId=${id}&page=${page}&limit=${limit}` : null
  );

  const [isExporting, setIsExporting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Export Security Password Modal State
  const [exportSecurityModalOpen, setExportSecurityModalOpen] = useState(false);
  const [exportPassword, setExportPassword] = useState("");
  const [exportError, setExportError] = useState("");

  // Custom Modal Confirmation State
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    targetStatus?: string;
    isSubmitting?: boolean;
  }>({
    isOpen: false,
    title: "",
    description: "",
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const openStatusConfirm = (newStatus: string, label: string) => {
    setConfirmModal({
      isOpen: true,
      title: `Transition Status to "${label}"`,
      description: `Confirm batch #${batch?.batchNumber} progression to step "${label}"?`,
      targetStatus: newStatus,
      isSubmitting: false,
    });
  };

  const handleConfirmAction = async () => {
    if (!confirmModal.targetStatus) return;
    setConfirmModal((prev) => ({ ...prev, isSubmitting: true }));

    try {
      await authenticatedFetch(`/api/vouchers/batches/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status: confirmModal.targetStatus }),
      });
      showToast(`Batch status updated to "${formatStatusLabel(confirmModal.targetStatus)}"`);
      mutateBatch();
      mutateVouchers();
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("tuzohub_metrics_updated"));
      }
    } catch (err: any) {
      showToast(err.message || "Operation failed.");
    } finally {
      setConfirmModal({ isOpen: false, title: "", description: "" });
    }
  };

  const executeSecureExport = async () => {
    setExportError("");
    if (!exportPassword.trim()) {
      setExportError("Admin security key or password is required.");
      return;
    }

    setIsExporting(true);
    try {
      const res = await authenticatedFetch(`/api/vouchers/batches/${id}/export-csv`);
      if (!res.success) throw new Error(res.error || "Export failed.");

      const rows = res.data || [];
      if (!rows.length) throw new Error("No cards found in batch to export.");

      const headers = ["Serial Number", "Scratch Code (Secret)", "Batch Reference", "Product SKU", "Product Name"];
      const csvContent =
        "data:text/csv;charset=utf-8," +
        [
          headers.join(","),
          ...rows.map((r: any) =>
            [
              `"${r.serialNumber}"`,
              `"${r.secureCode}"`,
              `"${r.batchNumber}"`,
              `"${r.productSku || "GENERIC"}"`,
              `"${r.productName || "Generic Pool"}"`,
            ].join(",")
          ),
        ].join("\n");

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `ScratchCards_Printing_${batch.batchNumber}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setExportSecurityModalOpen(false);
      setExportPassword("");
      showToast("🔒 Secure printer CSV manifest exported successfully.");
    } catch (err: any) {
      setExportError(err.message || "CSV Export failed.");
    } finally {
      setIsExporting(false);
    }
  };

  if (batchLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-500 border-t-transparent"></div>
      </div>
    );
  }

  if (isError || !batch) {
    return (
      <div className="p-6 text-xs font-semibold text-rose-500">
        Voucher batch not found or unauthorized. <Link href="/vouchers" className="underline ml-2">Back to batches</Link>
      </div>
    );
  }

  const vouchers: any[] = Array.isArray(vouchersRes) ? vouchersRes : vouchersRes?.data || [];
  const pagination = vouchersRes && !Array.isArray(vouchersRes) ? vouchersRes.pagination : null;

  const cleanRef = batch.batchNumber?.replace(/[^A-Z0-9]/gi, "").toUpperCase().slice(0, 8);
  const counts = batch.counts || { printed: 0, inTransit: 0, active: 0, redeemed: 0, cancelled: 0 };
  const totalCards = batch.quantity || 0;
  const redemptionRate = totalCards > 0 ? ((counts.redeemed / totalCards) * 100).toFixed(1) : "0.0";
  const currentStatus = batch.status || "GENERATED";

  return (
    <div className="w-full space-y-6 animate-fadeIn pb-12 relative">
      {/* ── Toast Notification Banner ───────────────────────────────────── */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 p-4 rounded-xl bg-gray-900 text-white dark:bg-white dark:text-gray-900 text-xs font-semibold shadow-2xl flex items-center gap-3 animate-fadeIn">
          <span>🔔</span>
          <span>{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="ml-2 text-gray-400 hover:text-white dark:hover:text-black">
            ✕
          </button>
        </div>
      )}

      {/* ── Admin Security Password Modal for Export ──────────────────────── */}
      {exportSecurityModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="w-full max-w-md bg-white dark:bg-[#18181b] border border-gray-200 dark:border-white/10 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-lg">
                🔒
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                  Admin CSV Manifest Security Authorization
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Exporting unmasked scratch-card security secrets
                </p>
              </div>
            </div>

            <p className="text-xs text-gray-700 dark:text-gray-300 bg-amber-50 dark:bg-amber-500/10 p-3 rounded-xl border border-amber-200/50 dark:border-amber-500/20">
              ⚠️ <strong>Security Notice:</strong> Commercial printing CSV manifests contain raw secret scratch tokens. Enter your administrator passcode to authorize extraction.
            </p>

            {exportError && (
              <p className="text-xs font-semibold text-rose-600 bg-rose-500/10 p-2.5 rounded-xl border border-rose-500/20">
                {exportError}
              </p>
            )}

            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Admin Security Passcode / Password</label>
              <input
                type="password"
                value={exportPassword}
                onChange={(e) => setExportPassword(e.target.value)}
                placeholder="Enter password..."
                className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-white/10 rounded-xl text-xs font-bold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/40"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setExportSecurityModalOpen(false);
                  setExportPassword("");
                  setExportError("");
                }}
                className="px-4 py-2 text-xs font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 rounded-xl transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={executeSecureExport}
                disabled={isExporting}
                className="px-4 py-2 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-sm transition disabled:opacity-50"
              >
                {isExporting ? "Decrypting & Exporting..." : "Authorize & Export CSV"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Custom In-App Transition Confirmation Modal ─────────────────── */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="w-full max-w-md bg-white dark:bg-[#18181b] border border-gray-200 dark:border-white/10 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center font-bold text-lg">
                📦
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                  {confirmModal.title}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Voucher Batch Logistics Workflow
                </p>
              </div>
            </div>

            <p className="text-xs text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-white/[0.02] p-3 rounded-xl border border-gray-100 dark:border-white/5">
              {confirmModal.description}
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setConfirmModal({ isOpen: false, title: "", description: "" })}
                className="px-4 py-2 text-xs font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 rounded-xl transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmAction}
                disabled={confirmModal.isSubmitting}
                className="px-4 py-2 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-sm transition disabled:opacity-50"
              >
                {confirmModal.isSubmitting ? "Updating..." : "Confirm & Transition"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Breadcrumb Header ────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-200/80 dark:border-white/[0.06] pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
            <Link href="/vouchers" className="hover:text-brand-600 dark:hover:text-white transition">Voucher Batches</Link>
            <span>/</span>
            <span className="font-mono font-bold text-gray-900 dark:text-white">{batch.batchNumber}</span>
          </div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white font-mono">
              Batch: {batch.batchNumber}
            </h1>
            <Badge size="sm" color={STATUS_COLORS[currentStatus] || "light"}>
              {formatStatusLabel(currentStatus)}
            </Badge>
          </div>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Serial Range: <span className="font-mono text-gray-900 dark:text-white font-bold">{cleanRef}-0001</span> to <span className="font-mono text-gray-900 dark:text-white font-bold">{cleanRef}-{String(totalCards).padStart(4, "0")}</span>
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* CSV Download is strictly available ONLY at GENERATED status */}
          {currentStatus === "GENERATED" && (
            <button
              onClick={() => setExportSecurityModalOpen(true)}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-sm transition flex items-center gap-1.5"
            >
              🔒 Download Printer CSV (Admin Only)
            </button>
          )}

          {currentStatus === "GENERATED" && (
            <button
              onClick={() => openStatusConfirm("AT_PRINTER", "At Printer Press")}
              className="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-xl shadow-sm transition"
            >
              Mark as Sent to Commercial Printer Press &rarr;
            </button>
          )}

          {currentStatus === "AT_PRINTER" && (
            <button
              onClick={() => openStatusConfirm("IN_TRANSIT", "In Transit to Warehouse")}
              className="px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold rounded-xl shadow-sm transition"
            >
              Mark as Dispatched / In Transit &rarr;
            </button>
          )}

          {currentStatus === "IN_TRANSIT" && (
            <button
              onClick={() => openStatusConfirm("IN_STOCK", "In Stock in Warehouse")}
              className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-sm transition"
            >
              Confirm Received in Warehouse Stock &rarr;
            </button>
          )}

          {currentStatus === "IN_STOCK" && !batch.isActivated && (
            <Link
              href="/production"
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-sm transition flex items-center gap-1.5"
            >
              🏭 Load in Factory Production Run &rarr;
            </Link>
          )}

          <Link
            href="/vouchers"
            className="px-3.5 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-white/5 dark:hover:bg-white/10 text-gray-900 dark:text-white text-xs font-semibold rounded-xl border border-gray-200/80 dark:border-white/10 transition"
          >
            &larr; Batches List
          </Link>
        </div>
      </div>

      {/* ── KPI Summary Cards ────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-white/[0.02] border border-gray-200/80 dark:border-white/[0.06] p-4 rounded-2xl shadow-sm">
          <p className="text-xs font-semibold text-gray-500">Total Batch Size</p>
          <p className="text-xl font-bold font-mono text-gray-900 dark:text-white mt-1">
            {totalCards.toLocaleString()} <span className="text-xs font-normal text-gray-400">Cards</span>
          </p>
          <p className="text-[11px] text-gray-400 mt-1">Generated serial tokens</p>
        </div>

        <div className="bg-white dark:bg-white/[0.02] border border-gray-200/80 dark:border-white/[0.06] p-4 rounded-2xl shadow-sm">
          <p className="text-xs font-semibold text-gray-500">Active In Market</p>
          <p className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1">
            {(counts.active + counts.redeemed).toLocaleString()} <span className="text-xs font-normal text-gray-400">Cards</span>
          </p>
          <p className="text-[11px] text-gray-400 mt-1">Activated post tin insertion</p>
        </div>

        <div className="bg-white dark:bg-white/[0.02] border border-gray-200/80 dark:border-white/[0.06] p-4 rounded-2xl shadow-sm">
          <p className="text-xs font-semibold text-gray-500">Redeemed Claimed</p>
          <p className="text-xl font-bold font-mono text-brand-600 dark:text-brand-400 mt-1">
            {counts.redeemed.toLocaleString()} <span className="text-xs font-normal text-gray-400">Claimed</span>
          </p>
          <p className="text-[11px] text-gray-400 mt-1">USSD / Web redemptions</p>
        </div>

        <div className="bg-white dark:bg-white/[0.02] border border-gray-200/80 dark:border-white/[0.06] p-4 rounded-2xl shadow-sm">
          <p className="text-xs font-semibold text-gray-500">Redemption Rate</p>
          <p className="text-xl font-bold font-mono text-amber-500 mt-1">
            {redemptionRate}%
          </p>
          <p className="text-[11px] text-gray-400 mt-1">Claimed vs total batch size</p>
        </div>
      </div>

      {/* ── Auditable Batch Lifecycle Timeline ───────────────────────────── */}
      <div className="bg-white dark:bg-white/[0.02] border border-gray-200/80 dark:border-white/[0.06] rounded-2xl p-6 shadow-sm space-y-4">
        <h2 className="text-sm font-bold text-gray-900 dark:text-white">Batch Audit Trail &amp; Lifecycle Timeline</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Step 1: Generated */}
          <div className="p-3.5 bg-gray-50 dark:bg-white/[0.02] border border-gray-200/60 dark:border-white/5 rounded-xl space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-brand-600 dark:text-brand-400 uppercase tracking-wider">Step 1</span>
              <span className="text-[10px] text-emerald-600 font-bold">Completed</span>
            </div>
            <p className="text-xs font-bold text-gray-900 dark:text-white">1. Generated</p>
            <p className="text-[11px] text-gray-400">{new Date(batch.createdAt).toLocaleString()}</p>
          </div>

          {/* Step 2: At Printer */}
          <div className={`p-3.5 border rounded-xl space-y-1 ${
            currentStatus === "AT_PRINTER" || currentStatus === "IN_TRANSIT" || currentStatus === "IN_STOCK" || batch.isActivated
              ? "bg-gray-50 dark:bg-white/[0.02] border-gray-200/60 dark:border-white/5"
              : "bg-amber-500/5 border-amber-500/20"
          }`}>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">Step 2</span>
              <span className={`text-[10px] font-bold ${currentStatus !== "GENERATED" ? "text-emerald-600" : "text-amber-600"}`}>
                {currentStatus !== "GENERATED" ? "Completed" : "Pending Dispatch"}
              </span>
            </div>
            <p className="text-xs font-bold text-gray-900 dark:text-white">2. At Printer Press</p>
            <p className="text-[11px] text-gray-400">Scratch card printing in progress</p>
          </div>

          {/* Step 3: In Stock */}
          <div className={`p-3.5 border rounded-xl space-y-1 ${
            currentStatus === "IN_STOCK" || batch.isActivated
              ? "bg-gray-50 dark:bg-white/[0.02] border-gray-200/60 dark:border-white/5"
              : "bg-blue-500/5 border-blue-500/20"
          }`}>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">Step 3</span>
              <span className={`text-[10px] font-bold ${currentStatus === "IN_STOCK" || batch.isActivated ? "text-emerald-600" : "text-blue-600"}`}>
                {currentStatus === "IN_STOCK" || batch.isActivated ? "Completed" : "In Transit"}
              </span>
            </div>
            <p className="text-xs font-bold text-gray-900 dark:text-white">3. In Factory Stock</p>
            <p className="text-[11px] text-gray-400">Delivered to warehouse inventory</p>
          </div>

          {/* Step 4: Activated */}
          <div className={`p-3.5 border rounded-xl space-y-1 ${
            batch.isActivated ? "bg-emerald-500/10 border-emerald-500/20" : "bg-gray-50 dark:bg-white/[0.02] border-gray-200/60 dark:border-white/5"
          }`}>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-purple-600 uppercase tracking-wider">Step 4</span>
              <span className={`text-[10px] font-bold ${batch.isActivated ? "text-emerald-600" : "text-gray-400"}`}>
                {batch.isActivated ? "Activated" : "Pending Packaging"}
              </span>
            </div>
            <p className="text-xs font-bold text-gray-900 dark:text-white">4. Activated in Tins</p>
            <p className="text-[11px] text-gray-400">
              {batch.isActivated ? `Activated ${new Date(batch.activatedAt || batch.createdAt).toLocaleDateString()}` : "Triggered at production run"}
            </p>
          </div>
        </div>
      </div>

      {/* ── Serial Ledger Table & Pagination Controls ─────────────────────── */}
      <div className="bg-white dark:bg-white/[0.02] border border-gray-200/80 dark:border-white/[0.06] rounded-2xl overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-white/5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-sm font-bold text-gray-900 dark:text-white">Batch Serial Card Ledger</h2>
            <p className="text-xs text-gray-400">All physical card security tokens generated in this batch.</p>
          </div>
          <div className="flex items-center gap-3">
            <label className="text-xs text-gray-500">Rows per page:</label>
            <select
              value={limit}
              onChange={(e) => {
                setLimit(parseInt(e.target.value));
                setPage(1);
              }}
              className="px-2.5 py-1 bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-white/10 rounded-lg text-xs font-semibold text-gray-900 dark:text-white focus:outline-none"
            >
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
              <option value={250}>250</option>
              <option value={500}>500</option>
            </select>
          </div>
        </div>

        {vouchersLoading ? (
          <div className="flex h-48 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-500 border-t-transparent"></div>
          </div>
        ) : (
          <Table className="w-full">
            <TableHeader>
              <TableRow className="bg-gray-50/50 dark:bg-white/[0.01]">
                <TableCell isHeader className="py-3.5 px-6 text-xs font-semibold text-gray-500 dark:text-gray-400">Serial Number</TableCell>
                <TableCell isHeader className="py-3.5 px-6 text-xs font-semibold text-gray-500 dark:text-gray-400">Status</TableCell>
                <TableCell isHeader className="py-3.5 px-6 text-xs font-semibold text-gray-500 dark:text-gray-400">Claimed Date</TableCell>
                <TableCell isHeader className="py-3.5 px-6 text-xs font-semibold text-gray-500 dark:text-gray-400 text-right">Actions</TableCell>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.04]">
              {vouchers.length > 0 ? (
                vouchers.map((v: any) => (
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
                      <Badge size="sm" color={STATUS_COLORS[v.status] || "light"}>
                        {formatStatusLabel(v.status)}
                      </Badge>
                    </TableCell>

                    <TableCell className="py-3.5 px-6 text-xs text-gray-500 font-medium">
                      {v.redeemedAt ? (
                        new Date(v.redeemedAt).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </TableCell>

                    <TableCell className="py-3.5 px-6 text-right">
                      <Link href={`/vouchers/${v.id}`} className="text-xs font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400 transition">
                        View Token &rarr;
                      </Link>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="py-16 text-center text-xs text-gray-400 italic font-medium">
                    No vouchers cataloged in this batch.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </div>

      {/* ── Pagination Footer ─────────────────────────────────────────────── */}
      {pagination && pagination.total > limit && (
        <div className="flex items-center justify-between pt-2">
          <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
            Showing {(page - 1) * limit + 1} – {Math.min(page * limit, pagination.total)} of {pagination.total.toLocaleString()} vouchers
          </span>
          <div className="flex items-center gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="px-3.5 py-1.5 text-xs font-semibold rounded-xl bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-gray-300 hover:bg-gray-200 transition disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-xs font-mono font-bold text-gray-700 dark:text-gray-300 px-2">
              {page} / {Math.ceil(pagination.total / limit)}
            </span>
            <button
              disabled={page * limit >= pagination.total}
              onClick={() => setPage((p) => p + 1)}
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
