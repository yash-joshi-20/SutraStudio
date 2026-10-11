import { NextResponse } from "next/server";
import { assertUserSession } from "@/lib/auth/requestRole";

const documents: any[] = [];

export async function GET(req: Request) {
  const auth = await assertUserSession(req);
  if (!auth.ok) return auth.response;

  const url = new URL(req.url);
  const clientId = url.searchParams.get('client_id');
  let filtered = documents;

  if (auth.user.role !== "admin") {
    filtered = filtered.filter(d => d.client_id === auth.user.uid);
  } else if (clientId) {
    filtered = filtered.filter(d => d.client_id === clientId);
  }

  return NextResponse.json({ documents: filtered });
}

export async function POST(req: Request) {
  const auth = await assertUserSession(req);
  if (!auth.ok) return auth.response;

  try {
    const body = await req.json();
    const now = new Date().toISOString();
    const clientId = auth.user.role === "admin" ? (body.client_id || auth.user.uid) : auth.user.uid;
    const doc = {
      id: `doc_${Date.now()}`,
      client_id: clientId,
      file_name: body.file_name,
      file_url: body.file_url,
      file_type: body.file_type,
      file_size: body.file_size || 0,
      extracted_text: body.extracted_text || '',
      processed: false,
      approved: false,
      published: false,
      created_at: now,
      updated_at: now,
    };
    documents.push(doc);
    return NextResponse.json({ success: true, document: doc });
  } catch (e) {
    return NextResponse.json({ error: 'Failed' }, { status: 400 });
  }
}
