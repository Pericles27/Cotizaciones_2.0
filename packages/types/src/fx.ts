import { z } from 'zod';

/**
 * Tipos de cambio implícitos calculados desde bonos soberanos
 * (par bono ARS / bono USD del mismo ticker).
 */
export const FxKind = z.enum(['mep', 'ccl', 'oficial', 'blue', 'mayorista']);
export type FxKind = z.infer<typeof FxKind>;

export const FxQuote = z.object({
  kind: FxKind,
  /** Par usado para calcular (ej: 'AL30' / 'AL30D'). */
  pair: z.string().optional(),
  value: z.number(),
  updatedAt: z.string().datetime(),
});

export type FxQuote = z.infer<typeof FxQuote>;

export const FxBoard = z.object({
  items: z.array(FxQuote),
  fetchedAt: z.string().datetime(),
  marketOpen: z.boolean().optional(),
  stale: z.boolean().optional(),
});

export type FxBoard = z.infer<typeof FxBoard>;
