"use client";

import React, { useState, useEffect } from "react";
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
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/lib/auth/authContext";

interface NavLinkItem {
  name: string;
  href: string;
  badge?: string;
}

const PUBLIC_NAV_LINKS: NavLinkItem[] = [
  { name: "Services", href: "/services" },
  { name: "Studio", href: "/studio" },
  { name: "Projects", href: "/projects" },
  { name: "Pricing", href: "/pricing" },
  { name: "About", href: "/about" },
  { name: "Contact", href: "/contact" },
];

const CLIENT_NAV_LINKS: NavLinkItem[] = [
  { name: "Services", href: "/services" },
  { name: "Pricing", href: "/pricing" },
  { name: "My Orders", href: "/orders" },
  { name: "My Projects", href: "/projects-client" },
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

  const isAuthenticated = !!user;
  const isAdmin = role === "admin";
  const isClient = role === "client";

  const navLinks = isAdmin
    ? ADMIN_NAV_LINKS
    : isClient
    ? CLIENT_NAV_LINKS
    : PUBLIC_NAV_LINKS;

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        scrolled
          ? "bg-[#FFFDF9]/95 backdrop-blur-md shadow-xs border-b border-[#EADFCB]"
          : "bg-[#FFFDF9]/90 backdrop-blur-sm border-b border-[#EADFCB]/60"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Prominent Official Brand Logo */}
        <div className="flex items-center">
          <SutraLogo variant="horizontal" size="md" href={isAdmin ? "/admin" : isClient ? "/dashboard" : "/"} />
        </div>

        {/* Desktop Navigation Links */}
        <nav aria-label="Primary navigation" className="hidden lg:flex items-center gap-1 xl:gap-2">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`relative px-4 py-2 text-sm font-medium rounded-full transition-colors ${
                  isActive
                    ? "text-[#5C3A1E] font-semibold bg-[#F4EFE6]"
                    : "text-[#0F172A]/85 hover:text-[#5C3A1E] hover:bg-[#F8F5EF]"
                }`}
              >
                <span>{link.name}</span>
                {isActive && (
                  <motion.div
                    layoutId="nav-active-pill"
                    className="absolute bottom-1 left-4 right-4 h-0.5 bg-[#D4A35A] rounded-full"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right Action Controls */}
        <div className="hidden sm:flex items-center gap-3">
          {!isAuthenticated ? (
            <>
              <Link href="/login">
                <Button
                  variant="ghost"
                  size="sm"
                  leftIcon={<User className="w-4 h-4" />}
                  className="text-xs uppercase tracking-wider font-semibold"
                >
                  Log In
                </Button>
              </Link>
              <Link href="/contact">
                <Button
                  variant="primary"
                  size="sm"
                  withArrow
                  className="text-xs uppercase tracking-wider font-semibold"
                >
                  Get Started
                </Button>
              </Link>
            </>
          ) : isClient ? (
            <div className="flex items-center gap-3">
              <Link href="/dashboard">
                <Button
                  variant="primary"
                  size="sm"
                  leftIcon={<LayoutDashboard className="w-3.5 h-3.5" />}
                  className="text-xs uppercase tracking-wider font-semibold"
                >
                  Dashboard
                </Button>
              </Link>
              <Button
                variant="ghost"
                size="sm"
                onClick={logout}
                leftIcon={<LogOut className="w-3.5 h-3.5 text-[#64748B]" />}
                className="text-xs uppercase tracking-wider text-[#64748B] hover:text-[#DC2626]"
              >
                Sign Out
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <div className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#5C3A1E] text-[#FFFDF9] text-[11px] font-semibold tracking-wider uppercase">
                <ShieldCheck className="w-3.5 h-3.5 text-[#D4A35A]" />
                <span>Executive Producer</span>
              </div>
              <Link href="/admin">
                <Button
                  variant="primary"
                  size="sm"
                  className="text-xs uppercase tracking-wider font-semibold"
                >
                  Admin Hub
                </Button>
              </Link>
              <Button
                variant="ghost"
                size="sm"
                onClick={logout}
                className="text-xs uppercase tracking-wider text-[#64748B] hover:text-[#DC2626]"
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
              <Button variant="ghost" size="sm" className="p-2 min-h-[44px] min-w-[44px]">
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

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            id="mobile-navigation-drawer"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="lg:hidden border-b border-[#EADFCB] bg-[#FFFDF9] px-6 py-6 space-y-4 shadow-xl"
          >
            <nav aria-label="Mobile navigation" className="space-y-1.5">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center justify-between p-3.5 rounded-xl text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-[#5C3A1E] text-white font-semibold"
                        : "bg-[#F8F5EF] text-[#0F172A] hover:bg-[#F4EFE6]"
                    }`}
                  >
                    <span>{link.name}</span>
                  </Link>
                );
              })}
            </nav>

            <div className="pt-3 border-t border-[#EADFCB]/60 flex flex-col gap-2">
              {!isAuthenticated ? (
                <>
                  <Link href="/contact" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="primary" size="md" withArrow className="w-full">
                      Get Started
                    </Button>
                  </Link>
                  <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="secondary" size="md" className="w-full">
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
                    <Button variant="primary" size="md" className="w-full">
                      {isAdmin ? "Open Admin Hub" : "Open Client Dashboard"}
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="md"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      logout();
                    }}
                    className="w-full text-[#64748B]"
                  >
                    Sign Out
                  </Button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
