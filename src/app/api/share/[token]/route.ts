import { NextResponse } from "next/server";

declare global {
  var __shares: any[] | undefined;
}

const shares = globalThis.__shares || (globalThis.__shares = []);

export async function GET(req: Request, { params }: any) {
  const token = params?.token;
  const share = shares.find(s => s.token === token);
  if (!share) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  if (share.revoked) return NextResponse.json({ error: 'Revoked' }, { status: 403 });
  if (new Date(share.expires_at) < new Date()) return NextResponse.json({ error: 'Expired' }, { status: 403 });
  // Return metadata - actual file served via auth-protected route
  return NextResponse.json({ valid: true, driveFileId: share.driveFileId, client_id: share.client_id });
}

export async function DELETE(req: Request, { params }: any) {
  const token = params?.token;
  const share = shares.find(s => s.token === token);
  if (share) share.revoked = true;
  return NextResponse.json({ success: true, revoked: !!share });
}
