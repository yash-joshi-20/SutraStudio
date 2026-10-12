/**
 * SUTRA STUDIO — Central Pricing Configuration & Single Source of Truth
 *
 * All public, client, and admin interfaces MUST import pricing from this configuration.
 * Strictly adheres to the approved Sutra Studios service catalog and pricing baseline:
 * - Ceiling: Every listed price is at or below ₹20,000.
 * - Single canonical catalog source.
 * - Shared Indian Rupee currency formatter.
 * - Safe pack price computation preventing double multiplication.
 */

import {
  COMMISSION_PACKAGES,
  RETAINER_PACKAGES,
  APPROVED_STANDALONE_PACKAGES,
  findPackageById,
  type CommissionPackage,
  type RetainerPackage,
  type StandaloneDeliverablePackage,
} from "@/config/packages";
import {
  CANONICAL_SERVICES,
  formatCurrencyINR,
  computeItemTotal,
  findServiceById,
  type CanonicalServiceItem,
} from "@/config/services";

export type ProjectTier = CommissionPackage;
export type MonthlyRetainerTier = RetainerPackage;

/**
 * 1. Per-Project Commissions (One-time project deliveries)
 */
export const PER_PROJECT_TIERS: ProjectTier[] = COMMISSION_PACKAGES;

/**
 * 2. Subscription Retainer Plans (30-day continuous creative pipeline)
 */
export const MONTHLY_RETAINER_TIERS: MonthlyRetainerTier[] = RETAINER_PACKAGES;

/**
 * 3. All Approved Standalone Deliverable Packs
 */
export const STANDALONE_PACKS: StandaloneDeliverablePackage[] = APPROVED_STANDALONE_PACKAGES;

/**
 * Official Studio Payment Configuration (UPI QR & GPay zero-commission settlement)
 */
export const STUDIO_PAYMENT_CONFIG = {
  methodLabel: "Google Pay (GPay) / UPI QR",
  paymentInstructions:
    "Payments are settled securely via UPI QR or Google Pay upon project scope review. Upload your 12–16 digit bank UTR number to initiate instant production staging.",
  merchantName: "Sutra Studio",
  payeeName: "Yash Joshi",
  verifiedAccountLabel: "Yash Joshi (Verified Sutra Studio Account)",
  vpa: "yashjoshi7355-1@okicici",
  whatsappNumber: "918200192781",
  currency: "INR",
  showPaymentLink: false,
};

/**
 * Helper to retrieve tier or package by unique ID or slug
 */
export function getPricingTier(
  tierId: string
): ProjectTier | MonthlyRetainerTier | StandaloneDeliverablePackage | CanonicalServiceItem | undefined {
  if (!tierId) return undefined;
  const pkg = findPackageById(tierId);
  if (pkg) return pkg;
  return findServiceById(tierId);
}

/**
 * Re-export shared currency formatter & pack calculator
 */
export { formatCurrencyINR, computeItemTotal };

/**
 * Maximum approved price ceiling in INR
 */
export const MAX_CATALOG_PRICE_INR = 20000;

/**
 * Validate a catalog price against business rules or against canonical catalog entry
 */
export function validateCatalogPrice(
  priceOrId: number | string,
  priceToCheck?: number
): { valid: boolean; error?: string; expectedPrice?: number } {
  if (typeof priceOrId === "string") {
    const item = getPricingTier(priceOrId);
    if (!item) {
      return { valid: false, error: `Catalog item '${priceOrId}' not found in canonical registry` };
    }
    const expected = item.numericPrice;
    if (typeof priceToCheck !== "number" || isNaN(priceToCheck)) {
      return { valid: false, error: "Price to check must be a valid number", expectedPrice: expected };
    }
    if (priceToCheck !== expected) {
      return {
        valid: false,
        error: `Price mismatch for '${priceOrId}': expected ₹${expected}, received ₹${priceToCheck}`,
        expectedPrice: expected,
      };
    }
    if (priceToCheck > MAX_CATALOG_PRICE_INR) {
      return {
        valid: false,
        error: `Price ₹${priceToCheck} exceeds maximum studio price ceiling of ₹${MAX_CATALOG_PRICE_INR}`,
        expectedPrice: expected,
      };
    }
    return { valid: true, expectedPrice: expected };
  }

  const price = priceOrId;
  if (typeof price !== "number" || isNaN(price)) {
    return { valid: false, error: "Price must be a valid number" };
  }
  if (price < 0) {
    return { valid: false, error: "Price cannot be negative" };
  }
  if (price > MAX_CATALOG_PRICE_INR) {
    return {
      valid: false,
      error: `Price ₹${price} exceeds maximum studio price ceiling of ₹${MAX_CATALOG_PRICE_INR}`,
    };
  }
  return { valid: true, expectedPrice: price };
}

