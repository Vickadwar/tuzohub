"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authenticatedFetch } from "@/hooks/useApi";

// Premium Components
import ModernSelect from "@/components/ui/ModernSelect";

// ─── Refined Reusable Field Component ─────────────────────────────────────────
function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
      </label>
      {children}
      {hint && <p className="text-xs text-gray-500 dark:text-gray-400">{hint}</p>}
    </div>
  );
}

// ─── Standardized Text Input ──────────────────────────────────────────────────
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
      className="h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-900 shadow-sm transition-colors placeholder:text-gray-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-white/30"
    />
  );
}

// ─── Reusable Form Section ────────────────────────────────────────────────────
function FormSection({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-white/10 dark:bg-[#18181b]">
      <div className="border-b border-gray-100 px-6 py-5 dark:border-white/5">
        <h2 className="text-base font-semibold text-gray-900 dark:text-white">{title}</h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{description}</p>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

// ─── Page Component ───────────────────────────────────────────────────────────
export default function NewProduct() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    sku: "",
    name: "",
    category: "",
    subcategory: "",
    unitOfMeasure: "Unit",
    pointsPerUnit: 0,
    price: "",
    costPrice: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSubmitting(true);
    setError("");

    if (!formData.name || !formData.sku) {
      setError("Product name and SKU are required.");
      setIsSubmitting(false);
      return;
    }

    try {
      const cleanedData = {
        ...formData,
        pointsPerUnit: parseInt(formData.pointsPerUnit.toString()) || 0,
        price: formData.price.trim() || null,
        costPrice: formData.costPrice.trim() || null,
        category: formData.category || null,
        subcategory: formData.subcategory || null,
        unitOfMeasure: formData.unitOfMeasure || null,
      };

      const data = await authenticatedFetch("/api/products", {
        method: "POST",
        body: JSON.stringify(cleanedData),
      });

      if (data.success) {
        router.push("/products");
      } else {
        setError(data.error || "Failed to create product.");
      }
    } catch (err: any) {
      const msg = err.info?.error || err.message;
      setError(typeof msg === "object" ? JSON.stringify(msg) : (msg || "Network error occurred."));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full pb-12 animate-in fade-in duration-500">

      {/* ── Header & Top Actions ────────────────────────────────────────────── */}
      <div className="mb-8 pt-6">
        <nav className="mb-2 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <Link href="/overview" className="hover:text-brand-600 transition-colors">
            Dashboard
          </Link>
          <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
          </svg>
          <Link href="/products" className="hover:text-brand-600 transition-colors">
            Products
          </Link>
          <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
          </svg>
          <span className="font-medium text-gray-900 dark:text-gray-200">Register item</span>
        </nav>

        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-white">
              Create new product
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Add a new item to your reward catalog or points-earning inventory.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/products"
              className="rounded-md bg-white px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 shadow-sm hover:bg-gray-50 dark:bg-white/5 dark:border-white/10 dark:text-gray-300 dark:hover:bg-white/10 transition-colors"
            >
              Cancel
            </Link>
            <button
              onClick={() => handleSubmit()}
              disabled={isSubmitting}
              className="inline-flex items-center justify-center rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 disabled:opacity-60 transition-colors"
            >
              {isSubmitting ? "Saving..." : "Save product"}
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-6 flex items-start gap-3 rounded-md bg-error-50 p-4 border border-error-200 dark:bg-error-500/10 dark:border-error-500/20">
          <svg className="mt-0.5 h-5 w-5 shrink-0 text-error-600 dark:text-error-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div className="flex-1">
            <p className="text-sm font-medium text-error-800 dark:text-error-300">{error}</p>
          </div>
        </div>
      )}

      {/* ── Main Layout: 12-Column Grid ────────────────────────────────────── */}
      <div className="grid grid-cols-12 gap-6">

        {/* ── Left Column: Form (Spans 8 columns) ────────────────────────── */}
        <div className="col-span-12 xl:col-span-8 space-y-6">
          <form id="product-form" onSubmit={handleSubmit} className="space-y-6">

            <FormSection
              title="General information"
              description="Core product identification and classification."
            >
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <Field label="Product name">
                    <TextInput
                      placeholder="e.g. Smart Watch Series 7"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </Field>
                  <Field label="SKU / item code" hint="Unique identifier for the item">
                    <TextInput
                      placeholder="e.g. SW-7788"
                      value={formData.sku}
                      onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    />
                  </Field>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <Field label="Category">
                    <ModernSelect
                      options={[
                        { value: "ECONOMY_RANGE", label: "Economy range" },
                        { value: "PREMIUM_RANGE", label: "Premium range" },
                        { value: "GLOSS_ENAMEL", label: "Gloss enamel" },
                        { value: "EMULSION", label: "Emulsion" },
                        { value: "PRIMERS", label: "Primers & undercoats" },
                      ]}
                      value={formData.category}
                      onChange={(val) => setFormData({ ...formData, category: val })}
                      placeholder="Select category"
                    />
                  </Field>
                  <Field label="Unit of measure">
                    <ModernSelect
                      options={[
                        { value: "UNIT", label: "Unit (piece)" },
                        { value: "KG", label: "Kilogram (kg)" },
                        { value: "LITRE", label: "Litre (l)" },
                        { value: "PACK", label: "Pack / box" },
                      ]}
                      value={formData.unitOfMeasure}
                      onChange={(val) => setFormData({ ...formData, unitOfMeasure: val })}
                      placeholder="Select UOM"
                    />
                  </Field>
                </div>
              </div>
            </FormSection>

            <FormSection
              title="Pricing & rewards engineering"
              description="Point valuations and monetary pricing logic."
            >
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <Field label="Points value" hint="Earned per purchase or redemption cost">
                  <TextInput
                    type="number"
                    placeholder="0"
                    value={formData.pointsPerUnit.toString()}
                    onChange={(e) => setFormData({ ...formData, pointsPerUnit: parseInt(e.target.value) || 0 })}
                  />
                </Field>
                <Field label="Retail price (KES)" hint="Estimated market value">
                  <TextInput
                    placeholder="0.00"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  />
                </Field>
                <Field label="Cost price (KES)" hint="Internal procurement cost">
                  <TextInput
                    placeholder="0.00"
                    value={formData.costPrice}
                    onChange={(e) => setFormData({ ...formData, costPrice: e.target.value })}
                  />
                </Field>
              </div>
            </FormSection>

          </form>
        </div>

        {/* ── Right Column: Sidebar (Spans 4 columns) ─────────────────────── */}
        <div className="col-span-12 xl:col-span-4 space-y-6">
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#18181b]">
            <h3 className="mb-5 text-sm font-semibold text-gray-900 dark:text-white">Inventory tips</h3>
            <div className="space-y-6">
              {[
                { title: "SKU naming", desc: "Use consistent prefixes like EL- for electronics to keep searches fast and organized.", color: "bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400" },
                { title: "Point valuations", desc: "Setting point values allows this item to be redeemable or earnable immediately via all channels.", color: "bg-info-50 text-info-600 dark:bg-info-500/10 dark:text-info-400" },
                { title: "Price accuracy", desc: "Setting accurate market prices helps quantify the 'burn value' and ROI in your dashboard analytics.", color: "bg-success-50 text-success-600 dark:bg-success-500/10 dark:text-success-400" },
              ].map((tip, i) => (
                <div key={i} className="flex gap-3">
                  <div className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${tip.color}`}>
                    <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 dark:text-gray-200">{tip.title}</h4>
                    <p className="mt-1 text-xs leading-relaxed text-gray-500 dark:text-gray-400">{tip.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg bg-gray-900 p-6 text-white shadow-sm dark:bg-[#121212] dark:border dark:border-white/10 relative overflow-hidden">
            <div className="relative z-10">
              <p className="text-sm font-medium italic text-gray-300 leading-relaxed">
                "A well-structured product catalog is the heartbeat of a successful loyalty program."
              </p>
            </div>
            <div className="absolute -bottom-8 -right-8 h-32 w-32 rounded-full bg-brand-500/20 blur-2xl pointer-events-none"></div>
          </div>
        </div>
      </div>
    </div>
  );
}