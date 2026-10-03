import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { RegionId } from '@/content';
import { localDayKey, type DayKey } from '@/domain/dates';
import { createSrs, scheduleNext, type SrsState } from '@/domain/srs';
import { gainHeart, loseHeart, MAX_HEARTS, regenHearts, type Hearts } from '@/domain/hearts';
import { EMPTY_STREAK, updateStreak, type Streak } from '@/domain/streak';
import { evaluateAchievements } from '@/domain/achievements';
import { nodesOfRegion } from '@/content';

export interface LessonOutcome {
  nodeId: string;
  kind: 'lesson' | 'boss' | 'finalBoss' | 'review' | 'quick';
  /** Every SRS item presented (new or review) with whether it was ever failed in the session. */
  items: Record<string, { failed: boolean; isNew: boolean }>;
  /** Items the lesson introduced (go to box 1 if not already tracked). */
  newItemIds: string[];
  xp: number;
  perfect: boolean;
  accuracy: number; // 0..1
  passed: boolean; // bosses: ≥ threshold; lessons: always true
  durationSec: number;
  regionId: RegionId;
  /** Items answered correctly in a review session (promoted individually). */
  reviewedCorrect?: string[];
  reviewedWrong?: string[];
  usedHint?: boolean;
  /** Phrases said aloud (E10): +1 mana each, once per phrase and day. */
  spokenItems?: string[];
}

export interface Progress {
  version: number;
  xpTotal: number;
  xpByDay: Record<DayKey, number>;
  streak: Streak;
  hearts: Hearts;
  completedNodes: string[];
  passedBosses: RegionId[];
  srs: Record<string, SrsState>;
  favorites: string[];
  filledBlanks: Record<string, string>;
  achievements: Record<string, string>; // id → ISO date
  mistakesLog: { itemId: string; at: string }[];
  lastExportAt: string | null;
  /** Count of review exercises answered correctly ever (achievement «100 frases repasadas»). */
  reviewedCount: number;
  lessonsCompleted: number;
  spokenByDay: Record<DayKey, string[]>;
}

export interface ProgressStore extends Progress {
  // lesson lifecycle
  presentItems: (itemIds: string[], today?: DayKey) => void;
  finishLesson: (outcome: LessonOutcome, now?: Date) => { streakExtended: boolean; usedFreeze: boolean; newAchievements: string[] };
  // hearts
  hearts: Hearts;
  loseHeart: (now?: Date) => void;
  gainHeart: (n?: number, now?: Date) => void;
  currentHearts: (now?: Date) => number;
  // misc
  toggleFavorite: (phraseId: string) => void;
  setBlank: (phraseId: string, value: string) => void;
  setLastExport: (iso: string) => void;
  importProgress: (p: Progress) => void;
  reset: () => void;
  unlockAchievement: (id: string, at?: string) => void;
  /** «Saltar con un examen»: the guardian was passed directly, so the whole region counts as completed. */
  markRegionComplete: (regionId: RegionId) => void;
  /** Evaluates and stores any newly earned achievements; returns their ids. */
  checkAchievements: (ctx?: { now?: Date; lesson?: LessonOutcome }) => string[];
}

export const EMPTY_PROGRESS: Progress = {
  version: 1,
  xpTotal: 0,
  xpByDay: {},
  streak: EMPTY_STREAK,
  hearts: { count: MAX_HEARTS, updatedAt: new Date(0).toISOString() },
  completedNodes: [],
  passedBosses: [],
  srs: {},
  favorites: [],
  filledBlanks: {},
  achievements: {},
  mistakesLog: [],
  lastExportAt: null,
  reviewedCount: 0,
  lessonsCompleted: 0,
  spokenByDay: {},
};

const PROGRESS_KEYS = Object.keys(EMPTY_PROGRESS) as (keyof Progress)[];

