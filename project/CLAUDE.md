# Resumo — Design & Development Reference

## Overview
Resumo is a single-page desktop web app that takes a user's base resume and a job description, then uses Claude AI to generate a tailored, one-page LaTeX resume. The output is a compiled PDF the user can download or open in Overleaf.

It is **bring-your-own-key (BYOK)**: every visitor supplies their own Anthropic API key, stored only in their browser. The server holds no key and no database — all user data lives in the visitor's browser.

---

## Tech Stack (Production)
- **Next.js 15 (App Router)** + React 19 + TypeScript — `npm run dev` / `npm run build` / `npm start`
- **Anthropic SDK** (`@anthropic-ai/sdk`) — called server-side from `src/app/api/generate/route.ts` with a per-request key
- **Fonts** — Montserrat (display/headings), Roboto (body), PT Mono (monospace/code), loaded in `src/app/layout.tsx`
- **Icons** — Inline SVG components in `src/components/icons.tsx`, 13–15px, `stroke="currentColor"`, strokeWidth 1.5
- **Styling** — Inline styles driven by the `T` token object (`src/lib/tokens.ts`); global resets/animations in `src/app/globals.css`
- **State** — React `useState` / `useRef` / `useEffect` only; no external state library
- **Storage** — `localStorage` via `src/lib/storage.ts` (resume, API key, templates, prompts, companies, settings)

### Source layout
```
src/
  app/
    api/generate/route.ts   Claude endpoint (per-request key, never stored)
    layout.tsx page.tsx globals.css
  components/               App, Sidebar, HomeView, ResultView, SetupView,
                            ProcessingView, PromptsView, CompaniesView,
                            TemplatesView, GuideView, SettingsModal,
                            ResumeRightPanel, ResumeDoc, ResizeDivider,
                            atoms.tsx, icons.tsx
  lib/
    storage.ts              localStorage helpers + backup export/import
    tokens.ts types.ts
```

---

## Color System

```
Background:    #F4F3EF   (--bg, warm off-white)
Surface:       #FFFFFF   (cards, panels)
Surface Alt:   #FDFCFB   (sidebar, toolbar backgrounds)
Border:        #E5E4DE   (default dividers)
Border Strong: #C8C7BF   (upload zones, stronger separators)

Text Primary:  #111827
Text 2:        #6B7280   (labels, secondary)
Text 3:        #9CA3AF   (placeholders, meta)

Accent:        #8B5CF6   (violet — active states, highlights)
Accent BG:     #F5F3FF   (active item backgrounds)

Success:       #16A34A
Success BG:    #F0FDF4

Warning:       #D97706
Danger:        #DC2626
```

---

## Typography
- **Display** — Montserrat, weights 300/400/500/600/700
  - App name: 15px / 600
  - Section headings: 15px / 600
  - Panel labels: 10px / 600 / uppercase / 0.1em tracking (PanelLabel atom)
- **Body** — Roboto, weights 300/400/500
  - Default UI: 14px / 400
  - Secondary text: 13px / 400
  - Meta / labels: 11–12px
- **Mono** — PT Mono
  - Code, LaTeX editor, timestamps, zoom %

---

## Layout — 3-Panel Resizable (Dashboard)

```
┌──────────┬──┬─────────────────────┬──┬──────────────────┐
│          │  │                     │  │                  │
│ Sidebar  │▓▓│   Middle Content    │▓▓│  Resume Preview  │
│  (nav)   │  │   (JD form etc.)    │  │   (A4 PDF doc)   │
│          │  │                     │  │                  │
└──────────┴──┴─────────────────────┴──┴──────────────────┘
```

### Sidebar
- Default width: **220px** | Collapsed: **56px** (icon-only mode)
- Drag range: **160px – 400px**
- Collapse toggle button in sidebar header
- When collapsed: `borderRight` is shown; when expanded: drag handle (`ResizeDivider`) takes over

### Middle Content
- `flex: 1`, `minWidth: 450px` (preserves readable form width based on reference layout at 1366px)
- Contains: header bar (52px) + view content

### Resume Preview Panel (Right)
- Default width: **500px**
- Drag range: **220px – 720px** (max derived from reference layout at 1366px viewport)
- Only visible when `nav === 'home'` (dashboard view)
- Has its own PDF viewer toolbar (zoom, fit-width, print, download)

### Drag Handles (`ResizeDivider`)
- 5px wide, transparent background, 1px `borderLeft`
- On hover/drag: border turns accent violet, background gets subtle accent tint
- During drag: `document.body.style.cursor = 'col-resize'` + `userSelect: none`
- Drag state tracked via `useRef` (not React state) to avoid re-render jitter

---

## Navigation
Four main views via the left sidebar:

