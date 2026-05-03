import { z } from 'zod';

/** Tipos de instrumento financiero soportados. */
export const InstrumentKind = z.enum(['bono', 'accion', 'adr', 'cripto', 'cedear']);
export type InstrumentKind = z.infer<typeof InstrumentKind>;

/** Mercado al que pertenece el instrumento. */
export const Market = z.enum(['bcba', 'nyse', 'nasdaq', 'crypto', 'mep', 'ccl']);
export type Market = z.infer<typeof Market>;

/** Moneda de cotización. */
export const Currency = z.enum(['ARS', 'USD', 'USDT', 'EUR']);
export type Currency = z.infer<typeof Currency>;
