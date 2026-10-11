"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { RouteGuard } from "@/components/auth/RouteGuard";
import { Button } from "@/components/ui/Button";
import {
  ArrowLeft,
  Cpu,
  RefreshCw,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  Lock,
  Layers,
  Sparkles,
  Zap,
  Info,
  Clock,
  DollarSign,
  Sliders,
  Scale,
  FileText,
  AlertCircle,
  Eye,
  Check,
} from "lucide-react";
import type { LicenseEntry } from "@/lib/ai/licenseCompliance";
import type { OpenRouterModel, OpenRouterCapability } from "@/lib/ai/openrouterService";

interface ProviderSummaryItem {
  id: string;
  name: string;
  task: string;
  tier: 1 | 2 | 3 | 4;
  isFree: boolean;
  allowsTraining: boolean;
  costPerUnitUSD: number;
  costUnitDescription: string;
  rateLimitPerMin: number;
  dailyLimitCalls: number;
  description: string;
  isOpenSourceLocal?: boolean;
  isConfigured: boolean;
  usage: {
    callsToday: number;
    tokensOrUnitsToday: number;
    estimatedSpendUSD: number;
    errorCountToday: number;
    lastErrorStatus?: number;
    lastErrorMessage?: string;
    backoffUntil?: number;
    lastUsedAt: string;
  };
  remainingCallsToday: number;
  inBackoff: boolean;
}

interface ApiResponse {
  config: {
    taskChains: Record<string, string[]>;
    noTrainingOnly: boolean;
    dailyCostCapUSD: number;
    orderCostCapUSD: number;
  };
  providers: ProviderSummaryItem[];
  openRouterFreeModels: OpenRouterModel[];
  licenseMatrix: LicenseEntry[];
  totalEstimatedSpendUSD: number;
  sparkUsage: {
    readsToday: number;
    writesToday: number;
    deletesToday: number;
    warningLevel: "normal" | "warning_70" | "critical_90";
    limits: {
      MAX_READS_PER_DAY: number;
      MAX_WRITES_PER_DAY: number;
    };
  };
}

