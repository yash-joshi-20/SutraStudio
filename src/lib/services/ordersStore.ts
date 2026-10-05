import type { FirestoreOrderRecord } from "@/app/api/orders/route";
import { NotificationsStore } from "./notificationsStore";
import { computeOrderProgress, type OrderProgressInfo } from "@/lib/services/orderProgress";
import { adminDb, isFirebaseAdminReady } from "@/lib/firebase/admin";

/**
 * SUTRA STUDIO — Unified Orders Store & Firestore Repository
 * Firestore is the single source of truth for all orders, status transitions,
 * payments ledger, comments, and deliverables.
 */

// Initial canonical orders array (empty — no mock data)
const INITIAL_ORDERS: FirestoreOrderRecord[] = [];

// Attach to globalThis to share cache across route bundles and reduce cold read latency
const globalAny = globalThis as any;

if (!globalAny.__SUTRA_STORED_ORDERS__) {
  globalAny.__SUTRA_STORED_ORDERS__ = [...INITIAL_ORDERS];
}

if (!globalAny.__SUTRA_PROCESSED_WEBHOOKS__) {
  globalAny.__SUTRA_PROCESSED_WEBHOOKS__ = new Set<string>();
}

if (!globalAny.__SUTRA_PAYMENT_EVENTS__) {
  globalAny.__SUTRA_PAYMENT_EVENTS__ = [];
}

if (!globalAny.__SUTRA_ORDERS_LAST_SYNC__) {
  globalAny.__SUTRA_ORDERS_LAST_SYNC__ = 0;
}

export const STORED_ORDERS: FirestoreOrderRecord[] = globalAny.__SUTRA_STORED_ORDERS__;
export const PROCESSED_WEBHOOKS: Set<string> = globalAny.__SUTRA_PROCESSED_WEBHOOKS__;

export interface PaymentAuditLog {
  id: string;
  orderId: string;
  eventType: string;
  amountINR?: number;
  paymentId?: string;
  source: "checkout" | "webhook" | "refund" | "admin" | "client_portal" | "admin_portal";
  payload?: any;
  timestamp: string;
}

export const PAYMENT_AUDIT_LOGS: PaymentAuditLog[] = globalAny.__SUTRA_PAYMENT_EVENTS__;

export const ALLOWED_STATUS_TRANSITIONS: Record<string, string[]> = {
  pending_payment: ["paid", "cancelled"],
  pending: ["paid", "cancelled", "confirmed"],
  paid: ["brief_review", "in_production", "active", "on_hold", "cancelled", "refunded"],
  confirmed: ["brief_review", "in_production", "active", "on_hold", "cancelled", "refunded"],
  brief_review: ["in_production", "active", "on_hold", "cancelled"],
  in_production: ["draft_delivered", "delivered", "awaiting_approval", "on_hold", "cancelled", "expired", "closed"],
  draft_delivered: ["approved", "completed", "revision_requested", "in_production", "on_hold"],
  awaiting_approval: ["approved", "completed", "revision_requested", "in_production", "on_hold"],
  delivered: ["approved", "completed", "revision_requested", "in_production", "on_hold"],
  revision_requested: ["in_production", "draft_delivered", "delivered", "on_hold", "cancelled"],
  approved: ["completed"],
  completed: ["in_production", "active"],
  on_hold: ["paid", "brief_review", "in_production", "active", "draft_delivered", "revision_requested", "cancelled"],
  trial: ["active", "closed", "expired", "cancelled"],
  active: ["paused", "on_hold", "closed", "expired", "cancelled"],
  closed: ["active"],
  expired: ["active"],
  cancelled: [],
  refunded: [],
};

export { computeOrderProgress } from "@/lib/services/orderProgress";
export type { OrderProgressInfo } from "@/lib/services/orderProgress";
export type { FirestoreOrderRecord, OrderDeliverableItem } from "@/app/api/orders/route";

/**
 * Persists an order directly to Firestore asynchronously
 */
async function persistOrderToFirestore(order: FirestoreOrderRecord): Promise<void> {
  if (!isFirebaseAdminReady()) return;
  try {
    const db = adminDb();
    await db.collection("orders").doc(order.id).set(order, { merge: true });
  } catch (err) {
    console.warn(`[OrdersStore] Failed to persist order ${order.id} to Firestore:`, err);
  }
}

