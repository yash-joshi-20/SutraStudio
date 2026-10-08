"use client";

/**
 * SUTRA STUDIO — Status Badge & Progress Primitives
 *
 * One status vocabulary shared by the client portal, the admin portal and the
 * order timeline, so "in production" always looks the same everywhere.
 */

import React from "react";
import { Loader2, CheckCircle2, Clock, AlertCircle, XCircle, PauseCircle, Send } from "lucide-react";

export type StatusTone =
  | "neutral"
  | "progress"
  | "review"
  | "completed"
  | "pending"
  | "error"
  | "paused";

const TONE: Record<StatusTone, { chip: string; dot: string }> = {
  neutral: { chip: "bg-[#F4EFE6] text-[#64748B] border-[#EADFCB]", dot: "bg-[#94A3B8]" },
  progress: { chip: "bg-[#FDF9F0] text-[#B45309] border-[#FDE68A]", dot: "bg-[#C2761A]" },
  review: { chip: "bg-[#EFF6FF] text-[#3B6FB6] border-[#BFDBFE]", dot: "bg-[#3B6FB6]" },
  completed: { chip: "bg-[#F0FDF4] text-[#2E7D4F] border-[#BBF7D0]", dot: "bg-[#2E7D4F]" },
  pending: { chip: "bg-[#FFFBEB] text-[#B45309] border-[#FDE68A]", dot: "bg-[#D97706]" },
  error: { chip: "bg-[#FEF2F2] text-[#B42318] border-[#FECACA]", dot: "bg-[#B42318]" },
  paused: { chip: "bg-[#F4F1EA] text-[#5C3A1E] border-[#DED5C4]", dot: "bg-[#5C3A1E]" },
};

const ICONS = {
  neutral: Clock,
  progress: Loader2,
  review: Send,
  completed: CheckCircle2,
  pending: Clock,
  error: XCircle,
  paused: PauseCircle,
} as const;

/** Canonical label + tone for every order/subscription status in the product. */
const STATUS_MAP: Record<string, { label: string; tone: StatusTone }> = {
  // order lifecycle
  draft: { label: "Draft", tone: "neutral" },
  pending_payment: { label: "Awaiting payment", tone: "pending" },
  paid: { label: "Payment received", tone: "completed" },
  queued: { label: "Queued", tone: "neutral" },
  ai_processing: { label: "Studio in production", tone: "progress" },
  draft_ready: { label: "Ready for review", tone: "review" },
  in_review: { label: "In review", tone: "review" },
  revision_requested: { label: "Revision requested", tone: "pending" },
  approved: { label: "Approved", tone: "completed" },
  delivering: { label: "Delivering", tone: "progress" },
  delivered: { label: "Delivered", tone: "completed" },
  completed: { label: "Completed", tone: "completed" },
  cancelled: { label: "Cancelled", tone: "neutral" },
  failed: { label: "Failed", tone: "error" },
  expired: { label: "Expired", tone: "paused" },
  paused: { label: "Paused", tone: "paused" },
  // subscription
  trialing: { label: "Free trial", tone: "progress" },
  active: { label: "Active", tone: "completed" },
  past_due: { label: "Payment overdue", tone: "error" },
  closed: { label: "Closed", tone: "paused" },
  // payment
  paid_succeeded: { label: "Paid", tone: "completed" },
  paid_failed: { label: "Payment failed", tone: "error" },
  refunded: { label: "Refunded", tone: "neutral" },
};

export function resolveStatus(status: string | undefined | null): {
  label: string;
  tone: StatusTone;
} {
  if (!status) return { label: "Unknown", tone: "neutral" };
  const key = String(status).toLowerCase();
  return STATUS_MAP[key] ?? { label: humanise(key), tone: "neutral" };
}

function humanise(value: string) {
  return value
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim();
}

