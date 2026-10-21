"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import {
  Sparkles,
  Video as VideoIcon,
  Image as ImageIcon,
  Share2,
  Copy,
  Check,
  Send,
  ExternalLink,
  RefreshCw,
  Sliders,
  Flame,
  Globe,
  Smartphone,
  Eye,
  Bookmark,
  Heart,
  MessageCircle,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Layers,
  CheckCircle2,
  AlertCircle,
  FolderOpen,
  Trash2,
  ChevronRight,
  Tag,
  Rocket,
  Calendar,
  DollarSign,
  Activity,
  Zap,
} from "lucide-react";
import type { GeneratedPromotionData } from "@/app/api/admin/promotions/generate/route";

function InstagramIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

function FacebookIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

interface MediaPreset {
  id: string;
  title: string;
  url: string;
  type: "video" | "image";
  thumbnailUrl: string;
  tag: string;
}

const PRESET_MEDIA: MediaPreset[] = [
  {
    id: "hero_reel",
    title: "Master Studio Showreel (Vertical 4K)",
    url: "/videos/hero/hero-mobile.mp4",
    type: "video",
    thumbnailUrl: "/videos/hero/hero-poster.webp",
    tag: "Flagship Showreel",
  },
  {
    id: "ai_video_reel",
    title: "AI Video & Commercial CGI Motion",
    url: "/videos/services/ai-video-mobile.mp4",
    type: "video",
    thumbnailUrl: "/videos/services/ai-video-poster.webp",
    tag: "Commercial Reel",
  },
  {
    id: "spatial_3d_reel",
    title: "Spatial 3D Architecture & Lighting Reel",
    url: "/videos/services/spatial-3d-mobile.mp4",
    type: "video",
    thumbnailUrl: "/videos/services/spatial-3d-poster.webp",
    tag: "3D Spatial CGI",
  },
  {
    id: "watch_cgi",
    title: "Luxury Horology 3D Masterpiece",
    url: "/images/projects/sutra-watch-3d.jpg",
    type: "image",
    thumbnailUrl: "/images/projects/sutra-watch-3d.jpg",
    tag: "3D Product CGI",
  },
  {
    id: "cosmetic_cgi",
    title: "Haute Cosmetic Photorealism",
    url: "/images/projects/sutra-cosmetic-render.jpg",
    type: "image",
    thumbnailUrl: "/images/projects/sutra-cosmetic-render.jpg",
    tag: "Luxury Visual",
  },
  {
    id: "villa_arch",
    title: "Modern Architectural Villa Viz",
    url: "/images/projects/proj-villa.webp",
    type: "image",
    thumbnailUrl: "/images/projects/proj-villa.webp",
    tag: "Architectural 4K",
  },
  {
    id: "velocity_spatial",
    title: "Koenigsegg Spatial Automotive CGI",
    url: "/images/projects/koenigsegg-velocity.png",
    type: "image",
    thumbnailUrl: "/images/projects/koenigsegg-velocity.png",
    tag: "Automotive CGI",
  },
];

const CAMPAIGN_PRESETS = [
  {
    id: "daily_trend_creator",
    title: "Daily Trend Creator (Flagship)",
    price: "₹19,999/mo",
    badge: "Most Popular",
    desc: "30 Commercial Video Reels / Month. 48h turnaround, 4K rendering.",
    icon: Flame,
  },
  {
    id: "starter_trend",
    title: "Starter Trend Retainer",
    price: "₹9,999/mo",
    badge: "High Conversion",
    desc: "15 Commercial Social Reels & Visual Carousels.",
    icon: Sparkles,
  },
  {
    id: "commercial_video_reels",
    title: "4K Commercial Video Reels",
    price: "₹499 - ₹1,999",
    badge: "Entry Service",
    desc: "Scroll-stopping CGI motion reels and product animations.",
    icon: VideoIcon,
  },
  {
    id: "spatial_3d_render",
    title: "3D Spatial & Architecture Viz",
    price: "₹999 - ₹4,999",
    badge: "High Ticket",
    desc: "Photorealistic 4K interior & exterior architectural renders.",
    icon: Layers,
  },
  {
    id: "brand_identity_launch",
    title: "Vedic-Modern Brand Identity",
    price: "₹2,999 - ₹14,999",
    badge: "Atelier Suite",
    desc: "Timeless brand system uniting heritage Vedic proportion with code.",
    icon: Globe,
  },
  {
    id: "custom",
    title: "Custom Studio Campaign",
    price: "Bespoke",
    badge: "Custom Focus",
    desc: "Targeted self-promotion with your custom brief and offer.",
    icon: Sliders,
  },
];

