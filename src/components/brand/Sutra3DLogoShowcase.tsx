"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import {
  RotateCcw,
  Play,
  Pause,
  Compass,
  Sparkles,
  Maximize2,
  Eye,
  Check,
  Layers,
} from "lucide-react";

interface Sutra3DLogoShowcaseProps {
  className?: string;
  height?: string;
  title?: string;
  subtitle?: string;
}

export function Sutra3DLogoShowcase({
  className = "",
  height = "440px",
  title = "Sutra Studio Emblem • 3D Spatial Presentation",
  subtitle = "Precision Three-Dimensional Metallic Rendering of Official Atelier Insignia",
}: Sutra3DLogoShowcaseProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [is3DMode, setIs3DMode] = useState(true);
  const [isAutoRotate, setIsAutoRotate] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [hasWebGL, setHasWebGL] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(false);

  // Three.js References
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const logoGroupRef = useRef<THREE.Group | null>(null);
  const animFrameIdRef = useRef<number | null>(null);

  // Check reduced motion preference
  useEffect(() => {
    if (typeof window !== "undefined") {
      const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
      setReducedMotion(mediaQuery.matches);
      if (mediaQuery.matches) {
        setIsAutoRotate(false);
      }
      const listener = (e: MediaQueryListEvent) => {
        setReducedMotion(e.matches);
        if (e.matches) setIsAutoRotate(false);
      };
      mediaQuery.addEventListener("change", listener);
      return () => mediaQuery.removeEventListener("change", listener);
    }
  }, []);

  // Initialize Three.js Scene
  useEffect(() => {
    if (!is3DMode) return;
    const container = containerRef.current;
    if (!container) return;

    // Check WebGL availability
    try {
      const canvas = document.createElement("canvas");
      const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
      if (!gl) {
        setHasWebGL(false);
        setIs3DMode(false);
        return;
      }
    } catch {
      setHasWebGL(false);
      setIs3DMode(false);
      return;
    }

    const width = container.clientWidth || 600;
    const heightNum = container.clientHeight || 440;

    // 1. Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xfcfbf7); // Warm Ivory ambient
    sceneRef.current = scene;

    // 2. Camera setup
    const camera = new THREE.PerspectiveCamera(40, width / heightNum, 0.1, 100);
    camera.position.set(0, 0.2, 3.2);
    cameraRef.current = camera;

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    renderer.setSize(width, heightNum);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    container.innerHTML = "";
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 4. OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enablePan = false;
    controls.minDistance = 1.8;
    controls.maxDistance = 4.8;
    controls.maxPolarAngle = Math.PI / 1.7;
    controls.minPolarAngle = Math.PI / 3;
    controls.autoRotate = isAutoRotate;
    controls.autoRotateSpeed = 1.8;
    controlsRef.current = controls;

    // 5. Studio Three-Point Lighting
    // Ambient Warm Light
    const ambientLight = new THREE.AmbientLight(0xfff8ee, 1.2);
    scene.add(ambientLight);

    // Warm Key Light (Top-Right)
    const keyLight = new THREE.DirectionalLight(0xffeedd, 2.8);
    keyLight.position.set(3, 4, 3);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    scene.add(keyLight);

    // Cool Soft Fill Light (Left)
    const fillLight = new THREE.DirectionalLight(0xddeeff, 1.2);
    fillLight.position.set(-3, 2, 2);
    scene.add(fillLight);

    // Sharp 24K Gold Rim Light (Back-Top)
    const rimLight = new THREE.DirectionalLight(0xd4a35a, 3.5);
    rimLight.position.set(0, 3, -3);
    scene.add(rimLight);

    // Subtle Ground Glow
    const groundLight = new THREE.DirectionalLight(0x5c3a1e, 0.6);
    groundLight.position.set(0, -3, 1);
    scene.add(groundLight);

    // 6. Build 3D Sutra Studio Logo Medallion
    const logoGroup = new THREE.Group();
    logoGroupRef.current = logoGroup;
    scene.add(logoGroup);

    // Load authentic official logo texture
    const textureLoader = new THREE.TextureLoader();
    textureLoader.load(
      "/brand/sutra-symbol.png",
      (symbolTex) => {
        symbolTex.colorSpace = THREE.SRGBColorSpace;
        symbolTex.needsUpdate = true;

        // Texture for back of medallion
        textureLoader.load("/brand/sutra-monogram.png", (monogramTex) => {
          monogramTex.colorSpace = THREE.SRGBColorSpace;

          // Medallion Gold Material
          const goldMat = new THREE.MeshStandardMaterial({
            color: 0xdfab5c,
            metalness: 0.92,
            roughness: 0.22,
            emissive: 0x4a2e14,
            emissiveIntensity: 0.12,
          });

          // Dark Obsidian Trim Ring
          const obsidianMat = new THREE.MeshStandardMaterial({
            color: 0x171513,
            metalness: 0.85,
            roughness: 0.2,
          });

          // Concentric Stepped Base Disc (Outer Ring)
          const outerDiscGeo = new THREE.CylinderGeometry(0.92, 0.92, 0.08, 64);
          const outerDiscMesh = new THREE.Mesh(outerDiscGeo, goldMat);
          outerDiscMesh.rotation.x = Math.PI / 2;
          outerDiscMesh.castShadow = true;
          outerDiscMesh.receiveShadow = true;
          logoGroup.add(outerDiscMesh);

          // Inner Dark Bevel Disc
          const innerDiscGeo = new THREE.CylinderGeometry(0.85, 0.85, 0.09, 64);
          const innerDiscMesh = new THREE.Mesh(innerDiscGeo, obsidianMat);
          innerDiscMesh.rotation.x = Math.PI / 2;
          logoGroup.add(innerDiscMesh);

          // Front Lotus Symbol Face with Depth Decal
          const symbolFaceGeo = new THREE.PlaneGeometry(1.25, 1.25);
          const symbolFaceMat = new THREE.MeshStandardMaterial({
            map: symbolTex,
            transparent: true,
            roughness: 0.15,
            metalness: 0.9,
            emissive: 0x5c3a1e,
            emissiveIntensity: 0.15,
          });
          const symbolFrontMesh = new THREE.Mesh(symbolFaceGeo, symbolFaceMat);
          symbolFrontMesh.position.z = 0.048;
          logoGroup.add(symbolFrontMesh);

          // Back Face (Monogram Lotus for 360° completeness)
          const symbolBackMesh = new THREE.Mesh(symbolFaceGeo, symbolFaceMat);
          symbolBackMesh.position.z = -0.048;
          symbolBackMesh.rotation.y = Math.PI;
          logoGroup.add(symbolBackMesh);

          // Stepped Architectural Base Pedestal
          const pedestalGroup = new THREE.Group();
          const pedestalBaseGeo = new THREE.CylinderGeometry(0.8, 0.95, 0.12, 48);
          const marbleMat = new THREE.MeshStandardMaterial({
            color: 0xfaf9f5,
            roughness: 0.35,
            metalness: 0.05,
          });
          const pedestalBase = new THREE.Mesh(pedestalBaseGeo, marbleMat);
          pedestalBase.position.y = -1.1;
          pedestalBase.receiveShadow = true;
          pedestalGroup.add(pedestalBase);

          // Brass Trim Collar
          const collarGeo = new THREE.TorusGeometry(0.82, 0.02, 16, 48);
          const collarMesh = new THREE.Mesh(collarGeo, goldMat);
          collarMesh.rotation.x = Math.PI / 2;
          collarMesh.position.y = -1.04;
          pedestalGroup.add(collarMesh);

          // Small Central Brass Mount
          const mountGeo = new THREE.CylinderGeometry(0.08, 0.12, 0.3, 24);
          const mountMesh = new THREE.Mesh(mountGeo, goldMat);
          mountMesh.position.y = -0.92;
          pedestalGroup.add(mountMesh);

          scene.add(pedestalGroup);

          setIsLoading(false);
        });
      },
      undefined,
      () => {
        setIsLoading(false);
      }
    );

    // 7. Render Animation Loop
    let lastTime = performance.now();
    const animate = (time: number) => {
      animFrameIdRef.current = requestAnimationFrame(animate);

      const delta = (time - lastTime) / 1000;
      lastTime = time;

      // Update OrbitControls
      if (controlsRef.current) {
        controlsRef.current.update();
      }

      // Gentle floating animation
      if (logoGroupRef.current) {
        logoGroupRef.current.position.y = Math.sin(time * 0.0015) * 0.04;
      }

      renderer.render(scene, camera);
    };

    animFrameIdRef.current = requestAnimationFrame(animate);

    // 8. Handle Resize
    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [is3DMode, isAutoRotate]);

  // Update controls autoRotate dynamically
  useEffect(() => {
    if (controlsRef.current) {
      controlsRef.current.autoRotate = isAutoRotate;
    }
  }, [isAutoRotate]);

  const handleResetCamera = useCallback(() => {
    if (controlsRef.current && cameraRef.current) {
      controlsRef.current.reset();
      cameraRef.current.position.set(0, 0.2, 3.2);
    }
  }, []);

  const handleSetFrontView = useCallback(() => {
    if (cameraRef.current && controlsRef.current) {
      cameraRef.current.position.set(0, 0, 3.2);
      controlsRef.current.target.set(0, 0, 0);
    }
  }, []);

  return (
    <div
      className={`rounded-3xl bg-[#FFFDF9] border border-[#EADFCB] shadow-warm overflow-hidden flex flex-col justify-between ${className}`}
    >
      {/* Top Header Bar */}
      <div className="p-4 sm:p-5 border-b border-[#EADFCB] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#D4A35A] animate-pulse" />
            <h3 className="font-serif text-base sm:text-lg font-bold text-[#0F172A]">
              {title}
            </h3>
          </div>
          <p className="text-xs text-[#64748B]">{subtitle}</p>
        </div>

        {/* Mode & Control Switchers */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setIs3DMode(!is3DMode)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 border transition-all cursor-pointer ${
              is3DMode
                ? "bg-[#5C3A1E] text-white border-[#5C3A1E] shadow-2xs"
                : "bg-[#F8F5EF] text-[#64748B] border-[#EADFCB] hover:text-[#0F172A]"
            }`}
            aria-label={is3DMode ? "Switch to 2D Emblem" : "Switch to 3D Orbit"}
          >
            {is3DMode ? (
              <>
                <Compass className="w-3.5 h-3.5 text-[#D4A35A]" />
                <span>3D Orbit View</span>
              </>
            ) : (
              <>
                <Eye className="w-3.5 h-3.5" />
                <span>2D Static View</span>
              </>
            )}
          </button>

          {is3DMode && (
            <>
              <button
                type="button"
                onClick={() => setIsAutoRotate(!isAutoRotate)}
                className={`p-2 rounded-full text-xs border transition-all cursor-pointer ${
                  isAutoRotate
                    ? "bg-[#FAF9F5] text-[#5C3A1E] border-[#EADFCB]"
                    : "bg-[#F8F5EF] text-[#94A3B8] border-[#EADFCB]"
                }`}
                title={isAutoRotate ? "Pause Auto-Rotation" : "Start Auto-Rotation"}
                aria-label={isAutoRotate ? "Pause Auto-Rotation" : "Start Auto-Rotation"}
              >
                {isAutoRotate ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              </button>

              <button
                type="button"
                onClick={handleResetCamera}
                className="p-2 rounded-full bg-[#FAF9F5] text-[#5C3A1E] border border-[#EADFCB] hover:bg-white text-xs transition-all cursor-pointer"
                title="Reset Camera Angle"
                aria-label="Reset Camera Angle"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Main Visual Display Area */}
      <div className="relative w-full flex-1 bg-gradient-to-b from-[#FCFBF7] to-[#F5F1E8] overflow-hidden min-h-[360px] sm:min-h-[420px] flex items-center justify-center">
        {is3DMode && hasWebGL ? (
          <>
            <div
              ref={containerRef}
              className="w-full h-full absolute inset-0 cursor-grab active:cursor-grabbing"
              aria-label="Interactive 3D Sutra Studio Emblem. Drag with mouse or swipe to rotate 360 degrees."
            />

            {isLoading && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#FAF9F5]/90 backdrop-blur-xs z-20 space-y-3">
                <div className="w-8 h-8 rounded-full border-2 border-[#D4A35A] border-t-transparent animate-spin" />
                <p className="text-xs font-serif text-[#5C3A1E]">Initializing 3D Spatial Emblem...</p>
              </div>
            )}

            {/* Gesture Hint Pill */}
            <div className="absolute bottom-4 inset-x-4 pointer-events-none z-10 flex justify-center">
              <span className="px-3.5 py-1.5 rounded-full bg-[#171717]/75 backdrop-blur-md text-[11px] font-medium text-white/90 border border-white/10 shadow-sm flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-[#D4A35A]" />
                Drag to rotate 360° • Scroll to zoom
              </span>
            </div>
          </>
        ) : (
          /* Lightweight Static 2D Fallback with embossed gold styling */
          <div className="p-8 flex flex-col items-center justify-center text-center space-y-6 max-w-md mx-auto">
            <div className="relative w-48 h-48 sm:w-56 sm:h-56 rounded-full bg-gradient-to-b from-[#FFFDF9] via-[#FAF9F5] to-[#EADFCB] p-6 shadow-2xl border-4 border-[#FFFDF9] flex items-center justify-center">
              <img
                src="/brand/sutra-symbol.png"
                alt="Official Sutra Studio Lotus Insignia"
                className="w-full h-full object-contain filter drop-shadow-md"
              />
            </div>
            <div className="space-y-1">
              <h4 className="font-serif text-lg font-bold text-[#0F172A]">
                The Sutra Studio Insignia
              </h4>
              <p className="text-xs text-[#64748B] leading-relaxed">
                Rooted in sacred Indian geometric symmetry, Pramāna proportions, and warm gold metallic luster.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Technical Spec Bar */}
      <div className="p-3.5 sm:p-4 bg-[#FAF9F5] border-t border-[#EADFCB] flex flex-wrap items-center justify-between gap-3 text-[11px] text-[#64748B]">
        <div className="flex items-center gap-3">
          <span className="font-semibold text-[#5C3A1E]">Official Brand Asset</span>
          <span className="text-[#CBD5E1]">•</span>
          <span>Double-Sided 24K Brass PBR</span>
          <span className="text-[#CBD5E1] hidden sm:inline">•</span>
          <span className="hidden sm:inline">Pramāna Symmetry</span>
        </div>
        <div className="flex items-center gap-2 text-[#2E7D4F] font-medium">
          <Check className="w-3.5 h-3.5" />
          <span>Reduced-Motion Accessible</span>
        </div>
      </div>
    </div>
  );
}
