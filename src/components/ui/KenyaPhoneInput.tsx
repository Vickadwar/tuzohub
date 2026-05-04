"use client";

import React, { useState, useEffect } from "react";

interface KenyaPhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

/**
 * Specialized Kenyan Phone Input
 * - Automatically handles +254 prefix
 * - Strips leading zeros and redundant prefixes
 * - Restricts input to valid digits (7... or 1...)
 */
export default function KenyaPhoneInput({
  value,
  onChange,
  placeholder = "7XX XXX XXX",
  className = "",
}: KenyaPhoneInputProps) {
  // We store the 9-digit internal value (without +254)
  const [displayValue, setDisplayValue] = useState("");

  useEffect(() => {
    // If value comes in with +254, strip it for internal display
    const cleaned = value.replace(/^\+254/, "").replace(/^254/, "");
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
    
    // Notify parent with the full +254 format if not empty
    if (input.length > 0) {
      onChange(`+254${input}`);
    } else {
      onChange("");
    }
  };

  return (
    <div className={`relative flex items-center ${className}`}>
      {/* Visual Prefix */}
      <div className="absolute left-3.5 flex items-center gap-2 pointer-events-none border-r border-gray-200 dark:border-white/[0.08] pr-2.5 mr-2.5">
        <div className="w-5 h-3.5 bg-[#000000] relative overflow-hidden rounded-[1px]">
          {/* Miniature Kenya Flag Simulation */}
          <div className="absolute top-0 w-full h-[30%] bg-[#000000]" />
          <div className="absolute top-[35%] w-full h-[30%] bg-[#BB1924]" />
          <div className="absolute bottom-0 w-full h-[30%] bg-[#006600]" />
        </div>
        <span className="text-[14px] font-bold text-gray-400">+254</span>
      </div>

      <input
        type="tel"
        value={displayValue}
        onChange={handleChange}
        placeholder={placeholder}
        className="w-full h-11 pl-[92px] pr-4 rounded-lg border border-gray-200 dark:border-white/[0.08] bg-white dark:bg-white/[0.03] text-[15px] font-medium text-gray-800 dark:text-white/90 placeholder:text-gray-300 dark:placeholder:text-white/20 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10 transition shadow-sm"
      />
    </div>
  );
}
