"use client";

import React, { useState, useRef, useEffect, useId } from "react";
import { ChevronDown, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export interface DropdownOption {
  label: string;
  value: string;
  icon?: React.ReactNode;
  badge?: string;
  description?: string;
}

export interface CustomDropdownProps {
  label?: string;
  options: (DropdownOption | string)[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  className?: string;
  buttonClassName?: string;
  menuClassName?: string;
  disabled?: boolean;
  id?: string;
  ariaLabel?: string;
}

export function CustomDropdown({
  label,
  options,
  value,
  onChange,
  placeholder = "Select an option...",
  error,
  className = "",
  buttonClassName = "",
  menuClassName = "",
  disabled = false,
  id,
  ariaLabel,
}: CustomDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const generatedId = useId();
  const dropdownId = id || generatedId;

  // Normalize options to DropdownOption objects
  const normalizedOptions: DropdownOption[] = options.map((opt) =>
    typeof opt === "string" ? { label: opt, value: opt } : opt
  );

  const selectedOption = normalizedOptions.find((opt) => opt.value === value);

  // Close on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent | TouchEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleOutsideClick);
      document.addEventListener("touchstart", handleOutsideClick);
    }
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("touchstart", handleOutsideClick);
    };
  }, [isOpen]);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;

    if (e.key === "Escape") {
      setIsOpen(false);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
      } else {
        const currentIndex = normalizedOptions.findIndex(
          (opt) => opt.value === value
        );
        const nextIndex =
          currentIndex < normalizedOptions.length - 1 ? currentIndex + 1 : 0;
        onChange(normalizedOptions[nextIndex].value);
      }
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
      } else {
        const currentIndex = normalizedOptions.findIndex(
          (opt) => opt.value === value
        );
        const prevIndex =
          currentIndex > 0 ? currentIndex - 1 : normalizedOptions.length - 1;
        onChange(normalizedOptions[prevIndex].value);
      }
    } else if (e.key === "Enter" || e.key === " ") {
      if (!isOpen) {
        e.preventDefault();
        setIsOpen(true);
      }
    }
  };

  return (
    <div
      ref={containerRef}
      className={`w-full space-y-1.5 text-left relative ${className}`}
    >
      {label && (
        <label
          htmlFor={dropdownId}
          className="block text-xs font-semibold uppercase tracking-wider text-[#0F172A]"
        >
          {label}
        </label>
      )}

      <div className="relative">
        <button
          type="button"
          id={dropdownId}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          aria-label={ariaLabel || label || placeholder}
          disabled={disabled}
          onClick={() => !disabled && setIsOpen((prev) => !prev)}
          onKeyDown={handleKeyDown}
          className={`w-full min-h-[46px] rounded-xl bg-[#FFFDF9] border border-[#EADFCB] px-4 py-2.5 text-left text-sm text-[#0F172A] shadow-xs transition-all duration-200 flex items-center justify-between gap-3 focus:outline-none focus:border-[#D4A35A] focus:ring-2 focus:ring-[#D4A35A]/35 hover:border-[#D4A35A]/80 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
            error ? "border-[#B42318] focus:ring-[#B42318]/20" : ""
          } ${isOpen ? "border-[#D4A35A] ring-2 ring-[#D4A35A]/25" : ""} ${buttonClassName}`}
        >
          <div className="flex items-center gap-2.5 truncate flex-1">
            {selectedOption?.icon && (
              <span className="shrink-0">{selectedOption.icon}</span>
            )}
            <span
              className={`truncate font-medium ${
                selectedOption && selectedOption.value !== ""
                  ? "text-[#0F172A]"
                  : "text-[#94A3B8]"
              }`}
            >
              {selectedOption && selectedOption.value !== ""
                ? selectedOption.label
                : placeholder}
            </span>
          </div>

          <ChevronDown
            className={`w-4 h-4 text-[#64748B] shrink-0 transition-transform duration-200 ${
              isOpen ? "rotate-180 text-[#D4A35A]" : ""
            }`}
          />
        </button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -6, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.98 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              role="listbox"
              aria-label={label || placeholder}
              className={`absolute left-0 right-0 top-full mt-1.5 z-50 max-h-64 overflow-y-auto rounded-2xl bg-[#FFFDF9] border border-[#EADFCB] p-1.5 shadow-2xl backdrop-blur-md text-sm text-[#0F172A] focus:outline-none ${menuClassName}`}
            >
              {normalizedOptions.map((opt) => {
                const isSelected = opt.value === value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => {
                      onChange(opt.value);
                      setIsOpen(false);
                    }}
                    className={`w-full px-3 py-2.5 rounded-xl text-left flex items-center justify-between gap-3 transition-colors duration-150 cursor-pointer group ${
                      isSelected
                        ? "bg-[#FAF6EE] text-[#5C3A1E] font-semibold"
                        : "hover:bg-[#F8F5EF] text-[#0F172A]"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate flex-1">
                      {opt.icon && (
                        <span className="shrink-0 opacity-80 group-hover:opacity-100">
                          {opt.icon}
                        </span>
                      )}
                      <div className="truncate">
                        <span className="block truncate">{opt.label}</span>
                        {opt.description && (
                          <span className="block text-[11px] text-[#64748B] font-normal truncate">
                            {opt.description}
                          </span>
                        )}
                      </div>
                    </div>

                    {opt.badge && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#EADFCB]/60 text-[#5C3A1E] shrink-0">
                        {opt.badge}
                      </span>
                    )}

                    {isSelected && (
                      <Check className="w-4 h-4 text-[#A98B57] shrink-0 ml-1" />
                    )}
                  </button>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {error && (
        <p role="alert" className="text-xs text-[#B42318] font-medium pt-0.5">
          {error}
        </p>
      )}
    </div>
  );
}
