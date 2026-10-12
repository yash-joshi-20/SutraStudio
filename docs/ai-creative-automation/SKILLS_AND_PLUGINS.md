# Skills & Plugin Adapters Registry
**Document:** `docs/ai-creative-automation/SKILLS_AND_PLUGINS.md`  
**Version:** 2.4.0

---

## 1. Capability Registry Inventory

The capability registry discovers and evaluates all installed tools, APIs, and rendering utilities:

| Capability ID | Name | Provider | Status | Execution | Estimated Cost |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `cap-gemini-core` | Google Gemini 2.0 Flash / Pro | Google Cloud | `configured_api` | Cloud REST | $0.001 / 1K tokens |
| `cap-openai-llm` | OpenAI GPT-4o / Mini | OpenAI | `missing_key` | Cloud REST | $0.003 / 1K tokens |
| `cap-pollinations-image` | Pollinations FLUX Free Tier | Pollinations.ai | `installed` | Zero-Key Cloud | $0.00 (Free) |
| `cap-bfl-flux-pro` | BFL FLUX.1 [pro] | Black Forest Labs | `missing_key` | Cloud REST | $0.04 / image |
| `cap-kling-video` | Kling AI 1.5 Video | Kuaishou | `missing_key` | Cloud Queue | $0.10 / 5s |
| `cap-runway-video` | Runway Gen-3 Alpha | RunwayML | `missing_key` | Cloud Webhook | $0.15 / 5s |
| `cap-elevenlabs-voice` | ElevenLabs Neural Voice | ElevenLabs | `missing_key` | Cloud Stream | $0.03 / 100 chars |
| `cap-tripo-3d` | Tripo3D Neural Mesh | Tripo AI | `missing_key` | Cloud Queue | $0.20 / model |
| `cap-remotion-engine` | Remotion Video Studio | Local / Serverless | `adapter_ready` | Hybrid React | $0.01 / min |
| `cap-ffmpeg-cli` | FFmpeg Processing Engine | Local Container | `adapter_ready` | CLI / Binary | $0.00 |
| `cap-n8n-orchestrator` | n8n Automation Engine | Render / Self-Hosted | `configured_api` | Webhook | $0.00 |
| `cap-gdrive-vault` | Google Drive Enterprise Vault | Google Workspace | `configured_api` | Cloud API | Included Storage |
| `cap-threejs-viewer` | Three.js 360° / 3D Viewer | Sutra Core | `installed` | WebGL Canvas | Client Compute |
| `cap-local-template-engine` | Script & Prompt Compiler | Local Codebase | `installed` | Deterministic TS | $0.00 |

---

## 2. Dynamic Degradation & Fallback Strategy

When commercial API keys are unset or rate-limited:
1. **Scriptwriting:** Falls back from Gemini to deterministic local prompt templates.
2. **Image Generation:** Falls back from BFL FLUX to Pollinations FLUX free tier or local brand assets.
3. **Video Generation:** Falls back from Kling/Runway to Remotion programmatic React compositions.
4. **Voiceover:** Falls back to browser Web Speech API or subtitle-only motion graphics.
5. **Storage:** Falls back from Google Drive to Firestore Base64 metadata buffers.
