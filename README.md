# xakker-org-frontend

Two independently deployed frontends for the Xakker platform. The API lives in a separate repo: [xakker-org-backend](https://github.com/xakker-org/xakker-org-backend).

## Domains

One repo, two Vercel projects, two custom domains — both point at this same GitHub repo, just with a different **Root Directory**:

| Vercel project | Root Directory | Custom domain |
|---|---|---|
| xakker-landing | `landing` | `xakker.org`, `www.xakker.org` |
| xakker-app | *(repo root)* | `self-study.xakker.org` |

Set this up once in the Vercel dashboard: "Add New Project" → import `xakker-org-frontend` → set Root Directory → "Add Domain" on that project. Every push to `main` redeploys both independently. (Not using Vercel? Same idea with plain Docker: run the `landing` and `app` images from `docker-compose.yml` behind a reverse proxy — e.g. Caddy/nginx/Traefik — that routes by the `Host` header to the matching container, and point each domain's DNS at that proxy.)

## `app/` — React (Vite) SPA

Deployed at `self-study.xakker.org`. Talks to the API via `VITE_API_BASE_URL`.
Deploy config (`.env`, `.env.example`, `.env.production`, `Dockerfile`, `nginx.conf`, `vercel.json`)
lives at the **repo root**, not inside `app/` — `app/` holds only the Vite/React source.

```bash
cp .env.example .env              # repo root — copy once, then edit if needed
cd app
npm install
npm run dev          # http://localhost:5173
npm run build        # -> app/dist/ (reads ../.env, ../.env.production)
docker build -t xakker-app .   # run from repo root, not from app/
```

`VITE_API_BASE_URL` (in `.env` / `.env.production` at repo root — copy from `.env.example`, these
are gitignored) points at wherever the backend is deployed. On Vercel, set it as an Environment
Variable in the project's Settings instead of committing a value.

## `landing/` — marketing site

Deployed at `xakker.org`. Plain HTML/CSS/JS, but with **one build step**: it substitutes
`PLATFORM_URL` (the "Başla" / "Daxil ol" button target) into `index.html`, so the same site works
locally, on a temporary Vercel URL, and on the final domain — without editing HTML.

```bash
cd landing
cp .env.example .env   # then edit PLATFORM_URL
npm run build          # -> landing/dist/ (reads .env automatically)
npx serve dist
docker build --build-arg PLATFORM_URL=https://self-study.xakker.org -t xakker-landing ./landing
```

`PLATFORM_URL` resolution order, same everywhere: an explicit value always wins, otherwise it
falls back to `https://self-study.xakker.org` (hardcoded once, in `build.js`).
- **Local**: `landing/.env` (gitignored; copy `.env.example`)
- **Docker / docker-compose**: `--build-arg PLATFORM_URL=...` (see `docker-compose.yml`)
- **Vercel**: Project Settings → Environment Variables → `PLATFORM_URL` (e.g. set it to the
  Vercel-generated URL until the real domain is verified, then switch it to
  `https://self-study.xakker.org` — no code change, just redeploy)

## Both together locally

`docker compose up --build` (root of this repo) runs `app` on :5173 and `landing` on :5174.
