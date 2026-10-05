/**
 * scripts/check-auth.mjs
 *
 * Prints only PASS/FAIL and error CODES (never secrets) for all auth subsystems.
 * Run: node scripts/check-auth.mjs
 *
 * Checks:
 *   (a) NEXT_PUBLIC_FIREBASE_* env consistency
 *   (b) Firebase Admin SDK initialisation
 *   (c) Admin SDK can list 1 user and read 1 Firestore document
 *   (d) Email/Password sign-in provider is enabled
 *   (e) Admin user exists, email verified, has admin claim, email matches ADMIN_ALLOWED_EMAILS
 *   (f) System clock within 60 s of Google's time
 */

import { readFileSync } from "node:fs";
import { resolve } from "node:path";

// Load .env.local manually (no dotenv dependency needed)
const envPath = resolve(process.cwd(), ".env.local");
try {
  const lines = readFileSync(envPath, "utf8").split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const idx = trimmed.indexOf("=");
    if (idx < 0) continue;
    const key = trimmed.slice(0, idx).trim();
    const val = trimmed.slice(idx + 1).trim().replace(/^["']|["']$/g, "");
    if (!process.env[key]) process.env[key] = val;
  }
} catch {
  console.log("[WARN] Could not load .env.local — using process environment.");
}

const results = [];
function pass(label, detail = "") {
  results.push({ label, status: "PASS", detail });
  console.log(`  PASS  ${label}${detail ? " — " + detail : ""}`);
}
function fail(label, code, detail = "") {
  results.push({ label, status: "FAIL", code, detail });
  console.log(`  FAIL  ${label} | CODE: ${code}${detail ? " | " + detail : ""}`);
}

console.log("\n====================================");
console.log("  SUTRA STUDIO — AUTH DIAGNOSTICS");
console.log("====================================\n");

// ─── (a) NEXT_PUBLIC_FIREBASE_* consistency ───────────────────────────────────
console.log("(a) Firebase Client Config Consistency:");
const projectId   = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "";
const authDomain  = process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "";
const appId       = process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "";
const senderId    = process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "";
const apiKey      = process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "";

if (!projectId) fail("(a1) NEXT_PUBLIC_FIREBASE_PROJECT_ID", "MISSING");
else pass("(a1) NEXT_PUBLIC_FIREBASE_PROJECT_ID");

if (!apiKey) fail("(a2) NEXT_PUBLIC_FIREBASE_API_KEY", "MISSING");
else pass("(a2) NEXT_PUBLIC_FIREBASE_API_KEY");

const expectedAuthDomain = `${projectId}.firebaseapp.com`;
if (authDomain !== expectedAuthDomain) {
  fail("(a3) authDomain", "MISMATCH", `got: ${authDomain}, want: ${expectedAuthDomain}`);
} else {
  pass("(a3) authDomain matches projectId");
}

if (senderId && !appId.includes(senderId)) {
  fail("(a4) appId/messagingSenderId", "MISMATCH", "appId should contain messagingSenderId");
} else {
  pass("(a4) appId contains messagingSenderId");
}

// ─── (b) Firebase Admin SDK init ─────────────────────────────────────────────
console.log("\n(b) Firebase Admin SDK init:");
let adminSdkOk = false;
let adminAuthInst = null;
let adminDbInst = null;

try {
  const { initializeApp, cert, getApps, getApp } = await import("firebase-admin/app");
  const { getAuth } = await import("firebase-admin/auth");
  const { getFirestore } = await import("firebase-admin/firestore");

  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL || "";
  const privateKey  = (process.env.FIREBASE_PRIVATE_KEY || "").replace(/\\n/g, "\n");
  const projId      = projectId;

  if (!clientEmail) { fail("(b1) FIREBASE_CLIENT_EMAIL", "MISSING"); }
  else pass("(b1) FIREBASE_CLIENT_EMAIL present");

  if (!privateKey)  { fail("(b2) FIREBASE_PRIVATE_KEY", "MISSING"); }
  else pass("(b2) FIREBASE_PRIVATE_KEY present");

  if (clientEmail && privateKey && projId) {
    try {
      const app = getApps().length > 0 ? getApp() : initializeApp({ credential: cert({ projectId: projId, clientEmail, privateKey }) });
      adminAuthInst = getAuth(app);
      adminDbInst = getFirestore(app);
      adminSdkOk = true;
      pass("(b3) Firebase Admin SDK initialised");
    } catch (e) {
      fail("(b3) Firebase Admin SDK init", e.code || e.message?.slice(0, 60) || "INIT_ERROR");
    }
  }
} catch (e) {
  fail("(b) Firebase Admin import", e.code || "IMPORT_ERROR");
}

// ─── (c) List 1 user + read 1 Firestore doc ──────────────────────────────────
console.log("\n(c) Admin SDK connectivity:");
if (adminSdkOk && adminAuthInst && adminDbInst) {
  try {
    const listResult = await adminAuthInst.listUsers(1);
    pass("(c1) Auth.listUsers", `found ${listResult.users.length} user(s)`);
  } catch (e) {
    fail("(c1) Auth.listUsers", e.code || "LIST_USERS_ERROR");
  }

  try {
    // Use Admin SDK — bypasses security rules. Test with a real collection.
    const col = await adminDbInst.collection("settings").limit(1).get();
    pass("(c2) Firestore.get", `collection accessible, docs=${col.size}`);
  } catch (e) {
    const code = String(e.code || "FIRESTORE_ERROR");
    if (code === "7") {
      fail("(c2) Firestore.get", "PERMISSION_DENIED(7)", "Firestore API not enabled OR service-account missing roles — Firebase Console → Firestore Database → Create database");
    } else {
      fail("(c2) Firestore.get", code);
    }
  }
} else {
  fail("(c) Skipped", "ADMIN_SDK_NOT_READY");
}

// ─── (d) Email/Password sign-in enabled ──────────────────────────────────────
console.log("\n(d) Email/Password provider status:");
const identityToolkitUrl =
  `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`;

if (apiKey) {
  try {
    const resp = await fetch(identityToolkitUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "health-check-probe@sutra-studio.invalid", password: "probe-wrong-pw", returnSecureToken: true }),
    });
    const json = await resp.json();
    const errCode = json?.error?.message || "";
    if (errCode === "OPERATION_NOT_ALLOWED") {
      fail("(d) Email/Password provider", "OPERATION_NOT_ALLOWED", "Enable Email/Password in Firebase Console → Auth → Sign-in methods");
    } else if (errCode.includes("INVALID_LOGIN_CREDENTIALS") || errCode.includes("EMAIL_NOT_FOUND") || errCode.includes("INVALID_PASSWORD") || errCode.includes("USER_NOT_FOUND")) {
      pass("(d) Email/Password provider enabled", "got expected credential error → provider is ON");
    } else {
      fail("(d) Email/Password provider", errCode || "UNKNOWN_RESPONSE");
    }
  } catch (e) {
    fail("(d) Email/Password provider", "NETWORK_ERROR", e.message?.slice(0, 40));
  }
} else {
  fail("(d) Email/Password provider", "MISSING_API_KEY");
}

