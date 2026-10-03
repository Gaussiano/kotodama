import { addDays, diffDays, type DayKey } from './dates';

// Streak (spec §5): +1 per natural day with ≥ 1 lesson or review; a freeze amulet every 7 days
// (max 2) saves one missed day automatically.

export interface Streak {
  current: number;
  best: number;
  lastActiveDay: DayKey | '';
  freezes: number;
}

export const EMPTY_STREAK: Streak = { current: 0, best: 0, lastActiveDay: '', freezes: 0 };

export interface StreakUpdate {
  streak: Streak;
  /** True when this call started a new day of streak (results screen animates it). */
  extended: boolean;
  /** True when a freeze was consumed to bridge a gap. */
  usedFreeze: boolean;
  /** True when the streak was lost. */
  lost: boolean;
}

/** Called when the user completes a lesson or review on `today`. */
export function updateStreak(s: Streak, today: DayKey): StreakUpdate {
  if (s.lastActiveDay === today) return { streak: s, extended: false, usedFreeze: false, lost: false };

  let current = s.current;
  let freezes = s.freezes;
  let usedFreeze = false;
  let lost = false;

  if (s.lastActiveDay === '') {
    current = 1;
  } else {
    const gap = diffDays(s.lastActiveDay, today); // 1 = consecutive day
    if (gap === 1) current += 1;
    else if (gap === 2 && freezes > 0) {
      freezes -= 1;
      usedFreeze = true;
      current += 1;
    } else {
      lost = current > 0;
      current = 1;
    }
  }
  // Earn an amulet every 7 days of streak (max 2).
  if (current > 0 && current % 7 === 0) freezes = Math.min(2, freezes + 1);

  const streak: Streak = { current, best: Math.max(s.best, current), lastActiveDay: today, freezes };
  return { streak, extended: true, usedFreeze, lost };
}

/** Streak value to display today without activity yet (a missed day with no freeze shows 0). */
export function effectiveStreak(s: Streak, today: DayKey): number {
  if (!s.lastActiveDay) return 0;
  const gap = diffDays(s.lastActiveDay, today);
  if (gap <= 1) return s.current;
  if (gap === 2 && s.freezes > 0) return s.current;
  return 0;
}

export const yesterday = (today: DayKey) => addDays(today, -1);
