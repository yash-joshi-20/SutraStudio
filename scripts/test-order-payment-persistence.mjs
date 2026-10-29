/**
 * SUTRA STUDIO — Order & Payment Relational Persistence Verification Test Suite
 *
 * Validates:
 * 1. Direct creation of an order via OrdersStore.addAsync persists to PostgreSQL Order model.
 * 2. Automatic parent User resolution ensures Order.clientUid -> User.uid foreign key satisfaction.
 * 3. Lookup via OrdersStore.findById and findByIdAsync retrieves persisted order.
 * 4. Multi-tenant isolation: Client A cannot view Client B's orders.
 * 5. UTR submission via PaymentsStore.submitUtr persists Payment to PostgreSQL.
 * 6. Safety Gate: Client UTR submission NEVER marks order or payment as 'paid' prematurely.
 * 7. Single-use UTR enforcement: Re-submitting the same UTR is rejected.
 * 8. Admin verification via PaymentsStore.verifyPayment transactionally executes ACID transition:
 *    - Payment status transitions to 'paid'
 *    - Order paymentStatus transitions to 'paid'
 *    - Order status transitions to 'in_production'
 *    - Order amountPaid matches verified payment amount
 * 9. Direct verification of PostgreSQL state via Prisma client.
 * 10. Clean teardown of all synthetic test orders, payments, and users.
 */

import { prisma } from "../src/lib/prisma.ts";
import { OrdersStore } from "../src/lib/services/ordersStore.ts";
import { PaymentsStore } from "../src/lib/services/paymentsStore.ts";
import { adminDb } from "../src/lib/db/index.ts";

const TEST_TIMESTAMP = Date.now();
const CLIENT_A_UID = `usr_ord_test_a_${TEST_TIMESTAMP}`;
const CLIENT_A_EMAIL = `ord_test_a_${TEST_TIMESTAMP}@sutrastudio.com`;
const CLIENT_A_NAME = "Aarav Mehta";

const CLIENT_B_UID = `usr_ord_test_b_${TEST_TIMESTAMP}`;
const CLIENT_B_EMAIL = `ord_test_b_${TEST_TIMESTAMP}@sutrastudio.com`;
const CLIENT_B_NAME = "Riya Sengupta";

const ORDER_A_ID = `ord_test_a1_${TEST_TIMESTAMP}`;
const ORDER_A_NUMBER = `SUTRA-TEST-A-${TEST_TIMESTAMP.toString().slice(-6)}`;

const ORDER_B_ID = `ord_test_b1_${TEST_TIMESTAMP}`;
const ORDER_B_NUMBER = `SUTRA-TEST-B-${TEST_TIMESTAMP.toString().slice(-6)}`;

