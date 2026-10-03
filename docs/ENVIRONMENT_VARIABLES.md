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
