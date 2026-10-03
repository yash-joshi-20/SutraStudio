# Sutra Studio — Technical Requirements Document (v2, Firebase + Google Drive)

> **Status note:** This TRD is a *target architecture* built from your master prompt and the two reference images. The existing codebase and `SUTRA_STUDIO_UI_MASTER_PROMPT_PACK.zip` were **not available in this chat**, so nothing here describes what currently exists. Items that depend on the real project are marked **TO BE CONFIRMED (TBC)**. Run the audit (see `skill.md` §0) before implementing.

## 1. System Architecture

```
Web (Next.js App Router)  ──┐                     Mobile (Expo / React Native, Phase 2)
  GSAP + Framer Motion      │                                   │
                            ▼                                   ▼
                  Shared backend: Next.js Route Handlers / Server Actions (Node)
                  ├─ Firebase Auth (Google + email)           [verify ID token on every call]
                  ├─ Firestore (app data, metadata, chat, status, logs)
                  ├─ Google Drive API (large media; server-side only)
                  ├─ AI provider layer (abstracted)
                  ├─ n8n (workflow execution via signed webhooks)
                  └─ Payment gateway (TBC: existing implementation)
```

Principles: Firebase = system of record for **metadata and references**; Google Drive = **binary/large files**; all secrets server-side; web and mobile share the same API and Firestore model; one isolated workflow per service.

## 2. Technology Stack

| Layer | Choice |
|---|---|
| Framework | Next.js (App Router) + React + TypeScript — **TBC: confirm existing framework; if existing is different, keep it** |
| Styling | Tailwind CSS with tokens from `design-system.md` |
| Motion | **GSAP + ScrollTrigger** (hero, parallax, counters, 360° scrub); **Framer Motion** (route/modal/wizard/list transitions). Minimal, light, reduced-motion aware |
| UI primitives | shadcn/ui (Radix), Lucide icons |
| Forms | React Hook Form + Zod |
| Auth/DB | Firebase Auth, Firestore, Firebase Admin SDK (server). **No Cloud Functions** — triggers/schedules run through n8n or external cron against `/api/cron/*` (Spark plan only, no Blaze) |
| Files | Google Drive API v3 via **OAuth refresh token** (`drive.file` scope). **No Firebase Storage.** A service account has no quota on a personal 5 TB Drive, so it must be an OAuth refresh token; browser → Drive direct resumable upload for large files |
| Workflows | n8n (TBC: existing instance/workflows) |
| AI | Provider abstraction (see §9) — TBC existing providers |
| 3D/360 | react-three-fiber/drei, image-sequence or Pannellum viewer (lazy) |
| Hosting | Vercel (or existing host — TBC); Firebase project for data |
| Mobile | Expo / React Native, same API + Firebase project |
| Monitoring | Sentry, Firebase/Vercel analytics |

**No MySQL/PostgreSQL implementation is added.**

## 3. Repository Architecture (proposed; TBC against existing repo)

```
src/app/(marketing) | (auth) | (client) | (admin) | api/
src/components/{layout,brand,sections,ui,portal,chat,media,motion}
src/lib/{firebase/{client,admin,rules-tests},drive,ai,workflows,payments,validators,logging}
src/workflows/{image,video,interior,three-d,three-sixty,website,app,marketing,social,automation}
docs/   (PRD, TRD, API_INVENTORY, ENVIRONMENT_VARIABLES, REQUIREMENT_TRACEABILITY, PAGE_INVENTORY, IMPLEMENTATION_ROADMAP, DATABASE_MIGRATION_MAP, PROJECT_AUDIT)
```
**Rule:** existing pages/routes are preserved and redesigned in place; no duplicate or invented pages.

## 4. Authentication

- Firebase Auth: email/password + Google sign-in (where configured — TBC).
- Client gets ID token; server verifies with Admin SDK on every API call (no trusting client-provided `uid`).
- New users start with an empty workspace: `users/{uid}` + zero orders.
- Role stored as **custom claim** (`role: client|admin|staff`) set only by server/admin tooling.

## 5. Authorization & RBAC

| Role | Access |
|---|---|
| `client` | Own profile, orders, conversations, AI chats, assets, payments, deliverables |
| `admin` | All clients/orders/conversations/projects/payments/integrations/logs/services/packages |
| `staff` (TBC) | Assigned orders/projects only |

