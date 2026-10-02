"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { SutraLogo } from "@/components/brand/SutraLogo";
import {
  LayoutDashboard,
  ShoppingBag,
  FolderGit2,
  FolderOpen,
  FileText,
  User,
  ShieldCheck,
  LogOut,
  Sparkles,
  DollarSign,
} from "lucide-react";

import { useAuth } from "@/lib/auth/authContext";
import { Avatar } from "@/components/ui/Avatar";

const CLIENT_NAV_ITEMS = [
  { name: "Workspace", href: "/dashboard", icon: LayoutDashboard },
  { name: "Sutra AI Assistant", href: "/chat", icon: Sparkles },
  { name: "Services", href: "/services", icon: Sparkles },
  { name: "Pricing & Plans", href: "/pricing", icon: DollarSign },
  { name: "My Orders", href: "/orders", icon: ShoppingBag },
  { name: "My Projects", href: "/projects-client", icon: FolderGit2 },
  { name: "Media Vault", href: "/media", icon: FolderOpen },
  { name: "Invoices", href: "/invoices", icon: FileText },
  { name: "Profile", href: "/profile", icon: User },
];

const ADMIN_NAV_ITEMS = [
  { name: "Operations Hub", href: "/admin", icon: ShieldCheck },
  { name: "Client Directory", href: "/admin?tab=clients", icon: LayoutDashboard },
  { name: "Approvals Hub", href: "/admin?tab=approvals", icon: ShoppingBag },
  { name: "Creative Pipelines", href: "/admin?tab=workflows", icon: FolderGit2 },
  { name: "Services Catalog", href: "/services", icon: Sparkles },
  { name: "Pricing Matrix", href: "/pricing", icon: DollarSign },
  { name: "Website Site Control", href: "/admin?tab=site-control", icon: FileText },
  { name: "Security Audit", href: "/admin?tab=audit", icon: User },
];

export function PortalSidebar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentTab = searchParams.get("tab") || "overview";
  const { user, role, logout } = useAuth();
  const isAdmin = role === "admin";
  const navItems = isAdmin ? ADMIN_NAV_ITEMS : CLIENT_NAV_ITEMS;

  return (
    <aside className="w-64 shrink-0 border-r border-[#EADFCB] bg-[#FFFDF9] min-h-screen p-6 flex flex-col justify-between hidden md:flex">
      <div>
        {/* Brand Header */}
        <div className="pb-6 border-b border-[#EADFCB]/60 flex items-center justify-between">
          <SutraLogo variant="horizontal" size="md" href={isAdmin ? "/admin" : "/dashboard"} />
        </div>

        {/* Portal Scope Indicator (Admin Only) */}
        {isAdmin && (
          <div className="mt-4 p-2.5 rounded-xl bg-[#5C3A1E] text-white flex items-center justify-between text-xs shadow-xs">
            <div>
              <span className="text-[10px] text-[#D4A35A] block uppercase tracking-wider font-semibold">Executive Terminal</span>
              <span className="font-bold text-white uppercase">Supervisor Mode</span>
            </div>
            <span className="w-2 h-2 rounded-full bg-[#2E7D4F] animate-pulse" />
          </div>
        )}

        {/* Navigation Items */}
        <nav className="mt-6 space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            let isActive = false;
            if (isAdmin) {
              const itemTab = item.href.includes("?tab=")
                ? item.href.split("?tab=")[1]
                : "overview";
              isActive = pathname === "/admin" && currentTab === itemTab;
            } else {
              isActive = pathname === item.href;
            }
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`interactive-pill focus-ring flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? "bg-[#F8F5EF] text-[#5C3A1E] font-semibold shadow-xs border border-[#EADFCB]"
                    : "text-[#475569] hover:bg-[#F8F5EF]/60 hover:text-[#0F172A]"
                }`}
              >
                <Icon
                  className={`w-4 h-4 ${
                    isActive ? "text-[#5C3A1E]" : "text-[#64748B]"
                  }`}
                />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer / Account */}
      <div className="pt-6 border-t border-[#EADFCB]/60 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Avatar
            name={user?.displayName || (isAdmin ? "Studio Producer" : "Studio Client")}
            size="sm"
            status="online"
          />
          <div className="text-xs">
            <p className="font-semibold text-[#0F172A]">{user?.displayName || (isAdmin ? "Studio Producer" : "Studio Client")}</p>
            <p className="text-[#64748B]">{isAdmin ? "Executive Producer" : "Client Workspace"}</p>
          </div>
        </div>
        <button
          onClick={logout}
          title="Sign Out"
          className="text-[#64748B] hover:text-[#5C3A1E] p-1.5 rounded-lg hover:bg-[#F8F5EF] cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
}
