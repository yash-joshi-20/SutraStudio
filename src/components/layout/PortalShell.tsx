"use client";

/**
 * SUTRA STUDIO — Portal Shell
 *
 * The single responsive frame used by the client workspace and the admin
 * terminal. It exists to make five specific bugs impossible:
 *
 *  1. Content hidden behind the fixed bottom navigation  → `pb-nav-safe`
 *  2. Content hidden behind the floating chat launcher  → `pr-launcher-safe`
 *  3. Keyboard-open clipping on mobile                  → dvh + kb-safe
 *  4. Notch / home-indicator overlap                   → env(safe-area-inset-*)
 *  5. Ultra-wide stretched layouts                     → capped measure
 *
 * Breakpoints:
 *   phone   < 768px   bottom navigation, drawers, bottom sheets
 *   tablet  768–1023  two-pane where `pane` is supplied, capped width
 *   desktop ≥ 1024px  persistent sidebar, no bottom navigation
 */

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronLeft, Menu, PanelLeftClose } from "lucide-react";
import { PortalSidebar } from "@/components/dashboard/PortalSidebar";
import { NavDrawer } from "@/components/layout/NavDrawer";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { NotificationBell } from "@/components/notifications/NotificationBell";

export interface PortalShellProps {
  variant: "client" | "admin";
  title: string;
  subtitle?: string;
  /** Primary action rendered on the right of the header (button or link). */
  action?: React.ReactNode;
  /** Extra tabs rendered under the header. */
  tabs?: React.ReactNode;
  children: React.ReactNode;
  /** Optional secondary column for the two-pane tablet layout. */
  pane?: React.ReactNode;
  /** Show the back-to-link bar (used by detail screens). */
  backTo?: { href: string; label: string };
  /** Hide the notification bell (used on focused full-screen flows). */
  hideBell?: boolean;
}

export function PortalShell({
  variant,
  title,
  subtitle,
  action,
  tabs,
  children,
  pane,
  backTo,
  hideBell,
}: PortalShellProps) {
  const pathname = usePathname();
  const isAdmin = variant === "admin";

  return (
    <div className="min-h-dvh flex flex-col bg-[var(--background)]">
      <div className="flex flex-1 min-h-0 w-full">
        {/* ---------------- Desktop sidebar (≥1024px) ---------------- */}
        <div className="hidden lg:block w-[264px] xl:w-[280px] shrink-0 border-r border-[#EADFCB] bg-[#FFFDF9] sticky top-0 h-dvh overflow-y-auto">
          <PortalSidebar contained />
        </div>

        {/* ---------------- Main column ---------------- */}
        <div className="flex-1 min-w-0 flex flex-col">
          {/* Header */}
          <header className="sticky top-0 z-[var(--z-dropdown)] bg-[#FFFDF9]/92 backdrop-blur-md border-b border-[#EADFCB] pt-safe">
            <div className="app-container-cap px-4 sm:px-6 lg:px-8">
              <div className="flex items-start gap-3 py-4 sm:py-5">
                {/* Mobile: sidebar trigger */}
                <button
                  type="button"
                  onClick={() => window.dispatchEvent(new CustomEvent("sutra:toggle-drawer"))}
                  className="lg:hidden shrink-0 w-11 h-11 -ml-1 rounded-xl text-[#5C3A1E] hover:bg-[#F4EFE6] flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4A35A]"
                  aria-label={`Open ${isAdmin ? "admin" : "workspace"} navigation`}
                >
                  <Menu className="w-5 h-5" aria-hidden="true" />
                </button>

                <div className="flex-1 min-w-0">
                  {backTo && (
                    <Link
                      href={backTo.href}
                      className="inline-flex items-center gap-1 text-[11px] font-medium text-[#64748B] hover:text-[#5C3A1E] mb-1.5 min-h-[28px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4A35A] rounded"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" aria-hidden="true" />
                      {backTo.label}
                    </Link>
                  )}
                  <h1 className="text-lg sm:text-xl font-semibold text-[#0F172A] leading-tight break-anywhere">
                    {title}
                  </h1>
                  {subtitle && (
                    <p className="text-xs text-[#64748B] mt-1 leading-relaxed break-anywhere">{subtitle}</p>
                  )}
                </div>

                {/* Right-hand cluster */}
                <div className="shrink-0 flex items-center gap-1.5 sm:gap-2">
                  {action}
                  {!hideBell && <NotificationBell />}
                </div>
              </div>

              {tabs && (
                <div className="pb-2 -mx-1 px-1 overflow-x-auto no-scrollbar">
                  <div className="flex items-center gap-1.5 min-w-max">{tabs}</div>
                </div>
              )}
            </div>
          </header>

          {/* Two-pane tablet layout when supplied */}
          <div className="flex-1 min-h-0 flex flex-col lg:flex-row">
            <main
              id="main-content"
              className="flex-1 min-w-0 app-container-cap w-full px-4 sm:px-6 lg:px-8 py-5 sm:py-7 pb-nav-safe pr-launcher-safe sm:pr-0"
            >
              {children}
            </main>

            {pane && (
              <aside className="w-full lg:w-[340px] xl:w-[380px] shrink-0 border-t lg:border-t-0 lg:border-l border-[#EADFCB] bg-[#FFFDF9]/60 p-4 sm:p-6 pb-nav-safe">
                {pane}
              </aside>
            )}
          </div>
        </div>
      </div>

      {/* Phone-only chrome */}
      <NavDrawer variant={variant} />
      <MobileBottomNav />
    </div>
  );
}

