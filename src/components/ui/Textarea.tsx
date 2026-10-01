import React from "react";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, helperText, className = "", disabled, id, ...props }, ref) => {
    const textareaId =
      id || (label ? label.toLowerCase().replace(/[^a-z0-9]/g, "-") : undefined);
    const errorId = textareaId && error ? `${textareaId}-error` : undefined;
    const helperId = textareaId && helperText ? `${textareaId}-helper` : undefined;
    const describedBy = [errorId, helperId].filter(Boolean).join(" ") || undefined;

    return (
      <div className="w-full space-y-1.5 text-left">
        {label && (
          <label
            htmlFor={textareaId}
            className="block text-xs font-semibold uppercase tracking-wider text-[#0F172A]"
          >
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          disabled={disabled}
          aria-invalid={error ? "true" : undefined}
          aria-describedby={describedBy}
          className={`w-full rounded-xl bg-[#FFFDF9] border border-[#EADFCB] px-4 py-2.5 text-sm text-[#0F172A] placeholder:text-[#64748B]/70 transition-all duration-200 focus:border-[#D4A35A] focus:outline-none focus:ring-2 focus:ring-[#D4A35A]/35 disabled:opacity-50 disabled:bg-[#F8F5EF] min-h-[100px] resize-y ${
            error
              ? "border-[#B42318] focus:border-[#B42318] focus:ring-[#B42318]/20"
              : ""
          } ${className}`}
          {...props}
        />
        {error ? (
          <p id={errorId} role="alert" className="text-xs text-[#B42318] font-medium">{error}</p>
        ) : helperText ? (
          <p id={helperId} className="text-xs text-[#64748B]">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";
