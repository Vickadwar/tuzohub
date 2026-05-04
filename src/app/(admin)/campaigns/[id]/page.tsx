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
      <div className="w-full">
        <div className="flex items-center gap-3 rounded-md bg-error-50 p-4 border border-error-200 dark:bg-error-500/10 dark:border-error-500/20">
          <svg className="h-5 w-5 shrink-0 text-error-600 dark:text-error-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <p className="text-sm font-medium text-error-800 dark:text-error-300">Failed to load campaign. Please try again.</p>
        </div>
      </div>
    );
  }

  if (isLoading || !campaign) {
    return (
      <div className="flex min-h-[60vh] w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-brand-500 dark:border-white/10 dark:border-t-brand-400"></div>
      </div>
    );
  }

  const handleSave = async () => {
    setIsSaving(true);
    setError("");

    try {
      const resData = await authenticatedFetch(`/api/campaigns/${id}`, {
        method: "PATCH",
        body: JSON.stringify(editData),
      });
      if (resData.success) {
        setIsEditing(false);
        mutate();
      } else {
        setError(resData.error || "Update failed");
      }
    } catch (err: any) {
      setError(err.info?.error || err.message || "Network error occurred");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-500">

      {/* ── Page Header ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5 rounded-lg bg-white p-6 border border-gray-200 shadow-sm dark:bg-[#18181b] dark:border-white/10">
        <div className="flex items-center gap-5">
          <Link
            href="/campaigns"
            className="group flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-gray-200 bg-white shadow-sm transition-all hover:bg-gray-50 dark:border-white/10 dark:bg-[#18181b] dark:hover:bg-white/5"
          >
            <svg className="h-4 w-4 text-gray-500 transition-transform group-hover:-translate-x-0.5 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </Link>

          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-purple-100 text-lg font-bold text-purple-700 shadow-sm dark:bg-purple-500/20 dark:text-purple-400">
            {campaign.name?.charAt(0) || "C"}
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-xl font-semibold tracking-tight text-gray-900 dark:text-white">
                {campaign.name}
              </h1>
              <Badge color={campaign.isActive ? "success" : "warning"} size="sm">
                {campaign.isActive ? "Active" : "Archived"}
              </Badge>
            </div>
            <p className="mt-1 text-sm font-medium text-gray-500 dark:text-gray-400 capitalize">
              {campaign.campaignType?.replace(/_/g, " ").toLowerCase()} promotion
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {isEditing ? (
            <>
              <button
                onClick={() => { setIsEditing(false); setEditData(campaign); setError(""); }}
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
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
              Edit rules
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-3 rounded-md bg-error-50 p-4 border border-error-200 dark:bg-error-500/10 dark:border-error-500/20">
          <svg className="h-5 w-5 shrink-0 text-error-600 dark:text-error-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-sm font-medium text-error-800 dark:text-error-300">{error}</p>
        </div>
      )}

      {/* ── Main Layout: 12-Column Grid ───────────────────────────────────── */}
      <div className="grid grid-cols-12 gap-6">

        {/* Left Column (Spans 8 columns) */}
        <div className="col-span-12 space-y-6 xl:col-span-8">

          {/* Configuration Rules */}
          <div className="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-white/10 dark:bg-[#18181b] overflow-hidden">
            <div className="border-b border-gray-100 px-6 py-5 dark:border-white/5">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">Configuration rules</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Core settings defining how this campaign operates.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 p-6">
              <DetailItem label="Campaign name" value={campaign.name} isEditing={isEditing} field="name" data={editData} setData={setEditData} />
              <DetailItem label="Promotion type" value={campaign.campaignType?.replace(/_/g, " ").toLowerCase()} isEditing={isEditing} field="campaignType" data={editData} setData={setEditData} type="select" options={[
                { value: "EARNING", label: "Points earning" },
                { value: "CASHBACK", label: "Cashback reward" },
                { value: "DOUBLE_POINTS", label: "Double points event" },
              ]} />
              <DetailItem label="Points multiplier" value={`${campaign.pointsMultiplier}x`} isEditing={isEditing} field="pointsMultiplier" data={editData} setData={setEditData} />
              <DetailItem label="Recursion" value={campaign.isRecurring ? "Recurring monthly" : "One-time event"} isEditing={isEditing} field="isRecurring" data={editData} setData={setEditData} type="select" options={[
                { value: false, label: "One-time event" },
                { value: true, label: "Recurring monthly" },
              ]} />
              <DetailItem label="Launch date" value={new Date(campaign.startDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })} isEditing={isEditing} field="startDate" data={editData} setData={setEditData} type="date" />
              <DetailItem label="Expiry date" value={campaign.endDate ? new Date(campaign.endDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : "Ongoing"} isEditing={isEditing} field="endDate" data={editData} setData={setEditData} type="date" />
            </div>
            <div className="px-6 pb-6">
              <DetailItem label="Campaign description" value={campaign.description} isEditing={isEditing} field="description" data={editData} setData={setEditData} type="textarea" />
            </div>
          </div>

          {/* Target Products Component */}
          <TargetProducts campaignId={id} />

        </div>

        {/* Right Column (Spans 4 columns) */}
        <div className="col-span-12 space-y-6 xl:col-span-4">

          {/* Performance Stats */}
          <div className="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-white/10 dark:bg-[#18181b]">
            <div className="border-b border-gray-100 px-6 py-5 dark:border-white/5">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">Performance metrics</h3>
            </div>
            <div className="flex flex-col p-6 space-y-4">
              <div className="flex flex-col gap-1 rounded-md border border-gray-100 bg-gray-50 p-4 dark:border-white/5 dark:bg-white/5">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Total points issued</span>
                <span className="text-2xl font-semibold text-gray-900 dark:text-white">0</span>
              </div>
              <div className="flex flex-col gap-1 rounded-md border border-gray-100 bg-gray-50 p-4 dark:border-white/5 dark:bg-white/5">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Active participants</span>
                <span className="text-2xl font-semibold text-gray-900 dark:text-white">0</span>
              </div>
              <div className="flex flex-col gap-1 rounded-md border border-gray-100 bg-gray-50 p-4 dark:border-white/5 dark:bg-white/5">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Estimated ROI</span>
                <span className="text-2xl font-semibold text-success-600 dark:text-success-500">0%</span>
              </div>
            </div>
          </div>

          {/* Insights Engine */}
          <div className="relative overflow-hidden rounded-lg bg-gray-900 p-6 text-white shadow-sm dark:bg-[#121212] dark:border dark:border-white/10">
            <div className="relative z-10">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-brand-400">Insights engine</h4>
              <p className="mt-2 text-lg font-semibold leading-tight text-white">Optimization required</p>
              <p className="mt-2 text-sm leading-relaxed text-gray-400">
                This campaign is newly launched. Start enrolling consumers to see real-time performance data and predictive modeling here.
              </p>
            </div>
            <div className="absolute -right-8 -bottom-8 h-32 w-32 rounded-full bg-brand-500/20 blur-2xl pointer-events-none"></div>
          </div>

          {/* Actions */}
          <div className="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-white/10 dark:bg-[#18181b]">
            <div className="border-b border-gray-100 px-6 py-4 dark:border-white/5">
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Actions</h4>
            </div>
            <div className="p-4 space-y-2">
              <button className="flex w-full items-center justify-between rounded-md px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-white/5 dark:hover:text-white transition-colors">
                Duplicate campaign
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" /></svg>
              </button>
              <button className="flex w-full items-center justify-between rounded-md px-4 py-2 text-sm font-medium text-error-600 hover:bg-error-50 dark:text-error-400 dark:hover:bg-error-500/10 transition-colors">
                Archive campaign
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
              </button>
            </div>
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
    <div className="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-white/10 dark:bg-[#18181b] overflow-hidden">
      <div className="border-b border-gray-100 px-6 py-5 dark:border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-semibold text-gray-900 dark:text-white">Target products</h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{linkedProducts?.length || 0} products currently linked</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-full sm:w-[250px]">
            <ModernSelect
              options={availableProducts.map(p => ({ value: p.id, label: `${p.name} (${p.sku})` }))}
              value={selectedProductId}
              onChange={setSelectedProductId}
              placeholder="Select product..."
            />
          </div>
          <button
            onClick={handleAdd}
            disabled={!selectedProductId || isAdding}
            className="inline-flex h-10 items-center justify-center rounded-md bg-brand-600 px-4 text-sm font-medium text-white shadow-sm hover:bg-brand-700 disabled:opacity-60 transition-colors shrink-0"
          >
            {isAdding ? "Linking..." : "Link product"}
          </button>
        </div>
      </div>

      <div className="p-6">
        {linkedProducts && linkedProducts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {linkedProducts.map((p: any) => (
              <div key={p.id} className="group flex items-center justify-between rounded-md border border-gray-200 bg-white p-3 shadow-sm hover:border-gray-300 dark:border-white/10 dark:bg-white/5 dark:hover:border-white/20 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-gray-100 text-xs font-semibold text-gray-600 dark:bg-white/10 dark:text-gray-300">
                    {p.name?.charAt(0)}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-900 dark:text-white leading-tight">{p.name}</span>
                    <span className="mt-0.5 text-xs text-gray-500 dark:text-gray-400 font-mono">{p.sku}</span>
                  </div>
                </div>
                <button
                  onClick={() => handleRemove(p.id)}
                  className="rounded p-1.5 text-gray-400 hover:bg-error-50 hover:text-error-600 dark:hover:bg-error-500/10 dark:hover:text-error-400 transition-colors opacity-0 group-hover:opacity-100"
                  aria-label="Remove product"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <svg className="mb-3 h-8 w-8 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            <p className="text-sm font-medium text-gray-900 dark:text-white">No products linked</p>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Link specific products or this campaign will apply globally.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function DetailItem({ label, value, isEditing, field, data, setData, type = "text", options }: any) {
  return (
    <div className="flex flex-col gap-1.5 py-3 border-b border-gray-50 last:border-0 dark:border-white/5">
      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
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
              className="min-h-[100px] w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm transition-colors placeholder:text-gray-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-white/30"
            />
          ) : (
            <input
              type={type}
              value={data[field] || ""}
              onChange={(e) => setData({ ...data, [field]: e.target.value })}
              className="h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-900 shadow-sm transition-colors placeholder:text-gray-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-white/30"
            />
          )}
        </div>
      ) : (
        <span className={`text-sm mt-0.5 ${!value ? "text-gray-400 font-normal" : "text-gray-900 font-medium dark:text-gray-200 capitalize"}`}>
          {value || "Not provided"}
        </span>
      )}
    </div>
  );
}