"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import KenyaPhoneInput from "@/components/ui/KenyaPhoneInput";
import { ChevronDownIcon, EyeCloseIcon, EyeIcon } from "@/icons";

interface CountryOption {
  id: string;
  name: string;
  code?: string;
  flag?: string;
}

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [countries, setCountries] = useState<CountryOption[]>([]);
  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);
  const countryDropdownRef = useRef<HTMLDivElement>(null);

  // Stepper state (1: Organization Info, 2: Primary Admin)
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);

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

  // Country Flag helper
  const getCountryFlag = (countryName: string) => {
    const nameLower = countryName.toLowerCase();
    if (nameLower.includes("kenya")) return "🇰🇪";
    if (nameLower.includes("uganda")) return "🇺🇬";
    if (nameLower.includes("tanzania")) return "🇹🇿";
    if (nameLower.includes("rwanda")) return "🇷🇼";
    if (nameLower.includes("ethiopia")) return "🇪🇹";
    if (nameLower.includes("nigeria")) return "🇳🇬";
    if (nameLower.includes("ghana")) return "🇬🇭";
    if (nameLower.includes("south africa")) return "🇿🇦";
    return "🌍";
  };

  useEffect(() => {
    fetch("/api/public/countries")
      .then((res) => res.json())
      .then((result) => {
        if (result.success && Array.isArray(result.data)) {
          setCountries(result.data);
          if (result.data.length > 0) {
            setFormData((prev) => ({ ...prev, countryId: result.data[0].id }));
          }
        }
      })
      .catch((err) => console.error("Failed to fetch countries", err));
  }, []);

  // Close country dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (countryDropdownRef.current && !countryDropdownRef.current.contains(event.target as Node)) {
        setIsCountryDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedCountry = countries.find((c) => c.id === formData.countryId) || {
    id: "default",
    name: "Kenya",
  };

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.tenantName || !formData.orgEmail || !formData.taxPin) {
      setError("Please fill in all required organization fields before proceeding.");
      return;
    }
    setError(null);
    setCurrentStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (formData.adminPassword !== formData.confirmPassword) {
      setError("Passwords do not match. Please verify your entries.");
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
        setError(result.error || "Failed to submit registration.");
        setLoading(false);
      } else {
        setSuccess(true);
        setLoading(false);
      }
    } catch (err: any) {
      setError("An unexpected network error occurred. Please try again.");
      setLoading(false);
    }
  };

  const inputStyle =
    "h-11 w-full rounded-xl border border-gray-200/80 dark:border-white/10 bg-gray-50/50 dark:bg-white/[0.03] px-4 text-sm font-medium text-gray-900 dark:text-white placeholder:text-gray-400 shadow-2xs focus:bg-white dark:focus:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 transition";

  if (success) {
    return (
      <div className="min-h-[480px] bg-white dark:bg-gray-900 border border-gray-200/80 dark:border-white/10 rounded-2xl p-8 sm:p-12 text-center flex flex-col items-center justify-center shadow-xl animate-fadeIn">
        <div className="w-20 h-20 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
          <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        </div>
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-xs uppercase tracking-wider mb-4 border border-emerald-500/20">
          Verification Pending
        </div>
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-3 tracking-tight">
          Application Received
        </h1>
        <p className="text-base text-gray-600 dark:text-gray-300 max-w-md mb-8 leading-relaxed">
          Your portal application for <strong className="text-gray-900 dark:text-white">{formData.tenantName}</strong> is now pending verification. Our compliance team will review your credentials and issue your API keys shortly.
        </p>
        <Link
          href="/"
          className="px-8 py-3.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-sm font-bold shadow-lg shadow-brand-500/25 transition"
        >
          Return to TuzoHub Home
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 animate-fadeIn">
      
      {/* 1. Header & Stepper */}
      <div className="space-y-4">
        <div>
          <span className="text-xs font-bold text-brand-600 dark:text-brand-400 uppercase tracking-widest block mb-1">
            Tenant Onboarding
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">
            Create Your Enterprise Organization
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Fill in your official organization particulars to activate your multi-tenant loyalty switch.
          </p>
        </div>

        {/* Visual 2-Step Progress Stepper */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <button
            type="button"
            onClick={() => setCurrentStep(1)}
            className={`p-3 rounded-xl border text-left transition flex items-center gap-3 ${
              currentStep === 1
                ? "bg-brand-500/10 border-brand-500/40 text-brand-600 dark:text-brand-400 font-bold shadow-2xs"
                : "bg-gray-50/50 dark:bg-white/[0.02] border-gray-200/80 dark:border-white/10 text-gray-500"
            }`}
          >
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
              currentStep === 1 ? "bg-brand-600 text-white" : "bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
            }`}>
              1
            </div>
            <div className="truncate">
              <span className="text-[10px] uppercase font-bold tracking-wider block opacity-70">STEP 1</span>
              <span className="text-xs font-bold truncate block">Organization Profile</span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => {
              if (formData.tenantName && formData.orgEmail && formData.taxPin) {
                setCurrentStep(2);
              }
            }}
            className={`p-3 rounded-xl border text-left transition flex items-center gap-3 ${
              currentStep === 2
                ? "bg-brand-500/10 border-brand-500/40 text-brand-600 dark:text-brand-400 font-bold shadow-2xs"
                : "bg-gray-50/50 dark:bg-white/[0.02] border-gray-200/80 dark:border-white/10 text-gray-500"
            }`}
          >
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
              currentStep === 2 ? "bg-brand-600 text-white" : "bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
            }`}>
              2
            </div>
            <div className="truncate">
              <span className="text-[10px] uppercase font-bold tracking-wider block opacity-70">STEP 2</span>
              <span className="text-xs font-bold truncate block">Primary Administrator</span>
            </div>
          </button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-sm font-semibold flex items-center gap-3">
          <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          <span>{error}</span>
        </div>
      )}

      {/* Form Container */}
      <form onSubmit={currentStep === 1 ? handleNextStep : handleSubmit} className="space-y-6">
        
        {/* STEP 1: ORGANIZATION DETAILS */}
        {currentStep === 1 && (
          <div className="space-y-5 animate-fadeIn">
            <div className="flex items-center gap-2.5 pb-2 border-b border-gray-200/80 dark:border-white/10">
              <svg className="w-5 h-5 text-brand-600 dark:text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h6m-6 4h6m-6 4h6" /></svg>
              <h2 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                1. Organization Particulars
              </h2>
            </div>

            <div className="space-y-4">
              {/* Organization Name */}
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                  Official Organization Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    required
                    placeholder="e.g. AgriCorp Distribution Ltd"
                    value={formData.tenantName}
                    onChange={(e) => setFormData({ ...formData, tenantName: e.target.value })}
                    className={inputStyle}
                  />
                </div>
              </div>

              {/* Organization Email & Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">
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
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                    Organization Phone Number
                  </label>
                  <KenyaPhoneInput
                    value={formData.orgPhone}
                    onChange={(val: string) => setFormData({ ...formData, orgPhone: val })}
                    size="md"
                  />
                </div>
              </div>

              {/* Enhanced Custom Country Dropdown & Tax PIN */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Modern Country Selector */}
                <div className="relative" ref={countryDropdownRef}>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                    Country / Jurisdiction <span className="text-rose-500">*</span>
                  </label>
                  
                  <button
                    type="button"
                    onClick={() => setIsCountryDropdownOpen(!isCountryDropdownOpen)}
                    className="h-11 w-full rounded-xl border border-gray-200/80 dark:border-white/10 bg-gray-50/50 dark:bg-white/[0.03] px-4 text-sm font-medium text-gray-900 dark:text-white shadow-2xs flex items-center justify-between hover:bg-white dark:hover:bg-gray-900 transition"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-lg">{getCountryFlag(selectedCountry.name)}</span>
                      <span className="font-semibold text-gray-900 dark:text-white">{selectedCountry.name}</span>
                    </div>
                    <ChevronDownIcon className={`w-4 h-4 text-gray-400 transition-transform ${isCountryDropdownOpen ? "rotate-180" : ""}`} />
                  </button>

                  {/* Dropdown Popup Menu */}
                  {isCountryDropdownOpen && (
                    <div className="absolute top-full left-0 right-0 mt-2 z-50 bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-2xl shadow-xl p-2 max-h-56 overflow-y-auto space-y-1 animate-fadeIn">
                      {countries.map((c) => (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => {
                            setFormData({ ...formData, countryId: c.id });
                            setIsCountryDropdownOpen(false);
                          }}
                          className={`w-full px-3.5 py-2.5 rounded-xl text-left text-sm font-medium flex items-center justify-between transition ${
                            formData.countryId === c.id
                              ? "bg-brand-500/10 text-brand-600 dark:text-brand-400 font-bold"
                              : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5"
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <span className="text-lg">{getCountryFlag(c.name)}</span>
                            <span>{c.name}</span>
                          </div>
                          {formData.countryId === c.id && (
                            <svg className="w-4 h-4 text-brand-600 dark:text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Tax PIN Input */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                    Tax PIN / KRA Registration <span className="text-rose-500">*</span>
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

            {/* Next Step Action Button */}
            <div className="pt-4">
              <button
                type="submit"
                className="w-full h-11 px-5 bg-brand-600 hover:bg-brand-700 text-white text-sm font-bold rounded-xl shadow-md shadow-brand-500/20 transition flex items-center justify-center gap-2"
              >
                <span>Continue to Administrator Setup</span>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: PRIMARY ADMINISTRATOR DETAILS */}
        {currentStep === 2 && (
          <div className="space-y-5 animate-fadeIn">
            <div className="flex items-center justify-between pb-2 border-b border-gray-200/80 dark:border-white/10">
              <div className="flex items-center gap-2.5">
                <svg className="w-5 h-5 text-brand-600 dark:text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                <h2 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                  2. Primary Administrator Credentials
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline"
              >
                ← Edit Company Details
              </button>
            </div>

            <div className="space-y-4">
              {/* First Name & Last Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">
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
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">
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

              {/* Admin Email */}
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                  Admin Work Email Address <span className="text-rose-500">*</span>
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

              {/* Password & Confirm Password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                    Password <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      placeholder="••••••••"
                      value={formData.adminPassword}
                      onChange={(e) => setFormData({ ...formData, adminPassword: e.target.value })}
                      className={`${inputStyle} pr-11`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                    >
                      {showPassword ? <EyeIcon className="w-5 h-5" /> : <EyeCloseIcon className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                    Confirm Password <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      required
                      placeholder="••••••••"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      className={`${inputStyle} pr-11`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                    >
                      {showConfirmPassword ? <EyeIcon className="w-5 h-5" /> : <EyeCloseIcon className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Submit & Back Action Buttons */}
            <div className="pt-4 flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={() => setCurrentStep(1)}
                className="w-full sm:w-1/3 h-11 px-4 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 text-sm font-bold rounded-xl transition"
              >
                ← Back
              </button>
              
              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-2/3 h-11 px-5 bg-brand-600 hover:bg-brand-700 text-white text-sm font-bold rounded-xl shadow-md shadow-brand-500/20 transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? "Submitting Registration..." : "Submit Registration Request"}
              </button>
            </div>
          </div>
        )}

      </form>

      {/* Trust & Compliance Badge Box */}
      <div className="p-4 rounded-2xl bg-gray-50/80 dark:bg-white/[0.02] border border-gray-200/80 dark:border-white/10 flex flex-wrap items-center justify-around gap-3 text-xs font-semibold text-gray-500 dark:text-gray-400">
        <div className="flex items-center gap-1.5">
          <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
          <span>Multi-Tenant RLS Isolated</span>
        </div>
        <div className="flex items-center gap-1.5">
          <svg className="w-4 h-4 text-sky-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
          <span>Instant Provisioning</span>
        </div>
        <div className="flex items-center gap-1.5">
          <svg className="w-4 h-4 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          <span>KDPA 2019 Compliant</span>
        </div>
      </div>

      {/* Login redirect link */}
      <div className="border-t border-gray-200/80 dark:border-white/10 pt-5 text-center">
        <p className="text-sm text-gray-500 dark:text-gray-400">
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
