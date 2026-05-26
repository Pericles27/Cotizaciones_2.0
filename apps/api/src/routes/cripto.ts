import { Hono } from 'hono';
import type { CryptoBoard, CryptoQuote } from '@cotizaciones/types';
import { env } from '../env';
import { cachedWithFallback } from '../lib/cache';
import { COIN_NAMES } from '../lib/coin-names';

interface BinanceTicker {
  symbol: string;
  priceChangePercent: string;
  lastPrice: string;
  quoteVolume: string;
  closeTime: number;
}

const EXCLUDED_PATTERNS = [/UP$/, /DOWN$/, /BULL$/, /BEAR$/, /^W[A-Z]+$/];

const BINANCE_URL = 'https://api.binance.com/api/v3/ticker/24hr';

async function loadCripto(): Promise<CryptoQuote[] | null> {
  const res = await fetch(BINANCE_URL);
  if (!res.ok) {
    if (res.status === 429 || res.status === 418 || res.status === 503) return null;
    throw new Error(`binance ${res.status}`);
  }
  const all = (await res.json()) as BinanceTicker[];

  const items = all
    .filter((t) => t.symbol.endsWith('USDT'))
    .map((t) => ({ raw: t, base: t.symbol.replace(/USDT$/, '') }))
    .filter(({ base }) => {
      if (base.length < 2 || base.length > 8) return false;
      if (EXCLUDED_PATTERNS.some((re) => re.test(base))) return false;
      return true;
    })
    .filter(({ raw }) => Number(raw.quoteVolume) > 0)
    .map<CryptoQuote & { _vol: number }>(({ raw, base }) => ({
      symbol: base,
      name: COIN_NAMES[base] ?? base,
      priceUsd: Number(raw.lastPrice),
      changePercent24h: Number(raw.priceChangePercent),
      marketCapUsd: null,
      volume24hUsd: Number(raw.quoteVolume),
      rank: undefined,
      updatedAt: new Date(raw.closeTime).toISOString(),
      _vol: Number(raw.quoteVolume),
    }));

  items.sort((a, b) => b._vol - a._vol);
  return items.slice(0, 150).map(({ _vol, ...rest }, idx) => ({ ...rest, rank: idx + 1 }));
}

export const cripto = new Hono().get('/', async (c) => {
  const result = await cachedWithFallback('cripto:binance', env.CACHE_TTL_SECONDS, loadCripto);
  const board: CryptoBoard = {
    items: result.value,
    fetchedAt: result.fetchedAt,
    marketOpen: true,
    stale: result.stale,
  };
  return c.json({ ok: true as const, data: board });
});