Enforced in **three places**: Firestore rules, API route guards (`requireAuth`, `requireRole`), and Drive access logic (server-mediated). Frontend hiding is cosmetic only.

## 6. Firebase Architecture & Collections (proposed — mark TBC against actual)

| Collection | Key fields (proposed) |
|---|---|
| `users` | `uid, email, displayName, role, companyName, phone, createdAt, lastLoginAt, driveFolderId` |
| `clients` | `clientId(=uid), businessName, industry, brandNotes, logoAssetId, createdAt` |
| `services` | `serviceId, slug, name, category, description, workflowType, isActive, sortOrder` |
| `packages` | `packageId, serviceId, name, price, currency, deliverables[], isActive` |
| `orders` | `orderId, code, clientId, serviceId, packageId, status, paymentStatus, brief{}, referenceAssetIds[], createdAt, updatedAt` |
| `projects` | `projectId, orderId, clientId, status, progress, assignedTo, dueDate` |
| `tasks` | `taskId, projectId, title, status, assignee` |
| `deliverables` | `deliverableId, orderId, clientId, type, driveFileId, driveWebViewLink(restricted), version, approvedByClient, approvedByAdmin` |
| `assets` | `assetId, clientId, kind(logo|reference|document|image|video|3d), driveFileId, mimeType, size, uploadedBy, createdAt` |
| `conversations` | `conversationId, clientId, type(admin|ai|mixed), participants[], lastMessageAt` |
| `conversations/{id}/messages` | `messageId, senderType(client|admin|ai), senderId, text, attachmentAssetIds[], createdAt` |
| `aiSessions` | `sessionId, clientId, classification{business,service}, selectedWorkflow, status` |
| `workflowRuns` | `runId, orderId, workflowType, status, attempts, startedAt, finishedAt, error` |
| `payments` | `paymentId, orderId, clientId, gateway, gatewayRef, amount, status, verifiedAt` |
| `notifications` | `notificationId, userId, type, read, createdAt` |
| `activityLogs` | `logId, actorId, actorRole, action, targetRef, createdAt` |
| `settings` | `key, value` (admin-only) |

### Firestore security rules (skeleton)

```
function signedIn() { return request.auth != null; }
function isAdmin()  { return signedIn() && request.auth.token.role == 'admin'; }
function isOwner(clientId) { return signedIn() && request.auth.uid == clientId; }

match /users/{uid}          { allow read: if isOwner(uid) || isAdmin();
                              allow update: if isOwner(uid) && !('role' in request.resource.data.diff(resource.data).affectedKeys());
                              allow create: if isOwner(uid); allow delete: if isAdmin(); }
match /orders/{id}          { allow read: if isOwner(resource.data.clientId) || isAdmin();
                              allow create: if isOwner(request.resource.data.clientId)
                                            && request.resource.data.status == 'pending'
                                            && request.resource.data.paymentStatus == 'unpaid';
                              allow update, delete: if isAdmin(); }
match /conversations/{cid}  { allow read: if isOwner(resource.data.clientId) || isAdmin();
  match /messages/{mid}     { allow read: if isOwner(get(/databases/$(database)/documents/conversations/$(cid)).data.clientId) || isAdmin();
                              allow create: if isOwner(get(/databases/$(database)/documents/conversations/$(cid)).data.clientId) && request.resource.data.senderType == 'client' || isAdmin(); } }
match /payments/{id}        { allow read: if isOwner(resource.data.clientId) || isAdmin(); allow write: if false; } // server only
match /deliverables/{id}    { allow read: if isOwner(resource.data.clientId) || isAdmin(); allow write: if isAdmin(); }
match /assets/{id}          { allow read: if isOwner(resource.data.clientId) || isAdmin(); allow create: if isOwner(request.resource.data.clientId); }
match /services/{id}        { allow read: if true; allow write: if isAdmin(); }
match /packages/{id}        { allow read: if true; allow write: if isAdmin(); }
match /{col}/{id} where col in ['workflowRuns','activityLogs','settings']  { allow read, write: if isAdmin(); }
```
Sensitive writes (payments, workflowRuns, status transitions) go through the server with the Admin SDK. Add **Firebase Emulator rules tests** proving client A cannot read client B's documents.

## 7. Google Drive Architecture

