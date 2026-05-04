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

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ConsumerDetail({ params }: PageProps) {
  const resolvedParams = use(params as any) as any;
  const id = resolvedParams?.id;

  const [activeTab, setActiveTab] = useState<"overview" | "identity" | "permissions">("overview");
  const [activityPage, setActivityPage] = useState(1);

  const { data: dashboard, isLoading, isError, mutate } = useApi<any>(
    `/consumers/dashboard/${id}?page=${activityPage}&limit=8`
  );

  // Reference data for dropdowns
  const { data: organizations } = useApi<any[]>("/organizations");
  const { data: regions } = useApi<any[]>("/locations/regions");
  const { data: towns } = useApi<any[]>("/locations/towns");
  const { data: salesStaff } = useApi<any[]>("/sales");

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [editData, setEditData] = useState<any>({});

  // Smart town/region state
  const [selectedRegionId, setSelectedRegionId] = useState("");

  useEffect(() => {
    if (dashboard?.consumer) {
      setEditData(dashboard.consumer);
      // Set initial region from the consumer's town
      if (dashboard.consumer.town?.regionId) {
        setSelectedRegionId(dashboard.consumer.town.regionId);
      }
    }
  }, [dashboard]);

  if (isError) {
    return (
      <div className="w-full p-6">
        <div className="flex items-center gap-3 rounded-md bg-error-50 p-4 border border-error-200 dark:bg-error-500/10 dark:border-error-500/20">
          <p className="text-sm font-medium text-error-800 dark:text-error-300">Failed to load consumer dashboard. Please try again.</p>
        </div>
      </div>
    );
  }

  if (isLoading || !dashboard) {
    return (
      <div className="flex min-h-[60vh] w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent"></div>
      </div>
    );
  }

  const { consumer, wallet, activity, analytics } = dashboard;

  const handleSave = async () => {
    setIsSaving(true);
    setError("");

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
      const resData = await authenticatedFetch(`/api/consumers/profile/${id}`, {
        method: "PUT",
        body: JSON.stringify(editData),
      });
      if (resData.success) {
        setIsEditing(false);
        mutate();
      } else {
        setError(resData.error || "Update failed");
      }
    } catch (err: any) {
      setError(err.info?.error || "Network error occurred");
    } finally {
      setIsSaving(false);
    }
  };

  const initials = `${consumer.firstName?.charAt(0) || ""}${consumer.lastName?.charAt(0) || ""}`.toUpperCase();

  // Filtered towns based on selected region
  const filteredTowns = selectedRegionId
    ? (towns || []).filter((t: any) => t.regionId === selectedRegionId)
    : (towns || []);

  // When town changes, auto-fill region
  const handleTownChange = (townId: string) => {
    setEditData({ ...editData, townId });
    const town = (towns || []).find((t: any) => t.id === townId);
    if (town?.regionId) {
      setSelectedRegionId(town.regionId);
    }
  };

  // When region changes, clear town if it's not in the new region
  const handleRegionChange = (regionId: string) => {
    setSelectedRegionId(regionId);
    const currentTown = (towns || []).find((t: any) => t.id === editData.townId);
    if (currentTown && currentTown.regionId !== regionId) {
      setEditData({ ...editData, townId: "" });
    }
  };

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-500">

      {/* ── Top header bar ────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5 rounded-lg bg-white p-6 border border-gray-200 shadow-sm dark:bg-[#18181b] dark:border-white/10">
        <div className="flex items-center gap-5">
          <Link
            href="/consumers"
            className="group flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white shadow-sm transition-all hover:bg-gray-50 dark:border-white/10 dark:bg-[#18181b] dark:hover:bg-white/5"
          >
            <svg className="h-4 w-4 text-gray-500 transition-transform group-hover:-translate-x-0.5 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </Link>

          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-100 text-lg font-bold text-brand-700 shadow-sm dark:bg-brand-500/20 dark:text-brand-400">
            {initials || "C"}
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
                {consumer.firstName} {consumer.lastName}
              </h1>
              <Badge color={consumer.status === "active" ? "success" : consumer.status === "blocked" ? "error" : "warning"} size="sm">
                {consumer.status === "active" ? "Active" : consumer.status === "blocked" ? "Blocked" : "Suspended"}
              </Badge>
            </div>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
              Loyalty ID <span className="font-mono text-gray-900 dark:text-gray-300">{consumer.loyaltyNumber}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {isEditing ? (
            <>
              <button
                onClick={() => { setIsEditing(false); setEditData(consumer); setError(""); }}
                className="rounded-md bg-white px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 shadow-sm hover:bg-gray-50 dark:bg-white/5 dark:border-white/10 dark:text-gray-300 dark:hover:bg-white/10 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="inline-flex items-center justify-center rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 disabled:opacity-60 transition-colors"
              >
                {isSaving ? "Saving changes..." : "Save changes"}
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="inline-flex items-center gap-2 rounded-md bg-white px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 shadow-sm hover:bg-gray-50 dark:bg-white/5 dark:border-white/10 dark:text-gray-300 dark:hover:bg-white/10 transition-colors"
            >
              <svg className="h-4 w-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
              </svg>
              Edit profile
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-3 rounded-md bg-error-50 p-4 border border-error-200 dark:bg-error-500/10 dark:border-error-500/20">
          <svg className="mt-0.5 h-5 w-5 shrink-0 text-error-600 dark:text-error-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <p className="text-sm font-medium text-error-800 dark:text-error-300">{error}</p>
        </div>
      )}

      {/* ── Tabs navigation ────────────────────────────────────────────────── */}
      <div className="border-b border-gray-200 dark:border-white/10">
        <nav className="-mb-px flex space-x-6">
          {[
            { id: "overview", label: "Overview" },
            { id: "identity", label: "Identity & profile" },
            { id: "permissions", label: "Security & permissions" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`whitespace-nowrap border-b-2 py-3 px-1 text-sm font-medium transition-colors ${activeTab === tab.id
                ? "border-brand-500 text-brand-600 dark:border-brand-400 dark:text-brand-400"
                : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 dark:text-gray-400 dark:hover:border-gray-600 dark:hover:text-gray-300"
                }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* ── Tab contents ──────────────────────────────────────────────────── */}

      {/* 1. Overview Tab — Unified Activity + Analytics */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-12 gap-6">
          {/* Left column — Wallet + Activity */}
          <div className="col-span-12 space-y-6 xl:col-span-8">

            {/* Wallet Card */}
            <div className="relative overflow-hidden rounded-lg bg-gray-900 p-6 text-white shadow-sm dark:bg-[#121212] dark:border dark:border-white/10">
              <div className="relative z-10">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-brand-400">Available balance</h3>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-4xl font-bold tracking-tight">{Number(wallet?.pointsBalance || 0).toLocaleString()}</span>
                  <span className="text-sm font-medium text-gray-400">pts</span>
                </div>
                <div className="mt-4 flex flex-col gap-3">
                  <p className="text-sm text-gray-400">
                    Est. value: <span className="font-medium text-white">KES {Number(wallet?.pointsBalance || 0).toLocaleString()}</span>
                  </p>
                  {parseFloat(wallet?.bankedPointsBalance || "0") > 0 && (
                    <div className="inline-flex w-fit items-center gap-2 rounded-md bg-white/10 px-3 py-1.5 text-xs font-medium text-brand-200 border border-white/10 backdrop-blur-sm">
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75z" />
                      </svg>
                      Banked: {Number(wallet.bankedPointsBalance || 0).toLocaleString()} pts
                    </div>
                  )}
                </div>
              </div>
              <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-brand-500/20 blur-2xl pointer-events-none"></div>
            </div>

            {/* Unified Activity Log */}
            <div className="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-white/10 dark:bg-[#18181b] flex flex-col">
              <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4 dark:border-white/5">
                <h3 className="text-base font-semibold text-gray-900 dark:text-white">Activity log</h3>
                <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600 dark:bg-white/10 dark:text-gray-300">
                  {activity.total} records
                </span>
              </div>
              <div className="w-full overflow-x-auto">
                <Table className="w-full">
                  <TableHeader className="bg-gray-50/50 dark:bg-white/5">
                    <TableRow className="border-none">
                      <TableCell isHeader className="py-3 px-6 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Timestamp</TableCell>
                      <TableCell isHeader className="py-3 px-6 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Product</TableCell>
                      <TableCell isHeader className="py-3 px-6 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Channel</TableCell>
                      <TableCell isHeader className="py-3 px-6 text-right text-xs font-medium text-gray-500 dark:text-gray-400">Amount / Pts</TableCell>
                      <TableCell isHeader className="py-3 px-6 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Status</TableCell>
                      <TableCell isHeader className="py-3 px-6 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Ref / Receipt</TableCell>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {activity.data.length > 0 ? activity.data.map((log: any, i: number) => {
                      const isCredit = log.accountingEntry === "CREDIT";
                      const meta = log.metadata as any || {};
                      const productName = meta.productName || log.description || "—";
                      const channel = meta.channel || (log.actionCategory?.includes("USSD") ? "USSD" : "Admin");

                      // For grouped activity, use the mpesaRef we injected in the service
                      let receiptStr = log.mpesaRef || meta.mpesaRef || meta.externalReference || "—";
                      if (receiptStr === "—" && log.description?.includes("Auto-Payout")) {
                        receiptStr = "Simulated Daraja";
                      }

                      return (
                        <TableRow key={i} className="border-b border-gray-100 dark:border-white/5 hover:bg-gray-50 dark:hover:bg-white/[0.02]">
                          <TableCell className="py-3 px-6 text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
                            <Link href={`/consumers/${id}/activity/${meta.voucherSerialNumber || log.id}`} className="hover:text-brand-500 transition-colors">
                              {new Date(log.createdAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                            </Link>
                          </TableCell>
                          <TableCell className="py-3 px-6 text-sm font-medium text-gray-900 dark:text-gray-200 max-w-[200px] truncate">
                            {productName}
                          </TableCell>
                          <TableCell className="py-3 px-6">
                            <Badge size="sm" color={channel === "USSD" ? "info" : "light"}>
                              {channel}
                            </Badge>
                          </TableCell>
                          <TableCell className={`py-3 px-6 text-right text-sm font-bold whitespace-nowrap ${isCredit ? "text-success-600 dark:text-success-500" : "text-error-600 dark:text-error-500"}`}>
                            {isCredit ? "+" : "-"}{Number(log.pointsAmount || 0).toLocaleString()} pts
                          </TableCell>
                          <TableCell className="py-3 px-6">
                            <Badge size="sm" color={log.journeyComplete ? "success" : "warning"}>
                              {log.journeyComplete ? "Success" : isCredit ? "Earned" : "Processing"}
                            </Badge>
                          </TableCell>
                          <TableCell className="py-3 px-6 text-sm text-gray-500 font-mono dark:text-gray-400">
                            {receiptStr !== "—" ? (
                              <span className="inline-flex items-center gap-1 text-success-600 dark:text-success-400">
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                {receiptStr}
                              </span>
                            ) : (
                              "—"
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    }) : (
                      <TableRow>
                        <TableCell colSpan={6} className="py-12 text-center text-sm text-gray-500">No activity recorded yet</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
              {activity.total > 8 && (
                <div className="flex items-center justify-between border-t border-gray-100 px-6 py-3 dark:border-white/5">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Page {activityPage}</span>
                  <div className="flex items-center gap-2">
                    <button disabled={activityPage === 1} onClick={() => setActivityPage(p => Math.max(1, p - 1))} className="rounded-md border border-gray-300 bg-white px-3 py-1 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-white/5 dark:border-white/10 dark:text-gray-300 dark:hover:bg-white/10">Previous</button>
                    <button disabled={activityPage * 8 >= activity.total} onClick={() => setActivityPage(p => p + 1)} className="rounded-md border border-gray-300 bg-white px-3 py-1 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-white/5 dark:border-white/10 dark:text-gray-300 dark:hover:bg-white/10">Next</button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right column — Analytics */}
          <div className="col-span-12 space-y-6 xl:col-span-4">
            {/* Lifetime Metrics */}
            <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#18181b]">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Lifetime metrics</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-gray-50 pb-3 dark:border-white/5">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Total earned</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-200">{Number(consumer.totalPointsEarnedLifetime || 0).toLocaleString()} pts</span>
                </div>
                <div className="flex justify-between items-center border-b border-gray-50 pb-3 dark:border-white/5">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Total spent</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-200">KES {Number(consumer.totalSpent || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center border-b border-gray-50 pb-3 dark:border-white/5">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Purchase frequency</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-200">{analytics?.purchaseFrequency || 0}/mo</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500 dark:text-gray-400">Total transactions</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-200">{analytics?.totalTransactions || 0}</span>
                </div>
              </div>
            </div>

            {/* Top Products */}
            <div className="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-white/10 dark:bg-[#18181b]">
              <div className="border-b border-gray-100 px-6 py-4 dark:border-white/5">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Top products</h3>
              </div>
              <div className="p-4">
                {analytics?.topProducts && analytics.topProducts.length > 0 ? (
                  <div className="space-y-3">
                    {analytics.topProducts.map((p: any, i: number) => (
                      <div key={i} className="flex items-center justify-between rounded-md border border-gray-100 bg-gray-50 p-3 dark:border-white/5 dark:bg-white/5">
                        <div className="flex items-center gap-3">
                          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-700 dark:bg-brand-500/20 dark:text-brand-400">
                            {i + 1}
                          </span>
                          <span className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-[140px]">
                            {p.name}
                          </span>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-200">{p.count}x</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{Number(p.totalPoints).toLocaleString()} pts</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">No product data yet</p>
                )}
              </div>
            </div>

            {/* Risk & Engagement */}
            <div className="relative overflow-hidden rounded-lg bg-gray-900 p-6 text-white shadow-sm dark:bg-[#121212] dark:border dark:border-white/10">
              <div className="relative z-10">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-brand-400">Engagement score</h4>
                <p className="mt-2 text-3xl font-bold">{consumer.riskScore || 0}<span className="text-sm font-normal text-gray-400">/100</span></p>
                <p className="mt-2 text-sm text-gray-400">
                  Risk and engagement are computed based on purchase patterns, frequency, and redemption behavior.
                </p>
              </div>
              <div className="absolute -right-8 -bottom-8 h-32 w-32 rounded-full bg-brand-500/20 blur-2xl pointer-events-none"></div>
            </div>
          </div>
        </div>
      )}

      {/* 2. Identity & Profile Tab */}
      {activeTab === "identity" && (
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12 xl:col-span-8 space-y-6">
            {/* Personal Details */}
            <div className="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-white/10 dark:bg-[#18181b]">
              <div className="border-b border-gray-100 px-6 py-5 dark:border-white/5">
                <h3 className="text-base font-semibold text-gray-900 dark:text-white">Personal & contact details</h3>
              </div>
              <div className="px-6 py-2">
                <DetailItem label="First name" value={consumer.firstName} isEditing={isEditing} field="firstName" data={editData} setData={setEditData} />
                <DetailItem label="Last name" value={consumer.lastName} isEditing={isEditing} field="lastName" data={editData} setData={setEditData} />
                <DetailItem label="Phone number" value={consumer.phoneNumber} isEditing={isEditing} field="phoneNumber" data={editData} setData={setEditData} />
                <DetailItem label="Email address" value={consumer.email} isEditing={isEditing} field="email" data={editData} setData={setEditData} type="email" />
                <DetailItem label="National ID" value={consumer.idNumber} isEditing={isEditing} field="idNumber" data={editData} setData={setEditData} hint="6-8 digits" />
                <DetailItem label="Tax PIN" value={consumer.taxPin} isEditing={isEditing} field="taxPin" data={editData} setData={setEditData} />
                <DetailItem label="Gender" value={consumer.gender} isEditing={isEditing} field="gender" data={editData} setData={setEditData} type="select" options={[{ value: "MALE", label: "Male" }, { value: "FEMALE", label: "Female" }, { value: "OTHER", label: "Other" }]} />
              </div>
            </div>

            {/* Location — Smart Town/Region */}
            <div className="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-white/10 dark:bg-[#18181b]">
              <div className="border-b border-gray-100 px-6 py-5 dark:border-white/5">
                <h3 className="text-base font-semibold text-gray-900 dark:text-white">Location & geography</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Select a region to filter towns, or select a town to auto-fill the region.</p>
              </div>
              <div className="px-6 py-4 space-y-4">
                <div className="flex flex-col gap-1.5">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Region</span>
                  {isEditing ? (
                    <ModernSelect
                      options={(regions || []).map((r: any) => ({ value: r.id, label: r.name }))}
                      value={selectedRegionId}
                      onChange={handleRegionChange}
                      placeholder="Select region (filters towns below)"
                    />
                  ) : (
                    <span className="text-sm text-gray-900 font-medium dark:text-gray-200">
                      {consumer.town?.regionName || (regions || []).find((r: any) => r.id === selectedRegionId)?.name || "Not set"}
                    </span>
                  )}
                </div>
                <div className="flex flex-col gap-1.5">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Town</span>
                  {isEditing ? (
                    <ModernSelect
                      options={filteredTowns.map((t: any) => ({ value: t.id, label: t.name }))}
                      value={editData.townId || ""}
                      onChange={handleTownChange}
                      placeholder={selectedRegionId ? "Select town" : "Select a region first"}
                    />
                  ) : (
                    <span className="text-sm text-gray-900 font-medium dark:text-gray-200">
                      {consumer.town?.name || "Not set"}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right column — Org, Sales, System */}
          <div className="col-span-12 xl:col-span-4 space-y-6">
            {/* Organization Link */}
            <div className="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-white/10 dark:bg-[#18181b]">
              <div className="border-b border-gray-100 px-6 py-5 dark:border-white/5">
                <h3 className="text-base font-semibold text-gray-900 dark:text-white">Organization</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Link this consumer to a dealer, distributor, or contractor.</p>
              </div>
              <div className="px-6 py-4">
                {isEditing ? (
                  <ModernSelect
                    options={(organizations || []).map((o: any) => ({ value: o.id, label: `${o.name} (${o.type})` }))}
                    value={editData.dealerOrganizationId || ""}
                    onChange={(val) => setEditData({ ...editData, dealerOrganizationId: val })}
                    placeholder="Select organization"
                  />
                ) : (
                  <div className="flex items-center gap-3">
                    {consumer.dealerOrganizationId ? (
                      <>
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-100 text-xs font-semibold text-amber-700 dark:bg-amber-500/20 dark:text-amber-400">
                          {(organizations || []).find((o: any) => o.id === consumer.dealerOrganizationId)?.name?.charAt(0) || "O"}
                        </div>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {(organizations || []).find((o: any) => o.id === consumer.dealerOrganizationId)?.name || "Unknown"}
                        </span>
                      </>
                    ) : (
                      <span className="text-sm text-gray-400">Not linked to any organization</span>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Sales Person */}
            <div className="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-white/10 dark:bg-[#18181b]">
              <div className="border-b border-gray-100 px-6 py-5 dark:border-white/5">
                <h3 className="text-base font-semibold text-gray-900 dark:text-white">Assigned sales person</h3>
              </div>
              <div className="px-6 py-4">
                {isEditing ? (
                  <ModernSelect
                    options={(salesStaff || []).map((s: any) => ({ value: s.id, label: `${s.name} (${s.role?.replace(/_/g, " ")})` }))}
                    value={editData.onboardedByAgentId || ""}
                    onChange={(val) => setEditData({ ...editData, onboardedByAgentId: val })}
                    placeholder="Select sales person"
                  />
                ) : (
                  <div className="flex items-center gap-3">
                    {consumer.onboardedByAgentId ? (
                      <>
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-semibold text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-400">
                          {(salesStaff || []).find((s: any) => s.id === consumer.onboardedByAgentId)?.name?.charAt(0) || "S"}
                        </div>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {(salesStaff || []).find((s: any) => s.id === consumer.onboardedByAgentId)?.name || "Unknown"}
                        </span>
                      </>
                    ) : (
                      <span className="text-sm text-gray-400">No sales person assigned</span>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* System Context */}
            <div className="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-white/10 dark:bg-[#18181b]">
              <div className="border-b border-gray-100 px-6 py-5 dark:border-white/5">
                <h3 className="text-base font-semibold text-gray-900 dark:text-white">System context</h3>
              </div>
              <div className="px-6 py-2">
                <DetailItem label="Consumer type" value={consumer.consumerType} isEditing={false} field="consumerType" data={editData} setData={setEditData} />
                <DetailItem label="Physical tag ID" value={consumer.physicalTagId} isEditing={isEditing} field="physicalTagId" data={editData} setData={setEditData} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. Permissions & Security Tab */}
      {activeTab === "permissions" && (
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12 xl:col-span-8 space-y-6">
            <div className="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-white/10 dark:bg-[#18181b]">
              <div className="border-b border-gray-100 px-6 py-5 dark:border-white/5">
                <h3 className="text-base font-semibold text-gray-900 dark:text-white">Account controls</h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Manage access and point operations for this user.</p>
              </div>
              <div className="px-6 py-2">
                <ControlItem
                  title="Account status"
                  description="Determines if the user can access the platform."
                  isEditing={isEditing} field="status" data={editData} setData={setEditData}
                  options={[
                    { value: "active", label: "Active" },
                    { value: "suspended", label: "Suspended" },
                    { value: "blocked", label: "Blocked" }
                  ]}
                />
                <ControlItem
                  title="Earning capability"
                  description="Allow the user to earn points from campaigns."
                  isEditing={isEditing} field="canEarnPoints" data={editData} setData={setEditData}
                  isBoolean
                />
                <ControlItem
                  title="Redemption capability"
                  description="Allow the user to redeem points for gifts or cash."
                  isEditing={isEditing} field="canRedeemPoints" data={editData} setData={setEditData}
                  isBoolean
                />
                <ControlItem
                  title="Points banking"
                  description="Allow the user to safely bank points for future use."
                  isEditing={isEditing} field="bankingEnabled" data={editData} setData={setEditData}
                  isBoolean
                />
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

// ─── Reusable Components ─────────────────────────────────────────────────────

function DetailItem({ label, value, isEditing, field, data, setData, type = "text", hint, options }: any) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value;
    if (field === "idNumber") val = val.replace(/\D/g, "");
    if (field === "taxPin") val = val.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
    setData({ ...data, [field]: val });
  };

  return (
    <div className={`flex ${isEditing ? 'flex-col gap-1.5 py-3' : 'flex-col sm:flex-row sm:justify-between sm:items-center py-3.5'} border-b border-gray-50 last:border-0 dark:border-white/5`}>
      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</span>
      {isEditing ? (
        type === "select" ? (
          <div className="w-full sm:w-2/3">
            <ModernSelect options={options || []} value={data[field] || ""} onChange={(val) => setData({ ...data, [field]: val })} placeholder={`Select ${label.toLowerCase()}`} />
          </div>
        ) : (
          <div className="relative w-full sm:w-2/3">
            <input
              type={type}
              maxLength={field === "idNumber" ? 8 : field === "taxPin" ? 11 : undefined}
              placeholder={hint || `Enter ${label.toLowerCase()}`}
              value={data[field] || ""}
              onChange={handleChange}
              className="h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-900 shadow-sm transition-colors placeholder:text-gray-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-white/30"
            />
          </div>
        )
      ) : (
        <span className={`text-sm mt-1 sm:mt-0 ${!value ? "text-gray-400 font-normal" : "text-gray-900 font-medium dark:text-gray-200"}`}>
          {value || "Not provided"}
        </span>
      )}
    </div>
  );
}

function ControlItem({ title, description, isEditing, field, data, setData, options, isBoolean }: any) {
  const displayValue = isBoolean
    ? (data[field] ? "Allowed" : "Disabled")
    : (options?.find((o: any) => o.value === data[field])?.label || data[field]);

  return (
    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-4 border-b border-gray-50 last:border-0 dark:border-white/5 gap-4">
      <div>
        <h4 className="text-sm font-medium text-gray-900 dark:text-white">{title}</h4>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{description}</p>
      </div>
      <div className="shrink-0 w-full sm:w-48">
        {isEditing ? (
          <ModernSelect
            options={isBoolean ? [{ value: true, label: "Allowed" }, { value: false, label: "Disabled" }] : options}
            value={data[field]}
            onChange={(val) => setData({ ...data, [field]: val })}
            placeholder="Select status"
          />
        ) : (
          <div className="flex justify-end">
            <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border ${data[field] === false || data[field] === "blocked" || data[field] === "suspended"
              ? "bg-error-50 text-error-700 border-error-100 dark:bg-error-500/10 dark:text-error-400 dark:border-error-500/20"
              : "bg-gray-50 text-gray-700 border-gray-200 dark:bg-white/5 dark:text-gray-300 dark:border-white/10"
              }`}>
              {displayValue || "Not set"}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}