import { toJapaneseReading, toPriceReading, randomPrice } from '@/content/numbers';

const strip = (s: string) => s.replace(/\s/g, '');

// Every case from spec §10.6.
const CASES: [number, string][] = [
  [1, 'いち'], [2, 'に'], [3, 'さん'], [4, 'よん'], [5, 'ご'], [6, 'ろく'], [7, 'なな'], [8, 'はち'], [9, 'きゅう'], [10, 'じゅう'],
  [11, 'じゅういち'],
  [20, 'にじゅう'],
  [35, 'さんじゅうご'],
  [100, 'ひゃく'],
  [300, 'さんびゃく'],
  [600, 'ろっぴゃく'],
  [800, 'はっぴゃく'],
  [1000, 'せん'],
  [3000, 'さんぜん'],
  [8000, 'はっせん'],
  [10000, 'いちまん'],
  [15000, 'いちまん ごせん'],
  [150, 'ひゃくごじゅう'],
  [380, 'さんびゃくはちじゅう'],
  [1200, 'せんにひゃく'],
  [2600, 'にせんろっぴゃく'],
  [7800, 'ななせんはっぴゃく'],
  [12800, 'いちまんにせんはっぴゃく'],
];

describe('toJapaneseReading', () => {
  it.each(CASES)('%i → %s', (n, kana) => {
    expect(strip(toJapaneseReading(n).kana)).toBe(strip(kana));
  });

  it('gives romaji too', () => {
    expect(toJapaneseReading(2600).romaji).toBe('nisenroppyaku');
    expect(toJapaneseReading(15000).romaji).toBe('ichiman gosen');
  });

  it('adds えん for prices', () => {
    expect(toPriceReading(380).kana).toBe('さんびゃくはちじゅうえん');
  });

  it('rejects out-of-range values', () => {
    expect(() => toJapaneseReading(100000)).toThrow();
    expect(() => toJapaneseReading(-1)).toThrow();
  });

  it('generates realistic prices', () => {
    let x = 0.123;
    const rnd = () => (x = (x * 9301 + 49297) % 233280) / 233280;
    for (let i = 0; i < 200; i++) {
      const k = randomPrice('konbini', rnd);
      expect(k).toBeGreaterThanOrEqual(100);
      expect(k).toBeLessThanOrEqual(3000);
      expect(k % 10).toBe(0);
      const s = randomPrice('shop', rnd);
      expect(s).toBeGreaterThanOrEqual(1000);
      expect(s).toBeLessThanOrEqual(30000);
      expect(s % 100).toBe(0);
    }
  });
});
