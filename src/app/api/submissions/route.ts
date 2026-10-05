import { NextResponse } from "next/server";
import { ClientSubmission, KnowledgeRecord } from "@/lib/types/knowledge";
import { adminDb, isFirebaseAdminReady } from "@/lib/firebase/admin";
import { getAuthenticatedUser } from "@/lib/auth/serverAuth";

const INITIAL_SUBMISSIONS: ClientSubmission[] = [];

declare global {
  var __sutra_submissions: ClientSubmission[] | undefined;
  var __sutra_knowledge_base: KnowledgeRecord[] | undefined;
}

if (!globalThis.__sutra_submissions) {
  globalThis.__sutra_submissions = [...INITIAL_SUBMISSIONS];
}
if (!globalThis.__sutra_knowledge_base) {
  globalThis.__sutra_knowledge_base = [];
}

const submissionsStore = globalThis.__sutra_submissions;
const kbStore = globalThis.__sutra_knowledge_base;

async function syncSubmissionsFromFirestore(): Promise<ClientSubmission[]> {
  if (!isFirebaseAdminReady()) return submissionsStore;
  try {
    const snapshot = await adminDb().collection("submissions").get();
    if (!snapshot.empty) {
      const list: ClientSubmission[] = [];
      snapshot.forEach((doc) => list.push(doc.data() as ClientSubmission));
      submissionsStore.length = 0;
      submissionsStore.push(...list);
    }
  } catch (err) {
    console.warn("[Submissions] Firestore sync warning:", err);
  }
  return submissionsStore;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const clientId = searchParams.get("client_id");
  const status = searchParams.get("status");

  await syncSubmissionsFromFirestore();

  let results = [...submissionsStore];

  if (clientId) {
    results = results.filter((s) => s.client_id === clientId);
  }
  if (status) {
    results = results.filter((s) => s.status === status.toUpperCase());
  }

  return NextResponse.json({
    submissions: results,
    totalCount: results.length,
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const now = new Date().toISOString();

    if (!body.client_id) {
      return NextResponse.json({ error: "client_id is required" }, { status: 400 });
    }

    const existingIndex = submissionsStore.findIndex(
      (s) => s.client_id === body.client_id
    );

    const submission: ClientSubmission = {
      id: body.id || `sub_${body.client_id}_${Date.now()}`,
      client_id: body.client_id,
      client_name: body.client_name || "Client Business",
      status: body.status || "PENDING",
      version: existingIndex >= 0 ? (submissionsStore[existingIndex].version || 1) + 1 : 1,
      company: body.company || {
        name: "",
        tagline: "",
        description: "",
        about: "",
        industry: "",
        foundedYear: "",
        companySize: "",
        websiteUrl: "",
      },
      services: body.services || [],
      products: body.products || [],
      pricing_plans: body.pricing_plans || [],
      faqs: body.faqs || [],
      contact: body.contact || {
        email: "",
        phone: "",
        address: "",
        city: "",
        state: "",
        country: "",
        businessHours: "",
        socialMedia: {},
      },
      policies: body.policies || {},
      documents: body.documents || [],
      changes_requested_message: body.changes_requested_message || undefined,
      created_at: body.created_at || now,
      updated_at: now,
    };

    if (existingIndex >= 0) {
      submissionsStore[existingIndex] = {
        ...submissionsStore[existingIndex],
        ...submission,
        updated_at: now,
      };
    } else {
      submissionsStore.unshift(submission);
    }

    if (isFirebaseAdminReady()) {
      await adminDb().collection("submissions").doc(submission.id).set(submission, { merge: true });
    }

    return NextResponse.json({ success: true, submission });
  } catch {
    return NextResponse.json({ error: "Failed to create or update submission" }, { status: 400 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { submissionId, action, message, editedData, adminId } = body;

    const index = submissionsStore.findIndex((s) => s.id === submissionId);
    if (index === -1) {
      return NextResponse.json({ error: "Submission not found" }, { status: 404 });
    }

    const sub = submissionsStore[index];
    const now = new Date().toISOString();

    if (action === "APPROVE") {
      sub.status = "APPROVED";
      sub.reviewed_by = adminId || "Supervisor Admin";
      sub.reviewed_at = now;
      sub.published_at = now;
      sub.changes_requested_message = undefined;

      publishSubmissionToKnowledgeBase(sub);
    } else if (action === "PUBLISH") {
      sub.status = "PUBLISHED";
      sub.published_at = now;
      publishSubmissionToKnowledgeBase(sub);
    } else if (action === "UNPUBLISH") {
      sub.status = "APPROVED";
      unpublishSubmissionFromKnowledgeBase(sub.client_id);
    } else if (action === "REQUEST_CHANGES") {
      sub.status = "CHANGES_REQUESTED";
      sub.changes_requested_message = message || "Please review and update the required fields.";
      sub.reviewed_by = adminId || "Supervisor Admin";
      sub.reviewed_at = now;
    } else if (action === "REJECT") {
      sub.status = "REJECTED";
      sub.changes_requested_message = message || "Submission does not meet publishing criteria.";
      sub.reviewed_by = adminId || "Supervisor Admin";
      sub.reviewed_at = now;
    } else if (action === "EDIT" && editedData) {
      submissionsStore[index] = {
        ...sub,
        ...editedData,
        updated_at: now,
      };
    }

    if (isFirebaseAdminReady()) {
      await adminDb().collection("submissions").doc(submissionsStore[index].id).set(submissionsStore[index], { merge: true });
    }

    return NextResponse.json({ success: true, submission: submissionsStore[index] });
  } catch {
    return NextResponse.json({ error: "Failed to update review status" }, { status: 500 });
  }
}

function publishSubmissionToKnowledgeBase(sub: ClientSubmission) {
  const cleanStore = kbStore.filter((k) => k.client_id !== sub.client_id);
  kbStore.length = 0;
  kbStore.push(...cleanStore);

  const now = new Date().toISOString();

  if (sub.company?.name) {
    kbStore.push({
      id: `kb_${sub.client_id}_company`,
      client_id: sub.client_id,
      category: "Company",
      title: `${sub.company.name} — Profile & Overview`,
      content: `${sub.company.name}: ${sub.company.tagline || ''}. ${sub.company.description || ''} ${sub.company.about || ''} Industry: ${sub.company.industry || 'Technology'}. Founded: ${sub.company.foundedYear || ''}. Team: ${sub.company.companySize || ''}. Website: ${sub.company.websiteUrl || ''}`,
      source: "Admin-Approved Submission",
      status: "approved",
      approved_by: sub.reviewed_by || "Admin",
      approved_at: now,
      published: true,
      version: sub.version,
      created_at: now,
      updated_at: now,
    });
  }

  sub.services?.forEach((srv, idx) => {
    kbStore.push({
      id: `kb_${sub.client_id}_srv_${idx}`,
      client_id: sub.client_id,
      category: "Services",
      title: `Service: ${srv.name}`,
      content: `${srv.name} — ${srv.shortDescription}. ${srv.detailedDescription} Starting at ${srv.startingPrice}. Features: ${srv.features?.join(", ") || "Custom scope"}. CTA: ${srv.ctaText}`,
      source: "Admin-Approved Services",
      status: "approved",
      approved_by: sub.reviewed_by || "Admin",
      approved_at: now,
      published: true,
      version: sub.version,
      created_at: now,
      updated_at: now,
    });
  });

  if (isFirebaseAdminReady()) {
    const db = adminDb();
    const batch = db.batch();
    for (const record of kbStore.filter((k) => k.client_id === sub.client_id)) {
      const docRef = db.collection("knowledgeBase").doc(record.id);
      batch.set(docRef, record, { merge: true });
    }
    batch.commit().catch(() => {});
  }
}

function unpublishSubmissionFromKnowledgeBase(clientId: string) {
  const filtered = kbStore.filter((k) => k.client_id !== clientId);
  kbStore.length = 0;
  kbStore.push(...filtered);
}
