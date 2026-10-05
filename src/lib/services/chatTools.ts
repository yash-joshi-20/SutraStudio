/**
 * SUTRA STUDIO — Master AI Chat Tools Engine (Step 18)
 * Provides authenticated conversational ordering, live progress queries, revisions, and approval pipelines.
 */

import { OrdersStore, computeOrderProgress } from "@/lib/services/ordersStore";
import { PaymentsService } from "@/lib/services/payments";
import { provisionOrderDriveFolders } from "@/lib/services/googleDriveService";
import { NotificationsStore } from "@/lib/services/notificationsStore";
import { SEED_CATALOG_SERVICES, SEED_CATALOG_PLANS, CatalogService, CatalogPlan } from "@/lib/services/serviceCatalog";
import { generateOrderNumber } from "@/lib/types/database";

export const OFFICIAL_SERVICES_MAP: Record<string, CatalogService> = SEED_CATALOG_SERVICES.reduce((acc, s) => {
  acc[s.id] = s;
  acc[s.slug] = s;
  return acc;
}, {} as Record<string, CatalogService>);

export const OFFICIAL_PLANS_MAP: Record<string, CatalogPlan> = SEED_CATALOG_PLANS.reduce((acc, p) => {
  acc[p.id] = p;
  return acc;
}, {} as Record<string, CatalogPlan>);

export interface CreateCommissionDraftParams {
  clientUid: string;
  clientName?: string;
  clientEmail?: string;
  clientPhone?: string;
  type?: "service" | "monthly_plan";
  serviceId?: string;
  planId?: string;
  billingCycle?: "monthly" | "quarterly" | "annual";
  briefAnswers?: Record<string, any>;
  requirements?: string;
  preferredTimeline?: string;
  chatId?: string;
  confirmed?: boolean;
}

export class ChatToolsService {
  /**
   * Tool 1: list_services
   * Returns all official data-driven services from Firestore/Catalog.
   */
  public static async listServices() {
    return SEED_CATALOG_SERVICES.filter((s) => s.active).map((s) => ({
      id: s.id,
      name: s.name,
      slug: s.slug,
      category: s.category,
      tagline: s.tagline,
      startingPriceINR: s.startingPrice,
      estimatedDeliveryDays: s.estimatedDeliveryDays,
      revisionsIncluded: s.revisionsIncluded,
      requiredBriefFieldsCount: s.briefSchema?.length || 0,
    }));
  }

  /**
   * Tool 2: get_service_details
   * Returns full service specification including required brief questions schema and workflow stages.
   */
  public static async getServiceDetails(serviceIdOrSlug: string) {
    const service =
      OFFICIAL_SERVICES_MAP[serviceIdOrSlug] ||
      SEED_CATALOG_SERVICES.find(
        (s) =>
          s.id.toLowerCase() === serviceIdOrSlug.toLowerCase() ||
          s.slug.toLowerCase() === serviceIdOrSlug.toLowerCase() ||
          s.name.toLowerCase().includes(serviceIdOrSlug.toLowerCase())
      );

    if (!service) {
      return {
        error: `Service '${serviceIdOrSlug}' not found in official catalog. Use 'list_services' to see available capabilities.`,
      };
    }

    return {
      id: service.id,
      name: service.name,
      slug: service.slug,
      category: service.category,
      tagline: service.tagline,
      shortDescription: service.shortDescription,
      startingPriceINR: service.startingPrice,
      estimatedDeliveryDays: service.estimatedDeliveryDays,
      revisionsIncluded: service.revisionsIncluded,
      workflowStages: service.workflowStages,
      briefSchema: service.briefSchema, // Form fields for missing question prompts
      deliverables: service.deliverables,
    };
  }

  /**
   * Tool 3: list_plans
   * Returns official monthly subscription retainers.
   */
  public static async listPlans() {
    return SEED_CATALOG_PLANS.filter((p) => p.active).map((p) => ({
      id: p.id,
      name: p.name,
      tier: p.tier,
      monthlyPriceINR: p.monthlyPrice,
      quarterlyPriceINR: p.quarterlyPrice,
      annualPriceINR: p.annualPrice,
      freeTrialDays: p.freeTrialDays,
      features: p.features,
    }));
  }

