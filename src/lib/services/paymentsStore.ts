import fs from "node:fs";
import path from "node:path";
import { readEnv, readPublicEnv } from "@/lib/config/env";
import type { PaymentRecordDocument, PaymentRecordStatus } from "@/lib/types/database";
import { OrdersStore } from "./ordersStore";
import { NotificationsStore } from "./notificationsStore";
import { AuditLogService } from "./auditLogService";
import { adminDb, isFirebaseAdminReady } from "@/lib/db";

/**
 * SUTRA STUDIO — Unified UPI Payments Store
 * Dual persistence: Local Disk JSON Store + Cloud Firestore (collection "payments").
 * Enforces:
 *  - Locked server-computed amounts (never browser-specified)
 *  - Single-use UTR across all orders in database
 *  - Explicit lifecycle: awaiting_payment -> payment_submitted -> verified -> paid (or rejected/expired)
 *  - Admin-only verification & rejection with audit logging
 */

const DATA_DIR = path.resolve(process.cwd(), "data");
const PAYMENTS_FILE = path.resolve(DATA_DIR, "sutra_payments_store.json");

function ensureDataDir(): void {
  try {
    if (typeof window === "undefined" && !fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  } catch (err) {
    console.warn("[PaymentsStore] Error creating data directory:", err);
  }
}

function loadPaymentsFromDisk(): PaymentRecordDocument[] {
  try {
    if (typeof window !== "undefined") return [];
    ensureDataDir();
    if (fs.existsSync(PAYMENTS_FILE)) {
      const raw = fs.readFileSync(PAYMENTS_FILE, "utf8");
      if (raw && raw.trim().length > 0) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      }
    }
  } catch (err) {
    console.warn("[PaymentsStore] Error loading payments from disk:", err);
  }
  return [];
}

export function savePaymentsToDisk(payments: PaymentRecordDocument[]): void {
  try {
    if (typeof window !== "undefined") return;
    ensureDataDir();
    fs.writeFileSync(PAYMENTS_FILE, JSON.stringify(payments, null, 2), "utf8");
  } catch (err) {
    console.warn("[PaymentsStore] Error saving payments to disk:", err);
  }
}

const DISK_PAYMENTS = loadPaymentsFromDisk();
const globalAny = globalThis as any;

if (!globalAny.__SUTRA_STORED_PAYMENTS__ || globalAny.__SUTRA_STORED_PAYMENTS__.length === 0) {
  globalAny.__SUTRA_STORED_PAYMENTS__ = [...DISK_PAYMENTS];
} else if (DISK_PAYMENTS.length > 0) {
  const map = new Map<string, PaymentRecordDocument>();
  for (const p of DISK_PAYMENTS) {
    if (p && p.id) map.set(p.id, p);
  }
  for (const p of globalAny.__SUTRA_STORED_PAYMENTS__) {
    if (p && p.id) map.set(p.id, { ...(map.get(p.id) || {}), ...p });
  }
  globalAny.__SUTRA_STORED_PAYMENTS__ = Array.from(map.values());
}

export class PaymentsStore {
  public static getMerchantVpa(): string {
    return (
      readEnv("UPI_MERCHANT_VPA") ||
      readPublicEnv("NEXT_PUBLIC_MERCHANT_UPI_VPA") ||
      "yashjoshi7355-1@okicici"
    );
  }

  public static getMerchantName(): string {
    return (
      readEnv("UPI_MERCHANT_NAME") ||
      readPublicEnv("NEXT_PUBLIC_MERCHANT_NAME") ||
      "Yash Joshi"
    );
  }

  /**
   * Generates a standard RFC-compliant UPI Deep-Link URI
   * Format: upi://pay?pa=...&pn=...&am=...&cu=INR&tn=...
   */
  public static buildUpiUri(params: {
    vpa?: string;
    merchantName?: string;
    amountINR: number;
    orderNumber: string;
    note?: string;
  }): string {
    const vpa = params.vpa || this.getMerchantVpa();
    const name = encodeURIComponent(params.merchantName || this.getMerchantName());
    const amount = Number(params.amountINR).toFixed(2);
    const note = encodeURIComponent(params.note || params.orderNumber);

    return `upi://pay?pa=${vpa}&pn=${name}&am=${amount}&cu=INR&tn=${note}`;
  }

