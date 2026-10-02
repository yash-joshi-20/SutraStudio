"use server";
import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebase/admin";
import { assertStaff } from "@/lib/auth/session";
import { writeAudit } from "@/lib/audit";
import { generateText } from "@/lib/ai/llm";
import { retrieve, type Retrieved } from "@/lib/rag/retrieve";
import { buildDraftPrompt } from "@/lib/rag/prompt";
import { getCatalogText } from "@/lib/rag/catalog";

type Result = { ok: true } | { ok: false; message: string };
const ID = /^[A-Za-z0-9]{10,40}$/;
const conv = (id: string) => adminDb().collection("conversations").doc(id);

type Conv = { clientId: string; mode?: "ai" | "human"; takenOverBy?: string | null };

async function loadConversation(id: string): Promise<Conv | null> {
  if (!ID.test(id)) return null;
  const snap = await conv(id).get();
  return snap.exists ? (snap.data() as Conv) : null;
}

/** Staff takes over: the AI stops replying in this chat until it is handed back. */
export async function takeOver(conversationId: string): Promise<Result> {
  const staff = await assertStaff("chat.manage");
  const c = await loadConversation(conversationId);
  if (!c) return { ok: false, message: "Conversation not found." };
  if (c.mode === "human" && c.takenOverBy && c.takenOverBy !== staff.uid && staff.role !== "superAdmin") {
    return { ok: false, message: "Another team member already has this chat." };
  }
  await conv(conversationId).update({ mode: "human", takenOverBy: staff.uid, needsHuman: false, updatedAt: FieldValue.serverTimestamp() });
  await conv(conversationId).collection("messages").add({ role: "system", kind: "team_joined", content: "A team member has joined the chat.", createdAt: FieldValue.serverTimestamp() });
  await writeAudit({ actorId: staff.uid, actorEmail: staff.email, action: "chat.takeover", targetType: "conversation", targetId: conversationId });
  return { ok: true };
}

/** Staff sends a message. Allowed only while this person has the chat. Shown to the client as "Sutra Studio team". */
export async function sendStaffMessage(conversationId: string, text: string): Promise<Result> {
  const staff = await assertStaff("chat.manage");
  const content = text.trim();
  if (!content || content.length > 4000) return { ok: false, message: "Write a message of up to 4,000 characters." };
  const c = await loadConversation(conversationId);
  if (!c) return { ok: false, message: "Conversation not found." };
  if (c.mode !== "human" || c.takenOverBy !== staff.uid) return { ok: false, message: "Take over the chat before replying." };
  await conv(conversationId).collection("messages").add({ role: "staff", author: "team", staffId: staff.uid, content, createdAt: FieldValue.serverTimestamp() });
  await conv(conversationId).update({ lastMessageAt: FieldValue.serverTimestamp(), lastMessagePreview: content.slice(0, 120), updatedAt: FieldValue.serverTimestamp() });
  return { ok: true };
}

/** Gives the chat back to Sutra AI. */
export async function handBack(conversationId: string): Promise<Result> {
  const staff = await assertStaff("chat.manage");
  const c = await loadConversation(conversationId);
  if (!c) return { ok: false, message: "Conversation not found." };
  if (c.takenOverBy && c.takenOverBy !== staff.uid && staff.role !== "superAdmin") return { ok: false, message: "Only the team member who took over can hand it back." };
  await conv(conversationId).update({ mode: "ai", takenOverBy: null, updatedAt: FieldValue.serverTimestamp() });
  await conv(conversationId).collection("messages").add({ role: "system", kind: "handed_back", content: "Sutra AI is back in the chat.", createdAt: FieldValue.serverTimestamp() });
  await writeAudit({ actorId: staff.uid, actorEmail: staff.email, action: "chat.handback", targetType: "conversation", targetId: conversationId });
  return { ok: true };
}

/** 1-click suggested reply. Returns text for the staff member to edit and send. It is never sent automatically. */
export async function suggestDraft(conversationId: string): Promise<{ ok: true; draft: string } | { ok: false; message: string }> {
  await assertStaff("chat.manage");
  const c = await loadConversation(conversationId);
  if (!c) return { ok: false, message: "Conversation not found." };

  const snap = await conv(conversationId).collection("messages").orderBy("createdAt", "desc").limit(12).get();
  const rows = snap.docs.reverse().map((d) => d.data() as { role: string; content: string }).filter((m) => m.role !== "system" && m.content);
  const lastClient = [...rows].reverse().find((m) => m.role === "user")?.content;
  if (!lastClient) return { ok: false, message: "No client message to reply to yet." };

  let context: Retrieved[] = [];
  try {
    context = await retrieve(c.clientId, lastClient);
  } catch (e) {
    console.error("[draft] retrieval failed", e);
  }
  const transcript = rows.map((m) => `${m.role === "user" ? "Client" : m.role === "staff" ? "Team" : "Sutra AI"}: ${m.content}`).join("\n");
  const draft = await generateText({
    system: buildDraftPrompt({ catalog: await getCatalogText(), context, today: new Date().toDateString() }),
    messages: [{ role: "user", content: `Chat so far:\n${transcript}\n\nWrite the team's next reply to the client.` }],
    maxTokens: 600,
  });
  return draft ? { ok: true, draft } : { ok: false, message: "Couldn't write a draft. Try again." };
}
