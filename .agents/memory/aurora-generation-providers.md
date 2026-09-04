---
name: Aurora generation provider model
description: How Perform Anywhere routes generation across ModelArk, fal.ai, Vast.ai, and direct Kling, including lip-sync input requirements.
---

# Aurora (Perform Anywhere) generation provider model

The app is `artifacts/perform-anywhere` (frontend) + `artifacts/api-server` (backend). Generations route through provider adapters with a fallback chain.

## Current provider boundary
- ModelArk is the OpenAI-compatible text provider.
- fal.ai is the primary managed media provider and must be called through the Replit connector proxy when no direct key exists.
- Direct Kling remains supported where Kling credentials are configured.
- Vast.ai tooling is authenticated, but application inference remains unavailable until a concrete deployment endpoint and worker contract exist.

**Why:** provider labels must describe a real callable path; installed SDKs or authenticated CLIs alone do not make a model available in the product.

**How to apply:** never show a model as functional unless its exact endpoint, required inputs, and output mapping are implemented and its provider is configured.

## Kling LipSync contract (live)
- fal endpoint: `fal-ai/kling-video/lipsync/audio-to-video`.
- Required inputs are `video_url` and `audio_url`; output is `video.url`.
- Input video must be MP4/MOV, 2–10 seconds, at most 100 MB.
- Input audio must be 2–60 seconds, at most 5 MB, using MP3/WAV/OGG/M4A/AAC.
- Enabled via the lip-sync toggle in Studio Step 2, not via the model picker.
- Lip-sync jobs route exclusively to fal — no fallback chain.

## OmniHuman contract (live)
- fal endpoint: `fal-ai/bytedance/omnihuman`, model alias `fal-omnihuman`.
- Required inputs are `image_url` (identity) and `audio_url`; output is `video.url`.
- Audio must be under 30 seconds. No MB limit documented by fal.
- Appears as a selectable model in Studio Step 2 (requires fal configured).
- OmniHuman jobs route exclusively to fal — no fallback chain.
- Client validation: requires identity + audio files before submit; duration checked client-side.

## Performance video as motion reference (live)
- When a performance video is uploaded but no identity image is provided, the render job signs the performance video and passes it as `options.videoUrl`.
- The fal adapter routes this to the image-to-video model endpoint (e.g. `fal-ai/wan/v2.7/image-to-video`) using `video_url` in the payload.
- `image_url` and `video_url` are mutually exclusive in the fal payload — the adapter now sends only one or the other.

## Signed-URL security (fixed)
- Both `/api/render/signed-url/render` and `/api/render/signed-url/asset` now require a valid `clientId`.
- Path ownership is always enforced: path must start with `${clientId}/` or the request is rejected 403.
- `api.ts` signatures updated to `clientId: string` (non-optional) matching server enforcement.

## Historical keyless capability asymmetry
- **Image** has a reliable keyless provider (`image.pollinations.ai`) — works with zero keys / zero credits, fast (sub-second). Keep this as the free image default.
- **Text** only had a keyless provider (`text.pollinations.ai`), but that endpoint is unreliable: it's deprecating its free legacy GET API, exposes only ONE anonymous model (`openai-fast`, aliases incl. `openai`), and routinely returns 500/429/000 under load. Do NOT rely on it as the primary free text path. The reliable free text path is `gemini` (free Google AI Studio dev key) and `groq` (free key) — both already wired adapters, both in FREE_PROVIDERS so `credits_used=0`. No code change is needed to enable them; just set `GEMINI_API_KEY` / `GROQ_API_KEY`.
- **Video and audio have NO anonymous provider.** They require a configured paid provider path. fal.ai is available through the Replit connector and must not be treated as a frontend API key.

## Free text keys: own-key, not the Replit AI integration
The Replit AI Integrations Gemini proxy (`setupReplitAIIntegrations`) was blocked on this account by `awaiting_phone_verification`, so text uses the user's OWN free keys instead. Two gotchas worth remembering:
- A consumer **Gemini app / Advanced subscription is NOT an API key.** The free developer key comes from Google AI Studio (`aistudio.google.com/apikey`) and is separate; users conflate the two. Groq free key: `console.groq.com/keys`.
- The `gemini` text adapter calls the Google `generativelanguage` v1beta `generateContent` endpoint with `GEMINI_API_KEY`; valid free models include `gemini-2.5-flash`/`gemini-2.0-flash`. The `groq` adapter is OpenAI-compatible chat completions with `GROQ_API_KEY`; free model `llama-3.3-70b-versatile`. Both verified working at 0 credits.

## Two generation surfaces (different flows)
- **Orchestrate page** (`/orchestrate`): synchronous `POST /api/orchestrate/run`; result lives only in React state + the generations history list. Credit-gated, so paid modalities (video/audio) are button-disabled at 0 balance.
- **Studio → ProjectDetail** (`/studio`, `/projects/:id`): the real video pipeline. `POST /api/render/start` fires a background in-process job, writes status to the `projects`/`project_renders` tables, and ProjectDetail polls `/api/render/poll`. This IS DB-persisted and resumable — failed/running renders show in the Library and persist across navigation (they do not "disappear"). Limitation: the background job is in-process, so an api-server restart mid-render orphans it until the 15-min stuck-job detector fails it.

