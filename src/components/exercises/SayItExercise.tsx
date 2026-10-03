import { useEffect } from 'react';
import { PHRASE_BY_ID, WORD_BY_ID } from '@/content';
import type { Exercise } from '@/domain/exercises';
import { JpText } from '@/components/ui/JpText';
import { SpeakerButton } from '@/components/ui/SpeakerButton';
import { SpeakCheck } from '@/components/speak/SpeakCheck';
import { useSpeak } from '@/audio/useSpeak';
import { isSttAvailable } from '@/audio/stt';
import type { ExerciseProps } from './types';

type E = Extract<Exercise, { type: 'E10' }>;

/** E10 «Dilo en voz alta»: hear it, say it; the microphone scores it when the browser can. */
export function SayItExercise({ exercise, onAutoComplete, showRomaji }: ExerciseProps<E>) {
  const item = exercise.phraseId
    ? (({ kana, romaji, es, speech, kanji }) => ({ kana, romaji, es, speech, kanji }))(PHRASE_BY_ID[exercise.phraseId]!)
    : (({ kana, romaji, es }) => ({ kana, romaji, es, speech: undefined, kanji: undefined }))(WORD_BY_ID[exercise.wordId!]!);
  const speak = useSpeak();

  useEffect(() => {
    const t = window.setTimeout(() => void speak(item.speech ?? item.kana), 300);
    return () => window.clearTimeout(t);
  }, [exercise.uid]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm font-semibold text-ink-2">Dilo en voz alta</p>
      <div className="rounded-stone border-2 border-primary/30 bg-surface p-5 text-center">
        <JpText as="p" className="text-kana leading-tight">
          {item.kana}
        </JpText>
        {showRomaji && <p className="mt-2 text-base text-ink-2">{item.romaji}</p>}
        <p className="mt-1 text-sm">{item.es}</p>
        <div className="mt-4 flex items-center justify-center gap-3">
          <SpeakerButton text={item.speech ?? item.kana} size="lg" label="Escuchar el modelo" />
        </div>
        <p className="mt-2 text-xs text-ink-2">Escucha el modelo (mantén pulsado para oírlo despacio) y repítelo.</p>
      </div>
      <SpeakCheck expected={{ kana: item.kana, kanji: item.kanji }} onResult={(o) => onAutoComplete({ correct: o.ok, expected: { jp: item.kana, romaji: item.romaji, es: item.es } })} />
      {isSttAvailable() && (
        <button type="button" className="text-center text-sm text-ink-2 underline" onClick={() => onAutoComplete({ correct: false, expected: {} })}>
          Saltar esta frase
        </button>
      )}
    </div>
  );
}
