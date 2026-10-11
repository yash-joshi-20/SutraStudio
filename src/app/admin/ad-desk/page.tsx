"use client";

import React, { useState, useEffect, useCallback, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { RouteGuard } from "@/components/auth/RouteGuard";
import { Button } from "@/components/ui/Button";
import {
  ArrowLeft,
  Copy,
  Check,
  Download,
  Megaphone,
  Sparkles,
  FileText,
  History,
  Briefcase,
  ChevronRight,
} from "lucide-react";

// Client Model
interface ClientContext {
  id: string;
  name: string;
  company: string;
  email: string;
  tier: "Starter" | "Growth" | "Enterprise";
  industry: string;
  colors: Array<{ hex: string; usage: string }>;
  services: string[];
  pastOrders: number;
}

// Preset Clients
const PRESET_CLIENTS: ClientContext[] = [
  {
    id: "cli_002",
    name: "Maison Aura Luxury Fragrances",
    company: "Maison Aura Luxury Fragrances",
    email: "atelier@maisonaura.com",
    tier: "Growth",
    industry: "Luxury Fragrances & Artisanal Beauty",
    colors: [
      { hex: "#FAF9F5", usage: "Background Ivory" },
      { hex: "#171717", usage: "Charcoal Primary" },
      { hex: "#C5A059", usage: "Warm Gold Accent" },
      { hex: "#5C3A1E", usage: "Earthy Amber" },
    ],
    services: ["Image Creation", "Video Creation", "Meta Ads Launcher", "Digital Marketing"],
    pastOrders: 6,
  },
  {
    id: "cli_001",
    name: "Studio Living Architecture",
    company: "Studio Living Architecture",
    email: "contact@studioliving.com",
    tier: "Enterprise",
    industry: "High-End Residential Architecture & 3D Spatial",
    colors: [
      { hex: "#F3EFE6", usage: "Limestone Surface" },
      { hex: "#0F172A", usage: "Deep Slate" },
      { hex: "#A98B57", usage: "Muted Brass" },
    ],
    services: ["3D Modeling", "360 View", "Interior Design", "Website Development"],
    pastOrders: 12,
  },
  {
    id: "cli_003",
    name: "Zenith Spatial & Interiors",
    company: "Zenith Spatial & Interiors",
    email: "design@zenithspatial.com",
    tier: "Starter",
    industry: "Commercial Interior Design & Retail Staging",
    colors: [
      { hex: "#FFFFFF", usage: "Studio White" },
      { hex: "#262626", usage: "Matte Black" },
      { hex: "#D4A35A", usage: "Ochre Accent" },
    ],
    services: ["Interior Design", "Window Design", "Image Creation"],
    pastOrders: 3,
  },
];

interface GeneratedCampaign {
  id: string;
  createdAt: string;
  clientId: string;
  clientName: string;
  product: string;
  goal: string;
  location: string;
  budget: string;
  tone: string;
  campaignName: string;
  suggestedObjective: string;
  audience: {
    location: string;
    age: string;
    gender: string;
    interests: string;
  };
  placements: string;
  primaryTextVariants: Array<{ label: string; text: string }>;
  headlines: string[];
  description: string;
  ctaButton: string;
  destinationUrl: string;
  whatsappLink: string;
  hashtags: string;
  imageBrief: string;
  altText: string;
  creatives: {
    square1x1: { ratio: string; url: string; placement: string };
    vertical4x5: { ratio: string; url: string; placement: string };
    fullScreen9x16: { ratio: string; url: string; placement: string };
  };
}

export default function AdminAdDeskPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#FAF9F5] p-8 text-center text-xs text-[#78716C]">Loading Ad Copy Desk...</div>}>
      <AdDeskContent />
    </Suspense>
  );
}

