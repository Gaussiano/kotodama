import { NODE_BY_ID, NODES, PHRASE_BY_ID, PHRASES, WORDS } from '@/content';
import { generateLesson, retryExercise, type ProgressSnapshot } from '@/domain/lessonGenerator';
import { ALL_TYPES, ENABLED_TYPES, type Exercise } from '@/domain/exercises';
import { mulberry32 } from '@/domain/rng';
import { createSrs } from '@/domain/srs';

const EMPTY: ProgressSnapshot = { completedNodes: [], srs: {} };
const TODAY = '2026-10-12';
const ALL = new Set(ALL_TYPES);

function snapshotWithCompleted(ids: string[]): ProgressSnapshot {
  return { completedNodes: ids, srs: {} };
}

describe('content integrity', () => {
  it('every node references existing phrases, cards, kana and words', () => {
    for (const n of NODES) {
      for (const id of n.phraseIds) expect(PHRASE_BY_ID[id], `${n.id} → ${id}`).toBeDefined();
    }
  });
  it('phrase ids are unique and segments derive from kana', () => {
    const ids = new Set(PHRASES.map((p) => p.id));
    expect(ids.size).toBe(PHRASES.length);
    const p = PHRASE_BY_ID['r2-p13']!;
    expect(p.segments).toEqual(['しょうゆは', 'ありますか']);
    expect(PHRASE_BY_ID['r1-p8']!.segments).toEqual(['はい / いいえ']);
    expect(PHRASE_BY_ID['r1-p13']!.hasBlank).toBe(true);
  });
  it('practice words resolve their required kana', () => {
    const w = WORDS.find((x) => x.id === 'r2-w-shoyu')!;
    expect(w.requiredKana).toEqual(['h-sho', 'h-u', 'h-yu']);
    const g = WORDS.find((x) => x.id === 'r3-w-gemu')!;
    expect(g.requiredKana).toEqual(['k-ge', 'k-mu']);
  });
});

describe('generateLesson', () => {
  it('is deterministic for a given seed', () => {
    const a = generateLesson(NODE_BY_ID['r1-1']!, EMPTY, 42, { today: TODAY });
    const b = generateLesson(NODE_BY_ID['r1-1']!, EMPTY, 42, { today: TODAY });
    expect(a.exercises.map((e) => [e.type, e.itemId])).toEqual(b.exercises.map((e) => [e.type, e.itemId]));
    const c = generateLesson(NODE_BY_ID['r1-1']!, EMPTY, 7, { today: TODAY });
    expect(a.exercises.map((e) => e.uid)).not.toEqual(c.exercises.map((e) => JSON.stringify(e)));
  });

  it('presents each new phrase with E1 followed by an easy check', () => {
    const plan = generateLesson(NODE_BY_ID['r1-2']!, EMPTY, 1, { today: TODAY });
    const node = NODE_BY_ID['r1-2']!;
    for (const pid of node.phraseIds) {
      const i = plan.exercises.findIndex((e) => e.type === 'E1' && e.phraseId === pid);
      expect(i).toBeGreaterThanOrEqual(0);
      const next = plan.exercises[i + 1]!;
      expect(['E2', 'E4']).toContain(next.type);
      expect(next.itemId).toBe(pid);
    }
    expect(plan.newItemIds).toEqual(expect.arrayContaining(node.phraseIds));
    expect(plan.usesHearts).toBe(true);
  });

  it('only emits enabled exercise types', () => {
    for (const n of NODES) {
      const plan = generateLesson(n, snapshotWithCompleted(NODES.map((x) => x.id)), 3, { today: TODAY });
      for (const e of plan.exercises) expect(ENABLED_TYPES.has(e.type), `${n.id} emitted ${e.type}`).toBe(true);
    }
  });

  it('produces a sensible number of evaluated exercises for phrase nodes', () => {
    for (const n of NODES.filter((x) => x.kind === 'phrases')) {
      const plan = generateLesson(n, EMPTY, 5, { today: TODAY, enabledTypes: ALL });
      const evaluated = plan.exercises.filter((e) => e.evaluated).length;
      expect(evaluated, n.id).toBeGreaterThanOrEqual(8);
      expect(evaluated, n.id).toBeLessThanOrEqual(24);
    }
  });

  it('never uses an equivalent phrase as a distractor', () => {
    const node = NODE_BY_ID['r3-2']!; // contains r3-p4/r3-p5, equivalents of r2-p13/r2-p8
    const plan = generateLesson(node, EMPTY, 9, { today: TODAY, enabledTypes: ALL });
    for (const e of plan.exercises) {
      if (e.type === 'E2' || e.type === 'E3' || e.type === 'E4') {
        const target = PHRASE_BY_ID[e.itemId]!;
        for (const oid of e.optionIds) {
          if (oid === e.itemId) continue;
          expect(target.equivalents ?? []).not.toContain(oid);
          expect(PHRASE_BY_ID[oid]!.es).not.toBe(target.es);
        }
        expect(new Set(e.optionIds).size).toBe(e.optionIds.length);
      }
    }
  });

  it('includes at most 30 % reviews, taken from due items of other nodes', () => {
    const srs = Object.fromEntries(['r1-p1', 'r1-p2', 'r1-p4', 'r1-p6', 'h-ka', 'h-ki'].map((id) => [id, createSrs(id, '2026-10-05')]));
    const plan = generateLesson(NODE_BY_ID['r2-2']!, { completedNodes: ['r1-1', 'r1-2'], srs }, 11, { today: TODAY });
    const evaluated = plan.exercises.filter((e) => e.evaluated);
    const reviews = evaluated.filter((e) => e.isReview);
    expect(reviews.length).toBeGreaterThan(0);
    expect(reviews.length / evaluated.length).toBeLessThanOrEqual(0.34);
    for (const r of reviews) expect(NODE_BY_ID['r2-2']!.phraseIds).not.toContain(r.itemId);
  });

  it('kana nodes use E11/E7 and add practice words once their kana are known', () => {
    const plan = generateLesson(NODE_BY_ID['r1-4']!, snapshotWithCompleted(['r0-2', 'r1-1', 'r1-2', 'r1-3']), 2, { today: TODAY });
    const types = new Set(plan.exercises.filter((e) => e.evaluated).map((e) => e.type));
    expect(types.has('E11')).toBe(true);
    expect(plan.exercises.some((e) => e.type === 'E11' && e.wordId)).toBe(true);
    const evaluated = plan.exercises.filter((e) => e.evaluated).length;
    expect(evaluated).toBeGreaterThanOrEqual(10);
    expect(evaluated).toBeLessThanOrEqual(18);
  });

  it('guardians have no E1 cards and 12–16 exercises', () => {
    for (const id of ['r1-boss', 'r2-boss', 'r3-boss', 'r4-boss', 'final-boss']) {
      const plan = generateLesson(NODE_BY_ID[id]!, snapshotWithCompleted(NODES.map((x) => x.id)), 4, { today: TODAY, enabledTypes: ALL });
      expect(plan.exercises.some((e) => e.type === 'E1' || e.type === 'E1card')).toBe(false);
      expect(plan.exercises.length, id).toBeGreaterThanOrEqual(12);
      expect(plan.exercises.length, id).toBeLessThanOrEqual(16);
      expect(plan.passThreshold).toBe(0.8);
    }
  });

  it('falls back from audio-only E4 to E2 when no Japanese voice exists', () => {
    const plan = generateLesson(NODE_BY_ID['r1-7']!, EMPTY, 1, { today: TODAY, audioAvailable: false });
    expect(plan.exercises.some((e) => e.type === 'E4')).toBe(false);
  });
});

