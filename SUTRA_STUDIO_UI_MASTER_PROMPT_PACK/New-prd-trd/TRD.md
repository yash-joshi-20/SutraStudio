# Sutra Studio: Technical Requirements Document (TRD)

> Stack follows the updated technical stack: **Next.js + TypeScript, Tailwind CSS, Firebase (Auth + Firestore), Google Drive for files.** Animation libraries: GSAP and Framer Motion, used sparingly. Unknowns are marked **TO BE CONFIRMED**.
> Core rule: **Firebase = authentication + dashboard backend + application data. Google Drive = business files, documents and media only.** Never use Drive as a database.

## 1. Architecture Overview

```
USER / ADMIN / CLIENT (web, mobile app)
        |
NEXT.JS APP (public site, client portal, admin dashboard)
        |  Server Actions / API routes (server-side only credentials)
        |
FIREBASE AUTHENTICATION  ->  role + permission claims
        |
FIRESTORE (application data, leads, orders, metadata, settings)
        |
GOOGLE DRIVE (files, documents, media)  <-- referenced by stable file IDs
        |
n8n WORKFLOWS (per-service AI workflows, called server-side)
```

**Rendering strategy**

| Area | Strategy | Why |
|---|---|---|
| Public marketing pages (Home, Services, Studio, Projects, Pricing, About, Contact) | SSG with ISR (revalidate on admin content publish) | SEO + speed, content editable from dashboard |
| Client portal | Client-rendered behind auth, data via server actions | Personalized, no SEO |
| Admin dashboard | Auth-gated, server-verified, client-rendered | Security + realtime |
| AI chat | Client UI, server route proxies to n8n | Keeps webhook URLs and keys private |

**Admin separation:** the admin dashboard is a **separate Next.js app on its own host** (e.g. `admin.<domain>`, **TO BE CONFIRMED**) with its own session cookie, no public sign-up, no links from the public site/client portal/mobile app, `noindex`, and `/admin` returns 404 on the public host. Staff roles only; client accounts get a generic login error. Shared code lives in a shared package; apps, deployments and sessions stay separate. All admin routes and actions verify session + staff role server-side.

**Separation rule:** Firebase, Google Drive, the Next.js frontend and any future backend must be swappable independently. Each integration lives behind its own service module (see section 5).

## 2. Tech Stack

| Layer | Choice |
|---|---|
| Frontend | Next.js (App Router) + TypeScript |
| Styling | Tailwind CSS with design tokens from `design-system.md` |
| Animation | Framer Motion for UI transitions; GSAP only for scroll sequences on public pages; both respect `prefers-reduced-motion` |
| Backend | Next.js Server Actions and API routes. A separate Node.js / NestJS service **only if** a requirement cannot be met inside Next.js (long jobs, heavy processing) |
| Auth | Firebase Authentication (Google + Email/Password) |
| Application data | Firestore (no new MySQL/PostgreSQL) |
| File storage | Google Drive API |
| Automation | n8n (isolated workflow per service) |
| Mobile | React Native / Expo, sharing Firebase project and server API |
| Hosting / CI-CD | **TO BE CONFIRMED** (Vercel is the natural fit for Next.js) |

Existing MySQL (if present in the current codebase) is documented and migrated later; it is not deleted.

## 3. Firebase Architecture

### 3.1 Firebase Authentication
- Providers: Google, Email/Password (matches mobile Welcome screen).
- Server verifies ID tokens with the Firebase Admin SDK before every protected server action or route.
- Session: secure, httpOnly session cookie created from the ID token on the server; short expiry plus refresh; revoke on logout or role change.

### 3.2 Authorization / Roles
- Role stored as a **custom claim** and mirrored in `users/{uid}`.
- Roles (final list **TO BE CONFIRMED**): `superAdmin`, `admin`, `editor`, `support`, `client`.
- Permissions are explicit strings (e.g. `leads.read`, `leads.write`, `services.write`, `projects.publish`, `files.upload`, `users.manage`, `settings.manage`) mapped from roles in one config file.
- Enforced in three places: Next.js middleware (route protection), server actions (permission check), Firestore security rules (data access).