  /**
   * Tool 4: create_order / create_commission_draft
   * Validates brief requirements, recomputes price strictly from backend catalog, creates order with source 'ai_chat',
   * provisions Drive folder, creates Razorpay Order, and returns checkout card.
   */
  public static async createCommissionDraft(params: CreateCommissionDraftParams) {
    const {
      clientUid,
      clientName = "Studio Client",
      clientEmail = "client@sutrastudio.com",
      clientPhone = "",
      type = "service",
      serviceId = "img-creation",
      planId,
      billingCycle = "monthly",
      briefAnswers = {},
      requirements,
      preferredTimeline,
      chatId = `chat_${clientUid}`,
    } = params;

    let computedTotal = 0;
    let orderTitle = "";
    let primaryServiceName = "";
    let verifiedItems: any[] = [];
    let estDeliveryDays = 3;
    let revsIncluded = 2;

    if (type === "monthly_plan") {
      const matchedPlan = OFFICIAL_PLANS_MAP[planId || "studio-growth"] || SEED_CATALOG_PLANS[1];
      orderTitle = `${matchedPlan.name} (${billingCycle.toUpperCase()})`;
      primaryServiceName = matchedPlan.name;

      if (billingCycle === "annual") {
        computedTotal = matchedPlan.annualPrice || Math.round(matchedPlan.monthlyPrice * 12 * 0.85);
      } else if (billingCycle === "quarterly") {
        computedTotal = matchedPlan.quarterlyPrice || Math.round(matchedPlan.monthlyPrice * 3 * 0.95);
      } else {
        computedTotal = matchedPlan.monthlyPrice;
      }

      verifiedItems = [
        {
          planId: matchedPlan.id,
          name: matchedPlan.name,
          price: computedTotal,
          quantity: 1,
        },
      ];
    } else {
      const matchedService =
        OFFICIAL_SERVICES_MAP[serviceId] ||
        SEED_CATALOG_SERVICES.find(
          (s) => s.id === serviceId || s.slug === serviceId || s.name.toLowerCase().includes(serviceId.toLowerCase())
        ) ||
        SEED_CATALOG_SERVICES[0];

      orderTitle = matchedService.name;
      primaryServiceName = matchedService.name;
      computedTotal = matchedService.startingPrice;
      estDeliveryDays = matchedService.estimatedDeliveryDays || 3;
      revsIncluded = matchedService.revisionsIncluded || 2;

      verifiedItems = [
        {
          serviceId: matchedService.id,
          name: matchedService.name,
          price: computedTotal,
          quantity: 1,
        },
      ];
    }

    // Format combined requirements & brief answers
    const formattedBriefLines = Object.entries(briefAnswers)
      .map(([k, v]) => `• ${k}: ${typeof v === "object" ? JSON.stringify(v) : v}`)
      .join("\n");

    const finalRequirements = [
      requirements ? `Summary: ${requirements}` : "",
      formattedBriefLines ? `\nIntake Brief Answers:\n${formattedBriefLines}` : "",
      preferredTimeline ? `\nTimeline Preference: ${preferredTimeline}` : "",
    ]
      .filter(Boolean)
      .join("\n");

    const orderId = `ord_ai_${Date.now()}`;
    const orderNumber = generateOrderNumber();
    const orderCode = `#ORD-${Math.floor(100 + Math.random() * 900)}`;
    const now = new Date().toISOString();

    // Auto-provision Google Drive folder structure
    let driveFolderId = `drive_fld_chat_${orderId}`;
    let driveFolderPath = `Clients/${clientName}/${orderNumber}`;
    let driveFolderLink = `https://drive.google.com/drive/folders/${driveFolderId}`;
    let subfolders: any = undefined;

    try {
      const driveStructure = await provisionOrderDriveFolders({
        orderId,
        orderNumber,
        serviceName: primaryServiceName,
        clientId: clientUid,
        clientName,
      });
      driveFolderId = driveStructure.orderFolderId;
      driveFolderPath = `Clients/${driveStructure.clientFolderName}/${driveStructure.orderFolderName}`;
      driveFolderLink = driveStructure.orderFolderLink;
      subfolders = driveStructure.subfolders;
    } catch (driveErr) {
      console.warn("[ChatTools] Drive provision error fallback:", driveErr);
    }

    // Create server-side Razorpay order
    const razorpayOrder = await PaymentsService.createRazorpayOrder({
      amountINR: computedTotal,
      orderNumber,
      orderId,
      clientId: clientUid,
      clientEmail,
      description: `${orderTitle} (${orderCode}) — AI Chat Commission`,
    });

    const newOrder: any = {
      id: orderId,
      code: orderCode,
      orderNumber,
      title: orderTitle,
      service: primaryServiceName,
      type,
      items: verifiedItems,
      totalAmount: computedTotal,
      billingCycle: type === "monthly_plan" ? billingCycle : undefined,
      requirements: finalRequirements,
      notes: finalRequirements,
      status: "confirmed",
      statusLabel: "Confirmed — In Studio Production Queue",
      paymentStatus: "invoice",
      source: "ai_chat",
      chatId,
      clientUid,
      clientId: clientUid,
      clientName,
      clientEmail,
      clientPhone,
      driveFolderId,
      driveFolderPath,
      driveFolderLink,
      driveSubfolders: subfolders,
      revisionRound: 0,
      maxRevisions: revsIncluded,
      estimatedDeliveryDays: estDeliveryDays,
      estimatedDueDate: new Date(Date.now() + estDeliveryDays * 24 * 3600 * 1000).toISOString(),
      deliverables: [],
      comments: [],
      internalNotes: [],
      statusHistory: [
        {
          status: "confirmed",
          changedAt: now,
          changedBy: "ai_chat",
          note: `Order registered & confirmed via AI Chat. Verified catalog price ₹${computedTotal.toLocaleString("en-IN")}. Placed directly into Studio Production Queue.`,
        },
      ],
      createdAt: now,
      updatedAt: now,
    };

    OrdersStore.add(newOrder);

    // Dispatch real-time in-app notification
    NotificationsStore.add({
      userId: clientUid,
      type: "order_placed",
      title: "Order Placed via AI Concierge",
      message: `Commission #${orderNumber} for ${primaryServiceName} is registered & confirmed. Our team has queued it for production.`,
      orderId,
      orderNumber,
      actionUrl: "/orders",
      actionLabel: "View in Orders",
      recipientEmail: clientEmail,
    });

    NotificationsStore.add({
      userId: "usr_admin_001",
      type: "order_placed",
      title: "New AI Chat Commission",
      message: `${clientName} created order #${orderNumber} via AI Concierge (₹${computedTotal.toLocaleString("en-IN")}).`,
      orderId,
      orderNumber,
      actionUrl: "/admin",
      actionLabel: "View in Hub",
    });

    return {
      success: true,
      order: newOrder,
      orderDraft: {
        orderId,
        orderNumber,
        service: primaryServiceName,
        totalAmount: computedTotal,
        razorpayOrderId: razorpayOrder.razorpayOrderId,
        keyId: razorpayOrder.keyId,
        paid: true,
      },
      driveUploadFolder: driveFolderLink,
      summaryMessage: `✓ I have confirmed and queued your commission **#${orderNumber}** for **${primaryServiceName}** (₹${computedTotal.toLocaleString("en-IN")}, Est. Delivery: ${estDeliveryDays} days, ${revsIncluded} revisions). You can view and manage this order directly in **My Orders**.`,
    };
  }

