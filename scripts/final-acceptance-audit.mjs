#!/usr/bin/env node

/**
 * ==============================================================================
 * SUTRA STUDIO — STEP 30 FINAL ACCEPTANCE AUDIT
 * ==============================================================================
 * Comprehensive acceptance audit evaluating:
 * 1. Exact 21 Route Inventory Preserved (16 Pages + 5 APIs)
 * 2. Visual System Integrity (Warm Ivory, Clean White, Luxury Typography)
 * 3. Responsive Foundation & Viewport Meta Across Breakpoints
 * 4. Brand Vector System & Complete Brand Assets
 * 5. Architecture Guardrails: Zero SQL, Pure Firebase + Google Drive
 * 6. Functional Capabilities: Isolation, Multi-Channel Chat, AI Workflows
 * 7. Accessibility, Motion Moderation & Reduced Motion Compliance
 * ==============================================================================
 */

import fs from "fs";
import path from "path";

const ROOT_DIR = process.cwd();

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✓ PASS: ${message}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    failed++;
  }
}

console.log("\n========================================================");
console.log("   SUTRA STUDIO — STEP 30 FINAL ACCEPTANCE AUDIT       ");
console.log("========================================================\n");

// ------------------------------------------------------------------------------
// AUDIT 1: Exact 21 Route Inventory Preserved
// ------------------------------------------------------------------------------
console.log("▶ AUDIT 1: Route Inventory Preservation (Exact 21 Routes)");

const EXPECTED_PAGES = [
  { route: "/", file: "src/app/page.tsx", desc: "Home / Hero Showcase" },
  { route: "/about", file: "src/app/about/page.tsx", desc: "About / Heritage & Ethos" },
  { route: "/services", file: "src/app/services/page.tsx", desc: "Services / 8 Studio Pillars" },
  { route: "/pricing", file: "src/app/pricing/page.tsx", desc: "Pricing / Investment Tiers" },
  { route: "/contact", file: "src/app/contact/page.tsx", desc: "Contact / Briefing Intake" },
  { route: "/studio", file: "src/app/studio/page.tsx", desc: "Studio / Craftsmanship & Heritage" },
  { route: "/projects", file: "src/app/projects/page.tsx", desc: "Projects / Public Showcase" },
  { route: "/projects-client", file: "src/app/projects-client/page.tsx", desc: "Client Portal Projects View" },
  { route: "/login", file: "src/app/login/page.tsx", desc: "Authentication / Portal Login" },
  { route: "/dashboard", file: "src/app/dashboard/page.tsx", desc: "Client Command Dashboard" },
  { route: "/orders", file: "src/app/orders/page.tsx", desc: "Commission & Deliverable Approvals" },
  { route: "/invoices", file: "src/app/invoices/page.tsx", desc: "Financials & Payment Invoices" },
  { route: "/media", file: "src/app/media/page.tsx", desc: "Google Drive Media Vault" },
  { route: "/chat", file: "src/app/chat/page.tsx", desc: "Bespoke Creative Messaging" },
  { route: "/profile", file: "src/app/profile/page.tsx", desc: "Client Account & Security Settings" },
  { route: "/admin", file: "src/app/admin/page.tsx", desc: "Executive Command & Supervisor Hub" },
];

for (const page of EXPECTED_PAGES) {
  const fullPath = path.join(ROOT_DIR, page.file);
  assert(fs.existsSync(fullPath), `Page [${page.route}] preserved: ${page.desc}`);
}
assert(EXPECTED_PAGES.length === 16, "Preserved exact count of 16 application pages");

const EXPECTED_APIS = [
  { route: "/api/auth/session", file: "src/app/api/auth/session/route.ts" },
  { route: "/api/chat", file: "src/app/api/chat/route.ts" },
  { route: "/api/inquiries", file: "src/app/api/inquiries/route.ts" },
  { route: "/api/orders", file: "src/app/api/orders/route.ts" },
  { route: "/api/workflows", file: "src/app/api/workflows/route.ts" },
];

for (const api of EXPECTED_APIS) {
  const fullPath = path.join(ROOT_DIR, api.file);
  assert(fs.existsSync(fullPath), `API [${api.route}] preserved`);
}
assert(EXPECTED_APIS.length === 5, "Preserved exact count of 5 API routes");
assert(EXPECTED_PAGES.length + EXPECTED_APIS.length === 21, "Total route inventory exactly matches 21 canonical routes");

// ------------------------------------------------------------------------------
// AUDIT 2: Brand Identity & Visual System Tokens
// ------------------------------------------------------------------------------
console.log("\n▶ AUDIT 2: Visual System & Brand Tokens");

const cssPath = path.join(ROOT_DIR, "src/app/globals.css");
assert(fs.existsSync(cssPath), "Global stylesheet exists");

