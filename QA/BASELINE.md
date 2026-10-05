# QA/BASELINE.md — Sutra Studio Baseline (Chain Day 1)

> Created: 2026-10-05  
> Branch: fixes (from main @ 983af99)  
> Purpose: List of what WORKS today. No later step may break anything marked WORKS.

---

## Build Health (pre-chain)

| Check | Result |
|---|---|
| `npm run typecheck` | PASS — 0 errors |
| `npm run lint` | PASS — 0 errors (warnings only) |
| `npm run build` | PASS — 95/95 routes compiled |
| Git secrets scan | CLEAN — no .env*, secrets/, adminsdk tracked |

---

## Pages (Public / Logged-Out)

| Page | Route | Status | Notes |
|---|---|---|---|
| Home | / | WORKS | Hero + animations load |
| About | /about | WORKS | Static page |
| Services | /services | WORKS | 12 services listed |
| Pricing | /pricing | WORKS | Plans shown |
| Contact | /contact | WORKS | Form + studio email |
| Privacy | /privacy | WORKS | Static |
| Terms | /terms | WORKS | Static |
| Cancellation | /cancellation-refund | WORKS | Static |
| Mobile App | /mobile-app | WORKS | Download promo page |
| Studio | /studio | WORKS | Portfolio page |
| Projects | /projects | WORKS | Static portfolio |
| Login | /login | WORKS | Client login form |
| Admin Login | /admin/login | WORKS | Admin login form |
| Offline | /offline | WORKS | PWA offline fallback |
| Chatbot Demo | /chatbot-demo | WORKS | Public demo |
| AI Agent | /ai-agent | WORKS | Public AI demo |

---

## Pages (Client — Requires Login)

| Page | Route | Status | Notes |
|---|---|---|---|
| Dashboard | /dashboard | WORKS | Empty state when no orders |
| Orders | /orders | WORKS | Empty state "No orders yet" |
| Profile | /profile | WORKS | Profile edit form |
| Media | /media | WORKS | File gallery (empty) |
| Invoices | /invoices | WORKS | Empty state |
| Chat | /chat | WORKS | AI chat interface |
| Projects Client | /projects-client | WORKS | Client project view |
| Client Dashboard | /client-dashboard | WORKS | Alt dashboard view |
| Client Form | /client-form | WORKS | Onboarding form |

---

## Pages (Admin — Requires Admin Session)

| Page | Route | Status | Notes |
|---|---|---|---|
| Admin Dashboard | /admin | WORKS | Reads from Firestore |
| Admin Chatbot | /admin/chatbot | WORKS | Bot config |
| Admin Integrations | /admin/integrations | WORKS | API health panel |
| Admin Knowledge Base | /admin/knowledge-base | WORKS | Document store |
| Admin Leads | /admin/leads | WORKS | Lead list |
| Admin Submissions | /admin/submissions | WORKS | Form submissions |

---

## API Routes — Auth

| Route | Method | Expected Status | Notes |
|---|---|---|---|
| /api/auth/session | GET | 200 | Returns auth state |
| /api/auth/session | POST | 200/400 | Cookie rotation with idToken |
| /api/auth/register | POST | 200/400 | Creates Firebase user + Firestore profile |
| /api/auth/client-login | POST | 200/403 | Client login; rejects admin accounts |
| /api/auth/admin-login | POST | 200/403 | Admin login; rejects client accounts |
| /api/auth/logout | POST | 200 | Clears cookies |
| /api/auth/forgot-password | POST | 200 | Sends reset email |
| /api/auth/reset-password | POST | 200 | Confirms password reset |
| /api/auth/resend-verification | POST | 200 | Resends verification email |

---

## API Routes — Orders

| Route | Method | Auth | Notes |
|---|---|---|---|
| /api/orders | GET | client | Lists user orders from Firestore |
| /api/orders | POST | client | Creates order in Firestore |
| /api/orders/status | PATCH | admin | Changes order status |
| /api/orders/deliver | POST | admin | Marks delivered |
| /api/orders/review | POST | client | Client approval/revision |
| /api/orders/cancel | POST | client/admin | Cancel order |
| /api/orders/comments | POST | any authed | Internal notes |
| /api/orders/drafts | GET/POST | client | Draft orders |

---

## API Routes — Payments

| Route | Method | Auth | Notes |
|---|---|---|---|
| /api/payments/create | POST | client | Creates payment intent |
| /api/payments/verify | POST | client | Verifies UPI/payment |
| /api/payments/webhook | POST | public+sig | Payment webhook |
| /api/payments/refund | POST | admin | Refund processing |
| /api/payments/renew | POST | client | Renew package |
| /api/payments/extend-period | POST | admin | Extend package |
| /api/payments/cancel-subscription | POST | client | Cancel package |

---

## API Routes — Admin

| Route | Method | Auth | Notes |
|---|---|---|---|
| /api/admin/clients | GET | admin | List clients |
| /api/admin/kpis | GET | admin | Dashboard KPIs |
| /api/admin/settings | GET/POST | admin | Studio settings |
| /api/admin/catalog | GET/POST | admin | Services catalog |
| /api/admin/integrations | GET | admin | API health |
| /api/admin/notification-settings | GET/POST | admin | Notification config |
| /api/admin/storage-usage | GET | admin | Drive usage |

---

## Known Issues at Baseline

1. Login flows — auth context has some silent catches (fixing in Step 2).
2. /register route — middleware redirects it; no dedicated page exists yet.
3. Missing API keys — GOOGLE_DRIVE_CLIENT_SECRET, GOOGLE_DRIVE_REFRESH_TOKEN, CRON_SECRET, TOKEN_ENCRYPTION_KEY — see MISSING_KEYS.md.
4. n8n workflows — need import and webhook configuration.

---

## Secrets Status

- .env.local: GITIGNORED (not tracked)
- secrets/: GITIGNORED (not tracked)
- scripts/backups/: FIXED in Step 1 (removed from index, gitignore updated)
- .next/: GITIGNORED
- node_modules/: GITIGNORED
