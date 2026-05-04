"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authenticatedFetch } from "@/hooks/useApi";

import KenyaPhoneInput from "@/components/ui/KenyaPhoneInput";
import ModernSelect from "@/components/ui/ModernSelect";
import DatePicker from "@/components/ui/DatePicker";

// ─── Refined Inputs ─────────────────────────────────────────────────────────
function Field({ label, hint, action, children }: any) {
  return (
    <div className="flex flex-col">
      <div className="mb-2 flex items-center justify-between">
        <label className="block text-[14px] font-medium text-gray-700 dark:text-gray-300">
          {label}
        </label>
        {action && <div>{action}</div>}
      </div>
      {children}
      {hint && <div className="mt-2 text-[13px] text-gray-500 dark:text-gray-400">{hint}</div>}
    </div>
  );
}

function TextInput({ type = "text", value, onChange, className, ...props }: any) {
  return (
    <input
      type={type}
      value={value}
      onChange={onChange}
      {...props}
      className={`h-11 w-full rounded-xl border border-gray-200 bg-white px-4 text-[15px] text-gray-900 shadow-sm transition-all placeholder:text-gray-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/10 dark:border-white/[0.08] dark:bg-white/[0.03] dark:text-white dark:placeholder:text-white/20 hover:border-gray-300 dark:hover:border-white/20 ${className || ""}`}
    />
  );
}

