# xakker-org-frontend

Two independently deployed frontends for the Xakker platform. The API lives in a separate repo: [xakker-org-backend](https://github.com/xakker-org/xakker-org-backend).

## `app/` — React (Vite) SPA

Deployed at `self-study.xakker.org`. Talks to the API via `VITE_API_BASE_URL`.

```bash
cd app
npm install
npm run dev          # http://localhost:5173
npm run build        # -> dist/
docker build -t xakker-app .
```

Vite env files (`.env`, `.env.production`) set `VITE_API_BASE_URL` — point it at wherever the
backend is deployed. `vercel.json` is set up for zero-config Vercel deploys (set the Vercel
project's Root Directory to `app`).

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
