import React from "react";
import Link from "next/link";
import { ThemeProvider } from "@/context/ThemeContext";
import { ThemeToggleButton } from "@/components/common/ThemeToggleButton";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider>
      <div className="min-h-screen w-full bg-gray-50 dark:bg-gray-950 flex flex-col lg:flex-row overflow-x-hidden animate-fadeIn">
        {/* Left Form Area */}
        <div className="flex-1 flex flex-col justify-between p-6 sm:p-10 lg:p-12 z-10 min-h-screen lg:min-h-0">
          <div className="flex items-center justify-between w-full max-w-md mx-auto mb-6">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-500 text-white font-black text-xs shadow-md shadow-brand-500/30 group-hover:scale-105 transition-transform">
                TZ
              </div>
              <span className="text-lg font-extrabold tracking-tight text-gray-900 dark:text-white">
                TuZo<span className="text-brand-500">Hub</span>
              </span>
            </Link>

            <ThemeToggleButton />
          </div>

          <div className="w-full max-w-md mx-auto my-auto py-6">
            {children}
          </div>

          <div className="w-full max-w-md mx-auto text-center pt-6">
            <p className="text-xs text-gray-400">
              © {new Date().getFullYear()} TuZoHub Enterprise. All rights reserved.
            </p>
          </div>
        </div>

        {/* Right Hero / Branding Area (Desktop) */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-gray-900 via-brand-950 to-gray-950 p-12 text-white flex-col justify-between relative overflow-hidden">
          {/* Subtle Background Glows */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Top Brand Header */}
          <div className="relative z-10 flex items-center gap-3">
            <div className="px-3 py-1 rounded-full bg-white/10 border border-white/10 text-xs font-semibold text-brand-300">
              Enterprise Loyalty Platform
            </div>
          </div>

          {/* Middle Content Banner */}
          <div className="relative z-10 max-w-lg space-y-6">
            <h2 className="text-4xl font-extrabold tracking-tight text-white leading-tight">
              Scale your enterprise rewards.<br />
              <span className="text-brand-400">Secure your liability.</span>
            </h2>
            <p className="text-sm text-gray-300 leading-relaxed">
              Powering B2B2C distribution networks, physical voucher logistics, and automated mobile money payouts across Africa with an enterprise fraud engine.
            </p>

            <div className="grid grid-cols-2 gap-4 pt-4">
              <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/[0.08] backdrop-blur-xs space-y-1">
                <span className="text-2xl font-black text-white">100%</span>
                <p className="text-xs text-gray-400">Multi-tenant isolation</p>
              </div>
              <div className="p-4 rounded-2xl bg-white/[0.04] border border-white/[0.08] backdrop-blur-xs space-y-1">
                <span className="text-2xl font-black text-brand-400">&lt;50ms</span>
                <p className="text-xs text-gray-400">Real-time fraud rules</p>
              </div>
            </div>
          </div>

          {/* Footer Security Badge */}
          <div className="relative z-10 flex items-center justify-between border-t border-white/10 pt-6">
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              All systems operational
            </div>
            <span className="text-xs font-mono text-gray-500">v2.4.0 · Production</span>
          </div>
        </div>
      </div>
    </ThemeProvider>
  );
}
