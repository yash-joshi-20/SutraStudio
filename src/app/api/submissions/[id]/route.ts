import { NextResponse } from "next/server";
import { assertUserSession, assertAdminSession } from "@/lib/auth/requestRole";

const submissions: any[] = []; // shared in memory conceptually; use module scope

// Helper to access from parent - in production use DB
declare global {
  var __submissions: any[] | undefined;
}

const store = globalThis.__submissions || (globalThis.__submissions = []);

export async function GET(req: Request, { params }: any) {
  const auth = await assertUserSession(req);
  if (!auth.ok) return auth.response;

  const id = params?.id;
  const submission = store.find(s => s.id === id);
  if (!submission) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  if (auth.user.role !== "admin" && submission.client_id && submission.client_id !== auth.user.uid) {
    return NextResponse.json({ error: "Forbidden: Cross-tenant access denied." }, { status: 403 });
  }

  return NextResponse.json({ submission });
}

export async function PATCH(req: Request, { params }: any) {
  const auth = await assertUserSession(req);
  if (!auth.ok) return auth.response;

  try {
    const body = await req.json();
    const id = params?.id;
    const idx = store.findIndex(s => s.id === id);
    if (idx === -1) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    if (auth.user.role !== "admin" && store[idx].client_id && store[idx].client_id !== auth.user.uid) {
      return NextResponse.json({ error: "Forbidden: Cross-tenant update denied." }, { status: 403 });
    }
    
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
  const auth = await assertAdminSession(req);
  if (!auth.ok) return auth.response;

  const id = params?.id;
  const idx = store.findIndex(s => s.id === id);
  if (idx === -1) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  store.splice(idx, 1);
  return NextResponse.json({ success: true });
}
