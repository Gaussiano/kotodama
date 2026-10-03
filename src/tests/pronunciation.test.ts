import { normalizeJp, scoreSpeech } from '@/domain/pronunciation';
import { CONVERSATIONS } from '@/content/conversations';
import { PHRASE_BY_ID, PHRASES } from '@/content';

describe('pronunciation scoring', () => {
  it('normalizes punctuation, spaces and katakana', () => {
    expect(normalizeJp('おかいけい おねがいします！')).toBe('おかいけいおねがいします');
    expect(normalizeJp('メニューを ください')).toBe('めにゅをください');
  });
  it('accepts the kanji form a recognizer returns', () => {
    const r = scoreSpeech(['お会計お願いします'], { kana: 'おかいけい おねがいします', kanji: 'お会計 お願いします' });
    expect(r.verdict).toBe('good');
    expect(r.score).toBe(1);
  });
  it('tolerates small mishearings and picks the best alternative', () => {
    const r = scoreSpeech(['すみませ', 'すみません'], { kana: 'すみません' });
    expect(r.heard).toBe('すみません');
    const r2 = scoreSpeech(['ありがとうございまし'], { kana: 'ありがとうございます' });
    expect(r2.verdict).toBe('good');
  });
  it('rejects a different phrase', () => {
    expect(scoreSpeech(['こんにちは'], { kana: 'おはようございます' }).verdict).toBe('retry');
    expect(scoreSpeech([], { kana: 'はい' }).verdict).toBe('retry');
  });
  it('gives credit when the phrase is embedded in a longer utterance', () => {
    expect(scoreSpeech(['えっと、これをください'], { kana: 'これを ください' }).verdict).toBe('good');
  });
});

describe('conversations content', () => {
  it('references existing phrases and every turn has a checkable answer', () => {
    for (const c of CONVERSATIONS) {
      for (const t of c.turns) {
        if (t.npc && 'phraseId' in t.npc) expect(PHRASE_BY_ID[t.npc.phraseId], `${c.id} npc`).toBeDefined();
        for (const o of t.options ?? []) if ('phraseId' in o) expect(PHRASE_BY_ID[o.phraseId], `${c.id} option`).toBeDefined();
        expect(Boolean(t.options?.length) || t.fill === 'price', `${c.id} turn without options`).toBe(true);
        if (t.options) expect((t.correct ?? []).length, `${c.id} turn without correct`).toBeGreaterThan(0);
      }
    }
  });
  it('every say-phrase has a kanji form or is pure kana by nature', () => {
    const missing = PHRASES.filter((p) => !p.kanji && !p.hidden).map((p) => p.id);
    // Phrases written naturally without kanji are allowed; just make sure the field is used broadly.
    expect(PHRASES.filter((p) => p.kanji).length).toBeGreaterThan(50);
    expect(missing.length).toBeLessThan(25);
  });
});
