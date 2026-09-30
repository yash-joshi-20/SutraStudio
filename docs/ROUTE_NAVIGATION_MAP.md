# ROUTE_NAVIGATION_MAP.md - SutraStudio Navigation & Route Audit (Step 02)

## 1. Executive Summary
This document provides an exhaustive architectural audit of every route, navigation element, role-based guard, and state lifecycle in the SutraStudio application.
- **Total Registered Routes**: 16 Web Routes + 5 API Endpoints (21 Total).
- **Page Count Status**: Strictly preserved without adding or deleting any routes.
- **Authentication**: Firebase Authentication + Custom Claims (`role: client | admin`).
- **Database Boundary**: Cloud Firestore metadata + Google Drive large asset proxy.
- **Theme Direction**: Global Light Theme / Warm Ivory (`#F8F5EF` / `#FFFDF9`).

---

## 2. Navigation Surface Inventory & Mapping

```
                                  [ SUTRA STUDIO ]
                                         │
        ┌────────────────────────────────┼────────────────────────────────┐
        ▼                                ▼                                ▼
  PUBLIC MARKETING                 AUTHENTICATION                  PROTECTED PORTALS
  Navbar / Mobile Drawer           Sign In / Sign Up               Role-Gated Routes
  ├─ / (Home)                      └─ /login                       ├─ CLIENT PORTAL
  ├─ /services                                                     │   ├─ /dashboard
  ├─ /studio                                                       │   ├─ /orders (Wizard)
  ├─ /projects                                                     │   ├─ /projects-client
  ├─ /pricing                                                      │   ├─ /media (Drive Sync)
  ├─ /about                                                        │   ├─ /chat (Sutra AI)
  └─ /contact                                                      │   ├─ /invoices
                                                                   │   └─ /profile
                                                                   └─ ADMIN WORKSPACE
                                                                       └─ /admin
```

---

## 3. Comprehensive Route Audit Matrix

| Route | Surface | Protection Level | Allowed Roles | Primary Purpose & Features | Navigation Linkages | Data Sources |
|---|---|---|---|---|---|---|
| `/` | Public | Public | All | Home landing: Hero with GSAP, 12 services grid, Why Partner trio, filterable portfolio, dark CTA band | Top Navbar, Footer, Mobile Bottom Nav | Static + `servicesData`, `projectsData` |
| `/services` | Public | Public | All | Service catalog: category tabs (Creative, Design, Dev, Marketing, Automation), starting prices, order CTAs | Navbar, Footer, Home Links | `servicesData` → `/orders?service=slug` |
| `/studio` | Public | Public | All | Studio philosophy: 4 pillars of Vedic craft + AI engineering, 4-step delivery method | Navbar, Footer | Static content |
| `/projects` | Public | Public | All | Portfolio gallery: category filters, 4:5 cards with 360°/Video badges, detail modal | Navbar, Footer, Mobile Nav | `projectsData` |
| `/pricing` | Public | Public | All | Transparent packages: Starter ($750), Studio Growth ($1,850), Bespoke Enterprise ($3,800+) | Navbar, Footer | Static tiers |
| `/about` | Public | Public | All | Brand heritage: studio mission, trust stats (500+ projects, 200+ clients, 48h turnaround) | Navbar, Footer | Static content |
| `/contact` | Public | Public | All | Client inquiry: form with service picker, studio contacts, direct link to Sutra AI Assistant | Navbar, Footer | `/api/inquiries` → Firestore `inquiries` |
| `/login` | Auth | Public / Redirect | Guests | One-click Google Sign-In + Email/Password authentication; redirects to `/dashboard` | Navbar CTA, Drawer, Footer | Firebase Auth |
| `/dashboard` | Portal | **Protected** | `client`, `admin` | Client overview: 4 KPI tiles, recent orders list with status pills, toggleable zero-data empty state | Portal Sidebar, Mobile Nav | Firestore `orders`, `users/{uid}` |
| `/orders` | Portal | **Protected** | `client`, `admin` | 4-step order wizard (1. Service → 2. Details → 3. References/Drive → 4. Confirm) | Portal Sidebar, Mobile Nav, CTA pills | Firestore `orders`, Google Drive |
| `/projects-client` | Portal | **Protected** | `client`, `admin` | Client project progress: milestone bars, delivery dates, review & approvals | Portal Sidebar, Mobile Nav | Firestore `projects`, `deliverables` |
| `/media` | Portal | **Protected** | `client`, `admin` | Client media library: organized Google Drive folders (Images, Videos, 3D, Docs), download proxy | Portal Sidebar | Google Drive API, Firestore `assets` |
| `/chat` | Portal | **Protected** | `client`, `admin` | Sutra AI assistant: requirement classification, isolated workflow router, human admin takeover | Portal Sidebar, Mobile Nav, CTAs | `/api/chat` → Firestore `conversations` |
| `/invoices` | Portal | **Protected** | `client`, `admin` | Financial receipts: billing history, paid status badges, PDF download triggers | Portal Sidebar | Firestore `payments`, `orders` |
| `/profile` | Portal | **Protected** | `client`, `admin` | Brand vault: company info, brand palette hex codes, private Google Drive folder reference | Portal Sidebar | Firestore `clients/{uid}` |
| `/admin` | Admin | **Strict Admin** | `admin` | Operations command: client directory, live AI chats & takeover, workflow run pipeline, audit trail | Portal Sidebar (Admin badge) | Firestore `users`, `activityLogs`, `workflowRuns` |

---

## 4. Protected API Route Matrix

| Endpoint | Method | Auth Guard | Description & Workflow Routing |
|---|---|---|---|
| `/api/auth/session` | GET, POST | Firebase ID Token | Verifies client session and decodes custom claims (`client` vs `admin`) |
| `/api/chat` | POST | Authenticated Session | Classifies incoming brief into isolated workflow (`image`, `video`, `3D`, `interior`, `website`, etc.) |
| `/api/orders` | GET, POST | Authenticated Session | Client fetches their own orders (RLS enforced) or places a new studio order |
| `/api/inquiries` | POST | Public (Rate Limited) | Captures public lead inquiries and logs to Firestore `inquiries` |
| `/api/workflows` | POST | Admin Role Only | Dispatches or monitors isolated AI/n8n pipeline runs |

---

## 5. Security & Tenant Isolation Rules
1. **Client Isolation**: Client A can never access Client B's orders, projects, chat threads, or Google Drive media. Firestore security rules enforce `request.auth.uid == resource.data.clientId`.
2. **Admin Oversight**: Only users with the custom claim `role: 'admin'` can access `/admin` and call `/api/workflows`.
3. **No Secrets in Frontend**: Google Drive service accounts, Firebase Admin private keys, and n8n webhook secrets exist only in server-side route handlers.