export const useProgressStore = create<ProgressStore>()(
  persist(
    (set, get) => ({
      ...EMPTY_PROGRESS,

      presentItems: (itemIds, today = localDayKey()) =>
        set((s) => {
          const srs = { ...s.srs };
          for (const id of itemIds) if (!srs[id]) srs[id] = createSrs(id, today);
          return { srs };
        }),

      finishLesson: (o, now = new Date()) => {
        const today = localDayKey(now);
        const s = get();
        const srs = { ...s.srs };
        for (const id of o.newItemIds) if (!srs[id]) srs[id] = createSrs(id, today);
        // Lesson rule: an item moves at most one box per lesson (see CLAUDE.md).
        for (const [id, r] of Object.entries(o.items)) {
          const cur = srs[id] ?? createSrs(id, today);
          srs[id] = r.failed ? scheduleNext(cur, false, today) : r.isNew ? scheduleNext(cur, true, today) : cur.due <= today ? scheduleNext(cur, true, today) : cur;
        }
        // Review sessions: per-answer promotion.
        for (const id of o.reviewedCorrect ?? []) srs[id] = scheduleNext(srs[id] ?? createSrs(id, today), true, today);
        for (const id of o.reviewedWrong ?? []) srs[id] = scheduleNext(srs[id] ?? createSrs(id, today), false, today);

        const mistakes = [...s.mistakesLog, ...Object.entries(o.items).filter(([, r]) => r.failed).map(([itemId]) => ({ itemId, at: now.toISOString() })), ...(o.reviewedWrong ?? []).map((itemId) => ({ itemId, at: now.toISOString() }))].slice(-500);

        const completedNodes = o.passed && o.kind !== 'review' && o.kind !== 'quick' && !s.completedNodes.includes(o.nodeId) ? [...s.completedNodes, o.nodeId] : s.completedNodes;
        const passedBosses = o.passed && o.kind === 'boss' && !s.passedBosses.includes(o.regionId) ? [...s.passedBosses, o.regionId] : s.passedBosses;

        const streakRes = o.kind === 'quick' ? { streak: s.streak, extended: false, usedFreeze: false, lost: false } : updateStreak(s.streak, today);
        const spokenToday = new Set(s.spokenByDay[today] ?? []);
        const newlySpoken = (o.spokenItems ?? []).filter((id) => !spokenToday.has(id));
        const xp = o.xp + newlySpoken.length;
        const spokenByDay = newlySpoken.length ? { [today]: [...spokenToday, ...newlySpoken] } : {};
        const xpByDay = { ...s.xpByDay, [today]: (s.xpByDay[today] ?? 0) + xp };
        const reviewedCount = s.reviewedCount + (o.reviewedCorrect?.length ?? 0) + Object.values(o.items).filter((r) => !r.isNew && !r.failed).length;

        set({
          srs,
          mistakesLog: mistakes,
          completedNodes,
          passedBosses,
          streak: streakRes.streak,
          xpTotal: s.xpTotal + xp,
          xpByDay,
          spokenByDay: { ...s.spokenByDay, ...spokenByDay },
          reviewedCount,
          lessonsCompleted: s.lessonsCompleted + ((o.kind === 'lesson' || o.kind === 'boss' || o.kind === 'finalBoss') && o.passed ? 1 : 0),
        });
        const newAchievements = get().checkAchievements({ now, lesson: o });
        return { streakExtended: streakRes.extended, usedFreeze: streakRes.usedFreeze, newAchievements };
      },

      markRegionComplete: (regionId) =>
        set((s) => {
          const ids = nodesOfRegion(regionId).map((n) => n.id);
          return {
            completedNodes: [...new Set([...s.completedNodes, ...ids])],
            passedBosses: s.passedBosses.includes(regionId) ? s.passedBosses : [...s.passedBosses, regionId],
          };
        }),

      checkAchievements: (ctx = {}) => {
        const now = ctx.now ?? new Date();
        const lesson = ctx.lesson ? { kind: ctx.lesson.kind, perfect: ctx.lesson.perfect, passed: ctx.lesson.passed } : undefined;
        const ids = evaluateAchievements(progressSnapshot(get()), { now, lesson });
        if (ids.length) set((s) => ({ achievements: { ...s.achievements, ...Object.fromEntries(ids.map((id) => [id, now.toISOString()])) } }));
        return ids;
      },

      loseHeart: (now = new Date()) => set((s) => ({ hearts: loseHeart(s.hearts, now) })),
      gainHeart: (n = 1, now = new Date()) => set((s) => ({ hearts: gainHeart(s.hearts, now, n) })),
      currentHearts: (now = new Date()) => regenHearts(get().hearts, now).count,

      toggleFavorite: (id) => set((s) => ({ favorites: s.favorites.includes(id) ? s.favorites.filter((x) => x !== id) : [...s.favorites, id] })),
      setBlank: (id, value) => set((s) => ({ filledBlanks: { ...s.filledBlanks, [id]: value } })),
      setLastExport: (iso) => set({ lastExportAt: iso }),
      unlockAchievement: (id, at = new Date().toISOString()) => set((s) => (s.achievements[id] ? {} : { achievements: { ...s.achievements, [id]: at } })),
      importProgress: (p) => set({ ...EMPTY_PROGRESS, ...p, version: EMPTY_PROGRESS.version }),
      reset: () => set({ ...EMPTY_PROGRESS, hearts: { count: MAX_HEARTS, updatedAt: new Date().toISOString() } }),
    }),
    {
      name: 'kotodama-progress',
      version: 1,
      migrate: (state) => ({ ...EMPTY_PROGRESS, ...(state as Partial<ProgressStore>) }) as ProgressStore,
      partialize: (s) => Object.fromEntries(PROGRESS_KEYS.map((k) => [k, s[k]])) as unknown as ProgressStore,
    },
  ),
);

/** Plain snapshot of the persisted fields (export, generator input). */
export function progressSnapshot(s: ProgressStore = useProgressStore.getState()): Progress {
  return Object.fromEntries(PROGRESS_KEYS.map((k) => [k, s[k]])) as unknown as Progress;
}

export function isValidProgress(x: unknown): x is Progress {
  if (!x || typeof x !== 'object') return false;
  const p = x as Record<string, unknown>;
  return typeof p.xpTotal === 'number' && Array.isArray(p.completedNodes) && typeof p.srs === 'object' && p.srs !== null && typeof p.streak === 'object';
}
