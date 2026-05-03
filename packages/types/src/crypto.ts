import { z } from 'zod';

export const CryptoQuote = z.object({
  symbol: z.string(),
  name: z.string(),
  iconUrl: z.string().url().optional(),
  priceUsd: z.number(),
  changePercent24h: z.number(),
  marketCapUsd: z.number().nullable().optional(),
  volume24hUsd: z.number().nullable().optional(),
  rank: z.number().int().positive().optional(),
  updatedAt: z.string().datetime(),
});

export type CryptoQuote = z.infer<typeof CryptoQuote>;

export const CryptoBoard = z.object({
  items: z.array(CryptoQuote),
  fetchedAt: z.string().datetime(),
  /** Cripto siempre cotiza, pero por consistencia con los otros mercados. */
  marketOpen: z.boolean().optional(),
  stale: z.boolean().optional(),
});

export type CryptoBoard = z.infer<typeof CryptoBoard>;
