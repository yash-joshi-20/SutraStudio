"use client";

import React, { useEffect, useRef, useState } from "react";
import { Sparkles, Eye, Waves, Play, Pause, RefreshCw } from "lucide-react";

export interface SutraParticleWingsProps {
  className?: string;
  height?: string | number;
  initialMode?: "wings" | "lotus" | "wave";
  interactive?: boolean;
  showControls?: boolean;
  theme?: "warm-gold" | "editorial-dark" | "champagne-light";
}

export function SutraParticleWings({
  className = "",
  height = "520px",
  initialMode = "wings",
  interactive = true,
  showControls = true,
  theme = "warm-gold",
}: SutraParticleWingsProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<"wings" | "lotus" | "wave">(initialMode);
  const [isPlaying, setIsPlaying] = useState(true);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0, targetX: 0, targetY: 0, active: false });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = containerRef.current?.clientWidth || 800);
    let heightPx = (canvas.height = containerRef.current?.clientHeight || 520);

    const handleResize = () => {
      if (!containerRef.current || !canvas) return;
      width = canvas.width = containerRef.current.clientWidth;
      heightPx = canvas.height = containerRef.current.clientHeight;
    };

    window.addEventListener("resize", handleResize);

    // Particle field geometry parameters
    const particleCount = mode === "wings" ? 2200 : mode === "lotus" ? 1800 : 2000;
    const particles: Array<{
      u: number;
      v: number;
      size: number;
      speed: number;
      baseColor: string;
      alpha: number;
    }> = [];

    // Color palette tuned to Sutra Studio warm luxury theme
    const goldTones = [
      "rgba(212, 163, 90,", // #D4A35A Champagne Gold
      "rgba(169, 139, 87,", // #A98B57 Muted Brass
      "rgba(92, 58, 30,",   // #5C3A1E Deep Amber Teak
      "rgba(245, 242, 235,",// #F5F2EB Ivory Warm
      "rgba(234, 223, 203,",// #EADFCB Parchment
    ];

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        u: (i / particleCount) * Math.PI * 2,
        v: (Math.random() - 0.5) * 2,
        size: Math.random() * 1.8 + 0.6,
        speed: 0.003 + Math.random() * 0.004,
        baseColor: goldTones[Math.floor(Math.random() * goldTones.length)],
        alpha: 0.3 + Math.random() * 0.65,
      });
    }

    let time = 0;
    let currentMouseX = 0;
    let currentMouseY = 0;

    const render = () => {
      if (!isPlaying) {
        animationFrameId = requestAnimationFrame(render);
        return;
      }

      time += 0.015;

      // Smooth mouse interpolation
      currentMouseX += (mousePos.targetX - currentMouseX) * 0.06;
      currentMouseY += (mousePos.targetY - currentMouseY) * 0.06;

      ctx.clearRect(0, 0, width, heightPx);

      const centerX = width / 2;
      const centerY = heightPx / 2;
      const scale = Math.min(width, heightPx) * 0.38;

      // Subtle ambient background radial glow
      const radialGlow = ctx.createRadialGradient(
        centerX,
        centerY,
        10,
        centerX,
        centerY,
        scale * 1.4
      );
      radialGlow.addColorStop(0, "rgba(212, 163, 90, 0.06)");
      radialGlow.addColorStop(0.6, "rgba(92, 58, 30, 0.02)");
      radialGlow.addColorStop(1, "rgba(248, 245, 239, 0)");
      ctx.fillStyle = radialGlow;
      ctx.fillRect(0, 0, width, heightPx);

      const mouseInfluenceX = (currentMouseX - centerX) / width;
      const mouseInfluenceY = (currentMouseY - centerY) / heightPx;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.u += p.speed;

        let x3d = 0;
        let y3d = 0;
        let z3d = 0;

        if (mode === "wings") {
          // 3D Parametric Wing Wave (Inspired by Aeterna fluid wings of light)
          const angle = p.u;
          const span = p.v * 1.4;
          const wingSpread = Math.sin(angle * 2 + time) * 0.35;
          const flap = Math.cos(time * 1.2 + Math.abs(span) * 2) * 0.45;

          x3d = Math.sin(angle) * (1.1 + Math.abs(span) * 0.6) * Math.sign(span || 1);
          y3d = flap * Math.abs(span) + Math.cos(angle * 3) * 0.15 + span * 0.2;
          z3d = Math.cos(angle) * 0.8 + wingSpread + p.v * 0.5;

          // Mouse rotation
          const rotY = time * 0.2 + mouseInfluenceX * 1.2;
          const rotX = mouseInfluenceY * 0.8;

          const rx = x3d * Math.cos(rotY) - z3d * Math.sin(rotY);
          const rz = x3d * Math.sin(rotY) + z3d * Math.cos(rotY);
          const ry = y3d * Math.cos(rotX) - rz * Math.sin(rotX);

          x3d = rx;
          y3d = ry;
          z3d = rz;
        } else if (mode === "lotus") {
          // Sacred Lotus Harmonic Mandala Spiral
          const theta = p.u * 3 + time * 0.4;
          const r = Math.pow(Math.abs(Math.sin(theta * 4)), 0.6) * (0.4 + Math.abs(p.v) * 0.9);
          const zWave = Math.sin(r * 8 - time * 2) * 0.35;

          x3d = r * Math.cos(theta);
          y3d = r * Math.sin(theta) + mouseInfluenceY * 0.3;
          z3d = zWave + mouseInfluenceX * 0.5;

          const rotX = 0.55 + mouseInfluenceY * 0.4;
          const rotZ = time * 0.15;

          const rx = x3d * Math.cos(rotZ) - y3d * Math.sin(rotZ);
          const ry = (x3d * Math.sin(rotZ) + y3d * Math.cos(rotZ)) * Math.cos(rotX) - z3d * Math.sin(rotX);
          const rz = y3d * Math.sin(rotX) + z3d * Math.cos(rotX);

          x3d = rx;
          y3d = ry;
          z3d = rz;
        } else {
          // Golden Harmonic Wave Ribbon
          const u = p.u * 2;
          const v = p.v;
          x3d = (p.v * 2.2) + mouseInfluenceX * 0.4;
          y3d = Math.sin(u + time + v * 3) * 0.45 + Math.cos(v * 4 + time * 0.8) * 0.25;
          z3d = Math.cos(u * 0.8 + time * 1.5) * 0.6;
        }

        // 3D to 2D Perspective Projection
        const fov = 400;
        const depth = z3d + 2.8;
        if (depth <= 0.1) continue;

        const projX = centerX + (x3d * scale * fov) / (depth * 280);
        const projY = centerY + (y3d * scale * fov) / (depth * 280);

        const pointSize = Math.max(0.4, (p.size * fov) / (depth * 280));
        const alpha = Math.min(1, Math.max(0.08, p.alpha * (1.2 / depth)));

        // Render shimmering dot
        ctx.beginPath();
        ctx.arc(projX, projY, pointSize, 0, Math.PI * 2);
        ctx.fillStyle = `${p.baseColor} ${alpha})`;
        ctx.fill();

        // Connect near neighbors with delicate golden hair-lines
        if (i % 7 === 0 && i > 0) {
          const prev = particles[i - 1];
          const prevDepth = prev.v + 2.8;
          const prevX = centerX + (x3d * 0.95 * scale * fov) / (prevDepth * 280);
          const prevY = centerY + (y3d * 0.95 * scale * fov) / (prevDepth * 280);

          ctx.beginPath();
          ctx.moveTo(projX, projY);
          ctx.lineTo(prevX, prevY);
          ctx.strokeStyle = `rgba(212, 163, 90, ${alpha * 0.18})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [mode, isPlaying, mousePos.targetX, mousePos.targetY]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!interactive || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setMousePos((prev) => ({
      ...prev,
      targetX: e.clientX - rect.left,
      targetY: e.clientY - rect.top,
      active: true,
    }));
  };

  const handleMouseLeave = () => {
    if (!containerRef.current) return;
    setMousePos((prev) => ({
      ...prev,
      targetX: containerRef.current!.clientWidth / 2,
      targetY: containerRef.current!.clientHeight / 2,
      active: false,
    }));
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`relative w-full rounded-3xl overflow-hidden border border-[#EADFCB] bg-[#0F172A] shadow-2xl ${className}`}
      style={{ height }}
    >
      <canvas ref={canvasRef} className="w-full h-full block cursor-crosshair" />

      {/* Decorative Branding Watermark Overlay */}
      <div className="absolute top-4 left-5 pointer-events-none flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-[#D4A35A] animate-ping" />
        <span className="text-[10px] font-mono tracking-[0.2em] text-[#D4A35A] uppercase">
          SUTRA 3D GEOMETRY ENGINE • {mode.toUpperCase()}
        </span>
      </div>

      {/* Interactive Controls Pill */}
      {showControls && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 p-1.5 rounded-full bg-[#171717]/85 backdrop-blur-md border border-[#A98B57]/40 shadow-xl z-10 text-xs">
          <button
            onClick={() => setMode("wings")}
            className={`px-3 py-1 rounded-full text-[11px] font-medium transition-all cursor-pointer ${
              mode === "wings"
                ? "bg-[#D4A35A] text-[#171717] font-semibold shadow-xs"
                : "text-[#FAF9F5]/70 hover:text-[#FAF9F5]"
            }`}
          >
            Parametric Wings
          </button>

          <button
            onClick={() => setMode("lotus")}
            className={`px-3 py-1 rounded-full text-[11px] font-medium transition-all cursor-pointer ${
              mode === "lotus"
                ? "bg-[#D4A35A] text-[#171717] font-semibold shadow-xs"
                : "text-[#FAF9F5]/70 hover:text-[#FAF9F5]"
            }`}
          >
            Sacred Lotus
          </button>

          <button
            onClick={() => setMode("wave")}
            className={`px-3 py-1 rounded-full text-[11px] font-medium transition-all cursor-pointer ${
              mode === "wave"
                ? "bg-[#D4A35A] text-[#171717] font-semibold shadow-xs"
                : "text-[#FAF9F5]/70 hover:text-[#FAF9F5]"
            }`}
          >
            Harmonic Wave
          </button>

          <div className="w-px h-4 bg-[#A98B57]/40 mx-1" />

          <button
            onClick={() => setIsPlaying(!isPlaying)}
            title={isPlaying ? "Pause animation" : "Play animation"}
            className="p-1.5 rounded-full text-[#FAF9F5]/80 hover:text-[#FAF9F5] hover:bg-white/10 transition-colors cursor-pointer"
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5 text-[#D4A35A]" /> : <Play className="w-3.5 h-3.5 text-[#D4A35A]" />}
          </button>
        </div>
      )}
    </div>
  );
}
