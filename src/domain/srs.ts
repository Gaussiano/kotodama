import { addDays, type DayKey } from './dates';
import { PLAN } from '@/content';

// 5-box Leitner (spec §8).

export type Box = 1 | 2 | 3 | 4 | 5;

export interface SrsState {
  itemId: string;
  box: Box;
  due: DayKey;
  lapses: number;
  lastSeen: DayKey;
}

const INTERVAL_DAYS: Record<Box, number> = { 1: 0, 2: 1, 3: 3, 4: 7, 5: 14 };

/** From 26 Oct to 1 Nov boxes 4 and 5 use half intervals so everything is fresh for the trip. */
export function intervalFor(box: Box, today: DayKey): number {
  const base = INTERVAL_DAYS[box];
  const intensive = today >= PLAN.intensiveFrom && today <= PLAN.trainingEnd;
  if (intensive && box >= 4) return Math.ceil(base / 2);
  return base;
}

export function createSrs(itemId: string, today: DayKey): SrsState {
  return { itemId, box: 1, due: today, lapses: 0, lastSeen: today };
}

export function scheduleNext(state: SrsState, correct: boolean, today: DayKey): SrsState {
  if (correct) {
    const box = Math.min(5, state.box + 1) as Box;
    return { ...state, box, due: addDays(today, intervalFor(box, today)), lastSeen: today };
  }
  return { ...state, box: 1, due: today, lapses: state.lapses + 1, lastSeen: today };
}

export const isDue = (state: SrsState, today: DayKey) => state.due <= today;

/** Priority for the Repaso screen (spec §8): more lapses first, then older due, then current region. */
export function sortForReview(items: SrsState[], today: DayKey, currentRegionPrefix?: string): SrsState[] {
  return items
    .filter((s) => isDue(s, today))
    .sort((a, b) => {
      if (b.lapses !== a.lapses) return b.lapses - a.lapses;
      if (a.due !== b.due) return a.due < b.due ? -1 : 1;
      const ar = currentRegionPrefix && a.itemId.startsWith(currentRegionPrefix) ? 0 : 1;
      const br = currentRegionPrefix && b.itemId.startsWith(currentRegionPrefix) ? 0 : 1;
      return ar - br;
    });
}
