"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authenticatedFetch } from "@/hooks/useApi";

import KenyaPhoneInput from "@/components/ui/KenyaPhoneInput";
import ModernSelect from "@/components/ui/ModernSelect";
import DatePicker from "@/components/ui/DatePicker";

// ─── Field Component ─────────────────────────────────────────────────────────
function Field({ label, hint, action, children }: any) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-gray-700 dark:text-gray-300">
          {label}
        </label>
        {action && <div>{action}</div>}
      </div>
      {children}
      {hint && <p className="text-[11px] text-gray-400">{hint}</p>}
    </div>
  );
}

// ─── Text Input Component ───────────────────────────────────────────────────
function TextInput({ type = "text", value, onChange, placeholder, className, ...props }: any) {
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      {...props}
      className={`w-full px-3.5 py-2.5 bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-white/10 rounded-xl text-xs font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/40 ${className || ""}`}
    />
  );
}

// ─── Form Section Card ───────────────────────────────────────────────────────
function FormSection({ title, description, children }: any) {
  return (
    <div className="bg-white dark:bg-white/[0.02] border border-gray-200/80 dark:border-white/[0.06] rounded-2xl shadow-sm relative">
      <div className="border-b border-gray-100 dark:border-white/5 px-6 py-4 rounded-t-2xl">
        <h2 className="text-sm font-bold text-gray-900 dark:text-white">{title}</h2>
        <p className="text-xs text-gray-400 mt-0.5">{description}</p>
      </div>
      <div className="p-6 space-y-4">{children}</div>
    </div>
  );
}

