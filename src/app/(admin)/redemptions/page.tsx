"use client";

import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Badge from "@/components/ui/badge/Badge";
import { useApi, authenticatedFetch } from "@/hooks/useApi";

export default function RedemptionQueue() {
  const { data, isLoading, mutate } = useApi<any>("/loyalty/redemptions?status=PENDING");
  const queue: any[] = data?.data || data || [];

  const [processingId, setProcessingId] = useState<string | null>(null);

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Redemption Queue</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Review and approve mobile money point-to-cash conversions
          </p>
        </div>
        <div className="px-4 py-2 bg-warning-500/10 text-warning-600 rounded-lg text-xs font-bold border border-warning-200">
          {queue.length} PENDING APPROVAL
        </div>
      </div>

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
                  <TableCell isHeader className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-widest">Consumer</TableCell>
                  <TableCell isHeader className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-widest">Destination</TableCell>
                  <TableCell isHeader className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-widest">Value (KES)</TableCell>
                  <TableCell isHeader className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-widest">Mode</TableCell>
                  <TableCell isHeader className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-widest text-right whitespace-nowrap">Actions</TableCell>
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
    </div>
  );
}
