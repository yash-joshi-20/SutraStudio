/**
 * SUTRA STUDIO — Core Database Data Models & Migration Layer
 * Canonical TypeScript definitions for Firestore collections:
 * services, plans, orders, chats (and messages subcollection).
 * Fully backward-compatible with legacy fields (clientUid, driveFolderId, etc.)
 */

// ============================================================================
// 1. SERVICES
// ============================================================================

export interface ServiceDocument {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string; // e.g. "INR", "₹", "USD"
  active: boolean;
  order: number; // sort index
  sortIndex?: number; // alias for consistency

  // Backward compatibility fields
  slug?: string;
  category?: "Creative" | "Design" | "Development" | "Marketing" | "Automation" | string;
  tagline?: string;
  deliverables?: string[];
  startingPrice?: string;
  icon?: string;
  thumbnail?: string;
  badge?: string;
  mediaType?: "image" | "video" | "3d" | "360" | "interactive" | "code" | string;
  mediaFormat?: string;
  turnaround?: string;
  pipelineEngine?: string;
  workflow?: string;
  createdAt?: string;
  updatedAt?: string;
}

// ============================================================================
// 2. PLANS (MONTHLY PLANS)
// ============================================================================

export interface PlanIncludedService {
  serviceId: string;
  serviceName: string;
  allowance?: number; // e.g. 5 renders
  unit?: string; // e.g. "Renders", "Reels", "Models"
}

export interface PlanDocument {
  id: string;
  name: string;
  description: string;
  monthlyPrice: number; // In currency units (e.g. 5999)
  features: string[];
  includedServices?: PlanIncludedService[];
  active: boolean;
  sortIndex: number;
  order?: number; // alias for sortIndex

  // Backward compatibility fields
  currency?: string;
  priceMonthlyINR?: number;
  priceFormattedINR?: string;
  tagline?: string;
  quotas?: Array<{
    serviceId: string;
    serviceName: string;
    monthlyAllowance: number;
    unitLabel: string;
  }>;
  isPopular?: boolean;
  ctaLabel?: string;
  createdAt?: string;
  updatedAt?: string;
}

// ============================================================================
// 3. ORDERS
// ============================================================================

export type OrderType = "service" | "monthly_plan";

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "in_progress"
  | "completed"
  | "cancelled"
  // Legacy / UI mapping aliases
  | "awaiting_approval"
  | "revision_requested";

export type OrderSource = "dashboard" | "ai_chat";

export interface OrderItemDetail {
  serviceId?: string;
  planId?: string;
  name: string;
  price: number;
  quantity: number;
}

export interface OrderAttachment {
  name: string;
  url?: string;
  driveFileId?: string;
  size?: string;
  fileSize?: string;
  mimeType?: string;
  checksum?: string;
  uploadedAt?: string;
}

export interface OrderStatusHistoryItem {
  status: OrderStatus | string;
  changedAt: string;
  changedBy: string; // "client" | "admin" | "system" | user ID
  note?: string;
}

export interface OrderDocument {
  id: string;
  orderNumber: string; // Human-friendly, e.g. "ORD-2026-001" or "#ORD-001"
  clientId: string;
  clientName: string;
  clientEmail: string;
  clientPhone?: string;
  type: OrderType;
  items: OrderItemDetail[];
  totalAmount: number;
  billingCycle?: "monthly" | "yearly"; // Applicable for plans
  requirements?: string; // Client brief / instructions
  attachments?: OrderAttachment[];
  status: OrderStatus;
  source: OrderSource;
  chatId?: string; // If placed via AI chat
  createdAt: string;
  updatedAt: string;
  statusHistory: OrderStatusHistoryItem[];

  // Backward compatibility fields
  clientUid?: string; // Legacy alias for clientId
  code?: string; // Legacy alias for orderNumber
  title?: string;
  service?: string; // Legacy single service name
  notes?: string; // Legacy alias for requirements
  driveFolderId?: string;
  driveFolderPath?: string;
  revisionRound?: number;
  maxRevisions?: number;
  deliverables?: Array<{
    driveFileId: string;
    filename: string;
    checksum: string;
    fileSize: string;
    mimeType: string;
    previewUrl?: string;
  }>;
}

// ============================================================================
// 4. CHATS & MESSAGES
// ============================================================================

export type ChatStatus = "active" | "archived" | "closed";

