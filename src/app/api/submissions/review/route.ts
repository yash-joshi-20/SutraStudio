import { NextResponse } from "next/server";

declare global {
  var __submissions: any[] | undefined;
  var __kb: any[] | undefined;
  var __reviews: any[] | undefined;
}

const submissionsStore = globalThis.__submissions || (globalThis.__submissions = []);
const kbStore = globalThis.__kb || (globalThis.__kb = []);
const reviewsStore = globalThis.__reviews || (globalThis.__reviews = []);

export async function POST(req: Request) {
  try {
    const { submission_id, action, message, admin_id } = await req.json();
    
    const idx = submissionsStore.findIndex(s => s.id === submission_id);
    if (idx === -1) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    
    const now = new Date().toISOString();
    
    // Record review
    reviewsStore.push({
      id: `rev_${Date.now()}`,
      submission_id,
      admin_id: admin_id || 'admin_001',
      action,
      message,
      created_at: now,
    });
    
    // Handle actions
    if (action === 'request_changes') {
      submissionsStore[idx].status = 'CHANGES_REQUESTED';
      submissionsStore[idx].changes_requested_message = message;
    } else if (action === 'approve') {
      submissionsStore[idx].status = 'APPROVED';
      submissionsStore[idx].approved_at = now;
      submissionsStore[idx].reviewed_by = admin_id;
    } else if (action === 'reject') {
      submissionsStore[idx].status = 'REJECTED';
      submissionsStore[idx].reviewed_by = admin_id;
      submissionsStore[idx].reviewed_at = now;
    } else if (action === 'publish') {
      submissionsStore[idx].status = 'PUBLISHED';
      submissionsStore[idx].published_at = now;
      submissionsStore[idx].published = true;
      
      // Publish to knowledge base
      const sub = submissionsStore[idx];
      // Company
      if (sub.company && Object.keys(sub.company).length > 0) {
        kbStore.push({
          id: `kb_${Date.now()}_comp`,
          client_id: sub.client_id,
          category: 'Company',
          title: sub.company.company_name || 'Company',
          content: JSON.stringify(sub.company),
          source: 'submission',
          status: 'published',
          approved: true,
          published: true,
          approved_by: admin_id,
          approved_at: now,
          published_at: now,
          version: 1,
          created_at: now,
          updated_at: now,
        });
      }
      // Services
      (sub.services || []).forEach((svc: any, i: number) => {
        kbStore.push({
          id: `kb_${Date.now()}_svc${i}`,
          client_id: sub.client_id,
          category: 'Services',
          title: svc.service_name,
          content: svc.detailed_description || svc.short_description || JSON.stringify(svc),
          source: 'submission',
          status: 'published',
          approved: true,
          published: true,
          approved_by: admin_id,
          approved_at: now,
          published_at: now,
          version: 1,
          created_at: now,
          updated_at: now,
        });
      });
      // FAQs
      (sub.faqs || []).forEach((f: any, i: number) => {
        kbStore.push({
          id: `kb_${Date.now()}_faq${i}`,
          client_id: sub.client_id,
          category: 'FAQs',
          title: f.question,
          content: f.answer,
          source: 'submission',
          status: 'published',
          approved: true,
          published: true,
          approved_by: admin_id,
          approved_at: now,
          published_at: now,
          version: 1,
          created_at: now,
          updated_at: now,
        });
      });
      // Pricing
      (sub.pricing_plans || []).forEach((p: any, i: number) => {
        kbStore.push({
          id: `kb_${Date.now()}_pr${i}`,
          client_id: sub.client_id,
          category: 'Pricing',
          title: p.plan_name,
          content: `${p.plan_name} - ${p.price} ${p.billing_period}\n${p.description}\nFeatures: ${(p.features||[]).join(', ')}`,
          source: 'submission',
          status: 'published',
          approved: true,
          published: true,
          approved_by: admin_id,
          approved_at: now,
          published_at: now,
          version: 1,
          created_at: now,
          updated_at: now,
        });
      });
      // Contact
      if (sub.contact && Object.keys(sub.contact).length > 0) {
        kbStore.push({
          id: `kb_${Date.now()}_con`,
          client_id: sub.client_id,
          category: 'Contact',
          title: 'Contact Information',
          content: JSON.stringify(sub.contact),
          source: 'submission',
          status: 'published',
          approved: true,
          published: true,
          approved_by: admin_id,
          approved_at: now,
          published_at: now,
          version: 1,
          created_at: now,
          updated_at: now,
        });
      }
    } else if (action === 'unpublish') {
      submissionsStore[idx].status = 'APPROVED';
      submissionsStore[idx].published = false;
      // Also unpublish related KB entries
      kbStore.forEach(k => {
        if (k.source === 'submission' && k.client_id === submissionsStore[idx].client_id) {
          k.published = false;
          k.status = 'unpublished';
        }
      });
    }
    
    submissionsStore[idx].updated_at = now;
    
    return NextResponse.json({ 
      success: true, 
      submission: submissionsStore[idx],
      review: reviewsStore[reviewsStore.length - 1] 
    });
  } catch (e) {
    return NextResponse.json({ error: 'Review failed' }, { status: 400 });
  }
}
