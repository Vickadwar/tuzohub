"use client";

import React from "react";
import { useSidebar } from "@/context/SidebarContext";

export default function Backdrop() {
  const { isMobileOpen, toggleMobileSidebar } = useSidebar();

  if (!isMobileOpen) return null;

  return (
    <div
      className="fixed inset-0 z-40 bg-gray-950/40 backdrop-blur-xs lg:hidden transition-opacity animate-fadeIn"
      onClick={toggleMobileSidebar}
    />
  );
}
