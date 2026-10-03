import type { ScenarioOption } from '@/content';

export type ExerciseType =
  | 'E1' | 'E1card' | 'E1word' | 'E2' | 'E3' | 'E4' | 'E5' | 'E6' | 'E7' | 'E8' | 'E9' | 'E10' | 'E11' | 'E12' | 'E13' | 'E14' | 'E15';

interface Base {
  uid: string;
  /** SRS item id this exercise trains (phrase, kana, word id) or '' for cards. */
  itemId: string;
  isReview: boolean;
  /** Evaluated exercises count toward progress and can cost hearts. */
  evaluated: boolean;
}

export type Exercise =
  | (Base & { type: 'E1'; phraseId: string; listenMode: boolean })
  | (Base & { type: 'E1card'; cardId: string })
  | (Base & { type: 'E1word'; wordId: string })
  | (Base & { type: 'E2'; phraseId: string; optionIds: string[] })
  | (Base & { type: 'E3'; phraseId: string; optionIds: string[] })
  | (Base & { type: 'E4'; phraseId?: string; wordId?: string; optionIds: string[]; optionLang: 'kana' | 'es' })
  | (Base & { type: 'E5'; phraseId: string; tiles: string[] })
  | (Base & { type: 'E6'; phraseId: string })
  | (Base & { type: 'E7'; mode: 'kana' | 'phrase' | 'word'; pairIds: string[] })
  | (Base & { type: 'E8'; hearId: string; optionIds: string[]; correctIds: string[] })
  | (Base & { type: 'E9'; scenarioId: string; options: ScenarioOption[] })
  | (Base & { type: 'E10'; phraseId?: string; wordId?: string })
  | (Base & { type: 'E11'; direction: 'kana-romaji' | 'romaji-kana'; mode: 'choose' | 'type'; kanaId?: string; wordId?: string; options: string[] })
  | (Base & { type: 'E12'; yen: number; mode: 'choose' | 'type'; options: number[] })
  | (Base & { type: 'E13'; hour: number; half: boolean; options: { hour: number; half: boolean }[] })
  | (Base & { type: 'E14'; kanjiId: string; optionIds: string[] })
  | (Base & { type: 'E15'; sceneId: string });

export const ALL_TYPES: ExerciseType[] = ['E1', 'E1card', 'E1word', 'E2', 'E3', 'E4', 'E5', 'E6', 'E7', 'E8', 'E9', 'E10', 'E11', 'E12', 'E13', 'E14', 'E15'];

/** Exercise types implemented in the current phase. The generator never emits others. */
export const ENABLED_TYPES: Set<ExerciseType> = new Set(['E1', 'E1card', 'E1word', 'E2', 'E3', 'E4', 'E7', 'E11']);

export const PRODUCTION_TYPES: ExerciseType[] = ['E5', 'E6', 'E10'];