export default function AdminProviderRouterPage() {
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTier, setSelectedTier] = useState<number | "all">("all");
  const [selectedCapability, setSelectedCapability] = useState<string>("all");
  const [licenseSearch, setLicenseSearch] = useState("");
  const [savingConfig, setSavingConfig] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Load summary from API
  const loadSummary = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/provider-router");
      const json = await res.json();
      if (json.ok && json.data) {
        setData(json.data);
      } else {
        setError(json.error?.message || "Failed to load provider router data.");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Network error loading summary.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSummary();
  }, []);

  const handleToggleNoTraining = async () => {
    if (!data) return;
    setSavingConfig(true);
    try {
      const newNoTraining = !data.config.noTrainingOnly;
      const res = await fetch("/api/admin/provider-router", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ noTrainingOnly: newNoTraining }),
      });
      const json = await res.json();
      if (json.ok) {
        setData((prev) =>
          prev ? { ...prev, config: { ...prev.config, noTrainingOnly: newNoTraining } } : null
        );
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 2500);
      }
    } catch {
      // Ignored
    } finally {
      setSavingConfig(false);
    }
  };

  const filteredProviders = data?.providers.filter((p) => {
    if (selectedTier === "all") return true;
    return p.tier === selectedTier;
  });

  const filteredOpenRouterModels = data?.openRouterFreeModels.filter((m) => {
    if (selectedCapability === "all") return true;
    return m.capabilities?.includes(selectedCapability as OpenRouterCapability);
  });

  const filteredLicenseMatrix = data?.licenseMatrix.filter((l) => {
    if (!licenseSearch) return true;
    const term = licenseSearch.toLowerCase();
    return (
      l.tool.toLowerCase().includes(term) ||
      l.category.toLowerCase().includes(term) ||
      l.commercialUseAllowed.toLowerCase().includes(term) ||
      l.notes.toLowerCase().includes(term)
    );
  });

  return (
    <RouteGuard requiredRole="admin">
      <div className="min-h-screen bg-[#FAF9F5] text-[#171717] font-sans">
        {/* Sticky Top Header */}
        <header className="sticky top-0 z-30 bg-[#FAF9F5]/95 backdrop-blur-md border-b border-[#E5E1D8] px-4 sm:px-6 lg:px-8 py-3.5 transition-all">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3 sm:gap-4">
              <Link
                href="/admin"
                className="p-2 rounded-xl bg-white border border-[#E5E1D8] text-[#5C3A1E] hover:bg-[#F3EFE6] transition-colors shadow-xs"
                title="Back to Admin Control Hub"
              >
                <ArrowLeft className="w-4 h-4" />
              </Link>
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#171717] flex items-center justify-center text-[#EADFCB] shadow-sm">
                  <Cpu className="w-5 h-5 text-[#A98B57]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="font-serif text-lg sm:text-xl font-bold tracking-tight text-[#171717]">
                      Free-First Provider Router & Quotas
                    </h1>
                    <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-semibold tracking-wider uppercase bg-[#E8F5E9] text-[#2E7D4F] rounded-md border border-[#C8E6C9]">
                      Rule 9 Active
                    </span>
                  </div>
                  <p className="text-[11px] sm:text-xs text-[#78716C]">
                    Cheapest-first fallback chains, live quota tracking, OpenRouter :free models & license compliance
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <Button
                variant="outline"
                size="sm"
                onClick={loadSummary}
                disabled={loading}
                className="text-xs font-semibold gap-1.5 border-[#E5E1D8] bg-white hover:bg-[#F3EFE6] text-[#171717]"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-[#A98B57] ${loading ? "animate-spin" : ""}`} />
                <span className="hidden sm:inline">Refresh Router</span>
              </Button>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
          {/* Policy Guardrails Card */}
          <div className="p-4 rounded-2xl bg-[#FFFDF9] border border-[#E5E1D8] shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-[#EADFCB]/40 text-[#5C3A1E] shrink-0 mt-0.5">
                <ShieldCheck className="w-5 h-5 text-[#A98B57]" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-[#171717] flex items-center gap-2">
                  <span>Free-First Hierarchy & Failure Guardrails</span>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.2 bg-[#F3EFE6] text-[#78716C] rounded-full border border-[#E5E1D8]">
                    Strict Hierarchy
                  </span>
                </h4>
                <p className="text-xs text-[#78716C] mt-0.5 max-w-3xl leading-relaxed">
                  Execution order: (1) Free open-source tools (FFmpeg, Blender, Web Viewers), (2) Free tiers of existing keys (Gemini, Cerebras, Groq), (3) OpenRouter models with <code className="text-[#A98B57] font-semibold">:free</code> suffix for text tasks only, (4) Paid options only when free cannot meet promised quality with approval. All chain failures mark orders as <code className="text-[#C62828] font-semibold">needs_attention</code> with immediate admin notification. Zero fake output.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
              <span className="text-xs font-semibold text-[#5C3A1E] px-3 py-1.5 rounded-xl bg-[#EADFCB]/30 border border-[#D4C3A3]/40 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#2E7D4F]" />
                <span>Zero Fake Output Enforced</span>
              </span>
            </div>
          </div>

          {/* Quick Metrics KPI Bar */}
          {data && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-white border border-[#E5E1D8] shadow-xs space-y-1">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#78716C] block">
                  Free Providers Active
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold font-serif text-[#171717]">
                    {data.providers.filter((p) => p.isFree && p.isConfigured).length}
                  </span>
                  <span className="text-xs text-[#78716C]">
                    / {data.providers.filter((p) => p.isFree).length} free tools
                  </span>
                </div>
                <span className="text-[10px] text-[#2E7D4F] font-medium block">
                  100% Free Tiers Prioritized
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-[#E5E1D8] shadow-xs space-y-1">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#78716C] block">
                  Calls Dispatched Today
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold font-serif text-[#171717]">
                    {data.providers.reduce((acc, p) => acc + p.usage.callsToday, 0)}
                  </span>
                  <span className="text-xs text-[#78716C]">total requests</span>
                </div>
                <span className="text-[10px] text-[#78716C] block">
                  Tracked across all 4 tiers
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-[#E5E1D8] shadow-xs space-y-1">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#78716C] block">
                  Estimated Spend Today
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold font-serif text-[#171717]">
                    ${data.totalEstimatedSpendUSD.toFixed(4)}
                  </span>
                  <span className="text-xs text-[#78716C]">USD</span>
                </div>
                <span className="text-[10px] text-[#2E7D4F] font-medium block">
                  Daily Cap: ${data.config.dailyCostCapUSD.toFixed(2)}
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-[#E5E1D8] shadow-xs space-y-1">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#78716C] block">
                  Live OpenRouter Free Models
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold font-serif text-[#A98B57]">
                    {data.openRouterFreeModels.length}
                  </span>
                  <span className="text-xs text-[#78716C]">models fetched</span>
                </div>
                <span className="text-[10px] text-[#2E7D4F] font-medium block">
                  Runtime dynamic, zero hardcoding
                </span>
              </div>
            </div>
          )}

          {/* Privacy Switch Card */}
          {data && (
            <div className="p-5 rounded-2xl bg-white border border-[#E5E1D8] shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-[#FAF9F5] border border-[#E5E1D8] text-[#5C3A1E]">
                  <Lock className="w-5 h-5 text-[#A98B57]" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#171717] flex items-center gap-2">
                    <span>Client Privacy & Data Training Policy</span>
                    {data.config.noTrainingOnly ? (
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#E8F5E9] text-[#2E7D4F]">
                        No-Training Only (Strict)
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#EADFCB]/40 text-[#5C3A1E]">
                        Sanitized Free-First Enabled
                      </span>
                    )}
                  </h4>
                  <p className="text-xs text-[#78716C] mt-0.5">
                    {data.config.noTrainingOnly
                      ? "Strict mode: skips any provider that logs or trains on data. Only enterprise private endpoints allowed."
                      : "Standard mode: automatically runs PrivacySanitizer to redact client PII (emails, phone, PAN, GST) before routing to free models."}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleToggleNoTraining}
                  disabled={savingConfig}
                  className="text-xs font-semibold border-[#E5E1D8] bg-white hover:bg-[#F3EFE6] text-[#171717]"
                >
                  {data.config.noTrainingOnly ? "Switch to Sanitized Free-First" : "Enable Strict No-Training"}
                </Button>
                {saveSuccess && (
                  <span className="text-xs text-[#2E7D4F] font-medium flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" />
                    <span>Saved</span>
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Section 1: Provider Quotas and Daily Usage Table */}
          <div className="p-6 rounded-3xl bg-white border border-[#E5E1D8] shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E5E1D8] pb-4">
              <div>
                <h3 className="font-serif text-lg font-bold text-[#171717]">
                  Provider Quotas & Remaining Limits
                </h3>
                <p className="text-xs text-[#78716C]">
                  Per-provider rate limits, daily quotas, cooldown backoff states, and active cost tracking
                </p>
              </div>

              {/* Tier Filter Tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                {[
                  { id: "all", label: "All Tiers" },
                  { id: 1, label: "Tier 1: Local Open-Source" },
                  { id: 2, label: "Tier 2: Keyed Free" },
                  { id: 3, label: "Tier 3: OpenRouter :free" },
                  { id: 4, label: "Tier 4: Paid Options" },
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setSelectedTier(t.id as any)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 ${
                      selectedTier === t.id
                        ? "bg-[#171717] text-white"
                        : "bg-[#FAF9F5] text-[#78716C] border border-[#E5E1D8] hover:bg-[#F3EFE6] hover:text-[#171717]"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Providers Table */}
            <div className="overflow-x-auto border border-[#E5E1D8] rounded-2xl">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#FAF9F5] border-b border-[#E5E1D8] text-[#78716C] font-semibold">
                    <th className="py-3 px-4">Provider / Engine</th>
                    <th className="py-3 px-4">Tier</th>
                    <th className="py-3 px-4">Task</th>
                    <th className="py-3 px-4">Rate Limit</th>
                    <th className="py-3 px-4">Daily Quota</th>
                    <th className="py-3 px-4">Calls Today</th>
                    <th className="py-3 px-4">Remaining Today</th>
                    <th className="py-3 px-4">Cost / Unit</th>
                    <th className="py-3 px-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E1D8]">
                  {filteredProviders && filteredProviders.length > 0 ? (
                    filteredProviders.map((p) => {
                      const tierColor =
                        p.tier === 1
                          ? "bg-[#E8F5E9] text-[#2E7D4F] border-[#C8E6C9]"
                          : p.tier === 2
                          ? "bg-[#E3F2FD] text-[#1976D2] border-[#BBDEFB]"
                          : p.tier === 3
                          ? "bg-[#FFF8E1] text-[#F57F17] border-[#FFE082]"
                          : "bg-[#FFEBEE] text-[#C62828] border-[#FFCDD2]";

                      return (
                        <tr key={p.id} className="hover:bg-[#FAF9F5]/60 transition-colors">
                          <td className="py-3 px-4 font-medium text-[#171717]">
                            <div className="flex flex-col">
                              <span className="font-bold">{p.name}</span>
                              <span className="text-[10px] text-[#78716C] font-mono">{p.id}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${tierColor}`}
                            >
                              Tier {p.tier}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="px-2 py-0.5 rounded bg-[#FAF9F5] border border-[#E5E1D8] text-[10px] font-mono text-[#5C3A1E]">
                              {p.task}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-[#78716C] font-mono">
                            {p.rateLimitPerMin} RPM
                          </td>
                          <td className="py-3 px-4 text-[#78716C] font-mono">
                            {p.dailyLimitCalls.toLocaleString()} calls
                          </td>
                          <td className="py-3 px-4 font-mono font-bold text-[#171717]">
                            {p.usage.callsToday}
                          </td>
                          <td className="py-3 px-4 font-mono text-[#2E7D4F] font-bold">
                            {p.remainingCallsToday.toLocaleString()}
                          </td>
                          <td className="py-3 px-4 text-[#78716C] text-[11px]">
                            {p.costPerUnitUSD === 0 ? (
                              <span className="font-bold text-[#2E7D4F]">Free ($0.00)</span>
                            ) : (
                              `$${p.costPerUnitUSD} (${p.costUnitDescription})`
                            )}
                          </td>
                          <td className="py-3 px-4 text-right">
                            {p.inBackoff ? (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FFEBEE] text-[#C62828] border border-[#FFCDD2]">
                                Cooldown Backoff
                              </span>
                            ) : !p.isConfigured ? (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#F3EFE6] text-[#78716C] border border-[#E5E1D8]">
                                Key Not Configured
                              </span>
                            ) : p.tier === 4 ? (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FFF8E1] text-[#F57F17] border border-[#FFE082]">
                                Approval Gate
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#E8F5E9] text-[#2E7D4F] border border-[#C8E6C9]">
                                Active Ready
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={9} className="py-8 text-center text-[#78716C]">
                        Loading providers...
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 2: Live OpenRouter Free Models */}
          <div className="p-6 rounded-3xl bg-white border border-[#E5E1D8] shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E5E1D8] pb-4">
              <div>
                <h3 className="font-serif text-lg font-bold text-[#171717] flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-[#A98B57]" />
                  <span>OpenRouter Live Free Models (:free Suffix)</span>
                </h3>
                <p className="text-xs text-[#78716C]">
                  Fetched dynamically at runtime from OpenRouter models API. Models selected by capability (text, long context, reasoning, embeddings, rerank).
                </p>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#EADFCB]/30 text-[#5C3A1E] border border-[#D4C3A3]/40">
                {filteredOpenRouterModels?.length || 0} Models Shown
              </span>
            </div>

            {/* Modality Guardrail & ZDR Policy Notice */}
            <div className="p-3.5 rounded-2xl bg-[#FAF9F5] border border-[#E5E1D8] text-[11px] text-[#5C3A1E] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2 font-medium">
                <Lock className="w-4 h-4 text-[#A98B57] shrink-0" />
                <span>
                  <strong>Strict Modality Guardrail:</strong> Free models operate strictly on TEXT, embedding & rerank tasks. Images, video, 3D, and 360 views are routed to local engines (FFmpeg, Blender) and dedicated provider keys.
                </span>
              </div>
              <div className="flex items-center gap-2 shrink-0 text-[10px] text-[#78716C]">
                <ShieldCheck className="w-3.5 h-3.5 text-[#2E7D4F]" />
                <span>Zero-data-retention or complete PII scrub enforced on all requests.</span>
              </div>
            </div>

            {/* Capability Filter Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              {[
                { id: "all", label: "All Capabilities" },
                { id: "text", label: "Text Generation" },
                { id: "long_context", label: "Long Context (>=128k)" },
                { id: "reasoning", label: "Reasoning & QA" },
                { id: "embeddings", label: "Vector Embeddings" },
                { id: "rerank", label: "Document Rerank" },
              ].map((c) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedCapability(c.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 ${
                    selectedCapability === c.id
                      ? "bg-[#171717] text-white"
                      : "bg-[#FAF9F5] text-[#78716C] border border-[#E5E1D8] hover:bg-[#F3EFE6] hover:text-[#171717]"
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredOpenRouterModels && filteredOpenRouterModels.length > 0 ? (
                filteredOpenRouterModels.map((m) => (
                  <div
                    key={m.id}
                    className="p-4 rounded-2xl bg-[#FAF9F5] border border-[#E5E1D8] space-y-3 flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-mono text-xs font-bold text-[#171717] break-all">
                          {m.id}
                        </span>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#E8F5E9] text-[#2E7D4F] shrink-0 border border-[#C8E6C9]">
                          FREE
                        </span>
                      </div>
                      <p className="text-xs font-medium text-[#5C3A1E]">
                        {m.name || m.id.split("/")[1] || m.id}
                      </p>
                      {m.description && (
                        <p className="text-[11px] text-[#78716C] line-clamp-2 leading-relaxed">
                          {m.description}
                        </p>
                      )}

                      {/* Capability & ZDR Badges */}
                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        {m.capabilities &&
                          m.capabilities.map((cap) => (
                            <span
                              key={cap}
                              className="px-2 py-0.5 rounded text-[9px] font-mono font-semibold bg-white border border-[#E5E1D8] text-[#5C3A1E]"
                            >
                              {cap}
                            </span>
                          ))}

                        {m.isZeroDataRetention ? (
                          <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-[#E8F5E9] text-[#2E7D4F] border border-[#C8E6C9] flex items-center gap-1">
                            <ShieldCheck className="w-2.5 h-2.5" /> ZDR
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[9px] font-semibold bg-[#FFF8E1] text-[#B45309] border border-[#FDE68A] flex items-center gap-1">
                            <AlertTriangle className="w-2.5 h-2.5" /> Scrubbed
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-[#E5E1D8] flex items-center justify-between text-[11px] text-[#78716C]">
                      <span>Context: {m.context_length?.toLocaleString() || "128k"} tokens</span>
                      <span className="text-[#2E7D4F] font-semibold">$0.00 / prompt</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-3 py-8 text-center text-xs text-[#78716C]">
                  {loading
                    ? "Fetching live models from OpenRouter endpoint..."
                    : `No free models matched capability "${selectedCapability}".`}
                </div>
              )}
            </div>
          </div>

          {/* Section 3: License Compliance & Commercial Rights Matrix */}
          <div className="p-6 rounded-3xl bg-white border border-[#E5E1D8] shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E5E1D8] pb-4">
              <div>
                <h3 className="font-serif text-lg font-bold text-[#171717] flex items-center gap-2">
                  <Scale className="w-5 h-5 text-[#A98B57]" />
                  <span>License Compliance & Commercial Rights Matrix</span>
                </h3>
                <p className="text-xs text-[#78716C]">
                  Mandatory client deliverable verification: Commercial use allowed, ownership transfer, free limits & official terms links
                </p>
              </div>

              <input
                type="text"
                placeholder="Search tools or terms..."
                value={licenseSearch}
                onChange={(e) => setLicenseSearch(e.target.value)}
                className="px-3.5 py-1.5 rounded-xl border border-[#E5E1D8] bg-[#FAF9F5] text-xs text-[#171717] focus:outline-hidden focus:border-[#A98B57] max-w-xs"
              />
            </div>

            {/* Matrix Table */}
            <div className="overflow-x-auto border border-[#E5E1D8] rounded-2xl">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#FAF9F5] border-b border-[#E5E1D8] text-[#78716C] font-semibold">
                    <th className="py-3 px-4">Tool / Model</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Free Limits</th>
                    <th className="py-3 px-4 text-center">Commercial Use</th>
                    <th className="py-3 px-4 text-center">Ownership Transfer</th>
                    <th className="py-3 px-4">Status for Client Work</th>
                    <th className="py-3 px-4 text-right">Official Terms</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E1D8]">
                  {filteredLicenseMatrix && filteredLicenseMatrix.length > 0 ? (
                    filteredLicenseMatrix.map((item) => (
                      <tr key={item.tool} className="hover:bg-[#FAF9F5]/60 transition-colors">
                        <td className="py-3 px-4 font-bold text-[#171717]">
                          {item.tool}
                        </td>
                        <td className="py-3 px-4 text-[#5C3A1E]">
                          {item.category}
                        </td>
                        <td className="py-3 px-4 text-[#78716C] text-[11px]">
                          {item.freeLimits}
                        </td>
                        <td className="py-3 px-4 text-center">
                          {item.commercialUseAllowed === "yes" ? (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#E8F5E9] text-[#2E7D4F] border border-[#C8E6C9]">
                              YES
                            </span>
                          ) : item.commercialUseAllowed === "no" ? (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#FFEBEE] text-[#C62828] border border-[#FFCDD2]">
                              NO
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#FFF8E1] text-[#F57F17] border border-[#FFE082]">
                              UNCLEAR
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center">
                          {item.ownershipTransferAllowed === "yes" ? (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#E8F5E9] text-[#2E7D4F] border border-[#C8E6C9]">
                              YES
                            </span>
                          ) : item.ownershipTransferAllowed === "no" ? (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#FFEBEE] text-[#C62828] border border-[#FFCDD2]">
                              NO
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#FFF8E1] text-[#F57F17] border border-[#FFE082]">
                              UNCLEAR
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          {item.deliverablesPermitted ? (
                            <div className="flex items-center gap-1.5 text-[#2E7D4F] text-[11px] font-semibold">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Permitted</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5 text-[#C62828] text-[11px] font-semibold">
                              <AlertCircle className="w-3.5 h-3.5" />
                              <span>Blocked (Confirmation Required)</span>
                            </div>
                          )}
                          <p className="text-[10px] text-[#78716C] mt-0.5">{item.notes}</p>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <a
                            href={item.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[#A98B57] hover:text-[#5C3A1E] font-medium transition-colors"
                          >
                            <span>License</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-[#78716C]">
                        Loading compliance matrix...
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </RouteGuard>
  );
}
