# Cotizaciones

Real-time market data dashboard for Argentine bonds (MEP/CCL), equities, ADRs, CEDEARs, and crypto.

## Stack

| Layer | Tech |
|-------|------|
| Monorepo | Turborepo + pnpm workspaces |
| Frontend | React 19 · Vite 6 · TypeScript · Tailwind v4 |
| Backend | Hono · Node 20 · TypeScript |
| Data sources | Invertir Online (bonds, equities) · Binance (crypto) · Yahoo Finance (indices) |
| Server state | TanStack Query — adaptive polling (30s open, 5min closed) |
| Shared types | Zod schemas in `@cotizaciones/types` |

## Project structure

```
.
├── apps/
│   ├── api/          Hono API — IOL client, in-memory cache, market hours
│   └── web/          Vite + React — dashboard, routes, UI components
├── packages/
│   ├── eslint-config/ Shared ESLint flat config
│   ├── tsconfig/      Shared TypeScript configs
│   ├── types/         Domain types and Zod schemas
│   └── ui/            Shared component library
└── legacy/            Original CRA + Express snapshot (reference only)
```

## Local development

Requirements: Node ≥ 20.11, pnpm ≥ 9.

```bash
pnpm install

cp apps/api/.env.example apps/api/.env
# Edit apps/api/.env — set IOL_USERNAME and IOL_PASSWORD

pnpm dev
```

| Service | URL |
|---------|-----|
| Web | http://localhost:5173 |
| API | http://localhost:3001 |

The web dev server proxies `/api/*` to the API, so no CORS configuration is needed locally.

## Scripts

```bash
pnpm dev         # Start web + api (Turborepo parallel)
pnpm build       # Build all packages
pnpm typecheck   # TypeScript check across all workspaces
pnpm lint        # ESLint
```

## Environment variables

### `apps/api/.env`

| Variable | Required | Description |
|----------|----------|-------------|
| `IOL_USERNAME` | Yes* | Invertir Online account email |
| `IOL_PASSWORD` | Yes* | Invertir Online password |
| `CORS_ORIGIN` | Yes (prod) | Frontend origin(s), comma-separated `https://` URLs |
| `CACHE_TTL_SECONDS` | No | Cache TTL in seconds (default: 30) |
| `API_KEY` | No | When set, all data endpoints require `X-API-Key` header (min 16 chars) |

*Without IOL credentials the API starts normally but `/bonos` and `/acciones` return `503`.

### `apps/web/.env`

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_API_BASE_URL` | Yes (prod) | API base URL without trailing slash |

## Deploy

See [DEPLOY.md](./DEPLOY.md) for step-by-step instructions.

**Default setup:** Render (API) + Netlify (web) — both free tier.

## API endpoints

```
GET /health
GET /bonos
GET /bonos/fx
GET /acciones/merval
GET /acciones/sp500
GET /acciones/adrs
GET /acciones/cedears
GET /cripto
GET /indices
```

All data endpoints return `{ ok: true, data: ... }` on success and `{ ok: false, error: { code, message } }` on error.

## Roadmap

- [x] Bonds + MEP/CCL
- [x] Equities (Merval, ADRs, S&P 500, CEDEARs)
- [x] Crypto via Binance
- [x] Indices via Yahoo Finance
- [x] Rate limiting, API key auth, CSP headers
- [x] Holiday-aware market hours
- [ ] Historical price charts
- [ ] Portfolio tracker
- [ ] Price alerts
- [ ] SSE push instead of polling
