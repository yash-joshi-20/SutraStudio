# SYNAPSE KINETIC — Master Technical & Automation Architecture Specification (English)

## 1. Complete Services to AI Tools & API Directory

| Service Offered | Primary AI Tool & Model | Official Direct Link | How to Sign Up & Get API Key | Cost Tier | Automation Classification |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Conversational Client Intake & Onboarding** | Google Gemini 2.0 Flash & Groq Llama 3.3 70B | [aistudio.google.com](https://aistudio.google.com) / [console.groq.com](https://console.groq.com) | Log in with Google/GitHub -> Click **"Get API Key"** -> Copy Key into `.env` | **100% FREE** (1,500 req/day on Gemini, 14,400 req/day on Groq) | **100% AI Automated** |
| **Social Media Trend Research (Insta & FB)** | Meta Graph API + SerpAPI / Apify + SambaNova DeepSeek V3 | [developers.facebook.com](https://developers.facebook.com) / [cloud.sambanova.ai](https://cloud.sambanova.ai) | Register Meta Developer Account -> Create App -> Get Page Access Token. SambaNova: Sign up -> APIs -> Generate Key. | Free Tier (Meta Graph is free; SambaNova has generous free tier) | **100% n8n Automated** |
| **Brand Ad Banners (1:1, 9:16, 16:9)** | FLUX.1-schnell / SDXL (Hugging Face Serverless) + Sharp Compositor | [huggingface.co/settings/tokens](https://huggingface.co/settings/tokens) / [dash.cloudflare.com](https://dash.cloudflare.com) | Sign up at Hugging Face -> Settings -> Access Tokens -> Create Read Token. | Free on HF Serverless / Low cost on Replicate ($0.003/img) | **90% AI + 10% Logo Overlay (Sharp)** |
| **AI Video Reels & Commercials** | Runway Gen-3 Alpha / Kling AI / Luma Dream Machine / HeyGen | [runwayml.com](https://runwayml.com) / [klingai.com](https://klingai.com) / [heygen.com](https://heygen.com) | Create developer account -> Billing -> API Keys -> Copy Bearer Token. | Paid Tier ($0.10 - $0.50/min video) | **85% AI + 15% Review/Render** |
| **Autonomous Website Engineering (B2B, B2C, E-com, Portfolio)** | Claude 3.5 Sonnet / DeepSeek Coder V2 + Next.js App Router | [console.anthropic.com](https://console.anthropic.com) / [github.com/marketplace/models](https://github.com/marketplace/models) | Sign up on Anthropic Console or GitHub Marketplace Models -> Generate Personal Access Token. | Free on GitHub Models (150 req/hr) / Pay-per-token on Anthropic | **80% AI + 20% Automated Build Validation** |
| **Interior 2D, 3D, 360° & Drone View** | Tripo3D / Spline / Three.js / ControlNet Depth | [tripo3d.ai](https://tripo3d.ai) / [spline.design](https://spline.design) / [threejs.org](https://threejs.org) | Tripo3D: Sign up -> API Dashboard. Three.js: Free Open Source NPM library. | Free WebGL Client-side / Tripo3D API ($10/mo) | **75% AI + 25% WebGL Client Calibration** |
| **Meta Ads Manager Campaign Automation** | Meta Marketing Graph API v21.0 | [developers.facebook.com/docs/marketing-apis](https://developers.facebook.com/docs/marketing-apis) | Create Meta Business App -> Add **`ads_management`**, **`pages_manage_ads`**, **`leads_retrieval`** permissions. | Free API access (Ad spend paid directly to Meta by client) | **90% Automated + 10% Budget Sanity Check** |
| **Instant Client Notifications** | Meta WhatsApp Cloud API + Resend | [developers.facebook.com](https://developers.facebook.com) / [resend.com](https://resend.com) | Resend: Sign up -> API Keys -> Create Key. WhatsApp: Meta App Dashboard -> WhatsApp -> API Setup. | **100% Free** (1,000 free WhatsApp convos/mo + 3,000 free emails/mo) | **100% Automated via n8n** |

---

## 2. Technology Stack Evaluation: Python vs. PHP vs. Node.js/TypeScript

| Evaluation Criteria | PHP (Laravel / Symfony) | Python (Django / FastAPI) | **Node.js / TypeScript (Next.js 14+ / NestJS)** | Verdict for SYNAPSE KINETIC |
| :--- | :--- | :--- | :--- | :--- |
| **Frontend & 3D WebGL Integration** | Poor (Requires separate SPA framework) | Poor (Requires separate SPA framework) | **Native (React, Three.js, Spline, GSAP, WebGL)** | **Node.js/Next.js Wins** — Full-stack single language with instant SSR/SSG. |
| **Real-Time Live Chat & WebSockets** | Complex (Requires Swoole or external Pusher) | Good (FastAPI WebSockets / ASGI) | **Exceptional (Node.js Event Loop, Socket.io, Server-Sent Events)** | **Node.js Wins** — Zero-latency streaming responses from AI LLMs. |
| **Heavy AI, CV & 3D Mesh Processing** | Extremely Weak (No AI libraries) | **Industry Gold Standard (PyTorch, Diffusers, OpenCV, Trimesh)** | Moderate (via ONNX runtime or Python child process) | **Python Wins** — Best used as a lightweight FastAPI microservice for heavy CV tasks. |
| **n8n & Webhook Interoperability** | Standard REST | Standard REST | **Native (Both n8n and Next.js run on Node.js/TypeScript)** | **Node.js Wins** — Shared JSON typings and instant payload parsing. |
| **Overall Recommended Hybrid Architecture** | ❌ Not recommended | 🟡 **Used as Specialized AI Microservice** | 🟢 **Primary Core Platform (Next.js App Router + TypeScript)** | **Unified TypeScript Core + Python AI Worker** |

---

## 3. Data Storage, Asset Retention & Client Privacy

```
+----------------------------------------------------------------------------------------------------+
|                                    DATA STORAGE & ASSET TOPOLOGY                                   |
+----------------------------------------------------------------------------------------------------+
|  1. Relational Structured Data (PostgreSQL via Supabase / Neon):                                   |
|     * Users, Auth Sessions, Role Permissions (Client vs Admin).                                    |
|     * Orders, Subscription Tiers (Weekly Sprint vs Monthly Retainer), Invoices.                     |
|     * Client Brand Guidelines (Hex Color Codes, Typography, Target Audience).                      |
|                                                                                                    |
|  2. Object & Media Storage (AWS S3 / Cloudinary CDN):                                              |
|     * Client Uploaded Logos (SVG, PNG, EPS).                                                       |
|     * Generated Ad Banners (1:1, 9:16, 16:9 in WebP & 4K PNG).                                     |
|     * High-Definition Video Commercials (1080p / 4K MP4 with H.264 / H.265 compression).          |
|     * 3D glTF / OBJ Meshes and 360° Equirectangular High-Res Panoramas.                            |
|                                                                                                    |
|  3. Fast In-Memory Cache & Token Rate Limiting (Redis):                                            |
|     * Real-Time Chat Context Buffer & Active LLM Token Counter.                                    |
|     * Session Authentication Tokens and Ephemeral AI Generation Jobs.                              |
|                                                                                                    |
|  4. Backup & Long-Term Archival (Enterprise Google Drive API):                                      |
|     * Automated 4-hour cron exports complete client deliverables into branded Google Drive folders.|
+----------------------------------------------------------------------------------------------------+
```

---

## 4. Meta Ads Manager Automation: AI vs. Manual & Page Linking

### How Meta Ads Automation Operates:
1. **Facebook & Instagram Asset Connection**:
   - **Scenario A (Client's Own Account)**: Client logs in via Facebook OAuth in Client Portal -> Authorizes `pages_manage_ads` & `ads_management` -> System connects directly to Client's Page ID & Ad Account ID.
   - **Scenario B (Agency Managed Account)**: System automatically creates or assigns a verified Agency Partner Page for the client, managing the ad spend on behalf of the client.
2. **AdSet Configuration (AI Automated)**:
   - Analyzes client niche -> Generates interest targeting (e.g., Luxury Interior Design -> Interests: Architectural Digest, Luxury Real Estate, Home Renovation, Age: 28-55, High-Income Zip Codes).
   - Sets daily spend cap according to client package.
3. **Creative Ingestion (n8n + Meta Graph API)**:
   - Uploads approved 1:1, 9:16 banners and MP4 video reels.
   - Injects AI-written primary copy, headline, CTA button ("Learn More", "Shop Now", "Get Quote"), and destination URL with UTM tracking parameters (`utm_source=synapse_meta_ads&utm_medium=reel_ad`).
4. **What is 100% AI vs. What Requires Manual Confirmation**:
   - **100% AI Automated**: Copywriting, visual resizing, audience interest mapping, UTM tag injection, and hourly telemetry sync (Impressions, Clicks, CTR, CPC, ROAS).
   - **Manual Safeguard**: Daily budget spend ceiling must be verified by Admin before campaign is set from `PAUSED` to `ACTIVE` to prevent accidental overspend.

---

## 5. Client Portal Experience: Pre-Login vs. Post-Login & Downloads

```
+----------------------------------------------------+----------------------------------------------------+
|               PRE-LOGIN (PUBLIC VIEW)              |             POST-LOGIN (CLIENT DASHBOARD)          |
+----------------------------------------------------+----------------------------------------------------+
| * Interactive 3D Agency Landing Page & Case Studies| * Active Order Status & 6-Stage Progress Tracker   |
| * Public AI Marketing ROI Calculator & Simulator   | * Interactive AI Chatbot (Free Intake & Support)   |
| * Plan Selection (Weekly Sprint vs Monthly Retainer| * Brand Kit Manager (Upload Logo, Hex Codes, Fonts)|
| * Free Interactive Lead Consultation Trigger       | * Deliverables Gallery:                            |
| * Secure Sign-In (Email Magic Link / Google Auth)  |   - 1080p HD & 4K UHD Video Downloads (MP4)        |
|                                                    |   - Lossless Ad Banners (1:1, 9:16, 16:9 PNG/WebP) |
|                                                    |   - 1-Click Interactive Website Live Preview       |
|                                                    |   - 360° Virtual Tour WebGL Viewer                 |
|                                                    | * Meta Ads Live Telemetry (Clicks, CTR, Leads)     |
|                                                    | * Billing, Invoices & Instant WhatsApp Alerts      |
+----------------------------------------------------+----------------------------------------------------+
```

---

## 6. Watermark Removal & Custom Brand Compositing

When raw images or video clips are generated by AI models, default logos or watermarks may be present. SYNAPSE KINETIC uses an automated **Cloud Compositing Engine**:

1. **For Images & Banners (Node.js Sharp / Canvas)**:
   - **Step 1**: Raw AI image is synthesized using lossless parameters without watermarks (using negative prompts: `watermark, logo, text, branding`).
   - **Step 2**: Node.js `sharp` composite pipeline overlays the **Client's Authentic Brand Logo** in the top corner with an adaptive drop-shadow.
   - **Step 3**: Adds clean commercial headline typography and CTA buttons.
   - **Step 4**: Watermarked low-res preview is generated for client approval; once approved, lossless 4K clean asset is made available for download.

2. **For Video Commercials (FFmpeg Cloud Filter Graph)**:
   ```bash
   # FFmpeg pipeline to crop, color-grade, burn clean client logo and animated kinetic captions
   ffmpeg -i raw_video.mp4 -i client_logo.png -filter_complex \
   "[0:v]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,eq=contrast=1.1:saturation=1.15[bg]; \
    [1:v]scale=180:-1[logo]; \
    [bg][logo]overlay=W-w-50:50[v]" \
   -map "[v]" -map 0:a? -c:v libx264 -crf 18 -preset fast output_master_reel.mp4
   ```
