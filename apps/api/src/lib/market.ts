/**
 * Detección sencilla de horarios de mercado.
 * No considera feriados (eso requeriría calendario) — solo días hábiles
 * y horarios típicos en la timezone correcta.
 */

export type MarketCode = 'bcba' | 'nyse' | 'crypto';

interface Schedule {
  tz: string;
  /** Hora de apertura (24h, decimal: 9.5 = 9:30). */
  openHour: number;
  /** Hora de cierre (24h, decimal). */
  closeHour: number;
}

const SCHEDULES: Partial<Record<MarketCode, Schedule>> = {
  // Bolsa de Buenos Aires: lun–vie 11:00 – 17:00 ART
  bcba: { tz: 'America/Argentina/Buenos_Aires', openHour: 11, closeHour: 17 },
  // NYSE / NASDAQ: lun–vie 09:30 – 16:00 ET
  nyse: { tz: 'America/New_York', openHour: 9.5, closeHour: 16 },
  // crypto: 24/7 — sin schedule
};

/** Devuelve componentes locales (h, m, weekday) en la timezone dada. */
function inTz(tz: string): { hour: number; weekday: number } {
  const fmt = new Intl.DateTimeFormat('en-US', {
    timeZone: tz,
    hour: 'numeric',
    minute: 'numeric',
    weekday: 'short',
    hour12: false,
  });
  const parts = fmt.formatToParts(new Date());
  const lookup = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((p) => p.type === type)?.value ?? '';
  const hour = Number(lookup('hour'));
  const minute = Number(lookup('minute'));
  const weekdayStr = lookup('weekday');
  const weekday = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(weekdayStr);
  return { hour: hour + minute / 60, weekday };
}

export function isMarketOpen(market: MarketCode): boolean {
  const schedule = SCHEDULES[market];
  if (!schedule) return true; // crypto

  const { hour, weekday } = inTz(schedule.tz);
  if (weekday === 0 || weekday === 6) return false; // fin de semana
  return hour >= schedule.openHour && hour < schedule.closeHour;
}
