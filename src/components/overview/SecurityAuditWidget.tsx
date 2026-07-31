"use client";

import React from "react";
import Link from "next/link";
import Badge from "../ui/badge/Badge";
import { useApi } from "@/hooks/useApi";

const formatActionLabel = (action: string): string => {
  if (!action) return "System Event";
  const map: Record<string, string> = {
    VOUCHER_BATCH_CREATED: "Batch Created",
    VOUCHER_BATCH_STATUS_UPDATED: "Batch Status Transitioned",
    SECRET_MANIFEST_EXPORTED: "Secret CSV Decrypted & Exported",
    PRODUCTION_RUN_CREATED: "Production Run Created",
    VOUCHER_BATCH_ACTIVATED: "Batch Activated",
    USER_LOGIN_SUCCESS: "User Login",
    VOUCHER_RETRY_BLOCKED: "Fraud Retry Blocked",
    MPESA_B2C_PAYOUT_DISPATCHED: "M-Pesa Dispatched",
    FRAUD_ATTEMPT: "Fraud Attempt Blocked",
  };
  if (map[action]) return map[action];
  const cleaned = action.replace(/_/g, " ").toLowerCase();
  return cleaned.charAt(0).toUpperCase() + cleaned.slice(1);
};

export default function SecurityAuditWidget() {
  const { data: response, isLoading } = useApi("/audit-logs?limit=5", {
    refreshInterval: 10000,
  });

  const logs = response?.logs || [];

  return (
    <div className="w-full h-full rounded-2xl border border-gray-200/80 bg-white p-5 shadow-xs dark:border-white/[0.06] dark:bg-white/[0.02] flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-xs">
              🔒
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                Security &amp; Audit Trail
              </h3>
              <p className="text-[10px] text-gray-400">Live operational event log</p>
            </div>
          </div>

          <Link href="/audit-logs" className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline">
            View All →
          </Link>
        </div>

        {isLoading ? (
          <div className="space-y-3 animate-pulse">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-10 rounded-xl bg-gray-100 dark:bg-white/5" />
            ))}
          </div>
        ) : logs.length === 0 ? (
          <div className="py-6 text-center text-xs text-gray-400">
            No security audit events recorded yet.
          </div>
        ) : (
          <div className="space-y-2.5">
            {logs.map((log: any) => (
              <div
                key={log.id}
                className="p-2.5 rounded-xl bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/[0.05] flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                  <div className="truncate">
                    <span className="font-bold text-gray-900 dark:text-white block truncate">
                      {formatActionLabel(log.action)}
                    </span>
                    <span className="text-[10px] text-gray-400 block truncate">
                      By {log.performedByEmail || "System Engine"}
                    </span>
                  </div>
                </div>
                <span className="text-[10px] text-gray-400 font-mono shrink-0 ml-2">
                  {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-gray-100 dark:border-white/[0.05] flex items-center justify-between text-[11px] text-gray-500">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          Audit Protection Active
        </span>
        <span className="font-mono text-gray-400">Immutable Ledger</span>
      </div>
    </div>
  );
}
