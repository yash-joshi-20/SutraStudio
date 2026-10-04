#!/usr/bin/env node

/**
 * ==============================================================================
 * SUTRA STUDIO — STEP 31C: CREATE-ADMIN PROVISIONING SCRIPT
 * ==============================================================================
 * Creates or resets the authorized administrator account in Firebase Authentication:
 * 1. Strictly provisions only the email defined in ADMIN_EMAIL (.env.local)
 * 2. Sets custom claim role="admin" and emailVerified=true
 * 3. Initial password is read ONLY from ADMIN_INITIAL_PASSWORD env var or hidden terminal prompt
 * 4. Refuses any email other than ADMIN_EMAIL
 * 5. Refuses to overwrite an existing admin unless passed explicit --reset flag
 * 6. NEVER logs, echoes, stores in Firestore, or writes password to any file
 * ==============================================================================
 */

import * as fs from "node:fs";
import * as path from "node:path";
import * as firebaseAdmin from "firebase-admin";

const ROOT_DIR = process.cwd();

function loadEnvLocal(): void {
  const file = path.join(ROOT_DIR, ".env.local");
  if (!fs.existsSync(file)) return;
  for (const rawLine of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq <= 0) continue;
    const key = line.slice(0, eq).trim();
    if (process.env[key] !== undefined) continue;
    let value = line.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    process.env[key] = value;
  }
}

function initAdminSdk(): firebaseAdmin.app.App {
  const existing = firebaseAdmin.apps;
  if (existing.length > 0) return existing[0]!;

  const projectId =
    (process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? "").trim() ||
    (process.env.FIREBASE_PROJECT_ID ?? "").trim();

  const clientEmail = (process.env.FIREBASE_CLIENT_EMAIL ?? "").trim();
  const privateKey = (process.env.FIREBASE_PRIVATE_KEY ?? "").trim();

  if (!projectId || !clientEmail || !privateKey) {
    console.error("\n❌ ERROR: Missing Firebase Admin SDK credentials in .env.local.");
    console.error("Required: FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY, NEXT_PUBLIC_FIREBASE_PROJECT_ID\n");
    process.exit(2);
  }

  return firebaseAdmin.initializeApp({
    credential: firebaseAdmin.credential.cert({
      projectId,
      clientEmail,
      privateKey: privateKey.replace(/\\n/g, "\n"),
    }),
    projectId,
  });
}

function promptHidden(question: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const stdin = process.stdin;
    const stdout = process.stdout;
    if (!stdin.isTTY) {
      reject(
        new Error(
          "Interactive TTY not available. Pass password via one-time env var: ADMIN_INITIAL_PASSWORD=... npx tsx scripts/create-admin.ts"
        )
      );
      return;
    }
    stdout.write(question);
    const wasRaw = stdin.isRaw ?? false;
    stdin.setRawMode?.(true);
    stdin.resume();
    stdin.setEncoding("utf8");

    let value = "";
    const finish = (result: string) => {
      stdin.removeListener("data", onData);
      stdin.setRawMode?.(wasRaw);
      stdin.pause();
      stdout.write("\n");
      resolve(result);
    };
    const onData = (chunk: string) => {
      for (const ch of chunk) {
        if (ch === "\n" || ch === "\r" || ch === "\u0004") return finish(value);
        if (ch === "\u0003") {
          stdout.write("\n");
          process.exit(130);
        }
        if (ch === "\u007f" || ch === "\b") {
          value = value.slice(0, -1);
          stdout.write("\b \b");
          continue;
        }
        value += ch;
        stdout.write("*");
      }
    };
    stdin.on("data", onData);
  });
}

