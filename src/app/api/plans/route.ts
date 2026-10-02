import { NextResponse } from "next/server";

const plans: any[] = [];

export async function GET() {
  return NextResponse.json({ plans });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const now = new Date().toISOString();
    const plan = {
      id: `plan_${Date.now()}`,
      name: body.name,
      description: body.description,
      price: body.price || 0,
      currency: body.currency || 'INR',
      billing_period: body.billing_period || 'monthly',
      features: body.features || [],
      allowances: body.allowances || {},
      is_active: body.is_active !== false,
      is_popular: body.is_popular || false,
      order: body.order || 0,
      created_at: now,
      updated_at: now,
    };
    plans.push(plan);
    return NextResponse.json({ success: true, plan });
  } catch (e) {
    return NextResponse.json({ error: 'Failed' }, { status: 400 });
  }
}
