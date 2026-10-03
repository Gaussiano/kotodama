import {
  ALL_KANA,
  CARD_BY_ID,
  KANA_BY_ID,
  NODES,
  NODE_BY_ID,
  PHRASES,
  PHRASE_BY_ID,
  REGION_ORDER,
  SCENARIOS,
  WORDS,
  WORD_BY_ID,
  type LessonNode,
  type Phrase,
  type PracticeWord,
  type RegionId,
} from '@/content';
import { randomPrice } from '@/content/numbers';
import { HOURS } from '@/content/clock';
import { KANJI } from '@/content/kanji';
import { ENABLED_TYPES, type Exercise, type ExerciseType } from './exercises';
import { mulberry32, pick, sample, shuffle, type Rng } from './rng';
import type { SrsState } from './srs';
import { isDue } from './srs';

// Lesson engine (spec §7). Pure: content + progress snapshot + seed → exercise list.

export interface ProgressSnapshot {
  completedNodes: string[];
  srs: Record<string, SrsState>;
}

export interface GenOptions {
  today: string;
  enabledTypes?: Set<ExerciseType>;
  /** When false, audio-only E4 becomes E2 (spec §12). */
  audioAvailable?: boolean;
}

export interface LessonPlan {
  nodeId: string;
  kind: LessonNode['kind'];
  exercises: Exercise[];
  newItemIds: string[];
  reviewItemIds: string[];
  /** Hearts can be lost in this lesson (not in intro, review, prices…). */
  usesHearts: boolean;
  /** Pass threshold for guardians (0 = none). */
  passThreshold: number;
}

const TARGET_EVALUATED = 12;
const MAX_REVIEW_SHARE = 0.3;

// ─── learned-state helpers ──────────────────────────────────────────────────

export function learnedPhraseIds(completed: string[]): Set<string> {
  const ids = new Set<string>();
  for (const nid of completed) NODE_BY_ID[nid]?.phraseIds.forEach((p) => ids.add(p));
  return ids;
}
export function learnedKanaIds(completed: string[]): Set<string> {
  const ids = new Set<string>();
  for (const nid of completed) NODE_BY_ID[nid]?.kanaIds.forEach((k) => ids.add(k));
  return ids;
}
export function learnedWordIds(completed: string[]): Set<string> {
  const ids = new Set<string>();
  for (const nid of completed) NODE_BY_ID[nid]?.practiceWordIds?.forEach((w) => ids.add(w));
  return ids;
}

export function itemKind(itemId: string): 'phrase' | 'kana' | 'word' | 'unknown' {
  if (PHRASE_BY_ID[itemId]) return 'phrase';
  if (KANA_BY_ID[itemId]) return 'kana';
  if (WORD_BY_ID[itemId]) return 'word';
  return 'unknown';
}

// ─── distractors ────────────────────────────────────────────────────────────

function phraseDistractors(target: Phrase, n: number, rnd: Rng, poolOverride?: Phrase[]): Phrase[] {
  const banned = new Set<string>([target.id, ...(target.equivalents ?? [])]);
  for (const p of PHRASES) if (p.equivalents?.includes(target.id)) banned.add(p.id);
  const ok = (p: Phrase) => !banned.has(p.id) && p.es !== target.es && p.kana !== target.kana;
  const base = poolOverride ?? PHRASES;
  const tiers = [
    base.filter((p) => ok(p) && p.regionId === target.regionId && p.category === target.category && p.kind === target.kind),
    base.filter((p) => ok(p) && p.regionId === target.regionId && p.kind === target.kind),
    base.filter((p) => ok(p) && p.regionId === target.regionId),
    base.filter((p) => ok(p)),
  ];
  const out: Phrase[] = [];
  const seenEs = new Set<string>([target.es]);
  const seenKana = new Set<string>([target.kana]);
  for (const tier of tiers) {
    for (const p of shuffle(tier, rnd)) {
      if (out.length >= n) break;
      if (seenEs.has(p.es) || seenKana.has(p.kana)) continue;
      seenEs.add(p.es);
      seenKana.add(p.kana);
      out.push(p);
    }
    if (out.length >= n) break;
  }
  return out;
}

