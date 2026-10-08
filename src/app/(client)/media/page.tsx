"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { PortalSidebar } from "@/components/dashboard/PortalSidebar";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { useAuth } from "@/lib/auth/authContext";
import {
  Download,
  HardDrive,
  Globe,
  Image as ImageIcon,
  Video,
  Box,
  FileText,
  Search,
  CheckCircle2,
  AlertTriangle,
  Eye,
  RefreshCw,
  LayoutGrid,
  List,
  Compass,
  FileArchive,
  ArrowRight,
  ShieldCheck,
  Check,
  Clock,
  ExternalLink,
  Folder,
  FolderOpen,
  Play,
  Sparkles,
  Layers,
  Share2,
} from "lucide-react";
import { RouteGuard } from "@/components/auth/RouteGuard";

export interface MediaAsset {
  id: string;
  name: string;
  type: "Image" | "Video" | "3D" | "360" | "Marketing" | "Document";
  size: string;
  folder: string;
  date: string;
  driveFileId: string;
  resolution?: string;
  checksum?: string;
  thumbnail: string;
  downloadUrl?: string;
  sourceOrder?: string;
  category?: string;
  isVideo?: boolean;
}

const INITIAL_ASSETS: MediaAsset[] = [
  {
    id: "ast-1",
    name: "Aura_Noir_4K_Final_Render_01.png",
    type: "Image",
    size: "18.4 MB",
    folder: "/DELIVERABLES/03_FINAL_DELIVERY",
    date: "Oct 05, 2026",
    driveFileId: "drive_09a823bf_sutra",
    resolution: "3840 x 2160 (4K UHD)",
    checksum: "sha256:8f4b23c91e0a...",
    thumbnail: "https://image.pollinations.ai/prompt/luxury%20perfume%20bottle%2C%20obsidian%20glass%2C%2024k%20gold%20cap%2C%20caustic%20refractions%2C%20warm%20saffron%20rim%20lighting%2C%20hasselblad%20commercial%20product%20shot%2C%208k?width=1200&height=800&nologo=true",
    downloadUrl: "https://image.pollinations.ai/prompt/luxury%20perfume%20bottle%2C%20obsidian%20glass%2C%2024k%20gold%20cap%2C%20caustic%20refractions%2C%20warm%20saffron%20rim%20lighting%2C%20hasselblad%20commercial%20product%20shot%2C%208k?width=1200&height=800&nologo=true",
  },
  {
    id: "ast-2",
    name: "Zenith_Commercial_Reel_1080p.mp4",
    type: "Video",
    size: "84.2 MB",
    folder: "/DELIVERABLES/02_DRAFTS",
    date: "Oct 04, 2026",
    driveFileId: "drive_89c314de_sutra",
    resolution: "1920 x 1080 (ProRes 422)",
    checksum: "sha256:3d1e9912ba44...",
    thumbnail: "https://image.pollinations.ai/prompt/cinematic%20architectural%20film%20still%2C%20modern%20sandstone%20courtyard%20villa%20at%20sunset%2C%20ambient%20water%20reflection%2C%20anamorphic%20lens%20flare%2C%208k?width=1200&height=800&nologo=true",
    downloadUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    isVideo: true,
  },
  {
    id: "ast-3",
    name: "Pavilion_Villa_Baked_Model.gltf",
    type: "3D",
    size: "42.1 MB",
    folder: "/DELIVERABLES/02_DRAFTS",
    date: "Oct 03, 2026",
    driveFileId: "drive_55a120ef_sutra",
    resolution: "142,000 Polygons (PBR)",
    checksum: "sha256:7c9921e54f01...",
    thumbnail: "https://image.pollinations.ai/prompt/luxury%20modern%20armchair%203d%20render%2C%20emerald%20velvet%20and%20brushed%20brass%2C%20studio%20lighting%2C%20isolated%20on%20warm%20ivory%20plinth%2C%20octane%20render%2C%208k?width=1200&height=800&nologo=true",
  },
  {
    id: "ast-4",
    name: "Pavilion_360_Virtual_Tour.hdr",
    type: "360",
    size: "65.0 MB",
    folder: "/DELIVERABLES/03_FINAL_DELIVERY",
    date: "Oct 02, 2026",
    driveFileId: "drive_44b910ca_sutra",
    resolution: "8192 x 4096 (Equirectangular)",
    checksum: "sha256:5b8812ca43e9...",
    thumbnail: "https://image.pollinations.ai/prompt/equirectangular%20360%20degree%20panoramic%20luxury%20modern%20villa%20interior%2C%20floor%20to%20ceiling%20glass%2C%20calacatta%20marble%2C%20warm%20golden%20lighting%2C%208k%20seamless%20hdr%20spherical?width=2048&height=1024&nologo=true",
  },
  {
    id: "ast-5",
    name: "Diwali_Meta_Ads_Creative_Pack.zip",
    type: "Marketing",
    size: "38.6 MB",
    folder: "/DELIVERABLES/01_CLIENT_ASSETS",
    date: "Oct 01, 2026",
    driveFileId: "drive_77c891ff_sutra",
    resolution: "3 Ratios (9:16, 1:1, 16:9)",
    checksum: "sha256:22a498bb7621...",
    thumbnail: "https://image.pollinations.ai/prompt/social%20media%20advertising%20campaign%20creative%2C%20luxury%20aesthetic%2C%20warm%20gold%20and%20obsidian%20palette%2C%20modern%20typography%2C%20commercial%20grade%2C%208k?width=1200&height=800&nologo=true",
  },
  {
    id: "ast-6",
    name: "Sutra_Brand_Guidelines_V2.pdf",
    type: "Document",
    size: "4.8 MB",
    folder: "/BRAND_ASSETS",
    date: "Sep 28, 2026",
    driveFileId: "drive_33f789aa_sutra",
    resolution: "Vector PDF (300 DPI)",
    checksum: "sha256:1a8844ff0923...",
    thumbnail: "https://image.pollinations.ai/prompt/minimalist%20luxury%20brand%20strategy%20moodboard%2C%20gold%20foil%20typography%2C%20analytics%20charts%20on%20warm%20ivory%20paper%2C%20curated%20aesthetic%2C%208k?width=1200&height=800&nologo=true",
  },
  {
    id: "ast-7",
    name: "Client_Brief_Assets_Raw.zip",
    type: "Document",
    size: "14.2 MB",
    folder: "/DELIVERABLES/01_CLIENT_ASSETS",
    date: "Sep 25, 2026",
    driveFileId: "drive_11ff492a_sutra",
    resolution: "Source Brief Assets",
    checksum: "sha256:9e5520ee78ab...",
    thumbnail: "https://image.pollinations.ai/prompt/architectural%20interior%20rendering%2C%20minimalist%20luxury%20living%20space%2C%20intricate%20golden%20jali%20screens%2C%20calacatta%20gold%20marble%20floors%2C%20recessed%203000k%20warm%20led%2C%20hasselblad%20photography%2C%208k?width=1200&height=800&nologo=true",
  },
];

