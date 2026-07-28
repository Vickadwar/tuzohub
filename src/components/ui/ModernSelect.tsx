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
  size?: "sm" | "md";
}

/**
 * High-Density Command Center Custom Select Component
 */
export default function ModernSelect({
  options,
  value,
  onChange,
  placeholder = "Select option",
  className = "",
  size = "sm",
}: ModernSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => String(opt.value) === String(value));

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const heightClass = size === "md" ? "h-10 px-3.5 text-xs" : "h-9 px-3 text-xs";

  return (
    <div className={`relative w-full ${isOpen ? "z-40" : "z-10"} ${className}`} ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex w-full items-center justify-between font-bold rounded-xl border bg-gray-50 dark:bg-white/[0.03] transition shadow-2xs
          ${heightClass}
          ${isOpen 
            ? "border-brand-500 ring-2 ring-brand-500/20 text-gray-900 dark:text-white" 
            : "border-gray-200 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20 text-gray-800 dark:text-gray-200"}
        `}
      >
        <span className={`truncate ${selectedOption ? "text-gray-900 dark:text-white" : "text-gray-400 font-normal"}`}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDownIcon
          className={`w-3.5 h-3.5 shrink-0 transition-transform duration-200 ${isOpen ? "rotate-180 text-brand-500" : "text-gray-400"}`}
        />
      </button>

      {isOpen && (
        <div className="absolute z-50 left-0 right-0 mt-1 py-1.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-xl shadow-2xl max-h-60 overflow-y-auto custom-scrollbar animate-in fade-in duration-100 min-w-[160px]">
          {options.length > 0 ? (
            options.map((option) => {
              const isSelected = String(option.value) === String(value);
              return (
                <button
                  key={String(option.value)}
                  type="button"
                  onClick={() => {
                    onChange(String(option.value));
                    setIsOpen(false);
                  }}
                  className={`flex items-center justify-between w-full px-3.5 py-2 text-xs font-bold text-left transition
                    ${isSelected 
                      ? "bg-brand-500/10 text-brand-600 dark:text-brand-400" 
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/[0.04] hover:text-gray-900 dark:hover:text-white"}
                  `}
                >
                  <span className="flex items-center truncate">
                    {option.icon && <span className="mr-2">{option.icon}</span>}
                    {option.label}
                  </span>
                  {isSelected && (
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-500 shrink-0 ml-2" />
                  )}
                </button>
              );
            })
          ) : (
            <div className="px-3 py-2.5 text-xs text-gray-400 italic">No options found</div>
          )}
        </div>
      )}
    </div>
  );
}
