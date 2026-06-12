# Resumo — Spec v1.0
*Resume Modifier · Local Desktop App*
*Workflow + Technical Reference — No Design*

---

## 1. What Is Resumo?

A local Node.js web app that runs on your machine. You paste a job description, and Resumo uses Claude AI to produce a tailored version of your resume as a downloadable PDF — rewriting and reprioritising content without fabricating anything.

Runs at `http://localhost:3000`. Open it in any browser. No cloud, no login, no re-entering your API key.

---

## 2. Architecture

### Type
Local Node.js server (Express) + vanilla HTML/CSS/JS frontend.

### Why local instead of hosted
- API key lives in a `.env` file on your machine — never typed again
- Claude API is called from the backend, not the browser (no `dangerous-direct-browser-access` header needed)
- Full filesystem access via Node.js — reliable file saving without File System Access API browser quirks
- Easy to share on GitHub: `git clone → npm install → npm start`

### How it starts
```
npm start
```
Express server starts on port 3000. A browser tab opens automatically at `http://localhost:3000`. App is served as a single-page app from the `public/` folder.

---

## 3. Folder Structure

```
resumo/
├── server.js              # Express server + all API routes
├── .env                   # API key + config (gitignored)
├── .env.example           # Template for others to copy
├── package.json
├── public/
│   ├── index.html         # Single-page app shell
│   ├── app.js             # All frontend logic
│   └── style.css          # All styles (user customises this)
├── data/
│   ├── resume.txt         # Stored resume plain text
│   ├── resume_source.*    # Original uploaded file (PDF/DOCX)
│   └── config.json        # User preferences
└── applications/
    ├── Acme Corp/
    │   ├── job_description.txt
    │   └── tailored_resume_2026-06-10.pdf
    └── Google/
        └── ...
```

---

## 4. One-Time Setup

1. Clone the repo
2. `npm install`
3. Copy `.env.example` → `.env`, add Anthropic API key
4. `npm start`
5. First run: app detects no resume stored → opens Resume Setup screen
6. Upload resume once — stored in `data/` forever

`.env.example`:
```
ANTHROPIC_API_KEY=sk-ant-...
PORT=3000
APPLICATIONS_DIR=./applications
```

No API key screen in the app UI. Key comes from `.env` only.

---

## 5. Screen Flow

```
[First run] → [Resume Setup] → [Dashboard]
                                    |
                              [Processing]
                                    |
                               [Result]
                                    |
                         [New Application] → [Dashboard]
```

Settings accessible via nav at any time after setup.

---

## 6. Screen Specs

---

### 6.1 Resume Setup
**Shown:** First run only (no `data/resume.txt` exists). Also accessible via Settings → Replace Resume.

**Inputs:**
- File upload: `.pdf` or `.docx` drag-and-drop or picker
- Paste fallback: textarea (min 80 chars), labelled as fallback for scanned PDFs

**On submit:**
- Server extracts plain text (PDF.js for PDFs, Mammoth for DOCX)
- Saves plain text to `data/resume.txt`
- Saves original file to `data/resume_source.[ext]`
- Saves detected format to `data/config.json` as `resume_format`
- Redirects to Dashboard

**Error handling:**
- Extraction fails or < 80 chars extracted → show error, prompt paste fallback

---

### 6.2 Dashboard
Main working screen, shown every subsequent run.

**Resume status bar (top):**
- Filename, format, character count, last-modified date
- "Replace" link → confirm dialog → Resume Setup

**Job Description input:**
- Single textarea: paste the full JD here
- Min 50 chars to enable Generate
- Placeholder: "Paste the full job description here…"

**Settings panel (collapsible, below JD):**
- Model selector (see 6.5)
- Prompt config (see 6.6)

**Generate button:**
- "Generate Tailored Resume"
- Disabled until JD has ≥ 50 chars
- On click → POST `/api/generate` → navigates to Processing screen

---

### 6.3 Processing Screen
Shown immediately after Generate is clicked. Streams status updates via SSE or polling.

**Status messages (time-based):**
- 0–2s: "Analysing job description…"
- 2s–8s: "Claude is tailoring your resume…"
- 8s+: "Finalising and reviewing changes…"

**On success:** Auto-navigates to Result screen with response data.

**On error:** Returns to Dashboard with a human-readable message:
- 401 → "Invalid API key — check your .env file"
- 429 → "Rate limited — wait 30 seconds and try again"
- JSON parse failure → "Claude returned an unexpected format — try again or check your custom prompt"
- Network error → "Request failed — check your connection"

---

### 6.4 Result Screen
Two tabs:

#### Tab 1 — Preview
Rendered preview of the tailored resume output:
- Name (large)
- Contact info
- Professional Summary (full text)
- Experience — first 2 roles, up to 3 bullets each. Note: "N more roles in the PDF"
- Skills — first 4 categories
- Footer: "This is a preview. The PDF contains the full resume."

#### Tab 2 — What Changed (N)
`N` = number of items in Claude's `changes` array.

Each change card shows:
- Section badge (colour-coded: Summary / Experience / Skills / Education)
- Context (company name for Experience, category for Skills)
- Before text (original)
- After text (new)
- Action label (Reordered / Keyword added / Rephrased / Promoted)

#### Action buttons (below both tabs):
- **Download PDF** — generates PDF, saves copy to `applications/[company]/`
- **New Application** — clears result, back to Dashboard

---

### 6.5 Model Selection
Dropdown in Settings panel and Settings overlay.

| Model ID | Display name | Est. cost/use |
|---|---|---|
| `claude-haiku-4-5-20251001` | Haiku 4.5 | ~$0.01 |
| `claude-sonnet-4-6` | Sonnet 4.6 *(default)* | ~$0.05 |
| `claude-opus-4-6` | Opus 4.6 | ~$0.25 |

Stored in `data/config.json` as `model`.

---

### 6.6 Prompt Configuration
Collapsible panel in Dashboard settings. Also in Settings overlay.

**Default prompt** instructs Claude to:
- Never fabricate experience, companies, titles, dates, degrees, or skills not in the original resume
- Reorder and reprioritise existing content to highlight JD relevance
- Weave in JD keywords where truthfully applicable
- Strengthen bullet points without inventing new facts
- Write a fresh 2–3 sentence professional summary for this specific role
- Preserve career history exactly (same companies, titles, dates)
- Be ATS-aware: use full keyword phrases in Skills
- Output a structured JSON object (see 7.1)

**Custom prompt:**
- Toggle: "Use default" / "Use custom"
- When custom: textarea pre-filled with default text
- Upload `.txt` button → loads file into textarea
- Reset to default button
- Stored in `data/config.json` as `custom_prompt` (null = use default)

**Safety check:** When saving custom prompt, server checks for the required JSON structure block. If missing, returns a warning (not a hard block).

---

### 6.7 Settings Overlay
Accessible via gear icon in nav. Contains:

| Section | Content |
|---|---|
| Resume | Filename shown, Replace button |
| Model | Same dropdown as Dashboard |
| Prompt | Same panel as Dashboard |
| PDF Template | Classic / Modern (future: Sidebar) |
| Applications folder | Shows current path, Change button |
| Reset app | Clears `data/` folder. Confirmation required. Does not delete `applications/`. |

---

## 7. Backend API Routes

All routes on the Express server (`server.js`).

### `GET /`
Serves `public/index.html`.

### `GET /api/status`
Returns current app state:
```json
{
  "hasResume": true,
  "resumeName": "Kanishk Singh_PD.docx",
  "resumeFormat": "docx",
  "resumeChars": 4200,
  "model": "claude-sonnet-4-6",
  "template": "modern"
}
```

### `POST /api/resume`
Accepts multipart form data with a file (`resume` field) or plain text (`text` field).
- Runs extraction
- Saves to `data/resume.txt` and `data/resume_source.*`
- Returns `{ ok: true, chars: N }`

### `POST /api/generate`
Body: `{ jobDescription: "..." }`
- Reads resume from `data/resume.txt`
- Reads model + prompt from `data/config.json`
- Calls Claude API
- Parses JSON response
- Returns full structured result (see 7.1)

### `POST /api/save-pdf`
Body: `{ pdfBase64: "...", companyName: "Acme Corp", jobDescription: "..." }`
- Decodes base64 PDF
- Sanitises company name for folder use
- Creates `applications/[company]/` if needed
- Writes `tailored_resume_YYYY-MM-DD.pdf` and `job_description.txt`
- Returns `{ ok: true, path: "..." }`

### `GET /api/config`
Returns full `data/config.json`.

### `POST /api/config`
Body: any subset of config keys. Merges into `data/config.json`.

---

## 7.1 Claude Output Format

Claude returns a single JSON object:

```json
{
  "name": "Kanishk Singh",
  "subtitle": "Product Designer  ·  Bengaluru, India",
  "contact": {
    "phone": "+91 XXXXX XXXXX",
    "email": "kanishk@example.com",
    "linkedin": "linkedin.com/in/kanishk",
    "portfolio": "kanishk.design"
  },
  "summary": "...",
  "experience": [
    {
      "company": "Acme Corp",
      "role": "Senior Product Designer",
      "dates": "Jan 2023 – Present",
      "tagline": "One-line company description",
      "bullets": ["...", "..."]
    }
  ],
  "earlier_internships": [
    {
      "company": "Beta Studio",
      "role": "Design Intern",
      "dates": "May 2021 – Jul 2021"
    }
  ],
  "education": [
    {
      "institution": "NIFT",
      "degree": "B.Des in Fashion Communication",
      "dates": "2019 – 2023"
    }
  ],
  "skills": [
    { "category": "Design Tools", "values": "Figma, Framer, Principle" }
  ],
  "languages": "English (Fluent), Hindi (Native)",
  "interests": "Photography, Electronic music production",
  "company_name": "Acme Corp",
  "changes": [
    {
      "section": "Summary",
      "action": "Rewrote",
      "before": "Original summary text",
      "after": "New summary text"
    },
    {
      "section": "Experience",
      "company": "Acme Corp",
      "action": "Rephrased",
      "before": "Old bullet",
      "after": "New bullet"
    }
  ]
}
```

`company_name` is used to name the applications subfolder. `changes` powers the What Changed tab.

---

## 8. PDF Generation

Generated in the browser using **jsPDF** (loaded on demand). The PDF matches the source resume's exact styling:

### Page
- Format: US Letter (612 × 792 pt)
- Margins: top/bottom = 28.35 pt, left/right = 42.52 pt
- Content width: 526.96 pt

### Typography
- Font: Helvetica throughout (jsPDF built-in; Calibri not available)
- All text is left-aligned
- Name: 20pt bold, near-black `#111111`
- No accent colours — pure black + grey only

### Section headers
Every section header (EXPERIENCE, EDUCATION, etc.) has a bottom rule:
- Header text: 9pt bold, grey `#555555`
- Rule drawn 2pt below text baseline, full content width
- Rule colour: `#BBBBBB`, line weight 0.75pt

### Right-aligned dates
Company + role on left, date right-aligned to content edge on the same baseline.

### After PDF is generated in the browser:
- Converted to base64
- POST `/api/save-pdf` saves it to the applications folder
- Browser also triggers a download directly

---

## 9. File Storage

```
applications/
  [Company Name]/
    job_description.txt          ← raw pasted JD
    tailored_resume_YYYY-MM-DD.pdf
```

- Company name comes from `company_name` field in Claude's response
- Sanitised (removes `/\:*?"<>|` characters)
- If company name is empty, uses "Unknown Company"
- Multiple applications to same company: PDF is date-stamped, JD is overwritten

---

## 10. Technical Dependencies

| Package | Purpose | Version |
|---|---|---|
| `express` | HTTP server | ^4.19 |
| `dotenv` | Load `.env` into `process.env` | ^16 |
| `@anthropic-ai/sdk` | Claude API calls (backend) | ^0.37 |
| `multer` | Multipart file upload handling | ^1.4 |
| `mammoth` | DOCX → plain text extraction | ^1.7 |
| `pdfjs-dist` | PDF → plain text extraction | ^3.11 |
| `open` | Opens browser tab on `npm start` | ^10 |

**Frontend libraries (CDN, loaded on demand):**

| Library | Purpose |
|---|---|
| `jsPDF 2.5.1` | Generate output PDF in browser |

No frontend framework. Vanilla JS only — easier to read, fork, and modify.

---

## 11. Data Storage

| Data | Where | Notes |
|---|---|---|
| API key | `.env` | Gitignored, never in code |
| Resume text | `data/resume.txt` | Plain text extracted from source |
| Source file | `data/resume_source.*` | Original PDF/DOCX |
| Preferences | `data/config.json` | Model, template, custom prompt |
| Generated PDFs | `applications/[company]/` | Date-stamped, never overwritten |
| JDs | `applications/[company]/job_description.txt` | Overwritten per company |

`data/` is gitignored. `applications/` is gitignored. Only code ships in the repo.

---

## 12. What Ships in the GitHub Repo

```
resumo/
├── server.js
├── package.json
├── package-lock.json
├── .env.example          ← API key template
├── .gitignore            ← ignores data/, applications/, .env, node_modules/
├── public/
│   ├── index.html
│   ├── app.js
│   └── style.css
└── README.md             ← setup instructions
```

Others clone the repo, add their own API key to `.env`, run `npm install && npm start`, and it works.

---

## 13. Out of Scope

- Authentication / multi-user
- Cloud sync
- Cover letter generation
- URL auto-fetch of JDs
- Multiple stored resumes
- ATS score / keyword gap
- DOCX output (PDF only)
- Exact pixel-perfect PDF replication

---

*Resumo Spec v1.0 — June 2026*
