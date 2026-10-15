"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { Box, RotateCw, ZoomIn, ZoomOut, Maximize2, RefreshCw } from "lucide-react";

interface ThreeDModelViewerProps {
  modelUrl?: string;
  title?: string;
  className?: string;
}

export function ThreeDModelViewer({
  modelUrl,
  title = "Spatial 3D Asset",
  className = "",
}: ThreeDModelViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isWireframe, setIsWireframe] = useState(false);
  const [autoRotate, setAutoRotate] = useState(true);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const meshRef = useRef<THREE.Mesh | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 1. Setup Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#FAF9F5"); // Warm ivory studio background
    sceneRef.current = scene;

    // 2. Setup Camera
    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    camera.position.set(3, 2.5, 4);
    camera.lookAt(0, 0, 0);

    // 3. Setup Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    container.innerHTML = "";
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 4. Lighting — Luxury warm studio atmosphere
    const ambientLight = new THREE.AmbientLight(0xfffdf9, 1.5); // Warm ambient light
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xfff5e6, 2.2); // Warm studio keylight
    dirLight.position.set(4, 7, 5);
    dirLight.castShadow = true;
    scene.add(dirLight);

    const fillLight = new THREE.DirectionalLight(0xf8f5ef, 1.2); // Soft fill light
    fillLight.position.set(-4, 3, 3);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xd4a35a, 1.8); // Antique brass rim accent
    rimLight.position.set(0, 4, -5);
    scene.add(rimLight);

    // 5. Studio Floor Grid
    const grid = new THREE.GridHelper(10, 20, 0xa98b57, 0xe5e1d8);
    grid.position.y = -1.2;
    scene.add(grid);

    // 6. Centered Transparent Brand Emblem Group
    const emblemGroup = new THREE.Group();
    emblemGroup.position.set(0, 0, 0);

    // A. Luxury Ivory Pedestal Base
    const pedestalGeo = new THREE.CylinderGeometry(1.6, 1.7, 0.15, 64);
    const pedestalMat = new THREE.MeshStandardMaterial({
      color: 0xf4efe6,
      roughness: 0.35,
      metalness: 0.1,
    });
    const pedestal = new THREE.Mesh(pedestalGeo, pedestalMat);
    pedestal.position.y = -1.1;
    pedestal.receiveShadow = true;
    emblemGroup.add(pedestal);

    // B. Outer Antique Brass Concentric Ring
    const ringGeo = new THREE.TorusGeometry(1.4, 0.035, 24, 100);
    const ringMat = new THREE.MeshStandardMaterial({
      color: 0xd4a35a,
      metalness: 0.85,
      roughness: 0.2,
    });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.position.y = 0;
    ringMesh.castShadow = true;
    emblemGroup.add(ringMesh);

    // C. Center Transparent Brand Emblem Medallion
    const loader = new THREE.TextureLoader();
    loader.setCrossOrigin("anonymous");
    const emblemTexture = loader.load("/brand/sutra-symbol.png", () => {
      setIsLoading(false);
    });
    emblemTexture.colorSpace = THREE.SRGBColorSpace;

    const emblemPlaneGeo = new THREE.PlaneGeometry(1.9, 1.9);
    const emblemPlaneMat = new THREE.MeshStandardMaterial({
      map: emblemTexture,
      transparent: true,
      alphaTest: 0.05,
      side: THREE.DoubleSide,
      metalness: 0.7,
      roughness: 0.25,
      color: 0xd4a35a,
    });
    const emblemPlane = new THREE.Mesh(emblemPlaneGeo, emblemPlaneMat);
    emblemPlane.position.set(0, 0, 0);
    emblemPlane.castShadow = true;
    emblemGroup.add(emblemPlane);

    scene.add(emblemGroup);
    meshRef.current = emblemGroup as unknown as THREE.Mesh;

    setIsLoading(false);

    // 7. Mouse Orbit Interaction
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging || !meshRef.current) return;
      const deltaX = e.clientX - prevMouseX;
      const deltaY = e.clientY - prevMouseY;
      meshRef.current.rotation.y += deltaX * 0.01;
      meshRef.current.rotation.x += deltaY * 0.01;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      camera.position.z = Math.max(2, Math.min(8, camera.position.z + e.deltaY * 0.005));
    };

    // Touch Support
    let prevTouchX = 0;
    let prevTouchY = 0;

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        isDragging = true;
        prevTouchX = e.touches[0].clientX;
        prevTouchY = e.touches[0].clientY;
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!isDragging || !meshRef.current || e.touches.length !== 1) return;
      const deltaX = e.touches[0].clientX - prevTouchX;
      const deltaY = e.touches[0].clientY - prevTouchY;
      meshRef.current.rotation.y += deltaX * 0.01;
      meshRef.current.rotation.x += deltaY * 0.01;
      prevTouchX = e.touches[0].clientX;
      prevTouchY = e.touches[0].clientY;
    };

    const onTouchEnd = () => {
      isDragging = false;
    };

    const dom = renderer.domElement;
    dom.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    dom.addEventListener("wheel", onWheel, { passive: false });
    dom.addEventListener("touchstart", onTouchStart);
    dom.addEventListener("touchmove", onTouchMove);
    dom.addEventListener("touchend", onTouchEnd);

    // 8. Animation Loop
    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      if (meshRef.current && autoRotate && !isDragging) {
        meshRef.current.rotation.y += 0.005;
      }
      renderer.render(scene, camera);
    };
    animate();

    // 9. Resize Handling
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
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      dom.removeEventListener("mousedown", onMouseDown);
      dom.removeEventListener("wheel", onWheel);
      dom.removeEventListener("touchstart", onTouchStart);
      dom.removeEventListener("touchmove", onTouchMove);
      dom.removeEventListener("touchend", onTouchEnd);
      renderer.dispose();
    };
  }, [modelUrl, autoRotate]);

  const toggleWireframe = () => {
    if (meshRef.current && meshRef.current.material) {
      const mat = meshRef.current.material as THREE.MeshStandardMaterial;
      mat.wireframe = !mat.wireframe;
      setIsWireframe(mat.wireframe);
    }
  };

  const resetCamera = () => {
    if (meshRef.current) {
      meshRef.current.rotation.set(0, 0, 0);
    }
  };

  return (
    <div className={`relative rounded-2xl overflow-hidden border border-[#E5E1D8] bg-[#FAF9F5] shadow-sm ${className}`}>
      {/* 3D WebGL Canvas */}
      <div
        ref={containerRef}
        className="w-full h-80 sm:h-96 cursor-grab active:cursor-grabbing touch-none"
      />

      {/* Floating Header */}
      <div className="absolute top-3 left-3 z-10 flex items-center gap-2">
        <span className="rounded-full bg-[#171717]/85 backdrop-blur-md px-3 py-1 text-[11px] font-semibold text-white flex items-center gap-1.5 shadow-sm">
          <Box className="w-3.5 h-3.5 text-[#A98B57]" />
          <span>Interactive 3D Asset</span>
        </span>
        <span className="rounded-full bg-[#FAF9F5]/90 backdrop-blur-md border border-[#E5E1D8] px-2.5 py-1 text-[11px] font-mono text-[#5C3A1E]">
          GLB / WebGL
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
          title="Toggle Auto Rotation"
        >
          <RotateCw className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={toggleWireframe}
          className={`p-1.5 rounded-lg text-xs font-medium transition-colors ${
            isWireframe ? "bg-[#A98B57] text-white" : "text-[#171717] hover:bg-[#FAF9F5]"
          }`}
          title="Toggle Wireframe Mesh"
        >
          <span className="font-mono text-xs px-0.5">3D</span>
        </button>

        <button
          type="button"
          onClick={resetCamera}
          className="p-1.5 rounded-lg text-[#171717] hover:bg-[#FAF9F5] transition-colors"
          title="Reset View"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Hint Footer */}
      <div className="absolute bottom-3 left-3 z-10 text-[10px] text-[#78716C] bg-[#FFFFFF]/80 backdrop-blur-sm px-2.5 py-1 rounded-md border border-[#E5E1D8] pointer-events-none">
        Drag to rotate • Scroll to zoom
      </div>
    </div>
  );
}
