"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SutraLogo } from "@/components/brand/SutraLogo";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  Menu,
  X,
  User,
  ArrowRight,
  Sparkles,
  LayoutDashboard,
  Layers,
  PhoneCall,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { useAuth } from "@/lib/auth/authContext";

interface NavLinkItem {
  name: string;
  href: string;
  badge?: string;
}

const PUBLIC_NAV_LINKS: NavLinkItem[] = [
  { name: "Services", href: "/services", badge: "8 Pillars" },
  { name: "Studio", href: "/studio" },
  { name: "Projects", href: "/projects" },
  { name: "Pricing", href: "/pricing" },
  { name: "About", href: "/about" },
  { name: "Contact", href: "/contact" },
];

const CLIENT_NAV_LINKS: NavLinkItem[] = [
  { name: "Services", href: "/services" },
  { name: "Pricing", href: "/pricing" },
  { name: "My Portal", href: "/dashboard" },
  { name: "Messages", href: "/chat" },
  { name: "Profile", href: "/profile" },
];

const ADMIN_NAV_LINKS: NavLinkItem[] = [
  { name: "Admin Portal", href: "/admin" },
  { name: "Clients", href: "/admin?tab=clients" },
  { name: "Approvals", href: "/admin?tab=approvals" },
  { name: "Messages", href: "/admin?tab=conversations" },
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
      setScrolled(window.scrollY > 15);
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
    <>
      <header
        className={`sticky top-0 z-50 w-full transition-all duration-300 ${
          scrolled
            ? "bg-[#FFFDF9]/95 backdrop-blur-md shadow-sm border-b border-[#EADFCB]"
            : "bg-[#FFFDF9]/85 backdrop-blur-sm border-b border-[#EADFCB]/60"
        }`}
      >
        {/* Top Mini Brand Bar */}
        <div className="hidden lg:flex items-center justify-between max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-1.5 text-[11px] text-[#64748B] border-b border-[#EADFCB]/30 font-medium tracking-wide">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-[#5C3A1E]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#2E7D4F] animate-pulse" />
              Creative Studio Online • Tradition Meets Technology
            </span>
            <span className="text-[#EADFCB]">|</span>
            <span>Ideas ◆ Design ◆ Development ◆ Growth</span>
          </div>
          <div className="flex items-center gap-4">
            {!isAuthenticated ? (
              <>
                <Link
                  href="/chat"
                  className="hover:text-[#5C3A1E] transition-colors flex items-center gap-1"
                >
                  <Sparkles className="w-3 h-3 text-[#D4A35A]" />
                  Sutra AI Assistant
                </Link>
                <span className="text-[#EADFCB]">|</span>
                <span className="text-[#64748B]">concierge@sutrastudio.com</span>
              </>
            ) : isClient ? (
              <>
                <span className="text-[#0F172A] font-semibold">Hello, {user?.displayName || "Client"}</span>
                <span className="text-[#EADFCB]">|</span>
                <Link
                  href="/dashboard"
                  className="hover:text-[#5C3A1E] transition-colors flex items-center gap-1 text-[#5C3A1E] font-medium"
                >
                  <LayoutDashboard className="w-3 h-3 text-[#5C3A1E]" />
                  My Workspace
                </Link>
              </>
            ) : (
              <>
                <span className="text-[#5C3A1E] font-bold uppercase tracking-wider">Executive Terminal</span>
                <span className="text-[#EADFCB]">|</span>
                <Link
                  href="/admin"
                  className="hover:text-[#5C3A1E] transition-colors font-medium text-[#5C3A1E]"
                >
                  Supervisor Hub
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Main Navigation Bar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-4">
            <SutraLogo variant="horizontal" size="md" href="/" />
          </div>

          {/* Desktop Navigation Links */}
          <nav aria-label="Primary navigation" className="hidden lg:flex items-center gap-1 xl:gap-2">
            {navLinks.map((link) => {
              const isActive = pathname === link.href || (link.href.includes("?tab=") && pathname === "/admin");
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`relative px-3.5 py-2 text-sm font-medium rounded-full transition-all duration-200 ${
                    isActive
                      ? "text-[#5C3A1E] font-semibold bg-[#F4EFE6]"
                      : "text-[#0F172A]/80 hover:text-[#5C3A1E] hover:bg-[#F8F5EF]"
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    {link.name}
                    {link.badge && (
                      <span className="text-[10px] font-semibold tracking-wider text-[#A98B57] bg-[#FAF6EE] px-1.5 py-0.2 rounded-full border border-[#EADFCB]/60">
                        {link.badge}
                      </span>
                    )}
                  </span>
                  {isActive && (
                    <motion.div
                      layoutId="nav-active-indicator"
                      className="absolute bottom-0 left-4 right-4 h-0.5 bg-[#D4A35A] rounded-full"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right Action CTAs */}
          <div className="hidden sm:flex items-center gap-3">
            {!isAuthenticated ? (
              <>
                <Link href="/login">
                  <Button
                    variant="ghost"
                    size="sm"
                    leftIcon={<User className="w-3.5 h-3.5" />}
                    className="text-xs uppercase tracking-wider"
                  >
                    Log In
                  </Button>
                </Link>
                <Link href="/contact">
                  <Button
                    variant="primary"
                    size="sm"
                    withArrow
                    className="text-xs uppercase tracking-wider"
                  >
                    Get Started
                  </Button>
                </Link>
              </>
            ) : isClient ? (
              <div className="flex items-center gap-2">
                {/* Notification Bell */}
                <Link
                  href="/dashboard"
                  aria-label="Notifications"
                  className="relative p-2 rounded-full hover:bg-[#F4EFE6] text-[#5C3A1E] transition-colors"
                >
                  <Sparkles className="w-4 h-4 text-[#D4A35A]" />
                  <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#D4A35A]" />
                </Link>
                <Link href="/dashboard">
                  <Button
                    variant="secondary"
                    size="sm"
                    className="text-xs uppercase tracking-wider"
                  >
                    Dashboard
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={logout}
                  className="text-xs uppercase tracking-wider text-[#64748B]"
                >
                  Sign Out
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/admin"
                  aria-label="Admin Alerts"
                  className="relative p-2 rounded-full hover:bg-[#F4EFE6] text-[#5C3A1E] transition-colors"
                >
                  <Sparkles className="w-4 h-4 text-[#D4A35A]" />
                  <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#2E7D4F]" />
                </Link>
                <Link href="/admin">
                  <Button
                    variant="primary"
                    size="sm"
                    className="text-xs uppercase tracking-wider"
                  >
                    Executive Hub
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={logout}
                  className="text-xs uppercase tracking-wider text-[#64748B]"
                >
                  Sign Out
                </Button>
              </div>
            )}
          </div>

          {/* Mobile menu toggle */}
          <div className="flex lg:hidden items-center gap-2">
            <Link href="/login" className="sm:hidden" aria-label="Sign In">
              <Button variant="ghost" size="sm" className="p-2 min-h-[44px] min-w-[44px]" aria-label="Sign In">
                <User className="w-4 h-4 text-[#0F172A]" />
              </Button>
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-navigation-drawer"
              className="p-2.5 rounded-xl text-[#0F172A] hover:bg-[#EADFCB]/30 focus:outline-none focus:ring-2 focus:ring-[#D4A35A] min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
              aria-label={mobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Full-Screen Drawer */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              id="mobile-navigation-drawer"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="lg:hidden border-b border-[#EADFCB] bg-[#FFFDF9] px-6 py-6 space-y-6 shadow-xl"
            >
              {/* Status Header */}
              <div className="flex items-center justify-between pb-3 border-b border-[#EADFCB]/50 text-xs">
                <span className="flex items-center gap-1.5 text-[#5C3A1E] font-medium">
                  <span className="w-2 h-2 rounded-full bg-[#2E7D4F]" />
                  Creative Studio Online
                </span>
                <span className="text-[#64748B]">Tradition × Technology</span>
              </div>

              {/* Mobile Role-Based Navigation */}
              <nav aria-label="Mobile navigation" className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#A98B57] block mb-2">
                  {isAdmin ? "Admin Navigation" : isClient ? "Client Portal" : "Navigation"}
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {navLinks.map((link) => {
                    const isActive = pathname === link.href;
                    return (
                      <Link
                        key={link.name}
                        href={link.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center justify-between p-3 rounded-xl text-sm font-medium transition-colors ${
                          isActive
                            ? "bg-[#5C3A1E] text-white font-semibold"
                            : "bg-[#F8F5EF] text-[#0F172A] hover:bg-[#F4EFE6]"
                        }`}
                      >
                        <span>{link.name}</span>
                        {link.badge && !isActive && (
                          <span className="text-[9px] bg-[#EADFCB]/70 text-[#5C3A1E] px-1.5 py-0.5 rounded-full">
                            {link.badge}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </nav>

              {/* Role-Specific Quick Hub Section */}
              <div className="space-y-2 pt-2 border-t border-[#EADFCB]/50">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#A98B57] block mb-2">
                  {isAdmin ? "Supervisor Hub" : isClient ? "My Workspace" : "Studio Overview"}
                </span>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {!isAuthenticated ? (
                    <>
                      <Link
                        href="/services"
                        onClick={() => setMobileMenuOpen(false)}
                        className="p-2.5 rounded-xl border border-[#EADFCB] bg-[#FFFDF9] flex items-center gap-2 text-[#0F172A] hover:border-[#D4A35A]"
                      >
                        <Layers className="w-3.5 h-3.5 text-[#5C3A1E]" />
                        <span>Services</span>
                      </Link>
                      <Link
                        href="/pricing"
                        onClick={() => setMobileMenuOpen(false)}
                        className="p-2.5 rounded-xl border border-[#EADFCB] bg-[#FFFDF9] flex items-center gap-2 text-[#0F172A] hover:border-[#D4A35A]"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-[#D4A35A]" />
                        <span>Pricing</span>
                      </Link>
                      <Link
                        href="/projects"
                        onClick={() => setMobileMenuOpen(false)}
                        className="p-2.5 rounded-xl border border-[#EADFCB] bg-[#FFFDF9] flex items-center gap-2 text-[#0F172A] hover:border-[#D4A35A]"
                      >
                        <LayoutDashboard className="w-3.5 h-3.5 text-[#5C3A1E]" />
                        <span>Projects</span>
                      </Link>
                      <Link
                        href="/contact"
                        onClick={() => setMobileMenuOpen(false)}
                        className="p-2.5 rounded-xl border border-[#EADFCB] bg-[#FFFDF9] flex items-center gap-2 text-[#0F172A] hover:border-[#D4A35A]"
                      >
                        <PhoneCall className="w-3.5 h-3.5 text-[#5C3A1E]" />
                        <span>Contact Brief</span>
                      </Link>
                    </>
                  ) : isClient ? (
                    <>
                      <Link
                        href="/dashboard"
                        onClick={() => setMobileMenuOpen(false)}
                        className="p-2.5 rounded-xl border border-[#EADFCB] bg-[#FFFDF9] flex items-center gap-2 text-[#0F172A] hover:border-[#D4A35A]"
                      >
                        <LayoutDashboard className="w-3.5 h-3.5 text-[#5C3A1E]" />
                        <span>My Portal</span>
                      </Link>
                      <Link
                        href="/orders"
                        onClick={() => setMobileMenuOpen(false)}
                        className="p-2.5 rounded-xl border border-[#EADFCB] bg-[#FFFDF9] flex items-center gap-2 text-[#0F172A] hover:border-[#D4A35A]"
                      >
                        <Layers className="w-3.5 h-3.5 text-[#5C3A1E]" />
                        <span>My Orders</span>
                      </Link>
                      <Link
                        href="/chat"
                        onClick={() => setMobileMenuOpen(false)}
                        className="p-2.5 rounded-xl border border-[#EADFCB] bg-[#FFFDF9] flex items-center gap-2 text-[#0F172A] hover:border-[#D4A35A]"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-[#D4A35A]" />
                        <span>Messages & AI</span>
                      </Link>
                      <Link
                        href="/profile"
                        onClick={() => setMobileMenuOpen(false)}
                        className="p-2.5 rounded-xl border border-[#EADFCB] bg-[#FFFDF9] flex items-center gap-2 text-[#0F172A] hover:border-[#D4A35A]"
                      >
                        <User className="w-3.5 h-3.5 text-[#5C3A1E]" />
                        <span>Profile</span>
                      </Link>
                    </>
                  ) : (
                    <>
                      <Link
                        href="/admin"
                        onClick={() => setMobileMenuOpen(false)}
                        className="p-2.5 rounded-xl border border-[#EADFCB] bg-[#FFFDF9] flex items-center gap-2 text-[#0F172A] hover:border-[#D4A35A]"
                      >
                        <LayoutDashboard className="w-3.5 h-3.5 text-[#5C3A1E]" />
                        <span>Admin Portal</span>
                      </Link>
                      <Link
                        href="/admin?tab=approvals"
                        onClick={() => setMobileMenuOpen(false)}
                        className="p-2.5 rounded-xl border border-[#EADFCB] bg-[#FFFDF9] flex items-center gap-2 text-[#0F172A] hover:border-[#D4A35A]"
                      >
                        <Layers className="w-3.5 h-3.5 text-[#5C3A1E]" />
                        <span>Approvals</span>
                      </Link>
                      <Link
                        href="/admin?tab=conversations"
                        onClick={() => setMobileMenuOpen(false)}
                        className="p-2.5 rounded-xl border border-[#EADFCB] bg-[#FFFDF9] flex items-center gap-2 text-[#0F172A] hover:border-[#D4A35A]"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-[#D4A35A]" />
                        <span>Messages</span>
                      </Link>
                      <Link
                        href="/admin?tab=site-control"
                        onClick={() => setMobileMenuOpen(false)}
                        className="p-2.5 rounded-xl border border-[#EADFCB] bg-[#FFFDF9] flex items-center gap-2 text-[#0F172A] hover:border-[#D4A35A]"
                      >
                        <PhoneCall className="w-3.5 h-3.5 text-[#5C3A1E]" />
                        <span>Site Control</span>
                      </Link>
                    </>
                  )}
                </div>
              </div>

              {/* CTAs */}
              <div className="pt-2 flex flex-col gap-2.5">
                {!isAuthenticated ? (
                  <>
                    <Link href="/contact" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="primary" size="md" withArrow className="w-full">
                        Start a New Project
                      </Button>
                    </Link>
                    <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="secondary" size="md" className="w-full">
                        Sign In
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
                        {isAdmin ? "Open Admin Portal" : "Open My Portal"}
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
    </>
  );
}
