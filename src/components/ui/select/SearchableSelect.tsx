"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";

interface SearchableSelectProps {
  value: string;
  onChange: (val: string) => void;
  options: string[];
  placeholder?: string;
  settingsUrl?: string;
  settingsLabel?: string;
}

export default function SearchableSelect({
  value,
  onChange,
  options = [],
  placeholder = "-- Select --",
  settingsUrl = "/products/settings",
  settingsLabel = "+ Add New in Settings",
}: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredOptions = options.filter((opt) =>
    opt.toLowerCase().includes(searchQuery.trim().toLowerCase())
  );

  return (
    <div className="relative w-full" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-white/10 rounded-xl text-xs font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/40 flex items-center justify-between transition-colors shadow-2xs text-left"
      >
        <span className={value ? "text-gray-900 dark:text-white font-semibold" : "text-gray-400"}>
          {value || placeholder}
        </span>
        <svg
          className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
            isOpen ? "rotate-180 text-brand-500" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          strokeWidth="2"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Floating Dropdown Panel */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-white dark:bg-gray-900 border border-gray-200 dark:border-white/10 rounded-xl shadow-2xl overflow-hidden animate-fadeIn">
          {/* Search Input Filter */}
          <div className="p-2 border-b border-gray-100 dark:border-white/5 bg-gray-50/50 dark:bg-white/[0.02]">
            <div className="relative">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </span>
              <input
                type="text"
                autoFocus
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg text-xs font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
            </div>
          </div>

          {/* Scrollable Items List */}
          <div className="max-h-56 overflow-y-auto divide-y divide-gray-50 dark:divide-white/[0.02]">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt) => {
                const isSelected = value === opt;
                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => {
                      onChange(opt);
                      setIsOpen(false);
                      setSearchQuery("");
                    }}
                    className={`w-full px-3.5 py-2.5 text-xs font-medium text-left transition-colors flex items-center justify-between ${
                      isSelected
                        ? "bg-brand-500/10 text-brand-600 dark:text-brand-400 font-bold"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5"
                    }`}
                  >
                    <span>{opt}</span>
                    {isSelected && (
                      <svg className="w-4 h-4 text-brand-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                );
              })
            ) : (
              <div className="p-4 text-center text-xs text-gray-400">
                No matching options found
              </div>
            )}
          </div>

          {/* Bottom Settings Link Shortcut */}
          {settingsUrl && (
            <div className="p-2 border-t border-gray-100 dark:border-white/5 bg-gray-50/80 dark:bg-white/[0.02]">
              <Link
                href={settingsUrl}
                onClick={() => setIsOpen(false)}
                className="w-full py-1.5 px-3 rounded-lg bg-brand-500/10 hover:bg-brand-500/20 text-brand-600 dark:text-brand-400 text-xs font-bold transition flex items-center justify-center gap-1.5"
              >
                <span>{settingsLabel}</span>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
