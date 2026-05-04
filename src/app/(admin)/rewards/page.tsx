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
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Rewards catalog
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Configure and manage reward items and their respective redemption values.
          </p>
        </div>
        
        <Link
          href="/rewards/new"
          className="px-5 py-2.5 text-sm font-bold text-white bg-brand-600 rounded-lg shadow-sm hover:bg-brand-700 transition flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5 font-bold" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
          Add reward item
        </Link>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <MetricCard label="Active items" value={rewards.length.toString()} sub="Items visible to consumers" icon={<BoxCubeIcon />} />
         <MetricCard label="Total redemptions" value="1,240" sub="Last 30 days" icon={<PieChartIcon />} />
         <MetricCard label="Avg. item cost" value="450" sub="Points per reward" icon={<BoxCubeIcon />} />
      </div>

      {selectedReward && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-950/40 backdrop-blur-[2px] p-4">
           <div className="bg-white dark:bg-[#18181b] rounded-2xl border border-gray-200 dark:border-white/10 shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95">
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Process redemption</h3>
                <p className="text-sm text-gray-500 mb-6">Manually redeem <span className="font-bold text-gray-900 dark:text-white">{selectedReward.name}</span> for a consumer.</p>
                
                <div className="space-y-5">
                   <div>
                      <Label className="mb-2 text-xs font-bold uppercase text-gray-400 tracking-wider">Search consumer</Label>
                      <div className="relative">
                        <Input 
                          placeholder="Search by phone, name or ID..."
                          value={consumerSearch}
                          onChange={(e) => setConsumerSearch(e.target.value)}
                          className="pl-10"
                        />
                        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                      </div>
                      {consumersRes && !selectedConsumer && (
                         <div className="mt-2 max-h-48 overflow-y-auto border border-gray-100 dark:border-white/5 rounded-xl shadow-lg bg-white dark:bg-[#18181b] divide-y divide-gray-50 dark:divide-white/5 z-20">
                            {consumersRes.length > 0 ? (
                               consumersRes.map((c: any) => (
                                 <button 
                                   key={c.id} 
                                   onClick={() => setSelectedConsumer(c)}
                                   className="w-full text-left p-3 text-sm hover:bg-gray-50 dark:hover:bg-white/5 transition-colors group"
                                 >
                                    <div className="font-bold text-gray-900 dark:text-white group-hover:text-brand-600 transition-colors">{c.firstName} {c.lastName}</div>
                                    <div className="text-xs text-gray-500 mt-0.5">{c.phone}</div>
                                 </button>
                               ))
                            ) : (
                               <div className="p-4 text-center text-xs text-gray-400 italic">No consumers found</div>
                            )}
                         </div>
                      )}
                   </div>

                   {selectedConsumer && (
                      <div className="p-4 bg-brand-50 dark:bg-brand-500/10 rounded-xl border border-brand-100 dark:border-brand-500/20 flex items-center justify-between animate-in slide-in-from-top-2">
                         <div className="flex flex-col">
                            <span className="text-xs font-bold text-brand-800 dark:text-brand-300 uppercase tracking-wider">Target consumer</span>
                            <span className="text-sm font-bold text-brand-900 dark:text-white mt-0.5">{selectedConsumer.firstName} {selectedConsumer.lastName}</span>
                         </div>
                         <button onClick={() => setSelectedConsumer(null)} className="text-brand-600 hover:text-brand-800 transition p-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                         </button>
                      </div>
                   )}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 p-6 bg-gray-50 dark:bg-white/[0.02] border-t border-gray-100 dark:border-white/5">
                 <button 
                    onClick={() => { setSelectedReward(null); setSelectedConsumer(null); setConsumerSearch(""); }} 
                    className="px-4 py-2 text-sm font-bold text-gray-500 hover:text-gray-700 transition"
                 >
                    Cancel
                 </button>
                 <button 
                    onClick={handleRedeem}
                    disabled={isRedeeming || !selectedConsumer}
                    className="px-6 py-2 bg-brand-600 text-white rounded-lg font-bold hover:bg-brand-700 disabled:opacity-50 shadow-md shadow-brand-500/20 transition-all flex items-center gap-2"
                 >
                    {isRedeeming && <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>}
                    {isRedeeming ? "Processing..." : "Confirm redemption"}
                 </button>
              </div>
           </div>
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-white/10 dark:bg-[#18181b]">
        <div className="overflow-x-auto">
          {isLoading ? (
             <div className="flex h-64 items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-brand-500"></div>
             </div>
          ) : (
            <Table>
              <TableHeader className="bg-gray-50/50 dark:bg-white/5">
                <TableRow>
                  <TableCell isHeader className="font-semibold text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider pl-6 py-4">Reward item</TableCell>
                  <TableCell isHeader className="font-semibold text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider py-4">Category</TableCell>
                  <TableCell isHeader className="font-semibold text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider py-4">Required points</TableCell>
                  <TableCell isHeader className="font-semibold text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider py-4 text-right pr-6">Action</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rewards.length > 0 ? rewards.map((r: any) => (
                  <TableRow key={r.id} className="hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors border-b border-gray-100 dark:border-white/5">
                    <TableCell className="py-5 pl-6">
                       <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-brand-50 dark:bg-brand-500/10 flex items-center justify-center">
                             <BoxCubeIcon className="w-5 h-5 text-brand-600 dark:text-brand-400" />
                          </div>
                          <div>
                             <p className="text-sm font-bold text-gray-900 dark:text-white">{r.name}</p>
                             <p className="text-xs text-gray-500">{r.fulfillmentStrategy?.replace(/_/g, " ").toLowerCase()}</p>
                          </div>
                       </div>
                    </TableCell>
                    <TableCell className="py-5">
                       <Badge color={getTypeBadgeColor(r.rewardType) as any}>
                          {r.rewardType?.replace(/_/g, " ").toLowerCase() || "General"}
                       </Badge>
                    </TableCell>
                    <TableCell className="py-5">
                      <span className="text-[15px] font-black text-brand-600 dark:text-brand-400">
                        {parseInt(r.requiredPoints).toLocaleString()} <span className="text-[11px] font-bold opacity-60">PTS</span>
                      </span>
                    </TableCell>
                    <TableCell className="py-5 text-right pr-6">
                      <div className="flex items-center justify-end gap-3">
                         <Link href={`/rewards/${r.id}`} className="p-2 text-gray-400 hover:text-gray-600 transition">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                         </Link>
                         <button 
                           onClick={() => setSelectedReward(r)}
                           className="px-4 py-2 bg-brand-600 text-white rounded-lg text-sm font-bold hover:bg-brand-700 shadow-sm shadow-brand-500/20 transition flex items-center gap-2"
                         >
                           Redeem
                         </button>
                      </div>
                    </TableCell>
                  </TableRow>
                )) : (
                  <TableRow><TableCell colSpan={4} className="py-12 text-center text-gray-400 italic">No reward items cataloged yet</TableCell></TableRow>
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
    <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-white/10 dark:bg-[#18181b] shadow-sm flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-gray-50 dark:bg-white/[0.03] flex items-center justify-center text-gray-400">
           {icon}
        </div>
        <div>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{label}</p>
          <h3 className="text-xl font-black text-gray-900 dark:text-white mt-0.5">{value}</h3>
          <p className="text-[11px] text-gray-500">{sub}</p>
        </div>
    </div>
  );
}
