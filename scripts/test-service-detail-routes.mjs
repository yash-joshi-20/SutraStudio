/**
 * Verification Test: Service Detail Routes, Canonical Specifications & Deep-Linking
 * Run with: node scripts/test-service-detail-routes.mjs
 */

import fs from "fs";
import path from "path";
import assert from "assert";

console.log("\n========================================================");
console.log("   SERVICE DETAIL ROUTES & CANONICAL SPECS VERIFICATION");
console.log("========================================================\n");

let passed = 0;
let total = 0;

function check(desc, fn) {
  total++;
  try {
    fn();
    console.log(`  ✓ PASS: ${desc}`);
    passed++;
  } catch (err) {
    console.error(`  ✗ FAIL: ${desc}`);
    console.error(`    ${err.message}`);
  }
}

const ROOT = process.cwd();
const servicesPagePath = path.join(ROOT, "src", "app", "(public)", "services", "page.tsx");
const servicesConfigPath = path.join(ROOT, "src", "config", "services.ts");
const nextConfigPath = path.join(ROOT, "next.config.ts");

const servicesPageContent = fs.readFileSync(servicesPagePath, "utf8");
const servicesConfigContent = fs.readFileSync(servicesConfigPath, "utf8");
const nextConfigContent = fs.readFileSync(nextConfigPath, "utf8");

import { pathToFileURL } from "url";

// Dynamic import of services configuration
const servicesModuleUrl = pathToFileURL(path.join(ROOT, "src", "config", "services.ts")).href;
const {
  CANONICAL_SERVICES,
  SUTRA_SERVICES_CONFIG,
  findServiceBySlug,
  getServiceDetailSpec,
} = await import(servicesModuleUrl);

console.log("--> 1. Verifying 10 Required Service Domains Coverage...");

const REQUIRED_DOMAINS = [
  { name: "Image Design", slug: "image-creation" },
  { name: "Video Editing", slug: "video-creation" },
  { name: "3D Modeling & Animation", slug: "3d-modeling" },
  { name: "360° Panoramic Tours", slug: "360-view" },
  { name: "Interior & Architectural Visualization", slug: "interior-design" },
  { name: "Digital Marketing & Meta Ads", slug: "digital-marketing" },
  { name: "Website & E-Commerce Development", slug: "website-development" },
  { name: "Web App Prototype", slug: "web-app-development" },
  { name: "Mobile App UI Prototype", slug: "mobile-app-setup" },
  { name: "Trending Research", slug: "trending-topic-research" },
];

for (const domain of REQUIRED_DOMAINS) {
  check(`Domain covered: ${domain.name} (${domain.slug})`, () => {
    const service = findServiceBySlug(domain.slug);
    assert(service, `Service ${domain.slug} must be resolvable`);
    assert(service.name, `Service ${domain.slug} must have a name`);
    assert(service.startingPrice, `Service ${domain.slug} must have startingPrice`);
    assert(Array.isArray(service.deliverables) && service.deliverables.length > 0, `Service ${domain.slug} must have deliverables`);
  });
}

console.log("\n--> 2. Verifying Structured Specification Fields (getServiceDetailSpec)...");

for (const domain of REQUIRED_DOMAINS) {
  check(`Detailed specifications for ${domain.name}`, () => {
    const service = findServiceBySlug(domain.slug);
    const spec = getServiceDetailSpec(service);

    assert(spec.intendedAudience && spec.intendedAudience.length > 10, "Must specify intendedAudience");
    assert(spec.pricingUnit && spec.pricingUnit.length > 0, "Must specify pricingUnit");
    assert(spec.dimensionsSpecs && spec.dimensionsSpecs.length > 5, "Must specify dimensionsSpecs");
    assert(Array.isArray(spec.clientInputs) && spec.clientInputs.length >= 3, "Must specify clientInputs (>=3 items)");
    assert(Array.isArray(spec.productionSteps) && spec.productionSteps.length === 5, "Must provide 5-step workflow");
    assert(spec.customQuoteConditions && spec.customQuoteConditions.length > 10, "Must specify customQuoteConditions");
    assert(spec.sampleDisclaimer.includes("STUDIO SAMPLE"), "Must have prominent studio sample disclaimer");
  });
}

