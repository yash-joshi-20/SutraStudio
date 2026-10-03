/**
 * Admin → Integrations
 *
 * A read-only honesty panel. For every third-party service it shows whether the
 * server holds the keys it needs and, when it does not, exactly WHICH key names
 * are missing plus the manual steps to obtain them.
 *
 * Secret values are never rendered here and never leave the server.
 */

"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ShieldCheck, TriangleAlert, RefreshCw } from "lucide-react";
import { json, errorMessage } from "@/lib/api/client";
import { StatusBadge, StatTile, type StatusTone } from "@/components/ui/Status";
import { ErrorState, LoadingState } from "@/components/ui/States";

interface IntegrationStatus {
  id: string;
  name: string;
  group: string;
  description: string;
  state: "configured" | "not configured";
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
  summary: { total: number; configured: number; missing: number; criticalMissing: string[] };
  integrations: IntegrationStatus[];
  counts: Counts;
  countsAvailable: boolean;
}

const GROUP_LABELS: Record<string, string> = {
  core: "Core Platform",
  auth: "Authentication",
  payments: "Payments",
  storage: "Media & Storage",
  ai: "AI Providers",
  automation: "Automation",
  messaging: "Messaging & Push",
  social: "Social Publishing",
  analytics: "Analytics",
};

const configuredTone: StatusTone = "completed";
const missingTone: StatusTone = "neutral";

