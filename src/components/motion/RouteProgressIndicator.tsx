"use client";

import React, { useEffect, useState, useRef } from "react";
import { usePathname, useSearchParams, useRouter } from "next/navigation";

export function RouteProgressIndicator() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [navigating, setNavigating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Complete progress on route change
  useEffect(() => {
    if (visible) {
      setProgress(100);
      const timer = setTimeout(() => {
        setVisible(false);
        setNavigating(false);
        setProgress(0);
      }, 350);

      return () => clearTimeout(timer);
    }
  }, [pathname, searchParams]);

  useEffect(() => {
    // Intercept client link clicks & hovers for YouTube-style instant SPA feel
    const handleDocumentClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest("a");
      if (!target) return;

      const href = target.getAttribute("href");
      if (!href) return;

      // Only animate internal routes that differ from current
      if (
        href.startsWith("/") &&
        !href.startsWith("#") &&
        !target.getAttribute("target") &&
        href !== pathname
      ) {
        if (timerRef.current) clearInterval(timerRef.current);
        setVisible(true);
        setNavigating(true);
        setProgress(28);

        // Smooth trickling progress like YouTube
        let current = 28;
        timerRef.current = setInterval(() => {
          if (current < 85) {
            const step = Math.max(1, (85 - current) * 0.15);
            current += step;
            setProgress(Math.round(current));
          }
        }, 120);
      }
    };

    // YouTube-style link prefetch on hover / mouseenter
    const handleMouseEnter = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest("a");
      if (!target) return;
      const href = target.getAttribute("href");
      if (
        href &&
        href.startsWith("/") &&
        !href.startsWith("#") &&
        !target.getAttribute("target")
      ) {
        try {
          router.prefetch(href);
        } catch {
          // prefetch safe ignore
        }
      }
    };

    document.addEventListener("click", handleDocumentClick, { capture: true });
    document.addEventListener("mouseover", handleMouseEnter, { passive: true });

    return () => {
      document.removeEventListener("click", handleDocumentClick, { capture: true });
      document.removeEventListener("mouseover", handleMouseEnter);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [pathname, router]);

  if (!visible && progress === 0) return null;

  return (
    <div
      aria-hidden="true"
      className="fixed top-0 left-0 right-0 h-[2.5px] z-[9999] pointer-events-none overflow-visible bg-transparent"
    >
      <div
        className="relative h-full bg-gradient-to-r from-[#C28F42] via-[#D4A35A] to-[#A98B57]"
        style={{
          width: `${progress}%`,
          opacity: progress === 100 ? 0 : 1,
          transition:
            progress === 100
              ? "width 200ms ease-out, opacity 300ms ease-in 100ms"
              : "width 250ms cubic-bezier(0.4, 0, 0.2, 1)",
          boxShadow: "0 0 10px rgba(212, 163, 90, 0.7), 0 0 5px rgba(169, 139, 87, 0.5)",
        }}
      >
        {/* YouTube Glowing Leading Edge Tip */}
        <div
          className="absolute right-0 top-0 bottom-0 w-24 -translate-y-[1px] h-[4.5px] bg-gradient-to-r from-transparent via-[#FFFDF9] to-[#D4A35A] opacity-90 blur-[1px]"
          style={{
            boxShadow: "0 0 12px 2px #D4A35A, 0 0 6px 1px #FFFDF9",
          }}
        />
      </div>
    </div>
  );
}
