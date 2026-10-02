import { NextResponse } from "next/server";

const companies: any[] = [];

export async function GET(req: Request) {
  const url = new URL(req.url);
  const clientId = url.searchParams.get('client_id');
  let filtered = companies;
  if (clientId) filtered = filtered.filter(c => c.client_id === clientId);
  return NextResponse.json({ companies: filtered });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const now = new Date().toISOString();
    const company = {
      id: `comp_${Date.now()}`,
      client_id: body.client_id,
      ...body,
      created_at: now,
      updated_at: now,
    };
    companies.push(company);
    return NextResponse.json({ success: true, company });
  } catch (e) {
    return NextResponse.json({ error: 'Failed' }, { status: 400 });
  }
}