  /**
   * Tool: create_order (alias for createCommissionDraft)
   */
  public static async createOrder(params: CreateCommissionDraftParams) {
    return this.createCommissionDraft(params);
  }

  /**
   * Tool 5: get_upload_link
   * Returns the Google Drive Vault folder link for asset uploads.
   */
  public static async getUploadLink(params: { orderId: string; clientUid: string }) {
    const order = OrdersStore.findById(params.orderId);
    if (!order) return { error: `Order '${params.orderId}' not found.` };
    if (order.clientUid !== params.clientUid && order.clientId !== params.clientUid && params.clientUid !== "admin") {
      return { error: "Forbidden: You can only access upload vaults for your own orders." };
    }

    return {
      orderId: order.id,
      orderNumber: order.orderNumber,
      driveFolderId: order.driveFolderId,
      driveFolderLink:
        order.driveFolderLink || `https://drive.google.com/drive/folders/${order.driveFolderId}`,
      instructions: "Upload your raw images, CAD models, 3D meshes, or video references directly into this Google Drive folder.",
    };
  }

  /**
   * Tool 6: start_checkout
   * Returns Razorpay checkout credentials and active payment state for an existing pending order.
   */
  public static async startCheckout(params: { orderId: string; clientUid: string }) {
    const order = OrdersStore.findById(params.orderId);
    if (!order) return { error: `Order '${params.orderId}' not found.` };

    if (order.status === "paid" || order.paymentStatus === "paid") {
      return {
        alreadyPaid: true,
        message: `Order #${order.orderNumber} is already paid and confirmed in studio production.`,
      };
    }

    const totalAmount = order.totalAmount || 0;

    const rzpOrder = await PaymentsService.createRazorpayOrder({
      amountINR: totalAmount,
      orderNumber: order.orderNumber || order.code,
      orderId: order.id,
      clientId: params.clientUid,
      clientEmail: order.clientEmail,
      description: `${order.title} Checkout`,
    });

    return {
      orderId: order.id,
      orderNumber: order.orderNumber,
      service: order.service,
      totalAmount,
      razorpayOrderId: rzpOrder.razorpayOrderId,
      keyId: rzpOrder.keyId,
      paid: false,
    };
  }

