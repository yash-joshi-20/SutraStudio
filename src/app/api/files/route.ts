import { NextResponse } from "next/server";

const files: any[] = [];

export async function GET(req: Request) {
  const url = new URL(req.url);
  const clientId = url.searchParams.get('client_id');
  let filtered = files;
  if (clientId) filtered = filtered.filter(f => f.client_id === clientId);
  return NextResponse.json({ files: filtered });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const now = new Date().toISOString();
    const f = {
      id: `file_${Date.now()}`,
      client_id: body.client_id,
      name: body.name,
      driveFileId: body.driveFileId,
      size: body.size,
      mimeType: body.mimeType,
      folder: body.folder,
      created_at: now,
      updated_at: now,
    };
    files.push(f);
    return NextResponse.json({ success: true, file: f });
  } catch (e) {
    return NextResponse.json({ error: 'Failed' }, { status: 400 });
  }
}
