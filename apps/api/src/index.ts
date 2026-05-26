import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import type { MiddlewareHandler } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { secureHeaders } from 'hono/secure-headers';
import { env } from './env';
import { IolNotConfiguredError } from './lib/iol';
import { rateLimiter } from './lib/rate-limit';
import { bonos } from './routes/bonos';
import { acciones } from './routes/acciones';
import { cripto } from './routes/cripto';
import { indices } from './routes/indices';

const app = new Hono();

app.use('*', logger());
app.use('*', secureHeaders());
app.use('*', cors({ origin: env.CORS_ORIGIN, allowMethods: ['GET', 'OPTIONS'] }));

const limiter = rateLimiter({ windowMs: 60_000, max: 60 });
app.use('/bonos/*', limiter);
app.use('/acciones/*', limiter);
app.use('/cripto', limiter);
app.use('/indices', limiter);
app.use('/', limiter);

if (env.API_KEY) {
  const apiKey = env.API_KEY;
  const authMiddleware: MiddlewareHandler = async (c, next) => {
    if (c.req.header('x-api-key') !== apiKey) {
      return c.json(
        { ok: false as const, error: { code: 'unauthorized', message: 'Invalid or missing API key.' } },
        401,
      );
    }
    return next();
  };
  app.use('/bonos/*', authMiddleware);
  app.use('/acciones/*', authMiddleware);
  app.use('/cripto', authMiddleware);
  app.use('/indices', authMiddleware);
  app.use('/', authMiddleware);
  console.log('  Auth: API key required (X-API-Key)');
}

app.get('/', (c) =>
  c.json({
    name: 'cotizaciones-api',
    version: '0.0.0',
    endpoints: ['/health', '/bonos', '/bonos/fx', '/acciones/merval', '/acciones/sp500', '/acciones/adrs', '/acciones/cedears', '/cripto', '/indices'],
  }),
);

app.get('/health', (c) =>
  c.json({
    ok: true,
    ts: new Date().toISOString(),
    iol: env.iol.configured ? 'configured' : 'not_configured',
    auth: env.API_KEY ? 'key_required' : 'open',
  }),
);

const routes = app
  .route('/bonos', bonos)
  .route('/acciones', acciones)
  .route('/cripto', cripto)
  .route('/indices', indices);

app.onError((err, c) => {
  if (err instanceof IolNotConfiguredError) {
    return c.json({ ok: false as const, error: { code: err.code, message: err.message } }, 503);
  }
  console.error('[api]', err);
  const isProd = env.NODE_ENV === 'production';
  return c.json(
    { ok: false as const, error: { code: 'internal_error', message: isProd ? 'An internal error occurred.' : err.message } },
    500,
  );
});

export type AppRouter = typeof routes;

serve({ fetch: app.fetch, port: env.PORT }, (info) => {
  console.log(`✓ cotizaciones-api on http://localhost:${info.port}`);
  if (env.iol.configured) {
    console.log('  IOL: connected');
  } else {
    console.log('  IOL: not configured — set IOL_USERNAME and IOL_PASSWORD to enable /bonos and /acciones');
  }
});
