"use client";

import React, { useState } from "react";
import Link from "next/link";
import Badge from "@/components/ui/badge/Badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useApi } from "@/hooks/useApi";
import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";
import { BoxCubeIcon, PieChartIcon } from "@/icons";

export default function RewardCatalog() {
  const [searchTerm, setSearchTerm] = useState("");
  const { data: catalogRes, isLoading, isError, mutate } = useApi<any>("/rewards/catalog");
  const [selectedReward, setSelectedReward] = useState<any>(null);
  const [consumerSearch, setConsumerSearch] = useState("");
  const { data: consumersRes } = useApi<any[]>(consumerSearch.length >= 3 ? `/consumers?search=${consumerSearch}` : null);
  const [selectedConsumer, setSelectedConsumer] = useState<any>(null);
  const [isRedeeming, setIsRedeeming] = useState(false);

  const rewards = catalogRes?.success ? catalogRes.data : [];

  const handleRedeem = async () => {
    if (!selectedReward || !selectedConsumer) return;
    setIsRedeeming(true);
    try {
      const res = await fetch("/api/loyalty/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          consumerId: selectedConsumer.id,
          rewardItemId: selectedReward.id,
          points: selectedReward.requiredPoints.toString(),
          destinationAccount: selectedConsumer.phone || "INTERNAL",
          amountValue: "0",
          currencyCode: "KES",
          fulfillmentMode: selectedReward.fulfillmentStrategy || "MANUAL_FULFILLMENT",
          description: `Redeemed ${selectedReward.name}`
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSelectedReward(null);
        setSelectedConsumer(null);
        mutate();
      } else {
        alert(data.error || "Redemption failed");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsRedeeming(false);
    }
  };

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case "MOBILE_MONEY": return "success";
      case "AIRTIME": return "info";
      case "CASH": return "warning";
      default: return "light";
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      {/* ── Page Header Bar ──────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-200/80 dark:border-white/[0.06] pb-5">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
              Rewards Catalog &amp; Redemption Engine
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400 text-xs font-semibold border border-brand-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-pulse" />
              Catalog Active
            </span>
          </div>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Configure and manage reward items and their respective redemption points values.
          </p>
        </div>
        
        <Link
          href="/rewards/new"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-xs font-semibold text-white shadow-md shadow-brand-500/20 hover:bg-brand-700 transition-all shrink-0"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
          Add Reward Item
        </Link>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MetricCard label="Active Items" value={rewards.length.toString()} sub="Visible to consumers" icon={<BoxCubeIcon />} />
        <MetricCard label="Total Redemptions" value="1,240" sub="Last 30 days" icon={<PieChartIcon />} />
        <MetricCard label="Avg Item Cost" value="450 PTS" sub="Points per reward" icon={<BoxCubeIcon />} />
      </div>

      {/* Process Redemption Modal */}
      {selectedReward && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-950/50 backdrop-blur-xs p-4">
           <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-white/10 shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95">
              <div className="p-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Process Manual Redemption</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-6">Manually redeem <span className="font-bold text-gray-900 dark:text-white">{selectedReward.name}</span> for a consumer profile.</p>
                
                <div className="space-y-4">
                   <div>
                      <Label className="mb-1.5 text-xs font-semibold text-gray-700 dark:text-gray-300">Search Consumer</Label>
                      <div className="relative">
                        <Input 
                          placeholder="Search by phone, name or consumer ID..."
                          value={consumerSearch}
                          onChange={(e) => setConsumerSearch(e.target.value)}
                          className="pl-10 text-xs"
                        />
                        <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                      </div>
                      {consumersRes && !selectedConsumer && (
                         <div className="mt-2 max-h-48 overflow-y-auto border border-gray-100 dark:border-white/10 rounded-xl shadow-lg bg-white dark:bg-gray-900 divide-y divide-gray-50 dark:divide-white/5 z-20 custom-scrollbar">
                            {consumersRes.length > 0 ? (
                               consumersRes.map((c: any) => (
                                 <button 
                                   key={c.id} 
                                   onClick={() => setSelectedConsumer(c)}
                                   className="w-full text-left p-3 text-xs hover:bg-gray-50 dark:hover:bg-white/5 transition-colors group flex items-center gap-3"
                                 >
                                    <div className="w-7 h-7 rounded-full bg-brand-500/10 text-brand-600 font-bold flex items-center justify-center text-xs shrink-0">
                                      {c.firstName?.charAt(0) || "C"}
                                    </div>
                                    <div>
                                      <div className="font-bold text-gray-900 dark:text-white group-hover:text-brand-500 transition-colors">{c.firstName} {c.lastName}</div>
                                      <div className="text-[11px] text-gray-400 font-mono mt-0.5">{c.phone}</div>
                                    </div>
                                 </button>
                               ))
                            ) : (
                               <div className="p-4 text-center text-xs text-gray-400 italic">No consumers found</div>
                            )}
                         </div>
                      )}
                   </div>

                   {selectedConsumer && (
                      <div className="p-3.5 bg-brand-500/10 rounded-xl border border-brand-500/20 flex items-center justify-between animate-in slide-in-from-top-2">
                         <div className="flex flex-col">
                            <span className="text-[11px] font-semibold text-brand-600 dark:text-brand-400">Target Consumer</span>
                            <span className="text-xs font-bold text-gray-900 dark:text-white mt-0.5">{selectedConsumer.firstName} {selectedConsumer.lastName}</span>
                         </div>
                         <button onClick={() => setSelectedConsumer(null)} className="text-brand-600 hover:text-brand-800 transition p-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                         </button>
                      </div>
                   )}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 p-5 bg-gray-50 dark:bg-white/[0.02] border-t border-gray-100 dark:border-white/5">
                 <button 
                    onClick={() => { setSelectedReward(null); setSelectedConsumer(null); setConsumerSearch(""); }} 
                    className="px-4 py-2 text-xs font-semibold text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition"
                 >
                    Cancel
                 </button>
                 <button 
                    onClick={handleRedeem}
                    disabled={isRedeeming || !selectedConsumer}
                    className="px-5 py-2 bg-brand-600 text-white rounded-xl text-xs font-semibold hover:bg-brand-700 disabled:opacity-50 shadow-md shadow-brand-500/20 transition-all flex items-center gap-2"
                 >
                    {isRedeeming && <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>}
                    {isRedeeming ? "Processing..." : "Confirm Redemption"}
                 </button>
              </div>
           </div>
        </div>
      )}

      {/* Catalog Table */}
      <div className="bg-white dark:bg-white/[0.02] border border-gray-200/80 dark:border-white/[0.06] rounded-2xl overflow-hidden shadow-sm flex flex-col">
        <div className="w-full overflow-x-auto">
          {isLoading ? (
             <div className="flex min-h-[300px] w-full items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-500 border-t-transparent"></div>
             </div>
          ) : (
            <Table className="w-full">
              <TableHeader>
                <TableRow className="bg-gray-50/50 dark:bg-white/[0.01]">
                  <TableCell isHeader className="py-3.5 px-6 text-xs font-semibold text-gray-500 dark:text-gray-400">Reward Item</TableCell>
                  <TableCell isHeader className="py-3.5 px-6 text-xs font-semibold text-gray-500 dark:text-gray-400">Category</TableCell>
                  <TableCell isHeader className="py-3.5 px-6 text-xs font-semibold text-gray-500 dark:text-gray-400">Required Points</TableCell>
                  <TableCell isHeader className="py-3.5 px-6 text-xs font-semibold text-gray-500 dark:text-gray-400 text-right">Actions</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.04]">
                {rewards.length > 0 ? rewards.map((r: any) => (
                  <TableRow key={r.id} className="hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition-colors">
                    <TableCell className="py-3.5 px-6">
                       <div className="flex items-center gap-3">
                          {/* Rounded Full Avatar Badge */}
                          <div className="w-9 h-9 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center border border-brand-500/20 shrink-0 shadow-2xs">
                             <BoxCubeIcon className="w-4 h-4" />
                          </div>
                          <div className="flex flex-col">
                             <p className="text-xs font-bold text-gray-900 dark:text-white">{r.name}</p>
                             <p className="text-[11px] text-gray-400 capitalize">{r.fulfillmentStrategy?.replace(/_/g, " ").toLowerCase()}</p>
                          </div>
                       </div>
                    </TableCell>
                    <TableCell className="py-3.5 px-6">
                       <Badge color={getTypeBadgeColor(r.rewardType) as any} size="sm">
                          {r.rewardType?.replace(/_/g, " ").toLowerCase() || "General"}
                       </Badge>
                    </TableCell>
                    <TableCell className="py-3.5 px-6">
                      <span className="text-xs font-bold font-mono text-brand-600 dark:text-brand-400">
                        {parseInt(r.requiredPoints).toLocaleString()} <span className="text-[10px] text-gray-400 font-sans">PTS</span>
                      </span>
                    </TableCell>
                    <TableCell className="py-3.5 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                         <Link 
                           href={`/rewards/${r.id}`} 
                           className="p-1.5 text-gray-400 hover:text-brand-500 transition-colors"
                           aria-label="Edit reward"
                         >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                         </Link>
                         <button 
                           onClick={() => setSelectedReward(r)}
                           className="px-3 py-1.5 bg-brand-500/10 text-brand-600 dark:text-brand-400 text-xs font-semibold rounded-lg hover:bg-brand-500/20 transition-all"
                         >
                           Redeem
                         </button>
                      </div>
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow><TableCell colSpan={4} className="py-16 text-center text-xs text-gray-400 font-medium">No reward items cataloged yet</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </div>
      </div>
    </div>
  );
}

function MetricCard({ label, value, sub, icon }: any) {
  return (
    <div className="rounded-2xl border border-gray-200/80 bg-white p-4 dark:border-white/[0.06] dark:bg-white/[0.02] shadow-sm flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center shrink-0 border border-brand-500/20 shadow-2xs">
           {icon}
        </div>
        <div>
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">{label}</p>
          <h3 className="text-sm font-bold text-gray-900 dark:text-white mt-0.5">{value}</h3>
          <p className="text-[10px] text-gray-400">{sub}</p>
        </div>
    </div>
  );
}
