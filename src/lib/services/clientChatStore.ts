import fs from "node:fs";
import path from "node:path";
import { isFirebaseAdminReady, adminDb } from "@/lib/firebase/admin";
import type { FirestoreOrderRecord } from "@/app/api/orders/route";

export interface ClientChatMessage {
  id: string;
  clientId: string;
  clientKey: string; // Normalized email, phone, or clientUid
  clientEmail?: string;
  clientName?: string;
  clientPhone?: string;
  sender: "client" | "assistant" | "studio" | "system";
  text: string;
  attachments?: Array<{ name: string; url?: string; type?: string }>;
  timestamp: string;
  channel?: "ai_chat" | "web_concierge" | "whatsapp" | "order_brief";
  orderDraft?: any;
  intent?: string;
}

export interface ClientConversationSummary {
  clientKey: string;
  clientId?: string;
  clientName: string;
  clientEmail: string;
  clientPhone?: string;
  totalMessages: number;
  lastMessageAt: string;
  lastMessageSnippet: string;
  lastSender: "client" | "assistant" | "studio" | "system";
  messages: ClientChatMessage[];
}

const DATA_DIR = path.resolve(process.cwd(), "data");
const CHATS_FILE = path.resolve(DATA_DIR, "sutra_client_chats.json");

function ensureDataDir(): void {
  try {
    if (typeof window === "undefined" && !fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  } catch (err) {
    console.warn("[ClientChatStore] Error creating data directory:", err);
  }
}

function normalizeKey(email?: string, phone?: string, uid?: string): string {
  if (email && email.trim()) return email.trim().toLowerCase();
  if (phone && phone.trim()) return phone.trim().replace(/[^0-9+]/g, "");
  if (uid && uid.trim()) return uid.trim().toLowerCase();
  return "guest_visitor";
}

function loadChatsFromDisk(): ClientChatMessage[] {
  try {
    if (typeof window !== "undefined") return [];
    ensureDataDir();
    if (fs.existsSync(CHATS_FILE)) {
      const raw = fs.readFileSync(CHATS_FILE, "utf8");
      if (raw && raw.trim().length > 0) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      }
    }
  } catch (err) {
    console.warn("[ClientChatStore] Error loading chats from disk:", err);
  }
  return [];
}

function saveChatsToDisk(chats: ClientChatMessage[]): void {
  try {
    if (typeof window !== "undefined") return;
    ensureDataDir();
    fs.writeFileSync(CHATS_FILE, JSON.stringify(chats, null, 2), "utf8");
  } catch (err) {
    console.warn("[ClientChatStore] Error saving chats to disk:", err);
  }
}

// In-memory cache attached to globalThis
const globalAny = globalThis as any;
if (!globalAny.__SUTRA_CLIENT_CHATS__) {
  globalAny.__SUTRA_CLIENT_CHATS__ = loadChatsFromDisk();
}