### 3.3 Firestore collections (application data)

| Collection | Key fields |
|---|---|
| `users` | uid, name, email, role, status, createdAt, lastLoginAt |
| `leads` | name, email, phone, serviceRequested, message, source, status (new, active, completed), notes[], assignedTo, createdAt, updatedAt |
| `orders` | orderCode (e.g. PRO-001), clientId, serviceId, details{}, referenceFileIds[], status (in_review, in_progress, completed), paymentStatus, createdAt, updatedAt |
| `invoices` | orderId, clientId, amount, currency, status, dueDate, provider ref (**TO BE CONFIRMED**) |
| `services` | name, slug, tagline, description, startingPrice, imageFileId, order, active, category |
| `projects` | title, category, description, serviceId, clientId?, coverFileId, fileIds[], published, order, createdAt |
| `files` | driveFileId, name, mimeType, size, folderPath, uploadedBy, linkedTo{type,id}, createdAt, visibility |
| `testimonials` | author, role, quote, rating, avatarFileId, published |
| `faqs` | question, answer, order, published |
| `siteContent` | home, about, services, portfolio, contact (structured blocks) |
| `settings` | site, contact, socialLinks, integrations (non-secret flags only) |
| `chats` / `messages` | clientId, serviceRoute, message, role, workflowRunId, createdAt |
| `notifications` | recipientId, type, title, read, createdAt |
| `auditLogs` | actorId, action, targetType, targetId, before/after summary, ip, createdAt |

Secrets never go into Firestore. `files` stores the Drive ID and metadata only; the binary lives in Drive.

### 3.4 Firestore security rules (principles)
- Default deny.
- Clients read/write only their own `orders`, `files` (visibility rules), `chats`.
- Admin collections require role claim plus permission.
- Public read only for published `services`, `projects`, `testimonials`, `faqs`, `siteContent`.
- `auditLogs` write-only from server, read for `superAdmin`.

## 4. Google Drive Integration

### 4.1 Role
Drive stores: uploaded documents, project files, portfolio images, client files, design/reference files, marketing assets, PDFs, videos. It does **not** store structured data.

### 4.2 Folder structure (adapt as needed; per-client folders for client media)

```
/Sutra Studio
  /Website
    /Services        (service images)
    /Portfolio       (public project media)
    /Images
    /Videos
    /Marketing
    /Documents
  /Clients
    /{clientId}_{clientName}
      /References    (uploads from Order Creation step 3)
      /Orders
        /{orderCode}
      /Deliverables
      /Invoices
  /Uploads           (temporary / unsorted)
```

### 4.3 Auth strategy (TO BE CONFIRMED)
- A service account cannot own storage quota in a personal "My Drive". Use either a **Google Workspace Shared Drive** with the service account added as a member, or **OAuth with a refresh token** for a normal Drive account.
- Env vars below assume OAuth. If a service account is chosen, replace the three OAuth variables with service account credentials.

### 4.4 Access to files
- Files are private by default. The browser never receives Drive credentials.
- Viewing/downloading goes through an authorized server route that checks Firebase session + permission, then streams the file or returns a short-lived URL.
- Public portfolio media is served through an optimized Next.js route with caching, or copied to a public-safe folder (**TO BE CONFIRMED**).

## 5. Component and Module Architecture

**Server modules (`/lib`), one responsibility each**
- `firebase/admin.ts` (Admin SDK init), `firebase/auth.ts` (verify, claims), `firebase/db.ts` (typed Firestore access)
- `drive/client.ts`, `drive/folders.ts` (create/find folders), `drive/files.ts` (upload, stream, delete)
- `n8n/router.ts` (service to webhook map), `n8n/client.ts`
- `permissions.ts` (role to permission map), `validation/*` (Zod schemas), `logger.ts`, `errors.ts`

