# xakker-org-frontend

Two independently deployed frontends for the Xakker platform. The API lives in a separate repo: [xakker-org-backend](https://github.com/xakker-org/xakker-org-backend).

## `app/` — React (Vite) SPA

Deployed at `self-study.xakker.org`. Talks to the API via `VITE_API_BASE_URL`.
Deploy config (`.env`, `.env.example`, `.env.production`, `Dockerfile`, `nginx.conf`, `vercel.json`)
lives at the **repo root**, not inside `app/` — `app/` holds only the Vite/React source.

```bash
cd app
npm install
npm run dev          # http://localhost:5173
npm run build        # -> app/dist/ (reads ../.env, ../.env.production)
docker build -t xakker-app .   # run from repo root, not from app/
```

Vite env files (`.env`, `.env.production`, at repo root) set `VITE_API_BASE_URL` — point it at
wherever the backend is deployed; `app/vite.config.js` has `envDir` pointing up to the repo root.
`vercel.json` (repo root) is set up for zero-config Vercel deploys — Root Directory stays the
default (repo root); its `buildCommand`/`installCommand` `cd` into `app/` internally.

## `landing/` — marketing site

Deployed at `xakker.org`. Plain static HTML/CSS/JS, no build step.

```bash
npx serve landing
docker build -t xakker-landing ./landing
```

Update the `https://self-study.xakker.org` links in `landing/index.html` if the app's domain changes.
No `vercel.json` needed here — it's a static folder, so set the Vercel project's Root Directory to
`landing` with no build command.

## Both together locally

`docker compose up --build` (root of this repo) runs `app` on :5173 and `landing` on :5174.
