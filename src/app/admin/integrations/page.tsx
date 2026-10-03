/**
 * Admin → Integrations & Missing Keys Registry
 *
 * A read-only honesty and integration control panel. For every third-party service
 * it displays whether the server holds the keys it needs, exactly WHICH key names
 * are missing, the priority tier, impacted features, and step-by-step instructions
 * on where to obtain them.
 *
 * HARD RULE: Secret values are NEVER rendered here and NEVER leave the server.
 */

"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ShieldCheck,
  TriangleAlert,
  RefreshCw,
  ExternalLink,
  Key,
  AlertCircle,
  Sparkles,
  Layers,
  ArrowRight,
  CheckCircle2,
  Lock,
} from "lucide-react";
import { json, jsonRaw, errorMessage } from "@/lib/api/client";
import { StatusBadge, StatTile, type StatusTone } from "@/components/ui/Status";
import { ErrorState, LoadingState } from "@/components/ui/States";

interface IntegrationStatus {
  id: string;
  name: string;
  group: string;
  description: string;
  features: string[];
  priority: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  state: "configured" | "not configured";
  whereToGet: string;
  missingKeys: string[];
  presentKeys: string[];
  manualSteps: string[];
}

interface Counts {
  orders?: number;
  users?: number;
  payments?: number;
  notifications?: number;
}

interface Payload {
  summary: {
    total: number;
    configured: number;
    missing: number;
    criticalMissing: string[];
    highMissing?: string[];
    allMissingKeys?: string[];
  };
  integrations: IntegrationStatus[];
  counts: Counts;
  countsAvailable: boolean;
  firestoreRegistry?: Record<string, unknown>[];
}

const GROUP_LABELS: Record<string, string> = {
  "Core Platform": "Core Platform & Web SDK",
  Authentication: "Authentication & RBAC",
  Payments: "Payments & Invoicing",
  Storage: "Media Vault & Google Drive",
  "AI Providers": "AI Models & Concierge",
  Automation: "Workflow Engines & n8n",
  Notifications: "Notifications & Email",
  Social: "Social & Meta Ads",
  Security: "Administrative & Encryption",
};

const priorityBadges: Record<string, { bg: string; text: string; border: string }> = {
  CRITICAL: { bg: "bg-red-50", text: "text-red-700", border: "border-red-200" },
  HIGH: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200" },
  MEDIUM: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200" },
  LOW: { bg: "bg-stone-50", text: "text-stone-700", border: "border-stone-200" },
};

