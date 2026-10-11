/**
 * SUTRA STUDIO — Unified Order Pipeline Service
 * 
 * Single authority for the 8 canonical order channels:
 * 1. new_order   (Client dashboard wizard)
 * 2. chat        (Client assistant chat box)
 * 3. whatsapp    (WhatsApp Cloud API inbound webhook)
 * 4. email       (Studio mailbox inbound parser)
 * 5. instagram   (Meta Instagram messaging API)
 * 6. facebook    (Meta Facebook Page messaging API)
 * 7. ad_campaign (Marketing links with UTM parameters)
 * 8. referral    (Referral links and partner codes)
 * 
 * Every channel feeds into ONE Firestore order pipeline.
 * Draft orders become active orders upon login + payment confirmation.
 */

import crypto from "node:crypto";
import { adminDb, isFirebaseAdminReady } from "@/lib/firebase/admin";
import { OrdersStore } from "@/lib/services/ordersStore";
import { SEED_CATALOG_SERVICES, SEED_CATALOG_PLANS } from "@/lib/services/catalogData";
import { generateOrderNumber } from "@/lib/types/database";
import type { FirestoreOrderRecord } from "@/app/api/orders/route";

export type OrderSource =
  | "new_order"
  | "chat"
  | "whatsapp"
  | "email"
  | "instagram"
  | "facebook"
  | "ad_campaign"
  | "referral";

export const CANONICAL_ORDER_SOURCES: OrderSource[] = [
  "new_order",
  "chat",
  "whatsapp",
  "email",
  "instagram",
  "facebook",
  "ad_campaign",
  "referral",
];

export interface OrderConversationMessage {
  id: string;
  sender: "client" | "studio" | "assistant" | "system";
  channel: OrderSource;
  text: string;
  timestamp: string;
  channelMessageId?: string;
  authorName?: string;
  metadata?: Record<string, any>;
}

export interface OrderAttribution {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
  referrer?: string;
  referralCode?: string;
  landingPage?: string;
  capturedAt?: string;
}

export interface OrderChannelMetadata {
  platformSenderId?: string; // WhatsApp phone / IG IGSID / FB PSID / Email address
  platformRecipientId?: string; // Phone ID / Page ID
  threadId?: string;
  isCommentReply?: boolean;
  commentId?: string;
  postUrl?: string;
  optInStatus: boolean;
  lastInboundAt: string;
  replyWindowExpiresAt: string; // 24 hours from last inbound
  isReplyWindowActive: boolean;
}

export interface CreateDraftOrderInput {
  source: OrderSource;
  clientName?: string;
  clientEmail?: string;
  clientPhone?: string;
  type?: "service" | "monthly_plan";
  serviceId?: string;
  planId?: string;
  requirements?: string;
  attachments?: Array<{ name: string; url?: string; size?: string }>;
  attribution?: OrderAttribution;
  channelMetadata?: Partial<OrderChannelMetadata>;
  initialMessage?: string;
  customAmount?: number;
}

export interface ConfirmDraftOrderInput {
  orderId: string;
  token: string;
  clientUid: string;
  clientEmail?: string;
  clientName?: string;
  paymentMethod?: string;
  paymentReference?: string;
}

export class OrderPipelineService {
  /**
   * Normalize an incoming source string to one of the 8 canonical channels
   */
  public static normalizeSource(rawSource?: string, attribution?: OrderAttribution): OrderSource {
    if (attribution?.referralCode || attribution?.referrer?.includes("ref")) {
      return "referral";
    }
    if (attribution?.utm_source || attribution?.utm_campaign) {
      return "ad_campaign";
    }

    if (!rawSource) return "new_order";
    const s = rawSource.toLowerCase().trim();

    if (s === "chat" || s === "ai_chat" || s === "chatbot") return "chat";
    if (s === "whatsapp" || s === "wa") return "whatsapp";
    if (s === "email" || s === "mail" || s === "zoho") return "email";
    if (s === "instagram" || s === "ig") return "instagram";
    if (s === "facebook" || s === "fb") return "facebook";
    if (s === "ad_campaign" || s === "ads" || s === "meta_ads" || s === "campaign") return "ad_campaign";
    if (s === "referral" || s === "affiliate" || s === "partner") return "referral";
    if (s === "new_order" || s === "dashboard" || s === "wizard") return "new_order";

    return "new_order";
  }

