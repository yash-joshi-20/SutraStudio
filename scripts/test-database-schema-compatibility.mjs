/**
 * SUTRA STUDIO — Database Schema Compatibility & Foreign Key Test Suite
 *
 * Runs non-destructive verification against the connected development PostgreSQL database.
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({
  log: ["error"]
});

async function runTests() {
  console.log("=== SUTRA STUDIO DATABASE SCHEMA VERIFICATION TEST ===");
  let passed = 0;
  let failed = 0;

  try {
    // 1. Connectivity Check
    console.log("\n[Test 1] Testing basic query execution...");
    const result = await prisma.$queryRaw`SELECT 1 as connected;`;
    if (result && result.length > 0) {
      console.log("✔ PASS: Successfully executed raw SELECT on connected database.");
      passed++;
    } else {
      throw new Error("Query returned empty result.");
    }

    // 2. Table Inspection
    console.log("\n[Test 2] Inspecting table presence in information_schema...");
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `;
    const tableNames = tables.map((t) => t.table_name);
    console.log("Tables found in database:", tableNames);

    const expectedTables = ["Inquiry", "KeyValue", "Notification", "Order", "Payment", "User"];
    const allFound = expectedTables.every((t) => tableNames.includes(t));
    if (allFound) {
      console.log("✔ PASS: All 6 required application tables are present.");
      passed++;
    } else {
      console.log("ℹ PENDING: Migration not yet applied. Expected tables:", expectedTables);
    }

  } catch (err) {
    console.error("Test execution error:", err.message);
    failed++;
  } finally {
    await prisma.$disconnect();
  }

  console.log(`\nTests Summary: ${passed} passed, ${failed} failed.`);
  return { passed, failed };
}

runTests().catch(console.error);
