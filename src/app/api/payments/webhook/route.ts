import { NextResponse } from "next/server";
import { PaymentsService } from "@/lib/services/payments";
import { OrdersStore } from "@/lib/services/ordersStore";

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-razorpay-signature");

    // 1. Cryptographic Signature Verification
    const isValid = PaymentsService.verifyWebhookSignature(rawBody, signature);
    if (!isValid) {
      console.warn("[Razorpay Webhook] Rejected: Invalid webhook signature.");
      return NextResponse.json(
        { error: "Invalid webhook cryptographic signature" },
        { status: 400 }
      );
    }

    let payload: any;
    try {
      payload = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
    }

    const eventId = payload.id || `${payload.event}_${payload.created_at || Date.now()}`;
    const eventType = payload.event;

    // 2. Idempotency Check: Prevent duplicate processing
    if (OrdersStore.isWebhookProcessed(eventId)) {
      console.log(`[Razorpay Webhook] Idempotent skip: Event ${eventId} already processed.`);
      return NextResponse.json(
        { status: "ok", duplicate: true, message: "Event already processed (idempotent)." },
        { status: 200 }
      );
    }

    console.log(`[Razorpay Webhook] Processing event: ${eventType} (ID: ${eventId})`);

    // 3. Process Specific Event Types
    switch (eventType) {
      case "payment.captured":
      case "order.paid": {
        const paymentEntity = payload.payload?.payment?.entity || payload.payload?.order?.entity;
        const razorpayPaymentId = paymentEntity?.id;
        const razorpayOrderId = paymentEntity?.order_id || payload.payload?.order?.entity?.id;
        const notes = paymentEntity?.notes || {};
        const targetOrderId = notes.orderId || notes.order_id || razorpayOrderId;

        if (targetOrderId) {
          const order = OrdersStore.findById(targetOrderId);
          if (order) {
            // Update order status if not already paid
            if (order.paymentStatus !== "paid") {
              OrdersStore.markAsPaid({
                orderId: order.id,
                razorpayPaymentId: razorpayPaymentId || `pay_wh_${Date.now()}`,
                razorpayOrderId: razorpayOrderId,
                amountPaid: paymentEntity?.amount ? paymentEntity.amount / 100 : order.totalAmount,
                paymentMethod: paymentEntity?.method || "razorpay_webhook",
                source: "webhook",
              });
              console.log(`[Razorpay Webhook] Order ${order.id} marked as PAID via webhook.`);
            }
          }
        }
        break;
      }

      case "payment.failed": {
        const paymentEntity = payload.payload?.payment?.entity;
        const razorpayOrderId = paymentEntity?.order_id;
        const notes = paymentEntity?.notes || {};
        const targetOrderId = notes.orderId || notes.order_id || razorpayOrderId;
        const reason =
          paymentEntity?.error_description ||
          paymentEntity?.error_reason ||
          "Payment authorization failed at bank.";

        if (targetOrderId) {
          const order = OrdersStore.findById(targetOrderId);
          if (order && order.paymentStatus !== "paid") {
            OrdersStore.markAsFailed({
              orderId: order.id,
              reason,
              paymentId: paymentEntity?.id,
            });
            console.log(`[Razorpay Webhook] Order ${order.id} marked as FAILED via webhook: ${reason}`);
          }
        }
        break;
      }

      case "refund.created":
      case "refund.processed": {
        const refundEntity = payload.payload?.refund?.entity;
        const paymentEntity = payload.payload?.payment?.entity;
        const targetOrderId = refundEntity?.notes?.orderId || paymentEntity?.notes?.orderId;

        if (targetOrderId) {
          const order = OrdersStore.findById(targetOrderId);
          if (order) {
            OrdersStore.update(order.id, {
              status: "cancelled",
              statusLabel: "Cancelled — Payment Refunded",
              paymentStatus: "refunded",
            });
            OrdersStore.logPaymentEvent({
              orderId: order.id,
              eventType: "refund.processed",
              paymentId: refundEntity?.id,
              source: "webhook",
            });
          }
        }
        break;
      }

      case "subscription.authenticated": {
        const subEntity = payload.payload?.subscription?.entity;
        const subId = subEntity?.id;
        const targetOrderId = subEntity?.notes?.orderId;
        const isTrial = subEntity?.notes?.isTrial === "true";

        if (targetOrderId || subId) {
          const order = OrdersStore.findById(targetOrderId || subId);
          if (order) {
            OrdersStore.update(order.id, {
              subscriptionStatus: isTrial ? "trial" : "active",
              status: "in_progress",
              statusLabel: isTrial ? "Free Trial Active (3 Days)" : "Retainer Active",
            });
            OrdersStore.logPaymentEvent({
              orderId: order.id,
              eventType: isTrial ? "subscription.trial_authenticated" : "subscription.authenticated",
              source: "webhook",
            });
          }
        }
        break;
      }

      case "subscription.charged": {
        const subEntity = payload.payload?.subscription?.entity;
        const subId = subEntity?.id;
        const targetOrderId = subEntity?.notes?.orderId;

        if (targetOrderId || subId) {
          const order = OrdersStore.findById(targetOrderId || subId);
          if (order) {
            const nextDate = subEntity?.current_end
              ? new Date(subEntity.current_end * 1000).toISOString()
              : undefined;

            OrdersStore.update(order.id, {
              subscriptionStatus: "active",
              status: "in_progress",
              statusLabel: "Retainer Active",
              nextBillingDate: nextDate,
              paymentStatus: "paid",
            });

            OrdersStore.logPaymentEvent({
              orderId: order.id,
              eventType: "subscription.charged",
              paymentId: payload.payload?.payment?.entity?.id,
              source: "webhook",
            });
          }
        }
        break;
      }

      case "subscription.halted":
      case "subscription.cancelled": {
        const subEntity = payload.payload?.subscription?.entity;
        const subId = subEntity?.id;
        const targetOrderId = subEntity?.notes?.orderId;

        if (targetOrderId || subId) {
          const order = OrdersStore.findById(targetOrderId || subId);
          if (order) {
            OrdersStore.update(order.id, {
              subscriptionStatus: eventType === "subscription.halted" ? "halted" : "cancelled",
              status: eventType === "subscription.halted" ? "pending_payment" : "cancelled",
            });
            OrdersStore.logPaymentEvent({
              orderId: order.id,
              eventType,
              source: "webhook",
            });
          }
        }
        break;
      }

      default:
        console.log(`[Razorpay Webhook] Unhandled event type: ${eventType}`);
        break;
    }

    // 4. Mark Webhook as Processed for Idempotency
    OrdersStore.markWebhookProcessed(eventId);

    return NextResponse.json(
      { status: "ok", received: true, event: eventType },
      { status: 200 }
    );
  } catch (error) {
    console.error("[Razorpay Webhook] Processing error:", error);
    return NextResponse.json(
      { error: "Webhook handling failed", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
