---
name: Aurora generation provider model
description: How the Perform Anywhere (Aurora) AI app routes generations across providers, why video/audio fail without keys, and the parallel lists that must stay in sync.
---

# Aurora (Perform Anywhere) generation provider model

The app is `artifacts/perform-anywhere` (frontend) + `artifacts/api-server` (backend). Generations route through provider adapters with a fallback chain.

## Keyless capability asymmetry (the #1 "why doesn't it work" cause)
- **Image** has a reliable keyless provider (`image.pollinations.ai`) — works with zero keys / zero credits, fast (sub-second). Keep this as the free image default.
- **Text** only had a keyless provider (`text.pollinations.ai`), but that endpoint is unreliable: it's deprecating its free legacy GET API, exposes only ONE anonymous model (`openai-fast`, aliases incl. `openai`), and routinely returns 500/429/000 under load. Do NOT rely on it as the primary free text path. The reliable free text path is `gemini` (free Google AI Studio dev key) and `groq` (free key) — both already wired adapters, both in FREE_PROVIDERS so `credits_used=0`. No code change is needed to enable them; just set `GEMINI_API_KEY` / `GROQ_API_KEY`.
- **Video and audio have NO keyless provider.** Every video adapter (fal, replicate, kling, hailuo, wan, runway, sora, veo, huggingface) and audio adapter (elevenlabs, replicate) throws `ProviderUnconfigured` ("provider_unconfigured:<name>") when its key is missing.
- **Consequence:** video ("motion control" in user terms) and audio CANNOT generate until the user supplies at least one provider API key. This is configuration, not a code bug. Recommend `REPLICATE_API_TOKEN` (easiest — powers the `wan`/WAN 2.1 provider) or Kling / Gemini(Veo) / HuggingFace, since those are what the Studio render chain actually tries.

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

## No free video path exists — every wired video provider needs paid billing
Confirmed live (keys present): with `REPLICATE_API_TOKEN` + `GEMINI_API_KEY` set, the Studio render chain still fails because **both** funded attempts are unpaid accounts:
- `wan` (Replicate) → HTTP 402 "Insufficient credit" → top up at replicate.com/account/billing (401 = bad key; 402 = key fine, account needs credit). WAN model: `wavespeedai/wan-2.1-t2v-480p` (t2v) / `-i2v-480p` (image supplied).
- `veo` (Gemini `veo-2.0-generate-001`) → HTTP 400 FAILED_PRECONDITION "exclusively available to users with Google Cloud Platform billing enabled" → Veo is NOT in the free Gemini tier.
**There is no keyless/free text-to-video option** (Pollinations is image/text only). Video is inherently a paid feature here; for a cost-sensitive user the cheapest already-wired path is a small Replicate balance (token already set ⇒ works automatically once funded). Don't keep re-investigating — the blocker is provider funding, not code.
Render error-reporting lesson: the video fallback loop must preserve the error from a *configured* provider over trailing `provider_unconfigured:*` noise — otherwise the real, actionable wan/veo failure gets masked behind whichever unconfigured provider ran last. Keep that invariant if editing the loop.

## Known pre-existing issues (not from the generation fixes)
- `tsc --noEmit` fails on `providers.ts` (`'j' is unknown` JSON casts) and `health.ts` (api-zod dist not built). The build uses esbuild (build.mjs), which strips types, so these don't block runtime.
- **Security:** `render.ts` `/signed-url/render` and `/signed-url/asset` only enforce path ownership when `clientId` is supplied — a request omitting clientId can sign any known storage path. Worth fixing (require a valid clientId) if revisited.

## Testing notes
- curl must use `https://$REPLIT_DEV_DOMAIN/...` (bare domain → HTTP 000). `clientId` must be a UUID (`cat /proc/sys/kernel/random/uuid`) or you get `invalid_client_id`.
- After editing api-server, restart its workflow — it runs `build && start`, so changes need a rebuild.