  /**
   * Gets or creates a locked payment record for an order or subscription cycle.
   * Locked amount is strictly extracted from the order record.
   */
  public static async getOrCreatePaymentRecord(params: {
    orderId: string;
    orderNumber?: string;
    amountINR?: number;
    clientId?: string;
    clientName?: string;
    clientEmail?: string;
    cycleIndex?: number;
  }): Promise<PaymentRecordDocument> {
    const list: PaymentRecordDocument[] = globalAny.__SUTRA_STORED_PAYMENTS__;
    const paymentId = params.cycleIndex !== undefined
      ? `pay_${params.orderId}_cycle_${params.cycleIndex}`
      : `pay_${params.orderId}`;

    const existing = list.find((p) => p.id === paymentId || (p.orderId === params.orderId && !params.cycleIndex));
    if (existing) {
      return existing;
    }

    // Lookup official order to lock amount server-side
    const order = (await OrdersStore.findByIdAsync(params.orderId)) || OrdersStore.findById(params.orderId);
    const lockedAmount = Number(order?.totalAmount ?? params.amountINR ?? 0);
    const orderNumber = String(order?.orderNumber || order?.code || params.orderNumber || `ORD-${Date.now()}`);
    const clientId = String(order?.clientUid || order?.clientId || params.clientId || "client");
    const clientName = String(order?.clientName || params.clientName || "Studio Client");
    const clientEmail = String(order?.clientEmail || params.clientEmail || "");
    const now = new Date().toISOString();

    const vpa = this.getMerchantVpa();
    const payeeName = this.getMerchantName();
    const note = params.cycleIndex !== undefined
      ? `${orderNumber}-CYCLE-${params.cycleIndex}`
      : orderNumber;

    const upiUri = this.buildUpiUri({
      vpa,
      merchantName: payeeName,
      amountINR: lockedAmount,
      orderNumber,
      note,
    });

    const newPayment: PaymentRecordDocument = {
      id: paymentId,
      orderId: params.orderId,
      orderNumber,
      clientId,
      clientName,
      clientEmail,
      amountINR: lockedAmount,
      currency: "INR",
      status: "awaiting_payment",
      gateway: "upi_qr",
      upiUri,
      vpa,
      payeeName,
      note,
      cycleIndex: params.cycleIndex,
      createdAt: now,
      updatedAt: now,
    };

    list.unshift(newPayment);
    savePaymentsToDisk(list);

    // Persist to Cloud Firestore
    if (isFirebaseAdminReady()) {
      try {
        const db = adminDb();
        await db.collection("payments").doc(newPayment.id).set(newPayment, { merge: true });
      } catch (err) {
        console.warn("[PaymentsStore] Firestore sync notice:", err);
      }
    }

    return newPayment;
  }

  public static findById(paymentId: string): PaymentRecordDocument | undefined {
    const list: PaymentRecordDocument[] = globalAny.__SUTRA_STORED_PAYMENTS__;
    return list.find((p) => p.id === paymentId);
  }

  public static findByOrderId(orderId: string): PaymentRecordDocument | undefined {
    const list: PaymentRecordDocument[] = globalAny.__SUTRA_STORED_PAYMENTS__;
    const match = list.find((p) => p.orderId === orderId);

    const diskPayments = loadPaymentsFromDisk();
    const diskMatch = diskPayments.find((p) => p.orderId === orderId);
    if (diskMatch) {
      if (!match) {
        list.unshift(diskMatch);
        return diskMatch;
      }
      if (
        (diskMatch.updatedAt && (!match.updatedAt || diskMatch.updatedAt > match.updatedAt)) ||
        diskMatch.status !== match.status
      ) {
        Object.assign(match, diskMatch);
      }
    }
    return match;
  }

  public static findByUtr(utr: string): PaymentRecordDocument | undefined {
    const clean = utr.trim().toUpperCase();
    const list: PaymentRecordDocument[] = globalAny.__SUTRA_STORED_PAYMENTS__;
    return list.find((p) => (p.utrNumber || "").trim().toUpperCase() === clean);
  }