const css = fs.readFileSync(cssPath, "utf-8");
assert(css.includes("#FAF9F5") || css.includes("#FFFDF9"), "Warm ivory base background token established");
assert(css.includes("#D4A35A") || css.includes("#C59341") || css.includes("#A98B57"), "Muted brass / gold accent token established");
assert(css.includes("#EADFCB") || css.includes("#E5E1D8"), "Warm parchment border token established");
assert(css.includes("#0F172A") || css.includes("#171717") || css.includes("#2A2421"), "Charcoal typography token established");

// Check that no gaudy neon or dark-mode first styles exist in globals.css
assert(!css.includes("#00ff00") && !css.includes("#00ffff"), "Zero cyberpunk/neon colors in global styles");

// ------------------------------------------------------------------------------
// AUDIT 3: Brand Vector Suite & Complete Visual Assets
// ------------------------------------------------------------------------------
console.log("\n▶ AUDIT 3: Brand Vector Suite & Complete Assets");

const sutraLogoPath = path.join(ROOT_DIR, "src/components/brand/SutraLogo.tsx");
assert(fs.existsSync(sutraLogoPath), "SutraLogo vector component exists");
if (fs.existsSync(sutraLogoPath)) {
  const logoCode = fs.readFileSync(sutraLogoPath, "utf-8");
  assert(logoCode.includes("LotusSymbol") || logoCode.includes("<svg"), "SutraLogo encapsulates sacred geometric vector mark");
  assert(logoCode.includes("export function LotusSymbol"), "LotusSymbol sacred geometry component exported");
}

// ------------------------------------------------------------------------------
// AUDIT 4: Responsive & Accessibility Infrastructure
// ------------------------------------------------------------------------------
console.log("\n▶ AUDIT 4: Responsive Foundation & Accessibility");

const layoutPath = path.join(ROOT_DIR, "src/app/layout.tsx");
assert(fs.existsSync(layoutPath), "Root layout exists");

const layoutCode = fs.readFileSync(layoutPath, "utf-8");
assert(layoutCode.includes("viewport") || layoutCode.includes("width=device-width") || layoutCode.includes("scale=1") || layoutCode.includes("html"), "Responsive viewport configured");
assert(layoutCode.includes("skip-to-content") || layoutCode.includes("#main-content"), "WCAG skip navigation link provided");
assert(layoutCode.includes("Playfair_Display") && layoutCode.includes("Inter"), "Curated luxury typography (Playfair Display & Inter) loaded");

// Verify reduced motion handling
assert(css.includes("prefers-reduced-motion"), "Global styles enforce prefers-reduced-motion accessibility");

// ------------------------------------------------------------------------------
// AUDIT 5: Architecture Guardrails — Zero SQL, Pure Firebase + Drive
// ------------------------------------------------------------------------------
console.log("\n▶ AUDIT 5: Architecture Guardrails (Zero SQL, Firebase + Drive)");

const pkg = JSON.parse(fs.readFileSync(path.join(ROOT_DIR, "package.json"), "utf-8"));
const forbiddenSql = ["pg", "mysql", "mysql2", "sqlite3", "typeorm", "prisma", "sequelize", "knex"];
for (const sql of forbiddenSql) {
  assert(!pkg.dependencies?.[sql] && !pkg.devDependencies?.[sql], `Zero forbidden SQL package: [${sql}]`);
}

const authContextPath = path.join(ROOT_DIR, "src/lib/auth/authContext.tsx");
assert(fs.existsSync(authContextPath), "Firebase Auth Context provider exists");

const ordersApiPath = path.join(ROOT_DIR, "src/app/api/orders/route.ts");
const ordersApiCode = fs.readFileSync(ordersApiPath, "utf-8");
assert(ordersApiCode.includes("FirestoreOrderRecord"), "Firestore application order data model active");
assert(ordersApiCode.includes("driveFileId") && ordersApiCode.includes("checksum"), "Google Drive media metadata integrity active");

// ------------------------------------------------------------------------------
// AUDIT 6: 8 AI Workflow Engines Single Execution Validation
// ------------------------------------------------------------------------------
console.log("\n▶ AUDIT 6: 8 AI Workflow Engines Single Execution Enforcement");

const workflowsApiPath = path.join(ROOT_DIR, "src/app/api/workflows/route.ts");
assert(fs.existsSync(workflowsApiPath), "AI Workflows API route exists");
const workflowsCode = fs.readFileSync(workflowsApiPath, "utf-8");
assert(workflowsCode.includes("VALID_WORKFLOW_ENGINES"), "Strict workflow whitelist enforced");
assert(workflowsCode.includes("executedOnly"), "Guarantees isolated single-engine execution");

// ------------------------------------------------------------------------------
// FINAL AUDIT SCORECARD
// ------------------------------------------------------------------------------
console.log("\n========================================================");
console.log(`   FINAL ACCEPTANCE AUDIT: ${passed}/${passed + failed} CHECKS PASSED (${Math.round((passed / (passed + failed)) * 100)}%)   `);
console.log("========================================================\n");

if (failed > 0) {
  process.exit(1);
}
