import { OrdersStore } from "./ordersStore";
import { NotificationsStore } from "./notificationsStore";
import { FirestoreOrderRecord } from "@/app/api/orders/route";

/**
 * SUTRA STUDIO — Custom Quotes Engine
 * Enables bespoke project scoping, custom pricing proposals, and direct Razorpay checkout conversion.
 */

export interface CustomQuoteRecord {
  id: string;
  quoteNumber: string;
  clientUid?: string;
  clientName: string;
  clientEmail: string;
  clientPhone?: string;
  companyName?: string;
  service: string;
  brief: string;
  requestedTimeline?: string;
  estimatedBudgetINR?: number;
  attachments?: Array<{ name: string; url: string; size?: string }>;
  status: "pending_review" | "quote_sent" | "accepted" | "declined" | "expired";
  // Admin Quote Details
  quotedAmountINR?: number;
  scopeBreakdown?: string[];
  deliverables?: string[];
  revisionRoundsIncluded?: number;
  validUntil?: string;
  adminNotes?: string;
  razorpayPaymentLink?: string;
  convertedOrderId?: string;
  createdAt: string;
  updatedAt: string;
}

const INITIAL_QUOTES: CustomQuoteRecord[] = [
  {
    id: "quot_001",
    quoteNumber: "QUO-2026-001",
    clientUid: "usr_mock_001",
    clientName: "Yash Joshi",
    clientEmail: "yash@studioliving.com",
    companyName: "Studio Living Group",
    service: "3D Spatial Architecture & VR Experience",
    brief: "Full architectural visualization of 12,000 sq.ft private estate with real-time WebGL walkthrough.",
    requestedTimeline: "3 Weeks",
    estimatedBudgetINR: 45000,
    status: "quote_sent",
    quotedAmountINR: 42000,
    scopeBreakdown: [
      "12 High-Res 4K CGI Renders (Interior & Exterior)",
      "Interactive 360° Spatial Panorama Suite",
      "Interactive WebGL Tour Embed for Client Website",
    ],
    deliverables: ["glTF Assets", "4K TIFF Renders", "Interactive Hosted Link"],
    revisionRoundsIncluded: 3,
    validUntil: new Date(Date.now() + 14 * 24 * 3600 * 1000).toISOString(),
    createdAt: "2026-09-29T10:00:00.000Z",
    updatedAt: "2026-09-29T14:30:00.000Z",
  },
];

const globalAny = globalThis as any;

if (!globalAny.__SUTRA_QUOTES__) {
  globalAny.__SUTRA_QUOTES__ = [...INITIAL_QUOTES];
}

export class QuotesStore {
  public static getAll(): CustomQuoteRecord[] {
    return globalAny.__SUTRA_QUOTES__;
  }

  public static findById(id: string): CustomQuoteRecord | undefined {
    return globalAny.__SUTRA_QUOTES__.find(
      (q: CustomQuoteRecord) => q.id === id || q.quoteNumber === id
    );
  }

  public static requestQuote(params: {
    clientUid?: string;
    clientName: string;
    clientEmail: string;
    clientPhone?: string;
    companyName?: string;
    service: string;
    brief: string;
    requestedTimeline?: string;
    estimatedBudgetINR?: number;
    attachments?: Array<{ name: string; url: string; size?: string }>;
  }): CustomQuoteRecord {
    const now = new Date().toISOString();
    const id = `quot_${Date.now()}`;
    const quoteNumber = `QUO-2026-${Math.floor(100 + Math.random() * 900)}`;

    const quote: CustomQuoteRecord = {
      id,
      quoteNumber,
      clientUid: params.clientUid,
      clientName: params.clientName,
      clientEmail: params.clientEmail,
      clientPhone: params.clientPhone,
      companyName: params.companyName,
      service: params.service,
      brief: params.brief,
      requestedTimeline: params.requestedTimeline,
      estimatedBudgetINR: params.estimatedBudgetINR,
      attachments: params.attachments || [],
      status: "pending_review",
      createdAt: now,
      updatedAt: now,
    };

    globalAny.__SUTRA_QUOTES__.unshift(quote);

    // Notify Studio Admin
    NotificationsStore.add({
      userId: "usr_admin_001",
      type: "order_placed",
      title: "New Custom Quote Request",
      message: `${params.clientName} (${params.companyName || "Direct Client"}) requested bespoke quote for ${params.service}.`,
      actionUrl: `/admin`,
      actionLabel: "Review Quote Request",
    });

    return quote;
  }

