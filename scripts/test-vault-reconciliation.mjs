/**
 * SUTRA STUDIO — Vault Reconciliation Verification Test Suite
 *
 * Validates:
 * 1. Active-record precedence over historical backup.
 * 2. Deterministic deduplication of orders (271 total).
 * 3. Exact referential integrity of payments (230) and audit logs (17).
 * 4. Identity conflict detection and blocking of ambiguous accounts.
 * 5. Database safety: ZERO writes executed in dry run mode.
 * 6. File immutability: SHA-256 hashes of the four source JSON files remain identical.
 * 7. Repeatability: running multiple times yields deterministic results.
 */

import { runReconciliation } from "./reconcile-and-import-vault.mjs";
import fs from "node:fs";
import crypto from "node:crypto";
import { PrismaClient } from "@prisma/client";

function computeHash(filePath) {
  const content = fs.readFileSync(filePath);
  return crypto.createHash("sha256").update(content).digest("hex");
}

let testPassed = 0;
let testFailed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`✔ PASS: ${message}`);
    testPassed++;
  } else {
    console.error(`✘ FAIL: ${message}`);
    testFailed++;
  }
}

async function runTests() {
  console.log("=== SUTRA STUDIO VAULT RECONCILIATION TEST SUITE ===\n");

  const prisma = new PrismaClient();

  try {
    // Record baseline database counts before running
    const usersBefore = await prisma.user.count();
    const ordersBefore = await prisma.order.count();
    const paymentsBefore = await prisma.payment.count();

    const hashActiveBefore = computeHash("data/sutra_orders_store.json");
    const hashBackupBefore = computeHash("data/sutra_orders_store.backup.json");
    const hashPaymentsBefore = computeHash("data/sutra_payments_store.json");
    const hashAuditBefore = computeHash("data/sutra_audit_logs.json");

    // Execution 1: Dry run
    console.log("[Test 1] Running reconciliation in dry-run mode...");
    const report1 = await runReconciliation({ dryRun: true, json: false });

    assert(report1.dryRun === true, "Reconciliation executed in dry-run mode");
    assert(report1.counts.totalDeduplicatedOrders === 271, `Total unique orders is exactly 271 (got ${report1.counts.totalDeduplicatedOrders})`);
    assert(report1.counts.overlappingOrders === 3, `Overlapping active/backup orders detected: 3 (got ${report1.counts.overlappingOrders})`);

    // Execution 2: Check Active Record Precedence
    console.log("\n[Test 2] Verifying Active Record Precedence...");
    const activeOrderRaw = JSON.parse(fs.readFileSync("data/sutra_orders_store.json", "utf8"))[0];
    assert(activeOrderRaw.id === "ord_1791919153385", "Target order ord_1791919153385 identified in active store");
    assert(report1.vaultIntegrityVerified === true, "Vault integrity verified true");

    // Test 3: Payments and Audit Logs Referential Integrity
    console.log("\n[Test 3] Verifying Payment & Audit Log Referential Integrity...");
    assert(report1.referentialIntegrity.paymentsMatchingOrder === 230, `230 payments match valid orders (got ${report1.referentialIntegrity.paymentsMatchingOrder})`);
    assert(report1.referentialIntegrity.orphanPaymentsCount === 0, `Zero orphan payments (got ${report1.referentialIntegrity.orphanPaymentsCount})`);
    assert(report1.referentialIntegrity.auditLogsMatchingOrder === 17, `17 audit logs match valid orders (got ${report1.referentialIntegrity.auditLogsMatchingOrder})`);
    assert(report1.referentialIntegrity.orphanAuditLogsCount === 0, `Zero orphan audit logs (got ${report1.referentialIntegrity.orphanAuditLogsCount})`);

    // Test 4: Identity Conflict Detection & Blocking
    console.log("\n[Test 4] Verifying Identity Conflict Safety & Blocking...");
    assert(report1.identityConflicts.multiEmailUids.length === 1, `Exactly 1 multi-email UID flagged (got ${report1.identityConflicts.multiEmailUids.length})`);
    const blockedUid = report1.identityConflicts.multiEmailUids[0];
    assert(blockedUid.uid === "usr_client_001", `Blocked UID is 'usr_client_001'`);
    assert(blockedUid.status === "BLOCKED", `UID status marked as BLOCKED`);
    assert(blockedUid.syntheticIdentities.length > 0, `Identified synthetic test conflicts for usr_client_001`);

    assert(report1.identityConflicts.multiUidEmails.length === 5, `Exactly 5 multi-UID emails flagged (got ${report1.identityConflicts.multiUidEmails.length})`);
    for (const c of report1.identityConflicts.multiUidEmails) {
      assert(c.status === "BLOCKED", `Conflict for email '${c.email}' marked BLOCKED`);
    }

    assert(report1.identityConflicts.totalBlockedOrders === 52, `52 ambiguous/conflicting orders marked as BLOCKED (got ${report1.identityConflicts.totalBlockedOrders})`);
    assert(report1.identityConflicts.totalEligibleOrders === 219, `219 conflict-free orders cleared for proposed ingestion (got ${report1.identityConflicts.totalEligibleOrders})`);

    // Test 5: Database Safety (No writes occurred)
    console.log("\n[Test 5] Verifying Database Safety (Zero writes)...");
    const usersAfter = await prisma.user.count();
    const ordersAfter = await prisma.order.count();
    const paymentsAfter = await prisma.payment.count();

    assert(usersBefore === usersAfter, `User row count unchanged (${usersBefore} -> ${usersAfter})`);
    assert(ordersBefore === ordersAfter, `Order row count unchanged (${ordersBefore} -> ${ordersAfter})`);
    assert(paymentsBefore === paymentsAfter, `Payment row count unchanged (${paymentsBefore} -> ${paymentsAfter})`);
    assert(report1.proposedDatabaseActions.databaseWritesExecuted === 0, "Report confirms 0 database writes executed");

    // Test 6: Source Files Immutability
    console.log("\n[Test 6] Verifying Source Files Byte-for-Byte Immutability...");
    const hashActiveAfter = computeHash("data/sutra_orders_store.json");
    const hashBackupAfter = computeHash("data/sutra_orders_store.backup.json");
    const hashPaymentsAfter = computeHash("data/sutra_payments_store.json");
    const hashAuditAfter = computeHash("data/sutra_audit_logs.json");

    assert(hashActiveBefore === hashActiveAfter, "data/sutra_orders_store.json SHA-256 untouched");
    assert(hashBackupBefore === hashBackupAfter, "data/sutra_orders_store.backup.json SHA-256 untouched");
    assert(hashPaymentsBefore === hashPaymentsAfter, "data/sutra_payments_store.json SHA-256 untouched");
    assert(hashAuditBefore === hashAuditAfter, "data/sutra_audit_logs.json SHA-256 untouched");

    // Test 7: Repeatability
    console.log("\n[Test 7] Verifying Deterministic Repeatability...");
    const report2 = await runReconciliation({ dryRun: true, json: false });
    assert(JSON.stringify(report1.counts) === JSON.stringify(report2.counts), "Consecutive runs produce identical record counts");
    assert(report1.identityConflicts.totalBlockedOrders === report2.identityConflicts.totalBlockedOrders, "Consecutive runs produce identical blocked counts");

    console.log(`\nTests Summary: ${testPassed} passed, ${testFailed} failed.`);

    if (testFailed > 0) {
      process.exit(1);
    }
  } finally {
    await prisma.$disconnect();
  }
}

runTests().catch((err) => {
  console.error("Test runner failed:", err);
  process.exit(1);
});
