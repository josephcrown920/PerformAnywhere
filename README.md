# Perform Anywhere

An anonymous, credit-based AI video platform. Film a 30-second performance, supply an identity photo, an outfit, and a scene reference — the platform restages it in a new world using Kling, Runway, or Fal video models.

No accounts. No subscriptions. Pay with Paystack, render takes.

---

## Architecture

```text
workspace/
├── artifacts/
│   ├── perform-anywhere/     # React + Vite SPA
│   └── api-server/           # Express API server
└── lib/
    ├── api-spec/             # OpenAPI spec
    └── api-zod/              # Generated Zod schemas
```

### Identity model

No auth. Every browser generates a UUID (`ps_client_id`) stored in `localStorage`. Supabase rows carry `client_id uuid`.

### Frontend → Backend split

| Concern | Where |
|---|---|
| Projects and asset metadata | Supabase JS client |
| File uploads | Supabase Storage |
| Video renders | `POST /api/render/start` |
| Credit wallet/history | `/api/orchestrate/*` |
| AI generation | `POST /api/orchestrate/run` |
| Prompt enhancement | `POST /api/prompt/enhance` |
| Paystack top-up | `POST /api/orchestrate/paystack` |
| Paystack webhook | `POST /api/paystack-webhook` |

## Pages

| Route | Purpose |
|---|---|
| `/` | Landing |
| `/projects` | Project library |
| `/projects/:id` | Project detail and render status |
| `/studio` | Studio wizard |
| `/orchestrate` | Unified AI generation panel |
| `/account` | Session/settings |

## API routes

```text
GET  /api/healthz
GET  /api/render/providers
POST /api/render/start
POST /api/render/poll
POST /api/render/retry
POST /api/render/signed-url/render
POST /api/render/signed-url/asset
POST /api/orchestrate/wallet
POST /api/orchestrate/list
POST /api/orchestrate/run
POST /api/orchestrate/paystack
POST /api/prompt/enhance
POST /api/paystack-webhook
```

## Workflow Engine Upgrade

Perform Anywhere now includes a provider-neutral workflow engine: registry, intelligent planner, compatibility checks, GPU racing, shot construction, creative variants, marketplace manifests, benchmarking, and Seedance capability profiles.

### Workflow packs

- Perform Anywhere Motion Transfer — performance preservation, motion/pose transfer, identity/outfit/scene replacement.
- Music Video Suite — lip sync, beat sync, camera choreography, dance transfer, multi-shot continuity and outfit changes.
- Product Ad Factory — studio, lifestyle, UGC, luxury and cinematic variants in 6/15/30-second formats.
- Character & Identity Lock — identity, wardrobe, hair and character consistency.
- Social Creative Variant Factory — hooks, camera, environment and composition A/B matrices with batch generation.

### Workflow API

```text
GET  /api/workflows
GET  /api/workflows/:id
GET  /api/workflows/gpus/race?minVramGb=24&freeOnly=true
POST /api/workflows/plan
POST /api/workflows/compatibility
```

The planner scores task, modality, category, aspect ratio, duration, provider preference and requested capabilities. GPU routing ranks available workers by queue time and estimated cost, including a free-only mode. Compatibility checks expose missing dependencies before execution.

### Perform Anywhere controls

The shot-builder contract is Scene → Subject → Camera → Motion → Lighting → Style → Duration → Aspect Ratio. Variant matrices cover hooks, cameras, environments and compositions.

Seedance profiles include Seedance 2.5, Seedance 2.5 Pro and Seedance 2.5 Fast. Provider/model invocation remains behind the existing generation boundary so credentials and live endpoint behavior stay centralized.

## Environment variables

| Key | Purpose |
|---|---|
| `VITE_SUPABASE_URL` | Frontend Supabase URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Frontend Supabase key |
| `SUPABASE_URL` | API Supabase URL |
| `SUPABASE_PUBLISHABLE_KEY` | API Supabase key |
| `KLING_ACCESS_KEY` / `KLING_SECRET_KEY` | Kling |
| `RUNWAY_API_KEY` | Runway |
| `FAL_KEY` | Fal |
| `REPLICATE_API_TOKEN` | Replicate |
| `MODEL_ARK_API_KEY` | BytePlus ModelArk |
| `PAYSTACK_SECRET_KEY` | Paystack |

Missing optional provider keys continue to use the existing fallback behavior.

## Development

```bash
pnpm install
pnpm --filter @workspace/perform-anywhere run dev
pnpm --filter @workspace/api-server run dev
```

## Credit pricing

| Modality | Cost |
|---|---|
| Text | 1 credit / request |
| Image | 50 credits / image |
| Video | 200 credits / second |
| Audio | 75 credits / request |

1 NGN = 1 credit for Paystack top-ups.

## Existing provider fallback

The existing runner uses ordered provider fallbacks for text, image, video and audio and degrades gracefully when optional keys are unavailable. The workflow engine adds planning/routing above that boundary rather than replacing it.

## Production roadmap represented by the new contracts

Workflow versioning, dependency manifests, official/community/private sources, fallback provider planning, batch generation, creative A/B testing, GPU-aware execution and benchmark metrics are represented as stable backend contracts. Execution adapters can be connected incrementally without replacing the existing Express/Supabase/Paystack architecture.
