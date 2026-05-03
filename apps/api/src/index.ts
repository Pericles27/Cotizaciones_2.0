import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { secureHeaders } from 'hono/secure-headers';
import { env } from './env';
import { IolNotConfiguredError } from './lib/iol';
import { bonos } from './routes/bonos';
import { acciones } from './routes/acciones';
import { cripto } from './routes/cripto';
import { indices } from './routes/indices';

const app = new Hono();

app.use('*', logger());
app.use('*', secureHeaders());
app.use(
  '*',
  cors({
    origin: env.CORS_ORIGIN,
    allowMethods: ['GET', 'OPTIONS'],
  }),
);

app.get('/', (c) =>
  c.json({
    name: 'cotizaciones-api',
    version: '0.0.0',
    endpoints: [
      '/health',
      '/bonos',
      '/bonos/fx',
      '/acciones/merval',
      '/acciones/sp500',
      '/acciones/adrs',
      '/acciones/cedears',
      '/cripto',
      '/indices',
    ],
  }),
);

app.get('/health', (c) => c.json({ ok: true, ts: new Date().toISOString() }));

const routes = app
  .route('/bonos', bonos)
  .route('/acciones', acciones)
  .route('/cripto', cripto)
  .route('/indices', indices);

app.onError((err, c) => {
  if (err instanceof IolNotConfiguredError) {
    return c.json(
      { ok: false as const, error: { code: err.code, message: err.message } },
      503,
    );
  }
  console.error('[api]', err);
  return c.json(
    {
      ok: false as const,
      error: { code: 'internal_error', message: err.message },
    },
    500,
  );
});

/** Tipo exportado para Hono RPC en el cliente. */
export type AppRouter = typeof routes;

serve({ fetch: app.fetch, port: env.PORT }, (info) => {
  console.log(`✓ cotizaciones-api on http://localhost:${info.port}`);
  if (env.iol.configured) {
    console.log(`  API: conectada (${env.iol.username.replace(/(?<=.{2}).(?=.*@)/g, '*')})`);
  } else {
    console.log('  API: SIN CONFIGURAR — completá apps/api/.env para habilitar /bonos y /acciones');
  }
});
