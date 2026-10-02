import { NextResponse } from "next/server";
import { ClientSubmission, KnowledgeRecord } from "@/lib/types/knowledge";

declare global {
  var __sutra_submissions: ClientSubmission[] | undefined;
  var __sutra_knowledge_base: KnowledgeRecord[] | undefined;
}

const INITIAL_SUBMISSIONS: ClientSubmission[] = [
  {
    id: "sub_shriram_001",
    client_id: "client_shriram",
    client_name: "Shri Ram Tech Innovations",
    status: "APPROVED",
    version: 1,
    company: {
      name: "Shri Ram Tech",
      tagline: "Pioneering AI & Cloud Transformation Solutions",
      description: "Shri Ram Tech delivers enterprise-grade AI chatbots, computational intelligence, and high-performance full-stack web platforms for high-growth businesses.",
      about: "Founded with a vision of ethical and high-impact technology, Shri Ram Tech helps global enterprises modernize workflows, integrate intelligent knowledge bases, and scale digital operations.",
      industry: "Information Technology & Artificial Intelligence",
      foundedYear: "2022",
      companySize: "50-100 Employees",
      websiteUrl: "https://shriramtech.com",
    },
    services: [
      {
        id: "srv-1",
        name: "Enterprise AI Chatbots & RAG",
        shortDescription: "Secure, verified multi-tenant knowledge retrieval assistants.",
        detailedDescription: "Custom-trained AI agents grounded exclusively in approved company documentation with strict multi-tenant access control and zero hallucination safeguards.",
        features: ["Knowledge Base Vector Search", "Admin Review & Approval Gate", "Lead Capture Integration", "24/7 Multi-Channel Deployment"],
        startingPrice: "₹14,999",
        ctaText: "Deploy AI Chatbot",
      },
      {
        id: "srv-2",
        name: "Full-Stack Web & Cloud Engineering",
        shortDescription: "High-speed Next.js platforms and microservice architecture.",
        detailedDescription: "Production-ready web applications built on modern frameworks with guaranteed 99.9% uptime, enterprise security, and responsive UX.",
        features: ["Next.js App Router Architecture", "Serverless Cloud Infrastructure", "Role-Based Access Control", "Automated CI/CD Pipelines"],
        startingPrice: "₹19,999",
        ctaText: "Start Web Project",
      },
    ],
    products: [
      {
        id: "prd-1",
        name: "RamBot Enterprise Hub",
        description: "Autonomous customer inquiry and lead routing engine.",
        features: ["Real-Time RAG Retrieval", "Instant Human Handoff", "Admin Knowledge Sync"],
        price: "₹12,499 / month",
        productUrl: "https://shriramtech.com/products/rambot",
      },
    ],
    pricing_plans: [
      {
        id: "plan-1",
        name: "Startup Tier",
        category: "Cloud Assistant",
        price: "₹5,999",
        billingPeriod: "monthly",
        description: "Essential AI assistant grounded in single-tenant verified knowledge base.",
        features: ["Up to 5,000 inquiries/mo", "50 Approved Knowledge Chunks", "Email Lead Alerts", "Standard Support"],
        ctaText: "Choose Startup",
      },
      {
        id: "plan-2",
        name: "Growth Enterprise",
        category: "Full Atelier Suite",
        price: "₹12,999",
        billingPeriod: "monthly",
        description: "Unlimited knowledge vectorization with custom human-handoff pipelines.",
        features: ["Unlimited Inquiries", "Instant Live Human Takeover", "Document Vector Processing", "Dedicated Account Lead"],
        ctaText: "Select Growth",
        isPopular: true,
      },
    ],
    faqs: [
      {
        id: "faq-1",
        question: "How does the Shri Ram Tech AI Chatbot ensure data accuracy?",
        answer: "Our chatbot is strictly grounded in an Admin-Approved Knowledge Base. It only retrieves and presents information that has been reviewed, approved, and published by authorized administrators, completely eliminating hallucinations.",
        category: "AI & Security",
      },
      {
        id: "faq-2",
        question: "Can visitors request to speak with a human agent?",
        answer: "Yes. Every chat session features a 'Talk to Human' action that captures user contact details and immediately alerts the executive team for direct intervention.",
        category: "Support",
      },
    ],
    contact: {
      email: "contact@shriramtech.com",
      phone: "+91 98765 43210",
      whatsapp: "+91 98765 43210",
      address: "Tech Heritage Park, Sector 62",
      city: "Noida",
      state: "Uttar Pradesh",
      country: "India",
      businessHours: "Monday - Saturday: 9:00 AM - 7:00 PM IST",
      googleMapsUrl: "https://maps.google.com",
      contactPageUrl: "https://shriramtech.com/contact",
      socialMedia: {
        linkedin: "https://linkedin.com/company/shriramtech",
        twitter: "https://twitter.com/shriramtech",
      },
    },
    policies: {
      privacyPolicy: "Shri Ram Tech respects client confidentiality. All submitted business data is encrypted at rest and in transit.",
      termsAndConditions: "Services are provisioned under verified enterprise SLAs with guaranteed response times.",
      refundPolicy: "Full refund within 14 days of project commencement if milestones are unmet.",
    },
    documents: [
      {
        id: "doc-1",
        name: "Shri_Ram_Tech_Capabilities_Deck_2026.pdf",
        type: "pdf",
        size: "2.4 MB",
        url: "/documents/shri_ram_tech_deck.pdf",
        uploadedAt: new Date().toISOString(),
        extractedText: "Shri Ram Tech provides enterprise-grade AI chatbots, RAG vector retrieval, and digital platform development.",
        chunksCount: 12,
        status: "approved",
      },
    ],
    created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
    updated_at: new Date().toISOString(),
    published_at: new Date().toISOString(),
  },
];