function kanaRomajiDistractors(kanaId: string, n: number, rnd: Rng): string[] {
  const k = KANA_BY_ID[kanaId]!;
  const same = ALL_KANA.filter((x) => x.script === k.script && x.id !== k.id);
  const sameRow = same.filter((x) => x.row === k.row);
  const sameGroup = same.filter((x) => x.group === k.group && x.row !== k.row);
  const out = new Set<string>();
  for (const list of [sameRow, sameGroup, same]) {
    for (const x of shuffle(list, rnd)) {
      if (out.size >= n) break;
      if (x.romaji !== k.romaji) out.add(x.romaji);
    }
    if (out.size >= n) break;
  }
  return [...out];
}

function kanaCharDistractors(kanaId: string, n: number, rnd: Rng): string[] {
  const k = KANA_BY_ID[kanaId]!;
  const same = ALL_KANA.filter((x) => x.script === k.script && x.id !== k.id);
  const sameRow = same.filter((x) => x.row === k.row);
  const sameGroup = same.filter((x) => x.group === k.group);
  const out = new Set<string>();
  for (const list of [sameRow, sameGroup, same]) {
    for (const x of shuffle(list, rnd)) {
      if (out.size >= n) break;
      out.add(x.char);
    }
    if (out.size >= n) break;
  }
  return [...out];
}

function wordRomajiDistractors(word: PracticeWord, n: number, rnd: Rng): string[] {
  const pool = WORDS.filter((w) => w.id !== word.id && w.romaji !== word.romaji);
  const sameRegion = pool.filter((w) => w.regionId === word.regionId);
  const out = new Set<string>();
  for (const list of [sameRegion, pool]) {
    for (const w of shuffle(list, rnd)) {
      if (out.size >= n) break;
      out.add(w.romaji);
    }
    if (out.size >= n) break;
  }
  return [...out];
}

// ─── exercise builders ──────────────────────────────────────────────────────

let uidCounter = 0;
const uid = (prefix: string) => `${prefix}-${(uidCounter++).toString(36)}`;

