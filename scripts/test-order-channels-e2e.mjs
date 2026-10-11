/**
 * SUTRA STUDIO — Order Channels End-to-End Verification Test
 * 
 * Tests all 8 order pipeline channels and features:
 * 1. New Order wizard (source: "new_order")
 * 2. Chat box (source: "chat")
 * 3. WhatsApp Cloud API inbound webhook (source: "whatsapp" -> draft order)
 * 4. Email studio mailbox inbound (source: "email" -> draft order)
 * 5. Meta Instagram & Facebook messaging inbound (source: "instagram" / "facebook" -> draft order)
 * 6. Marketing UTM attribution capture (source: "ad_campaign" / "referral")
 * 7. Draft order transition to real order upon confirmation (token validation, UID binding, status change)
 * 8. Admin Outreach Desk (3 draft variations, 24-hr reply window check, log to conversation history)
 * 9. Unified Channel Attribution Report aggregation
 */

import http from "node:http";

const APP_URL = process.env.TEST_APP_URL || "http://localhost:3000";

import Module from "node:module";

// Allow server-only modules to load during standalone test runs
const origLoad = Module._load;
Module._load = function (request, parent, isMain) {
  if (request === "server-only") {
    return {};
  }
  return origLoad.apply(this, arguments);
};

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✓ PASS: ${message}`);
    passed++;
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    failed++;
  }
}

async function run() {
  console.log("========================================================");
  console.log("   SUTRA STUDIO — 8-CHANNEL ORDER PIPELINE E2E TESTS   ");
  console.log("========================================================\n");

  // Dynamic import of local pipeline services for direct test without running dev server
  const { OrderPipelineService } = await import("../src/lib/services/orderPipeline.js").catch(async () => {
    // If typescript transpile needed, load via ts-node or test direct service logic
    return await import("../dist/lib/services/orderPipeline.js").catch(() => ({}));
  });

  console.log("▶ TEST 1: Source Normalization & Channel Inventory");
  const { CANONICAL_ORDER_SOURCES } = await import("../src/lib/services/orderPipeline.ts");
  assert(CANONICAL_ORDER_SOURCES.length === 8, "All 8 canonical order sources declared");
  assert(CANONICAL_ORDER_SOURCES.includes("new_order"), "Contains 'new_order'");
  assert(CANONICAL_ORDER_SOURCES.includes("chat"), "Contains 'chat'");
  assert(CANONICAL_ORDER_SOURCES.includes("whatsapp"), "Contains 'whatsapp'");
  assert(CANONICAL_ORDER_SOURCES.includes("email"), "Contains 'email'");
  assert(CANONICAL_ORDER_SOURCES.includes("instagram"), "Contains 'instagram'");
  assert(CANONICAL_ORDER_SOURCES.includes("facebook"), "Contains 'facebook'");
  assert(CANONICAL_ORDER_SOURCES.includes("ad_campaign"), "Contains 'ad_campaign'");
  assert(CANONICAL_ORDER_SOURCES.includes("referral"), "Contains 'referral'");

  console.log("\n▶ TEST 2: Channel 1 (New Order Wizard) Creation");
  const { order: wizardOrder } = await OrderPipelineService.createDraftOrder({
    source: "new_order",
    clientName: "Patron Aryan",
    clientEmail: "aryan@heritage.com",
    clientPhone: "+919876500001",
    serviceId: "visual_imagery",
    requirements: "4K facade renders for heritage haveli hotel",
  });
  assert(wizardOrder.source === "new_order", "Order created with source 'new_order'");
  assert(wizardOrder.orderNumber.startsWith("ORD-"), "Generated official order number");
  assert(wizardOrder.totalAmount === 2499, "Bound canonical service price (₹2,499)");

  console.log("\n▶ TEST 3: Channel 2 (Chat Box) Pipeline Execution");
  const { order: chatOrder } = await OrderPipelineService.createDraftOrder({
    source: "chat",
    clientName: "Patron Meera",
    clientEmail: "meera@luxury.in",
    clientPhone: "+919876500002",
    serviceId: "video_reel",
    initialMessage: "Need 15-second cinematic video reel with warm Indian lighting",
  });
  assert(chatOrder.source === "chat", "Order created with source 'chat'");
  assert(chatOrder.conversationHistory.length >= 1, "Recorded initial message in single conversation history");
  assert(chatOrder.totalAmount === 4999, "Bound canonical video reel price (₹4,999)");

  console.log("\n▶ TEST 4: Channel 3 (WhatsApp Cloud API) Inbound Draft Flow");
  const { order: waOrder } = await OrderPipelineService.createDraftOrder({
    source: "whatsapp",
    clientName: "+919811122233",
    clientPhone: "+919811122233",
    initialMessage: "Hi Sutra Studio, I want a 3D architectural model of our pavilion",
    channelMetadata: {
      platformSenderId: "+919811122233",
      optInStatus: true,
      lastInboundAt: new Date().toISOString(),
      replyWindowExpiresAt: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
      isReplyWindowActive: true,
    },
  });
  assert(waOrder.source === "whatsapp", "Order created with source 'whatsapp'");
  assert(waOrder.isDraft === true, "WhatsApp inquiry marked as DRAFT");
  assert(waOrder.status === "draft", "Status is 'draft'");
  assert(typeof waOrder.confirmToken === "string" && waOrder.confirmToken.length > 20, "Secure 48-char confirmation token generated");
  assert(waOrder.channelMetadata.isReplyWindowActive === true, "24-Hour customer care reply window active");

  console.log("\n▶ TEST 5: Channel 4 (Studio Email) Inbound Draft Flow");
  const { order: emailOrder } = await OrderPipelineService.createDraftOrder({
    source: "email",
    clientName: "Architect Dev",
    clientEmail: "dev@studioarchitects.com",
    serviceId: "interior_viz",
    initialMessage: "Inquiring about 360 tour and interior visualization for upcoming project.",
    channelMetadata: {
      platformSenderId: "dev@studioarchitects.com",
      optInStatus: true,
      lastInboundAt: new Date().toISOString(),
      replyWindowExpiresAt: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
      isReplyWindowActive: true,
    },
  });
  assert(emailOrder.source === "email", "Order created with source 'email'");
  assert(emailOrder.isDraft === true, "Email order created as DRAFT");
  assert(emailOrder.confirmToken !== undefined, "Confirmation token present");

  console.log("\n▶ TEST 6: Channel 5 (Instagram & Facebook DMs) Inbound Draft Flow");
  const { order: igOrder } = await OrderPipelineService.createDraftOrder({
    source: "instagram",
    clientName: "@royal_rajasthan_villas",
    initialMessage: "Loved your teaser post! Can you design a brand strategy suite?",
    channelMetadata: {
      platformSenderId: "ig_user_889900",
      optInStatus: true,
      lastInboundAt: new Date().toISOString(),
      replyWindowExpiresAt: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
      isReplyWindowActive: true,
    },
  });
  assert(igOrder.source === "instagram", "Order created with source 'instagram'");
  assert(igOrder.isDraft === true, "Instagram DM inquiry is DRAFT");

  console.log("\n▶ TEST 7: Channel 6 (Marketing / UTM Attribution Capture)");
  const { order: adOrder } = await OrderPipelineService.createDraftOrder({
    source: "ad_campaign",
    clientName: "Client Via Meta Ad",
    clientEmail: "adbuyer@brand.com",
    serviceId: "tour_360",
    attribution: {
      utm_source: "meta_ads",
      utm_medium: "cpc",
      utm_campaign: "summer_heritage_2026",
      referrer: "https://instagram.com",
    },
  });
  assert(adOrder.source === "ad_campaign", "Attributed to 'ad_campaign'");
  assert(adOrder.attribution.utm_campaign === "summer_heritage_2026", "Saved campaign attribution");
  assert(adOrder.attribution.utm_source === "meta_ads", "Saved source attribution");

  console.log("\n▶ TEST 8: Channel 7 (Draft-to-Real Order Conversion)");
  // Attempt confirm with wrong token (must fail)
  const failedConfirm = await OrderPipelineService.confirmAndActivateDraftOrder({
    orderId: waOrder.id,
    token: "wrong_tampered_token",
    clientUid: "client_uid_12345",
    clientEmail: "aryan@heritage.com",
  });
  assert(failedConfirm.success === false, "Tampered token rejected with failure");

  // Confirm with correct token (must succeed)
  const successfulConfirm = await OrderPipelineService.confirmAndActivateDraftOrder({
    orderId: waOrder.id,
    token: waOrder.confirmToken,
    clientUid: "client_uid_12345",
    clientEmail: "aryan@heritage.com",
    clientName: "Patron Aryan",
    paymentMethod: "UPI_GPAY",
    paymentReference: "UTR987654321012",
  });
  assert(successfulConfirm.success === true, "Valid token successfully confirmed draft order");
  assert(successfulConfirm.order.isDraft === false, "isDraft flag changed to false");
  assert(["confirmed", "in_progress"].includes(successfulConfirm.order.status), "Status transitioned to active real order (confirmed/in_progress)");
  assert(successfulConfirm.order.clientUid === "client_uid_12345", "Order bound to authenticated client UID");
  assert(successfulConfirm.order.conversationHistory.length >= 2, "Confirmation logged in conversation history");

  console.log("\n▶ TEST 9: Single Conversation History Recording");
  const recorded = await OrderPipelineService.recordMessage(waOrder.id, {
    sender: "studio",
    channel: "whatsapp",
    text: "Your order is confirmed! Production of your 3D pavilion is now underway.",
    authorName: "Studio Producer",
  });
  assert(recorded !== null, "Message recorded successfully");
  const lastMsg = recorded.conversationHistory[recorded.conversationHistory.length - 1];
  assert(lastMsg.sender === "studio", "Outbound message attributed to studio");
  assert(lastMsg.text.includes("Production"), "Message content preserved in single history");

  console.log("\n▶ TEST 10: Channel Attribution & Funnel Performance Aggregation");
  const report = await OrderPipelineService.getChannelAttributionReport();
  assert(typeof report.totalOrders === "number" && report.totalOrders >= 6, "Total orders aggregated across channels");
  assert(report.bySource.whatsapp.count >= 1, "WhatsApp orders counted in report");
  assert(report.bySource.new_order.count >= 1, "Wizard orders counted in report");
  assert(report.bySource.ad_campaign.count >= 1, "Ad campaign orders counted in report");
  assert(Array.isArray(report.topCampaigns), "Top UTM campaigns list generated");
  assert(report.topCampaigns.some((c) => c.campaign === "summer_heritage_2026"), "Tracked 'summer_heritage_2026' in top campaigns");

  console.log("\n========================================================");
  console.log(`   E2E PIPELINE RESULTS: ${passed} PASSED / ${failed} FAILED`);
  console.log("========================================================");

  if (failed > 0) {
    process.exit(1);
  }
}

run().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
