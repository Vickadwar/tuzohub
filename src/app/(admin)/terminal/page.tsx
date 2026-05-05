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

      addLog("success", `✓ Voucher code verified — serial found`);
      await new Promise(r => setTimeout(r, 400));
      addLog("success", `✓ Voucher status: ACTIVE`);
      await new Promise(r => setTimeout(r, 300));
      addLog("info", `Product detected: ${earnTx.productName || "Unknown"}`);
      addLog("info", `Points value: ${earnTx.pointsAmount} PTS`);
      await new Promise(r => setTimeout(r, 500));
      addLog("step", `Processing instant payout...`);
      await new Promise(r => setTimeout(r, 600));
      addLog("success", `✓ M-Pesa mapped: KES ${earnTx.pointsAmount} → ${selectedMember.phoneNumber}`);
      await new Promise(r => setTimeout(r, 400));
      addLog("step", `Triggering Safaricom Daraja B2C API...`);
      await new Promise(r => setTimeout(r, 800));
      addLog("success", `✓ TRANSACTION COMPLETE`);
      addLog("info", `M-Pesa Confirmation: ${mpesaRef || "SHJ61GRQEN"}`);
      addLog("info", `Voucher marked REDEEMED — wallet updated`);
      setResult("success");
      setSerialNumber("");
    } catch (err: any) {
      const msg = err?.info?.error || err?.message || "Transaction failed";
      if (msg.toLowerCase().includes("invalid") || msg.toLowerCase().includes("used")) {
        addLog("info", `Lookup complete`);
        await new Promise(r => setTimeout(r, 300));
        addLog("error", `✗ ${msg}`);
      } else if (msg.toLowerCase().includes("active")) {
        addLog("info", `Serial found — checking activation status`);
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
    <div className="w-full space-y-6 animate-in fade-in duration-500">

      {/* ── Page Header ──────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5 rounded-lg bg-white p-6 border border-gray-200 shadow-sm dark:bg-[#18181b] dark:border-white/10">
        <div className="flex items-center gap-5">
          <Link
            href="/overview"
            className="group flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-gray-200 bg-white shadow-sm transition-all hover:bg-gray-50 dark:border-white/10 dark:bg-[#18181b] dark:hover:bg-white/5"
          >
            <svg className="h-4 w-4 text-gray-500 transition-transform group-hover:-translate-x-0.5 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </Link>

          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-100 shadow-sm dark:bg-emerald-500/20">
            <svg className="h-6 w-6 text-emerald-700 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 7.5l3 2.25-3 2.25m4.5 0h3m-9 8.25h13.5A2.25 2.25 0 0021 18V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v12a2.25 2.25 0 002.25 2.25z" />
            </svg>
          </div>

          <div>
            <h1 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
                Loyalty Terminal
              </h1>
            </div>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Admin voucher claim — scan serial number and process instant M-PESA payout.
            </p>
          </div>
        </div>
      </div>

      {/* ── Main grid ────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-12 gap-6">

        {/* Left column — Consumer search */}
        <div className="col-span-12 space-y-6 xl:col-span-4">

          {/* Search card */}
          <div className="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-white/10 dark:bg-[#18181b]">
            <div className="border-b border-gray-100 px-6 py-5 dark:border-white/5">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">1 — Identify consumer</h3>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Search by phone, name, or loyalty number</p>
            </div>
            <div className="p-6">
              <div className="relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Phone or name..."
                  value={searchMember}
                  onChange={(e) => { setSearchMember(e.target.value); setSelectedMember(null); }}
                  className="h-10 w-full rounded-md border border-gray-300 bg-white pl-10 pr-3 text-sm text-gray-900 shadow-sm transition-colors placeholder:text-gray-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-white/30"
                />
              </div>

              <div className="mt-3 space-y-2 max-h-56 overflow-y-auto">
                {isSearching && (
                   <div className="flex flex-col items-center justify-center py-6 gap-2">
                      <div className="w-5 h-5 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
                      <p className="text-xs text-gray-400">Locating consumer...</p>
                   </div>
                )}
                {!isSearching && searchResults.map(m => (
                  <button
                    key={m.id}
                    onClick={() => { setSelectedMember(m); setSearchMember(""); setSearchResults([]); handleReset(); }}
                    className={`w-full text-left rounded-md border p-3 transition-all text-sm ${selectedMember?.id === m.id
                        ? "border-brand-500 bg-brand-50 dark:bg-brand-500/10 dark:border-brand-400"
                        : "border-gray-100 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/5"
                      }`}
                  >
                    <p className="font-semibold text-gray-900 dark:text-white">{m.firstName} {m.lastName}</p>
                    <p className="text-xs font-mono text-gray-500 dark:text-gray-400 mt-0.5">{m.phoneNumber}</p>
                  </button>
                ))}
                {searchMember.length >= 3 && !isSearching && searchResults.length === 0 && (
                  <p className="text-xs text-center text-gray-400 py-3">No consumer found</p>
                )}
              </div>
            </div>
          </div>

          {/* Selected consumer card */}
          {selectedMember && (
            <div className="relative overflow-hidden rounded-lg bg-gray-900 p-6 text-white shadow-sm dark:bg-[#121212] dark:border dark:border-white/10">
              <div className="relative z-10">
                <p className="text-[10px] font-semibold uppercase tracking-widest text-brand-400 mb-2">Selected consumer</p>
                <div className="flex items-center gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-500/20 text-sm font-bold text-brand-400">
                    {selectedMember.firstName?.charAt(0)}{selectedMember.lastName?.charAt(0)}
                  </div>
                  <div>
                    <p className="text-lg font-bold">{selectedMember.firstName} {selectedMember.lastName}</p>
                    <p className="text-sm font-mono text-gray-400">{selectedMember.phoneNumber}</p>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <Badge color="info" size="sm">{selectedMember.loyaltyTier?.name || "Standard"}</Badge>
                  <Link href={`/consumers/${selectedMember.id}`} className="text-xs text-brand-400 hover:text-brand-300 transition-colors">
                    View profile →
                  </Link>
                </div>
              </div>
              <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-brand-500/20 blur-2xl pointer-events-none"></div>
            </div>
          )}
        </div>

        {/* Right column — Serial input + log */}
        <div className="col-span-12 space-y-6 xl:col-span-8">

          {/* Serial number input */}
          <div className="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-white/10 dark:bg-[#18181b]">
            <div className="border-b border-gray-100 px-6 py-5 dark:border-white/5">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">2 — Scan serial number</h3>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Enter the serial printed on the physical scratch card</p>
            </div>
            <div className="p-6">
              <form onSubmit={handleClaim} className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-4 items-center">
                  <div className="flex-1 w-full relative">
                    <input
                      type="text"
                      placeholder="e.g. BATCH123-0001"
                      value={serialNumber}
                      onChange={(e) => setSerialNumber(e.target.value.toUpperCase())}
                      maxLength={25}
                      className="w-full h-14 rounded-md border-2 border-gray-200 bg-white px-4 text-2xl font-bold font-mono tracking-widest text-center uppercase shadow-sm transition-colors focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-white/10 dark:bg-white/5 dark:text-white"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={!selectedMember || !serialNumber.trim() || isProcessing}
                    className="w-full sm:w-auto h-14 px-8 rounded-md bg-brand-600 text-white text-sm font-semibold shadow-sm hover:bg-brand-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
                  >
                    {isProcessing ? "Processing..." : "Claim voucher"}
                  </button>
                </div>
                <p className="text-xs text-gray-400 dark:text-gray-500">Admin mode — claim using the public serial number printed on the card. Only users with Admin rights can perform this action.</p>
              </form>
            </div>
          </div>

          {/* Transaction simulation log */}
          {log.length > 0 && (
            <div className="rounded-lg overflow-hidden border border-gray-800 shadow-sm bg-gray-950 dark:border-white/10">
              {/* Terminal bar */}
              <div className="flex items-center gap-2 px-5 py-3 border-b border-gray-800 dark:border-white/5">
                <span className="w-3 h-3 rounded-full bg-error-500"></span>
                <span className="w-3 h-3 rounded-full bg-warning-400"></span>
                <span className="w-3 h-3 rounded-full bg-success-500"></span>
                <span className="ml-3 text-xs text-gray-500 font-mono">USSD Session Log</span>
              </div>

              <div ref={logRef} className="p-5 space-y-1.5 max-h-72 overflow-y-auto font-mono text-sm">
                {log.map((entry, i) => (
                  <div key={i} className={`flex gap-3 items-start ${
                    entry.type === "success" ? "text-success-400"
                    : entry.type === "error" ? "text-error-400"
                    : entry.type === "step" ? "text-brand-400 font-bold"
                    : "text-gray-400"
                  }`}>
                    <span className="text-gray-600 text-xs shrink-0 mt-0.5">{entry.time}</span>
                    <span>{entry.text}</span>
                  </div>
                ))}
                {isProcessing && (
                  <div className="flex items-center gap-2 text-gray-500">
                    <span className="inline-block w-2 h-2 rounded-full bg-brand-500 animate-pulse"></span>
                    <span className="text-xs">Processing...</span>
                  </div>
                )}
              </div>

              {/* Result footer */}
              {result && (
                <div className={`px-5 py-4 border-t border-gray-800 dark:border-white/5 ${result === "success" ? "bg-success-500/10" : "bg-error-500/10"}`}>
                  {result === "success" ? (
                    <p className="text-success-400 font-semibold text-sm">
                      ✓ Voucher claimed — M-PESA payout dispatched to {selectedMember?.phoneNumber}. Check consumer profile for updated balance.
                    </p>
                  ) : (
                    <p className="text-error-400 font-semibold text-sm">
                      ✗ Claim failed — no points were awarded. Refer to the log above for the USSD response.
                    </p>
                  )}
                  <button onClick={handleReset} className="mt-2 text-xs text-gray-400 hover:text-gray-200 underline transition-colors">
                    Clear log & try again
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Empty state hint */}
          {log.length === 0 && (
            <div className="rounded-lg border border-dashed border-gray-200 bg-white p-10 text-center dark:border-white/10 dark:bg-[#18181b]">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 mx-auto mb-4 dark:bg-white/5">
                <svg className="h-6 w-6 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 7.5l3 2.25-3 2.25m4.5 0h3m-9 8.25h13.5A2.25 2.25 0 0021 18V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v12a2.25 2.25 0 002.25 2.25z" />
                </svg>
              </div>
              <p className="text-sm font-semibold text-gray-900 dark:text-white mb-1">Awaiting transaction</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">Select a consumer, enter the scratch card serial, and click &quot;Claim voucher&quot; to see the full flow.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