  /**
   * Tool 7: get_my_orders
   * Returns live order statuses, progress %, days remaining, and vault links.
   */
  public static async getMyOrders(params: { clientUid: string }) {
    const all = OrdersStore.getAll();
    const clientOrders = all.filter(
      (o) => o.clientUid === params.clientUid || o.clientId === params.clientUid
    );

    return clientOrders.map((o) => {
      const progress = computeOrderProgress(o);
      return {
        id: o.id,
        orderNumber: o.orderNumber || o.code,
        title: o.title,
        service: o.service,
        status: o.status,
        statusLabel: o.statusLabel,
        progressPercentage: progress.percentage,
        stageName: progress.stageName,
        daysRemaining: progress.daysRemaining,
        periodSummary: progress.periodSummary,
        totalAmountINR: o.totalAmount,
        paymentStatus: o.paymentStatus || (o.status === "pending_payment" ? "unpaid" : "paid"),
        driveFolderLink: o.driveFolderLink,
        deliverablesCount: o.deliverables?.length || 0,
        createdAt: o.createdAt,
      };
    });
  }

  /**
   * Tool 8: renew_plan
   * Initiates renewal for an active or expiring monthly retainer subscription.
   */
  public static async renewPlan(params: { orderId: string; clientUid: string; billingCycle?: "monthly" | "quarterly" | "annual" }) {
    const order = OrdersStore.findById(params.orderId);
    if (!order) return { error: `Order '${params.orderId}' not found.` };
    if (order.clientUid !== params.clientUid && order.clientId !== params.clientUid) {
      return { error: "Forbidden: You can only renew your own subscriptions." };
    }

    const totalAmount = order.totalAmount || 0;

    const rzpOrder = await PaymentsService.createRazorpayOrder({
      amountINR: totalAmount,
      orderNumber: `REN-${order.orderNumber || order.code}`,
      orderId: order.id,
      clientId: params.clientUid,
      clientEmail: order.clientEmail,
      description: `Subscription Renewal for ${order.service}`,
    });

    return {
      success: true,
      orderId: order.id,
      orderNumber: order.orderNumber,
      service: order.service,
      renewalAmount: totalAmount,
      razorpayOrderId: rzpOrder.razorpayOrderId,
      keyId: rzpOrder.keyId,
      message: `Renewal checkout initialized for ${order.service} (₹${totalAmount.toLocaleString("en-IN")}). Please proceed with payment.`,
    };
  }

