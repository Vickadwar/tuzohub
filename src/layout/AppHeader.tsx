"use client";

import React, { useRef, useCallback } from "react";
import { usePathname } from "next/navigation";
import { ThemeToggleButton } from "@/components/common/ThemeToggleButton";
import NotificationDropdown from "@/components/header/NotificationDropdown";
import UserDropdown from "@/components/header/UserDropdown";
import { useSidebar } from "@/context/SidebarContext";

export default function AppHeader() {
  const { isMobileOpen, toggleSidebar, toggleMobileSidebar } = useSidebar();
  const inputRef = useRef<HTMLInputElement>(null);
  const pathname = usePathname();

  const handleToggle = useCallback(() => {
    if (window.innerWidth >= 1024) {
      toggleSidebar();
    } else {
      toggleMobileSidebar();
    }
  }, [toggleSidebar, toggleMobileSidebar]);

  const getPageTitle = (path: string) => {
    if (path.startsWith("/overview")) return "Overview";
    if (path.startsWith("/consumers")) return "Consumers";
    if (path.startsWith("/campaigns")) return "Campaigns & Marketing";
    if (path.startsWith("/rewards")) return "Rewards Catalog";
    if (path.startsWith("/products")) return "Products Inventory";
    if (path.startsWith("/production")) return "Production Batches";
    if (path.startsWith("/vouchers")) return "Vouchers Inventory";
    if (path.startsWith("/terminal")) return "Terminal";
    if (path.startsWith("/transactions")) return "Transactions Log";
    if (path.startsWith("/settings")) return "Setup & Masters";
    if (path.startsWith("/team")) return "Team Management";
    if (path.startsWith("/profile")) return "Account Profile";
    return "Dashboard";
  };

  return (
    <header className="sticky top-0 z-40 w-full h-16 lg:h-[72px] bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-b border-gray-200/80 dark:border-white/[0.06] flex items-center px-4 lg:px-6 gap-3 shrink-0 shadow-2xs transition-all">
      {/* Sidebar Hamburger Button */}
      <button
        onClick={handleToggle}
        aria-label="Toggle Sidebar"
        className="flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200/80 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 transition shrink-0"
      >
        {isMobileOpen ? (
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          </svg>
        )}
      </button>

      {/* Mobile Branding */}
      <div className="flex items-center gap-2 lg:hidden">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-500 text-white font-black text-xs shadow-sm shadow-brand-500/30">
          TZ
        </div>
        <span className="text-sm font-extrabold tracking-tight text-gray-900 dark:text-white">
          TuZo<span className="text-brand-500">Hub</span>
        </span>
      </div>

      {/* Breadcrumb / Section Context (Desktop) */}
      <div className="hidden lg:flex items-center gap-2 border-l border-gray-200 dark:border-white/10 pl-4 ml-1">
        <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
          Command Center
        </span>
        <span className="text-gray-300 dark:text-gray-600 text-xs">/</span>
        <span className="text-xs font-bold text-gray-900 dark:text-white">
          {getPageTitle(pathname)}
        </span>
      </div>

      {/* Global Quick Search (Desktop) */}
      <div className="hidden lg:block flex-1 max-w-xs ml-4">
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            placeholder="Search system (Press ⌘K)..."
            className="h-9 w-full rounded-xl border border-gray-200/80 dark:border-white/[0.08] bg-gray-50 dark:bg-white/[0.03] pl-9 pr-3 text-xs text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:border-brand-500/40 focus:ring-2 focus:ring-brand-500/20 transition"
          />
        </div>
      </div>

      {/* Right Header Actions */}
      <div className="ml-auto flex items-center gap-2">
        <ThemeToggleButton />
        <NotificationDropdown />
        <div className="h-6 w-px bg-gray-200 dark:bg-white/10 mx-1 hidden sm:block" />
        <UserDropdown />
      </div>
    </header>
  );
}
