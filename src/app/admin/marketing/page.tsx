"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { RouteGuard } from "@/components/auth/RouteGuard";
import { LotusSymbol } from "@/components/brand/SutraLogo";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/Status";
import { ErrorState, LoadingState } from "@/components/ui/States";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import {
  Sparkles,
  Megaphone,
  Share2,
  TrendingUp,
  CheckCircle2,
  Send,
  RefreshCw,
  ExternalLink,
  Layers,
  ArrowLeft,
  DollarSign,
  Eye,
  Sliders,
  Play,
  Zap,
  ShieldCheck,
  Globe,
  Bot,
} from "lucide-react";

export default function AdminMarketingPage() {
  const [activeTab, setActiveTab] = useState<"self_promo" | "client_ads">("self_promo");
  const [loading, setLoading] = useState(true);
  const [isDispatchingPromo, setIsDispatchingPromo] = useState(false);
  const [isPublishingAsset, setIsPublishingAsset] = useState(false);
  const [isDeployingAd, setIsDeployingAd] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Self-Promo Data
  const [publications, setPublications] = useState<any[]>([]);
  const [promoTheme, setPromoTheme] = useState("Vedic Architectural Luxury & High-Speed AI Creative Pipelines");
  const [promoPrompt, setPromoPrompt] = useState(
    "Cinematic golden hour architectural pavilion with traditional teakwood jali screens, serene reflection pool, warm morning light, photorealistic 8K commercial rendering."
  );

  // 1-Click Auto-Publisher Form State
  const [publishTitle, setPublishTitle] = useState("Sutra Studio Master Creative Highlight");
  const [publishCaption, setPublishCaption] = useState(
    "Bridging centuries of classical Indian aesthetic doctrines with high-velocity generative AI workflows. Inquire for bespoke retainers. #SutraStudio #GenerativeAI #LuxuryDesign"
  );
  const [publishMediaUrl, setPublishMediaUrl] = useState(
    "https://image.pollinations.ai/prompt/cinematic%20architectural%20film%20still%2C%20modern%20sandstone%20courtyard%20villa%20at%20sunset%2C%20ambient%20water%20reflection%2C%20anamorphic%20lens%20flare%2C%208k?width=1200&height=800&nologo=true"
  );
  const [publishPlatform, setPublishPlatform] = useState<"all" | "facebook" | "instagram">("all");

  // Client Meta Ads Launcher State
  const [adAccountId, setAdAccountId] = useState("act_1092549996582729");
  const [metaAppId, setMetaAppId] = useState("27983900381284198");
  const [clientCampaigns, setClientCampaigns] = useState<any[]>([]);
  const [selectedClientTier, setSelectedClientTier] = useState<"Starter (₹3,499)" | "Growth (₹7,999)" | "Retainer (₹14,999)">("Starter (₹3,499)");
  const [clientBrandName, setClientBrandName] = useState("The Royal Haveli Hotel & Resort");
  const [clientHeadline, setClientHeadline] = useState("Experience Regal Heritage Sanctuaries");
  const [clientAdCaption, setClientAdCaption] = useState(
    "Book an unforgettable royal getaway with immersive heritage suites and bespoke royal dining. Reserve today."
  );
  const [clientCreativeUrl, setClientCreativeUrl] = useState(
    "https://image.pollinations.ai/prompt/architectural%20interior%20rendering%2C%20minimalist%20luxury%20living%20space%2C%20intricate%20golden%20jali%20screens%2C%20calacatta%20gold%20marble%20floors%2C%20recessed%203000k%20warm%20led%2C%20hasselblad%20photography%2C%208k?width=1200&height=800&nologo=true"
  );

  const loadMarketingData = useCallback(async () => {
    setLoading(true);
    try {
      const [pubRes, adsRes] = await Promise.all([
        fetch("/api/admin/marketing/publish"),
        fetch("/api/admin/marketing/meta-ads"),
      ]);

      if (pubRes.ok) {
        const pubData = await pubRes.json();
        setPublications(pubData.publications || []);
      }

      if (adsRes.ok) {
        const adsData = await adsRes.json();
        setClientCampaigns(adsData.campaigns || []);
        if (adsData.adAccountId) setAdAccountId(adsData.adAccountId);
        if (adsData.metaAppId) setMetaAppId(adsData.metaAppId);
      }
    } catch (err: any) {
      console.error("Failed to load marketing data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadMarketingData();
  }, [loadMarketingData]);

  // Handle Tab A: Trigger Daily Agency Campaign (n8n Webhook)
  const handleTriggerAgencyPromo = async () => {
    setIsDispatchingPromo(true);
    setStatusMessage(null);
    try {
      const res = await fetch("/api/admin/marketing/dispatch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "agency_self_promo",
          brandName: "Sutra Studio",
          targetPage: "yashsutrastudio",
          targetIg: "yashsutrastudio",
          theme: promoTheme,
          prompt: promoPrompt,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setStatusMessage(data.message || "✓ Daily Agency Campaign triggered successfully on n8n master orchestrator.");
        await loadMarketingData();
      } else {
        setStatusMessage(`Error: ${data.error || "Failed to trigger agency campaign."}`);
      }
    } catch (err: any) {
      setStatusMessage(`Error: ${err.message}`);
    } finally {
      setIsDispatchingPromo(false);
    }
  };

  // Handle Tab A: 1-Click Auto-Publisher to FB & IG
  const handleAutoPublish = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPublishingAsset(true);
    setStatusMessage(null);
    try {
      const res = await fetch("/api/admin/marketing/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: publishTitle,
          caption: publishCaption,
          mediaUrl: publishMediaUrl,
          mediaType: "image",
          platform: publishPlatform,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setStatusMessage(data.message || "✓ Creative published to Facebook Page and Instagram.");
        await loadMarketingData();
      } else {
        setStatusMessage(`Error: ${data.error || "Failed to publish asset."}`);
      }
    } catch (err: any) {
      setStatusMessage(`Error: ${err.message}`);
    } finally {
      setIsPublishingAsset(false);
    }
  };

  // Handle Tab B: Client Meta Ads Launcher (Meta Ad Account act_1092549996582729)
  const handleDeployClientAd = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsDeployingAd(true);
    setStatusMessage(null);

    const budget =
      selectedClientTier === "Starter (₹3,499)"
        ? 3499
        : selectedClientTier === "Growth (₹7,999)"
        ? 7999
        : 14999;

    try {
      const res = await fetch("/api/admin/marketing/meta-ads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          brandName: clientBrandName,
          tier: selectedClientTier,
          budgetAmount: budget,
          headline: clientHeadline,
          caption: clientAdCaption,
          creativeUrl: clientCreativeUrl,
          adAccountId,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setStatusMessage(data.message || "✓ Client Meta Ads Campaign deployed to Ad Account.");
        await loadMarketingData();
      } else {
        setStatusMessage(`Error: ${data.error || "Failed to deploy ad campaign."}`);
      }
    } catch (err: any) {
      setStatusMessage(`Error: ${err.message}`);
    } finally {
      setIsDeployingAd(false);
    }
  };

  return (
    <RouteGuard requiredRole="admin">
      <div className="min-h-screen bg-[#F8F5EF] text-[#0F172A]">
        {/* Top Studio Admin Header */}
        <header className="sticky top-0 z-30 bg-[#FFFDF9]/95 backdrop-blur-md border-b border-[#EADFCB] px-4 sm:px-8 py-3 flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-3">
            <Link href="/admin" className="flex items-center gap-2 text-[#5C3A1E] hover:opacity-80 transition-opacity">
              <LotusSymbol className="w-6 h-6" color="gold" />
              <span className="font-serif font-bold text-sm tracking-wider">SUTRA STUDIO</span>
            </Link>
            <span className="text-xs text-[#94A3B8]">/</span>
            <div className="flex items-center gap-1.5 text-xs text-[#64748B]">
              <Link href="/admin" className="hover:text-[#5C3A1E] font-medium transition-colors">
                Admin Console
              </Link>
              <span className="text-[#94A3B8]">/</span>
              <span className="text-[#0F172A] font-semibold">Meta Ads &amp; Marketing Hub</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/admin"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FAF9F5] border border-[#EADFCB] hover:border-[#D4A35A] hover:bg-[#FFFFFF] text-xs font-semibold text-[#5C3A1E] transition-all shadow-2xs"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Admin</span>
            </Link>
            <NotificationBell />
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
          {/* Main Title & Overview Banner */}
          <div className="rounded-3xl bg-gradient-to-r from-[#FFFDF9] via-[#FAF6EE] to-[#FFFDF9] border border-[#EADFCB] p-6 sm:p-8 shadow-warm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FAF9F5] border border-[#EADFCB] text-xs font-semibold text-[#5C3A1E]">
                <Sparkles className="w-3.5 h-3.5 text-[#D4A35A]" />
                <span>Unified Studio Meta Ads &amp; Marketing Engine</span>
              </div>
              <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#0F172A]">
                Meta Ads Hub &amp; Creative Distribution
              </h1>
              <p className="text-sm text-[#64748B] max-w-2xl leading-relaxed">
                Seamlessly orchestrate daily studio brand campaigns to official social handles (@yashsutrastudio) and launch high-converting Meta Ads for active client subscriptions.
              </p>
            </div>

            {/* Live Configuration Badge Card */}
            <div className="rounded-2xl bg-[#FFFDF9] border border-[#EADFCB] p-4 text-xs space-y-2 shrink-0 min-w-[260px] shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-[#5C3A1E]">Target Facebook Page:</span>
                <span className="font-mono text-[#0F172A] font-bold">61594200943169</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-semibold text-[#5C3A1E]">Instagram Handle:</span>
                <span className="font-mono text-[#0F172A] font-bold">@yashsutrastudio</span>
              </div>
              <div className="flex items-center justify-between border-t border-[#EADFCB] pt-1.5">
                <span className="font-semibold text-[#5C3A1E]">Ad Account ID:</span>
                <span className="font-mono text-[#2E7D4F] font-bold">{adAccountId}</span>
              </div>
            </div>
          </div>

          {/* Status Message Notification Bar */}
          {statusMessage && (
            <div
              className={`p-4 rounded-2xl border text-xs font-semibold flex items-center justify-between shadow-2xs ${
                statusMessage.startsWith("Error")
                  ? "bg-red-50 border-red-200 text-red-800"
                  : "bg-emerald-50 border-emerald-200 text-emerald-800"
              }`}
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>{statusMessage}</span>
              </div>
              <button
                onClick={() => setStatusMessage(null)}
                className="text-xs hover:underline opacity-80 cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Master Tab Selector */}
          <div className="flex items-center gap-3 border-b border-[#EADFCB] pb-3">
            <button
              onClick={() => setActiveTab("self_promo")}
              className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeTab === "self_promo"
                  ? "bg-[#5C3A1E] text-white shadow-warm"
                  : "bg-[#FFFDF9] border border-[#EADFCB] text-[#64748B] hover:text-[#0F172A]"
              }`}
            >
              <Megaphone className="w-4 h-4" />
              <span>TAB A: Sutra Studio Self-Promotion Engine</span>
            </button>

            <button
              onClick={() => setActiveTab("client_ads")}
              className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeTab === "client_ads"
                  ? "bg-[#5C3A1E] text-white shadow-warm"
                  : "bg-[#FFFDF9] border border-[#EADFCB] text-[#64748B] hover:text-[#0F172A]"
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              <span>TAB B: Client Meta Ads Launcher</span>
            </button>
          </div>

          {/* ========================================================================= */}
          {/* TAB A: SUTRA STUDIO SELF-PROMOTION ENGINE */}
          {/* ========================================================================= */}
          {activeTab === "self_promo" && (
            <div className="space-y-8">
              {/* Section 1: Daily Automation Trigger Card */}
              <div className="rounded-3xl bg-[#FFFDF9] border border-[#EADFCB] p-6 sm:p-8 shadow-xs space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#EADFCB] pb-4">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#A98B57] flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-[#D4A35A]" />
                      Autonomous Master Workflow Dispatch
                    </span>
                    <h2 className="font-serif text-2xl font-bold text-[#0F172A] mt-1">
                      Trigger Daily Agency Campaign
                    </h2>
                    <p className="text-xs text-[#64748B] mt-1">
                      Dispatches local n8n workflow (<code className="bg-[#F8F5EF] px-1.5 py-0.5 rounded text-[#5C3A1E]">http://localhost:5678/webhook/sutra-master-dispatch</code>) to generate &amp; post 4K daily content for Sutra Studio.
                    </p>
                  </div>

                  <Button
                    variant="primary"
                    size="lg"
                    onClick={handleTriggerAgencyPromo}
                    isLoading={isDispatchingPromo}
                    leftIcon={<Play className="w-4 h-4" />}
                    className="shadow-warm shrink-0 min-w-[240px]"
                  >
                    {isDispatchingPromo ? "Triggering n8n Workflow..." : "Trigger Daily Agency Campaign"}
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-[#0F172A] block uppercase tracking-wider">
                      Campaign Focus &amp; Theme
                    </label>
                    <input
                      type="text"
                      value={promoTheme}
                      onChange={(e) => setPromoTheme(e.target.value)}
                      className="w-full rounded-xl border border-[#EADFCB] bg-[#F8F5EF] px-4 py-2.5 text-xs text-[#0F172A] font-medium focus:border-[#D4A35A] focus:outline-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-[#0F172A] block uppercase tracking-wider">
                      Diffusion Creative Prompt / Theme Direction
                    </label>
                    <input
                      type="text"
                      value={promoPrompt}
                      onChange={(e) => setPromoPrompt(e.target.value)}
                      className="w-full rounded-xl border border-[#EADFCB] bg-[#F8F5EF] px-4 py-2.5 text-xs text-[#0F172A] font-medium focus:border-[#D4A35A] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between text-xs text-[#64748B] bg-[#FAF9F5] p-3.5 rounded-2xl border border-[#EADFCB]">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#2E7D4F]" />
                    <span>Payload: <strong>&#123; mode: &apos;agency_self_promo&apos;, brandName: &apos;Sutra Studio&apos;, targetPage: &apos;yashsutrastudio&apos;, targetIg: &apos;yashsutrastudio&apos; &#125;</strong></span>
                  </div>
                  <span className="font-mono text-[11px] text-[#A98B57]">Target: Facebook Page (61594200943169) &amp; Instagram (@yashsutrastudio)</span>
                </div>
              </div>

              {/* Section 2: 1-Click Auto-Publisher */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                <form
                  onSubmit={handleAutoPublish}
                  className="lg:col-span-7 rounded-3xl bg-[#FFFDF9] border border-[#EADFCB] p-6 sm:p-8 shadow-xs space-y-5"
                >
                  <div className="flex items-center justify-between border-b border-[#EADFCB] pb-4">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#A98B57]">
                        Direct Meta Graph v21.0
                      </span>
                      <h3 className="font-serif text-2xl font-bold text-[#0F172A]">
                        1-Click Auto-Publisher
                      </h3>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-[#FAF9F5] text-xs font-semibold text-[#5C3A1E] border border-[#EADFCB]">
                      Post to FB &amp; IG
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#0F172A] block uppercase tracking-wider">
                      Title / Campaign Reference
                    </label>
                    <input
                      type="text"
                      value={publishTitle}
                      onChange={(e) => setPublishTitle(e.target.value)}
                      required
                      className="w-full rounded-xl border border-[#EADFCB] bg-[#FAF9F5] px-4 py-2.5 text-xs text-[#0F172A] focus:border-[#D4A35A] focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#0F172A] block uppercase tracking-wider">
                      Post Caption &amp; Hashtags
                    </label>
                    <textarea
                      rows={3}
                      value={publishCaption}
                      onChange={(e) => setPublishCaption(e.target.value)}
                      required
                      className="w-full rounded-xl border border-[#EADFCB] bg-[#FAF9F5] px-4 py-2.5 text-xs text-[#0F172A] focus:border-[#D4A35A] focus:outline-none resize-none leading-relaxed"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#0F172A] block uppercase tracking-wider">
                      4K Creative Image / Video Media URL
                    </label>
                    <input
                      type="url"
                      value={publishMediaUrl}
                      onChange={(e) => setPublishMediaUrl(e.target.value)}
                      required
                      className="w-full rounded-xl border border-[#EADFCB] bg-[#FAF9F5] px-4 py-2.5 text-xs text-[#0F172A] font-mono focus:border-[#D4A35A] focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-3 pt-1">
                    {[
                      { id: "all", label: "Facebook & Instagram" },
                      { id: "facebook", label: "Facebook Only" },
                      { id: "instagram", label: "Instagram Only" },
                    ].map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setPublishPlatform(p.id as any)}
                        className={`p-2.5 rounded-xl border text-xs font-semibold text-center transition-all cursor-pointer ${
                          publishPlatform === p.id
                            ? "bg-[#5C3A1E] text-white border-[#5C3A1E] shadow-xs"
                            : "bg-[#FAF9F5] border-[#EADFCB] text-[#64748B] hover:bg-[#FFFFFF]"
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>

                  <Button
                    variant="primary"
                    size="md"
                    type="submit"
                    isLoading={isPublishingAsset}
                    leftIcon={<Send className="w-4 h-4" />}
                    className="w-full shadow-warm"
                  >
                    {isPublishingAsset ? "Publishing to Meta Graph API..." : "Publish Live to Sutra Studio Channels"}
                  </Button>
                </form>

                {/* Live Preview Card */}
                <div className="lg:col-span-5 rounded-3xl bg-[#FFFDF9] border border-[#EADFCB] p-6 shadow-xs space-y-4">
                  <div className="flex items-center justify-between border-b border-[#EADFCB] pb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#A98B57]">
                      Live Social Post Preview
                    </span>
                    <span className="text-[11px] font-mono text-[#64748B]">Page ID: 61594200943169</span>
                  </div>

                  <div className="rounded-2xl border border-[#EADFCB] overflow-hidden bg-[#0F172A] relative aspect-square">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={publishMediaUrl}
                      alt="Creative Preview"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 left-3 bg-[#0F172A]/80 backdrop-blur-md px-3 py-1 rounded-full text-[10px] text-white font-semibold flex items-center gap-1.5">
                      <LotusSymbol className="w-3.5 h-3.5" color="gold" />
                      <span>Sutra Studio • @yashsutrastudio</span>
                    </div>
                  </div>

                  <div className="p-3 bg-[#FAF9F5] rounded-xl border border-[#EADFCB] space-y-1 text-xs">
                    <p className="font-semibold text-[#0F172A] line-clamp-1">{publishTitle}</p>
                    <p className="text-[#64748B] line-clamp-3 leading-relaxed">{publishCaption}</p>
                  </div>
                </div>
              </div>

              {/* Section 3: Publication History Table */}
              <div className="rounded-3xl bg-[#FFFDF9] border border-[#EADFCB] overflow-hidden shadow-xs">
                <div className="flex items-center justify-between p-6 border-b border-[#EADFCB] bg-[#FAF9F5]">
                  <div>
                    <h3 className="font-serif text-lg font-bold text-[#0F172A]">
                      Published Creative Stream
                    </h3>
                    <p className="text-xs text-[#64748B]">
                      History of studio reels and 4K assets broadcast to official Meta endpoints.
                    </p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => void loadMarketingData()} leftIcon={<RefreshCw className="w-3.5 h-3.5" />}>
                    Refresh
                  </Button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-[#0F172A]">
                    <thead className="bg-[#FAF9F5]/70 text-[#5C3A1E] font-semibold border-b border-[#EADFCB]">
                      <tr>
                        <th className="p-4">Title &amp; Reference</th>
                        <th className="p-4">Target Channel</th>
                        <th className="p-4">Status</th>
                        <th className="p-4">Reach / Impressions</th>
                        <th className="p-4">Published Timestamp</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F0ECE1]">
                      {publications.map((pub) => (
                        <tr key={pub.id} className="hover:bg-[#FAF9F5]/50 transition-colors">
                          <td className="p-4 font-semibold">
                            <div className="flex items-center gap-3">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={pub.mediaUrl}
                                alt={pub.title}
                                className="w-10 h-10 rounded-lg object-cover border border-[#EADFCB]"
                              />
                              <div>
                                <p className="text-xs text-[#0F172A] font-bold">{pub.title}</p>
                                <p className="text-[10px] text-[#64748B] line-clamp-1 max-w-xs">{pub.caption}</p>
                              </div>
                            </div>
                          </td>
                          <td className="p-4 font-mono text-[11px]">
                            <div className="flex flex-col gap-0.5">
                              <span>FB: {pub.targetPage || "yashsutrastudio"}</span>
                              <span className="text-[#A98B57]">IG: @{pub.targetIg || "yashsutrastudio"}</span>
                            </div>
                          </td>
                          <td className="p-4">
                            <StatusBadge tone="completed" label="Live Published" size="sm" />
                          </td>
                          <td className="p-4 font-semibold text-[#2E7D4F]">
                            {pub.reachEstimate || "Active"}
                          </td>
                          <td className="p-4 text-[#64748B]">
                            {new Date(pub.publishedAt).toLocaleString("en-IN", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </td>
                          <td className="p-4 text-right">
                            <a
                              href="https://www.facebook.com/yashsutrastudio/"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-[#A98B57] hover:underline font-semibold"
                            >
                              <span>View Live</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB B: CLIENT META ADS LAUNCHER */}
          {/* ========================================================================= */}
          {activeTab === "client_ads" && (
            <div className="space-y-8">
              {/* Launcher Form Card */}
              <form
                onSubmit={handleDeployClientAd}
                className="rounded-3xl bg-[#FFFDF9] border border-[#EADFCB] p-6 sm:p-8 shadow-xs space-y-6"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#EADFCB] pb-4">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#A98B57] flex items-center gap-1.5">
                      <TrendingUp className="w-3.5 h-3.5 text-[#2E7D4F]" />
                      Meta Ad Account {adAccountId}
                    </span>
                    <h2 className="font-serif text-2xl font-bold text-[#0F172A] mt-1">
                      1-Click Client Meta Ads Launcher
                    </h2>
                    <p className="text-xs text-[#64748B] mt-1">
                      Deploys high-CTR creative bundles, audience targeting, and budget schedules directly to Meta Ad Account.
                    </p>
                  </div>

                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FAF9F5] border border-[#EADFCB] text-xs font-semibold text-[#5C3A1E]">
                    <ShieldCheck className="w-4 h-4 text-[#2E7D4F]" />
                    <span>Meta Graph v21.0 Token Active</span>
                  </div>
                </div>

                {/* Package Tier Selection */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[#0F172A] block uppercase tracking-wider">
                    Select Client Package / Ad Spend Tier
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[
                      { tier: "Starter (₹3,499)", budget: "₹3,499", desc: "Local Reach • 3 Creative Variations • 7-Day Run" },
                      { tier: "Growth (₹7,999)", budget: "₹7,999", desc: "Pan-India • 6 Creative Variations • Video Reels • 14-Day Run" },
                      { tier: "Retainer (₹14,999)", budget: "₹14,999", desc: "Enterprise Multi-Adset • Dedicated Retainer • 30-Day Run" },
                    ].map((item) => (
                      <div
                        key={item.tier}
                        onClick={() => setSelectedClientTier(item.tier as any)}
                        className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                          selectedClientTier === item.tier
                            ? "bg-[#FAF6EE] border-[#D4A35A] shadow-warm ring-1 ring-[#D4A35A]"
                            : "bg-[#FAF9F5] border-[#EADFCB] hover:bg-[#FFFDF9]"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-serif font-bold text-sm text-[#0F172A]">{item.tier}</span>
                          <span className="text-xs font-mono font-bold text-[#5C3A1E]">{item.budget}</span>
                        </div>
                        <p className="text-[11px] text-[#64748B] leading-relaxed">{item.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#0F172A] block uppercase tracking-wider">
                      Client Brand Name
                    </label>
                    <input
                      type="text"
                      value={clientBrandName}
                      onChange={(e) => setClientBrandName(e.target.value)}
                      required
                      className="w-full rounded-xl border border-[#EADFCB] bg-[#FAF9F5] px-4 py-2.5 text-xs text-[#0F172A] focus:border-[#D4A35A] focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#0F172A] block uppercase tracking-wider">
                      Primary Headline
                    </label>
                    <input
                      type="text"
                      value={clientHeadline}
                      onChange={(e) => setClientHeadline(e.target.value)}
                      required
                      className="w-full rounded-xl border border-[#EADFCB] bg-[#FAF9F5] px-4 py-2.5 text-xs text-[#0F172A] focus:border-[#D4A35A] focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-xs font-bold text-[#0F172A] block uppercase tracking-wider">
                      Direct-Response Ad Copy &amp; Offer
                    </label>
                    <textarea
                      rows={2}
                      value={clientAdCaption}
                      onChange={(e) => setClientAdCaption(e.target.value)}
                      required
                      className="w-full rounded-xl border border-[#EADFCB] bg-[#FAF9F5] px-4 py-2.5 text-xs text-[#0F172A] focus:border-[#D4A35A] focus:outline-none resize-none"
                    />
                  </div>

                  <div className="space-y-1.5 md:col-span-2">
                    <label className="text-xs font-bold text-[#0F172A] block uppercase tracking-wider">
                      Approved High-Res Creative Asset URL
                    </label>
                    <input
                      type="url"
                      value={clientCreativeUrl}
                      onChange={(e) => setClientCreativeUrl(e.target.value)}
                      required
                      className="w-full rounded-xl border border-[#EADFCB] bg-[#FAF9F5] px-4 py-2.5 text-xs text-[#0F172A] font-mono focus:border-[#D4A35A] focus:outline-none"
                    />
                  </div>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-[#EADFCB]">
                  <div className="text-xs text-[#64748B]">
                    <span>Logs confirmation &amp; Meta Tracking ID directly into Firestore collection <strong>meta_ads_campaigns</strong>.</span>
                  </div>

                  <Button
                    variant="primary"
                    size="lg"
                    type="submit"
                    isLoading={isDeployingAd}
                    leftIcon={<TrendingUp className="w-4 h-4" />}
                    className="shadow-warm w-full sm:w-auto min-w-[260px]"
                  >
                    {isDeployingAd ? "Deploying to Meta Ad Account..." : `Deploy Live Ad Bundle (${selectedClientTier.split(" ")[0]})`}
                  </Button>
                </div>
              </form>

              {/* Live Client Ad Campaigns Ledger */}
              <div className="rounded-3xl bg-[#FFFDF9] border border-[#EADFCB] overflow-hidden shadow-xs">
                <div className="flex items-center justify-between p-6 border-b border-[#EADFCB] bg-[#FAF9F5]">
                  <div>
                    <h3 className="font-serif text-lg font-bold text-[#0F172A]">
                      Active Client Campaigns in Meta Ad Account ({adAccountId})
                    </h3>
                    <p className="text-xs text-[#64748B]">
                      Real-time telemetry, impressions, click-through rates, and ROAS.
                    </p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => void loadMarketingData()} leftIcon={<RefreshCw className="w-3.5 h-3.5" />}>
                    Refresh
                  </Button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-[#0F172A]">
                    <thead className="bg-[#FAF9F5]/70 text-[#5C3A1E] font-semibold border-b border-[#EADFCB]">
                      <tr>
                        <th className="p-4">Client Brand &amp; Order</th>
                        <th className="p-4">Ad Tier &amp; Budget</th>
                        <th className="p-4">Meta Tracking ID</th>
                        <th className="p-4">Impressions / Clicks</th>
                        <th className="p-4">Spend &amp; ROAS</th>
                        <th className="p-4">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#F0ECE1]">
                      {clientCampaigns.map((camp) => (
                        <tr key={camp.campaignId} className="hover:bg-[#FAF9F5]/50 transition-colors">
                          <td className="p-4 font-semibold">
                            <p className="text-xs text-[#0F172A] font-bold">{camp.brandName}</p>
                            <p className="text-[10px] text-[#64748B]">{camp.orderId} • {camp.clientName}</p>
                          </td>
                          <td className="p-4">
                            <span className="font-bold text-[#5C3A1E]">{camp.tier}</span>
                            <p className="text-[10px] text-[#64748B]">Budget: ₹{camp.budgetAmount?.toLocaleString()}</p>
                          </td>
                          <td className="p-4 font-mono text-[11px] text-[#5C3A1E]">
                            {camp.metaTrackingId}
                          </td>
                          <td className="p-4 font-semibold">
                            <span>{camp.impressions?.toLocaleString()} imp</span>
                            <span className="text-[#2E7D4F] block text-[10px]">{camp.clicks?.toLocaleString()} clicks</span>
                          </td>
                          <td className="p-4 font-semibold">
                            <span>{camp.spend}</span>
                            <span className="text-[#2E7D4F] block text-[10px]">ROAS: {camp.roas}</span>
                          </td>
                          <td className="p-4">
                            <StatusBadge tone="completed" label="Active on Meta" size="sm" />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </RouteGuard>
  );
}
