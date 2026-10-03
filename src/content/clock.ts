// Hours (spec §10.7). Irregular readings are flagged so the learn card can mark them in red.

export interface HourReading {
  hour: number; // 1–12
  kana: string;
  romaji: string;
  irregular: boolean;
}

export const HOURS: HourReading[] = [
  { hour: 1, kana: 'いちじ', romaji: 'ichiji', irregular: false },
  { hour: 2, kana: 'にじ', romaji: 'niji', irregular: false },
  { hour: 3, kana: 'さんじ', romaji: 'sanji', irregular: false },
  { hour: 4, kana: 'よじ', romaji: 'yoji', irregular: true },
  { hour: 5, kana: 'ごじ', romaji: 'goji', irregular: false },
  { hour: 6, kana: 'ろくじ', romaji: 'rokuji', irregular: false },
  { hour: 7, kana: 'しちじ', romaji: 'shichiji', irregular: true },
  { hour: 8, kana: 'はちじ', romaji: 'hachiji', irregular: false },
  { hour: 9, kana: 'くじ', romaji: 'kuji', irregular: true },
  { hour: 10, kana: 'じゅうじ', romaji: 'jūji', irregular: false },
  { hour: 11, kana: 'じゅういちじ', romaji: 'jūichiji', irregular: false },
  { hour: 12, kana: 'じゅうにじ', romaji: 'jūniji', irregular: false },
];

export const HALF = { kana: 'はん', romaji: 'han', es: 'y media' };
export const AM = { kana: 'ごぜん', romaji: 'gozen', es: 'de la mañana' };
export const PM = { kana: 'ごご', romaji: 'gogo', es: 'de la tarde' };
export const WHAT_TIME = { kana: 'なんじですか', romaji: 'nanji desu ka', es: '¿Qué hora es?' };

export interface ClockReading {
  kana: string;
  romaji: string;
  es: string;
}

/** Reading of a time on a 12-hour clock, optionally with ごぜん/ごご. */
export function toClockReading(hour: number, half: boolean, period?: 'am' | 'pm'): ClockReading {
  const h = HOURS.find((x) => x.hour === hour);
  if (!h) throw new RangeError(`hour out of range: ${hour}`);
  const p = period === 'am' ? AM : period === 'pm' ? PM : null;
  const kana = `${p ? `${p.kana} ` : ''}${h.kana}${half ? HALF.kana : ''}`;
  const romaji = `${p ? `${p.romaji} ` : ''}${h.romaji}${half ? ` ${HALF.romaji}` : ''}`;
  const es = `${hour}${half ? ' y media' : ' en punto'}${p ? ` ${p.es}` : ''}`;
  return { kana, romaji, es };
}
