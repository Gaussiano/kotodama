/** Day keys are local-time 'YYYY-MM-DD' strings (spec §5: natural day in the device time zone). */
export type DayKey = string;

export function localDayKey(d: Date = new Date()): DayKey {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function parseDayKey(key: DayKey): Date {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y!, m! - 1, d!, 12, 0, 0, 0); // noon avoids DST edge cases
}

export function addDays(key: DayKey, n: number): DayKey {
  const d = parseDayKey(key);
  d.setDate(d.getDate() + n);
  return localDayKey(d);
}

/** b - a in whole days. */
export function diffDays(a: DayKey, b: DayKey): number {
  const ms = parseDayKey(b).getTime() - parseDayKey(a).getTime();
  return Math.round(ms / 86_400_000);
}

export const isBefore = (a: DayKey, b: DayKey) => a < b;
export const isSameOrBefore = (a: DayKey, b: DayKey) => a <= b;

const MONTHS_ES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
const WEEKDAYS_ES = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'];

/** «sáb 3 oct» */
export function formatDayEs(key: DayKey, withWeekday = true): string {
  const d = parseDayKey(key);
  const base = `${d.getDate()} ${MONTHS_ES[d.getMonth()]}`;
  return withWeekday ? `${WEEKDAYS_ES[d.getDay()]} ${base}` : base;
}