// ─── Modern Side-by-Side Layout Section ─────────────────────────────────────
function FormSection({ title, description, children }: any) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-10 border-b border-gray-200/60 dark:border-white/[0.06] last:border-0">
      <div className="md:col-span-1">
        <h2 className="text-base font-semibold text-gray-900 dark:text-white">{title}</h2>
        <p className="mt-2 text-[14px] text-gray-500 dark:text-gray-400 leading-relaxed pr-6">{description}</p>
      </div>
      <div className="md:col-span-2 space-y-6">
        {children}
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function NewConsumer() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    firstName: "", secondName: "", lastName: "", phoneNumber: "", email: "",
    idNumber: "", taxPin: "", gender: "", dateOfBirth: "", townId: "",
    onboardedByAgentId: "", physicalTagId: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    if (!formData.phoneNumber) {
      setError("Please enter a phone number");
      setIsSubmitting(false); return;
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
        method: "POST", body: JSON.stringify(cleanedData),
      });

      if (data.success) {
        router.push("/consumers");
      } else {
        setError(typeof data.error === "object" ? JSON.stringify(data.error) : data.error || "Failed to register consumer");
      }
    } catch (err: any) {
      setError(typeof err.info?.error === "object" ? JSON.stringify(err.info?.error) : err.info?.error || "Network error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-500">

      {/* ── Header ────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 border-b border-gray-200/60 dark:border-white/[0.08] pb-8">
        <div>
          <nav className="mb-3 flex items-center gap-2 text-[13px] font-medium text-gray-500 dark:text-gray-400">
            <Link href="/consumers" className="hover:text-gray-900 dark:hover:text-white transition-colors">Consumers</Link>
            <svg className="h-3.5 w-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
            <span className="text-gray-900 dark:text-gray-200">Register</span>
          </nav>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            Register Consumer
          </h1>
          <p className="mt-2 text-base text-gray-500 dark:text-gray-400">
            Onboard a new participant into the TuZoHub loyalty ecosystem.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/consumers" className="rounded-xl bg-white dark:bg-white/[0.03] px-5 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-white/[0.08] shadow-sm hover:bg-gray-50 dark:hover:bg-white/[0.05] transition-all">
            Cancel
          </Link>
          <button onClick={handleSubmit} disabled={isSubmitting} className="inline-flex items-center justify-center rounded-xl bg-gray-900 dark:bg-white px-5 py-2.5 text-sm font-semibold text-white dark:text-gray-900 shadow-sm hover:bg-gray-800 dark:hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-white focus:ring-offset-2 disabled:opacity-60 transition-all active:scale-[0.98]">
            {isSubmitting ? "Processing..." : "Save Consumer"}
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-3 rounded-xl bg-error-50 p-4 border border-error-100 dark:bg-error-500/10 dark:border-error-500/20">
          <svg className="mt-0.5 h-5 w-5 shrink-0 text-error-600 dark:text-error-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-error-800 dark:text-error-300">Submission Error</h3>
            <p className="mt-1 text-[14px] text-error-700 dark:text-error-400">{error}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-12 items-start">
        {/* ── Left Column: Form ────────────────────────────────────────────── */}
        <form onSubmit={handleSubmit} className="divide-y divide-transparent">
          <FormSection title="Identity Details" description="Basic information about the participant. Name should match their official identification.">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <Field label="First Name"><TextInput placeholder="e.g. Jane" value={formData.firstName} onChange={(e: any) => setFormData({ ...formData, firstName: e.target.value })} /></Field>
              <Field label="Last Name"><TextInput placeholder="e.g. Doe" value={formData.lastName} onChange={(e: any) => setFormData({ ...formData, lastName: e.target.value })} /></Field>
            </div>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <Field label="Middle Name"><TextInput placeholder="Optional" value={formData.secondName || ""} onChange={(e: any) => setFormData({ ...formData, secondName: e.target.value })} /></Field>
              <Field label="Gender"><ModernSelect options={[{ value: "MALE", label: "Male" }, { value: "FEMALE", label: "Female" }, { value: "OTHER", label: "Other" }]} value={formData.gender} onChange={(val) => setFormData({ ...formData, gender: val })} placeholder="Select Gender" /></Field>
            </div>
            <Field label="Date of Birth" action={formData.dateOfBirth && (<button type="button" onClick={() => setFormData({ ...formData, dateOfBirth: "" })} className="text-[13px] font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400 transition-colors">Clear</button>)}>
              <DatePicker value={formData.dateOfBirth} onChange={(val) => setFormData({ ...formData, dateOfBirth: val })} placeholder="Select Date" />
            </Field>
          </FormSection>

          <FormSection title="Communication" description="How we reach the consumer for transactional messages and marketing.">
            <Field label="Phone Number" hint="Primary identifier for USSD & SMS"><KenyaPhoneInput value={formData.phoneNumber} onChange={(val) => setFormData({ ...formData, phoneNumber: val })} /></Field>
            <Field label="Email Address" hint="For digital receipts and statements"><TextInput type="email" placeholder="jane.doe@example.com" value={formData.email} onChange={(e: any) => setFormData({ ...formData, email: e.target.value })} /></Field>
          </FormSection>

          <FormSection title="Compliance & KYC" description="Identifiers required for financial integrity and tax purposes.">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <Field label="National ID Number" hint="6-10 digits for verification" action={<span className="text-[11px] font-semibold text-gray-400">{(formData.idNumber || "").length}/10</span>}>
                <TextInput placeholder="e.g. 12345678" maxLength={10} value={formData.idNumber || ""} onChange={(e: any) => setFormData({ ...formData, idNumber: e.target.value.replace(/\D/g, "") })} />
              </Field>
              <Field label="KRA Tax PIN" hint="Standard 11-character format" action={<span className={`text-[11px] font-semibold transition-colors ${formData.taxPin?.length === 11 ? 'text-success-600' : 'text-gray-400'}`}>{(formData.taxPin || "").length}/11</span>}>
                <TextInput placeholder="e.g. A123456789Z" maxLength={11} value={formData.taxPin || ""} onChange={(e: any) => setFormData({ ...formData, taxPin: e.target.value.replace(/[^a-zA-Z0-9]/g, "").toUpperCase() })} />
              </Field>
            </div>
          </FormSection>

          <FormSection title="System Context" description="Hardware tags and onboarding attribution.">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <Field label="Town / Region"><TextInput placeholder="e.g. Eldoret" value={formData.townId || ""} onChange={(e: any) => setFormData({ ...formData, townId: e.target.value })} /></Field>
              <Field label="Physical Tag ID" hint="NFC Card or QR Sticker"><TextInput placeholder="T-XXXXXXXX" value={formData.physicalTagId || ""} onChange={(e: any) => setFormData({ ...formData, physicalTagId: e.target.value })} /></Field>
            </div>
            <Field label="Promoter / Agent ID" hint="Required if onboarding manually via an agent"><TextInput placeholder="Agent UUID" value={formData.onboardedByAgentId || ""} onChange={(e: any) => setFormData({ ...formData, onboardedByAgentId: e.target.value })} /></Field>
          </FormSection>
        </form>

        {/* ── Right Column: Context Sidebar ────────────────────────────────── */}
        <div className="sticky top-8 space-y-6">
          <div className="rounded-2xl border border-gray-200/80 bg-gray-50/50 p-6 dark:border-white/[0.08] dark:bg-white/[0.02]">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-6">Execution Pipeline</h3>
            <div className="relative border-l border-gray-200 dark:border-white/10 ml-3 space-y-8">
              {[
                { title: "Validation", desc: "Data is checked for duplicates", color: "bg-gray-900 dark:bg-white" },
                { title: "Identity Creation", desc: "Secure profile created in vault", color: "bg-gray-300 dark:bg-gray-600" },
                { title: "Wallet Provisioning", desc: "Digital wallet initialized", color: "bg-gray-300 dark:bg-gray-600" },
              ].map((step, i) => (
                <div key={i} className="relative pl-6">
                  <span className={`absolute -left-[5px] top-1.5 flex h-2.5 w-2.5 items-center justify-center rounded-full ring-4 ring-gray-50 dark:ring-[#111113] ${step.color}`}></span>
                  <div>
                    <h4 className={`text-[14px] font-semibold ${i === 0 ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}>{step.title}</h4>
                    <p className="mt-1 text-[13px] text-gray-500 dark:text-gray-500">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}