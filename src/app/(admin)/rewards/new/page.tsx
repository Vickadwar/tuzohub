"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";
import Select from "@/components/form/Select";
import { ChevronDownIcon, BoxCubeIcon } from "@/icons";

export default function NewReward() {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    rewardType: "MOBILE_MONEY",
    fulfillmentStrategy: "AUTOMATED_PAYOUT",
    requiredPoints: "",
    categoryId: null
  });

  const rewardTypeOptions = [
    { value: "AIRTIME", label: "Mobile Airtime" },
    { value: "MOBILE_MONEY", label: "Mobile Money" },
    { value: "BANK_TRANSFER", label: "Bank Transfer" },
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.requiredPoints) return;
    
    setIsSaving(true);
    try {
      const res = await fetch("/api/rewards/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        router.push("/rewards");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8 max-w-3xl mx-auto animate-in fade-in duration-500 pb-12">
      <div className="flex items-center gap-4">
        <Link
          href="/rewards"
          className="p-2.5 rounded-full border border-gray-200 text-gray-500 hover:bg-gray-50 dark:border-white/10 dark:hover:bg-white/5 transition"
        >
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </Link>
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Create new reward item
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Define a new gift and set the points value for redemption.
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-8 dark:border-white/10 dark:bg-[#18181b] shadow-xl shadow-gray-200/20 dark:shadow-none">
        <form className="space-y-10" onSubmit={handleSubmit}>
          
          {/* Section 1: Basic Info */}
          <div>
            <div className="flex items-center gap-2 mb-6">
               <div className="w-6 h-6 rounded-full bg-brand-50 dark:bg-brand-500/10 flex items-center justify-center text-[10px] font-black text-brand-600">1</div>
               <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400">Reward foundation</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="md:col-span-2">
                <Label className="mb-2">Reward name <span className="text-error-500">*</span></Label>
                <Input 
                  placeholder="e.g. 500 KSH Airtime Top-up" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  required
                />
              </div>

              <div>
                <Label className="mb-2">Fulfillment type</Label>
                <Select 
                   options={rewardTypeOptions}
                   value={formData.rewardType}
                   onChange={(val) => setFormData({...formData, rewardType: val})}
                />
              </div>

               <div>
                <Label className="mb-2">Fulfillment strategy</Label>
                <Select 
                   options={fulfillmentOptions}
                   value={formData.fulfillmentStrategy}
                   onChange={(val) => setFormData({...formData, fulfillmentStrategy: val})}
                />
              </div>
            </div>
          </div>

          {/* Section 2: Economics */}
          <div className="pt-10 border-t border-gray-100 dark:border-white/5">
            <div className="flex items-center gap-2 mb-6">
               <div className="w-6 h-6 rounded-full bg-brand-50 dark:bg-brand-500/10 flex items-center justify-center text-[10px] font-black text-brand-600">2</div>
               <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400">Economic mapping</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div>
                  <Label className="mb-2">Required points for redemption</Label>
                  <div className="relative">
                    <Input 
                      type="number" 
                      placeholder="e.g. 1000" 
                      value={formData.requiredPoints}
                      onChange={(e) => setFormData({...formData, requiredPoints: e.target.value})}
                      required
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-gray-400">PTS</span>
                  </div>
               </div>
            </div>
          </div>

          {/* Section 3: Visuals */}
          <div className="pt-10 border-t border-gray-100 dark:border-white/5">
            <div className="flex items-center gap-2 mb-6">
               <div className="w-6 h-6 rounded-full bg-brand-50 dark:bg-brand-500/10 flex items-center justify-center text-[10px] font-black text-brand-600">3</div>
               <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400">Visual presentation</h3>
            </div>
            <div className="rounded-2xl border-2 border-dashed border-gray-100 dark:border-white/5 p-12 flex flex-col items-center justify-center text-center group hover:border-brand-500/50 transition-all bg-gray-50/50 dark:bg-white/[0.01]">
               <div className="p-4 bg-white dark:bg-white/5 rounded-full mb-4 shadow-sm group-hover:scale-110 transition-transform">
                  <svg className="w-10 h-10 text-gray-400 group-hover:text-brand-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a1 1 0 011.414 0L15 21M17 9l4.586-4.586a1 1 0 011.414 0L24 12" /></svg>
               </div>
               <p className="text-sm font-bold text-gray-900 dark:text-white">Upload promotional thumbnail</p>
               <p className="text-xs text-gray-500 mt-1">Recommended size: 800x800px (PNG/JPG)</p>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-10 border-t border-gray-100 dark:border-white/5">
            <Link 
              href="/rewards"
              className="px-6 py-2.5 text-sm font-bold text-gray-500 hover:text-gray-700 transition"
            >
              Cancel
            </Link>
            <button 
              type="submit"
              disabled={isSaving}
              className="px-10 py-3 text-sm font-black text-white bg-brand-600 rounded-lg hover:bg-brand-700 shadow-xl shadow-brand-600/30 transition active:scale-95 disabled:opacity-50 flex items-center gap-2"
            >
              {isSaving && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>}
              {isSaving ? "Saving..." : "Deploy reward item"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