  /**
   * Check if a 24-hour customer care reply window is currently active
   */
  public static isReplyWindowValid(expiresAt?: string): boolean {
    if (!expiresAt) return false;
    return new Date(expiresAt).getTime() > Date.now();
  }

  /**
   * Generate a secure cryptographically random token for draft confirmation links
   */
  public static generateConfirmToken(): string {
    return crypto.randomBytes(24).toString("hex");
  }

  /**
   * Build the absolute secure confirmation URL for the client
   */
  public static getConfirmUrl(orderId: string, token: string): string {
    const siteUrl = (process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_SITE_URL || "https://sutrastudios.in").replace(/\/$/, "");
    return `${siteUrl}/orders/confirm?orderId=${encodeURIComponent(orderId)}&token=${encodeURIComponent(token)}`;
  }

  /**
   * 1. CREATE A DRAFT ORDER (Used by WhatsApp, Email, Instagram, Facebook, Marketing)
   */
  public static async createDraftOrder(input: CreateDraftOrderInput): Promise<{
    order: FirestoreOrderRecord;
    confirmUrl: string;
    confirmToken: string;
  }> {
    const now = new Date().toISOString();
    const token = this.generateConfirmToken();
    const orderNumber = generateOrderNumber();
    const orderId = `ord_dft_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const orderCode = `#DFT-${orderNumber.slice(-4)}`;

    const source = this.normalizeSource(input.source, input.attribution);

    // Resolve service or plan from canonical catalog
    let matchedServiceName = "Bespoke Creative Commission";
    let computedAmount = 2499;
    let orderType: "service" | "monthly_plan" = input.type || "service";
    let verifiedItems: any[] = [];

    if (orderType === "monthly_plan" || input.planId) {
      orderType = "monthly_plan";
      const plan = SEED_CATALOG_PLANS.find((p) => p.id === input.planId) || SEED_CATALOG_PLANS[0];
      matchedServiceName = plan.name;
      computedAmount = plan.monthlyPrice || 14999;
      verifiedItems = [
        {
          planId: plan.id,
          name: `${plan.name} (Monthly Retainer)`,
          price: computedAmount,
          quantity: 1,
        },
      ];
    } else {
      const srv =
        SEED_CATALOG_SERVICES.find(
          (s) =>
            s.id === input.serviceId ||
            s.slug === input.serviceId ||
            (input.serviceId && s.id.includes(input.serviceId)) ||
            (input.serviceId && input.serviceId.includes("video") && s.id === "vid-creation") ||
            (input.serviceId && input.serviceId.includes("3d") && s.id === "model-3d") ||
            (input.serviceId && input.serviceId.includes("360") && s.id === "tour-360") ||
            (input.serviceId && input.serviceId.includes("interior") && s.id === "interior-viz")
        ) || SEED_CATALOG_SERVICES[0];
      matchedServiceName = srv.name;
      computedAmount = input.customAmount || srv.startingPrice || 2499;
      verifiedItems = [
        {
          serviceId: srv.id,
          name: srv.name,
          price: computedAmount,
          quantity: 1,
        },
      ];
    }

    const replyWindowExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    const channelMetadata: OrderChannelMetadata = {
      platformSenderId: input.channelMetadata?.platformSenderId || input.clientPhone || input.clientEmail || "inbound_client",
      platformRecipientId: input.channelMetadata?.platformRecipientId || "sutra_official",
      threadId: input.channelMetadata?.threadId || (null as any),
      isCommentReply: Boolean(input.channelMetadata?.isCommentReply),
      commentId: input.channelMetadata?.commentId || (null as any),
      postUrl: input.channelMetadata?.postUrl || (null as any),
      optInStatus: true,
      lastInboundAt: now,
      replyWindowExpiresAt,
      isReplyWindowActive: true,
    };

    const conversationHistory: OrderConversationMessage[] = [];
    if (input.initialMessage) {
      conversationHistory.push({
        id: `msg_${Date.now()}_1`,
        sender: "client",
        channel: source,
        text: input.initialMessage,
        timestamp: now,
        authorName: input.clientName || `${source.toUpperCase()} Client`,
      });
    }

    const confirmUrl = this.getConfirmUrl(orderId, token);

    const draftOrder: any = {
      id: orderId,
      code: orderCode,
      orderNumber,
      title: `${matchedServiceName} (Draft via ${source.toUpperCase()})`,
      service: matchedServiceName,
      type: orderType,
      items: verifiedItems,
      totalAmount: computedAmount,
      currency: "INR",
      status: "draft",
      statusLabel: "Draft Order — Awaiting Client Confirmation",
      isDraft: true,
      confirmToken: token,
      confirmUrl,
      source,
      clientUid: `lead_${source}_${Date.now()}`,
      clientId: `lead_${source}_${Date.now()}`,
      clientName: input.clientName || `${source.toUpperCase()} Client`,
      clientEmail: input.clientEmail || `client_${Date.now()}@sutrastudio.com`,
      clientPhone: input.clientPhone || "",
      requirements: input.requirements || input.initialMessage || `Order brief drafted via ${source.toUpperCase()} channel.`,
      attachments: input.attachments || [],
      driveFolderId: "drive_fld_sutra_001",
      driveFolderPath: "drive_fld_sutra_001/DRAFTS",
      revisionRound: 0,
      maxRevisions: 2,
      deliverables: [],
      paymentStatus: "unpaid",
      attribution: input.attribution || {},
      channelMetadata,
      conversationHistory,
      deliverablePreview: `Draft initialized via ${source.toUpperCase()}. Confirmation link sent to client.`,
      statusHistory: [
        {
          status: "draft",
          changedAt: now,
          changedBy: source,
          note: `Draft order registered via ${source.toUpperCase()} channel. Secure confirmation link generated.`,
        },
      ],
      createdAt: now,
      updatedAt: now,
    };

    // Save to dual persistence (OrdersStore + Firestore `orders`)
    await OrdersStore.addAsync(draftOrder);

    return {
      order: draftOrder,
      confirmUrl,
      confirmToken: token,
    };
  }

