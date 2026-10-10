"use client";

import React, { useState } from "react";
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
  Globe,
  MessageSquare,
  Bell,
  Sliders,
  Menu,
  X,
  CreditCard,
  Calendar,
  Layers,
  Activity,
  Tag,
  Megaphone,
  type LucideIcon,
} from "lucide-react";

import { useAuth } from "@/lib/auth/authContext";
import { Avatar } from "@/components/ui/Avatar";
import { NotificationBell } from "@/components/notifications/NotificationBell";

/**
 * One nav item shape for both portals.
 * `tabKey` is optional and only the admin portal uses it, because admin
 * sections are query-string tabs on a single `/admin` route.
 */
export interface PortalNavItem {
  name: string;
  href: string;
  icon: LucideIcon;
  tabKey?: string;
}

export const CLIENT_NAV_ITEMS: PortalNavItem[] = [
  { name: "Workspace", href: "/dashboard", icon: LayoutDashboard },
  { name: "Sutra Concierge", href: "/chat", icon: Sparkles },
  { name: "My Orders", href: "/orders", icon: ShoppingBag },
  { name: "My Projects", href: "/projects-client", icon: FolderGit2 },
  { name: "Media Vault", href: "/media", icon: FolderOpen },
  { name: "Invoices", href: "/invoices", icon: FileText },
  { name: "Profile", href: "/profile", icon: User },
];

export const ADMIN_NAV_ITEMS: PortalNavItem[] = [
  { name: "Dashboard (KPIs)", href: "/admin", tabKey: "overview", icon: Activity },
  { name: "Meta Ads & Marketing", href: "/admin/marketing", icon: Megaphone },
  { name: "AI Media Rebrander", href: "/admin/rebrand", icon: Sparkles },
  { name: "Orders Ledger", href: "/admin?tab=approvals", tabKey: "approvals", icon: ShoppingBag },
  { name: "Client Directory", href: "/admin?tab=clients", tabKey: "clients", icon: User },
  { name: "Monthly Retainers", href: "/admin?tab=plans", tabKey: "plans", icon: Calendar },
  { name: "Services & Pricing", href: "/admin?tab=services", tabKey: "services", icon: Layers },
  { name: "Payments & Refunds", href: "/admin?tab=payments", tabKey: "payments", icon: CreditCard },
  { name: "Deliveries & Drive", href: "/admin?tab=deliveries", tabKey: "deliveries", icon: FolderOpen },
  { name: "Client Demos (Subdomains)", href: "/admin/demos", icon: Globe },
  { name: "Chats & AI Knowledge", href: "/admin?tab=conversations", tabKey: "conversations", icon: MessageSquare },
  { name: "Brand Prompts", href: "/admin?tab=prompts", tabKey: "prompts", icon: Sparkles },
  { name: "Notifications Settings", href: "/admin?tab=notifications", tabKey: "notifications", icon: Bell },
  { name: "Workflows (n8n)", href: "/admin?tab=workflows", tabKey: "workflows", icon: FolderGit2 },
  { name: "Studio Settings & GST", href: "/admin?tab=settings", tabKey: "settings", icon: Sliders },
  { name: "Integrations & Keys", href: "/admin/integrations", icon: Sliders },
  { name: "Security Audit Log", href: "/admin?tab=audit", tabKey: "audit", icon: ShieldCheck },
];

