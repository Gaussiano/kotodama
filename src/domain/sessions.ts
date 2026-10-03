import { ALL_KANA, KANA_BY_ID, kanaInRows, type LessonNode } from '@/content';
import { addDays, type DayKey } from './dates';
import { generateKanaPractice, learnedKanaIds, reviewExerciseFor, itemKind, type GenOptions, type LessonPlan } from './lessonGenerator';
import { mulberry32 } from './rng';
import { isDue, sortForReview, type SrsState } from './srs';
import type { Exercise } from './exercises';

// Virtual nodes: review sessions and kana practice that run through the same lesson runner.

export type VirtualKind = 'review-due' | 'review-errors' | 'review-hearts' | 'kana-rows' | 'kana-weak';

export interface VirtualSpec {
  kind: VirtualKind;
  script?: 'hiragana' | 'katakana';
  rows?: string[];
}

export const HEARTS_SESSION_SIZE = 10;
export const REVIEW_SESSION_SIZE = 15;
export const ERROR_WINDOW_DAYS = 7;

export function parseVirtualId(id: string): VirtualSpec | null {
  if (id === 'review:due') return { kind: 'review-due' };
  if (id === 'review:errors') return { kind: 'review-errors' };
  if (id === 'review:hearts') return { kind: 'review-hearts' };
  if (id === 'kana:weak') return { kind: 'kana-weak' };
  const m = id.match(/^kana:(h|k):([a-z,-]+)$/);
  if (m) return { kind: 'kana-rows', script: m[1] === 'h' ? 'hiragana' : 'katakana', rows: m[2]!.split(',') };
  return null;
}

export function virtualNode(id: string, spec: VirtualSpec): LessonNode {
  const base = { id, regionId: 'r1' as const, phraseIds: [], kanaIds: [], infoCardIds: [], recommendedDate: '', dayLabel: '' };
  switch (spec.kind) {
    case 'review-due':
      return { ...base, title: 'Repaso', summary: 'Lo que toca repasar hoy.', kind: 'review' };
    case 'review-errors':
      return { ...base, title: 'Repaso de errores', summary: 'Lo que fallaste en los últimos 7 días.', kind: 'review' };
    case 'review-hearts':
      return { ...base, title: 'Recuperar corazones', summary: '10 repasos sin fallos devuelven un corazón.', kind: 'review' };
    case 'kana-rows':
      return { ...base, title: `Práctica de ${spec.script === 'hiragana' ? 'hiragana' : 'katakana'}`, summary: `Filas ${spec.rows!.join(', ')}.`, kind: 'kana', kanaIds: kanaInRows(spec.script!, spec.rows!) };
    case 'kana-weak':
      return { ...base, title: 'Los kana más flojos', summary: 'Los que peor llevas.', kind: 'kana' };
  }
}

export interface SessionSnapshot {
  srs: Record<string, SrsState>;
  mistakesLog: { itemId: string; at: string }[];
  completedNodes: string[];
}

export function dueItems(snapshot: SessionSnapshot, today: DayKey, currentRegionPrefix?: string): string[] {
  return sortForReview(Object.values(snapshot.srs), today, currentRegionPrefix)
    .map((s) => s.itemId)
    .filter((id) => itemKind(id) !== 'unknown');
}

export function recentMistakes(snapshot: SessionSnapshot, today: DayKey): string[] {
  const since = addDays(today, -ERROR_WINDOW_DAYS);
  const seen = new Set<string>();
  const out: string[] = [];
  for (const m of [...snapshot.mistakesLog].reverse()) {
    if (m.at.slice(0, 10) < since) continue;
    if (seen.has(m.itemId) || itemKind(m.itemId) === 'unknown') continue;
    seen.add(m.itemId);
    out.push(m.itemId);
  }
  return out;
}

/** Weakest kana among those already presented (lowest box, most lapses). */
export function weakestKana(snapshot: SessionSnapshot, n = 10): string[] {
  const seen = Object.values(snapshot.srs).filter((s) => KANA_BY_ID[s.itemId]);
  const pool = seen.length ? seen : [...learnedKanaIds(snapshot.completedNodes)].map((id) => ({ itemId: id, box: 1, lapses: 0 }));
  return [...pool]
    .sort((a, b) => a.box - b.box || b.lapses - a.lapses)
    .slice(0, n)
    .map((s) => s.itemId);
}

export function buildVirtualPlan(id: string, snapshot: SessionSnapshot, seed: number, opts: GenOptions): { node: LessonNode; plan: LessonPlan } | null {
  const spec = parseVirtualId(id);
  if (!spec) return null;
  const node = virtualNode(id, spec);
  const rnd = mulberry32(seed);
  const today = opts.today;

  const toExercises = (ids: string[]): Exercise[] =>
    ids.map((itemId, i) => reviewExerciseFor(itemId, rnd, opts, i % 3 === 2 ? 'hard' : 'easy')).filter((e): e is Exercise => e !== null);

  const reviewPlan = (ids: string[]): LessonPlan => ({
    nodeId: id,
    kind: 'review',
    exercises: toExercises(ids),
    newItemIds: [],
    reviewItemIds: ids,
    usesHearts: false,
    passThreshold: 0,
  });

  switch (spec.kind) {
    case 'review-due':
      return { node, plan: reviewPlan(dueItems(snapshot, today).slice(0, REVIEW_SESSION_SIZE)) };
    case 'review-errors':
      return { node, plan: reviewPlan(recentMistakes(snapshot, today).slice(0, REVIEW_SESSION_SIZE)) };
    case 'review-hearts': {
      const due = dueItems(snapshot, today);
      const rest = Object.values(snapshot.srs)
        .filter((s) => !isDue(s, today) && itemKind(s.itemId) !== 'unknown')
        .sort((a, b) => a.box - b.box)
        .map((s) => s.itemId);
      return { node, plan: reviewPlan([...due, ...rest].slice(0, HEARTS_SESSION_SIZE)) };
    }
    case 'kana-rows':
      return { node, plan: { ...generateKanaPractice(node.kanaIds, seed, opts), nodeId: id } };
    case 'kana-weak': {
      const ids = weakestKana(snapshot);
      const kanaIds = ids.length ? ids : ALL_KANA.filter((k) => k.script === 'hiragana' && k.row === 'a').map((k) => k.id);
      return { node: { ...node, kanaIds }, plan: { ...generateKanaPractice(kanaIds, seed, opts), nodeId: id } };
    }
  }
}
