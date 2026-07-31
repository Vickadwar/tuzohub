"use client";

import React, { use, useState, useEffect } from "react";
import Link from "next/link";
import Badge from "@/components/ui/badge/Badge";
import { useApi, authenticatedFetch } from "@/hooks/useApi";
import ModernSelect from "@/components/ui/ModernSelect";
import DatePicker from "@/components/ui/DatePicker";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function CampaignDetail({ params }: PageProps) {
  const resolvedParams = use(params as any) as any;
  const id = resolvedParams?.id;

  const { data: campaign, isLoading, isError, mutate } = useApi<any>(`/campaigns/${id}`);

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [editData, setEditData] = useState<any>({});

  useEffect(() => {
    if (campaign) {
      setEditData(campaign);
    }
  }, [campaign]);

  if (isError) {
    return (
      <div className="w-full p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center gap-3">
        <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <p className="text-xs font-semibold">Failed to load campaign details. Please check your network connection.</p>
      </div>
    );
  }

  if (isLoading || !campaign) {
    return (
      <div className="flex min-h-[50vh] w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-500 border-t-transparent"></div>
      </div>
    );
  }

  const handleSave = async () => {
    setIsSaving(true);
    setError("");

    try {
      const json = await authenticatedFetch(`/api/campaigns/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editData),
      });

      if (json) {
        setIsEditing(false);
        mutate();
      } else {
        setError("Update failed");
      }
    } catch (err: any) {
      setError(err.message || "Network error occurred");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="w-full space-y-6 animate-fadeIn pb-12">
      {/* ── Page Header Card ─────────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-white/[0.02] border border-gray-200/80 dark:border-white/[0.06] p-6 rounded-2xl shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
        <div className="flex items-center gap-4">
          <Link
            href="/campaigns"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors"
          >
            <svg className="h-4 w-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </Link>

          {/* Rounded Avatar Circle */}
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 font-bold text-sm border border-purple-500/20 shadow-sm">
            {campaign.name?.charAt(0) || "C"}
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-lg font-bold tracking-tight text-gray-900 dark:text-white">
                {campaign.name}
              </h1>
              <Badge color={campaign.isActive ? "success" : "warning"} size="sm">
                {campaign.isActive ? "Active" : "Archived"}
              </Badge>
            </div>
            <p className="mt-0.5 text-xs text-gray-400 capitalize font-medium">
              {campaign.campaignType?.replace(/_/g, " ").toLowerCase()} promotion • Created {new Date(campaign.createdAt || Date.now()).toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {isEditing ? (
            <>
              <button
                onClick={() => { setIsEditing(false); setEditData(campaign); setError(""); }}
                className="px-4 py-2 text-xs font-semibold text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold rounded-xl transition shadow-md shadow-brand-500/20 disabled:opacity-50 flex items-center gap-2"
              >
                {isSaving ? "Saving..." : "Save Changes"}
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-200 text-xs font-semibold rounded-xl hover:bg-gray-50 dark:hover:bg-white/10 transition flex items-center gap-2"
            >
              <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
              Edit Rules &amp; Multipliers
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 text-xs font-semibold">
          {error}
        </div>
      )}

      {/* ── Main Layout: 12-Column Grid ───────────────────────────────────── */}
      <div className="grid grid-cols-12 gap-6">

        {/* Left Column (8 Columns) */}
        <div className="col-span-12 space-y-6 xl:col-span-8">

          {/* Configuration Rules Card */}
          <div className="bg-white dark:bg-white/[0.02] border border-gray-200/80 dark:border-white/[0.06] rounded-2xl shadow-sm relative">
            <div className="border-b border-gray-100 dark:border-white/5 px-6 py-4">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">Configuration Rules</h3>
              <p className="text-xs text-gray-400 mt-0.5">Core rules defining points multipliers and promotion behavior.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 p-6">
              <DetailItem label="Campaign Name" value={campaign.name} isEditing={isEditing} field="name" data={editData} setData={setEditData} />
              <DetailItem label="Promotion Type" value={campaign.campaignType?.replace(/_/g, " ").toLowerCase()} isEditing={isEditing} field="campaignType" data={editData} setData={setEditData} type="select" options={[
                { value: "EARNING", label: "Points Earning" },
                { value: "CASHBACK", label: "Cashback Reward" },
                { value: "DOUBLE_POINTS", label: "Double Points Event" },
              ]} />
              <DetailItem label="Points Multiplier" value={`${campaign.pointsMultiplier}x`} isEditing={isEditing} field="pointsMultiplier" data={editData} setData={setEditData} />
              <DetailItem label="Recursion Strategy" value={campaign.isRecurring ? "Recurring Monthly" : "One-time Event"} isEditing={isEditing} field="isRecurring" data={editData} setData={setEditData} type="select" options={[
                { value: false, label: "One-time Event" },
                { value: true, label: "Recurring Monthly" },
              ]} />
              <DetailItem label="Launch Date" value={new Date(campaign.startDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })} isEditing={isEditing} field="startDate" data={editData} setData={setEditData} type="date" />
              <DetailItem label="Expiry Date" value={campaign.endDate ? new Date(campaign.endDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : "Ongoing"} isEditing={isEditing} field="endDate" data={editData} setData={setEditData} type="date" />
            </div>
            <div className="px-6 pb-6">
              <DetailItem label="Campaign Description" value={campaign.description} isEditing={isEditing} field="description" data={editData} setData={setEditData} type="textarea" />
            </div>
          </div>

          {/* Linked Target Products */}
          <TargetProducts campaignId={id} />

        </div>

        {/* Right Column (4 Columns) */}
        <div className="col-span-12 space-y-6 xl:col-span-4">

          {/* Performance Metrics */}
          <div className="bg-white dark:bg-white/[0.02] border border-gray-200/80 dark:border-white/[0.06] p-6 rounded-2xl shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-white/5 pb-3">Performance Telemetry</h3>
            <div className="space-y-3">
              <div className="p-3.5 rounded-xl border border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/[0.01]">
                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Total Points Awarded</span>
                <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">0 PTS</p>
              </div>
              <div className="p-3.5 rounded-xl border border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/[0.01]">
                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Active Participants</span>
                <p className="text-xl font-bold text-gray-900 dark:text-white mt-1">0 Members</p>
              </div>
              <div className="p-3.5 rounded-xl border border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/[0.01]">
                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Campaign ROI</span>
                <p className="text-xl font-bold text-emerald-500 mt-1">100.0%</p>
              </div>
            </div>
          </div>

          {/* Insights Hero Banner */}
          <div className="bg-gradient-to-br from-gray-900 via-gray-950 to-black border border-gray-800 p-6 rounded-2xl text-white shadow-xl relative overflow-hidden space-y-3">
            <div className="flex items-center gap-2 text-brand-400 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-brand-400 animate-pulse" />
              Insights Engine
            </div>
            <h4 className="text-base font-bold text-white">Rule Optimization Ready</h4>
            <p className="text-xs text-gray-400 leading-relaxed">
              As consumers earn points under this campaign rule, real-time analytics and predictive modeling will populate here.
            </p>
          </div>

          {/* Actions */}
          <div className="bg-white dark:bg-white/[0.02] border border-gray-200/80 dark:border-white/[0.06] p-4 rounded-2xl shadow-sm space-y-2">
            <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 px-2">Campaign Controls</h4>
            <button className="w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition">
              Duplicate Campaign Rules
              <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" /></svg>
            </button>
            <button className="w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition">
              Archive Campaign
              <svg className="h-4 w-4 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}

function TargetProducts({ campaignId }: { campaignId: string }) {
  const { data: linkedProducts, mutate } = useApi<any[]>(`/campaigns/${campaignId}/products`);
  const { data: allProducts } = useApi<any[]>("/products");
  const [selectedProductId, setSelectedProductId] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const handleAdd = async () => {
    if (!selectedProductId) return;
    setIsAdding(true);
    try {
      await authenticatedFetch(`/api/campaigns/${campaignId}/products`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: selectedProductId }),
      });
      mutate();
      setSelectedProductId("");
    } catch (err) {
      console.error(err);
    } finally {
      setIsAdding(false);
    }
  };

  const handleRemove = async (productId: string) => {
    try {
      await authenticatedFetch(`/api/campaigns/${campaignId}/products/${productId}`, {
        method: "DELETE",
      });
      mutate();
    } catch (err) {
      console.error(err);
    }
  };

  const availableProducts = allProducts?.filter(
    (p) => !linkedProducts?.find((lp) => lp.id === p.id)
  ) || [];

  return (
    <div className="bg-white dark:bg-white/[0.02] border border-gray-200/80 dark:border-white/[0.06] rounded-2xl shadow-sm relative">
      <div className="border-b border-gray-100 dark:border-white/5 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-gray-900 dark:text-white">Linked Target Products</h3>
          <p className="text-xs text-gray-400 mt-0.5">{linkedProducts?.length || 0} products actively eligible for this rule</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-full sm:w-[240px]">
            <ModernSelect
              options={availableProducts.map(p => ({ value: p.id, label: `${p.name} (${p.sku})` }))}
              value={selectedProductId}
              onChange={setSelectedProductId}
              placeholder="Link a product..."
            />
          </div>
          <button
            onClick={handleAdd}
            disabled={!selectedProductId || isAdding}
            className="px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold rounded-xl transition shadow-sm disabled:opacity-50 shrink-0"
          >
            {isAdding ? "Linking..." : "Link Product"}
          </button>
        </div>
      </div>

      <div className="p-6">
        {linkedProducts && linkedProducts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {linkedProducts.map((p: any) => (
              <div key={p.id} className="group flex items-center justify-between p-3.5 rounded-xl border border-gray-200/80 dark:border-white/10 bg-gray-50/50 dark:bg-white/[0.01] hover:border-brand-500/40 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400 text-xs font-bold shadow-2xs">
                    {p.name?.charAt(0)}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-gray-900 dark:text-white leading-tight">{p.name}</span>
                    <span className="mt-0.5 text-[10px] text-gray-400 font-mono">{p.sku}</span>
                  </div>
                </div>
                <button
                  onClick={() => handleRemove(p.id)}
                  className="p-1.5 text-gray-400 hover:text-rose-500 transition-colors"
                  aria-label="Remove product"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="p-3 bg-gray-50 dark:bg-white/5 rounded-full mb-2 text-gray-400">
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <p className="text-xs font-semibold text-gray-900 dark:text-white">No Specific Products Linked</p>
            <p className="text-[11px] text-gray-400 mt-0.5">Link specific products above, or this campaign multiplier will apply globally.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function DetailItem({ label, value, isEditing, field, data, setData, type = "text", options }: any) {
  return (
    <div className="flex flex-col gap-1 py-2.5 border-b border-gray-100 dark:border-white/5 last:border-0">
      <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
        {label}
      </span>
      {isEditing ? (
        <div className="pt-1">
          {type === "select" ? (
            <ModernSelect
              options={options || []}
              value={data[field] || ""}
              onChange={(val) => setData({ ...data, [field]: val })}
              placeholder={`Select ${label.toLowerCase()}`}
            />
          ) : type === "date" ? (
            <DatePicker
              value={data[field] ? new Date(data[field]).toISOString().split("T")[0] : ""}
              onChange={(val) => setData({ ...data, [field]: val })}
            />
          ) : type === "textarea" ? (
            <textarea
              value={data[field] || ""}
              onChange={(e) => setData({ ...data, [field]: e.target.value })}
              className="w-full p-2.5 bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-white/10 rounded-xl text-xs font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/40"
            />
          ) : (
            <input
              type={type}
              value={data[field] || ""}
              onChange={(e) => setData({ ...data, [field]: e.target.value })}
              className="w-full px-3 py-2 bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-white/10 rounded-xl text-xs font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/40"
            />
          )}
        </div>
      ) : (
        <span className={`text-xs mt-0.5 ${!value ? "text-gray-400 font-normal italic" : "text-gray-900 dark:text-white font-bold capitalize"}`}>
          {value || "Not provided"}
        </span>
      )}
    </div>
  );
}