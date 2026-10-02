"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ShoppingBag, Bot, FolderGit2, LayoutDashboard, ShieldCheck } from "lucide-react";
import { useAuth } from "@/lib/auth/authContext";

export function MobileBottomNav() {
  const pathname = usePathname();
  const { role, isAuthenticated } = useAuth();
  const isAdmin = role === "admin";

  const tabs = isAdmin
    ? [
        { name: "Admin", href: "/admin", icon: ShieldCheck },
        { name: "Approvals", href: "/admin?tab=approvals", icon: ShoppingBag },
        { name: "Chat", href: "/admin?tab=conversations", icon: Bot },
        { name: "Clients", href: "/admin?tab=clients", icon: FolderGit2 },
      ]
    : [
        { name: "Home", href: "/", icon: Home },
        { name: "Workspace", href: "/dashboard", icon: LayoutDashboard },
        { name: "Orders", href: "/orders", icon: ShoppingBag },
        { name: "AI Chat", href: "/chat", icon: Bot },
      ];

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 bg-[#FFFDF9]/95 backdrop-blur-md border-t border-[#EADFCB] py-2 px-3 flex items-center justify-around md:hidden shadow-lg">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = pathname === tab.href;
        return (
          <Link
            key={tab.name}
            href={tab.href}
            className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all ${
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
            <span className="text-[10px] mt-0.5 font-medium">{tab.name}</span>
          </Link>
        );
      })}
    </nav>
  );
}
