"use client";

/**
 * SUTRA STUDIO — Shared Async & Empty States
 *
 * Every data surface in the product renders one of these four states instead of
 * a blank region, an infinite spinner, or an unhandled rejection.
 *
 * The `NotConfigured` state is deliberate and load-bearing: when an integration
 * key is missing the UI says so plainly. It never renders placeholder data that
 * could be mistaken for real results.
 */

import React from "react";
import {
  Loader2,
  Inbox,
  TriangleAlert,
  PlugZap,
  RefreshCw,
  SearchX,
} from "lucide-react";

/* ------------------------------------------------------------------ */

export function LoadingState({
  label = "Loading…",
  rows = 3,
  className,
}: {
  label?: string;
  rows?: number;
  className?: string;
}) {
  return (
    <div className={`py-8 ${className ?? ""}`} role="status" aria-live="polite" aria-busy="true">
      <div className="flex items-center justify-center gap-2.5 text-[#64748B] text-sm mb-5">
        <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
        <span>{label}</span>
      </div>
      <div className="space-y-2.5 max-w-md mx-auto" aria-hidden="true">
        {Array.from({ length: rows }).map((_, i) => (
          <div
            key={i}
            className="h-14 rounded-2xl border border-[#EADFCB] bg-[#FFFDF9] overflow-hidden relative"
          >
            <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.6s_infinite] bg-gradient-to-r from-transparent via-[#F8F5EF] to-transparent" />
          </div>
        ))}
      </div>
      <style>{`@keyframes shimmer{100%{transform:translateX(100%)}}`}</style>
    </div>
  );
}

/* ------------------------------------------------------------------ */

export function EmptyState({
  title,
  description,
  icon,
  action,
  compact,
}: {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  compact?: boolean;
}) {
  return (
    <div
      className={`text-center ${compact ? "py-8 px-4" : "py-14 px-5"}`}
      role="status"
    >
      <div className="w-14 h-14 rounded-2xl bg-[#F8F5EF] border border-[#EADFCB] flex items-center justify-center mx-auto text-[#A98B57]">
        {icon ?? <Inbox className="w-6 h-6" aria-hidden="true" />}
      </div>
      <h3 className="font-semibold text-[#0F172A] mt-4 text-base">{title}</h3>
      {description && (
        <p className="text-sm text-[#64748B] mt-1.5 max-w-sm mx-auto leading-relaxed break-anywhere">
          {description}
        </p>
      )}
      {action && <div className="mt-5 flex justify-center gap-2.5 flex-wrap">{action}</div>}
    </div>
  );
}

/* ------------------------------------------------------------------ */

export function ErrorState({
  title = "Something went wrong",
  message,
  onRetry,
  retryLabel = "Try again",
}: {
  title?: string;
  message?: string;
  onRetry?: () => void;
  retryLabel?: string;
}) {
  return (
    <div
      className="text-center py-12 px-5"
      role="alert"
    >
      <div className="w-14 h-14 rounded-2xl bg-[#FEF2F2] border border-[#FECACA] flex items-center justify-center mx-auto text-[#B42318]">
        <TriangleAlert className="w-6 h-6" aria-hidden="true" />
      </div>
      <h3 className="font-semibold text-[#0F172A] mt-4 text-base">{title}</h3>
      <p className="text-sm text-[#64748B] mt-1.5 max-w-sm mx-auto leading-relaxed break-anywhere">
        {message ?? "We could not load this just now. Please try again in a moment."}
      </p>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-5 inline-flex items-center gap-2 min-h-[44px] px-5 rounded-xl bg-[#5C3A1E] text-white text-sm font-semibold hover:bg-[#4A2E17] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4A35A] focus-visible:ring-offset-2"
        >
          <RefreshCw className="w-4 h-4" aria-hidden="true" />
          {retryLabel}
        </button>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */

export function SearchEmptyState({ query }: { query: string }) {
  return (
    <EmptyState
      icon={<SearchX className="w-6 h-6" aria-hidden="true" />}
      title="No matches"
      description={
        query
          ? `Nothing matched “${query}”. Try a shorter or different search term.`
          : "Try a different search term."
      }
    />
  );
}

/* ------------------------------------------------------------------ */

/**
 * The honest state for a missing integration key.
 *
 * Shown in both portals and in the admin Integrations screen. It names the
 * missing ENV KEYS (never values) so whoever operates the deployment knows
 * exactly what to add.
 */
export function NotConfiguredState({
  integration,
  missingKeys = [],
  steps = [],
  compact,
}: {
  integration: string;
  missingKeys?: string[];
  steps?: string[];
  compact?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border border-[#FDE68A] bg-[#FFFBEB] ${compact ? "p-4" : "p-6"}`}
      role="status"
    >
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-[#FEF3C7] border border-[#FDE68A] flex items-center justify-center text-[#92400E] shrink-0">
          <PlugZap className="w-5 h-5" aria-hidden="true" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-semibold text-[#92400E] text-sm">{integration}</h3>
            <span className="inline-flex items-center rounded-full border border-[#FDE68A] bg-[#FEF3C7] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#92400E]">
              Not configured
            </span>
          </div>

          <p className="text-xs text-[#92400E]/90 mt-1.5 leading-relaxed">
            This feature stays switched off until the environment keys below are set. No placeholder or
            sample data is shown in the meantime.
          </p>

          {missingKeys.length > 0 && (
            <div className="mt-3">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-[#92400E]/80">
                Missing keys
              </p>
              <ul className="mt-1.5 flex flex-wrap gap-1.5">
                {missingKeys.map((k) => (
                  <li
                    key={k}
                    className="font-mono text-[11px] px-2 py-1 rounded-md bg-white/70 border border-[#FDE68A] text-[#92400E] break-anywhere"
                  >
                    {k}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {steps.length > 0 && (
            <ol className="mt-3.5 space-y-1.5 list-decimal list-inside text-xs text-[#92400E]/90 leading-relaxed">
              {steps.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ol>
          )}
        </div>
      </div>
    </div>
  );
}