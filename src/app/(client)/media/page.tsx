"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { PortalSidebar } from "@/components/dashboard/PortalSidebar";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import {
  Download,
  HardDrive,
  Globe,
  Image as ImageIcon,
  Video,
  Box,
  FileText,
  Search,
  Upload,
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
}

const INITIAL_ASSETS: MediaAsset[] = [
  {
    id: "ast-1",
    name: "Aura_Noir_4K_Final_Render_01.png",
    type: "Image",
    size: "18.4 MB",
    folder: "/DELIVERABLES/IMAGES",
    date: "Sep 28, 2026",
    driveFileId: "drive_09a823bf_sutra",
    resolution: "3840 x 2160 (4K UHD)",
    checksum: "sha256:8f4b23c91e0a...",
    thumbnail: "https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "ast-2",
    name: "Zenith_Commercial_Reel_1080p.mp4",
    type: "Video",
    size: "84.2 MB",
    folder: "/DELIVERABLES/VIDEOS",
    date: "Sep 26, 2026",
    driveFileId: "drive_89c314de_sutra",
    resolution: "1920 x 1080 (ProRes 422)",
    checksum: "sha256:3d1e9912ba44...",
    thumbnail: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "ast-3",
    name: "Pavilion_Villa_Baked_Model.gltf",
    type: "3D",
    size: "42.1 MB",
    folder: "/3D/MODELS",
    date: "Sep 24, 2026",
    driveFileId: "drive_55a120ef_sutra",
    resolution: "142,000 Polygons (PBR)",
    checksum: "sha256:7c9921e54f01...",
    thumbnail: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "ast-4",
    name: "Pavilion_360_Virtual_Tour.hdr",
    type: "360",
    size: "65.0 MB",
    folder: "/360_TOURS",
    date: "Sep 22, 2026",
    driveFileId: "drive_44b910ca_sutra",
    resolution: "8192 x 4096 (Equirectangular)",
    checksum: "sha256:5b8812ca43e9...",
    thumbnail: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "ast-5",
    name: "Diwali_Meta_Ads_Creative_Pack.zip",
    type: "Marketing",
    size: "38.6 MB",
    folder: "/META_ADS_CAMPAIGN",
    date: "Sep 21, 2026",
    driveFileId: "drive_77c891ff_sutra",
    resolution: "3 Ratios (9:16, 1:1, 16:9)",
    checksum: "sha256:22a498bb7621...",
    thumbnail: "https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "ast-6",
    name: "Sutra_Brand_Guidelines_V2.pdf",
    type: "Document",
    size: "4.8 MB",
    folder: "/BRAND_ASSETS",
    date: "Sep 20, 2026",
    driveFileId: "drive_33f789aa_sutra",
    resolution: "Vector PDF (300 DPI)",
    checksum: "sha256:1a8844ff0923...",
    thumbnail: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "ast-7",
    name: "Master_Services_Agreement_Signed.pdf",
    type: "Document",
    size: "1.4 MB",
    folder: "/LEGAL_DOCS",
    date: "Sep 18, 2026",
    driveFileId: "drive_11ff492a_sutra",
    resolution: "Digitally Signed PDF",
    checksum: "sha256:9e5520ee78ab...",
    thumbnail: "https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=800&q=80",
  },
];