## Lists that MUST stay in sync (drift = silent breakage)
- **Free-model flags:** client `perform-anywhere/src/lib/catalog.ts` marks defaults (`lovable/google/gemini-2.5-flash`, `...-flash-image`) `free:true`. The server must treat the same models as free or it charges credits and fails with `insufficient_credits` on a 0 balance. Server uses `isModelFree()` in `api-server/src/lib/orchestrate/catalog.ts` (a `FREE_MODELS` set), NOT just a provider-name set.
- **Fallback model names:** in `run.ts` the fallback loop passes the *provider name* as the model unless mapped. `FALLBACK_MODELS[modality][provider]` maps each fallback provider to a valid default model (e.g. pollinations text must be `openai`/`flux`, not `pollinations`, which 404s).
- **Render error message vs provider chain:** the no-key message in `render.ts` must only name providers actually in `providerOrder` (kling, wan, veo, sora, huggingface — note `fal`/`hailuo` are NOT in the Studio chain).

## Supabase schema drift breaks the render pipeline (real "renders disappear" cause)
The app's Supabase (project ref `dgtnkkarlwufxawfaybb`) drifted from what the render code expects. Missing columns the code reads/writes:
- `projects.output_path` — poll selects it, success path writes it. Missing → poll query errors → code returns `not_found` → renders appear to vanish / never resume; success update fails → never marked succeeded.
- `projects.selected_model` — Studio handles its absence gracefully (insert retry), but it should exist.
- `project_renders.prompt` and `project_renders.provider_task_id` — the /start and /retry inserts write `prompt`, so they fail silently (renderId comes back undefined → `jobId:""`), and the success path writes `provider_task_id`.
Migrations live in `api-server/migrations/*.sql` and are **applied manually in the Supabase SQL editor** (each file's header has the dashboard link) — there is NO automated runner. `DATABASE_URL`/`PG*` env vars point to a Replit-internal DB (`*.helium`), NOT Supabase, so you canNOT psql DDL into Supabase. Only the anon/publishable key is in env (no service-role key), so the agent cannot apply DDL itself; the user must run the SQL.
**How to apply:** when render features fail, probe the live tables (anon `select` each expected column with `.limit(1)`; "column does not exist" = missing) before assuming a code bug — schema drift masquerades as code failure.
**Gotcha — running `000_init_schema.sql` does NOT backfill columns:** it uses `create table if not exists`, so on a DB where the tables already exist (even partially), the whole CREATE is skipped and new columns are never added. After 000, the live DB was STILL missing `projects.output_path`/`selected_model` and `project_renders.prompt`/`provider_task_id`. The reliable fix is the ALTER-based `002_render_pipeline_columns.sql` (`add column if not exists`), which the user must run in the Supabase SQL editor.

## No free video path exists
Historical provider testing showed that configured credentials still fail when the downstream provider account has no funded inference capacity:
- `wan` (Replicate) → HTTP 402 "Insufficient credit" → top up at replicate.com/account/billing (401 = bad key; 402 = key fine, account needs credit). WAN model: `wavespeedai/wan-2.1-t2v-480p` (t2v) / `-i2v-480p` (image supplied).
- `veo` (Gemini `veo-2.0-generate-001`) → HTTP 400 FAILED_PRECONDITION "exclusively available to users with Google Cloud Platform billing enabled" → Veo is NOT in the free Gemini tier.
**There is no keyless/free text-to-video option** (Pollinations is image/text only). Distinguish provider configuration from provider funding when reporting failures.
Render error-reporting lesson: the video fallback loop must preserve the error from a *configured* provider over trailing `provider_unconfigured:*` noise — otherwise the real, actionable wan/veo failure gets masked behind whichever unconfigured provider ran last. Keep that invariant if editing the loop.

## Known pre-existing issues (not from the generation fixes)
- `tsc --noEmit` fails on `providers.ts` (`'j' is unknown` JSON casts) and `health.ts` (api-zod dist not built). The build uses esbuild (build.mjs), which strips types, so these don't block runtime.
- **Security:** `render.ts` `/signed-url/render` and `/signed-url/asset` only enforce path ownership when `clientId` is supplied — a request omitting clientId can sign any known storage path. Worth fixing (require a valid clientId) if revisited.

## Testing notes
- curl must use `https://$REPLIT_DEV_DOMAIN/...` (bare domain → HTTP 000). `clientId` must be a UUID (`cat /proc/sys/kernel/random/uuid`) or you get `invalid_client_id`.
- After editing api-server, restart its workflow — it runs `build && start`, so changes need a rebuild.
