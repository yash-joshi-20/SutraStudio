import { NextResponse } from "next/server";

const submissions: any[] = []; // shared in memory conceptually; use module scope

// Helper to access from parent - in production use DB
declare global {
  var __submissions: any[] | undefined;
}

const store = globalThis.__submissions || (globalThis.__submissions = []);

export async function GET(req: Request, { params }: any) {
  const id = params?.id;
  const submission = store.find(s => s.id === id);
  if (!submission) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ submission });
}

export async function PATCH(req: Request, { params }: any) {
  try {
    const body = await req.json();
    const id = params?.id;
    const idx = store.findIndex(s => s.id === id);
    if (idx === -1) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    
    store[idx] = {
      ...store[idx],
      ...body,
      updated_at: new Date().toISOString(),
    };
    
    return NextResponse.json({ success: true, submission: store[idx] });
  } catch (e) {
    return NextResponse.json({ error: 'Failed to update' }, { status: 400 });
  }
}

export async function DELETE(req: Request, { params }: any) {
  const id = params?.id;
  const idx = store.findIndex(s => s.id === id);
  if (idx === -1) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  store.splice(idx, 1);
  return NextResponse.json({ success: true });
}
