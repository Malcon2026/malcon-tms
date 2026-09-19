# TaskFlow — task management for your office

A Next.js task manager with an Apple-inspired interface, built for [Hostinger Node.js / Next.js hosting](https://www.hostinger.com/web-apps-hosting/nextjs-hosting) and GitHub deploys.

## Features
- **Kanban board** — To Do → In Progress → In Review → Done, with drag & drop on desktop and tap-to-move arrows on mobile
- **Priority levels** — Urgent, High, Medium, Low, with color-coded badges and a priority filter on the board
- **Dashboard** — completion ring, status & priority breakdowns, overdue watchlist, live activity feed
- **Admin** — every member is an admin; create user accounts (optional password or auto-generated), view workload, remove members
- **Shared workspace** — everyone sees all tasks; only the creator can delete a task
- **Sign in** — bootstrap the workspace with the first admin, then add colleagues from Admin
- **Fully mobile-responsive** — frosted glass nav, bottom tab bar, snap-scrolling board, safe-area aware
- All data is stored in the browser (localStorage) — no backend required

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

Requires a **Business** (or Cloud) plan with **Node.js web apps**.

### 1. Push this repo to GitHub
```bash
git init -b main
git add -A
git commit -m "TaskFlow Next.js app"
git remote add origin https://github.com/YOUR_USER/taskflow.git
git push -u origin main
```

### 2. Create the Node.js app in hPanel
1. **Websites** → **Add Website** → **Node.js Apps**
2. **Import Git Repository** → connect GitHub and select this repo
3. Confirm build settings (Hostinger usually auto-detects Next.js):

| Setting | Value |
|--------|--------|
| Node.js version | **20** |
| Install command | `npm ci` or `npm install` |
| Build command | `npm run build` |
| Start command | `npm run start -- -p $PORT` |
| Output directory | `.next` |
| Root directory | `/` (repo root) |

4. Click **Deploy**. Pushes to the connected branch rebuild and restart the app automatically.

### 3. Custom domain
In hPanel, attach your domain to the Node.js website. No Vercel or separate static host is needed.

### Notes
- This app has **no server secrets**; you do not need environment variables for basic use.
- Data is per-browser (localStorage). Each visitor/device has its own workspace unless you later add a shared backend.
- Reference: [Hostinger — GitHub Node.js deploy](https://docs.hostinger.com/node.js/github), [Next.js on Hostinger starter](https://github.com/hostinger/deploy-nextjs).
