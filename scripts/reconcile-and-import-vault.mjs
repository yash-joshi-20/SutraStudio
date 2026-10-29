/**
 * SUTRA STUDIO — Vault Reconciliation & Ingestion Tool
 *
 * Implements deterministic, read-only reconciliation analysis (--dry-run).
 *
 * Directives:
 * 1. Active orders store takes precedence over historical backup.
 * 2. Stable deduplication across all 4 JSON vault stores.
 * 3. Strict identity conflict detection (multi-email UIDs and multi-UID emails).
 * 4. Evidence-based classification: real client identities vs synthetic test records.
 * 5. All unresolved identity conflicts are explicitly marked BLOCKED.
 * 6. ZERO database writes in --dry-run mode. Source files remain 100% untouched.
 */

import fs from "node:fs";
import crypto from "node:crypto";
import { PrismaClient } from "@prisma/client";

const ACTIVE_ORDERS_PATH = "data/sutra_orders_store.json";
const BACKUP_ORDERS_PATH = "data/sutra_orders_store.backup.json";
const PAYMENTS_PATH = "data/sutra_payments_store.json";
const AUDIT_LOGS_PATH = "data/sutra_audit_logs.json";

function computeHash(filePath) {
  const content = fs.readFileSync(filePath);
  return crypto.createHash("sha256").update(content).digest("hex");
}

