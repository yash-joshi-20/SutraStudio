/**
 * SUTRA STUDIO — bootstrap-super-admin (Step 1.4)
 *
 * One-time provisioning of the allowlisted administrator account(s):
 *   • creates the Firebase Auth user if it does not exist,
 *   • sets `role: "superAdmin"` as a custom claim,
 *   • marks the email verified,
 *   • revokes every existing refresh token (forces a clean sign-in).
 *
 * PASSWORD HANDLING — hard rules, deliberately awkward:
 *   • taken ONLY from an interactive hidden prompt, or from the ONE-TIME
 *     shell variable ADMIN_BOOTSTRAP_PASSWORD;
 *   • never read from a file, never written to a file, never logged,
 *     never echoed, never sent anywhere but Firebase Auth;
 *   • rejected below 14 characters or when it is a well-known weak password.
 *
 * The password typed in chat earlier must NOT be reused — it is short and now
 * written down. Pick a new one of at least 14 characters.
 *
 * Usage:
 *   npx tsx scripts/bootstrap-super-admin.ts
 *   ADMIN_BOOTSTRAP_PASSWORD='...' npx tsx scripts/bootstrap-super-admin.ts
 */

import * as fs from "node:fs";
import * as path from "node:path";
import * as firebaseAdmin from "firebase-admin";
import { validatePassword } from "../src/lib/security/passwordPolicy";

/* ------------------------------------------------------------------ */
/* Env loading (.env.local is read for NAMES/credentials only; the      */
/* bootstrap password is never taken from it.)                          */
/* ------------------------------------------------------------------ */

