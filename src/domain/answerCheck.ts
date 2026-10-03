import { isKana, toRomaji } from 'wanakana';

// Written-answer normalization (spec §7.3).

const PUNCT = /[、。！？!?.,;:'"「」『』()（）\-–—/／]/g;

function hasKana(s: string): boolean {
  return [...s].some((ch) => isKana(ch));
}

/** Normalizes any romaji/kana input to a canonical romaji form for comparison. */
export function normalizeAnswer(input: string): string {
  let s = input.trim();
  if (hasKana(s)) s = toRomaji(s);
  s = s.toLowerCase().replace(PUNCT, '').replace(/\s+/g, '');
  // Long vowels: macrons, doubled vowels and plain vowels are equivalent.
  s = s
    .replace(/ō|ou|oo/g, 'o')
    .replace(/ū|uu/g, 'u')
    .replace(/ā|aa/g, 'a')
    .replace(/ē|ei|ee/g, 'e')
    .replace(/ī|ii/g, 'i');
  // Collapse any remaining doubled vowel produced by the replacements above (e.g. "oo" from "ōo").
  s = s.replace(/([aeiou])\1+/g, '$1');
  // Particles: は = wa/ha, を = o/wo, へ = e/he (only meaningful as standalone particles, but the
  // comparison is on a space-stripped string, so normalize the kunrei/hepburn pairs globally).
  s = s
    .replace(/wo/g, 'o')
    .replace(/n'/g, 'n')
    .replace(/tu/g, 'tsu')
    .replace(/si/g, 'shi')
    .replace(/ti/g, 'chi')
    .replace(/hu/g, 'fu')
    .replace(/zi/g, 'ji')
    .replace(/dzu/g, 'zu')
    .replace(/dji/g, 'ji');
  // tsutsu guard: "tsu" replaced from "tu" could create "tsusu"? No: "tu"→"tsu" only; fine.
  return s;
}

/** Variants accepted for the particle spellings that cannot be normalized globally (は as wa/ha, へ as e/he). */
function particleVariants(expectedRomaji: string): string[] {
  // The expected romaji is Hepburn (wa, e). Accept the kana-literal spellings (ha, he) too.
  const variants = new Set<string>([expectedRomaji]);
  const words = expectedRomaji.split(/\s+/);
  words.forEach((w, i) => {
    if (w === 'wa' || w === 'e') {
      const alt = words.slice();
      alt[i] = w === 'wa' ? 'ha' : 'he';
      variants.add(alt.join(' '));
    }
  });
  return [...variants];
}

export function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;
  let prev = Array.from({ length: n + 1 }, (_, i) => i);
  for (let i = 1; i <= m; i++) {
    const cur = [i];
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      cur[j] = Math.min(prev[j]! + 1, cur[j - 1]! + 1, prev[j - 1]! + cost);
    }
    prev = cur;
  }
  return prev[n]!;
}

export type CheckResult = 'exact' | 'near' | 'wrong';

/**
 * Compares a typed answer with the expected romaji. 'near' = one typo on an answer of ≥ 6 chars
 * («Casi perfecto»). `expected` may be romaji or kana; both are normalized.
 */
export function checkTyped(input: string, expected: string, alternatives: string[] = []): CheckResult {
  const typed = normalizeAnswer(input);
  if (!typed) return 'wrong';
  const candidates = [expected, ...alternatives].flatMap(particleVariants).map(normalizeAnswer);
  if (candidates.includes(typed)) return 'exact';
  if (typed.length >= 6 && candidates.some((c) => levenshtein(typed, c) === 1)) return 'near';
  return 'wrong';
}

/** Strips the blank marker so «＿＿ de yoyaku shite imasu» can be typed without it. */
export function stripBlank(s: string): string {
  return s.replace(/＿+/g, ' ').replace(/\s+/g, ' ').trim();
}
