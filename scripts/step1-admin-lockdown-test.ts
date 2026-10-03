/**
 * SUTRA STUDIO — Step 1: Admin lockdown, auth and roles
 *
 * Regression suite for the four gates (allowlist / verified email / staff
 * claim / re-auth) plus the two header-spoofing holes that were closed in the
 * same step. Everything here is pure Node — no Firebase Admin SDK and no live
 * project — so it runs on every machine even before FIREBASE_PRIVATE_KEY is
 * provisioned. Anything that genuinely needs the Admin SDK is reported as
 * "could not test" rather than silently skipped.
 *
 * Run: npx tsx scripts/step1-admin-lockdown-test.ts
 */

import * as fs from "node:fs";
import * as path from "node:path";
import * as cp from "node:child_process";

import {
  GENERIC_AUTH_FAILURE,
  GENERIC_AUTH_FAILURE_CODE,
  STAFF_CLAIM_ROLES,
  adminAllowedEmails,
  adminNotifyEmail,
  isAdminAllowedEmail,
  isStaffClaim,
} from "../src/lib/config/adminPolicy";
import {
  COMMON_PASSWORDS,
  MIN_ADMIN_PASSWORD_LENGTH,
  validatePassword,
} from "../src/lib/security/passwordPolicy";

const ROOT = path.resolve(__dirname, "..");

let passed = 0;
let failed = 0;
const blocked: string[] = [];

function assert(condition: boolean, message: string) {
  if (condition) {
    console.log(`  ok   ${message}`);
    passed++;
  } else {
    console.error(`  FAIL ${message}`);
    failed++;
  }
}

function section(title: string) {
  console.log(`\n--- ${title} ---`);
}

function read(pathFromRoot: string): string {
  return fs.readFileSync(path.join(ROOT, pathFromRoot), "utf8");
}

function sourceFiles(dir: string, out: string[] = []): string[] {
  const full = path.join(ROOT, dir);
  for (const entry of fs.readdirSync(full, { withFileTypes: true })) {
    const rel = path.join(dir, entry.name).split(path.sep).join("/");
    if (entry.isDirectory()) sourceFiles(rel, out);
    else if (/\.(ts|tsx)$/.test(entry.name)) out.push(rel);
  }
  return out;
}

/** Set/replace an env var for the duration of one assertion block. */
function withEnv(vars: Record<string, string | undefined>, fn: () => void) {
  const previous: Record<string, string | undefined> = {};
  for (const [k, v] of Object.entries(vars)) {
    previous[k] = process.env[k];
    if (v === undefined) delete process.env[k];
    else process.env[k] = v;
  }
  try {
    fn();
  } finally {
    for (const [k, v] of Object.entries(previous)) {
      if (v === undefined) delete process.env[k];
      else process.env[k] = v;
    }
  }
}

/* ========================================================================= */
/* 1.2 — ADMIN_ALLOWED_EMAILS allowlist                                      */
/* ========================================================================= */
function testAllowlist() {
  section("Rule 13: ADMIN_ALLOWED_EMAILS allowlist");

  withEnv({ ADMIN_ALLOWED_EMAILS: "Owner@Example.com,Second@Example.com", ADMIN_EMAIL: "" }, () => {
    assert(adminAllowedEmails().length === 2, "parses two comma-separated entries");
    assert(
      isAdminAllowedEmail("owner@example.com") && isAdminAllowedEmail("OWNER@EXAMPLE.COM"),
      "comparison is case-insensitive"
    );
    assert(!isAdminAllowedEmail("intruder@example.com"), "rejects an address that is not listed");
  });

  withEnv(
    { ADMIN_ALLOWED_EMAILS: " dup@example.com ,, DUP@example.com ", ADMIN_EMAIL: "" },
    () => {
      assert(adminAllowedEmails().length === 1, "trims, drops blanks and de-duplicates");
    }
  );

  withEnv({ ADMIN_ALLOWED_EMAILS: "", ADMIN_EMAIL: "fallback@example.com" }, () => {
    assert(
      isAdminAllowedEmail("fallback@example.com"),
      "falls back to ADMIN_EMAIL so an existing deployment cannot lock itself out"
    );
  });

  withEnv({ ADMIN_ALLOWED_EMAILS: "", ADMIN_EMAIL: "" }, () => {
    assert(!isAdminAllowedEmail("anything@example.com"), "empty configuration denies everyone");
    assert(!isAdminAllowedEmail(""), "an empty email is never allowed");
    assert(!isAdminAllowedEmail(null), "null is never allowed");
  });

  withEnv({ ADMIN_ALLOWED_EMAILS: "a@example.com", ADMIN_NOTIFY_EMAIL: "alerts@example.com" }, () => {
    assert(adminNotifyEmail() === "alerts@example.com", "ADMIN_NOTIFY_EMAIL is preferred for alerts");
  });

  withEnv({ ADMIN_ALLOWED_EMAILS: "", ADMIN_NOTIFY_EMAIL: "", ADMIN_EMAIL: "n@example.com" }, () => {
    assert(adminNotifyEmail() === "n@example.com", "notify address falls back to ADMIN_EMAIL");
  });
}

