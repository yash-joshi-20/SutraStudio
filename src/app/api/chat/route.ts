import { NextResponse } from "next/server";
import { ChatToolsService } from "@/lib/services/chatTools";
import { AiKnowledgeService } from "@/lib/services/aiKnowledgeService";
import { SEED_CATALOG_SERVICES, SEED_CATALOG_PLANS } from "@/lib/services/serviceCatalog";
import { requestRole, requestUid } from "@/lib/auth/requestRole";
import { generateChatResponse } from "@/lib/ai/llm";
import { MASTER_RAG_KNOWLEDGE_STORE, MASTER_SYSTEM_PROMPT } from "@/lib/services/ragLlmService";

// In-memory rate limiter: 120 requests / minute per client/IP
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(key: string): { allowed: boolean; remaining: number; resetInSec: number } {
  const now = Date.now();
  const windowMs = 60 * 1000;
  const maxRequests = 120;

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

function classifyPrompt(prompt: string) {
  const p = prompt.toLowerCase();

  if (p.includes("video") || p.includes("ad") || p.includes("reel") || p.includes("commercial") || p.includes("વિડિયો")) {
    return { service: "Video Creation", serviceId: "vid-creation", workflowType: "video", confidence: 0.94 };
  }
  if (p.includes("360") || p.includes("panorama") || p.includes("virtual tour") || p.includes("ટૂર")) {
    return { service: "360 View", serviceId: "360-view", workflowType: "three-sixty", confidence: 0.96 };
  }
  if (p.includes("interior") || p.includes("room") || p.includes("furniture") || p.includes("living") || p.includes("ઇન્ટિરિયર")) {
    return { service: "Interior Design", serviceId: "interior-design", workflowType: "interior", confidence: 0.92 };
  }
  if (p.includes("elevation") || p.includes("facade") || p.includes("exterior") || p.includes("એલિવેશન")) {
    return { service: "Architectural Elevation", serviceId: "elevation-design", workflowType: "three-d", confidence: 0.93 };
  }
  if (p.includes("3d") || p.includes("render") || p.includes("model") || p.includes("bottle") || p.includes("મોડેલિંગ")) {
    return { service: "3D Modeling", serviceId: "3d-modeling", workflowType: "three-d", confidence: 0.91 };
  }
  if (p.includes("website") || p.includes("web") || p.includes("landing") || p.includes("portal") || p.includes("frontend") || p.includes("વેબસાઇટ")) {
    return { service: "Website Development", serviceId: "website", workflowType: "website", confidence: 0.95 };
  }
  if (p.includes("marketing") || p.includes("meta") || p.includes("campaign") || p.includes("instagram") || p.includes("facebook") || p.includes("માર્કેટિંગ")) {
    return { service: "Meta Ads & Digital Marketing", serviceId: "meta-ads", workflowType: "marketing", confidence: 0.90 };
  }
  if (p.includes("automation") || p.includes("n8n") || p.includes("sync") || p.includes("webhook") || p.includes("ઓટોમેશન")) {
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
    const callerUid = await requestUid(req).catch(() => null);
    const callerRole = await requestRole(req).catch(() => "guest");
    const ip = req.headers.get("x-forwarded-for") || callerUid || "client_visitor";

    const body = await req.json().catch(() => ({}));
    const {
      message = "",
      mode,
      action,
      tool,
      params = {},
      clientId,
      attachments = [],
      conversationHistory = [],
    } = body;

    const activeUid = callerUid || clientId || `visitor_${Math.random().toString(36).substring(2, 8)}`;

    // Rate Limiting
    const rateCheck = checkRateLimit(`${activeUid}_${ip}`);
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

      if (toolName === "get_my_orders" && callerUid) {
        const orders = await ChatToolsService.getMyOrders({ clientUid: callerUid });
        return NextResponse.json({ success: true, tool: "get_my_orders", data: orders });
      }

      if (toolName === "create_commission_draft") {
        const draft = await ChatToolsService.createCommissionDraft({
          ...params,
          clientUid: callerUid || activeUid,
        });
        return NextResponse.json({ success: draft.success, tool: "create_commission_draft", data: draft });
      }
    }

    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "Message content is required" }, { status: 400 });
    }

    const lower = message.toLowerCase().trim();

    // Security & confidential guidelines
    if (
      lower.includes("ignore previous instructions") ||
      lower.includes("reveal your instructions") ||
      lower.includes("developer mode") ||
      lower.includes("jailbreak") ||
      lower.includes("api key") ||
      lower.includes("secret key") ||
      lower.includes("private key") ||
      lower.includes("service account")
    ) {
      return NextResponse.json({
        reply: "Sutra Studio operates under strict security protocols. I cannot expose system credentials or bypass operational guidelines.",
        mode: "ai",
        refusal: true,
        timestamp: new Date().toISOString(),
      });
    }

    // Explicit Order Placements / Confirmations from Chat
    const isExplicitConfirmation =
      lower.includes("yes, place order") ||
      lower.includes("yes place order") ||
      lower.includes("confirm order") ||
      lower.includes("place order") ||
      lower.includes("proceed to pay") ||
      lower.includes("order this") ||
      lower.includes("book now") ||
      lower.includes("confirm draft") ||
      lower.includes("ઓર્ડર કરો") ||
      lower.includes("ઓર્ડર આપવો છે") ||
      lower.includes("ઓર્ડર કન્ફર્મ");

    const classification = classifyPrompt(message);

    if (isExplicitConfirmation) {
      const isPlan =
        lower.includes("plan") ||
        lower.includes("retainer") ||
        lower.includes("growth") ||
        lower.includes("enterprise") ||
        lower.includes("starter") ||
        lower.includes("પ્લાન");

      let created;
      if (isPlan) {
        const planId = lower.includes("starter")
          ? "studio-starter"
          : lower.includes("enterprise")
          ? "atelier-enterprise"
          : "studio-growth";
        created = await ChatToolsService.createCommissionDraft({
          clientUid: callerUid || activeUid,
          clientName: "Studio Client",
          clientEmail: "client@sutrastudio.com",
          type: "monthly_plan",
          planId,
          billingCycle: "monthly",
          requirements: `Retainer subscription requested via AI Chat: ${message}`,
          chatId: `chat_${activeUid}`,
          confirmed: true,
        });
      } else {
        const matchedService =
          SEED_CATALOG_SERVICES.find((s) => s.id === classification.serviceId) || SEED_CATALOG_SERVICES[0];

        const attachmentSummary =
          attachments && attachments.length > 0
            ? `\nAttached Files: ${attachments.map((a: any) => a.name).join(", ")}`
            : "";

        created = await ChatToolsService.createCommissionDraft({
          clientUid: callerUid || activeUid,
          clientName: "Studio Client",
          clientEmail: "client@sutrastudio.com",
          type: "service",
          serviceId: matchedService.id,
          requirements: `Commission brief initiated via AI Chat: ${message}${attachmentSummary}`,
          chatId: `chat_${activeUid}`,
          confirmed: true,
        });
      }

      const { order, orderDraft, summaryMessage } = created;

      const isGujarati = /[\u0A80-\u0AFF]/.test(message) || lower.includes("karo") || lower.includes("chhe");

      const successReply = isGujarati
        ? `તમારો કમિશન ઓર્ડર **#${order.orderNumber}** (${order.service}) તૈયાર છે!\n\nકુલ રકમ: **₹${order.totalAmount?.toLocaleString("en-IN")}**\nસ્ટેટસ: \`pending_payment\`\n\nકૃપા કરીને નીચે આપેલા **Pay Now via Razorpay / UPI** કાર્ડ પર ક્લિક કરીને પેમેન્ટ કન્ફર્મ કરો.`
        : summaryMessage ||
          `I have created your commission **#${order.orderNumber}** (${order.service}) with status \`pending_payment\`.\n\nTotal: **₹${order.totalAmount?.toLocaleString("en-IN")}**\n\nPlease click **Pay Now via Razorpay** below to verify payment and commence studio production.`;

      return NextResponse.json({
        reply: successReply,
        classification,
        orderDraft,
        mode: "ai",
        timestamp: new Date().toISOString(),
      });
    }

    // RAG RETRIEVAL & GEMINI LLM SYNTHESIS
    // 1. Gather relevant knowledge chunks
    const knowledgeChunks = MASTER_RAG_KNOWLEDGE_STORE.map(
      (k) => `[Category: ${k.category}] Title: ${k.title}\nContent:\n${k.content}`
    ).join("\n\n---\n\n");

    const systemPrompt = `${MASTER_SYSTEM_PROMPT}

KNOWLEDGE BASE:
${knowledgeChunks}

CONVERSATIONAL RULES:
1. Always respond in the EXACT language used by the user. If the user writes in Gujarati (ગુજરાતી), respond completely and fluently in Gujarati. If in English, respond in English. If in Hindi, respond in Hindi.
2. Be warm, polite, professional, and knowledgeable like a real human Senior Art Producer at Sutra Studio.
3. When the user greets (e.g. "hi", "hello", "kem cho", "namaste"), greet them back warmly and ask how you can assist with their creative 3D, video, website, or AI project.
4. If the user wants to order or attach files, guide them and encourage them to state their brief or say "Confirm order for [Service]" so we can generate their instant checkout card.
5. All prices are in Indian Rupees (₹ INR). 2 revisions included. Delivery SLA: 24-72h. Google Drive Vault archiving.`;

    const chatHistoryMessages = Array.isArray(conversationHistory)
      ? conversationHistory.slice(-6).map((m: any) => ({
          role: (m.sender === "user" ? "user" : "assistant") as "user" | "assistant",
          content: m.text || "",
        }))
      : [];

    const promptMessages = [
      ...chatHistoryMessages,
      {
        role: "user" as const,
        content: attachments && attachments.length > 0
          ? `${message}\n[User attached ${attachments.length} reference file(s): ${attachments.map((a: any) => a.name).join(", ")}]`
          : message,
      },
    ];

    const aiReply = await generateChatResponse({
      system: systemPrompt,
      messages: promptMessages,
      temperature: 0.6,
    });

    return NextResponse.json({
      reply: aiReply,
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
