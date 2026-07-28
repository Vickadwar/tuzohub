"use client";

import React, { use, useState, useEffect } from "react";
import Link from "next/link";
import Badge from "@/components/ui/badge/Badge";
import { useApi, authenticatedFetch } from "@/hooks/useApi";
import ModernSelect from "@/components/ui/ModernSelect";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ProductDetail({ params }: PageProps) {
  const resolvedParams = use(params as any) as any;
  const id = resolvedParams?.id;

  const { data: result, isLoading, isError, mutate } = useApi<any>(`/products/${id}`);

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [editData, setEditData] = useState<any>({});

  useEffect(() => {
    if (result) {
      setEditData(result);
    }
  }, [result]);

  if (isError) {
    return (
      <div className="w-full p-6">
        <div className="flex items-center gap-3 rounded-2xl bg-rose-500/10 p-4 border border-rose-500/20 text-rose-600 dark:text-rose-400">
          <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <p className="text-xs font-semibold">Failed to load product details. Please try refreshing.</p>
        </div>
      </div>
    );
  }

  if (isLoading || !result) {
    return (
      <div className="flex min-h-[60vh] w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-500 border-t-transparent"></div>
      </div>
    );
  }

  const product = result;

  const handleSave = async () => {
    setIsSaving(true);
    setError("");

    if (!editData.name || !editData.sku) {
      setError("Product name and SKU item code are required.");
      setIsSaving(false);
      return;
    }

    try {
      const resData = await authenticatedFetch(`/api/products/${id}`, {
        method: "PATCH",
        body: JSON.stringify({
          ...editData,
          pointsPerUnit: parseInt(editData.pointsPerUnit?.toString()) || 0
        }),
      });
      if (resData.success) {
        setIsEditing(false);
        mutate();
      } else {
        setError(resData.error || "Update failed.");
      }
    } catch (err: any) {
      setError(err.info?.error || err.message || "Network error occurred.");
    } finally {
      setIsSaving(false);
    }
  };

  const initials = product.name?.charAt(0)?.toUpperCase() || "P";

  return (
    <div className="w-full space-y-6 animate-fadeIn pb-12">

      {/* ── Page Header Card ─────────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-white/[0.02] border border-gray-200/80 dark:border-white/[0.06] p-6 rounded-2xl shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
        <div className="flex items-center gap-4">
          <Link
            href="/products"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors text-gray-500 dark:text-gray-400"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </Link>

          {/* Rounded Full Avatar Badge */}
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400 font-bold text-sm border border-brand-500/20 shadow-2xs">
            {initials}
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-lg font-bold tracking-tight text-gray-900 dark:text-white">
                {product.name}
              </h1>
              <Badge color={product.isActive ? "success" : "warning"} size="sm">
                {product.isActive ? "Active" : "Archived"}
              </Badge>
            </div>
            <p className="mt-0.5 text-xs font-semibold text-gray-500 dark:text-gray-400">
              SKU: <span className="font-mono text-gray-900 dark:text-gray-300">{product.sku}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {isEditing ? (
            <>
              <button
                onClick={() => { setIsEditing(false); setEditData(product); setError(""); }}
                className="px-4 py-2 text-xs font-semibold text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition"
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
              className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-white/5 dark:hover:bg-white/10 text-gray-900 dark:text-white text-xs font-semibold rounded-xl border border-gray-200/80 dark:border-white/10 transition flex items-center gap-2"
            >
              <svg className="h-4 w-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
              Edit Product
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

        {/* Left Column (Spans 8 columns) */}
        <div className="col-span-12 space-y-6 xl:col-span-8">

          {/* Product Specifications */}
          <div className="bg-white dark:bg-white/[0.02] border border-gray-200/80 dark:border-white/[0.06] rounded-2xl shadow-sm relative">
            <div className="border-b border-gray-100 dark:border-white/5 px-6 py-4">
              <h2 className="text-sm font-bold text-gray-900 dark:text-white">Product Specifications</h2>
              <p className="mt-0.5 text-xs text-gray-400">Core details, unit pricing, and point multipliers.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 p-6">
              <DetailItem label="Product Name" value={product.name} isEditing={isEditing} field="name" data={editData} setData={setEditData} />
              <DetailItem label="SKU / Item Code" value={product.sku} isEditing={isEditing} field="sku" data={editData} setData={setEditData} />
              <DetailItem label="Points Per Unit" value={product.pointsPerUnit?.toLocaleString()} isEditing={isEditing} field="pointsPerUnit" data={editData} setData={setEditData} type="number" />
              <DetailItem label="Retail Price (KES)" value={product.price} isEditing={isEditing} field="price" data={editData} setData={setEditData} />
              <DetailItem label="Category" value={product.category?.replace(/_/g, " ").toLowerCase()} isEditing={isEditing} field="category" data={editData} setData={setEditData} type="select" options={[
                { value: "ECONOMY_RANGE", label: "Economy Range" },
                { value: "PREMIUM_RANGE", label: "Premium Range" },
                { value: "GLOSS_ENAMEL", label: "Gloss Enamel" },
                { value: "EMULSION", label: "Emulsion" },
                { value: "PRIMERS", label: "Primers & Undercoats" },
              ]} />
              <DetailItem label="Unit of Measure" value={product.unitOfMeasure?.toLowerCase()} isEditing={isEditing} field="unitOfMeasure" data={editData} setData={setEditData} type="select" options={[
                { value: "UNIT", label: "Unit (Piece)" },
                { value: "KG", label: "Kilogram (kg)" },
                { value: "LITRE", label: "Litre (l)" },
                { value: "PACK", label: "Pack / Box" },
              ]} />
            </div>
          </div>
        </div>

        {/* Right Column (Spans 4 columns) */}
        <div className="col-span-12 space-y-6 xl:col-span-4">

          {/* Inventory Status */}
          <div className="bg-white dark:bg-white/[0.02] border border-gray-200/80 dark:border-white/[0.06] rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-white/5 pb-3">
              Inventory Status
            </h3>
            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between border-b border-gray-100 dark:border-white/5 pb-2.5">
                <span className="font-semibold text-gray-500 dark:text-gray-400">Lifecycle Status</span>
                <span className="font-bold text-gray-900 dark:text-white">{product.isActive ? "Live in Catalog" : "Archived"}</span>
              </div>
              <div className="flex items-center justify-between border-b border-gray-100 dark:border-white/5 pb-2.5">
                <span className="font-semibold text-gray-500 dark:text-gray-400">Created On</span>
                <span className="font-semibold text-gray-900 dark:text-white">{new Date(product.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-semibold text-gray-500 dark:text-gray-400">Last Modified</span>
                <span className="font-semibold text-gray-900 dark:text-white">{new Date(product.updatedAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          {/* Catalog Insights Banner */}
          <div className="bg-gradient-to-br from-gray-900 via-gray-950 to-black border border-gray-800 p-6 rounded-2xl text-white shadow-xl space-y-3 relative overflow-hidden">
            <div className="relative z-10 space-y-2">
              <span className="text-[10px] font-semibold text-brand-400">Catalog Insights</span>
              <h4 className="text-sm font-bold text-white">Reward Performance</h4>
              <p className="text-xs text-gray-400 leading-relaxed">
                This item is active in the point multiplier matrix. Link it with ongoing promotion rules to drive redemption volume.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Refined Detail Item Component ───────────────────────────────────────────
function DetailItem({ label, value, isEditing, field, data, setData, type = "text", options }: any) {
  return (
    <div className="flex flex-col gap-1 py-2.5 border-b border-gray-100 last:border-0 dark:border-white/5">
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
          ) : (
            <input
              type={type}
              value={data[field] || ""}
              onChange={(e) => setData({ ...data, [field]: e.target.value })}
              placeholder={`Enter ${label.toLowerCase()}`}
              className="w-full px-3.5 py-2 bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-white/10 rounded-xl text-xs font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/40"
            />
          )}
        </div>
      ) : (
        <span className={`text-xs mt-0.5 ${!value ? "text-gray-400 font-normal" : "text-gray-900 font-bold dark:text-white capitalize"}`}>
          {value || "Not provided"}
        </span>
      )}
    </div>
  );
}