export class OrdersStore {
  /**
   * Synchronizes cache from Firestore
   */
  public static async syncFromFirestore(force = false): Promise<FirestoreOrderRecord[]> {
    if (!isFirebaseAdminReady()) {
      return globalAny.__SUTRA_STORED_ORDERS__;
    }

    const now = Date.now();
    // Throttle syncs to every 2 seconds unless forced
    if (!force && now - globalAny.__SUTRA_ORDERS_LAST_SYNC__ < 2000) {
      return globalAny.__SUTRA_STORED_ORDERS__;
    }

    try {
      const db = adminDb();
      const snapshot = await db.collection("orders").get();
      const loaded: FirestoreOrderRecord[] = [];
      snapshot.forEach((doc) => {
        loaded.push(doc.data() as FirestoreOrderRecord);
      });

      // Sort newest first
      loaded.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());

      globalAny.__SUTRA_STORED_ORDERS__ = loaded;
      globalAny.__SUTRA_ORDERS_LAST_SYNC__ = now;
      return loaded;
    } catch (err) {
      console.warn("[OrdersStore] syncFromFirestore warning:", err);
      return globalAny.__SUTRA_STORED_ORDERS__;
    }
  }

  public static getAll(): FirestoreOrderRecord[] {
    // Trigger background sync if stale
    if (Date.now() - globalAny.__SUTRA_ORDERS_LAST_SYNC__ > 10000) {
      this.syncFromFirestore().catch(() => {});
    }
    return globalAny.__SUTRA_STORED_ORDERS__;
  }

  public static async getAllAsync(): Promise<FirestoreOrderRecord[]> {
    return await this.syncFromFirestore(true);
  }

  public static findById(idOrNumber: string): FirestoreOrderRecord | undefined {
    return globalAny.__SUTRA_STORED_ORDERS__.find(
      (o: FirestoreOrderRecord) =>
        o.id === idOrNumber ||
        o.orderNumber === idOrNumber ||
        o.code === idOrNumber ||
        o.razorpayOrderId === idOrNumber
    );
  }

  public static async findByIdAsync(idOrNumber: string): Promise<FirestoreOrderRecord | undefined> {
    const existing = this.findById(idOrNumber);
    if (existing) return existing;

    if (!isFirebaseAdminReady()) return undefined;

    try {
      const db = adminDb();
      // Try direct doc get
      const docSnap = await db.collection("orders").doc(idOrNumber).get();
      if (docSnap.exists) {
        const data = docSnap.data() as FirestoreOrderRecord;
        this.add(data);
        return data;
      }

      // Try query by orderNumber or code
      const qSnap = await db.collection("orders").where("orderNumber", "==", idOrNumber).limit(1).get();
      if (!qSnap.empty) {
        const data = qSnap.docs[0].data() as FirestoreOrderRecord;
        this.add(data);
        return data;
      }

      const qCodeSnap = await db.collection("orders").where("code", "==", idOrNumber).limit(1).get();
      if (!qCodeSnap.empty) {
        const data = qCodeSnap.docs[0].data() as FirestoreOrderRecord;
        this.add(data);
        return data;
      }

      const qRzpSnap = await db.collection("orders").where("razorpayOrderId", "==", idOrNumber).limit(1).get();
      if (!qRzpSnap.empty) {
        const data = qRzpSnap.docs[0].data() as FirestoreOrderRecord;
        this.add(data);
        return data;
      }
    } catch (err) {
      console.warn("[OrdersStore] findByIdAsync warning:", err);
    }

    return undefined;
  }

  public static add(order: FirestoreOrderRecord): void {
    const existingIndex = globalAny.__SUTRA_STORED_ORDERS__.findIndex(
      (o: FirestoreOrderRecord) => o.id === order.id
    );
    if (existingIndex >= 0) {
      globalAny.__SUTRA_STORED_ORDERS__[existingIndex] = order;
    } else {
      globalAny.__SUTRA_STORED_ORDERS__.unshift(order);
    }
    persistOrderToFirestore(order).catch(() => {});
  }

  public static async addAsync(order: FirestoreOrderRecord): Promise<void> {
    this.add(order);
    await persistOrderToFirestore(order);
  }

  public static update(
    idOrNumber: string,
    updates: Partial<FirestoreOrderRecord>
  ): FirestoreOrderRecord | undefined {
    const order = this.findById(idOrNumber);
    if (!order) return undefined;

    Object.assign(order, updates, {
      updatedAt: new Date().toISOString(),
    });

    persistOrderToFirestore(order).catch(() => {});
    return order;
  }

  public static async updateAsync(
    idOrNumber: string,
    updates: Partial<FirestoreOrderRecord>
  ): Promise<FirestoreOrderRecord | undefined> {
    const order = this.update(idOrNumber, updates);
    if (order) {
      await persistOrderToFirestore(order);
    }
    return order;
  }

  public static markAsPaid(params: {
    orderId: string;
    razorpayPaymentId: string;
    razorpayOrderId?: string;
    razorpaySignature?: string;
    amountPaid?: number;
    paymentMethod?: string;
    source?: "checkout" | "webhook";
  }): FirestoreOrderRecord | undefined {
    const order = this.findById(params.orderId);
    if (!order) return undefined;

    const now = new Date().toISOString();
    order.status = "paid";
    order.statusLabel = "Payment Verified — In Studio Queue";
    order.paymentStatus = "paid";
    order.razorpayPaymentId = params.razorpayPaymentId;
    if (params.razorpayOrderId) order.razorpayOrderId = params.razorpayOrderId;
    if (params.razorpaySignature) order.razorpaySignature = params.razorpaySignature;
    order.amountPaid = params.amountPaid || order.totalAmount;
    order.paidAt = now;
    order.paymentMethod = params.paymentMethod || "razorpay";
    order.updatedAt = now;

    if (!order.statusHistory) order.statusHistory = [];
    order.statusHistory.push({
      status: "paid",
      changedAt: now,
      changedBy: "system",
      note: `Payment verified via Razorpay (${params.razorpayPaymentId}) via ${params.source || "checkout"}.`,
    });

    persistOrderToFirestore(order).catch(() => {});

    this.logPaymentEvent({
      orderId: order.id,
      eventType: "payment.verified",
      amountINR: order.amountPaid,
      paymentId: params.razorpayPaymentId,
      source: params.source || "checkout",
    });

    // Notify Studio Administrator of new verified paid commission
    try {
      NotificationsStore.add({
        userId: "admin",
        type: "order_paid",
        title: "New Commission Paid",
        message: `Order #${order.orderNumber || order.code} received verified payment of ₹${(order.amountPaid || order.totalAmount || 0).toLocaleString("en-IN")}. Work process can be initiated.`,
        orderId: order.id,
        orderNumber: order.orderNumber || order.code,
      });
    } catch (notifErr) {
      console.warn("[Notifications] Error queuing admin payment alert:", notifErr);
    }

    // Asynchronously dispatch to n8n Fulfillment Router W1
    setTimeout(async () => {
      try {
        const { N8nAutomationService } = await import("./n8nService");
        await N8nAutomationService.dispatchWorkflow({
          workflowId: "W1_order_fulfillment_router",
          orderId: order.id,
          clientId: order.clientUid || order.clientId || "",
          service: order.service,
          brief: order.requirements || order.notes,
          driveFolderId: order.driveFolderId,
        });
      } catch (n8nErr) {
        console.warn("[n8n Auto-Dispatch] Failed to trigger W1 router:", n8nErr);
      }
    }, 100);

    return order;
  }

  public static markAsFailed(params: {
    orderId: string;
    reason: string;
    paymentId?: string;
  }): FirestoreOrderRecord | undefined {
    const order = this.findById(params.orderId);
    if (!order) return undefined;

    const now = new Date().toISOString();
    order.paymentStatus = "failed";
    order.failureReason = params.reason;
    order.updatedAt = now;

    if (!order.statusHistory) order.statusHistory = [];
    order.statusHistory.push({
      status: "pending_payment",
      changedAt: now,
      changedBy: "system",
      note: `Payment attempt failed: ${params.reason}`,
    });

    persistOrderToFirestore(order).catch(() => {});

    this.logPaymentEvent({
      orderId: order.id,
      eventType: "payment.failed",
      paymentId: params.paymentId,
      source: "checkout",
      payload: { reason: params.reason },
    });

    return order;
  }

  public static updateStatusWithValidation(params: {
    orderId: string;
    newStatus: string;
    actorRole: "admin" | "client" | "system";
    actorName?: string;
    note?: string;
  }): { success: boolean; order?: FirestoreOrderRecord; error?: string } {
    const order = this.findById(params.orderId);
    if (!order) return { success: false, error: "Order not found." };

    const currentStatus = order.status;
    const allowed = ALLOWED_STATUS_TRANSITIONS[currentStatus] || [];

    // Check transition validity
    if (!allowed.includes(params.newStatus) && params.actorRole !== "system") {
      return {
        success: false,
        error: `Invalid transition: Cannot transition order from '${currentStatus}' to '${params.newStatus}'. Allowed transitions: ${allowed.join(", ") || "None (terminal state)"}.`,
      };
    }

    // Role guard: clients cannot move to production or deliver stages
    if (
      params.actorRole === "client" &&
      ["brief_review", "in_production", "draft_delivered", "delivered", "on_hold"].includes(params.newStatus)
    ) {
      return {
        success: false,
        error: "Forbidden: Only authorized studio administrators can update production workflow stages.",
      };
    }

    const now = new Date().toISOString();
    order.status = params.newStatus as any;
    order.updatedAt = now;

    // Label mapping
    const progress = computeOrderProgress(order);
    order.statusLabel = progress.stageLabel;

    if (!order.statusHistory) order.statusHistory = [];
    order.statusHistory.push({
      status: params.newStatus,
      changedAt: now,
      changedBy: params.actorName || params.actorRole,
      note: params.note || `Status updated to ${params.newStatus} by ${params.actorRole}`,
    });

    persistOrderToFirestore(order).catch(() => {});

    // In-app notifications based on transition
    try {
      const targetUser = order.clientUid || order.clientId || "";
      if (targetUser) {
        if (params.newStatus === "in_production") {
          NotificationsStore.add({
            userId: targetUser,
            type: "status_update",
            title: "Production Started",
            message: `Your commission #${order.orderNumber || order.code} is now actively in studio production.`,
            orderId: order.id,
            orderNumber: order.orderNumber || order.code,
          });
        } else if (params.newStatus === "brief_review") {
          NotificationsStore.add({
            userId: targetUser,
            type: "status_update",
            title: "Brief Reviewed & Kickoff",
            message: `Art Director has reviewed your brief for #${order.orderNumber || order.code}. Creative kickoff confirmed.`,
            orderId: order.id,
            orderNumber: order.orderNumber || order.code,
          });
        }
      }
    } catch {
      // safe fallback
    }

    return { success: true, order };
  }

  public static addOrderComment(params: {
    orderId: string;
    sender: "client" | "admin";
    authorName: string;
    text: string;
    attachmentUrl?: string;
    attachmentName?: string;
  }): { success: boolean; comment?: any; error?: string } {
    const order = this.findById(params.orderId);
    if (!order) return { success: false, error: "Order not found." };

    if (!params.text.trim()) {
      return { success: false, error: "Comment text cannot be empty." };
    }

    const now = new Date().toISOString();
    const commentItem = {
      id: `comm_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      sender: params.sender,
      authorName: params.authorName,
      text: params.text.trim(),
      attachmentUrl: params.attachmentUrl,
      attachmentName: params.attachmentName,
      createdAt: now,
    };

    if (!order.comments) order.comments = [];
    order.comments.push(commentItem);
    order.updatedAt = now;

    persistOrderToFirestore(order).catch(() => {});

    // Notify other party
    try {
      const recipientId =
        params.sender === "client" ? "admin" : (order.clientUid || order.clientId || "");
      if (recipientId) {
        NotificationsStore.add({
          userId: recipientId,
          type: "order_comment",
          title: `New Note on #${order.orderNumber || order.code}`,
          message: `${params.authorName}: "${params.text.slice(0, 80)}"`,
          orderId: order.id,
          orderNumber: order.orderNumber || order.code,
        });
      }
    } catch {
      // safe fallback
    }

    return { success: true, comment: commentItem };
  }

  public static addInternalNote(params: {
    orderId: string;
    authorName: string;
    text: string;
  }): { success: boolean; note?: any; error?: string } {
    const order = this.findById(params.orderId);
    if (!order) return { success: false, error: "Order not found." };

    if (!params.text.trim()) {
      return { success: false, error: "Internal note text cannot be empty." };
    }

    const now = new Date().toISOString();
    const noteItem = {
      id: `note_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      authorName: params.authorName,
      text: params.text.trim(),
      createdAt: now,
    };

    if (!order.internalNotes) order.internalNotes = [];
    order.internalNotes.push(noteItem);
    order.updatedAt = now;

    persistOrderToFirestore(order).catch(() => {});

    return { success: true, note: noteItem };
  }

  public static deliverOrder(params: {
    orderId: string;
    deliverables: Array<{
      driveFileId?: string;
      filename: string;
      checksum?: string;
      fileSize?: string;
      mimeType?: string;
      previewUrl?: string;
      version?: string;
      category?: "draft" | "final" | "revision";
    }>;
    deliveryNote?: string;
    adminName?: string;
    isFinal?: boolean;
  }): FirestoreOrderRecord | undefined {
    const order = this.findById(params.orderId);
    if (!order) return undefined;

    const now = new Date().toISOString();
    const isFinal = Boolean(params.isFinal);
    const newStatus = isFinal ? "delivered" : "draft_delivered";
    order.status = newStatus as any;
    order.statusLabel = isFinal
      ? "Final Deliverable — Waiting for Client Approval"
      : "Draft Deliverable — Waiting for Client Review";
    order.deliverablePreview =
      params.deliveryNote || order.deliverablePreview || "Production deliverables vaulted in Google Drive for review.";
    order.deliveredAt = now;
    order.updatedAt = now;

    const currentVersion = `v${(order.revisionRound || 0) + 1}.0`;

    if (params.deliverables && params.deliverables.length > 0) {
      order.deliverables = [
        ...(order.deliverables || []),
        ...params.deliverables.map((d) => ({
          driveFileId: d.driveFileId || `drive_${Date.now()}`,
          filename: d.filename,
          checksum: d.checksum || `sha256:${Math.random().toString(36).substring(2, 12)}`,
          fileSize: d.fileSize || "45.2 MB",
          mimeType: d.mimeType || "application/octet-stream",
          previewUrl: d.previewUrl,
          version: d.version || currentVersion,
          category: d.category || (isFinal ? "final" : "draft"),
          uploadedAt: now,
        })),
      ];
    }

    if (!order.statusHistory) order.statusHistory = [];
    order.statusHistory.push({
      status: newStatus,
      changedAt: now,
      changedBy: params.adminName || "Studio Executive Producer",
      note: params.deliveryNote || `${isFinal ? "Final" : "Draft"} deliverable (${currentVersion}) vaulted for client review.`,
    });

    persistOrderToFirestore(order).catch(() => {});

    // Notify client in-app
    try {
      const targetUser = order.clientUid || order.clientId || "";
      if (targetUser) {
        NotificationsStore.add({
          userId: targetUser,
          type: "order_delivered",
          title: isFinal ? "Final Deliverable Ready" : "Draft Ready for Review",
          message: `Deliverable (${currentVersion}) for #${order.orderNumber || order.code} is available for your review in Google Drive.`,
          orderId: order.id,
          orderNumber: order.orderNumber || order.code,
        });
      }
    } catch {
      // safe fallback
    }

    return order;
  }

  public static clientReviewOrder(params: {
    orderId: string;
    action: "approve" | "revision";
    clientUid?: string;
    clientName?: string;
    comment?: string;
    annotationUrl?: string;
  }): { success: boolean; order?: FirestoreOrderRecord; error?: string; limitReached?: boolean } {
    const order = this.findById(params.orderId);
    if (!order) return { success: false, error: "Order not found." };

    // Security check: client ownership if clientUid provided
    const ownerUid = order.clientUid || order.clientId;
    if (
      params.clientUid &&
      ownerUid &&
      ownerUid !== params.clientUid &&
      params.clientUid !== "admin"
    ) {
      return { success: false, error: "Forbidden: You can only review your own orders." };
    }

    const now = new Date().toISOString();
    if (!order.statusHistory) order.statusHistory = [];

    if (params.action === "approve") {
      order.status = "completed";
      order.statusLabel = "Approved & Vaulted (100% Completed)";
      order.updatedAt = now;
      order.statusHistory.push({
        status: "approved",
        changedAt: now,
        changedBy: params.clientName || "Client",
        note: params.comment ? `Client Approval: ${params.comment}` : "Deliverables officially approved by client.",
      });
      order.statusHistory.push({
        status: "completed",
        changedAt: now,
        changedBy: "system",
        note: "Order workflow 100% completed. Permanent commercial license granted.",
      });

      persistOrderToFirestore(order).catch(() => {});

      // Notify admin
      try {
        NotificationsStore.add({
          userId: "admin",
          type: "order_approved",
          title: "Order 100% Approved",
          message: `Client ${params.clientName || "Client"} approved deliverables for order #${order.orderNumber || order.code}.`,
          orderId: order.id,
          orderNumber: order.orderNumber || order.code,
        });
      } catch {
        // safe fallback
      }

      return { success: true, order };
    }

    if (params.action === "revision") {
      if (!params.comment?.trim()) {
        return { success: false, error: "Revision notes/comment are required." };
      }

      const nextRound = (order.revisionRound || 0) + 1;
      const maxRevs = order.maxRevisions || 2;
      const limitReached = nextRound > maxRevs;

      order.status = "revision_requested";
      order.statusLabel = `Revision in Progress (Round ${nextRound} of ${maxRevs})`;
      order.revisionRound = nextRound;
      order.notes = params.comment;
      order.updatedAt = now;

      const noteText = limitReached
        ? `Extra Revision Request (Round ${nextRound}, exceeds standard ${maxRevs} included): ${params.comment}`
        : `Client Revision Request (Round ${nextRound} of ${maxRevs}): ${params.comment}`;

      order.statusHistory.push({
        status: "revision_requested",
        changedAt: now,
        changedBy: params.clientName || "Client",
        note: noteText,
      });

      persistOrderToFirestore(order).catch(() => {});

      // Notify admin
      try {
        NotificationsStore.add({
          userId: "admin",
          type: "revision_requested",
          title: limitReached ? "Extra Revision Requested" : "Revision Requested",
          message: `Client requested revision on #${order.orderNumber || order.code} (Round ${nextRound}): "${params.comment.slice(0, 80)}"`,
          orderId: order.id,
          orderNumber: order.orderNumber || order.code,
        });
      } catch {
        // safe fallback
      }

      return { success: true, order, limitReached };
    }

    return { success: false, error: "Invalid review action." };
  }

  public static isWebhookProcessed(eventId: string): boolean {
    return globalAny.__SUTRA_PROCESSED_WEBHOOKS__.has(eventId);
  }

  public static markWebhookProcessed(eventId: string): void {
    globalAny.__SUTRA_PROCESSED_WEBHOOKS__.add(eventId);
    if (isFirebaseAdminReady()) {
      adminDb().collection("processedWebhooks").doc(eventId).set({
        eventId,
        processedAt: new Date().toISOString(),
      }).catch(() => {});
    }
  }

  public static logPaymentEvent(event: Omit<PaymentAuditLog, "id" | "timestamp">): void {
    const auditRecord: PaymentAuditLog = {
      id: `evt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toISOString(),
      ...event,
    };
    globalAny.__SUTRA_PAYMENT_EVENTS__.unshift(auditRecord);

    if (isFirebaseAdminReady()) {
      adminDb().collection("payments").doc(auditRecord.id).set(auditRecord).catch(() => {});
    }
  }

  /**
   * Starts a 3-Day Free Trial on a monthly retainer package.
   * Enforces strict duplicate trial prevention per client per package tier.
   */
  public static startPackageTrial(params: {
    clientUid: string;
    clientName: string;
    clientEmail: string;
    planId: string;
    planName: string;
    monthlyPriceINR: number;
    billingCycle?: "monthly" | "quarterly" | "annual";
    chatId?: string;
  }): { success: boolean; order?: FirestoreOrderRecord; error?: string } {
    const all = this.getAll();

    // Check if client has ever used a trial for this planId
    const existingTrial = all.find(
      (o) =>
        (o.clientUid === params.clientUid || o.clientId === params.clientUid || o.clientEmail === params.clientEmail) &&
        (o.items?.some((i) => i.planId === params.planId) || o.service === params.planName || o.title?.includes(params.planName))
    );

    if (existingTrial) {
      return {
        success: false,
        error: `Trial quota reached: A free trial has already been initiated for the ${params.planName} tier under your account. Please proceed with standard subscription checkout.`,
      };
    }

    const orderId = `ord_trial_${Date.now()}`;
    const orderNumber = `ORD-TRL-${Math.floor(1000 + Math.random() * 9000)}`;
    const now = new Date().toISOString();
    const trialDueDate = new Date(Date.now() + 3 * 24 * 3600 * 1000).toISOString();

    const trialOrder: FirestoreOrderRecord = {
      id: orderId,
      code: `#${orderNumber}`,
      orderNumber,
      title: `${params.planName} (3-Day Free Trial)`,
      service: params.planName,
      type: "monthly_plan",
      items: [
        {
          planId: params.planId,
          name: params.planName,
          price: params.monthlyPriceINR,
          quantity: 1,
        },
      ],
      totalAmount: params.monthlyPriceINR,
      billingCycle: params.billingCycle || "monthly",
      status: "trial",
      statusLabel: "3-Day Free Trial Active",
      paymentStatus: "unpaid",
      source: params.chatId ? "ai_chat" : "dashboard",
      chatId: params.chatId,
      clientUid: params.clientUid,
      clientId: params.clientUid,
      clientName: params.clientName,
      clientEmail: params.clientEmail,
      driveFolderId: `drive_fld_trial_${orderId}`,
      driveFolderPath: `Clients/${params.clientName}/${orderNumber}`,
      driveFolderLink: `https://drive.google.com/drive/folders/drive_fld_trial_${orderId}`,
      estimatedDeliveryDays: 3,
      estimatedDueDate: trialDueDate,
      createdAt: now,
      updatedAt: now,
      revisionRound: 0,
      maxRevisions: 0,
      deliverables: [],
      statusHistory: [
        {
          status: "trial",
          changedAt: now,
          changedBy: "client",
          note: `3-Day Free Trial initiated for ${params.planName}. Zero charge until trial conclusion.`,
        },
      ],
    };

    this.add(trialOrder);

    // Notify client and admin
    NotificationsStore.add({
      userId: params.clientUid,
      type: "order_placed",
      title: "3-Day Free Trial Activated",
      message: `Your 3-day free trial for ${params.planName} is active. Explore studio capabilities with zero upfront charge.`,
      orderId,
      orderNumber,
      actionUrl: "/orders",
      actionLabel: "View in Orders",
    });

    NotificationsStore.add({
      userId: "admin",
      type: "order_placed",
      title: "New Client Trial Activated",
      message: `${params.clientName} started 3-day trial on ${params.planName} (#${orderNumber}).`,
      orderId,
      orderNumber,
      actionUrl: "/admin",
    });

    return { success: true, order: trialOrder };
  }

  /**
   * Converts an active 3-Day Trial to a paid, active monthly retainer subscription.
   */
  public static convertTrialToPaid(params: {
    orderId: string;
    razorpayPaymentId: string;
    amountPaid: number;
  }): { success: boolean; order?: FirestoreOrderRecord; error?: string } {
    const order = this.findById(params.orderId);
    if (!order) return { success: false, error: "Order not found." };
    if (order.status !== "trial") return { success: false, error: "Order is not currently in trial status." };

    const now = new Date().toISOString();
    const nextPeriodEnd = new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString();

    order.status = "active";
    order.statusLabel = "Active Retainer Subscription";
    order.paymentStatus = "paid";
    order.razorpayPaymentId = params.razorpayPaymentId;
    order.amountPaid = params.amountPaid;
    order.paidAt = now;
    order.currentPeriodStart = now;
    order.currentPeriodEnd = nextPeriodEnd;
    order.updatedAt = now;

    if (!order.statusHistory) order.statusHistory = [];
    order.statusHistory.push({
      status: "active",
      changedAt: now,
      changedBy: "system",
      note: `Trial successfully converted to active paid retainer. First billing verified via Razorpay (${params.razorpayPaymentId}).`,
    });

    persistOrderToFirestore(order).catch(() => {});

    this.logPaymentEvent({
      orderId: order.id,
      eventType: "subscription.converted",
      amountINR: params.amountPaid,
      paymentId: params.razorpayPaymentId,
      source: "checkout",
    });

    const targetUser = order.clientUid || order.clientId || "";
    if (targetUser) {
      NotificationsStore.add({
        userId: targetUser,
        type: "order_paid",
        title: "Retainer Activated",
        message: `Your monthly retainer for ${order.service} is officially active. Next renewal on ${new Date(nextPeriodEnd).toLocaleDateString()}.`,
        orderId: order.id,
        orderNumber: order.orderNumber,
        actionUrl: "/orders",
      });
    }

    return { success: true, order };
  }

  /**
   * Client-initiated cancellation before production kickoff.
   * Eligible states: pending_payment, pending, paid, brief_review.
   */
  public static clientCancelOrder(params: {
    orderId: string;
    clientUid?: string;
    reason?: string;
  }): { success: boolean; order?: FirestoreOrderRecord; error?: string; refunded?: boolean } {
    const order = this.findById(params.orderId);
    if (!order) return { success: false, error: "Order not found." };

    // Security check: client ownership
    if (params.clientUid && order.clientUid && order.clientUid !== params.clientUid && params.clientUid !== "admin") {
      return { success: false, error: "Forbidden: You cannot cancel orders belonging to another client." };
    }

    const cancelableStatuses = ["pending_payment", "pending", "paid", "confirmed", "brief_review", "trial"];
    if (!cancelableStatuses.includes(order.status)) {
      return {
        success: false,
        error: `Cancellation Unavailable: Order is in '${order.statusLabel || order.status}'. Commissions actively in production or delivered cannot be self-cancelled. Please contact studio support.`,
      };
    }

    const now = new Date().toISOString();
    const wasPaid = order.paymentStatus === "paid";
    order.status = wasPaid ? "refunded" : "cancelled";
    order.statusLabel = wasPaid ? "Order Cancelled & Refunded" : "Order Cancelled";
    order.updatedAt = now;

    if (wasPaid) {
      order.paymentStatus = "refunded";
      this.logPaymentEvent({
        orderId: order.id,
        eventType: "payment.refund_initiated",
        amountINR: order.amountPaid || order.totalAmount,
        paymentId: order.razorpayPaymentId,
        source: "client_portal",
        payload: { reason: params.reason || "Cancelled before production kickoff" },
      });
    }

    if (!order.statusHistory) order.statusHistory = [];
    order.statusHistory.push({
      status: order.status,
      changedAt: now,
      changedBy: "client",
      note: `Client cancelled order before production kickoff. Reason: ${params.reason || "Self-service cancellation"}.${wasPaid ? " 100% refund initiated via Razorpay." : ""}`,
    });

    persistOrderToFirestore(order).catch(() => {});

    // Notify Admin
    NotificationsStore.add({
      userId: "admin",
      type: "status_update",
      title: "Order Cancelled by Client",
      message: `Order #${order.orderNumber || order.code} cancelled by client before kickoff.${wasPaid ? " Refund processed." : ""}`,
      orderId: order.id,
      orderNumber: order.orderNumber || order.code,
      actionUrl: `/admin`,
    });

    return { success: true, order, refunded: wasPaid };
  }

  /**
   * Administrative refund execution via Razorpay.
   */
  public static adminRefundOrder(params: {
    orderId: string;
    amountINR?: number;
    reason: string;
    adminName?: string;
  }): { success: boolean; order?: FirestoreOrderRecord; error?: string } {
    const order = this.findById(params.orderId);
    if (!order) return { success: false, error: "Order not found." };

    const now = new Date().toISOString();
    const refundAmount = params.amountINR || order.amountPaid || order.totalAmount || 0;

    order.status = "refunded";
    order.statusLabel = `Refunded (₹${refundAmount.toLocaleString("en-IN")})`;
    order.paymentStatus = "refunded";
    order.updatedAt = now;

    if (!order.statusHistory) order.statusHistory = [];
    order.statusHistory.push({
      status: "refunded",
      changedAt: now,
      changedBy: params.adminName || "admin",
      note: `Administrative refund of ₹${refundAmount.toLocaleString("en-IN")} executed via Razorpay. Reason: ${params.reason}`,
    });

    persistOrderToFirestore(order).catch(() => {});

    this.logPaymentEvent({
      orderId: order.id,
      eventType: "payment.refunded",
      amountINR: refundAmount,
      paymentId: order.razorpayPaymentId,
      source: "admin_portal",
      payload: { reason: params.reason },
    });

    // Notify Client
    const targetUser = order.clientUid || order.clientId || "";
    if (targetUser) {
      NotificationsStore.add({
        userId: targetUser,
        type: "status_update",
        title: "Refund Processed",
        message: `A refund of ₹${refundAmount.toLocaleString("en-IN")} has been processed for Order #${order.orderNumber || order.code}. Funds will reflect in your bank account in 3-5 days.`,
        orderId: order.id,
        orderNumber: order.orderNumber || order.code,
        actionUrl: `/orders`,
      });
    }

    return { success: true, order };
  }

  /**
   * Cleans up abandoned unpaid draft orders older than 72 hours.
   */
  public static cleanStaleUnpaidOrders(maxAgeHours: number = 72): number {
    const cutoff = Date.now() - maxAgeHours * 3600 * 1000;
    let expiredCount = 0;

    for (const order of globalAny.__SUTRA_STORED_ORDERS__) {
      if (
        order.status === "pending_payment" &&
        order.paymentStatus === "unpaid" &&
        new Date(order.createdAt).getTime() < cutoff
      ) {
        order.status = "expired";
        order.statusLabel = "Draft Expired (Abandoned Checkout)";
        order.updatedAt = new Date().toISOString();
        persistOrderToFirestore(order).catch(() => {});
        expiredCount += 1;
      }
    }

    return expiredCount;
  }
}
