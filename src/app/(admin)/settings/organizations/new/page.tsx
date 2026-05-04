"use client";

import React, { useState, useEffect } from "react";
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

function LocalSelect({ className, children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={`h-10 w-full rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-900 shadow-sm transition-colors focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-white/10 dark:bg-white/5 dark:text-white ${className || ""}`}
    >
      {children}
    </select>
  );
}

export default function NewOrganizationPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    type: "DEALER",
    registrationNumber: "",
    taxId: "",
    phone: "",
    email: "",
    addressLine1: "",
    townId: "",
  });
  const [townsList, setTownsList] = useState<{ id: string; name: string }[]>([]);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // Load towns for dropdown
  useEffect(() => {
    const load = async () => {
      try {
        const townsRes = await authenticatedFetch("/api/locations/towns");
        if (townsRes.success) {
          setTownsList(townsRes.data || []);
        }
      } catch (err: any) {
        // Towns are optional, don't block the form
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError("Organization name is required.");
      return;
    }
    setIsSubmitting(true);
    setError("");

    try {
      // Clean up empty optional fields
      const payload: any = {
        name: formData.name,
        type: formData.type,
      };
      if (formData.registrationNumber) payload.registrationNumber = formData.registrationNumber;
      if (formData.taxId) payload.taxId = formData.taxId;
      if (formData.phone) payload.phone = formData.phone;
      if (formData.email) payload.email = formData.email;
      if (formData.addressLine1) payload.addressLine1 = formData.addressLine1;
      if (formData.townId) payload.townId = formData.townId;

      const data = await authenticatedFetch("/api/organizations", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      if (data.success) {
        router.push("/settings/organizations");
      } else {
        setError(data.error || "Failed to create organization.");
      }
    } catch (err: any) {
      setError(err.message || "Network error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-[1200px] px-4 pb-12 sm:px-6 lg:px-8 pt-6">
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
          <span className="ml-3 text-sm text-gray-500">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1200px] px-4 pb-12 sm:px-6 lg:px-8">
      {/* ── Header & Breadcrumbs ────────────────────────────────────────────── */}
      <div className="mb-8 pt-6">
        <nav className="mb-2 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <Link href="/overview" className="hover:text-brand-600 transition-colors">Dashboard</Link>
          <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
          </svg>
          <Link href="/settings/organizations" className="hover:text-brand-600 transition-colors">Organizations</Link>
          <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
          </svg>
          <span className="font-medium text-gray-900 dark:text-gray-200">New Organization</span>
        </nav>
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Register Organization</h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Onboard a new dealer, distributor, or contractor into the loyalty network.</p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/settings/organizations"
              className="rounded-md bg-white px-4 py-2 text-sm font-medium text-gray-700 border border-gray-300 shadow-sm hover:bg-gray-50 dark:bg-white/5 dark:border-white/10 dark:text-gray-300 dark:hover:bg-white/10 transition-colors"
            >
              Cancel
            </Link>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="inline-flex items-center justify-center rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 disabled:opacity-60 transition-colors"
            >
              {isSubmitting ? "Processing..." : "Save Organization"}
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

          <LocalFormSection title="Organization Identity" description="Core business details and classification">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <Field label="Organization Name" hint="Registered business name">
                <LocalTextInput
                  placeholder="e.g. Nairobi Paints Distribution Ltd"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </Field>
              <Field label="Organization Type">
                <ModernSelect
                  options={[
                    { value: "DEALER", label: "Dealer" },
                    { value: "DISTRIBUTOR", label: "Distributor" },
                    { value: "CONTRACTOR", label: "Contractor" },
                  ]}
                  value={formData.type}
                  onChange={(val) => setFormData({ ...formData, type: val })}
                  placeholder="Select type"
                />
              </Field>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 mt-6">
              <Field label="Registration Number" hint="e.g. KE-BRS-2024-001">
                <LocalTextInput
                  placeholder="Business registration number"
                  value={formData.registrationNumber}
                  onChange={(e) => setFormData({ ...formData, registrationNumber: e.target.value })}
                />
              </Field>
              <Field label="Tax ID" hint="KRA PIN or equivalent">
                <LocalTextInput
                  placeholder="e.g. A123456789Z"
                  value={formData.taxId}
                  onChange={(e) => setFormData({ ...formData, taxId: e.target.value })}
                />
              </Field>
            </div>
          </LocalFormSection>

          <LocalFormSection title="Contact & Location" description="Reach and geographic assignment">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <Field label="Phone Number" hint="Primary business contact">
                <KenyaPhoneInput
                  value={formData.phone}
                  onChange={(val) => setFormData({ ...formData, phone: val })}
                />
              </Field>
              <Field label="Email Address">
                <LocalTextInput
                  type="email"
                  placeholder="info@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </Field>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 mt-6">
              <Field label="Address Line" hint="Street address or landmark">
                <LocalTextInput
                  placeholder="e.g. Industrial Area, Road B"
                  value={formData.addressLine1}
                  onChange={(e) => setFormData({ ...formData, addressLine1: e.target.value })}
                />
              </Field>
              <Field label="Town" hint="Geographic assignment for targeting">
                <LocalSelect
                  value={formData.townId}
                  onChange={(e) => setFormData({ ...formData, townId: e.target.value })}
                >
                  <option value="">Select a town (optional)</option>
                  {townsList.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </LocalSelect>
              </Field>
            </div>
          </LocalFormSection>

        </form>

        {/* ── Right Column: Sidebar ────────────────────────────────────────── */}
        <div className="space-y-6">
          <div className="rounded-lg bg-gray-900 p-6 text-white shadow-sm dark:bg-[#121212] dark:border dark:border-white/10">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-brand-400">Distribution Chain</h3>
            <p className="mt-2 text-lg font-medium">Network Growth</p>
            <p className="mt-2 text-sm leading-relaxed text-gray-400">
              Organizations form the backbone of your loyalty distribution. Dealers and distributors can be assigned sales personnel and tracked for performance analytics.
            </p>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-[#18181b]">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">Next Steps</h3>
            <ul className="mt-3 space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-brand-500 shrink-0" />
                Assign sales staff to this organization
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-brand-500 shrink-0" />
                Add organization members (consumers)
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-brand-500 shrink-0" />
                Target campaigns to specific organizations
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