| Route       | Component        | Notes                                      |
|-------------|------------------|--------------------------------------------|
| `home`      | `HomeView`       | Default — JD input + generate             |
| `prompts`   | `PromptsView`    | Manage tailoring prompts                   |
| `companies` | `CompaniesView`  | Search/browse past applications (auto-logged) |
| `templates` | `TemplatesView`  | Manage LaTeX templates                     |
| `guide`     | `GuideView`      | Help: overview, how-to, features, cautions, FAQ |

Settings opens as a modal overlay (not a nav route). The right-hand Resume Preview panel shows only on `home`; all other routes render full-width.

---

## Key Views

### HomeView
- `ResumeBar` — shows uploaded resume filename, format, char count, replace link
- `TemplateBar` — shows active template, link to change it
- JD textarea — minimum 50 chars to enable generation
- `SettingsPanel` — collapsible; model selector (Haiku/Sonnet/Opus) + prompt mode toggle
- Generate button — disabled until JD has ≥50 chars

### ResultView
- Tab bar: **Preview** | **What Changed (N)**
- Preview tab: Resume doc in a card (max-width 680px, centered)
- Changes tab: diff cards per section (Summary, Experience, Skills) with Before/After columns
- Footer bar: Download PDF | Open in Overleaf | New Application

### TemplatesView
- Built-in templates: Jake's Resume, AltaCV, ModernCV Classic
- Custom templates: user-uploaded `.tex` or pasted LaTeX
- **Edit flow**: every template (built-in and custom) has an Edit button
  - Edit modal is pre-filled with existing name + LaTeX source
  - Built-in templates show a callout: "rename and/or add custom LaTeX to override"
  - "Unsaved changes" status shown in modal footer
  - On save: template list updates; if active template was renamed, active name syncs
- **Add flow**: name + paste LaTeX or upload `.tex` file
- **Delete**: custom templates only (built-ins cannot be deleted)

### PromptsView
- Split pane: prompt list (left) + textarea editor (right)
- Active prompt indicated by violet dot
- Save + Active/Inactive toggle in editor footer

### CompaniesView
- Search input + Add Company button
- Table rows: company name, role, date

---

## Resume Preview Panel (PDF Viewer)

### Toolbar actions
- **Zoom Out** — step −10%, disabled at 40%
- **Zoom %** badge — shows current zoom; click to reset to 100%
- **Zoom In** — step +10%, disabled at 200%
- **Fit Width** — calculates zoom so the A4 doc fills the panel width without horizontal scroll; stays active (re-applies on panel resize)
- **Print** — browser print
- **Download PDF** — triggers PDF download

### A4 document layout
- Doc always rendered at **794px wide** (A4 at 96 dpi) — never changes with panel size
- Zoom applied via CSS `zoom` property (affects layout box, scroll works naturally)
- Default state: **Fit Width active** (auto-zoomed on load, re-fits on panel drag)
- `margin: 0 auto` on the zoom wrapper (NOT `display:flex; justify-content:center` — the latter clips content at small panel widths)

---

## Component Inventory

| Component           | Purpose                                              |
|---------------------|------------------------------------------------------|
| `Sidebar`           | Navigation + collapse toggle; accepts `width` prop  |
| `ResizeDivider`     | Drag handle between panels                          |
| `PanelLabel`        | Uppercase section label atom                        |
| `Divider`           | 1px horizontal rule                                 |
| `ToolBtn`           | Icon button with hover/active/disabled states       |
| `ResumeBar`         | Uploaded resume status strip                        |
| `TemplateBar`       | Active template strip on dashboard                  |
| `SettingsPanel`     | Collapsible model + prompt settings                 |
| `ResumeRightPanel`  | Right-panel PDF viewer with toolbar                 |
| `ResumeDoc`         | The actual resume document (fixed 794px)            |
| `DocSection`        | Section block within ResumeDoc                      |
| `TemplateCard`      | Template list item with Set Active / Edit / Delete  |
| `AddTemplateModal`  | New template creation modal                         |
| `EditTemplateModal` | Pre-filled template edit modal                      |
| `SettingsModal`     | Global settings — API key, model, prompt, backup/restore, reset |
| `SetupView`         | First-run screen — collects API key + resume        |
| `ProcessingView`    | Loading/spinner screen during generation            |
| `GuideView`         | Help page (how-to, features, cautions, FAQ)         |

---

## State (App root)

```js
nav             // 'home' | 'prompts' | 'companies' | 'templates' | 'guide'
screen          // 'dashboard' | 'processing' | 'result'
apiKey          // string | null — null shows SetupView (key section)
resume          // ResumeFile | null — null shows SetupView (resume section)
hydrated        // bool — true once localStorage has been read (gates first render)
jdText          // string — job description input
showSettings    // bool — settings modal visibility
collapsed       // bool — sidebar collapsed
procMsg         // string — processing status message
activeTemplate  // string — active template name
companies       // Company[] — lifted here so generations can append entries
bannerDismissed // bool — dashboard backup-reminder banner
result          // ResumeResult | null — last generated resume
generateError   // string | null — banner shown on failed generation (incl. 401)
sidebarW        // number px — sidebar width (160–400)
rightPanelW     // number px — right panel width (220–720)
activeDrag      // 'sidebar' | 'right' | null — which panel is being dragged
dragRef         // useRef — { type, startX, startW } during drag
timers          // useRef — setTimeout handles for processing animation
abortRef        // useRef — AbortController for the in-flight generate request
```