**UI components (from the mockups):** Header, Footer, Hero, StatsRow, WhyCards, ServiceCard, ServiceGrid, CategoryTabs, FilterChips, ProjectCard (with video/360 badge), CTABand, Sidebar, KpiCard, OrderRow, StatusChip, Stepper, ServicePicker, ChatWindow, QuickPrompt, FileUploader, DataTable, StatefulForm, Toast, EmptyState, Skeleton.
**Mobile components:** WelcomeScreen, HomeScreen, QuickActionCard, ServiceRow, ProjectCard, BottomTabs.

## 6. File Upload Architecture

Flow (for admins, authorized users and clients where allowed):
1. Client sends file to a Next.js server route (or a signed upload step) with the Firebase session.
2. **Validate file type** (allow-list by MIME and extension, e.g. jpg, png, webp, pdf, mp4, glb, zip) and **file size** (limits per type, **TO BE CONFIRMED**).
3. **Authenticate** through Firebase (verify session cookie / ID token).
4. **Verify permissions** (`files.upload`, or client owns the order).
5. Resolve or create the destination Drive folder (client/order/service path).
6. **Upload to Google Drive** (resumable upload for large files, streamed, not buffered fully in memory).
7. Save `driveFileId` and metadata in Firestore `files`, linked to project, service, lead or order.
8. Return the file reference to the dashboard.
9. Authorized users view/manage via the proxy route. Write an `auditLogs` entry.

Large media (video, 3D, 360 sets) uses resumable/chunked upload with progress UI.

## 7. File Metadata / Reference System

- Single source of truth for a file reference is `files/{id}` containing `driveFileId`.
- Other collections store only the `files` document ID (or Drive ID), never Drive URLs.
- Moving or renaming in Drive does not break references because Drive file IDs are stable.
- A periodic reconciliation job (n8n or scheduled function) flags `files` records whose Drive file is missing.

## 8. Security Architecture

- Firebase Authentication on every protected route; middleware plus server-side verification (never trust client-only checks).
- Role-based access control, permission checks in every server action, Firestore rules as the last line.
- Secure sessions: httpOnly, secure, sameSite cookies; revoke on role change.
- Input validation (Zod) on all server inputs; output escaping; CSRF protection on mutating routes.
- File validation and size limits; filename sanitization; no executable types.
- All Drive, Firebase Admin and n8n credentials only on the server; none in client bundles or Git.
- Rate limiting and spam protection on contact form, auth and AI chat routes; bot protection (e.g. reCAPTCHA/Turnstile, **TO BE CONFIRMED**).
- Audit-friendly activity tracking (`auditLogs`) for admin actions: lead changes, publishes, uploads, role changes, settings.
- Admin dashboard `noindex`, strict security headers (CSP, HSTS, X-Frame-Options).

## 9. Environment Variables

```
# Firebase Admin (server)
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=

# Firebase Web (public client config, not secret)
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# Google Drive (server, OAuth strategy; adjust if a service account is used)
GOOGLE_DRIVE_CLIENT_ID=
GOOGLE_DRIVE_CLIENT_SECRET=
GOOGLE_DRIVE_REFRESH_TOKEN=
GOOGLE_DRIVE_FOLDER_ID=

# n8n (server)
N8N_BASE_URL=
N8N_WEBHOOK_SECRET=
# one webhook per service workflow, names TO BE CONFIRMED
```

Rules: keep in `.env.local` and the hosting provider's secret store; commit only `.env.example`; `FIREBASE_PRIVATE_KEY` newlines must be handled (`replace(/\\n/g, "\n")`).

## 10. API / Server-Side Integration

| Integration | Layer | Notes |
|---|---|---|
| Firebase | `lib/firebase/*` | Admin SDK, server-only |
| Google Drive | `lib/drive/*` | Upload, stream, folders, delete |
| Contact forms | Server action `submitLead` | Validate, spam check, write `leads`, notify |
| Lead management | Server actions | permission `leads.*`, audit log |
| File uploads | `POST /api/files/upload` | section 6 flow |
| File access | `GET /api/files/[id]` | permission check, stream |
| Orders | Server actions | create, update status, attach references |
| AI chat | `POST /api/chat` | classify service, call matching n8n webhook, store messages |
| Dashboard operations | Server actions | CRUD for services, projects, FAQs, testimonials, content, users, settings |

