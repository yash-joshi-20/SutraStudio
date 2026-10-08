"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import {
  RotateCcw,
  Play,
  Pause,
  Box,
  Sparkles,
  Maximize2,
  CheckCircle2,
  Layers,
  ZoomIn,
} from "lucide-react";

interface Interactive3DViewerProps {
  modelUrl?: string;
  className?: string;
  height?: string;
  title?: string;
  subtitle?: string;
  allowPresetSwitch?: boolean;
}

const PRESET_MODELS = [
  {
    id: "tablet",
    name: "Sutra Studio Luxury Tablet",
    url: "sutra-tablet",
    polyCount: "86.4k Polys",
    material: "Obsidian & 24K Brass PBR",
  },
  {
    id: "pedestal",
    name: "Vedic Gold Lotus Sculpture",
    url: "procedural-lotus",
    polyCount: "64.2k Polys",
    material: "24K Brass PBR",
  },
];

export function Interactive3DViewer({
  modelUrl,
  className = "",
  height = "420px",
  title = "3D Spatial Asset Pipeline",
  subtitle = "Interactive WebGL 2.0 Real-Time PBR Renderer",
  allowPresetSwitch = true,
}: Interactive3DViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadProgress, setLoadProgress] = useState(0);
  const [isAutoRotate, setIsAutoRotate] = useState(true);
  const [activePresetIndex, setActivePresetIndex] = useState(0);
  const [fps, setFps] = useState(60);

  // References for Three.js instance
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const animFrameIdRef = useRef<number | null>(null);
  const currentModelGroupRef = useRef<THREE.Group | null>(null);
  const initialCameraPosRef = useRef<THREE.Vector3>(new THREE.Vector3(0, 1.2, 2.5));

  // Build Procedural Luxury Tablet Monolith (Branded Studio UI)
  const buildProceduralTablet = useCallback((): THREE.Group => {
    const group = new THREE.Group();

    // 1. Tablet Obsidian Chassis (Chamfered look)
    const chassisGeo = new THREE.BoxGeometry(1.25, 1.7, 0.05);
    const obsidianMat = new THREE.MeshStandardMaterial({
      color: 0x141210,
      metalness: 0.95,
      roughness: 0.15,
    });
    const chassisMesh = new THREE.Mesh(chassisGeo, obsidianMat);
    chassisMesh.position.y = 0.85;
    chassisMesh.castShadow = true;
    chassisMesh.receiveShadow = true;
    group.add(chassisMesh);

    // 2. 24K Brass Perimeter Bezel Trim
    const trimGeo = new THREE.BoxGeometry(1.28, 1.73, 0.045);
    const goldMat = new THREE.MeshStandardMaterial({
      color: 0xd4a35a,
      metalness: 0.9,
      roughness: 0.2,
      emissive: 0x5c3a1e,
      emissiveIntensity: 0.1,
    });
    const trimMesh = new THREE.Mesh(trimGeo, goldMat);
    trimMesh.position.y = 0.85;
    group.add(trimMesh);

    // 3. Screen Texture with Sutra Studio Authentic Live Website Interface
    let screenTex: THREE.Texture;
    if (typeof window !== "undefined") {
      screenTex = new THREE.TextureLoader().load(
        "/assets/showcase/live-home-desktop.png",
        (tex) => {
          tex.colorSpace = THREE.SRGBColorSpace;
          tex.needsUpdate = true;
        }
      );
    } else {
      screenTex = new THREE.Texture();
    }

    const screenGeo = new THREE.PlaneGeometry(1.15, 1.6);
    const screenMat = new THREE.MeshStandardMaterial({
      map: screenTex,
      roughness: 0.1,
      metalness: 0.15,
      emissive: 0x1a1612,
      emissiveIntensity: 0.25,
    });
    const screenMesh = new THREE.Mesh(screenGeo, screenMat);
    screenMesh.position.set(0, 0.85, 0.026);
    group.add(screenMesh);

    // 4. Stepped Calacatta Marble Pedestal Base with Brass Torus
    const baseGeo = new THREE.CylinderGeometry(0.85, 0.95, 0.1, 48);
    const marbleMat = new THREE.MeshStandardMaterial({
      color: 0xfaf9f5,
      roughness: 0.35,
      metalness: 0.05,
    });
    const baseMesh = new THREE.Mesh(baseGeo, marbleMat);
    baseMesh.position.y = -0.05;
    baseMesh.receiveShadow = true;
    group.add(baseMesh);

    const brassRingGeo = new THREE.TorusGeometry(0.88, 0.02, 16, 64);
    const ringMesh = new THREE.Mesh(brassRingGeo, goldMat);
    ringMesh.rotation.x = Math.PI / 2;
    ringMesh.position.y = 0;
    group.add(ringMesh);

    return group;
  }, []);

  // Build Procedural Luxury Sculpture (Guaranteed Offline / Fallback)
  const buildProceduralSculpture = useCallback((): THREE.Group => {
    const group = new THREE.Group();

    // 1. Golden Lotus / Sacred Geometry Torus Knot
    const knotGeo = new THREE.TorusKnotGeometry(0.55, 0.16, 128, 32, 2, 3);
    const goldMaterial = new THREE.MeshStandardMaterial({
      color: 0xd4a35a,
      roughness: 0.18,
      metalness: 0.88,
      emissive: 0x5c3a1e,
      emissiveIntensity: 0.1,
    });
    const knotMesh = new THREE.Mesh(knotGeo, goldMaterial);
    knotMesh.position.y = 0.7;
    knotMesh.castShadow = true;
    knotMesh.receiveShadow = true;
    group.add(knotMesh);

    // 2. Central Gem Orb
    const sphereGeo = new THREE.IcosahedronGeometry(0.22, 3);
    const gemMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xfffdf9,
      roughness: 0.05,
      metalness: 0.1,
      transmission: 0.9,
      thickness: 0.5,
      ior: 1.52,
    });
    const gemMesh = new THREE.Mesh(sphereGeo, gemMaterial);
    gemMesh.position.y = 0.7;
    group.add(gemMesh);

    // 3. Indian Architectural Stepped Pedestal (Calacatta Marble & Brass Trim)
    const baseGeo = new THREE.CylinderGeometry(0.85, 0.95, 0.12, 48);
    const marbleMaterial = new THREE.MeshStandardMaterial({
      color: 0xfaf9f5,
      roughness: 0.35,
      metalness: 0.05,
    });
    const baseMesh = new THREE.Mesh(baseGeo, marbleMaterial);
    baseMesh.position.y = -0.06;
    baseMesh.receiveShadow = true;
    group.add(baseMesh);

    const brassTrimGeo = new THREE.TorusGeometry(0.88, 0.02, 16, 64);
    const trimMesh = new THREE.Mesh(brassTrimGeo, goldMaterial);
    trimMesh.rotation.x = Math.PI / 2;
    trimMesh.position.y = 0;
    group.add(trimMesh);

    const subBaseGeo = new THREE.CylinderGeometry(0.65, 0.75, 0.1, 48);
    const subBaseMesh = new THREE.Mesh(subBaseGeo, marbleMaterial);
    subBaseMesh.position.y = 0.05;
    group.add(subBaseMesh);

    return group;
  }, []);

  // Load Model or Build Sculpture
  const loadTargetModel = useCallback(
    (targetUrl: string) => {
      const scene = sceneRef.current;
      const camera = cameraRef.current;
      const controls = controlsRef.current;
      if (!scene || !camera || !controls) return;

      setIsLoading(true);
      setLoadProgress(10);

      // Remove existing model
      if (currentModelGroupRef.current) {
        scene.remove(currentModelGroupRef.current);
        currentModelGroupRef.current.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;
            mesh.geometry?.dispose();
            if (Array.isArray(mesh.material)) {
              mesh.material.forEach((m) => m.dispose());
            } else {
              mesh.material?.dispose();
            }
          }
        });
        currentModelGroupRef.current = null;
      }

      if (targetUrl === "sutra-tablet") {
        const tabletGroup = buildProceduralTablet();
        currentModelGroupRef.current = tabletGroup;
        scene.add(tabletGroup);
        setIsLoading(false);
        setLoadProgress(100);
        return;
      }

      if (targetUrl === "procedural-lotus") {
        const proceduralGroup = buildProceduralSculpture();
        currentModelGroupRef.current = proceduralGroup;
        scene.add(proceduralGroup);
        setIsLoading(false);
        setLoadProgress(100);
        return;
      }

      const loader = new GLTFLoader();
      loader.load(
        targetUrl,
        (gltf) => {
          const model = gltf.scene;

          // Compute Bounding Box to center and scale uniformly
          const box = new THREE.Box3().setFromObject(model);
          const size = box.getSize(new THREE.Vector3());
          const center = box.getCenter(new THREE.Vector3());

          const maxDim = Math.max(size.x, size.y, size.z);
          const scale = 1.6 / (maxDim || 1);
          model.scale.setScalar(scale);

          // Center horizontally and rest on base
          model.position.x = -center.x * scale;
          model.position.y = -box.min.y * scale;
          model.position.z = -center.z * scale;

          // Traverse to enhance shadows and metallic shine
          model.traverse((child) => {
            if ((child as THREE.Mesh).isMesh) {
              const mesh = child as THREE.Mesh;
              mesh.castShadow = true;
              mesh.receiveShadow = true;
              if (mesh.material && (mesh.material as THREE.MeshStandardMaterial).isMeshStandardMaterial) {
                const stdMat = mesh.material as THREE.MeshStandardMaterial;
                stdMat.envMapIntensity = 1.2;
              }
            }
          });

          const group = new THREE.Group();
          group.add(model);

          // Add subtle marble shadow disk under model
          const shadowDiskGeo = new THREE.CircleGeometry(1.2, 48);
          const shadowDiskMat = new THREE.MeshBasicMaterial({
            color: 0xeadfcb,
            transparent: true,
            opacity: 0.4,
          });
          const shadowDisk = new THREE.Mesh(shadowDiskGeo, shadowDiskMat);
          shadowDisk.rotation.x = -Math.PI / 2;
          shadowDisk.position.y = 0.001;
          group.add(shadowDisk);

          currentModelGroupRef.current = group;
          scene.add(group);

          setIsLoading(false);
          setLoadProgress(100);
        },
        (xhr) => {
          if (xhr.total > 0) {
            setLoadProgress(Math.round((xhr.loaded / xhr.total) * 100));
          } else {
            setLoadProgress(65);
          }
        },
        (error) => {
          console.warn("GLTF Load fallback triggered to procedural sculpture:", error);
          const fallbackGroup = buildProceduralSculpture();
          currentModelGroupRef.current = fallbackGroup;
          scene.add(fallbackGroup);
          setIsLoading(false);
          setLoadProgress(100);
        }
      );
    },
    [buildProceduralSculpture]
  );

  // Initialize Three.js Canvas
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth || 600;
    const heightPx = container.clientHeight || 420;

    // 1. Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;
    scene.background = null; // transparent background

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(42, width / heightPx, 0.1, 100);
    camera.position.set(0, 1.2, 2.5);
    cameraRef.current = camera;
    initialCameraPosRef.current = camera.position.clone();

    // 3. WebGL Renderer
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, heightPx);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    container.innerHTML = "";
    container.appendChild(renderer.domElement);

    // 4. OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 2.0;
    controls.minDistance = 1.2;
    controls.maxDistance = 5.5;
    controls.maxPolarAngle = Math.PI / 2 + 0.08;
    controls.target.set(0, 0.6, 0);
    controlsRef.current = controls;

    // 5. Studio Lighting Setup (Warm Saffron / Obsidian Theme)
    const ambientLight = new THREE.AmbientLight(0xfffdf9, 1.3);
    scene.add(ambientLight);

    const goldKeyLight = new THREE.DirectionalLight(0xd4a35a, 2.8);
    goldKeyLight.position.set(4, 7, 4);
    goldKeyLight.castShadow = true;
    goldKeyLight.shadow.mapSize.width = 1024;
    goldKeyLight.shadow.mapSize.height = 1024;
    scene.add(goldKeyLight);

    const softFillLight = new THREE.DirectionalLight(0xfaf9f5, 1.6);
    softFillLight.position.set(-5, 4, -4);
    scene.add(softFillLight);

    const rimLight = new THREE.DirectionalLight(0xa98b57, 1.2);
    rimLight.position.set(0, -3, 4);
    scene.add(rimLight);

    const topRimLight = new THREE.PointLight(0xffecd2, 2.0, 10);
    topRimLight.position.set(0, 4, 0);
    scene.add(topRimLight);

    // Initial Load
    const activeUrl = modelUrl || PRESET_MODELS[activePresetIndex].url;
    loadTargetModel(activeUrl);

    // 6. Animation Loop & FPS calculation
    let lastTime = performance.now();
    let frameCount = 0;
    let fpsTimer = 0;

    const animate = (time: number) => {
      animFrameIdRef.current = requestAnimationFrame(animate);

      const delta = (time - lastTime) / 1000;
      lastTime = time;

      frameCount++;
      fpsTimer += delta;
      if (fpsTimer >= 1.0) {
        setFps(Math.min(60, Math.round(frameCount / fpsTimer)));
        frameCount = 0;
        fpsTimer = 0;
      }

      controls.update();
      renderer.render(scene, camera);
    };

    animFrameIdRef.current = requestAnimationFrame(animate);

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

      controls.dispose();
      renderer.dispose();

      if (container && renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }

      scene.traverse((object) => {
        if ((object as THREE.Mesh).isMesh) {
          const mesh = object as THREE.Mesh;
          mesh.geometry?.dispose();
          if (Array.isArray(mesh.material)) {
            mesh.material.forEach((m) => m.dispose());
          } else {
            mesh.material?.dispose();
          }
        }
      });
    };
  }, [loadTargetModel, modelUrl, activePresetIndex]);

  // UI Handlers
  const toggleAutoRotate = () => {
    if (controlsRef.current) {
      const nextState = !isAutoRotate;
      controlsRef.current.autoRotate = nextState;
      setIsAutoRotate(nextState);
    }
  };

  const resetCamera = () => {
    if (cameraRef.current && controlsRef.current) {
      cameraRef.current.position.set(0, 1.2, 2.5);
      controlsRef.current.target.set(0, 0.6, 0);
      controlsRef.current.update();
    }
  };

  const handlePresetSwitch = (index: number) => {
    setActivePresetIndex(index);
    loadTargetModel(PRESET_MODELS[index].url);
  };

  return (
    <div
      className={`relative w-full rounded-3xl bg-gradient-to-b from-[#FFFDF9] via-[#FAF9F5] to-[#F4EFE6] border border-[#EADFCB] overflow-hidden shadow-warm ${className}`}
    >
      {/* Header Bar */}
      <div className="absolute top-3.5 left-3.5 right-3.5 z-20 flex items-center justify-between gap-2 pointer-events-none">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#171717]/90 backdrop-blur-md text-[10px] font-mono font-bold text-[#D4A35A] border border-[#A98B57]/40 shadow-xs pointer-events-auto">
            <span className="w-1.5 h-1.5 rounded-full bg-[#2E7D4F] animate-pulse" />
            WebGL 2.0 • {fps} FPS
          </span>

          <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#FFFDF9]/90 backdrop-blur-md text-[10px] font-medium text-[#5C3A1E] border border-[#EADFCB] shadow-2xs">
            <Box className="w-3 h-3 text-[#A98B57]" />
            {PRESET_MODELS[activePresetIndex]?.polyCount || "PBR Active"}
          </span>
        </div>

        <div className="flex items-center gap-1.5 pointer-events-auto">
          {allowPresetSwitch && (
            <div className="flex items-center bg-[#FFFDF9]/95 backdrop-blur-md p-0.5 rounded-full border border-[#EADFCB] shadow-xs">
              {PRESET_MODELS.map((preset, idx) => (
                <button
                  key={preset.id}
                  onClick={() => handlePresetSwitch(idx)}
                  className={`px-2.5 py-1 rounded-full text-[10px] font-semibold transition-all cursor-pointer ${
                    activePresetIndex === idx
                      ? "bg-[#5C3A1E] text-white shadow-2xs"
                      : "text-[#64748B] hover:text-[#0F172A]"
                  }`}
                >
                  {preset.id === "tablet" ? "Studio Tablet" : "Gold Lotus"}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 3D Canvas Viewport */}
      <div
        ref={containerRef}
        style={{ height }}
        className="w-full cursor-grab active:cursor-grabbing touch-none relative"
      />

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 z-30 bg-[#FFFDF9]/85 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center">
          <div className="relative w-12 h-12 mb-3">
            <div className="absolute inset-0 rounded-full border-2 border-[#EADFCB] border-t-[#A98B57] animate-spin" />
            <div className="absolute inset-2 rounded-full border-2 border-[#EADFCB] border-b-[#D4A35A] animate-spin [animation-duration:1.5s]" />
          </div>
          <p className="text-xs font-serif font-bold text-[#171717]">
            Compiling PBR Shader Pipeline...
          </p>
          <p className="text-[10px] font-mono text-[#A98B57] mt-1">
            Loading glTF Mesh &amp; Textures {loadProgress}%
          </p>
        </div>
      )}

      {/* Bottom Control Bar */}
      <div className="absolute bottom-3.5 inset-x-3.5 z-20 flex flex-col sm:flex-row items-center justify-between gap-2.5 pointer-events-none">
        {/* Caption */}
        <div className="text-center sm:text-left">
          <p className="text-xs font-serif font-bold text-[#171717] drop-shadow-2xs">
            {title}
          </p>
          <p className="text-[10px] text-[#64748B] font-sans flex items-center gap-1 justify-center sm:justify-start">
            <span>{subtitle}</span>
            <span className="text-[#A98B57] hidden sm:inline">•</span>
            <span className="text-[#A98B57] hidden sm:inline">Drag to Orbit 360°</span>
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 pointer-events-auto bg-[#FFFDF9]/95 backdrop-blur-md p-1 rounded-full border border-[#EADFCB] shadow-md">
          <button
            type="button"
            onClick={toggleAutoRotate}
            title={isAutoRotate ? "Pause auto-rotation" : "Enable 360° auto-rotation"}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              isAutoRotate
                ? "bg-[#5C3A1E] text-white shadow-xs"
                : "bg-transparent text-[#64748B] hover:text-[#0F172A]"
            }`}
          >
            {isAutoRotate ? (
              <>
                <Pause className="w-3 h-3 text-[#D4A35A]" />
                <span className="text-[10px]">360° Rotating</span>
              </>
            ) : (
              <>
                <Play className="w-3 h-3 text-[#5C3A1E]" />
                <span className="text-[10px]">Rotate 360°</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={resetCamera}
            title="Reset camera position"
            className="p-1.5 rounded-full text-[#64748B] hover:text-[#0F172A] hover:bg-[#F4EFE6] transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
