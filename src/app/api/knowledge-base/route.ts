import { NextResponse } from "next/server";

const knowledgeBase: any[] = [];
const knowledgeChunks: any[] = [];

export async function GET(req: Request) {
  const url = new URL(req.url);
  const clientId = url.searchParams.get('client_id');
  const approved = url.searchParams.get('approved');
  const published = url.searchParams.get('published');
  
  let filtered = knowledgeBase;
  if (clientId) filtered = filtered.filter(k => k.client_id === clientId);
  if (approved === 'true') filtered = filtered.filter(k => k.approved === true);
  if (published === 'true') filtered = filtered.filter(k => k.published === true);
  
  return NextResponse.json({ knowledge: filtered, total: filtered.length });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const now = new Date().toISOString();
    
    const record = {
      id: `kb_${Date.now()}`,
      client_id: body.client_id,
      category: body.category,
      title: body.title,
      content: body.content,
      source: body.source || 'submission',
      status: body.status || 'draft',
      approved: body.approved || false,
      published: body.published || false,
      version: body.version || 1,
      created_at: now,
      updated_at: now,
    };
    
    knowledgeBase.push(record);
    return NextResponse.json({ success: true, record });
  } catch (e) {
    return NextResponse.json({ error: 'Failed to create knowledge' }, { status: 400 });
  }
}
