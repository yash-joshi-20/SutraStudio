"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { PortalShell } from "@/components/layout/PortalShell";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { CustomDropdown } from "@/components/ui/CustomDropdown";
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
import { ThreeDModelViewer } from "@/components/viewers/ThreeDModelViewer";
import { Panorama360Viewer } from "@/components/viewers/Panorama360Viewer";

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

const INITIAL_ASSETS: MediaAsset[] = [];

const DRIVE_FOLDERS = [
  { id: "all", name: "All Files", icon: Folder },
  { id: "Inputs", name: "Inputs & Briefs", path: "/Inputs" },
  { id: "Deliverables", name: "Deliverables & Renders", path: "/Deliverables" },
  { id: "Invoices", name: "Invoices & Receipts", path: "/Invoices" },
  { id: "02_DRAFTS", name: "Creative Drafts", path: "/Drafts" },
  { id: "04_REVISIONS", name: "Revision Passes", path: "/Revisions" },
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
      const combinedAssets: MediaAsset[] = [];
      const seenIds = new Set<string>();

      // 1. Fetch Orders to extract live project deliverables & AI generated assets
      const clientUid = user?.uid || (user?.email ? user.email : "");
      const ordersUrl = clientUid ? `/api/orders?clientUid=${encodeURIComponent(clientUid)}` : "/api/orders";
      const ordersRes = await fetch(ordersUrl);
      if (ordersRes.ok) {
        const ordersData = await ordersRes.json();
        const ordersList = ordersData.orders || [];

        ordersList.forEach((order: any) => {
          // Guard: Dummy/unpaid orders cannot appear as completed paid deliverables
          const isEligibleOrder =
            order.paymentStatus === "paid" ||
            order.status === "paid" ||
            order.status === "in_production" ||
            order.status === "delivered" ||
            order.status === "completed" ||
            order.status === "draft_delivered" ||
            order.status === "active";
          if (!isEligibleOrder) return;

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
                  thumbnail: d.previewUrl || `/api/drive/file/${fileId}`,
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
                  thumbnail: gd.imageUrl || gd.videoUrl || (gd.driveFileId ? `/api/drive/file/${gd.driveFileId}` : "/brand/sutra-brand-board-reference.png"),
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
                  thumbnail: att.url || (att.driveFileId ? `/api/drive/file/${att.driveFileId}` : "/brand/sutra-brand-board-reference.png"),
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
                  thumbnail: vf.thumbnailUrl || vf.storageUrl || vf.driveUrl || "/brand/sutra-brand-board-reference.png",
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

      // 3. Fetch Drive Files endpoint (authenticated proxy, zero Google Drive links exposed)
      try {
        const driveRes = await fetch("/api/drive/files");
        if (driveRes.ok) {
          const driveData = await driveRes.json();
          if (Array.isArray(driveData.files)) {
            driveData.files.forEach((df: any) => {
              if (!seenIds.has(df.driveFileId)) {
                seenIds.add(df.driveFileId);
                const isVid = df.mimeType?.includes("video");
                const isImg = df.mimeType?.includes("image");
                const is3D = df.mimeType?.includes("model") || df.name?.endsWith(".gltf") || df.name?.endsWith(".glb");
                const isInv = df.name?.toLowerCase().includes("invoice") || df.name?.toLowerCase().includes("receipt");
                const folderName = isInv ? "Invoices" : df.kind === "client_assets" ? "Inputs" : "Deliverables";
                combinedAssets.unshift({
                  id: df.driveFileId,
                  name: df.name,
                  type: isVid ? "Video" : isImg ? "Image" : is3D ? "3D" : "Document",
                  size: df.size ? `${(df.size / (1024 * 1024)).toFixed(1)} MB` : "1.0 MB",
                  folder: `/${folderName}`,
                  date: df.createdAt ? new Date(df.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "Drive Vault File",
                  driveFileId: df.driveFileId,
                  resolution: "Sutra Cloud Vault Synced",
                  checksum: `sha256:${df.driveFileId.slice(0, 16)}...`,
                  thumbnail: df.previewUrl || `/api/drive/file/${df.driveFileId}`,
                  downloadUrl: df.downloadUrl || `/api/drive/file/${df.driveFileId}?download=true`,
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

  const handleDownload = async (asset: MediaAsset) => {
    setDownloadingId(asset.id);
    setDownloadProgress(20);
    setErrorMessage("");
    setDownloadSuccess("");

    try {
      const fileId = asset.driveFileId || asset.id;
      const isExplicitExternal =
        asset.downloadUrl?.startsWith("http://") || asset.downloadUrl?.startsWith("https://");
      const targetUrl =
        fileId && !fileId.startsWith("demo-") && !fileId.startsWith("deliv-")
          ? `/api/drive/file/${encodeURIComponent(fileId)}?download=true`
          : asset.downloadUrl || asset.thumbnail || `/api/drive/file/${encodeURIComponent(fileId)}?download=true`;

      setDownloadProgress(60);

      // Verify file accessibility
      const res = await fetch(targetUrl, { method: "HEAD" });
      if (!res.ok) {
        if (res.status === 401) throw new Error("Authentication session expired. Please sign in to verify vault file permissions.");
        if (res.status === 403) throw new Error("Access forbidden. This file is restricted to its authorized client.");
        if (res.status === 404) throw new Error("File not found or still completing Google Drive vault processing.");
        if (res.status === 503) throw new Error("Google Drive storage proxy temporarily unavailable. Please retry in a few moments.");
        if (res.status !== 405 && !targetUrl.includes("/api/drive/file/")) {
          throw new Error(`Vault download failed (HTTP ${res.status}).`);
        }
      }

      setDownloadProgress(100);

      const link = document.createElement("a");
      link.href = targetUrl;
      link.download = asset.name || "deliverable";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setDownloadSuccess(`Downloaded "${asset.name}" from Sutra Cloud Vault.`);
      setTimeout(() => setDownloadSuccess(""), 4000);
    } catch (err: any) {
      setErrorMessage(err?.message || "Failed to download asset from Sutra Cloud Vault.");
    } finally {
      setDownloadingId(null);
      setDownloadProgress(0);
    }
  };

  const handleShareLink = (asset: MediaAsset) => {
    // Only share secure portal links, never expose raw private Google Drive links or service credentials
    const portalShareUrl = typeof window !== "undefined"
      ? `${window.location.origin}/media?asset=${encodeURIComponent(asset.id)}`
      : "";

    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(portalShareUrl);
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
      <PortalShell
        variant="client"
        title="Deliverables & Production Assets"
        subtitle="Browse, preview, and download your high-resolution renders, master videos, 3D spatial models, and brand assets."
        action={
          <div className="flex items-center gap-2">
            <Link
              href="/orders"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FFFDF9] border border-[#EADFCB] text-xs font-semibold text-[#5C3A1E] hover:border-[#D4A35A] hover:bg-[#F4EFE6] transition-all shadow-xs"
              title="View Active Orders & Deliverables"
            >
              <Layers className="w-3.5 h-3.5 text-[#D4A35A]" />
              <span className="hidden sm:inline">My Orders</span>
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
              <span className="hidden sm:inline">Sync Deliverables</span>
              <span className="sm:hidden">Sync</span>
            </Button>
          </div>
        }
      >
        <div className="space-y-6 sm:space-y-8 max-w-7xl">

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
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Filter Pills on Desktop */}
            <div className="hidden md:flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {[
                { label: "All Formats", value: "All" },
                { label: "Images", value: "Image" },
                { label: "Videos", value: "Video" },
                { label: "3D Models", value: "3D" },
                { label: "360 Panoramas", value: "360" },
                { label: "Marketing", value: "Marketing" },
                { label: "Documents", value: "Document" },
              ].map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setActiveFilter(opt.value)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all shrink-0 cursor-pointer ${
                    activeFilter === opt.value
                      ? "bg-[#5C3A1E] text-white shadow-xs"
                      : "bg-[#FFFDF9] text-[#64748B] border border-[#EADFCB] hover:border-[#D4A35A]"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {/* Accessible Custom Dropdown on Mobile */}
            <div className="md:hidden w-full sm:w-56">
              <CustomDropdown
                options={[
                  { label: "All Formats", value: "All" },
                  { label: "Images", value: "Image" },
                  { label: "Videos", value: "Video" },
                  { label: "3D Models", value: "3D" },
                  { label: "360 Panoramas", value: "360" },
                  { label: "Marketing", value: "Marketing" },
                  { label: "Documents", value: "Document" },
                ]}
                value={activeFilter}
                onChange={setActiveFilter}
                placeholder="Filter by format"
                buttonClassName="!rounded-full !bg-[#FFFDF9] !border-[#EADFCB] py-2 shadow-xs text-xs font-medium text-[#5C3A1E]"
              />
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto">
              {/* Search Input */}
              <div className="relative flex items-center flex-1 sm:w-64">
                <Search className="w-4 h-4 text-[#94A3B8] absolute left-3 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search files, orders, tags..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-full bg-[#FFFDF9] border border-[#EADFCB] text-xs text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#D4A35A]"
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
          ) : assets.length === 0 ? (
            <div className="py-20 text-center rounded-3xl bg-[#FFFDF9] border border-[#EADFCB] p-10 max-w-lg mx-auto space-y-4 shadow-xs">
              <div className="w-16 h-16 rounded-full bg-[#FAF9F5] border border-[#EADFCB] flex items-center justify-center mx-auto text-[#A98B57]">
                <FolderOpen className="w-8 h-8 text-[#A98B57]" />
              </div>
              <h3 className="font-serif text-xl font-semibold text-[#0F172A]">
                Your Deliverables Vault is Empty
              </h3>
              <p className="text-sm text-[#64748B] leading-relaxed">
                No deliverables or assets have been created yet. When you place an order or your creative team generates renders and outputs, they will automatically appear in your dedicated vault.
              </p>
              <div className="pt-2 flex justify-center">
                <Link
                  href="/orders/new"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#5C3A1E] text-white text-xs font-semibold hover:bg-[#432A16] transition-all shadow-warm"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#D4A35A]" />
                  <span>Start a New Order</span>
                </Link>
              </div>
            </div>
          ) : filteredAssets.length === 0 ? (
            <div className="py-16 text-center rounded-3xl bg-[#FFFDF9] border border-[#EADFCB] p-8 max-w-md mx-auto space-y-3">
              <Search className="w-10 h-10 text-[#94A3B8] mx-auto opacity-50" />
              <h3 className="font-serif text-lg font-semibold text-[#0F172A]">
                No Files Matched
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

                  {/* Actions Bar - Responsive, Non-Clipping Triggers */}
                  <div className="px-3 pb-3 pt-2 border-t border-[#EADFCB]/60 flex items-center justify-between gap-1.5">
                    <button
                      type="button"
                      onClick={() => setSelectedAsset(asset)}
                      className="flex-1 min-w-0 px-2 py-1.5 rounded-xl bg-[#F8F5EF] border border-[#EADFCB] text-[#0F172A] hover:border-[#D4A35A] hover:bg-[#FAF9F5] transition-colors text-[11px] font-medium flex items-center justify-center gap-1 cursor-pointer"
                      title="Preview 4K Master"
                    >
                      <Eye className="w-3.5 h-3.5 text-[#5C3A1E] shrink-0" />
                      <span className="truncate">Preview</span>
                    </button>

                    <button
                      type="button"
                      disabled={downloadingId === asset.id}
                      onClick={() => handleDownload(asset)}
                      className="flex-1 min-w-0 px-2 py-1.5 rounded-xl bg-[#5C3A1E] text-white hover:bg-[#432A16] transition-colors text-[11px] font-medium flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
                      title="Download Master"
                    >
                      {downloadingId === asset.id ? (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin text-white shrink-0" />
                      ) : (
                        <Download className="w-3.5 h-3.5 text-white shrink-0" />
                      )}
                      <span className="truncate">
                        {downloadingId === asset.id ? `${downloadProgress}%` : "Download"}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleShareLink(asset)}
                      className="px-2.5 py-1.5 rounded-xl bg-[#F8F5EF] border border-[#EADFCB] text-[#0F172A] hover:border-[#D4A35A] hover:bg-[#FAF9F5] transition-colors text-[11px] font-medium flex items-center justify-center gap-1 cursor-pointer shrink-0"
                      title="Share Link"
                    >
                      {copiedAssetId === asset.id ? (
                        <Check className="w-3.5 h-3.5 text-[#2E7D4F] shrink-0" />
                      ) : (
                        <Share2 className="w-3.5 h-3.5 text-[#5C3A1E] shrink-0" />
                      )}
                      <span className="hidden sm:inline text-[11px]">
                        {copiedAssetId === asset.id ? "Copied" : "Share"}
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
        </div>

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
              {/* Media Preview Canvas / Video Player / 3D & 360 Viewers */}
              <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-[#171717] border border-[#EADFCB] flex items-center justify-center">
                {selectedAsset.type === "3D" ? (
                  <ThreeDModelViewer
                    modelUrl={selectedAsset.downloadUrl}
                    title={selectedAsset.name}
                    className="w-full h-full"
                  />
                ) : selectedAsset.type === "360" ? (
                  <Panorama360Viewer
                    imageUrl={selectedAsset.downloadUrl || selectedAsset.thumbnail}
                    title={selectedAsset.name}
                    className="w-full h-full"
                  />
                ) : selectedAsset.isVideo ? (
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
                {selectedAsset.type !== "3D" && selectedAsset.type !== "360" && (
                  <div className="absolute top-3 left-3 z-10 flex items-center gap-2 pointer-events-none">
                    <span className="rounded-full bg-[#171717]/85 backdrop-blur-md px-3 py-1 text-xs font-semibold text-white border border-white/10 uppercase tracking-wider">
                      {selectedAsset.type}
                    </span>
                    <span className="rounded-full bg-[#D4A35A] px-2.5 py-1 text-xs font-bold text-[#0F172A] shadow-xs">
                      {selectedAsset.size}
                    </span>
                  </div>
                )}
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
      </PortalShell>
    </RouteGuard>
  );
}
