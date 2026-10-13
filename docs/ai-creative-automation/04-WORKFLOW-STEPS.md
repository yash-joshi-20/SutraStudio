# 04 — The Dynamic 8-Step Creative Production Pipeline

The Sutra Studio AI Creative Automation Engine organizes creative production into eight dynamic, configurable, and extensible steps. Administrators can reorder, duplicate, enable, or customize these steps to match diverse client creative briefs.

---

## 📋 Canonical 8-Step Pipeline Overview

| Step # | Stage Name | Capability Type | Preferred Adapter | Human Gate | Prerequisites |
|---|---|---|---|---|---|
| **01** | Brief & Requirements | `topic_ideation` | Gemini 2.0 / Local Engine | No | None |
| **02** | Creative Direction & Storyboard | `scriptwriting` | Gemini 2.0 / Local Engine | **Yes** | Step 01 |
| **03** | Shot Planning & Presets | `prompt_enhancement` | Gemini 2.0 / Shot Planner | No | Step 02 |
| **04** | Image Generation & Keyframes | `image_generation` | BFL FLUX / Pollinations FLUX | No | Step 03 |
| **05** | Video Motion Generation | `video_generation` | Kling AI 1.5 / Runway Gen-3 | No | Step 03 / Step 04 |
| **06** | Editing, Montage & Transitions | `motion_graphics` | Remotion / FFmpeg Engine | No | Step 05 |
| **07** | Quality Assurance & Validation | `prompt_enhancement` | Studio QA Validator | **Yes** | Step 06 |
| **08** | Export & Delivery Vault | `file_storage` | Google Drive Enterprise Vault | No | Step 07 |

---

## 🔍 Detailed Step Specifications

### Step 1 — Brief and Requirements (`dyn-step-01-brief`)
- **Objective**: Ingest business objectives, product details, campaign audience, platform requirements (Instagram, YouTube, TikTok, Cinema), format (9/16, 16/9, 1/1), target duration, and reference image URLs.
- **Inputs**: Creative brief parameters, brand guidelines, target audience demographic, voice tone.
- **Outputs**: Normalized structured JSON brief object with creative constraints.

### Step 2 — Creative Direction & Storyboard (`dyn-step-02-direction`)
- **Objective**: Establish the overarching mood, lighting atmosphere, color palette, camera language, and narrative continuity.
- **Human Approval Gate**: Required. The Creative Director reviews the hook, script lines, and visual direction before compute resources are committed to image and video rendering.
- **Outputs**: Scene-by-scene storyboard breakdown with approximate duration and dialogue.

### Step 3 — Shot Planning & Presets (`dyn-step-03-shot-planning`)
- **Objective**: Automatically select and compile appropriate shot presets from the 18 Cinematic Shot Presets library.
- **Outputs**: Shot-by-shot prompts containing camera motion, focal lens parameters, lighting directives, aspect ratio tags, and negative prompts.

### Step 4 — Image Generation & Keyframes (`dyn-step-04-image-gen`)
- **Objective**: Generate initial keyframes, scene hero imagery, and character/environment plates using the selected image provider.
- **Provider Fallback**: If `BFL_API_KEY` is not present, the system automatically falls back to Pollinations FLUX Free Tier.
- **Outputs**: Validated high-resolution image URLs, dimensions, and color profiles.

### Step 5 — Video Motion Generation (`dyn-step-05-video-gen`)
- **Objective**: Convert keyframe images and storyboard scenes into continuous video clips using Image-to-Video or Text-to-Video motion dynamics.
- **Provider Support**: Kling AI 1.5 and Runway Gen-3 Alpha.
- **Zero Fake Notice**: If `KLING_API_KEY` is missing, the engine records an honest notification and directs the operator to add credentials rather than fabricating video files.

### Step 6 — Editing, Montage & Transitions (`dyn-step-06-editing`)
- **Objective**: Prepare the sequential cut list, apply recommended transitions (match-cut, cross-dissolve, whip pan), render kinetic typography overlays, and synchronize audio tracks.
- **Execution**: Remotion programmatic React video composition or FFmpeg transcoding pipeline.

### Step 7 — Quality Assurance & Validation (`dyn-step-07-qa`)
- **Objective**: Validate output asset integrity, file resolution, aspect ratio adherence, duration accuracy, and audio-video sync.
- **Human Approval Gate**: Final quality sign-off before client-facing release.

### Step 8 — Export & Delivery Vault (`dyn-step-08-export`)
- **Objective**: Upload final approved deliverables to the configured Google Drive folder (`root-folder-sutra-flagship`), write permanent asset references to Firestore, and notify client dashboard.

---

## 🗂️ Master Workflow Templates

The system ships with pre-configured templates in `dynamicWorkflowEngine.ts`:

1. **`wf-dynamic-8-master`**: The standard full-pipeline 8-step engine.
2. **`wf-arch-realestate-8`**: Tailored for luxury real estate and architecture, featuring aerial drone establishes, orbits, and day-to-night transitions.
3. **`wf-product-commercial-8`**: Focused on high-fashion and luxury products with macro details, smooth push-ins, and hero end-cards.
4. **`wf-brand-film-8`**: Narrative-driven campaign pipeline emphasizing human storytelling, cinematic reveals, and color grading.
