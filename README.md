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

Repo: **https://github.com/Malcon2026/taskflow-app**

Requires a **Business** (or Cloud) plan with **Node.js web apps**.

### 1. Connect GitHub in hPanel
1. **Websites** → **Add Website** → **Node.js Apps**
2. **Import Git Repository** → select `Malcon2026/taskflow-app`, branch `main`

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

### 4. Custom domain
Attach your domain to the Node.js site in hPanel.

References: [Hostinger GitHub Node.js](https://docs.hostinger.com/node.js/github), [Supabase Dashboard](https://supabase.com/dashboard/project/urupxpfydfrvjlkpqlvi).