export function MetaPromotionStudio() {
  const [selectedCampaign, setSelectedCampaign] = useState("daily_trend_creator");
  const [platform, setPlatform] = useState<"instagram_reel" | "facebook_post" | "meta_carousel" | "meta_ad">("instagram_reel");
  const [language, setLanguage] = useState<"english" | "gujarati" | "hindi" | "hinglish">("english");
  const [selectedMedia, setSelectedMedia] = useState<MediaPreset>(PRESET_MEDIA[0]);
  const [customMediaUrl, setCustomMediaUrl] = useState("");
  const [customPrompt, setCustomPrompt] = useState("");

  const [isGenerating, setIsGenerating] = useState(false);
  const [currentPromotion, setCurrentPromotion] = useState<GeneratedPromotionData | null>(null);
  const [savedPromotions, setSavedPromotions] = useState<GeneratedPromotionData[]>([]);
  const [isSavedDrawerOpen, setIsSavedDrawerOpen] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Self-Promotion Daily Drop & Meta Ads State
  const [isDispatchingDailyPromo, setIsDispatchingDailyPromo] = useState(false);
  const [dailyPromoResult, setDailyPromoResult] = useState<any | null>(null);
  const [metaCampaigns, setMetaCampaigns] = useState<any[]>([]);
  const [isLaunchingMetaAd, setIsLaunchingMetaAd] = useState(false);
  const [metaAdBudget, setMetaAdBudget] = useState(500);
  const [metaAdAudience, setMetaAdAudience] = useState("Founders, Luxury Brands & D2C");
  const [isMetaAdModalOpen, setIsMetaAdModalOpen] = useState(false);
  const [metaAdSuccessNotice, setMetaAdSuccessNotice] = useState<string | null>(null);
  const [activeMobileTab, setActiveMobileTab] = useState<"config" | "preview">("config");

  // Phone Mockup Interactive States
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(1480);
  const [isSaved, setIsSaved] = useState(false);
  const [captionExpanded, setCaptionExpanded] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Load saved promotions and meta campaigns on mount
  useEffect(() => {
    fetchSavedPromotions();
    fetchMetaCampaigns();
  }, []);

  const fetchMetaCampaigns = async () => {
    try {
      const res = await fetch("/api/admin/marketing/meta-ads");
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.campaigns)) {
          setMetaCampaigns(data.campaigns);
        }
      }
    } catch (e) {
      console.warn("Failed to load Meta campaigns:", e);
    }
  };

  const handleDispatchDailyPromo = async () => {
    setIsDispatchingDailyPromo(true);
    setActionNotice(null);
    try {
      const res = await fetch("/api/admin/marketing/dispatch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to dispatch daily self-promotion");
      setDailyPromoResult(data);
      setActionNotice("✓ Success: Today's 4K Post & Video Reel synthesized & staged for Instagram & Facebook!");
    } catch (err: any) {
      setActionNotice(`Error: ${err.message || err}`);
    } finally {
      setIsDispatchingDailyPromo(false);
    }
  };

  const handleLaunchStudioMetaAd = async () => {
    setIsLaunchingMetaAd(true);
    setMetaAdSuccessNotice(null);
    try {
      const headline = currentPromotion?.metaAdCopy?.headline || currentPromotion?.title || "Sutra Studio — 4K Commercial Visuals & 3D Spatial Design";
      const caption = currentPromotion?.caption || "Where Indian aesthetic tradition meets high-precision creative technology. Inquire via WhatsApp.";
      const creativeUrl = currentPromotion?.mediaUrl || activeMedia.url;

      const res = await fetch("/api/admin/marketing/meta-ads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: `ORD-SELF-PROMO-${Date.now().toString().slice(-4)}`,
          clientName: "Sutra Studio (Self-Promotion)",
          clientEmail: "studio@sutrastudios.in",
          brandName: "Sutra Studio Atelier",
          tier: "Growth (₹7,999)",
          budgetAmount: metaAdBudget,
          headline,
          caption,
          creativeUrl,
          targetPlacements: ["Instagram Feed", "Instagram Reels", "Facebook Feed"],
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to launch Meta Ad");
      setMetaAdSuccessNotice(`✓ Campaign registered in Meta Ads Manager (Status: PAUSED for review)!`);
      fetchMetaCampaigns();
      setTimeout(() => {
        setMetaAdSuccessNotice(null);
        setIsMetaAdModalOpen(false);
      }, 4000);
    } catch (err: any) {
      alert(`Meta Ad Launch Error: ${err.message || err}`);
    } finally {
      setIsLaunchingMetaAd(false);
    }
  };

  const fetchSavedPromotions = async () => {
    try {
      const res = await fetch("/api/admin/promotions");
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.promotions)) {
          setSavedPromotions(data.promotions);
        }
      }
    } catch (e) {
      console.warn("Failed to load saved promotions:", e);
    }
  };

  // Generate Promotion with AI
  const handleGenerate = async () => {
    setIsGenerating(true);
    setActionNotice(null);
    try {
      const activeMediaUrl = customMediaUrl.trim() || selectedMedia.url;
      const activeMediaType = customMediaUrl.trim()
        ? customMediaUrl.endsWith(".mp4") || customMediaUrl.endsWith(".mov")
          ? "video"
          : "image"
        : selectedMedia.type;

      const res = await fetch("/api/admin/promotions/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          campaignType: selectedCampaign,
          platform,
          language,
          mediaUrl: activeMediaUrl,
          mediaType: activeMediaType,
          customPrompt,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Generation failed.");
      }

      if (data.promotion) {
        setCurrentPromotion(data.promotion);
        setActionNotice("✓ Promotion successfully synthesized with Meta AI!");
        setTimeout(() => setActionNotice(null), 4000);
      }
    } catch (e: any) {
      setActionNotice(`Error: ${e?.message || e}`);
    } finally {
      setIsGenerating(false);
    }
  };

  // Save current promotion to studio vault
  const handleSaveToVault = async () => {
    if (!currentPromotion) return;
    try {
      const res = await fetch("/api/admin/promotions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(currentPromotion),
      });
      if (res.ok) {
        setActionNotice("✓ Saved to Studio Promotion Library!");
        fetchSavedPromotions();
        setTimeout(() => setActionNotice(null), 3000);
      }
    } catch (e: any) {
      alert(`Save failed: ${e?.message || e}`);
    }
  };

  // Delete promotion from vault
  const handleDeleteSaved = async (id: string) => {
    if (!confirm("Are you sure you want to remove this promotion from the studio library?")) return;
    try {
      const res = await fetch(`/api/admin/promotions?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setSavedPromotions((prev) => prev.filter((p) => p.id !== id));
      }
    } catch (e: any) {
      alert(`Delete failed: ${e?.message || e}`);
    }
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const toggleVideoPlayback = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const activeMedia = customMediaUrl.trim()
    ? {
        url: customMediaUrl.trim(),
        type: (customMediaUrl.endsWith(".mp4") || customMediaUrl.endsWith(".mov") ? "video" : "image") as "video" | "image",
        title: "Custom Attached Media",
      }
    : selectedMedia;

  return (
    <div className="space-y-6">
      {/* Studio Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[#E5E1D8]">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-[#FAF9F5] border border-[#E5E1D8] text-[#A98B57]">
              <Sparkles className="w-5 h-5 text-[#A98B57]" />
            </div>
            <div>
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#171717]">
                Meta AI Promotion Studio
              </h1>
              <p className="text-xs text-[#64748B] mt-0.5">
                Autonomous Instagram &amp; Facebook Self-Promotion Engine for Sutra Studio Services &amp; 4K Retainers
              </p>
            </div>
          </div>
        </div>

        {/* Connected Social Channel Status Badges */}
        <div className="flex items-center gap-2 flex-wrap">
          <a
            href="https://www.instagram.com/yashsutrastudio/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-gradient-to-r from-pink-50 to-rose-50 border border-pink-200 text-pink-900 hover:shadow-xs transition-all"
            title="Sutra Studio Instagram"
          >
            <InstagramIcon className="w-3.5 h-3.5 text-pink-600" />
            <span>@yashsutrastudio</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          </a>

          <a
            href="https://www.facebook.com/yashsutrastudio/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-blue-50 border border-blue-200 text-blue-900 hover:shadow-xs transition-all"
            title="Sutra Studio Facebook Page"
          >
            <FacebookIcon className="w-3.5 h-3.5 text-blue-600" />
            <span>Facebook Page</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          </a>

          <button
            type="button"
            onClick={() => setIsSavedDrawerOpen(!isSavedDrawerOpen)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-[#FAF9F5] border border-[#E5E1D8] text-[#5C3A1E] hover:bg-[#F0ECE1] transition-all cursor-pointer"
          >
            <FolderOpen className="w-3.5 h-3.5 text-[#A98B57]" />
            <span>Saved Promos ({savedPromotions.length})</span>
          </button>
        </div>
      </div>

      {actionNotice && (
        <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs font-semibold text-[#5C3A1E] flex items-center justify-between animate-fade-in">
          <span>{actionNotice}</span>
          <button onClick={() => setActionNotice(null)} className="text-[#A98B57] hover:text-[#5C3A1E]">
            ✕
          </button>
        </div>
      )}

      {/* ============================================================ */}
      {/* TOP HERO: DAILY SELF-PROMOTION ENGINE (1x Post + 1x Reel)   */}
      {/* ============================================================ */}
      <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-[#FAF9F5] via-[#FFFDF9] to-[#F8F5EF] border border-[#E5E1D8] shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#171717] text-[#A98B57] flex items-center justify-center shrink-0 shadow-xs">
              <Rocket className="w-5 h-5 text-[#A98B57]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-serif font-bold text-base sm:text-lg text-[#171717]">
                  Daily Self-Promotion Engine
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#FAF9F5] border border-[#E5E1D8] text-[#8C6D3B]">
                  Instagram &amp; Facebook Feed
                </span>
              </div>
              <p className="text-xs text-[#64748B] mt-0.5">
                Generate and stage today&apos;s 4K luxury master post + 9:16 commercial motion reel for Sutra Studio.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={isDispatchingDailyPromo}
              onClick={handleDispatchDailyPromo}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#171717] via-[#5C3A1E] to-[#171717] text-white font-serif font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs hover:shadow-md transition-all cursor-pointer disabled:opacity-60"
            >
              {isDispatchingDailyPromo ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#A98B57]" />
                  <span>Synthesizing Daily 4K Drop...</span>
                </>
              ) : (
                <>
                  <Zap className="w-3.5 h-3.5 text-[#A98B57]" />
                  <span>⚡ Dispatch Today&apos;s 4K Post &amp; Video Reel</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Live Staged Daily Output Card */}
        {dailyPromoResult && (
          <div className="p-4 rounded-xl bg-white border border-[#E5E1D8] shadow-2xs space-y-3 animate-fade-in">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-[#171717] flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Today&apos;s Drop Staged: {dailyPromoResult.concept?.disciplineName || "Creative Technology"}</span>
              </span>
              <span className="text-[10px] font-mono text-[#A98B57] bg-[#FAF9F5] px-2 py-0.5 rounded border border-[#E5E1D8]">
                Run ID: {dailyPromoResult.runId}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-[#FAF9F5] border border-[#E5E1D8] space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#171717] flex items-center gap-1">
                    <ImageIcon className="w-3.5 h-3.5 text-[#A98B57]" /> 1x 4K Master Post
                  </span>
                  <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                    Ready
                  </span>
                </div>
                <p className="text-[11px] text-[#64748B] line-clamp-1">
                  {dailyPromoResult.imagePost?.title || "Master 4K Commercial Visual"}
                </p>
                <div className="flex items-center gap-2 pt-1 text-[10px]">
                  <a
                    href={dailyPromoResult.imagePost?.mediaUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#A98B57] hover:underline flex items-center gap-1 font-semibold"
                  >
                    <Eye className="w-3 h-3" /> View 4K Master
                  </a>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-[#FAF9F5] border border-[#E5E1D8] space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#171717] flex items-center gap-1">
                    <VideoIcon className="w-3.5 h-3.5 text-[#A98B57]" /> 1x Commercial Motion Reel
                  </span>
                  <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                    9:16 Video
                  </span>
                </div>
                <p className="text-[11px] text-[#64748B] line-clamp-1">
                  {dailyPromoResult.videoReel?.title || "4K Kinetic Showreel"}
                </p>
                <div className="flex items-center gap-2 pt-1 text-[10px]">
                  <a
                    href={dailyPromoResult.videoReel?.mediaUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#A98B57] hover:underline flex items-center gap-1 font-semibold"
                  >
                    <Play className="w-3 h-3" /> Preview Reel Video
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Mobile / Tablet Responsive Mode Switcher */}
      <div className="flex lg:hidden items-center p-1 rounded-xl bg-[#FAF9F5] border border-[#E5E1D8] shadow-2xs">
        <button
          type="button"
          onClick={() => setActiveMobileTab("config")}
          className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeMobileTab === "config"
              ? "bg-[#171717] text-white shadow-xs"
              : "text-[#64748B] hover:text-[#171717]"
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>1. Studio Controls (Steps 1–4)</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveMobileTab("preview")}
          className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeMobileTab === "preview"
              ? "bg-[#171717] text-white shadow-xs"
              : "text-[#64748B] hover:text-[#171717]"
          }`}
        >
          <Smartphone className="w-3.5 h-3.5 text-[#A98B57]" />
          <span>2. Live Reel Mockup</span>
        </button>
      </div>

      {/* Main 2-Column Grid: Left Controls / Right Live Smartphone Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ============================================================ */}
        {/* LEFT COLUMN: CAMPAIGN CONFIGURATION & GENERATION (7 Cols)     */}
        {/* ============================================================ */}
        <div className={`lg:col-span-7 space-y-6 ${activeMobileTab === "preview" ? "hidden lg:block" : "block"}`}>
          {/* STEP 1: SELECT CAMPAIGN TARGET */}
          <div className="p-5 sm:p-6 rounded-2xl bg-[#FFFDF9] border border-[#E5E1D8] shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-[#171717] text-[#FAF9F5] text-[11px] font-bold flex items-center justify-center font-mono">
                  1
                </span>
                <h3 className="font-serif font-bold text-sm text-[#171717]">
                  Select Studio Promotion Blueprint
                </h3>
              </div>
              <span className="text-[10px] font-mono text-[#A98B57] uppercase font-bold tracking-wider">
                Sutra Catalog
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {CAMPAIGN_PRESETS.map((c) => {
                const Icon = c.icon;
                const isSelected = selectedCampaign === c.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setSelectedCampaign(c.id)}
                    className={`p-3.5 rounded-xl text-left border transition-all cursor-pointer flex flex-col justify-between space-y-2.5 ${
                      isSelected
                        ? "bg-[#171717] text-white border-[#171717] shadow-sm ring-1 ring-[#A98B57]"
                        : "bg-[#FAF9F5] border-[#E5E1D8] hover:border-[#A98B57] hover:bg-white text-[#171717]"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 w-full">
                      <div className="flex items-center gap-2 min-w-0">
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                            isSelected ? "bg-white/10 text-[#D4AF37]" : "bg-[#F0ECE1] text-[#8C827A]"
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                        </div>
                        <span className="font-bold text-xs truncate">{c.title}</span>
                      </div>
                      <span
                        className={`text-[9px] font-mono px-2 py-0.5 rounded-full shrink-0 font-semibold ${
                          isSelected
                            ? "bg-amber-400/20 text-amber-300 border border-amber-400/30"
                            : "bg-white text-[#A98B57] border border-[#E5E1D8]"
                        }`}
                      >
                        {c.badge}
                      </span>
                    </div>

                    <p className={`text-[11px] leading-relaxed line-clamp-2 min-h-[32px] ${
                      isSelected ? "text-white/80" : "text-[#64748B]"
                    }`}>
                      {c.desc}
                    </p>

                    <div className={`flex items-center justify-between text-[11px] w-full pt-2 border-t ${
                      isSelected ? "border-white/10" : "border-[#E5E1D8]"
                    }`}>
                      <span className={`font-serif font-bold ${
                        isSelected ? "text-amber-300" : "text-[#5C3A1E]"
                      }`}>
                        {c.price}
                      </span>
                      <span className={`text-[10px] font-mono flex items-center gap-1 font-semibold ${
                        isSelected ? "text-[#D4AF37]" : "text-[#8C827A]"
                      }`}>
                        {isSelected ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#D4AF37]" />
                            <span>Active</span>
                          </>
                        ) : (
                          <span>Select →</span>
                        )}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* STEP 2: FORMAT & LANGUAGE SELECTORS */}
          <div className="p-5 sm:p-6 rounded-2xl bg-[#FFFDF9] border border-[#E5E1D8] shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-[#171717] text-[#FAF9F5] text-[11px] font-bold flex items-center justify-center font-mono">
                  2
                </span>
                <h3 className="font-serif font-bold text-sm text-[#171717]">
                  Meta Format &amp; Language Targeting
                </h3>
              </div>
            </div>

            {/* Format Buttons */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider block">
                Target Meta Placement:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: "instagram_reel", label: "Instagram Reel", icon: VideoIcon, tag: "9:16 Video" },
                  { id: "facebook_post", label: "Facebook Reel", icon: FacebookIcon, tag: "9:16 Viral" },
                  { id: "meta_carousel", label: "Meta Carousel", icon: Layers, tag: "1:1 / 4:5" },
                  { id: "meta_ad", label: "Meta Ad Copy", icon: Tag, tag: "Paid Conversion" },
                ].map((f) => {
                  const Icon = f.icon;
                  const isSelected = platform === f.id;
                  return (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setPlatform(f.id as any)}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? "bg-[#171717] text-white border-[#171717] shadow-sm ring-1 ring-[#A98B57]"
                          : "bg-[#FAF9F5] border-[#E5E1D8] text-[#171717] hover:border-[#A98B57] hover:bg-white"
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <Icon className={`w-3.5 h-3.5 ${isSelected ? "text-[#D4AF37]" : "text-[#A98B57]"}`} />
                        <span className={`text-xs font-bold truncate ${isSelected ? "text-white" : "text-[#171717]"}`}>
                          {f.label}
                        </span>
                      </div>
                      <span
                        className={`text-[9px] font-mono block mt-1 font-medium ${
                          isSelected ? "text-amber-200/90" : "text-[#78716C]"
                        }`}
                      >
                        {f.tag}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Language Switcher */}
            <div className="space-y-1.5 pt-3 border-t border-[#E5E1D8]">
              <label className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider block">
                Content Language / Dialect:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: "english", label: "English", sub: "Global Luxury" },
                  { id: "gujarati", label: "ગુજરાતી", sub: "Gujarat / Ahmedabad" },
                  { id: "hindi", label: "हिन्दी", sub: "Pan-India D2C" },
                  { id: "hinglish", label: "Hinglish", sub: "Urban Viral" },
                ].map((l) => {
                  const isSelected = language === l.id;
                  return (
                    <button
                      key={l.id}
                      type="button"
                      onClick={() => setLanguage(l.id as any)}
                      className={`py-2 px-3 rounded-xl border text-center transition-all cursor-pointer ${
                        isSelected
                          ? "bg-[#171717] text-white border-[#171717] font-bold shadow-2xs ring-1 ring-[#A98B57]"
                          : "bg-[#FAF9F5] border-[#E5E1D8] text-[#171717] hover:border-[#A98B57] hover:bg-white"
                      }`}
                    >
                      <span className={`text-xs block font-bold ${isSelected ? "text-white" : "text-[#171717]"}`}>
                        {l.label}
                      </span>
                      <span
                        className={`text-[9px] font-mono block mt-0.5 ${
                          isSelected ? "text-amber-200/80" : "text-[#78716C]"
                        }`}
                      >
                        {l.sub}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* STEP 3: ATTACH MEDIA ASSET */}
          <div className="p-5 sm:p-6 rounded-2xl bg-[#FFFDF9] border border-[#E5E1D8] shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-[#171717] text-[#FAF9F5] text-[11px] font-bold flex items-center justify-center font-mono">
                  3
                </span>
                <h3 className="font-serif font-bold text-sm text-[#171717]">
                  Attach Promotional Media
                </h3>
              </div>
              <span className="text-[10px] font-mono text-[#64748B]">
                {activeMedia.type === "video" ? "🎬 4K MP4 Reel" : "🖼️ 4K CGI Visual"}
              </span>
            </div>

            {/* Media Preset Thumbnails Carousel */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider block">
                Choose from Studio Vault Presets:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {PRESET_MEDIA.map((m) => {
                  const isSelected = selectedMedia.id === m.id && !customMediaUrl.trim();
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => {
                        setSelectedMedia(m);
                        setCustomMediaUrl("");
                      }}
                      className={`group relative rounded-xl overflow-hidden border text-left p-1.5 transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? "ring-2 ring-[#A98B57] border-[#A98B57] bg-[#FAF9F5] shadow-xs"
                          : "border-[#E5E1D8] bg-[#FFFDF9] hover:border-[#A98B57] hover:shadow-2xs"
                      }`}
                    >
                      <div className="relative h-20 w-full rounded-lg overflow-hidden bg-neutral-900 mb-1.5">
                        {/* Poster Image Always Shown */}
                        <img
                          src={m.thumbnailUrl}
                          alt={m.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          onError={(e) => {
                            (e.target as HTMLElement).style.opacity = "0.6";
                          }}
                        />

                        {/* Video Overlay with Play Icon & Badge */}
                        {m.type === "video" && (
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center transition-colors group-hover:bg-black/30">
                            <div className="w-6 h-6 rounded-full bg-black/70 backdrop-blur-xs text-white flex items-center justify-center border border-white/20 shadow-xs">
                              <Play className="w-3 h-3 fill-white ml-0.5 text-white" />
                            </div>
                            <span className="absolute top-1 right-1 px-1.5 py-0.5 rounded bg-black/80 text-[8px] text-[#D4AF37] font-mono font-bold flex items-center gap-0.5 border border-white/10">
                              <VideoIcon className="w-2 h-2" /> MP4
                            </span>
                          </div>
                        )}

                        {/* Image 4K Badge */}
                        {m.type === "image" && (
                          <span className="absolute top-1 right-1 px-1.5 py-0.5 rounded bg-black/75 text-[8px] text-white font-mono font-semibold flex items-center gap-0.5 border border-white/10">
                            <ImageIcon className="w-2 h-2 text-[#A98B57]" /> 4K
                          </span>
                        )}

                        {/* Selected Checkmark Badge */}
                        {isSelected && (
                          <div className="absolute top-1 left-1 w-4 h-4 rounded-full bg-[#A98B57] text-white flex items-center justify-center shadow-xs">
                            <Check className="w-2.5 h-2.5 stroke-[3]" />
                          </div>
                        )}
                      </div>

                      <div className="space-y-0.5">
                        <span className="text-[10px] font-bold text-[#171717] line-clamp-1 block" title={m.title}>
                          {m.title}
                        </span>
                        <span className="text-[9px] font-mono text-[#A98B57] font-semibold block">{m.tag}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom URL or External Media Input */}
            <div className="pt-2 border-t border-[#E5E1D8] space-y-1">
              <label className="text-[11px] font-bold text-[#171717]">
                Or Custom Media URL (Video MP4 or 4K Image):
              </label>
              <input
                type="text"
                placeholder="https://... or /videos/... or /images/..."
                value={customMediaUrl}
                onChange={(e) => setCustomMediaUrl(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white border border-[#E5E1D8] text-xs text-[#171717] focus:outline-none focus:border-[#A98B57]"
              />
            </div>
          </div>

          {/* STEP 4: OPTIONAL CUSTOM PROMPT & GENERATION TRIGGER */}
          <div className="p-5 sm:p-6 rounded-2xl bg-[#FFFDF9] border border-[#E5E1D8] shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-[#171717] text-[#FAF9F5] text-[11px] font-bold flex items-center justify-center font-mono">
                  4
                </span>
                <h3 className="font-serif font-bold text-sm text-[#171717]">
                  Custom Campaign Angle / Promo Offer (Optional)
                </h3>
              </div>
            </div>

            <textarea
              rows={2}
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder="e.g. Highlight our 48h turnaround for local real estate developers in Ahmedabad, or emphasize 30 reels/month for luxury jewelry brands."
              className="w-full px-3 py-2.5 rounded-xl bg-white border border-[#E5E1D8] text-xs text-[#171717] focus:outline-none focus:border-[#A98B57]"
            />

            {/* Main AI Generation Button */}
            <button
              type="button"
              disabled={isGenerating}
              onClick={handleGenerate}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#171717] via-[#2E241E] to-[#171717] text-white font-serif font-bold text-sm sm:text-base flex items-center justify-center gap-2.5 shadow-md hover:shadow-lg hover:border-[#A98B57]/50 border border-transparent transition-all cursor-pointer disabled:opacity-60 active:scale-[0.99]"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-[#A98B57]" />
                  <span>Synthesizing Meta AI Campaign (Gemini Cascade)...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-[#A98B57]" />
                  <span>Synthesize Meta Promotion with AI</span>
                </>
              )}
            </button>

            {/* Mobile / Tablet Quick View Preview Button */}
            <div className="lg:hidden pt-1">
              <button
                type="button"
                onClick={() => {
                  setActiveMobileTab("preview");
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="w-full py-2.5 rounded-xl bg-[#FAF9F5] border border-[#A98B57] text-[#5C3A1E] font-serif font-bold text-xs flex items-center justify-center gap-2 hover:bg-[#F0ECE1] transition-all cursor-pointer"
              >
                <Smartphone className="w-4 h-4 text-[#A98B57]" />
                <span>View Live Reel Preview on Phone ({platform === "meta_carousel" ? "Carousel" : "9:16 Reel"}) →</span>
              </button>
            </div>
          </div>
        </div>

        {/* ============================================================ */}
        {/* RIGHT COLUMN: LIVE INTERACTIVE SMARTPHONE PREVIEW (5 Cols)   */}
        {/* ============================================================ */}
        <div className={`lg:col-span-5 space-y-4 lg:sticky lg:top-20 self-start ${activeMobileTab === "config" ? "hidden lg:block" : "block"}`}>
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-[#A98B57]" />
              <span className="font-serif font-bold text-xs text-[#171717]">
                Live Meta Mobile Mockup
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-mono text-[#8C827A]">
                {platform === "meta_carousel" ? "Feed Carousel" : "9:16 Vertical Reel"}
              </span>
            </div>
          </div>

          {/* REALISTIC SMARTPHONE CHASSIS */}
          <div className="mx-auto w-full max-w-[340px] rounded-[44px] bg-[#111111] p-3 shadow-2xl border-4 border-[#262626] relative">
            {/* Phone Speaker Notch */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 w-28 h-4 bg-black rounded-full z-30 flex items-center justify-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-[#1c1c1e]" />
              <div className="w-8 h-1 rounded-full bg-[#2c2c2e]" />
            </div>

            {/* Screen Inner Display */}
            <div className="relative w-full aspect-[9/16] rounded-[34px] overflow-hidden bg-black flex flex-col justify-between text-white select-none">
              {/* Media Layer (Video or Image) */}
              <div className="absolute inset-0 z-0">
                {activeMedia.type === "video" ? (
                  <video
                    ref={videoRef}
                    src={activeMedia.url}
                    poster={selectedMedia.thumbnailUrl}
                    loop
                    autoPlay
                    muted={isMuted}
                    playsInline
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <img
                    src={activeMedia.url}
                    alt="Promotion preview"
                    className="w-full h-full object-cover"
                  />
                )}
                {/* Vignette Shadow for text readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none" />
              </div>

              {/* Top Bar inside Screen */}
              <div className="relative z-10 pt-7 px-4 flex items-center justify-between text-[11px] font-bold">
                <span className="font-mono text-[10px] opacity-80">9:41</span>
                <span className="font-bold tracking-wide text-xs">
                  {platform === "meta_carousel" ? "Sutra Studio" : "Reels"}
                </span>
                <button
                  type="button"
                  onClick={() => setIsMuted(!isMuted)}
                  className="p-1.5 rounded-full bg-black/40 backdrop-blur-xs text-white/90 hover:bg-black/60 transition-colors"
                  title={isMuted ? "Unmute" : "Mute"}
                >
                  {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-[#A98B57]" />}
                </button>
              </div>

              {/* Right Floating Actions (Like, Comment, Share, Audio) */}
              <div className="relative z-10 self-end mr-3 mb-16 flex flex-col items-center gap-4 text-center">
                {/* Like Button */}
                <button
                  type="button"
                  onClick={() => {
                    setIsLiked(!isLiked);
                    setLikesCount((prev) => (isLiked ? prev - 1 : prev + 1));
                  }}
                  className="flex flex-col items-center gap-1 group cursor-pointer"
                >
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center backdrop-blur-xs transition-transform active:scale-125 ${
                      isLiked ? "bg-red-500/80 text-white" : "bg-black/40 text-white group-hover:bg-black/60"
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${isLiked ? "fill-white" : ""}`} />
                  </div>
                  <span className="text-[10px] font-mono font-bold drop-shadow">
                    {likesCount.toLocaleString()}
                  </span>
                </button>

                {/* Comment Button */}
                <div className="flex flex-col items-center gap-1">
                  <div className="w-9 h-9 rounded-full bg-black/40 backdrop-blur-xs flex items-center justify-center text-white">
                    <MessageCircle className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-mono font-bold drop-shadow">42</span>
                </div>

                {/* Share Button */}
                <div className="flex flex-col items-center gap-1">
                  <div className="w-9 h-9 rounded-full bg-black/40 backdrop-blur-xs flex items-center justify-center text-white">
                    <Send className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-mono font-bold drop-shadow">Share</span>
                </div>

                {/* Save Bookmark */}
                <button
                  type="button"
                  onClick={() => setIsSaved(!isSaved)}
                  className="flex flex-col items-center gap-1 cursor-pointer"
                >
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center backdrop-blur-xs ${
                      isSaved ? "bg-[#A98B57] text-white" : "bg-black/40 text-white"
                    }`}
                  >
                    <Bookmark className={`w-4 h-4 ${isSaved ? "fill-white" : ""}`} />
                  </div>
                </button>

                {/* Spinning Audio Disc */}
                <div className="w-8 h-8 rounded-full border border-white/40 bg-neutral-900 flex items-center justify-center animate-spin">
                  <span className="text-[9px]">🎵</span>
                </div>
              </div>

              {/* Bottom Profile Info & Caption Overlay */}
              <div className="relative z-10 p-4 space-y-2 pb-6">
                {/* Account Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-white p-0.5 border border-[#A98B57] overflow-hidden shrink-0 shadow-xs">
                      <Image
                        src="/brand/sutra-logo-primary.png"
                        alt="Sutra Studio"
                        width={28}
                        height={28}
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div>
                      <div className="flex items-center gap-1">
                        <span className="font-bold text-xs tracking-tight">yashsutrastudio</span>
                        <CheckCircle2 className="w-3 h-3 text-[#A98B57] fill-[#A98B57]" />
                      </div>
                      <span className="text-[9px] text-white/70 block font-mono">Original Audio</span>
                    </div>
                  </div>

                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#A98B57] text-white shadow-xs">
                    Follow
                  </span>
                </div>

                {/* Caption / Hook Preview */}
                <div className="text-xs leading-snug drop-shadow-sm space-y-1">
                  <p className="font-semibold text-[11px] text-amber-200">
                    {currentPromotion?.hook || "Experience 4K Cinematic Reels & 3D Spatial Renders with Sutra Studio."}
                  </p>
                  <p className={`text-[10px] text-white/90 ${captionExpanded ? "" : "line-clamp-2"}`}>
                    {currentPromotion?.caption ||
                      "Elevate your brand with high-precision computational visual engineering. Guaranteed 48-hour delivery. Reserve your monthly retainer slot."}
                  </p>
                  <button
                    type="button"
                    onClick={() => setCaptionExpanded(!captionExpanded)}
                    className="text-[9px] font-bold text-white/60 hover:text-white cursor-pointer"
                  >
                    {captionExpanded ? "less" : "...more"}
                  </button>
                </div>

                {/* CTA Action Pill */}
                <a
                  href={currentPromotion?.whatsappUrl || "https://wa.me/918200192781"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2 rounded-xl bg-gradient-to-r from-[#A98B57] to-[#D4AF37] text-black font-bold text-xs text-center flex items-center justify-center gap-1.5 shadow-md active:scale-98 transition-transform cursor-pointer"
                >
                  <span>Book Creative Pipeline via WhatsApp</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>

          {/* Mobile / Tablet Back to Controls Button */}
          <div className="lg:hidden pt-2">
            <button
              type="button"
              onClick={() => {
                setActiveMobileTab("config");
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="w-full py-2.5 rounded-xl bg-[#FAF9F5] border border-[#E5E1D8] text-[#171717] font-serif font-bold text-xs flex items-center justify-center gap-2 hover:bg-[#F0ECE1] transition-all cursor-pointer"
            >
              <Sliders className="w-4 h-4 text-[#A98B57]" />
              <span>← Back to Studio Controls (Steps 1–4)</span>
            </button>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* SYNTHESIZED PROMOTION DETAILS, SCRIPT, & COPY EXPORT SUITE   */}
      {/* ============================================================ */}
      {currentPromotion && (
        <div className="p-6 rounded-2xl bg-[#FFFDF9] border border-[#E5E1D8] shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#E5E1D8]">
            <div>
              <span className="text-[10px] font-mono uppercase font-bold text-[#A98B57] tracking-wider block">
                Active Synthesized Campaign
              </span>
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#171717]">
                {currentPromotion.title}
              </h2>
            </div>

            {/* Action Bar */}
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => setIsMetaAdModalOpen(!isMetaAdModalOpen)}
                className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-semibold flex items-center gap-1.5 hover:from-blue-700 hover:to-indigo-700 shadow-xs transition-all cursor-pointer"
              >
                <Rocket className="w-3.5 h-3.5 text-blue-200" />
                <span>🚀 Launch as Meta Ad</span>
              </button>

              <button
                type="button"
                onClick={handleSaveToVault}
                className="px-3.5 py-2 rounded-xl bg-[#FAF9F5] border border-[#E5E1D8] text-xs font-semibold text-[#5C3A1E] flex items-center gap-1.5 hover:bg-[#F0ECE1] transition-all cursor-pointer"
              >
                <Bookmark className="w-3.5 h-3.5 text-[#A98B57]" />
                <span>Save to Studio Library</span>
              </button>

              <a
                href={currentPromotion.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-2 rounded-xl bg-emerald-600 text-white text-xs font-semibold flex items-center gap-1.5 hover:bg-emerald-700 transition-all"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Dispatch to WhatsApp</span>
              </a>

              <a
                href="https://business.facebook.com/creatorstudio"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3.5 py-2 rounded-xl bg-[#171717] text-white text-xs font-semibold flex items-center gap-1.5 hover:bg-[#262626] transition-all"
              >
                <ExternalLink className="w-3.5 h-3.5 text-[#A98B57]" />
                <span>Open Meta Studio</span>
              </a>
            </div>
          </div>

          {/* Simple Meta Ads Campaign Launcher Panel */}
          {isMetaAdModalOpen && (
            <div className="p-5 rounded-2xl bg-gradient-to-br from-blue-50/70 via-indigo-50/50 to-white border border-blue-200/80 shadow-xs space-y-4 animate-fade-in">
              <div className="flex items-center justify-between pb-3 border-b border-blue-200/60">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                    Ad
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-sm text-[#171717]">
                      Deploy Self-Promotion to Meta Ads Manager
                    </h3>
                    <p className="text-[11px] text-[#64748B]">
                      Initializes an official campaign in Ads Manager under PAUSED status for safety review.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsMetaAdModalOpen(false)}
                  className="text-xs text-[#64748B] hover:text-[#171717] cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {metaAdSuccessNotice && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-semibold flex items-center justify-between">
                  <span>{metaAdSuccessNotice}</span>
                  <a
                    href="https://adsmanager.facebook.com/adsmanager"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline text-emerald-900 ml-2"
                  >
                    Open Ads Manager →
                  </a>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                {/* 1. Daily Budget */}
                <div className="p-3 rounded-xl bg-white border border-[#E5E1D8] space-y-1.5">
                  <label className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider block">
                    Daily Budget (INR):
                  </label>
                  <div className="grid grid-cols-3 gap-1">
                    {[500, 1000, 2000].map((b) => (
                      <button
                        key={b}
                        type="button"
                        onClick={() => setMetaAdBudget(b)}
                        className={`py-1.5 rounded-lg border text-center font-bold text-xs transition-all cursor-pointer ${
                          metaAdBudget === b
                            ? "bg-[#171717] text-white border-[#171717]"
                            : "bg-[#FAF9F5] border-[#E5E1D8] text-[#171717] hover:border-[#A98B57]"
                        }`}
                      >
                        ₹{b}
                      </button>
                    ))}
                  </div>
                  <span className="text-[10px] text-[#8C827A] block">Controlled spend cap</span>
                </div>

                {/* 2. Target Audience */}
                <div className="p-3 rounded-xl bg-white border border-[#E5E1D8] space-y-1.5">
                  <label className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider block">
                    Target Niche:
                  </label>
                  <select
                    value={metaAdAudience}
                    onChange={(e) => setMetaAdAudience(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-[#FAF9F5] border border-[#E5E1D8] text-xs font-semibold text-[#171717] focus:outline-none focus:border-blue-500"
                  >
                    <option value="Founders, Luxury Brands & D2C">Founders, Luxury Brands &amp; D2C</option>
                    <option value="Architects & Luxury Real Estate">Architects &amp; Luxury Real Estate</option>
                    <option value="Jewelry, Horology & Haute Couture">Jewelry, Horology &amp; Haute Couture</option>
                    <option value="Pan-India E-Commerce & Retail">Pan-India E-Commerce &amp; Retail</option>
                  </select>
                  <span className="text-[10px] text-[#8C827A] block">High-ticket demographic</span>
                </div>

                {/* 3. Placements & Safety */}
                <div className="p-3 rounded-xl bg-white border border-[#E5E1D8] space-y-1.5">
                  <label className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider block">
                    Guard &amp; Placements:
                  </label>
                  <div className="text-[11px] font-medium text-[#171717] space-y-0.5">
                    <div className="flex items-center gap-1 text-emerald-700">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Initial Status: PAUSED</span>
                    </div>
                    <p className="text-[10px] text-[#8C827A]">
                      Instagram Reels, Stories, Facebook Feed
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-blue-200/60">
                <span className="text-[11px] text-[#64748B]">
                  Campaign Name: <code className="font-mono text-blue-900 bg-blue-100/60 px-1.5 py-0.5 rounded">[Sutra] {currentPromotion.title.slice(0, 35)}</code>
                </span>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    type="button"
                    disabled={isLaunchingMetaAd}
                    onClick={handleLaunchStudioMetaAd}
                    className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs hover:shadow-md transition-all cursor-pointer disabled:opacity-60"
                  >
                    {isLaunchingMetaAd ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Registering in Meta Ads Manager...</span>
                      </>
                    ) : (
                      <>
                        <Rocket className="w-3.5 h-3.5" />
                        <span>Confirm &amp; Register Campaign (PAUSED)</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* LEFT: SCRIPT / STORYBOARD BREAKDOWN */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-serif font-bold text-sm text-[#171717] flex items-center gap-2">
                  <VideoIcon className="w-4 h-4 text-[#A98B57]" />
                  <span>Reel Visual Storyboard &amp; Script</span>
                </h4>
                {currentPromotion.reelScript && (
                  <button
                    type="button"
                    onClick={() =>
                      copyToClipboard(
                        JSON.stringify(currentPromotion.reelScript, null, 2),
                        "script"
                      )
                    }
                    className="text-xs font-semibold text-[#A98B57] hover:text-[#5C3A1E] flex items-center gap-1 cursor-pointer"
                  >
                    {copiedKey === "script" ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === "script" ? "Copied" : "Copy Script"}</span>
                  </button>
                )}
              </div>

              {currentPromotion.reelScript ? (
                <div className="space-y-3">
                  <div className="p-3 rounded-xl bg-[#FAF9F5] border border-[#E5E1D8] text-xs space-y-1">
                    <span className="text-[10px] font-bold text-[#A98B57] uppercase tracking-wider block">
                      3-Second Viral Hook:
                    </span>
                    <p className="font-semibold text-[#171717]">{currentPromotion.reelScript.openingHook}</p>
                  </div>

                  <div className="space-y-2">
                    {currentPromotion.reelScript.scenes.map((s, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-white border border-[#E5E1D8] text-xs space-y-1 shadow-2xs"
                      >
                        <div className="flex items-center justify-between text-[10px] font-mono text-[#8C827A]">
                          <span>Scene {idx + 1}</span>
                          <span className="font-bold text-[#A98B57]">{s.timestamp}</span>
                        </div>
                        <p className="font-medium text-[#171717]">
                          <strong className="text-[#5C3A1E]">Visual:</strong> {s.visualCue}
                        </p>
                        <p className="text-[#64748B]">
                          <strong className="text-[#171717]">Audio/Voiceover:</strong> {s.voiceoverOrText}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="p-3 rounded-xl bg-[#FAF9F5] border border-[#E5E1D8] text-xs space-y-1">
                    <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider block">
                      Audio Vibe Recommendation:
                    </span>
                    <p className="text-[#171717] font-medium">{currentPromotion.reelScript.audioRecommendation}</p>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-[#FAF9F5] border border-[#E5E1D8] text-xs text-[#64748B]">
                  No reel script generated for this format.
                </div>
              )}
            </div>

            {/* RIGHT: FORMATTED CAPTION & HASHTAG CLUSTER */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-serif font-bold text-sm text-[#171717] flex items-center gap-2">
                  <MessageCircle className="w-4 h-4 text-[#A98B57]" />
                  <span>High-Converting Formatted Caption</span>
                </h4>
                <button
                  type="button"
                  onClick={() =>
                    copyToClipboard(
                      `${currentPromotion.caption}\n\n${currentPromotion.hashtags.join(" ")}`,
                      "caption"
                    )
                  }
                  className="text-xs font-semibold text-[#A98B57] hover:text-[#5C3A1E] flex items-center gap-1 cursor-pointer"
                >
                  {copiedKey === "caption" ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === "caption" ? "Copied" : "Copy Caption"}</span>
                </button>
              </div>

              <div className="p-4 rounded-xl bg-white border border-[#E5E1D8] text-xs text-[#171717] whitespace-pre-wrap leading-relaxed max-h-72 overflow-y-auto shadow-2xs font-sans">
                {currentPromotion.caption}
              </div>

              {/* Hashtag Cloud */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider">
                    Hashtags ({currentPromotion.hashtags.length})
                  </span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(currentPromotion.hashtags.join(" "), "hashtags")}
                    className="text-[11px] font-semibold text-[#A98B57] hover:text-[#5C3A1E] flex items-center gap-1 cursor-pointer"
                  >
                    {copiedKey === "hashtags" ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedKey === "hashtags" ? "Copied" : "Copy Tags"}</span>
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto">
                  {currentPromotion.hashtags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded-md bg-[#FAF9F5] border border-[#E5E1D8] text-[10px] font-mono text-[#5C3A1E]"
                    >
                      {tag.startsWith("#") ? tag : `#${tag}`}
                    </span>
                  ))}
                </div>
              </div>

              {/* Meta Ad Copy Pill (if available) */}
              {currentPromotion.metaAdCopy && (
                <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200/80 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-[#A98B57] uppercase tracking-wider">
                      Meta Ads Manager Parameters:
                    </span>
                    <span className="text-[10px] font-mono text-[#5C3A1E]">Headline: {currentPromotion.metaAdCopy.headline}</span>
                  </div>
                  <p className="text-[11px] text-[#64748B]">
                    <strong>Target Interests:</strong> {currentPromotion.metaAdCopy.targetAudienceInterests.join(", ")}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* SAVED PROMOTIONS DRAWER / ROSTER                             */}
      {/* ============================================================ */}
      {isSavedDrawerOpen && (
        <div className="p-5 rounded-2xl bg-[#FFFDF9] border border-[#E5E1D8] shadow-warm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FolderOpen className="w-4 h-4 text-[#A98B57]" />
              <h3 className="font-serif font-bold text-base text-[#171717]">
                Saved Studio Promotion Library ({savedPromotions.length})
              </h3>
            </div>
            <button
              type="button"
              onClick={() => setIsSavedDrawerOpen(false)}
              className="text-xs text-[#64748B] hover:text-[#171717] cursor-pointer"
            >
              Close ✕
            </button>
          </div>

          {savedPromotions.length === 0 ? (
            <div className="p-8 text-center text-xs text-[#64748B] bg-[#FAF9F5] rounded-xl border border-[#E5E1D8]">
              No promotions saved yet. Click &quot;Save to Studio Library&quot; on any generated campaign above.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {savedPromotions.map((p) => (
                <div
                  key={p.id}
                  className="p-3.5 rounded-xl bg-white border border-[#E5E1D8] space-y-2 flex flex-col justify-between hover:border-[#A98B57] transition-all shadow-2xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[10px] font-mono text-[#8C827A]">
                      <span className="px-1.5 py-0.5 rounded bg-[#FAF9F5] border border-[#E5E1D8] text-[#5C3A1E] font-bold">
                        {p.platform.replace("_", " ")}
                      </span>
                      <span>{new Date(p.createdAt).toLocaleDateString()}</span>
                    </div>
                    <h5 className="font-serif font-bold text-xs text-[#171717] line-clamp-1">{p.title}</h5>
                    <p className="text-[11px] text-[#64748B] line-clamp-2">{p.hook}</p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-[#E5E1D8]/60">
                    <button
                      type="button"
                      onClick={() => {
                        setCurrentPromotion(p);
                        setIsSavedDrawerOpen(false);
                      }}
                      className="text-xs font-bold text-[#A98B57] hover:underline cursor-pointer"
                    >
                      Load into Preview →
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteSaved(p.id)}
                      className="p-1 text-[#8C827A] hover:text-red-600 transition-colors cursor-pointer"
                      title="Delete saved promotion"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ============================================================ */}
      {/* ACTIVE SELF-PROMOTION META CAMPAIGNS ROSTER                  */}
      {/* ============================================================ */}
      <div className="p-5 sm:p-6 rounded-2xl bg-[#FFFDF9] border border-[#E5E1D8] shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-blue-600" />
            <h3 className="font-serif font-bold text-base text-[#171717]">
              Active Self-Promotion Meta Ad Campaigns
            </h3>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-blue-50 text-blue-800 border border-blue-200">
              {metaCampaigns.length} Campaigns
            </span>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="https://adsmanager.facebook.com/adsmanager"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-[#FAF9F5] border border-[#E5E1D8] text-[#171717] hover:border-blue-500 hover:text-blue-700 transition-all"
            >
              <ExternalLink className="w-3.5 h-3.5 text-blue-600" />
              <span>Open Meta Ads Manager</span>
            </a>
          </div>
        </div>

        {metaCampaigns.length === 0 ? (
          <div className="p-8 text-center text-xs text-[#64748B] bg-[#FAF9F5] rounded-xl border border-[#E5E1D8]">
            No Meta Ad campaigns registered yet. Generate a promotion above and click &quot;🚀 Launch as Meta Ad&quot; to deploy your first self-promotion campaign.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#E5E1D8] text-[#8C827A] text-[10px] font-mono uppercase tracking-wider">
                  <th className="py-2.5 px-3">Campaign / Order</th>
                  <th className="py-2.5 px-3">Headline</th>
                  <th className="py-2.5 px-3">Daily Budget</th>
                  <th className="py-2.5 px-3">Placements</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E1D8]/60">
                {metaCampaigns.map((c) => (
                  <tr key={c.campaignId} className="hover:bg-[#FAF9F5]/80 transition-colors">
                    <td className="py-3 px-3">
                      <span className="font-mono text-[11px] font-bold text-[#171717] block">
                        {c.orderId}
                      </span>
                      <span className="text-[10px] text-[#8C827A] font-mono">
                        {new Date(c.launchedAt).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span className="font-semibold text-[#171717] block line-clamp-1 max-w-[220px]">
                        {c.headline}
                      </span>
                      <span className="text-[10px] text-[#64748B] block truncate max-w-[220px]">
                        {c.brandName}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono font-bold text-[#5C3A1E]">
                      ₹{c.budgetAmount?.toLocaleString() || "500"}/day
                    </td>
                    <td className="py-3 px-3 text-[11px] text-[#64748B]">
                      {Array.isArray(c.targetPlacements)
                        ? c.targetPlacements.slice(0, 2).join(", ")
                        : "Reels & Feed"}
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          c.status === "active"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-amber-50 text-amber-700 border border-amber-200"
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${c.status === "active" ? "bg-emerald-500" : "bg-amber-500"}`} />
                        {c.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <a
                        href="https://adsmanager.facebook.com/adsmanager"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-800 hover:underline"
                      >
                        <span>Manage</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
