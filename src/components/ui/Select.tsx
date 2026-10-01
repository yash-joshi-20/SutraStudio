import React from "react";
import { ChevronDown } from "lucide-react";

export interface Option {
  label: string;
  value: string;
}

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: Option[];
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, className = "", id, ...props }, ref) => {
    const selectId =
      id || (label ? label.toLowerCase().replace(/[^a-z0-9]/g, "-") : undefined);
    const errorId = selectId && error ? `${selectId}-error` : undefined;

    return (
      <div className="w-full space-y-1.5 text-left">
        {label && (
          <label
            htmlFor={selectId}
            className="block text-xs font-semibold uppercase tracking-wider text-[#0F172A]"
          >
            {label}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            aria-invalid={error ? "true" : undefined}
            aria-describedby={errorId}
            className={`w-full appearance-none rounded-xl bg-[#FFFDF9] border border-[#EADFCB] px-4 py-2.5 pr-10 text-sm text-[#0F172A] transition-all duration-200 focus:border-[#D4A35A] focus:outline-none focus:ring-2 focus:ring-[#D4A35A]/35 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
              error ? "border-[#B42318] focus:ring-[#B42318]/20" : ""
            } ${className}`}
            {...props}
          >
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDown aria-hidden="true" className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B]" />
        </div>
        {error && <p id={errorId} role="alert" className="text-xs text-[#B42318] font-medium">{error}</p>}
      </div>
    );
  }
);

Select.displayName = "Select";
