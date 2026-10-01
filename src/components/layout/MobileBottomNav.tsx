"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ShoppingBag, Bot, FolderGit2, Menu } from "lucide-react";

const MOBILE_TABS = [
  { name: "Home", href: "/", icon: Home },
  { name: "Orders", href: "/orders", icon: ShoppingBag },
  { name: "AI Chat", href: "/chat", icon: Bot },
  { name: "Projects", href: "/projects", icon: FolderGit2 },
  { name: "More", href: "/dashboard", icon: Menu },
];

export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 bg-[#FFFDF9]/95 backdrop-blur-md border-t border-[#EADFCB] py-2 px-4 flex items-center justify-around md:hidden">
      {MOBILE_TABS.map((tab) => {
        const Icon = tab.icon;
        const isActive = pathname === tab.href;
        return (
          <Link
            key={tab.name}
            href={tab.href}
            className={`interactive-pill flex flex-col items-center justify-center py-1 px-3 transition-colors ${
              isActive ? "text-[#5C3A1E] font-semibold" : "text-[#64748B] hover:text-[#0F172A]"
            }`}
          >
            <Icon
              className={`w-5 h-5 ${
                isActive ? "text-[#5C3A1E] stroke-[2.2]" : "text-[#64748B]"
              }`}
            />
            <span className="text-[10px] mt-1 font-medium">{tab.name}</span>
          </Link>
        );
      })}
    </nav>
  );
}
