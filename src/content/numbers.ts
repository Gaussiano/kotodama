// Japanese number readings 0–99 999 (spec §10.6).

const DIGITS_KANA = ['', 'いち', 'に', 'さん', 'よん', 'ご', 'ろく', 'なな', 'はち', 'きゅう'];
const DIGITS_ROMAJI = ['', 'ichi', 'ni', 'san', 'yon', 'go', 'roku', 'nana', 'hachi', 'kyū'];

const TENS_KANA = ['', 'じゅう', 'にじゅう', 'さんじゅう', 'よんじゅう', 'ごじゅう', 'ろくじゅう', 'ななじゅう', 'はちじゅう', 'きゅうじゅう'];
const TENS_ROMAJI = ['', 'jū', 'nijū', 'sanjū', 'yonjū', 'gojū', 'rokujū', 'nanajū', 'hachijū', 'kyūjū'];

const HUNDREDS_KANA = ['', 'ひゃく', 'にひゃく', 'さんびゃく', 'よんひゃく', 'ごひゃく', 'ろっぴゃく', 'ななひゃく', 'はっぴゃく', 'きゅうひゃく'];
const HUNDREDS_ROMAJI = ['', 'hyaku', 'nihyaku', 'sanbyaku', 'yonhyaku', 'gohyaku', 'roppyaku', 'nanahyaku', 'happyaku', 'kyūhyaku'];

const THOUSANDS_KANA = ['', 'せん', 'にせん', 'さんぜん', 'よんせん', 'ごせん', 'ろくせん', 'ななせん', 'はっせん', 'きゅうせん'];
const THOUSANDS_ROMAJI = ['', 'sen', 'nisen', 'sanzen', 'yonsen', 'gosen', 'rokusen', 'nanasen', 'hassen', 'kyūsen'];

export interface Reading {
  kana: string;
  romaji: string;
}

/** Reading of an integer 0–99 999. まん and the rest are separated by a space, as in the dossier («いちまん ごせん»). */
export function toJapaneseReading(n: number): Reading {
  if (!Number.isInteger(n) || n < 0 || n > 99_999) throw new RangeError(`out of range: ${n}`);
  if (n === 0) return { kana: 'ゼロ', romaji: 'zero' };
  const man = Math.floor(n / 10_000);
  const rest = n % 10_000;
  const th = Math.floor(rest / 1000);
  const hu = Math.floor((rest % 1000) / 100);
  const te = Math.floor((rest % 100) / 10);
  const un = rest % 10;

  const kanaParts: string[] = [];
  const romajiParts: string[] = [];
  if (man) {
    kanaParts.push(`${DIGITS_KANA[man]}まん`);
    romajiParts.push(`${DIGITS_ROMAJI[man]}man`);
  }
  const restKana = `${THOUSANDS_KANA[th]}${HUNDREDS_KANA[hu]}${TENS_KANA[te]}${DIGITS_KANA[un]}`;
  const restRomaji = `${THOUSANDS_ROMAJI[th]}${HUNDREDS_ROMAJI[hu]}${TENS_ROMAJI[te]}${DIGITS_ROMAJI[un]}`;
  if (restKana) {
    kanaParts.push(restKana);
    romajiParts.push(restRomaji);
  }
  return { kana: kanaParts.join(' '), romaji: romajiParts.join(' ') };
}

/** Price reading: adds えん (spec §10.6). */
export function toPriceReading(yen: number): Reading {
  const r = toJapaneseReading(yen);
  return { kana: `${r.kana}えん`, romaji: `${r.romaji} en` };
}

/** Realistic price generator (spec §10.6). `rnd` returns [0,1). */
export function randomPrice(kind: 'konbini' | 'shop', rnd: () => number): number {
  if (kind === 'konbini') return 100 + Math.floor(rnd() * 291) * 10; // 100..3000 step 10
  return 1000 + Math.floor(rnd() * 291) * 100; // 1000..30000 step 100
}

/** Format with Spanish thousands separator: 12 800 → «12.800». */
export const formatYen = (n: number) => `${n.toLocaleString('es-ES')} ¥`;
export const formatNumberEs = (n: number) => n.toLocaleString('es-ES');
