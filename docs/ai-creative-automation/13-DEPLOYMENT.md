# 13 — Production Deployment Guide

This guide covers deploying the Sutra Studio AI Creative Automation Engine to Vercel, Node.js containers, or cloud environments.

---

## 🔑 Environment Variables Matrix

Configure these variables in your hosting environment (Vercel Project Settings, Docker `.env`, or Kubernetes secrets):

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Yes | Firebase client Web API key |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Yes | Firebase Project ID (e.g. `sutra-studio-app`) |
| `FIREBASE_PROJECT_ID` | Yes | Firebase Admin service account project ID |
| `FIREBASE_CLIENT_EMAIL` | Yes | Firebase Admin service account client email |
| `FIREBASE_PRIVATE_KEY` | Yes | Firebase Admin private key (`\n` formatted) |
| `GEMINI_API_KEY` | Optional | Google Gemini 2.0 Flash / Pro API key |
| `BFL_API_KEY` | Optional | Black Forest Labs FLUX.1 [pro] API key |
| `KLING_API_KEY` | Optional | Kling AI 1.5 Video API key |
| `ELEVENLABS_API_KEY` | Optional | ElevenLabs neural voiceover synthesis API key |
| `TRIPO3D_API_KEY` | Optional | Tripo3D neural 3D model reconstruction API key |
| `GOOGLE_DRIVE_ROOT_FOLDER_ID` | Optional | Parent Google Drive media folder ID |
| `GOOGLE_SERVICE_ACCOUNT_EMAIL` | Optional | Google Drive service account email |
| `GOOGLE_PRIVATE_KEY` | Optional | Google Drive service account private key |
| `N8N_WEBHOOK_URL` | Optional | Inbound webhook URL for n8n orchestration |

---

## 🚀 Deployment Targets

### 1. Vercel (Recommended for Next.js App Router)
1. Link your GitHub repository to Vercel.
2. Add the environment variables from the table above in **Project Settings → Environment Variables**.
3. Set the build command to `npm run build`.
4. Deploy the production branch (`main`).

### 2. Standalone Node.js / Docker Runtime
Ensure your `next.config.ts` includes `output: "standalone"` if deploying via Docker:

```dockerfile
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY .next/standalone ./
COPY .next/static ./.next/static
COPY public ./public
EXPOSE 3000
CMD ["node", "server.js"]
```
