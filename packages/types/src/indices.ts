import { z } from 'zod';

/**
 * Cotización de un índice bursátil (Merval, S&P 500, NASDAQ, etc.).
 * Datos provistos por Yahoo Finance.
 */
export const IndexQuote = z.object({
  /** Ticker oficial (^GSPC, ^MERV, ^DJI, ^IXIC, ...). */
  symbol: z.string(),
  /** Nombre legible. */
  name: z.string(),
  /** País / región para agrupar / filtrar. `commodity` cubre futuros como WTI/Brent. */
  region: z.enum(['ar', 'us', 'br', 'eu', 'asia', 'commodity']),
  /** Moneda de cotización. */
  currency: z.string(),
  /** Último valor publicado. */
  last: z.number(),
  /** Cierre anterior (para calcular variación intradiaria). */
  previousClose: z.number().nullable().optional(),
  /** Variación porcentual respecto al cierre anterior. */
  changePercent: z.number(),
  updatedAt: z.string().datetime(),
});

export type IndexQuote = z.infer<typeof IndexQuote>;

export const IndexBoard = z.object({
  items: z.array(IndexQuote),
  fetchedAt: z.string().datetime(),
  stale: z.boolean().optional(),
});

export type IndexBoard = z.infer<typeof IndexBoard>;
