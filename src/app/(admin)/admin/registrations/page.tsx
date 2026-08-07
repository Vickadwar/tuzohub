"use client";

import React, { useState } from "react";
import Badge from "@/components/ui/badge/Badge";
import { useApi, authenticatedFetch } from "@/hooks/useApi";

interface RegistrationItem {
  id: string;
  name: string;
  slug: string;
  email: string;
  phone?: string;
  taxPin?: string;
  status: string;
  createdAt?: string;
  country?: { name: string };
}

interface ToastMessage {
  id: string;
  type: "success" | "error" | "info";
  title: string;
  message: string;
}

export default function RegistrationsPage() {
  const { data, isLoading, mutate } = useApi<any>("/system/registrations");
  const registrations: RegistrationItem[] = data?.data || data || [];

  // Modal State
  const [selectedReg, setSelectedReg] = useState<RegistrationItem | null>(null);
  const [actionType, setActionType] = useState<"approve" | "decline" | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState(0);

  // Form Inputs in Modal
  const [declineReason, setDeclineReason] = useState("Invalid Tax PIN / Verification Documents");
  const [adminNote, setAdminNote] = useState("");
  const [sendWelcomeEmail, setSendWelcomeEmail] = useState(true);

  // Toast System
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (type: "success" | "error" | "info", title: string, message: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const openActionModal = (reg: RegistrationItem, action: "approve" | "decline") => {
    setSelectedReg(reg);
    setActionType(action);
    setProcessingStep(0);
    setAdminNote("");
    if (action === "decline") {
      setDeclineReason("Invalid Tax PIN / Verification Documents");
    }
  };

  const closeModal = () => {
    if (isProcessing) return;
    setSelectedReg(null);
    setActionType(null);
    setIsProcessing(false);
    setProcessingStep(0);
  };

  const handleConfirmAction = async () => {
    if (!selectedReg || !actionType) return;

    setIsProcessing(true);
    setProcessingStep(1);

    // Simulate multi-step visual feedback for high-tech experience
    const timer1 = setTimeout(() => setProcessingStep(2), 600);
    const timer2 = setTimeout(() => setProcessingStep(3), 1200);

    try {
      const res = await authenticatedFetch(`/api/system/registrations/${selectedReg.id}/${actionType}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reason: actionType === "decline" ? declineReason : undefined,
          adminNote: adminNote.trim() || undefined,
          sendEmail: sendWelcomeEmail,
        }),
      });

      clearTimeout(timer1);
      clearTimeout(timer2);

      if (res) {
        if (actionType === "approve") {
          addToast(
            "success",
            "Tenant Approved & Provisioned!",
            `${selectedReg.name} is now ACTIVE. Subdomain ${selectedReg.slug}.tuzohub.com and API credentials have been initialized.`
          );
        } else {
          addToast(
            "info",
            "Registration Request Declined",
            `${selectedReg.name} registration was updated to declined status.`
          );
        }
        mutate();
        closeModal();
      } else {
        addToast("error", "Action Failed", "Server returned an unexpected failure state.");
      }
    } catch (err: any) {
      clearTimeout(timer1);
      clearTimeout(timer2);
      addToast("error", "Action Failed", err.message || "An unexpected error occurred during processing.");
    } finally {
      setIsProcessing(false);
    }
  };

  const pendingRegs = registrations.filter((r) => r.status === "pending");
  const nonPendingRegs = registrations.filter((r) => r.status !== "pending");

  const QUICK_DECLINE_REASONS = [
    "Invalid Tax PIN / Verification Documents",
    "Duplicate Account Request",
    "Unresponsive Contact Information",
    "Incomplete Corporate Verification Details",
  ];

  return (
    <div className="space-y-6 animate-fadeIn pb-12 relative">
      {/* Toast Notification Container */}
      <div className="fixed top-5 right-5 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto p-4 rounded-2xl shadow-2xl border backdrop-blur-xl transition-all animate-in slide-in-from-top-5 duration-300 relative overflow-hidden ${
              toast.type === "success"
                ? "bg-emerald-950/90 text-emerald-100 border-emerald-500/30 dark:bg-emerald-950/95"
                : toast.type === "error"
                ? "bg-rose-950/90 text-rose-100 border-rose-500/30 dark:bg-rose-950/95"
                : "bg-gray-900/90 text-gray-100 border-gray-700/50"
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                {toast.type === "success" && (
                  <div className="p-1.5 rounded-full bg-emerald-500/20 text-emerald-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
                {toast.type === "error" && (
                  <div className="p-1.5 rounded-full bg-rose-500/20 text-rose-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </div>
                )}
                {toast.type === "info" && (
                  <div className="p-1.5 rounded-full bg-amber-500/20 text-amber-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                )}
                <div>
                  <h4 className="text-xs font-bold">{toast.title}</h4>
                  <p className="text-[11px] opacity-90 mt-0.5 leading-relaxed">{toast.message}</p>
                </div>
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="text-white/60 hover:text-white transition"
              >
                ✕
              </button>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
              <div className="h-full bg-white/60 animate-shrink" style={{ animationDuration: "4.5s" }} />
            </div>
          </div>
        ))}
      </div>

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
              <div
                key={reg.id}
                className="bg-white dark:bg-white/[0.02] border border-amber-500/30 rounded-2xl p-5 shadow-sm space-y-4 relative overflow-hidden transition-all hover:shadow-md hover:border-amber-500/50"
              >
                <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-amber-500" />
                <div className="flex items-start justify-between gap-3 pl-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-brand-500/20 border border-amber-500/30 flex items-center justify-center font-bold text-amber-600 dark:text-amber-400 text-sm">
                      {reg.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="text-base font-bold text-gray-900 dark:text-white">{reg.name}</h4>
                      <p className="text-xs text-gray-400">{reg.email}</p>
                      <p className="text-[10px] font-mono text-brand-600 dark:text-brand-400 font-semibold mt-0.5">
                        https://{reg.slug}.tuzohub.com
                      </p>
                    </div>
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
                    onClick={() => openActionModal(reg, "decline")}
                    className="px-4 py-2 bg-rose-500/10 text-rose-600 hover:bg-rose-500/20 text-xs font-bold rounded-xl transition border border-rose-500/20 flex items-center gap-1.5"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Decline Request
                  </button>
                  <button
                    onClick={() => openActionModal(reg, "approve")}
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition shadow-lg shadow-emerald-600/20 flex items-center gap-1.5"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                    </svg>
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

      {/* ── INNOVATIVE ACTION CONFIRMATION MODAL ────────────────────────────── */}
      {selectedReg && actionType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-950/70 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-6 relative overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Top Accent Line */}
            <div
              className={`absolute top-0 left-0 right-0 h-1.5 ${
                actionType === "approve"
                  ? "bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600"
                  : "bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600"
              }`}
            />

            {/* Header Info */}
            <div className="flex items-start justify-between gap-4 pt-1">
              <div className="flex items-center gap-3.5">
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-lg border ${
                    actionType === "approve"
                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                      : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30"
                  }`}
                >
                  {actionType === "approve" ? "✓" : "✕"}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase ${
                        actionType === "approve"
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                          : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20"
                      }`}
                    >
                      {actionType === "approve" ? "Approve & Provision" : "Decline Application"}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mt-1">
                    {selectedReg.name}
                  </h3>
                  <p className="text-xs text-gray-400 font-mono">{selectedReg.email}</p>
                </div>
              </div>

              <button
                disabled={isProcessing}
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition text-lg"
              >
                ✕
              </button>
            </div>

            {/* Modal Body: Approval vs Decline Options */}
            {actionType === "approve" ? (
              <div className="space-y-4">
                <div className="bg-emerald-500/5 dark:bg-emerald-500/[0.04] border border-emerald-500/20 rounded-2xl p-4 space-y-2.5">
                  <h4 className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                    <span>⚡</span> Provisioning Execution Checklist
                  </h4>
                  <ul className="space-y-2 text-xs text-gray-600 dark:text-gray-300">
                    <li className="flex items-center gap-2">
                      <span className="text-emerald-500 font-bold">✓</span>
                      <span>Activate Corporate Tenant Status &amp; API Keys</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-emerald-500 font-bold">✓</span>
                      <span>Enable Subdomain: <strong className="font-mono text-gray-900 dark:text-white">{selectedReg.slug}.tuzohub.com</strong></span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-emerald-500 font-bold">✓</span>
                      <span>Initialize KES Base Wallet &amp; Default Point Values</span>
                    </li>
                  </ul>
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-xs font-semibold text-gray-700 dark:text-gray-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={sendWelcomeEmail}
                      onChange={(e) => setSendWelcomeEmail(e.target.checked)}
                      className="w-4 h-4 text-emerald-600 rounded border-gray-300 focus:ring-emerald-500"
                    />
                    <span>Send Automated Welcome &amp; Onboarding Email to <strong className="font-mono">{selectedReg.email}</strong></span>
                  </label>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block">
                    Select Reason for Rejection
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {QUICK_DECLINE_REASONS.map((reason) => (
                      <button
                        type="button"
                        key={reason}
                        onClick={() => setDeclineReason(reason)}
                        className={`p-2.5 rounded-xl border text-left text-xs font-medium transition ${
                          declineReason === reason
                            ? "bg-rose-500/10 border-rose-500 text-rose-600 dark:text-rose-400 font-bold"
                            : "bg-gray-50 dark:bg-white/[0.02] border-gray-200 dark:border-white/5 text-gray-600 dark:text-gray-400"
                        }`}
                      >
                        {reason}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300 block">
                    Optional Admin Note / Feedback for Applicant
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Provide details on required corrections or documentation..."
                    value={adminNote}
                    onChange={(e) => setAdminNote(e.target.value)}
                    className="w-full p-3 bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-white/10 rounded-xl text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500/40"
                  />
                </div>
              </div>
            )}

            {/* Live Progress Feedback during API Execution */}
            {isProcessing && (
              <div className="bg-gray-900 dark:bg-black p-3.5 rounded-xl border border-gray-800 space-y-2">
                <div className="flex items-center justify-between text-xs font-mono text-gray-300">
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-brand-500 animate-ping" />
                    {processingStep === 1 && "Verifying registration record..."}
                    {processingStep === 2 && (actionType === "approve" ? "Provisioning tenant environment..." : "Updating status...")}
                    {processingStep === 3 && "Finalizing credentials & audit logs..."}
                  </span>
                  <span className="text-brand-400 font-bold">{processingStep * 33}%</span>
                </div>
                <div className="w-full bg-gray-800 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-brand-500 to-emerald-400 h-full transition-all duration-300"
                    style={{ width: `${processingStep * 33}%` }}
                  />
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-100 dark:border-white/5">
              <button
                type="button"
                disabled={isProcessing}
                onClick={closeModal}
                className="px-4 py-2.5 bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/10 text-xs font-bold rounded-xl transition"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isProcessing}
                onClick={handleConfirmAction}
                className={`px-5 py-2.5 text-white text-xs font-bold rounded-xl transition shadow-lg flex items-center gap-2 ${
                  actionType === "approve"
                    ? "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20"
                    : "bg-rose-600 hover:bg-rose-700 shadow-rose-600/20"
                }`}
              >
                {isProcessing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <span>{actionType === "approve" ? "Confirm & Provision Tenant" : "Confirm Decline Application"}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