export class ClientChatStore {
  /**
   * Appends a new chat message to both disk memory and Firestore
   */
  public static async addMessage(
    payload: Omit<ClientChatMessage, "id" | "timestamp" | "clientKey"> & {
      id?: string;
      timestamp?: string;
      clientKey?: string;
    }
  ): Promise<ClientChatMessage> {
    const timestamp = payload.timestamp || new Date().toISOString();
    const id = payload.id || `chat_msg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const clientKey =
      payload.clientKey || normalizeKey(payload.clientEmail, payload.clientPhone, payload.clientId);

    const message: ClientChatMessage = {
      id,
      clientId: payload.clientId || "client_visitor",
      clientKey,
      clientEmail: payload.clientEmail,
      clientName: payload.clientName || "Studio Client",
      clientPhone: payload.clientPhone,
      sender: payload.sender,
      text: payload.text,
      attachments: payload.attachments,
      timestamp,
      channel: payload.channel || "ai_chat",
      orderDraft: payload.orderDraft,
      intent: payload.intent,
    };

    if (!globalAny.__SUTRA_CLIENT_CHATS__) {
      globalAny.__SUTRA_CLIENT_CHATS__ = [];
    }

    globalAny.__SUTRA_CLIENT_CHATS__.push(message);
    saveChatsToDisk(globalAny.__SUTRA_CLIENT_CHATS__);

    // Optional Firestore sync in background
    if (isFirebaseAdminReady()) {
      try {
        await adminDb().collection("client_chats").doc(id).set(message);
      } catch (err: any) {
        console.warn("[ClientChatStore] Firestore save warning:", err?.message || err);
      }
    }

    return message;
  }

  /**
   * Retrieves all chat messages for a specific client key
   */
  public static getMessagesForClient(clientKey: string): ClientChatMessage[] {
    const norm = clientKey.trim().toLowerCase();
    const all: ClientChatMessage[] = globalAny.__SUTRA_CLIENT_CHATS__ || [];
    return all.filter((m) => m.clientKey.toLowerCase() === norm || (m.clientEmail && m.clientEmail.toLowerCase() === norm));
  }

  /**
   * Returns conversation threads grouped by client, integrating order briefs if passed
   */
  public static getAllConversations(orders: FirestoreOrderRecord[] = []): ClientConversationSummary[] {
    const diskChats: ClientChatMessage[] = globalAny.__SUTRA_CLIENT_CHATS__ || loadChatsFromDisk();
    const map = new Map<string, ClientConversationSummary>();

    // 1. Process explicit chat messages
    for (const msg of diskChats) {
      const key = msg.clientKey || normalizeKey(msg.clientEmail, msg.clientPhone, msg.clientId);
      let conv = map.get(key);
      if (!conv) {
        conv = {
          clientKey: key,
          clientId: msg.clientId,
          clientName: msg.clientName || "Studio Client",
          clientEmail: msg.clientEmail || key,
          clientPhone: msg.clientPhone,
          totalMessages: 0,
          lastMessageAt: msg.timestamp,
          lastMessageSnippet: msg.text,
          lastSender: msg.sender,
          messages: [],
        };
        map.set(key, conv);
      }

      conv.messages.push(msg);
      conv.totalMessages += 1;
      if (new Date(msg.timestamp) > new Date(conv.lastMessageAt)) {
        conv.lastMessageAt = msg.timestamp;
        conv.lastMessageSnippet = msg.text;
        conv.lastSender = msg.sender;
      }
      if (msg.clientName && conv.clientName === "Studio Client") conv.clientName = msg.clientName;
      if (msg.clientPhone && !conv.clientPhone) conv.clientPhone = msg.clientPhone;
      if (msg.clientEmail && !conv.clientEmail.includes("@")) conv.clientEmail = msg.clientEmail;
    }

    // 2. Synthesize communications from actual client orders
    for (const ord of orders) {
      const key = normalizeKey(ord.clientEmail, ord.clientPhone, ord.clientUid || ord.clientId);
      let conv = map.get(key);
      if (!conv) {
        conv = {
          clientKey: key,
          clientId: ord.clientUid || ord.clientId,
          clientName: ord.clientName || "Studio Client",
          clientEmail: ord.clientEmail || key,
          clientPhone: ord.clientPhone,
          totalMessages: 0,
          lastMessageAt: ord.createdAt || new Date().toISOString(),
          lastMessageSnippet: `Order #${ord.orderNumber || ord.code} initiated (${ord.service || ord.title})`,
          lastSender: "client",
          messages: [],
        };
        map.set(key, conv);
      }

      // Add order conversation history if present
      if (Array.isArray(ord.conversationHistory)) {
        for (const ch of ord.conversationHistory) {
          const exists = conv.messages.some((m) => m.id === ch.id || (m.timestamp === ch.timestamp && m.text === ch.text));
          if (!exists) {
            const synthesized: ClientChatMessage = {
              id: ch.id || `ord_msg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
              clientId: ord.clientUid || ord.clientId || key,
              clientKey: key,
              clientEmail: ord.clientEmail,
              clientName: ch.authorName || ord.clientName || "Studio Client",
              clientPhone: ord.clientPhone,
              sender: ch.sender === "studio" || ch.sender === "assistant" ? "assistant" : "client",
              text: ch.text,
              timestamp: ch.timestamp || ord.createdAt,
              channel: "order_brief",
            };
            conv.messages.push(synthesized);
            conv.totalMessages += 1;
          }
        }
      }

      // Ensure requirements brief is in the thread if not already represented
      if (ord.requirements && typeof ord.requirements === "string" && ord.requirements.trim().length > 0) {
        const reqSnippet = ord.requirements.startsWith("{") ? "Commission specifications & package features submitted." : ord.requirements;
        const exists = conv.messages.some((m) => m.text.includes(reqSnippet));
        if (!exists) {
          conv.messages.push({
            id: `req_${ord.id}`,
            clientId: ord.clientUid || ord.clientId || key,
            clientKey: key,
            clientEmail: ord.clientEmail,
            clientName: ord.clientName || "Studio Client",
            clientPhone: ord.clientPhone,
            sender: "client",
            text: `[Order #${ord.orderNumber || ord.code} Brief] ${reqSnippet}`,
            timestamp: ord.createdAt,
            channel: "order_brief",
          });
          conv.totalMessages += 1;
        }
      }

      // Update metadata
      if (ord.clientName && conv.clientName === "Studio Client") conv.clientName = ord.clientName;
      if (ord.clientPhone && !conv.clientPhone) conv.clientPhone = ord.clientPhone;
      if (ord.clientEmail && !conv.clientEmail.includes("@")) conv.clientEmail = ord.clientEmail;
    }

    // Sort messages chronologically in each thread
    for (const conv of map.values()) {
      conv.messages.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
      if (conv.messages.length > 0) {
        const last = conv.messages[conv.messages.length - 1];
        conv.lastMessageAt = last.timestamp;
        conv.lastMessageSnippet = last.text;
        conv.lastSender = last.sender;
      }
    }

    // Sort conversation threads by most recent activity
    const list = Array.from(map.values());
    list.sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime());
    return list;
  }
}
