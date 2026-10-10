"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { RouteGuard } from "@/components/auth/RouteGuard";
import { LotusSymbol } from "@/components/brand/SutraLogo";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import {
  Sparkles,
  FileText,
  Image as ImageIcon,
  Video,
  Upload,
  CheckCircle2,
  Download,
  ExternalLink,
  ArrowLeft,
  Building2,
  Phone,
  Mail,
  Globe,
  RefreshCw,
  HardDrive,
  Eye,
  Layers,
  Sliders,
  AlertCircle,
  Copy,
  Check,
} from "lucide-react";

export default function AdminRebrandPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [mediaType, setMediaType] = useState<"pdf" | "image" | "video">("pdf");
  const [oldText, setOldText] = useState("Amazon");
  const [newText, setNewText] = useState("Truebuy Property");
  const [contactPhone, setContactPhone] = useState("+91 82001 92781");
  const [contactEmail, setContactEmail] = useState("yashjoshi20@zohomail.in");
  const [contactWebsite, setContactWebsite] = useState("https://sutrastudios.in");
  const [positionZone, setPositionZone] = useState<"top-left" | "top-right" | "bottom-left" | "bottom-right">("top-right");
  const [logoFile, setLogoFile] = useState<File | null>(null);

  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [recentJobs, setRecentJobs] = useState<any[]>([]);
  const [loadingJobs, setLoadingJobs] = useState(false);

  const fetchRecentJobs = useCallback(async () => {
    setLoadingJobs(true);
    try {
      const res = await fetch("/api/admin/rebrand");
      if (res.ok) {
        const data = await res.json();
        setRecentJobs(data.jobs || []);
      }
    } catch {}
    setLoadingJobs(false);
  }, []);

  useEffect(() => {
    fetchRecentJobs();
  }, [fetchRecentJobs]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      const ext = file.name.split(".").pop()?.toLowerCase();
      if (ext === "pdf") setMediaType("pdf");
      else if (["jpg", "jpeg", "png", "webp"].includes(ext || "")) setMediaType("image");
      else if (["mp4", "mov", "webm"].includes(ext || "")) setMediaType("video");
    }
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setLogoFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setError("Please upload or select an asset file to rebrand.");
      return;
    }

    setIsProcessing(true);
    setError(null);
    setResult(null);
    setProgress(15);

    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("mediaType", mediaType);
    formData.append("oldText", oldText);
    formData.append("newText", newText);
    formData.append("contactPhone", contactPhone);
    formData.append("contactEmail", contactEmail);
    formData.append("contactWebsite", contactWebsite);
    formData.append("positionZone", positionZone);
    if (logoFile) {
      formData.append("newLogo", logoFile);
    }

    const timer = setInterval(() => {
      setProgress((p) => (p < 85 ? p + 10 : p));
    }, 400);

    try {
      const res = await fetch("/api/admin/rebrand", {
        method: "POST",
        body: formData,
      });

      clearInterval(timer);
      setProgress(100);

      const data = await res.json();
      if (res.ok && data.success) {
        setResult(data);
        fetchRecentJobs();
      } else {
        throw new Error(data.error || "Failed to process asset.");
      }
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred during rebranding.");
    } finally {
      clearInterval(timer);
      setIsProcessing(false);
    }
  };

  return (
    <RouteGuard requiredRole="admin">
      <div className="min-h-screen bg-[#FAF9F5] text-[#171717] font-sans">
        {/* Navigation Bar */}
        <header className="sticky top-0 z-40 bg-[#FAF9F5]/90 backdrop-blur-md border-b border-[#EADFCB] px-6 py-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link
                href="/admin"
                className="p-2 rounded-xl border border-[#EADFCB] bg-[#FFFDF9] hover:bg-[#F3ECE0] transition-colors"
                title="Back to Admin Dashboard"
              >
                <ArrowLeft className="w-5 h-5 text-[#5C3A1E]" />
              </Link>
              <div className="flex items-center gap-2">
                <LotusSymbol className="w-7 h-7" color="gold" />
                <div>
                  <h1 className="font-serif text-xl font-bold tracking-tight text-[#0F172A]">
                    Media Rebranding & Inpainting Hub
                  </h1>
                  <p className="text-[11px] font-mono text-[#8C7A6B] uppercase tracking-wider">
                    Autonomous Multi-Format Asset Inpainter & Drive Vault Sync
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <NotificationBell />
              <Link
                href="/admin"
                className="px-3.5 py-1.5 rounded-xl border border-[#EADFCB] bg-[#FFFDF9] text-xs font-medium text-[#5C3A1E] hover:bg-[#F3ECE0]"
              >
                Admin Overview
              </Link>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-6 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column: Form & Media Upload */}
            <div className="lg:col-span-7 space-y-6">
              <form onSubmit={handleSubmit} className="bg-[#FFFDF9] border border-[#EADFCB] rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF9F5] border border-[#EADFCB] text-[10px] font-bold text-[#5C3A1E] uppercase tracking-wider mb-2">
                    <Sparkles className="w-3.5 h-3.5 text-[#D4A35A]" />
                    <span>Step 1: Select Media Asset</span>
                  </div>
                  <h2 className="font-serif text-2xl font-bold text-[#0F172A]">Upload Asset to Rebrand</h2>
                  <p className="text-xs text-[#64748B] mt-0.5">
                    Supports PDFs of any page count, High-Res Images up to 8K, and MP4 Videos without duration limits.
                  </p>
                </div>

                {/* Dropzone */}
                <div className="relative border-2 border-dashed border-[#D4A35A]/50 rounded-2xl p-6 text-center hover:bg-[#FAF9F5] transition-colors cursor-pointer">
                  <input
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg,.webp,.mp4,.mov"
                    onChange={handleFileChange}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                  <div className="flex flex-col items-center justify-center gap-2">
                    <div className="w-12 h-12 rounded-2xl bg-[#FAF9F5] border border-[#EADFCB] flex items-center justify-center text-[#A98B57]">
                      {mediaType === "pdf" ? (
                        <FileText className="w-6 h-6" />
                      ) : mediaType === "image" ? (
                        <ImageIcon className="w-6 h-6" />
                      ) : (
                        <Video className="w-6 h-6" />
                      )}
                    </div>
                    {selectedFile ? (
                      <div>
                        <p className="text-sm font-bold text-[#0F172A]">{selectedFile.name}</p>
                        <p className="text-xs text-[#64748B]">
                          {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • {mediaType.toUpperCase()} Format
                        </p>
                      </div>
                    ) : (
                      <div>
                        <p className="text-sm font-medium text-[#0F172A]">
                          Drag & drop or <span className="text-[#A98B57] underline">browse files</span>
                        </p>
                        <p className="text-[11px] text-[#64748B]">PDF, PNG, JPG, or MP4 video (Unlimited length)</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Format Selector Pills */}
                <div className="flex items-center gap-2">
                  {(["pdf", "image", "video"] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setMediaType(t)}
                      className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 border transition-all ${
                        mediaType === t
                          ? "bg-[#111827] text-[#FAF9F5] border-[#111827] shadow-sm"
                          : "bg-[#FAF9F5] text-[#64748B] border-[#EADFCB] hover:bg-[#F3ECE0]"
                      }`}
                    >
                      {t === "pdf" && <FileText className="w-3.5 h-3.5" />}
                      {t === "image" && <ImageIcon className="w-3.5 h-3.5" />}
                      {t === "video" && <Video className="w-3.5 h-3.5" />}
                      <span>{t.toUpperCase()}</span>
                    </button>
                  ))}
                </div>

                <hr className="border-[#EADFCB]" />

                {/* Rebranding Configuration */}
                <div className="space-y-4">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF9F5] border border-[#EADFCB] text-[10px] font-bold text-[#5C3A1E] uppercase tracking-wider">
                    <Sliders className="w-3.5 h-3.5 text-[#D4A35A]" />
                    <span>Step 2: Replacement Rules</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#0F172A] mb-1">
                        Old Name / Text to Remove:
                      </label>
                      <input
                        type="text"
                        value={oldText}
                        onChange={(e) => setOldText(e.target.value)}
                        placeholder="e.g. Amazon, Old Company"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF9F5] border border-[#EADFCB] text-xs font-mono text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-[#A98B57]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#0F172A] mb-1">
                        New Replacement Brand:
                      </label>
                      <input
                        type="text"
                        value={newText}
                        onChange={(e) => setNewText(e.target.value)}
                        placeholder="e.g. Truebuy Property"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF9F5] border border-[#EADFCB] text-xs font-mono text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-[#A98B57]"
                      />
                    </div>
                  </div>

                  {/* Logo Upload & Position Zone */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#0F172A] mb-1">
                        Replacement Logo (PNG transparent):
                      </label>
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        onChange={handleLogoChange}
                        className="w-full text-xs text-[#64748B] file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border file:border-[#EADFCB] file:bg-[#FAF9F5] file:text-xs file:font-medium file:text-[#5C3A1E] hover:file:bg-[#F3ECE0]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-[#0F172A] mb-1">
                        Watermark / Logo Zone:
                      </label>
                      <select
                        value={positionZone}
                        onChange={(e) => setPositionZone(e.target.value as any)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF9F5] border border-[#EADFCB] text-xs text-[#0F172A] focus:outline-none focus:ring-1 focus:ring-[#A98B57]"
                      >
                        <option value="top-right">Top-Right (Standard Watermark)</option>
                        <option value="top-left">Top-Left</option>
                        <option value="bottom-right">Bottom-Right</option>
                        <option value="bottom-left">Bottom-Left</option>
                      </select>
                    </div>
                  </div>

                  {/* Contact Info Banner Details */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-[#0F172A] mb-1 flex items-center gap-1">
                        <Phone className="w-3 h-3 text-[#A98B57]" /> Contact Phone:
                      </label>
                      <input
                        type="text"
                        value={contactPhone}
                        onChange={(e) => setContactPhone(e.target.value)}
                        placeholder="+91 82001 92781"
                        className="w-full px-3 py-2 rounded-xl bg-[#FAF9F5] border border-[#EADFCB] text-xs font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-[#0F172A] mb-1 flex items-center gap-1">
                        <Mail className="w-3 h-3 text-[#A98B57]" /> Email:
                      </label>
                      <input
                        type="text"
                        value={contactEmail}
                        onChange={(e) => setContactEmail(e.target.value)}
                        placeholder="contact@truebuy.com"
                        className="w-full px-3 py-2 rounded-xl bg-[#FAF9F5] border border-[#EADFCB] text-xs font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-[#0F172A] mb-1 flex items-center gap-1">
                        <Globe className="w-3 h-3 text-[#A98B57]" /> Website:
                      </label>
                      <input
                        type="text"
                        value={contactWebsite}
                        onChange={(e) => setContactWebsite(e.target.value)}
                        placeholder="https://sutrastudios.in"
                        className="w-full px-3 py-2 rounded-xl bg-[#FAF9F5] border border-[#EADFCB] text-xs font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                {isProcessing && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-semibold text-[#5C3A1E]">
                      <span>Inpainting & Rebranding in Progress...</span>
                      <span>{progress}%</span>
                    </div>
                    <div className="w-full h-2.5 bg-[#EADFCB] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#D4A35A] to-[#A98B57] transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Error Banner */}
                {error && (
                  <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full py-3.5 px-6 rounded-2xl bg-[#111827] text-[#FAF9F5] font-semibold text-sm hover:bg-[#1E293B] transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-md"
                >
                  {isProcessing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Executing Autonomous Rebrand Engine...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-[#D4A35A]" />
                      <span>Start Autonomous Rebrand & Sync to Drive</span>
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Right Column: Live Output & Recent Jobs */}
            <div className="lg:col-span-5 space-y-6">
              {/* Output Result Card */}
              {result && (
                <div className="bg-[#FFFDF9] border-2 border-[#A98B57] rounded-3xl p-6 shadow-md space-y-4 animate-in fade-in">
                  <div className="flex items-center gap-2 text-emerald-700">
                    <CheckCircle2 className="w-5 h-5" />
                    <h3 className="font-serif text-lg font-bold">Asset Rebranded Successfully!</h3>
                  </div>

                  <p className="text-xs text-[#64748B]">
                    Old branding has been stripped and replaced with <strong>{newText}</strong> and official contact details.
                  </p>

                  <div className="p-3 rounded-xl bg-[#FAF9F5] border border-[#EADFCB] text-xs font-mono space-y-1.5">
                    <p className="truncate"><strong>Output:</strong> {result.job?.rebrandedFilename}</p>
                    <p><strong>Format:</strong> {result.job?.mediaType?.toUpperCase()}</p>
                    {result.driveLink && (
                      <p className="text-emerald-700 flex items-center gap-1">
                        <HardDrive className="w-3 h-3" /> Synced to Google Drive Vault
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {result.downloadUrl && (
                      <a
                        href={result.downloadUrl}
                        download
                        className="flex-1 py-2.5 px-4 rounded-xl bg-[#111827] text-[#FAF9F5] text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-[#1E293B]"
                      >
                        <Download className="w-4 h-4" /> Download Rebranded Asset
                      </a>
                    )}
                    {result.driveLink && (
                      <a
                        href={result.driveLink}
                        target="_blank"
                        rel="noreferrer"
                        className="py-2.5 px-4 rounded-xl border border-[#EADFCB] bg-[#FFFDF9] text-xs font-bold text-[#5C3A1E] flex items-center gap-1.5 hover:bg-[#FAF9F5]"
                      >
                        <ExternalLink className="w-4 h-4" /> Drive
                      </a>
                    )}
                  </div>
                </div>
              )}

              {/* Recent Rebranding Telemetry */}
              <div className="bg-[#FFFDF9] border border-[#EADFCB] rounded-3xl p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-[#A98B57]" />
                    <h3 className="font-serif text-base font-bold text-[#0F172A]">Recent Rebrand Jobs</h3>
                  </div>
                  <button
                    onClick={fetchRecentJobs}
                    className="p-1.5 rounded-lg border border-[#EADFCB] hover:bg-[#FAF9F5]"
                    title="Refresh"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 text-[#5C3A1E] ${loadingJobs ? "animate-spin" : ""}`} />
                  </button>
                </div>

                {recentJobs.length === 0 ? (
                  <p className="text-xs text-[#64748B] italic py-4 text-center">
                    No rebrand tasks executed yet. Upload an asset to begin.
                  </p>
                ) : (
                  <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
                    {recentJobs.map((job, idx) => (
                      <div
                        key={job.id || idx}
                        className="p-3 rounded-xl bg-[#FAF9F5] border border-[#EADFCB] text-xs flex items-center justify-between gap-3"
                      >
                        <div className="min-w-0">
                          <p className="font-medium text-[#0F172A] truncate">
                            {job.rebrandedFilename || job.originalFilename}
                          </p>
                          <p className="text-[10px] text-[#64748B]">
                            {job.mediaType?.toUpperCase()} • {job.createdAt ? new Date(job.createdAt).toLocaleDateString() : "Just now"}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {job.downloadUrl && (
                            <a
                              href={job.downloadUrl}
                              download
                              className="p-1.5 rounded-lg bg-[#FFFDF9] border border-[#EADFCB] text-[#5C3A1E] hover:bg-[#F3ECE0]"
                              title="Download"
                            >
                              <Download className="w-3.5 h-3.5" />
                            </a>
                          )}
                          {job.driveWebViewLink && (
                            <a
                              href={job.driveWebViewLink}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1.5 rounded-lg bg-[#FFFDF9] border border-[#EADFCB] text-[#5C3A1E] hover:bg-[#F3ECE0]"
                              title="Open in Drive"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </RouteGuard>
  );
}
