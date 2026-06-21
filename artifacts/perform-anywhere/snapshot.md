# UI Snapshot — Perform Anywhere

Visual and functional snapshot of the app as of the Replit migration (June 2026).
Update this file whenever a major UI or routing change is made.

---

## Global

| Item | Value |
|---|---|
| Theme | Dark only (`color-scheme: dark`) |
| Background | `oklch(0.16 0.005 60)` — deep charcoal |
| Primary accent | `oklch(0.62 0.19 32)` — ember/terracotta |
| Display font | Fraunces (serif, optical sizing) |
| Body font | Inter |
| Border style | Subtle `border-border/30–50` throughout |
| Nav | Sticky header, icon+label (label hidden on mobile) |

---

## `/` — Landing

**Hero**
- Eyebrow pill: amber dot + "MOTION · IDENTITY · SCENE" uppercase
- H1: "Direct yourself / *in any world.*" — italic primary on second line
- Subtext: 38-char max, `text-lg`
- CTAs: Primary ("Start a project →") + ghost ("See the pipeline")
- Right col: 3 stacked/rotated film-card decoratives (hidden on mobile)
- Background: faint grid pattern (`linear-gradient`, 4% opacity)
- `.grain` texture overlay

**How it works (4 steps)**
- Card grid `md:grid-cols-4`, `gap-px` (border-collapse effect)
- Each card: icon + step number + title + body

**Inputs (5 items)**
- 2-col: left = headline + description; right = numbered list with file format hints

**CTA section**
- Centred, `.grain`, Clapperboard icon, display headline, primary button

**Footer**
- `text-xs`, icon + name left, tagline right

---

## `/projects` — Projects Library

**Empty state**
- Centred `Film` icon (40px, `strokeWidth=1`, 30% opacity)
- `font-display text-2xl` "No takes yet"
- CTA button

**Populated grid**
- `sm:grid-cols-2 lg:grid-cols-3`, `gap-5`
- Each card:
  - Thumbnail: `aspect-video`, `grain` gradient, `Film` icon placeholder
  - Running overlay: 50% dark bg + spinning Loader2
  - Succeeded: `CheckCircle2` badge bottom-right
  - Info: title (display font, hover → primary), `StatusPill`, date + provider

---

## `/studio` — Wizard

**Step bar**
- Inline pill buttons: `1 Assets › 2 Direction › 3 Review`
- Active = `bg-primary text-primary-foreground`
- Completed = muted, clickable; future = 40% opacity, disabled

**Step 1 — Assets**
- Project title input (max-w-sm)
- 2×2 Dropzone grid
  - Each: label + hint + dashed upload zone
  - Preview replaces zone when file staged

**Step 2 — Direction**
- 8 style chip pills (click-to-append)
- 2-col textarea (scene notes / visual style), 5 rows each
- "Enhance with AI" button (sparkles icon)
- Enhanced prompt card: `border-primary/30 bg-primary/5`

**Step 3 — Review**
- `ReviewRow` table in `bg-card` rounded border
- Two-column: label (28px fixed) + value

**Nav**
- Bottom: Back/Cancel (left), Continue/Submit (right)
- Submit shows spinner when in-flight

---

## `/projects/:id` — Project Detail

**Header**
- Back link, title, status pill, date, provider, Delete button (destructive hover)

**2-col layout** (lg: `[1fr_1.4fr]`)

Left:
- 2×2 input thumbnails (video/image previews or "—" placeholders)
- Enhanced prompt block (if set)

Right:
- Output frame (`aspect-video`):
  - **Queued/Running**: dark bg, spin animation, "Rendering…" display text, sub-note
  - **Succeeded**: `<video>` player
  - **Failed**: `text-destructive` "Render failed" + error message
- Actions (below frame):
  - Download MP4 (primary button, succeeded only)
  - Retry provider buttons (border buttons, failed/succeeded)

---

## `/orchestrate` — AI Router

**Header row**
- Left: eyebrow "AI ROUTER", h1 "Orchestrate", subtitle
- Right: wallet card (`bg-card border`, `font-display text-4xl` balance, email input, top-up buttons)

**Modality tabs**
- Uppercase, underline active (border-b-2 primary), `overflow-x-auto`

**Controls**
- Model select (full width or half grid)
- Duration number input (video only, half grid)
- Prompt textarea (`font-mono`, 4 rows)
- Cost row (left) + Generate button (right)

**Result card**
- Meta line: provider · model · credits · duration
- Output: text paragraph / `<img>` / `<video>` / `<audio>`
- Fallback log: `<details>` collapsible

**History table**
- Divided rows in `bg-card` rounded border
- Columns: modality badge | provider | prompt (truncated) | status | credits | chevron

---

## `/account` — Settings

**Session card**
- Session UUID in `font-mono text-xs` inside `bg-background` inset box
- Reset button: border, destructive hover

**Provider keys card**
- Two sections: Active (emerald check) / Not configured (muted alert icon)
- Row: label + env-key name left, status right

**Footer hint**
- `text-xs` with inline `<code>` tags for key names

---

## Smoke test results (migration baseline)

| Test | Result |
|---|---|
| `GET /api/healthz` | `{"status":"ok"}` ✓ |
| `GET /api/render/providers` | Returns 11-item array ✓ |
| `POST /api/orchestrate/wallet` (valid UUID) | `{"balance":0,...}` ✓ |
| `POST /api/render/poll` (unknown project) | `{"error":"not_found"}` ✓ |
| Frontend load (`/`) | Renders, no runtime errors ✓ |
| Frontend nav (all pages) | Routes functional, Supabase connected ✓ |
| Supabase project | `dgtnkkarlwufxawfaybb.supabase.co` — existing data intact ✓ |

---

## Known gaps (to configure)

- **No provider keys set** → renders will fail until `KLING_ACCESS_KEY` + `KLING_SECRET_KEY` are added to Secrets
- **Paystack** not configured → top-up button initiates but fails server-side
- **Lovable AI Gateway** / Groq / Gemini keys not set → prompt enhancement falls back gracefully
