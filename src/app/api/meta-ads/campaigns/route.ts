import { NextResponse } from "next/server";
import { requestRole } from "@/lib/auth/requestRole";

const campaigns: any[] = [];

export async function GET() {
  return NextResponse.json({ campaigns });
}

export async function POST(req: Request) {
  try {
    const userRole = await requestRole(req);
    if (userRole === 'client') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    const body = await req.json();
    const now = new Date().toISOString();
    const camp = {
      id: `camp_${Date.now()}`,
      client_id: body.client_id,
      name: body.name,
      status: 'draft',
      budget: body.budget,
      currency: body.currency || 'INR',
      created_at: now,
      updated_at: now,
    };
    campaigns.push(camp);
    return NextResponse.json({ success: true, campaign: camp });
  } catch (e) {
    return NextResponse.json({ error: 'Failed' }, { status: 400 });
  }
}
