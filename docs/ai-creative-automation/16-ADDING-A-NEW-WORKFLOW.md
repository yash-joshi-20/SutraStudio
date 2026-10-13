# 16 — Developer Guide: Defining a New Workflow Template

This guide explains how to define, configure, and register a new workflow blueprint in Sutra Studio.

---

## 🏗️ Structure of a Workflow Template

A workflow blueprint is defined using `WorkflowDefinition` in `src/lib/creative-automation/types.ts`:

```typescript
export interface WorkflowDefinition {
  id: string;
  name: string;
  description: string;
  category: CreativeCategory;
  isDefault: boolean;
  steps: WorkflowStepConfig[];
  createdAt: string;
  updatedAt: string;
}
```

---

## 🛠️ Step-by-Step Implementation

### Step 1: Define the Workflow in `dynamicWorkflowEngine.ts`

Add your new template to `MASTER_WORKFLOW_TEMPLATES`:

```typescript
export const MY_CUSTOM_WORKFLOW_TEMPLATE: WorkflowDefinition = {
  id: "wf-luxury-hospitality-6",
  name: "Luxury Hospitality & Resort Showcase (6-Step)",
  description: "Accelerated visual storytelling for luxury hotels, wellness retreats, and heritage villas.",
  category: "cinematic_video",
  isDefault: false,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  steps: [
    {
      stepIndex: 1,
      stepId: "hosp-step-01-brief",
      name: "Property & Experience Brief",
      description: "Capture architecture, villa footprint, amenities, and guest demographic.",
      capabilityType: "topic_ideation",
      preferredCapabilityId: "cap-gemini-core",
      isEnabled: true,
      requiresHumanApproval: false,
      retryPolicy: { maxRetries: 2, backoffMs: 1000 },
      inputSchema: {},
      outputSchema: {},
      configValues: {},
    },
    {
      stepIndex: 2,
      stepId: "hosp-step-02-shots",
      name: "Aerial & Villa Shot Planning",
      description: "Compile Aerial Establishing (Preset 01) and Day-to-Night (Preset 16) prompts.",
      capabilityType: "prompt_enhancement",
      preferredCapabilityId: "cap-gemini-core",
      isEnabled: true,
      requiresHumanApproval: true,
      dependsOnSteps: [1],
      retryPolicy: { maxRetries: 2, backoffMs: 1000 },
      inputSchema: {},
      outputSchema: {},
      configValues: {},
    },
    // Add additional steps...
  ],
};
```

---

## 📋 Duplicating Workflows Dynamically via API

Administrators can also duplicate existing templates dynamically without writing code:

```bash
curl -X POST http://localhost:3000/api/admin/creative-automation/workflows \
  -H "Content-Type: application/json" \
  -H "Origin: http://localhost:3000" \
  -d '{
    "action": "duplicate",
    "sourceTemplateId": "wf-arch-realestate-8",
    "newName": "Custom Rajasthan Villa 2026 Pipeline"
  }'
```

The response returns the newly created, fully isolated workflow object ready for assignment to creative jobs.
