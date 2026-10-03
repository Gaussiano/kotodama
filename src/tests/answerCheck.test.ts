import { checkTyped, levenshtein, normalizeAnswer } from '@/domain/answerCheck';

describe('normalizeAnswer (spec §7.3)', () => {
  it('lowercases, trims, strips spaces and punctuation', () => {
    expect(normalizeAnswer('  Arigatō Gozaimasu! ')).toBe('arigatogozaimasu');
    expect(normalizeAnswer('sumimasen、')).toBe('sumimasen');
  });
  it('converts kana to romaji before comparing', () => {
    expect(normalizeAnswer('ありがとうございます')).toBe(normalizeAnswer('arigatou gozaimasu'));
    expect(normalizeAnswer('すみません')).toBe('sumimasen');
  });
  it('treats long vowels as equivalent', () => {
    expect(normalizeAnswer('arigatō')).toBe(normalizeAnswer('arigatou'));
    expect(normalizeAnswer('arigatoo')).toBe(normalizeAnswer('arigato'));
    expect(normalizeAnswer('kyū')).toBe(normalizeAnswer('kyuu'));
    expect(normalizeAnswer('kyū')).toBe(normalizeAnswer('kyu'));
  });
  it('accepts particle spellings', () => {
    expect(normalizeAnswer('kore wo kudasai')).toBe(normalizeAnswer('kore o kudasai'));
    expect(checkTyped('watashi ha Alex desu', 'watashi wa Alex desu')).toBe('exact');
    expect(checkTyped('kochira he douzo', 'kochira e dōzo')).toBe('exact');
  });
  it("treats n' and kunrei spellings as equivalent", () => {
    expect(normalizeAnswer("kon'nichiwa")).toBe(normalizeAnswer('konnichiwa'));
    expect(normalizeAnswer('tusuki')).toBe(normalizeAnswer('tsusuki'));
    expect(normalizeAnswer('sitsurei')).toBe(normalizeAnswer('shitsurei'));
    expect(normalizeAnswer('tikatetu')).toBe(normalizeAnswer('chikatetsu'));
    expect(normalizeAnswer('huku')).toBe(normalizeAnswer('fuku'));
  });
});

describe('checkTyped', () => {
  it('exact / near / wrong', () => {
    expect(checkTyped('onegaishimasu', 'onegai shimasu')).toBe('exact');
    expect(checkTyped('onegaishimasu', 'おねがいします')).toBe('exact');
    expect(checkTyped('onegaishimas', 'onegai shimasu')).toBe('near'); // one typo, ≥ 6 chars
    expect(checkTyped('hal', 'hai')).toBe('wrong'); // short answers get no tolerance
    expect(checkTyped('kudasai', 'onegai shimasu')).toBe('wrong');
    expect(checkTyped('', 'hai')).toBe('wrong');
  });
  it('accepts alternatives', () => {
    expect(checkTyped('doumo', 'dōmo', ['arigatō'])).toBe('exact');
    expect(checkTyped('arigatou', 'dōmo', ['arigatō'])).toBe('exact');
  });
});

describe('levenshtein', () => {
  it('computes edit distance', () => {
    expect(levenshtein('kitten', 'sitting')).toBe(3);
    expect(levenshtein('', 'abc')).toBe(3);
    expect(levenshtein('abc', 'abc')).toBe(0);
  });
});
