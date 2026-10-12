import { NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "node:crypto";
import { readEnv } from "@/lib/config/env";
import { generateChatResponse } from "@/lib/ai/llm";
import { EmailService } from "@/lib/services/emailProvider";
import { OrderPipelineService, OrderSource } from "@/lib/services/orderPipeline";
import { MetaMessagingService } from "@/lib/services/metaMessagingService";
import { checkRateLimit, getClientIp } from "@/lib/security/rateLimiter";

export const dynamic = "force-dynamic";

// In-memory deduplication set for processed inbound message IDs
const processedMessageIds = new Map<string, number>();

function isDuplicateMessage(messageId: string): boolean {
  if (!messageId) return false;
  const now = Date.now();
  if (processedMessageIds.size > 5000) {
    for (const [id, time] of processedMessageIds.entries()) {
      if (now - time > 3600 * 1000) processedMessageIds.delete(id);
    }
  }
  if (processedMessageIds.has(messageId)) {
    return true;
  }
  processedMessageIds.set(messageId, now);
  return false;
}

function verifyMetaSignature(rawBody: string, signatureHeader: string | null): boolean {
  const secret = readEnv("META_APP_SECRET");
  if (!secret) {
    if (process.env.NODE_ENV === "production") return false;
    return true; // dev fallback if not configured in development
  }
  if (!signatureHeader || !signatureHeader.startsWith("sha256=")) {
    return false;
  }
  const providedHex = signatureHeader.slice(7).trim();
  const calculatedHex = createHmac("sha256", secret).update(rawBody).digest("hex");
  const bufA = Buffer.from(providedHex, "utf8");
  const bufB = Buffer.from(calculatedHex, "utf8");
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

/**
 * Mask sensitive phone number or email for client privacy and log safety.
 */
function maskIdentifier(id: string): string {
  if (!id) return "Anonymous Client";
  if (id.includes("@")) {
    const [user, domain] = id.split("@");
    if (!domain) return id;
    const maskedUser = user.length <= 2 ? user : `${user.slice(0, 2)}***${user.slice(-1)}`;
    return `${maskedUser}@${domain}`;
  }
  const clean = id.replace(/[^0-9+]/g, "");
  if (clean.length > 7) {
    const prefix = clean.slice(0, clean.startsWith("+") ? 3 : 2);
    const suffix = clean.slice(-4);
    return `${prefix} **** ${suffix}`;
  }
  return clean;
}

/**
 * Lead Creative Concierge System Prompt
 */
const SUTRA_INBOUND_CONCIERGE_SYSTEM = `You are the Lead Creative Concierge for Sutra Studio (સૂત્ર સ્ટુડિયો).
You speak with calm luxury, executive clarity, and warmth.
Under NO circumstances reveal internal technical pipelines, model names, internal tool names, or developer jargon. Address deliverables as high-precision creative and digital solutions produced by our studio atelier.

Canonical Investment Rates:
• Commercial & Product Image Creation: Starting from ₹99/image (Packs from ₹249)
• Promotional Video & Reel Production: Starting from ₹199 (Promo Reel: ₹499, Packs from ₹499)
• 3D Product Modeling & Visualization: Starting from ₹999/view (Model from ₹2,999)
• 360° Virtual Tours: Starting from ₹2,999 (Supplied) / ₹7,999 (Local capture)
• Interior 3D Visualization: Starting from ₹1,499/view (Room starter: ₹4,999)
• Exterior 3D Visualization: Starting from ₹1,999/view
• Brand Identity Starter: ₹2,999
• Digital Marketing & Campaign Strategy: Content Calendar ₹999 / Meta Ads ₹4,999/mo
• Website Design & Development: Starting from ₹4,999 (Business Web: ₹14,999)
• Web Application MVP: Starting from ₹19,999
• Mobile App UI Prototype: Starting from ₹9,999

Monthly Retainer Packages:
• Starter Trend: ₹9,999 / month (15 branded images + 15 short videos, calendar & hashtags)
• Growth Trend: ₹14,999 / month (20 branded images + 20 short videos, daily trend research)
• Daily Trend Creator: ₹19,999 / month (30 branded images + 30 short videos, daily delivery)

Direct Payment: Google Pay (GPay) direct merchant settlement upon scope review.

Response Directives:
1. Greet the client warmly with "Namaste" or courteous professional greeting.
2. Directly acknowledge their specific creative or software requirement.
3. Recommend the best matching capability and state its canonical starting price.
4. Inform them that an official order draft has been prepared for their review, and provide the secure link to review their brief, log in, and confirm on the website.
5. If the client writes in Gujarati, reply in polished Gujarati with clear English service names. If Hindi, in Hindi. If English, in refined luxury English.
6. Keep response concise (1-2 short paragraphs) suitable for WhatsApp, Instagram DM, or email.`;

/**
 * 1. GET: Meta WhatsApp & Meta Graph API Webhook Challenge Verification
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const mode = searchParams.get("hub.mode");
    const token = searchParams.get("hub.verify_token");
    const challenge = searchParams.get("hub.challenge");

    const expectedToken =
      readEnv("WHATSAPP_VERIFY_TOKEN") ||
      readEnv("META_VERIFY_TOKEN");

    if (!expectedToken) {
      return new Response("Webhook verification token not configured", { status: 500 });
    }

    if (mode === "subscribe" && token && token === expectedToken) {
      return new Response(challenge || "ok", {
        status: 200,
        headers: { "Content-Type": "text/plain" },
      });
    }

    return new Response("Forbidden", { status: 403 });
  } catch (err: any) {
    return new Response(err.message || "Internal Error", { status: 500 });
  }
}

/**
 * 2. POST: Inbound Callback Ingestion (WhatsApp, Email, Instagram, Facebook)
 */
export async function POST(req: Request) {
  try {
    const ip = getClientIp(req);
    const rateCheck = checkRateLimit(`inbound_${ip}`, { maxRequests: 60, windowSeconds: 60 });
    if (!rateCheck.success) {
      return NextResponse.json(
        { error: "Too many inbound requests. Please retry later." },
        { status: 429, headers: { "Retry-After": String(rateCheck.resetInSeconds) } }
      );
    }

    const rawText = await req.text();
    const signatureHeader = req.headers.get("x-hub-signature-256");

    let rawBody: any = {};
    try {
      rawBody = JSON.parse(rawText);
    } catch {
      return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
    }

    const isMetaPayload = Boolean(
      rawBody.entry ||
      rawBody.object === "instagram" ||
      rawBody.object === "page" ||
      rawBody.object === "whatsapp_business_account" ||
      signatureHeader
    );

    if (isMetaPayload) {
      const isValidSig = verifyMetaSignature(rawText, signatureHeader);
      if (!isValidSig) {
        return NextResponse.json({ error: "Unauthorized: Invalid or missing X-Hub-Signature-256." }, { status: 401 });
      }
    }

    let source: OrderSource = "whatsapp";
    let senderId = "";
    let clientName = "Studio Client";
    let clientEmail = "";
    let clientPhone = "";
    let incomingQuery = "";
    let isCommentReply = false;
    let commentId: string | undefined = undefined;
    let postUrl: string | undefined = undefined;

    // A. Meta WhatsApp Cloud API
    const entry = rawBody.entry?.[0];
    const change = entry?.changes?.[0]?.value;
    const waMessage = change?.messages?.[0];
    const waContact = change?.contacts?.[0];

    // B. Meta Instagram or Facebook Messaging DM
    const messaging = entry?.messaging?.[0];
    const isMetaDm = Boolean(messaging);
    const isInstagramObj = rawBody.object === "instagram";
    const isPageObj = rawBody.object === "page";

    // C. Meta Comment on Feed / Post (Comment-to-DM)
    const feedChange = entry?.changes?.[0];
    const isComment = feedChange?.field === "comments" || feedChange?.field === "feed";

    // Deduplication check
    const messageId =
      waMessage?.id ||
      messaging?.message?.mid ||
      feedChange?.value?.comment_id ||
      rawBody.messageId ||
      rawBody.id;

    if (messageId && isDuplicateMessage(messageId)) {
      return NextResponse.json({
        success: true,
        duplicate: true,
        message: "Duplicate message ID ignored.",
      });
    }

    if (waMessage) {
      source = "whatsapp";
      clientPhone = waMessage.from || "";
      senderId = clientPhone;
      clientName = waContact?.profile?.name || "WhatsApp Client";
      incomingQuery =
        waMessage.text?.body ||
        waMessage.caption ||
        waMessage.interactive?.button_reply?.title ||
        "Inquiry received via WhatsApp";
    } else if (isMetaDm) {
      source = isInstagramObj ? "instagram" : "facebook";
      senderId = messaging.sender?.id || "meta_user";
      clientName = isInstagramObj ? "Instagram Client" : "Facebook Client";
      incomingQuery = messaging.message?.text || `Inquiry received via ${source.toUpperCase()} DM`;
    } else if (isComment && feedChange?.value) {
      source = isInstagramObj ? "instagram" : "facebook";
      isCommentReply = true;
      commentId = feedChange.value.comment_id || feedChange.value.id;
      senderId = feedChange.value.from?.id || "meta_commenter";
      clientName = feedChange.value.from?.name || "Meta User";
      incomingQuery = feedChange.value.message || "Comment on Studio Post";
      postUrl = feedChange.value.post_id ? `https://facebook.com/${feedChange.value.post_id}` : undefined;
    } else {
      // D. Email / Zoho Mail / Webhook JSON
      const isEmail =
        rawBody.channel?.toLowerCase() === "email" ||
        rawBody.source?.toLowerCase() === "email" ||
        (rawBody.from && rawBody.from.includes("@")) ||
        (rawBody.email && rawBody.email.includes("@"));

      if (isEmail) {
        source = "email";
        clientEmail = rawBody.from || rawBody.email || "client@sutrastudio.com";
        senderId = clientEmail;
        clientName = rawBody.name || rawBody.senderName || "Studio Client";
        incomingQuery =
          rawBody.message ||
          rawBody.text ||
          rawBody.query ||
          rawBody.subject ||
          "Creative commission inquiry arriving via Studio Mailbox";
      } else {
        // Fallback channel normalization
        source = OrderPipelineService.normalizeSource(rawBody.source || rawBody.channel || "whatsapp");
        senderId = rawBody.from || rawBody.phone || rawBody.email || "anonymous_lead";
        clientName = rawBody.name || "Studio Client";
        if (senderId.includes("@")) clientEmail = senderId;
        else if (senderId.match(/^[0-9+]+$/)) clientPhone = senderId;
        incomingQuery = rawBody.message || rawBody.text || "Direct studio inquiry";
      }
    }

    // 1. Intelligent intent classification to identify target service/plan
    const queryLower = incomingQuery.toLowerCase();
    let targetServiceId = "img-creation";
    let targetType: "service" | "monthly_plan" = "service";
    let targetPlanId: string | undefined = undefined;

    if (queryLower.includes("retainer") || queryLower.includes("plan") || queryLower.includes("monthly") || queryLower.includes("પ્લાન")) {
      targetType = "monthly_plan";
      targetPlanId = queryLower.includes("starter")
        ? "studio-starter"
        : queryLower.includes("enterprise")
        ? "autonomous-growth-retainer"
        : "studio-growth";
    } else if (queryLower.includes("video") || queryLower.includes("reel") || queryLower.includes("ad") || queryLower.includes("વિડિયો")) {
      targetServiceId = "vid-creation";
    } else if (queryLower.includes("3d") || queryLower.includes("model") || queryLower.includes("glb") || queryLower.includes("મોડેલ")) {
      targetServiceId = "3d-modeling";
    } else if (queryLower.includes("360") || queryLower.includes("panorama") || queryLower.includes("tour") || queryLower.includes("ટૂર")) {
      targetServiceId = "360-view";
    } else if (queryLower.includes("interior") || queryLower.includes("room") || queryLower.includes("ઇન્ટિરિયર")) {
      targetServiceId = "interior-design";
    } else if (queryLower.includes("window") || queryLower.includes("facade") || queryLower.includes("elevation")) {
      targetServiceId = "window-design";
    } else if (queryLower.includes("marketing") || queryLower.includes("strategy") || queryLower.includes("માર્કેટિંગ")) {
      targetServiceId = "digital-marketing";
    } else if (queryLower.includes("meta") || queryLower.includes("campaign") || queryLower.includes("instagram ads")) {
      targetServiceId = "meta-ads";
    } else if (queryLower.includes("web app") || queryLower.includes("saas") || queryLower.includes("portal")) {
      targetServiceId = "webapp-dev";
    } else if (queryLower.includes("website") || queryLower.includes("landing")) {
      targetServiceId = "web-dev";
    } else if (queryLower.includes("mobile") || queryLower.includes("app") || queryLower.includes("ios") || queryLower.includes("android")) {
      targetServiceId = "mobile-setup";
    } else if (queryLower.includes("automation") || queryLower.includes("integration") || queryLower.includes("webhook")) {
      targetServiceId = "ai-automation";
    }

    // 2. CREATE DRAFT ORDER in Firebase Pipeline
    const draftResult = await OrderPipelineService.createDraftOrder({
      source,
      clientName,
      clientEmail: clientEmail || undefined,
      clientPhone: clientPhone || undefined,
      type: targetType,
      serviceId: targetServiceId,
      planId: targetPlanId,
      requirements: incomingQuery,
      initialMessage: incomingQuery,
      channelMetadata: {
        platformSenderId: senderId,
        isCommentReply,
        commentId,
        postUrl,
        optInStatus: true,
      },
    });

    const { order, confirmUrl } = draftResult;

    // 3. Synthesize Bespoke Studio Response via Gemini
    let aiConciergeText = "";
    try {
      aiConciergeText = await generateChatResponse({
        system: `${SUTRA_INBOUND_CONCIERGE_SYSTEM}\n\nORDER DRAFT DETAILS:\n- Service / Plan: ${order.service}\n- Total Investment: ₹${order.totalAmount?.toLocaleString("en-IN")}\n- Secure Confirmation Link: ${confirmUrl}`,
        messages: [{ role: "user", content: incomingQuery }],
        temperature: 0.5,
        maxTokens: 400,
      });
    } catch {
      aiConciergeText = `Namaste! Thank you for connecting with Sutra Studio regarding ${order.service}. We have prepared your draft commission brief (#${order.orderNumber}) at ₹${order.totalAmount?.toLocaleString("en-IN")}.\n\nPlease review your brief and confirm payment on our secure portal here: ${confirmUrl}\n\nOur creative atelier is ready to begin upon your confirmation.`;
    }

    // Ensure the confirmUrl is explicitly present in message
    if (!aiConciergeText.includes(confirmUrl)) {
      aiConciergeText += `\n\nReview & Confirm on Sutra Studio: ${confirmUrl}`;
    }

    // 4. DISPATCH OUTBOUND REPLY via Appropriate Channel API
    let dispatchStatus = "Delivered";
    let dispatchNote = "";

    if (source === "whatsapp" && clientPhone) {
      const waSendRes = await MetaMessagingService.sendWhatsAppMessage({
        toPhone: clientPhone,
        text: aiConciergeText,
      });
      dispatchStatus = waSendRes.success ? "Delivered" : "Queued";
      dispatchNote = waSendRes.note || waSendRes.error || "WhatsApp Cloud API response";
    } else if (source === "instagram" || source === "facebook") {
      if (isCommentReply && commentId) {
        const commentRes = await MetaMessagingService.sendCommentPrivateReply({
          commentId,
          text: aiConciergeText,
          channel: source,
        });
        dispatchStatus = commentRes.success ? "Delivered" : "Queued";
        dispatchNote = commentRes.note || commentRes.error || "Meta comment private reply";
      } else {
        const dmRes = await MetaMessagingService.sendMetaDirectMessage({
          recipientId: senderId,
          text: aiConciergeText,
          channel: source,
        });
        dispatchStatus = dmRes.success ? "Delivered" : "Queued";
        dispatchNote = dmRes.note || dmRes.error || "Meta direct message response";
      }
    } else if (source === "email" && clientEmail) {
      try {
        const supportInbox = readEnv("ZOHO_MAIL_USER") || "yashjoshi20@zohomail.in";
        await EmailService.dispatchNotificationEmail({
          to: clientEmail,
          type: "new_inquiry",
          title: `Sutra Studio — Commission Draft #${order.orderNumber}`,
          message: aiConciergeText,
          priority: "high",
          replyTo: supportInbox,
          actionUrl: confirmUrl,
          actionLabel: "Review & Confirm Order",
        });
        dispatchStatus = "Delivered";
        dispatchNote = "Delivered via Zoho SMTP";
      } catch (mailErr: any) {
        dispatchStatus = "Queued";
        dispatchNote = mailErr.message;
      }
    }

    // 5. RECORD OUTBOUND CONVERSATION HISTORY
    await OrderPipelineService.recordMessage(order.id, {
      sender: "studio",
      channel: source,
      text: aiConciergeText,
      authorName: "Sutra Studio Concierge",
      metadata: {
        confirmUrl,
        dispatchStatus,
        dispatchNote,
      },
    });

    return NextResponse.json({
      success: true,
      orderId: order.id,
      orderNumber: order.orderNumber,
      source,
      isDraft: true,
      confirmUrl,
      replyMessage: aiConciergeText,
      dispatchNote,
      maskedSender: maskIdentifier(senderId),
    });
  } catch (error: any) {
    console.error("[Inbound Webhook Error]", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to process inbound webhook." },
      { status: 500 }
    );
  }
}