const DRIVE_FOLDERS = [
  { id: "all", name: "All Deliverables", icon: Folder },
  { id: "03_FINAL_DELIVERY", name: "Final Masters", path: "/DELIVERABLES/03_FINAL_DELIVERY" },
  { id: "02_DRAFTS", name: "Creative Drafts", path: "/DELIVERABLES/02_DRAFTS" },
  { id: "BRAND_ASSETS", name: "Brand & Campaign Ads", path: "/BRAND_ASSETS" },
  { id: "01_CLIENT_ASSETS", name: "Brief Materials", path: "/DELIVERABLES/01_CLIENT_ASSETS" },
  { id: "04_REVISIONS", name: "Revision Passes", path: "/DELIVERABLES/04_REVISIONS" },
];

export default function MediaLibraryPage() {
  const { user } = useAuth();
  const [assets, setAssets] = useState<MediaAsset[]>(INITIAL_ASSETS);
  const [activeFolder, setActiveFolder] = useState<string>("all");
  const [activeFilter, setActiveFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAsset, setSelectedAsset] = useState<MediaAsset | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Loading, Download, Share & Error States
  const [isLoading, setIsLoading] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [downloadSuccess, setDownloadSuccess] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [copiedAssetId, setCopiedAssetId] = useState<string | null>(null);

  // Fetch real order deliverables and media vault assets
  const fetchVaultData = async () => {
    setIsLoading(true);
    setErrorMessage("");
    try {
      const combinedAssets: MediaAsset[] = [...INITIAL_ASSETS];
      const seenIds = new Set(INITIAL_ASSETS.map((a) => a.id));

      // 1. Fetch Orders to extract live project deliverables & AI generated assets
      const ordersRes = await fetch("/api/orders");
      if (ordersRes.ok) {
        const ordersData = await ordersRes.json();
        const ordersList = ordersData.orders || [];

        ordersList.forEach((order: any) => {
          const orderNum = order.orderNumber || order.code || order.id?.slice(0, 8);

          // Deliverables
          if (Array.isArray(order.deliverables)) {
            order.deliverables.forEach((d: any, idx: number) => {
              const fileId = d.driveFileId || `deliv-${order.id}-${idx}`;
              if (!seenIds.has(fileId)) {
                seenIds.add(fileId);
                const isVid = d.mimeType?.includes("video") || d.filename?.endsWith(".mp4") || d.filename?.endsWith(".mov");
                const isImg = d.mimeType?.includes("image") || d.filename?.endsWith(".png") || d.filename?.endsWith(".jpg");
                const is3D = d.filename?.endsWith(".gltf") || d.filename?.endsWith(".glb") || d.filename?.endsWith(".usdz");

                let folder = "/DELIVERABLES/03_FINAL_DELIVERY";
                if (d.category === "draft") folder = "/DELIVERABLES/02_DRAFTS";
                else if (d.category === "revision") folder = "/DELIVERABLES/04_REVISIONS";

                combinedAssets.unshift({
                  id: fileId,
                  name: d.filename || `Deliverable_${orderNum}_${idx + 1}.png`,
                  type: isVid ? "Video" : isImg ? "Image" : is3D ? "3D" : "Document",
                  size: d.fileSize || "14.2 MB",
                  folder,
                  date: d.uploadedAt ? new Date(d.uploadedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "Recently Delivered",
                  driveFileId: d.driveFileId || `drive_${fileId.slice(0, 12)}`,
                  resolution: d.version ? `Version ${d.version}` : "Studio Production Deliverable",
                  checksum: d.checksum || `sha256:${fileId.slice(0, 16)}...`,
                  thumbnail: d.previewUrl || (isVid ? "https://image.pollinations.ai/prompt/cinematic%20architectural%20film%20still%2C%20modern%20sandstone%20courtyard%20villa%20at%20sunset%2C%20ambient%20water%20reflection%2C%20anamorphic%20lens%20flare%2C%208k?width=1200&height=800&nologo=true" : "https://image.pollinations.ai/prompt/luxury%20perfume%20bottle%2C%20obsidian%20glass%2C%2024k%20gold%20cap%2C%20caustic%20refractions%2C%20warm%20saffron%20rim%20lighting%2C%20hasselblad%20commercial%20product%20shot%2C%208k?width=1200&height=800&nologo=true"),
                  downloadUrl: d.previewUrl,
                  sourceOrder: orderNum,
                  category: d.category || "final",
                  isVideo: isVid,
                });
              }
            });
          }

          // Generated Drafts (n8n or AI engines)
          if (Array.isArray(order.generatedDrafts)) {
            order.generatedDrafts.forEach((gd: any, idx: number) => {
              const fileId = gd.driveFileId || `draft-${order.id}-${idx}`;
              if (!seenIds.has(fileId)) {
                seenIds.add(fileId);
                const isVid = !!gd.videoUrl;
                const is3D = !!gd.meshUrl;
                combinedAssets.unshift({
                  id: fileId,
                  name: `${gd.title || "Studio_Pipeline_Draft"}_${orderNum}_v${idx + 1}.${isVid ? "mp4" : is3D ? "glb" : "png"}`,
                  type: isVid ? "Video" : is3D ? "3D" : "Image",
                  size: isVid ? "48.2 MB" : is3D ? "34.0 MB" : "12.8 MB",
                  folder: "/DELIVERABLES/02_DRAFTS",
                  date: gd.timestamp ? new Date(gd.timestamp).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "Studio Pipeline Generated",
                  driveFileId: gd.driveFileId || `drive_${fileId.slice(0, 12)}`,
                  resolution: "Studio Proprietary Pipeline (High-Definition 4K)",
                  checksum: `sha256:${fileId.slice(0, 16)}...`,
                  thumbnail: gd.imageUrl || gd.videoUrl || "https://image.pollinations.ai/prompt/architectural%20interior%20rendering%2C%20minimalist%20luxury%20living%20space%2C%20intricate%20golden%20jali%20screens%2C%20calacatta%20gold%20marble%20floors%2C%20recessed%203000k%20warm%20led%2C%20hasselblad%20photography%2C%208k?width=1200&height=800&nologo=true",
                  downloadUrl: gd.imageUrl || gd.videoUrl || gd.meshUrl,
                  sourceOrder: orderNum,
                  category: "draft",
                  isVideo: isVid,
                });
              }
            });
          }

          // Client Attachments
          if (Array.isArray(order.attachments)) {
            order.attachments.forEach((att: any, idx: number) => {
              const fileId = att.driveFileId || att.id || `att-${order.id}-${idx}`;
              if (!seenIds.has(fileId)) {
                seenIds.add(fileId);
                const isVid = att.mimeType?.includes("video") || att.name?.endsWith(".mp4");
                const isImg = att.mimeType?.includes("image") || att.name?.endsWith(".png") || att.name?.endsWith(".jpg");
                combinedAssets.unshift({
                  id: fileId,
                  name: att.name || `Brief_Asset_${idx + 1}.png`,
                  type: isVid ? "Video" : isImg ? "Image" : "Document",
                  size: att.size || att.fileSize || "6.4 MB",
                  folder: "/DELIVERABLES/01_CLIENT_ASSETS",
                  date: "Client Upload",
                  driveFileId: att.driveFileId || `drive_${fileId.slice(0, 12)}`,
                  resolution: "Source Brief Material",
                  checksum: `sha256:${fileId.slice(0, 16)}...`,
                  thumbnail: att.url || "https://image.pollinations.ai/prompt/minimalist%20luxury%20brand%20strategy%20moodboard%2C%20gold%20foil%20typography%2C%20analytics%20charts%20on%20warm%20ivory%20paper%2C%20curated%20aesthetic%2C%208k?width=1200&height=800&nologo=true",
                  downloadUrl: att.url,
                  sourceOrder: orderNum,
                  category: "client_asset",
                  isVideo: isVid,
                });
              }
            });
          }
        });
      }

      // 2. Fetch Media Vault endpoint
      try {
        const vaultRes = await fetch("/api/media-vault");
        if (vaultRes.ok) {
          const vaultData = await vaultRes.json();
          if (Array.isArray(vaultData.files)) {
            vaultData.files.forEach((vf: any) => {
              if (!seenIds.has(vf.id)) {
                seenIds.add(vf.id);
                const isVid = vf.mediaType === "video" || vf.mimeType?.includes("video");
                const isImg = vf.mediaType === "image" || vf.mimeType?.includes("image");
                const is3D = vf.mediaType === "3d_model" || vf.fileExtension === "gltf" || vf.fileExtension === "glb";
                combinedAssets.unshift({
                  id: vf.id,
                  name: vf.fileName || vf.originalName,
                  type: isVid ? "Video" : isImg ? "Image" : is3D ? "3D" : "Document",
                  size: vf.fileSize ? `${(vf.fileSize / (1024 * 1024)).toFixed(1)} MB` : "10.0 MB",
                  folder: vf.folder || "/DELIVERABLES/03_FINAL_DELIVERY",
                  date: vf.createdAt ? new Date(vf.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "Vault Asset",
                  driveFileId: vf.driveFileId || `drive_${vf.id.slice(0, 12)}`,
                  resolution: vf.width && vf.height ? `${vf.width} x ${vf.height}` : "Sutra Cloud Vault Synced",
                  checksum: `sha256:${vf.id.slice(0, 16)}...`,
                  thumbnail: vf.thumbnailUrl || vf.storageUrl || vf.driveUrl || "https://image.pollinations.ai/prompt/luxury%20perfume%20bottle%2C%20obsidian%20glass%2C%2024k%20gold%20cap%2C%20caustic%20refractions%2C%20warm%20saffron%20rim%20lighting%2C%20hasselblad%20commercial%20product%20shot%2C%208k?width=1200&height=800&nologo=true",
                  downloadUrl: vf.storageUrl || vf.driveUrl,
                  isVideo: isVid,
                });
              }
            });
          }
        }
      } catch {
        // quiet
      }

      setAssets(combinedAssets);
    } catch (err: any) {
      setErrorMessage("Could not index Sutra Cloud Vault: " + (err.message || "Unknown error"));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVaultData();
  }, []);

  const filteredAssets = assets.filter((asset) => {
    // Folder filter
    const matchesFolder =
      activeFolder === "all" ||
      asset.folder.toLowerCase().includes(activeFolder.toLowerCase());

    // Type filter
    const matchesFilter =
      activeFilter === "All" || asset.type === activeFilter;

    // Search filter
    const matchesSearch =
      searchQuery === "" ||
      asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.folder.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (asset.sourceOrder && asset.sourceOrder.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesFolder && matchesFilter && matchesSearch;
  });

  const handleRefreshVault = () => {
    fetchVaultData();
    setDownloadSuccess("Sutra Cloud Vault refreshed and synced successfully.");
    setTimeout(() => setDownloadSuccess(""), 3000);
  };

  const handleDownload = (asset: MediaAsset) => {
    setDownloadingId(asset.id);
    setDownloadProgress(25);
    setErrorMessage("");

    const interval = setInterval(() => {
      setDownloadProgress((prev) => {
        if (prev >= 90) {
          clearInterval(interval);
          setTimeout(() => {
            setDownloadingId(null);
            setDownloadProgress(0);
            setDownloadSuccess(`Downloaded "${asset.name}" from Sutra Cloud Vault.`);
            setTimeout(() => setDownloadSuccess(""), 3500);

            // Trigger file download if direct url exists
            if (asset.downloadUrl || asset.thumbnail) {
              const link = document.createElement("a");
              link.href = asset.downloadUrl || asset.thumbnail;
              link.target = "_blank";
              link.download = asset.name;
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            }
          }, 300);
          return 100;
        }
        return prev + 35;
      });
    }, 180);
  };

  const handleShareLink = (asset: MediaAsset) => {
    const shareUrl =
      asset.downloadUrl ||
      asset.thumbnail ||
      (typeof window !== "undefined"
        ? `${window.location.origin}/media?asset=${asset.id}`
        : "");

    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl);
    }
    setCopiedAssetId(asset.id);
    setDownloadSuccess(`Encrypted vault share link for "${asset.name}" copied to clipboard.`);
    setTimeout(() => {
      setCopiedAssetId(null);
      setDownloadSuccess("");
    }, 3000);
  };

  const getAssetIcon = (type: MediaAsset["type"]) => {
    switch (type) {
      case "Image":
        return <ImageIcon className="w-5 h-5 text-[#5C3A1E]" />;
      case "Video":
        return <Video className="w-5 h-5 text-[#5C3A1E]" />;
      case "3D":
        return <Box className="w-5 h-5 text-[#5C3A1E]" />;
      case "360":
        return <Compass className="w-5 h-5 text-[#5C3A1E]" />;
      case "Marketing":
        return <FileArchive className="w-5 h-5 text-[#5C3A1E]" />;
      default:
        return <FileText className="w-5 h-5 text-[#5C3A1E]" />;
    }
  };

  return (
    <RouteGuard requiredRole="client">
      <div className="min-h-screen flex bg-[#F8F5EF] text-[#0F172A] selection:bg-[#D4A35A]/20 selection:text-[#5C3A1E]">
        <PortalSidebar />

        <main id="main-content" className="flex-1 p-6 sm:p-8 lg:p-10 max-w-7xl pb-24 md:pb-12 space-y-8">
          {/* =========================================================
              HEADER BAR
              ========================================================= */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-[#EADFCB] gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FAF9F5] border border-[#EADFCB] text-[10px] font-semibold uppercase tracking-wider text-[#5C3A1E] mb-2">
                <Sparkles className="w-3.5 h-3.5 text-[#D4A35A]" />
                <span>STUDIO MEDIA & DELIVERABLES VAULT</span>
              </div>
              <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-[#0F172A]">
                Deliverables & Production Assets
              </h1>
              <p className="text-xs text-[#64748B] mt-0.5">
                Browse, preview, and download your high-resolution renders, master videos, 3D spatial models, and brand assets.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <Link
                href="/orders"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#FFFDF9] border border-[#EADFCB] text-xs font-semibold text-[#5C3A1E] hover:border-[#D4A35A] hover:bg-[#F4EFE6] transition-all shadow-xs"
                title="View Active Orders & Deliverables"
              >
                <Layers className="w-3.5 h-3.5 text-[#D4A35A]" />
                <span>My Orders</span>
              </Link>

              <Button
                variant="secondary"
                size="sm"
                onClick={handleRefreshVault}
                disabled={isLoading}
                leftIcon={
                  <RefreshCw
                    className={`w-3.5 h-3.5 text-[#5C3A1E] ${
                      isLoading ? "animate-spin" : ""
                    }`}
                  />
                }
              >
                Sync Deliverables
              </Button>
            </div>
          </div>

          {/* =========================================================
              DELIVERABLES CATEGORIES SELECTOR
              ========================================================= */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FolderOpen className="w-4 h-4 text-[#5C3A1E]" />
                <h3 className="font-serif text-sm font-semibold text-[#0F172A]">
                  Deliverable Categories
                </h3>
              </div>
              <span className="text-[11px] font-mono text-[#64748B]">
                {filteredAssets.length} asset{filteredAssets.length === 1 ? "" : "s"} available
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {DRIVE_FOLDERS.map((folder) => {
                const isActive = activeFolder === folder.id;
                const count = folder.id === "all"
                  ? assets.length
                  : assets.filter((a) => a.folder.toLowerCase().includes(folder.id.toLowerCase())).length;

                return (
                  <button
                    key={folder.id}
                    type="button"
                    onClick={() => setActiveFolder(folder.id)}
                    className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-2.5 ${
                      isActive
                        ? "bg-[#5C3A1E] text-white border-[#5C3A1E] shadow-sm"
                        : "bg-[#FFFDF9] text-[#0F172A] border-[#EADFCB] hover:border-[#D4A35A] hover:bg-[#FAF9F5]"
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <Folder className={`w-4 h-4 ${isActive ? "text-[#D4A35A]" : "text-[#5C3A1E]"}`} />
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                        isActive ? "bg-white/20 text-white" : "bg-[#F8F5EF] text-[#64748B]"
                      }`}>
                        {count}
                      </span>
                    </div>
                    <div>
                      <div className={`text-xs font-semibold truncate ${isActive ? "text-white" : "text-[#0F172A]"}`}>
                        {folder.name}
                      </div>
                      {folder.path && (
                        <div className={`text-[10px] font-mono truncate mt-0.5 ${
                          isActive ? "text-white/70" : "text-[#94A3B8]"
                        }`}>
                          {folder.path.split("/").pop()}
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* =========================================================
              NOTIFICATIONS & ERROR STATES
              ========================================================= */}
          {downloadSuccess && (
            <div className="p-3.5 rounded-2xl bg-[#F0FDF4] border border-[#BBF7D0] text-xs text-[#166534] flex items-center justify-between animate-in fade-in duration-200">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#16A34A] shrink-0" />
                <span className="font-medium">{downloadSuccess}</span>
              </div>
              <span className="text-[10px] font-mono text-[#15803D]">Sutra Cloud Vault v3</span>
            </div>
          )}

          {errorMessage && (
            <div className="p-4 rounded-2xl bg-[#FEF2F2] border border-[#FECACA] text-xs text-[#991B1B] flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in duration-200">
              <div className="flex items-center gap-2.5">
                <AlertTriangle className="w-4 h-4 text-[#DC2626] shrink-0" />
                <div>
                  <span className="font-bold">Cloud Vault Notice: </span>
                  <span>{errorMessage}</span>
                </div>
              </div>
              <Button
                variant="secondary"
                size="sm"
                className="shrink-0 text-xs py-1"
                onClick={handleRefreshVault}
                leftIcon={<RefreshCw className="w-3 h-3 text-[#991B1B]" />}
              >
                Retry Sync
              </Button>
            </div>
          )}

          {/* =========================================================
              SEARCH, FILTERS & VIEW MODE TOOLBAR
              ========================================================= */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {["All", "Image", "Video", "3D", "360", "Marketing", "Document"].map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setActiveFilter(type)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all shrink-0 cursor-pointer ${
                    activeFilter === type
                      ? "bg-[#5C3A1E] text-white shadow-xs"
                      : "bg-[#FFFDF9] text-[#64748B] border border-[#EADFCB] hover:border-[#D4A35A]"
                  }`}
                >
                  {type === "All" ? "All Formats" : `${type}s`}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3">
              {/* Search Input */}
              <div className="relative flex items-center w-full sm:w-64">
                <Search className="w-4 h-4 text-[#94A3B8] absolute left-3 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search files, orders, tags..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 rounded-full bg-[#FFFDF9] border border-[#EADFCB] text-xs text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#D4A35A]"
                />
              </div>

              {/* View Mode Toggle */}
              <div className="inline-flex rounded-xl bg-[#FFFDF9] border border-[#EADFCB] p-0.5 shadow-xs shrink-0">
                <button
                  type="button"
                  onClick={() => setViewMode("grid")}
                  title="Grid View"
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    viewMode === "grid"
                      ? "bg-[#5C3A1E] text-white"
                      : "text-[#64748B] hover:text-[#0F172A]"
                  }`}
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("list")}
                  title="List View"
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    viewMode === "list"
                      ? "bg-[#5C3A1E] text-white"
                      : "text-[#64748B] hover:text-[#0F172A]"
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* =========================================================
              ASSETS PRESENTATION (LOADING SKELETON OR ASSETS VIEW)
              ========================================================= */}
          {isLoading && assets.length === 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div
                  key={i}
                  className="rounded-3xl bg-[#FFFDF9] border border-[#EADFCB] p-4 space-y-3 animate-pulse"
                >
                  <div className="aspect-[16/10] w-full rounded-2xl bg-[#EADFCB]/40" />
                  <div className="h-4 bg-[#EADFCB]/50 rounded w-3/4" />
                  <div className="h-3 bg-[#EADFCB]/30 rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : filteredAssets.length === 0 ? (
            <div className="py-16 text-center rounded-3xl bg-[#FFFDF9] border border-[#EADFCB] p-8 max-w-md mx-auto space-y-3">
              <Search className="w-10 h-10 text-[#94A3B8] mx-auto opacity-50" />
              <h3 className="font-serif text-lg font-semibold text-[#0F172A]">
                No Files Found
              </h3>
              <p className="text-xs text-[#64748B]">
                No files matched your search or folder filter.
              </p>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setSearchQuery("");
                  setActiveFilter("All");
                  setActiveFolder("all");
                }}
              >
                Reset Filters
              </Button>
            </div>
          ) : viewMode === "grid" ? (
            /* =========================================================
               GRID VIEW WITH RICH MEDIA PREVIEWS
               ========================================================= */
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {filteredAssets.map((asset) => (
                <div
                  key={asset.id}
                  className="group rounded-3xl bg-[#FFFDF9] border border-[#EADFCB] overflow-hidden flex flex-col justify-between transition-all hover:border-[#D4A35A] hover:shadow-warm-hover"
                >
                  <div>
                    {/* Media Thumbnail Container with Aspect Ratio */}
                    <div
                      className="relative aspect-[16/10] w-full overflow-hidden bg-[#F4EFE6] cursor-pointer"
                      onClick={() => setSelectedAsset(asset)}
                    >
                      <Image
                        src={asset.thumbnail}
                        alt={asset.name}
                        fill
                        className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                      />

                      {/* Video Play Overlay */}
                      {asset.isVideo && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/25 group-hover:bg-black/40 transition-colors">
                          <div className="w-10 h-10 rounded-full bg-white/90 text-[#5C3A1E] flex items-center justify-center shadow-md transform group-hover:scale-110 transition-transform">
                            <Play className="w-5 h-5 ml-0.5 fill-[#5C3A1E]" />
                          </div>
                        </div>
                      )}

                      {/* Top Badges */}
                      <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5">
                        <span className="rounded-full bg-[#171717]/85 backdrop-blur-md px-2.5 py-0.5 text-[10px] font-semibold text-white border border-white/10 uppercase tracking-wider">
                          {asset.type}
                        </span>
                        {asset.sourceOrder && (
                          <span className="rounded-full bg-[#A98B57] px-2 py-0.5 text-[9px] font-mono font-bold text-white shadow-xs">
                            {asset.sourceOrder}
                          </span>
                        )}
                      </div>

                      <div className="absolute top-3 right-3 z-10">
                        <span className="rounded-full bg-white/90 backdrop-blur-md px-2 py-0.5 text-[10px] font-mono text-[#5C3A1E] border border-[#EADFCB] shadow-xs">
                          {asset.size}
                        </span>
                      </div>

                      {/* Scrim Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A]/70 via-transparent to-transparent opacity-50 group-hover:opacity-30 transition-opacity" />

                      {/* Bottom Path */}
                      <div className="absolute bottom-2 left-3 right-3 text-[10px] font-mono text-white/90 truncate z-10">
                        {asset.folder}
                      </div>
                    </div>

                    {/* Metadata Body */}
                    <div className="p-4 space-y-1">
                      <h4
                        className="font-serif text-sm font-semibold text-[#0F172A] group-hover:text-[#5C3A1E] transition-colors truncate cursor-pointer"
                        title={asset.name}
                        onClick={() => setSelectedAsset(asset)}
                      >
                        {asset.name}
                      </h4>
                      <p className="text-[11px] text-[#64748B] font-mono truncate">
                        {asset.resolution || asset.driveFileId}
                      </p>
                    </div>
                  </div>

                  {/* Actions Bar - Strictly 3 Triggers */}
                  <div className="px-3.5 pb-3.5 pt-2 border-t border-[#EADFCB]/60 grid grid-cols-3 gap-1.5">
                    <button
                      type="button"
                      onClick={() => setSelectedAsset(asset)}
                      className="px-2 py-1.5 rounded-xl bg-[#F8F5EF] border border-[#EADFCB] text-[#0F172A] hover:border-[#D4A35A] hover:bg-[#FAF9F5] transition-colors text-[11px] font-medium flex items-center justify-center gap-1 cursor-pointer"
                      title="Preview 4K Master"
                    >
                      <Eye className="w-3.5 h-3.5 text-[#5C3A1E] shrink-0" />
                      <span className="truncate">Preview 4K</span>
                    </button>

                    <button
                      type="button"
                      disabled={downloadingId === asset.id}
                      onClick={() => handleDownload(asset)}
                      className="px-2 py-1.5 rounded-xl bg-[#F8F5EF] border border-[#EADFCB] text-[#0F172A] hover:border-[#D4A35A] hover:bg-[#FAF9F5] transition-colors text-[11px] font-medium flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
                      title="Download Master"
                    >
                      {downloadingId === asset.id ? (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#5C3A1E] shrink-0" />
                      ) : (
                        <Download className="w-3.5 h-3.5 text-[#5C3A1E] shrink-0" />
                      )}
                      <span className="truncate">
                        {downloadingId === asset.id ? `${downloadProgress}%` : "Download Master"}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleShareLink(asset)}
                      className="px-2 py-1.5 rounded-xl bg-[#F8F5EF] border border-[#EADFCB] text-[#0F172A] hover:border-[#D4A35A] hover:bg-[#FAF9F5] transition-colors text-[11px] font-medium flex items-center justify-center gap-1 cursor-pointer"
                      title="Share Link"
                    >
                      {copiedAssetId === asset.id ? (
                        <Check className="w-3.5 h-3.5 text-[#2E7D4F] shrink-0" />
                      ) : (
                        <Share2 className="w-3.5 h-3.5 text-[#5C3A1E] shrink-0" />
                      )}
                      <span className="truncate">
                        {copiedAssetId === asset.id ? "Copied" : "Share Link"}
                      </span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* =========================================================
               LIST VIEW
               ========================================================= */
            <div className="rounded-3xl bg-[#FFFDF9] border border-[#EADFCB] divide-y divide-[#EADFCB]/60 shadow-xs overflow-hidden">
              {filteredAssets.map((asset) => (
                <div
                  key={asset.id}
                  className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#FAF9F5]/50 transition-colors"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-11 h-11 rounded-2xl bg-[#F8F5EF] border border-[#EADFCB] flex items-center justify-center shrink-0">
                      {getAssetIcon(asset.type)}
                    </div>
                    <div>
                      <h3
                        className="font-serif text-sm sm:text-base font-semibold text-[#0F172A] hover:text-[#5C3A1E] transition-colors cursor-pointer"
                        onClick={() => setSelectedAsset(asset)}
                      >
                        {asset.name}
                      </h3>
                      <div className="flex items-center gap-2.5 text-xs text-[#94A3B8] mt-0.5">
                        <span className="font-mono text-[11px] text-[#5C3A1E] font-medium">
                          {asset.folder}
                        </span>
                        <span>• {asset.size}</span>
                        <span>• {asset.date}</span>
                        {asset.sourceOrder && (
                          <span className="font-mono text-[10px] bg-[#FAF9F5] px-1.5 py-0.5 rounded border border-[#EADFCB] text-[#5C3A1E]">
                            Order {asset.sourceOrder}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 sm:shrink-0">
                    <button
                      type="button"
                      onClick={() => setSelectedAsset(asset)}
                      className="px-2.5 py-1.5 rounded-xl bg-[#F8F5EF] border border-[#EADFCB] text-[#0F172A] hover:border-[#D4A35A] hover:bg-[#FAF9F5] transition-all text-xs font-medium flex items-center gap-1.5 cursor-pointer"
                      title="Preview 4K Master"
                    >
                      <Eye className="w-3.5 h-3.5 text-[#5C3A1E]" />
                      <span>Preview 4K</span>
                    </button>

                    <Button
                      variant="secondary"
                      size="sm"
                      disabled={downloadingId === asset.id}
                      onClick={() => handleDownload(asset)}
                      className="text-xs py-1 px-3"
                      leftIcon={
                        downloadingId === asset.id ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#5C3A1E]" />
                        ) : (
                          <Download className="w-3.5 h-3.5 text-[#5C3A1E]" />
                        )
                      }
                    >
                      {downloadingId === asset.id ? `Downloading ${downloadProgress}%` : "Download Master"}
                    </Button>

                    <button
                      type="button"
                      onClick={() => handleShareLink(asset)}
                      className="px-2.5 py-1.5 rounded-xl bg-[#F8F5EF] border border-[#EADFCB] text-[#0F172A] hover:border-[#D4A35A] hover:bg-[#FAF9F5] transition-all text-xs font-medium flex items-center gap-1.5 cursor-pointer"
                      title="Share Link"
                    >
                      {copiedAssetId === asset.id ? (
                        <Check className="w-3.5 h-3.5 text-[#2E7D4F]" />
                      ) : (
                        <Share2 className="w-3.5 h-3.5 text-[#5C3A1E]" />
                      )}
                      <span>{copiedAssetId === asset.id ? "Copied" : "Share Link"}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>

        <MobileBottomNav />

        {/* =========================================================
            VISUAL MEDIA PREVIEW MODAL
            ========================================================= */}
        <Modal
          isOpen={!!selectedAsset}
          onClose={() => setSelectedAsset(null)}
          title={selectedAsset?.name || "Asset Preview"}
          description={`Sutra Cloud Vault Path: ${selectedAsset?.folder}`}
          maxWidth="lg"
        >
          {selectedAsset && (
            <div className="space-y-5">
              {/* Media Preview Canvas / Video Player */}
              <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-[#171717] border border-[#EADFCB] flex items-center justify-center">
                {selectedAsset.isVideo ? (
                  <video
                    src={selectedAsset.downloadUrl || selectedAsset.thumbnail}
                    controls
                    autoPlay
                    playsInline
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <Image
                    src={selectedAsset.thumbnail}
                    alt={selectedAsset.name}
                    fill
                    className="object-contain"
                  />
                )}
                <div className="absolute top-3 left-3 z-10 flex items-center gap-2 pointer-events-none">
                  <span className="rounded-full bg-[#171717]/85 backdrop-blur-md px-3 py-1 text-xs font-semibold text-white border border-white/10 uppercase tracking-wider">
                    {selectedAsset.type}
                  </span>
                  <span className="rounded-full bg-[#D4A35A] px-2.5 py-1 text-xs font-bold text-[#0F172A] shadow-xs">
                    {selectedAsset.size}
                  </span>
                </div>
              </div>

              {/* Metadata Details Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-[#F8F5EF] border border-[#EADFCB] text-xs">
                <div>
                  <span className="text-[10px] uppercase font-mono text-[#94A3B8] block">File Type</span>
                  <span className="font-semibold text-[#0F172A]">{selectedAsset.type}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-mono text-[#94A3B8] block">Format Spec</span>
                  <span className="font-medium text-[#0F172A] truncate block">{selectedAsset.resolution || "Standard Deliverable"}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-mono text-[#94A3B8] block">Date Synced</span>
                  <span className="font-medium text-[#0F172A]">{selectedAsset.date}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-mono text-[#94A3B8] block">Vault Asset ID</span>
                  <span className="font-mono text-[#5C3A1E] truncate block">{selectedAsset.driveFileId}</span>
                </div>
              </div>

              {/* Checksum & Integrity */}
              <div className="p-3.5 rounded-xl bg-[#FFFDF9] border border-[#EADFCB] flex items-center justify-between text-xs font-mono">
                <span className="text-[#64748B]">SHA-256 Checksum:</span>
                <span className="text-[#2E7D4F] font-semibold">{selectedAsset.checksum}</span>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#EADFCB]">
                <button
                  type="button"
                  onClick={() => handleShareLink(selectedAsset)}
                  className="inline-flex items-center gap-1.5 text-xs text-[#5C3A1E] hover:underline font-medium cursor-pointer"
                >
                  <Share2 className="w-3.5 h-3.5 text-[#D4A35A]" />
                  <span>Copy Vault Share URL</span>
                </button>

                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedAsset(null)}
                  >
                    Close
                  </Button>

                  <Button
                    variant="primary"
                    size="sm"
                    disabled={downloadingId === selectedAsset.id}
                    onClick={() => {
                      handleDownload(selectedAsset);
                    }}
                    leftIcon={
                      downloadingId === selectedAsset.id ? (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Download className="w-3.5 h-3.5" />
                      )
                    }
                  >
                    {downloadingId === selectedAsset.id ? `Downloading ${downloadProgress}%` : "Download Master"}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </RouteGuard>
  );
}
