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
}

/**
 * Premium DatePicker Component
 * - Powered by flatpickr with custom styling
 */
export default function DatePicker({
  value,
  onChange,
  placeholder = "Select date",
  className = "",
}: DatePickerProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      flatpickr(inputRef.current as HTMLInputElement, {
        defaultDate: value,
        dateFormat: "Y-m-d",
        onChange: (selectedDates, dateStr) => {
          onChange(dateStr);
        },
      });
    }
  }, [onChange, value]);

  return (
    <div className={`relative ${className}`}>
      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
        <CalenderIcon className="w-5 h-5 text-gray-400" />
      </div>
      <input
        ref={inputRef}
        type="text"
        placeholder={placeholder}
        defaultValue={value}
        className="w-full h-11 pl-11 pr-4 rounded-lg border border-gray-200 dark:border-white/[0.08] bg-white dark:bg-white/[0.03] text-[15px] font-medium text-gray-800 dark:text-white/90 placeholder:text-gray-300 dark:placeholder:text-white/20 focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10 transition shadow-sm cursor-pointer"
      />
    </div>
  );
}
