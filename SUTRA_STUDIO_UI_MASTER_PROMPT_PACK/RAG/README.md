# Sutra AI: RAG + LLM kit

Per-client brand memory (RAG) and the Sutra AI chat, for the Next.js + Firebase + Google Drive stack.
Two parts: `public-app/` (client site) and `admin-app/` (separate admin app, staff take-over).
`lib/ai/*` and `lib/rag/*` are the same code in both apps; in a monorepo put them in one shared package.

## How it works

1. **Ingest** (`lib/rag/ingest.ts`): brand intake answers, notes and approved work are split into ~900-character chunks, embedded, and stored in Firestore `brandKnowledge` with a `clientId` and a 768-d vector.
2. **Retrieve** (`lib/rag/retrieve.ts`): the client's question is embedded and Firestore returns the 3 nearest chunks, **always pre-filtered by `clientId`**, so one client can never see another client's notes.
3. **Generate** (`app/api/chat/route.ts`): the chunks go into the system prompt as reference data, and the reply is streamed to the client (server-sent events).
4. **Hand-over** (`admin-app/.../conversations/actions.ts`): staff can take over a chat (the AI stops), reply as "Sutra Studio team", get a suggested draft, and hand back.

## Models (checked on 2 Oct 2026, change them in env, never in code)

| Use | Default here | Note |
|---|---|---|
| Embeddings | `gemini-embedding-001`, 768 dimensions | `text-embedding-004` was shut down on 14 Jan 2026. Truncated vectors are not unit length, so the code normalises them |
| Chat (default) | `gemini-3.6-flash` | `gemini-2.0-flash` was shut down on 1 Jun 2026. `gemini-2.5-flash` has a published shutdown date of 16 Oct 2026 |
| Chat (alternative) | Groq `openai/gpt-oss-120b` (`AI_CHAT_PROVIDER=groq`) | `llama-3.3-70b-versatile` was retired on 16 Aug 2026 |

Model lifecycles are short. Check https://ai.google.dev/gemini-api/docs/deprecations and https://console.groq.com/docs/deprecations before launch and every few months. If you change the embedding model or dimensions you must re-embed all existing chunks and rebuild the index.

## Setup

1. Add the env vars from `.env.example` (server-side only; never prefix them with `NEXT_PUBLIC_`).
2. Create the vector index once: `bash scripts/create-vector-index.sh` (needs the gcloud CLI; takes a few minutes to build). Without it retrieval fails and the chat answers without brand notes.
3. Merge `firestore.rules.rag.example` into your rules (clients read only their own chats; `brandKnowledge` and `aiTrace` are server-only).
4. Requires `firebase-admin` 13+ (`@google-cloud/firestore` 7.11+) for the object form of `findNearest`.
5. Wire it in:
   - After the first-login brand intake is saved, call `ingestBrandProfile(clientId, { businessName, vision, audience, tone, colors, competitors, goals })`.
   - Chat screen: use `useChatStream()` (components/chat). Label `assistant` messages "Sutra AI" and `staff` messages "Sutra Studio team". Show system notices ("A team member has joined the chat").
   - Admin Live Conversations page: call `takeOver`, `sendStaffMessage`, `handBack`, `suggestDraft`. Listen to `conversations` with a Firestore realtime listener (vector search itself does not support realtime listeners, but conversations do).
   - Order screen: `draftOrderFromConversation()` in `lib/rag/intent.ts` turns the chat into an order draft (validated JSON) for the client to confirm.
6. Smoke test against your real project: `npx tsx --conditions=react-server scripts/rag-smoke-test.ts`. It also checks that another client gets zero results.

## Behaviour rules built in

- The assistant says it is an AI if asked. Staff messages are labelled as the team. There is no human persona.
- Workflows, models, prompts and tools are never described to the client. Provider and model names are stored only in `conversations/{id}/aiTrace`, which clients cannot read.
- Retrieved notes are treated as untrusted data (angle brackets neutralised, prompt tells the model to ignore instructions inside them).
- Model output for order drafts is validated and clamped before use.
- If the client asks for a person, is upset or disputes a payment, the model ends with a hidden marker; the server strips it, sets `needsHuman: true` on the conversation, and the UI receives a `handoff` event.
- Errors shown to the client are generic; details go to server logs.

## What was tested

- Type-check (strict TypeScript) passes for both apps.
- 11 unit tests pass (`test/rag.test.ts`): chunking (incl. Hindi danda), marker stripping across split pieces, vector normalisation, history merging, order-draft validation, prompt injection hardening, embedding request shape and dimensions, Gemini and Groq stream parsing with a stubbed network, JSON mode, and no provider details in errors.
- **Not tested** (needs your keys and project): live Gemini/Groq calls, real Firestore reads and writes, the vector index, and the chat UI. Run the smoke test after setup.

## Known limits

- `lib/rate-limit.ts` is in-memory (per server instance). On serverless or several instances, swap in a shared store such as Redis behind the same function.
- `RAG_MAX_DISTANCE` (default 0.55, cosine distance) is a starting point. Tune it with real client notes.
- Firestore vector indexes allow up to 2048 dimensions; 768 is a good size/quality balance for `gemini-embedding-001`.
- Gemini 3.x models may "think" before answering, which adds latency; the code ignores thought parts. Adjust thinking settings in `lib/ai/llm.ts` if you need faster replies.
