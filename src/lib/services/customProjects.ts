/**
 * SUTRA STUDIO — Custom Project Management
 * For Website / Web App / Mobile App / Interface Design / AI Automation services.
 * Questionnaire → Scope & Estimate → Admin Quote → Client Accept → Advance Payment
 * → Milestones (Design, Build, Test, Handover) → Per-milestone approval & payment
 * → Change requests → Terms e-acceptance → Handover checklist
 */

import { adminDb } from "@/lib/firebase/admin";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface CustomProject {
  id: string;
  orderId: string;
  clientUid: string;
  brandKitId?: string;
  serviceId: string;
  serviceName: string;

  // Questionnaire / requirements
  requirements: ProjectRequirement;

  // Scope & estimate
  scope?: ProjectScope;

  // Quote
  quote?: ProjectQuote;

  // Milestones
  milestones: ProjectMilestone[];
  currentMilestoneIndex: number;

  // Change requests
  changeRequests: ChangeRequest[];

  // Legal
  termsAccepted: boolean;
  termsAcceptedAt?: string;
  termsVersion?: string;

  // Handover
  handoverChecklist?: HandoverItem[];
  handoverCompletedAt?: string;

  // Status
  status:
    | "questionnaire"
    | "scoping"
    | "quote_sent"
    | "quote_discussed"
    | "quote_accepted"
    | "advance_paid"
    | "in_progress"
    | "review"
    | "handover"
    | "completed"
    | "cancelled"
    | "on_hold";

  // Links
  previewUrl?: string;
  stagingUrl?: string;
  productionUrl?: string;
  repositoryUrl?: string;

  createdAt: string;
  updatedAt: string;
}

export interface ProjectRequirement {
  // Common fields
  projectName: string;
  projectType: "website" | "web_app" | "mobile_app" | "interface_design" | "ai_automation";
  description: string;
  targetAudience?: string;
  referenceLinks: string[];
  referenceFiles: Array<{ name: string; url: string; fileId?: string }>;
  preferredTechStack?: string;
  existingSystemDetails?: string;
  desiredTimeline?: string;
  budgetRange?: string;

  // Website-specific
  pageCount?: number;
  contentReady?: boolean;
  domainOwned?: boolean;
  hostingPreference?: string;

  // Web App-specific
  userRoles?: string[];
  integrations?: string[];
  dataStorageNeeds?: string;
  realTimeFeatures?: boolean;

  // Mobile App-specific
  platforms?: ("android" | "ios" | "both")[];
  offlineSupport?: boolean;
  pushNotifications?: boolean;
  inAppPayments?: boolean;

  // AI Automation-specific
  automationGoals?: string;
  dataSourcesCount?: number;
  expectedVolume?: string;

  // Questionnaire metadata
  completedAt?: string;
  aiSummary?: string; // AI-generated summary for admin
}

export interface ProjectScope {
  summary: string;
  features: Array<{
    name: string;
    description: string;
    complexity: "simple" | "moderate" | "complex";
    estimatedHours: number;
  }>;
  totalEstimatedHours: number;
  estimatedDurationWeeks: number;
  techStack: string[];
  deliverables: string[];
  assumptions: string[];
  exclusions: string[];
  createdAt: string;
  createdBy: string;
}

export interface ProjectQuote {
  id: string;
  totalAmount: number;
  currency: "INR";
  advancePercentage: number; // e.g. 40
  advanceAmount: number;
  milestonePayments: Array<{
    milestoneName: string;
    amount: number;
    dueAt: string;
  }>;
  validUntil: string;
  notes?: string;
  sentAt: string;
  sentBy: string;
  responseStatus: "pending" | "accepted" | "declined" | "counter_offered";
  respondedAt?: string;
  clientNotes?: string;
  razorpayOrderId?: string;
}

export interface ProjectMilestone {
  id: string;
  name: string;
  description: string;
  order: number;
  deliverables: string[];

  // Status
  status: "pending" | "in_progress" | "in_review" | "revision_requested" | "approved" | "completed";

  // Preview/review
  previewUrl?: string;
  reviewNotes?: string;
  revisionCount: number;

  // Payment
  paymentAmount: number;
  paymentStatus: "not_due" | "pending" | "paid" | "refunded";
  razorpayPaymentId?: string;

  // Dates
  estimatedStartDate?: string;
  estimatedEndDate?: string;
  actualStartDate?: string;
  actualEndDate?: string;
  approvedAt?: string;
  approvedBy?: string;
}

export interface ChangeRequest {
  id: string;
  projectId: string;
  requestedBy: string; // client or admin
  title: string;
  description: string;
  impact: "none" | "minor" | "major";
  additionalCost: number;
  additionalDays: number;
  status: "pending" | "approved" | "declined" | "implemented";
  adminResponse?: string;
  createdAt: string;
  resolvedAt?: string;
}

