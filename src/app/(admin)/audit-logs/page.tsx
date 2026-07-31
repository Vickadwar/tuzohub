"use client";

import React, { useState } from "react";
import Badge from "@/components/ui/badge/Badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useApi } from "@/hooks/useApi";

const ACTION_COLORS: Record<string, any> = {
  VOUCHER_BATCH_CREATED: "light",
  VOUCHER_BATCH_STATUS_UPDATED: "purple",
  SECRET_MANIFEST_EXPORTED: "warning",
  PRODUCTION_RUN_CREATED: "info",
  VOUCHER_BATCH_ACTIVATED: "success",
  VOUCHER_BATCH_REBOUND: "info",
  USER_LOGIN_SUCCESS: "info",
  VOUCHER_RETRY_BLOCKED: "error",
  MPESA_B2C_PAYOUT_DISPATCHED: "success",
  CONSUMER_FLAGGED: "warning",
};

const formatActionLabel = (action: string): string => {
  if (!action) return "";
  const map: Record<string, string> = {
    VOUCHER_BATCH_CREATED: "Batch Created",
    VOUCHER_BATCH_STATUS_UPDATED: "Batch Status Transitioned",
    SECRET_MANIFEST_EXPORTED: "Secret CSV Decrypted & Exported",
    PRODUCTION_RUN_CREATED: "Production Run Created",
    VOUCHER_BATCH_ACTIVATED: "Batch Activated in Factory",
    VOUCHER_BATCH_REBOUND: "Batch Product/Campaign Re-bound",
    USER_LOGIN_SUCCESS: "Admin Login Authenticated",
    VOUCHER_RETRY_BLOCKED: "Voucher Retry Blocked (Security Limit)",
    MPESA_B2C_PAYOUT_DISPATCHED: "M-Pesa B2C Cash Payout Dispatched",
    CONSUMER_FLAGGED: "Consumer Fraud Risk Flagged",
    FRAUD_ATTEMPT: "Fraud Attempt Blocked",
  };
  if (map[action.toUpperCase()]) return map[action.toUpperCase()];
  const cleaned = action.replace(/_/g, " ").toLowerCase();
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
};

