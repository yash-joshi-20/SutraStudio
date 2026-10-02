"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Sparkles,
  Smartphone,
  Mail,
  User,
  LayoutDashboard,
  ShoppingBag,
  FolderOpen,
  FileText,
  MessageSquare,
  ShieldCheck,
  Users,
  CheckCircle,
  GitBranch,
} from "lucide-react";
import { useAuth } from "@/lib/auth/authContext";

export function MobileBottomNav() {
  const pathname = usePathname();
  const { role, user } = useAuth();
  const isAuthenticated = !!user;
  const isAdmin = role === "admin";
  const isClient = role === "client";

  // Hide bottom nav on full-screen active call interfaces if explicitly configured
  const isDedicatedCall = pathname === "/ai-agent" && typeof window !== "undefined" && window.location.search.includes("call=active");

  if (isDedicatedCall) {
    return null;
  }

  // 4-5 curated distinct main navigation tabs based on user role
  const tabs = isAdmin
    ? [
        { name: "Command", href: "/admin", icon: ShieldCheck },
        { name: "Clients", href: "/admin?tab=clients", icon: Users },
        { name: "Approvals", href: "/admin?tab=approvals", icon: CheckCircle },
        { name: "Pipelines", href: "/admin?tab=workflows", icon: GitBranch },
        { name: "Profile", href: "/profile", icon: User },
      ]
    : isClient
    ? [
        { name: "Workspace", href: "/dashboard", icon: LayoutDashboard },
        { name: "Orders", href: "/orders", icon: ShoppingBag },
        { name: "Vault", href: "/media", icon: FolderOpen },
        { name: "Billing", href: "/invoices", icon: FileText },
        { name: "Profile", href: "/profile", icon: User },
      ]
    : [
        { name: "Home", href: "/", icon: Home },
        { name: "Services", href: "/services", icon: Sparkles },
        { name: "Mobile App", href: "/mobile-app", icon: Smartphone },
        { name: "Contact", href: "/contact", icon: Mail },
        { name: "Sign In", href: "/login", icon: User },
      ];

  return (
    <nav
      aria-label="Mobile app bottom navigation"
      className="fixed bottom-0 inset-x-0 z-40 bg-[#FFFDF9]/95 backdrop-blur-md border-t border-[#EADFCB] px-2 pt-1 pb-[calc(0.5rem+env(safe-area-inset-bottom,0px))] flex items-center justify-around md:hidden shadow-lg"
    >
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive =
          tab.href === "/"
            ? pathname === "/"
            : tab.href.includes("?tab=")
            ? pathname === "/admin" && typeof window !== "undefined" && window.location.search.includes(tab.href.split("?tab=")[1])
            : pathname.startsWith(tab.href);

        return (
          <Link
            key={tab.name}
            href={tab.href}
            className={`flex flex-col items-center justify-center py-1.5 px-2.5 rounded-xl transition-all min-h-[44px] min-w-[54px] touch-target ${
              isActive
                ? "text-[#5C3A1E] font-semibold bg-[#F4EFE6]"
                : "text-[#64748B] hover:text-[#0F172A]"
            }`}
          >
            <Icon
              className={`w-5 h-5 ${
                isActive ? "text-[#5C3A1E] stroke-[2.2]" : "text-[#64748B]"
              }`}
            />
            <span className="text-[10px] mt-0.5 font-medium leading-none">{tab.name}</span>
          </Link>
        );
      })}
    </nav>
  );
}
