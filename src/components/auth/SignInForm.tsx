"use client";

import React, { useState } from "react";
import Link from "next/link";
import { EyeCloseIcon, EyeIcon } from "@/icons";
import { signIn as signInAction } from "@/app/auth/actions";

export default function SignInForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("email", email);
      formData.append("password", password);

      const result = await signInAction(formData);

      if (result?.error) {
        setError(result.error);
        setLoading(false);
      } else if (result?.success && result?.redirectUrl) {
        window.location.assign(result.redirectUrl);
      }
    } catch (err: any) {
      setError("An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="w-full space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">
          Sign in to your portal
        </h1>
        <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400">
          Enter your email and password to access your administrator dashboard.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-sm font-semibold">
          {error}
        </div>
      )}

      <form onSubmit={handleSignIn} className="space-y-5">
        {/* Email Address */}
        <div className="space-y-2">
          <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">
            Email address <span className="text-rose-500">*</span>
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@company.co.ke"
            className="h-11 w-full rounded-xl border border-gray-200/80 dark:border-white/10 bg-gray-50/50 dark:bg-white/[0.03] px-4 text-sm font-medium text-gray-900 dark:text-white placeholder:text-gray-400 shadow-2xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 transition"
          />
        </div>

        {/* Password */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300">
              Password <span className="text-rose-500">*</span>
            </label>
            <Link
              href="/auth/register"
              className="text-sm font-semibold text-brand-600 dark:text-brand-400 hover:underline"
            >
              Forgot password?
            </Link>
          </div>

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="h-11 w-full rounded-xl border border-gray-200/80 dark:border-white/10 bg-gray-50/50 dark:bg-white/[0.03] pl-4 pr-11 text-sm font-medium text-gray-900 dark:text-white placeholder:text-gray-400 shadow-2xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 transition"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              {showPassword ? (
                <EyeIcon className="w-5 h-5" />
              ) : (
                <EyeCloseIcon className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Remember me option */}
        <div className="flex items-center gap-2.5 pt-1">
          <input
            type="checkbox"
            id="remember"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="h-4.5 w-4.5 rounded border-gray-300 text-brand-600 focus:ring-brand-500 dark:border-white/20 dark:bg-white/5 cursor-pointer"
          />
          <label htmlFor="remember" className="text-sm text-gray-600 dark:text-gray-400 font-medium cursor-pointer">
            Remember this session
          </label>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full h-11 px-4 bg-brand-600 hover:bg-brand-700 text-white text-sm font-bold rounded-xl shadow-md shadow-brand-500/20 transition disabled:opacity-50 mt-2"
        >
          {loading ? "Signing in..." : "Sign in to Portal"}
        </button>
      </form>

      {/* Register redirect */}
      <div className="border-t border-gray-200/80 dark:border-white/10 pt-5 text-center">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Don&apos;t have an organization portal?{" "}
          <Link
            href="/auth/register"
            className="font-bold text-brand-600 dark:text-brand-400 hover:underline"
          >
            Create your account
          </Link>
        </p>
      </div>
    </div>
  );
}
