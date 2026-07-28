"use client";

import React, { useEffect, useRef } from "react";
import flatpickr from "flatpickr";
import "flatpickr/dist/flatpickr.min.css";
import { CalenderIcon } from "@/icons";

interface DatePickerProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  size?: "sm" | "md";
}

/**
 * High-Density DatePicker Component
 */
export default function DatePicker({
  value,
  onChange,
  placeholder = "Select date",
  className = "",
  size = "sm",
}: DatePickerProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      flatpickr(inputRef.current as HTMLInputElement, {
        defaultDate: value,
        dateFormat: "Y-m-d",
        onChange: (_, dateStr) => {
          onChange(dateStr);
        },
      });
    }
  }, [onChange, value]);

  const heightClass = size === "md" ? "h-10 text-xs" : "h-9 text-xs";

  return (
    <div className={`relative w-full ${className}`}>
      <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none z-10">
        <CalenderIcon className="w-4 h-4 text-gray-400" />
      </div>
      <input
        ref={inputRef}
        type="text"
        placeholder={placeholder}
        defaultValue={value}
        className={`w-full ${heightClass} pl-9 pr-3 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/[0.03] font-bold text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition cursor-pointer`}
      />
    </div>
  );
}