/* ------------------------------------------------------------------ */

/** Tab strip item shared by client and admin portals. */
export function ShellTab({
  active,
  onClick,
  children,
  count,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  count?: number;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={active ? "page" : undefined}
      className={`min-h-[40px] px-3.5 rounded-xl text-sm font-medium whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4A35A] inline-flex items-center gap-1.5 ${
        active
          ? "bg-[#5C3A1E] text-white"
          : "bg-[#F8F5EF] text-[#5C3A1E] border border-[#EADFCB] hover:bg-[#F4EFE6]"
      }`}
    >
      {children}
      {count !== undefined && (
        <span
          className={`inline-flex items-center justify-center min-w-[20px] h-5 px-1 rounded-full text-[10px] font-bold ${
            active ? "bg-white/20 text-white" : "bg-[#EADFCB] text-[#5C3A1E]"
          }`}
        >
          {count}
        </span>
      )}
    </button>
  );
}

/* ------------------------------------------------------------------ */

/** Standard section card. One padding rhythm everywhere. */
export function ShellCard({
  title,
  description,
  action,
  children,
  className,
  padded = true,
}: {
  title?: string;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  padded?: boolean;
}) {
  return (
    <section className={`rounded-2xl border border-[#EADFCB] bg-[#FFFDF9] ${className ?? ""}`}>
      {(title || action) && (
        <div className="flex items-start justify-between gap-3 px-4 sm:px-5 py-3.5 border-b border-[#EADFCB]/70">
          <div className="min-w-0">
            {title && <h2 className="font-semibold text-[#0F172A] text-sm sm:text-base break-anywhere">{title}</h2>}
            {description && <p className="text-xs text-[#64748B] mt-0.5 break-anywhere">{description}</p>}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}
      <div className={padded ? "p-4 sm:p-5" : ""}>{children}</div>
    </section>
  );
}

/* ------------------------------------------------------------------ */

/** Collapsible section used on dense detail screens. */
export function ShellDisclosure({
  title,
  children,
  defaultOpen = false,
  badge,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  badge?: React.ReactNode;
}) {
  return (
    <details open={defaultOpen} className="group rounded-2xl border border-[#EADFCB] bg-[#FFFDF9] overflow-hidden">
      <summary className="flex items-center justify-between gap-3 px-4 sm:px-5 py-3.5 cursor-pointer list-none hover:bg-[#FDF9F0] min-h-[48px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#D4A35A]">
        <span className="font-semibold text-[#0F172A] text-sm break-anywhere">{title}</span>
        <span className="flex items-center gap-2 shrink-0">
          {badge}
          <PanelLeftClose className="w-4 h-4 text-[#94A3B8] transition-transform group-open:rotate-180" aria-hidden="true" />
        </span>
      </summary>
      <div className="px-4 sm:px-5 pb-4 pt-1 border-t border-[#EADFCB]/60">{children}</div>
    </details>
  );
}