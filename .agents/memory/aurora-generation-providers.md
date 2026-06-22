---
name: Aurora generation provider model
description: How the Perform Anywhere (Aurora) AI app routes generations across providers, why video/audio fail without keys, and the parallel lists that must stay in sync.
---

# Aurora (Perform Anywhere) generation provider model

The app is `artifacts/perform-anywhere` (frontend) + `artifacts/api-server` (backend). Generations route through provider adapters with a fallback chain.

## Keyless capability asymmetry (the #1 "why doesn't it work" cause)
- **Text and image** have a keyless fallback (`pollinations`), so they work with zero API keys / zero credits.
- **Video and audio have NO keyless provider.** Every video adapter (fal, replicate, kling, hailuo, wan, runway, sora, veo, huggingface) and audio adapter (elevenlabs, replicate) throws `ProviderUnconfigured` ("provider_unconfigured:<name>") when its key is missing.
- **Consequence:** video ("motion control" in user terms) and audio CANNOT generate until the user supplies at least one provider API key. This is configuration, not a code bug. Recommend `REPLICATE_API_TOKEN` (easiest — powers the `wan`/WAN 2.1 provider) or Kling / Gemini(Veo) / HuggingFace, since those are what the Studio render chain actually tries.

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

## Replicate billing is separate from the key
A valid `REPLICATE_API_TOKEN` still returns HTTP 402 "Insufficient credit" if the Replicate account has no billing/credit. 401 = bad key; 402 = key fine, account needs credit at replicate.com/account/billing. WAN model used: `wavespeedai/wan-2.1-t2v-480p` (t2v) / `-i2v-480p` (when an image is supplied).

## Known pre-existing issues (not from the generation fixes)
- `tsc --noEmit` fails on `providers.ts` (`'j' is unknown` JSON casts) and `health.ts` (api-zod dist not built). The build uses esbuild (build.mjs), which strips types, so these don't block runtime.
- **Security:** `render.ts` `/signed-url/render` and `/signed-url/asset` only enforce path ownership when `clientId` is supplied — a request omitting clientId can sign any known storage path. Worth fixing (require a valid clientId) if revisited.

## Testing notes
- curl must use `https://$REPLIT_DEV_DOMAIN/...` (bare domain → HTTP 000). `clientId` must be a UUID (`cat /proc/sys/kernel/random/uuid`) or you get `invalid_client_id`.
- After editing api-server, restart its workflow — it runs `build && start`, so changes need a rebuild.
