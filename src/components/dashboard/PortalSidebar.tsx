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
  Menu,
  X,
  Activity,
  Globe,
  Users,
  Settings,
  ChevronLeft,
  ChevronRight,
  type LucideIcon,
} from "lucide-react";

import { useAuth } from "@/lib/auth/authContext";
import { Avatar } from "@/components/ui/Avatar";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { resolveClientDisplayName } from "@/lib/auth/nameUtils";

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
  { name: "My Orders", href: "/orders", icon: FolderOpen },
  { name: "My Projects", href: "/projects-client", icon: FolderGit2 },
  { name: "Media Vault", href: "/media", icon: FolderOpen },
  { name: "Invoices", href: "/invoices", icon: FileText },
  { name: "Profile", href: "/profile", icon: User },
];

export const ADMIN_NAV_ITEMS: PortalNavItem[] = [
  { name: "Dashboard", href: "/admin?tab=overview", tabKey: "overview", icon: Activity },
  { name: "Orders & Verification", href: "/admin?tab=orders", tabKey: "orders", icon: ShoppingBag },
  { name: "Website Pages CMS", href: "/admin?tab=cms", tabKey: "cms", icon: Globe },
  { name: "Clients Directory", href: "/admin?tab=clients", tabKey: "clients", icon: Users },
  { name: "Studio Settings", href: "/admin?tab=settings", tabKey: "settings", icon: Settings },
];

