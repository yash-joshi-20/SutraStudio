import { NextResponse } from "next/server";

export type SubmissionStatus = 
  | 'DRAFT'
  | 'PENDING_REVIEW'
  | 'CHANGES_REQUESTED'
  | 'CLIENT_UPDATED'
  | 'APPROVED'
  | 'PUBLISHED'
  | 'REJECTED';

// In-memory store for demo; production would use Firestore
const submissions: any[] = [];

export async function GET(req: Request) {
  const url = new URL(req.url);
  const clientId = url.searchParams.get('client_id');
  const status = url.searchParams.get('status');
  
  let filtered = submissions;
  if (clientId) filtered = filtered.filter(s => s.client_id === clientId);
  if (status) filtered = filtered.filter(s => s.status === status);
  
  return NextResponse.json({ submissions: filtered, total: filtered.length });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const now = new Date().toISOString();
    
    const submission = {
      id: `sub_${Date.now()}`,
      client_id: body.client_id || 'default_client',
      status: body.status || 'DRAFT',
      company: body.company || {},
      services: body.services || [],
      products: body.products || [],
      pricing_plans: body.pricing_plans || [],
      faqs: body.faqs || [],
      contact: body.contact || {},
      policies: body.policies || {},
      documents: body.documents || [],
      version: body.version || 1,
      created_at: now,
      updated_at: now,
    };
    
    submissions.push(submission);
    
    return NextResponse.json({ success: true, submission });
  } catch (e) {
    return NextResponse.json({ error: 'Failed to create submission' }, { status: 400 });
  }
}
