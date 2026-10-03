import { levenshtein } from './answerCheck';

// Pronunciation scoring: compares what the recognizer heard with the expected phrase.
// Recognizers return kanji-mixed text, so every phrase offers its kana and (when it differs) its
// natural kanji form; the best similarity across forms and alternatives wins.

const PUNCT = /[\s、。！？!?・「」『』,.…~～\-ー゛゜]/g;

/** Folds katakana to hiragana so メニュー vs めにゅー do not count as different. */
function foldKana(s: string): string {
  return [...s]
    .map((ch) => {
      const cp = ch.codePointAt(0)!;
      return cp >= 0x30a1 && cp <= 0x30f6 ? String.fromCodePoint(cp - 0x60) : ch;
    })
    .join('');
}

export function normalizeJp(s: string): string {
  return foldKana(s.replace(/＿+/g, '')).replace(PUNCT, '').toLowerCase();
}

function similarity(a: string, b: string): number {
  if (!a || !b) return 0;
  if (a === b) return 1;
  const d = levenshtein(a, b);
  const base = 1 - d / Math.max(a.length, b.length);
  // Extra words around the phrase still count as mostly right.
  if (a.includes(b) || b.includes(a)) return Math.max(base, 0.9);
  return base;
}

export interface SpeechScore {
  /** 0..1 */
  score: number;
  /** The alternative that matched best. */
  heard: string;
  verdict: 'good' | 'close' | 'retry';
}

export const GOOD = 0.72;
export const CLOSE = 0.45;

export function scoreSpeech(alternatives: string[], expected: { kana: string; kanji?: string; extra?: string[] }): SpeechScore {
  const targets = [expected.kana, expected.kanji, ...(expected.extra ?? [])].filter((x): x is string => Boolean(x)).map(normalizeJp);
  let best = { score: 0, heard: alternatives[0] ?? '' };
  for (const alt of alternatives) {
    const h = normalizeJp(alt);
    for (const t of targets) {
      const s = similarity(h, t);
      if (s > best.score) best = { score: s, heard: alt };
    }
  }
  const verdict = best.score >= GOOD ? 'good' : best.score >= CLOSE ? 'close' : 'retry';
  return { ...best, verdict };
}
