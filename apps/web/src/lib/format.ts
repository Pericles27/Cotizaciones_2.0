const ARS = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
  maximumFractionDigits: 2,
});

const USD = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 2,
});

const COMPACT_USD = new Intl.NumberFormat('en-US', {
  notation: 'compact',
  maximumFractionDigits: 2,
  style: 'currency',
  currency: 'USD',
});

const TIME = new Intl.DateTimeFormat('es-AR', {
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
});

export function formatPrice(value: number, currency: 'ARS' | 'USD' | string) {
  if (currency === 'USD' || currency === 'USDT') return USD.format(value);
  return ARS.format(value);
}

export function formatCompactUsd(value: number) {
  return COMPACT_USD.format(value);
}

export function formatTime(iso: string) {
  return TIME.format(new Date(iso));
}
