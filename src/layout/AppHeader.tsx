"use client";
import { ThemeToggleButton } from "@/components/common/ThemeToggleButton";
import NotificationDropdown from "@/components/header/NotificationDropdown";
import UserDropdown from "@/components/header/UserDropdown";
import { useSidebar } from "@/context/SidebarContext";
import React, { useRef, useCallback } from "react";

const AppHeader: React.FC = () => {
  const { isMobileOpen, toggleSidebar, toggleMobileSidebar } = useSidebar();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleToggle = useCallback(() => {
    if (window.innerWidth >= 1024) {
      toggleSidebar();
    } else {
      toggleMobileSidebar();
    }
  }, [toggleSidebar, toggleMobileSidebar]);

  return (
    <header className="sticky top-0 z-40 w-full h-[80px] bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-800 flex items-center px-4 lg:px-8 gap-4 shrink-0">
      {/* Sidebar Toggle */}
      <button
        onClick={handleToggle}
        aria-label="Toggle Sidebar"
        className="w-7 h-7 flex items-center justify-center rounded-md text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/[0.06] transition shrink-0"
      >
        {isMobileOpen ? (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path fillRule="evenodd" clipRule="evenodd"
              d="M6.22 7.28a1 1 0 011.42-1.42L12 10.59l4.36-4.73a1 1 0 111.42 1.41L13.06 12l4.72 4.73A1 1 0 0116.36 18.14L12 13.41l-4.36 4.73A1 1 0 016.22 16.72L10.94 12 6.22 7.28z"
              fill="currentColor"/>
          </svg>
        ) : (
          <svg width="16" height="16" viewBox="0 0 16 12" fill="none">
            <path fillRule="evenodd" clipRule="evenodd"
              d="M0 1a1 1 0 011-1h14a1 1 0 010 2H1a1 1 0 01-1-1zm0 10a1 1 0 011-1h14a1 1 0 010 2H1a1 1 0 01-1-1zM1 5a1 1 0 000 2h8a1 1 0 000-2H1z"
              fill="currentColor"/>
          </svg>
        )}
      </button>

      {/* Mobile Logo */}
      <div className="flex items-center gap-2 lg:hidden">
        <div className="w-6 h-6 rounded-md bg-brand-500 flex items-center justify-center">
          <span className="text-white font-black text-[10px]">TZ</span>
        </div>
        <span className="text-sm font-black tracking-tight text-gray-900 dark:text-white">
          TuZo<span className="text-brand-500">Hub</span>
        </span>
      </div>

      {/* Search */}
      <div className="hidden lg:block flex-1 max-w-[280px]">
        <div className="relative">
          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400">
            <svg width="14" height="14" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" clipRule="evenodd"
                d="M3 9.37a6.37 6.37 0 1112.74 0A6.37 6.37 0 013 9.37zm6.37-8a8 8 0 105.68 13.69l2.83 2.83a1 1 0 001.41-1.42l-2.83-2.82A8 8 0 009.37 1.37z"/>
            </svg>
          </span>
          <input
            ref={inputRef}
            type="text"
            placeholder="Search..."
            className="h-7 w-full rounded-md border border-gray-200 dark:border-white/[0.08] bg-gray-50 dark:bg-white/[0.03] pl-8 pr-4 text-xs text-gray-800 dark:text-white/80 placeholder:text-gray-400 focus:outline-none focus:border-brand-400 focus:ring-1 focus:ring-brand-500/10 transition"
          />
        </div>
      </div>

      {/* Right Actions */}
      <div className="ml-auto flex items-center gap-1.5">
        <ThemeToggleButton />
        <NotificationDropdown />
        <UserDropdown />
      </div>
    </header>
  );
};

export default AppHeader;
