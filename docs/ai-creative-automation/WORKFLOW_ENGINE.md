# Workflow Engine — 14-Step Creative Pipeline
**Document:** `docs/ai-creative-automation/WORKFLOW_ENGINE.md`  
**Version:** 2.4.0

---

## 1. 14-Step Execution Blueprint

The dynamic automation engine executes creative production via a 14-step configurable pipeline:

| Step | Identifier | Name | Capability Type | Default Adapter | Approval Gate |
| :--- | :--- | :--- | :--- | :--- | :---: |
| **01** | `step-01-brand-selection` | Select Brand / Client Profile | `prompt_enhancement` | `cap-local-template-engine` | No |
| **02** | `step-02-topic-trend-research` | Topic Selection & Trend Research | `trend_research` | `cap-gemini-core` | No |
| **03** | `step-03-content-format-selection` | Select Content Format & Aspect Ratio | `prompt_enhancement` | `cap-local-template-engine` | No |
| **04** | `step-04-reference-analysis` | Analyze Creative References & Presets | `prompt_enhancement` | `cap-local-template-engine` | No |
| **05** | `step-05-creative-brief` | Generate Creative Brief | `scriptwriting` | `cap-gemini-core` | **Yes** |
| **06** | `step-06-scriptwriting` | Generate Script & Voiceover Dialogue | `scriptwriting` | `cap-gemini-core` | No |
| **07** | `step-07-storyboard-creation` | Create Scene-by-Scene Storyboard | `storyboard_generation` | `cap-gemini-core` | **Yes** |
| **08** | `step-08-tools-skills-selection` | Select AI Tools & Execution Skills | `prompt_enhancement` | `cap-local-template-engine` | No |
| **09** | `step-09-generation-job-preparation` | Prepare Generation Jobs (Simulated) | `prompt_enhancement` | `cap-local-template-engine` | No |
| **10** | `step-10-rendering-workflow-prep` | Prepare Editing & Remotion Manifest | `motion_graphics` | `cap-remotion-engine` | No |
| **11** | `step-11-output-validation` | Validate Specification & Quality Gate | `prompt_enhancement` | `cap-local-template-engine` | No |
| **12** | `step-12-human-approval-gate` | Admin / Client Approval Gate | `prompt_enhancement` | `cap-local-template-engine` | **Yes** |
| **13** | `step-13-store-and-deliver` | Store Artifacts in Vault & Workspace | `file_storage` | `cap-gdrive-vault` | No |
| **14** | `step-14-schedule-publishing` | Schedule Multi-Channel Publishing | `social_publishing` | `cap-n8n-orchestrator` | **Yes** |

---

## 2. Step Configuration Schema

Each step in a workflow is defined by `WorkflowStepConfig`:
- `isEnabled: boolean` — Disabling a step causes the execution engine to skip it and forward inputs directly.
- `requiresHumanApproval: boolean` — Pauses execution into `paused_for_approval` state until an administrator reviews and approves the step.
- `retryPolicy: { maxRetries: number, backoffMs: number }` — Exponential backoff behavior on transient provider errors.
- `inputSchema` & `outputSchema` — Strict typing of payload payloads.

---

## 3. Human Approval Gates & Review Workflow

Three steps require mandatory human review:
1. **Step 05 (Creative Brief):** Verifies strategic direction and audience pain points before writing dialogue.
2. **Step 07 (Storyboard):** Checks visual framing and pacing before assembling render commands.
3. **Step 12 (Quality Gate):** Final signoff by studio administrator or client before delivering to Google Drive and publishing.
