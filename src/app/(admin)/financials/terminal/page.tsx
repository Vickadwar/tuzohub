"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";
import { ArrowDownIcon, ArrowUpIcon, GroupIcon } from "@/icons";
import { useApi } from "@/hooks/useApi";

export default function BankingTerminal() {
  const [operationType, setOperationType] = useState<"BANKING" | "VOUCHER" | "PURCHASE">("BANKING");
  const [searchMember, setSearchMember] = useState("");
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [points, setPoints] = useState("");
  const [voucherCode, setVoucherCode] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [reason, setReason] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [statusMessage, setStatusMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  const { data: productsRes } = useApi<any[]>("/products");
  const products = productsRes || [];

  // Search effect
  useEffect(() => {
    const handler = setTimeout(async () => {
      if (searchMember.length >= 3) {
        setIsSearching(true);
        try {
          const res = await fetch(`/api/consumers/search?query=${searchMember}`);
          const json = await res.json();
          if (json.success) setSearchResults(json.data);
        } catch (e) {
          console.error("Search failed", e);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
      }
    }, 500);
    return () => clearTimeout(handler);
  }, [searchMember]);

  const handleAuthorize = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMember) return;

    setIsProcessing(true);
    setStatusMessage(null);
    try {
      let endpoint = "";
      let payload = {};

      if (operationType === "BANKING") {
        endpoint = "/api/loyalty/terminal/bank";
        payload = { consumerId: selectedMember.id, points, type: "BANK", description: reason };
      } else if (operationType === "VOUCHER") {
        endpoint = "/api/loyalty/terminal/voucher-redeem";
        payload = { consumerId: selectedMember.id, voucherCode };
      } else {
        endpoint = "/api/loyalty/terminal/simulate-purchase";
        payload = { 
          consumerId: selectedMember.id, 
          productId: selectedProduct.id, 
          quantity: 1, 
          totalAmount: 1000 
        };
      }
      
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const response = await res.json();

      if (response.success) {
        setStatusMessage({ type: 'success', text: "Transaction successful!" });
        setPoints("");
        setVoucherCode("");
        setReason("");
      } else {
        setStatusMessage({ type: 'error', text: response.error || "Transaction failed" });
      }
    } catch (e: any) {
      setStatusMessage({ type: 'error', text: "Network error during transaction" });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white/90 font-black tracking-tight">
            TuZoHub <span className="text-brand-500">Ops Terminal</span>
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Perform wallet operations and simulate consumer activity.
          </p>
        </div>
      </div>

      {statusMessage && (
        <div className={`p-4 rounded-xl border-2 ${statusMessage.type === 'success' ? 'bg-success-50 border-success-200 text-success-700' : 'bg-error-50 border-error-200 text-error-700'} animate-bounce-short`}>
          <p className="font-black text-center uppercase tracking-widest text-xs">{statusMessage.text}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] shadow-theme-sm">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">1. Member Verification</h3>
            <div className="relative mb-4">
              <Input 
                placeholder="Search Phone or Name..."
                value={searchMember}
                onChange={(e) => setSearchMember(e.target.value)}
                className="pl-10"
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                {isSearching ? (
                  <div className="w-4 h-4 border-2 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                )}
              </span>
            </div>

            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {searchResults.length > 0 ? (
                searchResults.map(member => (
                  <button
                    key={member.id}
                    onClick={() => setSelectedMember(member)}
                    className={`w-full p-3 rounded-xl border text-left transition-all ${selectedMember?.id === member.id ? 'border-brand-500 bg-brand-50/50 dark:bg-brand-500/10 shadow-sm' : 'border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50'}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                        <GroupIcon className="w-4 h-4 text-gray-500"/>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-gray-800 dark:text-gray-200 truncate">{member.firstName} {member.lastName}</p>
                        <p className="text-xs text-gray-500 font-mono tracking-tighter">{member.phoneNumber}</p>
                      </div>
                    </div>
                  </button>
                ))
              ) : searchMember.length >= 3 && !isSearching ? (
                <p className="text-center text-xs text-gray-400 py-4">No consumer found</p>
              ) : null}
            </div>
          </div>

          {selectedMember && (
            <div className="rounded-2xl border-2 border-brand-500 bg-brand-500 p-6 text-white shadow-xl shadow-brand-500/20 relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-150 transition-transform">
                  <GroupIcon className="w-24 h-24"/>
               </div>
               <p className="text-xs font-black uppercase opacity-80 mb-1 tracking-widest">LOYALTY #{selectedMember.loyaltyNumber}</p>
               <h4 className="text-3xl font-black">{selectedMember.firstName} {selectedMember.lastName}</h4>
               <div className="mt-4 flex items-center justify-between gap-2">
                  <span className="text-[10px] bg-white text-brand-600 px-3 py-1 rounded-full uppercase font-black tracking-tighter shadow-sm">{selectedMember.loyaltyTier?.name || "Standard Member"}</span>
                  <Link href={`/consumers/${selectedMember.id}`} className="text-xs font-bold border-b border-white/50 hover:border-white transition-all">Member Profile</Link>
               </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03] shadow-theme-sm relative">
             <div className="flex p-1.5 bg-gray-100/50 dark:bg-gray-900/50 rounded-2xl mb-8 space-x-1">
                {[
                  { id: "BANKING", label: "Bank Points", color: "text-success-600 border-success-500" },
                  { id: "VOUCHER", label: "Redeem Code", color: "text-brand-600 border-brand-500" },
                  { id: "PURCHASE", label: "Simulate Sale", color: "text-blue-600 border-blue-500" }
                ].map(op => (
                  <button 
                    key={op.id}
                    onClick={() => setOperationType(op.id as any)}
                    className={`flex-1 flex flex-col items-center py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${operationType === op.id ? `bg-white dark:bg-gray-800 ${op.color.split(' ')[0]} shadow-lg border-b-4 ${op.color.split(' ')[1]}` : 'text-gray-400 hover:text-gray-600'}`}
                  >
                     {op.label}
                  </button>
                ))}
             </div>

             <form className="space-y-6" onSubmit={handleAuthorize}>
                {operationType === "BANKING" && (
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="col-span-2 md:col-span-1">
                         <Label>Banking Points</Label>
                         <Input 
                           type="number" 
                           placeholder="e.g. 500"
                           value={points}
                           onChange={(e) => setPoints(e.target.value)}
                           className="text-xl font-black py-4"
                         />
                      </div>
                      <div className="col-span-2 md:col-span-1">
                         <Label>Batch / Reference</Label>
                         <Input 
                           type="text" 
                           placeholder="e.g. REF-10293"
                           value={reason}
                           onChange={(e) => setReason(e.target.value)}
                         />
                      </div>
                   </div>
                )}

                {operationType === "VOUCHER" && (
                   <div className="space-y-4">
                      <Label>10-Character Secure Code</Label>
                      <Input 
                        placeholder="e.g. A1B2C3D4E5"
                        value={voucherCode}
                        onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
                        className="text-2xl font-black tracking-[0.5em] text-center uppercase py-5 font-mono"
                      />
                      <p className="text-[10px] text-center text-gray-400 font-bold uppercase tracking-widest">Verify the scratch-off code before authorizing</p>
                   </div>
                )}

                {operationType === "PURCHASE" && (
                   <div className="grid grid-cols-1 gap-6">
                      <div>
                         <Label>Select Product to Simulate</Label>
                         <div className="grid grid-cols-2 gap-3 mt-2">
                            {products.map((p: any) => (
                               <button 
                                 key={p.id}
                                 type="button"
                                 onClick={() => setSelectedProduct(p)}
                                 className={`p-4 rounded-xl border-2 text-left transition-all ${selectedProduct?.id === p.id ? 'border-blue-500 bg-blue-50/20' : 'border-gray-100 hover:border-blue-200'}`}
                               >
                                  <p className="text-xs font-black text-gray-800">{p.name}</p>
                                  <p className="text-[10px] font-bold text-blue-500 uppercase mt-1">+{p.pointsPerUnit} PTS / UNIT</p>
                               </button>
                            ))}
                         </div>
                      </div>
                   </div>
                )}

                <div className="pt-6">
                   <button 
                     disabled={!selectedMember || isProcessing}
                     className={`w-full py-5 rounded-2xl text-lg font-black text-white shadow-2xl transition-all active:scale-95 disabled:opacity-50 disabled:grayscale ${operationType === 'BANKING' ? 'bg-success-600' : operationType === 'VOUCHER' ? 'bg-brand-500' : 'bg-blue-600'}`}
                   >
                     {isProcessing ? 'COMMITTING...' : `EXECUTE ${operationType}`}
                   </button>
                </div>
             </form>
          </div>
        </div>
      </div>
    </div>
  );
}