export interface HandoverItem {
  name: string;
  description: string;
  status: "pending" | "completed";
  completedAt?: string;
  deliverableUrl?: string;
}

// Default milestones by project type
export const DEFAULT_MILESTONES: Record<string, Omit<ProjectMilestone, "id" | "paymentAmount" | "paymentStatus" | "revisionCount" | "status">[]> = {
  website: [
    { name: "Design", description: "UI/UX wireframes, visual design mockups, style guide", order: 1, deliverables: ["Figma/design files", "Style guide", "Wireframes"] },
    { name: "Build", description: "Frontend development, CMS integration, responsive implementation", order: 2, deliverables: ["Source code", "Staging URL", "CMS access"] },
    { name: "Test", description: "Cross-browser testing, performance optimization, SEO audit", order: 3, deliverables: ["Test report", "Performance report", "SEO checklist"] },
    { name: "Handover", description: "Domain setup, deployment, documentation, training", order: 4, deliverables: ["Production URL", "Documentation", "Admin credentials"] },
  ],
  web_app: [
    { name: "Architecture & Design", description: "System design, database schema, UI/UX, API planning", order: 1, deliverables: ["Architecture doc", "DB schema", "UI mockups"] },
    { name: "Core Build", description: "Backend APIs, frontend components, authentication, core features", order: 2, deliverables: ["Staging URL", "API docs", "Source code"] },
    { name: "Integration & Testing", description: "Third-party integrations, comprehensive testing, security audit", order: 3, deliverables: ["Integration tests", "Security audit", "Load test"] },
    { name: "Deploy & Handover", description: "Production deployment, monitoring, documentation, training", order: 4, deliverables: ["Production URL", "Monitoring dashboard", "Runbook"] },
  ],
  mobile_app: [
    { name: "Design & Prototype", description: "App UI/UX, interactive prototype, design system", order: 1, deliverables: ["Figma prototype", "Design system", "Flow diagrams"] },
    { name: "Development", description: "App development, API integration, push notifications", order: 2, deliverables: ["TestFlight/APK", "Source code", "API integration"] },
    { name: "Testing & Polish", description: "Device testing, performance, app store preparations", order: 3, deliverables: ["Test report", "App store assets", "Beta build"] },
    { name: "Launch & Handover", description: "App store submission, monitoring, documentation", order: 4, deliverables: ["App store links", "Analytics setup", "Documentation"] },
  ],
  interface_design: [
    { name: "Research & Wireframes", description: "User research, information architecture, low-fi wireframes", order: 1, deliverables: ["Research report", "Wireframes", "User flows"] },
    { name: "Visual Design", description: "High-fidelity mockups, design system, component library", order: 2, deliverables: ["Figma files", "Design system", "Component specs"] },
    { name: "Prototype & Test", description: "Interactive prototype, usability testing, refinements", order: 3, deliverables: ["Interactive prototype", "Test results", "Final designs"] },
    { name: "Handover", description: "Developer handoff, asset export, design documentation", order: 4, deliverables: ["Exported assets", "Dev specs", "Documentation"] },
  ],
  ai_automation: [
    { name: "Discovery & Design", description: "Requirements analysis, workflow mapping, integration planning", order: 1, deliverables: ["Workflow diagrams", "Integration map", "Data flow"] },
    { name: "Build & Integrate", description: "Pipeline development, API connections, data processing", order: 2, deliverables: ["Working pipelines", "API docs", "Test data"] },
    { name: "Test & Optimize", description: "End-to-end testing, performance tuning, error handling", order: 3, deliverables: ["Test results", "Performance report", "Error logs"] },
    { name: "Deploy & Handover", description: "Production deployment, monitoring, documentation", order: 4, deliverables: ["Live pipelines", "Monitoring", "Runbook"] },
  ],
};

// Default handover checklist
export const DEFAULT_HANDOVER_CHECKLIST: HandoverItem[] = [
  { name: "Source code delivered", description: "Complete source code transferred to client repository", status: "pending" },
  { name: "Documentation complete", description: "Technical docs, user guides, and API documentation", status: "pending" },
  { name: "Credentials shared", description: "All admin credentials and API keys securely shared", status: "pending" },
  { name: "Domain/hosting configured", description: "Production domain and hosting fully configured", status: "pending" },
  { name: "Analytics set up", description: "Google Analytics / tracking configured", status: "pending" },
  { name: "SSL certificate active", description: "HTTPS enabled with valid certificate", status: "pending" },
  { name: "Backups configured", description: "Automated backup system in place", status: "pending" },
  { name: "Client training complete", description: "Walkthrough session with client team", status: "pending" },
  { name: "Support period active", description: "Post-launch support period confirmed", status: "pending" },
];

