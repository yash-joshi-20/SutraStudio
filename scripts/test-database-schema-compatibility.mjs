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
      throw new Error(`Missing expected tables. Present: ${tableNames.join(", ")}`);
    }

    // 3. Foreign Key Constraint Verification
    console.log("\n[Test 3] Verifying Foreign Key Constraints (Order -> User)...");
    const testUid = `test_user_${Date.now()}`;
    const testOrderId = `test_order_${Date.now()}`;
    const testOrderNum = `ORD-TEST-${Date.now().toString().slice(-4)}`;

    // Try inserting Order without User -> Should throw FK violation
    let fkBlocked = false;
    try {
      await prisma.order.create({
        data: {
          id: testOrderId,
          orderNumber: testOrderNum,
          clientUid: "non_existent_uid_123",
          clientName: "Test Client",
          clientEmail: "test@example.com",
          service: "Test Service",
          totalAmount: 1000,
        }
      });
    } catch (err) {
      fkBlocked = true;
      console.log("✔ PASS: Inserting order with invalid clientUid correctly rejected by foreign key constraint.");
      passed++;
    }

    if (!fkBlocked) {
      throw new Error("Foreign key constraint failed to block invalid clientUid!");
    }

    // 4. End-to-End User -> Order Creation & Cleanup
    console.log("\n[Test 4] Verifying valid User -> Order insertion and referential integrity...");
    const user = await prisma.user.create({
      data: {
        id: `usr_${Date.now()}`,
        uid: testUid,
        email: `tester_${Date.now()}@sutrastudio.test`,
        name: "Test Engineer",
      }
    });

    const order = await prisma.order.create({
      data: {
        id: testOrderId,
        orderNumber: testOrderNum,
        clientUid: user.uid,
        clientName: user.name,
        clientEmail: user.email,
        service: "Branding Design",
        totalAmount: 4999,
        status: "confirmed"
      }
    });

    console.log(`✔ PASS: Created User (${user.uid}) and linked Order (${order.orderNumber}).`);
    passed++;

    // Read back with relation
    const readBack = await prisma.order.findUnique({
      where: { id: testOrderId },
      include: { user: true }
    });

    if (readBack && readBack.user && readBack.user.uid === user.uid) {
      console.log("✔ PASS: Successfully read back Order with included User relation.");
      passed++;
    } else {
      throw new Error("Read back of Order relation failed.");
    }

    // Cleanup synthetic test records
    await prisma.order.delete({ where: { id: testOrderId } });
    await prisma.user.delete({ where: { id: user.id } });
    console.log("✔ PASS: Synthetic test records cleaned up safely.");
    passed++;

  } catch (err) {
    console.error("Test execution error:", err.message);
    failed++;
  } finally {
    await prisma.$disconnect();
  }

  console.log(`\nTests Summary: ${passed} passed, ${failed} failed.`);
  if (failed > 0) process.exit(1);
}

runTests().catch((e) => {
  console.error(e);
  process.exit(1);
});
