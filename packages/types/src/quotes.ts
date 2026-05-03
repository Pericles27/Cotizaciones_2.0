import { z } from 'zod';
import { Currency, InstrumentKind, Market } from './instruments';

/**
 * Cotización canónica usada por la app.
 * Normaliza la respuesta de IOL (y futuros proveedores) en una sola forma.
 */
export const Quote = z.object({
  symbol: z.string(),
  name: z.string().optional(),
  kind: InstrumentKind,
  market: Market,
  currency: Currency,
  last: z.number(),
  open: z.number().nullable().optional(),
  high: z.number().nullable().optional(),
  low: z.number().nullable().optional(),
  previousClose: z.number().nullable().optional(),
  changePercent: z.number(),
  volume: z.number().nullable().optional(),
  updatedAt: z.string().datetime(),
});

export type Quote = z.infer<typeof Quote>;

/** Lista paginada / agrupada de cotizaciones. */
export const QuoteList = z.object({
  market: Market,
  kind: InstrumentKind,
  items: z.array(Quote),
  fetchedAt: z.string().datetime(),
  /** El mercado correspondiente está abierto en este momento. */
  marketOpen: z.boolean().optional(),
  /** El backend está sirviendo el último valor bueno (no pudo refrescar). */
  stale: z.boolean().optional(),
});

export type QuoteList = z.infer<typeof QuoteList>;
