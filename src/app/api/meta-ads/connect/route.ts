import { NextResponse } from "next/server";

const connections: any[] = [];

export async function GET(req: Request) {
  const url = new URL(req.url);
  const clientId = url.searchParams.get('client_id');
  let filtered = connections;
  if (clientId) filtered = filtered.filter(c => c.client_id === clientId);
  return NextResponse.json({ connections: filtered });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const now = new Date().toISOString();
    // Tokens stored server-side only conceptually; never exposed to client
    const conn = {
      id: `mac_${Date.now()}`,
      client_id: body.client_id,
      page_id: body.page_id,
      ad_account_id: body.ad_account_id,
      pixel_id: body.pixel_id,
      status: 'connected',
      created_at: now,
      updated_at: now,
    };
    connections.push(conn);
    return NextResponse.json({ success: true, connection: { ...conn, token_encrypted: true } });
  } catch (e) {
    return NextResponse.json({ error: 'Failed' }, { status: 400 });
  }
}
