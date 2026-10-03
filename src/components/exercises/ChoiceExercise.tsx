import { useEffect, useState } from 'react';
import { PHRASE_BY_ID, WORD_BY_ID } from '@/content';
import type { Exercise } from '@/domain/exercises';
import { JpText } from '@/components/ui/JpText';
import { SpeakerButton } from '@/components/ui/SpeakerButton';
import { useSpeak } from '@/audio/useSpeak';
import { OptionList, type Option } from './OptionList';
import type { Answer, ExerciseProps } from './types';

type E = Extract<Exercise, { type: 'E2' | 'E3' | 'E4' }>;

function itemOf(id: string) {
  const p = PHRASE_BY_ID[id];
  if (p) return { kana: p.kana, romaji: p.romaji, es: p.es, note: p.note, speech: p.speech };
  const w = WORD_BY_ID[id]!;
  return { kana: w.kana, romaji: w.romaji, es: w.es, note: undefined, speech: undefined };
}

/** E2 (jp → es), E3 (es → jp) and E4 (audio → kana/es). */
export function ChoiceExercise({ exercise, revealed, onReady, showRomaji }: ExerciseProps<E>) {
  const targetId = exercise.type === 'E4' ? (exercise.phraseId ?? exercise.wordId)! : exercise.phraseId;
  const target = itemOf(targetId);
  const [selected, setSelected] = useState<string | null>(null);
  const speak = useSpeak();

  useEffect(() => {
    setSelected(null);
    if (exercise.type === 'E4' || exercise.type === 'E2') {
      const t = window.setTimeout(() => void speak(target.speech ?? target.kana), 300);
      return () => window.clearTimeout(t);
    }
    return undefined;
  }, [exercise.uid]); // eslint-disable-line react-hooks/exhaustive-deps

  const optionLang: 'kana' | 'es' = exercise.type === 'E2' ? 'es' : exercise.type === 'E3' ? 'kana' : exercise.optionLang;

  const options: Option[] = exercise.optionIds.map((id) => {
    const it = itemOf(id);
    return {
      id,
      correct: id === targetId,
      content:
        optionLang === 'es' ? (
          <span>{it.es}</span>
        ) : (
          <span className="block">
            <JpText className="text-lg leading-snug">{it.kana}</JpText>
            {showRomaji && <span className="block text-sm text-ink-2">{it.romaji}</span>}
          </span>
        ),
    };
  });

  const select = (id: string) => {
    setSelected(id);
    const answer: Answer = { correct: id === targetId, expected: { jp: target.kana, romaji: target.romaji, es: target.es, note: target.note, speech: target.speech } };
    onReady(answer);
  };

  const title = exercise.type === 'E2' ? 'Elige la traducción' : exercise.type === 'E3' ? 'Elige el hechizo' : 'Escucha y elige';

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm font-semibold text-ink-2">{title}</p>
      {exercise.type === 'E2' && (
        <div className="flex items-center gap-3">
          <SpeakerButton text={target.speech ?? target.kana} />
          <div>
            <JpText as="p" className="text-xl leading-snug">
              {target.kana}
            </JpText>
            {showRomaji && <p className="text-sm text-ink-2">{target.romaji}</p>}
          </div>
        </div>
      )}
      {exercise.type === 'E3' && <p className="text-lg font-bold">{target.es}</p>}
      {exercise.type === 'E4' && (
        <div className="flex flex-col items-center gap-2 py-2">
          <SpeakerButton text={target.speech ?? target.kana} size="lg" label="Escuchar la frase" />
          <p className="text-xs text-ink-2">Toca para repetir · mantén para oírlo despacio</p>
        </div>
      )}
      <OptionList
        options={options}
        selected={selected}
        revealed={revealed}
        onSelect={select}
        trailing={optionLang === 'kana' && exercise.type !== 'E4' ? (o) => <SpeakerButton text={itemOf(o.id).speech ?? itemOf(o.id).kana} size="md" className="self-center" /> : undefined}
      />
    </div>
  );
}