function AdDeskContent() {
  const searchParams = useSearchParams();
  const initialClientId = searchParams?.get("clientId") || "cli_002";

  const [selectedClientId, setSelectedClientId] = useState<string>(initialClientId);
  const [productInput, setProductInput] = useState<string>("Artisanal Amber Eau de Parfum");
  const [goalInput, setGoalInput] = useState<string>("Leads (Instant Forms & WhatsApp)");
  const [locationInput, setLocationInput] = useState<string>("Mumbai, Bandra & South Mumbai (+15 km)");
  const [budgetInput, setBudgetInput] = useState<string>("₹2,500 / day");
  const [toneInput, setToneInput] = useState<string>("Luxury Atelier");

  const [isGenerating, setIsGenerating] = useState(false);
  const [currentCampaign, setCurrentCampaign] = useState<GeneratedCampaign | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [clientHistory, setClientHistory] = useState<GeneratedCampaign[]>([]);

  // Selected Client Object
  const currentClient = PRESET_CLIENTS.find((c) => c.id === selectedClientId) || PRESET_CLIENTS[0];

  // Load client campaign history from localStorage
  const loadHistory = useCallback((clientId: string) => {
    try {
      const saved = localStorage.getItem(`sutra_ad_history_${clientId}`);
      if (saved) {
        setClientHistory(JSON.parse(saved));
      } else {
        setClientHistory([]);
      }
    } catch {
      setClientHistory([]);
    }
  }, []);

  useEffect(() => {
    loadHistory(selectedClientId);
  }, [selectedClientId, loadHistory]);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2200);
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productInput.trim() || isGenerating) return;

    setIsGenerating(true);
    try {
      const res = await fetch("/api/admin/ad-desk/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client: currentClient,
          product: productInput,
          goal: goalInput,
          location: locationInput,
          budget: budgetInput,
          tone: toneInput,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to generate campaign package");
      }

      const data = await res.json();
      if (data.campaign) {
        setCurrentCampaign(data.campaign);

        // Save to client history
        const updatedHistory = [data.campaign, ...clientHistory.slice(0, 9)];
        setClientHistory(updatedHistory);
        localStorage.setItem(`sutra_ad_history_${currentClient.id}`, JSON.stringify(updatedHistory));
      }
    } catch (err: any) {
      alert("Error generating ad copy: " + err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyAll = () => {
    if (!currentCampaign) return;
    const allText = `===================================================================
SUTRA STUDIOS — AD CAMPAIGN PACKAGE
Client: ${currentCampaign.clientName}
Product: ${currentCampaign.product}
Goal: ${currentCampaign.goal}
===================================================================

CAMPAIGN NAME:
${currentCampaign.campaignName}

SUGGESTED OBJECTIVE:
${currentCampaign.suggestedObjective}

AUDIENCE TARGETING:
• Location: ${currentCampaign.audience.location}
• Age Bracket: ${currentCampaign.audience.age}
• Gender: ${currentCampaign.audience.gender}
• Detailed Interests: ${currentCampaign.audience.interests}

PLACEMENTS:
${currentCampaign.placements}

PRIMARY TEXT - VARIANT A (Direct Benefit):
${currentCampaign.primaryTextVariants[0]?.text}

PRIMARY TEXT - VARIANT B (Editorial Hook):
${currentCampaign.primaryTextVariants[1]?.text}

PRIMARY TEXT - VARIANT C (Social Proof & Atelier Craft):
${currentCampaign.primaryTextVariants[2]?.text}

HEADLINES:
1. ${currentCampaign.headlines[0]}
2. ${currentCampaign.headlines[1]}
3. ${currentCampaign.headlines[2]}

DESCRIPTION:
${currentCampaign.description}

CALL TO ACTION BUTTON:
${currentCampaign.ctaButton}

DESTINATION URL:
${currentCampaign.destinationUrl}

WHATSAPP CLICK LINK:
${currentCampaign.whatsappLink}

INSTAGRAM HASHTAGS:
${currentCampaign.hashtags}

CREATIVE BRIEF FOR DESIGN TEAM:
${currentCampaign.imageBrief}

ALT TEXT:
${currentCampaign.altText}
`;
    copyToClipboard(allText, "copy-all-btn");
  };

  const handleDownloadTxt = () => {
    if (!currentCampaign) return;
    const allText = `SUTRA STUDIOS — AD CAMPAIGN SPECIFICATION
Client: ${currentCampaign.clientName}
Product: ${currentCampaign.product}
Created: ${new Date(currentCampaign.createdAt).toLocaleString()}

CAMPAIGN NAME:
${currentCampaign.campaignName}

OBJECTIVE:
${currentCampaign.suggestedObjective}

AUDIENCE:
Location: ${currentCampaign.audience.location}
Age: ${currentCampaign.audience.age}
Gender: ${currentCampaign.audience.gender}
Interests: ${currentCampaign.audience.interests}

PLACEMENTS:
${currentCampaign.placements}

PRIMARY TEXT VARIANTS:
[Variant A]
${currentCampaign.primaryTextVariants[0]?.text}

[Variant B]
${currentCampaign.primaryTextVariants[1]?.text}

[Variant C]
${currentCampaign.primaryTextVariants[2]?.text}

HEADLINES:
- ${currentCampaign.headlines[0]}
- ${currentCampaign.headlines[1]}
- ${currentCampaign.headlines[2]}

DESCRIPTION:
${currentCampaign.description}

CTA BUTTON:
${currentCampaign.ctaButton}

DESTINATION URL:
${currentCampaign.destinationUrl}

WHATSAPP LINK:
${currentCampaign.whatsappLink}

HASHTAGS:
${currentCampaign.hashtags}

VISUAL CREATIVE BRIEF:
${currentCampaign.imageBrief}

ALT TEXT:
${currentCampaign.altText}
`;
    const blob = new Blob([allText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `ad-copy-${currentClient.id}-${Date.now()}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <RouteGuard requiredRole="admin">
      <div className="min-h-screen bg-[#FAF9F5] text-[#171717] font-sans">
        {/* Sticky Header */}
        <header className="sticky top-0 z-30 bg-[#FAF9F5]/95 backdrop-blur-md border-b border-[#E5E1D8] px-4 sm:px-6 lg:px-8 py-3.5 transition-all">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3 sm:gap-4">
              <Link
                href="/admin"
                className="p-2 rounded-xl bg-white border border-[#E5E1D8] text-[#5C3A1E] hover:bg-[#F3EFE6] transition-colors shadow-xs"
                title="Back to Admin Dashboard"
              >
                <ArrowLeft className="w-4 h-4" />
              </Link>
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#171717] flex items-center justify-center text-[#EADFCB] shadow-sm">
                  <Megaphone className="w-5 h-5 text-[#A98B57]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="font-serif text-lg sm:text-xl font-bold tracking-tight text-[#171717]">
                      Ad Copy Desk
                    </h1>
                    <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-semibold tracking-wider uppercase bg-[#EADFCB]/40 text-[#5C3A1E] rounded-md border border-[#D4C3A3]/50">
                      Client-Contextual Generator
                    </span>
                  </div>
                  <p className="text-[11px] sm:text-xs text-[#78716C]">
                    Generate ready-to-copy Meta ad campaigns, 3 text variants, headlines & 1:1 / 4:5 / 9:16 creatives
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <Link href="/admin/guidelines">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs font-semibold gap-1.5 border-[#E5E1D8] bg-white hover:bg-[#F3EFE6] text-[#171717]"
                >
                  <FileText className="w-3.5 h-3.5 text-[#A98B57]" />
                  <span className="hidden sm:inline">Ad Guidelines SOP</span>
                </Button>
              </Link>
            </div>
          </div>
        </header>

        {/* Client Context Bar & Selector */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-2">
          <div className="p-5 rounded-3xl bg-white border border-[#E5E1D8] shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E5E1D8] pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-[#171717] text-[#FAF9F5]">
                  <Briefcase className="w-5 h-5 text-[#D4A35A]" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#78716C] block">
                    Active Client Workspace
                  </span>
                  <h3 className="font-serif text-base font-bold text-[#171717]">
                    {currentClient.company}
                  </h3>
                </div>
              </div>

              {/* Client Switcher Dropdown */}
              <div className="flex items-center gap-2">
                <label className="text-xs font-semibold text-[#78716C] shrink-0">
                  Switch Client:
                </label>
                <select
                  value={selectedClientId}
                  onChange={(e) => setSelectedClientId(e.target.value)}
                  className="px-3 py-1.5 rounded-xl bg-[#FAF9F5] border border-[#E5E1D8] text-xs font-semibold text-[#171717] focus:outline-none focus:border-[#A98B57]"
                >
                  {PRESET_CLIENTS.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.name} ({client.tier})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Context Telemetry Pills */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded-2xl bg-[#FAF9F5] border border-[#E5E1D8] space-y-1">
                <span className="text-[10px] uppercase font-bold text-[#78716C] block">
                  Industry / Sector
                </span>
                <span className="font-semibold text-[#171717] block truncate">
                  {currentClient.industry}
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-[#FAF9F5] border border-[#E5E1D8] space-y-1">
                <span className="text-[10px] uppercase font-bold text-[#78716C] block">
                  Brand Palette
                </span>
                <div className="flex items-center gap-2">
                  {currentClient.colors.map((c, i) => (
                    <div
                      key={i}
                      className="w-5 h-5 rounded-full border border-[#E5E1D8] shadow-2xs"
                      style={{ backgroundColor: c.hex }}
                      title={`${c.usage}: ${c.hex}`}
                    />
                  ))}
                  <span className="text-[11px] text-[#78716C] font-mono pl-1">
                    {currentClient.colors[0]?.hex}
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-[#FAF9F5] border border-[#E5E1D8] space-y-1">
                <span className="text-[10px] uppercase font-bold text-[#78716C] block">
                  Retainer Tier & Volume
                </span>
                <span className="font-semibold text-[#5C3A1E] block">
                  {currentClient.tier} • {currentClient.pastOrders} Orders Completed
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-[#FAF9F5] border border-[#E5E1D8] space-y-1">
                <span className="text-[10px] uppercase font-bold text-[#78716C] block">
                  Subscribed Disciplines
                </span>
                <span className="font-semibold text-[#171717] block truncate">
                  {currentClient.services.join(", ")}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Grid: Input Form + Campaign Output */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left 4 Cols: Input Form & Client History */}
            <div className="lg:col-span-5 space-y-6">
              {/* Generator Form Card */}
              <div className="p-6 rounded-3xl bg-white border border-[#E5E1D8] shadow-xs space-y-5">
                <div className="flex items-center justify-between border-b border-[#E5E1D8] pb-3">
                  <h3 className="font-serif text-base font-bold text-[#171717] flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#A98B57]" />
                    <span>Ad Brief Parameters</span>
                  </h3>
                  <span className="text-[11px] font-mono text-[#5C3A1E] bg-[#EADFCB]/30 px-2 py-0.5 rounded-md">
                    Meta Policy Compliant
                  </span>
                </div>

                <form onSubmit={handleGenerate} className="space-y-4 text-xs">
                  {/* Product / Service Input */}
                  <div className="space-y-1.5">
                    <label className="font-semibold text-[#171717] block">
                      Product or Service to Promote *
                    </label>
                    <input
                      type="text"
                      value={productInput}
                      onChange={(e) => setProductInput(e.target.value)}
                      placeholder="e.g. Amber Luxury Fragrance Collection"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF9F5] border border-[#E5E1D8] text-xs font-medium text-[#171717] focus:outline-none focus:border-[#A98B57]"
                      required
                    />
                    {/* Quick suggestion chips */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {currentClient.services.slice(0, 3).map((srv) => (
                        <button
                          key={srv}
                          type="button"
                          onClick={() => setProductInput(srv)}
                          className="px-2 py-0.5 text-[10px] font-semibold bg-white border border-[#E5E1D8] rounded-md text-[#78716C] hover:bg-[#F3EFE6] hover:text-[#171717] transition-all"
                        >
                          + {srv}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Campaign Goal */}
                  <div className="space-y-1.5">
                    <label className="font-semibold text-[#171717] block">
                      Campaign Goal *
                    </label>
                    <select
                      value={goalInput}
                      onChange={(e) => setGoalInput(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF9F5] border border-[#E5E1D8] text-xs font-semibold text-[#171717] focus:outline-none focus:border-[#A98B57]"
                    >
                      <option value="Leads (Instant Forms & WhatsApp)">
                        Leads (Instant Forms & WhatsApp Consultation)
                      </option>
                      <option value="Website Sales & Conversions">
                        Website Sales & Conversions (E-Commerce)
                      </option>
                      <option value="Traffic & Discovery">
                        Traffic & Discovery (Qualified Link Clicks)
                      </option>
                      <option value="Direct WhatsApp Conversations">
                        Direct WhatsApp Conversations (Click-to-Chat)
                      </option>
                    </select>
                  </div>

                  {/* Target Location / Radius */}
                  <div className="space-y-1.5">
                    <label className="font-semibold text-[#171717] block">
                      Target Location & Radius *
                    </label>
                    <input
                      type="text"
                      value={locationInput}
                      onChange={(e) => setLocationInput(e.target.value)}
                      placeholder="e.g. Mumbai, Bandra (+15 km)"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF9F5] border border-[#E5E1D8] text-xs font-medium text-[#171717] focus:outline-none focus:border-[#A98B57]"
                      required
                    />
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {["Mumbai (+15km)", "Delhi NCR", "Bangalore Urban", "Pan-India Tier 1"].map((loc) => (
                        <button
                          key={loc}
                          type="button"
                          onClick={() => setLocationInput(loc)}
                          className="px-2 py-0.5 text-[10px] font-semibold bg-white border border-[#E5E1D8] rounded-md text-[#78716C] hover:bg-[#F3EFE6] hover:text-[#171717] transition-all"
                        >
                          {loc}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Daily / Total Budget */}
                  <div className="space-y-1.5">
                    <label className="font-semibold text-[#171717] block">
                      Planned Ad Budget *
                    </label>
                    <input
                      type="text"
                      value={budgetInput}
                      onChange={(e) => setBudgetInput(e.target.value)}
                      placeholder="e.g. ₹2,500 / day"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF9F5] border border-[#E5E1D8] text-xs font-medium text-[#171717] focus:outline-none focus:border-[#A98B57]"
                      required
                    />
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {["₹1,000 / day", "₹2,500 / day", "₹5,000 / day", "₹25,000 total"].map((b) => (
                        <button
                          key={b}
                          type="button"
                          onClick={() => setBudgetInput(b)}
                          className="px-2 py-0.5 text-[10px] font-semibold bg-white border border-[#E5E1D8] rounded-md text-[#78716C] hover:bg-[#F3EFE6] hover:text-[#171717] transition-all"
                        >
                          {b}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Tone / Angle */}
                  <div className="space-y-1.5">
                    <label className="font-semibold text-[#171717] block">
                      Creative Hook & Tone
                    </label>
                    <select
                      value={toneInput}
                      onChange={(e) => setToneInput(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF9F5] border border-[#E5E1D8] text-xs font-semibold text-[#171717] focus:outline-none focus:border-[#A98B57]"
                    >
                      <option value="Luxury Atelier">Luxury Atelier (Refined, Exclusive, Subtle Craft)</option>
                      <option value="Direct Benefit & Transformation">Direct Benefit & Transformation (High Intent)</option>
                      <option value="Authoritative & Engineering">Authoritative & Architectural (Precision)</option>
                    </select>
                  </div>

                  {/* Generate Button */}
                  <Button
                    type="submit"
                    disabled={isGenerating}
                    className="w-full py-3 rounded-2xl bg-[#171717] text-white hover:bg-[#2A2A2A] font-semibold text-xs gap-2 shadow-xs transition-all mt-2"
                  >
                    {isGenerating ? (
                      <>
                        <span className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                        <span>Generating Ad Package & Creatives...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 text-[#D4A35A]" />
                        <span>Generate Ad Copy & Creatives</span>
                      </>
                    )}
                  </Button>
                </form>
              </div>

              {/* Client Campaign History Card */}
              <div className="p-6 rounded-3xl bg-white border border-[#E5E1D8] shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-[#E5E1D8] pb-3">
                  <h4 className="font-serif text-sm font-bold text-[#171717] flex items-center gap-2">
                    <History className="w-4 h-4 text-[#A98B57]" />
                    <span>Saved Campaigns ({currentClient.name})</span>
                  </h4>
                  <span className="text-[10px] text-[#78716C] font-mono">
                    {clientHistory.length} Saved
                  </span>
                </div>

                {clientHistory.length > 0 ? (
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    {clientHistory.map((camp) => (
                      <div
                        key={camp.id}
                        onClick={() => setCurrentCampaign(camp)}
                        className={`p-3 rounded-xl border text-xs cursor-pointer transition-all flex items-center justify-between ${
                          currentCampaign?.id === camp.id
                            ? "bg-[#EADFCB]/30 border-[#D4C3A3] text-[#171717] font-semibold"
                            : "bg-[#FAF9F5] border-[#E5E1D8] text-[#78716C] hover:bg-[#F3EFE6] hover:text-[#171717]"
                        }`}
                      >
                        <div className="space-y-0.5 overflow-hidden pr-2">
                          <span className="font-bold text-[#171717] block truncate">
                            {camp.product}
                          </span>
                          <span className="text-[10px] text-[#A98B57] block truncate">
                            {camp.goal} • {new Date(camp.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <ChevronRight className="w-3.5 h-3.5 shrink-0 text-[#A98B57]" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-[#78716C] italic text-center py-4">
                    No past ad campaigns generated for this client yet.
                  </p>
                )}
              </div>
            </div>

            {/* Right 7 Cols: Generated Ad Campaign Package */}
            <div className="lg:col-span-7 space-y-6">
              {currentCampaign ? (
                <div className="space-y-6 animate-fadeIn">
                  {/* Top Action Header with Copy All & Export */}
                  <div className="p-4 rounded-3xl bg-white border border-[#E5E1D8] shadow-xs flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-[#2E7D4F] bg-[#E8F5E9] px-2.5 py-0.5 rounded-md inline-block mb-1">
                        ✓ Generated & Policy Verified
                      </span>
                      <h3 className="font-serif text-sm sm:text-base font-bold text-[#171717]">
                        {currentCampaign.campaignName}
                      </h3>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCopyAll}
                        className={`text-xs font-semibold gap-1.5 transition-all ${
                          copiedId === "copy-all-btn"
                            ? "bg-[#2E7D4F] text-white border-[#2E7D4F]"
                            : "border-[#E5E1D8] bg-white text-[#171717] hover:bg-[#F3EFE6]"
                        }`}
                      >
                        {copiedId === "copy-all-btn" ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-white" />
                            <span>All Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5 text-[#A98B57]" />
                            <span>Copy All</span>
                          </>
                        )}
                      </Button>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleDownloadTxt}
                        className="text-xs font-semibold gap-1.5 border-[#E5E1D8] bg-white text-[#171717] hover:bg-[#F3EFE6]"
                      >
                        <Download className="w-3.5 h-3.5 text-[#A98B57]" />
                        <span>Download .txt</span>
                      </Button>
                    </div>
                  </div>

                  {/* 1. Campaign Settings Block */}
                  <div className="p-6 rounded-3xl bg-white border border-[#E5E1D8] shadow-xs space-y-4">
                    <h4 className="font-serif text-sm font-bold text-[#171717] border-b border-[#E5E1D8] pb-2">
                      1. Campaign Structure & Suggested Objective
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <AdField
                        label="Campaign Name"
                        value={currentCampaign.campaignName}
                        id="camp-name"
                        copiedId={copiedId}
                        onCopy={copyToClipboard}
                      />
                      <AdField
                        label="Suggested Objective"
                        value={currentCampaign.suggestedObjective}
                        id="camp-obj"
                        copiedId={copiedId}
                        onCopy={copyToClipboard}
                      />
                    </div>
                  </div>

                  {/* 2. Audience & Placements */}
                  <div className="p-6 rounded-3xl bg-white border border-[#E5E1D8] shadow-xs space-y-4">
                    <h4 className="font-serif text-sm font-bold text-[#171717] border-b border-[#E5E1D8] pb-2">
                      2. Target Audience & Placements
                    </h4>

                    <div className="space-y-3 text-xs">
                      <AdField
                        label="Location & Radius"
                        value={currentCampaign.audience.location}
                        id="aud-loc"
                        copiedId={copiedId}
                        onCopy={copyToClipboard}
                      />
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <AdField
                          label="Age Demographic"
                          value={currentCampaign.audience.age}
                          id="aud-age"
                          copiedId={copiedId}
                          onCopy={copyToClipboard}
                        />
                        <AdField
                          label="Gender"
                          value={currentCampaign.audience.gender}
                          id="aud-gender"
                          copiedId={copiedId}
                          onCopy={copyToClipboard}
                        />
                      </div>
                      <AdField
                        label="Detailed High-Affinity Interests"
                        value={currentCampaign.audience.interests}
                        id="aud-interests"
                        copiedId={copiedId}
                        onCopy={copyToClipboard}
                      />
                      <AdField
                        label="Recommended Placements"
                        value={currentCampaign.placements}
                        id="aud-placements"
                        copiedId={copiedId}
                        onCopy={copyToClipboard}
                      />
                    </div>
                  </div>

                  {/* 3. Three Primary-Text Variants */}
                  <div className="p-6 rounded-3xl bg-white border border-[#E5E1D8] shadow-xs space-y-4">
                    <div className="flex items-center justify-between border-b border-[#E5E1D8] pb-2">
                      <h4 className="font-serif text-sm font-bold text-[#171717]">
                        3. Primary Text Variants (3 Options)
                      </h4>
                      <span className="text-[10px] text-[#78716C]">
                        First 125 chars optimized before &apos;See more&apos;
                      </span>
                    </div>

                    <div className="space-y-4">
                      {currentCampaign.primaryTextVariants.map((variant, idx) => (
                        <div
                          key={idx}
                          className="p-4 rounded-2xl bg-[#FAF9F5] border border-[#E5E1D8] space-y-2.5"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-[#5C3A1E]">
                              {variant.label}
                            </span>
                            <span className="text-[11px] font-mono text-[#78716C] bg-white px-2 py-0.5 rounded border border-[#E5E1D8]">
                              {variant.text.length} chars
                            </span>
                          </div>
                          <p className="text-xs text-[#171717] leading-relaxed whitespace-pre-line">
                            {variant.text}
                          </p>
                          <div className="flex justify-end pt-1">
                            <AdCopyButton
                              text={variant.text}
                              id={`var-${idx}`}
                              copiedId={copiedId}
                              onCopy={copyToClipboard}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* 4. Headlines, Description & CTA */}
                  <div className="p-6 rounded-3xl bg-white border border-[#E5E1D8] shadow-xs space-y-4">
                    <h4 className="font-serif text-sm font-bold text-[#171717] border-b border-[#E5E1D8] pb-2">
                      4. Headlines & Action Buttons
                    </h4>

                    <div className="space-y-3 text-xs">
                      {currentCampaign.headlines.map((headline, idx) => (
                        <div
                          key={idx}
                          className="p-3 rounded-xl bg-[#FAF9F5] border border-[#E5E1D8] flex items-center justify-between gap-3"
                        >
                          <div className="space-y-0.5 overflow-hidden">
                            <span className="text-[10px] uppercase font-bold text-[#78716C] block">
                              Headline {idx + 1} ({headline.length} / 40 chars)
                            </span>
                            <span className="text-xs font-bold text-[#171717] block truncate">
                              {headline}
                            </span>
                          </div>
                          <AdCopyButton
                            text={headline}
                            id={`hl-${idx}`}
                            copiedId={copiedId}
                            onCopy={copyToClipboard}
                          />
                        </div>
                      ))}

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                        <AdField
                          label="News Feed Description"
                          value={currentCampaign.description}
                          id="feed-desc"
                          copiedId={copiedId}
                          onCopy={copyToClipboard}
                        />
                        <AdField
                          label="Suggested CTA Button"
                          value={currentCampaign.ctaButton}
                          id="cta-btn"
                          copiedId={copiedId}
                          onCopy={copyToClipboard}
                        />
                      </div>
                    </div>
                  </div>

                  {/* 5. Destination URL, WhatsApp Link & Hashtags */}
                  <div className="p-6 rounded-3xl bg-white border border-[#E5E1D8] shadow-xs space-y-4">
                    <h4 className="font-serif text-sm font-bold text-[#171717] border-b border-[#E5E1D8] pb-2">
                      5. Destinations & Instagram Hashtags
                    </h4>

                    <div className="space-y-3 text-xs">
                      <AdField
                        label="Destination Website URL (with UTM tracking)"
                        value={currentCampaign.destinationUrl}
                        id="dest-url"
                        copiedId={copiedId}
                        onCopy={copyToClipboard}
                      />
                      <AdField
                        label="Direct WhatsApp Click-to-Chat Link"
                        value={currentCampaign.whatsappLink}
                        id="wa-link"
                        copiedId={copiedId}
                        onCopy={copyToClipboard}
                      />
                      <AdField
                        label="Curated Instagram Hashtags (5-10 tags)"
                        value={currentCampaign.hashtags}
                        id="hashtags"
                        copiedId={copiedId}
                        onCopy={copyToClipboard}
                      />
                    </div>
                  </div>

                  {/* 6. Creative Brief & Generated Visuals (1:1, 4:5, 9:16) */}
                  <div className="p-6 rounded-3xl bg-white border border-[#E5E1D8] shadow-xs space-y-5">
                    <div className="border-b border-[#E5E1D8] pb-2">
                      <h4 className="font-serif text-sm font-bold text-[#171717]">
                        6. Generated Ad Visuals (1:1, 4:5, 9:16)
                      </h4>
                      <p className="text-xs text-[#78716C]">
                        Generated using studio creative engine with download controls
                      </p>
                    </div>

                    {/* Brief & Alt Text */}
                    <div className="space-y-3 text-xs">
                      <div className="p-3.5 rounded-2xl bg-[#FAF9F5] border border-[#E5E1D8] space-y-1">
                        <span className="font-bold text-[#5C3A1E] block text-[11px] uppercase">
                          Creative Composition Brief:
                        </span>
                        <p className="text-[#171717] leading-relaxed">
                          {currentCampaign.imageBrief}
                        </p>
                        <div className="flex justify-end pt-1">
                          <AdCopyButton
                            text={currentCampaign.imageBrief}
                            id="img-brief"
                            copiedId={copiedId}
                            onCopy={copyToClipboard}
                          />
                        </div>
                      </div>

                      <div className="p-3.5 rounded-2xl bg-[#FAF9F5] border border-[#E5E1D8] space-y-1">
                        <span className="font-bold text-[#5C3A1E] block text-[11px] uppercase">
                          Image Alt Text (Accessibility):
                        </span>
                        <p className="text-[#171717] leading-relaxed">
                          {currentCampaign.altText}
                        </p>
                        <div className="flex justify-end pt-1">
                          <AdCopyButton
                            text={currentCampaign.altText}
                            id="img-alt"
                            copiedId={copiedId}
                            onCopy={copyToClipboard}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Visual Asset Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                      {/* 1:1 Square */}
                      <div className="p-3 rounded-2xl bg-[#FAF9F5] border border-[#E5E1D8] space-y-2 flex flex-col justify-between">
                        <div className="space-y-1">
                          <span className="text-[10px] uppercase font-bold text-[#5C3A1E] block">
                            1:1 Square (1080×1080)
                          </span>
                          <span className="text-[10px] text-[#78716C] block">
                            Facebook & Instagram Feed
                          </span>
                        </div>

                        <div className="w-full aspect-square rounded-xl overflow-hidden bg-black/5 relative group border border-[#E5E1D8]">
                          <img
                            src={currentCampaign.creatives.square1x1.url}
                            alt="1:1 Ad Creative"
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        </div>

                        <a
                          href={currentCampaign.creatives.square1x1.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          download="ad-creative-1x1.png"
                          className="w-full py-1.5 px-3 rounded-xl bg-white border border-[#E5E1D8] hover:bg-[#F3EFE6] text-center font-semibold text-xs text-[#171717] flex items-center justify-center gap-1.5 transition-all shadow-2xs"
                        >
                          <Download className="w-3.5 h-3.5 text-[#A98B57]" />
                          <span>Download 1:1</span>
                        </a>
                      </div>

                      {/* 4:5 Vertical */}
                      <div className="p-3 rounded-2xl bg-[#FAF9F5] border border-[#E5E1D8] space-y-2 flex flex-col justify-between">
                        <div className="space-y-1">
                          <span className="text-[10px] uppercase font-bold text-[#5C3A1E] block">
                            4:5 Vertical (1080×1350)
                          </span>
                          <span className="text-[10px] text-[#78716C] block">
                            Mobile Feed Optimal
                          </span>
                        </div>

                        <div className="w-full aspect-[4/5] rounded-xl overflow-hidden bg-black/5 relative group border border-[#E5E1D8]">
                          <img
                            src={currentCampaign.creatives.vertical4x5.url}
                            alt="4:5 Ad Creative"
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        </div>

                        <a
                          href={currentCampaign.creatives.vertical4x5.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          download="ad-creative-4x5.png"
                          className="w-full py-1.5 px-3 rounded-xl bg-white border border-[#E5E1D8] hover:bg-[#F3EFE6] text-center font-semibold text-xs text-[#171717] flex items-center justify-center gap-1.5 transition-all shadow-2xs"
                        >
                          <Download className="w-3.5 h-3.5 text-[#A98B57]" />
                          <span>Download 4:5</span>
                        </a>
                      </div>

                      {/* 9:16 Full Screen */}
                      <div className="p-3 rounded-2xl bg-[#FAF9F5] border border-[#E5E1D8] space-y-2 flex flex-col justify-between">
                        <div className="space-y-1">
                          <span className="text-[10px] uppercase font-bold text-[#5C3A1E] block">
                            9:16 Full Screen (1080×1920)
                          </span>
                          <span className="text-[10px] text-[#78716C] block">
                            Reels & Stories
                          </span>
                        </div>

                        <div className="w-full aspect-[9/16] rounded-xl overflow-hidden bg-black/5 relative group border border-[#E5E1D8]">
                          <img
                            src={currentCampaign.creatives.fullScreen9x16.url}
                            alt="9:16 Ad Creative"
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        </div>

                        <a
                          href={currentCampaign.creatives.fullScreen9x16.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          download="ad-creative-9x16.png"
                          className="w-full py-1.5 px-3 rounded-xl bg-white border border-[#E5E1D8] hover:bg-[#F3EFE6] text-center font-semibold text-xs text-[#171717] flex items-center justify-center gap-1.5 transition-all shadow-2xs"
                        >
                          <Download className="w-3.5 h-3.5 text-[#A98B57]" />
                          <span>Download 9:16</span>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* Empty / Intro Prompt State */
                <div className="p-12 rounded-3xl bg-white border border-[#E5E1D8] text-center space-y-4 shadow-xs">
                  <div className="w-16 h-16 rounded-3xl bg-[#FAF9F5] border border-[#E5E1D8] flex items-center justify-center mx-auto text-[#A98B57] shadow-xs">
                    <Megaphone className="w-8 h-8" />
                  </div>
                  <div className="space-y-1 max-w-md mx-auto">
                    <h3 className="font-serif text-lg font-bold text-[#171717]">
                      Ready to Generate Meta Campaigns
                    </h3>
                    <p className="text-xs text-[#78716C] leading-relaxed">
                      Select parameters on the left and click &apos;Generate Ad Copy & Creatives&apos;. The Ad Desk will produce ready-to-copy campaign titles, audience definitions, 3 copy variants, headlines, hashtags, and 1:1, 4:5, 9:16 visual assets tailored to {currentClient.name}.
                    </p>
                  </div>
                  <Button
                    onClick={handleGenerate}
                    disabled={isGenerating}
                    variant="outline"
                    size="sm"
                    className="text-xs font-semibold gap-1.5 border-[#E5E1D8] bg-white hover:bg-[#F3EFE6] text-[#171717]"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-[#A98B57]" />
                    <span>Run Default Atelier Discovery Ad</span>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </RouteGuard>
  );
}

// -----------------------------------------------------------------------------
// HELPER UI ATOMS
// -----------------------------------------------------------------------------

function AdCopyButton({
  text,
  id,
  copiedId,
  onCopy,
}: {
  text: string;
  id: string;
  copiedId: string | null;
  onCopy: (text: string, id: string) => void;
}) {
  const isCopied = copiedId === id;
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => onCopy(text, id)}
      className={`h-7 px-2 text-[11px] font-semibold gap-1 transition-all shadow-2xs shrink-0 ${
        isCopied
          ? "bg-[#2E7D4F] text-white border-[#2E7D4F]"
          : "bg-white text-[#171717] border-[#E5E1D8] hover:bg-[#F3EFE6]"
      }`}
    >
      {isCopied ? (
        <>
          <Check className="w-3 h-3 text-white" />
          <span>Copied!</span>
        </>
      ) : (
        <>
          <Copy className="w-3 h-3 text-[#A98B57]" />
          <span>Copy</span>
        </>
      )}
    </Button>
  );
}

function AdField({
  label,
  value,
  id,
  copiedId,
  onCopy,
}: {
  label: string;
  value: string;
  id: string;
  copiedId: string | null;
  onCopy: (text: string, id: string) => void;
}) {
  return (
    <div className="p-3 rounded-xl bg-[#FAF9F5] border border-[#E5E1D8] flex items-center justify-between gap-3">
      <div className="space-y-0.5 overflow-hidden">
        <span className="text-[10px] uppercase font-bold text-[#78716C] block">
          {label}
        </span>
        <span className="text-xs font-bold text-[#171717] block truncate">
          {value}
        </span>
      </div>
      <AdCopyButton text={value} id={id} copiedId={copiedId} onCopy={onCopy} />
    </div>
  );
}
