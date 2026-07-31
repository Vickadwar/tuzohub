"use client";

import React, { useRef, useCallback, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggleButton } from "@/components/common/ThemeToggleButton";
import NotificationDropdown from "@/components/header/NotificationDropdown";
import UserDropdown from "@/components/header/UserDropdown";
import { useSidebar } from "@/context/SidebarContext";
import { Logo } from "@/components/common/Logo";

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

  // Keyboard shortcut listener (Cmd+K or Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

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
    if (path.startsWith("/notifications")) return "Notifications Center";
    if (path.startsWith("/audit-logs")) return "Audit & Security Logs";
    if (path.startsWith("/documentation")) return "User Guide & Docs";
    if (path.startsWith("/profile")) return "Account Profile";
    return "Dashboard";
  };

  return (
    <header className="sticky top-0 z-40 w-full h-14 bg-white/75 dark:bg-[#09090b]/75 backdrop-blur-xl border-b border-gray-200/60 dark:border-white/[0.08] flex items-center px-4 lg:px-6 gap-3 shrink-0 shadow-2xs transition-all">
      {/* Apple-style Sidebar Toggle Button */}
      <button
        onClick={handleToggle}
        aria-label="Toggle Sidebar"
        className="flex h-8.5 w-8.5 items-center justify-center rounded-full border border-gray-200/60 dark:border-white/[0.08] bg-gray-100/60 dark:bg-white/[0.06] text-gray-600 dark:text-gray-300 hover:bg-gray-200/70 dark:hover:bg-white/10 transition-all shadow-2xs shrink-0"
      >
        {isMobileOpen ? (
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          </svg>
        )}
      </button>

      {/* Mobile Branding Badge */}
      <div className="flex items-center gap-2 lg:hidden">
        <Logo size="sm" href="/overview" />
      </div>

      {/* Apple Breadcrumb / Section Context (Desktop) */}
      <div className="hidden lg:flex items-center gap-2 border-l border-gray-200/80 dark:border-white/10 pl-3.5 ml-1">
        <span className="text-[11px] font-semibold text-gray-400 dark:text-gray-500 tracking-wide">
          Command Center
        </span>
        <span className="text-gray-300 dark:text-gray-600 text-xs font-light">/</span>
        <span className="text-xs font-bold text-gray-900 dark:text-white tracking-tight">
          {getPageTitle(pathname)}
        </span>
      </div>

      {/* Apple Sleek Quick Search Bar (Desktop) */}
      <div className="hidden lg:block flex-1 max-w-sm ml-4">
        <div className="relative group">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400 group-focus-within:text-brand-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            placeholder="Search vouchers, batches, rules..."
            className="h-8.5 w-full rounded-full border border-gray-200/60 dark:border-white/[0.08] bg-gray-100/50 dark:bg-white/[0.04] pl-9 pr-12 text-xs text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:bg-white dark:focus:bg-gray-900 focus:border-brand-500/50 focus:ring-2 focus:ring-brand-500/20 transition-all shadow-2xs"
          />
          <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono font-semibold text-gray-400 dark:text-gray-500 bg-gray-200/60 dark:bg-white/10 rounded-md border border-gray-300/40 dark:border-white/10 pointer-events-none">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Right Header Actions Dock */}
      <div className="ml-auto flex items-center gap-2">
        <Link
          href="/documentation"
          title="User Guide & In-App Documentation"
          className="flex h-8.5 w-8.5 items-center justify-center rounded-full border border-gray-200/60 dark:border-white/[0.08] bg-gray-100/60 dark:bg-white/[0.06] text-gray-600 dark:text-gray-300 hover:bg-brand-50 hover:text-brand-600 dark:hover:bg-brand-500/20 dark:hover:text-brand-300 transition-all shadow-2xs shrink-0"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M12 18h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </Link>
        <ThemeToggleButton />
        <NotificationDropdown />
        <div className="h-4 w-px bg-gray-200/80 dark:bg-white/10 mx-0.5 hidden sm:block" />
        <UserDropdown />
      </div>
    </header>
  );
}
