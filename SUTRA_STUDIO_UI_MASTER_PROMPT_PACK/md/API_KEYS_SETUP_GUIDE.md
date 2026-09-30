# SYNAPSE KINETIC — Master API Keys & Environment Setup Guide
**Comprehensive Directory of All Platform API Keys, Direct Registration URLs, Free Tiers & GPay Configuration**

---

## 1. Quick Start: Single-Screen Setup

You can configure all API keys in **two easy ways**:
- **Option A (Interactive Admin Portal)**: Go to [Admin API Keys Manager](file:///d:/home/website/src/app/admin/api-keys/page.tsx) (`/admin/api-keys`) to view, add, or update keys with instant status indicators.
- **Option B (File Configuration)**: Open [`.env.local`](file:///d:/home/website/.env.local) and paste your API keys.

---

## 2. Complete API Directory & Free Tier Registration Links

| # | Variable Name | Service / Model | Purpose | Direct Registration Link | Free Tier Quota |
|---|---|---|---|---|---|
| 1 | **`OPENAI_API_KEY`** | OpenAI (GPT-4o / DALL-E 3) | Complex reasoning, copywriting & vision analysis | [platform.openai.com](https://platform.openai.com) | Pay-as-you-go ($5 credit on new accounts) |
| 2 | **`BFL_API_KEY`** | Black Forest Labs (FLUX.1 Pro) | 4K Photorealistic Ad Images & Banners | [docs.bfl.ml](https://docs.bfl.ml) | $0.04/image (Ultra high-fidelity) |
| 3 | **`GEMINI_API_KEY`** | Google Gemini 2.0 Flash | Conversational Intake, Routing & Lead Chat | [aistudio.google.com](https://aistudio.google.com) | 🟢 **1,500 req/day (100% Free)** |
| 4 | **`GROQ_API_KEY`** | Groq Cloud (Llama 3.3 70B) | Sub-second JSON extraction & ad hook generation | [console.groq.com](https://console.groq.com) | 🟢 **14,400 req/day (100% Free)** |
| 5 | **`SAMBANOVA_API_KEY`** | SambaNova (DeepSeek V3) | Viral social trend analysis & research | [cloud.sambanova.ai](https://cloud.sambanova.ai) | 🟢 **400 tokens/sec (Free Tier)** |
| 6 | **`GITHUB_TOKEN`** | GitHub Models (Claude 3.5 / GPT-4o) | Autonomous full-stack web code generation | [github.com/marketplace/models](https://github.com/marketplace/models) | 🟢 **150 req/hr (Free with GitHub)** |
| 7 | **`MIDJOURNEY_PROFILE_URL`** | Midjourney v6.1 | Commercial product visual synthesis | [midjourney.com](https://www.midjourney.com) | Standard $30/mo / ImagineAPI |
| 8 | **`RUNWAY_API_KEY`** | Runway Gen-3 Alpha | 4K Cinematic AI Video Ads & Drone Shots | [runwayml.com](https://runwayml.com) | Pay-per-generation (~$0.10/sec) |
| 9 | **`HEYGEN_API_KEY`** | HeyGen API | AI Video Avatars & Talking Head Presenters | [heygen.com](https://heygen.com) | Free trial / Paid API |
| 10| **`SUPABASE_SERVICE_ROLE_KEY`**| Supabase Cloud | Multi-tenant PostgreSQL database & Auth | [supabase.com](https://supabase.com) | 🟢 **500MB DB, 50k MAU (100% Free)** |
| 11| **`EXPO_TOKEN`** | Expo EAS Cloud | Automated Android & iOS Mobile App Builds | [expo.dev](https://expo.dev) | 🟢 **Free tier (30 cloud builds/mo)** |
| 12| **`META_GRAPH_ACCESS_TOKEN`** | Meta Marketing Graph API v21.0 | Facebook & Instagram Ads Manager Launcher | [developers.facebook.com](https://developers.facebook.com) | 🟢 **100% Free API Access** |
| 13| **`RESEND_API_KEY`** | Resend Transactional Email | Invoices & Deliverable Notification Emails | [resend.com](https://resend.com) | 🟢 **3,000 free emails/month** |
| 14| **`NEXT_PUBLIC_DEFAULT_UPI_VPA`** | Google Pay / UPI Virtual ID | Receives client payments directly in bank | Your GPay / Bank App | 🟢 **₹0 Fees (100% Free)** |
| 15| **`NEXT_PUBLIC_DEFAULT_UPI_PAYEE`**| Business Payee Display Name | Displayed on client's GPay scan screen | Your Business Legal Name | 🟢 **Free** |

---

## 3. Production Ready `.env.local` Example

```env
# --- AI CORE REASONING & INTAKE (FREE & PAID) ---
OPENAI_API_KEY=your_openai_api_key_here
BFL_API_KEY=your_bfl_api_key_here
GEMINI_API_KEY=your_gemini_api_key_here
GROQ_API_KEY=your_groq_api_key_here
SAMBANOVA_API_KEY=your_sambanova_api_key_here
GITHUB_TOKEN=your_github_token_here
MIDJOURNEY_PROFILE_URL=https://www.midjourney.com/@740c40f0-0c92-4465-8dce-cea24facb80f

# --- VIDEO & GENERATIVE ENGINES ---
RUNWAY_API_KEY=your_runway_api_key_here
HEYGEN_API_KEY=your_heygen_api_key_here

# --- DATABASE & BACKEND (SUPABASE / MYSQL) ---
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# --- MOBILE APP CI/CD ---
EXPO_TOKEN=your_expo_cloud_token_here

# --- META ADS & NOTIFICATIONS ---
META_GRAPH_ACCESS_TOKEN=your_meta_system_token
META_AD_ACCOUNT_ID=act_your_account_id
RESEND_API_KEY=your_resend_api_key

# --- GPAY & DYNAMIC UPI CHECKOUT ---
NEXT_PUBLIC_DEFAULT_UPI_VPA=9898234812@okaxis
NEXT_PUBLIC_DEFAULT_UPI_PAYEE=Synapse Kinetic AI Studio
NEXT_PUBLIC_APP_URL=http://localhost:3000
```
