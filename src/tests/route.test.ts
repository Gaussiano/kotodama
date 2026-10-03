import { KANJI, NODE_BY_ID, NODES, PHRASE_BY_ID } from '@/content';
import { generateLesson, generateListening } from '@/domain/lessonGenerator';
import { nodeStatus } from '@/domain/unlock';
import { daysBehind, todayNode } from '@/domain/calendar';
import type { Exercise } from '@/domain/exercises';

const TODAY = '2026-10-20';
const ALL_DONE = { completedNodes: NODES.map((n) => n.id), srs: {} };

describe('«Tu ruta» region', () => {
  it('opens only after the R2 guardian and never affects the plan calendar', () => {
    const before = { completedNodes: [], passedBosses: ['r1' as const] };
    const after = { completedNodes: [], passedBosses: ['r1' as const, 'r2' as const] };
    expect(nodeStatus(NODE_BY_ID['r5-1']!, before)).toBe('locked');
    expect(nodeStatus(NODE_BY_ID['r5-1']!, after)).toBe('available');
    expect(nodeStatus(NODE_BY_ID['r5-2']!, after)).toBe('locked');
    const mainDone = NODES.filter((n) => !n.extra).map((n) => n.id);
    expect(daysBehind('2026-11-01', { completedNodes: mainDone, passedBosses: ['r1', 'r2', 'r3', 'r4'] })).toBe(0);
    expect(todayNode('2026-10-20', after)?.regionId).not.toBe('r5');
  });
  it('adds 35 kanji in four groups, all generated phrases flagged for review', () => {
    expect(KANJI.filter((k) => k.group !== 'base').length).toBe(35);
    for (const id of ['r5-i1', 'r5-p8', 'r5-h3']) expect(PHRASE_BY_ID[id]!.generated).toBe(true);
  });
  it('sign lessons drill every kanji with same-group distractors and put them into SRS', () => {
    const plan = generateLesson(NODE_BY_ID['r5-3']!, ALL_DONE, 3, { today: TODAY });
    const e14 = plan.exercises.filter((e): e is Extract<Exercise, { type: 'E14' }> => e.type === 'E14');
    const ids = NODE_BY_ID['r5-3']!.kanjiIds!;
    for (const id of ids) expect(e14.some((e) => e.kanjiId === id)).toBe(true);
    for (const e of e14) expect(e.optionIds.filter((o) => KANJI.find((k) => k.id === o)!.group === 'menu').length).toBeGreaterThanOrEqual(3);
    expect(plan.newItemIds).toEqual(ids);
    expect(plan.exercises.some((e) => e.type === 'E7' && e.mode === 'kanji')).toBe(true);
  });
  it('fast listening rises in speed and never repeats a meaning among options', () => {
    const plan = generateListening([1, 2, 3], 5, { today: TODAY });
    const e16 = plan.exercises.filter((e): e is Extract<Exercise, { type: 'E16' }> => e.type === 'E16');
    expect(e16.length).toBe(12);
    expect(e16[0]!.rate).toBeLessThan(e16[e16.length - 1]!.rate);
    for (const e of e16) {
      const es = e.options.map((o) => (o.fill ? PHRASE_BY_ID[o.phraseId]!.es.replace(/＿+/g, o.fill.es) : PHRASE_BY_ID[o.phraseId]!.es));
      expect(new Set(es).size).toBe(es.length);
      expect(e.options.length).toBe(4);
    }
    const noVoice = generateListening([2], 5, { today: TODAY, audioAvailable: false });
    expect(noVoice.exercises.every((e) => e.type === 'E16' && e.textOnly)).toBe(true);
  });
  it('the route guardian mixes phrases, signs and listening', () => {
    const plan = generateLesson(NODE_BY_ID['r5-boss']!, ALL_DONE, 8, { today: TODAY });
    const types = new Set(plan.exercises.map((e) => e.type));
    expect(types.has('E14')).toBe(true);
    expect(types.has('E16')).toBe(true);
    expect(plan.exercises.length).toBeGreaterThanOrEqual(12);
    expect(plan.passThreshold).toBe(0.8);
  });
});
