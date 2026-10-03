/**
 * SUTRA STUDIO — Secure Administrative Role Provisioning
 *
 * Creates (or locates) the studio administrator in Firebase Auth, sets its
 * password, and assigns the ONLY thing that grants admin access: the custom
 * claim { role: "admin", admin: true }.
 *
 * Security rules honoured here:
 *  - The password is NEVER read from source code or committed anywhere. It is
 *    taken from the ADMIN_PASSWORD environment variable (or stdin) at runtime
 *    and handed straight to Firebase Auth, which stores only a hash.
 *  - The claim can only be set with server-side service-account credentials.
 *    A client cannot mint or escalate its own role through the browser.
 *  - No secret value is ever printed to the console.
 *
 * Usage:
 *   set ADMIN_PASSWORD=<the password>
 *   npx tsx scripts/set-admin-claim.ts [admin_email]
 *
 *   The email defaults to ADMIN_EMAIL from .env.local.
 *
 * Requires a service-account credential, supplied via FIREBASE_SERVICE_ACCOUNT
 * (path to the downloaded JSON) or FIREBASE_PRIVATE_KEY + FIREBASE_CLIENT_EMAIL.
 * If neither is available the script stops with a clear message instead of
 * silently degrading to default credentials.
 */

import * as fs from "node:fs";
import * as path from "node:path";
import * as firebaseAdmin from "firebase-admin";

/* ------------------------------------------------------------------ */
/* Minimal .env.local loader (no dotenv dependency)                    */
/* ------------------------------------------------------------------ */

function loadEnvLocal(): void {
  const candidates = [
    path.resolve(process.cwd(), ".env.local"),
    path.resolve(process.cwd(), ".env"),
  ];
  for (const file of candidates) {
    if (!fs.existsSync(file)) continue;
    const text = fs.readFileSync(file, "utf8");
    for (const rawLine of text.split(/\r?\n/)) {
      const line = rawLine.trim();
      if (!line || line.startsWith("#")) continue;
      const eq = line.indexOf("=");
      if (eq <= 0) continue;
      const key = line.slice(0, eq).trim();
      // Real process env always wins over the file.
      if (process.env[key]) continue;
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
}

function requireKey(name: string): string | null {
  const value = process.env[name]?.trim();
  return value ? value : null;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Boots firebase-admin from whichever credential source is available.
 *
 * Option A (easiest): FIREBASE_SERVICE_ACCOUNT=/path/to/service-account.json
 *   — the exact file Firebase downloads when you click "Generate new private
 *     key". No reformatting, no single-line escaping.
 * Option B: FIREBASE_PRIVATE_KEY (single line, \n escapes) + FIREBASE_CLIENT_EMAIL
 *
 * Exits with a clear message if neither is present, rather than silently
 * falling back to default credentials that cannot work.
 */
function initAdminSdk(): any {
  const admin: any = firebaseAdmin;
  if (admin.apps.length) return admin;

  const projectId =
    requireKey("NEXT_PUBLIC_FIREBASE_PROJECT_ID") ?? requireKey("FIREBASE_PROJECT_ID");

  const jsonPath = requireKey("FIREBASE_SERVICE_ACCOUNT");
  if (jsonPath) {
    if (!fs.existsSync(jsonPath)) {
      console.error(`FIREBASE_SERVICE_ACCOUNT points to a missing file: ${jsonPath}`);
      process.exit(1);
    }
    const json = JSON.parse(fs.readFileSync(jsonPath, "utf8")) as {
      projectId?: string;
      project_id?: string;
      clientEmail?: string;
      client_email?: string;
      privateKey?: string;
      private_key?: string;
    };
    const resolvedEmail = json.clientEmail ?? json.client_email;
    const resolvedKey = json.privateKey ?? json.private_key;
    if (!resolvedEmail || !resolvedKey) {
      console.error(`FIREBASE_SERVICE_ACCOUNT file is missing client_email/private_key: ${jsonPath}`);
      process.exit(1);
    }
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: json.projectId ?? json.project_id ?? projectId,
        clientEmail: resolvedEmail,
        privateKey: resolvedKey,
      }),
    });
    return admin;
  }

  const clientEmail = requireKey("FIREBASE_CLIENT_EMAIL");
  const privateKey = requireKey("FIREBASE_PRIVATE_KEY");

  if (projectId && clientEmail && privateKey) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey: privateKey.replace(/\\n/g, "\n"),
      }),
    });
    return admin;
  }

  console.error("Cannot authenticate to Firebase: no service account available.");
  console.error("Provide ONE of the following in .env.local:");
  console.error("  1) FIREBASE_SERVICE_ACCOUNT=/path/to/service-account.json");
  console.error("  2) FIREBASE_PRIVATE_KEY=<single-line key> + FIREBASE_CLIENT_EMAIL=<email>");
  console.error(
    "Firebase console → Project settings → Service accounts → Generate new private key."
  );
  process.exit(1);
}

