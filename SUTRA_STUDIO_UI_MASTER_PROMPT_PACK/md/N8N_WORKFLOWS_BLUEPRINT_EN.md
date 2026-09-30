# SYNAPSE KINETIC — Master n8n Automation Workflows & Production Prompts (English)

## 1. Global n8n Workflow Architecture Overview

The **SYNAPSE KINETIC** automation infrastructure is composed of **1 Master Orchestration Pipeline** and **5 Specialized Domain Pipelines** running on self-hosted n8n (Docker). Each workflow exposes secure webhook triggers, handles automated retry queues, updates PostgreSQL state in real time, and dispatches multi-channel client alerts (WhatsApp + Email).

```
+-------------------------------------------------------------------------------------------------------------+
|                                    SYNAPSE MASTER n8n ORCHESTRATION GRAPH                                   |
+-------------------------------------------------------------------------------------------------------------+
|                                                                                                             |
|                    [ Client Order Intake / Chat Webhook ]                                                   |
|                                       |                                                                     |
|                                       v                                                                     |
|                 +---------------------------------------------+                                             |
|                 | 01. MASTER AGENCY ORCHESTRATOR WORKFLOW     |                                             |
|                 |  * Parses Client Niche & Brand Guidelines   |                                             |
|                 |  * Initializes PostgreSQL Order Ledger      |                                             |
|                 |  * Dispatches Child Workflows via Webhooks  |                                             |
|                 +---------------------+-----------------------+                                             |
|                                       |                                                                     |
|       +-------------------------------+-------------------------------+---------------------+               |
|       |                               |                               |                     |               |
|       v                               v                               v                     v               |
| +------------+                +---------------+               +---------------+     +---------------+       |
| | 02. INTAKE |                | 03. TREND     |               | 04. BANNER    |     | 05. VIDEO     |       |
| | & CRM CHAT |                | RESEARCH      |               | SYNTHESIS     |     | COMMERCIALS   |       |
| | LLM AGENT  |                | ANALYZER      |               | ENGINE        |     | PIPELINE      |       |
| +-----+------+                +-------+-------+               +-------+-------+     +-------+-------+       |
|       |                               |                               |                     |               |
|       +-------------------------------+-------------------------------+---------------------+               |
|                                       |                                                                     |
|                                       v                                                                     |
|                 +---------------------------------------------+                                             |
|                 | 06. META ADS AUTONOMOUS CAMPAIGN LAUNCHER   |                                             |
|                 |  * Verifies Facebook Page (Client/Agency)   |                                             |
|                 |  * Builds Ad Sets, Targeting & Daily Budget |                                             |
|                 |  * Uploads Creatives & Activates Live Ads   |                                             |
|                 +---------------------------------------------+                                             |
+-------------------------------------------------------------------------------------------------------------+
```

---

## 2. Detailed n8n Workflow Specifications

### Workflow 01: Synapse Master Agency AI Orchestrator
- **Webhook Endpoint**: `POST /webhook/synapse-master-orchestrator`
- **Trigger**: Client places an order on the website or completes chat intake.
- **Node Sequence**:
  1. **Webhook Ingestion Node**: Captures `{ client_id, niche, plan: "weekly" | "monthly", services: ["banners", "video", "meta_ads", "website"], brand_assets: { logo_url, primary_color, font } }`.
  2. **Code Parser Node (JavaScript)**: Validates input, calculates delivery deadlines (Weekly: 48h SLA, Monthly: 24h SLA), and assigns priority queue.
  3. **PostgreSQL Insert Node**: Writes record to `orders` and `client_pipelines` table.
  4. **HTTP Dispatcher Nodes (Parallel)**:
     - Calls `POST /webhook/synapse-trend-research-engine`
     - Calls `POST /webhook/synapse-brand-banner-generator`
     - If `services.includes("video")` -> Calls `POST /webhook/synapse-video-reels-pipeline`
     - If `services.includes("meta_ads")` -> Pre-configures Meta Ad Draft
  5. **WhatsApp & Resend Node**: Dispatches live tracking dashboard link to client mobile and email.

---

### Workflow 02: Conversational Client Intake & Requirement Collector
- **Webhook Endpoint**: `POST /webhook/synapse-client-intake-chat`
- **Trigger**: Every user message in the client onboarding chat interface.
- **Node Sequence**:
  1. **Chat Ingestion Node**: Receives `{ session_id, message, uploaded_files }`.
  2. **LLM Chain Node (Google Gemini 2.0 Flash / Groq Llama 3.3 70B)**:
     - Maintains conversational context buffer.
     - Guides the client through 4 essential checkpoints:
       1. Business Niche & Core Selling Proposition.
       2. Brand Assets (Logo upload, Brand Color Hex codes).
       3. Target Audience & Geographic Market.
       4. Preferred Plan (Weekly Sprint vs. Monthly Growth).
  3. **File Validator Node**: Extracts high-res SVG/PNG logos and verifies color hex codes (`^#([A-Fa-f0-9]{6})$`).
  4. **PostgreSQL Update Node**: Stores extracted parameters in `client_brand_profiles`.
  5. **Human Takeover Switch**: If client requests human agent or enterprise custom scope, sends instant Telegram/Discord ping to Agency Director.

