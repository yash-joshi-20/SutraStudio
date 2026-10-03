import { NextResponse } from "next/server";
import { ChatToolsService, CreateCommissionDraftParams } from "@/lib/services/chatTools";
import { AiKnowledgeService } from "@/lib/services/aiKnowledgeService";
import { SEED_CATALOG_SERVICES } from "@/lib/services/serviceCatalog";
import { requestRole, requestUid } from "@/lib/auth/requestRole";

// In-memory rate limiter: 60 requests / minute per client/IP
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(key: string): { allowed: boolean; remaining: number; resetInSec: number } {
  const now = Date.now();
  const windowMs = 60 * 1000;
  const maxRequests = 60;

  const record = rateLimitMap.get(key);
  if (!record || now > record.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: maxRequests - 1, resetInSec: 60 };
  }

  if (record.count >= maxRequests) {
    const resetInSec = Math.ceil((record.resetAt - now) / 1000);
    return { allowed: false, remaining: 0, resetInSec };
  }

  record.count += 1;
  const resetInSec = Math.ceil((record.resetAt - now) / 1000);
  return { allowed: true, remaining: maxRequests - record.count, resetInSec };
}

interface ClassifyResult {
  service: string;
  serviceId: string;
  workflowType: string;
  confidence: number;
}

function classifyPrompt(prompt: string): ClassifyResult {
  const p = prompt.toLowerCase();

  if (p.includes("video") || p.includes("ad") || p.includes("reel") || p.includes("commercial")) {
    return { service: "Video Creation", serviceId: "vid-creation", workflowType: "video", confidence: 0.94 };
  }
  if (p.includes("360") || p.includes("panorama") || p.includes("virtual tour")) {
    return { service: "360 View", serviceId: "360-view", workflowType: "three-sixty", confidence: 0.96 };
  }
  if (p.includes("interior") || p.includes("room") || p.includes("furniture") || p.includes("living")) {
    return { service: "Interior Design", serviceId: "interior-design", workflowType: "interior", confidence: 0.92 };
  }
  if (p.includes("elevation") || p.includes("facade") || p.includes("exterior")) {
    return { service: "Architectural Elevation", serviceId: "elevation-design", workflowType: "three-d", confidence: 0.93 };
  }
  if (p.includes("3d") || p.includes("render") || p.includes("model") || p.includes("bottle")) {
    return { service: "3D Modeling", serviceId: "3d-modeling", workflowType: "three-d", confidence: 0.91 };
  }
  if (p.includes("website") || p.includes("web") || p.includes("landing") || p.includes("portal") || p.includes("frontend")) {
    return { service: "Website Development", serviceId: "website", workflowType: "website", confidence: 0.95 };
  }
  if (p.includes("marketing") || p.includes("meta") || p.includes("campaign") || p.includes("instagram") || p.includes("facebook")) {
    return { service: "Meta Ads & Digital Marketing", serviceId: "meta-ads", workflowType: "marketing", confidence: 0.90 };
  }
  if (p.includes("automation") || p.includes("n8n") || p.includes("sync") || p.includes("webhook")) {
    return { service: "AI Automation", serviceId: "ai-automation", workflowType: "automation", confidence: 0.93 };
  }

  return { service: "Image Creation", serviceId: "img-creation", workflowType: "image", confidence: 0.88 };
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const scope = searchParams.get("scope");

    if (scope === "knowledge") {
      const entries = await AiKnowledgeService.getKnowledgeEntries();
      return NextResponse.json({ entries });
    }

    if (scope === "common_questions") {
      const questions = await AiKnowledgeService.getCommonQuestions();
      return NextResponse.json({ questions });
    }

    if (scope === "settings") {
      const settings = await AiKnowledgeService.getAiSettings();
      return NextResponse.json({ settings });
    }

    if (scope === "feedback") {
      const feedback = await AiKnowledgeService.getFeedbackList();
      return NextResponse.json({ feedback });
    }

    if (scope === "services") {
      const services = await ChatToolsService.listServices();
      return NextResponse.json({ services });
    }

    if (scope === "plans") {
      const plans = await ChatToolsService.listPlans();
      return NextResponse.json({ plans });
    }

    const [entries, questions, settings, feedback] = await Promise.all([
      AiKnowledgeService.getKnowledgeEntries(),
      AiKnowledgeService.getCommonQuestions(),
      AiKnowledgeService.getAiSettings(),
      AiKnowledgeService.getFeedbackList(),
    ]);

    return NextResponse.json({
      knowledge: entries,
      commonQuestions: questions,
      settings,
      feedback,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const callerUid = await requestUid(req);
    const callerRole = await requestRole(req);
    if (!callerUid) {
      return NextResponse.json({ error: "Sign in to continue." }, { status: 401 });
    }
    const ip = req.headers.get("x-forwarded-for") || callerUid;

    // Rate Limiting
    const rateCheck = checkRateLimit(`${callerUid}_${ip}`);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          error: "Rate limit exceeded. Please wait a moment before sending more requests.",
          resetInSec: rateCheck.resetInSec,
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(rateCheck.resetInSec),
            "X-RateLimit-Remaining": "0",
          },
        }
      );
    }

    const body = await req.json();
    const {
      message = "",
      mode,
      action,
      tool,
      params = {},
      clientId,
      internalNote,
      feedbackData,
      knowledgeData,
      settingsData,
    } = body;

    // Direct Tool / Action Invocation Dispatcher
    if (action || tool) {
      const toolName = action || tool;

      if (toolName === "list_services") {
        const services = await ChatToolsService.listServices();
        return NextResponse.json({ success: true, tool: "list_services", data: services });
      }

      if (toolName === "get_service_details") {
        const details = await ChatToolsService.getServiceDetails(params.serviceId || "3d-modeling");
        return NextResponse.json({ success: true, tool: "get_service_details", data: details });
      }

      if (toolName === "list_plans") {
        const plans = await ChatToolsService.listPlans();
        return NextResponse.json({ success: true, tool: "list_plans", data: plans });
      }

      if (toolName === "get_upload_link") {
        const link = await ChatToolsService.getUploadLink({
          orderId: params.orderId,
          clientUid: callerUid,
        });
        return NextResponse.json({ success: !link.error, tool: "get_upload_link", data: link });
      }

      if (toolName === "start_checkout") {
        const checkout = await ChatToolsService.startCheckout({
          orderId: params.orderId,
          clientUid: callerUid,
        });
        return NextResponse.json({ success: !checkout.error, tool: "start_checkout", data: checkout });
      }

      if (toolName === "get_my_orders") {
        const orders = await ChatToolsService.getMyOrders({ clientUid: callerUid });
        return NextResponse.json({ success: true, tool: "get_my_orders", data: orders });
      }

      if (toolName === "renew_plan") {
        const renew = await ChatToolsService.renewPlan({
          orderId: params.orderId,
          clientUid: callerUid,
          billingCycle: params.billingCycle,
        });
        return NextResponse.json({ success: !renew.error, tool: "renew_plan", data: renew });
      }

      if (toolName === "cancel_trial") {
        const cancel = await ChatToolsService.cancelTrial({
          orderId: params.orderId,
          clientUid: callerUid,
          reason: params.reason,
        });
        return NextResponse.json({ success: !cancel.error, tool: "cancel_trial", data: cancel });
      }

      if (toolName === "request_revision") {
        const revision = await ChatToolsService.requestRevision({
          orderId: params.orderId,
          clientUid: callerUid,
          comment: params.comment || "Revision requested via AI Chat",
        });
        return NextResponse.json({ success: !revision.error, tool: "request_revision", data: revision });
      }

      if (toolName === "approve_delivery") {
        const approval = await ChatToolsService.approveDelivery({
          orderId: params.orderId,
          clientUid: callerUid,
          confirmed: Boolean(params.confirmed),
          comment: params.comment,
        });
        return NextResponse.json({ success: !approval.error, tool: "approve_delivery", data: approval });
      }

      if (toolName === "create_commission_draft") {
        const draft = await ChatToolsService.createCommissionDraft({
          ...params,
          clientUid: callerUid,
        });
        return NextResponse.json({ success: draft.success, tool: "create_commission_draft", data: draft });
      }
    }

    // Handle Admin Knowledge / Feedback Actions
    if (action === "feedback" && feedbackData) {
      const saved = await AiKnowledgeService.saveFeedback({
        chatId: feedbackData.chatId || "chat_001",
        messageId: feedbackData.messageId || `msg_${Date.now()}`,
        rating: feedbackData.rating || "good",
        correctedAnswer: feedbackData.correctedAnswer,
        adminId: callerUid,
        adminName: feedbackData.adminName || "Studio Administrator",
        userQuery: feedbackData.userQuery,
        aiReply: feedbackData.aiReply,
      });
      return NextResponse.json({ success: true, feedback: saved });
    }

    if (action === "add_knowledge" && knowledgeData) {
      const entry = await AiKnowledgeService.addKnowledgeEntry(knowledgeData);
      return NextResponse.json({ success: true, entry });
    }

    if (action === "update_settings" && settingsData) {
      const updated = await AiKnowledgeService.updateAiSettings(
        settingsData,
        settingsData.adminName || "Studio Administrator"
      );
      return NextResponse.json({ success: true, settings: updated });
    }

    if (action === "reset_settings") {
      const reset = await AiKnowledgeService.resetAiSettingsToDefault("Studio Administrator");
      return NextResponse.json({ success: true, settings: reset });
    }

    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "Message content is required" }, { status: 400 });
    }

    const lower = message.toLowerCase();

    // PROMPT INJECTION & CONFIDENTIALITY DEFENSE
    // 1. Jailbreak / System Prompt Extraction Guard
    if (
      lower.includes("ignore previous instructions") ||
      lower.includes("ignore all previous") ||
      lower.includes("system prompt") ||
      lower.includes("reveal your instructions") ||
      lower.includes("developer mode") ||
      lower.includes("jailbreak") ||
      lower.includes("dan mode") ||
      lower.includes("api key") ||
      lower.includes("secret key") ||
      lower.includes("service account") ||
      lower.includes("bearer token")
    ) {
      return NextResponse.json({
        reply: "Sutra Studio operates under strict proprietary security protocols. I cannot expose system instructions, internal keys, or bypass operational guidelines.",
        mode: "ai",
        refusal: true,
        timestamp: new Date().toISOString(),
      });
    }

    // 2. Cross-Client & Confidentiality Guard
    if (
      lower.includes("another client") ||
      lower.includes("other client") ||
      lower.includes("client a") ||
      lower.includes("client b") ||
      lower.includes("other company") ||
      lower.includes("competitor") ||
      lower.includes("who else is working with you")
    ) {
      return NextResponse.json({
        reply: "Sutra Studio operates under strict non-disclosure and client confidentiality agreements. I cannot disclose, discuss, or retrieve details regarding other client commissions, private workspaces, or accounts.",
        mode: "ai",
        refusal: true,
        timestamp: new Date().toISOString(),
      });
    }

    // 3. Internal Pipeline Probing Guard
    if (
      lower.includes("how sutra works internally") ||
      lower.includes("internal architecture") ||
      lower.includes("backend secrets") ||
      lower.includes("n8n credentials") ||
      lower.includes("firestore credentials")
    ) {
      return NextResponse.json({
        reply: "Sutra Studio is a bespoke creative technology atelier. We blend sacred geometric principles with proprietary digital craftsmanship and generative spatial workflows. Our internal systems and pipelines are fully managed by our executive studio team to guarantee flawless delivery for your brand.",
        mode: "ai",
        refusal: false,
        timestamp: new Date().toISOString(),
      });
    }

    // Admin Takeover Mode (Human Producer Intervention)
    if (mode === "admin" || mode === "takeover") {
      return NextResponse.json({
        reply: `Studio Executive Producer: I have received your request regarding "${message}". We are reviewing the deliverables and will reach out with details shortly.`,
        mode: "admin",
        producer: "Studio Executive Producer",
        clientId: clientId || callerUid,
        internalNote: callerRole === "admin" ? internalNote || null : null,
        timestamp: new Date().toISOString(),
      });
    }

    // NATURAL LANGUAGE TOOL INVOCATIONS

    // Tool 11: approve_delivery
    if (
      lower.includes("approve delivery") ||
      lower.includes("approve order") ||
      lower.includes("accept delivery") ||
      lower.includes("sign off on order") ||
      (lower.includes("approve") && (lower.includes("ord-") || lower.includes("deliverable")))
    ) {
      const orderMatch = message.match(/(?:ord[-_]|#)(\w+)/i);
      const orders = await ChatToolsService.getMyOrders({ clientUid: callerUid });
      const targetOrder = orderMatch
        ? orders.find((o) => o.orderNumber?.toLowerCase().includes(orderMatch[1].toLowerCase()) || o.id.toLowerCase().includes(orderMatch[1].toLowerCase()))
        : orders.find((o) => o.status === "delivered" || o.status === "in_progress") || orders[0];

      if (!targetOrder) {
        return NextResponse.json({
          reply: "I could not locate an active delivered commission to approve under your account.",
          mode: "ai",
          timestamp: new Date().toISOString(),
        });
      }

      const isExplicitApproval =
        lower.includes("yes, approve") ||
        lower.includes("yes approve") ||
        lower.includes("confirm approval") ||
        lower.includes("i approve all") ||
        lower.includes("approve final");

      if (!isExplicitApproval) {
        return NextResponse.json({
          reply: `You are about to sign off on **Order #${targetOrder.orderNumber}** (${targetOrder.service}).\n\nApproving will mark this commission as **100% Completed** and grant your full commercial license.\n\nPlease reply **"Yes, approve final deliverables"** or **"Confirm approval"** to complete sign-off.`,
          mode: "ai",
          requiresConfirmation: true,
          targetOrderId: targetOrder.id,
          timestamp: new Date().toISOString(),
        });
      }

      const res = await ChatToolsService.approveDelivery({
        orderId: targetOrder.id,
        clientUid: callerUid,
        confirmed: true,
        comment: message,
      });

      return NextResponse.json({
        reply: res.message || `Order #${targetOrder.orderNumber} is now officially approved and completed!`,
        mode: "ai",
        timestamp: new Date().toISOString(),
      });
    }

    // Tool 10: request_revision
    if (
      lower.includes("request revision") ||
      lower.includes("revision for") ||
      lower.includes("change request") ||
      lower.includes("revise order") ||
      lower.includes("need changes") ||
      lower.includes("modify deliverable")
    ) {
      const orderMatch = message.match(/(?:ord[-_]|#)(\w+)/i);
      const orders = await ChatToolsService.getMyOrders({ clientUid: callerUid });
      const targetOrder = orderMatch
        ? orders.find((o) => o.orderNumber?.toLowerCase().includes(orderMatch[1].toLowerCase()) || o.id.toLowerCase().includes(orderMatch[1].toLowerCase()))
        : orders.find((o) => o.status === "delivered" || o.status === "in_progress") || orders[0];

      if (!targetOrder) {
        return NextResponse.json({
          reply: "I could not locate an active commission for revision under your account. Please specify the Order # (e.g., #ORD-101).",
          mode: "ai",
          timestamp: new Date().toISOString(),
        });
      }

      const res = await ChatToolsService.requestRevision({
        orderId: targetOrder.id,
        clientUid: callerUid,
        comment: message,
      });

      return NextResponse.json({
        reply: res.message || `Revision request submitted for Order #${targetOrder.orderNumber}.`,
        mode: "ai",
        timestamp: new Date().toISOString(),
      });
    }

    // Tool 9: cancel_trial
    if (lower.includes("cancel trial") || lower.includes("cancel my trial") || lower.includes("stop trial")) {
      const orders = await ChatToolsService.getMyOrders({ clientUid: callerUid });
      const trialOrder = orders.find((o) => o.status === "trial" || o.statusLabel?.toLowerCase().includes("trial"));

      if (!trialOrder) {
        return NextResponse.json({
          reply: "You currently do not have an active 3-day trial plan to cancel under your account.",
          mode: "ai",
          timestamp: new Date().toISOString(),
        });
      }

      const res = await ChatToolsService.cancelTrial({
        orderId: trialOrder.id,
        clientUid: callerUid,
        reason: message,
      });

      return NextResponse.json({
        reply: res.message,
        mode: "ai",
        timestamp: new Date().toISOString(),
      });
    }

    // Tool 8: renew_plan
    if (
      lower.includes("renew plan") ||
      lower.includes("renew subscription") ||
      lower.includes("renew my retainer") ||
      lower.includes("renew order")
    ) {
      const orders = await ChatToolsService.getMyOrders({ clientUid: callerUid });
      const planOrder = orders.find((o) => o.status === "active" || o.status === "trial" || o.status === "closed" || o.title.includes("Retainer"));

      if (!planOrder) {
        return NextResponse.json({
          reply: "You don't have an active monthly retainer subscription to renew. Would you like to view our available Retainer Tiers? Reply **'List plans'** to explore.",
          mode: "ai",
          timestamp: new Date().toISOString(),
        });
      }

      const res = await ChatToolsService.renewPlan({
        orderId: planOrder.id,
        clientUid: callerUid,
      });

      if (res.error) {
        return NextResponse.json({ reply: `Could not initiate renewal: ${res.error}`, mode: "ai" });
      }

      return NextResponse.json({
        reply: `${res.message}\n\nPlease click **Pay Now via Razorpay** below to confirm your renewal.`,
        orderDraft: {
          orderId: res.orderId,
          orderNumber: res.orderNumber,
          service: res.service,
          totalAmount: res.renewalAmount,
          razorpayOrderId: res.razorpayOrderId,
          keyId: res.keyId,
        },
        mode: "ai",
        timestamp: new Date().toISOString(),
      });
    }

    // Tool 5: get_upload_link
    if (
      lower.includes("upload link") ||
      lower.includes("drive link") ||
      lower.includes("upload assets") ||
      lower.includes("where do i upload") ||
      lower.includes("drive folder")
    ) {
      const orderMatch = message.match(/(?:ord[-_]|#)(\w+)/i);
      const orders = await ChatToolsService.getMyOrders({ clientUid: callerUid });
      const targetOrder = orderMatch
        ? orders.find((o) => o.orderNumber?.toLowerCase().includes(orderMatch[1].toLowerCase()) || o.id.toLowerCase().includes(orderMatch[1].toLowerCase()))
        : orders[0];

      if (!targetOrder) {
        return NextResponse.json({
          reply: "Please place an order first or specify your Order # (e.g., #ORD-101) to retrieve your dedicated Google Drive vault link.",
          mode: "ai",
          timestamp: new Date().toISOString(),
        });
      }

      const link = await ChatToolsService.getUploadLink({
        orderId: targetOrder.id,
        clientUid: callerUid,
      });

      return NextResponse.json({
        reply: `Here is your dedicated Google Drive Vault link for **Order #${targetOrder.orderNumber}**:\n\n🔗 [Open Google Drive Vault](${link.driveFolderLink})\n\n${link.instructions}`,
        mode: "ai",
        timestamp: new Date().toISOString(),
      });
    }

    // Tool 7: get_my_orders / Live Progress & Expiry Status
    if (
      lower.includes("order status") ||
      lower.includes("my order") ||
      lower.includes("track order") ||
      lower.includes("check order") ||
      lower.includes("what is the status") ||
      lower.includes("progress") ||
      lower.includes("days left") ||
      lower.includes("when does my plan expire") ||
      lower.includes("plan expiry")
    ) {
      const clientOrders = await ChatToolsService.getMyOrders({ clientUid: callerUid });

      if (clientOrders.length === 0) {
        return NextResponse.json({
          reply: "You do not have any studio commissions registered under your account yet. You can commission standalone services or activate a monthly retainer directly in **My Orders > New Order**, or tell me what you'd like to create!",
          mode: "ai",
          timestamp: new Date().toISOString(),
        });
      }

      const orderSummaries = clientOrders
        .slice(0, 5)
        .map((o) => {
          const progressTag = `[${o.progressPercentage}% - ${o.stageName}]`;
          const expiryTag = o.periodSummary ? ` | ${o.periodSummary}` : o.daysRemaining ? ` | ${o.daysRemaining} days left` : "";
          return `• **Order #${o.orderNumber}** (${o.service}): **${o.statusLabel || o.status}** ${progressTag}${expiryTag}`;
        })
        .join("\n");

      return NextResponse.json({
        reply: `Here is the live status of your studio commissions:\n\n${orderSummaries}\n\nYou can review deliverables, upload assets, or request revisions anytime from your **My Orders** dashboard.`,
        mode: "ai",
        orders: clientOrders,
        timestamp: new Date().toISOString(),
      });
    }

    // Tool 3: list_plans
    if (
      lower.includes("retainer") ||
      lower.includes("monthly plan") ||
      lower.includes("monthly package") ||
      lower.includes("list plans") ||
      lower.includes("subscription plans") ||
      lower.includes("retainer pricing")
    ) {
      const plans = await ChatToolsService.listPlans();
      const planDescriptions = plans
        .map(
          (p) =>
            `• **${p.name}** — ₹${p.monthlyPriceINR.toLocaleString("en-IN")}/month (${p.freeTrialDays}-day trial included)\n  Features: ${p.features.slice(0, 3).join(", ")}`
        )
        .join("\n\n");

      return NextResponse.json({
        reply: `Sutra Studio offers three Monthly Retainer Tiers for ongoing creative production:\n\n${planDescriptions}\n\nTo activate a retainer, tell me which tier you prefer (e.g. *"I want the Studio Growth Retainer"*) or reply **"Confirm order for Studio Growth"** to proceed to checkout!`,
        mode: "ai",
        timestamp: new Date().toISOString(),
      });
    }

    // Tool 1: list_services
    if (
      lower.includes("what services") ||
      lower.includes("list services") ||
      lower.includes("services do you offer") ||
      lower.includes("pricing") ||
      lower.includes("service cost") ||
      lower.includes("catalog")
    ) {
      const services = await ChatToolsService.listServices();
      const serviceList = services
        .map((s) => `• **${s.name}** (₹${s.startingPriceINR.toLocaleString("en-IN")}) — _${s.tagline}_ [${s.estimatedDeliveryDays} days delivery, ${s.revisionsIncluded} revisions]`)
        .join("\n");

      return NextResponse.json({
        reply: `Here is our approved creative services catalog (100% in Indian Rupees — ₹ INR):\n\n${serviceList}\n\nTell me which service you would like to commission (e.g. *"I want to commission 3D Modeling"*), and I will help you prepare your project brief!`,
        mode: "ai",
        timestamp: new Date().toISOString(),
      });
    }

    const classification = classifyPrompt(message);

    // Tool 2: get_service_details inquiry
    if (
      lower.includes("tell me about") ||
      lower.includes("details for") ||
      lower.includes("how does") ||
      lower.includes("what is included in")
    ) {
      const serviceDetails = await ChatToolsService.getServiceDetails(classification.serviceId);
      if (!serviceDetails.error) {
        const briefFields = (serviceDetails.briefSchema || [])
          .map((f: any) => `  - ${f.label} (${f.required ? "Required" : "Optional"})`)
          .join("\n");

        return NextResponse.json({
          reply: `### **${serviceDetails.name}**\n_${serviceDetails.tagline}_\n\n• **Starting Price**: ₹${serviceDetails.startingPriceINR?.toLocaleString("en-IN")}\n• **Delivery SLA**: ${serviceDetails.estimatedDeliveryDays} business days\n• **Revisions Included**: ${serviceDetails.revisionsIncluded} revision cycles\n• **Deliverables**: ${(serviceDetails.deliverables || []).join(", ")}\n\n**Intake Brief Requirements:**\n${briefFields || "  - Project summary and reference files"}\n\nWould you like to start this commission? Tell me your project details or reply **"Order ${serviceDetails.name}"**!`,
          classification,
          mode: "ai",
          timestamp: new Date().toISOString(),
        });
      }
    }

    // Explicit Confirmation Detection
    const isExplicitConfirmation =
      lower.includes("yes, place order") ||
      lower.includes("yes place order") ||
      lower.includes("confirm order") ||
      lower.includes("place order") ||
      lower.includes("proceed to pay") ||
      lower.includes("pay now") ||
      lower.includes("book now") ||
      lower.includes("confirm draft");

    // Pre-order Intent Detection (User wants to order but hasn't explicitly confirmed yet)
    const isPreOrderIntent =
      lower.includes("i want to order") ||
      lower.includes("i want to commission") ||
      lower.includes("i need a") ||
      lower.includes("create a") ||
      lower.includes("book a") ||
      lower.includes("commission this") ||
      lower.includes("order a");

    // Tool 4: create_commission_draft (Strict Explicit Confirmation Gate)
    if (isExplicitConfirmation) {
      const isPlan = lower.includes("plan") || lower.includes("retainer") || lower.includes("growth") || lower.includes("enterprise") || lower.includes("starter");
      
      let created;
      if (isPlan) {
        const planId = lower.includes("starter") ? "studio-starter" : lower.includes("enterprise") ? "atelier-enterprise" : "studio-growth";
        created = await ChatToolsService.createCommissionDraft({
          clientUid: callerUid,
          clientName: "Studio Client",
          clientEmail: "client@sutrastudio.com",
          type: "monthly_plan",
          planId,
          billingCycle: "monthly",
          requirements: `Retainer subscription requested via AI Chat: ${message}`,
          chatId: `chat_${callerUid}`,
          confirmed: true,
        });
      } else {
        const matchedService = SEED_CATALOG_SERVICES.find(s => s.id === classification.serviceId) || SEED_CATALOG_SERVICES[0];
        
        created = await ChatToolsService.createCommissionDraft({
          clientUid: callerUid,
          clientName: "Studio Client",
          clientEmail: "client@sutrastudio.com",
          type: "service",
          serviceId: matchedService.id,
          requirements: `Commission brief initiated via AI Chat: ${message}`,
          chatId: `chat_${callerUid}`,
          confirmed: true,
        });
      }

      const { order, orderDraft, summaryMessage } = created;

      return NextResponse.json({
        reply: summaryMessage || `I have created your commission **#${order.orderNumber}** with status \`pending_payment\`.\n\nPlease click **Pay Now via Razorpay** below to verify payment and commence studio production.`,
        classification,
        orderDraft,
        mode: "ai",
        timestamp: new Date().toISOString(),
      });
    }

    // Pre-order Brief Intake & Summary Step (Missing brief field validation)
    if (isPreOrderIntent) {
      const serviceDetails = await ChatToolsService.getServiceDetails(classification.serviceId);
      if (!serviceDetails.error) {
        const briefSchema = serviceDetails.briefSchema || [];
        const missingFields = briefSchema.filter((field: any) => field.required);

        const summaryText = `I would love to help you commission **${serviceDetails.name}**!\n\n**Commission Summary:**\n• Service: **${serviceDetails.name}**\n• Price: **₹${serviceDetails.startingPriceINR?.toLocaleString("en-IN")}** (Catalog Verified)\n• Est. Delivery: **${serviceDetails.estimatedDeliveryDays} days** (${serviceDetails.revisionsIncluded} revisions included)\n\n**Brief Intake:**\nTo ensure our art director can execute flawlessly, please provide:\n${missingFields.map((f: any) => `• **${f.label}** (${f.type || "text"})`).join("\n")}\n\nWhen ready, reply with your specifications or say **"Yes, place order"** to generate your secure checkout card!`;

        return NextResponse.json({
          reply: summaryText,
          classification,
          mode: "ai",
          timestamp: new Date().toISOString(),
        });
      }
    }

    // Check Active Knowledge Base
    const knowledgeMatch = await AiKnowledgeService.findRelevantKnowledge(message);
    if (knowledgeMatch && knowledgeMatch.matched.length > 0) {
      const topEntry = knowledgeMatch.matched[0];
      const additionalNotes = knowledgeMatch.matched
        .slice(1)
        .map((e) => `• **${e.title}**: ${e.answer}`)
        .join("\n");

      const groundedAnswer = `${topEntry.answer}${
        additionalNotes ? `\n\n**Related Studio Guidance:**\n${additionalNotes}` : ""
      }`;

      return NextResponse.json({
        reply: groundedAnswer,
        knowledgeGrounded: true,
        matchedKnowledge: {
          id: topEntry.id,
          title: topEntry.title,
          category: topEntry.category,
        },
        classification,
        mode: "ai",
        timestamp: new Date().toISOString(),
      });
    }

    // Default Assistant Guidance
    const reply = `I have analyzed your request regarding "${message}". Our studio atelier has mapped this to our specialized **${classification.service}** pipeline (${Math.round(classification.confidence * 100)}% match).\n\nIf you would like to proceed, reply with your brief details or say **"Order ${classification.service}"** to structure your commission!`;

    return NextResponse.json({
      reply,
      classification,
      mode: "ai",
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Internal chat processing error" },
      { status: 500 }
    );
  }
}

