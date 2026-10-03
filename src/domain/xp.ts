// Mana (XP) rules (spec §5).

export const XP = {
  lesson: 10,
  perfectBonus: 5,
  reviewCorrect: 1,
  boss: 30,
  kanaQuick: 1,
} as const;

export interface XpInput {
  kind: 'lesson' | 'boss' | 'finalBoss' | 'review' | 'quick';
  perfect: boolean;
  reviewCorrect: number;
  passed: boolean;
}

export function computeXp(i: XpInput): number {
  switch (i.kind) {
    case 'lesson':
      return XP.lesson + (i.perfect ? XP.perfectBonus : 0) + i.reviewCorrect * XP.reviewCorrect;
    case 'boss':
    case 'finalBoss':
      return i.passed ? XP.boss + (i.perfect ? XP.perfectBonus : 0) : i.reviewCorrect * XP.reviewCorrect;
    case 'review':
      return i.reviewCorrect * XP.reviewCorrect;
    case 'quick':
      return i.reviewCorrect * XP.kanaQuick;
  }
}
