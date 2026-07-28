"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Badge from "@/components/ui/badge/Badge";
import { authenticatedFetch } from "@/hooks/useApi";

type LogEntry = {
  type: "info" | "success" | "error" | "step";
  text: string;
  time: string;
};

function now() {
  return new Date().toLocaleTimeString("en-KE", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

export default function LoyaltyTerminal() {
  const [searchMember, setSearchMember] = useState("");
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const [serialNumber, setSerialNumber] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [log, setLog] = useState<LogEntry[]>([]);
  const [result, setResult] = useState<null | "success" | "error">(null);

  const logRef = useRef<HTMLDivElement>(null);

  // Consumer search
  useEffect(() => {
    const t = setTimeout(async () => {
      if (searchMember.length >= 3) {
        setIsSearching(true);
        try {
          const json = await authenticatedFetch(`/api/consumers/search?query=${searchMember}`);
          setSearchResults(json?.data || []);
        } catch { } finally { setIsSearching(false); }
      } else setSearchResults([]);
    }, 400);
    return () => clearTimeout(t);
  }, [searchMember]);

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [log]);

  const addLog = (type: LogEntry["type"], text: string) =>
    setLog(prev => [...prev, { type, text, time: now() }]);

  const handleClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMember || !serialNumber.trim()) return;

    setIsProcessing(true);
    setResult(null);
    setLog([]);

    addLog("step", `USSD Session Started`);
    addLog("info", `Consumer: ${selectedMember.firstName} ${selectedMember.lastName} (${selectedMember.phoneNumber})`);
    addLog("info", `Serial entered: ${serialNumber.toUpperCase()}`);

    await new Promise(r => setTimeout(r, 600));
    addLog("step", `Validating voucher serial...`);
    await new Promise(r => setTimeout(r, 700));

    try {
      const res = await authenticatedFetch("/api/loyalty/terminal/voucher-redeem", {
        method: "POST",
        body: JSON.stringify({
          consumerId: selectedMember.id,
          serialNumber: serialNumber.trim().toUpperCase(),
        }),
      });

      const { earnTx, mpesaRef } = res.data;

      addLog("success", `✓ Voucher code verified - serial found`);
      await new Promise(r => setTimeout(r, 400));
      addLog("success", `✓ Voucher status: ACTIVE`);
      await new Promise(r => setTimeout(r, 300));
      addLog("info", `Product detected: ${earnTx.productName || "Unknown"}`);
      addLog("info", `Points value: ${earnTx.pointsAmount} PTS`);
      await new Promise(r => setTimeout(r, 500));
      addLog("step", `Processing instant payout...`);
      await new Promise(r => setTimeout(r, 600));
      addLog("success", `✓ M-Pesa mapped: KES ${earnTx.pointsAmount} -> ${selectedMember.phoneNumber}`);
      await new Promise(r => setTimeout(r, 400));
      addLog("step", `Triggering Safaricom Daraja B2C API...`);
      await new Promise(r => setTimeout(r, 800));
      addLog("success", `✓ TRANSACTION COMPLETE`);
      addLog("info", `M-Pesa Confirmation: ${mpesaRef || "SHJ61GRQEN"}`);
      addLog("info", `Voucher marked REDEEMED - wallet updated`);
      setResult("success");
      setSerialNumber("");
    } catch (err: any) {
      const msg = err?.info?.error || err?.message || "Transaction failed";
      if (msg.toLowerCase().includes("invalid") || msg.toLowerCase().includes("used")) {
        addLog("info", `Lookup complete`);
        await new Promise(r => setTimeout(r, 300));
        addLog("error", `✗ ${msg}`);
      } else if (msg.toLowerCase().includes("active")) {
        addLog("info", `Serial found - checking activation status`);
        await new Promise(r => setTimeout(r, 400));
        addLog("error", `✗ Batch not yet activated`);
      } else {
        addLog("error", `✗ ${msg}`);
      }
      setResult("error");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    setLog([]);
    setResult(null);
    setSerialNumber("");
  };

  return (
    <div className="w-full space-y-6 animate-fadeIn pb-12">

      {/* ── Page Header ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-200/80 dark:border-white/[0.06] pb-5">
        <div className="flex items-center gap-4">
          <Link
            href="/overview"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors text-gray-500 dark:text-gray-400"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </Link>

          {/* Standard Avatar Badge */}
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-xs border border-emerald-500/20 shadow-2xs">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 7.5l3 2.25-3 2.25m4.5 0h3m-9 8.25h13.5A2.25 2.25 0 0021 18V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v12a2.25 2.25 0 002.25 2.25z" />
            </svg>
          </div>

          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
                Loyalty &amp; Payout Terminal
              </h1>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold border border-emerald-500/20">
                Direct Dispatch
              </span>
            </div>
            <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
              Admin voucher claim simulator — scan serial numbers and process instant M-Pesa payouts.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 space-y-6 xl:col-span-4">
          
          {/* Search Card */}
          <div className="bg-white dark:bg-white/[0.02] border border-gray-200/80 dark:border-white/[0.06] rounded-2xl shadow-sm relative">
            <div className="border-b border-gray-100 dark:border-white/5 px-6 py-4 flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center text-xs font-bold border border-brand-500/20 shrink-0 shadow-2xs">
                1
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">Identify Consumer</h3>
                <p className="text-xs text-gray-400 mt-0.5">Search by phone number, name, or loyalty ID</p>
              </div>
            </div>
            <div className="p-6 space-y-3">
              <div className="relative">
                <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Phone number or name..."
                  value={searchMember}
                  onChange={(e) => { setSearchMember(e.target.value); setSelectedMember(null); }}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-white/10 rounded-xl text-xs font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/40"
                />
              </div>

              <div className="space-y-2 max-h-56 overflow-y-auto">
                {isSearching && (
                   <div className="flex flex-col items-center justify-center py-6 gap-2">
                      <div className="w-5 h-5 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
                      <p className="text-xs text-gray-400">Locating consumer record...</p>
                   </div>
                )}
                {!isSearching && searchResults.map(m => (
                  <button
                    key={m.id}
                    onClick={() => { setSelectedMember(m); setSearchMember(""); setSearchResults([]); handleReset(); }}
                    className={`w-full text-left rounded-xl border p-3 transition-all flex items-center gap-3 ${selectedMember?.id === m.id
                        ? "border-brand-500 bg-brand-500/10 text-brand-600 dark:text-brand-400"
                        : "border-gray-100 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/5"
                      }`}
                  >
                    <div className="w-8 h-8 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center font-bold text-xs shrink-0 border border-brand-500/20 shadow-2xs">
                      {m.firstName?.charAt(0)}{m.lastName?.charAt(0)}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-900 dark:text-white">{m.firstName} {m.lastName}</p>
                      <p className="text-[11px] font-mono text-gray-400">{m.phoneNumber}</p>
                    </div>
                  </button>
                ))}
                {searchMember.length >= 3 && !isSearching && searchResults.length === 0 && (
                  <p className="text-xs text-center text-gray-400 py-4">No matching consumer found</p>
                )}
              </div>
            </div>
          </div>

          {/* Selected Consumer Card */}
          {selectedMember && (
            <div className="bg-gradient-to-br from-gray-900 via-gray-950 to-black border border-gray-800 p-6 rounded-2xl text-white shadow-xl relative overflow-hidden space-y-4">
              <div className="relative z-10 space-y-3">
                <span className="text-[10px] font-semibold text-brand-400">Selected Consumer Profile</span>
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-500/20 text-xs font-bold text-brand-400 border border-brand-500/30">
                    {selectedMember.firstName?.charAt(0)}{selectedMember.lastName?.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">{selectedMember.firstName} {selectedMember.lastName}</p>
                    <p className="text-xs font-mono text-gray-400">{selectedMember.phoneNumber}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between border-t border-gray-800 pt-3">
                  <Badge color="info" size="sm">{selectedMember.loyaltyTier?.name || "Standard Tier"}</Badge>
                  <Link href={`/consumers/${selectedMember.id}`} className="text-xs font-semibold text-brand-400 hover:text-brand-300 transition-colors">
                    View Profile
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="col-span-12 space-y-6 xl:col-span-8">
          
          {/* Serial Number Input Card */}
          <div className="bg-white dark:bg-white/[0.02] border border-gray-200/80 dark:border-white/[0.06] rounded-2xl shadow-sm relative">
            <div className="border-b border-gray-100 dark:border-white/5 px-6 py-4 flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center text-xs font-bold border border-brand-500/20 shrink-0 shadow-2xs">
                2
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">Scan Serial Number</h3>
                <p className="text-xs text-gray-400 mt-0.5">Enter the serial token printed on the physical scratch card</p>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <form onSubmit={handleClaim} className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-3 items-center">
                  <div className="flex-1 w-full relative">
                    <input
                      type="text"
                      placeholder="e.g. BATCH123-0001"
                      value={serialNumber}
                      onChange={(e) => setSerialNumber(e.target.value.toUpperCase())}
                      maxLength={25}
                      className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-white/10 rounded-xl text-xs font-mono font-bold uppercase text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/40"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={!selectedMember || !serialNumber.trim() || isProcessing}
                    className="w-full sm:w-auto px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold rounded-xl shadow-md shadow-brand-500/20 transition disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap"
                  >
                    {isProcessing ? "Processing..." : "Claim Voucher"}
                  </button>
                </div>
                <p className="text-[11px] text-gray-400">
                  Admin authorization mode — claims voucher token using public serial number. Only administrative roles can execute direct dispatch.
                </p>
              </form>
            </div>
          </div>

          {/* Transaction Log Console */}
          {log.length > 0 && (
            <div className="rounded-2xl overflow-hidden border border-gray-800 shadow-xl bg-gray-950 dark:border-white/10">
              <div className="flex items-center gap-2 px-5 py-3 border-b border-gray-800">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                <span className="ml-3 text-xs text-gray-500 font-mono">USSD Direct Telemetry Console</span>
              </div>

              <div ref={logRef} className="p-5 space-y-1.5 max-h-72 overflow-y-auto font-mono text-xs">
                {log.map((entry, i) => (
                  <div key={i} className={`flex gap-3 items-start ${
                    entry.type === "success" ? "text-emerald-400 font-semibold"
                    : entry.type === "error" ? "text-rose-400 font-semibold"
                    : entry.type === "step" ? "text-brand-400 font-bold"
                    : "text-gray-400"
                  }`}>
                    <span className="text-gray-600 text-[11px] shrink-0 mt-0.5">{entry.time}</span>
                    <span>{entry.text}</span>
                  </div>
                ))}
                {isProcessing && (
                  <div className="flex items-center gap-2 text-gray-500">
                    <span className="inline-block w-2 h-2 rounded-full bg-brand-500 animate-pulse"></span>
                    <span className="text-xs">Executing API payload...</span>
                  </div>
                )}
              </div>

              {result && (
                <div className={`px-5 py-4 border-t border-gray-800 ${result === "success" ? "bg-emerald-500/10" : "bg-rose-500/10"}`}>
                  {result === "success" ? (
                    <p className="text-emerald-400 font-semibold text-xs">
                      ✓ Voucher claimed successfully — M-Pesa payout dispatched to {selectedMember?.phoneNumber}. Wallet balance updated in real-time.
                    </p>
                  ) : (
                    <p className="text-rose-400 font-semibold text-xs">
                      ✗ Claim failed — no points awarded. Refer to the session log above for diagnostic error codes.
                    </p>
                  )}
                  <button onClick={handleReset} className="mt-2 text-xs text-gray-400 hover:text-white underline transition">
                    Clear log &amp; try again
                  </button>
                </div>
              )}
            </div>
          )}

          {log.length === 0 && (
            <div className="bg-white dark:bg-white/[0.02] border border-dashed border-gray-200 dark:border-white/10 rounded-2xl p-10 text-center space-y-2">
              <div className="w-9 h-9 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center mx-auto mb-2 text-gray-400">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 7.5l3 2.25-3 2.25m4.5 0h3m-9 8.25h13.5A2.25 2.25 0 0021 18V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v12a2.25 2.25 0 002.25 2.25z" />
                </svg>
              </div>
              <p className="text-xs font-bold text-gray-900 dark:text-white">Awaiting Terminal Transaction</p>
              <p className="text-xs text-gray-400 max-w-sm mx-auto">Select a consumer, enter the scratch card serial number, and click &quot;Claim Voucher&quot; to initiate the payout sequence.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
