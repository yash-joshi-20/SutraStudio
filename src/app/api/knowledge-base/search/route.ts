import { NextResponse } from "next/server";

const knowledgeBase: any[] = [];
const knowledgeChunks: any[] = [];

declare global {
  var __kb: any[] | undefined;
  var __kbc: any[] | undefined;
}

const kbStore = globalThis.__kb || (globalThis.__kb = knowledgeBase);
const kcStore = globalThis.__kbc || (globalThis.__kbc = knowledgeChunks);

export async function POST(req: Request) {
  try {
    const { query, client_id } = await req.json();
    
    // Simple keyword search over approved+published only
    const results = kbStore.filter(k => 
      k.approved === true && 
      k.published === true &&
      (!client_id || k.client_id === client_id) &&
      (k.title?.toLowerCase().includes(query?.toLowerCase()) || 
       k.content?.toLowerCase().includes(query?.toLowerCase()))
    );
    
    return NextResponse.json({ 
      results,
      count: results.length,
      query 
    });
  } catch (e) {
    return NextResponse.json({ error: 'Search failed' }, { status: 400 });
  }
}