export async function runReconciliation(options = { dryRun: true, json: false }) {
  const isDryRun = Boolean(options.dryRun);

  // 1. Record initial SHA-256 hashes of vault files
  const initialHashes = {
    activeOrders: computeHash(ACTIVE_ORDERS_PATH),
    backupOrders: computeHash(BACKUP_ORDERS_PATH),
    payments: computeHash(PAYMENTS_PATH),
    auditLogs: computeHash(AUDIT_LOGS_PATH),
  };

  // 2. Read raw source records
  const activeOrdersRaw = JSON.parse(fs.readFileSync(ACTIVE_ORDERS_PATH, "utf8"));
  const backupOrdersRaw = JSON.parse(fs.readFileSync(BACKUP_ORDERS_PATH, "utf8"));
  const paymentsRaw = JSON.parse(fs.readFileSync(PAYMENTS_PATH, "utf8"));
  const auditLogsRaw = JSON.parse(fs.readFileSync(AUDIT_LOGS_PATH, "utf8"));

  // 3. Reconcile Orders with Active Precedence
  const reconciledOrders = new Map();
  const overlappingOrderIds = [];

  // Backup records loaded first
  for (const order of backupOrdersRaw) {
    reconciledOrders.set(order.id, {
      source: "backup",
      order,
    });
  }

  // Active records loaded second (authoritative overwrite for overlapping IDs)
  for (const order of activeOrdersRaw) {
    if (reconciledOrders.has(order.id)) {
      overlappingOrderIds.push(order.id);
    }
    reconciledOrders.set(order.id, {
      source: "active",
      order,
    });
  }

  // 4. Validate Payments Referential Integrity
  const paymentAnalysis = {
    total: paymentsRaw.length,
    validOrderRefs: 0,
    orphanPayments: [],
    validPayments: [],
  };

  for (const payment of paymentsRaw) {
    if (reconciledOrders.has(payment.orderId)) {
      paymentAnalysis.validOrderRefs++;
      paymentAnalysis.validPayments.push(payment);
    } else {
      paymentAnalysis.orphanPayments.push({
        paymentId: payment.id,
        orderId: payment.orderId,
        amount: payment.amountINR,
      });
    }
  }

  // 5. Validate Audit Logs Referential Integrity
  const auditLogAnalysis = {
    total: auditLogsRaw.length,
    validOrderRefs: 0,
    orphanLogs: [],
    validLogs: [],
  };

  for (const log of auditLogsRaw) {
    if (log.orderId && reconciledOrders.has(log.orderId)) {
      auditLogAnalysis.validOrderRefs++;
      auditLogAnalysis.validLogs.push(log);
    } else if (log.orderId) {
      auditLogAnalysis.orphanLogs.push({
        logId: log.id,
        orderId: log.orderId,
        eventType: log.eventType,
      });
    } else {
      // System level log without orderId
      auditLogAnalysis.validLogs.push(log);
    }
  }

  // 6. Identity & Conflict Analysis across Reconciled Orders
  const uidToEmails = new Map();
  const emailToUids = new Map();

  for (const [id, item] of reconciledOrders.entries()) {
    const o = item.order;
    const uid = (o.clientUid || o.clientId || "").trim();
    const email = (o.clientEmail || "").trim().toLowerCase();
    const name = o.clientName || "";

    if (!uidToEmails.has(uid)) uidToEmails.set(uid, new Map());
    const emailGroup = uidToEmails.get(uid);
    if (!emailGroup.has(email)) emailGroup.set(email, []);
    emailGroup.get(email).push({ id, orderNumber: o.orderNumber, name, source: item.source });

    if (!emailToUids.has(email)) emailToUids.set(email, new Map());
    const uidGroup = emailToUids.get(email);
    if (!uidGroup.has(uid)) uidGroup.set(uid, []);
    uidGroup.get(uid).push({ id, orderNumber: o.orderNumber, name, source: item.source });
  }

  // Identify Multi-Email UIDs (Conflict Category 1)
  const multiEmailUidConflicts = [];
  for (const [uid, emails] of uidToEmails.entries()) {
    if (emails.size > 1) {
      const emailBreakdown = [];
      let activeRealIdentity = null;
      const syntheticIdentities = [];

      for (const [email, ordersList] of emails.entries()) {
        const hasActiveSource = ordersList.some((x) => x.source === "active");
        const isSyntheticDomain =
          email.endsWith("@example.com") ||
          email.endsWith("@sutrastudio.test") ||
          email.endsWith("@test.dev") ||
          email.endsWith("@sutra.test");

        const isRealEvidence = hasActiveSource || (!isSyntheticDomain && !email.startsWith("qa-") && !email.startsWith("hacker"));

        const entry = {
          email,
          orderCount: ordersList.length,
          orderIds: ordersList.map((x) => x.id),
          source: ordersList[0].source,
          classification: isRealEvidence ? "VERIFIED_REAL_IDENTITY" : "SYNTHETIC_TEST_IDENTITY",
        };

        if (isRealEvidence) {
          activeRealIdentity = entry;
        } else {
          syntheticIdentities.push(entry);
        }
        emailBreakdown.push(entry);
      }

      multiEmailUidConflicts.push({
        uid,
        status: "BLOCKED",
        reason: `UID '${uid}' is claimed by ${emails.size} different email addresses`,
        activeRealIdentity,
        syntheticIdentities,
        emailBreakdown,
      });
    }
  }

  // Identify Multi-UID Emails (Conflict Category 2)
  const multiUidEmailConflicts = [];
  for (const [email, uids] of emailToUids.entries()) {
    if (uids.size > 1) {
      const uidBreakdown = [];
      for (const [uid, ordersList] of uids.entries()) {
        const isSyntheticUid =
          uid.startsWith("lead_") || uid.startsWith("usr_test_client_") || uid === "client_uid_12345";

        uidBreakdown.push({
          uid,
          orderCount: ordersList.length,
          orderIds: ordersList.map((x) => x.id),
          classification: isSyntheticUid ? "SYNTHETIC_DRAFT_UID" : "PROVISIONED_UID",
        });
      }

      multiUidEmailConflicts.push({
        email,
        status: "BLOCKED",
        reason: `Email '${email}' is referenced by ${uids.size} different client UIDs`,
        uidBreakdown,
      });
    }
  }

  // 7. Database State Comparison
  const prisma = new PrismaClient();
  let dbBaseline = {
    users: 0,
    orders: 0,
    payments: 0,
    notifications: 0,
    keyValues: 0,
  };

  try {
    dbBaseline = {
      users: await prisma.user.count(),
      orders: await prisma.order.count(),
      payments: await prisma.payment.count(),
      notifications: await prisma.notification.count(),
      keyValues: await prisma.keyValue.count(),
    };
  } finally {
    await prisma.$disconnect();
  }

  // 8. Proposed Actions Computation
  // Distinct clients without conflicts
  const blockedOrderIds = new Set();
  for (const conflict of multiEmailUidConflicts) {
    for (const b of conflict.emailBreakdown) {
      if (b.classification === "SYNTHETIC_TEST_IDENTITY") {
        for (const oid of b.orderIds) blockedOrderIds.add(oid);
      }
    }
  }
  for (const conflict of multiUidEmailConflicts) {
    for (const b of conflict.uidBreakdown) {
      for (const oid of b.orderIds) blockedOrderIds.add(oid);
    }
  }

  const eligibleOrders = [];
  const blockedOrders = [];
  for (const [id, item] of reconciledOrders.entries()) {
    if (blockedOrderIds.has(id)) {
      blockedOrders.push(item.order);
    } else {
      eligibleOrders.push(item.order);
    }
  }

  // 9. Confirm Vault Files Remains 100% Unchanged
  const finalHashes = {
    activeOrders: computeHash(ACTIVE_ORDERS_PATH),
    backupOrders: computeHash(BACKUP_ORDERS_PATH),
    payments: computeHash(PAYMENTS_PATH),
    auditLogs: computeHash(AUDIT_LOGS_PATH),
  };

  const filesUnchanged =
    initialHashes.activeOrders === finalHashes.activeOrders &&
    initialHashes.backupOrders === finalHashes.backupOrders &&
    initialHashes.payments === finalHashes.payments &&
    initialHashes.auditLogs === finalHashes.auditLogs;

  const result = {
    dryRun: isDryRun,
    vaultIntegrityVerified: filesUnchanged,
    vaultHashes: finalHashes,
    counts: {
      activeOrdersSource: activeOrdersRaw.length,
      backupOrdersSource: backupOrdersRaw.length,
      overlappingOrders: overlappingOrderIds.length,
      totalDeduplicatedOrders: reconciledOrders.size,
      paymentsSource: paymentsRaw.length,
      auditLogsSource: auditLogsRaw.length,
      distinctClientUids: uidToEmails.size,
      distinctClientEmails: emailToUids.size,
    },
    databaseBaseline: dbBaseline,
    referentialIntegrity: {
      paymentsMatchingOrder: paymentAnalysis.validOrderRefs,
      orphanPaymentsCount: paymentAnalysis.orphanPayments.length,
      orphanPaymentsList: paymentAnalysis.orphanPayments,
      auditLogsMatchingOrder: auditLogAnalysis.validOrderRefs,
      orphanAuditLogsCount: auditLogAnalysis.orphanLogs.length,
      orphanAuditLogsList: auditLogAnalysis.orphanLogs,
    },
    identityConflicts: {
      multiEmailUids: multiEmailUidConflicts,
      multiUidEmails: multiUidEmailConflicts,
      totalBlockedOrders: blockedOrders.length,
      totalEligibleOrders: eligibleOrders.length,
    },
    proposedDatabaseActions: {
      insertUsersProposed: uidToEmails.size,
      insertOrdersProposed: eligibleOrders.length,
      blockedOrdersCount: blockedOrders.length,
      insertPaymentsProposed: paymentAnalysis.validOrderRefs,
      databaseWritesExecuted: 0,
    },
  };

  return result;
}

