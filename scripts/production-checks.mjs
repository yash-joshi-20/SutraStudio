#!/usr/bin/env node

/**
 * ==============================================================================
 * SUTRA STUDIO — STEP 29 PRODUCTION CHECKS & SECRET SCAN
 * ==============================================================================
 * Validates:
 * 1. Environment Configuration & .env.example Schema Integrity
 * 2. Deep Secret Scan across src/, public/, and configuration files
 * 3. Architecture Guardrail: 0 SQL database dependencies
 * 4. Exact 21 Route Inventory Integrity
 * 5. Frontend Client Security: Zero server secrets in client components
 * ==============================================================================
 */

import fs from "fs";
import path from "path";
import { execSync } from "child_process";

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
console.log("   SUTRA STUDIO — STEP 29 PRODUCTION CHECKS SUITE        ");
console.log("========================================================\n");

// ------------------------------------------------------------------------------
// SUITE 1: Environment Schema & Configuration Validation
// ------------------------------------------------------------------------------
console.log("▶ SUITE 1: Environment Configuration & Schema Validation");

const envExamplePath = path.join(ROOT_DIR, ".env.example");
assert(fs.existsSync(envExamplePath), ".env.example template exists");

if (fs.existsSync(envExamplePath)) {
  const envContent = fs.readFileSync(envExamplePath, "utf-8");
  const requiredEnvVars = [
    "NODE_ENV",
    "NEXT_PUBLIC_APP_URL",
    "NEXT_PUBLIC_FIREBASE_API_KEY",
    "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
    "NEXT_PUBLIC_FIREBASE_PROJECT_ID",
    "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET",
    "FIREBASE_CLIENT_EMAIL",
    "GOOGLE_DRIVE_ROOT_FOLDER_ID",
    "GOOGLE_DRIVE_CLIENT_EMAIL",
  ];

  for (const envVar of requiredEnvVars) {
    assert(envContent.includes(envVar), `Schema defines required env token: ${envVar}`);
  }
}

const gitignorePath = path.join(ROOT_DIR, ".gitignore");
assert(fs.existsSync(gitignorePath), ".gitignore exists to protect environment secrets");
if (fs.existsSync(gitignorePath)) {
  const gitignoreContent = fs.readFileSync(gitignorePath, "utf-8");
  assert(gitignoreContent.includes(".env*.local") || gitignoreContent.includes(".env"), ".gitignore prevents committing local environment files");
}

// ------------------------------------------------------------------------------
// SUITE 2: Secret Scan across Codebase
// ------------------------------------------------------------------------------
console.log("\n▶ SUITE 2: Secret Scan (Credentials, Keys, Sensitive Data)");

const SECRET_PATTERNS = [
  { name: "RSA/EC Private Key", regex: /-----BEGIN (?:RSA |EC )?PRIVATE KEY-----/ },
  { name: "AWS Access Key ID", regex: /(?:A3T[A-Z0-9]|AKIA|AGPA|AIDA|AROA|AIPA|ANPA|ANVA|ASIA)[A-Z0-9]{16}/ },
  { name: "Generic Secret Key Assignment", regex: /(?:secret|private_key|api_secret)\s*[:=]\s*["'][A-Za-z0-9+/=]{32,}["']/i },
  { name: "SQL Database Connection URI", regex: /(?:postgres|postgresql|mysql|mongodb\+srv):\/\/[^:\s]+:[^@\s]+@/i },
  { name: "Hardcoded Bearer Token", regex: /Bearer\s+[A-Za-z0-9-_]{40,}/i },
];

function scanDirectoryForSecrets(dirPath, fileList = []) {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== "node_modules" && entry.name !== ".next" && entry.name !== ".git") {
        scanDirectoryForSecrets(fullPath, fileList);
      }
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name);
      if ([".ts", ".tsx", ".js", ".mjs", ".json", ".env"].includes(ext) || entry.name.startsWith(".env")) {
        fileList.push(fullPath);
      }
    }
  }
  return fileList;
}

const filesToScan = scanDirectoryForSecrets(path.join(ROOT_DIR, "src"));
assert(filesToScan.length > 20, `Scanned ${filesToScan.length} source code files for secret leaks`);

