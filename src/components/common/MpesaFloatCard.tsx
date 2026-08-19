"use client";

import React, { useState } from "react";
import { useApi, authenticatedFetch } from "@/hooks/useApi";

interface MpesaFloatCardProps {
  tenantId?: string;
  className?: string;
}

export function MpesaFloatCard({ tenantId, className = "" }: MpesaFloatCardProps) {
  const endpoint = tenantId ? `/mpesa/balance?tenantId=${tenantId}` : "/mpesa/balance";
  const { data, isLoading, mutate } = useApi<any>(endpoint);
  
  const [isQuerying, setIsQuerying] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  const floatData = data?.data || data || {};
  const isConfigured = floatData.isConfigured !== false;
  const shortCode = floatData.shortCode || "Not Configured";
  
  const utilityBalance = floatData.utility || (isConfigured ? "Pending Query" : "Unconfigured");
  const workingBalance = floatData.working || (isConfigured ? "Pending Query" : "Unconfigured");
  const chargeBalance = floatData.charge || (isConfigured ? "Pending Query" : "Unconfigured");
  
  const lastCheckedAt = floatData.lastCheckedAt
    ? new Date(floatData.lastCheckedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : "Not Synced Yet";

  const handleQueryBalance = async () => {
    setIsQuerying(true);
    setStatusMsg("Submitting balance query to Safaricom Daraja API...");
    try {
      const url = tenantId ? `/api/mpesa/balance/query?tenantId=${tenantId}` : "/api/mpesa/balance/query";
      await authenticatedFetch(url, { method: "POST" });
      setStatusMsg("Query accepted by Safaricom! Waiting for M-Pesa core callback (typically 5–15 seconds)...");
      
      // Auto-poll every 3 seconds for up to 15 seconds to catch Safaricom's webhook callback
      let attempts = 0;
      const interval = setInterval(async () => {
        attempts++;
        const refreshed = await mutate();
        const data = refreshed?.data || refreshed || {};
        if (data.utility && !data.utility.includes("Pending")) {
          clearInterval(interval);
          setStatusMsg("Float metrics synced successfully from Safaricom!");
          setTimeout(() => setStatusMsg(null), 4000);
        } else if (attempts >= 5) {
          clearInterval(interval);
          setStatusMsg(null);
        }
      }, 3000);
    } catch (err: any) {
      setStatusMsg(`Error: ${err.message || "Network error querying Safaricom"}`);
    } finally {
      setIsQuerying(false);
    }
  };

  return (
    <div className={`relative overflow-hidden rounded-2xl bg-slate-900 text-white p-6 shadow-xl border border-gray-800 ${className}`}>
      {/* Background Decorative Glow */}
      <div className="absolute -right-12 -top-12 w-48 h-48 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -left-12 -bottom-12 w-48 h-48 bg-brand-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-800 pb-4 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-500/20 text-brand-400 border border-brand-500/30 flex items-center justify-center font-bold text-sm shadow-inner">
            M
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white tracking-tight">Safaricom M-Pesa B2C Float Vault</h3>
              <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                isConfigured 
                  ? "bg-brand-500/10 text-brand-400 border-brand-500/20"
                  : "bg-amber-500/10 text-amber-400 border-amber-500/20"
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${isConfigured ? "bg-brand-400 animate-ping" : "bg-amber-400"}`} />
                {isConfigured ? `DARAJA B2C (${floatData.environment || "ACTIVE"})` : "CREDENTIALS PENDING"}
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-0.5">Real-time mobile money liquidity &amp; payout float meters</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleQueryBalance}
            disabled={isQuerying || isLoading}
            className="px-3.5 py-2 bg-brand-500 hover:bg-brand-600 active:scale-95 text-white text-xs font-bold rounded-xl transition shadow-lg shadow-brand-500/20 flex items-center gap-2 disabled:opacity-50"
          >
            <svg
              className={`w-3.5 h-3.5 ${isQuerying ? "animate-spin" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth={2.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
            </svg>
            {isQuerying ? "Querying Daraja..." : "Sync Float Balance"}
          </button>
        </div>
      </div>

      {/* Balances Display Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 pt-5 relative z-10">
        {/* Metric 1: Utility Account */}
        <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5 space-y-1">
          <div className="flex items-center justify-between text-[11px] font-semibold text-brand-300 uppercase tracking-wider">
            <span>Utility Account</span>
            <span className="px-1.5 py-0.5 rounded bg-brand-500/20 text-brand-300 text-[9px] font-mono">B2C PAYOUTS</span>
          </div>
          <div className="flex items-baseline gap-1 pt-1">
            <span className="text-2xl font-black text-white tracking-tight">
              {utilityBalance.includes("KES") || utilityBalance.includes("Pending") || utilityBalance.includes("Unconfigured")
                ? utilityBalance 
                : `${utilityBalance} KES`}
            </span>
          </div>
          <p className="text-[10px] text-gray-400">Available float for automated B2C payouts</p>
        </div>

        {/* Metric 2: Working Account */}
        <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5 space-y-1">
          <div className="flex items-center justify-between text-[11px] font-semibold text-gray-300 uppercase tracking-wider">
            <span>Working Account</span>
            <span className="px-1.5 py-0.5 rounded bg-gray-500/20 text-gray-300 text-[9px] font-mono">RESERVE</span>
          </div>
          <div className="flex items-baseline gap-1 pt-1">
            <span className="text-xl font-extrabold text-gray-100 tracking-tight">
              {workingBalance.includes("KES") || workingBalance.includes("Pending") || workingBalance.includes("Unconfigured")
                ? workingBalance 
                : `${workingBalance} KES`}
            </span>
          </div>
          <p className="text-[10px] text-gray-400">Corporate treasury reserve balance</p>
        </div>

        {/* Metric 3: Charges Account */}
        <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5 space-y-1">
          <div className="flex items-center justify-between text-[11px] font-semibold text-gray-300 uppercase tracking-wider">
            <span>Charges Account</span>
            <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[9px] font-mono">TARIFFS</span>
          </div>
          <div className="flex items-baseline gap-1 pt-1">
            <span className="text-xl font-extrabold text-gray-100 tracking-tight">
              {chargeBalance.includes("KES") || chargeBalance.includes("Pending") || chargeBalance.includes("Unconfigured")
                ? chargeBalance 
                : `${chargeBalance} KES`}
            </span>
          </div>
          <p className="text-[10px] text-gray-400">Tariff and Safaricom service fee allocation</p>
        </div>
      </div>

      {/* Footer Meta info */}
      {statusMsg ? (
        <div className="mt-4 p-2.5 rounded-xl bg-brand-500/10 border border-brand-500/20 text-xs font-semibold text-brand-300 text-center animate-fadeIn">
          {statusMsg}
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mt-4 text-[11px] text-gray-400 border-t border-gray-800 pt-3">
          <div className="flex items-center gap-2">
            <span>Paybill/Shortcode: <code className="text-brand-400 font-mono font-bold">{shortCode}</code></span>
            {floatData.initiatorName && floatData.initiatorName !== "Not Configured" && (
              <span className="hidden sm:inline">• Operator: <code className="text-gray-300 font-mono font-semibold">{floatData.initiatorName}</code></span>
            )}
          </div>
          <span>Last Synced: <strong className="text-gray-200">{lastCheckedAt}</strong></span>
        </div>
      )}
    </div>
  );
}
