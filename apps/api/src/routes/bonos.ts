import { Hono } from 'hono';
import type { FxBoard, Quote, QuoteList } from '@cotizaciones/types';
import { env } from '../env.js';
import { cachedWithFallback } from '../lib/cache.js';
import { iolGet } from '../lib/iol.js';
import { isMarketOpen } from '../lib/market.js';
import { normalizeIolQuote, type RawIolQuote } from '../lib/normalize.js';

const MEP_PAIRS: Array<{ pair: string; base: string; usd: string }> = [
  { pair: 'AL30', base: 'AL30', usd: 'AL30D' },
  { pair: 'GD30', base: 'GD30', usd: 'GD30D' },
  { pair: 'GD35', base: 'GD35', usd: 'GD35D' },
];

const CCL_PAIRS: Array<{ pair: string; base: string; cable: string }> = [
  { pair: 'AL30', base: 'AL30', cable: 'AL30C' },
  { pair: 'GD30', base: 'GD30', cable: 'GD30C' },
  { pair: 'GD35', base: 'GD35', cable: 'GD35C' },
];

const PATH =
  '/api/Cotizaciones/bonos/todos/argentina?panelCotizacion.instrumento=bonos&panelCotizacion.panel=todos&panelCotizacion.pais=argentina';

interface IolPanelResponse {
  titulos: RawIolQuote[];
}

async function loadBonos(): Promise<Quote[] | null> {
  const json = await iolGet<IolPanelResponse>(PATH);
  if (!json) return null;
  return json.titulos.map((t) =>
    normalizeIolQuote(t, {
      kind: 'bono',
      market: 'bcba',
      currency: t.simbolo.endsWith('D') || t.simbolo.endsWith('C') ? 'USD' : 'ARS',
    }),
  );
}

export const bonos = new Hono()
  .get('/', async (c) => {
    const result = await cachedWithFallback('bonos:argentina', env.CACHE_TTL_SECONDS, loadBonos);
    const payload: QuoteList = {
      market: 'bcba',
      kind: 'bono',
      items: result.value,
      fetchedAt: result.fetchedAt,
      marketOpen: isMarketOpen('bcba'),
      stale: result.stale,
    };
    return c.json({ ok: true as const, data: payload });
  })
  .get('/fx', async (c) => {
    const result = await cachedWithFallback('bonos:argentina', env.CACHE_TTL_SECONDS, loadBonos);
    const bySymbol = new Map(result.value.map((b) => [b.symbol, b]));

    const mep = MEP_PAIRS.flatMap(({ pair, base, usd }) => {
      const a = bySymbol.get(base);
      const b = bySymbol.get(usd);
      if (!a || !b || b.last === 0) return [];
      return [{ kind: 'mep' as const, pair, value: a.last / b.last, updatedAt: result.fetchedAt }];
    });

    const ccl = CCL_PAIRS.flatMap(({ pair, base, cable }) => {
      const a = bySymbol.get(base);
      const b = bySymbol.get(cable);
      if (!a || !b || b.last === 0) return [];
      return [{ kind: 'ccl' as const, pair, value: a.last / b.last, updatedAt: result.fetchedAt }];
    });

    const board: FxBoard = {
      items: [...mep, ...ccl],
      fetchedAt: result.fetchedAt,
      marketOpen: isMarketOpen('bcba'),
      stale: result.stale,
    };
    return c.json({ ok: true as const, data: board });
  });
