import { NextResponse } from "next/server";

const leads: any[] = [];

export async function GET() {
  return NextResponse.json({ leads });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const now = new Date().toISOString();
    const lead = {
      id: `lead_${Date.now()}`,
      name: body.name,
      email: body.email,
      phone: body.phone,
      company: body.company,
      requirement: body.requirement,
      status: body.status || 'New',
      source: body.source || 'chatbot',
      client_id: body.client_id,
      created_at: now,
      updated_at: now,
    };
    leads.push(lead);
    return NextResponse.json({ success: true, lead });
  } catch (e) {
    return NextResponse.json({ error: 'Failed to create lead' }, { status: 400 });
  }
}