- Auth: server-side OAuth or service account (TBC current method). Credentials only in server env; never sent to browser.
- Clients never get raw Drive access. Flow: client uploads → API validates (type/size) → server stores in Drive → Firestore `assets` doc with `driveFileId`. Downloads are streamed/proxied after authorization check (or short-lived links).
- Folder structure:

```
SUTRA STUDIO
 ├── CLIENTS
 │    └── {clientId}
 │         ├── PROFILE  ├── BRAND  ├── DOCUMENTS  ├── IMAGES
 │         ├── VIDEOS   ├── 3D     ├── PROJECTS   └── DELIVERABLES
 └── SYSTEM
```
- Folder created at first login/first upload; `driveFolderId` saved on `users`. Folders are private; sharing is never set to "anyone with link".

## 8. Chat Architecture

- Conversation types: `admin`, `ai`, `mixed` (AI + admin in one thread where supported — TBC).
- Firestore realtime listeners for messages; AI replies produced server-side and written as `senderType: ai`.
- Admin can view AI threads; access is logged in `activityLogs`.
- Attachments go through the asset pipeline (§7).

## 9. AI Architecture

```
Client → AI Chat → Requirement understanding → Business classification → Service classification
       → Workflow selection → Execution → Deliverable → Client review → Admin review → Final delivery
```
- **Provider abstraction:** `AIProvider` interface (`chat`, `classify`, `generateImage`, `generateVideo`, `voiceover`) with adapters per provider (TBC existing providers/keys).
- **Classifier output** is structured JSON (`serviceType`, `confidence`, `missingInfo[]`). Below a confidence threshold, AI asks a clarifying question instead of running a workflow.
- Only the selected workflow runs; unrelated workflows are never triggered.
- Prompt-injection hygiene: user content is data; tool/workflow calls are allow-listed per classification.

## 10. Workflow Isolation (applies to every service workflow)

Workflows: `IMAGE`, `VIDEO`, `INTERIOR`, `3D`, `360`, `WEBSITE`, `APP`, `MARKETING`, `SOCIAL_MEDIA`, `AUTOMATION`.

Each workflow defines: **Input → Validation → AI processing → APIs → Storage → Human approval → Output → Error handling → Retry → Status → Logging.**

| Workflow | Notes (TBC for existing implementation) |
|---|---|
| Image | Brief + references → generation → watermark/logo option → Drive `IMAGES`/`DELIVERABLES` → review |
| Video | Script/storyboard → generation/edit → voice-over → Drive `VIDEOS` → review |
| Interior | Room/space brief + reference images → render(s) → review |
| 3D / 360 | Asset generation/upload → viewer package → Drive `3D` |
| Website / App | Requirement capture → project/task creation → human-led delivery; AI assists scoping |
| Marketing / Social | Research → plan → content → **client approval** → schedule → (optional) publish → report |
| Automation | n8n flows via signed webhook; admin-managed |

Execution model: `workflowRuns` doc per run; states `queued → running → awaiting_approval → completed | failed`; bounded retries with backoff; idempotency key per run; n8n webhooks verified with HMAC secret.

## 11. Social / Marketing Automation Safety

Separate states: `ai_generated` → `human_approved` → `published`. **Automatic publishing is off by default** and requires explicit admin/client approval per post or per approved schedule. Meta/Instagram tokens stored server-side only.

## 12. Payment Architecture

**TBC: document the exact existing gateway (and any UPI/QR flow) before changing it.** Target pattern: server creates payment → client pays → gateway webhook (signature verified) → server updates `payments` and `orders.paymentStatus`. Client never sees gateway secrets; clients cannot write payment status.

## 13. API Architecture (target pattern)

- Route handlers under `/api/*`; every handler: verify ID token → check role/ownership → Zod validate → execute → audit log → typed response.
- **Existing APIs are preserved**; inventory goes in `API_INVENTORY.md` (Route, Method, Auth, Input, Output, DB dependency, External service, Error states, Status).

## 14. Existing MySQL → Firebase Migration (only if MySQL exists — TBC)

1. Inventory tables/columns/row counts → `DATABASE_MIGRATION_MAP.md` (`OLD TABLE → COLLECTION`, `OLD FIELD → NEW FIELD`, e.g. `clients.company_name → clients.companyName`, `created_at → createdAt`).
2. **Backup** full MySQL dump; store offline.
3. Write idempotent migration script (dry-run mode, batch writes).
4. Migrate to a **staging** Firebase project; verify counts/checksums/sample records.
5. Run app against Firebase in parallel; cut over.
6. Keep MySQL read-only for an agreed window; **rollback** = repoint to MySQL + restore.
7. Only then schedule removal. **No deletion during documentation.**

