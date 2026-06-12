# Resumo

Tailor your resume to any job description with Claude AI. Paste a JD, get a one-page tailored resume with a diff of what changed.

Built with Next.js 15 (App Router) + the Anthropic SDK. **Bring your own key**: every user supplies their own Anthropic API key — the app's server never stores any key, and nobody's usage bills anyone else.

---

## Deploy it once, use it forever (recommended)

Deploy to **Vercel** (free) and Resumo lives at a permanent URL — no commands, just open it in your browser like any website.

### Step 1 — Put the code on GitHub
1. Go to [github.com/new](https://github.com/new) and create a repository (e.g. `resumo`). Keep it **private** if you prefer.
2. Upload this project there. Either:
   - **Web upload**: on the new repo page, click "uploading an existing file" and drag the project folder contents in, or
   - **Command line** (one time only):
     ```bash
     cd resumo
     git init && git add -A && git commit -m "Resumo"
     git remote add origin https://github.com/YOUR_USERNAME/resumo.git
     git push -u origin main
     ```

### Step 2 — Deploy on Vercel
1. Go to [vercel.com/new](https://vercel.com/new) and sign in with GitHub.
2. Pick your `resumo` repository → click **Import** → **Deploy**.

No environment variables needed — there is no server-side API key. Two minutes later you get a URL like `resumo-yourname.vercel.app`. Bookmark it; pushing changes to GitHub auto-redeploys.

You can share the URL freely: every visitor brings their own Anthropic API key, so nobody can spend your money.

---

## How users get started

On first visit, the app asks for two things (one-time setup):

1. **An Anthropic API key** — created free at [console.anthropic.com](https://console.anthropic.com/settings/keys) (pay-as-you-go billing on their own account). The key is stored **only in the visitor's browser** (localStorage), sent over HTTPS with each generate request, used for that single Claude call, and never stored on the server.
2. **Their base resume** — uploaded once, stored in the browser.

## Where data lives

**Everything stays on the user's computer**, in the browser's localStorage: API key, resume, templates, prompts, and the companies list. Data survives refreshes, closing the browser, and reboots. There are no accounts and no database.

Two caveats, surfaced in-app via a dismissible banner:

- Data is per-browser, per-device. A different browser or device starts fresh.
- Clearing the browser's site data erases it. **Settings → Download backup** saves everything as one JSON file; **Restore from backup** brings it back (or moves it to another device).

---

## Run locally instead (no deploy)

```bash
npm install
npm run dev          # development, http://localhost:3000
```

No `.env` file needed — you'll enter your API key in the app itself on first launch.

To avoid typing commands every time locally:

```bash
npm run build        # one time
npm start            # serves the production build on :3000
```

Or keep it permanently running in the background with [pm2](https://pm2.keymetrics.io/):

```bash
npm install -g pm2
pm2 start npm --name resumo -- start
pm2 save && pm2 startup   # auto-starts on boot
```

---

## How it works

- **Dashboard** — paste a job description, pick a model (Haiku / Sonnet / Opus), hit Generate.
- **Generate** — `/api/generate` forwards your resume + JD to Claude (`claude-opus-4-8` by default) using *your* key and returns a structured one-page resume plus a list of what changed.
- **Result** — preview the tailored resume, review Before/After diffs, download.
- **Templates** — manage LaTeX templates (built-in + custom) for PDF output.
- **Prompts** — customize the tailoring instructions.
- **Companies** — tracks where you've applied; each successful generation logs an entry automatically.

## Project structure

```
src/
  app/
    api/generate/route.ts   Claude API endpoint (per-request key, never stored)
    layout.tsx, page.tsx, globals.css
  components/               All UI (App, Sidebar, HomeView, ResultView, …)
  lib/
    storage.ts              localStorage persistence + backup export/import
    tokens.ts, types.ts     Design tokens + TypeScript types
```
