import { NextResponse } from "next/server";

const logs: any[] = [];

export async function GET() {
  return NextResponse.json({ logs: logs.slice(-100) });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const now = new Date().toISOString();
    logs.push({
      id: `log_${Date.now()}`,
      ...body,
      timestamp: body.timestamp || now,
    });
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: 'Failed' }, { status: 400 });
  }
}
