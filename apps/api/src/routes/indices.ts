import { Hono } from 'hono';
import type { IndexBoard, IndexQuote } from '@cotizaciones/types';
import { env } from '../env.js';
import { cachedWithFallback } from '../lib/cache.js';

/** Set por defecto de índices que seguimos. */
const TRACKED: Array<{ symbol: string; name: string; region: IndexQuote['region'] }> = [
  { symbol: '^MERV', name: 'Merval', region: 'ar' },
  { symbol: '^GSPC', name: 'S&P 500', region: 'us' },
  { symbol: '^DJI', name: 'Dow Jones', region: 'us' },
  { symbol: '^IXIC', name: 'NASDAQ', region: 'us' },
  { symbol: '^RUT', name: 'Russell 2000', region: 'us' },
  { symbol: '^BVSP', name: 'IBOVespa', region: 'br' },
  // Petróleo — futuros de WTI y Brent vía Yahoo Finance.
  { symbol: 'CL=F', name: 'WTI', region: 'commodity' },
  { symbol: 'BZ=F', name: 'Brent', region: 'commodity' },
];

interface YahooChartResponse {
  chart: {
    result?: Array<{
      meta: {
        currency: string;
        regularMarketPrice: number;
        chartPreviousClose: number;
        previousClose?: number;
        regularMarketTime?: number;
      };
    }>;
    error?: { code: string; description: string } | null;
  };
}

async function fetchOne(symbol: string, name: string, region: IndexQuote['region']) {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=2d`;
  // Yahoo a veces requiere User-Agent para no bloquear como bot.
  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (cotizaciones-app)' },
  });
  if (!res.ok) {
    throw new Error(`yahoo ${symbol} → ${res.status}`);
  }
  const json = (await res.json()) as YahooChartResponse;
  const result = json.chart.result?.[0];
  if (!result) return null;

  const last = result.meta.regularMarketPrice;
  const prev = result.meta.previousClose ?? result.meta.chartPreviousClose;
  if (typeof last !== 'number' || typeof prev !== 'number') return null;

  const changePercent = prev !== 0 ? ((last - prev) / prev) * 100 : 0;
  const updatedAt = result.meta.regularMarketTime
    ? new Date(result.meta.regularMarketTime * 1000).toISOString()
    : new Date().toISOString();

  const q: IndexQuote = {
    symbol,
    name,
    region,
    currency: result.meta.currency,
    last,
    previousClose: prev,
    changePercent,
    updatedAt,
  };
  return q;
}

async function loadIndices(): Promise<IndexQuote[] | null> {
  const settled = await Promise.allSettled(
    TRACKED.map(({ symbol, name, region }) => fetchOne(symbol, name, region)),
  );
  const items = settled.flatMap((s) => (s.status === 'fulfilled' && s.value ? [s.value] : []));
  return items.length > 0 ? items : null;
}

export const indices = new Hono().get('/', async (c) => {
  const result = await cachedWithFallback(
    'indices:tracked',
    Math.max(env.CACHE_TTL_SECONDS, 60),
    loadIndices,
  );
  const board: IndexBoard = {
    items: result.value,
    fetchedAt: result.fetchedAt,
    stale: result.stale,
  };
  return c.json({ ok: true as const, data: board });
});
