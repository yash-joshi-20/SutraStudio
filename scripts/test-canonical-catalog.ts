#!/usr/bin/env tsx

/**
 * ==============================================================================
 * SUTRA STUDIO — CANONICAL SERVICE CATALOG & PRICING VERIFICATION SUITE
 * ==============================================================================
 * Validates:
 * 1. All standalone services and packages match approved client specs
 * 2. All IDs and slugs are unique across the canonical catalog
 * 3. Strict ₹20,000 ceiling on all listed prices
 * 4. Monthly retainers have 30-day duration and recurring billing
 * 5. Pack prices are NOT double-multiplied by item quantity in computeItemTotal
 * 6. Shared INR currency formatter (formatCurrencyINR) works correctly
 * 7. AI Automation is marked inactive (internal-only)
 * 8. Legacy aliases resolve correctly
 * ==============================================================================
 */

import {
  CANONICAL_SERVICES,
  SUTRA_SERVICES_CONFIG,
  findServiceById,
  findServiceBySlug,
  formatCurrencyINR,
  computeItemTotal,
} from "../src/config/services";

import {
  APPROVED_MONTHLY_PACKAGES,
  APPROVED_STANDALONE_PACKAGES,
  findPackageById,
  resolvePackageById,
} from "../src/config/packages";

import {
  validateCatalogPrice,
} from "../src/config/pricing";

let passed = 0;
let failed = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  if (condition) {
    console.log(`  ✓ PASS: ${testName}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${testName}${detail ? ` -> ${detail}` : ""}`);
    failed++;
  }
}

console.log("\n========================================================");
console.log("   SUTRA STUDIO: CANONICAL CATALOG VALIDATION SUITE");
console.log("========================================================\n");

// ------------------------------------------------------------------------------
// CHECK 1: Monthly Packages Verification
// ------------------------------------------------------------------------------
console.log("--> 1. Validating Approved Monthly Packages...");
assert(APPROVED_MONTHLY_PACKAGES.length === 3, "Exactly 3 approved monthly packages");

const starterPlan = APPROVED_MONTHLY_PACKAGES.find((p) => p.id === "starter-trend");
assert(!!starterPlan, "Starter Trend package exists (starter-trend)");
assert(starterPlan?.numericPrice === 9999, "Starter Trend is exactly ₹9,999", `got ${starterPlan?.numericPrice}`);
assert(starterPlan?.duration === "30 days", "Starter Trend duration is 30 days");
assert(starterPlan?.billingCycle === "monthly", "Starter Trend is monthly billing");

const growthPlan = APPROVED_MONTHLY_PACKAGES.find((p) => p.id === "growth-trend");
assert(!!growthPlan, "Growth Trend package exists (growth-trend)");
assert(growthPlan?.numericPrice === 14999, "Growth Trend is exactly ₹14,999", `got ${growthPlan?.numericPrice}`);
assert(growthPlan?.duration === "30 days", "Growth Trend duration is 30 days");
assert(growthPlan?.billingCycle === "monthly", "Growth Trend is monthly billing");

const dailyPlan = APPROVED_MONTHLY_PACKAGES.find((p) => p.id === "daily-trend-creator");
assert(!!dailyPlan, "Daily Trend Creator flagship package exists (daily-trend-creator)");
assert(dailyPlan?.numericPrice === 19999, "Daily Trend Creator is exactly ₹19,999", `got ${dailyPlan?.numericPrice}`);
assert(dailyPlan?.duration === "30 days", "Daily Trend Creator duration is 30 days");
assert(dailyPlan?.popular === true, "Daily Trend Creator is flagged as popular / flagship");

// ------------------------------------------------------------------------------
// CHECK 2: Standalone Image Services Pricing & Deliverables
// ------------------------------------------------------------------------------
console.log("\n--> 2. Validating Standalone Image Services...");
const expectedImageServices: Record<string, number> = {
  "img-basic-template": 299,
  "img-branded-social": 199,
  "img-ai-product": 299,
  "img-banner-cover": 299,
  "img-carousel-5s": 499,
  "copy-caption-hashtags": 299,
  "img-product-cleanup": 199,
};

for (const [id, expectedPrice] of Object.entries(expectedImageServices)) {
  const item = CANONICAL_SERVICES.find((s) => s.id === id);
  assert(!!item, `Service ${id} exists in catalog`);
  assert(item?.numericPrice === expectedPrice, `${id} price is exactly ₹${expectedPrice}`, `got ${item?.numericPrice}`);
  assert(item?.active === true, `${id} is active`);
}

// ------------------------------------------------------------------------------
// CHECK 3: Standalone Video Services Pricing & Deliverables
// ------------------------------------------------------------------------------
console.log("\n--> 3. Validating Standalone Video Services...");
const expectedVideoServices: Record<string, number> = {
  "vid-template-10s": 199,
  "vid-promo-reel-30s": 499,
  "vid-ai-product-reel": 799,
};

