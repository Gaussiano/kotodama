import { useEffect, useState } from 'react';
import { KANA_BY_ID, WORD_BY_ID } from '@/content';
import type { Exercise } from '@/domain/exercises';
import { checkTyped } from '@/domain/answerCheck';
import { JpText } from '@/components/ui/JpText';
import { SpeakerButton } from '@/components/ui/SpeakerButton';
import { useSpeak } from '@/audio/useSpeak';
import { OptionList, type Option } from './OptionList';
import type { Answer, ExerciseProps } from './types';

type E = Extract<Exercise, { type: 'E11' }>;

/** E11 «Lee el kana»: kana → romaji (choose/type) or romaji → kana (choose). */
export function KanaExercise({ exercise, revealed, onReady, showRomaji }: ExerciseProps<E>) {
  const item = exercise.kanaId ? { kana: KANA_BY_ID[exercise.kanaId]!.char, romaji: KANA_BY_ID[exercise.kanaId]!.romaji, es: undefined as string | undefined } : { kana: WORD_BY_ID[exercise.wordId!]!.kana, romaji: WORD_BY_ID[exercise.wordId!]!.romaji, es: WORD_BY_ID[exercise.wordId!]!.es };
  const [selected, setSelected] = useState<string | null>(null);
  const [typed, setTyped] = useState('');
  const speak = useSpeak();

  useEffect(() => {
    setSelected(null);
    setTyped('');
  }, [exercise.uid]);

  const expected: Answer['expected'] = { jp: item.kana, romaji: item.romaji, es: item.es };
  const toRomaji = exercise.direction === 'kana-romaji';

  const options: Option[] = exercise.options.map((o) => ({
    id: o,
    correct: toRomaji ? o === item.romaji : o === item.kana,
    content: toRomaji ? <span className="text-lg">{o}</span> : <JpText className="text-2xl">{o}</JpText>,
  }));

  const select = (id: string) => {
    setSelected(id);
    onReady({ correct: toRomaji ? id === item.romaji : id === item.kana, expected });
  };

  const onType = (v: string) => {
    setTyped(v);
    if (!v.trim()) return onReady(null);
    const r = checkTyped(v, item.romaji);
    onReady({ correct: r !== 'wrong', near: r === 'near', expected });
  };

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm font-semibold text-ink-2">{toRomaji ? (exercise.wordId ? 'Lee la palabra' : 'Lee el kana') : 'Elige el kana'}</p>
      <div className="flex flex-col items-center gap-2 py-2">
        {toRomaji ? (
          <>
            <JpText as="p" className={`${exercise.wordId ? 'text-kana' : 'text-kana-lg'} leading-none`}>
              {item.kana}
            </JpText>
            {exercise.wordId && item.es && <p className="text-sm text-ink-2">{item.es}</p>}
            {revealed && showRomaji && <p className="text-base text-ink-2">{item.romaji}</p>}
          </>
        ) : (
          <p className="text-3xl font-bold">{item.romaji}</p>
        )}
        <SpeakerButton text={item.kana} size="sm" onSpeak={() => void 0} />
      </div>
      {exercise.mode === 'type' ? (
        <input
          type="text"
          inputMode="text"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          aria-label="Escribe el romaji"
          placeholder="Escribe el romaji"
          value={typed}
          disabled={revealed}
          onChange={(e) => onType(e.target.value)}
          className={`min-h-tap w-full rounded-stone border-2 bg-surface px-4 text-lg ${revealed ? (checkTyped(typed, item.romaji) !== 'wrong' ? 'border-moss-500' : 'border-ember-500') : 'border-line focus:border-primary'}`}
        />
      ) : (
        <OptionList options={options} selected={selected} revealed={revealed} onSelect={select} columns={2} />
      )}
      {!toRomaji && <button type="button" className="text-sm text-primary underline" onClick={() => void speak(item.kana)}>Oír la sílaba</button>}
    </div>
  );
}
