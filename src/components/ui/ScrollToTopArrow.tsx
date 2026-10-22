"use client";

import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { ArrowUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { soundSystem } from "@/lib/audio/soundSystem";

/**
 * ScrollToTopArrow — Bespoke Studio Floating Arrow
 *
 * Appears when the user scrolls down on public marketing pages,
 * allowing swift, fluid return to page header with studio sound feedback.
 * Strictly hidden on admin and client dashboard routes.
 */
export function ScrollToTopArrow() {
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(false);

  // Strictly hide on admin dashboard and client portal dashboard routes
  const isDashboardRoute =
    !pathname ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/client-dashboard") ||
    pathname.startsWith("/orders") ||
    pathname.startsWith("/invoices") ||
    pathname.startsWith("/profile") ||
    pathname.startsWith("/projects-client") ||
    pathname.startsWith("/new-order") ||
    pathname.startsWith("/chat");

  useEffect(() => {
    if (typeof window === "undefined" || isDashboardRoute) return;

    const handleScroll = () => {
      if (window.scrollY > 320) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    soundSystem.play("tap");
    if (typeof window !== "undefined") {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  };

  if (isDashboardRoute) {
    return null;
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 10 }}
          transition={{ duration: 0.2 }}
          onClick={scrollToTop}
          aria-label="Scroll to top of page"
          title="Return to top"
          className="fixed bottom-[4.25rem] left-3 sm:bottom-6 sm:left-6 z-40 w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center bg-[#FFFDF9] border border-[#EADFCB] text-[#5C3A1E] shadow-xl hover:border-[#D4A35A] hover:bg-[#FAF9F5] hover:text-[#0F172A] hover:scale-105 active:scale-95 transition-all cursor-pointer group min-h-[44px] min-w-[44px]"
        >
          <div className="relative flex items-center justify-center">
            <ArrowUp className="w-5 h-5 text-[#5C3A1E] group-hover:text-[#0F172A] group-hover:-translate-y-0.5 transition-transform duration-200" />
            <span className="sr-only">Scroll back to top</span>
          </div>
        </motion.button>
      )}
    </AnimatePresence>
  );
}
