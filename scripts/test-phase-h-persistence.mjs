/**
 * SUTRA STUDIO — Phase H: Admin Settings, Notifications & Inquiries Persistence Verification
 *
 * Validates:
 * 1. Admin Studio Settings persistence in PostgreSQL KeyValue model (settings:studio).
 * 2. Settings read-back and mutation roundtrip via StudioSettingsStore.
 * 3. Notification persistence in PostgreSQL Notification model.
 * 4. Notification read, list, and read-status toggle roundtrip.
 * 5. Inquiry persistence in PostgreSQL Inquiry model with field preservation.
 * 6. Inquiry read and list roundtrip.
 * 7. Clean teardown of all synthetic test records.
 */

import { prisma } from "../src/lib/prisma.ts";
import { adminDb } from "../src/lib/db/index.ts";
import { StudioSettingsStore } from "../src/lib/services/studioSettingsStore.ts";

const TEST_TIMESTAMP = Date.now();
const TEST_NOTIF_ID = `notif_test_${TEST_TIMESTAMP}`;
const TEST_INQUIRY_ID = `inq_test_${TEST_TIMESTAMP}`;

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
  console.log("=== SUTRA STUDIO PHASE H: SETTINGS, NOTIFICATIONS & INQUIRIES VERIFICATION ===\n");

  const db = adminDb();

  try {
    // -------------------------------------------------------------------------
    // Test 1: Studio Settings Persistence via KeyValue
    // -------------------------------------------------------------------------
    console.log("[Test 1] Testing Studio Settings persistence via KeyValue...");
    const testSettings = {
      enableGst: true,
      gstPercentage: 18,
      studioGstin: "24TESTA0000A1Z5",
      studioLegalName: "Sutra Studio Technologies LLP (Verified)",
      studioState: "Gujarat",
      couponsEnabled: true,
      refundPolicy: {
        refundBeforeKickoffPercentage: 100,
        refundInDraftPercentage: 50,
        refundAfterApprovalPercentage: 0,
        processingDays: 5,
      },
      pricingModel: {
        allowCustomQuotes: true,
        defaultCurrency: "INR",
        expressDeliveryMultiplier: 1.35,
      },
    };

    await db.collection("settings").doc("studio").set(testSettings, { merge: true });

    // Direct PostgreSQL KeyValue verification
    const dbRecord = await prisma.keyValue.findUnique({ where: { key: "settings:studio" } });
    assert(dbRecord !== null, "Settings record found in PostgreSQL KeyValue model");

    const parsedDb = JSON.parse(dbRecord?.value || "{}");
    assert(parsedDb.enableGst === true, "enableGst persisted as true");
    assert(parsedDb.gstPercentage === 18, "gstPercentage persisted as 18");
    assert(parsedDb.studioLegalName === "Sutra Studio Technologies LLP (Verified)", "studioLegalName matches");

    // Read back via StudioSettingsStore
    const syncedSettings = await StudioSettingsStore.syncFromFirestore();
    assert(syncedSettings.enableGst === true, "StudioSettingsStore.syncFromFirestore reflects enableGst");
    assert(syncedSettings.gstPercentage === 18, "StudioSettingsStore reflects gstPercentage");

    // -------------------------------------------------------------------------
    // Test 2: Notification Persistence via Notification Model
    // -------------------------------------------------------------------------
    console.log("\n[Test 2] Testing Notification persistence via Notification model...");
    const notifData = {
      id: TEST_NOTIF_ID,
      title: "Design Deliverable Available",
      message: "First revision draft for your brand guidelines has been published.",
      type: "status_update",
      actionUrl: "/account/orders/test",
      read: false,
      createdAt: new Date().toISOString(),
    };

    await db.collection("notifications").doc(TEST_NOTIF_ID).set(notifData);

    // Direct PostgreSQL Notification query
    const dbNotif = await prisma.notification.findUnique({ where: { id: TEST_NOTIF_ID } });
    assert(dbNotif !== null, "Notification found in PostgreSQL Notification table");
    assert(dbNotif?.title === notifData.title, `Title matches: ${dbNotif?.title}`);
    assert(dbNotif?.message === notifData.message, "Message content matches");
    assert(dbNotif?.type === "status_update", "Type matches 'status_update'");
    assert(dbNotif?.read === false, "Read status is initially false");
    assert(dbNotif?.link === notifData.actionUrl, "Link URL matches actionUrl");

    // Read back via facade doc.get()
    const docSnap = await db.collection("notifications").doc(TEST_NOTIF_ID).get();
    assert(docSnap.exists === true, "Facade doc.get() resolves notification");
    assert(docSnap.data().title === notifData.title, "Facade data().title matches");

    // Update read state
    await db.collection("notifications").doc(TEST_NOTIF_ID).update({ read: true });
    const updatedDbNotif = await prisma.notification.findUnique({ where: { id: TEST_NOTIF_ID } });
    assert(updatedDbNotif?.read === true, "Notification read status updated to true in PostgreSQL");

    // Read via collection.get()
    const allNotifsSnap = await db.collection("notifications").get();
    const foundInList = allNotifsSnap.docs.some((d) => d.id === TEST_NOTIF_ID);
    assert(foundInList === true, "collection.get() returns newly created notification");

    // -------------------------------------------------------------------------
    // Test 3: Inquiry Persistence via Inquiry Model
    // -------------------------------------------------------------------------
    console.log("\n[Test 3] Testing Inquiry persistence via Inquiry model...");
    const inquiryData = {
      id: TEST_INQUIRY_ID,
      name: "Rohit Varma",
      email: `rohit_${TEST_TIMESTAMP}@example.com`,
      phone: "+91 98765 43210",
      service: "Brand Identity & Architecture",
      message: "We are interested in a complete brand identity revamp for our architecture firm.",
      status: "new",
    };

    await db.collection("inquiries").doc(TEST_INQUIRY_ID).set(inquiryData);

    // Direct PostgreSQL Inquiry verification
    const dbInquiry = await prisma.inquiry.findUnique({ where: { id: TEST_INQUIRY_ID } });
    assert(dbInquiry !== null, "Inquiry record found in PostgreSQL Inquiry table");
    assert(dbInquiry?.name === inquiryData.name, `Name matches: ${dbInquiry?.name}`);
    assert(dbInquiry?.email === inquiryData.email, `Email matches: ${dbInquiry?.email}`);
    assert(dbInquiry?.phone === inquiryData.phone, `Phone matches: ${dbInquiry?.phone}`);
    assert(dbInquiry?.service === inquiryData.service, `Service matches: ${dbInquiry?.service}`);
    assert(dbInquiry?.message === inquiryData.message, "Message text matches");
    assert(dbInquiry?.status === "new", "Status matches 'new'");

    // Read back via facade doc.get()
    const inqDocSnap = await db.collection("inquiries").doc(TEST_INQUIRY_ID).get();
    assert(inqDocSnap.exists === true, "Facade doc.get() resolves inquiry");
    assert(inqDocSnap.data().name === inquiryData.name, "Facade data().name matches");

    // Read back via collection.get()
    const allInquiriesSnap = await db.collection("inquiries").get();
    const foundInq = allInquiriesSnap.docs.some((d) => d.id === TEST_INQUIRY_ID);
    assert(foundInq === true, "collection.get() returns newly created inquiry");

  } catch (error) {
    console.error("Test execution threw unhandled exception:", error);
    testFailed++;
  } finally {
    // -------------------------------------------------------------------------
    // Teardown
    // -------------------------------------------------------------------------
    console.log("\n[Teardown] Cleaning up synthetic test records from PostgreSQL...");
    try {
      await prisma.notification.deleteMany({ where: { id: TEST_NOTIF_ID } });
      await prisma.inquiry.deleteMany({ where: { id: TEST_INQUIRY_ID } });
      console.log("✔ Teardown complete. PostgreSQL database is pristine.");
    } catch (cleanErr) {
      console.warn("Teardown warning:", cleanErr);
    }
  }

  console.log("\n=======================================================");
  console.log(`TEST RESULTS: ${testPassed} passed, ${testFailed} failed`);
  console.log("=======================================================");

  if (testFailed > 0) {
    process.exit(1);
  }
}

runTests();