  /**
   * 2. CONFIRM AND ACTIVATE A DRAFT ORDER (Executed when client logs in and confirms on website)
   */
  public static async confirmAndActivateDraftOrder(input: ConfirmDraftOrderInput): Promise<{
    success: boolean;
    order?: FirestoreOrderRecord;
    error?: string;
  }> {
    const order = await OrdersStore.findByIdAsync(input.orderId);
    if (!order) {
      return { success: false, error: "Order record not found." };
    }

    // Validate confirmation token
    if ((order as any).confirmToken && (order as any).confirmToken !== input.token) {
      return { success: false, error: "Invalid or expired confirmation link token." };
    }

    const now = new Date().toISOString();
    const updatedHistory = Array.isArray((order as any).conversationHistory)
      ? [...(order as any).conversationHistory]
      : [];

    updatedHistory.push({
      id: `msg_${Date.now()}_conf`,
      sender: "system",
      channel: order.source as OrderSource || "new_order",
      text: `Draft order confirmed and bound to authenticated client account (${input.clientEmail || input.clientUid}). Status shifted to in_progress / confirmed.`,
      timestamp: now,
      authorName: "Sutra Studio Security Guard",
    });

    const isPaid = input.paymentMethod && input.paymentMethod !== "unpaid";
    const targetStatus = isPaid ? "in_progress" : "confirmed";
    const targetStatusLabel = isPaid
      ? "Payment Verified — In Studio Production Queue"
      : "Confirmed — In Studio Production Queue";

    const updatedOrder: any = {
      ...order,
      isDraft: false,
      status: targetStatus,
      statusLabel: targetStatusLabel,
      clientUid: input.clientUid,
      clientId: input.clientUid,
      clientEmail: input.clientEmail || order.clientEmail,
      clientName: input.clientName || order.clientName,
      confirmedAt: now,
      paymentMethod: input.paymentMethod || order.paymentMethod || "gpay_verification",
      paymentReference: input.paymentReference || order.paymentReference,
      paymentStatus: isPaid ? "paid" : "unpaid",
      conversationHistory: updatedHistory,
      statusHistory: [
        ...(order.statusHistory || []),
        {
          status: targetStatus,
          changedAt: now,
          changedBy: "client",
          note: `Draft confirmed on website via authenticated client login (${input.clientEmail || input.clientUid}).`,
        },
      ],
      updatedAt: now,
    };

    await OrdersStore.addAsync(updatedOrder);

    // Sync to Firestore directly
    if (isFirebaseAdminReady()) {
      try {
        const cleanPayload = JSON.parse(JSON.stringify(updatedOrder, (_, v) => (v === undefined ? null : v)));
        await adminDb().collection("orders").doc(updatedOrder.id).set(cleanPayload, { merge: true });
      } catch (err: any) {
        console.warn("[OrderPipeline] Firestore confirmation sync warning:", err.message);
      }
    }

    return { success: true, order: updatedOrder };
  }