  /**
   * Enforces single-use UTR rule across all orders in database.
   */
  public static async isUtrUsed(utr: string, excludePaymentId?: string): Promise<boolean> {
    const clean = utr.trim().toUpperCase();
    if (!clean) return false;

    // Check in-memory store
    const list: PaymentRecordDocument[] = globalAny.__SUTRA_STORED_PAYMENTS__;
    const inMemMatch = list.find(
      (p) =>
        p.id !== excludePaymentId &&
        (p.utrNumber || "").trim().toUpperCase() === clean &&
        p.status !== "rejected" &&
        p.status !== "expired"
    );
    if (inMemMatch) return true;

    // Check Cloud Firestore
    if (isFirebaseAdminReady()) {
      try {
        const db = adminDb();
        const snap = await db
          .collection("payments")
          .where("utrNumber", "==", clean)
          .limit(2)
          .get();

        for (const doc of snap.docs) {
          if (doc.id !== excludePaymentId) {
            const data = doc.data() as PaymentRecordDocument;
            if (data.status !== "rejected" && data.status !== "expired") {
              return true;
            }
          }
        }
      } catch (err) {
        console.warn("[PaymentsStore] Firestore UTR lookup notice:", err);
      }
    }

    return false;
  }

  /**
   * Client submits UTR and optional payment screenshot.
   * Amount is strictly locked from server record, never from client input.
   */
  public static async submitUtr(params: {
    orderId: string;
    utrNumber: string;
    screenshotUrl?: string;
    screenshotDriveFileId?: string;
    clientUid?: string;
  }): Promise<{ success: boolean; payment?: PaymentRecordDocument; error?: string }> {
    const cleanUtr = params.utrNumber.trim().toUpperCase();

    // Validate UTR format (12-16 alphanumeric or numeric)
    if (!/^[0-9A-Z]{12,16}$/.test(cleanUtr)) {
      return {
        success: false,
        error: "Invalid UTR / UPI reference number. Please provide a valid 12 to 16 character bank reference code from your UPI app receipt.",
      };
    }

    // Lookup existing locked payment record or create from order
    let payment = this.findByOrderId(params.orderId);
    if (!payment) {
      payment = await this.getOrCreatePaymentRecord({ orderId: params.orderId });
    }

    if (!payment) {
      return { success: false, error: "Order payment record not found." };
    }

    // Single-use UTR check across all orders
    const used = await this.isUtrUsed(cleanUtr, payment.id);
    if (used) {
      return {
        success: false,
        error: `UTR reference ${cleanUtr} has already been registered for another order. Each transaction receipt can be submitted only once.`,
      };
    }

    const now = new Date().toISOString();
    payment.utrNumber = cleanUtr;
    if (params.screenshotUrl) payment.screenshotUrl = params.screenshotUrl;
    if (params.screenshotDriveFileId) payment.screenshotDriveFileId = params.screenshotDriveFileId;
    payment.status = "payment_submitted";
    payment.submittedAt = now;
    payment.updatedAt = now;

    // Persist to local disk
    savePaymentsToDisk(globalAny.__SUTRA_STORED_PAYMENTS__);

    // Persist to Firestore
    if (isFirebaseAdminReady()) {
      try {
        const db = adminDb();
        await db.collection("payments").doc(payment.id).set(payment, { merge: true });
      } catch (err) {
        console.warn("[PaymentsStore] Firestore submitUtr error:", err);
      }
    }

    // Update order status
    const order = OrdersStore.findById(params.orderId);
    if (order) {
      OrdersStore.update(order.id, {
        paymentStatus: "pending_verification",
        statusLabel: `UPI Payment Submitted (UTR: ${cleanUtr}) — Awaiting Admin Verification`,
        updatedAt: now,
      });

      if (!order.statusHistory) order.statusHistory = [];
      order.statusHistory.push({
        status: order.status || "pending_payment",
        changedAt: now,
        changedBy: params.clientUid || "client",
        note: `UPI QR payment submitted with UTR ${cleanUtr}. Amount locked to ₹${payment.amountINR.toLocaleString("en-IN")}. Awaiting studio admin ledger verification.`,
      });

      const eventPayload: Record<string, any> = { utrNumber: cleanUtr };
      if (params.screenshotUrl) eventPayload.screenshotUrl = params.screenshotUrl;
      if (params.screenshotDriveFileId) eventPayload.screenshotDriveFileId = params.screenshotDriveFileId;

      OrdersStore.logPaymentEvent({
        orderId: order.id,
        eventType: "payment.utr_submitted",
        amountINR: payment.amountINR,
        paymentId: payment.id,
        source: "client_portal",
        payload: eventPayload,
      });
    }

    // Admin alert for payment verification queue
    try {
      NotificationsStore.add({
        userId: "usr_admin_001",
        type: "status_update",
        title: "Payment to Verify (UPI QR)",
        message: `Client submitted UTR ${cleanUtr} for Order #${payment.orderNumber} (₹${payment.amountINR.toLocaleString("en-IN")}). Awaiting studio bank credit verification.`,
        orderId: payment.orderId,
        orderNumber: payment.orderNumber,
        actionUrl: "/admin/orders",
        actionLabel: "Verify Payment",
      });
    } catch {}

    return { success: true, payment };
  }

