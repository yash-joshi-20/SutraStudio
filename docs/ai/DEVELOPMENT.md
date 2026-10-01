# DEVELOPMENT.md — SutraStudio Engineering Rules & Conventions

## 1. Development Principles
- **Framework Native**: Next.js 16.3 App Router. Use Server Components by default; only add `"use client"` when state or browser interaction is required.
- **Strictly No SQL**: No MySQL, PostgreSQL, or ORMs (Prisma/TypeORM/Drizzle). All client and admin data must reside in Firebase Firestore with media in Google Drive.
- **Preserve Existing Routes**: Never delete, invent, or change existing route URLs.
- **Zero Secrets on Client**: API keys, Firebase service accounts, Google Drive service credentials, and webhook tokens must never be exposed to browser code.
- **No Fake Implementations**: All interactive elements (forms, filters, modals, action triggers) must have real functional handlers.

---

## 2. Code Organization
```text
src/
├── app/                  # App router pages & API endpoints (21 preserved routes)
│   ├── (public)/         # /, /services, /studio, /projects, /pricing, /about, /contact
│   ├── (auth)/           # /login
│   ├── (portal)/         # /dashboard, /orders, /projects-client, /media, /chat, /invoices, /profile
│   ├── admin/            # /admin command center
│   └── api/              # /api/auth/session, /api/orders, /api/chat, /api/workflows, /api/inquiries
├── components/
│   ├── brand/            # SutraLogo.tsx, SutraAppIcon, SutraFavicon, LotusSymbol
│   ├── ui/               # Button.tsx, Card.tsx, Modal.tsx, etc.
│   ├── layout/           # Navbar.tsx, Footer.tsx
│   ├── dashboard/        # PortalSidebar.tsx, StatsCard.tsx, DeliverableTable.tsx
│   ├── auth/             # RouteGuard.tsx
│   └── providers/        # AppProviders.tsx, authContext.tsx
└── lib/                  # Firebase client/admin config, Google Drive adapter, types
```

---

## 3. Brand & Component Standards
- Always import `SutraLogo` or `LotusSymbol` from `@/components/brand/SutraLogo`.
- Use semantic CSS tokens from `globals.css` (`bg-[#F8F5EF]`, `bg-[#FFFDF9]`, `border-[#EADFCB]`, `text-[#0F172A]`, `text-[#D4A35A]`).
- All animations must respect `prefers-reduced-motion: reduce`.
- Responsive breakpoints: Mobile (`< 640px`), Tablet (`640px – 1024px`), Desktop (`> 1024px`).
