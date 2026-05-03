import { Hono } from 'hono';
import type { Quote, QuoteList } from '@cotizaciones/types';
import { env } from '../env';
import { cachedWithFallback } from '../lib/cache';
import { iolGet } from '../lib/iol';
import { isMarketOpen, type MarketCode } from '../lib/market';
import { normalizeIolQuote, type RawIolQuote } from '../lib/normalize';

interface IolPanelResponse {
  titulos: RawIolQuote[];
}

async function loadPanel(
  path: string,
  defaults: { kind: Quote['kind']; market: Quote['market']; currency?: Quote['currency'] },
): Promise<Quote[] | null> {
  const json = await iolGet<IolPanelResponse>(path);
  if (!json) return null;
  return json.titulos.map((t) => normalizeIolQuote(t, defaults));
}

/**
 * URLs de IOL siguiendo el patrón exacto del server legacy
 * (ver `legacy/server-master/Funciones/AccionesARG.js` y compañía):
 *
 *   /api/Cotizaciones/{instrumento}/{panel}/{pais_path}
 *     ?panelCotizacion.instrumento={instrumento}
 *     &panelCotizacion.panel={panel}
 *     &panelCotizacion.pais={pais_query}
 *
 * Notar que el `{pais_path}` puede no coincidir con `{pais_query}` —
 * IOL usa los query params como fuente de verdad. Se respeta el casing
 * tal cual aparece en el legacy.
 */
const PATHS = {
  // Legacy: acciones/Merval/estados_unidos?panel=Merval&pais=argentina
  merval:
    '/api/Cotizaciones/acciones/Merval/estados_unidos?panelCotizacion.instrumento=acciones&panelCotizacion.panel=Merval&panelCotizacion.pais=argentina',
  // Legacy: acciones/SP500/estados_unidos?panel=SP500&pais=estados_Unidos
  sp500:
    '/api/Cotizaciones/acciones/SP500/estados_unidos?panelCotizacion.instrumento=acciones&panelCotizacion.panel=SP500&panelCotizacion.pais=estados_Unidos',
  // Legacy: aDRs/argentina/estados_unidos?panel=argentina&pais=estados_Unidos
  adrs: '/api/Cotizaciones/aDRs/argentina/estados_unidos?panelCotizacion.instrumento=aDRs&panelCotizacion.panel=argentina&panelCotizacion.pais=estados_Unidos',
  // CEDEARs están documentados en IOL como `instrumento=acciones`
  // (no como instrumento propio). Mismo molde que el legacy AccionesARG —
  // sólo cambia el panel a `CEDEARs`. Son títulos USA que cotizan en Merval,
  // por eso `pais=argentina`.
  cedears:
    '/api/Cotizaciones/acciones/CEDEARs/estados_unidos?panelCotizacion.instrumento=acciones&panelCotizacion.panel=CEDEARs&panelCotizacion.pais=argentina',
} as const;

interface PanelDef {
  cacheKey: string;
  path: string;
  kind: Quote['kind'];
  market: Quote['market'];
  marketCode: MarketCode;
  currency: Quote['currency'];
}

const PANELS: Record<'merval' | 'sp500' | 'adrs' | 'cedears', PanelDef> = {
  merval: {
    cacheKey: 'acciones:merval',
    path: PATHS.merval,
    kind: 'accion',
    market: 'bcba',
    marketCode: 'bcba',
    currency: 'ARS',
  },
  sp500: {
    cacheKey: 'acciones:sp500',
    path: PATHS.sp500,
    kind: 'accion',
    market: 'nyse',
    marketCode: 'nyse',
    currency: 'USD',
  },
  adrs: {
    cacheKey: 'acciones:adrs',
    path: PATHS.adrs,
    kind: 'adr',
    market: 'nyse',
    marketCode: 'nyse',
    currency: 'USD',
  },
  cedears: {
    cacheKey: 'acciones:cedears',
    path: PATHS.cedears,
    kind: 'cedear',
    market: 'bcba',
    marketCode: 'bcba',
    currency: 'ARS',
  },
};

async function panelHandler(panel: PanelDef) {
  const result = await cachedWithFallback(panel.cacheKey, env.CACHE_TTL_SECONDS, () =>
    loadPanel(panel.path, {
      kind: panel.kind,
      market: panel.market,
      currency: panel.currency,
    }),
  );
  const list: QuoteList = {
    kind: panel.kind,
    market: panel.market,
    items: result.value,
    fetchedAt: result.fetchedAt,
    marketOpen: isMarketOpen(panel.marketCode),
    stale: result.stale,
  };
  return list;
}

export const acciones = new Hono()
  .get('/merval', async (c) =>
    c.json({ ok: true as const, data: await panelHandler(PANELS.merval) }),
  )
  .get('/sp500', async (c) => c.json({ ok: true as const, data: await panelHandler(PANELS.sp500) }))
  .get('/adrs', async (c) => c.json({ ok: true as const, data: await panelHandler(PANELS.adrs) }))
  .get('/cedears', async (c) =>
    c.json({ ok: true as const, data: await panelHandler(PANELS.cedears) }),
  );
