import { NextResponse } from "next/server";

const shares: any[] = [];

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const now = new Date().toISOString();
    const expiresAt = new Date(now);
    expiresAt.setHours(expiresAt.getHours() + 24); // 24h expiry
    const token = `share_${Math.random().toString(36).substring(2, 15)}`;
    const share = {
      id: `sh_${Date.now()}`,
      token,
      driveFileId: body.driveFileId,
      client_id: body.client_id,
      expires_at: expiresAt.toISOString(),
      revoked: false,
      created_at: now,
    };
    shares.push(share);
    const url = `/api/share/${token}`;
    return NextResponse.json({ success: true, shareUrl: url, expires_at: share.expires_at });
  } catch (e) {
    return NextResponse.json({ error: 'Failed' }, { status: 400 });
  }
}
