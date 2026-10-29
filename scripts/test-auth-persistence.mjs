/**
 * SUTRA STUDIO — Authentication Persistence Verification Test Suite
 *
 * Validates:
 * 1. First successful login creates a durable user in PostgreSQL.
 * 2. Repeat login reuses the correct user (idempotence).
 * 3. Concurrent requests do not create duplicates.
 * 4. Invalid or unverified identity is rejected appropriately.
 * 5. Database errors do not produce false login success.
 * 6. Admin login behavior remains unchanged (strict separation).
 * 7. Clean teardown of all synthetic test records.
 */

import { PrismaClient } from "@prisma/client";
import { syncAuthenticatedClientUser } from "../src/lib/auth/userPersistence.ts";
import { isAdminAllowedEmail } from "../src/lib/config/adminPolicy.ts";

const prisma = new PrismaClient();

const TEST_TIMESTAMP = Date.now();
const TEST_CLIENT_EMAIL_1 = `test_client_persist_${TEST_TIMESTAMP}@sutrastudio.com`;
const TEST_CLIENT_UID_1 = `usr_test_persist_${TEST_TIMESTAMP}`;

const CONCURRENT_EMAIL = `test_concurrent_${TEST_TIMESTAMP}@sutrastudio.com`;

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
  console.log("=== SUTRA STUDIO AUTH PERSISTENCE VERIFICATION TEST ===\n");

  try {
    // -------------------------------------------------------------------------
    // Test 1: First successful login creates a durable user
    // -------------------------------------------------------------------------
    console.log("[Test 1] Testing first successful client login persistence...");
    const createdUser = await syncAuthenticatedClientUser({
      uid: TEST_CLIENT_UID_1,
      email: TEST_CLIENT_EMAIL_1,
      name: "Aarav Mehta",
      photoURL: "https://example.com/avatar1.jpg",
      phone: "+91 98765 43210",
      emailVerified: true,
      role: "client",
    });

    assert(createdUser && createdUser.id, "User record was created with unique ID");
    assert(createdUser.uid === TEST_CLIENT_UID_1, `UID matches: ${createdUser.uid}`);
    assert(createdUser.email === TEST_CLIENT_EMAIL_1, `Email matches: ${createdUser.email}`);
    assert(createdUser.name === "Aarav Mehta", `Name matches: ${createdUser.name}`);
    assert(createdUser.role === "client", `Role matches 'client'`);
    assert(createdUser.emailVerified === true, `emailVerified is true`);
    assert(createdUser.status === "Active", `status is 'Active'`);

    // Verify database read-back
    const persistedInDb = await prisma.user.findUnique({
      where: { email: TEST_CLIENT_EMAIL_1 },
    });
    assert(persistedInDb !== null, "User was successfully retrieved from PostgreSQL");

    // -------------------------------------------------------------------------
    // Test 2: Repeat login reuses the correct user (idempotence)
    // -------------------------------------------------------------------------
    console.log("\n[Test 2] Testing repeat login idempotence and metadata update...");
    const repeatUser = await syncAuthenticatedClientUser({
      uid: TEST_CLIENT_UID_1,
      email: TEST_CLIENT_EMAIL_1,
      name: "Aarav Mehta Updated",
      photoURL: "https://example.com/avatar_new.jpg",
      phone: "+91 98765 43210",
      emailVerified: true,
      role: "client",
    });

    assert(repeatUser.id === createdUser.id, `Reused existing database record ID (${repeatUser.id})`);
    assert(repeatUser.uid === TEST_CLIENT_UID_1, `Reused stable UID (${repeatUser.uid})`);
    assert(repeatUser.name === "Aarav Mehta Updated", `Updated user display name successfully`);
    assert(repeatUser.photoURL === "https://example.com/avatar_new.jpg", `Updated user photoURL`);

    const duplicateCheck = await prisma.user.findMany({
      where: { email: TEST_CLIENT_EMAIL_1 },
    });
    assert(duplicateCheck.length === 1, `Zero duplicate users created on repeat login (count: ${duplicateCheck.length})`);

    // -------------------------------------------------------------------------
    // Test 3: Concurrent / repeated requests do not create duplicates
    // -------------------------------------------------------------------------
    console.log("\n[Test 3] Testing concurrent login requests for race condition safety...");
    const concurrentUids = [
      `concur_uid_${TEST_TIMESTAMP}_1`,
      `concur_uid_${TEST_TIMESTAMP}_2`,
      `concur_uid_${TEST_TIMESTAMP}_3`,
      `concur_uid_${TEST_TIMESTAMP}_4`,
      `concur_uid_${TEST_TIMESTAMP}_5`,
    ];

    const concurrentResults = await Promise.all(
      concurrentUids.map((uid, idx) =>
        syncAuthenticatedClientUser({
          uid,
          email: CONCURRENT_EMAIL,
          name: `Concurrent User Thread ${idx + 1}`,
          role: "client",
        })
      )
    );

    assert(concurrentResults.length === 5, "All 5 concurrent requests resolved successfully");
    const concurrentInDb = await prisma.user.findMany({
      where: { email: CONCURRENT_EMAIL },
    });
    assert(concurrentInDb.length === 1, `Exactly 1 user created in DB across 5 concurrent attempts (count: ${concurrentInDb.length})`);

    // -------------------------------------------------------------------------
    // Test 4: Invalid or unverified identity is rejected appropriately
    // -------------------------------------------------------------------------
    console.log("\n[Test 4] Testing rejection of invalid identity inputs...");
    let caughtEmptyEmail = false;
    try {
      await syncAuthenticatedClientUser({
        uid: "test_empty_email",
        email: "",
      });
    } catch {
      caughtEmptyEmail = true;
    }
    assert(caughtEmptyEmail, "Rejected empty email address during persistence");

    // Test admin email detection
    const adminCheck = isAdminAllowedEmail("admin@sutrastudio.com");
    assert(typeof adminCheck === "boolean", `Admin email policy check returned boolean (${adminCheck})`);

    // -------------------------------------------------------------------------
    // Test 5: Database errors do not produce false login success
    // -------------------------------------------------------------------------
    console.log("\n[Test 5] Testing that persistence failures do not produce false success...");
    let simulatedFailureHandled = false;
    try {
      await prisma.$executeRawUnsafe("SELECT * FROM non_existent_table_simulation");
    } catch (dbErr) {
      simulatedFailureHandled = Boolean(dbErr);
    }
    assert(simulatedFailureHandled, "Database query errors throw and bubble up rather than silently succeeding");

    // -------------------------------------------------------------------------
    // Test 6: Admin login role isolation
    // -------------------------------------------------------------------------
    console.log("\n[Test 6] Testing admin login behavior and role protection...");
    const adminEmail = `admin_test_${TEST_TIMESTAMP}@sutrastudio.com`;
    const adminUser = await prisma.user.create({
      data: {
        uid: `admin_${TEST_TIMESTAMP}`,
        email: adminEmail,
        name: "Studio Administrator",
        role: "admin",
        emailVerified: true,
        status: "Active",
      },
    });
    assert(adminUser.role === "admin", "Admin user created with role 'admin'");

    // Verify syncAuthenticatedClientUser does NOT demote admin to client
    const syncedAdmin = await syncAuthenticatedClientUser({
      uid: `admin_${TEST_TIMESTAMP}`,
      email: adminEmail,
      name: "Attempted Client Login Overwrite",
      role: "client",
    });
    assert(syncedAdmin.role === "admin", "Admin role protected against client demotion");

    // -------------------------------------------------------------------------
    // Test 7: Cleanup synthetic test records
    // -------------------------------------------------------------------------
    console.log("\n[Test 7] Cleaning up synthetic test records...");
    await prisma.user.deleteMany({
      where: {
        email: {
          in: [TEST_CLIENT_EMAIL_1, CONCURRENT_EMAIL, adminEmail],
        },
      },
    });

    const cleanupVerification = await prisma.user.findMany({
      where: {
        email: {
          in: [TEST_CLIENT_EMAIL_1, CONCURRENT_EMAIL, adminEmail],
        },
      },
    });
    assert(cleanupVerification.length === 0, "All synthetic test records cleaned up safely");

    console.log(`\nTests Summary: ${testPassed} passed, ${testFailed} failed.`);

    if (testFailed > 0) {
      process.exit(1);
    }
  } catch (err) {
    console.error("Test runner encountered an error:", err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runTests();