export default function AdminIntegrationsPage() {
  const [data, setData] = useState<Payload | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);
  const [filterPriority, setFilterPriority] = useState<string>("ALL");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setData(await json<Payload>("/api/admin/integrations"));
    } catch (err) {
      setError(errorMessage(err, "Could not load integration status."));
    } finally {
      setLoading(false);
    }
  }, []);

  const syncRegistry = async () => {
    setSyncing(true);
    try {
      await jsonRaw("/api/admin/integrations", "POST", {});
      await load();
    } catch (err) {
      setError(errorMessage(err, "Failed to synchronize integration registry."));
    } finally {
      setSyncing(false);
    }
  };

  useEffect(() => {
    void load();
  }, [load]);

  const missingItems = useMemo(() => {
    if (!data?.integrations) return [];
    return data.integrations.filter((item) => item.state === "not configured");
  }, [data]);

  const grouped = useMemo(() => {
    const map = new Map<string, IntegrationStatus[]>();
    for (const item of data?.integrations ?? []) {
      if (filterPriority !== "ALL" && item.priority !== filterPriority) {
        continue;
      }
      const list = map.get(item.group) ?? [];
      list.push(item);
      map.set(item.group, list);
    }
    return [...map.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  }, [data, filterPriority]);

  if (loading) return <LoadingState label="Inspecting studio integration keys…" rows={4} />;
  if (error) return <ErrorState message={error} onRetry={() => void load()} />;
  if (!data) return <ErrorState message="Integration status is unavailable." onRetry={() => void load()} />;

  const critical = data.summary.criticalMissing;
  const totalMissing = data.summary.missing;

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-[#E5E1D8] pb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-serif text-3xl font-normal text-[#171717]">Integrations Registry</h1>
            <span className="inline-flex items-center rounded-full bg-[#FAF9F5] px-2.5 py-0.5 text-xs font-medium text-[#5C3A1E] border border-[#E5E1D8]">
              Step 31A Protected
            </span>
          </div>
          <p className="mt-1 text-sm text-[#737373]">
            Central declaration for studio credentials, API keys, and missing-key protection. Secret values are never exposed.
          </p>
        </div>

        <button
          type="button"
          onClick={() => void syncRegistry()}
          disabled={syncing}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#A98B57] bg-[#A98B57] px-4 py-2.5 text-sm font-medium text-white shadow-xs transition hover:bg-[#8F7445] disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${syncing ? "animate-spin" : ""}`} />
          {syncing ? "Synchronizing..." : "Re-check & Sync Registry"}
        </button>
      </div>

      {/* KPI Tiles */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatTile
          label="Services Configured"
          value={`${data.summary.configured} / ${data.summary.total}`}
          tone={data.summary.configured === data.summary.total ? "good" : "neutral"}
          hint="Operational integrations"
        />
        <StatTile
          label="Missing Keys"
          value={totalMissing}
          tone={totalMissing > 0 ? "warn" : "good"}
          hint={totalMissing > 0 ? "Variables needing values" : "All services ready"}
        />
        <StatTile
          label="Critical Gaps"
          value={critical.length}
          tone={critical.length ? "bad" : "good"}
          hint={critical.length ? `${critical.join(", ")}` : "Core auth & storage ready"}
        />
        <StatTile
          label="Firestore Status"
          value={data.countsAvailable ? "Connected" : "Offline / Cache"}
          tone={data.countsAvailable ? "good" : "neutral"}
          hint={data.countsAvailable ? `${data.counts.orders ?? 0} orders recorded` : "Using local env registry"}
        />
      </div>

      {/* Missing Keys Banner */}
      {totalMissing > 0 ? (
        <div className="rounded-2xl border border-[#FDE68A] bg-[#FFFBEB] p-5 shadow-xs">
          <div className="flex items-start gap-4">
            <div className="rounded-xl bg-[#FEF3C7] p-2 text-[#B45309]">
              <TriangleAlert className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <h2 className="text-base font-semibold text-[#92400E]">
                {totalMissing} Integration{totalMissing === 1 ? "" : "s"} Unconfigured ({data.summary.allMissingKeys?.length ?? totalMissing} Variables Missing)
              </h2>
              <p className="mt-1 text-sm text-[#78350F]">
                Features requiring these keys will gracefully respond with <code className="rounded bg-white/80 px-1 py-0.5 text-xs font-mono">503 Service Unavailable</code> without producing fake data or crashing.
              </p>

              <div className="mt-4 grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
                {missingItems.slice(0, 6).map((item) => (
                  <div key={item.id} className="rounded-xl border border-[#FDE68A] bg-white/70 p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#171717]">{item.name}</span>
                      <span className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${priorityBadges[item.priority].bg} ${priorityBadges[item.priority].text} border ${priorityBadges[item.priority].border}`}>
                        {item.priority}
                      </span>
                    </div>
                    <div className="mt-1.5 flex flex-wrap gap-1">
                      {item.missingKeys.map((k) => (
                        <span key={k} className="rounded bg-[#FAF9F5] border border-[#E5E1D8] px-1.5 py-0.5 font-mono text-[10px] text-[#5C3A1E]">
                          {k}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            <p className="text-sm font-medium text-emerald-900">
              All studio integrations and environment keys are fully configured.
            </p>
          </div>
        </div>
      )}

      {/* Priority Filters */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <span className="text-xs font-medium text-[#737373] mr-1">Filter Priority:</span>
        {["ALL", "CRITICAL", "HIGH", "MEDIUM", "LOW"].map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => setFilterPriority(p)}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${
              filterPriority === p
                ? "bg-[#171717] text-white"
                : "border border-[#E5E1D8] bg-white text-[#737373] hover:bg-[#FAF9F5]"
            }`}
          >
            {p}
          </button>
        ))}
      </div>

      {/* Grouped Integrations List */}
      <div className="space-y-6">
        {grouped.map(([group, items]) => {
          const readyCount = items.filter((i) => i.state === "configured").length;
          return (
            <section key={group} className="overflow-hidden rounded-2xl border border-[#E5E1D8] bg-white shadow-xs">
              <div className="flex items-center justify-between border-b border-[#E5E1D8] bg-[#FAF9F5] px-5 py-3.5">
                <div className="flex items-center gap-2">
                  <Layers className="h-4 w-4 text-[#A98B57]" />
                  <h3 className="text-sm font-semibold text-[#171717]">{GROUP_LABELS[group] ?? group}</h3>
                </div>
                <span className="text-xs font-medium text-[#737373]">
                  {readyCount} of {items.length} Ready
                </span>
              </div>

              <div className="divide-y divide-[#F0ECE1]">
                {items.map((item) => {
                  const expanded = openId === item.id;
                  const isReady = item.state === "configured";
                  const pBadge = priorityBadges[item.priority] || priorityBadges.LOW;

                  return (
                    <div key={item.id} className="p-5 transition hover:bg-[#FAF9F5]/40">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex-1 cursor-pointer" onClick={() => setOpenId(expanded ? null : item.id)}>
                          <div className="flex flex-wrap items-center gap-2.5">
                            <span className="text-sm font-semibold text-[#171717]">{item.name}</span>
                            <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${pBadge.bg} ${pBadge.text} border ${pBadge.border}`}>
                              {item.priority}
                            </span>
                            <StatusBadge
                              tone={isReady ? "completed" : "neutral"}
                              label={isReady ? "Configured" : "Missing Keys"}
                              size="sm"
                            />
                          </div>
                          <p className="mt-1 text-xs text-[#737373]">{item.description}</p>
                          
                          {/* Feature tags */}
                          <div className="mt-2 flex flex-wrap gap-1.5">
                            {item.features.map((feat) => (
                              <span key={feat} className="rounded bg-[#F4EFE6] px-2 py-0.5 text-[10px] font-medium text-[#5C3A1E]">
                                {feat}
                              </span>
                            ))}
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => setOpenId(expanded ? null : item.id)}
                          className="self-start sm:self-center text-xs font-medium text-[#A98B57] hover:underline"
                        >
                          {expanded ? "Hide Details" : "View Keys & Setup"}
                        </button>
                      </div>

                      {expanded ? (
                        <div className="mt-4 space-y-4 rounded-xl border border-[#E5E1D8] bg-[#FAF9F5] p-4 text-xs">
                          {/* Where to get */}
                          <div>
                            <span className="font-semibold text-[#171717]">Credential Source:</span>
                            <p className="mt-1 text-[#5C3A1E] font-medium bg-white p-2.5 rounded-lg border border-[#E5E1D8]">
                              {item.whereToGet}
                            </p>
                          </div>

                          {/* Missing Keys list */}
                          {item.missingKeys.length > 0 ? (
                            <div>
                              <span className="font-semibold text-red-700">Missing Variables (Add to .env.local):</span>
                              <div className="mt-1.5 flex flex-wrap gap-1.5">
                                {item.missingKeys.map((k) => (
                                  <span key={k} className="rounded border border-red-200 bg-red-50/80 px-2 py-1 font-mono text-[11px] text-red-800">
                                    {k}=
                                  </span>
                                ))}
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 text-emerald-700 font-medium">
                              <ShieldCheck className="h-4 w-4" />
                              All required keys for this integration are present in the environment.
                            </div>
                          )}

                          {/* Present Keys list */}
                          {item.presentKeys.length > 0 ? (
                            <div>
                              <span className="font-semibold text-[#737373]">Configured Keys (Names Only):</span>
                              <div className="mt-1 flex flex-wrap gap-1.5">
                                {item.presentKeys.map((k) => (
                                  <span key={k} className="rounded border border-[#E5E1D8] bg-white px-2 py-0.5 font-mono text-[10px] text-[#737373]">
                                    {k} (Configured)
                                  </span>
                                ))}
                              </div>
                            </div>
                          ) : null}

                          {/* Manual Steps */}
                          {item.manualSteps.length > 0 ? (
                            <div>
                              <span className="font-semibold text-[#171717]">Step-by-Step Setup:</span>
                              <ol className="mt-1.5 list-inside list-decimal space-y-1 text-[#737373]">
                                {item.manualSteps.map((step, idx) => (
                                  <li key={idx}>{step}</li>
                                ))}
                              </ol>
                            </div>
                          ) : null}
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
