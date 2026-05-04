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
      <div className="w-full">
        <div className="flex items-center gap-3 rounded-md bg-error-50 p-4 border border-error-200 dark:bg-error-500/10 dark:border-error-500/20">
          <svg className="h-5 w-5 shrink-0 text-error-600 dark:text-error-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <p className="text-sm font-medium text-error-800 dark:text-error-300">Failed to load product details. Please try again.</p>
        </div>
      </div>
    );
  }

  if (isLoading || !result) {
    return (
      <div className="flex min-h-[60vh] w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-brand-500 dark:border-white/10 dark:border-t-brand-400"></div>
      </div>
    );
  }

  const product = result;

  const handleSave = async () => {
    setIsSaving(true);
    setError("");

    if (!editData.name || !editData.sku) {
      setError("Product name and SKU are required.");
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
    <div className="w-full space-y-6 animate-in fade-in duration-500">

      {/* ── Page Header ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5 rounded-lg bg-white p-6 border border-gray-200 shadow-sm dark:bg-[#18181b] dark:border-white/10">
        <div className="flex items-center gap-5">
          <Link
            href="/products"
            className="group flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-gray-200 bg-white shadow-sm transition-all hover:bg-gray-50 dark:border-white/10 dark:bg-[#18181b] dark:hover:bg-white/5"
          >
            <svg className="h-4 w-4 text-gray-500 transition-transform group-hover:-translate-x-0.5 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </Link>

          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-100 text-lg font-bold text-blue-700 shadow-sm dark:bg-blue-500/20 dark:text-blue-400">
            {initials}
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-xl font-semibold tracking-tight text-gray-900 dark:text-white">
                {product.name}
              </h1>
              <Badge color={product.isActive ? "success" : "warning"} size="sm">
                {product.isActive ? "Active" : "Archived"}
              </Badge>
            </div>
            <p className="mt-1 text-sm font-medium text-gray-500 dark:text-gray-400">
              SKU: <span className="font-mono text-gray-900 dark:text-gray-300">{product.sku}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {isEditing ? (
            <>
              <button
                onClick={() => { setIsEditing(false); setEditData(product); setError(""); }}
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
              Edit product
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

          {/* Product Specifications */}
          <div className="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-white/10 dark:bg-[#18181b] overflow-hidden">
            <div className="border-b border-gray-100 px-6 py-5 dark:border-white/5">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">Product specifications</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Core details, pricing, and point valuations.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 p-6">
              <DetailItem label="Product name" value={product.name} isEditing={isEditing} field="name" data={editData} setData={setEditData} />
              <DetailItem label="SKU / item code" value={product.sku} isEditing={isEditing} field="sku" data={editData} setData={setEditData} />
              <DetailItem label="Points per unit" value={product.pointsPerUnit?.toLocaleString()} isEditing={isEditing} field="pointsPerUnit" data={editData} setData={setEditData} type="number" />
              <DetailItem label="Retail price (KES)" value={product.price} isEditing={isEditing} field="price" data={editData} setData={setEditData} />
              <DetailItem label="Category" value={product.category?.replace(/_/g, " ").toLowerCase()} isEditing={isEditing} field="category" data={editData} setData={setEditData} type="select" options={[
                { value: "ECONOMY_RANGE", label: "Economy range" },
                { value: "PREMIUM_RANGE", label: "Premium range" },
                { value: "GLOSS_ENAMEL", label: "Gloss enamel" },
                { value: "EMULSION", label: "Emulsion" },
                { value: "PRIMERS", label: "Primers & undercoats" },
              ]} />
              <DetailItem label="Unit of measure" value={product.unitOfMeasure?.toLowerCase()} isEditing={isEditing} field="unitOfMeasure" data={editData} setData={setEditData} type="select" options={[
                { value: "UNIT", label: "Unit (piece)" },
                { value: "KG", label: "Kilogram (kg)" },
                { value: "LITRE", label: "Litre (l)" },
                { value: "PACK", label: "Pack / box" },
              ]} />
            </div>
          </div>
        </div>

        {/* Right Column (Spans 4 columns) */}
        <div className="col-span-12 space-y-6 xl:col-span-4">

          {/* Inventory Status */}
          <div className="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-white/10 dark:bg-[#18181b]">
            <div className="border-b border-gray-100 px-6 py-5 dark:border-white/5">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">Inventory status</h3>
            </div>
            <div className="flex flex-col p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-gray-50 pb-4 dark:border-white/5">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Lifecycle status</span>
                <span className="text-sm font-semibold text-gray-900 dark:text-white">{product.isActive ? "Live in catalog" : "Archived"}</span>
              </div>
              <div className="flex items-center justify-between border-b border-gray-50 pb-4 dark:border-white/5">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Created on</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">{new Date(product.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Last modified</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">{new Date(product.updatedAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          {/* Catalog Insights */}
          <div className="relative overflow-hidden rounded-lg bg-gray-900 p-6 text-white shadow-sm dark:bg-[#121212] dark:border dark:border-white/10">
            <div className="relative z-10">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-brand-400">Catalog insights</h4>
              <p className="mt-2 text-lg font-semibold leading-tight text-white">Reward performance</p>
              <p className="mt-2 text-sm leading-relaxed text-gray-400">
                This item currently has zero redemptions. Promote it via marketing campaigns to drive engagement.
              </p>
              <button className="mt-5 w-full rounded-md border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white/10 backdrop-blur-sm">
                View redemption analytics
              </button>
            </div>
            <div className="absolute -bottom-16 -right-16 h-40 w-40 rounded-full bg-brand-500/20 blur-3xl pointer-events-none"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Refined Detail Item Component ───────────────────────────────────────────
function DetailItem({ label, value, isEditing, field, data, setData, type = "text", options }: any) {
  return (
    <div className={`flex flex-col gap-1.5 py-3 border-b border-gray-50 last:border-0 dark:border-white/5`}>
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
          ) : (
            <input
              type={type}
              value={data[field] || ""}
              onChange={(e) => setData({ ...data, [field]: e.target.value })}
              placeholder={`Enter ${label.toLowerCase()}`}
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