import { gainHeart, loseHeart, msToNextHeart, regenHearts, MAX_HEARTS } from '@/domain/hearts';
import { effectiveStreak, EMPTY_STREAK, updateStreak } from '@/domain/streak';
import { computeXp } from '@/domain/xp';
import { evaluateAchievements } from '@/domain/achievements';
import { EMPTY_PROGRESS, useProgressStore, type Progress } from '@/store/progressStore';
import { HIRAGANA, NODES } from '@/content';
import { createSrs } from '@/domain/srs';

const t = (iso: string) => new Date(iso);

describe('hearts (spec §5)', () => {
  it('loses one per error and regenerates one every 30 minutes from timestamps', () => {
    let h = { count: MAX_HEARTS, updatedAt: t('2026-10-10T10:00:00Z').toISOString() };
    h = loseHeart(h, t('2026-10-10T10:00:00Z'));
    expect(h.count).toBe(4);
    h = loseHeart(h, t('2026-10-10T10:01:00Z'));
    expect(h.count).toBe(3);
    expect(regenHearts(h, t('2026-10-10T10:29:00Z')).count).toBe(3);
    expect(regenHearts(h, t('2026-10-10T10:30:00Z')).count).toBe(4);
    expect(regenHearts(h, t('2026-10-10T11:00:00Z')).count).toBe(5);
    expect(regenHearts(h, t('2026-10-11T11:00:00Z')).count).toBe(5);
  });
  it('never goes below 0 nor above 5 and reports time to the next heart', () => {
    let h = { count: 1, updatedAt: t('2026-10-10T10:00:00Z').toISOString() };
    h = loseHeart(h, t('2026-10-10T10:00:00Z'));
    h = loseHeart(h, t('2026-10-10T10:00:00Z'));
    expect(h.count).toBe(0);
    expect(msToNextHeart(h, t('2026-10-10T10:10:00Z'))).toBe(20 * 60 * 1000);
    expect(gainHeart(h, t('2026-10-10T10:10:00Z'), 9).count).toBe(5);
    expect(msToNextHeart({ count: 5, updatedAt: '' }, t('2026-10-10T10:10:00Z'))).toBe(0);
  });
  it('regen keeps the partial progress toward the next heart', () => {
    const h = { count: 2, updatedAt: t('2026-10-10T10:00:00Z').toISOString() };
    const later = regenHearts(h, t('2026-10-10T10:45:00Z'));
    expect(later.count).toBe(3);
    expect(later.updatedAt).toBe(t('2026-10-10T10:30:00Z').toISOString());
  });
});

describe('streak (spec §5)', () => {
  it('counts consecutive days once per day', () => {
    let r = updateStreak(EMPTY_STREAK, '2026-10-03');
    expect(r.streak.current).toBe(1);
    expect(r.extended).toBe(true);
    r = updateStreak(r.streak, '2026-10-03');
    expect(r.streak.current).toBe(1);
    expect(r.extended).toBe(false);
    r = updateStreak(r.streak, '2026-10-04');
    expect(r.streak.current).toBe(2);
  });
  it('earns an amulet every 7 days (max 2) and spends it on a missed day', () => {
    let s = EMPTY_STREAK;
    for (let d = 3; d <= 9; d++) s = updateStreak(s, `2026-10-0${d}`).streak;
    expect(s.current).toBe(7);
    expect(s.freezes).toBe(1);
    const r = updateStreak(s, '2026-10-11'); // skipped the 10th
    expect(r.usedFreeze).toBe(true);
    expect(r.streak.current).toBe(8);
    expect(r.streak.freezes).toBe(0);
    for (let d = 12; d <= 25; d++) s = updateStreak(s.lastActiveDay === `2026-10-${d - 1}` ? s : r.streak, `2026-10-${d}`).streak;
    expect(s.freezes).toBeLessThanOrEqual(2);
  });
  it('resets after a gap without amulets', () => {
    let s = updateStreak(EMPTY_STREAK, '2026-10-03').streak;
    s = updateStreak(s, '2026-10-04').streak;
    const r = updateStreak(s, '2026-10-08');
    expect(r.lost).toBe(true);
    expect(r.streak.current).toBe(1);
    expect(r.streak.best).toBe(2);
  });
  it('shows 0 today when yesterday was missed and no amulet remains', () => {
    const s = { current: 5, best: 5, lastActiveDay: '2026-10-10', freezes: 0 };
    expect(effectiveStreak(s, '2026-10-11')).toBe(5);
    expect(effectiveStreak(s, '2026-10-12')).toBe(0);
    expect(effectiveStreak({ ...s, freezes: 1 }, '2026-10-12')).toBe(5);
  });
});

