# Deploy — Cotizaciones 2.0

Guía paso a paso para publicar **API en Railway** + **Web en Netlify**.
Tiempo estimado: **20–30 minutos** la primera vez.

---

## Pre-requisitos (una sola vez)

1. Cuenta en [Railway](https://railway.com) (Hobby plan: $5/mes, alcanza de sobra).
2. Cuenta en [Netlify](https://netlify.com) (Free tier).
3. Tu repo en GitHub (Railway y Netlify lo van a leer desde ahí).
4. Credenciales activas de IOL (`IOL_USERNAME`, `IOL_PASSWORD`).

> **Alternativa Fly.io**: ya dejé el `fly.toml` en la raíz por si preferís
> ese provider. Los pasos son análogos — al final hay una nota.

---

## Parte 1 — Subir todo a GitHub

```bash
cd ~/Proyectos/cotizaciones_2.0
git status                # revisá que no haya cambios sueltos
git add .
git commit -m "Listo para producción"
git push origin main
```

Si todavía no creaste el repo en GitHub:

```bash
gh repo create cotizaciones-2 --private --source=. --remote=origin --push
```

---

## Parte 2 — Deploy de la API en Railway

### 2.1 Crear el proyecto

1. Entrá a https://railway.com/dashboard → **New Project** → **Deploy from GitHub repo**.
2. Elegí `cotizaciones-2` (autorizá Railway a leer el repo si te lo pide).
3. Railway detecta el `Dockerfile` y el `railway.json` automáticamente.
   El primer build tarda ~2–3 minutos.

### 2.2 Cargar las variables de entorno

En el servicio recién creado → **Variables** → **+ New Variable**:

| Variable           | Valor                                           |
| ------------------ | ----------------------------------------------- |
| `IOL_USERNAME`     | tu mail de IOL                                   |
| `IOL_PASSWORD`     | tu contraseña de IOL                             |
| `CACHE_TTL_SECONDS`| `30`                                             |
| `CORS_ORIGIN`      | _(la dejamos vacía por ahora, la completamos en 3.3)_ |

> `PORT` y `NODE_ENV` ya los inyecta Railway / el Dockerfile.

### 2.3 Obtener la URL pública

Railway → **Settings** → **Networking** → **Generate Domain**.
Te da algo tipo `https://cotizaciones-api-production.up.railway.app`.

**Copiá esa URL** — la vamos a usar en el frontend.

### 2.4 Smoke-test

Probá en el navegador o con curl:

```bash
curl https://<TU-URL>.up.railway.app/health
# {"ok":true,"ts":"2026-05-02T..."}

curl https://<TU-URL>.up.railway.app/acciones/cedears
# Lista grande con CEDEARs (puede tardar unos segundos la primera vez).
```

Si `/health` devuelve `ok:true` pero `/acciones/cedears` devuelve 503,
las credenciales IOL están mal cargadas. Revisá el log en Railway.

---

## Parte 3 — Deploy del frontend en Netlify

### 3.1 Crear el sitio

1. https://app.netlify.com → **Add new site** → **Import from Git** → GitHub.
2. Elegí `cotizaciones-2`.
3. Netlify detecta el `netlify.toml` y precarga build command + publish dir.
   **No toques nada** — todo está bien configurado.

### 3.2 Variable de entorno

Antes de hacer el primer deploy: **Site settings** → **Environment variables** → **Add a variable**:

| Variable             | Valor                                               |
| -------------------- | --------------------------------------------------- |
| `VITE_API_BASE_URL`  | la URL de Railway del paso 2.3 (sin barra final)    |

Ejemplo: `https://cotizaciones-api-production.up.railway.app`

### 3.3 Disparar deploy y obtener URL

**Deploys** → **Trigger deploy** → **Deploy site**. ~2 minutos.

Cuando termine, Netlify te asigna una URL tipo
`https://glittering-pavlova-12345.netlify.app`.

**Copiala** y volvé a Railway → Variables:

```
CORS_ORIGIN=https://glittering-pavlova-12345.netlify.app
```

Railway redespliega solo en ~30s.

### 3.4 (Opcional) Renombrar el sitio

Netlify → **Site configuration** → **Change site name**.
Por ejemplo `cotizaciones-pericles`. La URL queda
`https://cotizaciones-pericles.netlify.app`.

> Si cambiaste el nombre, actualizá `CORS_ORIGIN` en Railway con la URL nueva.

---

## Parte 4 — Verificación final

Abrí la URL de Netlify y revisá que:

- [ ] Cargan los índices (incluyendo WTI y Brent 🛢️).
- [ ] Cargan FX (dólar oficial, MEP, CCL, blue).
- [ ] Cargan los 4 paneles del dashboard (Merval, ADRs, S&P 500, CEDEARs).
- [ ] El ticker de cripto desfila arriba.
- [ ] Las páginas `/acciones`, `/bonos`, `/cripto` cargan datos.

Abrí DevTools → **Network**: las llamadas tienen que ir a tu URL de Railway,
no a `localhost:3001`.

Si alguna falla con CORS, revisá `CORS_ORIGIN` en Railway (debe coincidir
exactamente con la URL de Netlify, sin barra final).

---

## Parte 5 — Post-deploy útil

### Logs en vivo

```bash
# API (Railway)
railway logs --service cotizaciones-api --tail
# o desde el dashboard: Deployments → <último> → View Logs

# Web (Netlify)
# Dashboard → Deploys → <último> → Deploy log
```

### Re-deploy automático

Cualquier `git push` a `main` dispara redeploy automático en Railway **y** Netlify.

### Custom domain

- **Netlify**: Site settings → Domain management → Add custom domain.
- **Railway**: Settings → Networking → Custom Domain.
  Acordate de actualizar `CORS_ORIGIN` y `VITE_API_BASE_URL` si cambiás dominios.

### Costos típicos

- Railway Hobby: ~$2–4/mes (256MB RAM, sleep cuando no hay tráfico).
- Netlify Free: gratis hasta 100GB/mes de transfer.

---

## Alternativa — Fly.io en lugar de Railway

Si preferís Fly:

```bash
brew install flyctl
flyctl auth signup        # o login
flyctl launch --no-deploy # usa el fly.toml que ya está en el repo
flyctl secrets set IOL_USERNAME=... IOL_PASSWORD=... \
  CORS_ORIGIN=https://cotizaciones-pericles.netlify.app
flyctl deploy
flyctl status             # te muestra la URL pública
```

El resto (Parte 3 en adelante) es idéntico.

---

## Troubleshooting

| Síntoma                                            | Causa probable                                | Fix                                                                      |
| -------------------------------------------------- | --------------------------------------------- | ------------------------------------------------------------------------ |
| `503 provider_not_configured` en `/acciones/*`     | IOL_USERNAME / IOL_PASSWORD vacíos             | Verificar variables en Railway                                            |
| `CORS error` en consola del navegador              | `CORS_ORIGIN` no incluye la URL de Netlify     | Sumar la URL exacta (sin `/` final) en Railway                            |
| Web carga pero datos vacíos / `Failed to fetch`    | `VITE_API_BASE_URL` mal seteado               | Verificar en Netlify → Environment variables y re-disparar deploy         |
| `400 Bad Request` desde IOL en CEDEARs             | Token IOL caducado o credenciales incorrectas | Re-loggearse en IOL y rotar password en Railway                           |
| Build de Netlify falla con `pnpm` not found        | `corepack` deshabilitado                      | Ya está en el `command` del `netlify.toml`, revisá Build logs             |
| Railway dice "Image too large"                     | `node_modules` filtrándose                    | Verificar `.dockerignore` (ya está bien configurado)                      |

---

## Resumen ultra-rápido (para la próxima)

```bash
# 1. push
git push origin main

# 2. configurar (sólo la 1ra vez)
#    Railway:  IOL_USERNAME, IOL_PASSWORD, CORS_ORIGIN
#    Netlify:  VITE_API_BASE_URL

# 3. listo — auto-deploy en cada push
```
