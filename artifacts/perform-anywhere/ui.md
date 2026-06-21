# UI Reference — Perform Anywhere

Design system, component structure, and page-level UI spec for the React + Vite frontend.

---

## Design tokens

Defined in `src/index.css` as CSS custom properties (oklch colour space).

| Token | Value | Usage |
|---|---|---|
| `--background` | `oklch(0.16 0.005 60)` | Page background (dark charcoal) |
| `--foreground` | `oklch(0.94 0.025 80)` | Body text (warm cream) |
| `--cream` | `oklch(0.94 0.025 80)` | Alias for foreground |
| `--ember` / `--primary` | `oklch(0.62 0.19 32)` | CTA buttons, accents, active states |
| `--card` | `oklch(0.20 0.008 60)` | Lifted card surfaces |
| `--muted` | `oklch(0.24 0.008 60)` | Quiet backgrounds |
| `--muted-foreground` | `oklch(0.66 0.02 70)` | Subdued labels, hints |
| `--border` | `oklch(0.32 0.01 60 / 0.6)` | Subtle borders |
| `--destructive` | `oklch(0.55 0.22 27)` | Error states |

### Typography

| Variant | Font | Usage |
|---|---|---|
| Display / headings | Fraunces (serif, optical) | `font-display`, h1–h3, large numbers |
| Body / UI | Inter (sans) | All other text |
| Mono / data | System mono | Prompt boxes, IDs, cost labels, generation history |

Letter-spacing: `–0.02em` on display headings. Body anti-aliased via `-webkit-font-smoothing`.

### Film-grain overlay

`.grain` class adds a subtle `::after` SVG noise layer (`opacity: 0.08`, `mix-blend-mode: overlay`) to any element. Used on hero sections and thumbnail placeholders for a cinematic texture. Children need `position: relative; z-index: 1` (handled automatically via `.grain > *`).

---

## Layout

All pages use `AppLayout` (`src/components/AppLayout.tsx`):

- Sticky header, `z-40`, `bg-background/85 backdrop-blur-md`
- Logo: `Clapperboard` icon + "Perform Anywhere" in `font-display`
- Nav: Projects / New / Orchestrate / Settings — icon + label (label hidden on mobile), active state = `bg-accent text-foreground font-medium`
- Max content width: `max-w-6xl` with `px-6` gutters

---

## Components

### `AppLayout` (`src/components/AppLayout.tsx`)
Wraps every authenticated page. Provides sticky nav + content slot.

### `StatusPill` (`src/pages/Projects.tsx`)
Inline status indicator with icon. States:
- `draft` → `Circle` icon, muted text
- `queued` → `Clock`, yellow-400
- `running` → `Loader2` (spinning), blue-400
- `succeeded` → `CheckCircle2`, emerald-400
- `failed` → `XCircle`, destructive

### `Dropzone` (`src/pages/Studio.tsx`)
File upload zone used in the Studio wizard. Props: `kind`, `label`, `hint`, `accept`, `file`, `onChange`, `required`. Shows preview (video or image) when a file is staged; upload icon + text when empty. `X` button to clear.

### `ReviewRow` (`src/pages/Studio.tsx`)
Two-column review row: label (28-char fixed, uppercase) + value. Used in Step 3 of the wizard.

### `ProviderRow` (`src/pages/Account.tsx`)
Provider key status row: label + env-key name + configured/not-set badge.

---

## Pages

### Landing (`/`)
- Sticky header with ember CTA button
- Hero: headline (`font-display`, `clamp(3rem, 7vw, 5.5rem)`), subtext, two CTA buttons; right column: stacked film-card decorative effect (3 rotated/translated cards)
- Background grid: `linear-gradient` SVG pattern at 4% opacity
- "How it works" — 4-column card grid with step numbers and icons
- "Inputs" — 2-col layout, numbered list with file-format hints
- CTA — centered `grain` section
- Footer — `text-xs`, logo + tagline

### Projects (`/projects`)
- `LIBRARY` eyebrow, h1 "Your projects", "+ New project" top-right
- Loading: spinner + text
- Empty: centred `Film` icon, display headline, CTA button
- Grid: `sm:grid-cols-2 lg:grid-cols-3`, `ProjectCard` components
- `ProjectCard`: thumbnail (`grain` gradient + `Film` icon, render indicator overlay), title, status pill, date + provider

### Studio (`/studio`) — 3-step wizard
**Step 1 — Assets**
- Project title input
- 2×2 `Dropzone` grid: performance video (required), identity photo (required), outfit (optional), scene (optional)

**Step 2 — Direction**
- Style chip pills (8 presets, click to append to style prompt)
- 2-col textarea grid: scene notes + visual style
- "Enhance with AI" button → `POST /api/prompt/enhance` → shows final prompt card

**Step 3 — Review**
- `ReviewRow` table of all values
- Submit = uploads files to Supabase Storage, inserts project + asset rows, calls `POST /api/render/start`

Wizard nav: step bar at top (numbers + labels, active = primary bg), Back / Continue / Submit at bottom.

### Project Detail (`/projects/:id`)
- Back link, title, status pill, date, provider, Delete button
- 2-col layout: left = asset thumbnails (2×2 grid) + enhanced prompt; right = video output
- Output states: spinner (queued/running), video player (succeeded), error card (failed)
- Actions: Download MP4 (succeeded), retry with alternate provider (failed or succeeded)
- Status polling via React Query: refetches every 5 s until terminal state

### Orchestrate (`/orchestrate`)
- Page header + wallet card (balance, email input, top-up buttons)
- Modality tab bar (TEXT / IMAGE / VIDEO / AUDIO)
- Model selector, optional duration input (video only)
- Prompt textarea (`font-mono`)
- Cost estimate + Generate button (disabled if insufficient credits)
- Result card: provider/model/cost/duration metadata, text output, image/video/audio player, fallback log (collapsible)
- Generation history table (modality badge, provider, prompt, status, credits)

### Account (`/account`)
- "Anonymous session" card: session UUID display, Reset session button (destructive hover)
- "Provider keys" card: two sections (Active / Not configured) with `ProviderRow` items
- Footer hint listing the minimum required keys

---

## Colour usage rules

1. **Primary (ember)** — CTAs, active nav items, eyebrow labels, accent icons, link hovers
2. **Muted foreground** — hints, secondary labels, placeholder text, inactive nav
3. **Border** — card edges, section dividers — always at ≤ 50% opacity for subtlety
4. **Destructive** — error states, failed status, reset-session hover, insufficient-balance warning
5. **Emerald-400** — succeeded status only (out of theme intentionally — clear signal)
6. **Yellow-400** — queued status
7. **Blue-400** — running / rendering status

---

## Motion / interaction

- All `transition` classes use Tailwind's default `150ms ease`
- Spinner: `animate-spin` on `Loader2` icon
- Hero film cards: CSS `transform` (rotate + translate), static — no JS animation
- Animated pulse: primary accent dot in nav badge / status chip
- Hover lifts: card border colour → `border-primary/50`, shadow on project cards
