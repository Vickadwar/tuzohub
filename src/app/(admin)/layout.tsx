"use client";

import { useSidebar } from "@/context/SidebarContext";
import AppHeader from "@/layout/AppHeader";
import AppSidebar from "@/layout/AppSidebar";
import Backdrop from "@/layout/Backdrop";
import React from "react";

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
    <div className="min-h-screen xl:flex bg-gray-50 dark:bg-gray-950">
      <AppSidebar />
      <Backdrop />
      <div className={`flex-1 transition-all duration-250 ease-in-out ${mainContentMargin} flex flex-col min-h-screen`}>
        <AppHeader />
        <main className="flex-1 px-5 py-5 lg:px-7 lg:py-6 max-w-[1680px] w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