export default function AuditLogsPage() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [actionFilter, setActionFilter] = useState("");
  const [entityFilter, setEntityFilter] = useState("");

  const [selectedPayload, setSelectedPayload] = useState<{
    isOpen: boolean;
    log?: any;
  }>({ isOpen: false });

  const queryParams = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });
  if (actionFilter) queryParams.set("action", actionFilter);
  if (entityFilter) queryParams.set("entityType", entityFilter);

  const { data: res, isLoading, isError } = useApi<any>(`/audit-logs?${queryParams.toString()}`);

  const logs: any[] = res?.data || [];
  const pagination = res?.pagination;

  return (
    <div className="w-full space-y-6 animate-fadeIn pb-12">
      {/* ── JSON Payload Inspection Modal ───────────────────────────────── */}
      {selectedPayload.isOpen && selectedPayload.log && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-fadeIn">
          <div className="w-full max-w-2xl bg-white dark:bg-[#18181b] border border-gray-200 dark:border-white/10 rounded-2xl p-6 shadow-2xl space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-white/5 pb-4">
              <div>
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                  Audit Event Payload Inspector
                </h3>
                <p className="text-xs text-gray-400 mt-0.5 font-mono">
                  Event ID: {selectedPayload.log.id}
                </p>
              </div>
              <button
                onClick={() => setSelectedPayload({ isOpen: false })}
                className="p-1.5 text-gray-400 hover:text-gray-900 dark:hover:text-white transition"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 pr-1">
              <div className="grid grid-cols-2 gap-4 bg-gray-50 dark:bg-white/[0.02] p-3 rounded-xl border border-gray-100 dark:border-white/5 text-xs">
                <div>
                  <span className="text-gray-400">Action:</span>{" "}
                  <strong className="text-gray-900 dark:text-white">{selectedPayload.log.action}</strong>
                </div>
                <div>
                  <span className="text-gray-400">Entity:</span>{" "}
                  <strong className="text-gray-900 dark:text-white">{selectedPayload.log.entityType || "N/A"}</strong>
                </div>
                <div>
                  <span className="text-gray-400">User:</span>{" "}
                  <strong className="text-gray-900 dark:text-white">{selectedPayload.log.userEmail || "System Admin"}</strong>
                </div>
                <div>
                  <span className="text-gray-400">IP Address:</span>{" "}
                  <strong className="font-mono text-gray-900 dark:text-white">{selectedPayload.log.ipAddress}</strong>
                </div>
              </div>

              {selectedPayload.log.newData && (
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300">New Data Payload (JSON)</label>
                  <pre className="p-4 bg-gray-900 text-emerald-400 font-mono text-xs rounded-xl overflow-x-auto border border-gray-800">
                    {JSON.stringify(selectedPayload.log.newData, null, 2)}
                  </pre>
                </div>
              )}

              {selectedPayload.log.oldData && (
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300">Previous Data Payload (JSON)</label>
                  <pre className="p-4 bg-gray-900 text-amber-400 font-mono text-xs rounded-xl overflow-x-auto border border-gray-800">
                    {JSON.stringify(selectedPayload.log.oldData, null, 2)}
                  </pre>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-gray-100 dark:border-white/5 flex justify-end">
              <button
                onClick={() => setSelectedPayload({ isOpen: false })}
                className="px-4 py-2 text-xs font-semibold bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 transition"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Page Header ────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-200/80 dark:border-white/[0.06] pb-5">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
              System Audit &amp; Security Logs
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
              Immutable Audit Trail
            </span>
          </div>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Audit-grade security records for voucher generation, secret manifest decryptions, and factory production activations.
          </p>
        </div>
      </div>

      {/* ── Filter Controls ────────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white dark:bg-white/[0.02] border border-gray-200/80 dark:border-white/[0.06] p-4 rounded-2xl shadow-sm">
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2">
            <label className="text-xs text-gray-500 font-semibold">Filter Action:</label>
            <select
              value={actionFilter}
              onChange={(e) => {
                setActionFilter(e.target.value);
                setPage(1);
              }}
              className="px-3 py-1.5 bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-white/10 rounded-xl text-xs font-semibold text-gray-900 dark:text-white focus:outline-none"
            >
              <option value="">All Actions</option>
              <option value="USER_LOGIN_SUCCESS">Admin Login Authenticated</option>
              <option value="VOUCHER_BATCH_CREATED">Batch Created</option>
              <option value="VOUCHER_BATCH_STATUS_UPDATED">Batch Status Transition</option>
              <option value="SECRET_MANIFEST_EXPORTED">Secret Manifest Exported</option>
              <option value="PRODUCTION_RUN_CREATED">Production Run Created</option>
              <option value="VOUCHER_BATCH_ACTIVATED">Batch Activated</option>
              <option value="VOUCHER_RETRY_BLOCKED">Voucher Retry Blocked</option>
              <option value="MPESA_B2C_PAYOUT_DISPATCHED">M-Pesa Cash Payout</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-xs text-gray-500 font-semibold">Entity Type:</label>
            <select
              value={entityFilter}
              onChange={(e) => {
                setEntityFilter(e.target.value);
                setPage(1);
              }}
              className="px-3 py-1.5 bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-white/10 rounded-xl text-xs font-semibold text-gray-900 dark:text-white focus:outline-none"
            >
              <option value="">All Entities</option>
              <option value="voucher_batch">Voucher Batch</option>
              <option value="product_batch">Product Batch</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <label className="text-xs text-gray-500">Rows per page:</label>
          <select
            value={limit}
            onChange={(e) => {
              setLimit(parseInt(e.target.value));
              setPage(1);
            }}
            className="px-2.5 py-1.5 bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-white/10 rounded-xl text-xs font-semibold text-gray-900 dark:text-white focus:outline-none"
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>
      </div>

      {/* ── Audit Logs Table ─────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-white/[0.02] border border-gray-200/80 dark:border-white/[0.06] rounded-2xl overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="flex h-48 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-500 border-t-transparent"></div>
          </div>
        ) : isError ? (
          <div className="p-8 text-center text-xs text-rose-500 font-semibold">
            Failed to load security audit logs.
          </div>
        ) : (
          <Table className="w-full">
            <TableHeader>
              <TableRow className="bg-gray-50/50 dark:bg-white/[0.01]">
                <TableCell isHeader className="py-3.5 px-6 text-xs font-semibold text-gray-500 dark:text-gray-400">Timestamp</TableCell>
                <TableCell isHeader className="py-3.5 px-6 text-xs font-semibold text-gray-500 dark:text-gray-400">Action Event</TableCell>
                <TableCell isHeader className="py-3.5 px-6 text-xs font-semibold text-gray-500 dark:text-gray-400">Performer / User</TableCell>
                <TableCell isHeader className="py-3.5 px-6 text-xs font-semibold text-gray-500 dark:text-gray-400">IP Address</TableCell>
                <TableCell isHeader className="py-3.5 px-6 text-xs font-semibold text-gray-500 dark:text-gray-400 text-right">Payload</TableCell>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.04]">
              {logs.length > 0 ? (
                logs.map((log) => (
                  <TableRow key={log.id} className="hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition-colors">
                    <TableCell className="py-3.5 px-6 text-xs font-mono text-gray-500 dark:text-gray-400">
                      {new Date(log.createdAt).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "medium" })}
                    </TableCell>

                    <TableCell className="py-3.5 px-6">
                      <Badge size="sm" color={ACTION_COLORS[log.action] || "light"}>
                        {formatActionLabel(log.action)}
                      </Badge>
                    </TableCell>

                    <TableCell className="py-3.5 px-6">
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-gray-900 dark:text-white">
                          {log.userFirstName ? `${log.userFirstName} ${log.userLastName}` : "System Admin"}
                        </span>
                        <span className="text-[11px] text-gray-400">{log.userEmail || "system@tuzohub.internal"}</span>
                      </div>
                    </TableCell>

                    <TableCell className="py-3.5 px-6 text-xs font-mono text-gray-500 dark:text-gray-400">
                      {log.ipAddress}
                    </TableCell>

                    <TableCell className="py-3.5 px-6 text-right">
                      <button
                        onClick={() => setSelectedPayload({ isOpen: true, log })}
                        className="px-2.5 py-1 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300 text-xs font-semibold rounded-lg transition"
                      >
                        Inspect Payload JSON &rarr;
                      </button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="py-16 text-center text-xs text-gray-400 italic font-medium">
                    No audit records logged matching criteria.
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
            Showing {(page - 1) * limit + 1} – {Math.min(page * limit, pagination.total)} of {pagination.total.toLocaleString()} log entries
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