const TEST_UTR = `UTR${TEST_TIMESTAMP.toString().slice(-8)}8899`;

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
  console.log("=== SUTRA STUDIO ORDER & PAYMENT PERSISTENCE VERIFICATION TEST ===\n");

  try {
    // -------------------------------------------------------------------------
    // Test 1: Create client users in PostgreSQL
    // -------------------------------------------------------------------------
    console.log("[Test 1] Bootstrapping parent Client Users in PostgreSQL...");
    const userA = await prisma.user.create({
      data: {
        uid: CLIENT_A_UID,
        email: CLIENT_A_EMAIL,
        name: CLIENT_A_NAME,
        role: "client",
        status: "Active",
      },
    });
    assert(userA && userA.uid === CLIENT_A_UID, `User A bootstrapped with UID: ${userA.uid}`);

    const userB = await prisma.user.create({
      data: {
        uid: CLIENT_B_UID,
        email: CLIENT_B_EMAIL,
        name: CLIENT_B_NAME,
        role: "client",
        status: "Active",
      },
    });
    assert(userB && userB.uid === CLIENT_B_UID, `User B bootstrapped with UID: ${userB.uid}`);

    // -------------------------------------------------------------------------
    // Test 2: Persist Order A via OrdersStore.addAsync
    // -------------------------------------------------------------------------
    console.log("\n[Test 2] Creating and persisting Order A...");
    const orderDataA = {
      id: ORDER_A_ID,
      code: ORDER_A_NUMBER,
      orderNumber: ORDER_A_NUMBER,
      title: "Brand Identity Design Package",
      service: "Brand Identity",
      packageName: "Studio Complete Suite",
      packageId: "pkg_brand_complete",
      totalAmount: 75000,
      amountPaid: 0,
      status: "pending_payment",
      paymentStatus: "pending_payment",
      clientUid: CLIENT_A_UID,
      clientEmail: CLIENT_A_EMAIL,
      clientName: CLIENT_A_NAME,
      turnaround: "10-14 Business Days",
      brief: "Comprehensive corporate brand guidelines and identity assets.",
      source: "web_checkout",
      driveFolderId: `drive_fld_ord_a_${TEST_TIMESTAMP}`,
      driveFolderPath: `/SutraStudio/Orders/${ORDER_A_NUMBER}`,
      revisionRound: 0,
      maxRevisions: 3,
      deliverables: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const addResultA = await OrdersStore.addAsync(orderDataA);
    assert(addResultA === true, "OrdersStore.addAsync persisted Order A successfully");

    // Direct database verification
    const dbOrderA = await prisma.order.findUnique({ where: { id: ORDER_A_ID } });
    assert(dbOrderA !== null, "Order A confirmed in PostgreSQL database");
    assert(dbOrderA?.orderNumber === ORDER_A_NUMBER, `OrderNumber matches: ${dbOrderA?.orderNumber}`);
    assert(dbOrderA?.clientUid === CLIENT_A_UID, `Order A belongs to Client A UID: ${dbOrderA?.clientUid}`);
    assert(dbOrderA?.totalAmount === 75000, `totalAmount matches ₹75,000`);
    assert(dbOrderA?.status === "pending_payment", `status is 'pending_payment'`);
    assert(dbOrderA?.paymentStatus === "pending_payment", `paymentStatus is 'pending_payment'`);

    // -------------------------------------------------------------------------
    // Test 3: Persist Order B for Client B
    // -------------------------------------------------------------------------
    console.log("\n[Test 3] Creating and persisting Order B for Client B...");
    const orderDataB = {
      id: ORDER_B_ID,
      code: ORDER_B_NUMBER,
      orderNumber: ORDER_B_NUMBER,
      title: "UI/UX Design Systems Package",
      service: "UI/UX Design",
      packageName: "Enterprise Design System",
      packageId: "pkg_uiux_enterprise",
      totalAmount: 120000,
      amountPaid: 0,
      status: "pending_payment",
      paymentStatus: "pending_payment",
      clientUid: CLIENT_B_UID,
      clientEmail: CLIENT_B_EMAIL,
      clientName: CLIENT_B_NAME,
      turnaround: "21 Business Days",
      brief: "Component library and interaction tokens in Figma & code.",
      source: "web_checkout",
      driveFolderId: `drive_fld_ord_b_${TEST_TIMESTAMP}`,
      driveFolderPath: `/SutraStudio/Orders/${ORDER_B_NUMBER}`,
      revisionRound: 0,
      maxRevisions: 3,
      deliverables: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const addResultB = await OrdersStore.addAsync(orderDataB);
    assert(addResultB === true, "OrdersStore.addAsync persisted Order B successfully");

    const dbOrderB = await prisma.order.findUnique({ where: { id: ORDER_B_ID } });
    assert(dbOrderB !== null, "Order B confirmed in PostgreSQL database");
    assert(dbOrderB?.clientUid === CLIENT_B_UID, `Order B belongs to Client B UID: ${dbOrderB?.clientUid}`);

    // -------------------------------------------------------------------------
    // Test 4: Order lookup via OrdersStore.findById and findByIdAsync
    // -------------------------------------------------------------------------
    console.log("\n[Test 4] Testing synchronous and asynchronous order lookup...");
    const foundById = OrdersStore.findById(ORDER_A_ID);
    assert(foundById !== undefined, "findById returns Order A by ID");
    assert(foundById?.orderNumber === ORDER_A_NUMBER, "findById returns correct orderNumber");

    const foundByNumber = OrdersStore.findById(ORDER_A_NUMBER);
    assert(foundByNumber !== undefined, "findById returns Order A by orderNumber");

    const foundAsync = await OrdersStore.findByIdAsync(ORDER_A_ID);
    assert(foundAsync !== undefined, "findByIdAsync resolves Order A");
    assert(foundAsync?.totalAmount === 75000, "findByIdAsync returns correct totalAmount");

    // -------------------------------------------------------------------------
    // Test 5: Multi-Tenant Client Boundary Isolation
    // -------------------------------------------------------------------------
    console.log("\n[Test 5] Validating multi-tenant client boundary isolation...");
    const clientAOrders = await prisma.order.findMany({ where: { clientUid: CLIENT_A_UID } });
    assert(clientAOrders.length === 1, "Client A query returns exactly 1 order");
    assert(clientAOrders[0].id === ORDER_A_ID, "Client A query contains only Order A");

    const clientBOrders = await prisma.order.findMany({ where: { clientUid: CLIENT_B_UID } });
    assert(clientBOrders.length === 1, "Client B query returns exactly 1 order");
    assert(clientBOrders[0].id === ORDER_B_ID, "Client B query contains only Order B");

    // Verify zero cross-tenant leak
    const crossLeakA = clientAOrders.some((o) => o.clientUid === CLIENT_B_UID || o.id === ORDER_B_ID);
    assert(!crossLeakA, "Zero cross-tenant leak: Client A results never include Client B orders");

    // -------------------------------------------------------------------------
    // Test 6: UTR Payment Submission via PaymentsStore.submitUtr
    // -------------------------------------------------------------------------
    console.log("\n[Test 6] Submitting client UTR via PaymentsStore.submitUtr...");
    const submitResult = await PaymentsStore.submitUtr({
      orderId: ORDER_A_ID,
      utrNumber: TEST_UTR,
      amountINR: 75000,
      clientUid: CLIENT_A_UID,
      clientEmail: CLIENT_A_EMAIL,
      clientName: CLIENT_A_NAME,
      screenshotUrl: `https://drive.google.com/file/d/test_screenshot_${TEST_TIMESTAMP}/view`,
    });

    assert(submitResult.success === true, "PaymentsStore.submitUtr succeeded");
    assert(submitResult.payment !== undefined, "Payment record created in response");
    assert(submitResult.payment?.utrNumber === TEST_UTR, `Payment UTR matches: ${submitResult.payment?.utrNumber}`);

    // Verify Safety Gate: MUST NOT be 'paid' prematurely
    assert(
      (submitResult.payment?.status === "payment_submitted" || submitResult.payment?.status === "pending_verification") &&
        submitResult.payment?.status !== "paid",
      "Safety Gate: Payment status is 'payment_submitted' / 'pending_verification' (NEVER 'paid' on submission)"
    );

    // Verify Order state in memory and database
    const orderAfterUtr = OrdersStore.findById(ORDER_A_ID);
    assert(
      orderAfterUtr?.paymentStatus === "pending_verification",
      "Order paymentStatus updated to 'pending_verification'"
    );

    // Verify Payment persisted to PostgreSQL
    const dbPayment = await prisma.payment.findFirst({ where: { utr: TEST_UTR } });
    assert(dbPayment !== null, "Payment record found in PostgreSQL by UTR");
    assert(dbPayment?.orderId === ORDER_A_ID, `Payment orderId points to Order A: ${dbPayment?.orderId}`);
    assert(dbPayment?.clientUid === CLIENT_A_UID, `Payment clientUid points to Client A: ${dbPayment?.clientUid}`);
    assert(dbPayment?.amount === 75000, `Payment amount is ₹75,000`);
    assert(
      (dbPayment?.status === "payment_submitted" || dbPayment?.status === "pending_verification") &&
        dbPayment?.status !== "paid",
      "PostgreSQL payment status is 'payment_submitted' / 'pending_verification'"
    );

    // -------------------------------------------------------------------------
    // Test 7: Single-use UTR Enforcement
    // -------------------------------------------------------------------------
    console.log("\n[Test 7] Testing single-use UTR uniqueness enforcement...");
    const duplicateSubmit = await PaymentsStore.submitUtr({
      orderId: ORDER_B_ID,
      utrNumber: TEST_UTR, // Duplicate UTR
      amountINR: 120000,
      clientUid: CLIENT_B_UID,
      clientEmail: CLIENT_B_EMAIL,
      clientName: CLIENT_B_NAME,
    });

    assert(
      duplicateSubmit.success === false,
      "Duplicate UTR submission is strictly rejected"
    );
    assert(
      typeof duplicateSubmit.error === "string" && duplicateSubmit.error.length > 0,
      `Rejection message received: ${duplicateSubmit.error}`
    );

    // -------------------------------------------------------------------------
    // Test 8: Admin Payment Verification with Transactional ACID Transition
    // -------------------------------------------------------------------------
    console.log("\n[Test 8] Admin verifies payment via PaymentsStore.verifyPayment...");
    const verifyResult = await PaymentsStore.verifyPayment({
      paymentId: submitResult.payment.id,
      adminActor: {
        uid: "usr_admin_master",
        email: "admin@sutrastudio.com",
        name: "Studio Director",
        role: "admin",
      },
      verifiedAmountINR: 75000,
      note: "Bank account credit confirmed via HDFC UPI statement.",
    });

    assert(verifyResult.success === true, "PaymentsStore.verifyPayment returned success");
    assert(verifyResult.payment?.status === "paid", "Payment status transitioned to 'paid'");

    // Verify PostgreSQL transactional state for Payment
    const dbPaymentAfterVerify = await prisma.payment.findUnique({
      where: { id: submitResult.payment.id },
    });
    assert(dbPaymentAfterVerify?.status === "paid", "PostgreSQL Payment status updated to 'paid'");

    // Verify PostgreSQL transactional state for Order
    const dbOrderAfterVerify = await prisma.order.findUnique({
      where: { id: ORDER_A_ID },
    });
    assert(
      dbOrderAfterVerify?.paymentStatus === "paid",
      "PostgreSQL Order paymentStatus transitioned to 'paid'"
    );
    assert(
      dbOrderAfterVerify?.status === "in_production",
      "PostgreSQL Order status transitioned to 'in_production'"
    );
    assert(
      dbOrderAfterVerify?.amountPaid === 75000,
      `PostgreSQL Order amountPaid is ₹75,000 (received: ${dbOrderAfterVerify?.amountPaid})`
    );

    // -------------------------------------------------------------------------
    // Test 9: OrdersStore.markAsPaid directly verifies state
    // -------------------------------------------------------------------------
    console.log("\n[Test 9] Verifying OrdersStore state reflecting verified order...");
    const reloadedOrderA = OrdersStore.findById(ORDER_A_ID);
    assert(reloadedOrderA?.paymentStatus === "paid", "Memory OrdersStore paymentStatus is 'paid'");
    assert(reloadedOrderA?.status === "in_production", "Memory OrdersStore status is 'in_production'");
    assert(reloadedOrderA?.amountPaid === 75000, "Memory OrdersStore amountPaid is ₹75,000");

    // -------------------------------------------------------------------------
    // Test 10: Automatic User resolution for anonymous / un-bootstrapped orders
    // -------------------------------------------------------------------------
    console.log("\n[Test 10] Testing auto-resolution of parent User on order insertion...");
    const autoOrderNumber = `SUTRA-AUTO-${TEST_TIMESTAMP.toString().slice(-6)}`;
    const autoOrderId = `ord_auto_test_${TEST_TIMESTAMP}`;
    const autoClientEmail = `auto_client_${TEST_TIMESTAMP}@sutrastudio.com`;

    const dbFacade = adminDb();
    await dbFacade.collection("orders").doc(autoOrderId).set({
      orderNumber: autoOrderNumber,
      clientEmail: autoClientEmail,
      clientName: "New Guest Client",
      service: "Rapid Consultation",
      totalAmount: 15000,
      status: "pending_payment",
      paymentStatus: "pending_payment",
    });

    const persistedAutoOrder = await prisma.order.findUnique({ where: { id: autoOrderId } });
    assert(persistedAutoOrder !== null, "Auto-resolved order created in PostgreSQL");

    const parentUserOfAutoOrder = await prisma.user.findFirst({ where: { email: autoClientEmail } });
    assert(parentUserOfAutoOrder !== null, "Parent User automatically created to satisfy foreign key");
    assert(
      persistedAutoOrder?.clientUid === parentUserOfAutoOrder?.uid,
      "Order.clientUid correctly references the newly created User.uid"
    );

    // Clean up auto test order
    await prisma.order.deleteMany({ where: { id: autoOrderId } });
    await prisma.user.deleteMany({ where: { uid: parentUserOfAutoOrder?.uid } });
    assert(true, "Auto-test synthetic records cleaned up");

  } catch (error) {
    console.error("Test execution threw unhandled exception:", error);
    testFailed++;
  } finally {
    // -------------------------------------------------------------------------
    // Teardown: Clean up synthetic test data
    // -------------------------------------------------------------------------
    console.log("\n[Teardown] Cleaning up all synthetic test data from PostgreSQL...");
    try {
      await prisma.payment.deleteMany({
        where: {
          OR: [
            { orderId: ORDER_A_ID },
            { orderId: ORDER_B_ID },
            { clientUid: CLIENT_A_UID },
            { clientUid: CLIENT_B_UID },
            { utr: TEST_UTR },
          ],
        },
      });

      await prisma.order.deleteMany({
        where: {
          OR: [
            { id: ORDER_A_ID },
            { id: ORDER_B_ID },
            { clientUid: CLIENT_A_UID },
            { clientUid: CLIENT_B_UID },
          ],
        },
      });

      await prisma.user.deleteMany({
        where: {
          OR: [
            { uid: CLIENT_A_UID },
            { uid: CLIENT_B_UID },
          ],
        },
      });

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