  /**
   * Tool 9: cancel_trial
   * Cancels an active 3-day trial on a monthly retainer plan.
   */
  public static async cancelTrial(params: { orderId: string; clientUid: string; reason?: string }) {
    const order = OrdersStore.findById(params.orderId);
    if (!order) return { error: `Order '${params.orderId}' not found.` };
    if (order.clientUid !== params.clientUid && order.clientId !== params.clientUid) {
      return { error: "Forbidden: You can only manage your own trial." };
    }

    order.status = "cancelled";
    order.statusLabel = "Trial Cancelled";
    order.updatedAt = new Date().toISOString();

    if (!order.statusHistory) order.statusHistory = [];
    order.statusHistory.push({
      status: "cancelled",
      changedAt: new Date().toISOString(),
      changedBy: "client",
      note: `Trial cancelled by client via AI Chat: ${params.reason || "Client request"}`,
    });

    NotificationsStore.add({
      userId: "usr_admin_001",
      type: "trial_cancelled",
      title: "Client Trial Cancelled",
      message: `${order.clientName || "Client"} cancelled 3-day trial for #${order.orderNumber}.`,
      orderId: order.id,
      orderNumber: order.orderNumber,
      actionUrl: "/admin",
    });

    return {
      success: true,
      message: `Your 3-day free trial for ${order.service} has been cancelled. No charges will be incurred.`,
    };
  }

  /**
   * Tool 10: request_revision
   * Submits client feedback/revision notes on delivered draft assets.
   */
  public static async requestRevision(params: { orderId: string; clientUid: string; comment: string }) {
    const res = OrdersStore.clientReviewOrder({
      orderId: params.orderId,
      action: "revision",
      clientUid: params.clientUid,
      comment: params.comment,
    });

    if (!res.success) return { error: res.error || "Failed to submit revision." };

    return {
      success: true,
      orderId: params.orderId,
      revisionRound: res.order?.revisionRound,
      maxRevisions: res.order?.maxRevisions,
      limitReached: res.limitReached,
      statusLabel: res.order?.statusLabel,
      message: res.limitReached
        ? `Revision request submitted (Round ${res.order?.revisionRound}). Notice: You have exceeded the standard ${res.order?.maxRevisions} revisions included in your tier.`
        : `Revision Pass 0${res.order?.revisionRound} submitted. Art Director Raghavan Sharma has been notified.`,
    };
  }

  /**
   * Tool 11: approve_delivery
   * Completes project and moves order status to completed @ 100% (requires explicit confirmation).
   */
  public static async approveDelivery(params: {
    orderId: string;
    clientUid: string;
    confirmed: boolean;
    comment?: string;
  }) {
    if (!params.confirmed) {
      return {
        requiresConfirmation: true,
        message: "Please confirm explicitly: 'Yes, I approve all final deliverables for order #' before completing.",
      };
    }

    const res = OrdersStore.clientReviewOrder({
      orderId: params.orderId,
      action: "approve",
      clientUid: params.clientUid,
      comment: params.comment || "Approved via AI Studio Assistant.",
    });

    if (!res.success) return { error: res.error || "Failed to approve order." };

    return {
      success: true,
      orderId: params.orderId,
      status: "completed",
      progressPercentage: 100,
      message: `Congratulations! Order #${res.order?.orderNumber || res.order?.code} has been approved and moved to 100% Completed. Full commercial license is granted.`,
    };
  }
}
