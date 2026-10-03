import type { Exercise } from '@/domain/exercises';

export interface Answer {
  correct: boolean;
  /** One typo away («Casi perfecto»). */
  near?: boolean;
  /** What to show in the feedback sheet when wrong (or as reinforcement when right). */
  expected: { jp?: string; romaji?: string; es?: string; note?: string; speech?: string };
}

export interface ExerciseProps<E extends Exercise = Exercise> {
  exercise: E;
  /** Set to true once the main button has been pressed: components then show right/wrong colours. */
  revealed: boolean;
  /** Called every time the user's provisional answer changes (null = nothing selected yet). */
  onReady: (answer: Answer | null) => void;
  /** For self-completing exercises (cards, matches): finishes the exercise immediately. */
  onAutoComplete: (answer: Answer) => void;
  /** Romaji visibility policy already resolved by the lesson. */
  showRomaji: boolean;
}
