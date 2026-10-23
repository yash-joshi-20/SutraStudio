#!/usr/bin/env node

/**
 * ==============================================================================
 * SUTRA STUDIO — CREATE / SEED ADMINISTRATOR ACCOUNT (PRISMA & NEON POSTGRES)
 * ==============================================================================
 * Provisions the authorized administrator account in Neon PostgreSQL via Prisma:
 * 1. Reads target admin email from ADMIN_EMAIL (.env.local) or argument
 * 2. Sets role="admin", emailVerified=true, status="Active"
 * 3. Never logs or echoes credentials
 * ==============================================================================
 */

import * as fs from "node:fs";
import * as path from "node:path";
import { PrismaClient } from "@prisma/client";

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

async function main() {
  loadEnvLocal();
  const prisma = new PrismaClient();

  const targetEmail = (
    process.argv[2] ||
    process.env.ADMIN_EMAIL ||
    "sutrastudiosin@gmail.com"
  ).trim().toLowerCase();

  console.log(`\n▶ SUTRA STUDIO: Provisioning administrator in Neon PostgreSQL / Prisma: ${targetEmail}`);

  try {
    const user = await prisma.user.upsert({
      where: { email: targetEmail },
      update: {
        role: "admin",
        status: "Active",
        emailVerified: true,
      },
      create: {
        uid: `admin_${Date.now()}`,
        email: targetEmail,
        name: "Studio Administrator",
        role: "admin",
        status: "Active",
        emailVerified: true,
      },
    });

    console.log(`  ✓ Successfully provisioned administrator: ${user.email} (UID: ${user.uid}, Role: ${user.role})\n`);
  } catch (err) {
    console.error("  ✗ Failed to provision administrator:", err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
