"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import KenyaPhoneInput from "@/components/ui/KenyaPhoneInput";
import { ChevronDownIcon, EyeCloseIcon, EyeIcon } from "@/icons";

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [countries, setCountries] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    tenantName: "",
    orgEmail: "",
    orgPhone: "",
    taxPin: "",
    adminEmail: "",
    adminPassword: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    countryId: "",
  });

  useEffect(() => {
    fetch("/api/public/countries")
      .then((res) => res.json())
      .then((result) => {
        if (result.success) {
          setCountries(result.data);
          if (result.data.length > 0) {
            setFormData((prev) => ({ ...prev, countryId: result.data[0].id }));
          }
        }
      })
      .catch((err) => console.error("Failed to fetch countries", err));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (formData.adminPassword !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/public/register-tenant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await response.json();
      if (!result.success) {
        setError(result.error || "Failed to register.");
        setLoading(false);
      } else {
        setSuccess(true);
        setLoading(false);
      }
    } catch (err: any) {
      setError("An unexpected error occurred.");
      setLoading(false);
    }
  };

  const inputStyle =
    "h-10 w-full rounded-xl border border-gray-200/80 dark:border-white/10 bg-gray-50/50 dark:bg-white/[0.03] px-3.5 text-xs font-medium text-gray-900 dark:text-white placeholder:text-gray-400 shadow-2xs focus:bg-white dark:focus:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 transition";

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col items-center justify-center p-6 text-center animate-fadeIn">
        <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center mb-6 shadow-sm">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        </div>
        <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-2 tracking-tight">
          Registration request received
        </h1>
        <p className="text-xs text-gray-500 dark:text-gray-400 max-w-md mb-8 leading-relaxed">
          Your portal application for <span className="font-bold text-gray-900 dark:text-white">{formData.tenantName}</span> is now pending verification. Our administrative compliance team will review your particulars and notify you once your tenant is activated.
        </p>
        <Link
          href="/"
          className="px-6 py-2.5 bg-gray-900 hover:bg-gray-800 dark:bg-white dark:hover:bg-gray-100 text-white dark:text-gray-900 rounded-xl text-xs font-semibold shadow-md transition"
        >
          Return to home
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="space-y-1.5">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
          Create your organization
        </h1>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Provide your official company and primary administrator details for tenant verification.
        </p>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-semibold">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section: Organization Details */}
        <div className="space-y-4 pt-2">
          <div className="border-b border-gray-200/80 dark:border-white/10 pb-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
              Organization details
            </h2>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Organization Name <span className="text-rose-500">*</span>
              </label>
              <input
                required
                placeholder="e.g. AgriCorp Distribution Ltd"
                value={formData.tenantName}
                onChange={(e) => setFormData({ ...formData, tenantName: e.target.value })}
                className={inputStyle}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Organization Email <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="contact@company.co.ke"
                  value={formData.orgEmail}
                  onChange={(e) => setFormData({ ...formData, orgEmail: e.target.value })}
                  className={inputStyle}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Organization Phone
                </label>
                <KenyaPhoneInput
                  value={formData.orgPhone}
                  onChange={(val: string) => setFormData({ ...formData, orgPhone: val })}
                  size="md"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Country <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <select
                    required
                    value={formData.countryId}
                    onChange={(e) => setFormData({ ...formData, countryId: e.target.value })}
                    className={`${inputStyle} appearance-none pr-9 cursor-pointer`}
                  >
                    {countries.map((c) => (
                      <option
                        key={c.id}
                        value={c.id}
                        className="bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                      >
                        {c.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Tax PIN / Registration Number <span className="text-rose-500">*</span>
                </label>
                <input
                  required
                  placeholder="e.g. P051234567A"
                  value={formData.taxPin}
                  onChange={(e) => setFormData({ ...formData, taxPin: e.target.value })}
                  className={inputStyle}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Section: Primary Administrator */}
        <div className="space-y-4 pt-2">
          <div className="border-b border-gray-200/80 dark:border-white/10 pb-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-brand-600 dark:text-brand-400">
              Primary administrator
            </h2>
          </div>

          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  First Name <span className="text-rose-500">*</span>
                </label>
                <input
                  required
                  placeholder="e.g. John"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className={inputStyle}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Last Name <span className="text-rose-500">*</span>
                </label>
                <input
                  required
                  placeholder="e.g. Mwangi"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className={inputStyle}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Admin Email Address <span className="text-rose-500">*</span>
              </label>
              <input
                type="email"
                required
                placeholder="john.mwangi@company.co.ke"
                value={formData.adminEmail}
                onChange={(e) => setFormData({ ...formData, adminEmail: e.target.value })}
                className={inputStyle}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Password <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="••••••••"
                    value={formData.adminPassword}
                    onChange={(e) => setFormData({ ...formData, adminPassword: e.target.value })}
                    className={`${inputStyle} pr-10`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                  >
                    {showPassword ? <EyeIcon className="w-4 h-4" /> : <EyeCloseIcon className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Confirm Password <span className="text-rose-500">*</span>
                </label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className={inputStyle}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 px-4 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold rounded-xl shadow-md shadow-brand-500/20 transition disabled:opacity-50 mt-2"
        >
          {loading ? "Submitting request..." : "Submit registration request"}
        </button>
      </form>

      {/* Login link */}
      <div className="border-t border-gray-200/80 dark:border-white/10 pt-4 text-center">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Already registered?{" "}
          <Link
            href="/auth/login"
            className="font-bold text-brand-600 dark:text-brand-400 hover:underline"
          >
            Sign in to your portal
          </Link>
        </p>
      </div>
    </div>
  );
}