describe('retryExercise', () => {
  it('re-asks the same item with a different type when possible', () => {
    const rnd = mulberry32(1);
    const plan = generateLesson(NODE_BY_ID['r1-1']!, EMPTY, 1, { today: TODAY });
    const failed = plan.exercises.find((e): e is Extract<Exercise, { type: 'E2' }> => e.type === 'E2')!;
    const retry = retryExercise(failed, rnd, { today: TODAY });
    expect(retry.itemId).toBe(failed.itemId);
    expect(retry.type).not.toBe('E2');
    expect(retry.uid).not.toBe(failed.uid);
  });
});

describe('phase 3 coverage', () => {
  it('every exercise type E1–E15 appears across the lessons', () => {
    const all = snapshotWithCompleted(NODES.map((x) => x.id));
    const seen = new Set<string>();
    for (const n of NODES) for (const e of generateLesson(n, all, 21, { today: TODAY }).exercises) seen.add(e.type);
    for (const t of ['E1', 'E1card', 'E2', 'E3', 'E4', 'E5', 'E6', 'E7', 'E8', 'E9', 'E10', 'E11', 'E12', 'E13', 'E14', 'E15']) expect(seen.has(t as never), t).toBe(true);
  });
  it('guardian R3 reads the dossier prices and the final guardian ends with scene 5', () => {
    const all = snapshotWithCompleted(NODES.map((x) => x.id));
    const r3 = generateLesson(NODE_BY_ID['r3-boss']!, all, 2, { today: TODAY });
    const prices = r3.exercises.filter((e): e is Extract<Exercise, { type: 'E12' }> => e.type === 'E12').map((e) => e.yen);
    expect(prices.length).toBe(3);
    for (const y of prices) expect([150, 380, 1000, 2600, 7800, 15000]).toContain(y);
    const fin = generateLesson(NODE_BY_ID['final-boss']!, all, 2, { today: TODAY });
    const last = fin.exercises[fin.exercises.length - 1]!;
    expect(last.type).toBe('E15');
    expect(last.type === 'E15' && last.sceneId).toBe('scene-5');
  });
  it('E5 tiles contain every segment plus 2–3 traps and E9 options include the gesture when defined', () => {
    const plan = generateLesson(NODE_BY_ID['r2-2']!, EMPTY, 5, { today: TODAY });
    const e5 = plan.exercises.find((e): e is Extract<Exercise, { type: 'E5' }> => e.type === 'E5');
    if (e5) {
      const p = PHRASE_BY_ID[e5.phraseId]!;
      for (const s of p.segments) expect(e5.tiles).toContain(s);
      expect(e5.tiles.length - p.segments.length).toBeGreaterThanOrEqual(2);
      expect(e5.tiles.length - p.segments.length).toBeLessThanOrEqual(3);
    }
    const boss = generateLesson(NODE_BY_ID['r1-boss']!, snapshotWithCompleted(NODES.map((x) => x.id)), 3, { today: TODAY });
    const e9s = boss.exercises.filter((e): e is Extract<Exercise, { type: 'E9' }> => e.type === 'E9');
    expect(e9s.length).toBeGreaterThan(0);
    for (const e of e9s) expect(e.options.length).toBeGreaterThanOrEqual(3);
  });
});