export interface ChatDocument {
  id: string;
  clientId: string;
  clientName: string;
  lastMessage: string;
  lastMessageAt: string; // ISO 8601 string
  unreadByAdmin: boolean;
  status: ChatStatus;
  linkedOrderIds?: string[];

  // Backward compatibility fields
  company?: string;
  vaultId?: string;
  mode?: "ai" | "human";
  lastPrompt?: string;
  workflowTag?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type ChatMessageRole = "client" | "ai" | "admin";

export interface ChatMessageMetadata {
  toolActions?: Array<{ tool: string; input?: any; result?: any; status: string }>;
  orderCreated?: boolean;
  orderId?: string;
  orderNumber?: string;
  rating?: number; // 1-5 rating if client reviewed response
  confidence?: number; // e.g. 0.94
  workflowTriggered?: string;
  codeSnippet?: string;
  attachment?: {
    name: string;
    size: string;
    url?: string;
    driveFileId?: string;
  };
  [key: string]: any;
}

export interface ChatMessageDocument {
  id?: string;
  role: ChatMessageRole;
  text: string;
  createdAt: string;
  metadata?: ChatMessageMetadata;

  // Backward compatibility fields
  sender?: string; // Legacy alias for role
  time?: string;
}

// ============================================================================
// 5. SAFE NORMALIZERS & MIGRATION HELPERS
// ============================================================================

/**
 * Generates human-friendly sequential order number
 */
export function generateOrderNumber(sequenceNumber?: number): string {
  const year = new Date().getFullYear();
  const seq = sequenceNumber !== undefined 
    ? String(sequenceNumber).padStart(4, "0") 
    : String(Math.floor(1000 + Math.random() * 9000));
  return `ORD-${year}-${seq}`;
}

/**
 * Normalizes any legacy or modern order document into the canonical OrderDocument
 */
export function normalizeOrder(raw: any): OrderDocument {
  if (!raw) throw new Error("Order document payload is null or undefined");

  const id = raw.id || `ord_${Date.now()}`;
  const orderNumber = raw.orderNumber || raw.code || generateOrderNumber();
  const clientId = raw.clientId || raw.clientUid || "usr_client_default";
  const clientName = raw.clientName || "Studio Client";
  const clientEmail = raw.clientEmail || raw.email || "";
  const clientPhone = raw.clientPhone || raw.phone || "";

  const type: OrderType = raw.type === "monthly_plan" ? "monthly_plan" : "service";

  // Normalize items array
  let items: OrderItemDetail[] = [];
  if (Array.isArray(raw.items) && raw.items.length > 0) {
    items = raw.items.map((i: any) => ({
      serviceId: i.serviceId || i.id,
      planId: i.planId,
      name: i.name || raw.service || raw.title || "Studio Deliverable",
      price: typeof i.price === "number" ? i.price : Number(i.price) || 0,
      quantity: typeof i.quantity === "number" ? i.quantity : 1,
    }));
  } else {
    items = [
      {
        serviceId: raw.serviceId,
        name: raw.service || raw.title || "Custom Studio Service",
        price: typeof raw.totalAmount === "number" ? raw.totalAmount : 0,
        quantity: 1,
      },
    ];
  }

  const totalAmount = typeof raw.totalAmount === "number" 
    ? raw.totalAmount 
    : items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  // Normalize status
  let status: OrderStatus = "pending";
  if (["pending", "confirmed", "in_progress", "completed", "cancelled"].includes(raw.status)) {
    status = raw.status;
  } else if (raw.status === "awaiting_approval") {
    status = "in_progress";
  } else if (raw.status === "revision_requested") {
    status = "in_progress";
  }

  const now = new Date().toISOString();
  const createdAt = raw.createdAt || now;
  const updatedAt = raw.updatedAt || now;

  const statusHistory: OrderStatusHistoryItem[] = Array.isArray(raw.statusHistory) && raw.statusHistory.length > 0
    ? raw.statusHistory
    : [{ status, changedAt: createdAt, changedBy: raw.source || "system" }];

  return {
    id,
    orderNumber,
    clientId,
    clientName,
    clientEmail,
    clientPhone,
    type,
    items,
    totalAmount,
    billingCycle: raw.billingCycle || (type === "monthly_plan" ? "monthly" : undefined),
    requirements: raw.requirements || raw.notes || "",
    attachments: raw.attachments || [],
    status,
    source: raw.source === "ai_chat" ? "ai_chat" : "dashboard",
    chatId: raw.chatId,
    createdAt,
    updatedAt,
    statusHistory,

    // Legacy fields preserved
    clientUid: clientId,
    code: orderNumber,
    title: raw.title || (items[0]?.name ?? "Commission"),
    service: raw.service || (items[0]?.name ?? "Creative Service"),
    notes: raw.notes || raw.requirements || "",
    driveFolderId: raw.driveFolderId || "drive_fld_sutra_001",
    driveFolderPath: raw.driveFolderPath || "drive_fld_sutra_001/COMMISSIONS",
    revisionRound: raw.revisionRound ?? 0,
    maxRevisions: raw.maxRevisions ?? 2,
    deliverables: raw.deliverables || [],
  };
}

/**
 * Normalizes service document
 */
export function normalizeService(raw: any, index = 0): ServiceDocument {
  const priceNum = typeof raw.price === "number" 
    ? raw.price 
    : typeof raw.startingPrice === "string" 
    ? Number(raw.startingPrice.replace(/[^0-9]/g, "")) || 5499
    : 5499;

  return {
    id: raw.id || `srv_${raw.slug || index}`,
    name: raw.name || "Creative Pillar",
    description: raw.description || raw.tagline || "",
    price: priceNum,
    currency: raw.currency || "INR",
    active: raw.active !== undefined ? Boolean(raw.active) : true,
    order: raw.order ?? raw.sortIndex ?? index,
    sortIndex: raw.sortIndex ?? raw.order ?? index,

    // Preserved backward compatibility fields
    slug: raw.slug,
    category: raw.category,
    tagline: raw.tagline,
    startingPrice: raw.startingPrice || `₹${priceNum.toLocaleString("en-IN")}`,
    deliverables: raw.deliverables || [],
    icon: raw.icon,
    thumbnail: raw.thumbnail,
    badge: raw.badge,
    mediaType: raw.mediaType,
    mediaFormat: raw.mediaFormat,
    turnaround: raw.turnaround,
    pipelineEngine: raw.pipelineEngine,
    workflow: raw.workflow,
  };
}

/**
 * Normalizes monthly plan document
 */
export function normalizePlan(raw: any, index = 0): PlanDocument {
  const monthlyPrice = typeof raw.monthlyPrice === "number"
    ? raw.monthlyPrice
    : typeof raw.priceMonthlyINR === "number"
    ? raw.priceMonthlyINR
    : typeof raw.price === "number"
    ? raw.price
    : 5999;

  return {
    id: raw.id || `plan_${index}`,
    name: raw.name || "Creative Studio Plan",
    description: raw.description || raw.tagline || "",
    monthlyPrice,
    features: Array.isArray(raw.features) ? raw.features : [],
    includedServices: raw.includedServices || (raw.quotas?.map((q: any) => ({
      serviceId: q.serviceId,
      serviceName: q.serviceName,
      allowance: q.monthlyAllowance,
      unit: q.unitLabel,
    })) ?? []),
    active: raw.active !== undefined ? Boolean(raw.active) : true,
    sortIndex: raw.sortIndex ?? raw.order ?? index,
    order: raw.order ?? raw.sortIndex ?? index,

    // Preserved backward compatibility fields
    currency: raw.currency || "INR",
    priceMonthlyINR: monthlyPrice,
    priceFormattedINR: raw.priceFormattedINR || `₹${monthlyPrice.toLocaleString("en-IN")}`,
    tagline: raw.tagline,
    quotas: raw.quotas,
    isPopular: raw.isPopular,
    ctaLabel: raw.ctaLabel,
  };
}

/**
 * Normalizes chat document
 */
export function normalizeChat(raw: any): ChatDocument {
  const now = new Date().toISOString();
  return {
    id: raw.id || `chat_${raw.clientId || Date.now()}`,
    clientId: raw.clientId || raw.clientUid || "usr_client_default",
    clientName: raw.clientName || "Studio Client",
    lastMessage: raw.lastMessage || raw.lastPrompt || "Conversation opened",
    lastMessageAt: raw.lastMessageAt || raw.lastTime || now,
    unreadByAdmin: raw.unreadByAdmin !== undefined ? Boolean(raw.unreadByAdmin) : false,
    status: raw.status || "active",
    linkedOrderIds: Array.isArray(raw.linkedOrderIds) ? raw.linkedOrderIds : [],

    // Legacy fields
    company: raw.company,
    vaultId: raw.vaultId || raw.driveFolderId,
    mode: raw.mode || "ai",
    lastPrompt: raw.lastPrompt,
    workflowTag: raw.workflowTag,
  };
}
