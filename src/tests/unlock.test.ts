import { NODE_BY_ID, NODES } from '@/content';
import { isUnlocked, nextAvailableNode, nodeStatus, regionProgress } from '@/domain/unlock';
import { daysBehind, todayNode } from '@/domain/calendar';

describe('unlock rules (spec §5)', () => {
  it('starts with only the first node available', () => {
    const s = { completedNodes: [], passedBosses: [] };
    expect(nodeStatus(NODE_BY_ID['r0-1']!, s)).toBe('available');
    expect(nodeStatus(NODE_BY_ID['r0-2']!, s)).toBe('locked');
    expect(nodeStatus(NODE_BY_ID['r1-1']!, s)).toBe('locked');
  });
  it('R1 opens without a guardian in R0 (R0 has none)', () => {
    const s = { completedNodes: ['r0-1', 'r0-2'], passedBosses: [] as never[] };
    expect(isUnlocked(NODE_BY_ID['r1-1']!, s)).toBe(true);
  });
  it('guardian unlocks after all nodes; next region after the guardian', () => {
    const r1 = ['r0-1', 'r0-2', ...NODES.filter((n) => n.regionId === 'r1' && n.kind !== 'boss').map((n) => n.id)];
    const partial = { completedNodes: r1.slice(0, -1), passedBosses: [] as never[] };
    expect(nodeStatus(NODE_BY_ID['r1-boss']!, partial)).toBe('locked');
    const full = { completedNodes: r1, passedBosses: [] as never[] };
    expect(nodeStatus(NODE_BY_ID['r1-boss']!, full)).toBe('available');
    expect(nodeStatus(NODE_BY_ID['r2-1']!, full)).toBe('locked');
    const passed = { completedNodes: [...r1, 'r1-boss'], passedBosses: ['r1' as const] };
    expect(nodeStatus(NODE_BY_ID['r2-1']!, passed)).toBe('available');
    expect(nodeStatus(NODE_BY_ID['r1-boss']!, passed)).toBe('completed');
    expect(regionProgress('r1', passed)).toEqual({ done: 8, total: 8 });
    expect(nodeStatus(NODE_BY_ID['r0-2']!, passed)).toBe('completed');
  });
  it('final guardian needs the R4 guardian', () => {
    const s = { completedNodes: NODES.filter((n) => n.kind !== 'finalBoss').map((n) => n.id), passedBosses: ['r1', 'r2', 'r3'] as const };
    expect(nodeStatus(NODE_BY_ID['final-boss']!, { ...s, passedBosses: [...s.passedBosses] })).toBe('locked');
    expect(nodeStatus(NODE_BY_ID['final-boss']!, { ...s, passedBosses: [...s.passedBosses, 'r4'] })).toBe('available');
  });
  it('nextAvailableNode walks the map in order', () => {
    expect(nextAvailableNode({ completedNodes: ['r0-1'], passedBosses: [] })?.id).toBe('r0-2');
  });
});

describe('calendar (spec §9)', () => {
  const s0 = { completedNodes: [], passedBosses: [] };
  it('marks today\'s node', () => {
    expect(todayNode('2026-10-03', s0)?.id).toBe('r0-1');
    expect(todayNode('2026-10-08', s0)?.id).toBe('r1-4');
    expect(todayNode('2026-10-08', { completedNodes: ['r1-4'], passedBosses: [] })?.id).toBe('r1-5');
    expect(todayNode('2026-11-01', s0)?.id).toBe('final-boss');
    expect(todayNode('2026-09-20', s0)?.id).toBe('r0-1');
  });
  it('computes days behind from the first incomplete node', () => {
    expect(daysBehind('2026-10-03', s0)).toBe(0);
    expect(daysBehind('2026-10-07', s0)).toBe(4);
    expect(daysBehind('2026-10-07', { completedNodes: ['r0-1', 'r0-2', 'r1-1', 'r1-2'], passedBosses: [] })).toBe(0);
  });
});