// ─── Page Component ───────────────────────────────────────────────────────────
export default function NewConsumer() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    firstName: "", secondName: "", lastName: "", phoneNumber: "", email: "",
    idNumber: "", taxPin: "", gender: "", dateOfBirth: "", townId: "",
    onboardedByAgentId: "", physicalTagId: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSubmitting(true);
    setError("");

    if (!formData.phoneNumber) {
      setError("Phone number is required for consumer registration.");
      setIsSubmitting(false);
      return;
    }

    try {
      const cleanedData = {
        ...formData,
        townId: formData.townId.trim() || null,
        onboardedByAgentId: formData.onboardedByAgentId.trim() || null,
        email: formData.email.trim() || null,
        idNumber: formData.idNumber.trim() || null,
        taxPin: formData.taxPin.trim() || null,
        gender: formData.gender || null,
        dateOfBirth: formData.dateOfBirth || null,
        physicalTagId: formData.physicalTagId.trim() || null,
      };

      const data = await authenticatedFetch("/api/consumers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cleanedData),
      });

      if (data?.data?.id) {
        router.push(`/consumers/${data.data.id}`);
      } else if (data) {
        router.push("/consumers");
      } else {
        setError("Failed to register consumer.");
      }
    } catch (err: any) {
      setError(err.message || "Network error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full pb-12 animate-fadeIn space-y-6">

      {/* ── Breadcrumb & Top Action Header ───────────────────────────────────── */}
      <div className="border-b border-gray-200/80 dark:border-white/[0.06] pb-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <nav className="flex items-center gap-2 text-xs font-bold text-gray-400 mb-1">
            <Link href="/overview" className="hover:text-brand-500 transition-colors">
              Dashboard
            </Link>
            <span>/</span>
            <Link href="/consumers" className="hover:text-brand-500 transition-colors">
              Consumers
            </Link>
            <span>/</span>
            <span className="text-gray-700 dark:text-gray-300">Register</span>
          </nav>

          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
              Onboard New Consumer
            </h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400 text-xs font-bold border border-brand-500/20">
              Identity Vault
            </span>
          </div>
          <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
            Register a new participant into the TuZoHub loyalty ecosystem.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/consumers"
            className="px-4 py-2 text-xs font-bold text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition"
          >
            Cancel
          </Link>
          <button
            onClick={() => handleSubmit()}
            disabled={isSubmitting}
            className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl transition shadow-lg shadow-brand-500/20 disabled:opacity-50 flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Registering...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Save &amp; Provision Wallet
              </>
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 text-xs font-bold">
          {error}
        </div>
      )}

      {/* ── Main Form Layout: 12-Column Grid ────────────────────────────────── */}
      <div className="grid grid-cols-12 gap-6">

        {/* ── Left Column: Form Cards (Spans 8 columns) ───────────────────── */}
        <div className="col-span-12 xl:col-span-8 space-y-6">
          <form id="consumer-form" onSubmit={handleSubmit} className="space-y-6">

            <FormSection
              title="Identity &amp; Personal Details"
              description="Basic profile information matching official government identification."
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="First Name">
                  <TextInput placeholder="e.g. Jane" value={formData.firstName} onChange={(e: any) => setFormData({ ...formData, firstName: e.target.value })} />
                </Field>
                <Field label="Last Name">
                  <TextInput placeholder="e.g. Doe" value={formData.lastName} onChange={(e: any) => setFormData({ ...formData, lastName: e.target.value })} />
                </Field>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Middle Name (Optional)">
                  <TextInput placeholder="e.g. Wanjiku" value={formData.secondName || ""} onChange={(e: any) => setFormData({ ...formData, secondName: e.target.value })} />
                </Field>
                <Field label="Gender">
                  <ModernSelect
                    options={[{ value: "MALE", label: "Male" }, { value: "FEMALE", label: "Female" }, { value: "OTHER", label: "Other" }]}
                    value={formData.gender}
                    onChange={(val) => setFormData({ ...formData, gender: val })}
                    placeholder="Select Gender"
                  />
                </Field>
              </div>

              <Field label="Date of Birth">
                <DatePicker value={formData.dateOfBirth} onChange={(val) => setFormData({ ...formData, dateOfBirth: val })} placeholder="Select Date" />
              </Field>
            </FormSection>

            <FormSection
              title="Communication &amp; Contact Telemetry"
              description="Primary channels for USSD interactions and transactional SMS notifications."
            >
              <Field label="Phone Number" hint="Primary identifier for USSD &amp; M-Pesa payouts">
                <KenyaPhoneInput value={formData.phoneNumber} onChange={(val) => setFormData({ ...formData, phoneNumber: val })} />
              </Field>
              <Field label="Email Address (Optional)" hint="For digital receipts and statements">
                <TextInput type="email" placeholder="jane.doe@example.com" value={formData.email} onChange={(e: any) => setFormData({ ...formData, email: e.target.value })} />
              </Field>
            </FormSection>

            <FormSection
              title="Compliance &amp; KYC Verification"
              description="Identifiers required for tax PIN validation and audit compliance."
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="National ID Number" hint="6-8 digits for identity check" action={<span className="text-[10px] font-mono text-gray-400">{(formData.idNumber || "").length}/8</span>}>
                  <TextInput placeholder="e.g. 12345678" maxLength={8} value={formData.idNumber || ""} onChange={(e: any) => setFormData({ ...formData, idNumber: e.target.value.replace(/\D/g, "") })} />
                </Field>
                <Field label="KRA Tax PIN" hint="Standard 11-character format" action={<span className={`text-[10px] font-mono font-bold ${formData.taxPin?.length === 11 ? 'text-emerald-500' : 'text-gray-400'}`}>{(formData.taxPin || "").length}/11</span>}>
                  <TextInput placeholder="e.g. A123456789Z" maxLength={11} value={formData.taxPin || ""} onChange={(e: any) => setFormData({ ...formData, taxPin: e.target.value.replace(/[^a-zA-Z0-9]/g, "").toUpperCase() })} />
                </Field>
              </div>
            </FormSection>

            <FormSection
              title="Hardware &amp; Regional Context"
              description="NFC tags, regional assignment, and promoter agent attribution."
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Town / Region ID">
                  <TextInput placeholder="e.g. Eldoret" value={formData.townId || ""} onChange={(e: any) => setFormData({ ...formData, townId: e.target.value })} />
                </Field>
                <Field label="Physical Tag ID (NFC / QR)">
                  <TextInput placeholder="T-XXXXXXXX" value={formData.physicalTagId || ""} onChange={(e: any) => setFormData({ ...formData, physicalTagId: e.target.value })} />
                </Field>
              </div>
              <Field label="Promoter / Agent ID" hint="Required if manually onboarded by field staff">
                <TextInput placeholder="Agent UUID" value={formData.onboardedByAgentId || ""} onChange={(e: any) => setFormData({ ...formData, onboardedByAgentId: e.target.value })} />
              </Field>
            </FormSection>

          </form>
        </div>

        {/* ── Right Column: Execution Pipeline (Spans 4 columns) ──────────── */}
        <div className="col-span-12 xl:col-span-4 space-y-6">

          {/* Pipeline Card */}
          <div className="bg-white dark:bg-white/[0.02] border border-gray-200/80 dark:border-white/[0.06] p-6 rounded-2xl shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-white/5 pb-3">
              Onboarding Pipeline
            </h3>
            <div className="space-y-4 relative pl-2">
              {[
                { title: "Input Validation", desc: "Verifies phone number format & duplicate checks", active: true },
                { title: "Identity Vault Creation", desc: "Generates secure participant profile & loyalty ID", active: false },
                { title: "Digital Wallet Provisioning", desc: "Initializes 0 PTS balance ledger container", active: false },
              ].map((step, i) => (
                <div key={i} className="flex gap-3 items-start">
                  <div className={`p-1.5 rounded-lg shrink-0 mt-0.5 ${step.active ? "bg-brand-500/10 text-brand-600 dark:text-brand-400" : "bg-gray-100 text-gray-400 dark:bg-white/5"}`}>
                    <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-gray-900 dark:text-white">{step.title}</h4>
                    <p className="mt-0.5 text-[11px] leading-relaxed text-gray-400">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Verification Banner */}
          <div className="bg-gradient-to-br from-gray-900 via-gray-950 to-black border border-gray-800 p-6 rounded-2xl text-white shadow-xl space-y-3">
            <div className="flex items-center gap-2 text-brand-400 text-xs font-bold uppercase tracking-widest">
              <span className="w-2 h-2 rounded-full bg-brand-400 animate-pulse" />
              Automated KYC
            </div>
            <h4 className="text-sm font-bold text-white">Safaricom &amp; KRA Compliance</h4>
            <p className="text-xs text-gray-400 leading-relaxed">
              Once onboarded, consumers can instantly access the USSD menu to earn points and claim M-Pesa disbursements.
            </p>
          </div>

        </div>

      </div>
    </div>
  );
}