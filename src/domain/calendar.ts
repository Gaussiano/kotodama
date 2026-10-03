import { MAIN_NODES as NODES, PLAN, type LessonNode } from '@/content';
import { diffDays, type DayKey } from './dates';
import { nodeStatus, type UnlockSnapshot } from './unlock';

// Plan calendar (spec §9): «Hoy toca» marker and the behind-schedule nudge. Never blocks by date.

/** The node recommended for today: today's first incomplete node, else the latest node dated ≤ today. */
export function todayNode(today: DayKey, s: UnlockSnapshot): LessonNode | undefined {
  if (today < PLAN.trainingStart) return NODES[0];
  const todays = NODES.filter((n) => n.recommendedDate === today);
  const firstIncomplete = todays.find((n) => nodeStatus(n, s) !== 'completed');
  if (firstIncomplete) return firstIncomplete;
  if (todays.length) return todays[todays.length - 1];
  const before = NODES.filter((n) => n.recommendedDate <= today);
  return before[before.length - 1];
}

/** Days behind the plan: distance from the first incomplete node's date to today (0 when on track). */
export function daysBehind(today: DayKey, s: UnlockSnapshot): number {
  const firstIncomplete = NODES.find((n) => nodeStatus(n, s) !== 'completed');
  if (!firstIncomplete) return 0;
  return Math.max(0, diffDays(firstIncomplete.recommendedDate, today));
}

export const isTravelPeriod = (today: DayKey) => today >= PLAN.tripStart && today <= PLAN.tripEnd;

export const daysToJapan = (today: DayKey) => diffDays(today, PLAN.tripStart);
