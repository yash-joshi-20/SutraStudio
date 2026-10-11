/**
 * SUTRA STUDIO — Central Pricing Configuration & Single Source of Truth
 *
 * All public, client, and admin interfaces MUST import pricing from this configuration.
 * Aligns with the 12 services and unified package tiers.
 */

import {
  COMMISSION_PACKAGES,
  RETAINER_PACKAGES,
  type CommissionPackage,
  type RetainerPackage,
} from "@/config/packages";

export type ProjectTier = CommissionPackage;
export type MonthlyRetainerTier = RetainerPackage;

/**
 * 1. Per-Project Commissions (One-time project deliveries)
 */
export const PER_PROJECT_TIERS: ProjectTier[] = COMMISSION_PACKAGES;

/**
 * 2. Subscription Retainer Plans (Daily active queue: 1 image + 1 video per day)
 */
export const MONTHLY_RETAINER_TIERS: MonthlyRetainerTier[] = RETAINER_PACKAGES;

/**
 * Official Studio Payment Configuration (GPay wording; no payment link shown yet)
 */
export const STUDIO_PAYMENT_CONFIG = {
  methodLabel: "Google Pay (GPay)",
  paymentInstructions:
    "Payments are settled securely via Google Pay (GPay) upon project scope review. Payment details are provided directly by your project manager.",
  merchantName: "Sutra Studio",
  payeeName: "Yash Joshi",
  verifiedAccountLabel: "Yash Joshi (Verified Sutra Studio Account)",
  vpa: "yashjoshi7355-1@okicici",
  whatsappNumber: "918200192781",
  currency: "INR",
  showPaymentLink: false,
};

/**
 * Helper to retrieve tier by unique ID
 */
export function getPricingTier(tierId: string): ProjectTier | MonthlyRetainerTier | undefined {
  const projectTier = PER_PROJECT_TIERS.find((t) => t.id === tierId);
  if (projectTier) return projectTier;
  return MONTHLY_RETAINER_TIERS.find((t) => t.id === tierId);
}

/**
 * Format raw INR number to standard Indian Rupee notation (e.g. ₹4,999)
 */
export function formatCurrencyINR(amount: number | "custom"): string {
  if (amount === "custom") return "Custom Quote";
  return `₹${amount.toLocaleString("en-IN")}`;
}
