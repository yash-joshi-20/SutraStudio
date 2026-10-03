# MISSING_KEYS.md — Sutra Studio

**Names only. Never put a real value in this file.**

Built from an audit of the live `D:\SutraStudio\.env.local` (26 variable names),
compared against `.env.example` and the build prompt's Part B inventory.

> **Important:** Part B of the build prompt was audited against
> `SUTRA_STUDIO_UI_MASTER_PROMPT_PACK/md/.env.local` (50 names — the uploaded
> copy), which is a **different file** from the live one that Next.js reads.
> Anything below marked `not in live file` is present only in that uploaded copy.
> The live file is authoritative (confirmed by the developer).

Rules: the AI must not invent a value, must not stop the step, and must repeat
the **STILL MISSING** block at the end of every step reply until a row is ticked.

---

## Needed now (blocks real work)

| # | Variable | What it is for | Blocks | Where to get it | Free? | Done |
|---|---|---|---|---|---|---|
| 1 | `FIREBASE_PRIVATE_KEY` | Admin SDK: session cookies, custom claims, server-side Firestore | Steps 1, 2, 5, 8 and every server route | Firebase Console → **sutra-studio-production** → Project settings → Service accounts → Generate new private key → paste `private_key` into `.env.local` keeping the `\n` escapes | Yes | [ ] |
| 2 | `FIREBASE_SERVICE_ACCOUNT` *or* `FIREBASE_CLIENT_EMAIL` | Alternative to #1 (path to the same JSON). `FIREBASE_CLIENT_EMAIL` is already set in the live file, so only the private key half is missing | Same | Same JSON file | Yes | [ ] |
| 3 | `ADMIN_ALLOWED_EMAILS` | Server-only allowlist; only these addresses may enter the admin portal (must contain `yashjoshi20@zohomail.in`) | Step 1 | Developer types it into `.env.local` (not a secret) | Yes | [ ] |
| 4 | `ADMIN_NOTIFY_EMAIL` | Recipient of admin login alerts and client notices (set to `yashjoshi20@zohomail.in`) | Steps 1, 9 | Developer types it into `.env.local` (not a secret) | Yes | [ ] |
| 5 | `GOOGLE_DRIVE_CLIENT_ID` | Drive OAuth client id | Step 3 | Google Cloud Console → Credentials → OAuth client. **Not in the live file** (present only in the uploaded copy) | Yes | [ ] |
| 6 | `GOOGLE_DRIVE_CLIENT_SECRET` | Drive OAuth client secret | Step 3 | Same credentials screen | Yes | [ ] |
| 7 | `GOOGLE_DRIVE_REFRESH_TOKEN` | Server-side uploads to your Drive | Step 3 | Run `scripts/get-drive-refresh-token.ts` once | Yes | [ ] |
| 8 | `GOOGLE_DRIVE_ROOT_FOLDER_ID` | Root vault folder id | Step 3 | Printed by the same script. The name exists in the live file but the value is empty | Yes | [ ] |
| 9 | `CRON_SECRET` | Protects `/api/cron/*` | Step 11 | `openssl rand -hex 32` | Yes | [ ] |
| 10 | `N8N_WEBHOOK_SECRET` | Bearer secret for `/api/cron/*`; replaces the retired spoofable `x-user-role` header | Steps 6, 11 | `openssl rand -hex 32` (this is the build prompt's `WORKFLOW_WEBHOOK_SECRET`) | Yes | [ ] |
| 11 | `TOKEN_ENCRYPTION_KEY` | AES-256-GCM for Meta tokens at rest | Step 10 | `openssl rand -base64 32` | Yes | [ ] |

---

## Needed for specific features

| # | Variable | What it is for | Blocks | Where to get it | Free? | Done |
|---|---|---|---|---|---|---|
| 12 | `GROQ_API_KEY` | Free fallback chat | Step 4 | console.groq.com (not in live file) | Free tier (to confirm) | [ ] |
| 13 | `CEREBRAS_API_KEY` + `CEREBRAS_MODEL` | Free fallback chat | Step 4 | cloud.cerebras.ai (neither in live file) | Free tier (to confirm) | [ ] |
| 14 | `GEMINI_MODEL` | Chat/embedding model name | Step 4 | Live file has `GEMINI_CHAT_MODEL` instead — confirm which name the code should read | n/a | [ ] |
| 15 | `AI_PROVIDER_ORDER` | Ordered provider list `gemini,groq,cerebras` | Step 4 | Developer types it (not a secret) | Yes | [ ] |
| 16 | `ALLOW_PAID_FALLBACK` | Gate for OpenAI as last resort | Steps 4, 7 | Developer types `true`/`false` | Yes | [ ] |
| 17 | `ALLOW_TRAINING_PROVIDERS_FOR_CLIENT_DATA` | Skip providers marked `dataUsedForTraining: yes` for client-confidential prompts (default `false`) | Step 4 | Developer types it | Yes | [ ] | 
| 18 | `HUGGINGFACE_API_KEY` / `HF_TOKEN` | FLUX.1-schnell free image generation | Step 7 | huggingface.co settings (neither in live file) | Free tier (to confirm) | [ ] |
| 19 | `POLLINATIONS_API_KEY`, `NEXT_PUBLIC_POLLINATIONS_KEY`, `PIXAZO_API_KEY` | Free image fallbacks | Step 7 | Respective dashboards (none in live file) | Free tiers (to confirm) | [ ] |
| 20 | `BFL_API_KEY`, `FLUX_API_KEY` | Paid FLUX Pro, last resort | Step 7 | bfl.ai (neither in live file) | Paid | [ ] |
| 21 | `KLING_API_KEY` (live file has no Kling keys at all) | Reels / video render | Step 7 | Kling dashboard | Paid, admin-guarded | [ ] |
| 22 | `TRIPO3D_API_KEY` | `.glb` 3D models | Step 7 | tripo3d.ai (not in live file) | Free credits (to confirm) | [ ] |
| 23 | `ELEVENLABS_API_KEY` | Paid voiceover; Edge-TTS is the free default | Step 7 | elevenlabs.io (not in live file) | Free tier (to confirm) | [ ] |
| 24 | `SERPAPI_API_KEY` | Trend research + 24 h cache | Step 7 | serpapi.com (not in live file) | Small free quota | [ ] |
| 25 | `RESEND_API_KEY` *or* Zoho SMTP | Email notifications | Step 9 | resend.com (needs a verified domain), or Zoho SMTP (**free-plan SMTP availability to confirm**) | Free tier | [ ] |
| 26 | `META_APP_SECRET` | Meta OAuth | Step 10 | developers.facebook.com → your app → Settings → Basic (not in live file) | Free | [ ] |
| 27 | `META_ACCESS_TOKEN` | Meta API | Step 10 | Issued by the OAuth flow built in Step 10 (not in live file) | Free | [ ] |
| 28 | `META_AD_ACCOUNT_ID` | Ads Manager | Step 10 | Meta Ads Manager (not in live file) | Free | [ ] |
| 29 | `FACEBOOK_PAGE_ID` | Page publishing | Steps 6, 10 | Meta Page settings (not in live file) | Free | [ ] |
| 30 | `N8N_HOST` | Local n8n base URL | Step 6 | Your machine (`http://localhost:5678`) — **not in the live file** | Free | [ ] |

---

## Present in the live file (no action needed)

`ADMIN_EMAIL`, `AI_CHAT_PROVIDER`, `FIREBASE_CLIENT_EMAIL`, `GEMINI_API_KEY`,
`GEMINI_CHAT_MODEL`, `GOOGLE_AI_API_KEY`, `GOOGLE_DRIVE_CLIENT_EMAIL`,
`GOOGLE_DRIVE_ROOT_FOLDER_ID`, `NEXT_PUBLIC_APP_URL`,
`NEXT_PUBLIC_FIREBASE_API_KEY` / `_APP_ID` / `_AUTH_DOMAIN` /
`_MESSAGING_SENDER_ID` / `_PROJECT_ID`, `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
(legacy, unread), `NEXT_PUBLIC_GA_MEASUREMENT_ID`,
`NEXT_PUBLIC_RAZORPAY_KEY_ID`, `NODE_ENV`, `OPENAI_API_KEY`,
`PINECONE_API_KEY` / `PINECONE_ENVIRONMENT` / `PINECONE_INDEX_NAME`,
`RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`, `SENDGRID_API_KEY`,
`SUTRA_NOTIFICATION_SENDER`.

> `SENDGRID_API_KEY` is set — Step 9 may be able to use SendGrid instead of
> Resend. Its account status and free-tier terms still need confirming.

---

## Optional (only if you want them)

| Variable | What it is for | Note |
|---|---|---|
| `RAZORPAY_WEBHOOK_SECRET` | Automatic payment confirmation | Razorpay charges a fee. Manual UPI verification (Step 5) is the free default. `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` are already set |
| `N8N_API_KEY` | Managing n8n through its API | Not required for pull mode |
| `SAMBANOVA_API_KEY` | Extra free LLM for trend analysis | Not required |
| `SENTRY_DSN` | Error monitoring | `.env.example` only |

---

## Not usable — do not fill in

| Variable | Why |
|---|---|
| `MIDJOURNEY_API_KEY` | Midjourney has no official API. Use the image router instead |
| `FREELLM_API_URL` | A GitHub link to a third-party proxy, not an API. Do not send client data through it |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Firebase Storage is no longer used; Google Drive holds all media |
| `GOOGLE_DRIVE_SERVICE_ACCOUNT`, `GOOGLE_SERVICE_ACCOUNT_EMAIL`, `GOOGLE_DRIVE_PRIVATE_KEY`, `GOOGLE_DRIVE_CLIENT_EMAIL` | Service-account Drive auth has no quota on a personal Drive. Superseded by the OAuth refresh token |
| `ADMIN_PASSWORD`, `ADMIN_SESSION_SECRET`, `ADMIN_NAME`, `ADMIN_ROLE` | Old env-based admin, retired in Step 1. Not read by any code path. Safe to remove from `.env.local` once Step 1 is verified |

---

## Decisions still needed from the developer

- Final currency shown to clients (INR or USD).
- Hosting for the live paid site (Vercel Hobby is non-commercial only — Step 12).
- Whether the Gemini free tier may process client-confidential content (default: **no**).
- Which free image/voice providers are accepted after reading
  `docs/PROVIDER_TERMS_CHECK.md`.

---

## Step 1 - status (completed work)

Shipped in this step:

- ADMIN_ALLOWED_EMAILS, ADMIN_NOTIFY_EMAIL appended to .env.example (values empty).
- Restored as **empty names**: NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET, GOOGLE_DRIVE_SERVICE_ACCOUNT,
  GOOGLE_SERVICE_ACCOUNT_EMAIL, GOOGLE_DRIVE_PRIVATE_KEY, GOOGLE_DRIVE_CLIENT_EMAIL.
- New: MISSING_KEYS.md, src/lib/auth/adminAccess.ts, src/lib/auth/requestRole.ts,
  src/lib/config/adminPolicy.ts, src/lib/security/passwordPolicy.ts,
  scripts/bootstrap-super-admin.ts, scripts/step1-admin-lockdown-test.ts.
- Closed a spoofing hole found during Step 1: **29 API routes trusted the client-supplied
  x-user-role header and 30 trusted x-user-id**. Both headers are now unread server-side and
  are no longer sent by any client component; role and uid come only from the verified session
  cookie or a verified Authorization: Bearer <idToken>.
- Guarded equireAdmin() + equireFreshAdminReauth() on client mutation, refunds, audit logs
  and order delivery; admin portal surfaces the "sign in again to continue" message.

Blocked by missing rows: **1, 3, 4** (plus the Firebase console click paths documented in
docs/ENVIRONMENT_VARIABLES.md).

