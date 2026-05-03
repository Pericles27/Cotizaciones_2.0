import { Hono } from 'hono';
import type { CryptoBoard, CryptoQuote } from '@cotizaciones/types';
import { env } from '../env';
import { cachedWithFallback } from '../lib/cache';
import { COIN_NAMES } from '../lib/coin-names';

/** Una entrada del endpoint /api/v3/ticker/24hr de Binance. */
interface BinanceTicker {
  symbol: string;
  priceChange: string;
  priceChangePercent: string;
  weightedAvgPrice: string;
  lastPrice: string;
  volume: string;
  quoteVolume: string; // volumen 24h en la moneda quote (USDT, BTC, etc.)
  openTime: number;
  closeTime: number;
  count: number;
}

/** Tokens apalancados / wrapped que excluimos del listado. */
const EXCLUDED_PATTERNS = [
  /UP$/,
  /DOWN$/,
  /BULL$/,
  /BEAR$/,
  /^W[A-Z]+$/, // wrapped tokens (mayoría empieza con W)
];

const BINANCE_URL = 'https://api.binance.com/api/v3/ticker/24hr';

async function loadCripto(): Promise<CryptoQuote[] | null> {
  const res = await fetch(BINANCE_URL);
  if (!res.ok) {
    if (res.status === 429 || res.status === 418 || res.status === 503) return null;
    throw new Error(`binance ${res.status}`);
  }
  const all = (await res.json()) as BinanceTicker[];

  const items = all
    // solo pares contra USDT (precio ≈ USD)
    .filter((t) => t.symbol.endsWith('USDT'))
    .map((t) => ({ raw: t, base: t.symbol.replace(/USDT$/, '') }))
    // descartamos leveraged / wrapped / stablecoins espejo
    .filter(({ base }) => {
      if (base.length < 2 || base.length > 8) return false;
      if (EXCLUDED_PATTERNS.some((re) => re.test(base))) return false;
      return true;
    })
    // ignoramos pares con volumen 0 (delisted, ilíquidos)
    .filter(({ raw }) => Number(raw.quoteVolume) > 0)
    .map<CryptoQuote & { _vol: number }>(({ raw, base }, _, arr) => {
      const priceUsd = Number(raw.lastPrice);
      const volume = Number(raw.quoteVolume);
      return {
        symbol: base,
        name: COIN_NAMES[base] ?? base,
        priceUsd,
        changePercent24h: Number(raw.priceChangePercent),
        marketCapUsd: null, // Binance no lo provee
        volume24hUsd: volume,
        rank: undefined,
        updatedAt: new Date(raw.closeTime).toISOString(),
        _vol: volume,
      };
    });

  // ordenamos por volumen quote (USDT) y tomamos el top 150 — suficiente para el editor del ticker.
  items.sort((a, b) => b._vol - a._vol);
  const top = items.slice(0, 150).map((i, idx) => {
    const { _vol, ...rest } = i;
    return { ...rest, rank: idx + 1 };
  });
  return top;
}

export const cripto = new Hono().get('/', async (c) => {
  const result = await cachedWithFallback('cripto:binance', env.CACHE_TTL_SECONDS, loadCripto);
  const board: CryptoBoard = {
    items: result.value,
    fetchedAt: result.fetchedAt,
    marketOpen: true, // cripto cotiza 24/7
    stale: result.stale,
  };
  return c.json({ ok: true as const, data: board });
});