async function verifyAdmin(): Promise<void> {
  loadEnvLocal();

  const targetEmail = (process.argv[3] || process.env.ADMIN_EMAIL || "").trim();
  if (!targetEmail) {
    console.error("Usage: npx tsx scripts/set-admin-claim.ts --verify [email]");
    process.exit(1);
  }

  // Exits with instructions if no service account is configured.
  const admin = initAdminSdk();

  try {
    const record = await admin.auth().getUserByEmail(targetEmail);
    const claims = record.customClaims ?? {};
    const isAdmin = claims.role === "admin";
    console.log(`Admin claim for ${targetEmail}: ${isAdmin ? "PRESENT (role=admin)" : "MISSING"}`);
    console.log(`Email verified: ${record.emailVerified ? "yes" : "no"}`);
    console.log(`UID: ${record.uid}`);
    process.exit(isAdmin ? 0 : 1);
  } catch (error: unknown) {
    console.error(
      "Verify failed:",
      error instanceof Error ? error.message : String(error)
    );
    process.exit(1);
  }
}

async function provisionAdmin(): Promise<void> {
  loadEnvLocal();

  const targetEmail = (
    process.argv[2] ||
    process.env.ADMIN_EMAIL ||
    ""
  ).trim();

  // Password comes from the environment or argv, never from this file.
  const password =
    process.env.ADMIN_PASSWORD?.trim() ||
    (process.argv[3] && process.argv[3] !== "--" ? process.argv[3] : "") ||
    "";

  console.log("===============================================================================");
  console.log("SUTRA STUDIO — ADMINISTRATIVE CLAIM PROVISIONER");
  console.log("===============================================================================");

  if (!targetEmail) {
    console.error(
      "No admin email given.\n" +
        "  Pass it as an argument, or set ADMIN_EMAIL in .env.local.\n" +
        "  Example: npx tsx scripts/set-admin-claim.ts you@example.com"
    );
    process.exit(1);
  }
  console.log(`Target admin email: ${targetEmail}`);

  // Exits with instructions if no service account is configured.
  const admin = initAdminSdk();
  console.log("Firebase Admin SDK ready.");

  const auth = admin.auth();
  let userRecord: unknown;

  try {
    userRecord = await auth.getUserByEmail(targetEmail);
    console.log("Located existing Firebase Auth user.");
  } catch (err: unknown) {
    const code = (err as { code?: string })?.code;
    if (code !== "auth/user-not-found") throw err;
    if (!password) {
      console.error(
        `No Firebase Auth user exists for ${targetEmail}, and no password was supplied.\n` +
          "  Set ADMIN_PASSWORD for this run, then re-run."
      );
      process.exit(1);
    }
    console.log("Creating new administrator account in Firebase Auth...");
    userRecord = await auth.createUser({
      email: targetEmail,
      password,
      emailVerified: true,
      displayName: "Studio Executive Producer",
    });
    console.log("Created administrator account.");
  }

  const uid = (userRecord as { uid: string }).uid;

  // Set/rotate the password when one was provided for this run.
  if (password) {
    await auth.updateUser(uid, { password, emailVerified: true });
    console.log("Password applied to the administrator account.");
  } else {
    console.log("No password supplied this run; existing password left untouched.");
  }

  // The claim is the single authorisation source for every admin route,
  // Firestore rule and Storage rule.
  await auth.setCustomUserClaims(uid, {
    role: "admin",
    admin: true,
    assignedAt: new Date().toISOString(),
  });

  console.log("-------------------------------------------------------------------------------");
  console.log("SUCCESS: custom claim { role: \"admin\" } assigned.");
  console.log(`UID: ${uid}`);
  console.log("-------------------------------------------------------------------------------");
  console.log("Next: sign out and back in so the new claim is picked up, then verify with");
  console.log("      npx tsx scripts/set-admin-claim.ts --verify");
  process.exit(0);
}

function fail(error: unknown): never {
  const message = error instanceof Error ? error.message : String(error);
  console.error("Failed:", message);
  process.exit(1);
}

if (process.argv[2] === "--verify") {
  verifyAdmin().catch(fail);
} else {
  provisionAdmin().catch(fail);
}