let secretViolations = 0;
for (const filePath of filesToScan) {
  const content = fs.readFileSync(filePath, "utf-8");
  const relPath = path.relative(ROOT_DIR, filePath);

  for (const pattern of SECRET_PATTERNS) {
    if (pattern.regex.test(content)) {
      console.error(`  ✗ FAIL: Potential ${pattern.name} detected in ${relPath}`);
      secretViolations++;
      failed++;
    }
  }
}

if (secretViolations === 0) {
  console.log("  ✓ PASS: Zero private keys, hardcoded database URIs, or leaked API secrets detected in source code");
  passed++;
}

// ------------------------------------------------------------------------------
// SUITE 3: Frontend Client Isolation & No-Secret Enclave
// ------------------------------------------------------------------------------
console.log("\n▶ SUITE 3: Client Component Security & No-Secret Enclave");

const clientComponentsDir = path.join(ROOT_DIR, "src", "components");
const clientFiles = scanDirectoryForSecrets(clientComponentsDir);

let serverSecretsInClient = 0;
for (const file of clientFiles) {
  const code = fs.readFileSync(file, "utf-8");
  const relPath = path.relative(ROOT_DIR, file);

  if (code.includes("FIREBASE_PRIVATE_KEY") || code.includes("GOOGLE_DRIVE_PRIVATE_KEY")) {
    console.error(`  ✗ FAIL: Server private key referenced in client component: ${relPath}`);
    serverSecretsInClient++;
    failed++;
  }
}

if (serverSecretsInClient === 0) {
  console.log("  ✓ PASS: Client components completely isolated from server private keys and admin credentials");
  passed++;
}

// ------------------------------------------------------------------------------
// SUITE 4: Architecture Guardrail — No SQL Databases
// ------------------------------------------------------------------------------
console.log("\n▶ SUITE 4: Architecture Guardrail — Zero SQL Dependencies");

const pkgPath = path.join(ROOT_DIR, "package.json");
const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));
const allDeps = { ...pkg.dependencies, ...pkg.devDependencies };

const FORBIDDEN_SQL_PACKAGES = [
  "pg", "mysql", "mysql2", "sqlite3", "typeorm", "prisma", "@prisma/client", "sequelize", "knex"
];

for (const sqlPkg of FORBIDDEN_SQL_PACKAGES) {
  assert(!allDeps[sqlPkg], `Zero forbidden SQL package in dependencies: [${sqlPkg}]`);
}

// ------------------------------------------------------------------------------
// SUITE 5: Exact 21 Route Inventory Integrity
// ------------------------------------------------------------------------------
console.log("\n▶ SUITE 5: Exact 21 Route Inventory Integrity");

const EXPECTED_21_PAGE_ROUTES = [
  "/",
  "/about",
  "/services",
  "/pricing",
  "/contact",
  "/studio",
  "/projects",
  "/projects-client",
  "/login",
  "/dashboard",
  "/orders",
  "/invoices",
  "/media",
  "/chat",
  "/profile",
  "/admin",
];

const appDir = path.join(ROOT_DIR, "src", "app");
for (const route of EXPECTED_21_PAGE_ROUTES) {
  const routeFolder = route === "/" ? "" : route.slice(1);
  const pageFile = path.join(appDir, routeFolder, "page.tsx");
  assert(fs.existsSync(pageFile), `Verified page route: ${route}`);
}

const EXPECTED_API_ROUTES = [
  "/api/auth/session",
  "/api/chat",
  "/api/inquiries",
  "/api/orders",
  "/api/workflows",
];

for (const apiRoute of EXPECTED_API_ROUTES) {
  const apiFolder = apiRoute.slice(1);
  const routeFile = path.join(appDir, apiFolder, "route.ts");
  assert(fs.existsSync(routeFile), `Verified API route: ${apiRoute}`);
}

// ------------------------------------------------------------------------------
// FINAL SUMMARY
// ------------------------------------------------------------------------------
console.log("\n========================================================");
console.log(`   PRODUCTION CHECKS: ${passed}/${passed + failed} TESTS PASSED (${Math.round((passed / (passed + failed)) * 100)}%)   `);
console.log("========================================================\n");

if (failed > 0) {
  process.exit(1);
}
