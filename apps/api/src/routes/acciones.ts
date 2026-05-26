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

const PATHS = {
  merval:
    '/api/Cotizaciones/acciones/Merval/estados_unidos?panelCotizacion.instrumento=acciones&panelCotizacion.panel=Merval&panelCotizacion.pais=argentina',
  sp500:
    '/api/Cotizaciones/acciones/SP500/estados_unidos?panelCotizacion.instrumento=acciones&panelCotizacion.panel=SP500&panelCotizacion.pais=estados_Unidos',
  adrs:
    '/api/Cotizaciones/aDRs/argentina/estados_unidos?panelCotizacion.instrumento=aDRs&panelCotizacion.panel=argentina&panelCotizacion.pais=estados_Unidos',
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
  merval:  { cacheKey: 'acciones:merval',  path: PATHS.merval,  kind: 'accion',  market: 'bcba', marketCode: 'bcba', currency: 'ARS' },
  sp500:   { cacheKey: 'acciones:sp500',   path: PATHS.sp500,   kind: 'accion',  market: 'nyse', marketCode: 'nyse', currency: 'USD' },
  adrs:    { cacheKey: 'acciones:adrs',    path: PATHS.adrs,    kind: 'adr',     market: 'nyse', marketCode: 'nyse', currency: 'USD' },
  cedears: { cacheKey: 'acciones:cedears', path: PATHS.cedears, kind: 'cedear',  market: 'bcba', marketCode: 'bcba', currency: 'ARS' },
};

async function panelHandler(panel: PanelDef): Promise<QuoteList> {
  const result = await cachedWithFallback(panel.cacheKey, env.CACHE_TTL_SECONDS, () =>
    loadPanel(panel.path, { kind: panel.kind, market: panel.market, currency: panel.currency }),
  );
  return {
    kind: panel.kind,
    market: panel.market,
    items: result.value,
    fetchedAt: result.fetchedAt,
    marketOpen: isMarketOpen(panel.marketCode),
    stale: result.stale,
  };
}

export const acciones = new Hono()
  .get('/merval',  async (c) => c.json({ ok: true as const, data: await panelHandler(PANELS.merval) }))
  .get('/sp500',   async (c) => c.json({ ok: true as const, data: await panelHandler(PANELS.sp500) }))
  .get('/adrs',    async (c) => c.json({ ok: true as const, data: await panelHandler(PANELS.adrs) }))
  .get('/cedears', async (c) => c.json({ ok: true as const, data: await panelHandler(PANELS.cedears) }));