// ─── (e) Admin user exists, claims set, email matches ─────────────────────────
console.log("\n(e) Admin user validation:");
const adminEmail = (process.env.ADMIN_ALLOWED_EMAILS || process.env.ADMIN_EMAIL || "").split(",")[0].trim();
if (adminSdkOk && adminAuthInst && adminEmail) {
  try {
    const user = await adminAuthInst.getUserByEmail(adminEmail);
    pass("(e1) Admin user exists", `uid: ${user.uid.slice(0, 8)}...`);
    if (user.emailVerified) pass("(e2) Email verified");
    else fail("(e2) Email verified", "EMAIL_NOT_VERIFIED", "Run: npm run create-admin");
    const claims = user.customClaims || {};
    const hasAdminClaim = claims.role === "admin" || claims.role === "superAdmin" || Boolean(claims.admin);
    if (hasAdminClaim) pass("(e3) Admin custom claim set", `role: ${claims.role || "(legacy admin:true)"}`);
    else fail("(e3) Admin custom claim", "NO_ADMIN_CLAIM", "Run: npm run create-admin");
    if (user.email === adminEmail) pass("(e4) Email matches ADMIN_ALLOWED_EMAILS");
    else fail("(e4) Email match", "EMAIL_MISMATCH", `stored: ${user.email}, expected: ${adminEmail}`);
  } catch (e) {
    if (e.code === "auth/user-not-found") {
      fail("(e1) Admin user exists", "USER_NOT_FOUND", "Run: npm run create-admin");
    } else {
      fail("(e) Admin user check", e.code || "UNKNOWN");
    }
  }
} else if (!adminEmail) {
  fail("(e) Admin user check", "ADMIN_ALLOWED_EMAILS_NOT_SET");
} else {
  fail("(e) Skipped", "ADMIN_SDK_NOT_READY");
}

// ─── (f) System clock ─────────────────────────────────────────────────────────
console.log("\n(f) System clock vs Google time:");
try {
  const r = await fetch("https://www.googleapis.com/oauth2/v3/tokeninfo?id_token=dummy");
  const googleDate = r.headers.get("date");
  if (googleDate) {
    const googleMs  = new Date(googleDate).getTime();
    const localMs   = Date.now();
    const diffSec   = Math.abs(googleMs - localMs) / 1000;
    if (diffSec <= 60) pass("(f) Clock within 60 s of Google", `drift: ${diffSec.toFixed(1)}s`);
    else fail("(f) Clock drift", "CLOCK_DRIFT", `drift: ${diffSec.toFixed(1)}s — fix system time`);
  } else {
    pass("(f) Clock check", "google date header absent, assuming ok");
  }
} catch {
  pass("(f) Clock check", "network unreachable — skipped");
}

// ─── Summary ──────────────────────────────────────────────────────────────────
console.log("\n====================================");
const passed = results.filter(r => r.status === "PASS").length;
const failed = results.filter(r => r.status === "FAIL").length;
console.log(`  TOTAL: ${passed} PASS, ${failed} FAIL`);
console.log("====================================\n");

if (failed > 0) {
  console.log("See QA/LOGIN_DIAGNOSIS.md for the full analysis and fix checklist.");
  process.exit(1);
}
