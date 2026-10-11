"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { Compass, RotateCw, ZoomIn, ZoomOut, CheckCircle2, AlertCircle } from "lucide-react";

interface Panorama360ViewerProps {
  imageUrl?: string;
  title?: string;
  className?: string;
}

export function Panorama360Viewer({
  imageUrl = "https://image.pollinations.ai/prompt/luxury%20modern%20penthouse%20living%20room%2C%20equirectangular%20360%20panorama%2C%20warm%20ivory%20and%20brass%2C%208k?width=4096&height=2048&nologo=true",
  title = "360° Architectural Panorama",
  className = "",
}: Panorama360ViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [autoRotate, setAutoRotate] = useState(true);
  const [seamValid, setSeamValid] = useState(true);
  const [aspectRatio, setAspectRatio] = useState("2:1");
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 1. Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // 2. Camera positioned at center of panorama sphere
    const camera = new THREE.PerspectiveCamera(
      75,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 0, 0.1);
    cameraRef.current = camera;

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.innerHTML = "";
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 4. Inverted Sphere for Equirectangular projection
    const sphereGeometry = new THREE.SphereGeometry(50, 60, 40);
    // Invert the sphere inside-out so texture maps to inner surface
    sphereGeometry.scale(-1, 1, 1);

    // Texture Loader
    const textureLoader = new THREE.TextureLoader();
    textureLoader.setCrossOrigin("anonymous");

    const texture = textureLoader.load(imageUrl, (tex) => {
      tex.wrapS = THREE.RepeatWrapping;
      tex.repeat.x = 1;
      const img = tex.image as HTMLImageElement;
      if (img && img.width && img.height) {
        const ratio = img.width / img.height;
        setAspectRatio(`${ratio.toFixed(1)}:1`);
        setSeamValid(Math.abs(ratio - 2.0) <= 0.08);
      }
    });

    const sphereMaterial = new THREE.MeshBasicMaterial({ map: texture });
    const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    scene.add(sphere);

    // 5. Look rotation angles
    let lon = 0;
    let lat = 0;
    let phi = 0;
    let theta = 0;

    let isUserInteracting = false;
    let onPointerDownPointerX = 0;
    let onPointerDownPointerY = 0;
    let onPointerDownLon = 0;
    let onPointerDownLat = 0;

    const onPointerDown = (e: MouseEvent) => {
      isUserInteracting = true;
      onPointerDownPointerX = e.clientX;
      onPointerDownPointerY = e.clientY;
      onPointerDownLon = lon;
      onPointerDownLat = lat;
    };

    const onPointerMove = (e: MouseEvent) => {
      if (!isUserInteracting) return;
      lon = (onPointerDownPointerX - e.clientX) * 0.15 + onPointerDownLon;
      lat = (e.clientY - onPointerDownPointerY) * 0.15 + onPointerDownLat;
    };

    const onPointerUp = () => {
      isUserInteracting = false;
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      camera.fov = Math.max(30, Math.min(100, camera.fov + e.deltaY * 0.05));
      camera.updateProjectionMatrix();
    };

    // Touch Support
    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        isUserInteracting = true;
        onPointerDownPointerX = e.touches[0].clientX;
        onPointerDownPointerY = e.touches[0].clientY;
        onPointerDownLon = lon;
        onPointerDownLat = lat;
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!isUserInteracting || e.touches.length !== 1) return;
      lon = (onPointerDownPointerX - e.touches[0].clientX) * 0.15 + onPointerDownLon;
      lat = (e.touches[0].clientY - onPointerDownPointerY) * 0.15 + onPointerDownLat;
    };

    const onTouchEnd = () => {
      isUserInteracting = false;
    };

    const dom = renderer.domElement;
    dom.addEventListener("mousedown", onPointerDown);
    window.addEventListener("mousemove", onPointerMove);
    window.addEventListener("mouseup", onPointerUp);
    dom.addEventListener("wheel", onWheel, { passive: false });
    dom.addEventListener("touchstart", onTouchStart);
    dom.addEventListener("touchmove", onTouchMove);
    dom.addEventListener("touchend", onTouchEnd);

    // 6. Animation loop
    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);

      if (autoRotate && !isUserInteracting) {
        lon += 0.08;
      }

      lat = Math.max(-85, Math.min(85, lat));
      phi = THREE.MathUtils.degToRad(90 - lat);
      theta = THREE.MathUtils.degToRad(lon);

      const target = new THREE.Vector3();
      target.x = 500 * Math.sin(phi) * Math.cos(theta);
      target.y = 500 * Math.cos(phi);
      target.z = 500 * Math.sin(phi) * Math.sin(theta);

      camera.lookAt(target);
      renderer.render(scene, camera);
    };
    animate();

    // 7. Resize handling
    const handleResize = () => {
      if (!container || !renderer) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", onPointerMove);
      window.removeEventListener("mouseup", onPointerUp);
      dom.removeEventListener("mousedown", onPointerDown);
      dom.removeEventListener("wheel", onWheel);
      dom.removeEventListener("touchstart", onTouchStart);
      dom.removeEventListener("touchmove", onTouchMove);
      dom.removeEventListener("touchend", onTouchEnd);
      renderer.dispose();
    };
  }, [imageUrl, autoRotate]);

  return (
    <div className={`relative rounded-2xl overflow-hidden border border-[#E5E1D8] bg-[#FAF9F5] shadow-sm ${className}`}>
      {/* 360 Spherical Canvas */}
      <div
        ref={containerRef}
        className="w-full h-80 sm:h-96 cursor-grab active:cursor-grabbing touch-none"
      />

      {/* Floating Header */}
      <div className="absolute top-3 left-3 z-10 flex items-center gap-2">
        <span className="rounded-full bg-[#171717]/85 backdrop-blur-md px-3 py-1 text-[11px] font-semibold text-white flex items-center gap-1.5 shadow-sm">
          <Compass className="w-3.5 h-3.5 text-[#A98B57]" />
          <span>360° Spherical VR</span>
        </span>
        <span className="rounded-full bg-[#FAF9F5]/90 backdrop-blur-md border border-[#E5E1D8] px-2.5 py-1 text-[11px] font-mono text-[#5C3A1E] flex items-center gap-1">
          {seamValid ? (
            <CheckCircle2 className="w-3 h-3 text-[#2E7D4F]" />
          ) : (
            <AlertCircle className="w-3 h-3 text-[#B45309]" />
          )}
          <span>{aspectRatio} Equirectangular</span>
        </span>
      </div>

      {/* Control Buttons */}
      <div className="absolute bottom-3 right-3 z-10 flex items-center gap-1.5 bg-[#FFFFFF]/90 backdrop-blur-md p-1 rounded-xl border border-[#E5E1D8] shadow-sm">
        <button
          type="button"
          onClick={() => setAutoRotate(!autoRotate)}
          className={`p-1.5 rounded-lg text-xs font-medium transition-colors ${
            autoRotate ? "bg-[#A98B57] text-white" : "text-[#171717] hover:bg-[#FAF9F5]"
          }`}
          title="Toggle Auto Horizon Pan"
        >
          <RotateCw className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => {
            if (cameraRef.current) {
              cameraRef.current.fov = Math.max(30, cameraRef.current.fov - 10);
              cameraRef.current.updateProjectionMatrix();
            }
          }}
          className="p-1.5 rounded-lg text-[#171717] hover:bg-[#FAF9F5] transition-colors"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={() => {
            if (cameraRef.current) {
              cameraRef.current.fov = Math.min(100, cameraRef.current.fov + 10);
              cameraRef.current.updateProjectionMatrix();
            }
          }}
          className="p-1.5 rounded-lg text-[#171717] hover:bg-[#FAF9F5] transition-colors"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
      </div>

      {/* Hint Footer */}
      <div className="absolute bottom-3 left-3 z-10 text-[10px] text-[#78716C] bg-[#FFFFFF]/80 backdrop-blur-sm px-2.5 py-1 rounded-md border border-[#E5E1D8] pointer-events-none">
        Drag to look 360° around • Scroll to zoom
      </div>
    </div>
  );
}
