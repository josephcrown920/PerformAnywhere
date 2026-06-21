# Aurora Synthetic Intelligence — Studio

An AI video generation studio. Users upload a performance video and identity photo (+ optional outfit/scene references), write creative direction, pick a model, and generate a cinematic AI render via Kling, Hailuo, or fal.ai.

## Run & Operate

- `pnpm --filter @workspace/perform-anywhere run dev` — frontend (React + Vite, port from $PORT)
- `pnpm --filter @workspace/api-server run dev` — Express API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages

## Required env vars

| Key | Purpose |
|---|---|
| `KLING_ACCESS_KEY` + `KLING_SECRET_KEY` | AI video generation (primary provider) — **required** |
| `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` + `SUPABASE_PUBLISHABLE_KEY` | DB + Storage |
| `FAL_KEY` | fal.ai fallback provider (optional) |
| `ELEVENLABS_API_KEY` | Audio generation (optional — not yet configured) |
| `PAYSTACK_SECRET_KEY` | Payments / credits (optional) |

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React 19 + Vite 7, Tailwind CSS v4, Wouter (routing), React Query
- API: Express 5
- DB + Storage: Supabase (PostgreSQL + Storage buckets)
- AI providers: Kling (primary), Hailuo, fal.ai (fallbacks)

## Where things live

```
artifacts/
  perform-anywhere/    # React + Vite frontend
    src/
      pages/           # Studio, Projects, ProjectDetail, Orchestrate, Account, Landing
      components/      # AppLayout
      lib/             # api.ts, supabase.ts, client-id.ts
    public/            # aurora-logo.png, favicon.svg
  api-server/
    src/
      routes/          # render.ts, orchestrate.ts, prompt.ts
      lib/
        orchestrate/   # providers.ts — video/image/audio adapters
```

## DB tables (Supabase)

| Table | Key columns |
|---|---|
| `projects` | id, client_id, title, status, provider, selected_model, scene_prompt, style_prompt, enhanced_prompt, output_path, error_message, created_at, updated_at |
| `project_assets` | id, project_id, client_id, kind (performance/identity/outfit/scene), storage_path, mime_type |
| `project_renders` | id, project_id, client_id, provider, status, prompt, output_path, error_message |
| `generations` | id, client_id, modality, provider, model, prompt, status, output_url, credits_used |
| `credit_wallets` | client_id, balance, lifetime_purchased, lifetime_spent |

## Architecture decisions

- **Client-ID auth**: No user accounts — projects scoped to a UUID in localStorage, passed in every request body. IDOR protection: API validates path prefix matches clientId before signing storage URLs.
- **Fire-and-forget renders**: `POST /render/start` queues the DB, returns immediately, runs the AI job in the background. `POST /render/poll` checks status every 5 s client-side. Jobs stuck >15 min auto-fail.
- **Model → provider routing**: Model string like `kling-v1-6-pro` determines primary provider; render job falls back to hailuo → fal if primary fails.
- **Identity photo as image reference**: Kling's image2video uses the identity photo (not the performance video URL) as the visual reference for face preservation.
- **Supabase Storage buckets**: `uploads` (assets) + `renders` (output videos), both with signed URLs (1 hr TTL). Signed via server to prevent IDOR.

## User preferences

- App is branded **Aurora Synthetic Intelligence** (not "Perform Anywhere")
- Deep purple theme: `oklch(0.10 0.04 290)` background, hot pink `oklch(0.65 0.30 330)` accent
- Aurora logo PNG at `artifacts/perform-anywhere/public/aurora-logo.png`
- Models offered: Kling v1.6 Std (fast), Kling v1.6 Pro (quality), Hailuo (alt)

## Gotchas

- Video preview in Dropzone requires `autoPlay muted playsInline loop` — blob URLs won't show first frame without `autoPlay`
- Kling adapter expects identity photo URL (still image), NOT the performance video URL, as `imageUrl`
- `selected_model` column must exist on `projects` table for the model picker to persist correctly (add via: `ALTER TABLE projects ADD COLUMN IF NOT EXISTS selected_model text;`)
