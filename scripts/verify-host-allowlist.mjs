/**
 * SUTRA STUDIO — Host & Domain Allowlist Verification Gate
 *
 * Strict Rule Enforcement:
 * Only TWO live domains exist in this project:
 * 1) https://sutrastudios.in  (Main site & client delivery)
 * 2) https://n8n.sutrastudios.in (Internal automation & webhook receiver)
 *
 * Scans src, mobile, n8n, docs, and env examples.
 * Fails the build immediately if any unapproved or forbidden host is discovered.
 */

import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const ALLOWED_HOSTS = new Set([
  // 1. Approved Live Project Origins
  "sutrastudios.in",
  "www.sutrastudios.in",
  "n8n.sutrastudios.in",

  // 2. Exception (a): Server-Side Provider API Endpoints (from env) & Developer Dashboards
  "openrouter.ai",
  "generativelanguage.googleapis.com",
  "ai.google.dev",
  "aistudio.google.com",
  "api.groq.com",
  "groq.com",
  "console.groq.com",
  "api.cerebras.ai",
  "cerebras.ai",
  "cloud.cerebras.ai",
  "api.openai.com",
  "openai.com",
  "platform.openai.com",
  "api.elevenlabs.io",
  "elevenlabs.io",
  "api.klingai.com",
  "klingai.com",
  "api.runwayml.com",
  "runwayml.com",
  "api.dev.runwayml.com",
  "api.tripo3d.ai",
  "tripo3d.ai",
  "www.tripo3d.ai",
  "api.bfl.ml",
  "api.bfl.ai",
  "blackforestlabs.ai",
  "api-inference.huggingface.co",
  "huggingface.co",
  "serpapi.com",
  "graph.facebook.com",
  "developers.facebook.com",
  "oauth2.googleapis.com",
  "www.googleapis.com",
  "accounts.google.com",
  "console.cloud.google.com",
  "console.firebase.google.com",
  "mail.zoho.in",
  "resend.com",
  "api.resend.com",
  "app.sendgrid.com",
  "docker.n8n.io",

  // Open-Source Documentation & Permissive Licenses (Tier 1 Free-First Stack)
  "ffmpeg.org",
  "www.blender.org",
  "github.com",
  "pannellum.org",
  "modelviewer.dev",
  "schema.org",
  "w3.org",
  "www.w3.org",

  // 3. Exception (b): Firebase Client SDK Endpoints
  "identitytoolkit.googleapis.com",
  "securetoken.googleapis.com",
  "firestore.googleapis.com",
  "firebaseinstallations.googleapis.com",
  "fcmregistrations.googleapis.com",
  "firebase.googleapis.com",

  // 4. Exception (c): Outbound Studio Contact & Social Links
  "wa.me",
  "instagram.com",
  "www.instagram.com",
  "facebook.com",
  "www.facebook.com",
  "business.facebook.com",
]);

// Directories & files to scan
const SCAN_TARGETS = [
  "src",
  "mobile/src",
  "mobile/App.tsx",
  "n8n",
  "docs",
  ".env.example",
];

// Files allowed to define regex patterns or HTTP 301 host redirection guards
const HOST_REDIRECT_GUARD_FILES = new Set([
  path.normalize("src/middleware.ts"),
  path.normalize("next.config.ts"),
  path.normalize("src/lib/config/site.ts"),
]);

const PATTERN_DEFINITION_FILES = new Set([
  path.normalize("src/lib/config/site.ts"),
  path.normalize("src/lib/services/automationQualityGate.ts"),
]);

const FORBIDDEN_HOST_PATTERNS = [
  /localhost/i,
  /127\.0\.0\.1/i,
  /0\.0\.0\.0/i,
  /ngrok/i,
  /trycloudflare/i,
  /cloudflared/i,
  /vercel\.app/i,
  /supabase/i,
  /drive\.google\.com/i,
  /googleusercontent/i,
  /firebasestorage/i,
  /pollinations/i,
  /mixkit/i,
  /unsplash/i,
];

