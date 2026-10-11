import { NextResponse } from "next/server";
import { assertUserSession } from "@/lib/auth/requestRole";

const companies: any[] = [];

export async function GET(req: Request) {
  const auth = await assertUserSession(req);
  if (!auth.ok) return auth.response;

  const url = new URL(req.url);
  const clientId = url.searchParams.get('client_id');
  let filtered = companies;

  if (auth.user.role !== "admin") {
    filtered = filtered.filter(c => c.client_id === auth.user.uid);
  } else if (clientId) {
    filtered = filtered.filter(c => c.client_id === clientId);
  }

  return NextResponse.json({ companies: filtered });
}

export async function POST(req: Request) {
  const auth = await assertUserSession(req);
  if (!auth.ok) return auth.response;

  try {
    const body = await req.json();
    const now = new Date().toISOString();
    const clientId = auth.user.role === "admin" ? (body.client_id || auth.user.uid) : auth.user.uid;
    const company = {
      id: `comp_${Date.now()}`,
      ...body,
      client_id: clientId,
      created_at: now,
      updated_at: now,
    };
    companies.push(company);
    return NextResponse.json({ success: true, company });
  } catch (e) {
    return NextResponse.json({ error: 'Failed' }, { status: 400 });
  }
}