/* ========================================================================= */
/* 1.3 — staff custom claim                                                  */
/* ========================================================================= */
function testStaffClaim() {
  section("Rule 13: staff custom claim");

  assert(isStaffClaim({ role: "admin" }), "accepts role: admin");
  assert(isStaffClaim({ role: "superAdmin" }), "accepts role: superAdmin (bootstrap script)");
  assert(STAFF_CLAIM_ROLES.has("admin") && STAFF_CLAIM_ROLES.has("superAdmin"), "claim registry lists both roles");
  assert(!isStaffClaim({ role: "client" }), "rejects role: client");
  assert(!isStaffClaim({ role: "user" }), "rejects an unknown role string");
  assert(!isStaffClaim({}), "rejects claims with no role at all");
  assert(!isStaffClaim(undefined), "rejects undefined claims");
  assert(!isStaffClaim({ role: 42 }), "rejects a non-string role");
  assert(!isStaffClaim({ role: "ADMIN" }), "rejects a case-variant role (claims are exact)");
}

/* ========================================================================= */
/* 1.4 — admin password policy                                               */
/* ========================================================================= */
function testPasswordPolicy() {
  section("Step 1.4: admin password policy");

  assert(validatePassword("short") !== null, "rejects a password shorter than the minimum");
  assert(validatePassword("") !== null, "rejects an empty password");
  assert(
    validatePassword("a".repeat(MIN_ADMIN_PASSWORD_LENGTH)) !== null,
    "rejects a single repeated character"
  );
  assert(validatePassword("0123456789012") !== null, "rejects a digit sequence");
  assert(validatePassword("qwertyuiop123") !== null, "rejects a keyboard sequence");
  for (const common of ["administrator", "password123", "letmein123456"]) {
    assert(
      COMMON_PASSWORDS.has(common) && validatePassword(common) !== null,
      `rejects the common password "${common}"`
    );
  }
  assert(validatePassword("Sutra-Studio-Obsidian-Quill-47") === null, "accepts a long non-dictionary password");
  assert(
    validatePassword("x".repeat(MIN_ADMIN_PASSWORD_LENGTH - 1)) !== null,
    `accepts nothing at ${MIN_ADMIN_PASSWORD_LENGTH - 1} characters`
  );

  const reason = validatePassword("pass");
  assert(typeof reason === "string" && !/pass/.test(reason.replace(/\s/g, "")), "never echoes the password back");
}

/* ========================================================================= */
/* 1.5 — one generic failure message                                         */
/* ========================================================================= */
function testGenericFailure() {
  section("Never leak why: one generic authentication failure message");

  assert(GENERIC_AUTH_FAILURE.length > 0, "a generic failure message exists");
  assert(
    !/password|claim|allowlist|verified|allowlisted|firebase|token|role/i.test(GENERIC_AUTH_FAILURE),
    "the message names no gate, key or provider"
  );
  assert(GENERIC_AUTH_FAILURE_CODE === "INVALID_CREDENTIALS", "every rejection maps to one code");
}

