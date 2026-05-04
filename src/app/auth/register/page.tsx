"use client";
import React, { useState, useEffect } from "react";
import Input from "@/components/form/input/InputField";
import Label from "@/components/form/Label";
import Button from "@/components/ui/button/Button";
import Link from "next/link";
import { ChevronLeftIcon, EyeCloseIcon, EyeIcon } from "@/icons";

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
      .then(res => res.json())
      .then(result => {
        if (result.success) {
           setCountries(result.data);
           if (result.data.length > 0) {
             setFormData(prev => ({ ...prev, countryId: result.data[0].id }));
           }
        }
      })
      .catch(err => console.error("Failed to fetch countries", err));
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

  if (success) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 bg-success-50 text-success-600 rounded-full flex items-center justify-center mb-8 shadow-theme-sm border border-success-100">
           <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
           </svg>
        </div>
        <h1 className="text-3xl font-extrabold text-gray-900 mb-4 tracking-tight">Registration Received!</h1>
        <p className="text-lg text-gray-600 max-w-md mb-10 leading-relaxed">
          Your account for <span className="font-bold text-gray-900">{formData.tenantName}</span> is now pending approval. 
          Our team will review your particulars and notify you once your portal is ready.
        </p>
        <Link href="/" className="px-8 py-3 bg-gray-900 text-white rounded-full font-bold shadow-theme-md hover:bg-gray-800 transition-all">
          Back to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="p-6 md:px-12 md:py-8 flex justify-between items-center bg-white border-b border-gray-200/60">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="h-8 w-8 rounded-lg bg-brand-500 flex items-center justify-center font-bold text-white shadow-theme-xs">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <span className="text-xl font-bold tracking-tight text-gray-900">TuzoHub</span>
        </Link>
        <Link href="/auth/login" className="text-sm font-semibold text-brand-600 hover:text-brand-700">
          Already have an account? Sign In
        </Link>
      </header>

      <main className="flex-1 flex flex-col items-center py-12 px-6">
        <div className="w-full max-w-4xl bg-white border border-gray-200 rounded-3xl shadow-theme-xl overflow-hidden flex flex-col md:flex-row">
          
          {/* Left Side: Branding/Info */}
          <div className="w-full md:w-[35%] bg-brand-600 p-8 md:p-12 text-white flex flex-col justify-between relative overflow-hidden">
             <div className="relative z-10">
                <h2 className="text-3xl font-extrabold mb-6 leading-tight">Start Building Your Loyalty Ecosystem.</h2>
                <p className="text-brand-100 text-sm leading-relaxed mb-8 opacity-90">
                  TuzoHub provides the enterprise-grade infrastructure needed to scale complex reward networks.
                </p>
                
                <div className="space-y-6">
                   <div className="flex gap-4">
                      <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-xs shrink-0">1</div>
                      <p className="text-xs font-medium leading-relaxed">Fill in your company and administrator details.</p>
                   </div>
                   <div className="flex gap-4">
                      <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-xs shrink-0">2</div>
                      <p className="text-xs font-medium leading-relaxed">Wait for our compliance team to approve your request.</p>
                   </div>
                   <div className="flex gap-4">
                      <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-xs shrink-0">3</div>
                      <p className="text-xs font-medium leading-relaxed">Access your dashboard and start onboarding partners.</p>
                   </div>
                </div>
             </div>

             {/* Background Decoration */}
             <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
             <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
          </div>

          {/* Right Side: Form */}
          <div className="flex-1 p-8 md:p-12 overflow-y-auto max-h-[85vh] no-scrollbar">
            <h1 className="text-2xl font-extrabold text-gray-900 mb-2 tracking-tight">Create Your Organization</h1>
            <p className="text-gray-500 text-sm mb-10">Please provide your official company particulars for verification.</p>

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Section: Organization Info */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-widest text-brand-600 mb-6 flex items-center gap-2">
                   <span className="w-4 h-[1px] bg-brand-200"></span> Organization Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <Label>Organization Name <span className="text-error-500">*</span></Label>
                    <Input 
                      placeholder="e.g. AgriCorp Distribution" 
                      value={formData.tenantName}
                      onChange={e => setFormData({...formData, tenantName: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label>Organization Email <span className="text-error-500">*</span></Label>
                    <Input 
                      type="email"
                      placeholder="contact@company.com" 
                      value={formData.orgEmail}
                      onChange={e => setFormData({...formData, orgEmail: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label>Organization Phone</Label>
                    <Input 
                      placeholder="+254..." 
                      value={formData.orgPhone}
                      onChange={e => setFormData({...formData, orgPhone: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label>Country <span className="text-error-500">*</span></Label>
                    <select 
                      className="w-full h-11 px-4 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 transition-all"
                      value={formData.countryId}
                      onChange={e => setFormData({...formData, countryId: e.target.value})}
                      required
                    >
                      {countries.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <Label>Tax PIN / Reg Number <span className="text-error-500">*</span></Label>
                    <Input 
                      placeholder="P000..." 
                      value={formData.taxPin}
                      onChange={e => setFormData({...formData, taxPin: e.target.value})}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Section: Admin Info */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-widest text-brand-600 mb-6 flex items-center gap-2">
                   <span className="w-4 h-[1px] bg-brand-200"></span> Primary Administrator
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label>First Name <span className="text-error-500">*</span></Label>
                    <Input 
                      placeholder="John" 
                      value={formData.firstName}
                      onChange={e => setFormData({...formData, firstName: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label>Last Name <span className="text-error-500">*</span></Label>
                    <Input 
                      placeholder="Doe" 
                      value={formData.lastName}
                      onChange={e => setFormData({...formData, lastName: e.target.value})}
                      required
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label>Admin Email Address <span className="text-error-500">*</span></Label>
                    <Input 
                      type="email" 
                      placeholder="admin@yourcompany.com" 
                      value={formData.adminEmail}
                      onChange={e => setFormData({...formData, adminEmail: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label>Password <span className="text-error-500">*</span></Label>
                    <div className="relative">
                      <Input 
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••" 
                        value={formData.adminPassword}
                        onChange={e => setFormData({...formData, adminPassword: e.target.value})}
                        required
                      />
                      <span
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute z-30 -translate-y-1/2 cursor-pointer right-3 top-1/2"
                      >
                        {showPassword ? <EyeIcon className="w-4 h-4 text-gray-400" /> : <EyeCloseIcon className="w-4 h-4 text-gray-400" />}
                      </span>
                    </div>
                  </div>
                  <div>
                    <Label>Confirm Password <span className="text-error-500">*</span></Label>
                    <Input 
                      type="password" 
                      placeholder="••••••••" 
                      value={formData.confirmPassword}
                      onChange={e => setFormData({...formData, confirmPassword: e.target.value})}
                      required
                    />
                  </div>
                </div>
              </div>

              {error && (
                <div className="p-4 rounded-xl bg-error-50 border border-error-100 text-error-600 text-sm font-semibold animate-shake">
                  {error}
                </div>
              )}

              <Button className="w-full h-12 text-base font-bold shadow-theme-md" type="submit" disabled={loading}>
                {loading ? "Registering Organization..." : "Submit Registration Request"}
              </Button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
