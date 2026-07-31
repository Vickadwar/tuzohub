"use client";

import React from "react";
import Badge from "@/components/ui/badge/Badge";
import { useApi, authenticatedFetch } from "@/hooks/useApi";

export default function RegistrationsPage() {
  const { data, isLoading, mutate } = useApi<any>("/system/registrations");
  const registrations: any[] = data?.data || data || [];

  const handleAction = async (id: string, action: "approve" | "decline") => {
    if (!confirm(`Are you sure you want to ${action} this organization registration?`)) return;

    try {
      const res = await authenticatedFetch(`/api/system/registrations/${id}/${action}`, {
        method: "POST",
      });
      const result = await res.json();
      if (result.success) {
        mutate();
      } else {
        alert(result.error || "Action failed.");
      }
    } catch {
      alert("Action failed due to network error.");
    }
  };

  const pendingRegs = registrations.filter((r) => r.status === "pending");
  const nonPendingRegs = registrations.filter((r) => r.status !== "pending");

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-200/80 dark:border-white/[0.06] pb-5">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
            Tenant Onboarding &amp; Registration Queue
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Review incoming corporate tenant applications, tax compliance PINs, and provisioning requests.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3.5 py-1.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-bold rounded-full border border-amber-500/20">
            {pendingRegs.length} Pending Approval
          </span>
        </div>
      </div>

      {/* Pending Applications Section */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
          Action Required — Pending Applications ({pendingRegs.length})
        </h3>

        {isLoading ? (
          <div className="flex justify-center py-12 bg-white dark:bg-white/[0.02] border border-gray-200/80 dark:border-white/[0.06] rounded-2xl">
            <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : pendingRegs.length === 0 ? (
          <div className="p-8 text-center bg-white dark:bg-white/[0.02] border border-gray-200/80 dark:border-white/[0.06] rounded-2xl text-gray-400 italic text-xs">
            No pending tenant registration applications awaiting review.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingRegs.map((reg) => (
              <div key={reg.id} className="bg-white dark:bg-white/[0.02] border border-amber-500/30 rounded-2xl p-5 shadow-sm space-y-4 relative overflow-hidden">
                <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-amber-500" />
                <div className="flex items-start justify-between gap-3 pl-2">
                  <div>
                    <h4 className="text-base font-bold text-gray-900 dark:text-white">{reg.name}</h4>
                    <p className="text-xs text-gray-400">{reg.email}</p>
                    <p className="text-[10px] font-mono text-gray-500 mt-1">Slug: {reg.slug}.tuzohub.com</p>
                  </div>
                  <Badge color="warning" size="sm">PENDING REVIEW</Badge>
                </div>

                <div className="grid grid-cols-2 gap-3 pl-2 text-xs bg-gray-50 dark:bg-white/[0.03] p-3 rounded-xl border border-gray-100 dark:border-white/5">
                  <div>
                    <span className="text-gray-400 block text-[10px] uppercase font-bold">Tax PIN</span>
                    <span className="font-mono font-bold text-gray-800 dark:text-gray-200">{reg.taxPin || "N/A"}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[10px] uppercase font-bold">Contact Phone</span>
                    <span className="font-mono font-bold text-gray-800 dark:text-gray-200">{reg.phone || "N/A"}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[10px] uppercase font-bold">Country</span>
                    <span className="font-bold text-gray-800 dark:text-gray-200">{reg.country?.name || "Kenya"}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[10px] uppercase font-bold">Applied On</span>
                    <span className="font-bold text-gray-800 dark:text-gray-200">{reg.createdAt ? new Date(reg.createdAt).toLocaleDateString() : "N/A"}</span>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pl-2 pt-1 border-t border-gray-100 dark:border-white/5">
                  <button
                    onClick={() => handleAction(reg.id, "decline")}
                    className="px-4 py-2 bg-rose-500/10 text-rose-600 hover:bg-rose-500/20 text-xs font-bold rounded-xl transition border border-rose-500/20"
                  >
                    Decline Request
                  </button>
                  <button
                    onClick={() => handleAction(reg.id, "approve")}
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition shadow-lg shadow-emerald-600/20"
                  >
                    Approve &amp; Provision Tenant
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Historical / Processed Registrations */}
      {nonPendingRegs.length > 0 && (
        <div className="space-y-4 pt-6">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">
            Processed Onboarding History ({nonPendingRegs.length})
          </h3>
          <div className="bg-white dark:bg-white/[0.02] border border-gray-200/80 dark:border-white/[0.06] rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-white/[0.05] bg-gray-50/50 dark:bg-white/[0.01]">
                    <th className="px-6 py-4 text-xs font-bold uppercase text-gray-500 tracking-wider">Organization</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase text-gray-500 tracking-wider">Tax PIN</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase text-gray-500 tracking-wider">Status</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase text-gray-500 tracking-wider">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-white/[0.04]">
                  {nonPendingRegs.map((reg) => (
                    <tr key={reg.id} className="hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4">
                        <span className="text-sm font-bold text-gray-900 dark:text-white block">{reg.name}</span>
                        <span className="text-xs text-gray-400">{reg.email}</span>
                      </td>
                      <td className="px-6 py-4 font-mono text-xs text-gray-700 dark:text-gray-300">
                        {reg.taxPin || "N/A"}
                      </td>
                      <td className="px-6 py-4">
                        <Badge color={reg.status === "active" ? "success" : "error"} size="sm">
                          {reg.status?.toUpperCase()}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-xs text-gray-500 font-medium">
                        {reg.createdAt ? new Date(reg.createdAt).toLocaleDateString() : "N/A"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
