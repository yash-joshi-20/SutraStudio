"use client";

/**
 * SUTRA STUDIO — Navigation Drawer (phone / tablet)
 *
 * Reuses the SAME `CLIENT_NAV_ITEMS` / `ADMIN_NAV_ITEMS` arrays as the desktop
 * sidebar, so the phone drawer and the desktop sidebar can never drift apart.
 *
 * Listens for the `sutra:toggle-drawer` event dispatched by PortalShell.
 * Escape closes it, the backdrop closes it, and body scroll is locked while
 * it is open so the page behind cannot move.
 */

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { X, LogOut, ShieldCheck, User as UserIcon } from "lucide-react";
import { SutraLogo } from "@/components/brand/SutraLogo";
import { Avatar } from "@/components/ui/Avatar";
import {
  CLIENT_NAV_ITEMS,
  ADMIN_NAV_ITEMS,
} from "@/components/dashboard/PortalSidebar";
import { useAuth } from "@/lib/auth/authContext";

export function NavDrawer({ variant }: { variant: "client" | "admin" }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user, role, logout } = useAuth();

  const isAdmin = variant === "admin" || role === "admin";
  const navItems = isAdmin ? ADMIN_NAV_ITEMS : CLIENT_NAV_ITEMS;
  const currentTab = searchParams ? searchParams.get("tab") || "overview" : "overview";

  useEffect(() => {
    const openDrawer = () => setOpen(true);
    window.addEventListener("sutra:toggle-drawer", openDrawer);
    return () => window.removeEventListener("sutra:toggle-drawer", openDrawer);
  }, []);

  // Close on navigation.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Escape to close + lock background scroll.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="lg:hidden fixed inset-0 z-[var(--z-drawer)]" role="dialog" aria-modal="true" aria-label="Navigation">
      <div
        className="absolute inset-0 bg-[#0F172A]/45 backdrop-blur-sm"
        onClick={() => setOpen(false)}
        aria-hidden="true"
      />

      <nav
        className="absolute inset-y-0 left-0 w-[min(320px,86vw)] bg-[var(--surface)] border-r border-[#EADFCB] flex flex-col shadow-2xl pl-safe"
        style={{ animation: "sutra-drawer-in 220ms cubic-bezier(0.16,1,0.3,1)" }}
      >
        <div className="flex items-center justify-between gap-3 px-4 py-4 border-b border-[#EADFCB] shrink-0">
          <SutraLogo variant="horizontal" size="sm" href={isAdmin ? "/admin" : "/dashboard"} />
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="w-11 h-11 -mr-1 rounded-xl text-[#64748B] hover:text-[#0F172A] hover:bg-[#F8F5EF] flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4A35A]"
            aria-label="Close navigation"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {isAdmin && (
          <div className="mx-4 mt-3 px-3 py-2.5 rounded-xl bg-[#171717] text-white flex items-center justify-between shrink-0">
            <div>
              <span className="text-[10px] text-[#A98B57] block uppercase font-mono font-semibold">
                Executive Terminal
              </span>
              <span className="font-bold text-white uppercase text-xs">Supervisor Mode</span>
            </div>
            <span className="w-2 h-2 rounded-full bg-[#2E7D4F]" aria-hidden="true" />
          </div>
        )}

        <div className="flex-1 overflow-y-auto overscroll-contain py-3">
          <ul className="space-y-1 px-3">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = isAdmin
                ? pathname === "/admin" && currentTab === (item.tabKey || "overview")
                : pathname === item.href || pathname.startsWith(`${item.href}/`);

              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    onClick={() => setOpen(false)}
                    aria-current={isActive ? "page" : undefined}
                    className={`flex items-center gap-3 min-h-[48px] px-3 rounded-xl text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4A35A] ${
                      isActive
                        ? "bg-[#5C3A1E] text-white"
                        : "text-[#5C3A1E] hover:bg-[#F4EFE6]"
                    }`}
                  >
                    <Icon className="w-[18px] h-[18px] shrink-0" aria-hidden="true" />
                    <span className="truncate">{item.name}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="shrink-0 border-t border-[#EADFCB] p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))] space-y-1">
          <div className="flex items-center gap-3 px-2 py-2 min-w-0">
            <Avatar name={user?.displayName || (isAdmin ? "Admin" : "Client")} size="sm" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-[#0F172A] truncate">
                {user?.displayName || (isAdmin ? "Administrator" : "Client")}
              </p>
              <p className="text-[11px] text-[#64748B] truncate">{user?.email}</p>
            </div>
          </div>

          <Link
            href="/profile"
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 min-h-[44px] px-3 rounded-xl text-sm text-[#5C3A1E] hover:bg-[#F4EFE6] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4A35A]"
          >
            <UserIcon className="w-[18px] h-[18px]" aria-hidden="true" />
            Profile & Settings
          </Link>

          {isAdmin && (
            <Link
              href="/admin"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 min-h-[44px] px-3 rounded-xl text-sm text-[#5C3A1E] hover:bg-[#F4EFE6] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4A35A]"
            >
              <ShieldCheck className="w-[18px] h-[18px]" aria-hidden="true" />
              Executive Terminal
            </Link>
          )}

          <button
            type="button"
            onClick={() => {
              setOpen(false);
              void logout();
            }}
            className="w-full flex items-center gap-3 min-h-[44px] px-3 rounded-xl text-sm text-[#B42318] hover:bg-[#FEF2F2] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B42318]"
          >
            <LogOut className="w-[18px] h-[18px]" aria-hidden="true" />
            Sign out
          </button>
        </div>
      </nav>

      <style>{`@keyframes sutra-drawer-in{from{transform:translateX(-100%)}to{transform:translateX(0)}}`}</style>
    </div>
  );
}