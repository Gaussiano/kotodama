import { buildVirtualPlan, parseVirtualId, recentMistakes, weakestKana } from '@/domain/sessions';
import { createSrs } from '@/domain/srs';

const TODAY = '2026-10-15';

describe('review sessions (spec §4.5, §8)', () => {
  const srs = Object.fromEntries(
    [
      ['r1-p1', 2, '2026-10-14', 0],
      ['r1-p2', 1, '2026-10-15', 3],
      ['r2-p1', 3, '2026-10-20', 0],
      ['h-ka', 1, '2026-10-10', 1],
      ['r1-w-eki', 2, '2026-10-15', 0],
    ].map(([id, box, due, lapses]) => [id, { ...createSrs(id as string, '2026-10-05'), box: box as 1, due: due as string, lapses: lapses as number }]),
  );
  const snapshot = { srs, mistakesLog: [{ itemId: 'r1-p2', at: '2026-10-14T10:00:00Z' }, { itemId: 'r2-p1', at: '2026-10-01T10:00:00Z' }, { itemId: 'r1-p2', at: '2026-10-13T10:00:00Z' }], completedNodes: ['r0-2', 'r1-1'] };

  it('parses virtual ids', () => {
    expect(parseVirtualId('review:due')?.kind).toBe('review-due');
    expect(parseVirtualId('kana:h:k,s')).toEqual({ kind: 'kana-rows', script: 'hiragana', rows: ['k', 's'] });
    expect(parseVirtualId('r1-1')).toBeNull();
  });
  it('due session takes due items ordered by lapses then age, max 15', () => {
    const r = buildVirtualPlan('review:due', snapshot, 1, { today: TODAY })!;
    expect(r.plan.reviewItemIds).toEqual(['r1-p2', 'h-ka', 'r1-p1', 'r1-w-eki']);
    expect(r.plan.usesHearts).toBe(false);
    expect(r.plan.exercises.every((e) => e.isReview)).toBe(true);
  });
  it('error session uses unique mistakes of the last 7 days, newest first', () => {
    expect(recentMistakes(snapshot, TODAY)).toEqual(['r1-p2']);
  });
  it('hearts session has 10 items, filling with not-yet-due ones', () => {
    const r = buildVirtualPlan('review:hearts', snapshot, 1, { today: TODAY })!;
    expect(r.plan.reviewItemIds.length).toBe(5); // only 5 items exist
    expect(r.plan.reviewItemIds).toContain('r2-p1');
  });
  it('kana practice builds from rows or the weakest kana', () => {
    const rows = buildVirtualPlan('kana:h:k', snapshot, 1, { today: TODAY })!;
    expect(rows.node.kanaIds).toEqual(['h-ka', 'h-ki', 'h-ku', 'h-ke', 'h-ko']);
    expect(rows.plan.exercises.length).toBeGreaterThanOrEqual(5);
    expect(weakestKana(snapshot)).toEqual(['h-ka']);
  });
});
