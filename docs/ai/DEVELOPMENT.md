# DEVELOPMENT.md — SutraStudio Engineering Rules & Architecture

## 1. Core Engineering Guardrails
- **Pure Firebase + Google Drive Architecture**: Strictly zero SQL databases (no MySQL, PostgreSQL, SQLite, Prisma, or TypeORM). Application data resides in Firebase Cloud Firestore; heavy media assets reside in Google Drive.
- **Role-Based Access Control (RBAC)**: Master role matrix (`superAdmin`, `admin`, `editor`, `support`, `metaAdsManager`, `client`) enforced on client routes via [`RouteGuard`](file:///d:/SutraStudio/src/components/auth/RouteGuard.tsx), server-side in API handlers, and within Firestore rules.
- **Zero Secrets on Client**: API keys, Firebase service accounts, Google Drive service credentials, Meta app access tokens, and webhook secrets are kept server-side only.
- **White-Label & Privacy Safeguards**: Internal infrastructure terms (*n8n, webhook, node, LLM model identifiers, prompts, agent*) must never leak into client UI, API responses, or emails.
- **Zero Fake Implementations**: All interactive elements (4-step order wizard, deliverable approvals, revisions, chat takeover, Meta Ads launcher, pricing controls) must have working functional handlers.

---

## 2. Storage & Vault Infrastructure

```text
/Sutra Studio (Google Drive Root)
  /Website (Services, Portfolio, Images, Videos, Marketing, Documents)
  /Clients
    /{clientId}_{name}
      /References
      /Orders/{orderCode}/_Drafts        (Admin-only staging)
      /Deliverables                      (Client-visible after official approval)
      /MetaAds
      /Invoices
```

* **Integrity Tokens**: All media deliverables track Google Drive file IDs (`driveFileId`), SHA-256 integrity checksums, and strict MIME type validations.
* **Expiring Share Links**: External deliverable sharing uses tokenized, revocable URLs generated via [`ShareLinksService`](file:///d:/SutraStudio/src/lib/services/share-links.ts), shielding raw Google Drive links.

---

## 3. Modular Service Layers

* **Payments Service (`src/lib/services/payments.ts`)**: Pluggable abstraction for processing monthly subscriptions and one-time order commissions in INR via Razorpay or Stripe India.
* **Workflow Engine Dispatcher (`src/app/api/workflows/route.ts`)**: Server-side whitelisted single-engine executor (`image`, `video`, `three-d`, `three-sixty`, `interior`, `marketing`, `website`, `app`).
* **Sutra AI & RAG Engine (`src/app/api/chat/route.ts`)**: Conversational creative concierge equipped with tenant-isolated metadata filters and privacy shields.

---

## 4. Code Quality & Standards

* **TypeScript**: Strict typing with 0 `any` usage in production domain contracts.
* **ESLint**: Next.js core vitals compliant with 0 errors.
* **Accessibility**: WCAG AA color contrast, visible keyboard focus rings, and safe-area padding for mobile viewport parity.
