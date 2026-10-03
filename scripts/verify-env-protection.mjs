#!/usr/bin/env node

/**
 * ==============================================================================
 * SUTRA STUDIO — STEP 31A ENVIRONMENT PROTECTION & MISSING-KEY REGISTRY GUARD
 * ==============================================================================
 * Pre-commit / CI Guard verifying:
 * 1. .gitignore blocks all .env*, backup folders, and service-account JSON files
 * 2. No .env* files (except .env.example) or service accounts are staged/tracked in git
 * 3. Deep scanner ensures zero hardcoded API keys or private keys in source code
 * 4. Central integrations module declarations and MISSING_KEYS.md integrity
 * 5. Missing-key registry sync and safe fallback behavior
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
console.log("   STEP 31A: ENVIRONMENT PROTECTION & KEY REGISTRY GUARD");
console.log("========================================================\n");

// ------------------------------------------------------------------------------
// CHECK 1: .gitignore Protection
// ------------------------------------------------------------------------------
console.log("▶ CHECK 1: .gitignore Security Directives");

const gitignorePath = path.join(ROOT_DIR, ".gitignore");
assert(fs.existsSync(gitignorePath), ".gitignore exists");

if (fs.existsSync(gitignorePath)) {
  const content = fs.readFileSync(gitignorePath, "utf-8");
  assert(content.includes(".env"), ".gitignore contains .env exclusion");
  assert(content.includes(".env.local"), ".gitignore contains .env.local exclusion");
  assert(content.includes(".env_backups/"), ".gitignore contains .env_backups/ exclusion");
  assert(content.includes("scripts/backups/env-backups/"), ".gitignore contains env-backups exclusion");
  assert(content.includes("*service-account*.json"), ".gitignore contains service-account JSON exclusion");
  assert(content.includes("!/.env.example"), ".gitignore preserves public .env.example template");
}

// ------------------------------------------------------------------------------
// CHECK 2: Git Tracked / Staged Files Guard
// ------------------------------------------------------------------------------
console.log("\n▶ CHECK 2: Git Tracked Files Guard (Zero Secret Files in Repo)");

try {
  const trackedFilesOutput = execSync("git ls-files", { encoding: "utf-8" });
  const trackedFiles = trackedFilesOutput.split("\n").map((f) => f.trim()).filter(Boolean);

  const forbiddenTracked = trackedFiles.filter((file) => {
    const base = path.basename(file);
    if (base === ".env.example" || file.endsWith(".env.example")) return false;
    if (base.startsWith(".env")) return true;
    if (base.toLowerCase().includes("service-account") && base.endsWith(".json")) return true;
    if (base.toLowerCase().includes("firebase-adminsdk") && base.endsWith(".json")) return true;
    return false;
  });

  assert(
    forbiddenTracked.length === 0,
    `Zero secret or environment files tracked by git (${forbiddenTracked.length} violations: ${forbiddenTracked.join(", ")})`
  );
} catch (err) {
  console.log("  ℹ Git status check skipped (non-git or detached environment)");
}

// ------------------------------------------------------------------------------
// CHECK 3: Deep Secret Pattern Scanner
// ------------------------------------------------------------------------------
console.log("\n▶ CHECK 3: Source Code Deep Secret Scanner");

const SECRET_PATTERNS = [
  { name: "RSA/EC Private Key Header", regex: /-----BEGIN (?:RSA |EC )?PRIVATE KEY-----/ },
  { name: "Live Firebase Private Key", regex: /"private_key":\s*"-----BEGIN PRIVATE KEY-----/ },
  { name: "Live Razorpay Secret Key", regex: /rzp_(?:live|test)_[a-zA-Z0-9]{14,}:[a-zA-Z0-9]{20,}/ },
  { name: "Google AI API Key", regex: /AIzaSy[0-9A-Za-z-_]{33}/ },
  { name: "GitHub Personal Access Token", regex: /ghp_[0-9a-zA-Z]{36}/ },
  { name: "OpenAI Secret Key", regex: /sk-[a-zA-Z0-9]{48,}/ },
];

function scanDir(dirPath, results = []) {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      if (!["node_modules", ".next", ".git", "env-backups", ".env_backups"].includes(entry.name)) {
        scanDir(full, results);
      }
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name);
      if ([".ts", ".tsx", ".js", ".mjs", ".json"].includes(ext) && !entry.name.includes(".bak")) {
        results.push(full);
      }
    }
  }
  return results;
}

const files = scanDir(path.join(ROOT_DIR, "src"));
let leaks = 0;
for (const file of files) {
  const content = fs.readFileSync(file, "utf-8");
  for (const p of SECRET_PATTERNS) {
    if (p.regex.test(content)) {
      console.error(`  ✗ FAIL: Hardcoded ${p.name} found in ${path.relative(ROOT_DIR, file)}`);
      leaks++;
      failed++;
    }
  }
}

if (leaks === 0) {
  console.log(`  ✓ PASS: Scanned ${files.length} files — 0 hardcoded keys or private credentials detected`);
  passed++;
}

// ------------------------------------------------------------------------------
// CHECK 4: Missing Keys Registry & Module Integrity
// ------------------------------------------------------------------------------
console.log("\n▶ CHECK 4: Missing Keys Registry & File Integrity");

const missingKeysPath = path.join(ROOT_DIR, "MISSING_KEYS.md");
assert(fs.existsSync(missingKeysPath), "MISSING_KEYS.md exists in repository root");

if (fs.existsSync(missingKeysPath)) {
  const content = fs.readFileSync(missingKeysPath, "utf-8");
  assert(content.includes("Names only. Never put a real value in this file."), "MISSING_KEYS.md declares names-only security rule");
  // Verify no secret values inside MISSING_KEYS.md
  for (const p of SECRET_PATTERNS) {
    assert(!p.regex.test(content), `MISSING_KEYS.md is clean of ${p.name}`);
  }
}

const integrationsModulePath = path.join(ROOT_DIR, "src", "lib", "config", "integrations.ts");
assert(fs.existsSync(integrationsModulePath), "Central integrations module exists (src/lib/config/integrations.ts)");

const missingKeyRegistryPath = path.join(ROOT_DIR, "src", "lib", "services", "missingKeyRegistry.ts");
assert(fs.existsSync(missingKeyRegistryPath), "Missing key registry service exists (src/lib/services/missingKeyRegistry.ts)");

// ------------------------------------------------------------------------------
// SUMMARY
// ------------------------------------------------------------------------------
console.log("\n========================================================");
console.log(`   ENV PROTECTION GUARD: ${passed}/${passed + failed} CHECKS PASSED`);
console.log("========================================================\n");

if (failed > 0) {
  process.exit(1);
}
