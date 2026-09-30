# SYNAPSE KINETIC — GitHub Push & 100% Free Live Deployment Manual
**Complete Step-by-Step Guide for GitHub Repository Setup, Vercel/Cloudflare Free Hosting, and Custom Domain Setup**

---

## 1. Step-by-Step GitHub Repository Setup

### Step 1.1: Open PowerShell / Terminal in Project Directory
Ensure you are inside `d:\home\website`:
```powershell
cd d:\home\website
```

### Step 1.2: Initialize Git & Commit Files
```powershell
# 1. Initialize local repository (if not already initialized)
git init

# 2. Add all source files to staging
git add .

# 3. Commit with a production milestone message
git commit -m "feat: complete autonomous Synapse Kinetic agency platform v1.0"
```

### Step 1.3: Link to Your GitHub Account & Push
1. Go to [github.com/new](https://github.com/new) and create a **New Repository** named `synapse-kinetic-ai` (Set to **Private** or **Public**).
2. Copy the repository URL and execute:
```powershell
# Set main branch
git branch -M main

# Add remote origin URL (Replace with your actual GitHub repo URL)
git remote add origin https://github.com/YOUR_GITHUB_USERNAME/synapse-kinetic-ai.git

# Push to GitHub
git push -u origin main
```

---

## 2. Deploying Live for 100% Free on Vercel

Vercel is the creator of Next.js and provides **Free Global Edge Hosting** with zero server maintenance, automatic SSL, and sub-50ms latency.

### Step 2.1: Connect Your GitHub to Vercel
1. Navigate to [vercel.com](https://vercel.com) and click **Sign Up** (Sign in with your GitHub account).
2. On your Vercel Dashboard, click **"Add New..."** → **"Project"**.
3. Locate `synapse-kinetic-ai` in your GitHub repository list and click **"Import"**.

### Step 2.2: Configure Environment Variables in Vercel
Before clicking Deploy, expand the **"Environment Variables"** tab in Vercel and paste your keys from `.env.local`:

| Variable Key | Value / Source |
|---|---|
| `NEXT_PUBLIC_APP_URL` | `https://your-project.vercel.app` |
| `OPENAI_API_KEY` | `your_openai_api_key_here` |
| `BFL_API_KEY` | `your_bfl_api_key_here` |
| `GEMINI_API_KEY` | Your Google Gemini API Key |
| `MIDJOURNEY_PROFILE_URL` | `https://www.midjourney.com/@740c40f0...` |
| `ADMIN_SECRET_KEY` | `synapse_kinetic_root_master_2026` |
| `NEXT_PUBLIC_DEFAULT_UPI_VPA`| `9898234812@okaxis` (Your GPay / UPI ID) |
| `NEXT_PUBLIC_DEFAULT_UPI_PAYEE`| `Synapse Kinetic AI Studio` |

### Step 2.3: Click Deploy
Click **"Deploy"**. In approximately 45–60 seconds, Vercel will build your Next.js application and provide your live URL:
👉 `https://synapse-kinetic-ai.vercel.app`

---

## 3. Connecting a Custom Domain (e.g., `yourbrand.com`)

1. In your Vercel Project Dashboard, click **"Settings"** → **"Domains"**.
2. Type your domain name (e.g., `agency.yourdomain.com` or `yourdomain.com`) and click **"Add"**.
3. In your Domain Registrar DNS (GoDaddy, Namecheap, Hostinger, Cloudflare):
   - **Type A**: `@` → `76.76.21.21` (Vercel IP)
   - **Type CNAME**: `www` → `cname.vercel-dns.com`
4. SSL Certificate is generated automatically in 2 minutes for **Free**.

---

## 4. Continuous Automated Deployment (CI/CD)

Whenever you make any change locally:
```powershell
git add .
git commit -m "update: new features"
git push
```
Vercel automatically detects the push and redeploys the updated live website in under 60 seconds with **zero downtime**.
