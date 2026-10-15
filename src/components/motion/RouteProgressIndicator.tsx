"use client";

import React, { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export function RouteProgressIndicator() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [navigating, setNavigating] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Whenever pathname or searchParams change, mark transition complete
    setProgress(100);
    const timer = setTimeout(() => {
      setNavigating(false);
      setProgress(0);
    }, 300);

    return () => clearTimeout(timer);
  }, [pathname, searchParams]);

  useEffect(() => {
    // Intercept client link clicks to trigger instant visual feedback
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
        setNavigating(true);
        setProgress(35);
        setTimeout(() => setProgress(75), 150);
      }
    };

    document.addEventListener("click", handleDocumentClick, { capture: true });
    return () => {
      document.removeEventListener("click", handleDocumentClick, { capture: true });
    };
  }, [pathname]);

  if (!navigating && progress === 0) return null;

  return (
    <div
      aria-hidden="true"
      className="fixed top-0 left-0 right-0 h-[2.5px] z-[9999] pointer-events-none overflow-hidden bg-transparent"
    >
      <div
        className="h-full bg-gradient-to-r from-[#D4A35A] via-[#C28F42] to-[#5C3A1E] transition-all duration-300 ease-out shadow-xs"
        style={{
          width: `${progress}%`,
          opacity: progress === 100 ? 0 : 1,
          transition: progress === 100 ? "width 150ms ease-out, opacity 250ms ease-in" : "width 300ms ease-out",
        }}
      />
    </div>
  );
}
