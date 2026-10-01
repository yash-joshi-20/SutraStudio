"use client";

import React, { useState } from "react";
import { PortalSidebar } from "@/components/dashboard/PortalSidebar";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import {
  Download,
  HardDrive,
  Image as ImageIcon,
  Video,
  Box,
  FileText,
  Search,
  Upload,
  CheckCircle2,
  FileCode,
  ShieldCheck,
  Eye,
  ArrowUpRight,
  FolderOpen,
} from "lucide-react";
import { RouteGuard } from "@/components/auth/RouteGuard";

interface MediaAsset {
  id: string;
  name: string;
  type: "Image" | "Video" | "3D" | "Document";
  size: string;
  folder: string;
  date: string;
  driveFileId: string;
  resolution?: string;
  checksum?: string;
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
    resolution: "3840 x 2160 (4K)",
    checksum: "sha256:8f4b23...",
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
    checksum: "sha256:3d1e99...",
  },
  {
    id: "ast-3",
    name: "Pavilion_Villa_Baked_Model.gltf",
    type: "3D",
    size: "42.1 MB",
    folder: "/3D/MODELS",
    date: "Sep 24, 2026",
    driveFileId: "drive_55a120ef_sutra",
    resolution: "142,000 Polygons",
    checksum: "sha256:7c9921...",
  },
  {
    id: "ast-4",
    name: "Sutra_Brand_Guidelines_V2.pdf",
    type: "Document",
    size: "4.8 MB",
    folder: "/BRAND_ASSETS",
    date: "Sep 20, 2026",
    driveFileId: "drive_33f789aa_sutra",
    checksum: "sha256:1a8844...",
  },
  {
    id: "ast-5",
    name: "Master_Services_Agreement_Signed.pdf",
    type: "Document",
    size: "1.4 MB",
    folder: "/LEGAL_DOCS",
    date: "Sep 18, 2026",
    driveFileId: "drive_11ff492a_sutra",
    checksum: "sha256:9e5520...",
  },
];

