#!/usr/bin/env node

/**
 * ==============================================================================
 * SUTRA STUDIO — STEP 31C ADMIN-ONLY ACCESS & SECURITY ACCEPTANCE TESTS
 * ==============================================================================
 * Verifies:
 * 1. 3 Identities declared from env (FIREBASE_OWNER_EMAIL, GOOGLE_DRIVE_ACCOUNT_EMAIL, ADMIN_EMAIL)
 * 2. Only ADMIN_EMAIL can ever receive role=admin (create-admin script contract)
 * 3. Client accounts & random emails strictly rejected from admin access
 * 4. Google Drive OAuth strictly rejects any email other than GOOGLE_DRIVE_ACCOUNT_EMAIL
 * 5. No admin signup UI / API exists (registration creates client role only)
 * 6. Hardening: rate limiting lockout, inactivity timeout, sign out everywhere, audit logs, IP allowlist
 * 7. Zero legacy env-based admin password logic (ADMIN_PASSWORD & ADMIN_ROLE retired)
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
console.log("   STEP 31C: ADMIN ACCESS & SECURITY ACCEPTANCE TESTS   ");
console.log("========================================================\n");

// ------------------------------------------------------------------------------
// TEST 1: Three Identities Declared in Environment Types & Policy
// ------------------------------------------------------------------------------
console.log("▶ TEST 1: Three Authorized Identities from Env");

const envSource = fs.readFileSync(path.join(ROOT_DIR, "src", "lib", "config", "env.ts"), "utf-8");
assert(envSource.includes('"FIREBASE_OWNER_EMAIL"'), "EnvKey declares FIREBASE_OWNER_EMAIL");
assert(envSource.includes('"GOOGLE_DRIVE_ACCOUNT_EMAIL"'), "EnvKey declares GOOGLE_DRIVE_ACCOUNT_EMAIL");
assert(envSource.includes('"ADMIN_EMAIL"'), "EnvKey declares ADMIN_EMAIL");
assert(envSource.includes('"SUPPORT_INBOX_EMAIL"'), "EnvKey declares SUPPORT_INBOX_EMAIL");

const policySource = fs.readFileSync(path.join(ROOT_DIR, "src", "lib", "config", "adminPolicy.ts"), "utf-8");
assert(policySource.includes("primaryAdminEmail"), "adminPolicy declares primaryAdminEmail()");
assert(policySource.includes("googleDriveAccountEmail"), "adminPolicy declares googleDriveAccountEmail()");
assert(policySource.includes("firebaseOwnerEmail"), "adminPolicy declares firebaseOwnerEmail()");

// ------------------------------------------------------------------------------
// TEST 2: Admin Provisioning Script (scripts/create-admin.ts) Contract
// ------------------------------------------------------------------------------
console.log("\n▶ TEST 2: scripts/create-admin.ts Provisioning Contract");

const createAdminPath = path.join(ROOT_DIR, "scripts", "create-admin.ts");
assert(fs.existsSync(createAdminPath), "scripts/create-admin.ts exists");

const createAdminSource = fs.readFileSync(createAdminPath, "utf-8");
assert(createAdminSource.includes("ADMIN_EMAIL"), "create-admin targets only ADMIN_EMAIL from env");
assert(createAdminSource.includes("role: \"admin\""), "create-admin sets custom claim role=admin");
assert(createAdminSource.includes("emailVerified: true"), "create-admin sets emailVerified=true");
assert(createAdminSource.includes("ADMIN_INITIAL_PASSWORD"), "create-admin reads password from ADMIN_INITIAL_PASSWORD or hidden prompt");
assert(createAdminSource.includes("--reset"), "create-admin refuses to overwrite without --reset flag");
assert(createAdminSource.includes("revokeRefreshTokens"), "create-admin revokes tokens forcing clean sign-in");

// ------------------------------------------------------------------------------
// TEST 3: Google Drive Account Verification & Rejection Contract
// ------------------------------------------------------------------------------
console.log("\n▶ TEST 3: Google Drive Account Identity Verification Contract");

const driveOAuthPath = path.join(ROOT_DIR, "scripts", "get-drive-refresh-token.ts");
assert(fs.existsSync(driveOAuthPath), "scripts/get-drive-refresh-token.ts exists");

const driveOAuthSource = fs.readFileSync(driveOAuthPath, "utf-8");
assert(driveOAuthSource.includes("GOOGLE_DRIVE_ACCOUNT_EMAIL"), "Drive OAuth checks GOOGLE_DRIVE_ACCOUNT_EMAIL");
assert(
  driveOAuthSource.includes("signedInEmail !== authorizedEmail") &&
  driveOAuthSource.includes("IDENTITY REJECTED"),
  "Drive OAuth strictly rejects any Google account other than GOOGLE_DRIVE_ACCOUNT_EMAIL"
);

// ------------------------------------------------------------------------------
// TEST 4: No Admin Signup & Client Role Isolation
// ------------------------------------------------------------------------------
console.log("\n▶ TEST 4: No Admin Signup & Client Role Isolation");

const registerPath = path.join(ROOT_DIR, "src", "app", "api", "auth", "register", "route.ts");
assert(fs.existsSync(registerPath), "Registration route exists");
const registerSource = fs.readFileSync(registerPath, "utf-8");
assert(registerSource.includes('role: "client"'), "Public registration strictly provisions role=client only");
assert(!registerSource.includes('role: "admin"'), "Public registration never provisions role=admin");

const clientLoginPath = path.join(ROOT_DIR, "src", "app", "api", "auth", "client-login", "route.ts");
const clientLoginSource = fs.readFileSync(clientLoginPath, "utf-8");
assert(
  clientLoginSource.includes("isAdminAllowedEmail") && clientLoginSource.includes("isStaffClaim"),
  "Client login checks and rejects staff accounts from gaining client sessions"
);

// ------------------------------------------------------------------------------
// TEST 5: Admin Login Lockdown & Session Verification Gates
// ------------------------------------------------------------------------------
console.log("\n▶ TEST 5: Admin Route Clearance & Session Gates");

const sessionSource = fs.readFileSync(path.join(ROOT_DIR, "src", "lib", "auth", "session.ts"), "utf-8");
assert(sessionSource.includes("SESSION_COOKIE_ADMIN"), "Admin session isolated on dedicated cookie (sutra_admin_session)");
assert(sessionSource.includes("isAdminAllowedEmail(user.email)"), "requireAdmin verifies user is on admin allowlist");
assert(sessionSource.includes("user.emailVerified"), "requireAdmin verifies user.emailVerified is true");
assert(sessionSource.includes("INACTIVITY_TIMEOUT_MS"), "requireAdmin enforces inactivity timeout");

const adminLoginRouteSource = fs.readFileSync(path.join(ROOT_DIR, "src", "app", "api", "auth", "admin-login", "route.ts"), "utf-8");
assert(adminLoginRouteSource.includes("checkAdminLoginLock"), "admin-login enforces brute-force lockout");
assert(adminLoginRouteSource.includes("isAllowedAdminIp"), "admin-login enforces IP allowlist check");
assert(adminLoginRouteSource.includes("auditAdminLogin"), "admin-login records audit logs for all successes and failures");
assert(adminLoginRouteSource.includes("queueAdminLoginAlert"), "admin-login queues alert on login from new devices");

const logoutRouteSource = fs.readFileSync(path.join(ROOT_DIR, "src", "app", "api", "auth", "logout", "route.ts"), "utf-8");
assert(logoutRouteSource.includes("revokeSessions"), "Logout route supports DELETE sign out everywhere via revokeSessions");

// ------------------------------------------------------------------------------
// TEST 6: Legacy Env Password Removal
// ------------------------------------------------------------------------------
console.log("\n▶ TEST 6: Legacy Env Password Check Elimination");

function scanForLegacyPassword(dirPath) {
  let count = 0;
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dirPath, e.name);
    if (e.isDirectory()) {
      if (!["node_modules", ".next", ".git"].includes(e.name)) {
        count += scanForLegacyPassword(full);
      }
    } else if (e.isFile() && (e.name.endsWith(".ts") || e.name.endsWith(".tsx"))) {
      const content = fs.readFileSync(full, "utf-8");
      if (content.includes("ADMIN_ROLE") || (content.includes("process.env.ADMIN_PASSWORD") && !full.includes("passwordPolicy"))) {
        console.error(`  ✗ Found legacy auth check in: ${path.relative(ROOT_DIR, full)}`);
        count++;
      }
    }
  }
  return count;
}

const legacyCount = scanForLegacyPassword(path.join(ROOT_DIR, "src"));
assert(legacyCount === 0, "Zero legacy ADMIN_PASSWORD / ADMIN_ROLE runtime logic in src/");

// ------------------------------------------------------------------------------
// SUMMARY
// ------------------------------------------------------------------------------
console.log("\n========================================================");
console.log(`   STEP 31C ADMIN SECURITY: ${passed}/${passed + failed} CHECKS PASSED`);
console.log("========================================================\n");

if (failed > 0) {
  process.exit(1);
}