Existing API routes in the current codebase are inventoried in `API_INVENTORY` before changes (separate audit document, not part of this package).

## 11. Error Handling

- Typed error classes (validation, auth, permission, not found, Drive, n8n) mapped to consistent JSON/UI errors.
- User-facing messages are friendly; technical details only in logs.
- Drive and n8n calls use timeouts, retries with backoff, and fallbacks (queue failed uploads for retry; chat shows a recoverable error).
- Every screen has empty, loading and error states.

## 12. Logging

- Structured server logs (request id, uid, action, duration, status).
- `auditLogs` in Firestore for admin-significant events.
- Error monitoring service **TO BE CONFIRMED**.
- Never log tokens, private keys or file contents.

## 13. Backup and Recovery

- Firestore: scheduled managed exports to a separate storage location; restore procedure documented and tested.
- Google Drive: protected by Drive versioning and trash retention; periodic metadata-to-Drive reconciliation; consider a secondary backup of critical folders.
- Config: `.env.example` and Firebase/Drive setup steps documented so the system can be rebuilt.
- Role changes and deletions are soft-delete where possible.

## 14. Testing Requirements

**Firebase functionality**
- Sign up/in (Google, Email), session create/expire/revoke.
- Role claims applied; routes blocked for wrong role.
- Firestore rules tested with the emulator (allow and deny cases per role).

**Google Drive upload / download / access**
- Upload small and large files; type and size rejections.
- Correct folder created per client/order; Firestore `files` record created.
- Download/view allowed for owner/authorized staff, blocked for others.
- Missing/deleted Drive file handled gracefully.

**Admin dashboard security**
- Unauthenticated access redirected; low-privilege roles cannot reach admin modules or call server actions directly.
- IDOR checks (client cannot read another client's order or file).
- Injection, XSS and CSRF checks on forms; secrets never present in client bundles.

**General:** responsive checks, accessibility checks, key flows (lead, order, AI chat, delivery), Lighthouse targets **TO BE CONFIRMED**.

## 15. Performance and SEO

- `next/image` optimization, lazy loading, video poster images, code splitting for GSAP/Framer Motion on pages that need them.
- Metadata, OG tags, sitemap, structured data (Organization) for public pages.
- ISR revalidation triggered by admin publish.

## 16. Environments & Deployment

- Environments: local (Firebase emulators), staging, production, each with its own Firebase project and Drive root folder.
- CI: lint, type-check, tests, preview deploys. Hosting **TO BE CONFIRMED**.
- Mobile: Expo EAS builds; store release steps in the playbook.

## 17. Open Technical Questions

- Drive auth: Shared Drive + service account, or OAuth refresh token.
- Maximum file sizes and allowed types per service.
- Payment provider for invoices.
- Final role and permission matrix.
- Whether admin and client portal share one app or are separate deployments.
- Hosting provider and error-monitoring tool.
- Contents of existing codebase and MySQL data (migration map).

## 18. TRD Coverage Checklist (required items)

| # | Required item | Section |
|---|---|---|
| 1 | Firebase architecture | 1, 3 |
| 2 | Firebase Authentication | 3.1 |
| 3 | Firebase authorization / roles | 3.2, 3.4 |
| 4 | Admin dashboard architecture | 1, 5, 10 |
| 5 | Application data architecture | 3.3 |
| 6 | Google Drive integration | 4 |
| 7 | Google Drive folder structure | 4.2 |
| 8 | File upload architecture | 6 |
| 9 | File metadata / reference system | 7 |
| 10 | Security architecture | 8 |
| 11 | Environment variables | 9 |
| 12 | API / server-side integration | 10 |
| 13 | Error handling | 11 |
| 14 | Logging | 12 |
| 15 | Backup / recovery | 13 |
| 16 | Testing of Firebase | 14 |
| 17 | Testing of Drive upload/download/access | 14 |
| 18 | Admin dashboard security testing | 14 |