function e1(phraseId: string, listenMode: boolean): Exercise {
  return { type: 'E1', uid: uid('e1'), itemId: phraseId, isReview: false, evaluated: false, phraseId, listenMode };
}
function e1card(cardId: string): Exercise {
  return { type: 'E1card', uid: uid('card'), itemId: '', isReview: false, evaluated: false, cardId };
}
function e1word(wordId: string): Exercise {
  return { type: 'E1word', uid: uid('e1w'), itemId: wordId, isReview: false, evaluated: false, wordId };
}
function e2(phrase: Phrase, rnd: Rng, isReview: boolean): Exercise {
  const options = shuffle([phrase, ...phraseDistractors(phrase, 3, rnd)], rnd).map((p) => p.id);
  return { type: 'E2', uid: uid('e2'), itemId: phrase.id, isReview, evaluated: true, phraseId: phrase.id, optionIds: options };
}
function e3(phrase: Phrase, rnd: Rng, isReview: boolean): Exercise {
  const options = shuffle([phrase, ...phraseDistractors(phrase, 3, rnd)], rnd).map((p) => p.id);
  return { type: 'E3', uid: uid('e3'), itemId: phrase.id, isReview, evaluated: true, phraseId: phrase.id, optionIds: options };
}
function e4phrase(phrase: Phrase, rnd: Rng, isReview: boolean, optionLang: 'kana' | 'es'): Exercise {
  const options = shuffle([phrase, ...phraseDistractors(phrase, 3, rnd)], rnd).map((p) => p.id);
  return { type: 'E4', uid: uid('e4'), itemId: phrase.id, isReview, evaluated: true, phraseId: phrase.id, optionIds: options, optionLang };
}
function e4word(word: PracticeWord, pool: PracticeWord[], rnd: Rng, optionLang: 'kana' | 'es'): Exercise {
  const others = shuffle(
    pool.filter((w) => w.id !== word.id && w.kana !== word.kana && w.es !== word.es),
    rnd,
  ).slice(0, 3);
  const options = shuffle([word, ...others], rnd).map((w) => w.id);
  return { type: 'E4', uid: uid('e4w'), itemId: word.id, isReview: false, evaluated: true, wordId: word.id, optionIds: options, optionLang };
}
function e5(phrase: Phrase, rnd: Rng, isReview: boolean): Exercise {
  const trapPool = PHRASES.filter((p) => p.regionId === phrase.regionId && p.id !== phrase.id && p.segments.length > 1);
  const traps = new Set<string>();
  for (const p of shuffle(trapPool, rnd)) {
    for (const seg of p.segments) {
      if (traps.size >= 3) break;
      if (!phrase.segments.includes(seg) && !seg.includes('＿')) traps.add(seg);
    }
    if (traps.size >= 3) break;
  }
  const tiles = shuffle([...phrase.segments, ...[...traps].slice(0, 2 + Math.floor(rnd() * 2))], rnd);
  return { type: 'E5', uid: uid('e5'), itemId: phrase.id, isReview, evaluated: true, phraseId: phrase.id, tiles };
}
function e6(phrase: Phrase, isReview: boolean): Exercise {
  return { type: 'E6', uid: uid('e6'), itemId: phrase.id, isReview, evaluated: true, phraseId: phrase.id };
}
function e7(mode: 'kana' | 'phrase' | 'word', ids: string[]): Exercise {
  return { type: 'E7', uid: uid('e7'), itemId: ids[0] ?? '', isReview: false, evaluated: true, mode, pairIds: ids };
}
function e8(hear: Phrase, rnd: Rng): Exercise | null {
  const correctIds = (hear.suggestedReplies ?? []).filter((id) => PHRASE_BY_ID[id]);
  if (correctIds.length === 0) return null;
  const correct = PHRASE_BY_ID[pick(correctIds, rnd)]!;
  const pool = PHRASES.filter((p) => p.kind === 'say' && !correctIds.includes(p.id) && p.es !== correct.es && !p.hidden);
  const distractors = phraseDistractors(correct, 2, rnd, pool);
  const optionIds = shuffle([correct, ...distractors], rnd).map((p) => p.id);
  return { type: 'E8', uid: uid('e8'), itemId: hear.id, isReview: false, evaluated: true, hearId: hear.id, optionIds, correctIds };
}
function e9(scenarioId: string, rnd: Rng): Exercise {
  const sc = SCENARIOS.find((s) => s.id === scenarioId)!;
  const correctPhrases = sc.correctPhraseIds.map((id) => PHRASE_BY_ID[id]!);
  const first = correctPhrases[0];
  const banned = new Set(sc.correctPhraseIds);
  const pool = PHRASES.filter((p) => p.kind === 'say' && !banned.has(p.id) && !p.hidden);
  const need = 4 - (sc.acceptAll ? correctPhrases.length : 1) - (sc.gestureAnswer ? 1 : 0);
  const distractors = first ? phraseDistractors(first, Math.max(1, need), rnd, pool) : sample(pool, 3, rnd);
  const shown = sc.acceptAll ? correctPhrases : first ? [first] : [];
  const options = shuffle(
    [
      ...shown.map((p) => ({ phraseId: p.id })),
      ...distractors.map((p) => ({ phraseId: p.id })),
      ...(sc.gestureAnswer ? [{ gesture: sc.gestureAnswer }] : []),
    ],
    rnd,
  );
  return { type: 'E9', uid: uid('e9'), itemId: first?.id ?? '', isReview: false, evaluated: true, scenarioId, options };
}
function e10(ref: { phraseId?: string; wordId?: string }): Exercise {
  return { type: 'E10', uid: uid('e10'), itemId: ref.phraseId ?? ref.wordId ?? '', isReview: false, evaluated: false, ...ref };
}
function e11kana(kanaId: string, direction: 'kana-romaji' | 'romaji-kana', rnd: Rng, isReview: boolean, mode: 'choose' | 'type' = 'choose'): Exercise {
  const k = KANA_BY_ID[kanaId]!;
  const options =
    mode === 'type'
      ? []
      : direction === 'kana-romaji'
        ? shuffle([k.romaji, ...kanaRomajiDistractors(kanaId, 3, rnd)], rnd)
        : shuffle([k.char, ...kanaCharDistractors(kanaId, 3, rnd)], rnd);
  return { type: 'E11', uid: uid('e11'), itemId: kanaId, isReview, evaluated: true, direction, mode, kanaId, options };
}
function e11word(word: PracticeWord, rnd: Rng, isReview: boolean, mode: 'choose' | 'type' = 'choose'): Exercise {
  const options = mode === 'type' ? [] : shuffle([word.romaji, ...wordRomajiDistractors(word, 3, rnd)], rnd);
  return { type: 'E11', uid: uid('e11w'), itemId: word.id, isReview, evaluated: true, direction: 'kana-romaji', mode, wordId: word.id, options };
}
function e12(kind: 'konbini' | 'shop', mode: 'choose' | 'type', rnd: Rng): Exercise {
  const yen = randomPrice(kind, rnd);
  const options = new Set<number>([yen]);
  let guard = 0;
  while (options.size < 4 && guard++ < 50) options.add(randomPrice(kind, rnd));
  return { type: 'E12', uid: uid('e12'), itemId: '', isReview: false, evaluated: true, yen, mode, options: shuffle([...options], rnd) };
}
function e13(rnd: Rng): Exercise {
  const hour = pick(HOURS, rnd).hour;
  const half = rnd() < 0.4;
  const opts = new Map<string, { hour: number; half: boolean }>();
  opts.set(`${hour}-${half}`, { hour, half });
  let guard = 0;
  while (opts.size < 4 && guard++ < 50) {
    const h = pick(HOURS, rnd).hour;
    const hf = rnd() < 0.4;
    opts.set(`${h}-${hf}`, { hour: h, half: hf });
  }
  return { type: 'E13', uid: uid('e13'), itemId: '', isReview: false, evaluated: true, hour, half, options: shuffle([...opts.values()], rnd) };
}
function e14(kanjiId: string, rnd: Rng): Exercise {
  const others = shuffle(KANJI.filter((k) => k.id !== kanjiId), rnd).slice(0, 3);
  const optionIds = shuffle([kanjiId, ...others.map((k) => k.id)], rnd);
  return { type: 'E14', uid: uid('e14'), itemId: kanjiId, isReview: false, evaluated: true, kanjiId, optionIds };
}
function e15(sceneId: string): Exercise {
  return { type: 'E15', uid: uid('e15'), itemId: '', isReview: false, evaluated: true, sceneId };
}

