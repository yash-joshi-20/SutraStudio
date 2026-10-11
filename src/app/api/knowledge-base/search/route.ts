import { NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth/serverAuth";

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
    const user = await getAuthenticatedUser(req);
    const { query, client_id } = await req.json();
    
    // Scoped search over approved + published
    const targetClientId = user.isAdmin ? client_id : (user.isAuthenticated ? user.uid : undefined);

    const results = kbStore.filter(k => 
      k.approved === true && 
      k.published === true &&
      (!targetClientId || k.client_id === targetClientId || k.client_id === "client_default" || !k.client_id) &&
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
