"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authenticatedFetch } from "@/hooks/useApi";
import ModernSelect from "@/components/ui/ModernSelect";
import KenyaPhoneInput from "@/components/ui/KenyaPhoneInput";

function Field({ label, hint, action, children }: { label: string; hint?: React.ReactNode; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex flex-col">
      <div className="mb-1.5 flex items-center justify-between">
        <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">{label}</label>
        {action && <div>{action}</div>}
      </div>
      {children}
      {hint && <div className="mt-1.5 text-[11px] text-gray-400">{hint}</div>}
    </div>
  );
}

function LocalFormSection({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-gray-200/80 bg-white shadow-sm dark:border-white/[0.06] dark:bg-white/[0.02]">
      <div className="border-b border-gray-100 px-6 py-4 dark:border-white/5">
        <h2 className="text-sm font-bold text-gray-900 dark:text-white">{title}</h2>
        <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">{description}</p>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

function LocalTextInput({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`h-10 w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3.5 text-xs font-medium text-gray-900 shadow-2xs transition-colors placeholder:text-gray-400 focus:border-brand-500/40 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/30 dark:border-white/10 dark:bg-white/[0.03] dark:text-white dark:placeholder:text-white/30 dark:focus:bg-transparent ${className || ""}`}
    />
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

  useEffect(() => {
    const load = async () => {
      try {
        const townsRes = await authenticatedFetch("/api/locations/towns");
        if (townsRes.success) {
          setTownsList(townsRes.data || []);
        }
      } catch (err: any) {
        // Towns optional
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
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 animate-fadeIn pb-12">
      {/* ── Page Header ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-200/80 dark:border-white/[0.06] pb-5">
        <div className="flex items-center gap-4">
          <Link
            href="/settings/organizations"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors text-gray-500 dark:text-gray-400"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </Link>

          {/* Rounded Avatar Circle */}
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold text-xs border border-amber-500/20 shadow-2xs">
            +
          </div>

          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
                Register Organization
              </h1>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-semibold border border-amber-500/20">
                Partner Onboarding
              </span>
            </div>
            <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
              Onboard a new dealer, distributor, or contractor into the loyalty network.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/settings/organizations"
            className="px-4 py-2.5 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300 text-xs font-semibold rounded-xl transition"
          >
            Cancel
          </Link>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold rounded-xl shadow-md shadow-brand-500/20 transition disabled:opacity-50"
          >
            {isSubmitting ? "Processing..." : "Save organization"}
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-semibold">
          {error}
        </div>
      )}

      <div className="grid grid-cols-12 gap-6">
        <form onSubmit={handleSubmit} className="col-span-12 xl:col-span-8 space-y-6">

          <LocalFormSection title="Organization Identity" description="Core business details and classification">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
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

          <LocalFormSection title="Contact &amp; Location" description="Reach and geographic assignment">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
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
              <Field label="Address Line" hint="Street address or landmark">
                <LocalTextInput
                  placeholder="e.g. Industrial Area, Road B"
                  value={formData.addressLine1}
                  onChange={(e) => setFormData({ ...formData, addressLine1: e.target.value })}
                />
              </Field>
              <Field label="Town" hint="Geographic assignment for targeting">
                <ModernSelect
                  options={townsList.map((t) => ({ value: t.id, label: t.name }))}
                  value={formData.townId}
                  onChange={(val) => setFormData({ ...formData, townId: val })}
                  placeholder="Select town (optional)"
                />
              </Field>
            </div>
          </LocalFormSection>

        </form>

        <div className="col-span-12 xl:col-span-4 space-y-6">
          <div className="bg-gradient-to-br from-gray-900 via-gray-950 to-black border border-gray-800 p-6 rounded-2xl text-white shadow-xl space-y-3 relative overflow-hidden">
            <span className="text-[10px] font-semibold text-amber-400 uppercase tracking-wider">Distribution Network</span>
            <h3 className="text-sm font-bold text-white">Partner Growth</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Organizations form the backbone of your loyalty distribution chain. Dealers and distributors can be assigned sales personnel and tracked for performance analytics.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