## 15. Security

RBAC + rules + server checks; Zod validation everywhere; upload allow-list (MIME + magic bytes), size limits, optional malware scan; rate limiting (per-UID/IP) on chat, uploads, auth; CORS allow-list; CSRF protection for cookie sessions; output escaping / CSP against XSS; parameterized access only (no raw query concatenation); HMAC-verified webhooks; audit logs for admin reads of client data; secrets only in env/secret manager — **if any secret is found in source, flag "SECURITY ISSUE — SECRET FOUND IN SOURCE" and rotate; never reproduce it.**

## 16. Environment Variables (names only; values never in docs)

| Variable | Side | Secret | Note |
|---|---|---|---|
| `NEXT_PUBLIC_FIREBASE_API_KEY`, `_AUTH_DOMAIN`, `_PROJECT_ID`, `_APP_ID` | client | No | Safe to expose (public web config) |
| `FIREBASE_ADMIN_PROJECT_ID`, `FIREBASE_ADMIN_CLIENT_EMAIL`, `FIREBASE_ADMIN_PRIVATE_KEY` | server | **Yes** | Required |
| `GOOGLE_DRIVE_CLIENT_ID`, `GOOGLE_DRIVE_CLIENT_SECRET`, `GOOGLE_DRIVE_REFRESH_TOKEN` (or service-account key) | server | **Yes** | Required — TBC method |
| `GOOGLE_DRIVE_ROOT_FOLDER_ID` | server | No | Required |
| `AI_PROVIDER_*_API_KEY` | server | **Yes** | TBC providers |
| `N8N_BASE_URL`, `N8N_WEBHOOK_SECRET` | server | **Yes** | TBC |
| `PAYMENT_KEY_ID`, `PAYMENT_KEY_SECRET`, `PAYMENT_WEBHOOK_SECRET` | server | **Yes** | TBC gateway |
| `META_APP_ID`, `META_APP_SECRET`, `META_ACCESS_TOKEN` | server | **Yes** | Future/TBC |
| `NEXT_PUBLIC_SITE_URL`, `SENTRY_DSN` | client/server | No | — |

## 17. Performance, Motion & UI Constraints

Light premium UI; animation minimal and purposeful (no glow/heavy gradients); lazy-load 3D/video; `next/image`; `prefers-reduced-motion` honored; LCP < 2.5s, CLS < 0.1. Use GSAP for scroll scenes and Framer Motion for UI transitions — never both on the same property.

## 18. Deployment, CI/CD, Testing, Monitoring

- Environments: local (Firebase Emulator) → staging Firebase project → production.
- CI: lint, typecheck, unit tests, **Firestore rules tests**, build, preview deploy.
- Tests: rules tests (tenant isolation), API auth tests, workflow state-machine tests, Playwright E2E for signup → order → chat → deliverable download.
- Monitoring: Sentry, Firebase usage alerts, workflow failure alerts to admin.
- Backup/DR: scheduled Firestore exports; Drive folder backup policy (TBC); documented restore runbook.

## 19. Mobile Architecture

Expo app reuses Firebase Auth, Firestore model, and the same `/api` endpoints; shared Zod schemas/types in a `packages/shared` module; push notifications via FCM. No duplicated business logic.

## 20. Technical Risks

- Unknown existing code may conflict with this target → audit first.
- MySQL→Firebase data-shape differences (relational → document) and counts/costs of Firestore reads.
- Drive API quotas and latency for large video; need resumable uploads.
- AI generation cost/abuse → quotas and rate limits.
- Auto-publishing to social without approval → disabled by default.

## 21. Technical Decisions (proposed)

Firebase for data, Drive for media, custom-claim RBAC, server-mediated Drive access, provider-abstracted AI, n8n via signed webhooks, approval gate before publish.

## 22. Open Technical Questions (TBC)

Current framework/hosting; current auth providers; does MySQL exist and what schema; existing APIs/pages list; current payment gateway and UPI/QR flow; Drive auth method; which AI providers/keys exist; n8n instance/workflows; whether staff role is needed; chat: is AI+admin shared thread required now?
