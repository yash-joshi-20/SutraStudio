"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  LayoutDashboard,
  ShoppingBag,
  FolderGit2,
  FolderOpen,
  FileText,
  User,
  ShieldCheck,
  Sparkles,
  Layers,
  Calendar,
  CreditCard,
  Sliders,
  X,
  Compass,
  ArrowRight,
  Command,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/lib/auth/authContext";

interface CommandItem {
  id: string;
  name: string;
  category: "Client Workspace" | "Admin Console" | "Public Website";
  href: string;
  icon: any;
  keywords?: string[];
  badge?: string;
  adminOnly?: boolean;
}

const COMMAND_DESTINATIONS: CommandItem[] = [
  // Public
  { id: "home", name: "Studio Home", category: "Public Website", href: "/home", icon: Compass },
  { id: "services", name: "12 Creative Services", category: "Public Website", href: "/services", icon: Layers },
  { id: "pricing", name: "Pricing & Retainers", category: "Public Website", href: "/pricing", icon: CreditCard },
  { id: "projects", name: "Portfolio & Creations", category: "Public Website", href: "/projects", icon: FolderGit2 },
  { id: "contact", name: "Contact & Lead Intake", category: "Public Website", href: "/contact", icon: User },
  // Client Workspace
  { id: "dashboard", name: "Client Workspace", category: "Client Workspace", href: "/dashboard", icon: LayoutDashboard },
  { id: "orders", name: "My Orders & Commissions", category: "Client Workspace", href: "/orders", icon: ShoppingBag },
  { id: "vault", name: "Media Vault (Drive)", category: "Client Workspace", href: "/media", icon: FolderOpen },
  { id: "invoices", name: "Invoices & Receipts", category: "Client Workspace", href: "/invoices", icon: FileText },
  { id: "profile", name: "Brand Kit & Settings", category: "Client Workspace", href: "/profile", icon: User },
  { id: "concierge", name: "Sutra Concierge AI", category: "Client Workspace", href: "/chat", icon: Sparkles },
  // Admin Portal
  { id: "admin-kpi", name: "Executive Terminal (KPIs)", category: "Admin Console", href: "/admin", icon: ShieldCheck, adminOnly: true },
  { id: "admin-orders", name: "Client Orders & Production Registry", category: "Admin Console", href: "/admin?tab=approvals", icon: ShoppingBag, adminOnly: true },
  { id: "admin-clients", name: "Client Directory & Dossiers", category: "Admin Console", href: "/admin?tab=clients", icon: User, adminOnly: true },
  { id: "admin-plans", name: "Monthly Retainers & Subscriptions", category: "Admin Console", href: "/admin?tab=plans", icon: Calendar, adminOnly: true },
  { id: "admin-services", name: "Service Catalog & Pricing Engine", category: "Admin Console", href: "/admin?tab=services", icon: Layers, adminOnly: true },
  { id: "admin-payments", name: "Payments, UPI & Refunds", category: "Admin Console", href: "/admin?tab=payments", icon: CreditCard, adminOnly: true },
  { id: "admin-workflows", name: "n8n Autonomous Pipelines", category: "Admin Console", href: "/admin?tab=workflows", icon: FolderGit2, adminOnly: true },
  { id: "admin-integrations", name: "API Keys & Integrations", category: "Admin Console", href: "/admin/integrations", icon: Sliders, adminOnly: true },
];

