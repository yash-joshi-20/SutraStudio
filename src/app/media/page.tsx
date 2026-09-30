"use client";

import React, { useState } from "react";
import { PortalSidebar } from "@/components/dashboard/PortalSidebar";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { Download, HardDrive, Image as ImageIcon, Video, Box, FileText } from "lucide-react";

const ASSETS = [
  {
    id: "ast-1",
    name: "Aura_Noir_4K_Final_Render_01.png",
    type: "Image",
    size: "18.4 MB",
    folder: "DELIVERABLES / IMAGES",
    date: "Sep 28, 2026",
    driveFileId: "drive_09a823bf...",
  },
  {
    id: "ast-2",
    name: "Zenith_Commercial_Reel_1080p.mp4",
    type: "Video",
    size: "84.2 MB",
    folder: "DELIVERABLES / VIDEOS",
    date: "Sep 26, 2026",
    driveFileId: "drive_89c314de...",
  },
  {
    id: "ast-3",
    name: "Pavilion_Villa_Baked_Model.gltf",
    type: "3D",
    size: "42.1 MB",
    folder: "3D / ASSETS",
    date: "Sep 24, 2026",
    driveFileId: "drive_55a120ef...",
  },
  {
    id: "ast-4",
    name: "Sutra_Brand_Guidelines_V2.pdf",
    type: "Document",
    size: "4.8 MB",
    folder: "DOCUMENTS",
    date: "Sep 20, 2026",
    driveFileId: "drive_33f789aa...",
  },
];

export default function MediaLibraryPage() {
  const [activeFilter, setActiveFilter] = useState("All");

  const filteredAssets =
    activeFilter === "All"
      ? ASSETS
      : ASSETS.filter((a) => a.type === activeFilter);

  return (
    <div className="min-h-screen flex bg-[#F8F5EF] text-[#0F172A]">
      <PortalSidebar />

      <main className="flex-1 p-6 sm:p-10 max-w-5xl pb-24 md:pb-10 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-[#EADFCB] gap-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#D4A35A]">
              CLOUD STORAGE
            </span>
            <h1 className="font-serif text-3xl font-semibold text-[#0F172A] mt-1">
              Google Drive Media Library
            </h1>
            <p className="text-xs text-[#64748B]">
              All client deliverables, raw footage, and 3D assets synchronized in private Drive folders.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-[#FFFDF9] border border-[#EADFCB] px-3.5 py-1.5 rounded-full text-xs text-[#2E7D4F] font-semibold">
            <HardDrive className="w-4 h-4" />
            <span>Google Drive Connected</span>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {["All", "Image", "Video", "3D", "Document"].map((type) => (
            <button
              key={type}
              onClick={() => setActiveFilter(type)}
              className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
                activeFilter === type
                  ? "bg-[#5C3A1E] text-white shadow-xs"
                  : "bg-[#FFFDF9] text-[#64748B] border border-[#EADFCB] hover:border-[#D4A35A]"
              }`}
            >
              {type === "All" ? "All Files" : `${type}s`}
            </button>
          ))}
        </div>

        {/* Assets List */}
        <div className="rounded-2xl bg-[#FFFDF9] border border-[#EADFCB] divide-y divide-[#EADFCB]/60 shadow-xs overflow-hidden">
          {filteredAssets.map((asset) => (
            <div
              key={asset.id}
              className="p-4 sm:p-5 flex items-center justify-between gap-4 hover:bg-[#F8F5EF]/50 transition-colors"
            >
              <div className="flex items-center gap-4 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-[#F8F5EF] border border-[#EADFCB] flex items-center justify-center shrink-0">
                  {asset.type === "Image" ? (
                    <ImageIcon className="w-5 h-5 text-[#5C3A1E]" />
                  ) : asset.type === "Video" ? (
                    <Video className="w-5 h-5 text-[#5C3A1E]" />
                  ) : asset.type === "3D" ? (
                    <Box className="w-5 h-5 text-[#5C3A1E]" />
                  ) : (
                    <FileText className="w-5 h-5 text-[#5C3A1E]" />
                  )}
                </div>

                <div className="min-w-0">
                  <p className="font-semibold text-sm text-[#0F172A] truncate">
                    {asset.name}
                  </p>
                  <p className="text-xs text-[#64748B] flex items-center gap-2 mt-0.5">
                    <span>{asset.folder}</span>
                    <span>•</span>
                    <span>{asset.size}</span>
                    <span>•</span>
                    <span>{asset.date}</span>
                  </p>
                </div>
              </div>

              <button
                onClick={() => alert(`Downloading ${asset.name} from Google Drive proxy`)}
                className="p-2.5 rounded-xl bg-[#F8F5EF] border border-[#EADFCB] text-[#5C3A1E] hover:bg-[#5C3A1E] hover:text-white transition-all shrink-0 cursor-pointer"
                title="Download File"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </main>

      <MobileBottomNav />
    </div>
  );
}