function getAllFiles(dirPath, arrayOfFiles = []) {
  if (!fs.existsSync(dirPath)) return arrayOfFiles;
  const stat = fs.statSync(dirPath);
  if (!stat.isDirectory()) {
    return [dirPath];
  }

  const files = fs.readdirSync(dirPath);
  for (const file of files) {
    if (file === "node_modules" || file === ".git" || file === ".next") continue;
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      getAllFiles(fullPath, arrayOfFiles);
    } else {
      const ext = path.extname(fullPath).toLowerCase();
      if (
        [".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs", ".json", ".md", ".env", ".example"].includes(
          ext
        ) ||
        file === ".env.example"
      ) {
        arrayOfFiles.push(fullPath);
      }
    }
  }
  return arrayOfFiles;
}

let violations = [];

console.log("==================================================================");
console.log("   SUTRA STUDIO — HOST & DOMAIN ALLOWLIST VERIFICATION GATE       ");
console.log("==================================================================");

for (const target of SCAN_TARGETS) {
  const fullTarget = path.join(process.cwd(), target);
  const files = getAllFiles(fullTarget);

  for (const file of files) {
    const relFile = path.relative(process.cwd(), file);
    const normalizedRelFile = path.normalize(relFile);
    const content = fs.readFileSync(file, "utf8");

    // 1. Check for Forbidden Host Patterns (except pattern definition guards)
    if (!PATTERN_DEFINITION_FILES.has(normalizedRelFile)) {
      for (const pattern of FORBIDDEN_HOST_PATTERNS) {
        if (pattern.test(content)) {
          violations.push({
            file: relFile,
            type: "FORBIDDEN_PATTERN",
            detail: `Matched forbidden pattern: ${pattern}`,
          });
        }
      }
    }

    // 2. Check for onrender.com (only permitted in redirect guards)
    if (content.includes("onrender.com") && !HOST_REDIRECT_GUARD_FILES.has(normalizedRelFile)) {
      violations.push({
        file: relFile,
        type: "UNAUTHORIZED_ONRENDER",
        detail: "onrender.com reference outside redirect guard files",
      });
    }

    // 3. Extract and check all HTTP/HTTPS URLs
    const urlRegex = /https?:\/\/([a-zA-Z0-9.-]+(?::[0-9]+)?)/g;
    let match;
    while ((match = urlRegex.exec(content)) !== null) {
      const fullUrlHost = match[1].toLowerCase().replace(/:\d+$/, "").replace(/\.$/, "");

      // Ignore standard XML/schema namespaces
      if (fullUrlHost === "www.w3.org" || fullUrlHost === "w3.org") continue;

      if (!ALLOWED_HOSTS.has(fullUrlHost)) {
        // Check if exempt in redirect files
        if (fullUrlHost.endsWith("onrender.com") && HOST_REDIRECT_GUARD_FILES.has(normalizedRelFile)) {
          continue;
        }

        violations.push({
          file: relFile,
          type: "UNAUTHORIZED_HOST",
          detail: `Host '${fullUrlHost}' is not on the approved allowlist`,
        });
      }
    }
  }
}

if (violations.length > 0) {
  console.error(`\n❌ VERIFICATION FAILED: Found ${violations.length} allowlist violation(s):`);
  for (const v of violations) {
    console.error(`  - [${v.type}] ${v.file}: ${v.detail}`);
  }
  console.error("\nOnly sutrastudios.in and n8n.sutrastudios.in are permitted live hosts.");
  process.exit(1);
} else {
  console.log("\n✅ ALL CHECKS PASSED: Zero unauthorized or local hosts found.");
  console.log("   - Primary Domain: https://sutrastudios.in");
  console.log("   - Automation Domain: https://n8n.sutrastudios.in");
  console.log("   - All client data and media routes verified for main domain delivery.");
  console.log("==================================================================\n");
}