export default function MediaLibraryPage() {
  const [assets, setAssets] = useState<MediaAsset[]>(INITIAL_ASSETS);
  const [activeFilter, setActiveFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAsset, setSelectedAsset] = useState<MediaAsset | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Loading, Download & Error States
  const [isLoading, setIsLoading] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [downloadSuccess, setDownloadSuccess] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [newFileName, setNewFileName] = useState("");

  const filteredAssets = assets.filter((asset) => {
    const matchesFilter =
      activeFilter === "All" || asset.type === activeFilter;
    const matchesSearch =
      searchQuery === "" ||
      asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.folder.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleRefreshVault = () => {
    setIsLoading(true);
    setErrorMessage("");
    setTimeout(() => {
      setIsLoading(false);
      setDownloadSuccess("Google Drive vault index refreshed successfully.");
      setTimeout(() => setDownloadSuccess(""), 2500);
    }, 700);
  };

  const handleSimulateError = () => {
    setErrorMessage("Google Drive API rate limit reached. Re-authenticating service account token...");
  };

  const handleRetryConnection = () => {
    setIsLoading(true);
    setTimeout(() => {
      setErrorMessage("");
      setIsLoading(false);
      setDownloadSuccess("Connection to Google Drive vault re-established.");
      setTimeout(() => setDownloadSuccess(""), 3000);
    }, 800);
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
            setDownloadSuccess(`Downloaded "${asset.name}" from Google Drive vault.`);
            setTimeout(() => setDownloadSuccess(""), 3500);
          }, 300);
          return 100;
        }
        return prev + 35;
      });
    }, 200);
  };

  const handleAddFile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFileName.trim()) return;

    const ext = newFileName.split(".").pop()?.toLowerCase();
    let type: MediaAsset["type"] = "Document";
    if (ext === "png" || ext === "jpg" || ext === "jpeg" || ext === "tiff") type = "Image";
    else if (ext === "mp4" || ext === "mov") type = "Video";
    else if (ext === "gltf" || ext === "usdz" || ext === "obj") type = "3D";
    else if (ext === "hdr") type = "360";
    else if (ext === "zip") type = "Marketing";

    const newAsset: MediaAsset = {
      id: `ast-${Date.now()}`,
      name: newFileName,
      type,
      size: "12.4 MB",
      folder: "/CLIENT_UPLOADS",
      date: "Just now",
      driveFileId: `drive_${Math.random().toString(36).substring(2, 10)}_sutra`,
      checksum: `sha256:${Math.random().toString(36).substring(2, 12)}...`,
      thumbnail: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=800&q=80",
    };

    setAssets([newAsset, ...assets]);
    setNewFileName("");
    setUploadModalOpen(false);
    setDownloadSuccess(`Uploaded "${newAsset.name}" to Google Drive vault folder /CLIENT_UPLOADS`);
    setTimeout(() => setDownloadSuccess(""), 3500);
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

        <main id="main-content" className="flex-1 p-6 sm:p-8 lg:p-10 max-w-6xl pb-24 md:pb-12 space-y-8">
          {/* =========================================================
              HEADER BAR
              ========================================================= */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-[#EADFCB] gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FAF9F5] border border-[#EADFCB] text-[10px] font-semibold uppercase tracking-wider text-[#5C3A1E] mb-2">
                <span>GOOGLE DRIVE STORAGE</span>
              </div>
              <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-[#0F172A]">
                Media Library & Vault
              </h1>
              <p className="text-xs text-[#64748B] mt-0.5">
                Encrypted client cloud media: 4K master renders, ProRes reels, 3D GLTF models, and campaign assets.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FFFDF9] border border-[#EADFCB] text-xs font-semibold text-[#5C3A1E] hover:border-[#D4A35A] hover:bg-[#F4EFE6] transition-all shadow-xs touch-target min-h-[36px]"
                title="Go to Public Website"
              >
                <Globe className="w-3.5 h-3.5 text-[#D4A35A]" />
                <span>View Website</span>
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
                Sync Vault
              </Button>

              <Button
                variant="primary"
                size="sm"
                onClick={() => setUploadModalOpen(true)}
                leftIcon={<Upload className="w-3.5 h-3.5" />}
              >
                Upload File
              </Button>
            </div>
          </div>

          {/* =========================================================
              STORAGE ALLOCATION & HEALTH METRIC
              ========================================================= */}
          <div className="p-6 rounded-3xl bg-[#FFFDF9] border border-[#EADFCB] shadow-xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <HardDrive className="w-4 h-4 text-[#5C3A1E]" />
                  <h4 className="font-serif text-base font-semibold text-[#0F172A]">
                    Cloud Vault Connected
                  </h4>
                  <Badge variant="completed" size="sm">
                    Synced & Healthy
                  </Badge>
                </div>
              </div>
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
              <span className="text-[10px] font-mono text-[#15803D]">Google Drive API v3</span>
            </div>
          )}

          {errorMessage && (
            <div className="p-4 rounded-2xl bg-[#FEF2F2] border border-[#FECACA] text-xs text-[#991B1B] flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in duration-200">
              <div className="flex items-center gap-2.5">
                <AlertTriangle className="w-4 h-4 text-[#DC2626] shrink-0" />
                <div>
                  <span className="font-bold">Drive Connection Error: </span>
                  <span>{errorMessage}</span>
                </div>
              </div>
              <Button
                variant="secondary"
                size="sm"
                className="shrink-0 text-xs py-1"
                onClick={handleRetryConnection}
                leftIcon={<RefreshCw className="w-3 h-3 text-[#991B1B]" />}
              >
                Retry Connection
              </Button>
            </div>
          )}

          {/* Test Simulation Controls */}
          <div className="flex items-center justify-end gap-2 text-[11px] text-[#94A3B8]">
            <span>Simulate State:</span>
            <button
              type="button"
              onClick={handleSimulateError}
              className="px-2 py-0.5 rounded border border-[#EADFCB] bg-[#FFFDF9] hover:text-[#DC2626] transition-colors"
            >
              Simulate Error
            </button>
            <button
              type="button"
              onClick={handleRefreshVault}
              className="px-2 py-0.5 rounded border border-[#EADFCB] bg-[#FFFDF9] hover:text-[#5C3A1E] transition-colors"
            >
              Simulate Loading
            </button>
          </div>

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
                  {type === "All" ? "All Files" : `${type}s`}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3">
              {/* Search Input */}
              <div className="relative flex items-center w-full sm:w-64">
                <Search className="w-4 h-4 text-[#94A3B8] absolute left-3 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search file name or folder..."
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
          {isLoading ? (
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
                No files matched your query &quot;{searchQuery}&quot; in the current filter.
              </p>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setSearchQuery("");
                  setActiveFilter("All");
                }}
              >
                Reset Search
              </Button>
            </div>
          ) : viewMode === "grid" ? (
            /* =========================================================
               GRID VIEW WITH VISUAL MEDIA PREVIEWS
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

                      {/* Top Badges */}
                      <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5">
                        <span className="rounded-full bg-[#171717]/85 backdrop-blur-md px-2.5 py-0.5 text-[10px] font-semibold text-white border border-white/10 uppercase tracking-wider">
                          {asset.type}
                        </span>
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

                  {/* Actions Bar */}
                  <div className="px-4 pb-4 pt-2 border-t border-[#EADFCB]/60 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedAsset(asset)}
                      className="px-2.5 py-1.5 rounded-xl bg-[#F8F5EF] border border-[#EADFCB] text-[#0F172A] hover:border-[#D4A35A] transition-colors text-xs flex items-center gap-1 font-medium"
                    >
                      <Eye className="w-3.5 h-3.5 text-[#5C3A1E]" />
                      <span>Preview</span>
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
                      {downloadingId === asset.id
                        ? `${downloadProgress}%`
                        : "Download"}
                    </Button>
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
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 sm:shrink-0">
                    <button
                      type="button"
                      onClick={() => setSelectedAsset(asset)}
                      className="p-2 rounded-xl bg-[#F8F5EF] border border-[#EADFCB] text-[#0F172A] hover:border-[#D4A35A] transition-all cursor-pointer"
                      title="Inspect preview & checksum"
                    >
                      <Eye className="w-4 h-4 text-[#5C3A1E]" />
                    </button>

                    <Button
                      variant="secondary"
                      size="sm"
                      disabled={downloadingId === asset.id}
                      onClick={() => handleDownload(asset)}
                      leftIcon={
                        downloadingId === asset.id ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#5C3A1E]" />
                        ) : (
                          <Download className="w-3.5 h-3.5 text-[#5C3A1E]" />
                        )
                      }
                    >
                      {downloadingId === asset.id ? `Downloading ${downloadProgress}%` : "Download"}
                    </Button>
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
          description={`Google Drive Directory: ${selectedAsset?.folder}`}
          maxWidth="lg"
        >
          {selectedAsset && (
            <div className="space-y-5">
              {/* Media Preview Aspect Canvas */}
              <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-[#F4EFE6] border border-[#EADFCB]">
                <Image
                  src={selectedAsset.thumbnail}
                  alt={selectedAsset.name}
                  fill
                  className="object-cover"
                />
                <div className="absolute top-3 left-3 z-10 flex items-center gap-2">
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
                  <span className="text-[10px] uppercase font-mono text-[#94A3B8] block">Drive File ID</span>
                  <span className="font-mono text-[#5C3A1E] truncate block">{selectedAsset.driveFileId}</span>
                </div>
              </div>

              {/* Checksum & Integrity */}
              <div className="p-3.5 rounded-xl bg-[#FFFDF9] border border-[#EADFCB] flex items-center justify-between text-xs font-mono">
                <span className="text-[#64748B]">SHA-256 Checksum:</span>
                <span className="text-[#2E7D4F] font-semibold">{selectedAsset.checksum}</span>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-[#EADFCB]">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedAsset(null)}
                >
                  Close Preview
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
                  {downloadingId === selectedAsset.id ? `Downloading ${downloadProgress}%` : "Download File"}
                </Button>
              </div>
            </div>
          )}
        </Modal>

        {/* =========================================================
            UPLOAD FILE MODAL
            ========================================================= */}
        <Modal
          isOpen={uploadModalOpen}
          onClose={() => setUploadModalOpen(false)}
          title="Upload to Google Drive Vault"
          description="Upload reference moodboards, client logos, or 3D CAD files to your cloud vault."
          maxWidth="md"
        >
          <form onSubmit={handleAddFile} className="space-y-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">
                File Name & Extension
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Architectural_Elevation_Pass.png"
                value={newFileName}
                onChange={(e) => setNewFileName(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-[#FFFFFF] border border-[#EADFCB] text-xs text-[#0F172A] focus:outline-none focus:border-[#D4A35A]"
              />
              <span className="text-[10px] text-[#94A3B8] mt-1 block">
                Supported: .png, .jpg, .mp4, .gltf, .hdr, .pdf, .zip
              </span>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setUploadModalOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm">
                Add to Drive Vault
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </RouteGuard>
  );
}