export default function MediaLibraryPage() {
  const [assets, setAssets] = useState<MediaAsset[]>(INITIAL_ASSETS);
  const [activeFilter, setActiveFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAsset, setSelectedAsset] = useState<MediaAsset | null>(null);
  const [downloadSuccess, setDownloadSuccess] = useState("");
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

  const getAssetIcon = (type: string) => {
    switch (type) {
      case "Image":
        return <ImageIcon className="w-5 h-5 text-[#5C3A1E]" />;
      case "Video":
        return <Video className="w-5 h-5 text-[#5C3A1E]" />;
      case "3D":
        return <Box className="w-5 h-5 text-[#5C3A1E]" />;
      default:
        return <FileText className="w-5 h-5 text-[#5C3A1E]" />;
    }
  };

  const handleDownload = (asset: MediaAsset) => {
    setDownloadSuccess(`Fetching ${asset.name} from Google Drive vault...`);
    setTimeout(() => {
      setDownloadSuccess(`Download initialized for ${asset.name}`);
      setTimeout(() => setDownloadSuccess(""), 2500);
    }, 800);
  };

  const handleAddFile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFileName) return;
    const newAsset: MediaAsset = {
      id: `ast-${Date.now()}`,
      name: newFileName,
      type: newFileName.endsWith(".gltf") ? "3D" : newFileName.endsWith(".mp4") ? "Video" : newFileName.endsWith(".pdf") ? "Document" : "Image",
      size: "8.2 MB",
      folder: "/CLIENT_UPLOADS",
      date: "Just now",
      driveFileId: `drive_${Date.now()}`,
      checksum: "sha256:new...",
    };
    setAssets([newAsset, ...assets]);
    setNewFileName("");
    setUploadModalOpen(false);
  };

  return (
    <RouteGuard requiredRole="client">
      <div className="min-h-screen flex bg-[#F8F5EF] text-[#0F172A] selection:bg-[#D4A35A]/20 selection:text-[#5C3A1E]">
        <PortalSidebar />

        <main className="flex-1 p-6 sm:p-8 lg:p-10 max-w-6xl pb-24 md:pb-12 space-y-8">
          {/* Header Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-[#EADFCB] gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FAF9F5] border border-[#EADFCB] text-[10px] font-semibold uppercase tracking-wider text-[#5C3A1E] mb-2">
                <span>ENCRYPTED CLOUD ARCHIVE</span>
              </div>
              <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-[#0F172A]">
                Google Drive Media Vault
              </h1>
              <p className="text-xs text-[#64748B] mt-0.5">
                All client deliverables, raw 3D assets, ProRes master videos, and signed agreements.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-[#FFFDF9] border border-[#EADFCB] px-3.5 py-2 rounded-2xl text-xs text-[#2E7D4F] font-semibold shadow-xs">
                <HardDrive className="w-4 h-4" />
                <span>Drive Vault Synced</span>
              </div>

              <Button
                variant="primary"
                size="sm"
                onClick={() => setUploadModalOpen(true)}
                leftIcon={<Upload className="w-4 h-4" />}
              >
                Upload File
              </Button>
            </div>
          </div>

          {/* Storage Quota Card */}
          <div className="p-6 rounded-3xl bg-[#FFFDF9] border border-[#EADFCB] shadow-xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h4 className="font-serif text-base font-semibold text-[#0F172A]">
                  Vault Allocation: 4.8 GB of 50 GB Used
                </h4>
                <p className="text-xs text-[#64748B]">
                  Encrypted AES-256 cloud directory assigned to <code className="px-1 py-0.5 rounded bg-[#F8F5EF] text-[11px] font-mono text-[#5C3A1E]">drive_fld_sutra_001</code>
                </p>
              </div>
              <span className="text-xs font-mono font-bold text-[#5C3A1E]">9.6% Capacity</span>
            </div>
            <div className="w-full h-2 rounded-full bg-[#EADFCB]/50 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-[#D4A35A] to-[#5C3A1E] rounded-full w-[9.6%]" />
            </div>
          </div>

          {/* Download Notification Toast */}
          {downloadSuccess && (
            <div className="p-3 rounded-2xl bg-[#F0FDF4] border border-[#86EFAC] text-xs text-[#166534] flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#16A34A] shrink-0" />
              <span>{downloadSuccess}</span>
            </div>
          )}

          {/* Search & Filter Toolbar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {/* Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {["All", "Image", "Video", "3D", "Document"].map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setActiveFilter(type)}
                  className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                    activeFilter === type
                      ? "bg-[#5C3A1E] text-white shadow-xs"
                      : "bg-[#FFFDF9] text-[#64748B] border border-[#EADFCB] hover:border-[#D4A35A]"
                  }`}
                >
                  {type === "All" ? "All Files" : `${type}s`}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative flex items-center w-full sm:w-64">
              <Search className="w-4 h-4 text-[#94A3B8] absolute left-3 pointer-events-none" />
              <input
                type="text"
                placeholder="Search vault files..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 rounded-full bg-[#FFFDF9] border border-[#EADFCB] text-xs text-[#0F172A] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#D4A35A]"
              />
            </div>
          </div>

          {/* Assets Grid List */}
          <div className="rounded-3xl bg-[#FFFDF9] border border-[#EADFCB] divide-y divide-[#EADFCB]/60 shadow-xs overflow-hidden">
            {filteredAssets.map((asset) => (
              <div
                key={asset.id}
                className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#FAF9F5]/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-[#F8F5EF] border border-[#EADFCB] flex items-center justify-center shrink-0">
                    {getAssetIcon(asset.type)}
                  </div>
                  <div>
                    <h3 className="font-serif text-base font-semibold text-[#0F172A] hover:text-[#5C3A1E] transition-colors cursor-pointer"
                      onClick={() => setSelectedAsset(asset)}
                    >
                      {asset.name}
                    </h3>
                    <div className="flex items-center gap-3 text-xs text-[#94A3B8] mt-0.5">
                      <span className="font-mono text-[11px] text-[#5C3A1E]">{asset.folder}</span>
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
                    title="Inspect file details"
                  >
                    <Eye className="w-4 h-4" />
                  </button>

                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleDownload(asset)}
                    leftIcon={<Download className="w-3.5 h-3.5 text-[#5C3A1E]" />}
                  >
                    Download
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </main>

        <MobileBottomNav />

        {/* File Detail Modal */}
        <Modal
          isOpen={!!selectedAsset}
          onClose={() => setSelectedAsset(null)}
          title={selectedAsset?.name || "Asset Details"}
          description={`Stored in ${selectedAsset?.folder}`}
          maxWidth="md"
        >
          {selectedAsset && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-[#F8F5EF] border border-[#EADFCB] space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-[#64748B]">Asset Type:</span>
                  <span className="font-semibold text-[#0F172A]">{selectedAsset.type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#64748B]">File Size:</span>
                  <span className="font-semibold text-[#0F172A]">{selectedAsset.size}</span>
                </div>
                {selectedAsset.resolution && (
                  <div className="flex justify-between">
                    <span className="text-[#64748B]">Format / Spec:</span>
                    <span className="font-semibold text-[#0F172A]">{selectedAsset.resolution}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-[#64748B]">Drive ID:</span>
                  <span className="font-mono text-[#5C3A1E]">{selectedAsset.driveFileId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#64748B]">Integrity:</span>
                  <span className="font-mono text-[10px] text-[#2E7D4F]">{selectedAsset.checksum}</span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
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
                  onClick={() => {
                    handleDownload(selectedAsset);
                    setSelectedAsset(null);
                  }}
                  leftIcon={<Download className="w-3.5 h-3.5" />}
                >
                  Download from Drive
                </Button>
              </div>
            </div>
          )}
        </Modal>

        {/* Upload Modal */}
        <Modal
          isOpen={uploadModalOpen}
          onClose={() => setUploadModalOpen(false)}
          title="Upload to Google Drive Vault"
          description="Upload project reference images, moodboards, or 3D files to your cloud folder."
          maxWidth="md"
        >
          <form onSubmit={handleAddFile} className="space-y-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-[#0F172A] mb-1.5">
                File Name
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Brand_Identity_Reference_01.png"
                value={newFileName}
                onChange={(e) => setNewFileName(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-[#FFFFFF] border border-[#EADFCB] text-xs text-[#0F172A] focus:outline-none focus:border-[#D4A35A]"
              />
            </div>
            <div className="flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setUploadModalOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm">
                Add to Vault
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </RouteGuard>
  );
}
