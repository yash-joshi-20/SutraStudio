import fs from "fs";
import path from "path";

function findRoutes(dir, base = "") {
  let results = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    const rel = path.join(base, entry.name);
    if (entry.isDirectory()) {
      results = results.concat(findRoutes(full, rel));
    } else if (entry.name === "route.ts") {
      results.push({ fullPath: full, relPath: rel.replace(/\\/g, "/") });
    }
  }
  return results;
}

const routes = findRoutes(path.resolve("src/app/api"));

const publicRoutes = new Set([
  "/api/auth/client-login",
  "/api/auth/admin-login",
  "/api/auth/register",
  "/api/auth/forgot-password",
  "/api/auth/reset-password",
  "/api/auth/resend-verification",
  "/api/auth/session",
  "/api/inquiries",
  "/api/leads",
  "/api/share/[token]",
  "/api/chatbot",
  "/api/payments/webhook", // signature verified
]);

const table = [];

for (const r of routes) {
  const routePath = "/api/" + r.relPath.replace(/\/route\.ts$/, "");
  const content = fs.readFileSync(r.fullPath, "utf-8");
  const methods = [];
  for (const m of ["GET", "POST", "PUT", "PATCH", "DELETE"]) {
    if (new RegExp(`export\\s+(async\\s+)?function\\s+${m}\\b`).test(content)) {
      methods.push(m);
    }
  }

  let caller = "unknown";
  if (routePath.startsWith("/api/admin/")) {
    caller = "admin";
  } else if (routePath.startsWith("/api/inbound/")) {
    caller = "Meta-signed (webhook) / inbound";
  } else if (routePath.startsWith("/api/cron/")) {
    caller = "cron / n8n-with-secret";
  } else if (routePath.startsWith("/api/n8n/")) {
    caller = routePath === "/api/n8n/dispatch" ? "admin" : "n8n-with-secret";
  } else if (publicRoutes.has(routePath)) {
    caller = "public";
  } else {
    caller = "logged-in client who owns the record";
  }

  const hasAdminCheck = /requireAdmin|requireAdminRole|user\.isAdmin|userRole === ["']admin["']|callerRole === ["']admin["']|role === ["']admin["']/.test(content);
  const hasUserCheck = /requireUser|requestUid|getAuthenticatedUser/.test(content);
  const hasSecretCheck = /timingSafeEqual|authorizeScheduledCall|N8N_WEBHOOK_SECRET|CRON_SECRET|META_APP_SECRET|RAZORPAY_WEBHOOK_SECRET|x-sutra-secret|x-hub-signature/i.test(content);

  let status = "OK";
  let issues = [];

  if (caller === "admin" && !hasAdminCheck) {
    status = "MISSING_GUARD";
    issues.push("Missing admin guard");
  }
  if (routePath === "/api/n8n/dispatch" && !hasAdminCheck) {
    status = "MISSING_GUARD";
    issues.push("Must be admin only");
  }
  if (routePath === "/api/admin/marketing/publish" && !content.includes("approved")) {
    issues.push("Needs explicit approval flag");
  }
  if (routePath === "/api/admin/deliverables") {
    issues.push("GET/PATCH admin only; POST constant-time n8n secret");
  }
  if (routePath === "/api/files") {
    status = "INSECURE";
    issues.push("In-memory store, lacks auth + ownership");
  }
  if (routePath.startsWith("/api/inbound/")) {
    if (!content.includes("x-hub-signature-256") && !content.includes("META_APP_SECRET")) {
      status = "MISSING_GUARD";
      issues.push("Missing X-Hub-Signature-256 with META_APP_SECRET");
    }
  }
  if (caller === "logged-in client who owns the record" && !hasUserCheck && !hasAdminCheck) {
    status = "NEEDS_AUTH";
    issues.push("No session/user ownership check detected");
  }

  table.push({
    route: routePath,
    methods: methods.join(", "),
    caller,
    hasAdminCheck,
    hasUserCheck,
    hasSecretCheck,
    status,
    issues: issues.join("; "),
  });
}

console.log("\n=== SECURITY AUDIT SUMMARY ===");
const needsAttention = table.filter((t) => t.status !== "OK" || t.issues.length > 0);
console.log(`Total routes: ${table.length}`);
console.log(`Routes needing attention: ${needsAttention.length}`);
console.log("\nRoutes needing attention:");
for (const n of needsAttention) {
  console.log(`- [${n.status}] ${n.route} (${n.methods}) -> Expected: ${n.caller} | Issues: ${n.issues}`);
}

fs.writeFileSync("scripts/routes-audit-table.json", JSON.stringify(table, null, 2));
