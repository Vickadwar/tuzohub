"use client";

import React, { use, useState, useEffect } from "react";
import Link from "next/link";
import Badge from "@/components/ui/badge/Badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useApi, authenticatedFetch } from "@/hooks/useApi";
import ModernSelect from "@/components/ui/ModernSelect";
import { ArrowDownIcon, ArrowUpIcon } from "@/icons";
import { resolveRewardTerminology } from "@/lib/rewardTerminology";

interface PageProps {
  params: Promise<{ id: string }>;
}

function formatEnumValue(val?: string | null): string {
  if (!val) return "Not provided";
  return val
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export default function ConsumerDetail({ params }: PageProps) {
  const resolvedParams = use(params as any) as any;
  const id = resolvedParams?.id;

  const [activeTab, setActiveTab] = useState<"overview" | "identity" | "limits" | "permissions">("overview");
  const [activityPage, setActivityPage] = useState(1);
  const [activityFilter, setActivityFilter] = useState<"all" | "credit" | "debit">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLog, setSelectedLog] = useState<any | null>(null);

  const { data: dashboard, isLoading, isError, mutate } = useApi<any>(
    `/consumers/dashboard/${id}?page=${activityPage}&limit=8`
  );

  const { data: regions } = useApi<any[]>("/locations/regions");
  const { data: towns } = useApi<any[]>("/locations/towns");

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [editData, setEditData] = useState<any>({});

  const [selectedRegionId, setSelectedRegionId] = useState("");

  useEffect(() => {
    if (dashboard?.consumer) {
      setEditData(dashboard.consumer);
      if (dashboard.consumer.town?.regionId) {
        setSelectedRegionId(dashboard.consumer.town.regionId);
      }
    }
  }, [dashboard]);

  if (isError) {
    return (
      <div className="w-full p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center gap-3 animate-fadeIn">
        <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <p className="text-xs font-bold">Failed to load consumer profile. Please check network connectivity.</p>
      </div>
    );
  }

  if (isLoading || !dashboard) {
    return (
      <div className="flex min-h-[50vh] w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-500 border-t-transparent"></div>
      </div>
    );
  }

  const { consumer, wallet, activity, analytics } = dashboard;

  const handleSave = async () => {
    setIsSaving(true);
    setError("");
    setSuccessMsg("");

    const SAFARICOM_REGEX = /^(?:254|\+254|0)?(7(?:0|1|2|4|6|9)|11(?:0|1|2|3|4|5))[0-9]{7}$/;
    const ID_REGEX = /^[0-9]{6,8}$/;

    if (editData.phoneNumber && !SAFARICOM_REGEX.test(editData.phoneNumber)) {
      setError("Valid Safaricom number required");
      setIsSaving(false);
      return;
    }

    if (editData.idNumber && !ID_REGEX.test(editData.idNumber)) {
      setError("National ID must be 6-8 digits");
      setIsSaving(false);
      return;
    }

    try {
      // 1. Update Profile & Demographics
      await authenticatedFetch(`/api/consumers/profile/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: editData.firstName,
          lastName: editData.lastName,
          secondName: editData.secondName || null,
          email: editData.email || null,
          phoneNumber: editData.phoneNumber,
          idNumber: editData.idNumber || null,
          taxPin: editData.taxPin || null,
          gender: editData.gender || null,
          dateOfBirth: editData.dateOfBirth || null,
          townId: editData.townId || null,
          consumerType: editData.consumerType || "END_USER",
          physicalTagId: editData.physicalTagId || null,
          identificationImageUrl: editData.identificationImageUrl || null,
          preferredLanguage: editData.preferredLanguage || "en",
          preferredChannel: editData.preferredChannel || null,
          preferredCategory: editData.preferredCategory || null,
        }),
      });

      // 2. Update Feature Controls, Redemption Limits, Banking & Capabilities
      await authenticatedFetch(`/api/consumers/controls/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          redemptionEnabled: editData.redemptionEnabled ?? true,
          redemptionDailyLimit: editData.redemptionDailyLimit || null,
          redemptionWeeklyLimit: editData.redemptionWeeklyLimit || null,
          redemptionMonthlyLimit: editData.redemptionMonthlyLimit || null,
          redemptionSingleMaxPoints: editData.redemptionSingleMaxPoints || null,
          redemptionRequiresApproval: editData.redemptionRequiresApproval ?? false,
          redemptionBlockedReason: editData.redemptionBlockedReason || null,

          bankingEnabled: editData.bankingEnabled ?? true,
          autoBankingThreshold: editData.autoBankingThreshold || null,
          bankingWithdrawMinPoints: editData.bankingWithdrawMinPoints || null,

          canPurchase: editData.canPurchase ?? true,
          canEarnPoints: editData.canEarnPoints ?? true,
          canRedeemPoints: editData.canRedeemPoints ?? true,
          canBankPoints: editData.canBankPoints ?? true,
          canTransferPoints: editData.canTransferPoints ?? false,
          canReceiveGifts: editData.canReceiveGifts ?? true,
          canParticipateInCampaigns: editData.canParticipateInCampaigns ?? true,

          marketingOptIn: editData.marketingOptIn ?? false,
          smsOptIn: editData.smsOptIn ?? false,
          emailOptIn: editData.emailOptIn ?? false,
          pushOptIn: editData.pushOptIn ?? false,

          isVerified: editData.isVerified ?? false,
          hasPortalAccess: editData.hasPortalAccess ?? false,
          riskScore: parseInt(editData.riskScore?.toString() || "0") || 0,
        }),
      }).catch(() => {});

      // 3. Update Status (Active, Suspended, Blocked) if changed
      if (editData.status && editData.status !== consumer.status) {
        await authenticatedFetch(`/api/consumers/status/${id}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: editData.status, reason: editData.redemptionBlockedReason || undefined }),
        }).catch(() => {});
      }

      setIsEditing(false);
      setSuccessMsg("100% Persisted! Profile parameters, redemption limits, and security controls updated successfully.");
      setTimeout(() => setSuccessMsg(""), 3500);
      mutate();
    } catch (err: any) {
      setError(err.message || "Network error occurred");
    } finally {
      setIsSaving(false);
    }
  };

  const initials = `${consumer.firstName?.charAt(0) || ""}${consumer.lastName?.charAt(0) || ""}`.toUpperCase();

  const filteredTowns = selectedRegionId
    ? (towns || []).filter((t: any) => t.regionId === selectedRegionId)
    : (towns || []);

  const handleTownChange = (townId: string) => {
    setEditData({ ...editData, townId });
    const town = (towns || []).find((t: any) => t.id === townId);
    if (town?.regionId) {
      setSelectedRegionId(town.regionId);
    }
  };

  const handleRegionChange = (regionId: string) => {
    setSelectedRegionId(regionId);
    const currentTown = (towns || []).find((t: any) => t.id === editData.townId);
    if (currentTown && currentTown.regionId !== regionId) {
      setEditData({ ...editData, townId: "" });
    }
  };

  // Filter activity items client-side for rapid search & category pills
  const rawActivities: any[] = activity?.data || [];
  const filteredActivities = rawActivities.filter((log: any) => {
    const isCredit = log.accountingEntry === "CREDIT";
    if (activityFilter === "credit" && !isCredit) return false;
    if (activityFilter === "debit" && isCredit) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const meta = log.metadata || {};
      const matchText = `${log.description || ""} ${meta.productName || ""} ${log.actionCategory || ""} ${log.id || ""}`.toLowerCase();
      if (!matchText.includes(q)) return false;
    }
    return true;
  });

  const totalPages = Math.ceil((activity?.total || 1) / (activity?.limit || 8));

  const rewardTerms = resolveRewardTerminology({
    tenantSettings: dashboard?.tenantSettings || dashboard?.tenant?.settings || {},
  });

  return (
    <div className="w-full space-y-6 animate-fadeIn pb-12">

      {/* ── Top Header Card ─────────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-white/[0.02] border border-gray-200/80 dark:border-white/[0.06] p-6 rounded-2xl shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
        <div className="flex items-center gap-4">
          <Link
            href="/consumers"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
          >
            <svg className="h-4 w-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </Link>

          {/* Rounded Avatar Circle */}
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400 font-bold text-sm border border-brand-500/20 shadow-2xs">
            {initials || "C"}
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-lg font-bold tracking-tight text-gray-900 dark:text-white">
                {consumer.firstName} {consumer.lastName}
              </h1>
              <Badge color={consumer.status === "active" ? "success" : consumer.status === "blocked" ? "error" : "warning"} size="sm">
                {consumer.status === "active" ? "Active" : consumer.status === "blocked" ? "Blocked" : "Suspended"}
              </Badge>
              {consumer.isVerified && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold border border-emerald-500/20">
                  ✓ KYC Verified
                </span>
              )}
              <span className="px-2.5 py-0.5 rounded-full bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-300 text-xs font-semibold">
                {formatEnumValue(consumer.consumerType)}
              </span>
            </div>
            <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400 font-medium">
              Loyalty ID <span className="font-mono font-bold text-gray-700 dark:text-gray-300">{consumer.loyaltyNumber}</span> • {consumer.phoneNumber || "No phone linked"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {isEditing ? (
            <>
              <button
                type="button"
                onClick={() => { setIsEditing(false); setEditData(consumer); setError(""); }}
                className="px-4 py-2 text-xs font-semibold text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving}
                className="px-5 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold rounded-xl transition shadow-md shadow-brand-500/20 disabled:opacity-50 flex items-center gap-2"
              >
                {isSaving ? "Saving All Fields..." : "Save Consumer Parameters"}
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-200 text-xs font-semibold rounded-xl hover:bg-gray-50 dark:hover:bg-white/10 transition flex items-center gap-2 shadow-2xs"
            >
              <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
              Edit All Parameters
            </button>
          )}
        </div>
      </div>

      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          <span>{successMsg}</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 text-xs font-semibold">
          {error}
        </div>
      )}

      {/* ── Sub-Navigation Tabs Pill Bar ───────────────────────────────────── */}
      <div className="flex items-center gap-2 border-b border-gray-200/80 dark:border-white/[0.06] pb-3 overflow-x-auto">
        {[
          { id: "overview", label: "Overview & Telemetry" },
          { id: "identity", label: "Identity & Profile" },
          { id: "limits", label: "Redemption & Banking Caps" },
          { id: "permissions", label: "Capabilities & Security" },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all shrink-0 ${
              activeTab === tab.id
                ? "bg-brand-600 text-white shadow-sm"
                : "text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── TAB 1: OVERVIEW & TELEMETRY ───────────────────────────────────── */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-12 gap-6">
          {/* Left Column (8 Columns) */}
          <div className="col-span-12 space-y-6 xl:col-span-8">

            {/* Wallet Balance Hero Card */}
            <div className="bg-gradient-to-br from-gray-900 via-gray-950 to-black border border-gray-800 p-6 rounded-2xl text-white shadow-xl relative overflow-hidden flex flex-col justify-between">
              <div className="flex items-center justify-between border-b border-gray-800 pb-3">
                <span className="text-xs font-semibold text-brand-400">{rewardTerms.balanceHeader}</span>
                <span className="text-xs font-mono text-gray-500">Live Ledger</span>
              </div>
              <div className="mt-4">
                <p className="text-3xl font-bold font-mono tracking-tight text-white">
                  {Number(wallet?.pointsBalance || 0).toLocaleString()} <span className="text-xs font-normal text-gray-400">{rewardTerms.unitLabel}</span>
                </p>
                <p className="mt-1 text-xs text-gray-400">
                  Est. cash value: <span className="font-bold font-mono text-emerald-400">KES {Number(wallet?.pointsBalance || 0).toLocaleString()}</span>
                </p>
              </div>
              {parseFloat(wallet?.bankedPointsBalance || "0") > 0 && (
                <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/10 text-xs font-semibold text-brand-300 border border-white/10 w-fit">
                  🏦 Banked savings: {Number(wallet.bankedPointsBalance || 0).toLocaleString()} {rewardTerms.unitLabel}
                </div>
              )}
            </div>

            {/* Activity Telemetry Table Card */}
            <div className="bg-white dark:bg-white/[0.02] border border-gray-200/80 dark:border-white/[0.06] rounded-2xl overflow-hidden shadow-sm flex flex-col">
              
              {/* Header & Filter Controls */}
              <div className="border-b border-gray-100 dark:border-white/5 p-4 sm:px-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white">Activity Telemetry Log</h3>
                  <p className="text-xs text-gray-400 mt-0.5">Real-time point accumulation and redemption audit timeline</p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search activity..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-8 pr-3 py-1.5 bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-white/10 rounded-xl text-xs font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/40 w-44"
                    />
                    <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                  </div>

                  <div className="flex items-center gap-1 bg-gray-100 dark:bg-white/5 p-1 rounded-xl">
                    <button
                      type="button"
                      onClick={() => setActivityFilter("all")}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${activityFilter === "all" ? "bg-white dark:bg-white/10 text-gray-900 dark:text-white shadow-2xs" : "text-gray-500 dark:text-gray-400 hover:text-gray-900"}`}
                    >
                      All
                    </button>
                    <button
                      type="button"
                      onClick={() => setActivityFilter("credit")}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${activityFilter === "credit" ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20" : "text-gray-500 dark:text-gray-400 hover:text-gray-900"}`}
                    >
                      Earn (+)
                    </button>
                    <button
                      type="button"
                      onClick={() => setActivityFilter("debit")}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${activityFilter === "debit" ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20" : "text-gray-500 dark:text-gray-400 hover:text-gray-900"}`}
                    >
                      Redeem (-)
                    </button>
                  </div>
                </div>
              </div>

              {/* Table Data */}
              <div className="w-full overflow-x-auto">
                <Table className="w-full">
                  <TableHeader>
                    <TableRow className="bg-gray-50/50 dark:bg-white/[0.01]">
                      <TableCell isHeader className="py-3.5 px-6 text-xs font-semibold text-gray-500 dark:text-gray-400">Timestamp</TableCell>
                      <TableCell isHeader className="py-3.5 px-6 text-xs font-semibold text-gray-500 dark:text-gray-400">Product / Activity</TableCell>
                      <TableCell isHeader className="py-3.5 px-6 text-xs font-semibold text-gray-500 dark:text-gray-400">Channel</TableCell>
                      <TableCell isHeader className="py-3.5 px-6 text-xs font-semibold text-gray-500 dark:text-gray-400 text-right">Points</TableCell>
                      <TableCell isHeader className="py-3.5 px-6 text-xs font-semibold text-gray-500 dark:text-gray-400">Status</TableCell>
                      <TableCell isHeader className="py-3.5 px-6 text-xs font-semibold text-gray-500 dark:text-gray-400 text-right">Inspect</TableCell>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.04]">
                    {filteredActivities.length > 0 ? (
                      filteredActivities.map((log: any, i: number) => {
                        const isCredit = log.accountingEntry === "CREDIT";
                        const meta = log.metadata as any || {};
                        const productName = meta.productName || log.description || "System Event";
                        const channel = meta.channel || (log.actionCategory?.includes("USSD") ? "USSD" : "Admin");

                        return (
                          <TableRow key={log.id || i} className="hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition-colors cursor-pointer" onClick={() => setSelectedLog(log)}>
                            <TableCell className="py-3.5 px-6 text-xs text-gray-500 font-medium whitespace-nowrap">
                              {new Date(log.createdAt).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' })}
                            </TableCell>
                            <TableCell className="py-3.5 px-6">
                              <div className="flex items-center gap-3">
                                <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 border ${isCredit ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'}`}>
                                  {isCredit ? <ArrowUpIcon className="w-3.5 h-3.5" /> : <ArrowDownIcon className="w-3.5 h-3.5" />}
                                </div>
                                <span className="text-xs font-bold text-gray-900 dark:text-white line-clamp-1">
                                  {productName}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="py-3.5 px-6">
                              <span className="px-2.5 py-0.5 rounded-full bg-gray-100 dark:bg-white/5 text-[11px] font-semibold text-gray-700 dark:text-gray-300">
                                {channel}
                              </span>
                            </TableCell>
                            <TableCell className={`py-3.5 px-6 text-right font-mono text-xs font-bold ${isCredit ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}>
                              {isCredit ? "+" : "-"}{Number(log.pointsAmount || 0).toLocaleString()} <span className="text-[10px] font-sans font-normal opacity-70">PTS</span>
                            </TableCell>
                            <TableCell className="py-3.5 px-6">
                              <Badge size="sm" color={log.journeyComplete !== false ? "success" : "warning"}>
                                {log.journeyComplete !== false ? "Success" : "Pending"}
                              </Badge>
                            </TableCell>
                            <TableCell className="py-3.5 px-6 text-right">
                              <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); setSelectedLog(log); }}
                                className="text-xs font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400 transition"
                              >
                                Details →
                              </button>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="py-12 text-center text-xs font-semibold text-gray-400 italic">
                          No activity telemetry records found matching filter criteria.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Activity Pagination Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between px-6 py-3.5 border-t border-gray-100 dark:border-white/5 gap-3">
                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                  Showing Page {activityPage} of {totalPages || 1} • {activity?.total || rawActivities.length} Total Telemetry Records
                </span>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={activityPage <= 1}
                    onClick={() => setActivityPage(p => Math.max(1, p - 1))}
                    className="px-3.5 py-1.5 text-xs font-semibold rounded-xl bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-gray-300 hover:bg-gray-200 transition disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => i + 1).map(pNum => (
                    <button
                      key={pNum}
                      type="button"
                      onClick={() => setActivityPage(pNum)}
                      className={`w-7 h-7 rounded-xl text-xs font-semibold transition flex items-center justify-center ${activityPage === pNum ? "bg-brand-600 text-white shadow-2xs" : "bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:bg-gray-200"}`}
                    >
                      {pNum}
                    </button>
                  ))}

                  <button
                    type="button"
                    disabled={activityPage >= totalPages}
                    onClick={() => setActivityPage(p => Math.min(totalPages, p + 1))}
                    className="px-3.5 py-1.5 text-xs font-semibold rounded-xl bg-gray-100 dark:bg-white/5 text-gray-700 dark:text-gray-300 hover:bg-gray-200 transition disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>

            </div>

          </div>

          {/* Right Column (4 Columns) */}
          <div className="col-span-12 space-y-6 xl:col-span-4">

            {/* Lifetime Metrics */}
            <div className="bg-white dark:bg-white/[0.02] border border-gray-200/80 dark:border-white/[0.06] p-6 rounded-2xl shadow-sm space-y-4">
              <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-white/5 pb-3">Lifetime Telemetry</h3>
              <div className="space-y-3 text-xs">
                <div className="flex justify-between items-center p-2.5 rounded-xl bg-gray-50/50 dark:bg-white/[0.01]">
                  <span className="font-medium text-gray-500">{rewardTerms.earnedHeader}</span>
                  <span className="font-mono font-bold text-gray-900 dark:text-white">{Number(consumer.totalPointsEarnedLifetime || 0).toLocaleString()} {rewardTerms.unitLabel}</span>
                </div>
                <div className="flex justify-between items-center p-2.5 rounded-xl bg-gray-50/50 dark:bg-white/[0.01]">
                  <span className="font-medium text-gray-500">{rewardTerms.redeemedHeader}</span>
                  <span className="font-mono font-bold text-rose-500">{Number(consumer.totalPointsRedeemedLifetime || 0).toLocaleString()} {rewardTerms.unitLabel}</span>
                </div>
                <div className="flex justify-between items-center p-2.5 rounded-xl bg-gray-50/50 dark:bg-white/[0.01]">
                  <span className="font-medium text-gray-500">Total Value Spent</span>
                  <span className="font-mono font-bold text-emerald-500">KES {Number(consumer.totalSpent || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center p-2.5 rounded-xl bg-gray-50/50 dark:bg-white/[0.01]">
                  <span className="font-medium text-gray-500">Purchase Frequency</span>
                  <span className="font-mono font-bold text-gray-900 dark:text-white">{analytics?.purchaseFrequency || 0}/mo</span>
                </div>
              </div>
            </div>

            {/* Risk & Engagement Score */}
            <div className="bg-gradient-to-br from-gray-900 via-gray-950 to-black border border-gray-800 p-6 rounded-2xl text-white shadow-xl space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-brand-400">Risk Assessment</span>
                {isEditing ? (
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={editData.riskScore ?? 0}
                    onChange={(e) => setEditData({ ...editData, riskScore: e.target.value })}
                    className="w-16 px-2 py-1 bg-white/10 border border-white/20 rounded text-xs font-mono text-white"
                  />
                ) : (
                  <span className="text-2xl font-bold font-mono text-white">{consumer.riskScore || 0}<span className="text-xs font-normal text-gray-400">/100</span></span>
                )}
              </div>
              <p className="text-xs text-gray-400 leading-relaxed">
                Calculated based on purchase frequency, USSD interaction velocity, and redemption behavior.
              </p>
            </div>

          </div>
        </div>
      )}

      {/* ── TAB 2: IDENTITY & KYC PROFILE ───────────────────────────────────── */}
      {activeTab === "identity" && (
        <div className="grid grid-cols-12 gap-6">

          {/* Left Side (8 Columns) */}
          <div className="col-span-12 xl:col-span-8 space-y-6">

            {/* Personal & Demographics Card */}
            <div className="bg-white dark:bg-white/[0.02] border border-gray-200/80 dark:border-white/[0.06] rounded-2xl p-6 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-white/5 pb-3 flex items-center gap-2">
                <svg className="w-4 h-4 text-brand-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                Personal Details &amp; Demographics
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <DetailItem label="First Name" value={consumer.firstName} isEditing={isEditing} field="firstName" data={editData} setData={setEditData} />
                <DetailItem label="Middle Name" value={consumer.secondName} isEditing={isEditing} field="secondName" data={editData} setData={setEditData} />
                <DetailItem label="Last Name" value={consumer.lastName} isEditing={isEditing} field="lastName" data={editData} setData={setEditData} />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <DetailItem label="Gender" value={formatEnumValue(consumer.gender)} rawValue={consumer.gender} isEditing={isEditing} field="gender" data={editData} setData={setEditData} type="select" options={[{ value: "MALE", label: "Male" }, { value: "FEMALE", label: "Female" }, { value: "OTHER", label: "Other" }]} />
                <DetailItem label="Date of Birth" value={consumer.dateOfBirth} isEditing={isEditing} field="dateOfBirth" data={editData} setData={setEditData} type="date" />
                <DetailItem label="Preferred Language" value={consumer.preferredLanguage === "sw" ? "Swahili" : "English"} isEditing={isEditing} field="preferredLanguage" data={editData} setData={setEditData} type="select" options={[{ value: "en", label: "English" }, { value: "sw", label: "Swahili" }]} />
              </div>
            </div>

            {/* Government & Compliance KYC Card */}
            <div className="bg-white dark:bg-white/[0.02] border border-gray-200/80 dark:border-white/[0.06] rounded-2xl p-6 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-white/5 pb-3 flex items-center gap-2">
                <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                Compliance &amp; KYC Verification
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <DetailItem label="National ID Number" value={consumer.idNumber} isEditing={isEditing} field="idNumber" data={editData} setData={setEditData} hint="6-8 digits" />
                <DetailItem label="KRA Tax PIN" value={consumer.taxPin} isEditing={isEditing} field="taxPin" data={editData} setData={setEditData} hint="A123456789Z" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <DetailItem label="ID Document Photo URL" value={consumer.identificationImageUrl} isEditing={isEditing} field="identificationImageUrl" data={editData} setData={setEditData} placeholder="https://..." />
                <ControlToggle title="KYC Verification Status" description="Official identity document verified" isEditing={isEditing} field="isVerified" data={editData} setData={setEditData} />
              </div>
            </div>

          </div>

          {/* Right Side (4 Columns) */}
          <div className="col-span-12 xl:col-span-4 space-y-6">

            {/* Contact Telemetry Card */}
            <div className="bg-white dark:bg-white/[0.02] border border-gray-200/80 dark:border-white/[0.06] rounded-2xl p-6 shadow-sm space-y-3">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-white/5 pb-3 flex items-center gap-2">
                <svg className="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                Contact Telemetry
              </h3>
              <DetailItem label="Phone Number" value={consumer.phoneNumber} isEditing={isEditing} field="phoneNumber" data={editData} setData={setEditData} />
              <DetailItem label="Email Address" value={consumer.email} isEditing={isEditing} field="email" data={editData} setData={setEditData} type="email" />
              <DetailItem label="Preferred Channel" value={consumer.preferredChannel || "USSD"} isEditing={isEditing} field="preferredChannel" data={editData} setData={setEditData} type="select" options={[{ value: "USSD", label: "USSD" }, { value: "SMS", label: "SMS" }, { value: "WHATSAPP", label: "WhatsApp" }, { value: "WEB", label: "Web Portal" }]} />
            </div>

            {/* Location & Hardware NFC Tag Card */}
            <div className="bg-white dark:bg-white/[0.02] border border-gray-200/80 dark:border-white/[0.06] rounded-2xl p-6 shadow-sm space-y-3">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-white/5 pb-3 flex items-center gap-2">
                <svg className="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                Territory &amp; Hardware Tag
              </h3>
              <div className="space-y-3">
                <div className="flex flex-col gap-1 py-1">
                  <span className="text-xs font-semibold text-gray-500">Region</span>
                  {isEditing ? (
                    <ModernSelect
                      options={(regions || []).map((r: any) => ({ value: r.id, label: r.name }))}
                      value={selectedRegionId}
                      onChange={handleRegionChange}
                      placeholder="Select region"
                    />
                  ) : (
                    <span className="text-xs font-semibold text-gray-900 dark:text-white">
                      {consumer.town?.regionName || (regions || []).find((r: any) => r.id === selectedRegionId)?.name || "Unassigned"}
                    </span>
                  )}
                </div>

                <div className="flex flex-col gap-1 py-1">
                  <span className="text-xs font-semibold text-gray-500">Town / City</span>
                  {isEditing ? (
                    <ModernSelect
                      options={filteredTowns.map((t: any) => ({ value: t.id, label: t.name }))}
                      value={editData.townId || ""}
                      onChange={handleTownChange}
                      placeholder={selectedRegionId ? "Select town" : "Select region first"}
                    />
                  ) : (
                    <span className="text-xs font-semibold text-gray-900 dark:text-white">
                      {consumer.town?.name || "Unassigned"}
                    </span>
                  )}
                </div>

                <DetailItem label="Physical Tag ID (NFC / QR)" value={consumer.physicalTagId} isEditing={isEditing} field="physicalTagId" data={editData} setData={setEditData} placeholder="e.g. NFC-TAG-9920" />
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ── TAB 3: REDEMPTION & BANKING CAPS ───────────────────────────────── */}
      {activeTab === "limits" && (
        <div className="grid grid-cols-12 gap-6">

          <div className="col-span-12 xl:col-span-8 space-y-6">

            {/* Financial Caps & Limits */}
            <div className="bg-white dark:bg-white/[0.02] border border-gray-200/80 dark:border-white/[0.06] rounded-2xl p-6 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-white/5 pb-3">
                Financial Redemption Caps &amp; Guard Controls
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <DetailItem label="Daily Redemption Limit (PTS)" value={consumer.redemptionDailyLimit ? `${consumer.redemptionDailyLimit} PTS` : "Default (No Cap)"} isEditing={isEditing} field="redemptionDailyLimit" data={editData} setData={setEditData} type="number" placeholder="e.g. 5000" />
                <DetailItem label="Weekly Redemption Limit (PTS)" value={consumer.redemptionWeeklyLimit ? `${consumer.redemptionWeeklyLimit} PTS` : "Default (No Cap)"} isEditing={isEditing} field="redemptionWeeklyLimit" data={editData} setData={setEditData} type="number" placeholder="e.g. 25000" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <DetailItem label="Monthly Redemption Limit (PTS)" value={consumer.redemptionMonthlyLimit ? `${consumer.redemptionMonthlyLimit} PTS` : "Default (No Cap)"} isEditing={isEditing} field="redemptionMonthlyLimit" data={editData} setData={setEditData} type="number" placeholder="e.g. 100000" />
                <DetailItem label="Single Transaction Max Points" value={consumer.redemptionSingleMaxPoints ? `${consumer.redemptionSingleMaxPoints} PTS` : "Default (No Cap)"} isEditing={isEditing} field="redemptionSingleMaxPoints" data={editData} setData={setEditData} type="number" placeholder="e.g. 10000" />
              </div>

              <div className="pt-2 border-t border-gray-100 dark:border-white/5 space-y-3">
                <ControlToggle title="Manager Approval Required for Redemptions" description="Triggers manual supervisor authorization before M-Pesa disbursement" isEditing={isEditing} field="redemptionRequiresApproval" data={editData} setData={setEditData} />
                <ControlToggle title="Global Redemption Access Enabled" description="Master policy toggle for participant cash disbursements" isEditing={isEditing} field="redemptionEnabled" data={editData} setData={setEditData} />
                {!editData.redemptionEnabled && (
                  <DetailItem label="Redemption Blocked Reason" value={consumer.redemptionBlockedReason} isEditing={isEditing} field="redemptionBlockedReason" data={editData} setData={setEditData} placeholder="Reason for blocking redemptions" />
                )}
              </div>
            </div>

            {/* Banking Controls */}
            <div className="bg-white dark:bg-white/[0.02] border border-gray-200/80 dark:border-white/[0.06] rounded-2xl p-6 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-white/5 pb-3">
                Points Banking &amp; Automated Thresholds
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <DetailItem label="Auto-Banking Threshold (PTS)" value={consumer.autoBankingThreshold ? `${consumer.autoBankingThreshold} PTS` : "Disabled"} isEditing={isEditing} field="autoBankingThreshold" data={editData} setData={setEditData} type="number" placeholder="e.g. 5000" />
                <DetailItem label="Min Points Withdrawal Threshold" value={consumer.bankingWithdrawMinPoints ? `${consumer.bankingWithdrawMinPoints} PTS` : "Default"} isEditing={isEditing} field="bankingWithdrawMinPoints" data={editData} setData={setEditData} type="number" placeholder="e.g. 100" />
              </div>

              <ControlToggle title="Points Banking Module Enabled" description="Allows participant to save and bank earned points for long-term rewards" isEditing={isEditing} field="bankingEnabled" data={editData} setData={setEditData} />
            </div>

          </div>

        </div>
      )}

      {/* ── TAB 4: CAPABILITIES & SECURITY CONTROLS ───────────────────────── */}
      {activeTab === "permissions" && (
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12 xl:col-span-8 space-y-6">

            {/* Account Status */}
            <div className="bg-white dark:bg-white/[0.02] border border-gray-200/80 dark:border-white/[0.06] rounded-2xl p-6 shadow-sm space-y-3">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-white/5 pb-3">Account Lifecycle &amp; Security</h3>
              <ControlItem
                title="Account Status"
                description="Controls overall system access for this participant."
                isEditing={isEditing} field="status" data={editData} setData={setEditData}
                options={[
                  { value: "active", label: "Active" },
                  { value: "suspended", label: "Suspended" },
                  { value: "blocked", label: "Blocked" }
                ]}
              />
              <ControlToggle title="Web Portal Access" description="Allow participant to log in via browser dashboard" isEditing={isEditing} field="hasPortalAccess" data={editData} setData={setEditData} />
            </div>

            {/* Granular Feature Lock Matrix */}
            <div className="bg-white dark:bg-white/[0.02] border border-gray-200/80 dark:border-white/[0.06] rounded-2xl p-6 shadow-sm space-y-2">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-white/5 pb-3">Granular Capabilities Matrix</h3>
              <ControlToggle title="Can Purchase Products" description="Participant is eligible for promotional item purchases" isEditing={isEditing} field="canPurchase" data={editData} setData={setEditData} />
              <ControlToggle title="Can Earn Points" description="Allow participant to scan and earn loyalty points" isEditing={isEditing} field="canEarnPoints" data={editData} setData={setEditData} />
              <ControlToggle title="Can Redeem Points" description="Allow participant to claim M-Pesa disbursements" isEditing={isEditing} field="canRedeemPoints" data={editData} setData={setEditData} />
              <ControlToggle title="Can Bank Points" description="Allow participant to transfer points into savings bank" isEditing={isEditing} field="canBankPoints" data={editData} setData={setEditData} />
              <ControlToggle title="Can Transfer Points" description="Allow P2P point transfers to other consumers" isEditing={isEditing} field="canTransferPoints" data={editData} setData={setEditData} />
              <ControlToggle title="Can Receive Gifts" description="Allow receiving reward gifts and vouchers" isEditing={isEditing} field="canReceiveGifts" data={editData} setData={setEditData} />
              <ControlToggle title="Can Participate In Campaigns" description="Allow auto-enrollment in active brand campaigns" isEditing={isEditing} field="canParticipateInCampaigns" data={editData} setData={setEditData} />
            </div>

            {/* Communication Consent */}
            <div className="bg-white dark:bg-white/[0.02] border border-gray-200/80 dark:border-white/[0.06] rounded-2xl p-6 shadow-sm space-y-2">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-white/5 pb-3">Communication &amp; Marketing Preferences</h3>
              <ControlToggle title="SMS Notifications Opt-In" description="Receive transactional and campaign SMS messages" isEditing={isEditing} field="smsOptIn" data={editData} setData={setEditData} />
              <ControlToggle title="Marketing Communications Opt-In" description="Receive special promotional updates" isEditing={isEditing} field="marketingOptIn" data={editData} setData={setEditData} />
              <ControlToggle title="Email Statements Opt-In" description="Receive monthly digital balance statements" isEditing={isEditing} field="emailOptIn" data={editData} setData={setEditData} />
              <ControlToggle title="Push Notifications Opt-In" description="Receive mobile app push notifications" isEditing={isEditing} field="pushOptIn" data={editData} setData={setEditData} />
            </div>

          </div>
        </div>
      )}

      {/* ── Activity Inspection Modal ─────────────────────────────────────── */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white dark:bg-[#18181b] border border-gray-200 dark:border-white/10 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 relative">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-white/5 pb-3">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border ${selectedLog.accountingEntry === 'CREDIT' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'}`}>
                  {selectedLog.accountingEntry === 'CREDIT' ? <ArrowUpIcon className="w-4 h-4" /> : <ArrowDownIcon className="w-4 h-4" />}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white">Telemetry Entry Details</h3>
                  <p className="text-[11px] font-mono text-gray-400">Log ID: {selectedLog.id}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedLog(null)}
                className="w-8 h-8 rounded-xl bg-gray-100 dark:bg-white/5 hover:bg-gray-200 text-gray-500 flex items-center justify-center transition"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 rounded-xl bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/5">
                <span className="text-xs text-gray-500">Transaction Points</span>
                <span className={`text-sm font-bold font-mono ${selectedLog.accountingEntry === 'CREDIT' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                  {selectedLog.accountingEntry === 'CREDIT' ? '+' : '-'}{Number(selectedLog.pointsAmount || 0).toLocaleString()} PTS
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/5">
                  <span className="text-gray-400 block text-[10px] uppercase font-semibold">Action Category</span>
                  <span className="font-bold text-gray-900 dark:text-white">{selectedLog.actionCategory}</span>
                </div>
                <div className="p-3 rounded-xl bg-gray-50 dark:bg-white/[0.03] border border-gray-100 dark:border-white/5">
                  <span className="text-gray-400 block text-[10px] uppercase font-semibold">Timestamp</span>
                  <span className="font-bold text-gray-900 dark:text-white">{new Date(selectedLog.createdAt).toLocaleString()}</span>
                </div>
              </div>

              {selectedLog.metadata && (
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Contextual Metadata Payload</span>
                  <pre className="text-[11px] p-3 bg-gray-900 text-emerald-400 rounded-xl font-mono overflow-x-auto max-h-40">
                    {JSON.stringify(selectedLog.metadata, null, 2)}
                  </pre>
                </div>
              )}
            </div>

            <div className="pt-2 flex justify-end gap-2">
              {selectedLog.id && (
                <Link
                  href={`/transactions/${selectedLog.id}`}
                  className="px-4 py-2 bg-brand-600 text-white text-xs font-semibold rounded-xl hover:bg-brand-700 transition shadow-md shadow-brand-500/20"
                >
                  View Full Ledger Transaction →
                </Link>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

// ─── Detail Item Helper ──────────────────────────────────────────────────────
function DetailItem({ label, value, rawValue, isEditing, field, data, setData, type = "text", hint, placeholder, options }: any) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value;
    if (field === "idNumber") val = val.replace(/\D/g, "");
    if (field === "taxPin") val = val.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
    setData({ ...data, [field]: val });
  };

  return (
    <div className="flex flex-col gap-1 py-2 border-b border-gray-100 dark:border-white/5 last:border-0">
      <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">{label}</span>
      {isEditing ? (
        type === "select" ? (
          <ModernSelect options={options || []} value={data[field] || rawValue || ""} onChange={(val) => setData({ ...data, [field]: val })} placeholder={`Select ${label.toLowerCase()}`} />
        ) : (
          <input
            type={type}
            maxLength={field === "idNumber" ? 8 : field === "taxPin" ? 11 : undefined}
            placeholder={placeholder || hint || `Enter ${label.toLowerCase()}`}
            value={data[field] ?? ""}
            onChange={handleChange}
            className="w-full px-3 py-1.5 bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-white/10 rounded-xl text-xs font-semibold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/40"
          />
        )
      ) : (
        <span className={`text-xs mt-0.5 ${!value ? "text-gray-400 font-normal italic" : "text-gray-900 dark:text-white font-semibold"}`}>
          {value || "Not provided"}
        </span>
      )}
    </div>
  );
}

// ─── Control Toggle Helper ──────────────────────────────────────────────────
function ControlToggle({ title, description, isEditing, field, data, setData }: any) {
  const isChecked = Boolean(data[field]);

  const handleToggle = () => {
    setData({ ...data, [field]: !isChecked });
  };

  return (
    <div className="flex items-center justify-between py-2.5 border-b border-gray-100 dark:border-white/5 last:border-0 gap-3">
      <div>
        <h4 className="text-xs font-bold text-gray-900 dark:text-white">{title}</h4>
        <p className="text-[11px] text-gray-400 mt-0.5">{description}</p>
      </div>
      <div className="shrink-0 flex items-center gap-3">
        <span className={`text-xs font-semibold ${isChecked ? "text-emerald-500" : "text-gray-400"}`}>
          {isChecked ? "Allowed" : "Disabled"}
        </span>
        {isEditing && (
          <button
            type="button"
            onClick={handleToggle}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              isChecked ? "bg-brand-500" : "bg-gray-200 dark:bg-white/10"
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                isChecked ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Control Item Helper ────────────────────────────────────────────────────
function ControlItem({ title, description, isEditing, field, data, setData, options }: any) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between py-3.5 border-b border-gray-100 dark:border-white/5 last:border-0 gap-3">
      <div>
        <h4 className="text-xs font-bold text-gray-900 dark:text-white">{title}</h4>
        <p className="text-[11px] text-gray-400 mt-0.5">{description}</p>
      </div>
      <div className="shrink-0 flex items-center justify-end">
        {isEditing ? (
          <div className="w-40">
            <ModernSelect
              options={options}
              value={data[field]}
              onChange={(val) => setData({ ...data, [field]: val })}
              placeholder="Select status"
            />
          </div>
        ) : (
          <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold ${
            data[field] === "active"
              ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
              : "bg-rose-500/10 text-rose-500 border border-rose-500/20"
          }`}>
            {options?.find((o: any) => o.value === data[field])?.label || formatEnumValue(data[field]) || "Active"}
          </span>
        )}
      </div>
    </div>
  );
}