# UI Snapshot — Aurora Synthetic Intelligence (Studio)

Visual and functional snapshot as of June 2026 (post-Aurora rebrand).
Update this file whenever a major UI or routing change is made.

---

## Global

| Item | Value |
|---|---|
| Brand name | **Aurora Synthetic Intelligence** |
| Theme | Dark only (`color-scheme: dark`) |
| Background | `oklch(0.10 0.04 290)` — deep space purple |
| Primary accent | `oklch(0.58 0.26 290)` — violet |
| Hot-pink accent | `oklch(0.65 0.30 330)` — CTAs, badges, "shoot." hero word |
| Body font | Inter |
| Display/heading | Bold `font-bold tracking-tight` (no serif) |
| Border style | `oklch(0.28 0.07 285 / 0.4–0.6)` throughout |
| Corner radius | `rounded-xl` (12 px) cards, `rounded-2xl` (16 px) large panels |
| Nav | Sticky header, glass blur, icon+label, active pill with purple tint |
| Logo | `/aurora-logo.png` — 32px, left of wordmark |

---

## `/` — Landing

- Unchanged from original Perform Anywhere design (hero + how-it-works + CTA)
- Footer still says "Perform Anywhere" (future: update to Aurora)

---

## `/projects` — Library (Generations)

**Header row**
- Eyebrow label: "GENERATIONS" in hot pink
- H1: "Your library"
- Top-right: "+ New render" hot-pink button

**Empty state**
- Centred icon box (`oklch(0.58 0.26 290 / 0.15)` bg, `Film` icon)
- "No generations yet" + descriptor copy
- Pink CTA button

**Populated grid**
- `sm:grid-cols-2 lg:grid-cols-3`, `gap-4`
- Each card (`rounded-2xl`, hover `scale-[1.02]`):
  - **Thumbnail** (`aspect-video`): looping `<video autoPlay muted loop>` for succeeded; spinner + "Rendering…" for running; XCircle for failed
  - **Status badge** (top-left, glass overlay): `StatusPill`
  - **Provider badge** (top-right, glass overlay): capitalized provider name
  - **Info strip** (bottom): title (hover → `text-purple-300`), date, error snippet if failed

---

## `/studio` — Wizard (3 steps)

**Header**
- H1: "Direct your <hot-pink>shoot.</hot-pink>"
- Sub: "Drop references → write direction → generate. That's it."

**Step bar**
- Pill buttons with `›` separators; active = purple bg + hot-pink step dot; completed = checkmark

**Step 1 — Assets**
- Project title input (`rounded-xl`, purple-tinted bg)
- 2×2 `Dropzone` grid:
  - Hot-pink badge (01–04)
  - Upload zone: dashed border, Upload icon, "Click or drag to upload"
  - Video preview: `<video autoPlay muted playsInline loop>` on blob URL (fixes blank preview)
  - Image preview: `<img>`

**Step 2 — Direction**
- **Model picker** (top): 3-card grid — Kling v1.6 (Fast, purple badge), Kling v1.6 Pro (Quality, pink badge), Hailuo (Alt, dark badge). Active card: purple border + animated pink pulse dot.
- **Direct prompt box**: free-text `<textarea>` with note "(optional — overrides AI enhancement)"
- **Style chips**: 8 preset pills (click-to-append)
- **2-col textarea grid**: Scene notes + Visual style
- **"Enhance with AI" button**: only visible when direct prompt is empty; sparkles icon
- **AI-enhanced prompt card**: purple-tinted box, shown after enhancement

**Step 3 — Review**
- `ReviewRow` table in purple-tinted rounded panel
- "Model" row highlighted in hot pink
- Submit: pink "Render performance ✦" button

---

## `/projects/:id` — Project Detail

**Header**
- Back link to "/projects", title, status pill, provider, date, Delete button

**Progress indicator** (visible only when status = queued or running)
- 5-step pipeline visual: Upload → Queue → AI Render → Download → Done
  - Each step: icon circle (green=done, purple=active+pulse, dark=pending) + label
  - Connector line between steps (green when done, dim when pending)
- Animated progress bar (gradient purple→pink) driven by elapsed vs. model ETA:
  - Kling v1.6 Std: 150 s
  - Kling v1.6 Pro: 300 s
  - Hailuo: 240 s
- Elapsed / remaining timestamps updated every second
- Model badge (rounded pill, purple-tinted)

**2-col layout** (`lg:[1fr_1.5fr]`)

Left — Reference inputs:
- 2×2 asset thumbnails (rounded-xl, dark bg)
- Performance: `<video autoPlay loop>`, others: `<img>`
- Prompt block (if set) in dark rounded panel

Right — Output:
- Queued/Running: spinner + "Rendering…" / "In queue" + "You can leave this page"
- Succeeded: `<video controls>`
- Failed: "Render failed" + error message

Actions (below output):
- "Download MP4" — hot-pink button (succeeded only)
- "Try another model:" — border buttons for kling / hailuo / fal

---

## `/orchestrate` — AI Router

Unchanged from pre-rebrand. Shows wallet, modality tabs, model selector, prompt, result, history.

---

## `/account` — Settings

- "Anonymous session" card + "Provider keys" card (Active / Not configured sections)
- Footer hint: minimum required env vars
- ElevenLabs (audio) shows as "Not configured" until `ELEVENLABS_API_KEY` is set

---

## Smoke test results (June 2026 — post-rebrand)

| Test | Result |
|---|---|
| Aurora logo in nav | ✓ `/aurora-logo.png` loaded |
| Video autoPlay on upload | ✓ blob URL plays immediately |
| Model picker (Step 2) | ✓ 3 cards, selection persists to Review |
| Direct prompt override | ✓ sent as `enhanced_prompt` |
| Library — video thumbnails | ✓ lazy signed-URL fetch, loops on hover |
| Progress bar — pipeline steps | ✓ pipeline renders during queued/running |
| Render start with model param | ✓ `POST /render/start` accepts `model` field |

---

## Known gaps

- **ElevenLabs** not configured → audio generation unavailable (Settings shows this)
- **Landing page** still says "Perform Anywhere" in footer — cosmetic, not urgent
- **Paystack** not configured → credit top-up fails server-side
- `selected_model` column must be added to Supabase `projects` table (migration in replit.md)
