import type { KanjiSign } from './types';

// Survival kanji for E14 «Carteles» (spec §10.5).
export const KANJI: KanjiSign[] = [
  { id: 'kj-iriguchi', kanji: '入口', romaji: 'iriguchi', es: 'entrada', sign: 'door' },
  { id: 'kj-deguchi', kanji: '出口', romaji: 'deguchi', es: 'salida', sign: 'door' },
  { id: 'kj-otoko', kanji: '男', romaji: 'otoko', es: 'hombres', sign: 'toilet' },
  { id: 'kj-onna', kanji: '女', romaji: 'onna', es: 'mujeres', sign: 'toilet' },
  { id: 'kj-eki', kanji: '駅', romaji: 'eki', es: 'estación', sign: 'station' },
  { id: 'kj-en', kanji: '円', romaji: 'en', es: 'yen', sign: 'price' },
  { id: 'kj-osu', kanji: '押', romaji: 'osu', es: 'empujar', sign: 'door' },
  { id: 'kj-hiku', kanji: '引', romaji: 'hiku', es: 'tirar', sign: 'door' },
  { id: 'kj-eigyochu', kanji: '営業中', romaji: 'eigyōchū', es: 'abierto', sign: 'shop' },
  { id: 'kj-junbichu', kanji: '準備中', romaji: 'junbichū', es: 'cerrado (en preparación)', sign: 'shop' },
  { id: 'kj-kinshi', kanji: '禁止', romaji: 'kinshi', es: 'prohibido', sign: 'notice' },
  { id: 'kj-hangaku', kanji: '半額', romaji: 'hangaku', es: 'mitad de precio', sign: 'price' },
];

export const KANJI_BY_ID: Record<string, KanjiSign> = Object.fromEntries(KANJI.map((k) => [k.id, k]));