export function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const router = useRouter();
  const { role } = useAuth();
  const isAdmin = role === "admin";

  const availableDestinations = COMMAND_DESTINATIONS.filter(
    (item) => !item.adminOnly || isAdmin
  );

  const filteredDestinations = query.trim()
    ? availableDestinations.filter((item) =>
        item.name.toLowerCase().includes(query.toLowerCase()) ||
        item.category.toLowerCase().includes(query.toLowerCase())
      )
    : availableDestinations;

  const handleSelect = useCallback(
    (href: string) => {
      setIsOpen(false);
      setQuery("");
      router.push(href);
    },
    [router]
  );

  // Keyboard shortcut listener (Cmd+K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  // Arrow key navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyNav = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % (filteredDestinations.length || 1));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + filteredDestinations.length) % (filteredDestinations.length || 1));
      } else if (e.key === "Enter" && filteredDestinations[selectedIndex]) {
        e.preventDefault();
        handleSelect(filteredDestinations[selectedIndex].href);
      }
    };

    window.addEventListener("keydown", handleKeyNav);
    return () => window.removeEventListener("keydown", handleKeyNav);
  }, [isOpen, filteredDestinations, selectedIndex, handleSelect]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[var(--z-modal)] flex items-start sm:items-center justify-center p-3 sm:p-6">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-[#0F172A]/50 backdrop-blur-sm"
            aria-hidden="true"
          />

          {/* Dialog Body */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -10 }}
            transition={{ duration: 0.16 }}
            className="relative w-full max-w-xl bg-[#FFFDF9] border border-[#EADFCB] rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85dvh] text-xs text-[#0F172A]"
            role="dialog"
            aria-label="Command Palette"
          >
            {/* Search Input Bar */}
            <div className="flex items-center gap-3 px-4 py-3.5 border-b border-[#EADFCB] bg-[#FAF9F5]">
              <Search className="w-4 h-4 text-[#A98B57] shrink-0" />
              <input
                autoFocus
                type="text"
                placeholder="Type a destination or section name... (e.g. Orders, Pricing, Admin)"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setSelectedIndex(0);
                }}
                className="flex-1 bg-transparent text-xs sm:text-sm text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none"
              />
              {query && (
                <button
                  onClick={() => setQuery("")}
                  className="p-1 rounded-md text-[#94A3B8] hover:text-[#0F172A]"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
              <kbd className="hidden sm:inline-flex items-center gap-0.5 px-2 py-0.5 rounded bg-white border border-[#EADFCB] text-[10px] font-mono text-[#64748B]">
                ESC
              </kbd>
            </div>

            {/* Results List */}
            <div className="flex-1 overflow-y-auto p-2 space-y-1 divide-y divide-[#EADFCB]/40 overscroll-contain">
              {filteredDestinations.length === 0 ? (
                <div className="p-8 text-center text-[#94A3B8]">
                  <p className="font-semibold text-xs text-[#0F172A]">No destinations found</p>
                  <p className="text-[11px] mt-1">Try searching for &apos;Services&apos;, &apos;Orders&apos;, or &apos;Admin&apos;.</p>
                </div>
              ) : (
                filteredDestinations.map((item, idx) => {
                  const Icon = item.icon;
                  const isSelected = idx === selectedIndex;

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleSelect(item.href)}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      className={`w-full flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl transition-all cursor-pointer text-left ${
                        isSelected
                          ? "bg-[#5C3A1E] text-white shadow-xs"
                          : "text-[#0F172A] hover:bg-[#FAF9F5]"
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`p-1.5 rounded-lg border shrink-0 ${
                            isSelected
                              ? "bg-white/10 border-white/20 text-[#D4A35A]"
                              : "bg-[#FAF9F5] border-[#EADFCB] text-[#5C3A1E]"
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="truncate">
                          <p className="font-semibold text-xs leading-tight truncate">{item.name}</p>
                          <p
                            className={`text-[10px] mt-0.5 ${
                              isSelected ? "text-white/80" : "text-[#64748B]"
                            }`}
                          >
                            {item.category}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span
                          className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                            isSelected
                              ? "bg-white/20 border-white/30 text-white"
                              : "bg-[#F8F5EF] border-[#EADFCB] text-[#64748B]"
                          }`}
                        >
                          {item.href}
                        </span>
                        <ArrowRight
                          className={`w-3.5 h-3.5 ${
                            isSelected ? "text-[#D4A35A]" : "text-[#94A3B8]"
                          }`}
                        />
                      </div>
                    </button>
                  );
                })
              )}
            </div>

            {/* Footer Tip */}
            <div className="px-4 py-2.5 bg-[#FAF9F5] border-t border-[#EADFCB] flex items-center justify-between text-[11px] text-[#64748B] shrink-0">
              <span className="flex items-center gap-1.5">
                <Command className="w-3 h-3 text-[#A98B57]" />
                <span>Quick Navigation</span>
              </span>
              <span className="hidden sm:inline">Use ↑ ↓ to navigate · Enter to select</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
