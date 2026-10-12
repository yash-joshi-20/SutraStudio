"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { RouteGuard } from "@/components/auth/RouteGuard";
import { PortalSidebar } from "@/components/dashboard/PortalSidebar";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  Sparkles,
  ArrowLeft,
  Workflow,
  BookOpen,
  KeyRound,
  Layers,
  Cpu,
  Search,
  CheckCircle2,
  AlertTriangle,
  Play,
  RotateCcw,
  Copy,
  Check,
  ChevronRight,
  ShieldCheck,
  Sliders,
  Eye,
  Filter,
  RefreshCw,
  Video,
  Box,
  Share2,
  Calendar,
  Users,
  Compass,
  FileText,
  Clock,
  ExternalLink,
  ChevronDown,
} from "lucide-react";
import {
  CreativeCategory,
  MasterPromptTemplate,
  CreativeKeyword,
  CapabilityItem,
  CreativeJob,
  BrandProfile,
  TrendObservation,
  CreativeStylePreset,
} from "@/lib/creative-automation/types";
import { CREATIVE_STYLE_PRESETS } from "@/lib/creative-automation/stylePresets";
import { MASTER_PROMPT_LIBRARY } from "@/lib/creative-automation/promptLibrary";
import { CREATIVE_KEYWORD_LIBRARY } from "@/lib/creative-automation/keywordLibrary";
import { getLiveCapabilityRegistry } from "@/lib/creative-automation/capabilityRegistry";
import { STANDARD_WORKFLOW_STEPS, DEFAULT_WORKFLOW_DEFINITIONS } from "@/lib/creative-automation/workflowEngine";
import { INITIAL_BRAND_PROFILES, DEFAULT_SUTRA_STUDIO_BRAND } from "@/lib/creative-automation/brandProfiles";

type ActiveTab =
  | "workflows"
  | "prompts"
  | "keywords"
  | "presets"
  | "trends"
  | "capabilities"
  | "brands"
  | "jobs";