const submissionsStore = globalThis.__sutra_submissions || (globalThis.__sutra_submissions = INITIAL_SUBMISSIONS);
const kbStore = globalThis.__sutra_knowledge_base || (globalThis.__sutra_knowledge_base = []);

// Seed initial knowledge base records from initial approved submission
if (kbStore.length === 0) {
  const initSub = INITIAL_SUBMISSIONS[0];
  kbStore.push(
    {
      id: "kb_init_1",
      client_id: initSub.client_id,
      category: "Company",
      title: `${initSub.company.name} — Overview`,
      content: `${initSub.company.name} (${initSub.company.tagline}). ${initSub.company.description} ${initSub.company.about} Industry: ${initSub.company.industry}. Founded: ${initSub.company.foundedYear}. Website: ${initSub.company.websiteUrl}`,
      source: "Company Information Form",
      status: "approved",
      approved_by: "Supervisor Admin",
      approved_at: new Date().toISOString(),
      published: true,
      version: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: "kb_init_2",
      client_id: initSub.client_id,
      category: "Services",
      title: "Enterprise AI Chatbots & RAG",
      content: "Enterprise AI Chatbots & RAG starting at ₹14,999. Features: Knowledge Base Vector Search, Admin Review & Approval Gate, Lead Capture Integration, and 24/7 Multi-Channel Deployment. Grounded exclusively in verified company documentation.",
      source: "Services Form",
      status: "approved",
      approved_by: "Supervisor Admin",
      approved_at: new Date().toISOString(),
      published: true,
      version: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: "kb_init_3",
      client_id: initSub.client_id,
      category: "Pricing",
      title: "Pricing Plans & Retainers",
      content: "Startup Tier at ₹5,999/month (up to 5,000 inquiries, 50 approved knowledge chunks). Growth Enterprise Tier at ₹12,999/month (unlimited inquiries, live human takeover, document vector processing).",
      source: "Pricing Form",
      status: "approved",
      approved_by: "Supervisor Admin",
      approved_at: new Date().toISOString(),
      published: true,
      version: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: "kb_init_4",
      client_id: initSub.client_id,
      category: "FAQs",
      title: "Data Accuracy & Hallucination Prevention",
      content: "Shri Ram Tech AI Chatbot ensures 100% data accuracy by retrieving exclusively from an Admin-Approved Knowledge Base. Information that is in Draft or Pending Review is strictly hidden until reviewed and published by administrators.",
      source: "FAQ Form",
      status: "approved",
      approved_by: "Supervisor Admin",
      approved_at: new Date().toISOString(),
      published: true,
      version: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: "kb_init_5",
      client_id: initSub.client_id,
      category: "Contact",
      title: "Contact & Business Office",
      content: "Email: contact@shriramtech.com | Phone: +91 98765 43210 | Location: Tech Heritage Park, Sector 62, Noida, Uttar Pradesh, India. Business Hours: Mon-Sat 9:00 AM - 7:00 PM IST.",
      source: "Contact Form",
      status: "approved",
      approved_by: "Supervisor Admin",
      approved_at: new Date().toISOString(),
      published: true,
      version: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
  );
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const clientId = url.searchParams.get("client_id");
  const status = url.searchParams.get("status");

  let filtered = [...submissionsStore];
  if (clientId) filtered = filtered.filter((s) => s.client_id === clientId);
  if (status) filtered = filtered.filter((s) => s.status === status);

  return NextResponse.json({ submissions: filtered, total: filtered.length });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const now = new Date().toISOString();

    const existingIndex = submissionsStore.findIndex(
      (s) => s.id === body.id || (body.client_id && s.client_id === body.client_id && s.status === "DRAFT")
    );

    const submission: ClientSubmission = {
      id: body.id || `sub_${Date.now()}`,
      client_id: body.client_id || "client_default",
      client_name: body.client_name || body.company?.name || "Client Enterprise",
      status: body.status || "DRAFT",
      version: (body.version || 1),
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

      // Automatically sync approved sections into Knowledge Base
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

    return NextResponse.json({ success: true, submission: submissionsStore[index] });
  } catch {
    return NextResponse.json({ error: "Failed to update review status" }, { status: 500 });
  }
}

function publishSubmissionToKnowledgeBase(sub: ClientSubmission) {
  // Remove existing records for this client to replace with fresh approved version
  const cleanStore = kbStore.filter((k) => k.client_id !== sub.client_id);
  kbStore.length = 0;
  kbStore.push(...cleanStore);

  const now = new Date().toISOString();

  // 1. Company
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

  // 2. Services
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

  // 3. Products
  sub.products?.forEach((prd, idx) => {
    kbStore.push({
      id: `kb_${sub.client_id}_prd_${idx}`,
      client_id: sub.client_id,
      category: "Products",
      title: `Product: ${prd.name}`,
      content: `${prd.name} (${prd.price}). ${prd.description}. Key Features: ${prd.features?.join(", ") || "Standard"}. Product Link: ${prd.productUrl || ""}`,
      source: "Admin-Approved Products",
      status: "approved",
      approved_by: sub.reviewed_by || "Admin",
      approved_at: now,
      published: true,
      version: sub.version,
      created_at: now,
      updated_at: now,
    });
  });

  // 4. Pricing Plans
  if (sub.pricing_plans?.length) {
    const plansSummary = sub.pricing_plans
      .map((p) => `${p.name} (${p.price} / ${p.billingPeriod}): ${p.description}. Features: ${p.features?.join(", ")}`)
      .join(" | ");

    kbStore.push({
      id: `kb_${sub.client_id}_pricing`,
      client_id: sub.client_id,
      category: "Pricing",
      title: "Commercial Pricing & Subscription Plans",
      content: plansSummary,
      source: "Admin-Approved Pricing",
      status: "approved",
      approved_by: sub.reviewed_by || "Admin",
      approved_at: now,
      published: true,
      version: sub.version,
      created_at: now,
      updated_at: now,
    });
  }

  // 5. FAQs
  sub.faqs?.forEach((faq, idx) => {
    kbStore.push({
      id: `kb_${sub.client_id}_faq_${idx}`,
      client_id: sub.client_id,
      category: "FAQs",
      title: faq.question,
      content: `Question: ${faq.question}\nAnswer: ${faq.answer}\nCategory: ${faq.category}`,
      source: "Admin-Approved FAQs",
      status: "approved",
      approved_by: sub.reviewed_by || "Admin",
      approved_at: now,
      published: true,
      version: sub.version,
      created_at: now,
      updated_at: now,
    });
  });

  // 6. Contact Info
  if (sub.contact?.email || sub.contact?.phone) {
    kbStore.push({
      id: `kb_${sub.client_id}_contact`,
      client_id: sub.client_id,
      category: "Contact",
      title: "Official Contact Information & Office Address",
      content: `Email: ${sub.contact.email} | Phone: ${sub.contact.phone} | WhatsApp: ${sub.contact.whatsapp || "N/A"} | Address: ${sub.contact.address}, ${sub.contact.city}, ${sub.contact.state}, ${sub.contact.country} | Hours: ${sub.contact.businessHours}`,
      source: "Admin-Approved Contact",
      status: "approved",
      approved_by: sub.reviewed_by || "Admin",
      approved_at: now,
      published: true,
      version: sub.version,
      created_at: now,
      updated_at: now,
    });
  }

  // 7. Policies
  if (sub.policies?.termsAndConditions || sub.policies?.privacyPolicy || sub.policies?.refundPolicy) {
    kbStore.push({
      id: `kb_${sub.client_id}_policies`,
      client_id: sub.client_id,
      category: "Policies",
      title: "Official Terms, Privacy & Studio Policies",
      content: `Terms: ${sub.policies.termsAndConditions || "Standard SLA"}. Privacy: ${sub.policies.privacyPolicy || "Confidential"}. Refund: ${sub.policies.refundPolicy || "Applicable within 14 days"}. Cancellation: ${sub.policies.cancellationPolicy || "Prorated"}`,
      source: "Admin-Approved Policies",
      status: "approved",
      approved_by: sub.reviewed_by || "Admin",
      approved_at: now,
      published: true,
      version: sub.version,
      created_at: now,
      updated_at: now,
    });
  }

  // 8. Documents
  sub.documents?.forEach((doc, idx) => {
    if (doc.status === "approved" && doc.extractedText) {
      kbStore.push({
        id: `kb_${sub.client_id}_doc_${idx}`,
        client_id: sub.client_id,
        category: "Documents",
        title: `Document: ${doc.name}`,
        content: doc.extractedText,
        source: `Approved File: ${doc.name}`,
        status: "approved",
        approved_by: sub.reviewed_by || "Admin",
        approved_at: now,
        published: true,
        version: sub.version,
        created_at: now,
        updated_at: now,
      });
    }
  });
}

function unpublishSubmissionFromKnowledgeBase(clientId: string) {
  const filtered = kbStore.filter((k) => k.client_id !== clientId);
  kbStore.length = 0;
  kbStore.push(...filtered);
}
