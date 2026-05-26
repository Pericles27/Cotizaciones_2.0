# Deploy

**API → Render (free)** · **Web → Netlify (free)**

---

## Prerequisites

- GitHub repository with the project pushed to `main`
- [Render](https://render.com) account (free, no credit card required)
- [Netlify](https://netlify.com) account (free)
- Invertir Online credentials (`IOL_USERNAME`, `IOL_PASSWORD`)

> The `.gitignore` already excludes `apps/api/.env`. Never commit credentials — load them as environment secrets in each platform.

---

## Part 1 — Push to GitHub

```bash
git add .
git commit -m "ready for production"
git push origin main
```

---

## Part 2 — API on Render

### 2.1 Create the service

1. Render dashboard → **New** → **Web Service**
2. Connect the GitHub repository
3. Render detects `render.yaml` automatically — no manual configuration needed

### 2.2 Set environment secrets

In the service settings → **Environment** → add the following as secret variables:

| Variable | Value |
|----------|-------|
| `IOL_USERNAME` | Your IOL account email |
| `IOL_PASSWORD` | Your IOL password |
| `CORS_ORIGIN` | Leave empty for now (fill in after step 3.3) |

`NODE_ENV`, `PORT`, and `CACHE_TTL_SECONDS` are already defined in `render.yaml`.

### 2.3 Deploy and get the public URL

Click **Deploy**. First build takes ~3 minutes.

Render assigns a URL like:
```
https://cotizaciones-api.onrender.com
```

Copy it — you'll need it for the frontend.

### 2.4 Smoke test

```bash
curl https://cotizaciones-api.onrender.com/health
# {"ok":true,"iol":"configured","auth":"open",...}

curl https://cotizaciones-api.onrender.com/acciones/cedears
```

If `/health` returns `ok: true` but `/acciones` returns `503`, check your `IOL_USERNAME` and `IOL_PASSWORD` values in Render → Environment.

> **Note on free tier sleep:** Render's free tier spins down after 15 minutes of inactivity. The first request after sleep takes ~50 seconds. Subsequent requests are fast. To avoid this, use an uptime monitor (e.g. [UptimeRobot](https://uptimerobot.com), free) to ping `/health` every 14 minutes.

---

## Part 3 — Web on Netlify

### 3.1 Create the site

1. Netlify dashboard → **Add new site** → **Import from Git** → GitHub
2. Select the repository
3. Netlify reads `netlify.toml` automatically — build command and publish directory are pre-configured

### 3.2 Set environment variable

**Site settings** → **Environment variables** → **Add a variable**:

| Variable | Value |
|----------|-------|
| `VITE_API_BASE_URL` | The Render URL from step 2.3 (no trailing slash) |

Example: `https://cotizaciones-api.onrender.com`

### 3.3 Deploy and get the Netlify URL

**Deploys** → **Trigger deploy** → **Deploy site**. Takes ~2 minutes.

Netlify assigns a URL like `https://your-site.netlify.app`.

Go back to **Render** → Environment and set:
```
CORS_ORIGIN = https://your-site.netlify.app
```

Render redeploys automatically in ~1 minute.

### 3.4 Custom domain (optional)

Netlify → **Site configuration** → **Change site name** or add a custom domain.
If you change the URL, update `CORS_ORIGIN` in Render accordingly.

---

## Part 4 — Checklist

Open the Netlify URL and verify:

- [ ] Crypto ticker scrolls at the top
- [ ] Indices panel loads (Merval, S&P 500, NASDAQ, WTI, Brent)
- [ ] FX panel loads (MEP, CCL)
- [ ] All four equity panels load (Merval, ADRs, S&P 500, CEDEARs)
- [ ] Routes `/acciones`, `/bonos`, `/cripto` show data
- [ ] DevTools → Network: requests go to `onrender.com`, not `localhost`

---

## Part 5 — API Key protection (optional)

To restrict API access to your frontend only:

```bash
# Generate a secure key
openssl rand -hex 32
```

1. Render → Environment → add secret `API_KEY` with the generated value
2. Netlify → Environment → add `VITE_API_KEY` with the same value
3. Update `apps/web/src/lib/api.ts` to send the header:

```typescript
const KEY = import.meta.env.VITE_API_KEY as string | undefined;

async function get<T>(path: string): Promise<T> {
  const headers: Record<string, string> = {};
  if (KEY) headers['x-api-key'] = KEY;
  const res = await fetch(`${BASE}${path}`, { headers });
  // ...
}
```

---

## Troubleshooting

| Symptom | Likely cause | Fix |
|---------|-------------|-----|
| `503` on `/acciones` or `/bonos` | Missing IOL credentials | Check `IOL_USERNAME` / `IOL_PASSWORD` in Render |
| CORS error in browser console | `CORS_ORIGIN` doesn't match Netlify URL | Update in Render — exact URL, no trailing slash |
| Empty data / `Failed to fetch` | `VITE_API_BASE_URL` misconfigured | Check Netlify env vars and redeploy |
| Netlify build fails | pnpm / corepack issue | Check build logs — `netlify.toml` handles the corepack update |
| First request is very slow | Render free tier spin-down | Set up an uptime monitor to ping `/health` every 14 min |

---

## Automatic redeploy

Every `git push origin main` triggers automatic redeploy on both Render and Netlify.

---

## Paid alternatives (if you need more)

| Provider | Cost | Advantage |
|----------|------|-----------|
| Render Starter | $7/mo | Always-on, no spin-down |
| Railway Hobby | $5/mo | Great DX, live logs |
| Fly.io | ~$2–4/mo | `eze` region (Buenos Aires), lower latency |

To migrate: the `Dockerfile`, `railway.json`, and `fly.toml` are already in the repo.