describe('mana (spec §5)', () => {
  it('10 per lesson, +5 perfect, +1 per correct review, 30 per guardian, 1 per quick kana hit', () => {
    expect(computeXp({ kind: 'lesson', perfect: false, reviewCorrect: 0, passed: true })).toBe(10);
    expect(computeXp({ kind: 'lesson', perfect: true, reviewCorrect: 3, passed: true })).toBe(18);
    expect(computeXp({ kind: 'boss', perfect: false, reviewCorrect: 0, passed: true })).toBe(30);
    expect(computeXp({ kind: 'boss', perfect: false, reviewCorrect: 0, passed: false })).toBe(0);
    expect(computeXp({ kind: 'review', perfect: false, reviewCorrect: 12, passed: true })).toBe(12);
    expect(computeXp({ kind: 'quick', perfect: false, reviewCorrect: 7, passed: true })).toBe(7);
  });
});

describe('achievements (spec §5)', () => {
  const base: Progress = { ...EMPTY_PROGRESS };
  it('first spell, perfect lesson and time-of-day seals', () => {
    const p = { ...base, lessonsCompleted: 1 };
    expect(evaluateAchievements(p, { now: t('2026-10-05T23:30:00'), lesson: { kind: 'lesson', perfect: true, passed: true } })).toEqual(expect.arrayContaining(['first-spell', 'perfect', 'night-owl']));
    expect(evaluateAchievements(p, { now: t('2026-10-05T07:30:00'), lesson: { kind: 'lesson', perfect: false, passed: true } })).toEqual(['first-spell', 'early-bird']);
    expect(evaluateAchievements({ ...p, achievements: { 'first-spell': 'x' } }, { now: t('2026-10-05T12:00:00') })).toEqual([]);
  });
  it('region seals and kana seals', () => {
    const p = { ...base, completedNodes: ['r0-1', 'r0-2'], passedBosses: ['r1' as const, 'r3' as const] };
    const got = evaluateAchievements(p, { now: t('2026-10-20T12:00:00') });
    expect(got).toEqual(expect.arrayContaining(['camp', 'village', 'konbini']));
    expect(got).not.toContain('tavern');
    const srs = Object.fromEntries(HIRAGANA.map((k) => [k.id, createSrs(k.id, '2026-10-20')]));
    expect(evaluateAchievements({ ...base, srs }, { now: t('2026-10-20T12:00:00') })).toContain('hiragana');
  });
  it('ready for Japan only before the trip', () => {
    const all = { ...base, completedNodes: NODES.map((n) => n.id), passedBosses: ['r1', 'r2', 'r3', 'r4'] as const };
    expect(evaluateAchievements({ ...all, passedBosses: [...all.passedBosses] }, { now: t('2026-11-01T20:00:00') })).toContain('ready');
    expect(evaluateAchievements({ ...all, passedBosses: [...all.passedBosses] }, { now: t('2026-11-03T20:00:00') })).not.toContain('ready');
  });
});

describe('progress store integration', () => {
  beforeEach(() => useProgressStore.getState().reset());
  it('finishing a lesson completes the node, adds mana, extends the streak and schedules SRS', () => {
    const now = t('2026-10-05T18:00:00');
    const res = useProgressStore.getState().finishLesson(
      { nodeId: 'r1-1', kind: 'lesson', items: { 'r1-p1': { failed: false, isNew: true }, 'r1-p2': { failed: true, isNew: true } }, newItemIds: ['r1-p1', 'r1-p2', 'r1-p3'], xp: 10, perfect: false, accuracy: 0.8, passed: true, durationSec: 120, regionId: 'r1' },
      now,
    );
    const s = useProgressStore.getState();
    expect(s.completedNodes).toEqual(['r1-1']);
    expect(s.xpTotal).toBe(10);
    expect(s.xpByDay['2026-10-05']).toBe(10);
    expect(s.streak.current).toBe(1);
    expect(res.streakExtended).toBe(true);
    expect(s.srs['r1-p1']!.box).toBe(2);
    expect(s.srs['r1-p2']!.box).toBe(1);
    expect(s.srs['r1-p2']!.lapses).toBe(1);
    expect(s.srs['r1-p3']!.box).toBe(1);
    expect(s.mistakesLog.map((m) => m.itemId)).toEqual(['r1-p2']);
    expect(res.newAchievements).toContain('first-spell');
  });
  it('a failed guardian does not pass the region; a passed one does', () => {
    const base = { nodeId: 'r1-boss', kind: 'boss' as const, items: {}, newItemIds: [], perfect: false, durationSec: 60, regionId: 'r1' as const };
    useProgressStore.getState().finishLesson({ ...base, xp: 0, accuracy: 0.6, passed: false }, t('2026-10-11T10:00:00'));
    expect(useProgressStore.getState().passedBosses).toEqual([]);
    useProgressStore.getState().finishLesson({ ...base, xp: 30, accuracy: 0.9, passed: true }, t('2026-10-11T10:00:00'));
    expect(useProgressStore.getState().passedBosses).toEqual(['r1']);
    expect(useProgressStore.getState().completedNodes).toContain('r1-boss');
  });
  it('markRegionComplete («Saltar con un examen») completes every node of the region', () => {
    useProgressStore.getState().markRegionComplete('r1');
    const s = useProgressStore.getState();
    expect(NODES.filter((n) => n.regionId === 'r1').every((n) => s.completedNodes.includes(n.id))).toBe(true);
    expect(s.passedBosses).toContain('r1');
  });
});