for (const [id, expectedPrice] of Object.entries(expectedVideoServices)) {
  const item = CANONICAL_SERVICES.find((s) => s.id === id);
  assert(!!item, `Video service ${id} exists in catalog`);
  assert(item?.numericPrice === expectedPrice, `${id} price is exactly ₹${expectedPrice}`, `got ${item?.numericPrice}`);
}

// ------------------------------------------------------------------------------
// CHECK 4: Approved Standalone Packs
// ------------------------------------------------------------------------------
console.log("\n--> 4. Validating Approved Standalone Packs...");
const expectedPacks: Record<string, number> = {
  "basic-image-pack-3": 249,
  "branded-image-pack-3": 499,
  "branded-image-pack-5": 799,
  "branded-image-pack-10": 1499,
  "basic-video-pack-3": 499,
  "promotional-reels-pack-3": 1299,
  "promotional-reels-pack-5": 1999,
  "promotional-reels-pack-10": 3499,
  "social-carousel-5-slides": 499,
};

for (const [id, expectedPrice] of Object.entries(expectedPacks)) {
  const pack = APPROVED_STANDALONE_PACKAGES.find((p) => p.id === id);
  assert(!!pack, `Standalone pack ${id} exists`);
  assert(pack?.numericPrice === expectedPrice, `${id} price is ₹${expectedPrice}`, `got ${pack?.numericPrice}`);
  assert(pack?.pricingType === "pack", `${id} pricingType is 'pack'`);
}

// ------------------------------------------------------------------------------
// CHECK 5: Pack Multiplier Integrity (No Double Counting)
// ------------------------------------------------------------------------------
console.log("\n--> 5. Validating Pack Multiplier Integrity (computeItemTotal)...");
const pack3BasicImg = APPROVED_STANDALONE_PACKAGES.find((p) => p.id === "basic-image-pack-3")!;
// 1 pack of 3 basic images (₹249) must cost ₹249, NOT 3 * ₹249 = ₹747!
const total1Pack = computeItemTotal(pack3BasicImg, 1);
assert(total1Pack === 249, "1 pack of 3 basic images total is ₹249 (not 3x)", `got ${total1Pack}`);

// 2 packs of 3 basic images must cost 2 * ₹249 = ₹498
const total2Packs = computeItemTotal(pack3BasicImg, 2);
assert(total2Packs === 498, "2 packs of 3 basic images total is ₹498", `got ${total2Packs}`);

// Per unit item calculation check
const singleItem = CANONICAL_SERVICES.find((s) => s.id === "img-basic-template")!;
const total3Single = computeItemTotal(singleItem, 3);
assert(total3Single === 897, "3 single basic template images total is 3 * 299 = ₹897", `got ${total3Single}`);

// ------------------------------------------------------------------------------
// CHECK 6: Other Specialized Services Pricing
// ------------------------------------------------------------------------------
console.log("\n--> 6. Validating Other Services & Disciplinary Pricing...");
const otherExpectedServices: Record<string, number> = {
  "mkt-content-calendar-30d": 999,
  "mkt-trending-research": 1499,
  "des-brand-identity-starter": 2999,
  "3d-render-existing": 999,
  "3d-simple-model": 2999,
  "3d-animation-10s": 4999,
  "tour-360-digital-only": 2999,
  "tour-360-local-capture": 7999,
  "arch-interior-viz-view": 1499,
  "arch-single-room-starter": 4999,
  "arch-3d-floorplan": 1499,
  "arch-facade-render-view": 1999,
  "mkt-smm-monthly": 9999,
  "mkt-meta-ads-mgmt": 4999,
  "mkt-seo-starter": 4999,
  "dev-landing-page-starter": 4999,
  "dev-business-website": 14999,
  "dev-starter-ecommerce": 19999,
  "dev-webapp-prototype": 19999,
  "dev-mobile-app-prototype": 9999,
};

for (const [id, expectedPrice] of Object.entries(otherExpectedServices)) {
  const item = CANONICAL_SERVICES.find((s) => s.id === id);
  assert(!!item, `Specialized service ${id} exists in catalog`);
  assert(item?.numericPrice === expectedPrice, `${id} price is exactly ₹${expectedPrice}`, `got ${item?.numericPrice}`);
}

// ------------------------------------------------------------------------------
// CHECK 7: AI Automation is Internal-Only (active: false)
// ------------------------------------------------------------------------------
console.log("\n--> 7. Validating Internal AI Automation Isolation...");
const aiAutomation = SUTRA_SERVICES_CONFIG.find((s) => s.id === "workflow-automation");
assert(!!aiAutomation, "workflow-automation discipline exists in config");
assert(aiAutomation?.active === false, "workflow-automation is marked active: false (hidden from public catalog)");

// ------------------------------------------------------------------------------
// CHECK 8: Unique IDs and Unique Slugs
// ------------------------------------------------------------------------------
console.log("\n--> 8. Validating ID & Slug Uniqueness across all catalog entries...");
const allIds = new Set<string>();
const allSlugs = new Set<string>();
let duplicateIdFound = false;
let duplicateSlugFound = false;

