import { useEffect, useState } from 'react';
import { PHRASE_BY_ID, SCENARIO_BY_ID } from '@/content';
import type { Exercise } from '@/domain/exercises';
import { JpText } from '@/components/ui/JpText';
import { SpeakerButton } from '@/components/ui/SpeakerButton';
import { OptionList, type Option } from './OptionList';
import type { ExerciseProps } from './types';

type E = Extract<Exercise, { type: 'E9' }>;

/** E9 «Situación»: a scenario in Spanish and 3–4 spells; some accept several answers. */
export function SituationExercise({ exercise, revealed, onReady, showRomaji }: ExerciseProps<E>) {
  const sc = SCENARIO_BY_ID[exercise.scenarioId]!;
  const [selected, setSelected] = useState<string | null>(null);
  useEffect(() => setSelected(null), [exercise.uid]);

  const correct = new Set(sc.correctPhraseIds);
  const options: Option[] = exercise.options.map((o) => {
    if ('gesture' in o) {
      return { id: 'gesture', correct: Boolean(sc.gestureAnswer), content: <span className="italic">{o.gesture}</span> };
    }
    const p = PHRASE_BY_ID[o.phraseId]!;
    return {
      id: o.phraseId,
      correct: correct.has(o.phraseId),
      content: (
        <span className="block">
          <JpText className="text-lg leading-snug">{p.kana}</JpText>
          {showRomaji && <span className="block text-sm text-ink-2">{p.romaji}</span>}
        </span>
      ),
    };
  });

  const select = (id: string) => {
    setSelected(id);
    const ok = id === 'gesture' ? Boolean(sc.gestureAnswer) : correct.has(id);
    const best = PHRASE_BY_ID[sc.correctPhraseIds[0] ?? '']; // may be undefined for gesture-only
    onReady({
      correct: ok,
      expected: {
        jp: sc.gestureAnswer && !best ? undefined : best?.kana,
        romaji: best?.romaji,
        es: sc.gestureAnswer ?? best?.es,
        note: sc.explanation,
        speech: best?.speech,
      },
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm font-semibold text-ink-2">Situación</p>
      <p className="rounded-stone bg-parchment-100 px-4 py-3 text-base text-forest-900">{sc.promptEs}</p>
      {sc.acceptAll && <p className="text-xs text-ink-2">Hay más de una respuesta válida.</p>}
      <OptionList options={options} selected={selected} revealed={revealed} onSelect={select} trailing={(o) => (o.id === 'gesture' ? null : <SpeakerButton text={PHRASE_BY_ID[o.id]!.speech ?? PHRASE_BY_ID[o.id]!.kana} className="self-center" />)} />
    </div>
  );
}
