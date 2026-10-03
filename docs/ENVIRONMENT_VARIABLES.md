# ENVIRONMENT_VARIABLES.md - Environment Configuration

> **Security Rule**: Variable names only. Never commit secret keys or sensitive tokens into version control or documentation.

| Variable Name | Environment | Purpose |
|---|---|---|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Client & Server | Firebase Web API Key |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Client & Server | Firebase Auth Domain |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Client & Server | Firebase Project ID |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Client & Server | FCM Sender ID |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Client & Server | Firebase Web App ID |
| `FIREBASE_SERVICE_ACCOUNT` | Server-only | Path to the Firebase Admin service-account JSON |
| `FIREBASE_ADMIN_CLIENT_EMAIL` | Server-only | Firebase Admin Service Account Email |
| `FIREBASE_ADMIN_PRIVATE_KEY` | Server-only | Firebase Admin Private Key |
| `GOOGLE_DRIVE_CLIENT_ID` | Server-only | Google Drive OAuth Client ID (scope `drive.file`) |
| `GOOGLE_DRIVE_CLIENT_SECRET` | Server-only | Google Drive OAuth Client Secret |
| `GOOGLE_DRIVE_REFRESH_TOKEN` | Server-only | Google Drive OAuth Refresh Token |
| `GOOGLE_DRIVE_ROOT_FOLDER_ID` | Server-only | Root Folder ID for Sutra Studio Assets (optional) |
| `AI_PROVIDER_API_KEY` | Server-only | AI Provider API Key for Sutra AI Classifier |
| `N8N_BASE_URL` | Server-only | n8n Webhook Endpoint |
| `N8N_WEBHOOK_SECRET` | Server-only | Bearer secret protecting `/api/cron/*` schedules |
| `CRON_SECRET` | Server-only | Fallback bearer secret for `/api/cron/*` |

> **STEP 30 override**: Firebase Storage and Cloud Functions are **not used**.
> There is no `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` — all media lives in the
> studio's Google Drive via OAuth refresh token, and schedules run through n8n
> or external cron against `/api/cron/*`.

## STEP 1 addition - admin lockdown

| Variable Name | Environment | Purpose |
|---|---|---|
| `ADMIN_ALLOWED_EMAILS` | Server-only | Comma-separated allowlist; only these addresses may enter the admin portal |
| `ADMIN_NOTIFY_EMAIL` | Server-only | Recipient of admin login alerts |
| `FIREBASE_PRIVATE_KEY` | Server-only | Admin session cookies, custom claims, server-side Firestore |
| `FIREBASE_CLIENT_EMAIL` | Server-only | Service-account identity for the Admin SDK |

### One-time Firebase console steps (Step 1.11)

**1. Service-account key** (unblocks every server-side gate):

1. Open https://console.firebase.google.com and select project **sutra-studio-production**.
2. Gear icon (top left) -> **Project settings** -> **Service accounts** tab.
3. Click **Generate new private key** -> **Generate key**.
4. Save the JSON, then put the path in `FIREBASE_SERVICE_ACCOUNT` (preferred), or copy the
   `private_key` value into `FIREBASE_PRIVATE_KEY` keeping its `\n` escapes and the
   `client_email` into `FIREBASE_CLIENT_EMAIL`.
5. Add it to `.env.local` only. Never commit it and never paste it into chat.

**2. Email enumeration protection** (stops an attacker confirming which accounts exist):

1. Same project -> **Build** (left sidebar) -> **Authentication** -> **Get started** if prompted.
2. **Sign-in method** tab -> **Email/Password**.
3. Enable **Email/Password**, then switch on **Email enumeration protection**.
4. **Save**. Sign-in and sign-up responses become identical whether or not the address exists,
   which is what the generic `INVALID_CREDENTIALS` message in the app assumes.

**3. Identity Platform / Cloud Billing check**:

1. https://console.cloud.google.com/billing -> confirm the project has a billing account attached.
2. Email enumeration protection and multi-factor auth are Identity Platform features; on the
   Spark (free) plan they are available but usage-based charges can apply once the free quota
   is exceeded. **Confirm the current free quota before production traffic** - cost is untested here.

### Provisioning the first administrator

`npx tsx scripts/bootstrap-super-admin.ts` prompts for a password on a hidden terminal (never
echoed, never read from a file or env var), enforces the 14-character policy in
`src/lib/security/passwordPolicy.ts`, writes the `superAdmin` claim and revokes stale
refresh tokens. Do **not** reuse a password that has ever been pasted into a chat.

### Verify

`npx tsx scripts/set-admin-claim.ts --verify` and `npx tsx scripts/step1-admin-lockdown-test.ts`.
