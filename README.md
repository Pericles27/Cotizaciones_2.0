# Cotizaciones — v0.2

Monorepo de la app de cotizaciones (bonos argentinos, MEP/CCL, acciones, ADRs y cripto).
Reescritura moderna del proyecto original en Create React App + Express.

## Stack

- **Monorepo**: Turborepo + pnpm workspaces
- **Frontend**: Vite 6 + React 19 + TypeScript estricto + Tailwind v4 + shadcn-style components
- **Backend**: Hono + TypeScript (Node 20)
- **Datos compartidos**: schemas con Zod en `@cotizaciones/types`
- **Datos**: Invertir Online (bonos / acciones / ADRs) + CoinPaprika (cripto)
- **Estado server**: TanStack Query con refetch cada 30s

## Estructura

```
.
├── apps/
│   ├── api/          → Hono + IOL client + cache TTL en memoria
│   └── web/          → Vite + React 19 + Tailwind + shadcn
├── packages/
│   ├── eslint-config/  → flat config compartido (base, react, node)
│   ├── tsconfig/       → tsconfig base / react / vite / node
│   ├── types/          → schemas Zod + tipos TS del dominio
│   └── ui/             → componentes shadcn-style + design tokens (Tailwind v4)
├── legacy/             → snapshot del proyecto original (CRA + Express)
├── turbo.json
└── pnpm-workspace.yaml
```

## Empezar

Necesitás Node ≥ 20.11 y pnpm ≥ 9.

```bash
# instalar dependencias (raíz)
pnpm install

# variables de entorno de la API
cp apps/api/.env.example apps/api/.env
# completar IOL_USERNAME / IOL_PASSWORD

# arrancar todo (web + api en paralelo)
pnpm dev
```

Por defecto:

- web → http://localhost:5173 (proxy `/api` → http://localhost:3001)
- api → http://localhost:3001

## Scripts comunes

```bash
pnpm dev         # turbo run dev (web + api)
pnpm build       # build de todo el grafo
pnpm typecheck   # tsc --noEmit en cada workspace
pnpm lint        # ESLint flat config
pnpm format      # prettier --write
```

## Troubleshooting

**`[vite] http proxy error: /bonos ECONNREFUSED`**
Significa que `apps/web` está corriendo pero `apps/api` no. Causas típicas:

1. *Estás corriendo solo el web* (`pnpm dev` desde `apps/web`). Hacelo desde la raíz:
   ```bash
   cd cotizaciones_2.0   # raíz del monorepo
   pnpm dev              # arranca web + api juntos
   ```
2. *La API crasheó al startup.* El TUI de Turbo muestra los procesos por separado;
   apretá `i` y elegí `@cotizaciones/api` para ver sus logs. Lo más común es que
   falte el archivo `apps/api/.env`. Copialo y completalo:
   ```bash
   cp apps/api/.env.example apps/api/.env  # si todavía no existe
   # editá apps/api/.env y poné IOL_USERNAME / IOL_PASSWORD
   ```
3. *Sin credenciales IOL la API arranca igual,* pero `/bonos` y `/acciones`
   responden 503 hasta que las completes. `/cripto` funciona sin auth.

**Verificar que la API esté viva:**
```bash
curl http://localhost:3001/health     # debería devolver {ok:true,...}
curl http://localhost:3001/bonos      # 200 si IOL está configurado, 503 si no
```

## Deploy a producción

Setup recomendado: **Netlify** (frontend estático) + **Fly.io** (API Node).
Ambos tienen tier gratuito y la región `eze` de Fly está en Buenos Aires.

### 1) API en Fly.io

Necesitás la CLI de Fly: https://fly.io/docs/hands-on/install-flyctl/

```bash
# desde la raíz del monorepo
fly auth login

# crear la app (usa el fly.toml de apps/api)
fly launch --no-deploy --copy-config --config apps/api/fly.toml --name cotizaciones-api

# secretos: credenciales IOL + dominio del front
fly secrets set \
  IOL_USERNAME='tu_email@iol.com' \
  IOL_PASSWORD='tu_password' \
  CORS_ORIGIN='https://cotizaciones.netlify.app' \
  --config apps/api/fly.toml

# deploy
fly deploy --config apps/api/fly.toml --dockerfile Dockerfile

# probar
curl https://cotizaciones-api.fly.dev/health
```

### 2) Frontend en Netlify

Opción A — desde el dashboard:

1. **Add new site → Import from Git** y elegir el repo.
2. Netlify lee `netlify.toml` automáticamente (build command, publish dir, redirects).
3. En **Site settings → Environment variables** agregar:
   ```
   VITE_API_BASE_URL = https://cotizaciones-api.fly.dev
   ```
4. **Deploy site.**

Opción B — CLI:

```bash
npm install -g netlify-cli
netlify login
netlify init                                                            # vincular el repo
netlify env:set VITE_API_BASE_URL https://cotizaciones-api.fly.dev
netlify deploy --prod
```

### 3) Cuando cambies el dominio del frontend

Actualizar el secret `CORS_ORIGIN` de Fly y redeployar la API:

```bash
fly secrets set CORS_ORIGIN='https://nuevo-dominio.com' --config apps/api/fly.toml
```

`CORS_ORIGIN` admite múltiples valores separados por coma si querés permitir más
de un origen (preview deploys, dominio custom, etc.).

### Hostings alternativos

- **Railway** ($5 free credit/mes, deploy desde repo, sin tarjeta) — alternativa
  cómoda a Fly para la API.
- **Vercel** — sirve la SPA, pero la API requeriría adaptar Hono a serverless
  functions; el cache en memoria pierde estado entre invocaciones.
- **Cloudflare Workers** — Hono corre nativo, pero hay que cambiar el adapter
  (`@hono/node-server` → runtime de Workers) y mover el cache a KV.

## Roadmap

- [x] Reorganizar en monorepo Turborepo
- [x] Bonos + MEP/CCL
- [x] Acciones (Merval, ADRs, S&P 500, CEDEARs)
- [x] Cripto vía Binance con editor de watchlist
- [x] Índices vía Yahoo Finance
- [x] Deploy: Netlify + Fly.io
- [ ] Sparklines en cripto y bonos
- [ ] Reemplazar polling por SSE en `apps/api`
- [ ] Tests E2E con Playwright

## Espíritu del original

- Layout: bonos + FX en la fila principal, paneles laterales en grid
- Acento: detalle Argentino (chip celeste-blanco-celeste, links a Invertir Online)
- Refresh continuo (antes era `setInterval` + `window.reload`, ahora TanStack Query)
- Dark mode primero — la app original ya nació oscura

## Legacy

El código original vive intocado en [`/legacy`](./legacy). Sirve como referencia
mientras migramos features una por una.
