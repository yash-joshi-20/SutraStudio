# SUTRA STUDIO (सूत्र स्टूडियो)
### *Tradition Meets Technology — AI-Powered Creative, Design & Spatial Engineering Studio*

[![Production Quality](https://img.shields.io/badge/Production-Verified-D4A35A.svg)](#)
[![Next.js 16](https://img.shields.io/badge/Next.js-16.3.8-black.svg)](#)
[![React 19](https://img.shields.io/badge/React-19.2.8-61DAFB.svg)](#)
[![Tailwind CSS 4](https://img.shields.io/badge/Tailwind-4.0-38B2AC.svg)](#)
[![Tests Passing](https://img.shields.io/badge/Regression%20Tests-281%2F281%20Passed-success.svg)](#)
[![Zero SQL](https://img.shields.io/badge/Architecture-Firebase%20%2B%20Google%20Drive-orange.svg)](#)

---

## 1. Brand Ethos & Design Philosophy

**SUTRA STUDIO** is a luxury creative-technology agency bridging ancient Indian geometric principles (*Sūtra* — sacred thread / cosmic formula) with state-of-the-art computational design and generative AI pipelines.

### Design Principles:
- **Warm Ivory Palette**: Crafted with subtle warmth (`#FAF9F5`, `#FFFDF9`, `#F5F2EB`), charcoal slate typography (`#0F172A`, `#171717`), parchment borders (`#EADFCB`, `#E5E1D8`), and muted brass accents (`#D4A35A`, `#5C3A1E`).
- **No Neon / No Cyberpunk**: Avoids garish neon glows, excessive floating glass cards, or harsh black-mode-first treatments in favor of editorial refinement.
- **Sacred Geometry**: Powered by the custom SVG `LotusSymbol` and mathematical mandala vectors representing precision and timeless craft.
- **Accessibility & Motion Moderation**: Full WCAG AA contrast compliance, keyboard focus rings, skip-to-content links, and respect for `prefers-reduced-motion`.

---

## 2. Exact 21 Route Inventory

The platform strictly adheres to the canonical 21-route inventory across public showcases, authenticated client workspaces, executive supervisor controls, and isolated backend API endpoints:

### Public Showcase Pages (7)
| Route | Description |
| :--- | :--- |
| `/` | **Hero Showcase**: SUTRA intro, 8 pillars, interactive portfolio reel, client testimonials. |
| `/about` | **Heritage & Ethos**: Studio lineage, artisanal philosophy, AI integration manifesto. |
| `/services` | **8 Creative Pillars**: Deep-dive into 3D, 360°, Video, Spatial, Interior, AI Workflows. |
| `/pricing` | **Investment Tiers**: Transparent commission tiers (Starter, Growth, Atelier Enterprise). |
| `/contact` | **Briefing Intake**: Interactive project scope briefing form with estimated SLAs. |
| `/studio` | **Artisanal Craftsmanship**: Sacred geometry, design tokens, and engineering standards. |
| `/projects` | **Curated Showcase**: Filtering across 3D, Architecture, Films, and Digital Identity. |

### Authenticated Client Portal (7)
| Route | Description |
| :--- | :--- |
| `/login` | **Authentication Gateway**: Single-sign-on supporting Client and Admin executive roles. |
| `/dashboard` | **Client Command Center**: Real-time project milestones, KPIs, active deliverables. |
| `/projects-client` | **Commission Tracker**: Live render status, review notes, and revision timelines. |
| `/orders` | **Approvals & Deliverables**: Interactive deliverable inspection, approval & rejection workflows. |
| `/invoices` | **Financials & Settlements**: PDF receipt generation, payment history, and billing terms. |
| `/media` | **Google Drive Media Vault**: Multi-format assets (4K Video, 3D GLTF, 360 HDR, Documents). |
| `/profile` | **Client Security & Settings**: Organization preferences, API keys, and notification toggles. |

### Executive & Supervisory Controls (2)
| Route | Description |
| :--- | :--- |
| `/chat` | **Bespoke Messaging**: Dual-channel communication (AI Assistant + Art Director Takeover). |
| `/admin` | **Command Hub**: Client directory, active AI workflow container monitoring, supervisor takeover. |

### High-Speed Backend API Endpoints (5)
| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/api/auth/session` | `GET`, `POST` | Role-based authentication session management (`client` vs `admin`). |
| `/api/chat` | `POST` | Dual-mode messaging backend with automated AI and executive takeover support. |
| `/api/inquiries` | `POST` | Client intake briefing persistence with Firestore validation. |
| `/api/orders` | `GET`, `PATCH` | Order approvals lifecycle, status transitions, and Google Drive metadata binding. |
| `/api/workflows` | `GET`, `POST` | Strict single-engine isolated workflow dispatching across 8 creative engines. |

---

## 3. Technology Stack & Architecture

- **Framework**: [Next.js 16.3.8](https://nextjs.org/) (Turbopack, App Router, React 19)
- **Styling**: [Tailwind CSS 4.0](https://tailwindcss.com/) with CSS variables
- **Motion**: [GSAP 3.15](https://gsap.com/) & [Framer Motion 13](https://www.framer.com/motion/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Data & Application Layer**: Firebase Authentication + Cloud Firestore
- **Media & Asset Vault**: Google Drive Cloud Storage (SHA-256 integrity tokens, nested client folders)
- **Zero SQL Guardrail**: Absolute absence of PostgreSQL, MySQL, Prisma, TypeORM, or SQLite

---

## 4. 8 Isolated AI Workflow Engines

The administrative supervisor console enables dispatching isolated creative pipelines with strict execution suppression to prevent cross-engine contamination:

1. **Image Rendering Pipeline** (`image`): 8K architectural photorealism & product stills.
2. **Video Production Pipeline** (`video`): 4K cinematic reels, color-grading, and motion graphics.
3. **3D Spatial Pipeline** (`three-d`): Textured GLTF/GLB models, PBR materials, LOD optimization.
4. **360° Virtual Tour Engine** (`three-sixty`): Equirectangular VR projections & spatial web tours.
5. **Interior Architectural Engine** (`interior`): Space planning, lighting studies, and finishes.
6. **Digital Marketing Engine** (`marketing`): Meta ad creative packs, headline matrices, and copy testing.
7. **Website Development Pipeline** (`website`): Next.js / Tailwind code scaffolding and responsive testing.
8. **App & Mobile Pipeline** (`app`): Cross-platform UI scaffolding and offline state persistence.

---

## 5. Verification & Testing Suites

SUTRA STUDIO includes automated test suites validating functional integrity, workflow isolation, storage metadata, and production standards:

```bash
# Run complete test & acceptance pipeline (281 tests)
npm test

# Run individual verification suites
npm run test:workflows   # 68 AI workflow isolation tests
npm run test:storage     # 49 Google Drive & Firestore metadata tests
npm run test:production  # 45 secret scanning & environment schema checks
npm run test:audit       # 52 final acceptance audit checks
npm run typecheck        # TypeScript compiler validation (0 errors)
npm run lint             # ESLint validation (0 errors)
npm run build            # Production Next.js compilation (24 routes)
```

---

## 6. Quick Start & Local Development

### Prerequisites
- Node.js 18+ / 20+
- npm 9+

### Installation & Run
```bash
# Clone the repository
git clone https://github.com/yash-joshi-20/SutraStudio.git
cd SutraStudio

# Install dependencies
npm install

# Start local development server
npm run dev
# Open http://localhost:3000 in your browser
```

### Test Personas
- **Client Persona**: `client@sutrastudio.com` (Standard client portal access)
- **Admin Persona**: `admin@sutrastudio.com` (Executive command hub clearance)

---

## 7. GitHub Repository & Deployment Details

- **GitHub Organization / Account**: [`yash-joshi-20`](https://github.com/yash-joshi-20)
- **Repository**: [`SutraStudio`](https://github.com/yash-joshi-20/SutraStudio)
- **Clone URL**: `https://github.com/yash-joshi-20/SutraStudio.git`
- **Canonical Production Branch**: `main`
- **Repository Security & Cleanliness**:
  - `*.zip` and compressed archive files are strictly excluded from git tracking.
  - Environment variables, private keys, and service accounts are guarded by [.gitignore](file:///d:/SutraStudio/.gitignore) and `verify-env-protection.mjs`.

---

## 8. License & Credits

© 2026 SUTRA STUDIO. All rights reserved. Crafted with timeless aesthetic rigor and modern computational intelligence.