for (const s of CANONICAL_SERVICES) {
  if (allIds.has(s.id)) {
    duplicateIdFound = true;
    console.error(`Duplicate service ID: ${s.id}`);
  }
  allIds.add(s.id);

  if (allSlugs.has(s.slug)) {
    duplicateSlugFound = true;
    console.error(`Duplicate service Slug: ${s.slug}`);
  }
  allSlugs.add(s.slug);
}

for (const p of APPROVED_MONTHLY_PACKAGES) {
  if (allIds.has(p.id)) {
    duplicateIdFound = true;
    console.error(`Duplicate package ID: ${p.id}`);
  }
  allIds.add(p.id);

  if (allSlugs.has(p.slug)) {
    duplicateSlugFound = true;
    console.error(`Duplicate package Slug: ${p.slug}`);
  }
  allSlugs.add(p.slug);
}

assert(!duplicateIdFound, "All service & package IDs are strictly unique");
assert(!duplicateSlugFound, "All service & package slugs are strictly unique");

// ------------------------------------------------------------------------------
// CHECK 9: Strict ₹20,000 Ceiling Rule
// ------------------------------------------------------------------------------
console.log("\n--> 9. Validating Strict ₹20,000 Price Ceiling across ALL items...");
let exceededCeiling = false;

for (const s of CANONICAL_SERVICES) {
  if (s.numericPrice > 20000) {
    exceededCeiling = true;
    console.error(`Service ${s.id} exceeds ₹20,000 limit with price ₹${s.numericPrice}`);
  }
}

for (const p of APPROVED_MONTHLY_PACKAGES) {
  if (p.numericPrice > 20000) {
    exceededCeiling = true;
    console.error(`Package ${p.id} exceeds ₹20,000 limit with price ₹${p.numericPrice}`);
  }
}

for (const p of APPROVED_STANDALONE_PACKAGES) {
  if (p.numericPrice > 20000) {
    exceededCeiling = true;
    console.error(`Standalone pack ${p.id} exceeds ₹20,000 limit with price ₹${p.numericPrice}`);
  }
}

assert(!exceededCeiling, "Zero items exceed the ₹20,000 strict price ceiling");

// ------------------------------------------------------------------------------
// CHECK 10: Shared INR Currency Formatter
// ------------------------------------------------------------------------------
console.log("\n--> 10. Validating Shared INR Currency Formatter (formatCurrencyINR)...");
assert(formatCurrencyINR(99) === "₹99", "formatCurrencyINR(99) returns ₹99", `got ${formatCurrencyINR(99)}`);
assert(formatCurrencyINR(9999) === "₹9,999", "formatCurrencyINR(9999) returns ₹9,999", `got ${formatCurrencyINR(9999)}`);
assert(formatCurrencyINR(19999) === "₹19,999", "formatCurrencyINR(19999) returns ₹19,999", `got ${formatCurrencyINR(19999)}`);
assert(formatCurrencyINR(0) === "₹0", "formatCurrencyINR(0) returns ₹0", `got ${formatCurrencyINR(0)}`);

// ------------------------------------------------------------------------------
// CHECK 11: Price Validation Guard Helper
// ------------------------------------------------------------------------------
console.log("\n--> 11. Validating Catalog Price Validator (validateCatalogPrice)...");
const validCheck = validateCatalogPrice("daily-trend-creator", 19999);
assert(validCheck.valid === true, "validateCatalogPrice passes for exact price ₹19,999");

const tamperedCheck = validateCatalogPrice("daily-trend-creator", 100);
assert(tamperedCheck.valid === false, "validateCatalogPrice rejects tampered price (₹100 instead of ₹19,999)");
assert(tamperedCheck.expectedPrice === 19999, "validateCatalogPrice reports expected price ₹19,999");

// ------------------------------------------------------------------------------
// CHECK 12: Legacy Alias Resolution
// ------------------------------------------------------------------------------
console.log("\n--> 12. Validating Legacy Alias Resolution...");
const resolvedStarter = resolvePackageById("starter");
assert(resolvedStarter?.id === "starter-trend", "Legacy 'starter' resolves to 'starter-trend'");

const resolvedScale = resolvePackageById("scale");
assert(resolvedScale?.id === "daily-trend-creator", "Legacy 'scale' resolves to 'daily-trend-creator'");

const resolvedBySlug = findServiceBySlug("visuals-and-motion");
assert(resolvedBySlug?.id === "img-creation", "Legacy slug 'visuals-and-motion' resolves to 'img-creation'");

// ------------------------------------------------------------------------------
// SUMMARY
// ------------------------------------------------------------------------------
console.log("\n========================================================");
console.log(`TOTAL TESTS: ${passed + failed}`);
console.log(`PASSED: ${passed}`);
console.log(`FAILED: ${failed}`);
console.log("========================================================\n");

if (failed > 0) {
  process.exit(1);
} else {
  console.log("ALL CANONICAL CATALOG TESTS PASSED CLEANLY!\n");
  process.exit(0);
}