console.log("\n--> 3. Verifying 5-Step Workflow Pipeline Consistency...");

check("5-Step Workflow covers Research -> Prompt -> Production -> QA -> Delivery", () => {
  const sampleSpec = getServiceDetailSpec(findServiceBySlug("image-creation"));
  const stepTitles = sampleSpec.productionSteps.map((s) => s.title.toLowerCase()).join(" ");
  assert(stepTitles.includes("research"), "Step 1 must involve research/brief");
  assert(stepTitles.includes("prompt") || stepTitles.includes("architecture"), "Step 2 must involve prompt/blueprint");
  assert(stepTitles.includes("synthesis") || stepTitles.includes("production") || stepTitles.includes("assembly"), "Step 3 must involve production");
  assert(stepTitles.includes("qa"), "Step 4 must involve QA");
  assert(stepTitles.includes("delivery") || stepTitles.includes("vault"), "Step 5 must involve delivery");
});

console.log("\n--> 4. Verifying Public Promotion Guardrails (Workflow Automation Concealed)...");

check("Public categories in services/page.tsx strictly exclude internal Automation", () => {
  assert(!servicesPageContent.includes('"Automation",'), 'CATEGORIES must not contain "Automation"');
  assert(servicesPageContent.includes("publicServices = SUTRA_SERVICES.filter"), "Must filter active public services");
});

check("Workflow automation definition is marked active: false", () => {
  const automation = findServiceBySlug("workflow-automation");
  assert(automation, "Workflow automation exists");
  assert(automation.active === false, "Workflow automation must have active: false");
});

console.log("\n--> 5. Verifying URL Deep-Linking, Back/Forward & Rewrites...");

check("services/page.tsx listens to popstate and hashchange for Back/Forward navigation", () => {
  assert(servicesPageContent.includes('window.addEventListener("popstate"'), "Must listen to popstate event");
  assert(servicesPageContent.includes('window.addEventListener("hashchange"'), "Must listen to hashchange event");
});

check("services/page.tsx pushes history state when selecting and closing service", () => {
  assert(servicesPageContent.includes('window.history.pushState({ service: service.slug }, "", newUrl)'), "Must push state on select");
  assert(servicesPageContent.includes("window.history.pushState({}, \"\", cleanUrl)"), "Must push clean state on close");
});

check("next.config.ts rewrites /services/:slug to /services?service=:slug", () => {
  assert(nextConfigContent.includes('source: "/services/:slug"'), "Must have source /services/:slug");
  assert(nextConfigContent.includes('destination: "/services?service=:slug"'), "Must rewrite to /services?service=:slug");
});

console.log("\n--> 6. Verifying Order CTA Navigation Parameters...");

check("Service cards link to /orders?service=${service.slug}", () => {
  assert(servicesPageContent.includes('service.ctaHref || `/orders?service=${service.slug}`'), "Card CTAs must pass service slug");
  assert(servicesPageContent.includes('selectedService.ctaHref || `/orders?service=${selectedService.slug}`'), "Modal CTAs must pass service slug");
});

console.log("\n--> 7. Verifying Demo Labeling / Sample Disclosure...");

check("Service details modal explicitly labels previews as Studio Sample", () => {
  assert(servicesPageContent.includes("STUDIO TECHNICAL SAMPLE"), "Must have Studio Technical Sample heading");
  assert(servicesPageContent.includes("selectedSpec.sampleDisclaimer"), "Must display sample disclaimer text");
  assert(servicesPageContent.includes("Studio Sample"), "Card must display Studio Sample watermark");
});

console.log("\n========================================================");
console.log(`TOTAL TESTS: ${total}`);
console.log(`PASSED: ${passed}`);
console.log(`FAILED: ${total - passed}`);
console.log("========================================================\n");

if (passed === total) {
  console.log("ALL SERVICE DETAIL ROUTE TESTS PASSED CLEANLY!\n");
  process.exit(0);
} else {
  console.error("SOME TESTS FAILED!\n");
  process.exit(1);
}
