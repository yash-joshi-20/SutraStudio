import { NextResponse } from "next/server";
import { KnowledgeRecord } from "@/lib/types/knowledge";
import { assertUserSession } from "@/lib/auth/requestRole";
import { getAuthenticatedUser } from "@/lib/auth/serverAuth";

declare global {
  var __sutra_knowledge_base: KnowledgeRecord[] | undefined;
}

const kbStore = globalThis.__sutra_knowledge_base || (globalThis.__sutra_knowledge_base = []);

export async function GET(req: Request) {
  const user = await getAuthenticatedUser(req);
  const url = new URL(req.url);
  const clientId = url.searchParams.get("client_id");
  const category = url.searchParams.get("category");
  const approvedOnly = url.searchParams.get("approved") === "true";
  const publishedOnly = url.searchParams.get("published") === "true";

  let filtered = [...kbStore];

  // Access control scoping:
  // If not admin, user can only see published/approved records OR their own records
  if (!user.isAdmin) {
    filtered = filtered.filter(
      (k) => (k.published && k.status === "approved") || (user.isAuthenticated && k.client_id === user.uid)
    );
  }

  if (clientId) {
    filtered = filtered.filter((k) => k.client_id === clientId);
  }

  if (category) {
    filtered = filtered.filter((k) => k.category.toLowerCase() === category.toLowerCase());
  }

  if (approvedOnly) {
    filtered = filtered.filter((k) => k.status === "approved");
  }

  if (publishedOnly) {
    filtered = filtered.filter((k) => k.published === true);
  }

  return NextResponse.json({
    knowledge: filtered,
    total: filtered.length,
    approvedCount: kbStore.filter((k) => k.status === "approved" && k.published).length,
  });
}

export async function POST(req: Request) {
  try {
    const auth = await assertUserSession(req);
    if (!auth.ok) return auth.response;

    const body = await req.json();
    const now = new Date().toISOString();
    const clientId = auth.user.role === "admin" ? (body.client_id || "client_default") : auth.user.uid;
    const isApproved = auth.user.role === "admin" && body.status === "approved";

    const record: KnowledgeRecord = {
      id: body.id || `kb_${Date.now()}`,
      client_id: clientId,
      category: body.category || "Custom Knowledge",
      title: body.title || "Untitled Knowledge",
      content: body.content || "",
      source: body.source || "Manual Entry",
      status: auth.user.role === "admin" ? (body.status || "draft") : "draft",
      approved_by: isApproved ? (auth.user.email || auth.user.uid || "Admin") : undefined,
      approved_at: isApproved ? now : undefined,
      published: auth.user.role === "admin" ? Boolean(body.published) : false,
      version: body.version || 1,
      created_at: now,
      updated_at: now,
    };

    kbStore.push(record);
    return NextResponse.json({ success: true, record });
  } catch {
    return NextResponse.json({ error: "Failed to create knowledge record" }, { status: 400 });
  }
}

export async function PATCH(req: Request) {
  try {
    const auth = await assertUserSession(req);
    if (!auth.ok) return auth.response;

    const body = await req.json();
    const { id, title, content, category, status, published } = body;

    const index = kbStore.findIndex((k) => k.id === id);
    if (index === -1) {
      return NextResponse.json({ error: "Knowledge record not found" }, { status: 404 });
    }

    const record = kbStore[index];

    // Non-admin can only edit their own draft record
    if (auth.user.role !== "admin" && record.client_id !== auth.user.uid) {
      return NextResponse.json({ error: "Forbidden: Cannot edit other client knowledge record" }, { status: 403 });
    }

    const now = new Date().toISOString();

    if (title !== undefined) record.title = title;
    if (content !== undefined) record.content = content;
    if (category !== undefined) record.category = category;

    if (auth.user.role === "admin") {
      if (status !== undefined) {
        record.status = status;
        if (status === "approved") {
          record.approved_at = now;
          record.approved_by = auth.user.email || auth.user.uid || "Admin";
        }
      }
      if (published !== undefined) record.published = published;
    }
    record.updated_at = now;

    return NextResponse.json({ success: true, record });
  } catch {
    return NextResponse.json({ error: "Failed to update knowledge record" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const auth = await assertUserSession(req);
  if (!auth.ok) return auth.response;

  const url = new URL(req.url);
  const id = url.searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Missing record ID" }, { status: 400 });
  }

  const index = kbStore.findIndex((k) => k.id === id);
  if (index === -1) {
    return NextResponse.json({ error: "Record not found" }, { status: 404 });
  }

  const record = kbStore[index];
  if (auth.user.role !== "admin" && record.client_id !== auth.user.uid) {
    return NextResponse.json({ error: "Forbidden: Cannot delete other client knowledge record" }, { status: 403 });
  }

  const deleted = kbStore.splice(index, 1);
  return NextResponse.json({ success: true, deleted: deleted[0] });
}
