"use client";

import React, { useEffect, useRef, useState } from "react";

/**
 * Sutra Studio Custom Theme Arrow Cursor & Follower
 *
 * Implements an executive atelier custom arrow cursor with smooth 60-120fps
 * hardware-accelerated trailing halo for desktop pointer devices.
 * Automatically disabled on touch screens and when prefers-reduced-motion is active.
 */
export function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  const mousePos = useRef({ x: -100, y: -100 });
  const ringPos = useRef({ x: -100, y: -100 });
  const isHovered = useRef(false);
  const isClicked = useRef(false);
  const isVisible = useRef(false);
  const rafId = useRef<number | null>(null);

  const [isEnabled, setIsEnabled] = useState(false);

  useEffect(() => {
    // Only enable on desktop pointer devices that support hover
    if (typeof window === "undefined") return;

    const hasFinePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (!hasFinePointer || prefersReducedMotion) {
      return;
    }

    setIsEnabled(true);
    document.documentElement.classList.add("sutra-custom-cursor");

    const onMouseMove = (e: MouseEvent) => {
      mousePos.current.x = e.clientX;
      mousePos.current.y = e.clientY;

      const target = e.target as HTMLElement | null;
      if (target) {
        // If hovering a text input, let native text I-beam display cleanly
        const isTextInput = target.closest("input, textarea, select");
        if (isTextInput) {
          if (cursorRef.current) cursorRef.current.style.opacity = "0";
          if (ringRef.current) ringRef.current.style.opacity = "0";
          return;
        }

        const interactive = target.closest(
          "a, button, [role='button'], label, .cursor-pointer, [data-cursor-interactive]"
        );
        isHovered.current = !!interactive;
      }

      if (!isVisible.current) {
        isVisible.current = true;
      }
      if (cursorRef.current) cursorRef.current.style.opacity = "1";
      if (ringRef.current) ringRef.current.style.opacity = "1";
    };

    const onMouseDown = () => {
      isClicked.current = true;
    };

    const onMouseUp = () => {
      isClicked.current = false;
    };

    const onMouseLeave = () => {
      isVisible.current = false;
      if (cursorRef.current) cursorRef.current.style.opacity = "0";
      if (ringRef.current) ringRef.current.style.opacity = "0";
    };

    const onMouseEnter = () => {
      isVisible.current = true;
      if (cursorRef.current) cursorRef.current.style.opacity = "1";
      if (ringRef.current) ringRef.current.style.opacity = "1";
    };

    window.addEventListener("mousemove", onMouseMove, { passive: true });
    window.addEventListener("mousedown", onMouseDown, { passive: true });
    window.addEventListener("mouseup", onMouseUp, { passive: true });
    document.addEventListener("mouseleave", onMouseLeave);
    document.addEventListener("mouseenter", onMouseEnter);

    // High performance RAF render loop
    const render = () => {
      // Smooth lerp interpolation for trailing ring
      const lerp = 0.18;
      ringPos.current.x += (mousePos.current.x - ringPos.current.x) * lerp;
      ringPos.current.y += (mousePos.current.y - ringPos.current.y) * lerp;

      if (cursorRef.current) {
        const scale = isClicked.current ? 0.88 : isHovered.current ? 1.15 : 1;
        cursorRef.current.style.transform = `translate3d(${mousePos.current.x}px, ${mousePos.current.y}px, 0) scale(${scale})`;
      }

      if (ringRef.current) {
        const ringScale = isClicked.current ? 0.75 : isHovered.current ? 1.7 : 1;
        ringRef.current.style.transform = `translate3d(${ringPos.current.x}px, ${ringPos.current.y}px, 0) scale(${ringScale})`;
        
        if (isHovered.current) {
          ringRef.current.style.borderColor = "rgba(212, 163, 90, 0.85)";
          ringRef.current.style.backgroundColor = "rgba(212, 163, 90, 0.12)";
        } else {
          ringRef.current.style.borderColor = "rgba(169, 139, 87, 0.45)";
          ringRef.current.style.backgroundColor = "rgba(212, 163, 90, 0.04)";
        }
      }

      rafId.current = requestAnimationFrame(render);
    };

    rafId.current = requestAnimationFrame(render);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mouseup", onMouseUp);
      document.removeEventListener("mouseleave", onMouseLeave);
      document.removeEventListener("mouseenter", onMouseEnter);
      document.documentElement.classList.remove("sutra-custom-cursor");
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, []);

  if (!isEnabled) return null;

  return (
    <>
      {/* Precision Theme Arrow Cursor */}
      <div
        ref={cursorRef}
        aria-hidden="true"
        className="fixed top-0 left-0 pointer-events-none z-[999999] opacity-0 will-change-transform transition-opacity duration-200 -ml-1 -mt-1"
        style={{
          width: "26px",
          height: "26px",
        }}
      >
        <svg
          width="26"
          height="26"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="drop-shadow-[0_2px_6px_rgba(92,58,30,0.35)]"
        >
          {/* Main Arrow Body - Sutra Studio Charcoal with Ivory Border */}
          <path
            d="M3 3L10.5 21L13.5 13.5L21 10.5L3 3Z"
            fill="#171717"
            stroke="#FFFDF9"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
          {/* Left Wing Facet - Sutra Saffron Gold Highlight */}
          <path
            d="M3 3L13.5 13.5L10.5 21L3 3Z"
            fill="#D4A35A"
            fillOpacity="0.9"
          />
          {/* Jewel Accent Point */}
          <circle cx="3" cy="3" r="1.2" fill="#FFFDF9" />
        </svg>
      </div>

      {/* Smooth Trailing Atelier Halo */}
      <div
        ref={ringRef}
        aria-hidden="true"
        className="fixed top-0 left-0 pointer-events-none z-[999998] opacity-0 will-change-transform rounded-full border border-[#A98B57]/45 bg-[#D4A35A]/5 backdrop-blur-[0.5px] transition-all duration-150 ease-out -ml-4 -mt-4"
        style={{
          width: "32px",
          height: "32px",
        }}
      />
    </>
  );
}