// ─── per-item exercise choice ───────────────────────────────────────────────

function phraseProductionTypes(p: Phrase, enabled: Set<ExerciseType>): ExerciseType[] {
  const out: ExerciseType[] = [];
  if (p.kind === 'say') {
    if (enabled.has('E5') && p.segments.length >= 2 && p.production !== false && !p.hasBlank) out.push('E5');
    if (enabled.has('E6') && p.production !== false && !p.hasBlank) out.push('E6');
    if (enabled.has('E10')) out.push('E10');
  }
  return out;
}

function buildFor(type: ExerciseType, phrase: Phrase, rnd: Rng, isReview: boolean, audio: boolean): Exercise | null {
  switch (type) {
    case 'E2':
      return e2(phrase, rnd, isReview);
    case 'E3':
      return e3(phrase, rnd, isReview);
    case 'E4':
      return audio ? e4phrase(phrase, rnd, isReview, rnd() < 0.5 ? 'es' : 'kana') : e2(phrase, rnd, isReview);
    case 'E5':
      return e5(phrase, rnd, isReview);
    case 'E6':
      return e6(phrase, isReview);
    case 'E8':
      return e8(phrase, rnd);
    case 'E10':
      return e10({ phraseId: phrase.id });
    default:
      return null;
  }
}

/** A review exercise for any SRS item (phrase/kana/word), recognition-level. */
export function reviewExerciseFor(itemId: string, rnd: Rng, opts: GenOptions, level: 'easy' | 'hard' = 'easy'): Exercise | null {
  const enabled = opts.enabledTypes ?? ENABLED_TYPES;
  const audio = opts.audioAvailable ?? true;
  const kind = itemKind(itemId);
  if (kind === 'phrase') {
    const p = PHRASE_BY_ID[itemId]!;
    if (p.kind === 'hear') {
      const choices: ExerciseType[] = [];
      if (enabled.has('E8') && (p.suggestedReplies?.length ?? 0) > 0) choices.push('E8');
      if (audio && enabled.has('E4')) choices.push('E4');
      choices.push('E2');
      return buildFor(pick(choices, rnd), p, rnd, true, audio);
    }
    const easy: ExerciseType[] = ['E2', 'E3', ...(audio ? ['E4' as const] : [])];
    const hard: ExerciseType[] = [...phraseProductionTypes(p, enabled).filter((t) => t !== 'E10'), 'E3'];
    return buildFor(pick(level === 'hard' ? hard : easy, rnd), p, rnd, true, audio);
  }
  if (kind === 'kana') return e11kana(itemId, rnd() < 0.5 ? 'kana-romaji' : 'romaji-kana', rnd, true, level === 'hard' && enabled.has('E6') ? 'type' : 'choose');
  if (kind === 'word') return e11word(WORD_BY_ID[itemId]!, rnd, true, level === 'hard' && enabled.has('E6') ? 'type' : 'choose');
  return null;
}

