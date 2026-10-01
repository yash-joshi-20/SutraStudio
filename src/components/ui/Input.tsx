import React from "react";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      className = "",
      disabled,
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || (label ? label.toLowerCase().replace(/[^a-z0-9]/g, "-") : undefined);
    const errorId = inputId && error ? `${inputId}-error` : undefined;
    const helperId = inputId && helperText ? `${inputId}-helper` : undefined;
    const describedBy = [errorId, helperId].filter(Boolean).join(" ") || undefined;

    return (
      <div className="w-full space-y-1.5 text-left">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-semibold uppercase tracking-wider text-[#0F172A]"
          >
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {leftIcon && (
            <span aria-hidden="true" className="absolute left-3.5 text-[#64748B] pointer-events-none flex items-center justify-center">
              {leftIcon}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            disabled={disabled}
            aria-invalid={error ? "true" : undefined}
            aria-describedby={describedBy}
            className={`w-full rounded-xl bg-[#FFFDF9] border border-[#EADFCB] py-2.5 text-sm text-[#0F172A] placeholder:text-[#64748B]/70 transition-all duration-200 focus:border-[#D4A35A] focus:outline-none focus:ring-2 focus:ring-[#D4A35A]/35 disabled:opacity-50 disabled:bg-[#F8F5EF] disabled:cursor-not-allowed ${
              leftIcon ? "pl-10" : "pl-4"
            } ${rightIcon ? "pr-10" : "pr-4"} ${
              error ? "border-[#B42318] focus:border-[#B42318] focus:ring-[#B42318]/20" : ""
            } ${className}`}
            {...props}
          />
          {rightIcon && (
            <span aria-hidden="true" className="absolute right-3.5 text-[#64748B] flex items-center justify-center">
              {rightIcon}
            </span>
          )}
        </div>
        {error ? (
          <p id={errorId} role="alert" className="text-xs text-[#B42318] font-medium">{error}</p>
        ) : helperText ? (
          <p id={helperId} className="text-xs text-[#64748B]">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = "Input";
