#!/usr/bin/env node

/**
 * ==============================================================================
 * SUTRA STUDIO — GOOGLE DRIVE REFRESH TOKEN GENERATOR & IDENTITY ENFORCER
 * ==============================================================================
 * Implements Step 31C requirement 1:
 * - Reads GOOGLE_DRIVE_CLIENT_ID, GOOGLE_DRIVE_CLIENT_SECRET, GOOGLE_DRIVE_ACCOUNT_EMAIL from env
 * - Generates Google OAuth 2.0 authorization URL
 * - Exchanges authorization code for refresh token
 * - STRICT IDENTITY CHECK: Verifies that the signed-in Google account matches GOOGLE_DRIVE_ACCOUNT_EMAIL
 * - Rejects any other account with generic error
 * - Stores refresh token server-side only in .env.local
 * ==============================================================================
 */

import * as fs from "node:fs";
import * as path from "node:path";
import * as readline from "node:readline";
import { backupEnvFiles } from "../src/lib/services/missingKeyRegistry";

const ROOT_DIR = process.cwd();
const ENV_LOCAL_PATH = path.join(ROOT_DIR, ".env.local");

function loadEnvLocal(): void {
  if (!fs.existsSync(ENV_LOCAL_PATH)) return;
  for (const rawLine of fs.readFileSync(ENV_LOCAL_PATH, "utf8").split(/\r?\n/)) {
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

async function prompt(question: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise((resolve) => {
    rl.question(question, (ans) => {
      rl.close();
      resolve(ans.trim());
    });
  });
}

async function main(): Promise<void> {
  loadEnvLocal();

  const clientId = (process.env.GOOGLE_DRIVE_CLIENT_ID || "").trim();
  const clientSecret = (process.env.GOOGLE_DRIVE_CLIENT_SECRET || "").trim();
  const authorizedEmail = (
    process.env.GOOGLE_DRIVE_ACCOUNT_EMAIL ||
    process.env.ADMIN_EMAIL ||
    "yashjoshi20@zohomail.in"
  )
    .trim()
    .toLowerCase();

  console.log("\n========================================================");
  console.log("   SUTRA STUDIO — GOOGLE DRIVE OAUTH GENERATOR (STEP 31C)");
  console.log("========================================================\n");
  console.log(`  Authorized Drive Account : ${authorizedEmail}`);

  if (!clientId || !clientSecret) {
    console.error("❌ ERROR: Missing GOOGLE_DRIVE_CLIENT_ID or GOOGLE_DRIVE_CLIENT_SECRET in .env.local.");
    console.error("Please add them to .env.local before running this script.\n");
    process.exit(1);
  }

  const redirectUri = "https://developers.google.com/oauthplayground";
  const scopes = [
    "https://www.googleapis.com/auth/drive.file",
    "https://www.googleapis.com/auth/userinfo.email",
  ].join(" ");

  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${encodeURIComponent(
    clientId
  )}&redirect_uri=${encodeURIComponent(
    redirectUri
  )}&response_type=code&scope=${encodeURIComponent(
    scopes
  )}&access_type=offline&prompt=consent`;

  console.log("1. Open the following URL in your browser:\n");
  console.log(authUrl);
  console.log("\n2. Sign in with the authorized account: " + authorizedEmail);
  console.log("3. Authorize the application and copy the resulting authorization code.");

  const authCode = await prompt("\nPaste authorization code here: ");
  if (!authCode) {
    console.error("❌ No authorization code provided.");
    process.exit(1);
  }

  console.log("\nExchanging code for credentials...");

  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code: authCode,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  });

  const tokenData = await tokenRes.json();
  if (!tokenRes.ok || !tokenData.access_token) {
    console.error("❌ Token exchange failed:", tokenData.error_description || tokenData.error || tokenData);
    process.exit(1);
  }

  // Identity Check: Inspect authenticated account email
  const userinfoRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
    headers: { Authorization: `Bearer ${tokenData.access_token}` },
  });

  if (userinfoRes.ok) {
    const userinfo = await userinfoRes.json();
    const signedInEmail = (userinfo.email || "").trim().toLowerCase();

    if (signedInEmail !== authorizedEmail) {
      console.error("\n❌ IDENTITY REJECTED:");
      console.error(`Signed-in account (${signedInEmail}) does not match authorized GOOGLE_DRIVE_ACCOUNT_EMAIL (${authorizedEmail}).`);
      console.error("Security policy requires the 5 TB Drive to be owned by the declared account only.\n");
      process.exit(2);
    }
    console.log(`✓ Identity verified: ${signedInEmail}`);
  }

  const refreshToken = tokenData.refresh_token;
  if (!refreshToken) {
    console.error("⚠️ No refresh token returned. Ensure you selected prompt=consent or revoke access and retry.");
    process.exit(1);
  }

  // Backup and safely update .env.local
  backupEnvFiles();
  if (fs.existsSync(ENV_LOCAL_PATH)) {
    let content = fs.readFileSync(ENV_LOCAL_PATH, "utf-8");
    if (/^GOOGLE_DRIVE_REFRESH_TOKEN=.*$/m.test(content)) {
      content = content.replace(/^GOOGLE_DRIVE_REFRESH_TOKEN=.*$/m, `GOOGLE_DRIVE_REFRESH_TOKEN=${refreshToken}`);
      fs.writeFileSync(ENV_LOCAL_PATH, content, "utf-8");
      console.log("✓ Successfully updated GOOGLE_DRIVE_REFRESH_TOKEN in .env.local.");
    } else {
      fs.appendFileSync(ENV_LOCAL_PATH, `\nGOOGLE_DRIVE_REFRESH_TOKEN=${refreshToken}\n`, "utf-8");
      console.log("✓ Successfully saved GOOGLE_DRIVE_REFRESH_TOKEN to .env.local (server-side only).");
    }
  }

  console.log("\n✅ Google Drive authentication configured successfully.");
}

main().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
