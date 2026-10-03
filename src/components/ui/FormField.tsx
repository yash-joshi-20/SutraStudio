"use client";

/**
 * SUTRA STUDIO — Form Field Primitives
 *
 * One implementation of "label + control + helper + error" so every form in
 * the client portal and the admin portal looks and behaves identically.
 *
 * Accessibility contract:
 *   • label is always associated via htmlFor / generated id
 *   • helper text uses aria-describedby
 *   • errors use role="alert" and set aria-invalid on the control
 *   • every control is at least 44px tall on touch
 */

import React, { useId } from "react";
import { AlertCircle, Loader2, Eye, EyeOff, Check } from "lucide-react";

const CONTROL_BASE =
  "field-control transition-colors disabled:opacity-60";

function describedBy(helperId?: string, errorId?: string, error?: string) {
  const ids = [helperId, error && errorId].filter(Boolean).join(" ");
  return ids || undefined;
}

/* ------------------------------------------------------------------ */

export interface FieldProps {
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  optional?: boolean;
  className?: string;
  children: (args: { id: string; describedBy: string | undefined; invalid: boolean }) => React.ReactNode;
}

export function Field({ label, hint, error, required, optional, className, children }: FieldProps) {
  const base = useId();
  const id = `fld-${base}`;
  const helperId = `${id}-hint`;
  const errorId = `${id}-err`;

  return (
    <div className={className}>
      <label htmlFor={id} className="field-label">
        {label}
        {required && (
          <span className="text-[#B42318] ml-0.5" aria-hidden="true">
            *
          </span>
        )}
        {optional && <span className="text-[#94A3B8] font-normal ml-1.5 text-[11px]">optional</span>}
      </label>
      {children({ id, describedBy: describedBy(hint ? helperId : undefined, errorId, error), invalid: Boolean(error) })}
      {hint && !error && (
        <span id={helperId} className="field-helper">
          {hint}
        </span>
      )}
      {error && (
        <span id={errorId} className="field-error" role="alert">
          <AlertCircle className="w-3.5 h-3.5 mt-px shrink-0" aria-hidden="true" />
          <span>{error}</span>
        </span>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */

export interface TextFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: "text" | "email" | "tel" | "url" | "password" | "number" | "date";
  placeholder?: string;
  hint?: string;
  error?: string;
  required?: boolean;
  optional?: boolean;
  autoComplete?: string;
  inputMode?: "text" | "email" | "tel" | "url" | "numeric" | "decimal";
  disabled?: boolean;
  maxLength?: number;
  className?: string;
  autoFocus?: boolean;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}

export function TextField({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  hint,
  error,
  required,
  optional,
  autoComplete,
  inputMode,
  disabled,
  maxLength,
  className,
  autoFocus,
  onKeyDown,
}: TextFieldProps) {
  const [revealed, setRevealed] = React.useState(false);
  const isPassword = type === "password";
  const resolvedType = isPassword && revealed ? "text" : type;

  return (
    <Field label={label} hint={hint} error={error} required={required} optional={optional} className={className}>
      {({ id, describedBy, invalid }) => (
        <div className="relative">
          <input
            id={id}
            type={resolvedType}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            aria-describedby={describedBy}
            aria-invalid={invalid}
            aria-required={required || undefined}
            autoComplete={autoComplete}
            inputMode={inputMode}
            disabled={disabled}
            maxLength={maxLength}
            autoFocus={autoFocus}
            onKeyDown={onKeyDown}
            className={`${CONTROL_BASE} ${isPassword ? "pr-12" : ""}`}
          />
          {isPassword && (
            <button
              type="button"
              onClick={() => setRevealed((r) => !r)}
              className="absolute right-1 top-1/2 -translate-y-1/2 w-10 h-10 rounded-lg text-[#64748B] hover:text-[#5C3A1E] hover:bg-[#F8F5EF] flex items-center justify-center"
              aria-label={revealed ? "Hide password" : "Show password"}
              tabIndex={-1}
            >
              {revealed ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          )}
        </div>
      )}
    </Field>
  );
}

/* ------------------------------------------------------------------ */

export interface TextAreaFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  hint?: string;
  error?: string;
  required?: boolean;
  optional?: boolean;
  rows?: number;
  maxLength?: number;
  disabled?: boolean;
  className?: string;
  /** Show a live character counter. */
  showCount?: boolean;
}

export function TextAreaField({
  label,
  value,
  onChange,
  placeholder,
  hint,
  error,
  required,
  optional,
  rows = 4,
  maxLength,
  disabled,
  className,
  showCount,
}: TextAreaFieldProps) {
  const hintId = useId();
  return (
    <Field
      label={label}
      hint={showCount && maxLength ? `${value.length} of ${maxLength} characters` : hint}
      error={error}
      required={required}
      optional={optional}
      className={className}
    >
      {({ id, describedBy, invalid }) => (
        <textarea
          id={id}
          rows={rows}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          maxLength={maxLength}
          disabled={disabled}
          aria-describedby={describedBy || (hint ? hintId : undefined)}
          aria-invalid={invalid}
          aria-required={required || undefined}
          className={`${CONTROL_BASE} resize-y leading-relaxed`}
        />
      )}
    </Field>
  );
}

/* ------------------------------------------------------------------ */

export interface SelectFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
  placeholder?: string;
  hint?: string;
  error?: string;
  required?: boolean;
  optional?: boolean;
  disabled?: boolean;
  className?: string;
}

export function SelectField({
  label,
  value,
  onChange,
  options,
  placeholder = "Select…",
  hint,
  error,
  required,
  optional,
  disabled,
  className,
}: SelectFieldProps) {
  return (
    <Field label={label} hint={hint} error={error} required={required} optional={optional} className={className}>
      {({ id, describedBy, invalid }) => (
        <div className="relative">
          <select
            id={id}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            aria-describedby={describedBy}
            aria-invalid={invalid}
            aria-required={required || undefined}
            className={`${CONTROL_BASE} appearance-none pr-10 cursor-pointer`}
          >
            <option value="">{placeholder}</option>
            {options.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <svg
            className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B] pointer-events-none"
            viewBox="0 0 20 20"
            fill="none"
            aria-hidden="true"
          >
            <path d="M6 8l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      )}
    </Field>
  );
}

/* ------------------------------------------------------------------ */

export interface CheckboxProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  hint?: string;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
}

export function Checkbox({ label, checked, onChange, hint, error, disabled, required, className }: CheckboxProps) {
  const id = useId();
  const hintId = `${id}-hint`;
  const errId = `${id}-err`;
  return (
    <div className={className}>
      <div className="flex items-start gap-3">
        <button
          type="button"
          id={id}
          role="checkbox"
          aria-checked={checked}
          aria-required={required || undefined}
          aria-describedby={describedBy(hint ? hintId : undefined, errId, error)}
          disabled={disabled}
          onClick={() => onChange(!checked)}
          className={`mt-0.5 w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4A35A] focus-visible:ring-offset-2 ${
            checked ? "bg-[#5C3A1E] border-[#5C3A1E] text-white" : "bg-white border-[#EADFCB] hover:border-[#D4A35A]"
          } disabled:opacity-50`}
        >
          {checked && <Check className="w-3.5 h-3.5" strokeWidth={3} aria-hidden="true" />}
        </button>
        <label htmlFor={id} className="text-sm text-[#0F172A] leading-snug cursor-pointer select-none">
          {label}
          {required && <span className="text-[#B42318] ml-0.5">*</span>}
        </label>
      </div>
      {hint && !error && (
        <span id={hintId} className="field-helper ml-8 block">
          {hint}
        </span>
      )}
      {error && (
        <span id={errId} className="field-error ml-8" role="alert">
          <AlertCircle className="w-3.5 h-3.5 mt-px shrink-0" aria-hidden="true" />
          {error}
        </span>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */

export interface SwitchProps {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
}

export function Switch({ label, description, checked, onChange, disabled, className }: SwitchProps) {
  const id = useId();
  return (
    <div className={`flex items-start justify-between gap-4 ${className ?? ""}`}>
      <div className="min-w-0">
        <label htmlFor={id} className="text-sm font-medium text-[#0F172A] cursor-pointer block">
          {label}
        </label>
        {description && <p className="text-xs text-[#64748B] mt-0.5 leading-relaxed">{description}</p>}
      </div>
      <button
        type="button"
        id={id}
        role="switch"
        aria-checked={checked}
        aria-label={label}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={`relative w-11 h-6 rounded-full shrink-0 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4A35A] focus-visible:ring-offset-2 ${
          checked ? "bg-[#5C3A1E]" : "bg-[#EADFCB]"
        } disabled:opacity-50`}
      >
        <span
          className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
            checked ? "translate-x-[22px]" : "translate-x-0.5"
          }`}
        />
      </button>
    </div>
  );
}

/* ------------------------------------------------------------------ */

/** Inline form-level error / success banner. */
export function FormAlert({
  tone = "error",
  title,
  message,
}: {
  tone?: "error" | "success" | "warning" | "info";
  title?: string;
  message: string;
}) {
  const toneClass =
    tone === "error"
      ? "bg-[#FEF2F2] border-[#FECACA] text-[#991B1B]"
      : tone === "success"
        ? "bg-[#F0FDF4] border-[#BBF7D0] text-[#166534]"
        : tone === "warning"
          ? "bg-[#FFFBEB] border-[#FDE68A] text-[#92400E]"
          : "bg-[#FFFDF9] border-[#EADFCB] text-[#5C3A1E]";

  return (
    <div role={tone === "error" ? "alert" : "status"} className={`rounded-xl border px-3.5 py-3 text-xs leading-relaxed ${toneClass}`}>
      {title && <p className="font-bold mb-0.5">{title}</p>}
      <p className="break-anywhere">{message}</p>
    </div>
  );
}

/** Button spinner used by every async submit. */
export function Spinner({ className }: { className?: string }) {
  return <Loader2 className={`w-4 h-4 animate-spin ${className ?? ""}`} aria-hidden="true" />;
}