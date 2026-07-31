"use client";

import React from "react";
import Link from "next/link";

interface LogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  collapsed?: boolean;
  href?: string;
  className?: string;
  showSubtitle?: boolean;
  subtitleText?: string;
}

export const Logo: React.FC<LogoProps> = ({
  size = "md",
  collapsed = false,
  href,
  className = "",
  showSubtitle = false,
  subtitleText,
}) => {
  // Dimensions map
  const iconSizes = {
    sm: "w-7 h-7 text-[11px]",
    md: "w-8.5 h-8.5 text-xs",
    lg: "w-10 h-10 text-sm",
    xl: "w-12 h-12 text-base",
  };

  const textSizes = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-xl",
    xl: "text-2xl",
  };

  const logoMark = (
    <div className={`relative group shrink-0 ${iconSizes[size]}`}>
      {/* Ambient Glow */}
      <div className="absolute -inset-0.5 rounded-xl bg-brand-500/30 dark:bg-brand-500/40 opacity-75 blur-xs group-hover:opacity-100 transition-opacity" />

      {/* Original Layered Stack Icon Mark - Clean & Sharp */}
      <div className="relative w-full h-full rounded-xl bg-gradient-to-tr from-brand-600 via-brand-500 to-indigo-500 flex items-center justify-center text-white font-black shadow-sm shadow-brand-500/25 border border-white/20">
        <svg className="w-4.5 h-4.5 stroke-[2.5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
        </svg>
      </div>
    </div>
  );

  const content = (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {logoMark}

      {!collapsed && (
        <div className="flex flex-col min-w-0 justify-center">
          <div className="flex items-baseline leading-none">
            {/* Tuzo - BOLD */}
            <span className={`font-black tracking-tight text-gray-900 dark:text-white ${textSizes[size]}`}>
              Tuzo
            </span>
            {/* Hub - SLEEK LIGHT BUT SHARP & CLEAR (No opacity blur, high contrast legibility) */}
            <span className={`font-light tracking-tight text-gray-600 dark:text-gray-300 ${textSizes[size]} ml-0.5`}>
              Hub
            </span>
          </div>

          {showSubtitle && (
            <span className="text-[10px] font-medium text-gray-500 dark:text-gray-400 tracking-wide truncate mt-1 leading-tight">
              {subtitleText || "Enterprise Loyalty Switch"}
            </span>
          )}
        </div>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="focus:outline-none group/logo">
        {content}
      </Link>
    );
  }

  return content;
};
