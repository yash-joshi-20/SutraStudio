"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SutraLogo } from "@/components/brand/SutraLogo";
import {
  LayoutDashboard,
  ShoppingBag,
  FolderGit2,
  FolderOpen,
  Bot,
  FileText,
  User,
  ShieldCheck,
  LogOut,
} from "lucide-react";

const SIDEBAR_ITEMS = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "My Orders", href: "/orders", icon: ShoppingBag },
  { name: "My Projects", href: "/projects-client", icon: FolderGit2 },
  { name: "Media Library", href: "/media", icon: FolderOpen },
  { name: "AI Chat", href: "/chat", icon: Bot },
  { name: "Invoices", href: "/invoices", icon: FileText },
  { name: "Profile", href: "/profile", icon: User },
  { name: "Admin Hub", href: "/admin", icon: ShieldCheck },
];

export function PortalSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 shrink-0 border-r border-[#EADFCB] bg-[#FFFDF9] min-h-screen p-6 flex flex-col justify-between hidden md:flex">
      <div>
        {/* Brand Header */}
        <div className="pb-8 border-b border-[#EADFCB]/60">
          <SutraLogo variant="horizontal" size="sm" href="/" />
        </div>

        {/* Navigation Items */}
        <nav className="mt-6 space-y-1.5">
          {SIDEBAR_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
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
          <div className="w-8 h-8 rounded-full bg-[#5C3A1E] text-white flex items-center justify-center text-xs font-semibold">
            Y
          </div>
          <div className="text-xs">
            <p className="font-semibold text-[#0F172A]">Yash Joshi</p>
            <p className="text-[#64748B]">Client Workspace</p>
          </div>
        </div>
        <Link href="/login" className="text-[#64748B] hover:text-[#5C3A1E]">
          <LogOut className="w-4 h-4" />
        </Link>
      </div>
    </aside>
  );
}