// ---------------------------------------------------------------------------
// Store Operations
// ---------------------------------------------------------------------------

const COLLECTION = "custom_projects";

export class CustomProjectStore {
  static async create(project: CustomProject): Promise<CustomProject> {
    const db = adminDb();
    await db.collection(COLLECTION).doc(project.id).set(project);
    return project;
  }

  static async getById(projectId: string): Promise<CustomProject | null> {
    const db = adminDb();
    const doc = await db.collection(COLLECTION).doc(projectId).get();
    if (!doc.exists) return null;
    return doc.data() as CustomProject;
  }

  static async getByOrderId(orderId: string): Promise<CustomProject | null> {
    const db = adminDb();
    const snap = await db
      .collection(COLLECTION)
      .where("orderId", "==", orderId)
      .limit(1)
      .get();
    if (!snap || !snap.docs || snap.docs.length === 0) return null;
    return snap.docs[0].data() as CustomProject;
  }

  static async listByClient(clientUid: string): Promise<CustomProject[]> {
    const db = adminDb();
    const snap = await db
      .collection(COLLECTION)
      .where("clientUid", "==", clientUid)
      .orderBy("createdAt", "desc")
      .get();
    if (!snap || !snap.docs) return [];
    return snap.docs.map((d: any) => d.data() as CustomProject);
  }

  static async update(projectId: string, updates: Partial<CustomProject>): Promise<void> {
    const db = adminDb();
    await db.collection(COLLECTION).doc(projectId).update({
      ...updates,
      updatedAt: new Date().toISOString(),
    });
  }

  static async sendQuote(projectId: string, quote: ProjectQuote): Promise<void> {
    await CustomProjectStore.update(projectId, {
      quote,
      status: "quote_sent",
    });
  }

  static async acceptQuote(projectId: string, clientNotes?: string): Promise<void> {
    const project = await CustomProjectStore.getById(projectId);
    if (!project?.quote) return;

    await CustomProjectStore.update(projectId, {
      quote: {
        ...project.quote,
        responseStatus: "accepted",
        respondedAt: new Date().toISOString(),
        clientNotes,
      },
      status: "quote_accepted",
    });
  }

  static async advanceMilestone(projectId: string, milestoneIndex: number): Promise<void> {
    const project = await CustomProjectStore.getById(projectId);
    if (!project) return;

    const milestones = [...project.milestones];
    if (milestoneIndex < milestones.length) {
      milestones[milestoneIndex].status = "in_progress";
      milestones[milestoneIndex].actualStartDate = new Date().toISOString();
    }

    await CustomProjectStore.update(projectId, {
      milestones,
      currentMilestoneIndex: milestoneIndex,
      status: "in_progress",
    });
  }

  static async approveMilestone(
    projectId: string,
    milestoneIndex: number,
    approvedBy: string
  ): Promise<void> {
    const project = await CustomProjectStore.getById(projectId);
    if (!project) return;

    const milestones = [...project.milestones];
    if (milestoneIndex < milestones.length) {
      milestones[milestoneIndex].status = "approved";
      milestones[milestoneIndex].approvedAt = new Date().toISOString();
      milestones[milestoneIndex].approvedBy = approvedBy;
      milestones[milestoneIndex].actualEndDate = new Date().toISOString();
    }

    const allApproved = milestones.every((m) => m.status === "approved" || m.status === "completed");

    await CustomProjectStore.update(projectId, {
      milestones,
      status: allApproved ? "handover" : "in_progress",
      currentMilestoneIndex: allApproved
        ? milestones.length - 1
        : Math.min(milestoneIndex + 1, milestones.length - 1),
    });
  }

  static async addChangeRequest(projectId: string, cr: ChangeRequest): Promise<void> {
    const project = await CustomProjectStore.getById(projectId);
    if (!project) return;

    await CustomProjectStore.update(projectId, {
      changeRequests: [...project.changeRequests, cr],
    });
  }

  static async completeHandover(projectId: string): Promise<void> {
    await CustomProjectStore.update(projectId, {
      status: "completed",
      handoverCompletedAt: new Date().toISOString(),
    });
  }

  /** Admin: list all projects */
  static async listAll(limit = 100): Promise<CustomProject[]> {
    const db = adminDb();
    const snap = await db
      .collection(COLLECTION)
      .orderBy("createdAt", "desc")
      .limit(limit)
      .get();
    if (!snap || !snap.docs) return [];
    return snap.docs.map((d: any) => d.data() as CustomProject);
  }
}