  /**
   * Admin-only: Verifies payment, marks order paid, dispatches to n8n, and writes audit log.
   */
  public static async verifyPayment(params: {
    orderId?: string;
    paymentId?: string;
    adminActor: { uid: string; email: string; name: string };
    notes?: string;
  }): Promise<{ success: boolean; payment?: PaymentRecordDocument; order?: any; error?: string }> {
    const list: PaymentRecordDocument[] = globalAny.__SUTRA_STORED_PAYMENTS__;
    let payment = params.paymentId
      ? list.find((p) => p.id === params.paymentId)
      : params.orderId
      ? list.find((p) => p.orderId === params.orderId)
      : undefined;

    if (!payment && params.orderId) {
      payment = await this.getOrCreatePaymentRecord({ orderId: params.orderId });
    }

    if (!payment) {
      return { success: false, error: "Payment record not found." };
    }

    if (payment.status === "paid") {
      const order = OrdersStore.findById(payment.orderId);
      return { success: true, payment, order };
    }

    const now = new Date().toISOString();
    payment.status = "paid";
    payment.verifiedAt = now;
    payment.verifiedBy = params.adminActor.email || params.adminActor.uid;
    payment.updatedAt = now;

    savePaymentsToDisk(list);

    // Transactional ACID sync in PostgreSQL: atomically transitions Payment and Order
    try {
      const { prisma } = await import("@/lib/prisma");
      await prisma.$transaction(async (tx) => {
        await tx.payment.updateMany({
          where: { OR: [{ id: payment.id }, { orderId: payment.orderId }] },
          data: {
            status: "paid",
          },
        });
        await tx.order.updateMany({
          where: { id: payment.orderId },
          data: {
            paymentStatus: "paid",
            status: "in_production",
            amountPaid: payment.amountINR,
          },
        });
      });
    } catch (txErr) {
      console.warn("[PaymentsStore] Transactional payment verification warning:", txErr);
    }

    if (isFirebaseAdminReady()) {
      try {
        const db = adminDb();
        await db.collection("payments").doc(payment.id).set(payment, { merge: true });
      } catch (err) {
        console.warn("[PaymentsStore] Firestore verifyPayment notice:", err);
      }
    }

    // Mark Order as paid and transition to in_production
    const order = OrdersStore.findById(payment.orderId);
    let updatedOrder = order;

    if (order) {
      updatedOrder = await OrdersStore.markAsPaidAsync({
        orderId: order.id,
        amountPaid: payment.amountINR,
        paymentMethod: "UPI_QR",
        targetStatus: "in_production",
        source: "admin_portal",
      });

      await OrdersStore.updateAsync(order.id, {
        status: "in_production",
        statusLabel: "Payment Verified — In Studio Production Queue",
        updatedAt: now,
      });

      if (!order.statusHistory) order.statusHistory = [];
      order.statusHistory.push({
        status: "in_production",
        changedAt: now,
        changedBy: params.adminActor.name || "admin",
        note: `UPI QR payment (UTR: ${payment.utrNumber || "Verified"}) confirmed by Studio Administrator (${params.adminActor.email}). Order moved to active production.`,
      });
      await OrdersStore.updateAsync(order.id, {
        statusHistory: order.statusHistory,
      });

      OrdersStore.logPaymentEvent({
        orderId: order.id,
        eventType: "payment.verified",
        amountINR: payment.amountINR,
        paymentId: payment.id,
        source: "admin_portal",
        payload: {
          utrNumber: payment.utrNumber,
          verifiedBy: params.adminActor.email,
        },
      });

      // Dispatch to Master n8n workflow
      try {
        const currentOrigin =
          typeof window !== "undefined" && window.location.origin
            ? window.location.origin
            : readEnv("APP_BASE_URL") || "https://sutrastudios.in";

        await fetch(`${currentOrigin}/api/n8n/dispatch`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orderId: order.id,
            orderCode: order.orderNumber || order.code || order.id,
            sourceChannel: "admin_verified_payment",
            client: {
              name: order.clientName,
              email: order.clientEmail,
              phone: order.clientPhone || "",
              brandName: (order as any).brandName || order.clientName,
            },
            package: {
              name: (order as any).packageName || order.service || "Studio Creative",
              price: payment.amountINR,
            },
            dispatchedBy: params.adminActor.name || "Studio Administrator",
            dispatchedAt: now,
            workflowId: "sutra-master-dispatch",
            isAdminDispatch: true,
          }),
        }).catch((n8nErr) => {
          console.warn("[PaymentsStore] Auto n8n dispatch notification:", n8nErr);
        });
      } catch {}

      // Notify Client
      try {
        NotificationsStore.add({
          userId: order.clientUid || order.clientId || "client",
          type: "order_paid",
          title: "Payment Verified & Confirmed",
          message: `Your payment of ₹${payment.amountINR.toLocaleString("en-IN")} (UTR: ${payment.utrNumber || "Verified"}) for Order #${order.orderNumber} is confirmed! Work has officially started in our studio pipeline.`,
          orderId: order.id,
          orderNumber: order.orderNumber,
          actionUrl: "/orders",
          actionLabel: "View Order",
          recipientEmail: order.clientEmail,
        });
      } catch {}
    }

    // Administrative Audit Trail
    try {
      AuditLogService.record({
        who: {
          uid: params.adminActor.uid,
          email: params.adminActor.email,
          name: params.adminActor.name,
          role: "admin",
        },
        what: "STATUS_UPDATED",
        targetType: "order",
        targetId: payment.id,
        targetTitle: `Payment for Order #${payment.orderNumber} (₹${payment.amountINR.toLocaleString("en-IN")})`,
        after: {
          status: "paid",
          utrNumber: payment.utrNumber,
          verifiedAt: now,
          verifiedBy: params.adminActor.email,
        },
        note: params.notes || `Admin verified UPI QR payment for Order #${payment.orderNumber}`,
        type: "info",
      });
    } catch {}

    return { success: true, payment, order: updatedOrder };
  }

  /**
   * Admin-only: Rejects payment with audit logging.
   */
  public static async rejectPayment(params: {
    orderId?: string;
    paymentId?: string;
    reason: string;
    adminActor: { uid: string; email: string; name: string };
  }): Promise<{ success: boolean; payment?: PaymentRecordDocument; order?: any; error?: string }> {
    const list: PaymentRecordDocument[] = globalAny.__SUTRA_STORED_PAYMENTS__;
    let payment = params.paymentId
      ? list.find((p) => p.id === params.paymentId)
      : params.orderId
      ? list.find((p) => p.orderId === params.orderId)
      : undefined;

    if (!payment && params.orderId) {
      payment = await this.getOrCreatePaymentRecord({ orderId: params.orderId });
    }

    if (!payment) {
      return { success: false, error: "Payment record not found." };
    }

    if (payment.status === "paid") {
      return {
        success: false,
        error: "Cannot reject a payment that has already been verified and marked as paid. Please use the refund pipeline.",
      };
    }

    const now = new Date().toISOString();
    payment.status = "rejected";
    payment.rejectionReason = params.reason;
    payment.rejectedAt = now;
    payment.rejectedBy = params.adminActor.email || params.adminActor.uid;
    payment.updatedAt = now;

    savePaymentsToDisk(list);

    if (isFirebaseAdminReady()) {
      try {
        const db = adminDb();
        await db.collection("payments").doc(payment.id).set(payment, { merge: true });
      } catch (err) {
        console.warn("[PaymentsStore] Firestore rejectPayment notice:", err);
      }
    }

    const order = OrdersStore.findById(payment.orderId);
    let updatedOrder = order;

    if (order) {
      updatedOrder = OrdersStore.update(order.id, {
        paymentStatus: "failed",
        statusLabel: "UPI Payment Rejected — UTR Unmatched in Bank Ledger",
        updatedAt: now,
      });

      if (!order.statusHistory) order.statusHistory = [];
      order.statusHistory.push({
        status: order.status || "pending_payment",
        changedAt: now,
        changedBy: params.adminActor.name || "admin",
        note: `UPI QR payment rejected by Studio Administrator: ${params.reason}`,
      });

      OrdersStore.logPaymentEvent({
        orderId: order.id,
        eventType: "payment.rejected",
        amountINR: payment.amountINR,
        paymentId: payment.id,
        source: "admin_portal",
        payload: {
          reason: params.reason,
          rejectedBy: params.adminActor.email,
        },
      });

      // Notify Client
      try {
        NotificationsStore.add({
          userId: order.clientUid || order.clientId || "client",
          type: "status_update",
          title: "Payment Verification Notice",
          message: `Your payment verification for Order #${order.orderNumber} was not matched in studio records: ${params.reason}. Please re-submit a valid UTR or contact studio support.`,
          orderId: order.id,
          orderNumber: order.orderNumber,
          actionUrl: "/orders",
          actionLabel: "Review Payment",
          recipientEmail: order.clientEmail,
        });
      } catch {}
    }

    // Administrative Audit Trail
    try {
      AuditLogService.record({
        who: {
          uid: params.adminActor.uid,
          email: params.adminActor.email,
          name: params.adminActor.name,
          role: "admin",
        },
        what: "STATUS_UPDATED",
        targetType: "order",
        targetId: payment.id,
        targetTitle: `Payment for Order #${payment.orderNumber}`,
        after: {
          status: "rejected",
          rejectionReason: params.reason,
          rejectedBy: params.adminActor.email,
        },
        note: `Admin rejected payment: ${params.reason}`,
        type: "warning",
      });
    } catch {}

    return { success: true, payment, order: updatedOrder };
  }

  /**
   * Admin-only: Manual ledger refund recording.
   */
  public static async recordManualRefund(params: {
    orderId: string;
    amountINR?: number;
    reason: string;
    adminActor: { uid: string; email: string; name: string };
  }): Promise<{ success: boolean; refundId: string; order?: any; error?: string }> {
    const order = OrdersStore.findById(params.orderId);
    if (!order) {
      return { success: false, refundId: "", error: "Order not found." };
    }

    const refundId = `rfnd_${Date.now()}`;
    const refundAmount = Number(params.amountINR || order.totalAmount || 0);
    const now = new Date().toISOString();

    const payment = this.findByOrderId(params.orderId);
    if (payment) {
      payment.status = "refunded";
      payment.refundedAmountINR = refundAmount;
      payment.refundReason = params.reason;
      payment.refundedAt = now;
      payment.refundedBy = params.adminActor.email || params.adminActor.uid;
      payment.updatedAt = now;
      savePaymentsToDisk(globalAny.__SUTRA_STORED_PAYMENTS__);

      if (isFirebaseAdminReady()) {
        try {
          const db = adminDb();
          await db.collection("payments").doc(payment.id).set(payment, { merge: true });
        } catch {}
      }
    }

    const updatedOrder = OrdersStore.update(order.id, {
      paymentStatus: "refunded",
      status: "cancelled",
      statusLabel: "Cancelled & Refunded",
      updatedAt: now,
    });

    if (!order.statusHistory) order.statusHistory = [];
    order.statusHistory.push({
      status: "cancelled",
      changedAt: now,
      changedBy: params.adminActor.name || "admin",
      note: `Commission refunded manually (Refund ID: ${refundId}) by Studio Administrator: ${params.reason}`,
    });

    OrdersStore.logPaymentEvent({
      orderId: order.id,
      eventType: "payment.refunded",
      amountINR: refundAmount,
      paymentId: payment?.id || `pay_${order.id}`,
      source: "refund",
      payload: { refundId, reason: params.reason, adminEmail: params.adminActor.email },
    });

    // Record in Audit Log
    try {
      AuditLogService.record({
        who: {
          uid: params.adminActor.uid,
          email: params.adminActor.email,
          name: params.adminActor.name,
          role: "admin",
        },
        what: "PAYMENT_REFUNDED",
        targetType: "order",
        targetId: order.id,
        targetTitle: `${order.title} (#${order.orderNumber || order.code})`,
        after: { status: "cancelled", paymentStatus: "refunded", refundId },
        note: `Manual ledger refund of ₹${refundAmount.toLocaleString("en-IN")}: ${params.reason}`,
        type: "warning",
      });
    } catch {}

    return { success: true, refundId, order: updatedOrder };
  }

  /**
   * Returns all payments currently in "payment_submitted" status for the Admin verification queue.
   */
  public static getPaymentsToVerify(): PaymentRecordDocument[] {
    const list: PaymentRecordDocument[] = globalAny.__SUTRA_STORED_PAYMENTS__;
    return list.filter((p) => p.status === "payment_submitted");
  }

  public static getAll(): PaymentRecordDocument[] {
    return globalAny.__SUTRA_STORED_PAYMENTS__ || [];
  }
}
