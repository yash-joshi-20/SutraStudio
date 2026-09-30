"use client";

import React, { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

export function HeroAnimation({ children }: { children: React.ReactNode }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      // Respect prefers-reduced-motion
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        return;
      }

      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      tl.from(".hero-badge", {
        opacity: 0,
        y: -15,
        duration: 0.6,
      })
        .from(
          ".hero-heading",
          {
            opacity: 0,
            y: 30,
            duration: 0.8,
          },
          "-=0.3"
        )
        .from(
          ".hero-subhead",
          {
            opacity: 0,
            y: 20,
            duration: 0.6,
          },
          "-=0.4"
        )
        .from(
          ".hero-cta",
          {
            opacity: 0,
            y: 15,
            duration: 0.5,
            stagger: 0.1,
          },
          "-=0.3"
        )
        .from(
          ".hero-stats-item",
          {
            opacity: 0,
            y: 20,
            duration: 0.5,
            stagger: 0.1,
          },
          "-=0.2"
        )
        .from(
          ".hero-visual-card",
          {
            opacity: 0,
            scale: 0.96,
            duration: 0.9,
          },
          "-=0.7"
        );
    },
    { scope: containerRef }
  );

  return <div ref={containerRef}>{children}</div>;
}
