"use client";

import React, { useEffect, useRef } from "react";
import {
  useMotionValue,
  useSpring,
  useInView,
  useReducedMotion,
} from "framer-motion";

export interface AnimatedNumberProps {
  value: number;
  prefix?: string;
  suffix?: string;
  className?: string;
  duration?: number;
  decimals?: number;
}

export function AnimatedNumber({
  value,
  prefix = "",
  suffix = "",
  className = "",
  duration = 2000,
  decimals = 0,
}: AnimatedNumberProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-40px" });
  const shouldReduceMotion = useReducedMotion();

  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, {
    damping: 30,
    stiffness: 100,
    mass: 0.8,
  });

  useEffect(() => {
    if (shouldReduceMotion) return;
    if (isInView) {
      motionValue.set(value);
    }
  }, [isInView, value, motionValue, shouldReduceMotion]);

  useEffect(() => {
    if (shouldReduceMotion) {
      if (ref.current) {
        ref.current.textContent = `${prefix}${value.toLocaleString("en-IN")}${suffix}`;
      }
      return;
    }

    const unsubscribe = springValue.on("change", (latest) => {
      if (ref.current) {
        const formatted = decimals > 0
          ? latest.toFixed(decimals)
          : Math.round(latest).toLocaleString("en-IN");
        ref.current.textContent = `${prefix}${formatted}${suffix}`;
      }
    });

    return () => unsubscribe();
  }, [springValue, value, prefix, suffix, decimals, shouldReduceMotion]);

  // Initial formatted display for zero layout shift
  const initialDisplay = `${prefix}${value.toLocaleString("en-IN")}${suffix}`;

  return (
    <span
      ref={ref}
      className={`tabular-nums inline-block ${className}`}
      aria-label={`${prefix}${value}${suffix}`}
    >
      {initialDisplay}
    </span>
  );
}
