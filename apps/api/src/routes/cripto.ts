import { Hono } from 'hono';
import type { CryptoBoard, CryptoQuote } from '@cotizaciones/types';
import { env } from '../env.js';
import { cachedWithFallback } from '../lib/cache.js';

// CoinGecko free API — no key required, no geo-blocking.
// Returns top 250 coins by market cap with price, 24h change, volume, and market cap.
const COINGECKO_URL =
  'https://api.coingecko.com/api/v3/coins/markets' +
  '?vs_currency=usd&order=market_cap_desc&per_page=250&page=1' +
  '&sparkline=false&price_change_percentage=24h';

interface CoinGeckoMarket {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  price_change_percentage_24h: number;
  market_cap: number;
  total_volume: number;
  last_updated: string;
  market_cap_rank: number;
}

async function loadCripto(): Promise<CryptoQuote[] | null> {
  const res = await fetch(COINGECKO_URL, {
    headers: { Accept: 'application/json' },
  });

  if (!res.ok) {
    // 429 = rate limited, 503 = down — use cached value if available
    if (res.status === 429 || res.status === 503) return null;
    throw new Error(`coingecko ${res.status}`);
  }

  const coins = (await res.json()) as CoinGeckoMarket[];

  return coins.map<CryptoQuote>((c) => ({
    symbol: c.symbol.toUpperCase(),
    name: c.name,
    priceUsd: c.current_price,
    changePercent24h: c.price_change_percentage_24h ?? 0,
    marketCapUsd: c.market_cap ?? null,
    volume24hUsd: c.total_volume,
    rank: c.market_cap_rank,
    updatedAt: c.last_updated,
  }));
}

export const cripto = new Hono().get('/', async (c) => {
  const result = await cachedWithFallback('cripto:coingecko', env.CACHE_TTL_SECONDS, loadCripto);
  const board: CryptoBoard = {
    items: result.value,
    fetchedAt: result.fetchedAt,
    marketOpen: true,
    stale: result.stale,
  };
  return c.json({ ok: true as const, data: board });
});
