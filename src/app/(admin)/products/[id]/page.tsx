"use client";

import React, { use, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Barcode from "react-barcode";
import Badge from "@/components/ui/badge/Badge";
import { useApi, authenticatedFetch } from "@/hooks/useApi";
import SearchableSelect from "@/components/ui/select/SearchableSelect";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ProductDetail({ params }: PageProps) {
  const router = useRouter();
  const resolvedParams = use(params as any) as any;
  const id = resolvedParams?.id;

  const { data: result, isLoading, isError, mutate } = useApi<any>(`/products/${id}`);

  const [categoriesList, setCategoriesList] = useState<string[]>([]);
  const [uomsList, setUomsList] = useState<string[]>([]);

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [editData, setEditData] = useState<any>({});

  useEffect(() => {
    if (result) {
      setEditData({
        ...result,
        barcode: result.barcode || result.metadata?.barcode || "",
        brand: result.brand || result.metadata?.brand || "",
      });
    }
  }, [result]);

  useEffect(() => {
    async function loadMeta() {
      try {
        const data = await authenticatedFetch("/api/products/meta/categories-uom");
        if (data) {
          setCategoriesList(data.categories || []);
          setUomsList(data.unitsOfMeasure || []);
        }
      } catch (err) {
        console.warn("Could not fetch product meta options", err);
      }
    }
    loadMeta();
  }, []);

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
  // Dynamic Live Barcode Value: Uses custom barcode if provided, otherwise defaults to Item Code (SKU)
  const currentBarcodeValue = (isEditing ? editData.barcode : product.barcode) || product.sku || "PRD-DEFAULT";

  const handleSave = async () => {
    setIsSaving(true);
    setError("");
    setSuccessMsg("");

    if (!editData.name?.trim() || !editData.sku?.trim()) {
      setError("Product name and SKU item code are required.");
      setIsSaving(false);
      return;
    }

    try {
      const payload = {
        name: editData.name.trim(),
        sku: editData.sku.trim(),
        category: editData.category ? editData.category.trim() : null,
        subcategory: editData.subcategory ? editData.subcategory.trim() : null,
        unitOfMeasure: editData.unitOfMeasure ? editData.unitOfMeasure.trim() : null,
        measurementValue: editData.measurementValue !== undefined && editData.measurementValue !== null && editData.measurementValue !== ""
          ? String(editData.measurementValue)
          : null,
        pointsPerUnit: parseInt(editData.pointsPerUnit?.toString() || "0") || 0,
        price: editData.price ? String(editData.price).trim() : null,
        costPrice: editData.costPrice ? String(editData.costPrice).trim() : null,
        barcode: editData.barcode ? editData.barcode.trim() : editData.sku.trim(),
        brand: editData.brand ? editData.brand.trim() : null,
        isActive: editData.isActive ?? true,
      };

      const resData = await authenticatedFetch(`/api/products/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (resData) {
        setIsEditing(false);
        setSuccessMsg("100% Persisted! Product parameters and barcode updated successfully.");
        setTimeout(() => setSuccessMsg(""), 3500);
        mutate();
      } else {
        setError("Update failed.");
      }
    } catch (err: any) {
      setError(err.info?.error || err.message || "Network error occurred.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (product.isLinkedToActivity) {
      setError(`Cannot delete product "${product.name}" because it is linked to ${product.linkedActivityCount} active inventory transaction(s). You can Archive it instead.`);
      return;
    }

    if (!confirm(`Are you sure you want to permanently delete product "${product.name}"? This action cannot be undone.`)) {
      return;
    }

    setIsDeleting(true);
    setError("");

    try {
      await authenticatedFetch(`/api/products/${id}`, {
        method: "DELETE",
      });
      router.push("/products");
    } catch (err: any) {
      setError(err.message || "Failed to delete product.");
      setIsDeleting(false);
    }
  };

  const initials = product.name?.charAt(0)?.toUpperCase() || "P";
  const displayMargin = (isEditing ? editData.price && editData.costPrice : product.price && product.costPrice)
    ? (parseFloat(isEditing ? editData.price : product.price) - parseFloat(isEditing ? editData.costPrice : product.costPrice)).toFixed(2)
    : null;

  return (
    <div className="w-full space-y-6 animate-fadeIn pb-16">

      {/* ── Breadcrumb & Page Header Card ───────────────────────────────────── */}
      <div className="bg-white dark:bg-white/[0.02] border border-gray-200/80 dark:border-white/[0.06] p-6 rounded-2xl shadow-sm space-y-4">
        <nav className="flex items-center gap-2 text-xs font-semibold text-gray-400">
          <Link href="/overview" className="hover:text-brand-500 transition-colors">
            Dashboard
          </Link>
          <span>/</span>
          <Link href="/products" className="hover:text-brand-500 transition-colors">
            Products
          </Link>
          <span>/</span>
          <span className="text-gray-700 dark:text-gray-300">{product.name}</span>
        </nav>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5 pt-2 border-t border-gray-100 dark:border-white/5">
          <div className="flex items-center gap-4">
            <Link
              href="/products"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors text-gray-500 dark:text-gray-400"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
            </Link>

            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-brand-500/10 text-brand-600 dark:text-brand-400 font-bold text-base border border-brand-500/20 shadow-2xs">
              {initials}
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
                  {product.name}
                </h1>
                <Badge color={product.isActive ? "success" : "warning"} size="sm">
                  {product.isActive ? "Active in Catalog" : "Archived"}
                </Badge>
                {product.isLinkedToActivity && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[11px] font-semibold border border-amber-500/20">
                    🔒 Linked to Activity ({product.linkedActivityCount})
                  </span>
                )}
              </div>
              <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                <span className="font-mono bg-gray-100 dark:bg-white/5 px-2 py-0.5 rounded text-gray-700 dark:text-gray-300">
                  SKU: {product.sku}
                </span>
                {product.category && (
                  <span className="font-semibold text-brand-600 dark:text-brand-400">
                    Category: {product.category}
                  </span>
                )}
                {product.unitOfMeasure && (
                  <span className="font-semibold text-gray-600 dark:text-gray-300">
                    UOM: {product.unitOfMeasure}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {isEditing ? (
              <>
                <button
                  type="button"
                  onClick={() => { setIsEditing(false); setEditData(product); setError(""); }}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={isSaving}
                  className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold rounded-xl transition shadow-md shadow-brand-500/20 disabled:opacity-50 flex items-center gap-2"
                >
                  {isSaving ? "Saving to Database..." : "Save Product Parameters"}
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-white/5 dark:hover:bg-white/10 text-gray-900 dark:text-white text-xs font-semibold rounded-xl border border-gray-200/80 dark:border-white/10 transition flex items-center gap-2"
              >
                <svg className="h-4 w-4 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
                Edit Parameters
              </button>
            )}
          </div>
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

      {/* ── Main Layout: 12-Column Grid ───────────────────────────────────── */}
      <div className="grid grid-cols-12 gap-6">

        {/* Left Column (Spans 8 columns) */}
        <div className="col-span-12 space-y-6 xl:col-span-8">

          {/* Section 1: Product Classification & Identifiers */}
          <div className="bg-white dark:bg-white/[0.02] border border-gray-200/80 dark:border-white/[0.06] rounded-2xl shadow-sm overflow-hidden">
            <div className="border-b border-gray-100 dark:border-white/5 px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-gray-900 dark:text-white">Classification &amp; Barcode Identification</h2>
                <p className="mt-0.5 text-xs text-gray-400">Master product identification codes, barcode standards, and taxonomies.</p>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400 text-[10px] font-mono font-bold">
                Item ID: {product.id.substring(0, 8)}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 p-6">
              <DetailField label="Product Name" value={product.name} isEditing={isEditing} field="name" data={editData} setData={setEditData} />

              <DetailField
                label="SKU / Item Code"
                value={product.sku}
                isEditing={isEditing}
                field="sku"
                data={editData}
                setData={setEditData}
                disabled={product.isLinkedToActivity}
                lockReason={product.isLinkedToActivity ? "SKU locked because product has active transactions" : undefined}
              />

              <DetailField
                label="Barcode / EAN-13"
                value={editData.barcode || product.barcode || product.sku}
                isEditing={isEditing}
                field="barcode"
                data={editData}
                setData={setEditData}
                hint={!editData.barcode && !product.barcode ? "(Defaults to SKU item code)" : "Live Barcode Persisted"}
                placeholder="e.g. 600123456789 or EAN-13"
              />

              <DetailField
                label="Product Category"
                value={product.category}
                isEditing={isEditing}
                field="category"
                data={editData}
                setData={setEditData}
                options={categoriesList}
                isSearchableSelect
              />

              <DetailField
                label="Subcategory / Product Line"
                value={product.subcategory}
                isEditing={isEditing}
                field="subcategory"
                data={editData}
                setData={setEditData}
                placeholder="e.g. Exterior Emulsion, Heavy Duty"
              />

              <DetailField
                label="Brand / Manufacturer"
                value={editData.brand || product.brand}
                isEditing={isEditing}
                field="brand"
                data={editData}
                setData={setEditData}
                placeholder="e.g. Duracoat, Crown, Apex"
              />
            </div>
          </div>

          {/* Section 2: Package Measurement & UOM Specifications */}
          <div className="bg-white dark:bg-white/[0.02] border border-gray-200/80 dark:border-white/[0.06] rounded-2xl shadow-sm overflow-hidden">
            <div className="border-b border-gray-100 dark:border-white/5 px-6 py-4">
              <h2 className="text-sm font-bold text-gray-900 dark:text-white">Measurement &amp; Unit Sizing</h2>
              <p className="mt-0.5 text-xs text-gray-400">Unit of Measure (UOM) and packaging volume/weight parameters.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 p-6">
              <DetailField
                label="Unit of Measure (UOM)"
                value={product.unitOfMeasure}
                isEditing={isEditing}
                field="unitOfMeasure"
                data={editData}
                setData={setEditData}
                options={uomsList}
                isSearchableSelect
              />

              <DetailField
                label="Package Measurement Value"
                value={
                  isEditing
                    ? editData.measurementValue
                    : product.measurementValue
                    ? `${product.measurementValue} ${product.unitOfMeasure || ""}`
                    : null
                }
                isEditing={isEditing}
                field="measurementValue"
                data={editData}
                setData={setEditData}
                type="number"
                placeholder="e.g. 20.00, 4.00"
              />
            </div>
          </div>

          {/* Section 3: Financials & Loyalty Valuation */}
          <div className="bg-white dark:bg-white/[0.02] border border-gray-200/80 dark:border-white/[0.06] rounded-2xl shadow-sm overflow-hidden">
            <div className="border-b border-gray-100 dark:border-white/5 px-6 py-4">
              <h2 className="text-sm font-bold text-gray-900 dark:text-white">Pricing &amp; Base Loyalty Valuation</h2>
              <p className="mt-0.5 text-xs text-gray-400">Retail selling price, cost margin, and base loyalty reward points per unit scan.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-6 gap-y-3 p-6">
              <DetailField
                label="Base Points Per Unit"
                value={product.pointsPerUnit ? `${product.pointsPerUnit.toLocaleString()} PTS` : "0 PTS"}
                isEditing={isEditing}
                field="pointsPerUnit"
                data={editData}
                setData={setEditData}
                type="number"
              />

              <DetailField
                label="Retail Selling Price"
                value={product.price ? `KES ${parseFloat(product.price).toLocaleString()}` : null}
                isEditing={isEditing}
                field="price"
                data={editData}
                setData={setEditData}
                placeholder="e.g. 11500.00"
              />

              <DetailField
                label="Cost Price (KES)"
                value={product.costPrice ? `KES ${parseFloat(product.costPrice).toLocaleString()}` : null}
                isEditing={isEditing}
                field="costPrice"
                data={editData}
                setData={setEditData}
                placeholder="e.g. 8200.00"
              />
            </div>

            {displayMargin !== null && (
              <div className="px-6 py-3 bg-gray-50/80 dark:bg-white/[0.01] border-t border-gray-100 dark:border-white/5 flex items-center justify-between text-xs">
                <span className="font-semibold text-gray-500">Calculated Profit Margin</span>
                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                  + KES {parseFloat(displayMargin).toLocaleString()}
                </span>
              </div>
            )}
          </div>

        </div>

        {/* Right Column (Spans 4 columns) */}
        <div className="col-span-12 space-y-6 xl:col-span-4">

          {/* Real Modern Scannable Barcode Component Card */}
          <div className="bg-white dark:bg-white/[0.02] border border-gray-200/80 dark:border-white/[0.06] rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-white/5 pb-3">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">Scannable Barcode View</h3>
              <span className="px-2 py-0.5 rounded bg-brand-500/10 text-brand-600 dark:text-brand-400 text-[10px] font-mono font-bold">
                CODE128
              </span>
            </div>

            {/* White Sticker Card Container for High-Contrast Scanning */}
            <div className="p-5 rounded-2xl bg-white border border-gray-200 shadow-inner flex flex-col items-center justify-center space-y-2 text-center overflow-hidden">
              <div className="max-w-full overflow-x-auto flex justify-center py-1">
                <Barcode
                  value={currentBarcodeValue}
                  format="CODE128"
                  width={1.6}
                  height={52}
                  displayValue={true}
                  font="monospace"
                  fontSize={13}
                  margin={5}
                  background="#ffffff"
                  lineColor="#0f172a"
                />
              </div>
              <p className="text-[10px] text-gray-500 font-sans">
                {editData.barcode || product.barcode ? "Using Custom Barcode" : "Using Default Item Code (SKU)"}
              </p>
            </div>
          </div>

          {/* Catalog Audit & Lifecycle */}
          <div className="bg-white dark:bg-white/[0.02] border border-gray-200/80 dark:border-white/[0.06] rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-white/5 pb-3">
              Catalog Audit &amp; Status
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between border-b border-gray-100 dark:border-white/5 pb-2.5">
                <span className="font-semibold text-gray-500 dark:text-gray-400">Catalog Lifecycle</span>
                <span className="font-bold text-gray-900 dark:text-white">{product.isActive ? "Active in Catalog" : "Archived"}</span>
              </div>

              <div className="flex items-center justify-between border-b border-gray-100 dark:border-white/5 pb-2.5">
                <span className="font-semibold text-gray-500 dark:text-gray-400">Activity Telemetry</span>
                <span className={`font-bold ${product.isLinkedToActivity ? "text-amber-600 dark:text-amber-400" : "text-gray-900 dark:text-white"}`}>
                  {product.isLinkedToActivity ? `${product.linkedActivityCount} Batches Linked` : "0 Batches (Unlinked)"}
                </span>
              </div>

              <div className="flex items-center justify-between border-b border-gray-100 dark:border-white/5 pb-2.5">
                <span className="font-semibold text-gray-500 dark:text-gray-400">Created Date</span>
                <span className="font-semibold text-gray-900 dark:text-white">{new Date(product.createdAt).toLocaleDateString()}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="font-semibold text-gray-500 dark:text-gray-400">Last Modified</span>
                <span className="font-semibold text-gray-900 dark:text-white">{new Date(product.updatedAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          {/* Danger Zone / Item Deletion */}
          <div className="bg-rose-500/5 border border-rose-500/20 rounded-2xl p-6 shadow-sm space-y-3">
            <h3 className="text-xs font-bold text-rose-600 dark:text-rose-400 flex items-center justify-between">
              <span>Danger Zone</span>
              <span className="text-[10px] font-mono">Delete Guard</span>
            </h3>

            <p className="text-[11px] text-gray-500 dark:text-gray-400">
              {product.isLinkedToActivity
                ? "This product cannot be deleted because it is linked to active transactions or inventory batches. You can set it to Archived instead."
                : "Deleting a product removes it permanently from your master catalog. This action cannot be undone."}
            </p>

            <button
              type="button"
              onClick={handleDelete}
              disabled={isDeleting || product.isLinkedToActivity}
              className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
                product.isLinkedToActivity
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200 dark:bg-white/5 dark:border-white/10 dark:text-gray-500"
                  : "bg-rose-600 hover:bg-rose-700 text-white shadow-xs"
              }`}
            >
              {isDeleting ? (
                "Deleting Product..."
              ) : product.isLinkedToActivity ? (
                "🔒 Delete Disabled (Linked to Activity)"
              ) : (
                "Delete Product Permanently"
              )}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}

// ─── Detail Field Component ──────────────────────────────────────────────────
function DetailField({
  label,
  value,
  isEditing,
  field,
  data,
  setData,
  type = "text",
  placeholder,
  options,
  isSearchableSelect,
  disabled,
  lockReason,
  hint,
}: any) {
  return (
    <div className="flex flex-col gap-1 py-2 border-b border-gray-100 last:border-0 dark:border-white/5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
          {label}
        </span>
        {lockReason && isEditing && (
          <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400">
            {lockReason}
          </span>
        )}
      </div>

      {isEditing ? (
        <div className="pt-1">
          {disabled ? (
            <div className="w-full px-3.5 py-2.5 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-xs font-mono font-bold text-gray-500 dark:text-gray-400 flex items-center justify-between">
              <span>{data[field] || value}</span>
              <span className="text-xs">🔒 Locked</span>
            </div>
          ) : isSearchableSelect ? (
            <SearchableSelect
              value={data[field] || ""}
              onChange={(val) => setData({ ...data, [field]: val })}
              options={options || []}
              placeholder={`-- Select ${label} --`}
              settingsUrl="/products/settings"
            />
          ) : (
            <input
              type={type}
              value={data[field] ?? ""}
              onChange={(e) => setData({ ...data, [field]: e.target.value })}
              placeholder={placeholder || `Enter ${label.toLowerCase()}`}
              className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-white/10 rounded-xl text-xs font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/40"
            />
          )}
        </div>
      ) : (
        <div className="flex items-center justify-between">
          <span className={`text-xs mt-0.5 ${!value ? "text-gray-400 font-normal" : "text-gray-900 font-bold dark:text-white"}`}>
            {value || "Not provided"}
          </span>
          {hint && <span className="text-[10px] text-gray-400 font-mono">{hint}</span>}
        </div>
      )}
    </div>
  );
}