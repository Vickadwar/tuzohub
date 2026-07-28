"use client";

import React, { useState, useEffect } from "react";

interface KenyaPhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  size?: "sm" | "md";
}

/**
 * High-Density Kenyan Phone Input Component
 * - Automatically handles +254 prefix
 * - Strips leading zeros and redundant country code
 * - Validates Safaricom / Airtel 9-digit format
 */
export default function KenyaPhoneInput({
  value,
  onChange,
  placeholder = "7XX XXX XXX",
  className = "",
  size = "sm",
}: KenyaPhoneInputProps) {
  const [displayValue, setDisplayValue] = useState("");

  useEffect(() => {
    const cleaned = (value || "").replace(/^\+254/, "").replace(/^254/, "");
    setDisplayValue(cleaned);
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let input = e.target.value;

    // 1. Remove all non-digits
    input = input.replace(/\D/g, "");

    // 2. Handle common user "over-typing"
    if (input.startsWith("254")) {
      input = input.slice(3);
    } else if (input.startsWith("0")) {
      input = input.slice(1);
    }

    // 3. Limit to 9 digits (Kenyan standard after prefix)
    input = input.slice(0, 9);

    setDisplayValue(input);
    
    if (input.length > 0) {
      onChange(`+254${input}`);
    } else {
      onChange("");
    }
  };

  const isComplete = displayValue.length === 9;
  const isValidSafaricom = /^(7(?:0|1|2|4|6|9)|11(?:0|1|2|3|4|5))/.test(displayValue);

  const heightClass = size === "md" ? "h-10 text-xs" : "h-9 text-xs";

  return (
    <div className={`relative flex items-center w-full ${className}`}>
      {/* Visual Kenya Flag + Country Code Prefix */}
      <div className="absolute left-3 flex items-center gap-1.5 pointer-events-none border-r border-gray-200/80 dark:border-white/10 pr-2.5 z-10">
        <div className="w-4 h-3 bg-black relative overflow-hidden rounded-xs shrink-0 flex flex-col justify-between border border-gray-300/30">
          <div className="w-full h-1 bg-black" />
          <div className="w-full h-1 bg-red-600" />
          <div className="w-full h-1 bg-emerald-600" />
        </div>
        <span className="text-xs font-mono font-bold text-gray-500 dark:text-gray-400">+254</span>
      </div>

      <input
        type="tel"
        value={displayValue}
        onChange={handleChange}
        placeholder={placeholder}
        className={`w-full ${heightClass} pl-[84px] ${isComplete ? "pr-8" : "pr-3.5"} rounded-xl border border-gray-200/80 dark:border-white/10 bg-gray-50/50 dark:bg-white/[0.03] font-mono font-semibold text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 shadow-2xs focus:bg-white dark:focus:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 transition`}
      />

      {/* Validation Indicator Pill */}
      {isComplete && (
        <div className="absolute right-2.5 pointer-events-none flex items-center">
          {isValidSafaricom ? (
            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500" title="Valid Kenyan Mobile">
              <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </span>
          ) : (
            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-amber-500/10 text-amber-500 font-bold text-[10px]" title="Check prefix">
              !
            </span>
          )}
        </div>
      )}
    </div>
  );
}
