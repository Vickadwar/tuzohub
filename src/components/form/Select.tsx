import React, { useState, useRef, useEffect } from "react";
import { ChevronDownIcon } from "@/icons";

interface Option {
  value: string;
  label: string;
}

interface SelectProps {
  options: Option[];
  placeholder?: string;
  onChange: (value: string) => void;
  className?: string;
  defaultValue?: string;
  value?: string;
  label?: string;
}

const Select: React.FC<SelectProps> = ({
  options,
  placeholder = "Select an option",
  onChange,
  className = "",
  defaultValue = "",
  value,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState<string>(value ?? defaultValue);
  const selectRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (value !== undefined) {
      setSelectedValue(value);
    }
  }, [value]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (value: string) => {
    setSelectedValue(value);
    onChange(value);
    setIsOpen(false);
  };

  const selectedOption = options.find((opt) => opt.value === selectedValue);

  return (
    <div className={`relative w-full ${className}`} ref={selectRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex h-11 w-full items-center justify-between rounded-lg border px-4 py-2.5 text-sm transition-all duration-200 outline-none
          ${
            isOpen
              ? "border-brand-500 ring-2 ring-brand-500/20 bg-brand-50/50 dark:bg-brand-500/10 dark:border-brand-500"
              : "border-gray-200 bg-white hover:bg-gray-50 dark:border-gray-800 dark:bg-gray-900 dark:hover:bg-gray-800/80 hover:border-gray-300 dark:hover:border-gray-700"
          }
          ${selectedValue ? "text-gray-900 dark:text-white" : "text-gray-400 dark:text-gray-500"}
          shadow-theme-xs
        `}
      >
        <span className="block truncate">{selectedOption ? selectedOption.label : placeholder}</span>
        <ChevronDownIcon
          className={`h-5 w-5 text-gray-500 transition-transform duration-300 ease-in-out ${
            isOpen ? "rotate-180 text-brand-500" : ""
          }`}
        />
      </button>

      <div
        className={`absolute z-50 mt-2 w-full origin-top-right rounded-xl border border-gray-100 bg-white shadow-theme-lg transition-all duration-200 ease-out dark:border-gray-800 dark:bg-gray-950 backdrop-blur-xl ${
          isOpen ? "scale-100 opacity-100" : "scale-95 opacity-0 pointer-events-none"
        }`}
      >
        <ul className="max-h-60 overflow-y-auto w-full p-1 custom-scrollbar">
          {/* Placeholder option (if reset is needed) */}
          <li
            onClick={() => handleSelect("")}
            className={`cursor-pointer select-none rounded-lg px-4 py-2.5 text-sm transition-colors duration-150 ${
              selectedValue === "" 
                ? "bg-brand-50 text-brand-500 font-medium dark:bg-brand-500/10 dark:text-brand-400"
                : "text-gray-500 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-900/50"
            }`}
          >
            {placeholder}
          </li>
          
          {options.map((option) => (
            <li
              key={option.value}
              onClick={() => handleSelect(option.value)}
              className={`cursor-pointer select-none rounded-lg px-4 py-2.5 text-sm transition-colors duration-150 flex items-center justify-between group ${
                selectedValue === option.value
                  ? "bg-brand-500 text-white font-medium shadow-md shadow-brand-500/20"
                  : "text-gray-700 hover:bg-brand-50 hover:text-brand-500 dark:text-gray-300 dark:hover:bg-brand-500/10 dark:hover:text-brand-400"
              }`}
            >
              <span className="block truncate">{option.label}</span>
              {selectedValue === option.value && (
                <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Select;