---

### Workflow 03: Niche-Specific Social Media Trend & Viral Hook Analyzer
- **Webhook Endpoint**: `POST /webhook/synapse-trend-research-engine`
- **Trigger**: Fired by Master Orchestrator or scheduled weekly cron.
- **Node Sequence**:
  1. **Input Parser**: Reads `{ niche, target_region, competitor_handles }`.
  2. **SerpAPI & Meta Graph Query Node**: Searches top viral Instagram Reels, TikTok videos, and Facebook ad libraries in the target niche.
  3. **DeepSeek V3 / Groq Llama 3.3 LLM Node**:
     - Analyzes scraped post transcripts and engagement metrics.
     - Extracts: Top 5 Viral Hooks, 3 High-Converting Emotional Angles, Recommended Audio Pacing, and Visual Aesthetics.
  4. **JSON Schema Validator**: Formats output strictly into `{ viral_hooks: [], ad_angles: [], visual_prompts: [] }`.
  5. **Database Storage Node**: Inserts research into `trend_insights` for creative pipelines.

---

### Workflow 04: Automated Multi-Format Brand Banner Synthesis
- **Webhook Endpoint**: `POST /webhook/synapse-brand-banner-generator`
- **Trigger**: Trend research completion event.
- **Node Sequence**:
  1. **Prompt Generator Node**: Combines trend angles + client brand color palette into 8K visual prompts.
  2. **FLUX.1 / SDXL API Node (HuggingFace / Replicate)**: Generates 3 aspect ratios:
     - `1:1` (Square Instagram/Facebook Feed)
     - `9:16` (Instagram Stories / Reels Ads)
     - `16:9` (Facebook Desktop / Website Hero)
  3. **Node.js Sharp / Canvas Compositor Node**:
     - Layers client logo on top-left / top-center with automatic contrast shadow.
     - Overlays headline typography with clean commercial gradient.
     - Adds branded CTA button badge ("Shop Now", "Book Free Demo", "Get Quote").
  4. **Watermark & S3 Upload Node**: Generates low-res watermarked preview for client review and full 4K lossless PNG for final delivery.
  5. **Client Notification Webhook**: Triggers WhatsApp message: *"Your new ad banners are ready for preview!"*.

---

### Workflow 05: Niche-Specific AI Video & Commercial Pipeline
- **Webhook Endpoint**: `POST /webhook/synapse-video-reels-pipeline`
- **Trigger**: Video script approval or automated weekly video queue.
- **Node Sequence**:
  1. **Scriptwriter Node (GPT-4o / Claude 3.5 Sonnet)**: Produces a high-retention 15s to 30s video script with exact visual storyboard notes.
  2. **ElevenLabs / Piper TTS Node**: Generates studio-quality neural voiceover with natural pauses and emotional emphasis.
  3. **Generative Video Node (Runway Gen-3 Alpha / Kling AI / Luma Dream Machine)**:
     - For Product / E-com: 3D rotating product camera paths.
     - For Interior Design / Real Estate: Cinematic drone flythroughs & architectural slow-pans.
     - For B2B / SaaS: AI Talking Head Avatar (HeyGen API) with dynamic screen recordings.
  4. **FFmpeg Cloud Compositor Node**:
     - Syncs video clips with voiceover audio.
     - Automatically generates animated kinetic subtitles (Word-by-Word highlighting).
     - Mixes subtle background music (-18dB).
     - Burns client logo watermark into top corner.
  5. **Cloudinary / AWS S3 CDN Node**: Uploads streaming-optimized 1080p / 4K MP4 deliverable.

---

### Workflow 06: Meta Ads Manager Autonomous Campaign Launcher
- **Webhook Endpoint**: `POST /webhook/synapse-meta-ads-automation`
- **Trigger**: Client / Admin clicks "Launch Live Campaign" in Dashboard.
- **Node Sequence**:
  1. **Meta Business Manager Handshake Node**:
     - Option A: Connects client's existing Facebook Page & Ad Account via OAuth2.
     - Option B: Automatically creates or uses Agency Managed Partner Page.
  2. **Targeting & AdSet Configurator**:
     - Sets budget (Daily or Lifetime as specified by client plan).
     - Configures geo-targeting, age, language, and high-affinity interest categories.
  3. **Creative Ingestion (Meta Graph API)**:
     - Uploads approved video MP4 / banner PNG to Meta Ad Asset Library.
     - Injects Primary Text, Headline, Description, and Website Destination URL with UTM tracking parameters (`utm_source=meta_ads&utm_campaign=synapse_kinetic`).
  4. **Campaign Activation Node**: Turns campaign status to `ACTIVE`.
  5. **Telemetry Poller Node (Hourly Cron)**: Fetches Impressions, Clicks, CPC, CTR, and ROAS back to Synapse Kinetic Admin Dashboard.

