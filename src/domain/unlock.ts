import { NODES, nodesOfRegion, REGION_ORDER, type LessonNode, type RegionId } from '@/content';

// Unlock rules (spec §5): nodes in order within a region; guardian after all nodes; next region
// after beating the guardian. «Saltar con un examen» passes the guardian directly.

export interface UnlockSnapshot {
  completedNodes: string[];
  passedBosses: RegionId[];
}

export type NodeStatus = 'locked' | 'available' | 'completed';

export function isRegionOpen(regionId: RegionId, s: UnlockSnapshot): boolean {
  // «Tu ruta» is an extra region: it opens when the tavern guardian (R2) is beaten.
  if (regionId === 'r5') return s.passedBosses.includes('r2');
  const idx = REGION_ORDER.indexOf(regionId);
  if (idx <= 0) return true;
  const prev = REGION_ORDER[idx - 1]!;
  const prevNodes = nodesOfRegion(prev);
  // R0 has no guardian: it opens the next region when all its nodes are done.
  if (!prevNodes.some((n) => n.kind === 'boss')) return prevNodes.every((n) => s.completedNodes.includes(n.id));
  return s.passedBosses.includes(prev);
}

export function isUnlocked(node: LessonNode, s: UnlockSnapshot): boolean {
  if (!isRegionOpen(node.regionId, s)) return false;
  const siblings = nodesOfRegion(node.regionId);
  if (node.kind === 'boss') return siblings.filter((n) => n.kind !== 'boss' && n.kind !== 'finalBoss').every((n) => s.completedNodes.includes(n.id));
  if (node.kind === 'finalBoss') return s.passedBosses.includes('r4');
  const idx = siblings.findIndex((n) => n.id === node.id);
  if (idx <= 0) return true;
  const prev = siblings[idx - 1]!;
  return s.completedNodes.includes(prev.id);
}

export function nodeStatus(node: LessonNode, s: UnlockSnapshot): NodeStatus {
  if (node.kind === 'boss' || node.kind === 'finalBoss') {
    const passed = node.kind === 'finalBoss' ? s.completedNodes.includes(node.id) : s.passedBosses.includes(node.regionId);
    if (passed) return 'completed';
  } else if (s.completedNodes.includes(node.id)) return 'completed';
  return isUnlocked(node, s) ? 'available' : 'locked';
}

/** First available, not completed node in map order. */
export function nextAvailableNode(s: UnlockSnapshot): LessonNode | undefined {
  return NODES.find((n) => nodeStatus(n, s) === 'available');
}

export function regionProgress(regionId: RegionId, s: UnlockSnapshot): { done: number; total: number } {
  const nodes = nodesOfRegion(regionId);
  return { done: nodes.filter((n) => nodeStatus(n, s) === 'completed').length, total: nodes.length };
}