async function acquirePassword(): Promise<string> {
  const fromEnv = process.env.ADMIN_INITIAL_PASSWORD || process.env.ADMIN_BOOTSTRAP_PASSWORD;
  if (fromEnv && fromEnv.trim()) {
    const trimmed = fromEnv.trim();
    if (trimmed.length < 14) {
      console.error("\n❌ ERROR: Password must be at least 14 characters long.");
      process.exit(2);
    }
    return trimmed;
  }

  for (let attempt = 0; attempt < 3; attempt++) {
    const first = await promptHidden("  Enter admin password (min 14 chars, hidden): ");
    if (first.length < 14) {
      console.error("  ❌ Password must be at least 14 characters.");
      continue;
    }
    const second = await promptHidden("  Confirm password (hidden): ");
    if (first !== second) {
      console.error("  ❌ Passwords do not match. Please retry.");
      continue;
    }
    return first;
  }

  console.error("❌ Too many failed password attempts.");
  process.exit(2);
}

async function main(): Promise<void> {
  loadEnvLocal();

  const isReset = process.argv.includes("--reset");
  const targetEmail = (process.env.ADMIN_EMAIL || "").trim().toLowerCase();

  if (!targetEmail || !targetEmail.includes("@")) {
    console.error("\n❌ ERROR: ADMIN_EMAIL is not defined or invalid in .env.local.");
    console.error("Please ensure ADMIN_EMAIL (e.g. yashjoshi20@zohomail.in) is set in .env.local.\n");
    process.exit(2);
  }

  console.log("\n========================================================");
  console.log("   SUTRA STUDIO — STEP 31C: ADMIN PROVISIONING ENCLAVE  ");
  console.log("========================================================\n");
  console.log(`  Target Admin Identity: ${targetEmail}`);
  console.log(`  Reset Existing Flag  : ${isReset ? "ENABLED (--reset)" : "DISABLED"}`);

  const app = initAdminSdk();
  const auth = firebaseAdmin.auth(app);

  let existingUser: firebaseAdmin.auth.UserRecord | null = null;
  try {
    existingUser = await auth.getUserByEmail(targetEmail);
  } catch (err: any) {
    if (err.code !== "auth/user-not-found") {
      throw err;
    }
  }

  if (existingUser && !isReset) {
    console.log(`\n  ⚠️ Administrator account for ${targetEmail} ALREADY EXISTS (UID: ${existingUser.uid}).`);
    console.log("  To safely update password and re-issue claims, run with the explicit flag:");
    console.log(`  npx tsx scripts/create-admin.ts --reset\n`);
    await app.delete();
    process.exit(0);
  }

  const password = await acquirePassword();
  let uid = "";

  if (existingUser) {
    uid = existingUser.uid;
    await auth.updateUser(uid, {
      password,
      emailVerified: true,
      displayName: existingUser.displayName || "Studio Administrator",
      disabled: false,
    });
    console.log(`  ✓ Successfully updated password and credentials for ${targetEmail}`);
  } else {
    const newUser = await auth.createUser({
      email: targetEmail,
      password,
      emailVerified: true,
      displayName: "Studio Administrator",
    });
    uid = newUser.uid;
    console.log(`  ✓ Successfully created Firebase Auth user for ${targetEmail} (UID: ${uid})`);
  }

  // Set authoritative custom claims
  await auth.setCustomUserClaims(uid, {
    role: "admin",
    staffRole: "admin",
    superAdmin: true,
    admin: true,
    provisionedAt: new Date().toISOString(),
  });

  // Revoke all existing refresh tokens for security
  await auth.revokeRefreshTokens(uid);

  // Clean up in-memory app instance
  await app.delete();

  console.log("\n========================================================");
  console.log("  ✅ ADMIN PROVISIONING COMPLETE");
  console.log("========================================================");
  console.log(`  • Email          : ${targetEmail}`);
  console.log(`  • Custom Claim   : role=admin (emailVerified=true)`);
  console.log(`  • Active Session : Tokens revoked (clean login required)`);
  console.log("\n  IMPORTANT SECURITY DIRECTIVES:");
  console.log("  1. If you set ADMIN_INITIAL_PASSWORD in .env.local, DELETE IT NOW.");
  console.log("  2. Never commit, log, or share the admin password.");
  console.log("  3. Sign in securely at: http://localhost:3000/admin/login\n");
}

main().catch((err) => {
  console.error("\n❌ PROVISIONING FAILED:", err.message || err);
  process.exit(1);
});
