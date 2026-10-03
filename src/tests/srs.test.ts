import { createSrs, intervalFor, isDue, scheduleNext, sortForReview } from '@/domain/srs';

describe('SRS Leitner (spec §8)', () => {
  it('new items start in box 1, due today', () => {
    const s = createSrs('r1-p1', '2026-10-05');
    expect(s.box).toBe(1);
    expect(isDue(s, '2026-10-05')).toBe(true);
  });
  it('promotes on success with 1/3/7/14-day intervals', () => {
    let s = createSrs('x', '2026-10-05');
    s = scheduleNext(s, true, '2026-10-05');
    expect(s.box).toBe(2);
    expect(s.due).toBe('2026-10-06');
    s = scheduleNext(s, true, '2026-10-06');
    expect(s.box).toBe(3);
    expect(s.due).toBe('2026-10-09');
    s = scheduleNext(s, true, '2026-10-09');
    expect(s.box).toBe(4);
    expect(s.due).toBe('2026-10-16');
    s = scheduleNext(s, true, '2026-10-16');
    expect(s.box).toBe(5);
    expect(s.due).toBe('2026-10-30');
    s = scheduleNext(s, true, '2026-10-30');
    expect(s.box).toBe(5);
  });
  it('drops to box 1 and counts a lapse on failure', () => {
    const s = scheduleNext({ itemId: 'x', box: 4, due: '2026-10-10', lapses: 0, lastSeen: '2026-10-03' }, false, '2026-10-10');
    expect(s.box).toBe(1);
    expect(s.lapses).toBe(1);
    expect(s.due).toBe('2026-10-10');
  });
  it('halves intervals of boxes 4–5 from 26 Oct to 1 Nov', () => {
    expect(intervalFor(4, '2026-10-20')).toBe(7);
    expect(intervalFor(4, '2026-10-26')).toBe(4);
    expect(intervalFor(5, '2026-10-28')).toBe(7);
    expect(intervalFor(3, '2026-10-28')).toBe(3);
    expect(intervalFor(5, '2026-11-02')).toBe(14);
  });
  it('orders reviews by lapses, then oldest due, then current region', () => {
    const items = [
      { itemId: 'r2-p1', box: 2 as const, due: '2026-10-10', lapses: 0, lastSeen: '' },
      { itemId: 'r1-p1', box: 1 as const, due: '2026-10-11', lapses: 2, lastSeen: '' },
      { itemId: 'r1-p2', box: 2 as const, due: '2026-10-10', lapses: 0, lastSeen: '' },
      { itemId: 'r3-p1', box: 2 as const, due: '2026-10-20', lapses: 5, lastSeen: '' },
    ];
    const order = sortForReview(items, '2026-10-12', 'r2').map((s) => s.itemId);
    expect(order).toEqual(['r1-p1', 'r2-p1', 'r1-p2']);
  });
});