// Standalone CLI execution
if (process.argv[1] && process.argv[1].endsWith("reconcile-and-import-vault.mjs")) {
  const isDryRun = process.argv.includes("--dry-run") || !process.argv.includes("--execute");
  const isJson = process.argv.includes("--json");

  console.log("=== SUTRA STUDIO VAULT RECONCILIATION TOOL ===");
  console.log(`Execution Mode: ${isDryRun ? "READ-ONLY DRY RUN (--dry-run)" : "LIVE EXECUTION"}`);

  runReconciliation({ dryRun: isDryRun, json: isJson })
    .then((report) => {
      if (isJson) {
        console.log(JSON.stringify(report, null, 2));
        return;
      }

      console.log("\n1. VAULT FILES INTEGRITY");
      console.log(`  ✓ Source files byte-for-byte unchanged: ${report.vaultIntegrityVerified}`);
      console.log(`  - Active Orders SHA-256: ${report.vaultHashes.activeOrders}`);
      console.log(`  - Backup Archive SHA-256: ${report.vaultHashes.backupOrders}`);

      console.log("\n2. DEDUPLICATED RECORD COUNTS");
      console.log(`  - Active Orders: ${report.counts.activeOrdersSource}`);
      console.log(`  - Backup Archive Orders: ${report.counts.backupOrdersSource}`);
      console.log(`  - Overlapping IDs (Active takes precedence): ${report.counts.overlappingOrders}`);
      console.log(`  - Total Unique Orders: ${report.counts.totalDeduplicatedOrders}`);
      console.log(`  - Total Payments: ${report.counts.paymentsSource}`);
      console.log(`  - Total Audit Logs: ${report.counts.auditLogsSource}`);

      console.log("\n3. REFERENTIAL INTEGRITY VALIDATION");
      console.log(`  - Payments referencing valid Orders: ${report.referentialIntegrity.paymentsMatchingOrder} / ${report.counts.paymentsSource}`);
      console.log(`  - Orphan Payments: ${report.referentialIntegrity.orphanPaymentsCount}`);
      console.log(`  - Audit Logs referencing valid Orders: ${report.referentialIntegrity.auditLogsMatchingOrder} / ${report.counts.auditLogsSource}`);
      console.log(`  - Orphan Audit Logs: ${report.referentialIntegrity.orphanAuditLogsCount}`);

      console.log("\n4. IDENTITY CONFLICTS & SAFETY GATES");
      console.log(`  - Multi-Email UIDs (Blocked): ${report.identityConflicts.multiEmailUids.length}`);
      for (const c of report.identityConflicts.multiEmailUids) {
        console.log(`    [BLOCKED] UID: ${c.uid} (${c.reason})`);
        if (c.activeRealIdentity) {
          console.log(`      * Real Client (Active): ${c.activeRealIdentity.email} (Order ${c.activeRealIdentity.orderIds.join(", ")})`);
        }
        console.log(`      * Synthetic Test Conflicts: ${c.syntheticIdentities.length} conflicting email groups`);
      }

      console.log(`  - Multi-UID Emails (Blocked): ${report.identityConflicts.multiUidEmails.length}`);
      for (const c of report.identityConflicts.multiUidEmails) {
        console.log(`    [BLOCKED] Email: ${c.email} (${c.reason})`);
      }

      console.log("\n5. PROPOSED DATABASE ACTIONS (DRY RUN ONLY)");
      console.log(`  - Existing Rows in DB: Users: ${report.databaseBaseline.users}, Orders: ${report.databaseBaseline.orders}, Payments: ${report.databaseBaseline.payments}`);
      console.log(`  - Orders Cleared for Safe Ingestion: ${report.identityConflicts.totalEligibleOrders}`);
      console.log(`  - Orders Blocked Pending Identity Approval: ${report.identityConflicts.totalBlockedOrders}`);
      console.log(`  - Database Writes Executed: ${report.proposedDatabaseActions.databaseWritesExecuted} (Confirmed 0)`);
    })
    .catch((err) => {
      console.error("Reconciliation error:", err);
      process.exit(1);
    });
}