---

## 3. Master Production Prompts Library

### Prompt 01: Niche Trend & Viral Hook Research (Instagram & Facebook)
```text
System: You are an Elite Autonomous Growth Marketer and Social Media Trend Analyst.
Input Variables:
- Niche: {CLIENT_NICHE}
- Target Demographics: {TARGET_AUDIENCE}
- Geographic Region: {TARGET_GEO}

Objective:
Analyze real-time engagement trends and produce a comprehensive creative strategy.

Output Requirements (Strict JSON):
{
  "trending_hashtags": ["#tag1", "#tag2", "#tag3"],
  "top_5_viral_hooks": [
    "Hook 1 (Curiosity gap)",
    "Hook 2 (Contrarian viewpoint)",
    "Hook 3 (Direct problem callout)",
    "Hook 4 (Social proof metric)",
    "Hook 5 (Instant transformation)"
  ],
  "copywriting_angles": [
    {
      "type": "Problem-Agitate-Solve",
      "headline": "...",
      "body_copy": "...",
      "cta": "..."
    },
    {
      "type": "FOMO / Competitive Edge",
      "headline": "...",
      "body_copy": "...",
      "cta": "..."
    }
  ],
  "visual_direction": {
    "lighting": "Studio contrast / Golden hour / Clean tech neon",
    "color_mood": "...",
    "pacing": "Fast-cut dynamic (0.8s cuts) / Smooth slow pan (2.5s cuts)"
  }
}
```

### Prompt 02: High-CTR Direct Response Ad Banner Visual
```text
Commercial advertising photography for {CLIENT_BRAND_NAME} in the {CLIENT_NICHE} sector.
Visual Scene: Modern luxury aesthetic, {VISUAL_SUBJECT_DESCRIPTION}.
Color Theme: Dominant palette using {PRIMARY_HEX} with accents of {SECONDARY_HEX} and {ACCENT_HEX}.
Composition: Negative space in top-center for headline typography, subject placed in lower-third with sharp focus.
Lighting: Professional commercial studio lighting, soft volumetric shadows, 8K resolution, photorealistic Hasselblad camera quality, zero distortion.
Negative Prompt: text, watermark, blurry elements, noisy artifacts, cartoon, low resolution.
```

### Prompt 03: 30-Second High-Conversion Video Script & Storyboard
```text
Write a high-converting 30-second video script for an Instagram Reel & Meta Video Ad for {CLIENT_BRAND_NAME}.
Niche: {CLIENT_NICHE}
Goal: {CONVERSION_GOAL: Lead Gen / Direct Sales / Bookings}

Structure:
- [00:00 - 00:03] The 3-Second Hook: Explosive visual + pattern-interrupt voiceover line.
- [00:03 - 00:12] The Agitation: Visualizing the client's biggest frustration.
- [00:12 - 00:22] The Solution & Showcase: Introducing {CLIENT_BRAND_NAME} with 3 core benefits.
- [00:22 - 00:30] The Call to Action: Urgency trigger + clear instructions to click link / book now.

Output format:
Scene | Time | Visual Cue (Runway/Kling prompt) | Audio Voiceover | On-Screen Caption
```

### Prompt 04: Interior Design 3D & 360° Panoramic Rendering
```text
Photorealistic 8K architectural interior rendering of a {ROOM_TYPE: Contemporary Villa Living Space / Executive Boardroom / Luxury Kitchen}.
Interior Architecture: Clean geometric lines, natural light pouring through floor-to-ceiling glass panoramic windows overlooking {SURROUNDING_VIEW: City Skyline / Forest / Ocean}.
Materials: Handcrafted white oak cabinetry, Calacatta gold marble island, matte black architectural hardware, recessed warm LED cove strips (3000K).
View Perspective: {VIEW_MODE: 2D Isometric Architectural Plan / 3D Wide-Angle Perspective (24mm) / 360-Degree Equirectangular Panoramic Sphere / Orbiting Aerial Drone Shot}.
Camera & Render Engine: Hasselblad H6D-100c, f/8, Octane Render style, hyper-realistic reflections, ray-traced ambient occlusion.
```