/** Retry exercise after a failure: same item, different type when possible (spec §7.1.4). */
export function retryExercise(failed: Exercise, rnd: Rng, opts: GenOptions): Exercise {
  const enabled = opts.enabledTypes ?? ENABLED_TYPES;
  const audio = opts.audioAvailable ?? true;
  const kind = itemKind(failed.itemId);
  if (kind === 'phrase') {
    const p = PHRASE_BY_ID[failed.itemId]!;
    const pool: ExerciseType[] =
      p.kind === 'hear'
        ? [...(audio ? ['E4' as const] : []), 'E2', ...(enabled.has('E8') && p.suggestedReplies?.length ? ['E8' as const] : [])]
        : ['E2', 'E3', ...(audio ? ['E4' as const] : []), ...phraseProductionTypes(p, enabled).filter((t) => t !== 'E10')];
    const candidates = pool.filter((t) => t !== failed.type);
    const built = buildFor(pick(candidates.length ? candidates : pool, rnd), p, rnd, failed.isReview, audio);
    if (built) return built;
  }
  if (kind === 'kana' && failed.type === 'E11') {
    return e11kana(failed.itemId, failed.direction === 'kana-romaji' ? 'romaji-kana' : 'kana-romaji', rnd, failed.isReview, 'choose');
  }
  if (kind === 'word') return e11word(WORD_BY_ID[failed.itemId]!, rnd, failed.isReview, 'choose');
  // Non-item exercises (E7, E12, E13, E14, E15…): regenerate the same shape.
  switch (failed.type) {
    case 'E7':
      return e7(failed.mode, shuffle(failed.pairIds, rnd));
    case 'E12':
      return e12(failed.yen <= 3000 ? 'konbini' : 'shop', failed.mode, rnd);
    case 'E13':
      return e13(rnd);
    case 'E14':
      return e14(failed.kanjiId, rnd);
    case 'E9':
      return e9(failed.scenarioId, rnd);
    default:
      return { ...failed, uid: uid('retry') };
  }
}

// ─── blocks ─────────────────────────────────────────────────────────────────

function kanaBlock(kanaIds: string[], rnd: Rng, enabled: Set<ExerciseType>, limit: number): Exercise[] {
  const out: Exercise[] = [];
  if (!enabled.has('E11') || kanaIds.length === 0) return out;
  const ids = shuffle(kanaIds, rnd);
  for (const id of ids) out.push(e11kana(id, 'kana-romaji', rnd, false));
  if (enabled.has('E7')) {
    for (let i = 0; i + 3 <= ids.length; i += 5) out.push(e7('kana', ids.slice(i, i + 5)));
  }
  for (const id of ids) out.push(e11kana(id, 'romaji-kana', rnd, false));
  return out.slice(0, limit);
}

function wordBlock(words: PracticeWord[], rnd: Rng, enabled: Set<ExerciseType>, audio: boolean, limit: number): Exercise[] {
  const out: Exercise[] = [];
  const intro: Exercise[] = words.map((w) => e1word(w.id));
  for (const w of shuffle(words, rnd)) {
    if (enabled.has('E11')) out.push(e11word(w, rnd, false));
    if (audio && enabled.has('E4')) out.push(e4word(w, words, rnd, rnd() < 0.5 ? 'kana' : 'es'));
  }
  if (enabled.has('E7') && words.length >= 4) out.push(e7('word', sample(words, 5, rnd).map((w) => w.id)));
  return [...intro, ...out.slice(0, limit)];
}

function dueItems(snapshot: ProgressSnapshot, today: string, exclude: Set<string>): string[] {
  return Object.values(snapshot.srs)
    .filter((s) => isDue(s, today) && !exclude.has(s.itemId) && itemKind(s.itemId) !== 'unknown')
    .sort((a, b) => b.lapses - a.lapses || (a.due < b.due ? -1 : 1))
    .map((s) => s.itemId);
}

function interleave(main: Exercise[], reviews: Exercise[]): Exercise[] {
  if (reviews.length === 0) return main;
  const out: Exercise[] = [];
  const every = Math.max(2, Math.floor(main.length / (reviews.length + 1)));
  let r = 0;
  main.forEach((ex, i) => {
    out.push(ex);
    if ((i + 1) % every === 0 && r < reviews.length) out.push(reviews[r++]!);
  });
  while (r < reviews.length) out.push(reviews[r++]!);
  return out;
}

// ─── main entry ─────────────────────────────────────────────────────────────