export interface PortalSidebarProps {
  contained?: boolean;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function PortalSidebarInner({
  contained = false,
  collapsed: externalCollapsed,
  onToggleCollapse,
}: PortalSidebarProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentTab = searchParams ? searchParams.get("tab") || "overview" : "overview";
  const { user, role, profile, logout } = useAuth();
  const isAdmin = role === "admin";
  const clientDisplayName = isAdmin
    ? (user?.displayName || "Studio Producer")
    : resolveClientDisplayName(user?.displayName, user?.email, profile?.displayName);
  const navItems = isAdmin ? ADMIN_NAV_ITEMS : CLIENT_NAV_ITEMS;
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [internalCollapsed, setInternalCollapsed] = useState(false);

  const isCollapsed = externalCollapsed !== undefined ? externalCollapsed : internalCollapsed;
  const handleToggleCollapse = () => {
    if (onToggleCollapse) {
      onToggleCollapse();
    } else {
      setInternalCollapsed(!internalCollapsed);
    }
  };

  // Responsive desktop classes with collapsible width toggle
  const desktopWidthClass = isCollapsed ? "w-20" : "w-64";
  const desktopClass = contained
    ? "flex flex-col h-full p-4 transition-all duration-300 ease-in-out"
    : `${desktopWidthClass} shrink-0 border-r border-[#E5E1D8] bg-[#FFFDF9] min-h-screen p-4 flex flex-col justify-between hidden md:flex transition-all duration-300 ease-in-out sticky top-0 h-screen z-30 select-none`;

  return (
    <>
      {!contained && (
      <>
      {/* Mobile Top Bar with Drawer Toggle */}
      <div className="md:hidden sticky top-0 z-40 flex items-center justify-between px-4 py-3 bg-[#FFFDF9] border-b border-[#E5E1D8] backdrop-blur-md">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setMobileDrawerOpen(true)}
            className="p-2 rounded-xl text-[#171717] hover:bg-[#F0ECE1] transition-colors focus:outline-hidden focus-visible:ring-2 focus-visible:ring-[#A98B57] cursor-pointer"
            aria-label="Open Navigation Menu"
          >
            <Menu className="w-5 h-5 text-[#171717]" />
          </button>
          <SutraLogo variant="horizontal" size="sm" href={isAdmin ? "/admin" : "/dashboard"} />
        </div>
        <div className="flex items-center gap-2">
          <NotificationBell align="right" />
          <Avatar
            name={clientDisplayName}
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
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-[#FFFDF9] border-r border-[#E5E1D8] p-6 z-10">
            <div className="flex items-center justify-between pb-4 border-b border-[#E5E1D8]">
              <SutraLogo variant="horizontal" size="md" href={isAdmin ? "/admin" : "/dashboard"} />
              <button
                type="button"
                onClick={() => setMobileDrawerOpen(false)}
                className="p-1.5 rounded-xl text-[#737373] hover:text-[#171717] hover:bg-[#F0ECE1] cursor-pointer"
                aria-label="Close Navigation"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scope Card */}
            <div className="mt-4 p-3 rounded-2xl bg-[#171717] text-white flex items-center justify-between text-xs shadow-xs">
              <div>
                <span className="text-[10px] text-[#A98B57] block uppercase font-mono font-bold tracking-widest">
                  {isAdmin ? "Sutra CRM Terminal" : "Sutra Client Workspace"}
                </span>
                <span className="font-bold text-white uppercase tracking-wider text-xs">
                  {isAdmin ? "Executive Producer" : "Verified Client"}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[9px] font-mono font-bold text-emerald-400 uppercase tracking-wider">
                  Active
                </span>
              </div>
            </div>

            <nav className="mt-4 flex-1 space-y-1.5 overflow-y-auto">
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
                    className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                      isActive
                        ? "bg-[#171717] text-[#FAF9F5] font-semibold shadow-xs"
                        : "text-[#525252] hover:bg-[#F0ECE1] hover:text-[#171717]"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 ${isActive ? "text-[#A98B57]" : "text-[#737373]"}`} />
                      <span>{item.name}</span>
                    </div>
                    {isActive && (
                      <span className="w-1.5 h-1.5 rounded-full bg-[#A98B57]" />
                    )}
                  </Link>
                );
              })}
            </nav>

            <div className="pt-4 border-t border-[#E5E1D8] space-y-3">
              <Link
                href="/"
                target="_blank"
                className="flex items-center justify-between px-3 py-2 rounded-xl bg-[#FFFFFF] border border-[#E5E1D8] text-xs font-semibold text-[#171717] hover:border-[#A98B57]"
              >
                <span className="flex items-center gap-2">
                  <Globe className="w-3.5 h-3.5 text-[#A98B57]" />
                  <span>Live Public Website</span>
                </span>
                <span className="text-[10px] text-[#737373]">↗</span>
              </Link>

              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-2">
                  <Avatar
                    name={clientDisplayName}
                    size="sm"
                    status="online"
                  />
                  <div className="text-xs">
                    <p className="font-semibold text-[#171717] truncate max-w-[120px]">
                      {clientDisplayName}
                    </p>
                    <p className="text-[#737373] text-[10px]">{isAdmin ? "Admin" : "Verified Client"}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => void logout()}
                  title="Sign Out"
                  className="text-[#737373] hover:text-[#171717] p-1.5 rounded-lg hover:bg-[#F0ECE1] cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
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
          {!isCollapsed ? (
            <div className="pb-4 border-b border-[#E5E1D8] flex flex-col gap-2.5">
              <div className="flex items-center justify-between">
                <SutraLogo variant="horizontal" size="md" href={isAdmin ? "/admin" : "/dashboard"} />
                <button
                  type="button"
                  onClick={handleToggleCollapse}
                  title="Collapse Sidebar"
                  className="p-1.5 rounded-xl text-[#737373] hover:text-[#171717] hover:bg-[#F0ECE1] transition-colors cursor-pointer"
                  aria-label="Collapse Sidebar"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
              </div>

              {/* Scope Indicator Card */}
              <div className="mt-1 p-3 rounded-2xl bg-[#171717] text-white flex items-center justify-between text-xs shadow-warm">
                <div>
                  <span className="text-[10px] text-[#A98B57] block uppercase font-mono font-bold tracking-widest">
                    {isAdmin ? "Sutra CRM Terminal" : "Sutra Client Workspace"}
                  </span>
                  <span className="font-bold text-white uppercase tracking-wider text-xs">
                    {isAdmin ? "Executive Producer" : "Verified Client"}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[9px] font-mono font-bold text-emerald-400 uppercase tracking-wider">
                    Active
                  </span>
                </div>
              </div>

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
            </div>
          ) : (
            <div className="pb-4 border-b border-[#E5E1D8] flex flex-col items-center gap-2.5">
              <Link
                href={isAdmin ? "/admin" : "/dashboard"}
                className="p-1.5 rounded-xl hover:bg-[#F0ECE1] transition-colors flex items-center justify-center"
                title="Sutra Portal"
              >
                <SutraLogo variant="symbol" size="sm" />
              </Link>
              <button
                type="button"
                onClick={handleToggleCollapse}
                title="Expand Sidebar"
                className="w-8 h-8 flex items-center justify-center rounded-xl bg-[#FAF9F5] border border-[#E5E1D8] text-[#5C3A1E] hover:border-[#A98B57] hover:bg-[#F0ECE1] transition-all cursor-pointer shadow-2xs"
                aria-label="Expand Sidebar"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Navigation Items */}
          <nav className="mt-4 space-y-1.5">
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
                  className={`w-full flex items-center ${
                    isCollapsed
                      ? "justify-center h-11 w-11 mx-auto rounded-xl"
                      : "justify-between px-3 py-2.5 rounded-xl"
                  } text-xs font-medium transition-all cursor-pointer ${
                    isActive
                      ? "bg-[#171717] text-[#FAF9F5] font-semibold shadow-xs"
                      : "text-[#525252] hover:bg-[#F0ECE1] hover:text-[#171717]"
                  }`}
                >
                  <div className={`flex items-center ${isCollapsed ? "justify-center" : "gap-3"} min-w-0`}>
                    <Icon
                      className={`w-4 h-4 shrink-0 ${
                        isActive ? "text-[#A98B57]" : "text-[#737373]"
                      }`}
                    />
                    {!isCollapsed && <span className="truncate">{item.name}</span>}
                  </div>
                  {!isCollapsed && isActive && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#A98B57] shrink-0" />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer / Account */}
        <div className="pt-4 border-t border-[#E5E1D8]">
          {!isCollapsed ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5 min-w-0">
                <Avatar
                  name={clientDisplayName}
                  size="sm"
                  status="online"
                />
                <div className="text-xs min-w-0">
                  <p className="font-semibold text-[#171717] truncate max-w-[110px]">{clientDisplayName}</p>
                  <p className="text-[#737373] text-[10px] truncate">{isAdmin ? "Lead Producer" : "Client Workspace"}</p>
                </div>
              </div>

              <button
                onClick={() => void logout()}
                title="Sign Out"
                className="text-[#737373] hover:text-[#171717] p-1.5 rounded-lg hover:bg-[#F0ECE1] cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A98B57]"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2.5">
              <Avatar
                name={clientDisplayName}
                size="sm"
                status="online"
              />
              <button
                onClick={() => void logout()}
                title="Sign Out"
                className="text-[#737373] hover:text-[#171717] p-1.5 rounded-lg hover:bg-[#F0ECE1] cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A98B57]"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}

export function PortalSidebar(props: PortalSidebarProps = {}) {
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
      <PortalSidebarInner {...props} />
    </React.Suspense>
  );
}
