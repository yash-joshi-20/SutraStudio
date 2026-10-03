/**
 * SUTRA STUDIO — Custom Projects API
 * Manage questionnaire, quotes, milestones, change requests, handover.
 */

import { NextResponse } from "next/server";
import { CustomProjectStore, DEFAULT_MILESTONES, DEFAULT_HANDOVER_CHECKLIST, type CustomProject, type ProjectMilestone, type ChangeRequest } from "@/lib/services/customProjects";

export async function GET(req: Request) {
  try {
    const clientUid = req.headers.get("x-user-id");
    if (!clientUid) {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get("id");
    const orderId = searchParams.get("orderId");

    if (projectId) {
      const project = await CustomProjectStore.getById(projectId);
      if (!project || project.clientUid !== clientUid) {
        return NextResponse.json({ error: "Project not found." }, { status: 404 });
      }
      return NextResponse.json({ project });
    }

    if (orderId) {
      const project = await CustomProjectStore.getByOrderId(orderId);
      if (!project || project.clientUid !== clientUid) {
        return NextResponse.json({ project: null });
      }
      return NextResponse.json({ project });
    }

    const projects = await CustomProjectStore.listByClient(clientUid);
    return NextResponse.json({ projects });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to fetch projects." }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const clientUid = req.headers.get("x-user-id");
    const userRole = req.headers.get("x-user-role");

    if (!clientUid) {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }

    const body = await req.json();
    const { action } = body;

    switch (action) {
      case "create": {
        const { orderId, serviceId, serviceName, requirements } = body;

        if (!orderId || !serviceId || !requirements) {
          return NextResponse.json({ error: "orderId, serviceId, and requirements are required." }, { status: 400 });
        }

        // Get default milestones for this project type
        const projectType = requirements.projectType || "website";
        const defaultMs = DEFAULT_MILESTONES[projectType] || DEFAULT_MILESTONES.website;
        const milestones: ProjectMilestone[] = defaultMs.map((m, i) => ({
          ...m,
          id: `ms_${Date.now()}_${i}`,
          status: "pending",
          revisionCount: 0,
          paymentAmount: 0,
          paymentStatus: "not_due",
        }));

        const project: CustomProject = {
          id: `proj_${Date.now()}`,
          orderId,
          clientUid,
          serviceId,
          serviceName: serviceName || serviceId,
          requirements,
          milestones,
          currentMilestoneIndex: 0,
          changeRequests: [],
          termsAccepted: false,
          status: "questionnaire",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        const created = await CustomProjectStore.create(project);
        return NextResponse.json({ success: true, project: created }, { status: 201 });
      }

      case "accept_terms": {
        const { projectId, termsVersion } = body;
        await CustomProjectStore.update(projectId, {
          termsAccepted: true,
          termsAcceptedAt: new Date().toISOString(),
          termsVersion: termsVersion || "v1.0",
        });
        return NextResponse.json({ success: true });
      }

      case "accept_quote": {
        const { projectId: qProjId, clientNotes } = body;
        await CustomProjectStore.acceptQuote(qProjId, clientNotes);
        return NextResponse.json({ success: true });
      }

      case "approve_milestone": {
        const { projectId: mProjId, milestoneIndex } = body;
        const project = await CustomProjectStore.getById(mProjId);
        if (!project || project.clientUid !== clientUid) {
          return NextResponse.json({ error: "Project not found." }, { status: 404 });
        }
        await CustomProjectStore.approveMilestone(mProjId, milestoneIndex, clientUid);
        return NextResponse.json({ success: true });
      }

      case "request_revision": {
        const { projectId: rProjId, milestoneIndex: rIdx, reason, specificChanges } = body;
        const rProject = await CustomProjectStore.getById(rProjId);
        if (!rProject || rProject.clientUid !== clientUid) {
          return NextResponse.json({ error: "Project not found." }, { status: 404 });
        }

        const milestones = [...rProject.milestones];
        if (rIdx < milestones.length) {
          milestones[rIdx].status = "revision_requested";
          milestones[rIdx].revisionCount++;
          milestones[rIdx].reviewNotes = reason;
        }

        await CustomProjectStore.update(rProjId, { milestones });
        return NextResponse.json({ success: true });
      }

      case "submit_change_request": {
        const { projectId: crProjId, title, description, impact } = body;
        const cr: ChangeRequest = {
          id: `cr_${Date.now()}`,
          projectId: crProjId,
          requestedBy: clientUid,
          title,
          description,
          impact: impact || "minor",
          additionalCost: 0,
          additionalDays: 0,
          status: "pending",
          createdAt: new Date().toISOString(),
        };

        await CustomProjectStore.addChangeRequest(crProjId, cr);
        return NextResponse.json({ success: true, changeRequest: cr });
      }

      // Admin actions
      case "send_quote": {
        if (userRole !== "admin") {
          return NextResponse.json({ error: "Admin access required." }, { status: 403 });
        }
        await CustomProjectStore.sendQuote(body.projectId, body.quote);
        return NextResponse.json({ success: true });
      }

      case "advance_milestone": {
        if (userRole !== "admin") {
          return NextResponse.json({ error: "Admin access required." }, { status: 403 });
        }
        await CustomProjectStore.advanceMilestone(body.projectId, body.milestoneIndex);
        return NextResponse.json({ success: true });
      }

      case "complete_handover": {
        if (userRole !== "admin") {
          return NextResponse.json({ error: "Admin access required." }, { status: 403 });
        }
        await CustomProjectStore.completeHandover(body.projectId);
        return NextResponse.json({ success: true });
      }

      default:
        return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 });
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Custom project error." }, { status: 500 });
  }
}
