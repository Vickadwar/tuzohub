"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authenticatedFetch } from "@/hooks/useApi";
import ModernSelect from "@/components/ui/ModernSelect";
import KenyaPhoneInput from "@/components/ui/KenyaPhoneInput";

// ─── Reusable Field Component ────────────────────────────────────────
function Field({ label, hint, action, children }: { label: string; hint?: React.ReactNode; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex flex-col">
      <div className="mb-1.5 flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
        {action && <div>{action}</div>}
      </div>
      {children}
      {hint && <div className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">{hint}</div>}
    </div>
  );
}

// ─── Reusable Form Section ────────────────────────────────────────────────────
function LocalFormSection({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
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

function LocalTextInput({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-900 shadow-sm transition-colors placeholder:text-gray-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-white/30 ${className || ""}`}
    />
  );
}

export default function NewStaffPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    role: "SALES_PERSON",
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      const data = await authenticatedFetch("/api/sales", {
        method: "POST",
        body: JSON.stringify(formData),
      });

      if (data.success) {
        router.push("/settings/sales-hierarchy");
      } else {
        setError(data.error || "Failed to register field personnel.");
      }
    } catch (err: any) {
      setError(err.message || "Network error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-[1200px] px-4 pb-12 sm:px-6 lg:px-8">
      {/* ── Header & Breadcrumbs ────────────────────────────────────────────── */}
      <div className="mb-8 pt-6">
        <nav className="mb-2 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <Link href="/overview" className="hover:text-brand-600 transition-colors">Dashboard</Link>
          <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
          </svg>
          <Link href="/settings/sales-hierarchy" className="hover:text-brand-600 transition-colors">Sales Hierarchy</Link>
          <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
          </svg>
          <span className="font-medium text-gray-900 dark:text-gray-200">Onboard Personnel</span>
        </nav>
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Register Field Personnel</h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Onboard regional managers or sales executies into the hierarchy.</p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/settings/sales-hierarchy"
              className="rounded-md bg-white px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 shadow-sm hover:bg-gray-50 dark:bg-white/5 dark:border-white/10 dark:text-gray-300 dark:hover:bg-white/10 transition-colors"
            >
              Cancel
            </Link>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="inline-flex items-center justify-center rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 disabled:opacity-60 transition-colors"
            >
              {isSubmitting ? "Processing..." : "Save Staff"}
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-6 rounded-md bg-error-50 p-4 border border-error-200 dark:bg-error-500/10 dark:border-error-500/20 text-error-700 dark:text-error-400 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_320px]">
        {/* ── Left Column: Form ────────────────────────────────────────────── */}
        <form onSubmit={handleSubmit} className="space-y-6">

          <LocalFormSection title="Personnel Details" description="Personal identifiers and contact info">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <Field label="Full Name">
                <LocalTextInput
                  placeholder="e.g. John Doe"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </Field>
              <Field label="Email Address">
                <LocalTextInput
                  type="email"
                  placeholder="john.doe@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </Field>
            </div>
            
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 mt-6">
               <Field label="Phone Number" hint="Must include country code">
                <KenyaPhoneInput
                  value={formData.phone}
                  onChange={(val) => setFormData({ ...formData, phone: val })}
                />
              </Field>
              
               <Field label="Role Designation">
                <ModernSelect
                  options={[
                    { value: "SALES_PERSON", label: "Sales Person" },
                    { value: "ASM", label: "Area Sales Manager (ASM)" },
                    { value: "REGIONAL_MANAGER", label: "Regional Manager" },
                    { value: "CEO", label: "Chief Executive (CEO)" },
                  ]}
                  value={formData.role}
                  onChange={(val) => setFormData({ ...formData, role: val })}
                  placeholder="Select Role"
                />
              </Field>
            </div>
          </LocalFormSection>

        </form>

        {/* ── Right Column: Sidebar ────────────────────────────────────────── */}
        <div className="space-y-6">
          <div className="rounded-lg bg-gray-900 p-6 text-white shadow-sm dark:bg-[#121212] dark:border dark:border-white/10">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-brand-400">Route to Market</h3>
            <p className="mt-2 text-lg font-medium">Chain of Command</p>
            <p className="mt-2 text-sm leading-relaxed text-gray-400">
              Field staffs are essential to assigning accountability for sales and onboarding of merchants in the distribution chain.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