export function generateLesson(node: LessonNode, snapshot: ProgressSnapshot, seed: number, opts: GenOptions): LessonPlan {
  const rnd = mulberry32(seed);
  const enabled = opts.enabledTypes ?? ENABLED_TYPES;
  const audio = opts.audioAvailable ?? true;
  uidCounter = 0;

  const base = { nodeId: node.id, kind: node.kind, usesHearts: node.kind === 'phrases' || node.kind === 'heard' || node.kind === 'kana' || node.kind === 'boss' || node.kind === 'finalBoss', passThreshold: 0 };

  switch (node.kind) {
    case 'intro':
      return { ...base, usesHearts: false, ...introLesson(node, rnd, enabled, audio) };
    case 'kana':
      return { ...base, ...kanaLesson(node, snapshot, rnd, enabled, audio, opts) };
    case 'phrases':
      return { ...base, ...phraseLesson(node, snapshot, rnd, enabled, audio, opts) };
    case 'heard':
      return { ...base, ...heardLesson(node, snapshot, rnd, enabled, audio, opts) };
    case 'prices':
      return { ...base, usesHearts: false, ...pricesLesson(node, snapshot, rnd, enabled, audio) };
    case 'review':
      return { ...base, usesHearts: false, ...reviewLesson(snapshot, rnd, opts) };
    case 'boss':
      return { ...base, passThreshold: 0.8, ...bossLesson(node.regionId, snapshot, rnd, enabled, audio, false) };
    case 'finalBoss':
      return { ...base, passThreshold: 0.8, ...bossLesson('r4', snapshot, rnd, enabled, audio, true) };
  }
}

type Partial = Pick<LessonPlan, 'exercises' | 'newItemIds' | 'reviewItemIds'>;

function introLesson(node: LessonNode, rnd: Rng, enabled: Set<ExerciseType>, audio: boolean): Partial {
  const exercises: Exercise[] = node.infoCardIds.map(e1card);
  const words = (node.practiceWordIds ?? []).map((id) => WORD_BY_ID[id]!);
  for (const w of shuffle(words, rnd)) {
    if (audio && enabled.has('E4')) exercises.push(e4word(w, words, rnd, rnd() < 0.5 ? 'kana' : 'es'));
    if (enabled.has('E10')) exercises.push(e10({ wordId: w.id }));
  }
  return { exercises, newItemIds: words.map((w) => w.id), reviewItemIds: [] };
}

function availableWords(node: LessonNode, snapshot: ProgressSnapshot): PracticeWord[] {
  const known = learnedKanaIds(snapshot.completedNodes);
  node.kanaIds.forEach((k) => known.add(k));
  return (node.practiceWordIds ?? []).map((id) => WORD_BY_ID[id]!).filter((w) => w.requiredKana.every((k) => known.has(k)));
}

function kanaLesson(node: LessonNode, snapshot: ProgressSnapshot, rnd: Rng, enabled: Set<ExerciseType>, audio: boolean, opts: GenOptions): Partial {
  const exercises: Exercise[] = node.infoCardIds.map(e1card);
  exercises.push(...kanaBlock(node.kanaIds, rnd, enabled, 12));
  const words = availableWords(node, snapshot);
  exercises.push(...wordBlock(words, rnd, enabled, audio, 6));
  const evaluated = exercises.filter((e) => e.evaluated);
  const trimmed = [...exercises.filter((e) => !e.evaluated), ...evaluated.slice(0, 15)];
  const reviews = reviewBlock(snapshot, rnd, opts, new Set([...node.kanaIds, ...words.map((w) => w.id)]), 3);
  return {
    exercises: interleave(trimmed, reviews),
    newItemIds: [...node.kanaIds, ...words.map((w) => w.id)],
    reviewItemIds: reviews.map((r) => r.itemId),
  };
}

function reviewBlock(snapshot: ProgressSnapshot, rnd: Rng, opts: GenOptions, exclude: Set<string>, max: number): Exercise[] {
  const due = dueItems(snapshot, opts.today, exclude).slice(0, max);
  return due.map((id) => reviewExerciseFor(id, rnd, opts)).filter((e): e is Exercise => e !== null);
}

