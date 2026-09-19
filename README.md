# Malcon TMS — task management for your office

Malcon TMS is a Next.js task manager with an Apple-inspired interface. **Supabase** stores users, tasks, and activity; **Hostinger** hosts the Next.js app from GitHub.

## Features
- **Kanban board** — To Do → In Progress → In Review → Done, with drag & drop on desktop and tap-to-move arrows on mobile
- **Priority levels** — Urgent, High, Medium, Low, with color-coded badges and a priority filter on the board
- **Dashboard** — completion ring, status & priority breakdowns, overdue watchlist, live activity feed
- **Admin** — every member is an admin; create user accounts (optional password or auto-generated), view workload, remove members
- **Shared workspace** — everyone sees all tasks; only the creator can delete a task
- **Sign in** — bootstrap the workspace with the first admin, then add colleagues from Admin
- **Realtime sync** — changes sync via Supabase Postgres + Realtime
- **Fully mobile-responsive** — frosted glass nav, bottom tab bar, snap-scrolling board, safe-area aware

## Supabase (backend)

**Linked project:** [malcon-backend](https://supabase.com/dashboard/project/urupxpfydfrvjlkpqlvi) (`urupxpfydfrvjlkpqlvi`)

> A dedicated `malcon-tms` project could not be created on the free tier (2 active project limit). TMS uses its own tables (`malcon_tms_*`) and Edge Functions on this project.

### Schema & functions (already deployed via CLI)
- Migration: `supabase/migrations/20260319120000_malcon_tms.sql`
- Edge Functions: `create-tms-user`, `remove-tms-user`

To redeploy from this repo:
```bash
npx supabase link --project-ref urupxpfydfrvjlkpqlvi
npm run supabase:push
npm run supabase:deploy
```

### First workspace signup
Uses the `bootstrap-tms-user` Edge Function (admin API, email pre-confirmed). No manual Auth dashboard changes required for bootstrap or admin-created users.

### Local environment
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```
Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` from [Project Settings → API](https://supabase.com/dashboard/project/urupxpfydfrvjlkpqlvi/settings/api).

## Run locally
```bash
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000).

Production build:
```bash
npm run build
npm run start
```

## Deploy on Hostinger (GitHub)

Repo: **https://github.com/Malcon2026/malcon-tms**

Requires a **Business** (or Cloud) plan with **Node.js web apps**.

### 1. Connect GitHub in hPanel
1. **Websites** → **Add Website** → **Node.js Apps**
2. **Import Git Repository** → select `Malcon2026/malcon-tms`, branch `main`

### 2. Build settings

| Setting | Value |
|--------|--------|
| Node.js version | **20** |
| Install command | `npm ci` or `npm install` |
| Build command | `npm run build` |
| Start command | `npm run start -- -p $PORT` |
| Output directory | `.next` |

### 3. Environment variables (optional)
Production builds embed the public Supabase URL and anon key in `next.config.mjs`, so Hostinger deploy works without extra env vars. Override them in hPanel if you switch Supabase projects.

### 4. Subdomain `app.malcontms.com`

Use this when **malcontms.com** is already on Hostinger and the Node.js app is deployed (temp URL works first).

1. **Websites** → find your **Malcon TMS / Node.js** site (not the main WordPress/HTML site unless that *is* the Node app).
2. Click **Connect domain** (or open the site → **Connect domain**).
3. Enter **`app.malcontms.com`** and confirm.
4. If hPanel asks for DNS and the domain is on the **same Hostinger account**, it usually adds records for you. Otherwise add what hPanel shows (often an **A record** for `app` → your hosting IP, or a **CNAME** if instructed).
5. Wait for DNS (minutes to a few hours). Hostinger installs **SSL** automatically.

**Notes**
- The Node.js app must be its **own website** in hPanel; you connect the subdomain to *that* site, not to a folder under `public_html` on another site.
- Keep **`malcontms.com`** (apex) on your main site; only **`app`** points to Malcon TMS.
- After the domain is live, open **Supabase** → **Authentication** → **URL configuration** and confirm **Site URL** is `https://app.malcontms.com` and redirect URLs include `https://app.malcontms.com/**` (this repo’s `supabase/config.toml` is set for that; run `npm run supabase:push` or update in the dashboard if needed).

Guide: [Connect a custom domain to a Node.js application](https://www.hostinger.com/support/how-to-connect-a-custom-domain-to-a-node-js-application/)

References: [Hostinger GitHub Node.js](https://docs.hostinger.com/node.js/github), [Supabase Dashboard](https://supabase.com/dashboard/project/urupxpfydfrvjlkpqlvi).
