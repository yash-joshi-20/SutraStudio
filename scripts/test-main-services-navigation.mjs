/**
 * Verification Test: Unified Main Services Configuration & Navigation (STEP 2)
 * Run with: node scripts/test-main-services-navigation.mjs (uses tsx via import)
 *
 * Validates that the eight main services:
 *  1. Are defined exactly once in src/config/mainServices.ts
 *  2. Resolve to existing, active canonical catalog entries (detail routes)
 *  3. Are covered by the /services/[slug] generateStaticParams source configs
 *  4. Contain no pricing fields in the shared configuration
 *  5. Are consumed by the Home page, Services page, Footer and Chat widget
 */

import assert from "assert";
import path from "path";
import fs from "fs";
import { pathToFileURL } from "url";

console.log("\n========================================================");
console.log("   UNIFIED MAIN SERVICES — NAVIGATION & USAGE VERIFICATION");
console.log("========================================================\n");

let passed = 0;
let total = 0;

function check(desc, fn) {
  total++;
  try {
    fn();
    console.log(`  [PASS] ${desc}`);
    passed++;
  } catch (err) {
    console.error(`  [FAIL] ${desc}`);
    console.error(`    ${err.message}`);
  }
}

const ROOT = process.cwd();

// Dynamic import of the unified config (TypeScript, resolved via tsx runner)
const mainServicesUrl = pathToFileURL(
  path.join(ROOT, "src", "config", "mainServices.ts")
).href;
const servicesUrl = pathToFileURL(
  path.join(ROOT, "src", "config", "services.ts")
).href;

const { MAIN_SERVICES, getMainServices, getMainServiceCategories } =
  await import(mainServicesUrl);
const { findServiceBySlug, SUTRA_SERVICES_CONFIG, CANONICAL_SERVICES } =
  await import(servicesUrl);

console.log("--> 1. Unified configuration integrity...");

check("Exactly 8 main services are defined", () => {
  assert.strictEqual(MAIN_SERVICES.length, 8, `got ${MAIN_SERVICES.length}`);
});

check("All main service ids and slugs are unique", () => {
  const ids = new Set(MAIN_SERVICES.map((s) => s.id));
  const slugs = new Set(MAIN_SERVICES.map((s) => s.slug));
  assert.strictEqual(ids.size, 8, "duplicate ids detected");
  assert.strictEqual(slugs.size, 8, "duplicate slugs detected");
});

check("Every entry has title, shortDescription, description and examples", () => {
  for (const svc of MAIN_SERVICES) {
    assert(svc.title && svc.title.length > 2, `${svc.id} needs a title`);
    assert(
      svc.shortDescription && svc.shortDescription.length > 10,
      `${svc.id} needs a shortDescription`
    );
    assert(
      svc.description && svc.description.length > 20,
      `${svc.id} needs a description`
    );
    assert(
      Array.isArray(svc.examples) && svc.examples.length >= 3,
      `${svc.id} needs at least 3 examples`
    );
  }
});

check("Configuration contains no pricing fields or rupee amounts", () => {
  const serialized = JSON.stringify(MAIN_SERVICES);
  assert(!serialized.includes("₹"), "must not contain ₹ amounts");
  for (const key of [
    "price",
    "numericPrice",
    "startingPrice",
    "priceDisplay",
    "formattedPrice",
    "monthlyPrice",
  ]) {
    for (const svc of MAIN_SERVICES) {
      assert(!(key in svc), `${svc.id} must not define "${key}"`);
    }
  }
});

console.log("\n--> 2. Detail-route resolution for all eight services...");

for (const svc of MAIN_SERVICES) {
  check(`Detail route exists: /services/${svc.slug} (${svc.title})`, () => {
    const catalogItem = findServiceBySlug(svc.slug);
    assert(catalogItem, `slug "${svc.slug}" must resolve in the catalog`);
    assert.notStrictEqual(
      catalogItem.active,
      false,
      `slug "${svc.slug}" must be active`
    );
    const inStaticParams =
      SUTRA_SERVICES_CONFIG.some((s) => s.slug === svc.slug) ||
      CANONICAL_SERVICES.some((s) => s.slug === svc.slug);
    assert(
      inStaticParams,
      `slug "${svc.slug}" must be part of generateStaticParams source configs`
    );
  });
}

