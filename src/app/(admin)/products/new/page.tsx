"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authenticatedFetch } from "@/hooks/useApi";
import ModernSelect from "@/components/ui/ModernSelect";

// ─── Field Component ─────────────────────────────────────────────────────────
function Field({
  label,
  hint,
  required,
  children,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
        {label} {required && <span className="text-rose-500">*</span>}
      </label>
      {children}
      {hint && <p className="text-[11px] text-gray-400">{hint}</p>}
    </div>
  );
}

// ─── Text Input ──────────────────────────────────────────────────────────────
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
      setError("Product name and SKU item code are required.");
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
              SKU Registration
            </span>
          </div>
          <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
            Add a new product item to your loyalty catalog and configure its earning multipliers.
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
                Saving...
              </>
            ) : (
              "Save Product"
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 text-xs font-semibold">
          {error}
        </div>
      )}

      {/* ── Main Layout: 12-Column Grid ────────────────────────────────────── */}
      <div className="grid grid-cols-12 gap-6">

        {/* ── Left Column: Form (Spans 8 columns) ────────────────────────── */}
        <div className="col-span-12 xl:col-span-8 space-y-6">
          <form id="product-form" onSubmit={handleSubmit} className="space-y-6">

            <FormSection
              step="1"
              title="General Information &amp; Classification"
              description="Core product identification details and inventory category."
            >
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Product Name" required>
                    <TextInput
                      placeholder="e.g. Premium Gloss Paint 20L"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </Field>
                  <Field label="SKU / Item Code" required hint="Unique SKU code identifier">
                    <TextInput
                      placeholder="e.g. SKU-PA-9921"
                      value={formData.sku}
                      onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    />
                  </Field>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Product Category">
                    <ModernSelect
                      options={[
                        { value: "ECONOMY_RANGE", label: "Economy Range" },
                        { value: "PREMIUM_RANGE", label: "Premium Range" },
                        { value: "GLOSS_ENAMEL", label: "Gloss Enamel" },
                        { value: "EMULSION", label: "Emulsion" },
                        { value: "PRIMERS", label: "Primers & Undercoats" },
                      ]}
                      value={formData.category}
                      onChange={(val) => setFormData({ ...formData, category: val })}
                      placeholder="Select category"
                    />
                  </Field>
                  <Field label="Unit of Measure">
                    <ModernSelect
                      options={[
                        { value: "UNIT", label: "Unit (Piece)" },
                        { value: "KG", label: "Kilogram (kg)" },
                        { value: "LITRE", label: "Litre (l)" },
                        { value: "PACK", label: "Pack / Box" },
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
              step="2"
              title="Pricing &amp; Loyalty Multiplier"
              description="Point valuations and monetary pricing settings."
            >
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Field label="Points Per Unit" hint="Points awarded per item claim">
                  <TextInput
                    type="number"
                    placeholder="0"
                    value={formData.pointsPerUnit.toString()}
                    onChange={(e) => setFormData({ ...formData, pointsPerUnit: parseInt(e.target.value) || 0 })}
                  />
                </Field>
                <Field label="Retail Price (KES)" hint="Market retail price">
                  <TextInput
                    placeholder="0.00"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  />
                </Field>
                <Field label="Cost Price (KES)" hint="Internal procurement cost">
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
          <div className="bg-white dark:bg-white/[0.02] border border-gray-200/80 dark:border-white/[0.06] p-6 rounded-2xl shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-white/5 pb-3">
              Inventory Guidelines
            </h3>
            <div className="space-y-4">
              {[
                { title: "SKU Naming Standard", desc: "Use consistent SKU prefixes to ensure fast USSD lookup and batch tracking.", color: "bg-brand-500/10 text-brand-600 dark:text-brand-400" },
                { title: "Point Valuations", desc: "Setting points allows immediate reward calculations on customer code redemptions.", color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" },
                { title: "Price Accuracy", desc: "Accurate cost prices populate your automated campaign ROI metrics.", color: "bg-purple-500/10 text-purple-600 dark:text-purple-400" },
              ].map((tip, i) => (
                <div key={i} className="flex gap-3 items-start">
                  <div className={`p-1.5 rounded-lg shrink-0 ${tip.color}`}>
                    <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-gray-900 dark:text-white">{tip.title}</h4>
                    <p className="mt-0.5 text-[11px] leading-relaxed text-gray-400">{tip.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-br from-gray-900 via-gray-950 to-black border border-gray-800 p-6 rounded-2xl text-white shadow-xl relative overflow-hidden">
            <div className="relative z-10 space-y-2">
              <span className="text-[10px] font-semibold text-brand-400">Inventory Telemetry</span>
              <p className="text-xs font-semibold text-gray-300 leading-relaxed italic">
                &ldquo;A well-structured product catalog powers reliable point ledger balances and transparent ROI reporting.&rdquo;
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}