function phraseLesson(node: LessonNode, snapshot: ProgressSnapshot, rnd: Rng, enabled: Set<ExerciseType>, audio: boolean, opts: GenOptions): Partial {
  const phrases = node.phraseIds.map((id) => PHRASE_BY_ID[id]!);
  const exercises: Exercise[] = [];

  // 1. New phrases: E1 + an easy check right after.
  phrases.forEach((p, i) => {
    exercises.push(e1(p.id, false));
    const useAudio = audio && enabled.has('E4') && i % 2 === 1;
    exercises.push(useAudio ? e4phrase(p, rnd, false, 'es') : e2(p, rnd, false));
  });

  // 2. Info cards after the first contact with the phrases.
  node.infoCardIds.forEach((id) => CARD_BY_ID[id] && exercises.push(e1card(id)));

  // 3. Kana of the node.
  const kanaEx = kanaBlock(node.kanaIds, rnd, enabled, node.kanaIds.length >= 10 ? 8 : 6);

  // 4. Recognition → production mix with the new phrases.
  const mix: Exercise[] = [];
  for (const p of shuffle(phrases, rnd)) mix.push(e3(p, rnd, false));
  const learned = learnedPhraseIds(snapshot.completedNodes);
  const matchPool = PHRASES.filter((x) => x.kind === 'say' && !x.hidden && (learned.has(x.id) || node.phraseIds.includes(x.id)) && x.regionId === node.regionId);
  if (enabled.has('E7') && matchPool.length >= 4) {
    const chosen = [...phrases.filter((p) => !p.hidden && p.kind === 'say'), ...shuffle(matchPool.filter((x) => !node.phraseIds.includes(x.id)), rnd)].slice(0, 5);
    if (chosen.length >= 4) mix.push(e7('phrase', chosen.map((p) => p.id)));
  }
  const production: Exercise[] = [];
  for (const p of shuffle(phrases, rnd)) {
    const types = phraseProductionTypes(p, enabled);
    if (types.length === 0) continue;
    const built = buildFor(pick(types, rnd), p, rnd, false, audio);
    if (built) production.push(built);
  }
  mix.push(...production);

  // 5. Reviews (max 30 %).
  const quickChecks = phrases.length;
  const target = Math.max(TARGET_EVALUATED, quickChecks + 4);
  const maxReviews = Math.floor(target * MAX_REVIEW_SHARE);
  const reviews = reviewBlock(snapshot, rnd, opts, new Set(node.phraseIds), maxReviews);

  const mixBudget = Math.max(phrases.length, target - quickChecks - reviews.length - Math.min(kanaEx.length, 4));
  let chosenMix = mix.slice(0, mixBudget + 1);
  // Pad short lessons with extra recognition rounds so every lesson has a similar length.
  const minEvaluated = Math.min(TARGET_EVALUATED, quickChecks + 5);
  let evaluated = quickChecks + reviews.length + kanaEx.filter((e) => e.evaluated).length + chosenMix.filter((e) => e.evaluated).length;
  const padTypes: ExerciseType[] = audio ? ['E4', 'E2', 'E3'] : ['E2', 'E3'];
  let padI = 0;
  while (evaluated < minEvaluated && padI < phrases.length * padTypes.length) {
    const p = phrases[padI % phrases.length]!;
    const built = buildFor(padTypes[Math.floor(padI / phrases.length) % padTypes.length]!, p, rnd, false, audio);
    padI++;
    if (!built) continue;
    chosenMix = [...chosenMix.slice(0, phrases.length), built, ...chosenMix.slice(phrases.length)];
    evaluated++;
  }
  const body = interleave([...kanaEx, ...chosenMix], reviews);

  const words = availableWords(node, snapshot);
  const wordEx = wordBlock(words, rnd, enabled, audio, 4);

  return {
    exercises: [...exercises, ...body, ...wordEx],
    newItemIds: [...node.phraseIds, ...node.kanaIds, ...words.map((w) => w.id)],
    reviewItemIds: reviews.map((r) => r.itemId),
  };
}

function heardLesson(node: LessonNode, snapshot: ProgressSnapshot, rnd: Rng, enabled: Set<ExerciseType>, audio: boolean, opts: GenOptions): Partial {
  const phrases = node.phraseIds.map((id) => PHRASE_BY_ID[id]!);
  const exercises: Exercise[] = [];
  for (const p of phrases) {
    exercises.push(e1(p.id, true));
    exercises.push(audio && enabled.has('E4') ? e4phrase(p, rnd, false, 'es') : e2(p, rnd, false));
  }
  const replies: Exercise[] = [];
  for (const p of shuffle(phrases, rnd)) {
    const ex = enabled.has('E8') ? e8(p, rnd) : null;
    replies.push(ex ?? e2(p, rnd, false));
  }
  const reviews = reviewBlock(snapshot, rnd, opts, new Set(node.phraseIds), 3);
  const body = interleave(replies, reviews);
  const scene = node.sceneId && enabled.has('E15') ? [e15(node.sceneId)] : [];
  return { exercises: [...exercises, ...body, ...scene], newItemIds: node.phraseIds, reviewItemIds: reviews.map((r) => r.itemId) };
}

