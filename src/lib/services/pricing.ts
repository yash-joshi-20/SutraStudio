/**
 * SUTRA STUDIO — Server Pricing Engine
 *
 * THE ONLY PLACE ORDER AND PLAN PRICES ARE COMPUTED.
 *
 * Rules:
 *  • Prices come from the `services` / `plans` collections when they exist,
 *    otherwise from the seed corpus in serviceCatalog.
 *  • A client-supplied amount is ALWAYS ignored. Nothing in a request body can
 *    set what a client pays.
 *  • Everything is validated and priced in integer paise-free rupees and then
 *    converted to paise only at the Razorpay boundary.
 */

import "server-only";
import { ServiceCatalogService, type CatalogService, type CatalogPlan } from "@/lib/services/serviceCatalog";

export interface PriceLine {
  label: string;
  qty: number;
  unitRupees: number;
  totalRupees: number;
}

export interface PriceQuote {
  serviceId: string;
  serviceName: string;
  currency: "INR";
  baseRupees: number;
  lines: PriceLine[];
  subtotalRupees: number;
  gstPercent: number;
  gstRupees: number;
  totalRupees: number;
  totalPaise: number;
  revisionsIncluded: number;
  extraRevisionRupees: number;
  estimatedDeliveryDays: number;
  /** Human-readable breakdown for the order summary UI. */
  breakdown: string[];
}

/** GST is only applied when the studio has enabled it (admin setting). */
export const DEFAULT_GST_PERCENT = 18;

export async function resolveService(serviceId: string): Promise<CatalogService | null> {
  const byId = await ServiceCatalogService.getServiceById(serviceId);
  if (byId) return byId;
  return null;
}

export async function resolvePlan(planId: string): Promise<CatalogPlan | null> {
  return ServiceCatalogService.getPlanById(planId);
}

/**
 * Quantity multipliers per media type. Multiplied into the base price so a
 * 10-image order costs more than a 1-image order.
 */
function quantityMultiplier(service: CatalogService, quantity: number): number {
  const base = Math.max(1, Math.floor(quantity));
  if (base <= 1) return 1;
  // 1 unit at full price, then each extra unit at 70% of base. Never free.
  return 1 + (base - 1) * 0.7;
}

export interface QuoteInput {
  serviceId: string;
  quantity?: number;
  formatCount?: number;
  revisions?: number;
  addVideo?: boolean;
  add3d?: boolean;
  add360?: boolean;
  priority?: "standard" | "rush";
  gstEnabled?: boolean;
  gstPercent?: number;
}

export async function quoteOrder(input: QuoteInput): Promise<PriceQuote | null> {
  const service = await resolveService(input.serviceId);
  if (!service) return null;

  const quantity = clampInt(input.quantity ?? 1, 1, 500);
  const formatCount = clampInt(input.formatCount ?? 1, 1, 12);
  const revisions = clampInt(input.revisions ?? 0, 0, 50);

  const lines: PriceLine[] = [];
  const breakdown: string[] = [];

  // Base
  const baseRupees = Math.round(service.startingPrice * quantityMultiplier(service, quantity));
  lines.push({ label: service.name, qty: quantity, unitRupees: service.startingPrice, totalRupees: baseRupees });
  breakdown.push(`${service.name} — ${quantity} × ₹${service.startingPrice.toLocaleString("en-IN")}`);

  // Extra output formats
  if (formatCount > 1) {
    const extraFormats = formatCount - 1;
    const perFormat = Math.round(service.startingPrice * 0.25);
    const total = extraFormats * perFormat;
    lines.push({ label: "Additional output formats", qty: extraFormats, unitRupees: perFormat, totalRupees: total });
    breakdown.push(`+ ${extraFormats} extra format${extraFormats > 1 ? "s" : ""} (1:1, 9:16, 16:9) — ₹${perFormat.toLocaleString("en-IN")} each`);
  }

  // Add-ons
  if (input.addVideo) {
    const add = 7999;
    lines.push({ label: "Video add-on", qty: 1, unitRupees: add, totalRupees: add });
    breakdown.push("+ Video add-on");
  }
  if (input.add3d) {
    const add = 14999;
    lines.push({ label: "3D modeling add-on", qty: 1, unitRupees: add, totalRupees: add });
    breakdown.push("+ 3D modeling add-on");
  }
  if (input.add360) {
    const add = 9999;
    lines.push({ label: "360° panorama add-on", qty: 1, unitRupees: add, totalRupees: add });
    breakdown.push("+ 360° panorama add-on");
  }

  // Extra revisions beyond the included allowance
  const extraRevisions = Math.max(0, revisions - service.revisionsIncluded);
  const perRevision = 1499;
  const revisionRupees = extraRevisions * perRevision;
  if (revisionRupees > 0) {
    lines.push({ label: "Additional revision rounds", qty: extraRevisions, unitRupees: perRevision, totalRupees: revisionRupees });
    breakdown.push(`+ ${extraRevisions} extra revision round${extraRevisions > 1 ? "s" : ""}`);
  }

  // Rush handling
  let rushRupees = 0;
  if (input.priority === "rush") {
    rushRupees = Math.round(baseRupees * 0.3);
    lines.push({ label: "Rush delivery (48h)", qty: 1, unitRupees: rushRupees, totalRupees: rushRupees });
    breakdown.push("+ Rush delivery surcharge (30%)");
  }

  const subtotalRupees = lines.reduce((sum, l) => sum + l.totalRupees, 0);

  const gstPercent = input.gstEnabled ? clampInt(input.gstPercent ?? DEFAULT_GST_PERCENT, 0, 28) : 0;
  const gstRupees = Math.round((subtotalRupees * gstPercent) / 100);
  const totalRupees = subtotalRupees + gstRupees;

  return {
    serviceId: service.id,
    serviceName: service.name,
    currency: "INR",
    baseRupees,
    lines,
    subtotalRupees,
    gstPercent,
    gstRupees,
    totalRupees,
    totalPaise: totalRupees * 100,
    revisionsIncluded: service.revisionsIncluded,
    extraRevisionRupees: perRevision,
    estimatedDeliveryDays: service.estimatedDeliveryDays,
    breakdown,
  };
}

/** Plan pricing, also server-side only. */
export async function quotePlan(planId: string, billing: "monthly" | "quarterly" | "annual") {
  const plan = await resolvePlan(planId);
  if (!plan) return null;
  const rupees =
    billing === "annual" ? plan.annualPrice : billing === "quarterly" ? plan.quarterlyPrice : plan.monthlyPrice;
  return {
    planId: plan.id,
    planName: plan.name,
    billing,
    totalRupees: rupees,
    totalPaise: rupees * 100,
    freeTrialDays: plan.freeTrialDays,
    includedServices: plan.includedServices,
  };
}

function clampInt(value: unknown, min: number, max: number): number {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) return min;
  return Math.max(min, Math.min(max, Math.floor(n)));
}