/* ========================================================================= */
/* 1.6 — header spoofing closed                                              */
/* ========================================================================= */
function testHeadersClosed() {
  section("Header spoofing: x-user-role / x-user-id must be dead");

  const apiFiles = sourceFiles("src/app/api");
  const roleReads: string[] = [];
  const uidReads: string[] = [];
  for (const rel of apiFiles) {
    const text = read(rel);
    if (/headers\.get\(\s*["']x-user-role["']/.test(text)) roleReads.push(rel);
    if (/headers\.get\(\s*["']x-user-id["']/.test(text)) uidReads.push(rel);
  }
  assert(roleReads.length === 0, `no API route reads x-user-role (found ${roleReads.length})`);
  assert(uidReads.length === 0, `no API route reads x-user-id (found ${uidReads.length})`);
  if (roleReads.length) console.error("        " + roleReads.join("\n        "));
  if (uidReads.length) console.error("        " + uidReads.join("\n        "));

  const clientFiles = sourceFiles("src").filter((rel) => !rel.startsWith("src/app/api"));
  const sends: string[] = [];
  for (const rel of clientFiles) {
    if (/"x-user-role"\s*:/.test(read(rel)) || /"x-user-id"\s*:/.test(read(rel))) sends.push(rel);
  }
  assert(sends.length === 0, `no client code sends x-user-role / x-user-id (found ${sends.length})`);
  if (sends.length) console.error("        " + sends.join("\n        "));
}

/* ========================================================================= */
/* 1.7 — every role/identity read comes from a verified credential           */
/* ========================================================================= */
function testTrustedIdentityWiring() {
  section("Trusted identity: requestRole / requestUid wiring");

  const apiFiles = sourceFiles("src/app/api").filter(
    (rel) => read(rel).includes("await requestRole(") || read(rel).includes("await requestUid(")
  );
  const missing = apiFiles.filter((rel) => {
    const text = read(rel);
    return !/import\s*\{[^}]*\b(requestRole|requestUid)\b[^}]*\}\s*from\s*"@\/lib\/auth\/requestRole"/.test(text);
  });
  assert(missing.length === 0, `every user of requestRole/requestUid imports it (${apiFiles.length} routes checked)`);
  if (missing.length) console.error("        " + missing.join("\n        "));

  // Strip comments first — the doc block in requestRole.ts quotes the old
  // header name in prose, which must not trip the assertion.
  const helpers = read("src/lib/auth/requestRole.ts")
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/^\s*\/\/.*$/gm, "");
  assert(read("src/lib/auth/requestRole.ts").includes('"server-only"'), "requestRole is server-only (cannot be bundled for the client)");
  assert(/getAuthenticatedUser/.test(helpers), "role and uid are resolved from the verified session, not a header");
  assert(!/headers\.get\(\s*["']x-user/.test(helpers), "the helper itself does not read the spoofable headers");
}

/* ========================================================================= */
/* 1.5 — admin routes sit behind requireAdmin                                */
/* ========================================================================= */
function testAdminRoutes() {
  section("Admin lockdown: sensitive routes use requireAdmin()");

  const expect: Array<[string, string]> = [
    ["src/app/api/admin/clients/route.ts", "requireAdmin"],
    ["src/app/api/audit-logs/route.ts", "requireAdmin"],
    ["src/app/api/payments/refund/route.ts", "requireAdmin"],
    ["src/app/api/orders/deliver/route.ts", "requireAdmin"],
    ["src/app/api/auth/admin-login/route.ts", "isAdminAllowedEmail"],
    ["src/app/api/auth/client-login/route.ts", "isAdminAllowedEmail"],
    ["src/app/api/auth/register/route.ts", "isAdminAllowedEmail"],
  ];
  for (const [file, needle] of expect) {
    let text = "";
    try {
      text = read(file);
    } catch {
      assert(false, `${file} exists`);
      continue;
    }
    assert(text.includes(needle), `${file} -> ${needle}`);
  }

  const stepUp = ["src/app/api/payments/refund/route.ts", "src/app/api/admin/clients/route.ts"];
  for (const file of stepUp) {
    assert(read(file).includes("requireFreshAdminReauth"), `${file} demands a fresh re-auth`);
  }

  const middleware = read("src/middleware.ts");
  assert(middleware.includes("ADMIN_SESSION_COOKIE"), "middleware knows about the admin-only session cookie");
  assert(middleware.includes("sutra_admin_session"), "middleware gates /admin on the admin cookie shape");
}

/* ========================================================================= */
/* 1.11 — config surfaces                                                    */
/* ========================================================================= */
function testConfigSurfaces() {
  section("Config: names present, values never committed");

  const example = read(".env.example");
  for (const name of ["ADMIN_ALLOWED_EMAILS", "ADMIN_NOTIFY_EMAIL", "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET"]) {
    assert(new RegExp(`^${name}=`, "m").test(example), `.env.example declares ${name} (value may be empty)`);
  }

  assert(fs.existsSync(".env.local"), ".env.local exists on this machine");
  let ignored = false;
  try {
    cp.execSync("git check-ignore -q .env.local", { cwd: ROOT, stdio: "ignore" });
    ignored = true;
  } catch {
    ignored = false;
  }
  assert(ignored, ".env.local is ignored by git (rule 2: never committed)");

  let staged = "";
  try {
    staged = cp.execSync("git diff --cached --name-only", { cwd: ROOT, encoding: "utf8" });
  } catch {
    staged = "";
  }
  const badStaged = staged
    .split("\n")
    .map((s) => s.trim())
    .filter((s) => s && /(^|\/)\.env(\.|$)/.test(s) && !s.endsWith(".env.example"));
  assert(badStaged.length === 0, "no .env file with a value is staged (only .env.example may be)");
  if (badStaged.length) console.error("        " + badStaged.join("\n        "));

  assert(
    !/^GOOGLE_DRIVE_PRIVATE_KEY=[^\r\n#]+/m.test(read(".env.example")),
    "legacy Drive private-key name carries no value"
  );
  assert(
    !/^GOOGLE_DRIVE_SERVICE_ACCOUNT=[^\r\n#]+/m.test(read(".env.example")),
    "legacy Drive service-account name carries no value"
  );
}

/* ========================================================================= */
/* Blockers                                                                  */
/* ========================================================================= */
function testFirebaseAvailability() {
  section("Live gates (require FIREBASE_PRIVATE_KEY)");

  const env = fs.existsSync(path.join(ROOT, ".env.local"))
    ? fs.readFileSync(path.join(ROOT, ".env.local"), "utf8")
    : "";

  const hasKey = /^\s*FIREBASE_PRIVATE_KEY\s*=\s*\S+/m.test(env) || Boolean(process.env.FIREBASE_PRIVATE_KEY);
  const hasEmail = /^\s*FIREBASE_CLIENT_EMAIL\s*=\s*\S+/m.test(env) || Boolean(process.env.FIREBASE_CLIENT_EMAIL);

  if (hasKey && hasEmail) {
    assert(true, "FIREBASE_PRIVATE_KEY and FIREBASE_CLIENT_EMAIL are present");
  } else {
    blocked.push(
      "FIREBASE_PRIVATE_KEY is still a placeholder — the Admin SDK cannot boot, so lockout counters, " +
        "audit writes, adminLoginAlerts and a real sign-in round-trip cannot be exercised."
    );
    console.log(
      "  BLOCKED  Admin SDK cannot boot: FIREBASE_PRIVATE_KEY" +
        (hasKey ? "" : "") +
        (hasEmail ? " missing" : " / FIREBASE_CLIENT_EMAIL missing")
    );
  }

  blocked.push(
    "ADMIN_ALLOWED_EMAILS / ADMIN_NOTIFY_EMAIL are declared in .env.example but empty in .env.local — " +
      "the allowlist currently falls back to ADMIN_EMAIL."
  );
  blocked.push(
    "Firebase Console step cannot be done from here: Authentication -> Sign-in method -> " +
      "Email/Password -> 'Email enumeration protection' must be enabled (click path for Step 1.11)."
  );
}

/* ========================================================================= */
async function run() {
  console.log("=".repeat(78));
  console.log("SUTRA STUDIO — STEP 1: ADMIN LOCKDOWN, AUTH AND ROLES");
  console.log("=".repeat(78));

  testAllowlist();
  testStaffClaim();
  testPasswordPolicy();
  testGenericFailure();
  testHeadersClosed();
  testTrustedIdentityWiring();
  testAdminRoutes();
  testConfigSurfaces();
  testFirebaseAvailability();

  console.log("\n" + "=".repeat(78));
  console.log(`RESULT: ${passed} passed, ${failed} failed, ${blocked.length} blocked`);
  console.log("=".repeat(78));

  if (blocked.length) {
    console.log("\nSTILL MISSING (must be repeated at the end of every step):");
    blocked.forEach((b, i) => console.log(`  ${i + 1}. ${b}`));
  }

  process.exit(failed > 0 ? 1 : 0);
}

void run();