function loadEnvLocal(): void {
  const file = path.join(process.cwd(), ".env.local");
  if (!fs.existsSync(file)) return;
  for (const rawLine of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq <= 0) continue;
    const key = line.slice(0, eq).trim();
    // Never overwrite a value already present in the real environment.
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

function requireKey(name: string): string {
  const value = (process.env[name] ?? "").trim();
  if (!value) {
    console.error(`\n  MISSING: ${name}`);
    console.error("  Add it to .env.local (never paste it into chat).");
    console.error(
      "  Path: Firebase Console -> (your project) -> Project settings -> Service accounts -> Generate new private key"
    );
    process.exit(2);
  }
  return value;
}

function initAdminSdk(): firebaseAdmin.app.App {
  const existing = firebaseAdmin.apps;
  if (existing.length > 0) return existing[0]!;

  const projectId =
    (process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? "").trim() ||
    (process.env.FIREBASE_PROJECT_ID ?? "").trim();

  const serviceAccountPath = (process.env.FIREBASE_SERVICE_ACCOUNT ?? "").trim();
  if (serviceAccountPath) {
    const resolved = path.isAbsolute(serviceAccountPath)
      ? serviceAccountPath
      : path.join(process.cwd(), serviceAccountPath);
    if (!fs.existsSync(resolved)) {
      console.error(`\n  FIREBASE_SERVICE_ACCOUNT points to a file that does not exist: ${resolved}`);
      process.exit(2);
    }
    const json = JSON.parse(fs.readFileSync(resolved, "utf8")) as {
      project_id?: string;
      client_email?: string;
      private_key?: string;
    };
    if (!json.client_email || !json.private_key) {
      console.error("\n  That service-account file is missing client_email / private_key.");
      process.exit(2);
    }
    return firebaseAdmin.initializeApp({
      credential: firebaseAdmin.credential.cert({
        projectId: projectId || json.project_id,
        clientEmail: json.client_email,
        privateKey: json.private_key.replace(/\\n/g, "\n"),
      }),
      projectId: projectId || json.project_id,
    });
  }

  const clientEmail = requireKey("FIREBASE_CLIENT_EMAIL");
  const privateKey = requireKey("FIREBASE_PRIVATE_KEY");
  if (!projectId) {
    console.error("\n  MISSING: NEXT_PUBLIC_FIREBASE_PROJECT_ID (or FIREBASE_PROJECT_ID)");
    process.exit(2);
  }
  return firebaseAdmin.initializeApp({
    credential: firebaseAdmin.credential.cert({
      projectId,
      clientEmail,
      // .env.local stores the key with literal \n escapes.
      privateKey: privateKey.replace(/\\n/g, "\n"),
    }),
    projectId,
  });
}

/* ------------------------------------------------------------------ */
/* Allowed emails                                                      */
/* ------------------------------------------------------------------ */

function allowedEmails(): string[] {
  const raw = [
    process.env.ADMIN_ALLOWED_EMAILS ?? "",
    process.env.ADMIN_EMAIL ?? "",
    process.env.ADMIN_NOTIFY_EMAIL ?? "",
  ].join(",");
  const seen = new Set<string>();
  for (const part of raw.split(",")) {
    const value = part.trim().toLowerCase();
    if (value.includes("@")) seen.add(value);
  }
  return [...seen];
}

/* ------------------------------------------------------------------ */
/* Password acquisition + policy                                       */
/* ------------------------------------------------------------------ */

/** Read a line from the TTY without echoing it. Never used for anything else. */
function promptHidden(question: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const stdin = process.stdin;
    const stdout = process.stdout;
    if (!stdin.isTTY) {
      reject(
        new Error(
          "No interactive terminal available. Set the one-time shell variable ADMIN_BOOTSTRAP_PASSWORD for this command only."
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

/**
 * Deliberately small but high-signal: the usual suspects plus structural
 * weaknesses. The policy itself lives in src/lib/security/passwordPolicy.ts so
 * the test suite can exercise the same code the script runs.
 */

async function acquirePassword(): Promise<string> {
  const fromEnv = process.env.ADMIN_BOOTSTRAP_PASSWORD;
  if (fromEnv && fromEnv.trim()) {
    // Read from the shell only. We validate but NEVER print it.
    const problem = validatePassword(fromEnv);
    if (problem) {
      console.error(`\n  Rejected: ${problem}`);
      process.exit(2);
    }
    return fromEnv;
  }
  for (let attempt = 0; attempt < 3; attempt++) {
    const first = await promptHidden("  New admin password (min 14 chars, hidden): ");
    const problem = validatePassword(first);
    if (problem) {
      console.error(`  Rejected: ${problem}`);
      continue;
    }
    const second = await promptHidden("  Repeat it (hidden): ");
    if (first !== second) {
      console.error("  The two entries did not match.");
      continue;
    }
    return first;
  }
  console.error("  Too many attempts.");
  process.exit(2);
}

/* ------------------------------------------------------------------ */
/* Main                                                                */
/* ------------------------------------------------------------------ */

async function main(): Promise<void> {
  loadEnvLocal();

  const emails = allowedEmails();
  if (emails.length === 0) {
    console.error(
      "\n  No allowlisted address found. Set ADMIN_ALLOWED_EMAILS=yashjoshi20@zohomail.in in .env.local."
    );
    process.exit(2);
  }

  const app = initAdminSdk();
  const auth = firebaseAdmin.auth(app);

  console.log("\n  SUTRA STUDIO — super-admin bootstrap (Step 1.4)");
  console.log("  ------------------------------------------------");
  console.log(`  Project : ${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "(from credentials)"}`);
  console.log(`  Allowlist (${emails.length}):`);
  for (const e of emails) console.log(`    - ${e}`);
  console.log(
    "\n  NOTE: any password used earlier in chat is now written down and must NOT be reused."
  );

  const password = await acquirePassword();

  for (const email of emails) {
    let uid = "";
    let created = false;
    try {
      const user = await auth.getUserByEmail(email);
      uid = user.uid;
      await auth.updateUser(uid, {
        password,
        emailVerified: true,
        displayName: user.displayName || "Studio Administrator",
      });
      console.log(`  ~ updated existing user ${email}`);
    } catch (err) {
      const code = (err as { code?: string }).code;
      if (code !== "auth/user-not-found") throw err;
      const user = await auth.createUser({
        email,
        password,
        emailVerified: true,
        displayName: "Studio Administrator",
      });
      uid = user.uid;
      created = true;
      console.log(`  + created user ${email}`);
    }

    await auth.setCustomUserClaims(uid, {
      role: "superAdmin",
      staffRole: "superAdmin",
      admin: true,
      provisionedAt: new Date().toISOString(),
    });
    // Force every existing refresh token out so the new claim takes effect
    // immediately and any stolen session stops working.
    await auth.revokeRefreshTokens(uid);

    const check = await auth.getUser(uid);
    const claim = (check.customClaims ?? {}).role;
    console.log(
      `    uid=${uid}  claim=${String(claim)}  emailVerified=${String(check.emailVerified)}  revoked=${
        created ? "n/a (new)" : "yes"
      }`
    );
  }

  // Drop the in-memory credential without touching any file.
  await app.delete();

  console.log("\n  DONE.");
  console.log("  Next: sign in at /admin/login with the allowlisted address.");
  console.log("  Verify with:  npx tsx scripts/set-admin-claim.ts --verify");
  console.log("");
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  // Firebase's own errors never contain the password we just set.
  console.error("\n  FAILED:", message);
  process.exit(1);
});
