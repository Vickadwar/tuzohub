"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authenticatedFetch } from "@/hooks/useApi";
import SearchableSelect from "@/components/ui/select/SearchableSelect";

// ─── Field Label Wrapper ──────────────────────────────────────────────────────
function Field({
  label,
  hint,
  required,
  children,
  action,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
        {action}
      </div>
      {children}
      {hint && <p className="text-[11px] text-gray-400">{hint}</p>}
    </div>
  );
}

// ─── Text / Number Input ──────────────────────────────────────────────────────
function TextInput({
  placeholder,
  type = "text",
  value,
  onChange,
}: {
  placeholder?: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-white/10 rounded-xl text-xs font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/40"
    />
  );
}

// ─── Form Section Card ────────────────────────────────────────────────────────
function FormSection({
  step,
  title,
  description,
  children,
}: {
  step: string;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white dark:bg-white/[0.02] border border-gray-200/80 dark:border-white/[0.06] rounded-2xl shadow-sm relative">
      <div className="border-b border-gray-100 dark:border-white/5 px-6 py-4 flex items-center gap-3">
        <div className="w-6 h-6 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center text-xs font-bold border border-brand-500/20 shrink-0 shadow-2xs">
          {step}
        </div>
        <div>
          <h2 className="text-sm font-bold text-gray-900 dark:text-white">{title}</h2>
          <p className="text-xs text-gray-400 mt-0.5">{description}</p>
        </div>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

// ─── Main Page Component ──────────────────────────────────────────────────────
export default function NewProduct() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    sku: "",
    name: "",
    category: "",
    unitOfMeasure: "",
    measurementValue: "",
    pointsPerUnit: 0,
    price: "",
    costPrice: "",
    barcode: "",
    brand: "",
  });

  const [categoriesList, setCategoriesList] = useState<string[]>([]);
  const [uomsList, setUomsList] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Fetch dynamic categories and units of measure on mount
  useEffect(() => {
    async function loadMeta() {
      try {
        const data = await authenticatedFetch("/api/products/meta/categories-uom");
        if (data) {
          const cats = data.categories || [];
          const uoms = data.unitsOfMeasure || [];
          setCategoriesList(cats);
          setUomsList(uoms);
          setFormData((prev) => ({
            ...prev,
            category: prev.category || (cats.length > 0 ? cats[0] : ""),
            unitOfMeasure: prev.unitOfMeasure || (uoms.length > 0 ? uoms[0] : ""),
          }));
        }
      } catch (err) {
        console.warn("Could not fetch product meta options", err);
      }
    }
    loadMeta();
  }, []);

  // Helper to auto-generate SKU code
  const autoGenerateSku = () => {
    const prefix = formData.category
      ? formData.category.substring(0, 3).toUpperCase()
      : "PRD";
    const namePart = formData.name
      .replace(/[^a-zA-Z0-9]/g, "")
      .substring(0, 4)
      .toUpperCase();
    const randomCode = Math.floor(1000 + Math.random() * 9000);
    const sku = `${prefix}-${namePart || "ITEM"}-${randomCode}`;
    setFormData((prev) => ({ ...prev, sku }));
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSubmitting(true);
    setError("");

    if (!formData.name.trim() || !formData.sku.trim()) {
      setError("Product Name and SKU item code are required.");
      setIsSubmitting(false);
      return;
    }

    try {
      const payload = {
        name: formData.name.trim(),
        sku: formData.sku.trim(),
        category: formData.category ? formData.category.trim() : null,
        unitOfMeasure: formData.unitOfMeasure ? formData.unitOfMeasure.trim() : null,
        measurementValue: formData.measurementValue ? String(formData.measurementValue) : null,
        pointsPerUnit: parseInt(formData.pointsPerUnit.toString()) || 0,
        price: formData.price.trim() || null,
        costPrice: formData.costPrice.trim() || null,
        barcode: formData.barcode.trim() || formData.sku.trim(),
        brand: formData.brand.trim() || null,
      };

      const res = await authenticatedFetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res) {
        router.push("/products");
      } else {
        setError("Failed to create product.");
      }
    } catch (err: any) {
      setError(err.message || "Network error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full pb-12 animate-fadeIn space-y-6">

      {/* ── Header Bar ──────────────────────────────────────────────────────── */}
      <div className="border-b border-gray-200/80 dark:border-white/[0.06] pb-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <nav className="flex items-center gap-2 text-xs font-semibold text-gray-400 mb-1">
            <Link href="/overview" className="hover:text-brand-500 transition-colors">
              Dashboard
            </Link>
            <span>/</span>
            <Link href="/products" className="hover:text-brand-500 transition-colors">
              Products
            </Link>
            <span>/</span>
            <span className="text-gray-700 dark:text-gray-300">Register Item</span>
          </nav>

          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
              Create New Product
            </h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400 text-xs font-semibold border border-brand-500/20">
              Item Registration
            </span>
          </div>
          <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
            Select from your registered Categories and Units of Measure to add a new product to your master catalog.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/products"
            className="px-4 py-2 text-xs font-semibold text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition"
          >
            Cancel
          </Link>
          <button
            onClick={() => handleSubmit()}
            disabled={isSubmitting}
            className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold rounded-xl transition shadow-md shadow-brand-500/20 disabled:opacity-50 flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Saving Product...
              </>
            ) : (
              "Save Product to Catalog"
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 text-xs font-semibold">
          {error}
        </div>
      )}

      {/* ── Main Layout Grid ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-12 gap-6">

        {/* Form Column (Spans 8 columns) */}
        <div className="col-span-12 xl:col-span-8 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">

            <FormSection
              step="1"
              title="General Information &amp; Classification"
              description="Product identification details, category selection, and unit of measure."
            >
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Product Name" required>
                    <TextInput
                      placeholder="e.g. 20L Industrial Weatherguard Drum"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </Field>

                  <Field
                    label="SKU / Item Code"
                    required
                    hint="Unique SKU code identifier for POS/USSD"
                    action={
                      <button
                        type="button"
                        onClick={autoGenerateSku}
                        className="text-[11px] font-bold text-brand-600 hover:text-brand-700 dark:text-brand-400"
                      >
                        ⚡ Auto-Generate
                      </button>
                    }
                  >
                    <TextInput
                      placeholder="e.g. SKU-PNT-20L-WG"
                      value={formData.sku}
                      onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    />
                  </Field>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Product Category" required hint="Search or select category">
                    <SearchableSelect
                      value={formData.category}
                      onChange={(val) => setFormData({ ...formData, category: val })}
                      options={categoriesList}
                      placeholder="-- Select Category --"
                      settingsUrl="/products/settings"
                      settingsLabel="+ Add Category in Settings"
                    />
                  </Field>

                  <Field label="Unit of Measure (UOM)" required hint="Search or select unit size">
                    <SearchableSelect
                      value={formData.unitOfMeasure}
                      onChange={(val) => setFormData({ ...formData, unitOfMeasure: val })}
                      options={uomsList}
                      placeholder="-- Select Unit of Measure --"
                      settingsUrl="/products/settings"
                      settingsLabel="+ Add UOM in Settings"
                    />
                  </Field>
                </div>
              </div>
            </FormSection>

            <FormSection
              step="2"
              title="Pricing &amp; Loyalty Base Multiplier"
              description="Configure item price, cost margin, and base loyalty reward points."
            >
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Field label="Base Points Per Unit" hint="Base points/KES awarded per unit scan">
                  <TextInput
                    type="number"
                    placeholder="e.g. 50, 200"
                    value={formData.pointsPerUnit.toString()}
                    onChange={(e) => setFormData({ ...formData, pointsPerUnit: parseInt(e.target.value) || 0 })}
                  />
                </Field>

                <Field label="Retail Selling Price (KES)" hint="Public retail price">
                  <TextInput
                    placeholder="e.g. 11500.00"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  />
                </Field>

                <Field label="Cost Price (KES)" hint="Procurement / production cost">
                  <TextInput
                    placeholder="e.g. 8200.00"
                    value={formData.costPrice}
                    onChange={(e) => setFormData({ ...formData, costPrice: e.target.value })}
                  />
                </Field>
              </div>
            </FormSection>

            <FormSection
              step="3"
              title="Enterprise Attributes &amp; Specifications (Optional)"
              description="Additional metadata for POS scanners, barcodes, and brand tracking."
            >
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Field label="Barcode / EAN-13" hint="Scannable product barcode">
                  <TextInput
                    placeholder="e.g. 6001234567890"
                    value={formData.barcode}
                    onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                  />
                </Field>

                <Field label="Brand / Manufacturer">
                  <TextInput
                    placeholder="e.g. Duracoat, Crown, Apex"
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                  />
                </Field>

                <Field label="Package Measurement Value">
                  <TextInput
                    type="number"
                    placeholder="e.g. 20.00, 4.00"
                    value={formData.measurementValue}
                    onChange={(e) => setFormData({ ...formData, measurementValue: e.target.value })}
                  />
                </Field>
              </div>
            </FormSection>

          </form>
        </div>

        {/* Sidebar Column (Spans 4 columns) */}
        <div className="col-span-12 xl:col-span-4 space-y-6">
          <div className="bg-white dark:bg-white/[0.02] border border-gray-200/80 dark:border-white/[0.06] p-6 rounded-2xl shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-white/5 pb-3">
              Master Parameters Link
            </h3>
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-brand-500/10 border border-brand-500/20 text-xs space-y-2">
                <div className="font-bold text-brand-600 dark:text-brand-400 flex items-center justify-between">
                  <span>Categories &amp; UOMs</span>
                  <Link
                    href="/products/settings"
                    className="underline hover:text-brand-700 font-mono text-[11px]"
                  >
                    Manage Settings →
                  </Link>
                </div>
                <p className="text-[11px] text-gray-500 dark:text-gray-400">
                  Categories and Units of Measure are populated from your organization's Inventory Settings.
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}