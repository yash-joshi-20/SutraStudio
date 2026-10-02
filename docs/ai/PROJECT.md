# PROJECT.md — SutraStudio Master Specification

## 1. Product Vision & Positioning
**Sutra Studio** is an AI-powered creative and digital atelier selling **12 specialized disciplines** where traditional Indian aesthetic principles meet modern digital engineering.
- **Tagline**: Ideas ◆ Design ◆ Development ◆ Growth / Tradition Meets Technology
- **Theme**: Premium white / warm ivory (`#FAF9F5`, `#FFFDF9`), charcoal typography (`#0F172A`), saffron brass accents (`#D4A35A`), warm sand (`#F8F5EF`), and deep brown grounding (`#5C3A1E`).
- **Core Business Model**: Clients subscribe to **monthly packages (plans)** or commission **individual services** ("From ₹X"), collaborate with the conversational **Sutra AI** creative concierge, and receive finished deliverables **only after admin approval**.
- **Mobile App Parity**: Cross-platform mobile application (React Native / Expo) mirrors the same feature set, Firebase auth, and API endpoints for client partners.

---

## 2. The 12 Studio Disciplines & Service Catalog

| # | Service Name | Category | Pricing Tier (INR) | Primary Deliverable Scope |
| :--- | :--- | :--- | :--- | :--- |
| 1 | **Image Creation** | Creative | From ₹9,999 | 4K key visuals, advertising graphics, social packs |
| 2 | **Video Creation** | Creative | From ₹24,999 | 4K cinematic commercial reels, promo videos, audio |
| 3 | **3D Modeling** | Design | From ₹34,999 | High-poly spatial renders, interactive GLTF/USDZ models |
| 4 | **360 View** | Design | From ₹18,999 | Spherical HDR virtual architectural & showroom tours |
| 5 | **Interior Design** | Design | From ₹29,999 | Lighting, materiality CGI & spatial interior design |
| 6 | **Window Design** | Design | From ₹14,999 | Luxury retail storefront visual merchandising |
| 7 | **Digital Marketing** | Marketing | From ₹19,999 | Omni-channel ad campaigns, multi-ratio formats |
| 8 | **Meta Ads Launcher** | Marketing | From ₹12,999 | Direct Facebook & Instagram ad campaign launcher |
| 9 | **Website Development** | Development | From ₹39,999 | Next.js editorial luxury web platforms (Sub-second speed) |
| 10 | **Web App Development** | Development | From ₹59,999 | Full-stack client portals, SaaS dashboards & databases |
| 11 | **Mobile App Setup** | Development | From ₹49,999 | Cross-platform iOS and Android apps on Expo |
| 12 | **AI Automation** | Automation | From ₹24,999 | Intelligent agent pipelines, CRM sync & automations |

---

## 3. Monthly Subscription Packages (Data-Driven Plans)

1. **Starter Creative Pack** (`₹9,999 / month`):
   * 5 Master 4K Renders / Month
   * 1 Motion Commercial Reel with Audio
   * Private Google Drive Vault Archive
   * Expiring Revocable Deliverable Links
   * 48-Hour Turnaround SLA

2. **Growth Creative Studio** (`₹24,999 / month` — Most Popular):
   * 15 Master 4K Renders / Month
   * 4 Commercial Motion Reels
   * 2 Interactive 3D Spatial Renders
   * Meta Ads Campaign Launcher Integration
   * Dedicated Art Director Supervision
   * 24-Hour Production SLA

3. **Atelier Enterprise Retainer** (`₹59,999 / month`):
   * 40 Master 4K Key Visuals / Month
   * 12 Commercial Motion Reels
   * 2 Bespoke 360 Virtual Interactive Tours
   * Custom Web App Platform Development
   * Full Meta Ads Suite & Audience Sync
   * Executive Producer 1-on-1 Direct Access

---

## 4. Role-Based Access Control (RBAC) Matrix

| Role | Access Scope & Clearances | Primary Landing |
| :--- | :--- | :--- |
| **`superAdmin`** | Master control over clients, orders, approvals, plans, pricing, staff roles, settings, and audit logs | `/admin` |
| **`admin`** | Executive Producer clearance; full project approval, client directory, and workflow supervision | `/admin` |
| **`metaAdsManager`** | Authorized to launch and pause Meta ad campaigns, inspect client assets, and enforce spend caps | `/admin?tab=site-control` |
| **`editor`** | Draft review, content editing, and media vault staging uploads | `/admin` |
| **`support`** | Real-time chat supervisor and live client conversation takeover | `/admin?tab=conversations` |
| **`client`** | Tenant-isolated client portal; order creation, deliverable review, Sutra AI, and private vault | `/dashboard` |

---

## 5. Page & Route Inventory (Preserved Exact 21 Canonical Routes)

### Public Atelier Pages (7 Pages)
* `/`: Studio Landing Page (Hero, Showcases, 12 Services, Process, Pricing Preview, Testimonials, CTA)
* `/services`: Comprehensive 12-Service Catalog with category filtering
* `/studio`: Studio Philosophy, Heritage, Craftsmanship & Technology
* `/projects`: Curated Portfolio & Case Studies
* `/pricing`: Monthly Packages, Per-Service Starting Rates & Interactive FAQ
* `/about`: Studio Heritage & Leadership Story
* `/contact`: Client Discovery & Briefing Intake Form

### Client Portal & Workspace (8 Pages)
* `/login`: Secure Client & Admin Authentication Portal
* `/dashboard`: Client Command Workspace & Active Quota Tracking
* `/orders`: 4-Step Order Creation Wizard & Deliverable Approval Hub
* `/projects-client`: Deliverable Review, File Vault & Version History
* `/media`: Google Drive Media Vault Gallery & 3D/Video Previews
* `/chat`: Conversational Sutra AI Studio Assistant & Art Director Channel
* `/invoices`: Invoices, Receipts & Monthly Subscription Billing
* `/profile`: Client Organization Profile, Security & API Settings

### Admin Command Workspace (1 Page)
* `/admin`: Centralized Executive Command Center (Operations Hub, Client Directory, Approvals Queue, Chat Takeover, Creative Pipelines, Site Control & Audit Logs)

### API Endpoints (5 Endpoints)
* `/api/auth/session`: Session Verification & Role Clearance Check
* `/api/orders`: Order Creation, Deliverable Approvals & Revisions Router
* `/api/chat`: Sutra AI RAG Inference & Executive Producer Takeover
* `/api/workflows`: Isolated AI Workflow Engine Dispatcher
* `/api/inquiries`: Client Lead Capture & CRM Pipeline
