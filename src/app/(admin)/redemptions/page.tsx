"use client";

import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Badge from "@/components/ui/badge/Badge";
import { useApi, authenticatedFetch } from "@/hooks/useApi";
import { MpesaFloatCard } from "@/components/common/MpesaFloatCard";
import { useUser } from "@/context/UserContext";

export default function RedemptionQueue() {
  const { user } = useUser();
  const { data, isLoading, mutate } = useApi<any>("/loyalty/redemptions?status=PENDING");
  const queue: any[] = data?.data || data || [];

  const [processingId, setProcessingId] = useState<string | null>(null);

  // Manual Send Modal State
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedConsumer, setSelectedConsumer] = useState<any | null>(null);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [amount, setAmount] = useState("");
  const [remarks, setRemarks] = useState("Manual Admin Payout");
  const [isSendingManual, setIsSendingManual] = useState(false);
  const [manualStatus, setManualStatus] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  // Search Directory consumers
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      setSearchResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const json = await authenticatedFetch(`/api/consumers/search?query=${encodeURIComponent(searchQuery)}`);
        if (json.success) {
          setSearchResults(json.data || []);
        }
      } catch (err) {
        console.error("Error searching directory", err);
      } finally {
        setIsSearching(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSelectConsumer = (c: any) => {
    setSelectedConsumer(c);
    setPhoneNumber(c.phoneNumber || "");
    setSearchQuery(`${c.firstName} ${c.lastName} (${c.phoneNumber})`);
    setSearchResults([]);
  };

  const handleSendManualPayout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber.trim() || !amount || Number(amount) <= 0) {
      setManualStatus({ type: "error", msg: "Please enter a valid phone number and positive amount." });
      return;
    }

    if (!confirm(`Are you sure you want to send KES ${amount} directly to ${phoneNumber}?`)) {
      return;
    }

    setIsSendingManual(true);
    setManualStatus(null);

    try {
      const json = await authenticatedFetch("/api/mpesa/manual-payout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phoneNumber,
          consumerId: selectedConsumer?.id,
          amount: Number(amount),
          remarks,
        }),
      });

      if (json.success) {
        setManualStatus({
          type: "success",
          msg: `Success! KES ${amount} payout dispatched. Ref: ${json.externalReference || "Sent"}`
        });
        setAmount("");
        setSelectedConsumer(null);
        mutate();
      } else {
        setManualStatus({ type: "error", msg: json.error || "Payout failed" });
      }
    } catch (err: any) {
      setManualStatus({ type: "error", msg: err.message || "Failed to trigger manual payout" });
    } finally {
      setIsSendingManual(false);
    }
  };

  const handleApprove = async (id: string) => {
    if (!confirm("Approve this payout? This will trigger the M-Pesa disbursement.")) return;
    setProcessingId(id);
    try {
      await authenticatedFetch(`/api/loyalty/redemptions/${id}/approve`, { method: "POST" });
      mutate();
    } catch (err) {
      console.error(err);
      alert("Failed to process payout. Check Daraja configuration.");
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (id: string) => {
    if (!confirm("Reject this redemption request?")) return;
    setProcessingId(id);
    try {
      await authenticatedFetch(`/api/loyalty/redemptions/${id}/reject`, { method: "POST" });
      mutate();
    } catch (err) {
      console.error(err);
      alert("Failed to reject redemption.");
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header & Top Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Redemption &amp; Payout Center</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Manage point-to-cash redemptions, query Safaricom float, and send direct M-Pesa payouts.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsManualModalOpen(true)}
            className="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold rounded-xl transition shadow-lg shadow-brand-500/20 flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
            Direct Send (Manual Payout)
          </button>

          <div className="px-3.5 py-1.5 bg-warning-500/10 text-warning-600 dark:text-warning-400 rounded-lg text-xs font-bold border border-warning-500/20">
            {queue.length} Pending
          </div>
        </div>
      </div>

      {/* Float Balance Dashboard Card */}
      <MpesaFloatCard tenantId={user?.tenantId || undefined} />

      {/* Redemption Queue Table */}
      <div className="bg-white dark:bg-white/[0.02] border border-gray-200/80 dark:border-white/[0.06] rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="py-20 flex justify-center">
              <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-50/50 dark:bg-white/[0.01]">
                  <TableCell isHeader className="py-3.5 px-6 text-xs font-semibold text-gray-500 dark:text-gray-400">Consumer</TableCell>
                  <TableCell isHeader className="py-3.5 px-6 text-xs font-semibold text-gray-500 dark:text-gray-400">Destination</TableCell>
                  <TableCell isHeader className="py-3.5 px-6 text-xs font-semibold text-gray-500 dark:text-gray-400">Value (KES)</TableCell>
                  <TableCell isHeader className="py-3.5 px-6 text-xs font-semibold text-gray-500 dark:text-gray-400">Fulfillment mode</TableCell>
                  <TableCell isHeader className="py-3.5 px-6 text-xs font-semibold text-gray-500 dark:text-gray-400 text-right whitespace-nowrap">Actions</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.04]">
                {queue.length > 0 ? (
                  queue.map((req: any) => (
                    <TableRow key={req.id} className="hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition-colors">
                      <TableCell className="py-4 px-6">
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-gray-900 dark:text-white">
                            {req.consumer?.firstName} {req.consumer?.lastName}
                          </span>
                          <span className="text-xs text-gray-400">{req.consumer?.phoneNumber}</span>
                        </div>
                      </TableCell>
                      <TableCell className="py-4 px-6 font-mono text-xs text-gray-700 dark:text-gray-300">
                        {req.destinationAccount}
                      </TableCell>
                      <TableCell className="py-4 px-6">
                        <div className="flex flex-col">
                          <span className="text-sm font-black text-gray-900 dark:text-white">
                            {parseFloat(req.amountValue || "0").toLocaleString()} KES
                          </span>
                          <span className="text-[10px] text-gray-400">Conversion Rate Applied</span>
                        </div>
                      </TableCell>
                      <TableCell className="py-4 px-6">
                        <Badge size="sm" color="primary">{req.fulfillmentMode}</Badge>
                      </TableCell>
                      <TableCell className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleApprove(req.id)}
                            disabled={processingId === req.id}
                            className="px-4 py-1.5 bg-brand-500 text-white text-xs font-bold rounded-lg hover:bg-brand-600 transition shadow-lg shadow-brand-500/10 disabled:opacity-50"
                          >
                            {processingId === req.id ? "Processing..." : "Approve Payout"}
                          </button>
                          <button
                            onClick={() => handleReject(req.id)}
                            disabled={processingId === req.id}
                            className="p-1.5 text-gray-400 hover:text-error-500 transition-colors disabled:opacity-50"
                            title="Reject"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="py-20 text-center text-gray-400 italic text-sm">
                      No redemptions currently pending in the queue.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </div>
      </div>

      {/* Direct Send / Manual Payout Modal */}
      {isManualModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-2xl p-6 w-full max-w-lg shadow-2xl relative space-y-5">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-white/5 pb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-brand-500/10 text-brand-500 rounded-lg">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white">Direct Send (Manual M-Pesa Payout)</h3>
              </div>
              <button
                onClick={() => setIsManualModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {manualStatus && (
              <div className={`p-3 rounded-xl text-xs font-bold ${
                manualStatus.type === "success" 
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20" 
                  : "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20"
              }`}>
                {manualStatus.msg}
              </div>
            )}

            <form onSubmit={handleSendManualPayout} className="space-y-4">
              {/* Selected Member Indicator */}
              {selectedConsumer ? (
                <div className="p-3 bg-brand-500/10 border border-brand-500/20 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-brand-500/20 text-brand-400 font-bold text-xs flex items-center justify-center">
                      {selectedConsumer.firstName?.[0] || "M"}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-900 dark:text-white">
                        {selectedConsumer.firstName} {selectedConsumer.lastName}
                      </p>
                      <p className="text-[10px] text-gray-400">
                        {selectedConsumer.loyaltyNumber || "Member"} • <span className="font-mono text-brand-400 font-semibold">{phoneNumber}</span>
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedConsumer(null);
                      setPhoneNumber("");
                      setSearchQuery("");
                    }}
                    className="text-[11px] font-bold text-rose-400 hover:text-rose-300 px-2 py-1 rounded-lg hover:bg-rose-500/10 transition"
                  >
                    Clear
                  </button>
                </div>
              ) : (
                /* Directory Search / Direct Phone Input */
                <div className="space-y-1 relative">
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center justify-between">
                    <span>Recipient Mobile Number or Search Directory</span>
                    {isSearching && <span className="text-[10px] text-brand-400 font-normal">Searching directory...</span>}
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      placeholder="Enter phone (e.g. 0712345678) or search member name..."
                      value={searchQuery}
                      onChange={(e) => {
                        const val = e.target.value;
                        setSearchQuery(val);
                        setPhoneNumber(val);
                      }}
                      className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-white/10 rounded-xl text-sm font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/40"
                    />
                  </div>

                  {/* Directory Autocomplete Dropdown */}
                  {searchResults.length > 0 && !selectedConsumer && (
                    <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-white/10 rounded-xl shadow-xl max-h-48 overflow-y-auto divide-y divide-gray-100 dark:divide-white/5 animate-fadeIn">
                      {searchResults.map((item: any) => (
                        <div
                          key={item.id}
                          onClick={() => handleSelectConsumer(item)}
                          className="p-3 hover:bg-brand-500/5 dark:hover:bg-brand-500/10 cursor-pointer flex items-center justify-between transition"
                        >
                          <div>
                            <p className="text-xs font-bold text-gray-900 dark:text-white">{item.firstName} {item.lastName}</p>
                            <p className="text-[10px] text-gray-400 font-mono">{item.phoneNumber} {item.loyaltyNumber ? `• Card: ${item.loyaltyNumber}` : ""}</p>
                          </div>
                          <span className="text-[10px] font-bold px-2 py-0.5 bg-brand-500/15 text-brand-400 rounded-lg">Select Member</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Amount in KES */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                  Amount to Send (KES)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">KES</span>
                  <input
                    type="number"
                    min="1"
                    required
                    placeholder="500"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full pl-12 pr-3.5 py-2.5 bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-white/10 rounded-xl text-base font-black text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/40"
                  />
                </div>

                {/* Quick Amount Chips */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {[100, 200, 500, 1000, 2000, 5000].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setAmount(preset.toString())}
                      className={`px-2.5 py-1 text-[11px] font-bold rounded-lg border transition ${
                        amount === preset.toString()
                          ? "bg-brand-500 text-white border-brand-500"
                          : "bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-white/10 hover:border-brand-500/40"
                      }`}
                    >
                      KES {preset.toLocaleString()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Remarks */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
                  Transaction Remarks
                </label>
                <input
                  type="text"
                  placeholder="e.g. Loyalty Redemption Payout"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-white/10 rounded-xl text-xs font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/40"
                />
              </div>

              {/* Live Preview Summary */}
              {phoneNumber && amount && Number(amount) > 0 && (
                <div className="p-3 bg-slate-900 text-white rounded-xl border border-gray-800 space-y-1.5 animate-fadeIn text-xs">
                  <div className="flex justify-between items-center text-gray-400 text-[11px]">
                    <span>Channel</span>
                    <span className="text-brand-400 font-bold">Safaricom M-Pesa B2C</span>
                  </div>
                  <div className="flex justify-between items-center text-gray-300">
                    <span>Recipient</span>
                    <span className="font-mono font-bold text-white">
                      {selectedConsumer ? `${selectedConsumer.firstName} (${phoneNumber})` : phoneNumber}
                    </span>
                  </div>
                  <div className="flex justify-between items-center border-t border-gray-800 pt-1.5">
                    <span className="font-bold text-gray-300">Total Disbursement</span>
                    <span className="text-sm font-black text-brand-300">
                      KES {Number(amount).toLocaleString("en-KE", { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100 dark:border-white/5">
                <button
                  type="button"
                  onClick={() => setIsManualModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-gray-500 hover:text-gray-700 dark:text-gray-400 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSendingManual || !phoneNumber || !amount || Number(amount) <= 0}
                  className="px-5 py-2.5 bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold rounded-xl transition shadow-lg shadow-brand-500/20 disabled:opacity-50 flex items-center gap-2 active:scale-95"
                >
                  {isSendingManual ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Dispatching Payout...
                    </>
                  ) : (
                    "Confirm & Send Payout"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
