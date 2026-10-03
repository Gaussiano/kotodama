import type { KanaChar } from './types';

type RowDef = [row: string, chars: string, romaji: string];

// Hepburn romaji. Row ids are stable keys used by nodes ('k', 's', 'ky'…).
const BASIC: RowDef[] = [
  ['a', 'あいうえお', 'a i u e o'],
  ['k', 'かきくけこ', 'ka ki ku ke ko'],
  ['s', 'さしすせそ', 'sa shi su se so'],
  ['t', 'たちつてと', 'ta chi tsu te to'],
  ['n', 'なにぬねの', 'na ni nu ne no'],
  ['h', 'はひふへほ', 'ha hi fu he ho'],
  ['m', 'まみむめも', 'ma mi mu me mo'],
  ['y', 'やゆよ', 'ya yu yo'],
  ['r', 'らりるれろ', 'ra ri ru re ro'],
  ['w', 'わを', 'wa wo'],
  ['nn', 'ん', 'n'],
];
const DAKUTEN: RowDef[] = [
  ['g', 'がぎぐげご', 'ga gi gu ge go'],
  ['z', 'ざじずぜぞ', 'za ji zu ze zo'],
  ['d', 'だぢづでど', 'da dji dzu de do'],
  ['b', 'ばびぶべぼ', 'ba bi bu be bo'],
];
const HANDAKUTEN: RowDef[] = [['p', 'ぱぴぷぺぽ', 'pa pi pu pe po']];
const YOON: RowDef[] = [
  ['ky', 'きゃ きゅ きょ', 'kya kyu kyo'],
  ['sh', 'しゃ しゅ しょ', 'sha shu sho'],
  ['ch', 'ちゃ ちゅ ちょ', 'cha chu cho'],
  ['ny', 'にゃ にゅ にょ', 'nya nyu nyo'],
  ['hy', 'ひゃ ひゅ ひょ', 'hya hyu hyo'],
  ['my', 'みゃ みゅ みょ', 'mya myu myo'],
  ['ry', 'りゃ りゅ りょ', 'rya ryu ryo'],
  ['gy', 'ぎゃ ぎゅ ぎょ', 'gya gyu gyo'],
  ['j', 'じゃ じゅ じょ', 'ja ju jo'],
  ['by', 'びゃ びゅ びょ', 'bya byu byo'],
  ['py', 'ぴゃ ぴゅ ぴょ', 'pya pyu pyo'],
];
// Katakana-only combinations for foreign words (spec §10.5).
const EXTENDED: RowDef[] = [
  ['x-e', 'シェ ジェ チェ', 'she je che'],
  ['x-t', 'ティ ディ デュ', 'ti di dyu'],
  ['x-f', 'ファ フィ フェ フォ', 'fa fi fe fo'],
  ['x-w', 'ウィ ウェ ウォ', 'wi we wo'],
  ['x-v', 'ヴ ツァ ツェ ツォ', 'vu tsa tse tso'],
];

const toKatakana = (s: string) =>
  [...s].map((ch) => {
    const cp = ch.codePointAt(0)!;
    return cp >= 0x3041 && cp <= 0x3096 ? String.fromCodePoint(cp + 0x60) : ch;
  }).join('');

function build(script: 'hiragana' | 'katakana', group: KanaChar['group'], rows: RowDef[]): KanaChar[] {
  const prefix = script === 'hiragana' ? 'h' : 'k';
  const out: KanaChar[] = [];
  for (const [row, chars, romaji] of rows) {
    const cs = chars.includes(' ') ? chars.split(' ') : [...chars];
    const rs = romaji.split(' ');
    cs.forEach((c, i) => {
      const char = script === 'katakana' ? toKatakana(c) : c;
      // Katakana 'wo' (ヲ) is practically unused; keep ids unique anyway.
      out.push({ id: `${prefix}-${rs[i]!}`, char, romaji: rs[i]!, script, group, row });
    });
  }
  return out;
}

export const HIRAGANA: KanaChar[] = [
  ...build('hiragana', 'basic', BASIC),
  ...build('hiragana', 'dakuten', DAKUTEN),
  ...build('hiragana', 'handakuten', HANDAKUTEN),
  ...build('hiragana', 'yoon', YOON),
];

export const KATAKANA: KanaChar[] = [
  ...build('katakana', 'basic', BASIC),
  ...build('katakana', 'dakuten', DAKUTEN),
  ...build('katakana', 'handakuten', HANDAKUTEN),
  ...build('katakana', 'yoon', YOON),
  ...build('katakana', 'extended', EXTENDED),
];

export const ALL_KANA: KanaChar[] = [...HIRAGANA, ...KATAKANA];
export const KANA_BY_ID: Record<string, KanaChar> = Object.fromEntries(ALL_KANA.map((k) => [k.id, k]));
const KANA_BY_CHAR: Record<string, KanaChar> = Object.fromEntries(ALL_KANA.map((k) => [k.char, k]));

/** Rows in dojo display order (spec §4.6). */
export const ROW_ORDER = [...BASIC, ...DAKUTEN, ...HANDAKUTEN, ...YOON].map(([row]) => row);
export const EXTENDED_ROWS = EXTENDED.map(([row]) => row);

export function kanaInRows(script: 'hiragana' | 'katakana', rows: string[]): string[] {
  const list = script === 'hiragana' ? HIRAGANA : KATAKANA;
  return list.filter((k) => rows.includes(k.row)).map((k) => k.id);
}

const SMALL_Y = new Set(['ゃ', 'ゅ', 'ょ', 'ャ', 'ュ', 'ョ']);
const SMALL_X = new Set(['ぁ', 'ぃ', 'ぅ', 'ぇ', 'ぉ', 'ァ', 'ィ', 'ゥ', 'ェ', 'ォ']);

/**
 * Kana ids needed to read a word (yoon pairs resolved; small っ/ッ, ー and punctuation ignored).
 * Characters that are not kana (kanji, Latin) are ignored too.
 */
export function kanaIdsFor(word: string): string[] {
  const chars = [...word];
  const ids: string[] = [];
  for (let i = 0; i < chars.length; i++) {
    const c = chars[i]!;
    const next = chars[i + 1];
    if (next && (SMALL_Y.has(next) || SMALL_X.has(next))) {
      const pair = KANA_BY_CHAR[c + next];
      if (pair) {
        ids.push(pair.id);
        i++;
        continue;
      }
    }
    const k = KANA_BY_CHAR[c];
    if (k) ids.push(k.id);
  }
  return [...new Set(ids)];
}