function pricesLesson(node: LessonNode, snapshot: ProgressSnapshot, rnd: Rng, enabled: Set<ExerciseType>, audio: boolean): Partial {
  const exercises: Exercise[] = [];
  if (enabled.has('E12')) {
    for (let i = 0; i < 8; i++) exercises.push(e12(i % 2 === 0 ? 'konbini' : 'shop', enabled.has('E6') && i >= 5 ? 'type' : 'choose', rnd));
  }
  const words = availableWords(node, snapshot);
  exercises.push(...wordBlock(words, rnd, enabled, audio, 8));
  return { exercises, newItemIds: words.map((w) => w.id), reviewItemIds: [] };
}

function reviewLesson(snapshot: ProgressSnapshot, rnd: Rng, opts: GenOptions): Partial {
  const due = dueItems(snapshot, opts.today, new Set()).slice(0, 15);
  const pool = due.length >= 6 ? due : [...due, ...shuffle([...learnedPhraseIds(snapshot.completedNodes)], rnd)].slice(0, 15);
  const exercises = pool.map((id, i) => reviewExerciseFor(id, rnd, opts, i % 3 === 2 ? 'hard' : 'easy')).filter((e): e is Exercise => e !== null);
  return { exercises, newItemIds: [], reviewItemIds: pool };
}

function bossLesson(regionId: RegionId, _snapshot: ProgressSnapshot, rnd: Rng, enabled: Set<ExerciseType>, audio: boolean, final: boolean): Partial {
  const regions = final ? REGION_ORDER.filter((r) => r !== 'r0') : [regionId];
  const sayPhrases = PHRASES.filter((p) => regions.includes(p.regionId) && p.kind === 'say' && !p.hidden);
  const hearPhrases = PHRASES.filter((p) => regions.includes(p.regionId) && p.kind === 'hear' && (p.suggestedReplies?.length ?? 0) > 0);
  const scenarios = SCENARIOS.filter((s) => regions.includes(s.regionId));
  const exercises: Exercise[] = [];

  const sayTypes: ExerciseType[] = ['E2', 'E3', ...(audio ? ['E4' as const] : []), ...(['E5', 'E6'] as const).filter((t) => enabled.has(t))];
  for (const p of shuffle(sayPhrases, rnd).slice(0, final ? 9 : 7)) {
    const types = sayTypes.filter((t) => (t === 'E5' ? p.segments.length >= 2 && !p.hasBlank && p.production !== false : t === 'E6' ? !p.hasBlank && p.production !== false : true));
    const built = buildFor(pick(types, rnd), p, rnd, false, audio);
    if (built) exercises.push(built);
  }
  if (enabled.has('E8')) {
    for (const p of shuffle(hearPhrases, rnd).slice(0, final ? 3 : 2)) {
      const ex = e8(p, rnd);
      if (ex) exercises.push(ex);
    }
  }
  if (enabled.has('E9')) for (const s of shuffle(scenarios, rnd).slice(0, final ? 4 : 4)) exercises.push(e9(s.id, rnd));
  if (regionId === 'r3' && enabled.has('E12')) for (let i = 0; i < 3; i++) exercises.push(e12(i === 0 ? 'konbini' : 'shop', 'choose', rnd));
  if (regionId === 'r4' && enabled.has('E14')) for (const k of sample(KANJI, 2, rnd)) exercises.push(e14(k.id, rnd));
  const regionKana = NODES.filter((n) => n.regionId === regionId).flatMap((n) => n.kanaIds);
  if (!final && regionKana.length && enabled.has('E11')) for (const k of sample(regionKana, 2, rnd)) exercises.push(e11kana(k, 'kana-romaji', rnd, false));

  let list = shuffle(exercises, rnd).slice(0, 15);
  if (list.length < 12) {
    for (const p of shuffle(sayPhrases, rnd)) {
      if (list.length >= 12) break;
      if (list.some((e) => e.itemId === p.id)) continue;
      list.push(e3(p, rnd, false));
    }
  }
  // Recognition before production.
  const rank = (e: Exercise) => (['E2', 'E4', 'E11', 'E14'].includes(e.type) ? 0 : ['E3', 'E8', 'E9', 'E12', 'E7'].includes(e.type) ? 1 : 2);
  list = list.sort((a, b) => rank(a) - rank(b));
  if (final && enabled.has('E15')) list.push(e15('scene-5'));
  return { exercises: list, newItemIds: [], reviewItemIds: [] };
}
