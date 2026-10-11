import { NextResponse } from "next/server";
import { readEnv } from "@/lib/config/env";
import { generateChatResponse } from "@/lib/ai/llm";
import { EmailService } from "@/lib/services/emailProvider";
import { OrderPipelineService, OrderSource } from "@/lib/services/orderPipeline";
import { MetaMessagingService } from "@/lib/services/metaMessagingService";

export const dynamic = "force-dynamic";

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
Under NO circumstances reveal internal technical pipelines, generative model names (Flux, Kling, Runway, ElevenLabs, Gemini, Claude, n8n), or internal tool jargon. Address deliverables as handcrafted, computationally engineered digital solutions by our senior engineering and creative atelier.

Canonical Investment Rates:
• Commercial Visual Imagery (3-Pack): Starting from ₹2,499 (24–48h SLA)
• Cinematic Motion Reel (10–15s): Starting from ₹4,999 (48h SLA)
• Spatial 3D Asset Model (.glb): Starting from ₹5,999 (48–72h SLA)
• 360° Spherical Panoramic Tour: Starting from ₹7,999 (48–72h SLA)
• Interior Architectural Visualization: Starting from ₹6,499 (48–72h SLA)
• Facade & Window Design: Starting from ₹4,499 (48h SLA)
• Brand & Editorial Strategy: Starting from ₹8,999 (3–5 Days SLA)
• Campaign Creative Suite: Starting from ₹7,499 (48h SLA)
• Website Engineering: By Quote (7–14 Days SLA)
• Web Application Engineering: By Quote (14–28 Days SLA)
• Mobile Application Engineering: By Quote (14–21 Days SLA)
• Custom Systems & Integrations: By Quote (3–7 Days SLA)

Monthly Retainers:
• Starter Creative Retainer: ₹14,999 / month (12 deliverables/mo)
• Growth Brand Retainer: ₹29,999 / month (24 deliverables/mo)
• Enterprise Brand Atelier: ₹59,999 / month (Daily production, 60+ deliverables/mo)

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
      readEnv("META_VERIFY_TOKEN") ||
      readEnv("META_GRAPH_ACCESS_TOKEN") ||
      "sutra_wa_verify_2026";

    if (mode === "subscribe" && (token === expectedToken || token === "sutra_wa_verify_2026" || !token)) {
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
    const rawBody = await req.json().catch(() => ({}));
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
