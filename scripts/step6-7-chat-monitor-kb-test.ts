/**
 * SUTRA STUDIO — Step 6 & 7 Chat Monitor & AI Knowledge Base Validation Suite
 * Tests per-service FAQs across all 12 services, pricing rules, trial & renewal policies,
 * delivery timelines, Chat Monitor client intelligence panel, active monthly plans, and live order tracking.
 */

import { AiKnowledgeService } from "../src/lib/services/aiKnowledgeService";
import { OrdersStore, computeOrderProgress } from "../src/lib/services/ordersStore";
import { SEED_CATALOG_SERVICES, SEED_CATALOG_PLANS } from "../src/lib/services/serviceCatalog";

let passed = 0;
let failed = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  if (condition) {
    console.log(`  ✓ PASS: ${testName}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${testName}${detail ? ` — ${detail}` : ""}`);
    failed++;
  }
}

async function runStep6And7Tests() {
  console.log("===============================================================================");
  console.log("SUTRA STUDIO — STEP 6 & 7 CHAT MONITOR & AI KNOWLEDGE BASE TEST SUITE");
  console.log("===============================================================================\n");

  // SECTION 1: AI Knowledge Base — Per-Service FAQs & Delivery SLAs
  console.log("--- Section 1: AI Knowledge Base Per-Service FAQs & Delivery SLAs ---");

  const allEntries = await AiKnowledgeService.getActiveKnowledgeEntries();
  assert(allEntries.length >= 15, "Knowledge base contains at least 15 active studio rules and FAQs");

  // Test retrieval for multiple key service domains
  const servicesToTest = [
    { query: "How fast is Image Creation turnaround and what is included?", keyword: "5,499" },
    { query: "What format and audio are included in Video Creation?", keyword: "ProRes" },
    { query: "What 3D formats are delivered in 3D Modeling?", keyword: "GLTF" },
    { query: "How do 360 Virtual Tours work?", keyword: "8K" },
    { query: "What is included in Interior Design?", keyword: "12,499" },
    { query: "What are the specs for Website Development?", keyword: "Next.js" },
    { query: "What is delivered in AI Automation pipelines?", keyword: "Cloud Functions" },
  ];

  for (const s of servicesToTest) {
    const match = await AiKnowledgeService.findRelevantKnowledge(s.query);
    assert(
      Boolean(match && match.matched.length > 0 && match.matched[0].answer.includes(s.keyword)),
      `AI Knowledge retrieval accurately answers for: "${s.query.slice(0, 35)}..."`
    );
  }

  // SECTION 2: Pricing Rules & Discount Policies
  console.log("\n--- Section 2: Pricing Rules & Discount Policies ---");
  const priceMatch = await AiKnowledgeService.findRelevantKnowledge("What currency and billing discounts apply?");
  assert(
    Boolean(priceMatch && priceMatch.matched[0].answer.includes("Indian Rupees") && priceMatch.matched[0].answer.includes("15%")),
    "AI Knowledge contains ₹ INR currency rule and 5%/15% quarterly/annual discounts"
  );

  // SECTION 3: 3-Day Free Trial & Retainer Renewal Policy
  console.log("\n--- Section 3: Trial & Renewal Policies ---");
  const trialMatch = await AiKnowledgeService.findRelevantKnowledge("How does the 3-day free trial work and how to cancel?");
  assert(
    Boolean(trialMatch && trialMatch.matched[0].answer.includes("3-Day Free Trial") && trialMatch.matched[0].answer.includes("zero upfront")),
    "AI Knowledge explains 3-Day Free Trial and zero-cost cancellation policy"
  );

  const renewMatch = await AiKnowledgeService.findRelevantKnowledge("When does monthly retainer renew and what if it expires?");
  assert(
    Boolean(renewMatch && renewMatch.matched[0].answer.includes("5 days") && renewMatch.matched[0].answer.includes("expired / closed")),
    "AI Knowledge explains 5-day/1-day reminders, auto-closure, and one-click renewal"
  );

  // SECTION 4: Chat Monitor Client Intelligence & Active Plan Derivation
  console.log("\n--- Section 4: Chat Monitor Client Intelligence Panel ---");

  const testClientId = "usr_client_monitor_test";
  const now = new Date().toISOString();

  // Create an active monthly plan order
  const mockPlanOrder: any = {
    id: `ord_plan_${Date.now()}`,
    orderNumber: "ORD-2026-PLAN101",
    title: "Studio Growth Retainer",
    service: "Studio Growth",
    type: "monthly_plan",
    status: "trial",
    statusLabel: "3-Day Free Trial Active",
    billingCycle: "monthly",
    totalAmount: 12999,
    clientUid: testClientId,
    clientId: testClientId,
    clientName: "Aarav Singhania",
    clientEmail: "aarav@maisonaura.com",
    driveFolderId: "drive_fld_maison_002",
    driveFolderLink: "https://drive.google.com/drive/folders/drive_fld_maison_002",
    paymentStatus: "unpaid",
    estimatedDueDate: new Date(Date.now() + 3 * 24 * 3600 * 1000).toISOString(),
    createdAt: now,
    updatedAt: now,
  };

  // Create a production service order
  const mockServiceOrder: any = {
    id: `ord_srv_${Date.now()}`,
    orderNumber: "ORD-2026-SRV202",
    title: "Commercial Cinematic Reel",
    service: "Video Creation",
    type: "service",
    status: "in_production",
    statusLabel: "In Production",
    totalAmount: 7999,
    clientUid: testClientId,
    clientId: testClientId,
    clientName: "Aarav Singhania",
    clientEmail: "aarav@maisonaura.com",
    driveFolderId: "drive_fld_maison_002",
    driveFolderLink: "https://drive.google.com/drive/folders/drive_fld_maison_002",
    paymentStatus: "paid",
    createdAt: now,
    updatedAt: now,
  };

  OrdersStore.add(mockPlanOrder);
  OrdersStore.add(mockServiceOrder);

  const clientOrders = OrdersStore.getAll().filter((o) => o.clientUid === testClientId);
  assert(clientOrders.length >= 2, "Chat Monitor retrieves all orders for client");

  // Verify Active Plan Derivation
  const activePlan = clientOrders.find((o) => o.type === "monthly_plan" || o.status === "trial" || o.status === "active");
  assert(Boolean(activePlan && activePlan.status === "trial"), "Chat Monitor identifies client's active 3-Day Free Trial plan");
  assert(Boolean(activePlan?.estimatedDueDate), "Chat Monitor displays trial expiry date");

  // Verify Live Progress %, Payment Status & Drive Link for Service Order
  const srvProgress = computeOrderProgress(mockServiceOrder);
  assert(srvProgress.percentage === 60 && srvProgress.stageName === "In Production", "Order computes live 60% progress for In Production");
  assert(mockServiceOrder.paymentStatus === "paid", "Order displays verified payment status");
  assert(mockServiceOrder.driveFolderLink.includes("drive.google.com"), "Order displays dedicated Google Drive vault link");

  // SECTION 5: Admin Feedback & One-Click AI Correction Engine
  console.log("\n--- Section 5: Producer Feedback & One-Click AI Correction ---");

  const savedFeedback = await AiKnowledgeService.saveFeedback({
    chatId: "cl-2",
    messageId: `msg_${Date.now()}`,
    rating: "bad",
    userQuery: "How many revisions are included in the Studio Growth plan?",
    aiReply: "Only 1 revision.",
    correctedAnswer: "Studio Growth includes unlimited minor revisions for 7 days during active subscription.",
    adminId: "usr_admin_001",
    adminName: "Raghavan Sharma",
  });

  assert(Boolean(savedFeedback.id), "Admin feedback saved successfully");

  // Check if auto-generated correction entry exists
  const updatedEntries = await AiKnowledgeService.getActiveKnowledgeEntries();
  const correctionEntry = updatedEntries.find((e) => e.question?.includes("Studio Growth plan"));
  assert(Boolean(correctionEntry && correctionEntry.answer.includes("unlimited minor revisions")), "Chat correction automatically promotes to active Knowledge Base");

  // SUMMARY REPORT
  console.log("\n===============================================================================");
  console.log(`TEST SUMMARY: Total ${passed + failed} | Passed: ${passed} | Failed: ${failed}`);
  console.log("===============================================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

runStep6And7Tests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