  /**
   * 3. APPEND INBOUND OR OUTBOUND MESSAGE TO AN ORDER'S CONVERSATION HISTORY
   */
  public static async recordMessage(
    orderId: string,
    message: Omit<OrderConversationMessage, "id" | "timestamp">
  ): Promise<FirestoreOrderRecord | null> {
    const order = await OrdersStore.findByIdAsync(orderId);
    if (!order) return null;

    const now = new Date().toISOString();
    const newMsg: OrderConversationMessage = {
      ...message,
      id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: now,
    };

    const existingHistory = Array.isArray((order as any).conversationHistory)
      ? [...(order as any).conversationHistory]
      : [];
    existingHistory.push(newMsg);

    const channelMeta = (order as any).channelMetadata || {};
    if (message.sender === "client") {
      channelMeta.lastInboundAt = now;
      channelMeta.replyWindowExpiresAt = new Date(Date.now() + 24 * 3600 * 1000).toISOString();
      channelMeta.isReplyWindowActive = true;
    }

    const updated: any = {
      ...order,
      conversationHistory: existingHistory,
      channelMetadata: channelMeta,
      updatedAt: now,
    };

    await OrdersStore.addAsync(updated);
    if (isFirebaseAdminReady()) {
      try {
        const cleanPayload = JSON.parse(JSON.stringify(updated, (_, v) => (v === undefined ? null : v)));
        await adminDb().collection("orders").doc(order.id).set(cleanPayload, { merge: true });
      } catch {}
    }

    return updated;
  }

  /**
   * 4. GENERATE MARKETING & ATTRIBUTION REPORT ACROSS ALL 8 CHANNELS
   */
  public static async getChannelAttributionReport(): Promise<{
    bySource: Record<OrderSource, { count: number; drafts: number; confirmed: number; revenueINR: number }>;
    topCampaigns: Array<{ campaign: string; orders: number; revenueINR: number }>;
    totalOrders: number;
    totalRevenueINR: number;
  }> {
    const allOrders = await OrdersStore.getAllAsync();

    const bySource: Record<OrderSource, { count: number; drafts: number; confirmed: number; revenueINR: number }> = {
      new_order: { count: 0, drafts: 0, confirmed: 0, revenueINR: 0 },
      chat: { count: 0, drafts: 0, confirmed: 0, revenueINR: 0 },
      whatsapp: { count: 0, drafts: 0, confirmed: 0, revenueINR: 0 },
      email: { count: 0, drafts: 0, confirmed: 0, revenueINR: 0 },
      instagram: { count: 0, drafts: 0, confirmed: 0, revenueINR: 0 },
      facebook: { count: 0, drafts: 0, confirmed: 0, revenueINR: 0 },
      ad_campaign: { count: 0, drafts: 0, confirmed: 0, revenueINR: 0 },
      referral: { count: 0, drafts: 0, confirmed: 0, revenueINR: 0 },
    };

    const campaignsMap = new Map<string, { orders: number; revenueINR: number }>();
    let totalOrders = 0;
    let totalRevenueINR = 0;

    for (const ord of allOrders) {
      const source = this.normalizeSource(ord.source, (ord as any).attribution);
      const isDraft = Boolean((ord as any).isDraft || ord.status === "draft");
      const rev = Number(ord.totalAmount) || 0;

      bySource[source].count++;
      if (isDraft) {
        bySource[source].drafts++;
      } else {
        bySource[source].confirmed++;
        bySource[source].revenueINR += rev;
        totalRevenueINR += rev;
      }
      totalOrders++;

      const campaignName = (ord as any).attribution?.utm_campaign || (source === "ad_campaign" ? "Direct Meta Ad" : null);
      if (campaignName) {
        const current = campaignsMap.get(campaignName) || { orders: 0, revenueINR: 0 };
        current.orders++;
        if (!isDraft) current.revenueINR += rev;
        campaignsMap.set(campaignName, current);
      }
    }

    const topCampaigns = Array.from(campaignsMap.entries()).map(([campaign, data]) => ({
      campaign,
      orders: data.orders,
      revenueINR: data.revenueINR,
    }));
    topCampaigns.sort((a, b) => b.revenueINR - a.revenueINR);

    return {
      bySource,
      topCampaigns,
      totalOrders,
      totalRevenueINR,
    };
  }
}