export function PortalSidebarInner({ contained = false }: { contained?: boolean }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentTab = searchParams ? searchParams.get("tab") || "overview" : "overview";
  const { user, role, logout } = useAuth();
  const isAdmin = role === "admin";
  const navItems = isAdmin ? ADMIN_NAV_ITEMS : CLIENT_NAV_ITEMS;
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Responsive desktop classes with collapsible width toggle
  const desktopWidthClass = isCollapsed ? "w-20" : "w-64";
  const desktopClass = contained
    ? "flex flex-col h-full p-4"
    : `${desktopWidthClass} shrink-0 border-r border-[#E5E1D8] bg-[#FAF9F5] min-h-screen p-4 flex flex-col justify-between hidden md:flex transition-all duration-300 ease-in-out`;

  return (
    <>
      {!contained && (
      <>
      {/* Mobile Top Bar with Drawer Toggle */}
      <div className="md:hidden sticky top-0 z-40 flex items-center justify-between px-4 py-3 bg-[#FAF9F5] border-b border-[#E5E1D8] backdrop-blur-md">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileDrawerOpen(true)}
            className="p-2 rounded-lg text-[#171717] hover:bg-[#F0ECE1] transition-colors focus:outline-hidden focus-visible:ring-2 focus-visible:ring-[#A98B57] cursor-pointer"
            aria-label="Open Navigation Menu"
          >
            <Menu className="w-5 h-5 text-[#171717]" />
          </button>
          <SutraLogo variant="horizontal" size="sm" href={isAdmin ? "/admin" : "/dashboard"} />
        </div>
        <div className="flex items-center gap-2">
          <NotificationBell />
          <Avatar
            name={user?.displayName || (isAdmin ? "Admin" : "Client")}
            size="sm"
            status="online"
          />
        </div>
      </div>

      {/* Mobile Slide-Over Drawer */}
      {mobileDrawerOpen && (
        <div className="md:hidden fixed inset-0 z-[var(--z-drawer)] flex">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileDrawerOpen(false)}
          />
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-[#FAF9F5] border-r border-[#E5E1D8] p-6 z-10">
            <div className="flex items-center justify-between pb-4 border-b border-[#E5E1D8]">
              <SutraLogo variant="horizontal" size="md" href={isAdmin ? "/admin" : "/dashboard"} />
              <button
                onClick={() => setMobileDrawerOpen(false)}
                className="p-1.5 rounded-lg text-[#737373] hover:text-[#171717] hover:bg-[#F0ECE1] cursor-pointer"
                aria-label="Close Navigation"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {isAdmin && (
              <div className="mt-3 p-2.5 rounded-xl bg-[#171717] text-white flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] text-[#A98B57] block uppercase font-mono font-semibold">Executive Terminal</span>
                  <span className="font-bold text-white uppercase">Supervisor Mode</span>
                </div>
                <span className="w-2 h-2 rounded-full bg-[#2E7D4F] animate-pulse" />
              </div>
            )}

            <nav className="mt-4 flex-1 space-y-1 overflow-y-auto">
              {navItems.map((item: any) => {
                const Icon = item.icon;
                let isActive = false;
                if (isAdmin) {
                  const targetKey = item.tabKey || "overview";
                  isActive = pathname === "/admin" && currentTab === targetKey;
                } else {
                  isActive = pathname === item.href;
                }

                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setMobileDrawerOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? "bg-[#FFFFFF] text-[#A98B57] font-semibold border border-[#E5E1D8] shadow-xs"
                        : "text-[#525252] hover:bg-[#F0ECE1] hover:text-[#171717]"
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? "text-[#A98B57]" : "text-[#737373]"}`} />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>

            <div className="pt-4 border-t border-[#E5E1D8] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Avatar
                  name={user?.displayName || (isAdmin ? "Studio Producer" : "Studio Client")}
                  size="sm"
                  status="online"
                />
                <div className="text-xs">
                  <p className="font-semibold text-[#171717]">{user?.displayName || (isAdmin ? "Studio Producer" : "Client")}</p>
                  <p className="text-[#737373]">{isAdmin ? "Admin" : "Client"}</p>
                </div>
              </div>
              <button
                onClick={() => void logout()}
                title="Sign Out"
                className="text-[#737373] hover:text-[#171717] p-1.5 rounded-lg hover:bg-[#F0ECE1] cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
      </>
      )}

      {/* Desktop / Tablet Persistent Collapsible Sidebar */}
      <aside className={desktopClass}>
        <div>
          {/* Brand Header & Toggle Button */}
          <div className="pb-4 border-b border-[#E5E1D8] flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              {!isCollapsed ? (
                <SutraLogo variant="horizontal" size="md" href={isAdmin ? "/admin" : "/dashboard"} />
              ) : (
                <Link href={isAdmin ? "/admin" : "/dashboard"} className="p-1 rounded-lg hover:bg-[#F0ECE1]">
                  <SutraLogo variant="symbol" size="sm" />
                </Link>
              )}
              <div className="flex items-center gap-1">
                {!contained && !isCollapsed && <NotificationBell />}
                <button
                  type="button"
                  onClick={() => setIsCollapsed(!isCollapsed)}
                  title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
                  className="p-1.5 rounded-lg text-[#737373] hover:text-[#171717] hover:bg-[#F0ECE1] transition-colors cursor-pointer"
                  aria-label={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
                >
                  <Menu className="w-4 h-4" />
                </button>
              </div>
            </div>

            {!isCollapsed && (
              <Link
                href="/"
                className="inline-flex items-center justify-between px-3 py-1.5 rounded-xl bg-[#FFFFFF] border border-[#E5E1D8] text-xs font-semibold text-[#171717] hover:border-[#A98B57] hover:bg-[#F0ECE1] transition-all"
                title="Return to Public Website"
              >
                <span className="flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-[#A98B57]" />
                  <span>Public Website</span>
                </span>
                <span className="text-[10px] text-[#737373]">↗</span>
              </Link>
            )}
          </div>

          {/* Portal Scope Indicator (Admin Only) */}
          {isAdmin && !isCollapsed && (
            <div className="mt-3 p-2.5 rounded-xl bg-[#171717] text-white flex items-center justify-between text-xs shadow-xs">
              <div>
                <span className="text-[10px] text-[#A98B57] block uppercase font-mono font-semibold">Executive Terminal</span>
                <span className="font-bold text-white uppercase tracking-wider">Supervisor Mode</span>
              </div>
              <span className="w-2 h-2 rounded-full bg-[#2E7D4F] animate-pulse" />
            </div>
          )}

          {/* Navigation Items */}
          <nav className="mt-4 space-y-1">
            {navItems.map((item: any) => {
              const Icon = item.icon;
              let isActive = false;
              if (isAdmin) {
                const targetKey = item.tabKey || "overview";
                isActive = pathname === "/admin" && currentTab === targetKey;
              } else {
                isActive = pathname === item.href;
              }

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  title={isCollapsed ? item.name : undefined}
                  onClick={(e) => {
                    if (item.href === "/chat") {
                      e.preventDefault();
                      if (typeof window !== "undefined") {
                        window.dispatchEvent(new CustomEvent("open-sutra-chat"));
                      }
                    }
                  }}
                  className={`flex items-center ${
                    isCollapsed ? "justify-center p-2.5" : "gap-3 px-3 py-2"
                  } rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? "bg-[#FFFFFF] text-[#A98B57] font-semibold shadow-xs border border-[#E5E1D8]"
                      : "text-[#525252] hover:bg-[#FFFFFF]/60 hover:text-[#171717]"
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 shrink-0 ${
                      isActive ? "text-[#A98B57]" : "text-[#737373]"
                    }`}
                  />
                  {!isCollapsed && <span className="truncate">{item.name}</span>}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer / Account */}
        <div className={`pt-4 border-t border-[#E5E1D8] flex items-center ${isCollapsed ? "justify-center" : "justify-between"}`}>
          {!isCollapsed ? (
            <div className="flex items-center gap-2.5 min-w-0">
              <Avatar
                name={user?.displayName || (isAdmin ? "Studio Producer" : "Studio Client")}
                size="sm"
                status="online"
              />
              <div className="text-xs min-w-0">
                <p className="font-semibold text-[#171717] truncate max-w-[110px]">{user?.displayName || (isAdmin ? "Studio Producer" : "Studio Client")}</p>
                <p className="text-[#737373] text-[10px] truncate">{isAdmin ? "Lead Producer" : "Client Workspace"}</p>
              </div>
            </div>
          ) : (
            <Avatar
              name={user?.displayName || (isAdmin ? "Studio Producer" : "Studio Client")}
              size="sm"
              status="online"
            />
          )}
          <button
            onClick={() => void logout()}
            title="Sign Out"
            className="text-[#737373] hover:text-[#171717] p-1.5 rounded-lg hover:bg-[#F0ECE1] cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A98B57]"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>
    </>
  );
}

export function PortalSidebar({ contained = false }: { contained?: boolean } = {}) {
  return (
    <React.Suspense
      fallback={
        <div className="p-6 space-y-2">
          <div className="h-8 bg-[#F0ECE1] rounded animate-pulse" />
          <div className="h-8 bg-[#F0ECE1] rounded-xl animate-pulse" />
          <div className="h-8 bg-[#F0ECE1] rounded-xl animate-pulse" />
          <div className="h-8 bg-[#F0ECE1] rounded-xl animate-pulse" />
          <div className="h-8 bg-[#F0ECE1] rounded-xl animate-pulse" />
        </div>
      }
    >
      <PortalSidebarInner contained={contained} />
    </React.Suspense>
  );
}
