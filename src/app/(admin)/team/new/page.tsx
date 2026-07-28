"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { authenticatedFetch } from "@/hooks/useApi";
import ModernSelect from "@/components/ui/ModernSelect";
import KenyaPhoneInput from "@/components/ui/KenyaPhoneInput";

function LocalFormSection({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <div className="bg-white dark:bg-white/[0.02] border border-gray-200/80 dark:border-white/[0.06] rounded-2xl p-6 shadow-sm space-y-5">
      <div className="border-b border-gray-100 dark:border-white/5 pb-4">
        <h3 className="text-sm font-bold text-gray-900 dark:text-white tracking-tight">{title}</h3>
        <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">{description}</p>
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function LocalTextInput({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  required,
  error,
  helpText,
}: {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
  error?: string;
  helpText?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
        {label} {required && <span className="text-rose-500">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className={`h-10 w-full rounded-xl border bg-gray-50/50 dark:bg-white/[0.03] px-3.5 text-xs font-medium text-gray-900 dark:text-white placeholder:text-gray-400 shadow-2xs transition-colors focus:bg-white focus:outline-none focus:ring-2 dark:focus:bg-white/5 ${
          error
            ? "border-rose-500 focus:border-rose-500 focus:ring-rose-500/20"
            : "border-gray-200/80 dark:border-white/10 focus:border-brand-500/40 focus:ring-brand-500/30"
        }`}
      />
      {helpText && !error && <p className="text-[11px] text-gray-400">{helpText}</p>}
      {error && <p className="text-[11px] text-rose-500 font-semibold">{error}</p>}
    </div>
  );
}

export default function CreateTeamMemberPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    role: "OPERATOR",
    status: "active",
    password: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleGeneratePassword = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%";
    let pass = "";
    for (let i = 0; i < 12; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData((prev) => ({ ...prev, password: pass }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      setError("Please provide first and last name.");
      setIsSubmitting(false);
      return;
    }

    if (!formData.email.trim() || !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formData.email)) {
      setError("Please provide a valid email address.");
      setIsSubmitting(false);
      return;
    }

    try {
      const res = await authenticatedFetch("/api/users", {
        method: "POST",
        body: JSON.stringify(formData),
      });

      if (res.success) {
        router.push("/team");
      } else {
        setError(res.error || "Failed to create team member");
      }
    } catch (err: any) {
      setError(err.message || "Network error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full space-y-6 animate-fadeIn pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-200/80 dark:border-white/[0.06] pb-5">
        <div className="flex items-center gap-4">
          <Link
            href="/team"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors text-gray-500 dark:text-gray-400"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </Link>

          {/* Rounded Avatar Circle */}
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400 font-bold text-sm border border-brand-500/20 shadow-2xs">
            {formData.firstName?.charAt(0) || "N"}
          </div>

          <div>
            <h1 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
              Create New Team Member
            </h1>
            <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
              Register an administrative or staff member into your organization roster.
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-semibold">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-8 space-y-6">
          {/* Member Identity */}
          <LocalFormSection title="Member Identity" description="Specify personal contact and identification details.">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <LocalTextInput
                label="First Name"
                required
                placeholder="e.g. David"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              />
              <LocalTextInput
                label="Last Name"
                required
                placeholder="e.g. Mwangi"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              />
            </div>

            <LocalTextInput
              label="Email Address"
              required
              type="email"
              placeholder="e.g. david.mwangi@company.co.ke"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              helpText="Used for system notifications and portal authentication."
            />

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
                Phone Number
              </label>
              <KenyaPhoneInput
                value={formData.phone}
                onChange={(val: string) => setFormData({ ...formData, phone: val })}
                size="md"
              />
              <p className="text-[11px] text-gray-400">Kenyan mobile contact number.</p>
            </div>
          </LocalFormSection>

          {/* Access & Role */}
          <LocalFormSection title="Access & Role Scope" description="Define organizational access privileges and role assignment.">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  Role Designation <span className="text-rose-500">*</span>
                </label>
                <ModernSelect
                  options={[
                    { value: "TENANT_ADMIN", label: "Tenant Admin (Full Access)" },
                    { value: "MANAGER", label: "Operations Manager" },
                    { value: "OPERATOR", label: "Standard Operator" },
                    { value: "VIEWER", label: "Read-Only Viewer" },
                  ]}
                  value={formData.role}
                  onChange={(val) => setFormData({ ...formData, role: val })}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                  Initial Status
                </label>
                <ModernSelect
                  options={[
                    { value: "active", label: "Active" },
                    { value: "inactive", label: "Inactive" },
                  ]}
                  value={formData.status}
                  onChange={(val) => setFormData({ ...formData, status: val })}
                />
              </div>
            </div>
          </LocalFormSection>

          {/* Credentials */}
          <LocalFormSection title="Initial Credentials" description="Configure authentication credentials for the new member.">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
                  Initial Password
                </label>
                <button
                  type="button"
                  onClick={handleGeneratePassword}
                  className="text-xs text-brand-600 dark:text-brand-400 font-semibold hover:underline"
                >
                  Generate random password
                </button>
              </div>

              <input
                type="text"
                placeholder="Type or generate initial password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="h-10 w-full rounded-xl border border-gray-200/80 dark:border-white/10 bg-gray-50/50 dark:bg-white/[0.03] px-3.5 text-xs font-mono font-medium text-gray-900 dark:text-white placeholder:text-gray-400 shadow-2xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500"
              />
              <p className="text-[11px] text-gray-400">
                Minimum 6 characters. The user can update their password after initial login.
              </p>
            </div>
          </LocalFormSection>

          {/* Form Controls */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <Link
              href="/team"
              className="px-4 py-2.5 bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-700 dark:text-gray-300 text-xs font-semibold rounded-xl transition"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold rounded-xl shadow-md shadow-brand-500/20 transition disabled:opacity-50"
            >
              {isSubmitting ? "Creating member..." : "Create member"}
            </button>
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="col-span-12 lg:col-span-4 space-y-6">
          <div className="bg-white dark:bg-white/[0.02] border border-gray-200/80 dark:border-white/[0.06] rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white">Role Hierarchy Guide</h3>
            
            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20">
                <span className="font-bold text-rose-600 dark:text-rose-400">Tenant Admin</span>
                <p className="text-gray-500 dark:text-gray-400 text-[11px] mt-0.5">
                  Full administrative control over settings, team members, integrations, and financial logs.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                <span className="font-bold text-amber-600 dark:text-amber-400">Operations Manager</span>
                <p className="text-gray-500 dark:text-gray-400 text-[11px] mt-0.5">
                  Can manage campaigns, rewards, inventory, and point transactions.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-sky-500/10 border border-sky-500/20">
                <span className="font-bold text-sky-600 dark:text-sky-400">Standard Operator</span>
                <p className="text-gray-500 dark:text-gray-400 text-[11px] mt-0.5">
                  Handles daily task execution, consumer onboarding, and point validation.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-gray-500/10 border border-gray-500/20">
                <span className="font-bold text-gray-600 dark:text-gray-400">Read-Only Viewer</span>
                <p className="text-gray-500 dark:text-gray-400 text-[11px] mt-0.5">
                  Read-only view access to reports and operational data tables.
                </p>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
