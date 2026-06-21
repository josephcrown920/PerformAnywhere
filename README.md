# Perform Anywhere

An anonymous, credit-based AI video platform. Film a 30-second performance, supply an identity photo, an outfit, and a scene reference — the platform restages it in a new world using Kling, Runway, or Fal video models.

No accounts. No subscriptions. Pay with Paystack, render takes.

---

## Architecture

```
workspace/
├── artifacts/
│   ├── perform-anywhere/     # React + Vite SPA  (port 21597, preview: /)
│   └── api-server/           # Express API server (port 8080)
└── lib/
    ├── api-spec/             # OpenAPI spec (healthz only; app uses direct routes)
    └── api-zod/              # Generated Zod schemas
```

### Identity model

No auth. Every browser generates a UUID (`ps_client_id`) stored in `localStorage`. All Supabase rows carry `client_id uuid` — RLS is permissive (anon key can read/write own rows).

### Frontend → Backend split

| Concern | Where |
|---|---|
| Projects list, project detail, asset metadata reads | Supabase JS client (direct from browser) |
| File uploads | Supabase Storage (`uploads` bucket) via browser client |
| Video renders (Kling/Runway, long-running) | `POST /api/render/start` → fires background job on API server |
| Credit wallet, generation history | `POST /api/orchestrate/wallet` / `/list` |
| AI generation (text/image/video/audio) | `POST /api/orchestrate/run` |
| Prompt enhancement | `POST /api/prompt/enhance` |
| Paystack top-up init | `POST /api/orchestrate/paystack` |
| Paystack webhook (credit grant) | `POST /api/paystack-webhook` |

---

## Pages

| Route | Page | Purpose |
|---|---|---|
| `/` | Landing | Marketing — how it works, input list, CTA |
| `/projects` | Projects | Library of all projects for the current session |
| `/projects/:id` | Project Detail | Input preview, render status/video, retry controls |
| `/studio` | Studio wizard | 3-step wizard: assets → direction → review → render |
| `/orchestrate` | Orchestrate | Unified AI panel (text/image/video/audio) + wallet |
| `/account` | Account / Settings | Session ID, reset, provider key status |

---

## API routes

```
GET  /api/healthz
GET  /api/render/providers          → provider key status list
POST /api/render/start              → queue a render job (fire-and-forget)
POST /api/render/poll               → project status + output path
POST /api/render/retry              → switch provider + reset status
POST /api/render/signed-url/render  → signed URL for output video
POST /api/render/signed-url/asset   → signed URL for input asset

POST /api/orchestrate/wallet        → credit wallet balance
POST /api/orchestrate/list          → generation history
POST /api/orchestrate/run           → run an AI generation (text/image/video/audio)
POST /api/orchestrate/paystack      → init Paystack transaction

POST /api/prompt/enhance            → AI cinematic prompt writer

POST /api/paystack-webhook          → HMAC-verified credit grant webhook
```

---

## Environment variables

| Key | Used by | Purpose |
|---|---|---|
| `VITE_SUPABASE_URL` | Frontend | Supabase project URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Frontend | Supabase anon/public key |
| `SUPABASE_URL` | API server | Same URL, server-side |
| `SUPABASE_PUBLISHABLE_KEY` | API server | Same anon key, server-side |
| `KLING_ACCESS_KEY` | API server | Kling AI video — access key |
| `KLING_SECRET_KEY` | API server | Kling AI video — secret key (JWT signing) |
| `RUNWAY_API_KEY` | API server | Runway ML (optional fallback) |
| `FAL_KEY` | API server | Fal.ai image + video (optional) |
| `REPLICATE_API_TOKEN` | API server | Replicate models (optional) |
| `LOVABLE_API_KEY` | API server | Lovable AI Gateway — text + image |
| `GROQ_API_KEY` | API server | Groq LLMs — fast text (optional) |
| `GEMINI_API_KEY` | API server | Google Gemini direct (optional) |
| `OPENAI_API_KEY` | API server | OpenAI (optional) |
| `HUGGINGFACE_API_KEY` | API server | HuggingFace inference (optional) |
| `ELEVENLABS_API_KEY` | API server | ElevenLabs TTS (optional) |
| `PAYSTACK_SECRET_KEY` | API server | Paystack billing + webhook verification |

Missing provider keys are not errors — the runner degrades gracefully with automatic fallback.

---

## Supabase schema (key tables)

```sql
projects          — id, client_id, title, status, provider, scene_prompt, style_prompt, enhanced_prompt, output_path, error_message
project_assets    — project_id, client_id, kind (performance|identity|outfit|scene), storage_path, mime_type
project_renders   — project_id, client_id, provider, status, prompt, output_path, error_message
generations       — client_id, modality, provider, model, prompt, status, output_url, output_text, credits_used
credit_wallets    — client_id, balance, lifetime_purchased, lifetime_spent
credit_ledger     — client_id, delta, reason, generation_id, purchase_id
purchases         — client_id, paystack_reference, amount_paid_minor, currency, credits_allocated
```

Supabase RPCs: `spend_credits`, `grant_credits` (atomic, prevent race conditions).

---

## Development

```bash
# Install
pnpm install

# Start both servers (each has its own workflow in Replit)
pnpm --filter @workspace/perform-anywhere run dev   # frontend
pnpm --filter @workspace/api-server run dev         # API
```

---

## Smoke tests

```bash
# Health
curl http://localhost:8080/api/healthz

# Provider status
curl http://localhost:8080/api/render/providers

# Wallet (returns zero-balance row for new IDs)
curl -X POST http://localhost:8080/api/orchestrate/wallet \
  -H "Content-Type: application/json" \
  -d '{"clientId":"00000000-0000-0000-0000-000000000000"}'

# Prompt enhancement
curl -X POST http://localhost:8080/api/prompt/enhance \
  -H "Content-Type: application/json" \
  -d '{"scenePrompt":"neon Tokyo alley","stylePrompt":"35mm grain","hasIdentity":true,"hasOutfit":false,"hasScene":false}'
```

---

## Credit pricing

| Modality | Cost |
|---|---|
| Text | 1 credit / request |
| Image | 50 credits / image |
| Video | 200 credits / second |
| Audio | 75 credits / request |

1 NGN = 1 credit (Paystack top-up).

---

## Provider fallback chain

Each modality has an ordered fallback list. If the selected provider fails or is unconfigured, the runner tries the next one automatically.

```
text:  lovable → gemini → groq → mistral → pollinations → huggingface → openai → cohere
image: lovable → pollinations → huggingface → fal → replicate → runware
video: kling → fal → replicate
audio: elevenlabs → replicate
```

Pollinations requires no API key and is used as a free text/image fallback.

---

## Migrated from

Originally built with Lovable / TanStack Start. Migrated to this Replit pnpm monorepo. The Supabase project (`dgtnkkarlwufxawfaybb`) and all existing data are shared — no data was lost in the migration.