  public static sendProposal(params: {
    quoteId: string;
    quotedAmountINR: number;
    scopeBreakdown: string[];
    deliverables: string[];
    revisionRoundsIncluded?: number;
    validDays?: number;
    adminNotes?: string;
  }): CustomQuoteRecord | undefined {
    const quote = this.findById(params.quoteId);
    if (!quote) return undefined;

    const now = new Date().toISOString();
    const validUntil = new Date(Date.now() + (params.validDays || 14) * 24 * 3600 * 1000).toISOString();

    quote.status = "quote_sent";
    quote.quotedAmountINR = params.quotedAmountINR;
    quote.scopeBreakdown = params.scopeBreakdown;
    quote.deliverables = params.deliverables;
    quote.revisionRoundsIncluded = params.revisionRoundsIncluded || 2;
    quote.validUntil = validUntil;
    quote.adminNotes = params.adminNotes;
    quote.updatedAt = now;

    // Notify client
    if (quote.clientUid) {
      NotificationsStore.add({
        userId: quote.clientUid,
        type: "status_update",
        title: "Bespoke Studio Proposal Ready",
        message: `Sutra Studio has prepared your custom proposal for ${quote.service} (₹${params.quotedAmountINR.toLocaleString("en-IN")}).`,
        actionUrl: `/orders`,
        actionLabel: "Review Proposal",
      });
    }

    return quote;
  }

  public static acceptQuoteAndCreateOrder(params: {
    quoteId: string;
    clientUid?: string;
    paymentMethod?: string;
  }): { success: boolean; order?: FirestoreOrderRecord; error?: string } {
    const quote = this.findById(params.quoteId);
    if (!quote) return { success: false, error: "Quote record not found." };
    if (quote.status !== "quote_sent") {
      return { success: false, error: "Quote is not in actionable proposal state." };
    }

    if (quote.validUntil && new Date(quote.validUntil).getTime() < Date.now()) {
      quote.status = "expired";
      return { success: false, error: "Proposal has expired. Please request an updated quotation." };
    }

    const now = new Date().toISOString();
    const orderId = `ord_quote_${Date.now()}`;
    const orderNumber = `ORD-QUO-${Math.floor(1000 + Math.random() * 9000)}`;

    const newOrder: FirestoreOrderRecord = {
      id: orderId,
      code: `#${orderNumber}`,
      orderNumber,
      title: `${quote.service} — Bespoke Commission`,
      service: quote.service,
      type: "service",
      items: [
        {
          name: `${quote.service} (Custom Proposal #${quote.quoteNumber})`,
          price: quote.quotedAmountINR || 0,
          quantity: 1,
        },
      ],
      totalAmount: quote.quotedAmountINR || 0,
      status: "pending_payment",
      statusLabel: "Quote Accepted — Awaiting Payment Settlement",
      paymentStatus: "unpaid",
      source: "dashboard",
      clientUid: params.clientUid || quote.clientUid || "usr_client_001",
      clientId: params.clientUid || quote.clientUid || "usr_client_001",
      clientName: quote.clientName,
      clientEmail: quote.clientEmail,
      clientPhone: quote.clientPhone,
      requirements: `${quote.brief}\n\nAgreed Scope:\n${(quote.scopeBreakdown || []).map((s) => `• ${s}`).join("\n")}`,
      driveFolderId: `drive_fld_quote_${orderId}`,
      driveFolderPath: `Clients/${quote.clientName}/${orderNumber}`,
      driveFolderLink: `https://drive.google.com/drive/folders/drive_fld_quote_${orderId}`,
      revisionRound: 0,
      maxRevisions: quote.revisionRoundsIncluded || 2,
      deliverables: [],
      createdAt: now,
      updatedAt: now,
      statusHistory: [
        {
          status: "pending_payment",
          changedAt: now,
          changedBy: quote.clientName,
          note: `Bespoke Quote #${quote.quoteNumber} accepted by client. Order initialized for ₹${(quote.quotedAmountINR || 0).toLocaleString("en-IN")}.`,
        },
      ],
    };

    OrdersStore.add(newOrder);

    quote.status = "accepted";
    quote.convertedOrderId = orderId;
    quote.updatedAt = now;

    return { success: true, order: newOrder };
  }
}
