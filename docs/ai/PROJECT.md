# PROJECT.md — SutraStudio Master Specification

## 1. Product Vision & Positioning
**Sutra Studio** is a premier creative technology and design studio where traditional Indian aesthetic principles meet modern digital engineering.
- **Tagline**: Ideas ◆ Design ◆ Development ◆ Growth
- **Theme**: Premium white / warm ivory (`#FAF9F5`, `#FFFDF9`), charcoal typography (`#0F172A`), muted saffron brass accents (`#D4A35A`), and deep brown grounding (`#5C3A1E`).
- **Core Pillars**:
  1. High-end AI & human creative synthesis (Image, Video, 3D, Interior, Web).
  2. Frictionless client order tracking and deliverable management.
  3. Real-time intelligent studio AI assistant.
  4. Enterprise-grade admin command center with n8n automated routing.

---

## 2. Page & Route Inventory (Preserved Exact 21 Routes)

### Public Experience (7 Pages)
- `/`: Studio Landing Page (Hero, Showcases, Services, Process, Pricing Preview, Testimonials, CTA)
- `/services`: Comprehensive 6-Pillar Creative Service Catalog
- `/studio`: Studio Philosophy, Heritage, Craftsmanship & Technology
- `/projects`: Curated Portfolio & Deliverable Case Studies
- `/pricing`: Transparent Tiered Packages & Custom Estimates
- `/about`: Studio Heritage & Leadership Story
- `/contact`: Client Discovery & Consultation Inquiry Form

### Client Portal & Protected Workspace (8 Pages)
- `/login`: Secure Client & Admin Authentication
- `/dashboard`: Client Command Center & Active Project Metrics
- `/orders`: Multi-Step Order Creation Wizard & Submission Pipeline
- `/projects-client`: Deliverable Review, File Vault & Version History
- `/media`: Asset Gallery, Video Previews & Google Drive Storage
- `/chat`: Real-Time Sutra AI Creative Assistant
- `/invoices`: Billing, Milestone Receipts & Payment Records
- `/profile`: Organization Profile, Team Members & API Keys

### Admin Command Workspace (1 Page)
- `/admin`: Studio Management, Order Processing, Review Queues & Analytics

### Backend API Endpoints (5 Endpoints)
- `/api/auth/session`: Session Verification & Role Management
- `/api/orders`: Order CRUD & Submission Router
- `/api/chat`: AI Assistant Stream & Deliverable Knowledge Router
- `/api/workflows`: n8n Workflow Trigger & Webhook Dispatcher
- `/api/inquiries`: Client Lead Capture & CRM Dispatcher

---

## 3. Technology Stack & Architecture
- **Framework**: Next.js 16.3 (Turbopack, App Router, React 19)
- **Styling**: Tailwind CSS v4 + Vanilla CSS Design Tokens
- **Typography**: Playfair Display (Serif Display) + Inter (Modern Sans)
- **Motion**: Framer Motion 13 + GSAP 3.15
- **Icons**: Lucide React + Native Scalable Vector Lotus SVGs
- **Database / Auth**: Firebase Authentication & Cloud Firestore
- **Asset Storage**: Google Drive Cloud Storage Integration
- **Automation**: n8n Webhook Workflow Dispatcher
