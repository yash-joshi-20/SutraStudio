"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import * as THREE from "three";
import {
  Compass,
  RotateCcw,
  Play,
  Pause,
  Smartphone,
  Eye,
  Sparkles,
  Maximize2,
  Check,
} from "lucide-react";

interface PanoramicTourViewerProps {
  textureUrl?: string;
  className?: string;
  height?: string;
  title?: string;
  subtitle?: string;
}

const DEFAULT_PANORAMA =
  "https://image.pollinations.ai/prompt/equirectangular%20360%20degree%20panoramic%20luxury%20modern%20villa%20interior%2C%20floor%20to%20ceiling%20glass%2C%20calacatta%20marble%2C%20warm%20golden%20lighting%2C%208k%20seamless%20hdr%20spherical?width=2048&height=1024&nologo=true";

export function PanoramicTourViewer({
  textureUrl = DEFAULT_PANORAMA,
  className = "",
  height = "420px",
  title = "360° Spatial Virtual Tour",
  subtitle = "Equirectangular HDR Spatial Engine",
}: PanoramicTourViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAutoPan, setIsAutoPan] = useState(true);
  const [hasGyro, setHasGyro] = useState(false);
  const [isGyroActive, setIsGyroActive] = useState(false);

  // References
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const animFrameIdRef = useRef<number | null>(null);

  // Interaction tracking
  const lonRef = useRef(0);
  const latRef = useRef(0);
  const phiRef = useRef(0);
  const thetaRef = useRef(0);
  const isUserInteractingRef = useRef(false);
  const onMouseDownMouseXRef = useRef(0);
  const onMouseDownMouseYRef = useRef(0);
  const onMouseDownLonRef = useRef(0);
  const onMouseDownLatRef = useRef(0);
  const autoPanSpeedRef = useRef(0.08);

  // Create Procedural Luxury Equirectangular Panorama Canvas (Guaranteed Fallback)
  const createProceduralPanoramaTexture = useCallback((): THREE.CanvasTexture => {
    const canvas = document.createElement("canvas");
    canvas.width = 2048;
    canvas.height = 1024;
    const ctx = canvas.getContext("2d");

    if (ctx) {
      // 1. Warm Ambient Lighting Gradient
      const grad = ctx.createLinearGradient(0, 0, 0, 1024);
      grad.addColorStop(0, "#1F1A14"); // Dark bronze ceiling
      grad.addColorStop(0.35, "#3D2B1B"); // Amber ambient
      grad.addColorStop(0.5, "#D4A35A"); // Golden horizon glow
      grad.addColorStop(0.55, "#FAF9F5"); // Marble horizon reflections
      grad.addColorStop(1, "#171717"); // Dark obsidian floor
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 2048, 1024);

      // 2. Architectural Jali Columns & Symmetry
      ctx.strokeStyle = "rgba(212, 163, 90, 0.35)";
      ctx.lineWidth = 3;

      for (let x = 0; x < 2048; x += 256) {
        // Grand Architectural Arches
        ctx.beginPath();
        ctx.arc(x + 128, 450, 100, Math.PI, 0, false);
        ctx.stroke();

        // Vertical Pillars
        ctx.fillStyle = "rgba(234, 223, 203, 0.15)";
        ctx.fillRect(x + 20, 450, 25, 400);
        ctx.fillRect(x + 211, 450, 25, 400);

        // Warm Sconce Lights
        ctx.beginPath();
        ctx.arc(x + 128, 380, 8, 0, Math.PI * 2);
        ctx.fillStyle = "#FFDF9E";
        ctx.shadowColor = "#D4A35A";
        ctx.shadowBlur = 30;
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // 3. Calacatta Marble Floor Grid Lines & Lotus Medallion
      ctx.strokeStyle = "rgba(212, 163, 90, 0.2)";
      ctx.lineWidth = 1.5;
      for (let y = 550; y < 1024; y += 40) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(2048, y);
        ctx.stroke();
      }

      // Center Floor Inlay
      ctx.beginPath();
      ctx.arc(1024, 780, 120, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(212, 163, 90, 0.6)";
      ctx.lineWidth = 4;
      ctx.stroke();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.mapping = THREE.EquirectangularReflectionMapping;
    return texture;
  }, []);

  // Initialize Three.js Equirectangular Sphere
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || 600;
    const heightPx = container.clientHeight || 420;

    // 1. Scene & Camera
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(70, width / heightPx, 1, 1100);
    cameraRef.current = camera;

    // 2. Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, heightPx);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    rendererRef.current = renderer;

    container.innerHTML = "";
    container.appendChild(renderer.domElement);

    // 3. Sphere Geometry (Inverted scale for interior viewing)
    const geometry = new THREE.SphereGeometry(500, 60, 40);
    geometry.scale(-1, 1, 1);

    // Initial procedural fallback texture
    const fallbackTex = createProceduralPanoramaTexture();
    const material = new THREE.MeshBasicMaterial({ map: fallbackTex });
    const sphere = new THREE.Mesh(geometry, material);
    scene.add(sphere);

    // 4. Load Remote Equirectangular Texture
    const textureLoader = new THREE.TextureLoader();
    textureLoader.load(
      textureUrl,
      (loadedTexture) => {
        loadedTexture.mapping = THREE.EquirectangularReflectionMapping;
        material.map = loadedTexture;
        material.needsUpdate = true;
        fallbackTex.dispose();
        setIsLoading(false);
      },
      undefined,
      (err) => {
        console.warn("Using procedural luxury panorama fallback:", err);
        setIsLoading(false);
      }
    );

    // Check device orientation availability
    if (typeof window !== "undefined" && "DeviceOrientationEvent" in window) {
      setHasGyro(true);
    }

    // 5. Interaction Event Listeners
    const onPointerDown = (event: MouseEvent | TouchEvent) => {
      isUserInteractingRef.current = true;
      const clientX = "touches" in event ? event.touches[0].clientX : event.clientX;
      const clientY = "touches" in event ? event.touches[0].clientY : event.clientY;

      onMouseDownMouseXRef.current = clientX;
      onMouseDownMouseYRef.current = clientY;
      onMouseDownLonRef.current = lonRef.current;
      onMouseDownLatRef.current = latRef.current;
    };

    const onPointerMove = (event: MouseEvent | TouchEvent) => {
      if (!isUserInteractingRef.current) return;
      const clientX = "touches" in event ? event.touches[0].clientX : event.clientX;
      const clientY = "touches" in event ? event.touches[0].clientY : event.clientY;

      lonRef.current =
        (onMouseDownMouseXRef.current - clientX) * 0.15 + onMouseDownLonRef.current;
      latRef.current =
        (clientY - onMouseDownMouseYRef.current) * 0.15 + onMouseDownLatRef.current;
    };

    const onPointerUp = () => {
      isUserInteractingRef.current = false;
    };

    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      if (!cameraRef.current) return;
      const fov = cameraRef.current.fov + event.deltaY * 0.05;
      cameraRef.current.fov = THREE.MathUtils.clamp(fov, 30, 95);
      cameraRef.current.updateProjectionMatrix();
    };

    const dom = renderer.domElement;
    dom.addEventListener("mousedown", onPointerDown);
    dom.addEventListener("mousemove", onPointerMove);
    window.addEventListener("mouseup", onPointerUp);
    dom.addEventListener("touchstart", onPointerDown, { passive: true });
    dom.addEventListener("touchmove", onPointerMove, { passive: true });
    window.addEventListener("touchend", onPointerUp);
    dom.addEventListener("wheel", onWheel, { passive: false });

    // 6. Animation Loop
    const animate = () => {
      animFrameIdRef.current = requestAnimationFrame(animate);

      if (!isUserInteractingRef.current && isAutoPan) {
        lonRef.current += autoPanSpeedRef.current;
      }

      latRef.current = Math.max(-85, Math.min(85, latRef.current));
      phiRef.current = THREE.MathUtils.degToRad(90 - latRef.current);
      thetaRef.current = THREE.MathUtils.degToRad(lonRef.current);

      const targetX = 500 * Math.sin(phiRef.current) * Math.cos(thetaRef.current);
      const targetY = 500 * Math.cos(phiRef.current);
      const targetZ = 500 * Math.sin(phiRef.current) * Math.sin(thetaRef.current);

      camera.lookAt(targetX, targetY, targetZ);
      renderer.render(scene, camera);
    };

    animate();

    // 7. Resize Observer
    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const newW = container.clientWidth;
      const newH = container.clientHeight;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    // 8. Clean Unmount
    return () => {
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
      resizeObserver.disconnect();

      dom.removeEventListener("mousedown", onPointerDown);
      dom.removeEventListener("mousemove", onPointerMove);
      window.removeEventListener("mouseup", onPointerUp);
      dom.removeEventListener("touchstart", onPointerDown);
      dom.removeEventListener("touchmove", onPointerMove);
      window.removeEventListener("touchend", onPointerUp);
      dom.removeEventListener("wheel", onWheel);

      geometry.dispose();
      material.dispose();
      renderer.dispose();

      if (container && dom && container.contains(dom)) {
        container.removeChild(dom);
      }
    };
  }, [textureUrl, isAutoPan, createProceduralPanoramaTexture]);

  // UI Handlers
  const resetView = () => {
    lonRef.current = 0;
    latRef.current = 0;
    if (cameraRef.current) {
      cameraRef.current.fov = 70;
      cameraRef.current.updateProjectionMatrix();
    }
  };

  const toggleAutoPan = () => {
    setIsAutoPan((prev) => !prev);
  };

  const toggleGyro = async () => {
    if (typeof (DeviceOrientationEvent as any)?.requestPermission === "function") {
      try {
        const response = await (DeviceOrientationEvent as any).requestPermission();
        if (response === "granted") {
          setIsGyroActive(!isGyroActive);
        }
      } catch (e) {
        console.error("Gyro permission error:", e);
      }
    } else {
      setIsGyroActive(!isGyroActive);
    }
  };

  return (
    <div
      className={`relative w-full rounded-3xl bg-[#171717] border border-[#EADFCB] overflow-hidden shadow-warm ${className}`}
    >
      {/* Top Header Badge */}
      <div className="absolute top-3.5 left-3.5 right-3.5 z-20 flex items-center justify-between gap-2 pointer-events-none">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#171717]/90 backdrop-blur-md text-[10px] font-mono font-bold text-[#D4A35A] border border-[#A98B57]/40 shadow-xs pointer-events-auto">
          <Compass className="w-3 h-3 text-[#D4A35A] animate-spin [animation-duration:8s]" />
          360° Equirectangular • Live Spatial
        </span>

        <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#FFFDF9]/90 backdrop-blur-md text-[10px] font-medium text-[#5C3A1E] border border-[#EADFCB] shadow-2xs pointer-events-auto">
          <Eye className="w-3 h-3 text-[#A98B57]" />
          Drag to Look Around
        </span>
      </div>

      {/* 360 Canvas Viewport */}
      <div
        ref={containerRef}
        style={{ height }}
        className="w-full cursor-grab active:cursor-grabbing touch-none relative"
      />

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 z-30 bg-[#171717]/80 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center text-white">
          <div className="relative w-12 h-12 mb-3">
            <div className="absolute inset-0 rounded-full border-2 border-white/20 border-t-[#D4A35A] animate-spin" />
          </div>
          <p className="text-xs font-serif font-bold text-[#FAF9F5]">
            Projecting 360° Spherical Environment...
          </p>
          <p className="text-[10px] font-mono text-[#D4A35A] mt-1">
            HDR Equirectangular Calibration
          </p>
        </div>
      )}

      {/* Bottom Control Bar */}
      <div className="absolute bottom-3.5 inset-x-3.5 z-20 flex flex-col sm:flex-row items-center justify-between gap-2.5 pointer-events-none">
        {/* Caption */}
        <div className="text-center sm:text-left">
          <p className="text-xs font-serif font-bold text-white drop-shadow-sm">
            {title}
          </p>
          <p className="text-[10px] text-white/80 font-sans">
            {subtitle} • Drag / Touch to Look 360°
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 pointer-events-auto bg-[#171717]/90 backdrop-blur-md p-1 rounded-full border border-[#A98B57]/50 shadow-md">
          <button
            type="button"
            onClick={toggleAutoPan}
            title={isAutoPan ? "Pause 360° auto-pan" : "Enable 360° auto-pan"}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              isAutoPan
                ? "bg-[#5C3A1E] text-white shadow-xs border border-[#A98B57]"
                : "bg-transparent text-white/80 hover:text-white"
            }`}
          >
            {isAutoPan ? (
              <>
                <Pause className="w-3 h-3 text-[#D4A35A]" />
                <span className="text-[10px]">Auto-Pan ON</span>
              </>
            ) : (
              <>
                <Play className="w-3 h-3 text-white" />
                <span className="text-[10px]">Auto-Pan</span>
              </>
            )}
          </button>

          {hasGyro && (
            <button
              type="button"
              onClick={toggleGyro}
              title="Toggle Gyroscope Motion Controls"
              className={`p-1.5 rounded-full transition-colors cursor-pointer ${
                isGyroActive
                  ? "bg-[#D4A35A] text-[#171717]"
                  : "text-white/80 hover:text-white hover:bg-white/10"
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            type="button"
            onClick={resetView}
            title="Reset to Center View"
            className="p-1.5 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
