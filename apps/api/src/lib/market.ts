/**
 * Market hours and holiday calendar for BCBA (Argentina) and NYSE (US).
 * Update HOLIDAYS once per year by appending the new year's dates.
 */

export type MarketCode = 'bcba' | 'nyse' | 'crypto';

interface Schedule {
  tz: string;
  openHour: number;  // decimal 24h, e.g. 9.5 = 09:30
  closeHour: number;
}

const SCHEDULES: Partial<Record<MarketCode, Schedule>> = {
  bcba: { tz: 'America/Argentina/Buenos_Aires', openHour: 11, closeHour: 17 },
  nyse: { tz: 'America/New_York', openHour: 9.5, closeHour: 16 },
};

const HOLIDAYS: Record<'bcba' | 'nyse', string[]> = {
  bcba: [
    // 2025
    '2025-01-01', '2025-03-03', '2025-03-04', '2025-03-24', '2025-04-02',
    '2025-04-17', '2025-04-18', '2025-05-01', '2025-05-25', '2025-06-16',
    '2025-07-09', '2025-08-18', '2025-10-13', '2025-11-21', '2025-12-08', '2025-12-25',
    // 2026
    '2026-01-01', '2026-02-16', '2026-02-17', '2026-03-23', '2026-03-24',
    '2026-04-02', '2026-04-03', '2026-05-01', '2026-05-25', '2026-06-15',
    '2026-07-09', '2026-08-17', '2026-10-12', '2026-11-23', '2026-12-08', '2026-12-25',
  ],
  nyse: [
    // 2025
    '2025-01-01', '2025-01-09', '2025-01-20', '2025-02-17', '2025-04-18',
    '2025-05-26', '2025-06-19', '2025-07-04', '2025-09-01', '2025-11-27', '2025-12-25',
    // 2026
    '2026-01-01', '2026-01-19', '2026-02-16', '2026-04-03', '2026-05-25',
    '2026-06-19', '2026-07-03', '2026-09-07', '2026-11-26', '2026-12-25',
  ],
};

function inTz(tz: string): { dateStr: string; hour: number; weekday: number } {
  const fmt = new Intl.DateTimeFormat('en-US', {
    timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit',
    hour: 'numeric', minute: 'numeric', weekday: 'short', hour12: false,
  });
  const parts = fmt.formatToParts(new Date());
  const get = (type: Intl.DateTimeFormatPartTypes) => parts.find((p) => p.type === type)?.value ?? '';
  return {
    dateStr: `${get('year')}-${get('month')}-${get('day')}`,
    hour: Number(get('hour')) + Number(get('minute')) / 60,
    weekday: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(get('weekday')),
  };
}

export function isMarketOpen(market: MarketCode): boolean {
  const schedule = SCHEDULES[market];
  if (!schedule) return true; // crypto is 24/7

  const { dateStr, hour, weekday } = inTz(schedule.tz);

  if (weekday === 0 || weekday === 6) return false;
  const holidays = HOLIDAYS[market as 'bcba' | 'nyse'];
  if (holidays.includes(dateStr)) return false;

  return hour >= schedule.openHour && hour < schedule.closeHour;
}