check("getMainServices() enriches every service with catalog data", () => {
  for (const svc of getMainServices()) {
    assert.strictEqual(
      svc.detailHref,
      `/services/${svc.slug}`,
      `${svc.id} detailHref mismatch`
    );
    assert(svc.category, `${svc.id} missing category`);
    assert(svc.thumbnail, `${svc.id} missing thumbnail`);
    assert(
      Array.isArray(svc.deliverables) && svc.deliverables.length > 0,
      `${svc.id} missing deliverables`
    );
  }
});

check("getMainServiceCategories() returns non-empty categories", () => {
  const categories = getMainServiceCategories();
  assert(categories.length >= 3, `got ${categories.length} categories`);
});

console.log("\n--> 3. Shared configuration is consumed across the UI...");

const homeContent = fs.readFileSync(
  path.join(ROOT, "src", "app", "HomeClient.tsx"),
  "utf8"
);
const servicesPageContent = fs.readFileSync(
  path.join(ROOT, "src", "app", "(public)", "services", "page.tsx"),
  "utf8"
);
const footerContent = fs.readFileSync(
  path.join(ROOT, "src", "components", "layout", "Footer.tsx"),
  "utf8"
);
const chatContent = fs.readFileSync(
  path.join(ROOT, "src", "components", "chat", "FloatingChatModal.tsx"),
  "utf8"
);
const cardContent = fs.readFileSync(
  path.join(ROOT, "src", "components", "services", "MainServiceCard.tsx"),
  "utf8"
);

check("Home page renders main services from the shared configuration", () => {
  assert(homeContent.includes("getMainServices"), "HomeClient must use getMainServices");
  assert(homeContent.includes("MAIN_SERVICES"), "HomeClient must derive hero from MAIN_SERVICES");
  assert(!homeContent.includes("₹"), "HomeClient must not display prices");
});

check("Home service cards carry a View Service action (no price display)", () => {
  assert(cardContent.includes("View Service"), "card must show View Service CTA");
  assert(!cardContent.includes("₹"), "card must not display prices");
  assert(!cardContent.toLowerCase().includes("starting from"), "card must not show starting prices");
});

check("Services page renders the eight main services price-free", () => {
  assert(servicesPageContent.includes("getMainServices"), "must use shared configuration");
  assert(!servicesPageContent.includes("₹"), "services page must not display prices");
  assert(!servicesPageContent.includes("getPriceBadge"), "must not render price badges");
  assert(!servicesPageContent.includes("formatCurrencyINR"), "must not format currency");
});

check("Services page links to Packages & Pricing without amounts", () => {
  assert(servicesPageContent.includes('href="/packages"'), "must link to /packages");
  assert(servicesPageContent.includes('href="/pricing"'), "must link to /pricing");
});

check("Footer service links derive from the shared configuration", () => {
  assert(footerContent.includes("getMainServices"), "Footer must use getMainServices");
  assert(!footerContent.includes("/services#"), "Footer must link to real detail routes");
});

check("Chat concierge lists the eight services price-free", () => {
  assert(chatContent.includes("MAIN_SERVICES"), "chat must import MAIN_SERVICES");
  assert(chatContent.includes("serviceCatalog"), "chat must render service panel");
  assert(
    chatContent.includes("/services/${svc.slug}"),
    "chat service items must link to detail routes"
  );
});

console.log("\n========================================================");
console.log(`TOTAL TESTS: ${total}`);
console.log(`PASSED: ${passed}`);
console.log(`FAILED: ${total - passed}`);
console.log("========================================================\n");

if (passed === total) {
  console.log("ALL MAIN SERVICE NAVIGATION TESTS PASSED CLEANLY!\n");
  process.exit(0);
} else {
  console.error("SOME TESTS FAILED!\n");
  process.exit(1);
}
