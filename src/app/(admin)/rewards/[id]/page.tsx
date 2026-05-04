"use client";

import React, { use, useState, useEffect } from "react";
import Link from "next/link";
import Badge from "@/components/ui/badge/Badge";
import { useApi } from "@/hooks/useApi";
import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";
import Select from "@/components/form/Select";
import { ChevronDownIcon, BoxCubeIcon, PieChartIcon } from "@/icons";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function RewardDetail({ params }: PageProps) {
  const resolvedParams = use(params as any) as any;
  const id = resolvedParams?.id;

  const { data: rewardRes, isLoading, mutate } = useApi<any>(`/rewards/items/${id}`);
  const [formData, setFormData] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (rewardRes?.success) {
      setFormData(rewardRes.data);
    }
  }, [rewardRes]);

  if (isLoading || !formData) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-brand-500"></div>
      </div>
    );
  }

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch(`/api/rewards/items/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        mutate();
        alert("Reward updated successfully");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const rewardTypeOptions = [
    { value: "AIRTIME", label: "Mobile Airtime" },
    { value: "MOBILE_MONEY", label: "Mobile Money" },
    { value: "BANK_TRANSFER", label: "Bank Transfer" },
    { value: "INTERNAL_VOUCHER", label: "Internal Voucher" },
    { value: "PHYSICAL", label: "Physical Product" },
    { value: "CASH", label: "Cash" },
    { value: "GIFT_CARD", label: "Gift Card" },
  ];

  const fulfillmentOptions = [
    { value: "AUTOMATED_PAYOUT", label: "Automated Payout (API)" },
    { value: "INTERNAL_VOUCHER", label: "Internal Voucher" },
    { value: "MANUAL_FULFILLMENT", label: "Manual Fulfillment" },
    { value: "WALLET_BANKING", label: "Wallet Banking" },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 pb-12">
      <div className="flex items-center justify-between">
         <div className="flex items-center gap-3">
            <Link href="/rewards" className="p-2 rounded-full border border-gray-200 hover:bg-gray-50 dark:border-white/10 dark:hover:bg-white/5 transition text-gray-500">
               <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
            </Link>
            <div>
               <h1 className="text-xl font-bold dark:text-white">Reward item settings</h1>
               <p className="text-sm text-gray-500">Configuring: {formData.name}</p>
            </div>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
         <div className="md:col-span-2 space-y-8">
            <div className="bg-white border border-gray-200 rounded-2xl p-6 dark:bg-[#18181b] dark:border-white/10 shadow-sm space-y-6">
               <div>
                  <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-6">Core identity</h3>
                  <div className="space-y-4">
                     <div>
                        <Label className="mb-1.5">Display name</Label>
                        <Input 
                          value={formData.name}
                          onChange={(e) => setFormData({...formData, name: e.target.value})}
                        />
                     </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div>
                           <Label className="mb-1.5">Reward type</Label>
                           <Select 
                             options={rewardTypeOptions}
                             value={formData.rewardType}
                             onChange={(val) => setFormData({...formData, rewardType: val})}
                           />
                        </div>
                        <div>
                           <Label className="mb-1.5">Fulfillment strategy</Label>
                           <Select 
                             options={fulfillmentOptions}
                             value={formData.fulfillmentStrategy}
                             onChange={(val) => setFormData({...formData, fulfillmentStrategy: val})}
                           />
                        </div>
                     </div>
                  </div>
               </div>

               <div className="pt-6 border-t border-gray-100 dark:border-white/5">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-6">Economics & Costing</h3>
                  <div className="grid grid-cols-2 gap-4">
                     <div>
                        <Label className="mb-1.5">Redemption cost (PTS)</Label>
                        <div className="relative">
                          <Input 
                            type="number"
                            value={formData.requiredPoints}
                            onChange={(e) => setFormData({...formData, requiredPoints: e.target.value})}
                          />
                          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">PTS</span>
                        </div>
                     </div>
                  </div>
               </div>

               <div className="pt-6 border-t border-gray-100 dark:border-white/5 flex justify-end">
                  <button 
                    onClick={handleSave}
                    disabled={isSaving}
                    className="px-8 py-2.5 bg-brand-600 text-white rounded-lg font-bold hover:bg-brand-700 shadow-lg shadow-brand-500/20 transition-all flex items-center gap-2"
                  >
                    {isSaving && <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>}
                    {isSaving ? "Saving..." : "Update reward item"}
                  </button>
               </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden dark:bg-[#18181b] dark:border-white/10 shadow-sm relative group">
               <div className="p-8 flex flex-col items-center justify-center border-2 border-dashed border-gray-100 dark:border-white/5 rounded-2xl m-3 group-hover:border-brand-500/50 transition-colors">
                  <div className="w-16 h-16 bg-gray-50 dark:bg-white/5 rounded-full flex items-center justify-center mb-4">
                     <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a1 1 0 011.414 0L15 21M17 9l4.586-4.586a1 1 0 011.414 0L24 12" /></svg>
                  </div>
                  <p className="text-sm font-bold dark:text-white">Promotional thumbnail</p>
                  <p className="text-xs text-gray-500 mt-1">PNG or JPG up to 2MB</p>
               </div>
            </div>
         </div>

         <div className="space-y-8">
            <div className="bg-white border border-gray-200 rounded-2xl p-6 dark:bg-[#18181b] dark:border-white/10 shadow-sm">
               <h3 className="text-sm font-bold uppercase tracking-widest text-gray-400 mb-6 font-primary">Redemption stats</h3>
               <div className="space-y-6">
                  <div className="flex items-center gap-4">
                     <div className="w-10 h-10 rounded-full bg-success-50 dark:bg-success-500/10 flex items-center justify-center text-success-600">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                     </div>
                     <div>
                        <p className="text-xs text-gray-500 font-medium">Successful claims</p>
                        <p className="text-xl font-black dark:text-white">412</p>
                     </div>
                  </div>
                  <div className="flex items-center gap-4">
                     <div className="w-10 h-10 rounded-full bg-brand-50 dark:bg-brand-500/10 flex items-center justify-center text-brand-600">
                        <PieChartIcon className="w-5 h-5" />
                     </div>
                     <div>
                        <p className="text-xs text-gray-500 font-medium">Redemption rate</p>
                        <p className="text-xl font-black dark:text-white">12.5%</p>
                     </div>
                  </div>
               </div>
            </div>

            <div className="p-6 bg-brand-600 rounded-2xl text-white shadow-xl shadow-brand-600/20 relative overflow-hidden">
               <div className="relative z-10">
                  <h4 className="text-lg font-bold">Fulfillment engine</h4>
                  <p className="text-xs text-brand-100 mt-2 leading-relaxed">
                     This reward is configured for <span className="font-bold text-white uppercase">{formData.fulfillmentStrategy?.replace(/_/g, " ")}</span>.
                     Our automated router will handle the payout once confirmed.
                  </p>
                  <div className="mt-6 flex justify-between items-end">
                     <div>
                        <p className="text-[10px] text-brand-200 uppercase tracking-widest">Latency avg</p>
                        <p className="text-sm font-mono mt-1 font-bold">420ms</p>
                     </div>
                     <div className="p-1.5 bg-white/20 rounded-lg">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" /></svg>
                     </div>
                  </div>
               </div>
               <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-3xl -translate-y-12 translate-x-12"></div>
            </div>
         </div>
      </div>
    </div>
  );
}