export default function AdminIntegrationsPage() {
  const [data, setData] = useState<Payload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);

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

  useEffect(() => {
    void load();
  }, [load]);

  const grouped = useMemo(() => {
    const map = new Map<string, IntegrationStatus[]>();
    for (const item of data?.integrations ?? []) {
      const list = map.get(item.group) ?? [];
      list.push(item);
      map.set(item.group, list);
    }
    return [...map.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  }, [data]);

  if (loading) return <LoadingState label="Checking integration keys…" rows={4} />;
  if (error) return <ErrorState message={error} onRetry={() => void load()} />;
  if (!data) return <ErrorState message="Integration status is unavailable." onRetry={() => void load()} />;

  const critical = data.summary.criticalMissing;

  return (
    <div className="mx-auto max-w-5xl space-y-5 px-4 py-6 sm:px-6 lg:px-8">
      <header>
        <h1 className="text-2xl font-semibold text-[#0F172A]">Integrations</h1>
        <p className="mt-1 max-w-2xl text-sm text-[#64748B]">
          Live configuration state for every service Sutra Studio depends on. Nothing on this page
          calls a provider or reveals a secret value.
        </p>
      </header>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile label="Configured" value={`${data.summary.configured}/${data.summary.total}`} tone="good" />
        <StatTile label="Not configured" value={data.summary.missing} tone={data.summary.missing ? "warn" : "good"} />
        <StatTile
          label="Critical gaps"
          value={critical.length}
          tone={critical.length ? "bad" : "good"}
          hint={critical.length ? critical.join(", ") : "Accounts, orders and payments are ready."}
        />
        <StatTile
          label="Firestore records"
          value={data.countsAvailable ? (data.counts.orders ?? 0) : "—"}
          tone="neutral"
          hint={data.countsAvailable ? "Orders in the live database" : "Database unreachable"}
        />
      </div>

      {critical.length > 0 ? (
        <div
          role="status"
          className="rounded-2xl border border-[#FDE68A] bg-[#FFFBEB] p-4"
        >
          <div className="flex gap-3">
            <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0 text-[#B45309]" aria-hidden="true" />
            <div className="text-sm text-[#0F172A]">
              <p className="font-semibold">
                {critical.join(", ")} must be configured before the site goes live.
              </p>
              <p className="mt-1 text-[#92400E]">
                Until they are set, the affected endpoints return{" "}
                <code className="rounded bg-white px-1 py-0.5 text-xs">503 not configured</code> rather
                than silently failing or inventing a result.
              </p>
            </div>
          </div>
        </div>
      ) : null}

      {grouped.map(([group, items]) => {
        const ready = items.filter((i) => i.state === "configured").length;
        return (
          <section key={group} className="overflow-hidden rounded-2xl border border-[#EADFCB] bg-[#FFFFFF]">
            <div className="flex items-center justify-between gap-3 border-b border-[#EADFCB] bg-[#FAF9F5] px-4 py-3">
              <h2 className="text-sm font-semibold text-[#0F172A]">
                {GROUP_LABELS[group] ?? group}
              </h2>
              <span className="text-xs tabular-nums text-[#64748B]">
                {ready} of {items.length} ready
              </span>
            </div>

            <ul className="divide-y divide-[#F4EFE6]">
              {items.map((item) => {
                const expanded = openId === item.id;
                const isReady = item.state === "configured";
                return (
                  <li key={item.id} className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => setOpenId(expanded ? null : item.id)}
                      aria-expanded={expanded}
                      className="w-full rounded-lg text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4A35A] focus-visible:ring-offset-2"
                    >
                      <span className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-medium text-[#0F172A]">{item.name}</span>
                        <StatusBadge
                          tone={isReady ? configuredTone : missingTone}
                          label={item.state}
                          size="sm"
                        />
                      </span>
                      <span className="mt-1 block text-sm text-[#64748B]">{item.description}</span>
                    </button>

                    {expanded ? (
                      <div className="mt-3 space-y-3 rounded-xl border border-[#EADFCB] bg-[#FAF9F5] p-4">
                        {item.missingKeys.length > 0 ? (
                          <div>
                            <p className="text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">
                              Add these keys to <code>.env.local</code>
                            </p>
                            <ul className="mt-2 flex flex-wrap gap-1.5">
                              {item.missingKeys.map((key) => (
                                <li
                                  key={key}
                                  className="break-anywhere rounded-md border border-[#EADFCB] bg-white px-2 py-1 font-mono text-[11px] text-[#5C3A1E]"
                                >
                                  {key}
                                </li>
                              ))}
                            </ul>
                          </div>
                        ) : (
                          <p className="flex items-center gap-2 text-sm text-[#2E7D4F]">
                            <ShieldCheck className="h-4 w-4 shrink-0" aria-hidden="true" />
                            All required keys are present.
                          </p>
                        )}

                        {item.manualSteps.length > 0 ? (
                          <div>
                            <p className="text-[11px] font-semibold uppercase tracking-wider text-[#64748B]">
                              Manual steps
                            </p>
                            <ol className="mt-2 list-inside list-decimal space-y-1 text-sm text-[#64748B]">
                              {item.manualSteps.map((step) => (
                                <li key={step}>{step}</li>
                              ))}
                            </ol>
                          </div>
                        ) : null}
                      </div>
                    ) : null}
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}

      <section className="overflow-hidden rounded-2xl border border-[#EADFCB] bg-[#FFFFFF]">
        <div className="border-b border-[#EADFCB] bg-[#FAF9F5] px-4 py-3">
          <h2 className="text-sm font-semibold text-[#0F172A]">Live record counts</h2>
          <p className="mt-0.5 text-xs text-[#64748B]">
            {data.countsAvailable
              ? "Read directly from Firestore."
              : "Firestore is unreachable, so these counts are unavailable rather than guessed."}
          </p>
        </div>
        <dl className="grid grid-cols-2 gap-4 p-4 sm:grid-cols-4">
          {(["orders", "users", "payments", "notifications"] as const).map((key) => (
            <div key={key}>
              <dt className="text-[11px] uppercase tracking-wider text-[#64748B]">{key}</dt>
              <dd className="mt-1 text-xl font-semibold tabular-nums text-[#0F172A]">
                {data.countsAvailable && typeof data.counts[key] === "number" ? data.counts[key] : "—"}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <button
        type="button"
        onClick={() => void load()}
        className="inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-[#EADFCB] bg-white px-4 text-sm font-semibold text-[#5C3A1E] transition-colors hover:bg-[#FAF9F5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#D4A35A] focus-visible:ring-offset-2"
      >
        <RefreshCw className="h-4 w-4" aria-hidden="true" />
        Re-check configuration
      </button>
    </div>
  );
}