export function StatusBadge({
  status,
  label,
  tone,
  size = "md",
  className,
}: {
  status?: string;
  label?: string;
  tone?: StatusTone;
  size?: "sm" | "md";
  className?: string;
}) {
  const resolved = resolveStatus(status);
  const finalTone = tone ?? resolved.tone;
  const finalLabel = label ?? resolved.label;
  const Icon = ICONS[finalTone];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border font-semibold whitespace-nowrap ${
        TONE[finalTone].chip
      } ${size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-[11px]"} ${className ?? ""}`}
    >
      <Icon
        className={`${size === "sm" ? "w-2.5 h-2.5" : "w-3 h-3"} shrink-0 ${
          finalTone === "progress" ? "animate-spin" : ""
        }`}
        aria-hidden="true"
      />
      {finalLabel}
    </span>
  );
}

/* ------------------------------------------------------------------ */

export function ProgressBar({
  value,
  label,
  showValue = true,
  tone = "saffron",
  size = "md",
  className,
}: {
  /** 0–100. Clamped. Non-finite values render as 0, never NaN. */
  value: number;
  label?: string;
  showValue?: boolean;
  tone?: "saffron" | "brown" | "green";
  size?: "sm" | "md";
  className?: string;
}) {
  const safe = Number.isFinite(value) ? Math.max(0, Math.min(100, Math.round(value))) : 0;
  const fill =
    tone === "green" ? "bg-[#2E7D4F]" : tone === "brown" ? "bg-[#5C3A1E]" : "bg-[#C2761A]";

  return (
    <div className={className}>
      {(label || showValue) && (
        <div className="flex items-center justify-between gap-3 mb-1.5">
          {label && <span className="text-xs text-[#64748B] truncate">{label}</span>}
          {showValue && (
            <span className="text-xs font-semibold text-[#5C3A1E] tabular-nums shrink-0">{safe}%</span>
          )}
        </div>
      )}
      <div
        role="progressbar"
        aria-valuenow={safe}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label ?? "Progress"}
        className={`w-full rounded-full bg-[#F4EFE6] overflow-hidden ${
          size === "sm" ? "h-1.5" : "h-2"
        }`}
      >
        <div
          className={`h-full rounded-full ${fill} transition-[width] duration-500 ease-out`}
          style={{ width: `${safe}%` }}
        />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */

/** Small labelled number used across dashboards. */
export function StatTile({
  label,
  value,
  hint,
  tone = "neutral",
  className,
}: {
  label: string;
  value: string | number;
  hint?: string;
  tone?: "neutral" | "good" | "warn" | "bad";
  className?: string;
}) {
  const accent =
    tone === "good"
      ? "text-[#2E7D4F]"
      : tone === "warn"
        ? "text-[#B45309]"
        : tone === "bad"
          ? "text-[#B42318]"
          : "text-[#5C3A1E]";

  return (
    <div className={`rounded-2xl border border-[#EADFCB] bg-[#FFFDF9] p-4 ${className ?? ""}`}>
      <p className="text-[11px] uppercase tracking-wider text-[#64748B] font-semibold break-anywhere">{label}</p>
      <p className={`text-2xl font-semibold mt-1 tabular-nums break-anywhere ${accent}`}>{value}</p>
      {hint && <p className="text-[11px] text-[#94A3B8] mt-1 break-anywhere">{hint}</p>}
    </div>
  );
}

/* ------------------------------------------------------------------ */

/** Formats an ISO date, or an explicit em dash when absent/invalid. Never "Invalid Date". */
export function formatDate(iso: string | undefined | null, opts?: Intl.DateTimeFormatOptions): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-IN", opts ?? { day: "2-digit", month: "short", year: "numeric" });
}

export function formatDateTime(iso: string | undefined | null): string {
  return formatDate(iso, { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

/** Currency display with the ₹ symbol, server-agnostic. */
export function formatINR(paiseOrRupees: number | undefined | null, opts?: { fromPaise?: boolean }): string {
  if (paiseOrRupees === undefined || paiseOrRupees === null || !Number.isFinite(paiseOrRupees)) return "—";
  const rupees = opts?.fromPaise ? paiseOrRupees / 100 : paiseOrRupees;
  return `₹${rupees.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
}