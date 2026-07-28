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
      <div className="space-y-1.5">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
          Sign in to your portal
        </h1>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Enter your email and password to access your administrator dashboard.
        </p>
      </div>

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-semibold">
          {error}
        </div>
      )}

      <form onSubmit={handleSignIn} className="space-y-4">
        {/* Email Address */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
            Email address <span className="text-rose-500">*</span>
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@company.co.ke"
            className="h-10 w-full rounded-xl border border-gray-200/80 dark:border-white/10 bg-gray-50/50 dark:bg-white/[0.03] px-3.5 text-xs font-medium text-gray-900 dark:text-white placeholder:text-gray-400 shadow-2xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 transition"
          />
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300">
              Password <span className="text-rose-500">*</span>
            </label>
            <Link
              href="/auth/register"
              className="text-xs font-medium text-brand-600 dark:text-brand-400 hover:underline"
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
              className="h-10 w-full rounded-xl border border-gray-200/80 dark:border-white/10 bg-gray-50/50 dark:bg-white/[0.03] pl-3.5 pr-10 text-xs font-medium text-gray-900 dark:text-white placeholder:text-gray-400 shadow-2xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 transition"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              {showPassword ? (
                <EyeIcon className="w-4 h-4" />
              ) : (
                <EyeCloseIcon className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Remember me option */}
        <div className="flex items-center gap-2 pt-1">
          <input
            type="checkbox"
            id="remember"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500 dark:border-white/20 dark:bg-white/5"
          />
          <label htmlFor="remember" className="text-xs text-gray-600 dark:text-gray-400 font-medium">
            Remember this session
          </label>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 px-4 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold rounded-xl shadow-md shadow-brand-500/20 transition disabled:opacity-50 mt-2"
        >
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>

      {/* Register redirect */}
      <div className="border-t border-gray-200/80 dark:border-white/10 pt-4 text-center">
        <p className="text-xs text-gray-500 dark:text-gray-400">
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
