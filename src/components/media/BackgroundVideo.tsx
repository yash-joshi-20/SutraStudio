"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Play, Pause } from "lucide-react";
import { VideoAssetConfig, getVideoConfig } from "@/lib/config/videoRegistry";

export interface BackgroundVideoProps {
  /** Video configuration object or key from SUTRA_VIDEO_REGISTRY */
  video: VideoAssetConfig | string;
  /** Optional custom CSS classes for the container */
  className?: string;
  /** Container layout mode: 'fill' (absolute inset-0) or 'aspect' (preserves 16:9 / 9:16) */
  layout?: "fill" | "aspect";
  /** Custom aspect ratio string when layout is 'aspect' (e.g. "aspect-[16/9]", "aspect-[4/5]") */
  aspectRatioClass?: string;
  /** Overlay gradient type: 'dark-editorial' | 'warm-light' | 'subtle' | 'none' */
  overlay?: "dark-editorial" | "warm-light" | "subtle" | "none";
  /** Optional opacity override for the overlay (0 to 1) */
  overlayOpacity?: number;
  /** Whether to display the subtle accessible pause/play toggle button */
  showPlayPauseToggle?: boolean;
  /** Priority flag for LCP optimization */
  priority?: boolean;
  /** Optional children rendered on top of the video & overlay */
  children?: React.ReactNode;
}

export function BackgroundVideo({
  video,
  className = "",
  layout = "fill",
  aspectRatioClass = "aspect-[16/9]",
  overlay = "dark-editorial",
  overlayOpacity,
  showPlayPauseToggle = true,
  priority = false,
  children,
}: BackgroundVideoProps) {
  const config = typeof video === "string" ? getVideoConfig(video) : video;

  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [hasError, setHasError] = useState<boolean>(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState<boolean>(false);
  const [isSaveData, setIsSaveData] = useState<boolean>(false);

  // Check for reduced motion & Save-Data preferences
  useEffect(() => {
    if (typeof window === "undefined") return;

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(motionQuery.matches);

    const handleMotionChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
      if (e.matches && videoRef.current) {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    };

    motionQuery.addEventListener("change", handleMotionChange);

    // Check Save-Data header/API
    const nav = navigator as unknown as { connection?: { saveData?: boolean } };
    if (nav.connection?.saveData) {
      setIsSaveData(true);
      setIsPlaying(false);
    }

    return () => {
      motionQuery.removeEventListener("change", handleMotionChange);
    };
  }, []);

  // IntersectionObserver to pause video when scrolled off-screen (saves battery & memory)
  useEffect(() => {
    if (!containerRef.current || prefersReducedMotion || isSaveData || hasError) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!videoRef.current) return;
          if (entry.isIntersecting) {
            if (isPlaying) {
              videoRef.current.play().catch(() => {
                // Autoplay may be deferred or blocked by browser policy
              });
            }
          } else {
            videoRef.current.pause();
          }
        });
      },
      { threshold: 0.15 }
    );

    observer.observe(containerRef.current);

    return () => {
      observer.disconnect();
    };
  }, [isPlaying, prefersReducedMotion, isSaveData, hasError]);

  const togglePlayPause = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch((err) => {
        console.warn("Video playback error:", err);
      });
    }
  };

  // Overlay gradient classes based on Sutra Studio Warm Luxury Palette
  const getOverlayClass = () => {
    switch (overlay) {
      case "dark-editorial":
        return "bg-gradient-to-t from-[#0F172A]/85 via-[#0F172A]/40 to-[#0F172A]/20";
      case "warm-light":
        return "bg-gradient-to-t from-[#F8F5EF]/95 via-[#F8F5EF]/60 to-[#F8F5EF]/30";
      case "subtle":
        return "bg-gradient-to-b from-[#5C3A1E]/30 via-transparent to-[#0F172A]/50";
      case "none":
      default:
        return "";
    }
  };

  const containerClasses =
    layout === "fill"
      ? `absolute inset-0 w-full h-full overflow-hidden ${className}`
      : `relative w-full overflow-hidden ${aspectRatioClass} ${className}`;

  const shouldRenderVideo = !prefersReducedMotion && !isSaveData && !hasError;

  return (
    <div ref={containerRef} className={containerClasses} aria-label={config.title}>
      {/* High-Resolution WebP Poster (First to load, fallback on low data / error) */}
      <Image
        src={config.poster.webp}
        alt={config.title}
        fill
        priority={priority}
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 100vw"
        className={`object-cover transition-opacity duration-700 ease-in-out ${
          isLoaded && shouldRenderVideo ? "opacity-0 pointer-events-none" : "opacity-100"
        }`}
      />

      {/* HTML5 Native Video Stream with Mobile & Desktop <source> tags */}
      {shouldRenderVideo && (
        <video
          ref={videoRef}
          muted
          loop
          playsInline
          autoPlay
          preload="metadata"
          onLoadedData={() => setIsLoaded(true)}
          onError={() => setHasError(true)}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${
            isLoaded ? "opacity-100" : "opacity-0"
          }`}
        >
          {/* Mobile High-Efficiency Stream (<768px) */}
          <source
            media="(max-width: 768px)"
            src={config.mobile.webm}
            type="video/webm"
          />
          <source
            media="(max-width: 768px)"
            src={config.mobile.mp4}
            type="video/mp4"
          />

          {/* Desktop High-Definition Stream (>=768px) */}
          <source src={config.desktop.webm} type="video/webm" />
          <source src={config.desktop.mp4} type="video/mp4" />
        </video>
      )}

      {/* Brand Color Gradient Overlay */}
      {overlay !== "none" && (
        <div
          className={`absolute inset-0 pointer-events-none ${getOverlayClass()}`}
          style={overlayOpacity !== undefined ? { opacity: overlayOpacity } : undefined}
        />
      )}

      {/* Accessible Pause / Play Toggle (WCAG 2.2.2 Pause, Stop, Hide) */}
      {showPlayPauseToggle && shouldRenderVideo && isLoaded && (
        <button
          onClick={togglePlayPause}
          type="button"
          aria-label={isPlaying ? "Pause background video" : "Play background video"}
          className="absolute bottom-4 right-4 z-20 w-8 h-8 rounded-full bg-[#0F172A]/70 hover:bg-[#0F172A]/90 text-[#FFFDF9] backdrop-blur-md border border-white/20 flex items-center justify-center transition-all duration-200 hover:scale-105 cursor-pointer touch-target shadow-md"
          title={isPlaying ? "Pause ambient video" : "Play ambient video"}
        >
          {isPlaying ? (
            <Pause className="w-3.5 h-3.5 fill-current" />
          ) : (
            <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
          )}
        </button>
      )}

      {/* Content Children */}
      {children && <div className="relative z-10 w-full h-full">{children}</div>}
    </div>
  );
}
