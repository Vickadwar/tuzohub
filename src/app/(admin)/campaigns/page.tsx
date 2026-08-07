"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Badge from "@/components/ui/badge/Badge";
import { useApi } from "@/hooks/useApi";

export default function CampaignsList() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ACTIVE" | "PAUSED">("ALL");
  const { data: result, isLoading, isError } = useApi<any>("/campaigns");
  const [filteredCampaigns, setFilteredCampaigns] = useState<any[]>([]);

  useEffect(() => {
    if (result && Array.isArray(result)) {
      const filtered = result.filter((c: any) => {
        const matchesSearch =
          c.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (c.campaignType && c.campaignType.toLowerCase().includes(searchTerm.toLowerCase()));
        
        const matchesStatus =
          statusFilter === "ALL" ||
          (statusFilter === "ACTIVE" && c.isActive) ||
          (statusFilter === "PAUSED" && !c.isActive);

        return matchesSearch && matchesStatus;
      });
      setFilteredCampaigns(filtered);
    }
  }, [searchTerm, statusFilter, result]);

  const activeCount = Array.isArray(result) ? result.filter((c: any) => c.isActive).length : 0;
  const pausedCount = Array.isArray(result) ? result.filter((c: any) => !c.isActive).length : 0;

  if (isError) {
    return (
      <div className="w-full p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center gap-3">
        <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <p className="text-xs font-semibold">Failed to load marketing campaigns. Please check your network connection.</p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 animate-fadeIn pb-10">
      {/* ── Page Header ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-200/80 dark:border-white/[0.06] pb-5">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
              Campaigns &amp; Rules Master Engine
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400 text-xs font-semibold border border-brand-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-pulse" />
              Universal Engine Active
            </span>
          </div>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Multi-tenant orchestration for scratch codes, instant M-Pesa payouts, banked points, and velocity caps.
          </p>
        </div>
        <Link
          href="/campaigns/new"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-2.5 text-xs font-semibold text-white shadow-md shadow-brand-500/20 hover:bg-brand-700 transition-all shrink-0"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Create New Campaign
        </Link>
      </div>

      {/* ── Top Metric Cards Banner ─────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-white/[0.02] border border-gray-200/80 dark:border-white/[0.06] p-4 rounded-2xl shadow-sm flex items-center gap-3">
          <div className="p-3 bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-xl shrink-0">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">Total Campaigns</p>
            <p className="text-sm font-bold text-gray-900 dark:text-white">{result?.length || 0} Registered</p>
          </div>
        </div>

        <div className="bg-white dark:bg-white/[0.02] border border-gray-200/80 dark:border-white/[0.06] p-4 rounded-2xl shadow-sm flex items-center gap-3">
          <div className="p-3 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl shrink-0">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">Active Promos</p>
            <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{activeCount} Running</p>
          </div>
        </div>

        <div className="bg-white dark:bg-white/[0.02] border border-gray-200/80 dark:border-white/[0.06] p-4 rounded-2xl shadow-sm flex items-center gap-3">
          <div className="p-3 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-xl shrink-0">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">Paused Rules</p>
            <p className="text-sm font-bold text-amber-600 dark:text-amber-400">{pausedCount} Paused</p>
          </div>
        </div>

        <div className="bg-white dark:bg-white/[0.02] border border-gray-200/80 dark:border-white/[0.06] p-4 rounded-2xl shadow-sm flex items-center gap-3">
          <div className="p-3 bg-brand-500/10 text-brand-600 dark:text-brand-400 rounded-xl shrink-0">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">Circuit Breakers</p>
            <p className="text-sm font-bold text-gray-900 dark:text-white">Active Budget Caps</p>
          </div>
        </div>
      </div>

      {/* ── Data Grid Card ───────────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-white/[0.02] border border-gray-200/80 dark:border-white/[0.06] rounded-2xl overflow-hidden shadow-sm flex flex-col">

        {/* Toolbar & Search */}
        <div className="border-b border-gray-100 dark:border-white/5 p-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative w-full sm:max-w-md">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
            <input
              type="text"
              placeholder="Search by campaign name or rules..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-white/10 rounded-xl text-xs font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/40"
            />
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center bg-gray-100 dark:bg-white/[0.03] p-1 rounded-xl">
              {(["ALL", "ACTIVE", "PAUSED"] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1 text-[11px] font-semibold rounded-lg transition-all ${
                    statusFilter === st
                      ? "bg-white dark:bg-white/10 text-gray-900 dark:text-white shadow-xs"
                      : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                  }`}
                >
                  {st === "ALL" ? "All" : st === "ACTIVE" ? "Active" : "Paused"}
                </button>
              ))}
            </div>

            <span className="text-xs font-semibold text-gray-400 whitespace-nowrap">
              {filteredCampaigns.length} {filteredCampaigns.length === 1 ? "Campaign" : "Campaigns"}
            </span>
          </div>
        </div>

        {/* Table Area */}
        <div className="w-full overflow-x-auto">
          {isLoading ? (
            <div className="flex min-h-[300px] w-full items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-500 border-t-transparent"></div>
            </div>
          ) : (
            <Table className="w-full">
              <TableHeader>
                <TableRow className="bg-gray-50/50 dark:bg-white/[0.01]">
                  <TableCell isHeader className="py-3.5 px-6 text-xs font-semibold text-gray-500 dark:text-gray-400">Campaign Blueprint &amp; Identity</TableCell>
                  <TableCell isHeader className="py-3.5 px-6 text-xs font-semibold text-gray-500 dark:text-gray-400">Reward Fulfillment Mode</TableCell>
                  <TableCell isHeader className="py-3.5 px-6 text-xs font-semibold text-gray-500 dark:text-gray-400">Reward Value</TableCell>
                  <TableCell isHeader className="py-3.5 px-6 text-xs font-semibold text-gray-500 dark:text-gray-400">Multiplier</TableCell>
                  <TableCell isHeader className="py-3.5 px-6 text-xs font-semibold text-gray-500 dark:text-gray-400">Status</TableCell>
                  <TableCell isHeader className="py-3.5 px-6 text-xs font-semibold text-gray-500 dark:text-gray-400 text-right">Actions</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.04]">
                {filteredCampaigns.length > 0 ? (
                  filteredCampaigns.map((campaign) => {
                    const ruleObj = campaign.rules?.[0]?.configuration || {};
                    const isInstant = ruleObj.fulfillmentMode === "INSTANT_PAYOUT";
                    const isMpesa = ruleObj.payoutRewardType === "MOBILE_MONEY";
                    const isAirtime = ruleObj.payoutRewardType === "AIRTIME";

                    return (
                      <TableRow key={campaign.id} className="hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition-colors">

                        <TableCell className="py-3.5 px-6">
                          <div className="flex items-center gap-3">
                            <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-bold text-xs border shadow-2xs ${
                              isInstant
                                ? isAirtime
                                  ? "bg-brand-500/10 text-brand-600 border-brand-500/20"
                                  : "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                                : "bg-purple-500/10 text-purple-600 border-purple-500/20"
                            }`}>
                              {campaign.name?.charAt(0) || "C"}
                            </div>
                            <div className="flex flex-col">
                              <span className="text-xs font-bold text-gray-900 dark:text-white">
                                {campaign.name}
                              </span>
                              <span className="text-[11px] text-gray-400 line-clamp-1 max-w-[240px]">
                                {campaign.description || "No description provided"}
                              </span>
                            </div>
                          </div>
                        </TableCell>

                        <TableCell className="py-3.5 px-6">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-bold font-mono uppercase border ${
                            isInstant
                              ? isAirtime
                                ? "bg-brand-500/10 text-brand-600 border-brand-500/20"
                                : "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                              : "bg-purple-500/10 text-purple-600 border-purple-500/20"
                          }`}>
                            {isInstant ? (isAirtime ? "⚡ INSTANT AIRTIME" : "⚡ INSTANT M-PESA CASH") : "🪙 BANKED POINTS"}
                          </span>
                        </TableCell>

                        <TableCell className="py-3.5 px-6">
                          <span className="text-xs font-mono font-bold text-gray-900 dark:text-white">
                            {isInstant
                              ? `KES ${ruleObj.instantCashAmount || 100} Cash`
                              : `${ruleObj.pointsPerScan || 50} Pts/Scan`}
                          </span>
                        </TableCell>

                        <TableCell className="py-3.5 px-6">
                          <span className="px-2.5 py-1 rounded-lg bg-brand-500/10 text-brand-600 dark:text-brand-400 font-mono text-xs font-bold">
                            {campaign.pointsMultiplier}x
                          </span>
                        </TableCell>

                        <TableCell className="py-3.5 px-6">
                          <Badge
                            size="sm"
                            color={campaign.isActive ? "success" : "warning"}
                          >
                            {campaign.isActive ? "Active" : "Paused"}
                          </Badge>
                        </TableCell>

                        <TableCell className="py-3.5 px-6 text-right">
                          <Link
                            href={`/campaigns/${campaign.id}`}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-brand-500/10 text-brand-600 dark:text-brand-400 text-xs font-semibold rounded-lg hover:bg-brand-500/20 transition-all"
                          >
                            Configure
                            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                            </svg>
                          </Link>
                        </TableCell>

                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="py-20 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <div className="p-4 bg-gray-50 dark:bg-white/5 rounded-full mb-3 text-gray-400">
                          <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                          </svg>
                        </div>
                        <span className="text-xs font-semibold text-gray-900 dark:text-white">
                          {searchTerm ? "No campaigns match your search" : "No Marketing Campaigns Found"}
                        </span>
                        <span className="text-xs text-gray-400 mt-1">
                          {searchTerm ? "Try searching for a different keyword." : "Get started by creating your first promotional rule."}
                        </span>
                      </div>
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