export default function AdminCreativeAutomationPage() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("workflows");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Data states
  const [capabilities, setCapabilities] = useState<CapabilityItem[]>([]);
  const [prompts, setPrompts] = useState<MasterPromptTemplate[]>(MASTER_PROMPT_LIBRARY);
  const [keywords, setKeywords] = useState<CreativeKeyword[]>(CREATIVE_KEYWORD_LIBRARY);
  const [brands, setBrands] = useState<BrandProfile[]>(INITIAL_BRAND_PROFILES);
  const [selectedBrand, setSelectedBrand] = useState<BrandProfile>(DEFAULT_SUTRA_STUDIO_BRAND);
  const [jobs, setJobs] = useState<CreativeJob[]>([]);
  const [selectedPromptCategory, setSelectedPromptCategory] = useState<string>("all");
  const [keywordCategory, setKeywordCategory] = useState<string>("all");
  const [keywordSearch, setKeywordSearch] = useState<string>("");

  // Trend research state
  const [trendIndustry, setTrendIndustry] = useState<string>("Creative Technology");
  const [trendAudience, setTrendAudience] = useState<string>("Agency Founders & Creative Directors");
  const [trendPlatform, setTrendPlatform] = useState<string>("instagram_reels");
  const [trendResults, setTrendResults] = useState<TrendObservation[]>([]);
  const [isSearchingTrends, setIsSearchingTrends] = useState<boolean>(false);

  // Workflow builder state
  const [activeWorkflowId, setActiveWorkflowId] = useState<string>("wf-standard-14-step");
  const [stepToggles, setStepToggles] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    STANDARD_WORKFLOW_STEPS.forEach((s) => {
      initial[s.stepId] = s.isEnabled;
    });
    return initial;
  });

  // Action status message
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  useEffect(() => {
    // Load live capabilities
    setCapabilities(getLiveCapabilityRegistry());

    // Fetch live jobs from API
    fetch("/api/admin/creative-automation/jobs")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.jobs) {
          setJobs(data.jobs);
        }
      })
      .catch(() => {});
  }, []);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleRunTrendResearch = async () => {
    setIsSearchingTrends(true);
    setActionFeedback(null);
    try {
      const res = await fetch("/api/admin/creative-automation/trends", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          industry: trendIndustry,
          targetAudience: trendAudience,
          platform: trendPlatform,
        }),
      });
      const data = await res.json();
      if (data && data.observations) {
        setTrendResults(data.observations);
        setActionFeedback("Trend intelligence generated from verified market patterns.");
      }
    } catch {
      setActionFeedback("Failed to run trend research query.");
    } finally {
      setIsSearchingTrends(false);
    }
  };

  const handleToggleKeyword = (kwId: string) => {
    setKeywords((prev) =>
      prev.map((k) => (k.id === kwId ? { ...k, isEnabled: !k.isEnabled } : k))
    );
  };

  const handleToggleStep = (stepId: string) => {
    setStepToggles((prev) => ({ ...prev, [stepId]: !prev[stepId] }));
  };

  const handleSimulateWorkflowRun = async () => {
    setActionFeedback("Preparing creative job definition (ZERO MEDIA GENERATED)...");
    try {
      const res = await fetch("/api/admin/creative-automation/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create",
          newJobParams: {
            brandId: selectedBrand.id,
            clientUid: selectedBrand.clientUid,
            workflowId: activeWorkflowId,
            title: `${selectedBrand.brandName} Autonomous Pipeline Run`,
            category: "educational_reels",
            brief: {
              topic: "Automated Studio Workflows",
              targetAudience: selectedBrand.targetAudience,
              keyMessage: "Bespoke creative technology delivered in 48 hours.",
              tone: selectedBrand.contentPreferences.voiceTone,
            },
          },
        }),
      });
      const data = await res.json();
      if (data && data.job) {
        setJobs((prev) => [data.job, ...prev]);
        setActionFeedback(`Creative Job #${data.job.id} initialized and registered in queue.`);
        setActiveTab("jobs");
      }
    } catch {
      setActionFeedback("Failed to initialize job.");
    }
  };

  const handleApproveJobStep = async (jobId: string) => {
    try {
      const res = await fetch("/api/admin/creative-automation/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "approve", jobId }),
      });
      const data = await res.json();
      if (data && data.job) {
        setJobs((prev) => prev.map((j) => (j.id === jobId ? data.job : j)));
        setActionFeedback("Step approved. Job transitioned to next execution stage.");
      }
    } catch {
      setActionFeedback("Failed to update approval status.");
    }
  };

  return (
    <RouteGuard requiredRole="admin">
      <div className="min-h-screen bg-[#FAF9F5] text-[#171717] flex">
        {/* Collapsible Admin Portal Sidebar */}
        <PortalSidebar />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header */}
          <header className="sticky top-0 z-20 bg-[#FAF9F5]/90 backdrop-blur-md border-b border-[#E5E1D8] px-4 sm:px-6 lg:px-8 py-4">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-xs font-mono tracking-widest text-[#A98B57] uppercase mb-1">
                  <Link href="/admin" className="hover:underline flex items-center gap-1">
                    <ArrowLeft className="w-3 h-3" /> Admin Dashboard
                  </Link>
                  <span>/</span>
                  <span>Autonomous Studio</span>
                </div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-serif tracking-tight text-[#171717]">
                    AI Creative Automation Studio
                  </h1>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#A98B57]/10 text-[#A98B57] border border-[#A98B57]/20">
                    Engine v2.4
                  </span>
                </div>
              </div>

              {/* Brand Selector & Action */}
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 bg-[#FFFFFF] border border-[#E5E1D8] rounded-lg px-3 py-1.5 shadow-xs text-sm">
                  <Users className="w-4 h-4 text-[#A98B57]" />
                  <span className="text-xs text-[#737373]">Tenant:</span>
                  <select
                    value={selectedBrand.id}
                    onChange={(e) => {
                      const found = brands.find((b) => b.id === e.target.value);
                      if (found) setSelectedBrand(found);
                    }}
                    className="bg-transparent font-medium text-xs text-[#171717] focus:outline-none cursor-pointer"
                  >
                    {brands.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.brandName} ({b.id === DEFAULT_SUTRA_STUDIO_BRAND.id ? "Master" : "Client"})
                      </option>
                    ))}
                  </select>
                </div>

                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleSimulateWorkflowRun}
                  className="bg-[#171717] hover:bg-[#A98B57] text-[#FAF9F5] transition-colors flex items-center gap-1.5 text-xs font-medium"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  Test Pipeline
                </Button>
              </div>
            </div>

            {/* Notification Banner */}
            {actionFeedback && (
              <div className="max-w-7xl mx-auto mt-3 p-2.5 bg-[#FAF9F5] border border-[#A98B57]/30 rounded-lg text-xs text-[#171717] flex items-center justify-between shadow-xs">
                <span className="flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-[#A98B57]" />
                  {actionFeedback}
                </span>
                <button
                  onClick={() => setActionFeedback(null)}
                  className="text-xs text-[#737373] hover:text-[#171717]"
                >
                  Dismiss
                </button>
              </div>
            )}

            {/* Sub-Navigation Tabs */}
            <div className="max-w-7xl mx-auto mt-4 flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
              {[
                { id: "workflows", label: "Workflow Builder", icon: Workflow },
                { id: "prompts", label: "Master Prompts", icon: BookOpen },
                { id: "keywords", label: "Keyword Library", icon: KeyRound },
                { id: "presets", label: "Style Presets", icon: Layers },
                { id: "trends", label: "Trend Research", icon: Compass },
                { id: "capabilities", label: "Capabilities & APIs", icon: Cpu },
                { id: "brands", label: "Brand Profiles", icon: Users },
                { id: "jobs", label: `Job Queue (${jobs.length})`, icon: Clock },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as ActiveTab)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium transition-all whitespace-nowrap ${
                      isActive
                        ? "bg-[#171717] text-[#FAF9F5] shadow-xs"
                        : "bg-[#FFFFFF] text-[#737373] hover:text-[#171717] border border-[#E5E1D8]"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </header>

          {/* Main Body Container */}
          <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 space-y-6">
            {/* ============================================================= */}
            {/* TAB 1: WORKFLOW BUILDER                                       */}
            {/* ============================================================= */}
            {activeTab === "workflows" && (
              <div className="space-y-6">
                <div className="bg-[#FFFFFF] p-6 rounded-xl border border-[#E5E1D8] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-serif text-[#171717]">
                      14-Step Master Creative Production Pipeline
                    </h2>
                    <p className="text-xs text-[#737373] mt-1">
                      Configure autonomous execution stages, assign AI capability adapters, toggle human approval gates, and manage retry policies.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[#737373]">Workflow Preset:</span>
                    <select
                      value={activeWorkflowId}
                      onChange={(e) => setActiveWorkflowId(e.target.value)}
                      className="bg-[#FAF9F5] border border-[#E5E1D8] rounded-md px-2.5 py-1 text-xs font-medium text-[#171717]"
                    >
                      {DEFAULT_WORKFLOW_DEFINITIONS.map((w) => (
                        <option key={w.id} value={w.id}>
                          {w.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Step List Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {STANDARD_WORKFLOW_STEPS.map((step) => {
                    const isEnabled = stepToggles[step.stepId] ?? step.isEnabled;
                    return (
                      <div
                        key={step.stepId}
                        className={`p-4 rounded-xl border transition-all ${
                          isEnabled
                            ? "bg-[#FFFFFF] border-[#E5E1D8] shadow-xs"
                            : "bg-[#FAF9F5] border-dashed border-[#E5E1D8] opacity-60"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-2.5">
                            <span className="w-6 h-6 rounded-full bg-[#A98B57]/15 text-[#A98B57] font-mono text-xs font-semibold flex items-center justify-center shrink-0">
                              {step.stepIndex}
                            </span>
                            <div>
                              <h3 className="text-sm font-semibold text-[#171717]">
                                {step.name}
                              </h3>
                              <span className="text-[11px] font-mono text-[#737373]">
                                {step.capabilityType}
                              </span>
                            </div>
                          </div>

                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={isEnabled}
                              onChange={() => handleToggleStep(step.stepId)}
                              className="sr-only peer"
                            />
                            <div className="w-8 h-4 bg-[#E5E1D8] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-[#171717]"></div>
                          </label>
                        </div>

                        <p className="text-xs text-[#737373] mt-2.5 leading-relaxed">
                          {step.description}
                        </p>

                        <div className="mt-4 pt-3 border-t border-[#E5E1D8]/60 flex items-center justify-between text-[11px] text-[#737373]">
                          <span className="flex items-center gap-1 font-mono">
                            Adapter: <strong className="text-[#171717]">{step.preferredCapabilityId}</strong>
                          </span>
                          {step.requiresHumanApproval && (
                            <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-medium flex items-center gap-1">
                              <ShieldCheck className="w-3 h-3" /> Approval Gate
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ============================================================= */}
            {/* TAB 2: MASTER PROMPT LIBRARY                                  */}
            {/* ============================================================= */}
            {activeTab === "prompts" && (
              <div className="space-y-6">
                <div className="bg-[#FFFFFF] p-6 rounded-xl border border-[#E5E1D8] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-serif text-[#171717]">
                      Master Creative Prompt Library
                    </h2>
                    <p className="text-xs text-[#737373] mt-1">
                      Versioned prompt blueprints with strict negative constraints, shot-by-shot instructions, and quality criteria.
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                    {[
                      { id: "all", label: "All Prompts" },
                      { id: "educational_reels", label: "A. Educational" },
                      { id: "screen_ui_demo", label: "B. Screen & UI" },
                      { id: "marketing_commercial", label: "C. Marketing" },
                      { id: "cinematic_video", label: "D. Cinematic" },
                      { id: "interior_3d_360", label: "E. 3D & 360°" },
                    ].map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => setSelectedPromptCategory(cat.id)}
                        className={`px-2.5 py-1 rounded text-xs font-medium transition-colors ${
                          selectedPromptCategory === cat.id
                            ? "bg-[#A98B57] text-[#FAF9F5]"
                            : "bg-[#FAF9F5] text-[#737373] hover:text-[#171717] border border-[#E5E1D8]"
                        }`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Prompt Cards */}
                <div className="space-y-4">
                  {prompts
                    .filter(
                      (p) =>
                        selectedPromptCategory === "all" ||
                        p.category === selectedPromptCategory
                    )
                    .map((item) => (
                      <div
                        key={item.id}
                        className="bg-[#FFFFFF] p-5 rounded-xl border border-[#E5E1D8] shadow-xs space-y-3"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm font-semibold text-[#171717]">
                              {item.title}
                            </h3>
                            <span className="font-mono text-[10px] px-2 py-0.5 bg-[#FAF9F5] border border-[#E5E1D8] rounded text-[#737373]">
                              v{item.version}
                            </span>
                            <span className="text-[10px] px-2 py-0.5 bg-[#A98B57]/10 text-[#A98B57] rounded-full">
                              {item.subCategory}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono text-[#737373]">
                              Ratio: {item.outputRequirements.aspectRatio}
                            </span>
                            <button
                              onClick={() => copyToClipboard(item.promptTemplate, item.id)}
                              className="p-1.5 rounded hover:bg-[#FAF9F5] text-[#737373] hover:text-[#171717] transition-colors"
                              title="Copy Prompt Template"
                            >
                              {copiedId === item.id ? (
                                <Check className="w-4 h-4 text-emerald-600" />
                              ) : (
                                <Copy className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                        </div>

                        {/* Audience & Research */}
                        <div className="text-xs text-[#737373] flex flex-wrap gap-x-4 gap-y-1">
                          <span>
                            <strong>Audience:</strong> {item.intendedAudience}
                          </span>
                          <span>
                            <strong>Cost Range:</strong> ${item.estimatedCost.minUsd}–$
                            {item.estimatedCost.maxUsd} {item.estimatedCost.unit}
                          </span>
                        </div>

                        {/* Prompt Template Box */}
                        <div className="p-3 bg-[#FAF9F5] border border-[#E5E1D8] rounded-lg font-mono text-xs text-[#171717] leading-relaxed">
                          {item.promptTemplate}
                        </div>

                        {/* Required Variables & Negative Constraints */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 text-xs">
                          <div>
                            <span className="font-semibold text-[#171717] text-[11px] uppercase tracking-wider block mb-1">
                              Required Inputs:
                            </span>
                            <div className="flex flex-wrap gap-1">
                              {item.requiredInputs.map((inp) => (
                                <span
                                  key={inp}
                                  className="px-2 py-0.5 bg-[#FFFFFF] border border-[#E5E1D8] rounded text-[11px] font-mono text-[#5C3A1E]"
                                >
                                  {`{{${inp}}}`}
                                </span>
                              ))}
                            </div>
                          </div>

                          <div>
                            <span className="font-semibold text-[#171717] text-[11px] uppercase tracking-wider block mb-1">
                              Negative Constraints:
                            </span>
                            <ul className="list-disc list-inside text-[#737373] text-[11px] space-y-0.5">
                              {item.negativeConstraints.map((c, i) => (
                                <li key={i}>{c}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* ============================================================= */}
            {/* TAB 3: KEYWORD LIBRARY                                        */}
            {/* ============================================================= */}
            {activeTab === "keywords" && (
              <div className="space-y-6">
                <div className="bg-[#FFFFFF] p-6 rounded-xl border border-[#E5E1D8] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-serif text-[#171717]">
                      Searchable Creative Keyword & Technique Library
                    </h2>
                    <p className="text-xs text-[#737373] mt-1">
                      Curated keywords for cinematic motion, educational tutorials, motion graphics, and photorealistic 3D visualization.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-[#737373]" />
                      <input
                        type="text"
                        placeholder="Search keywords..."
                        value={keywordSearch}
                        onChange={(e) => setKeywordSearch(e.target.value)}
                        className="pl-8 pr-3 py-1.5 text-xs bg-[#FAF9F5] border border-[#E5E1D8] rounded-md focus:outline-none focus:border-[#A98B57] w-48"
                      />
                    </div>

                    <select
                      value={keywordCategory}
                      onChange={(e) => setKeywordCategory(e.target.value)}
                      className="bg-[#FAF9F5] border border-[#E5E1D8] rounded-md px-2.5 py-1.5 text-xs font-medium text-[#171717]"
                    >
                      <option value="all">All Categories</option>
                      <option value="cinematic">Cinematic</option>
                      <option value="educational_reel">Educational</option>
                      <option value="motion_graphics">Motion Graphics</option>
                      <option value="interior_3d">Interior & 3D</option>
                      <option value="marketing">Marketing</option>
                    </select>
                  </div>
                </div>

                {/* Keyword Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {keywords
                    .filter((k) => {
                      if (keywordCategory !== "all" && k.category !== keywordCategory)
                        return false;
                      if (
                        keywordSearch &&
                        !k.keyword.toLowerCase().includes(keywordSearch.toLowerCase()) &&
                        !k.description.toLowerCase().includes(keywordSearch.toLowerCase())
                      )
                        return false;
                      return true;
                    })
                    .map((item) => (
                      <div
                        key={item.id}
                        className={`p-4 rounded-xl border transition-all ${
                          item.isEnabled
                            ? "bg-[#FFFFFF] border-[#E5E1D8] shadow-xs"
                            : "bg-[#FAF9F5] border-dashed border-[#E5E1D8] opacity-50"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-xs text-[#171717]">
                            {item.keyword}
                          </span>
                          <button
                            onClick={() => handleToggleKeyword(item.id)}
                            className={`px-2 py-0.5 rounded text-[10px] font-medium font-mono ${
                              item.isEnabled
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : "bg-gray-100 text-gray-500"
                            }`}
                          >
                            {item.isEnabled ? "Active" : "Disabled"}
                          </button>
                        </div>

                        <p className="text-[11px] text-[#737373] mt-2 leading-relaxed">
                          {item.description}
                        </p>

                        <div className="mt-3 p-2 bg-[#FAF9F5] border border-[#E5E1D8] rounded text-[10px] font-mono text-[#5C3A1E]">
                          &quot;{item.usageExample}&quot;
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* ============================================================= */}
            {/* TAB 4: CREATIVE STYLE PRESETS                                 */}
            {/* ============================================================= */}
            {activeTab === "presets" && (
              <div className="space-y-6">
                <div className="bg-[#FFFFFF] p-6 rounded-xl border border-[#E5E1D8] shadow-xs">
                  <h2 className="text-lg font-serif text-[#171717]">
                    Structured Creative Style Presets
                  </h2>
                  <p className="text-xs text-[#737373] mt-1">
                    Formulated from audit of reference showreels, UI screen walkthroughs, cinematic drone orbits, and spatial 360° interactive scenes.
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {CREATIVE_STYLE_PRESETS.map((preset) => (
                    <div
                      key={preset.id}
                      className="bg-[#FFFFFF] p-5 rounded-xl border border-[#E5E1D8] shadow-xs space-y-4"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-sm font-semibold text-[#171717]">
                            {preset.name}
                          </h3>
                          <span className="text-[11px] font-mono text-[#A98B57]">
                            {preset.category} · {preset.aspectRatio} · {preset.durationSecondsRange[0]}–{preset.durationSecondsRange[1]}s
                          </span>
                        </div>
                        <span className="px-2 py-1 bg-[#FAF9F5] border border-[#E5E1D8] rounded text-[10px] font-mono text-[#737373]">
                          {preset.id}
                        </span>
                      </div>

                      <div className="text-xs space-y-2">
                        <div>
                          <strong className="text-[#171717]">Visual Style:</strong>{" "}
                          <span className="text-[#737373]">{preset.visualStyle}</span>
                        </div>
                        <div>
                          <strong className="text-[#171717]">Camera Movement:</strong>{" "}
                          <span className="text-[#737373]">{preset.cameraMovement}</span>
                        </div>
                        <div>
                          <strong className="text-[#171717]">Hook Strategy:</strong>{" "}
                          <span className="text-[#737373]">{preset.hookStrategy}</span>
                        </div>
                      </div>

                      <div>
                        <span className="font-semibold text-[#171717] text-[11px] uppercase tracking-wider block mb-1.5">
                          Scene Progression Structure:
                        </span>
                        <div className="space-y-1">
                          {preset.sceneStructure.map((sc, i) => (
                            <div
                              key={i}
                              className="p-2 bg-[#FAF9F5] border border-[#E5E1D8] rounded text-[11px] text-[#737373] flex items-center gap-2"
                            >
                              <span className="w-4 h-4 rounded-full bg-[#E5E1D8] text-[#171717] font-mono text-[9px] flex items-center justify-center shrink-0">
                                {i + 1}
                              </span>
                              <span>{sc}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ============================================================= */}
            {/* TAB 5: TREND RESEARCH                                         */}
            {/* ============================================================= */}
            {activeTab === "trends" && (
              <div className="space-y-6">
                <div className="bg-[#FFFFFF] p-6 rounded-xl border border-[#E5E1D8] shadow-xs space-y-4">
                  <div>
                    <h2 className="text-lg font-serif text-[#171717]">
                      Trend Research & Marketing Intelligence
                    </h2>
                    <p className="text-xs text-[#737373] mt-1">
                      Query market topics, inspect velocity scores, generate hooks, and map trending topics into production-ready script outlines.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="text-[11px] font-semibold text-[#171717] block mb-1">
                        Industry / Niche
                      </label>
                      <input
                        type="text"
                        value={trendIndustry}
                        onChange={(e) => setTrendIndustry(e.target.value)}
                        className="w-full text-xs p-2 bg-[#FAF9F5] border border-[#E5E1D8] rounded-md focus:outline-none focus:border-[#A98B57]"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-[#171717] block mb-1">
                        Target Audience
                      </label>
                      <input
                        type="text"
                        value={trendAudience}
                        onChange={(e) => setTrendAudience(e.target.value)}
                        className="w-full text-xs p-2 bg-[#FAF9F5] border border-[#E5E1D8] rounded-md focus:outline-none focus:border-[#A98B57]"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-[#171717] block mb-1">
                        Platform Target
                      </label>
                      <select
                        value={trendPlatform}
                        onChange={(e) => setTrendPlatform(e.target.value)}
                        className="w-full text-xs p-2 bg-[#FAF9F5] border border-[#E5E1D8] rounded-md focus:outline-none focus:border-[#A98B57]"
                      >
                        <option value="instagram_reels">Instagram Reels (9:16)</option>
                        <option value="youtube_shorts">YouTube Shorts (9:16)</option>
                        <option value="linkedin">LinkedIn Post & Video</option>
                        <option value="meta_ads">Meta Video Ads</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={handleRunTrendResearch}
                      disabled={isSearchingTrends}
                      className="bg-[#171717] hover:bg-[#A98B57] text-[#FAF9F5]"
                    >
                      {isSearchingTrends ? (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin mr-1.5" />
                      ) : (
                        <Compass className="w-3.5 h-3.5 mr-1.5" />
                      )}
                      Analyze Market Trends
                    </Button>
                  </div>
                </div>

                {/* Research Output Cards */}
                {trendResults.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-[#171717]">
                      Discovered Trends ({trendResults.length})
                    </h3>
                    {trendResults.map((obs) => (
                      <div
                        key={obs.id}
                        className="bg-[#FFFFFF] p-5 rounded-xl border border-[#E5E1D8] shadow-xs space-y-3"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-semibold text-[#171717]">
                              {obs.topic}
                            </h4>
                            <span
                              className={`text-[10px] px-2 py-0.5 rounded-full font-mono ${
                                obs.source === "verified_market_data"
                                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                  : "bg-blue-50 text-blue-700 border border-blue-200"
                              }`}
                            >
                              {obs.source === "verified_market_data" ? "Verified Trend" : "AI Suggested"}
                            </span>
                          </div>
                          <span className="text-xs font-mono text-[#A98B57]">
                            Relevance: {obs.relevanceScore}/100 · {obs.trendVelocity.toUpperCase()}
                          </span>
                        </div>

                        {/* Hooks */}
                        <div>
                          <span className="text-[11px] font-semibold text-[#171717] block mb-1">
                            Suggested Hooks:
                          </span>
                          <div className="space-y-1">
                            {obs.suggestedHooks.map((hk, i) => (
                              <div
                                key={i}
                                className="p-2 bg-[#FAF9F5] border border-[#E5E1D8] rounded text-xs text-[#171717] font-medium"
                              >
                                &quot;{hk}&quot;
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Script Outline */}
                        <div className="p-3 bg-[#FAF9F5] border border-[#E5E1D8] rounded text-xs text-[#737373] space-y-1">
                          <div>
                            <strong className="text-[#171717]">Hook:</strong> {obs.scriptOutline.hook}
                          </div>
                          <div>
                            <strong className="text-[#171717]">Point 1:</strong> {obs.scriptOutline.point1}
                          </div>
                          <div>
                            <strong className="text-[#171717]">Point 2:</strong> {obs.scriptOutline.point2}
                          </div>
                          <div>
                            <strong className="text-[#171717]">CTA:</strong> {obs.scriptOutline.callToAction}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ============================================================= */}
            {/* TAB 6: CAPABILITIES & APIS                                    */}
            {/* ============================================================= */}
            {activeTab === "capabilities" && (
              <div className="space-y-6">
                <div className="bg-[#FFFFFF] p-6 rounded-xl border border-[#E5E1D8] shadow-xs">
                  <h2 className="text-lg font-serif text-[#171717]">
                    Capability Registry & Provider Health
                  </h2>
                  <p className="text-xs text-[#737373] mt-1">
                    Live inspection of configured AI engines, programmatic renderers (Remotion, FFmpeg), storage vaults, and fallback routes.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {capabilities.map((cap) => {
                    const isConfigured =
                      cap.installedStatus === "installed" ||
                      cap.installedStatus === "configured_api" ||
                      cap.installedStatus === "adapter_ready";

                    return (
                      <div
                        key={cap.id}
                        className="bg-[#FFFFFF] p-4 rounded-xl border border-[#E5E1D8] shadow-xs space-y-3"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h3 className="text-sm font-semibold text-[#171717]">
                              {cap.name}
                            </h3>
                            <span className="text-[11px] font-mono text-[#737373]">
                              {cap.provider}
                            </span>
                          </div>

                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-mono font-medium ${
                              isConfigured
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : "bg-amber-50 text-amber-700 border border-amber-200"
                            }`}
                          >
                            {cap.installedStatus.replace("_", " ").toUpperCase()}
                          </span>
                        </div>

                        <p className="text-xs text-[#737373] leading-relaxed">
                          {cap.notes}
                        </p>

                        <div className="pt-2 border-t border-[#E5E1D8]/60 text-[11px] text-[#737373] space-y-1">
                          <div className="flex justify-between">
                            <span>Cost:</span>
                            <strong className="text-[#171717]">
                              ${cap.estimatedCost.costPerUnit} / {cap.estimatedCost.unit}
                            </strong>
                          </div>
                          <div className="flex justify-between">
                            <span>Execution:</span>
                            <span className="font-mono">{cap.executionMethod}</span>
                          </div>
                          {cap.authRequirements.envKey && (
                            <div className="flex justify-between">
                              <span>Env Key:</span>
                              <span className="font-mono text-[#A98B57]">
                                {cap.authRequirements.envKey}
                              </span>
                            </div>
                          )}
                          {cap.fallbackOptionId && (
                            <div className="flex justify-between">
                              <span>Fallback:</span>
                              <span className="font-mono text-[#737373]">
                                {cap.fallbackOptionId}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ============================================================= */}
            {/* TAB 7: BRAND PROFILES                                         */}
            {/* ============================================================= */}
            {activeTab === "brands" && (
              <div className="space-y-6">
                <div className="bg-[#FFFFFF] p-6 rounded-xl border border-[#E5E1D8] shadow-xs">
                  <h2 className="text-lg font-serif text-[#171717]">
                    Multi-Client Brand Profiles & Guidelines
                  </h2>
                  <p className="text-xs text-[#737373] mt-1">
                    Multi-tenant brand isolation. Each client maintains segregated color palettes, voice tones, negative rules, reference assets, and approved prompt sets.
                  </p>
                </div>

                <div className="space-y-4">
                  {brands.map((b) => (
                    <div
                      key={b.id}
                      className="bg-[#FFFFFF] p-5 rounded-xl border border-[#E5E1D8] shadow-xs space-y-4"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-base font-semibold text-[#171717]">
                              {b.brandName}
                            </h3>
                            {b.id === DEFAULT_SUTRA_STUDIO_BRAND.id && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#A98B57]/15 text-[#A98B57] font-semibold">
                                Flagship Master
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-[#737373] mt-0.5">
                            {b.tagline} · {b.industry}
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-xs text-[#737373]">Tone:</span>
                          <span className="px-2 py-0.5 bg-[#FAF9F5] border border-[#E5E1D8] rounded text-xs font-mono font-medium text-[#171717]">
                            {b.contentPreferences.voiceTone}
                          </span>
                        </div>
                      </div>

                      {/* Color Palette Preview */}
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-[#171717]">Palette:</span>
                        <div className="flex items-center gap-2">
                          {[
                            { label: "Primary", hex: b.contentPreferences.primaryColor },
                            { label: "Secondary", hex: b.contentPreferences.secondaryColor },
                            { label: "Accent", hex: b.contentPreferences.accentColor },
                            { label: "Base", hex: b.contentPreferences.backgroundColor },
                          ].map((col) => (
                            <div key={col.label} className="flex items-center gap-1.5 text-xs font-mono">
                              <span
                                className="w-4 h-4 rounded-full border border-black/10"
                                style={{ backgroundColor: col.hex }}
                              />
                              <span className="text-[#737373]">{col.hex}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Products / Services */}
                      <div>
                        <span className="text-[11px] font-semibold text-[#171717] block mb-1">
                          Core Offerings:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {b.productsAndServices.map((srv, i) => (
                            <span
                              key={i}
                              className="px-2.5 py-0.5 bg-[#FAF9F5] border border-[#E5E1D8] rounded text-xs text-[#171717]"
                            >
                              {srv}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Negative Style Rules */}
                      <div>
                        <span className="text-[11px] font-semibold text-[#171717] block mb-1">
                          Negative Style Rules:
                        </span>
                        <ul className="list-disc list-inside text-xs text-[#737373] space-y-0.5">
                          {b.contentPreferences.negativeStyleRules.map((rule, idx) => (
                            <li key={idx}>{rule}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ============================================================= */}
            {/* TAB 8: CREATIVE JOB QUEUE & APPROVALS                         */}
            {/* ============================================================= */}
            {activeTab === "jobs" && (
              <div className="space-y-6">
                <div className="bg-[#FFFFFF] p-6 rounded-xl border border-[#E5E1D8] shadow-xs flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-serif text-[#171717]">
                      Creative Job Queue & Human-in-the-Loop Approvals
                    </h2>
                    <p className="text-xs text-[#737373] mt-1">
                      Monitor multi-step job advancement, inspect compiled briefs, review storyboards, and approve steps before archival.
                    </p>
                  </div>

                  <span className="px-3 py-1 bg-[#A98B57]/10 text-[#A98B57] border border-[#A98B57]/20 rounded-full text-xs font-mono font-medium">
                    {jobs.length} Registered Jobs
                  </span>
                </div>

                {jobs.length === 0 ? (
                  <div className="p-8 text-center bg-[#FFFFFF] border border-[#E5E1D8] rounded-xl text-xs text-[#737373]">
                    No active creative jobs. Click &quot;Test Pipeline&quot; to initialize a new job.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {jobs.map((job) => (
                      <div
                        key={job.id}
                        className="bg-[#FFFFFF] p-5 rounded-xl border border-[#E5E1D8] shadow-xs space-y-4"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="text-sm font-semibold text-[#171717]">
                                {job.title}
                              </h3>
                              <span className="text-[10px] px-2 py-0.5 bg-[#FAF9F5] border border-[#E5E1D8] rounded font-mono text-[#737373]">
                                {job.id}
                              </span>
                            </div>
                            <p className="text-xs text-[#737373] mt-0.5">
                              Tenant: {job.brandId} · Category: {job.category} · Created:{" "}
                              {new Date(job.createdAt).toLocaleDateString()}
                            </p>
                          </div>

                          <div className="flex items-center gap-3">
                            <span
                              className={`px-2.5 py-1 rounded-full text-xs font-mono font-medium ${
                                job.status === "completed"
                                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                  : "bg-blue-50 text-blue-700 border border-blue-200"
                              }`}
                            >
                              {job.status.toUpperCase()} (Step {job.currentStepIndex}/
                              {job.steps.length})
                            </span>

                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleApproveJobStep(job.id)}
                              className="text-xs bg-[#FAF9F5] hover:bg-[#E5E1D8] text-[#171717]"
                            >
                              <ShieldCheck className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                              Approve Step
                            </Button>
                          </div>
                        </div>

                        {/* Script / Brief Preview */}
                        {job.script && (
                          <div className="p-3 bg-[#FAF9F5] border border-[#E5E1D8] rounded-lg text-xs space-y-1.5">
                            <span className="font-semibold text-[#171717] block">
                              Compiled Hook & Script:
                            </span>
                            <p className="text-[#171717] font-medium">&quot;{job.script.hook}&quot;</p>
                            <ul className="list-disc list-inside text-[#737373] space-y-0.5 pl-2">
                              {job.script.body.map((line, idx) => (
                                <li key={idx}>{line}</li>
                              ))}
                            </ul>
                            <div className="text-[#A98B57] font-medium pt-1">
                              CTA: {job.script.cta}
                            </div>
                          </div>
                        )}

                        {/* Step Timeline Indicator */}
                        <div className="pt-2">
                          <span className="text-[11px] font-semibold text-[#171717] block mb-2">
                            Step Pipeline Progression:
                          </span>
                          <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none">
                            {job.steps.map((st) => (
                              <div
                                key={st.stepIndex}
                                title={`${st.name} (${st.status})`}
                                className={`h-2 flex-1 min-w-[20px] rounded-full transition-all ${
                                  st.status === "completed"
                                    ? "bg-emerald-500"
                                    : st.stepIndex === job.currentStepIndex
                                    ? "bg-[#A98B57] animate-pulse"
                                    : "bg-[#E5E1D8]"
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </main>
        </div>
      </div>
    </RouteGuard>
  );
}
