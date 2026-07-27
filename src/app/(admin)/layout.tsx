"use client";

import { useSidebar } from "@/context/SidebarContext";
import AppHeader from "@/layout/AppHeader";
import AppSidebar from "@/layout/AppSidebar";
import Backdrop from "@/layout/Backdrop";
import React from "react";

import AuthGuard from "@/components/auth/AuthGuard";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isExpanded, isHovered, isMobileOpen } = useSidebar();

  const mainContentMargin = isMobileOpen
    ? "ml-0"
    : isExpanded || isHovered
    ? "lg:ml-[260px]"
    : "lg:ml-[68px]";

  return (
    <AuthGuard>
      <div className="min-h-screen xl:flex bg-[#F1F5F9] dark:bg-gray-950 overflow-hidden">
        <AppSidebar />
        <Backdrop />
        <div className={`flex-1 transition-all duration-250 ease-in-out ${mainContentMargin} flex flex-col min-h-screen`}>
          <AppHeader />
          <main className="flex-1 overflow-y-auto px-4 md:px-6 2xl:px-10 py-6 md:py-10 max-w-[1680px] w-full mx-auto relative custom-scrollbar">
            {children}
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}
