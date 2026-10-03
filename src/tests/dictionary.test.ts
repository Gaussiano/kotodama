import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { KANJI_BY_RUN, dictionaryIdsForItem, furiganaSegments, kanjiRuns } from '@/content/dictionary';
import { useProgressStore } from '@/store/progressStore';

describe('kanji readings', () => {
  it('cover every kanji run used in the content', () => {
    const root = join(__dirname, '..', '..');
    const files = ['r0.ts', 'r1.ts', 'r2.ts', 'r3.ts', 'r4.ts', 'kanji.ts', 'scenes.ts', 'conversations.ts'].map((f) => join(root, 'src/content', f));
    files.push(join(root, 'src/screens/Onboarding.tsx'));
    const missing = new Set<string>();
    for (const f of files) for (const run of kanjiRuns(readFileSync(f, 'utf8'))) if (!KANJI_BY_RUN[run]) missing.add(run);
    expect([...missing], 'kanji runs without reading').toEqual([]);
  });
  it('splits text into plain and ruby segments', () => {
    expect(furiganaSegments('お会計 お願いします')).toEqual([
      { text: 'お' },
      { text: '会計', reading: 'かいけい' },
      { text: ' お' },
      { text: '願', reading: 'ねが' },
      { text: 'いします' },
    ]);
  });
  it('maps items to dictionary ids', () => {
    expect(dictionaryIdsForItem('r2-p20')).toEqual(['k:会計']);
    expect(dictionaryIdsForItem('r1-w-eki')).toEqual(['w:r1-w-eki']);
    expect(dictionaryIdsForItem('kj-eki')).toEqual(['k:駅']);
    expect(dictionaryIdsForItem('h-ka')).toEqual([]);
  });
});

describe('dictionary collection', () => {
  beforeEach(() => useProgressStore.getState().reset());
  it('fills itself from the items seen in a lesson and keeps the first date', () => {
    const s = useProgressStore.getState();
    s.finishLesson({ nodeId: 'r2-5', kind: 'lesson', items: {}, newItemIds: ['r2-p20', 'r2-w-mizu'], xp: 10, perfect: true, accuracy: 1, passed: true, durationSec: 1, regionId: 'r2', seenItemIds: ['r2-p20', 'r2-w-mizu', 'kj-eki'] }, new Date('2026-10-16T10:00:00'));
    const d = useProgressStore.getState().dictionary;
    expect(Object.keys(d).sort()).toEqual(['k:会計', 'k:駅', 'w:r2-w-mizu']);
    useProgressStore.getState().addToDictionary(['k:会計', 'k:袋'], new Date('2026-10-20T10:00:00'));
    expect(useProgressStore.getState().dictionary['k:会計']).toBe(d['k:会計']);
    expect(useProgressStore.getState().dictionary['k:袋']).toContain('2026-10-20');
  });
});