The full-screen gate is `if (!apiKey || !resume) return <SetupView needKey needResume … />` — SetupView asks only for the missing piece(s).

---

## Data Models

### Template
```js
{ id: number, name: string, type: 'builtin' | 'custom', latex: string }
```

### Company (Application)
```js
{ id: number, name: string, role: string, date: string }
```

### Prompt
```js
{ id: number, name: string, active: boolean, text: string }
```

### ResumeFile
```js
{ name: string, format: string, chars: number, modified: string, text: string }
```

### Stored API key (under `resumo_api_key`)
```js
{ provider: 'anthropic', key: string }   // provider field keeps room for future providers
```

---

## Design Decisions & Rules

1. **No emoji** in UI — brand is minimal/professional
2. **No gradient backgrounds** — flat surfaces only
3. **Accent color** (violet `#8B5CF6`) used only for: active nav items, active states, focus rings, badge highlights
4. **Font weights**: display headings 600, active items 500, default body 400, never use 700+ in UI labels
5. **Border radius**: 3px for inputs/buttons/cards, 4px for modals/larger cards, 6px for modal containers
6. **Transitions**: 0.1s for color/background hover changes, 0.12s for divider effects
7. **Sidebar**: borderRight only visible in collapsed mode (drag handle takes over in expanded mode)
8. **PDF doc dimensions**: always locked at 794px × A4 ratio; zoom is visual only — never change the doc's layout width
9. **Fit Width**: always enabled by default; re-computes on panel resize (no manual re-trigger needed)
10. **Middle section min-width**: 450px (matches reference layout ratio at 1366px — ~455px middle, ~716px right)
11. **Right panel max-width**: 720px (capped at reference layout ratio to preserve middle section space)
12. **Drag implementation**: use `useRef` for drag state (not `useState`) to prevent re-render jitter during mouse move

---

## Screens / Full-Screen States
- **SetupView** — first run, replaces entire viewport, no sidebar; collects the API key and/or resume (whichever is missing)
- **ProcessingView** — full-screen spinner, replaces entire viewport, no sidebar

Both are rendered by `App` before the main 3-panel layout, conditional on `apiKey`, `resume`, and `screen`.

---

## API Integration (BYOK)
- **Endpoint:** `POST /api/generate` (`src/app/api/generate/route.ts`). Body: `{ apiKey, resumeText, jdText, model, customPrompt? }`.
- **Per-request key:** the handler does `new Anthropic({ apiKey })` per call — there is **no** module-level client and **no** `ANTHROPIC_API_KEY` env var. The key never persists server-side.
- **Errors:** missing key → `401 "API key required…"`; bad key (`Anthropic.AuthenticationError`) → `401 "Invalid API key — check it in Settings."`; missing resume/JD → `400`. All surface in the dashboard `generateError` banner.
- **Models:** `claude-haiku-4-5`, `claude-sonnet-4-6`, `claude-opus-4-8` (default). Opus runs with extended thinking enabled; the lighter models skip it for speed.
- **Output:** a valid JSON object matching the `ResumeResult` schema (name, subtitle, contact, summary, experience[], skills[], company, changes[]). The route strips ```` ```json ```` fences before `JSON.parse`.
- **Prompt rules:** no invented roles/skills, max 3 bullets per role, strong action verb + metric, 2–3 sentence summary. Default lives in the route's system prompt; a custom prompt (Prompts view / Settings) is appended.
- On a successful generation, `App` appends a metadata row to the Companies list (no resume document is stored).

---

## Data Persistence & Privacy
- **All client-side.** `src/lib/storage.ts` wraps `localStorage` with typed `load`/`save`/`remove`/`clearAll`. Keys: `resumo_api_key`, `resumo_resume`, `resumo_active_template`, `resumo_templates`, `resumo_prompts`, `resumo_companies`, `resumo_banner_dismissed`.
- **Hydration:** `App` reads all keys once on mount and gates first render on a `hydrated` flag to avoid SSR mismatch. The three list views (`Templates`/`Prompts`/`Companies`) initialise from storage (falling back to built-in/demo data) and persist on every change via `useEffect`.
- **Backup / restore:** `exportAll()` serialises every key to one JSON blob (Settings → Download backup, file `resumo-backup.json`); `importAll(json)` validates `{ app:'resumo', version:1 }` and writes the keys back, then the page reloads (Settings → Restore from backup).
- **Backup banner:** dismissible strip above `ResumeBar` on the dashboard, reminding users data is browser-only; dismissal stored under `resumo_banner_dismissed`.
- **Reset:** Settings → Reset calls `clearAll()` and returns to first-run SetupView.
