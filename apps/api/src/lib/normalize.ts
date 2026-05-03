import type { Currency, Market, Quote } from '@cotizaciones/types';

/** Forma cruda que devuelve IOL en `panelCotizacion`. */
export interface RawIolQuote {
  simbolo: string;
  descripcion?: string;
  ultimoPrecio: number;
  apertura?: number | null;
  maximo?: number | null;
  minimo?: number | null;
  cierreAnterior?: number | null;
  variacionPorcentual: number;
  volumen?: number | null;
  moneda?: string;
  fechaHora?: string;
}

const CURRENCY_MAP: Record<string, Currency> = {
  'peso_Argentino': 'ARS',
  'dolar_Estadounidense': 'USD',
  ARS: 'ARS',
  USD: 'USD',
};

export function normalizeIolQuote(
  raw: RawIolQuote,
  defaults: { kind: Quote['kind']; market: Market; currency?: Currency },
): Quote {
  const currency: Currency = defaults.currency ?? CURRENCY_MAP[raw.moneda ?? ''] ?? 'ARS';
  return {
    symbol: raw.simbolo,
    name: raw.descripcion,
    kind: defaults.kind,
    market: defaults.market,
    currency,
    last: raw.ultimoPrecio,
    open: raw.apertura ?? null,
    high: raw.maximo ?? null,
    low: raw.minimo ?? null,
    previousClose: raw.cierreAnterior ?? null,
    changePercent: raw.variacionPorcentual,
    volume: raw.volumen ?? null,
    updatedAt: raw.fechaHora ?? new Date().toISOString(),
  };
}
