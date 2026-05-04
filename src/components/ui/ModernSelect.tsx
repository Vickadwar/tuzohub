"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronDownIcon } from "@/icons";

interface Option {
  value: string;
  label: string;
  icon?: React.ReactNode;
}

interface ModernSelectProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

/**
 * Premium Custom Select Component
 * - Styled to match the TuZoHub aesthetic
 * - Handles dark mode and interactions
 */
export default function ModernSelect({
  options,
  value,
  onChange,
  placeholder = "Select an option",
  className = "",
}: ModernSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex w-full items-center justify-between h-11 px-4 rounded-lg border bg-white dark:bg-white/[0.03] transition shadow-sm
          ${isOpen ? "border-brand-500 ring-2 ring-brand-500/10" : "border-gray-200 dark:border-white/[0.08] hover:border-gray-300 dark:hover:border-white/20"}
        `}
      >
        <span className={`text-[15px] ${selectedOption ? "text-gray-800 dark:text-white/90" : "text-gray-300 dark:text-white/20"}`}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDownIcon
          className={`w-4 h-4 transition-transform duration-200 ${isOpen ? "rotate-180 text-brand-500" : "text-gray-400"}`}
        />
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-2 py-1.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/[0.08] rounded-xl shadow-xl overflow-hidden animate-in fade-in zoom-in duration-150">
          {options.length > 0 ? (
            options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={`flex items-center w-full px-4 py-2.5 text-[14px] text-left transition
                  ${option.value === value 
                    ? "bg-brand-50 text-brand-600 dark:bg-brand-500/10 dark:text-brand-400 font-semibold" 
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/[0.04] hover:text-gray-900 dark:hover:text-white"}
                `}
              >
                {option.icon && <span className="mr-3">{option.icon}</span>}
                {option.label}
              </button>
            ))
          ) : (
            <div className="px-4 py-3 text-[13px] text-gray-400 italic">No options available</div>
          )}
        </div>
      )}
    </div>
  );
}
