# syntax=docker/dockerfile:1.7
# Build de apps/api desde la raíz del monorepo (necesita workspace deps).
# Multi-stage: 1) instalar y compilar, 2) runtime mínimo con solo prod deps.

ARG NODE_VERSION=20.18.0
ARG PNPM_VERSION=9.15.0

# ─────────────────────────────── builder ───────────────────────────────
FROM node:${NODE_VERSION}-alpine AS builder
WORKDIR /repo

# pnpm via corepack.
# Actualizamos corepack a la última (la versión que viene con Node 20.x tiene un
# bug de verificación de firmas: "Cannot find matching keyid"). Una vez updated,
# habilitamos y fijamos la versión de pnpm.
RUN npm install -g corepack@latest \
  && corepack enable \
  && corepack prepare pnpm@${PNPM_VERSION} --activate

# Instalamos TODO el monorepo (deps de packages/* + apps/api).
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml* .npmrc* ./
COPY packages packages
COPY apps/api apps/api

RUN pnpm install --frozen-lockfile

# Compilamos el workspace de la API.
RUN pnpm --filter @cotizaciones/api build

# `pnpm deploy` arma una carpeta autónoma con node_modules ya hoisteado
# y los workspace packages copiados — perfecta para el runtime.
RUN pnpm --filter @cotizaciones/api deploy --prod /deploy

# ─────────────────────────────── runtime ───────────────────────────────
FROM node:${NODE_VERSION}-alpine AS runner

ENV NODE_ENV=production
ENV PORT=3001

WORKDIR /app
COPY --from=builder /deploy ./

# Healthcheck nativo de Docker (Fly también puede chequearlo).
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --quiet --spider http://127.0.0.1:${PORT}/health || exit 1

EXPOSE 3001
CMD ["node", "dist/index.js"]
