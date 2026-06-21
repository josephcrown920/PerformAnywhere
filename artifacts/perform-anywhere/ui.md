# UI Reference — Aurora Synthetic Intelligence (Studio)

Design system, component structure, and page-level UI spec for the React + Vite frontend.
Last updated: June 2026 (Aurora rebrand + model picker + progress bar).

---

## Design tokens

Defined inline via `style={}` props (oklch colour space, no separate CSS vars updated yet).

| Token | Value | Usage |
|---|---|---|
| Page background | `oklch(0.10 0.04 290)` | Deep space purple |
| Card surface | `oklch(0.14 0.05 285)` | Lifted panels, dropzones |
| Card surface 2 | `oklch(0.16 0.06 285)` | Input fields |
| Border subtle | `oklch(0.28 0.07 285 / 0.4–0.6)` | Card edges, dividers |
| Primary violet | `oklch(0.58 0.26 290)` | Active states, pipeline, model badge |
| Hot pink | `oklch(0.65 0.30 330)` | CTAs, hero word, badges, pill numbers, "shoot." |
| Muted text | `oklch(0.45 0.08 285)` | Labels, hints, sub-copy |
| Emerald (done) | `oklch(0.50 0.18 155)` | Pipeline complete steps |

### Typography

| Variant | Class | Usage |
|---|---|---|
| Page headings | `text-4xl/5xl font-bold tracking-tight text-white` | H1s |
| Eyebrow labels | `text-xs font-semibold uppercase tracking-widest` + hot pink | Section openers |
| Body | Inter default | All UI text |
| Mono | System mono | Prompt boxes, session IDs |

### Film-grain overlay

`.grain` class adds a subtle `::after` SVG noise layer. Kept for landing page hero / placeholder cards. Children need `position: relative`.

---

## Layout

All pages use `AppLayout` (`src/components/AppLayout.tsx`):

- Sticky header, `z-40`, glass blur (`backdrop-blur-md`), `oklch(0.10 0.04 290 / 0.88)` bg
- Logo: `/aurora-logo.png` (32 × 32) + "Aurora" wordmark + "SYNTHETIC INTELLIGENCE" micro-tagline (hot pink)
- Nav: Library / New / Orchestrate / Settings — icon + label (label visible on ≥ sm). Active state = `oklch(0.58 0.26 290 / 0.25)` bg, `border oklch(0.58 0.26 290 / 0.35)`
- Max content width: `max-w-5xl` with `px-6` gutters

---

## Components

### `AppLayout` (`src/components/AppLayout.tsx`)
Wraps every page. Sticky nav + slot for content.

### `StatusPill` (`src/pages/Projects.tsx`)
Inline status indicator with lucide icon. States:
- `draft` → `Circle`, `#ffffff55`
- `queued` → `Clock`, `#facc15` (yellow)
- `running` → `Loader2` spinning, `#60a5fa` (blue)
- `succeeded` → `CheckCircle2`, `#34d399` (emerald)
- `failed` → `XCircle`, `#f87171` (red)

### `Dropzone` (`src/pages/Studio.tsx`)
File upload zone used in the Studio wizard.
Props: `kind`, `label`, `hint`, `accept`, `file`, `onChange`, `required`, `badge`.
- Drag-and-drop + click-to-upload
- Hot-pink numbered badge (01–04)
- Video preview: `<video autoPlay muted playsInline loop>` (fixes blank preview bug — blob URLs need autoPlay)
- Image preview: `<img>`
- `X` button top-right to clear staged file

### `ReviewRow` (`src/pages/Studio.tsx`)
Two-column review row. Props: `label`, `value`, `highlight` (bold hot-pink for model row).

### `RenderProgress` (`src/pages/ProjectDetail.tsx`)
Real-time pipeline progress panel. Visible when status is `queued` or `running`.
- 5-step pipeline: Upload → Queue → AI Render → Download → Done
- Animated progress bar gradient (violet → hot-pink)
- Elapsed + estimated remaining (second-accurate)
- ETA constants: Kling Std 150 s, Kling Pro 300 s, Hailuo 240 s
- Model badge (violet tinted pill)

### `ProviderRow` (`src/pages/Account.tsx`)
Provider key status row: label + env-key name + configured/not-set badge.

---

## Pages

### Landing (`/`)
- Ember/terracotta theme from original design — not yet rebranded
- Hero headline, 4-step how-it-works, inputs list, CTA section, footer

### Library (`/projects`)
- Eyebrow "GENERATIONS" + h1 "Your library"
- `sm:grid-cols-2 lg:grid-cols-3` card grid
- `ProjectCard`: lazy-loads signed video URL for succeeded renders → `<video autoPlay muted loop>` thumbnail
- Status + provider overlaid as glass badges top of thumbnail
- Card hover: `scale-[1.02]`

### Studio (`/studio`) — 3-step wizard

**Step 1 — Assets**
- Project title input
- 2×2 `Dropzone` grid (performance required, identity required, outfit optional, scene optional)

**Step 2 — Direction**
- Model picker cards (3): Kling v1.6 Std / Pro, Hailuo
- Direct prompt textarea (overrides AI if filled)
- Style chip pills (8 presets)
- 2-col textareas: scene notes + visual style
- "Enhance with AI" → `POST /api/prompt/enhance` → enhanced prompt card

**Step 3 — Review**
- `ReviewRow` table with model highlighted in hot pink
- Submit: uploads files → inserts project row (with `selected_model`) → calls `POST /api/render/start` with `model` field

### Project Detail (`/projects/:id`)
- Back link, title, status, provider, date, Delete
- `RenderProgress` panel (queued/running only)
- 2-col: left = 2×2 asset thumbnails + prompt; right = output video/spinner/error
- Actions: Download MP4, retry with alternate provider

### Orchestrate (`/orchestrate`)
- Wallet card, modality tabs, model select, prompt, cost, generate
- Result card: media player + fallback log
- History table

### Account (`/account`)
- Session card (UUID, reset button)
- Provider keys card (Active / Not configured)
- Hint footer with required env var names

---

## Colour usage rules

1. **Hot pink `oklch(0.65 0.30 330)`** — primary CTAs, badges, "shoot." hero word, eyebrow accent, active model ring pulse
2. **Violet `oklch(0.58 0.26 290)`** — active nav, pipeline steps, model picker active border, progress bar start
3. **White/foreground** — headings, card titles
4. **`oklch(0.45–0.55 0.08 285)`** — muted labels, hints, inactive nav
5. **Emerald** — succeeded status, completed pipeline steps only
6. **Yellow** — queued status only
7. **Red/400** — failed status, error messages

---

## Motion / interaction

- All transitions: Tailwind default `150ms ease`
- Spinner: `animate-spin` on div with `border-top-color` = hot pink
- Pipeline active step: `animate-pulse` on step circle
- Progress bar: `transition-all duration-1000` for smooth second-by-second growth
- Library card hover: `scale-[1.02]` lift
- Model picker cards: border + bg transition on selection
- Dropzone drag: border → violet glow (`oklch(0.58 0.26 290 / 0.8)`)
