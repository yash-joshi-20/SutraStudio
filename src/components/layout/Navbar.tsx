"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SutraLogo } from "@/components/brand/SutraLogo";
import { Button } from "@/components/ui/Button";
import {
  Menu,
  X,
  User,
  Sparkles,
  LayoutDashboard,
  ShieldCheck,
  LogOut,
  Smartphone,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/lib/auth/authContext";

interface NavLinkItem {
  name: string;
  href: string;
  badge?: string;
}

const PUBLIC_NAV_LINKS: NavLinkItem[] = [
  { name: "Home", href: "/home" },
  { name: "Services", href: "/services" },
  { name: "Studio", href: "/studio" },
  { name: "Projects", href: "/projects" },
  { name: "Pricing", href: "/pricing" },
  { name: "About", href: "/about" },
  { name: "Mobile App", href: "/mobile-app", badge: "Coming Soon" },
  { name: "Contact", href: "/contact" },
];

const CLIENT_NAV_LINKS: NavLinkItem[] = [
  { name: "Workspace", href: "/dashboard" },
  { name: "My Orders", href: "/orders" },
  { name: "My Projects", href: "/projects-client" },
  { name: "Media Vault", href: "/media" },
  { name: "Invoices", href: "/invoices" },
];

const ADMIN_NAV_LINKS: NavLinkItem[] = [
  { name: "Overview", href: "/admin" },
  { name: "Clients", href: "/admin?tab=clients" },
  { name: "Approvals", href: "/admin?tab=approvals" },
  { name: "Pipelines", href: "/admin?tab=workflows" },
  { name: "Site Control", href: "/admin?tab=site-control" },
];

export function Navbar() {
  const pathname = usePathname();
  const { user, role, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);

  const isAuthenticated = !!user;
  const isAdmin = role === "admin";
  const isClient = role === "client";

  const navLinks = PUBLIC_NAV_LINKS;

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Lock body scroll and listen for Esc when mobile menu is open
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };

    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [mobileMenuOpen]);

  // Close mobile drawer on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 pt-safe ${
        scrolled
          ? "bg-[#FFFDF9]/95 backdrop-blur-md shadow-xs border-b border-[#EADFCB]"
          : "bg-[#FFFDF9]/90 backdrop-blur-sm border-b border-[#EADFCB]/60"
      }`}
    >
      <div className="app-container-cap px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
        {/* Prominent Official Brand Logo */}
        <div className="flex items-center shrink-0">
          <SutraLogo variant="horizontal" size="md" href={isClient ? "/dashboard" : "/"} />
        </div>

        {/* Desktop Navigation Links */}
        <nav aria-label="Primary navigation" className="hidden lg:flex items-center gap-1 xl:gap-2">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`relative px-3.5 py-2 text-sm font-medium rounded-full transition-colors ${
                  isActive
                    ? "text-[#5C3A1E] font-semibold bg-[#F4EFE6]"
                    : "text-[#0F172A]/85 hover:text-[#5C3A1E] hover:bg-[#F8F5EF]"
                }`}
              >
                <span>{link.name}</span>
                {link.badge && (
                  <span className="ml-1.5 text-[9px] font-mono uppercase px-1.5 py-0.5 rounded-full bg-[#FAF9F5] text-[#A98B57] font-bold border border-[#D4A35A]/30">
                    {link.badge}
                  </span>
                )}
                {isActive && (
                  <motion.div
                    layoutId="nav-active-pill"
                    className="absolute bottom-1 left-3 right-3 h-0.5 bg-[#D4A35A] rounded-full"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right Action Controls */}
        <div className="hidden sm:flex items-center gap-3 shrink-0">
          {!isAuthenticated ? (
            <>
              <Link href="/login">
                <Button
                  variant="ghost"
                  size="sm"
                  leftIcon={<User className="w-4 h-4" />}
                  className="text-xs uppercase tracking-wider font-semibold touch-target"
                >
                  Log In
                </Button>
              </Link>
              <Link href="/contact">
                <Button
                  variant="primary"
                  size="sm"
                  withArrow
                  className="text-xs uppercase tracking-wider font-semibold touch-target"
                >
                  Get Started
                </Button>
              </Link>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <Link href={isAdmin ? "/admin" : "/dashboard"}>
                <Button
                  variant="primary"
                  size="sm"
                  leftIcon={isAdmin ? <ShieldCheck className="w-3.5 h-3.5" /> : <LayoutDashboard className="w-3.5 h-3.5" />}
                  className="text-xs uppercase tracking-wider font-semibold touch-target"
                >
                  {isAdmin ? "Admin Console" : "Dashboard"}
                </Button>
              </Link>
              <Button
                variant="ghost"
                size="sm"
                onClick={logout}
                leftIcon={<LogOut className="w-3.5 h-3.5 text-[#64748B]" />}
                className="text-xs uppercase tracking-wider text-[#64748B] hover:text-[#DC2626] touch-target"
              >
                Sign Out
              </Button>
            </div>
          )}
        </div>

        {/* Mobile menu button */}
        <div className="flex lg:hidden items-center gap-2">
          {!isAuthenticated && (
            <Link href="/login" aria-label="Sign In">
              <Button variant="ghost" size="sm" className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center">
                <User className="w-5 h-5 text-[#0F172A]" />
              </Button>
            </Link>
          )}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-navigation-drawer"
            className="p-2 rounded-xl text-[#0F172A] hover:bg-[#EADFCB]/30 focus:outline-none focus:ring-2 focus:ring-[#D4A35A] min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
            aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer & Backdrop */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop overlay for outside tap */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setMobileMenuOpen(false)}
              className="lg:hidden fixed inset-0 top-16 sm:top-20 z-40 bg-[#0F172A]/30 backdrop-blur-xs"
              aria-hidden="true"
            />

            <motion.div
              id="mobile-navigation-drawer"
              ref={drawerRef}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              className="lg:hidden relative z-50 border-b border-[#EADFCB] bg-[#FFFDF9] px-5 py-6 space-y-4 shadow-xl max-h-[calc(100dvh-5rem)] overflow-y-auto"
            >
              <nav aria-label="Mobile navigation" className="space-y-1.5">
                {navLinks.map((link) => {
                  const isActive = pathname === link.href;
                  return (
                    <Link
                      key={link.name}
                      href={link.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center justify-between p-3.5 rounded-xl text-sm font-medium transition-colors min-h-[44px] touch-target ${
                        isActive
                          ? "bg-[#5C3A1E] text-white font-semibold shadow-xs"
                          : "bg-[#F8F5EF] text-[#0F172A] hover:bg-[#F4EFE6]"
                      }`}
                    >
                      <span>{link.name}</span>
                      {link.badge && (
                        <span
                          className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded-full font-bold border ${
                            isActive
                              ? "bg-[#FAF9F5] text-[#5C3A1E] border-white/40"
                              : "bg-[#FAF9F5] text-[#A98B57] border-[#D4A35A]/30"
                          }`}
                        >
                          {link.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </nav>

              <div className="pt-3 border-t border-[#EADFCB]/60 flex flex-col gap-2.5">
                {!isAuthenticated ? (
                  <>
                    <Link href="/contact" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="primary" size="md" withArrow className="w-full min-h-[44px]">
                        Get Started
                      </Button>
                    </Link>
                    <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="secondary" size="md" className="w-full min-h-[44px]">
                        Client Sign In
                      </Button>
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      href={isAdmin ? "/admin" : "/dashboard"}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Button variant="primary" size="md" className="w-full min-h-[44px]">
                        {isAdmin ? "Open Admin Console" : "Open Client Dashboard"}
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="md"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        void logout();
                      }}
                      leftIcon={<LogOut className="w-4 h-4 text-[#DC2626]" />}
                      className="w-full min-h-[44px] text-xs uppercase tracking-wider text-[#DC2626] hover:bg-[#FEF2F2]"
                    >
                      Sign Out
                    </Button>
                  </>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
