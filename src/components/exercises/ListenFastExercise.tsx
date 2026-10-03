import { useEffect, useState } from 'react';
import { PHRASE_BY_ID } from '@/content';
import type { Exercise } from '@/domain/exercises';
import { speak } from '@/audio/tts';
import { useSettingsStore } from '@/store/settingsStore';
import { JpText } from '@/components/ui/JpText';
import { Furigana } from '@/components/ui/Furigana';
import { OptionList, type Option } from './OptionList';
import type { ExerciseProps } from './types';

type E = Extract<Exercise, { type: 'E16' }>;

export function listenText(phraseId: string, fill?: { kana: string; es: string }) {
  const p = PHRASE_BY_ID[phraseId]!;
  const kana = fill ? p.kana.replace(/＿+/g, fill.kana) : p.kana;
  const es = fill ? p.es.replace(/＿+/g, fill.es) : p.es;
  const kanji = p.kanji ? (fill ? p.kanji.replace(/＿+/g, fill.kana) : p.kanji) : undefined;
  return { kana, es, kanji, romaji: p.romaji, speech: p.speech };
}

const SPEED_LABEL = (rate: number) => (rate >= 1.25 ? 'muy rápido' : rate >= 1.1 ? 'rápido' : 'normal');

/** E16 «Oído rápido»: audio only at natural or faster speed, no slow replay, choose the meaning. */
export function ListenFastExercise({ exercise, revealed, onReady }: ExerciseProps<E>) {
  const voiceURI = useSettingsStore((s) => s.voiceURI);
  const target = listenText(exercise.phraseId, exercise.fill);
  const [selected, setSelected] = useState<string | null>(null);
  const [plays, setPlays] = useState(0);
  const key = (o: { phraseId: string; fill?: { kana: string } }) => `${o.phraseId}|${o.fill?.kana ?? ''}`;
  const targetKey = key(exercise);

  const play = () => {
    setPlays((n) => n + 1);
    void speak(target.speech ?? target.kana, { rate: exercise.rate, voiceURI });
  };

  useEffect(() => {
    setSelected(null);
    setPlays(0);
    if (exercise.textOnly) return undefined;
    const t = window.setTimeout(play, 350);
    return () => window.clearTimeout(t);
  }, [exercise.uid]); // eslint-disable-line react-hooks/exhaustive-deps

  const options: Option[] = exercise.options.map((o) => ({ id: key(o), correct: key(o) === targetKey, content: <span>{listenText(o.phraseId, o.fill).es}</span> }));
  const select = (id: string) => {
    setSelected(id);
    onReady({ correct: id === targetKey, expected: { jp: target.kana, romaji: target.romaji, es: target.es, speech: target.speech } });
  };

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm font-semibold text-ink-2">Oído rápido · {SPEED_LABEL(exercise.rate)}</p>
      {exercise.textOnly && (
        <div className="flex flex-col items-center gap-1 py-2 text-center">
          <JpText as="p" className="text-2xl">
            {target.kana}
          </JpText>
          <p className="text-xs text-ink-2">Sin voz japonesa en este dispositivo: léelo y elige qué significa.</p>
        </div>
      )}
      <div className={`flex flex-col items-center gap-2 py-2 ${exercise.textOnly ? 'hidden' : ''}`}>
        <button type="button" onClick={play} aria-label="Escuchar otra vez" className="flex h-24 w-24 items-center justify-center rounded-full bg-mana-500 text-white active:scale-95">
          <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M4 9v6h4l5 4V5L8 9z" />
            <path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12" />
          </svg>
        </button>
        <p className="text-xs text-ink-2">Sin texto y sin versión lenta, como en la calle. {plays > 2 ? 'Intenta acertar a la primera.' : ''}</p>
        {revealed && (
          <div className="text-center">
            <JpText as="p" className="text-xl">
              {target.kana}
            </JpText>
            {target.kanji && <Furigana as="p" text={target.kanji} className="text-base leading-loose text-ink-2" />}
          </div>
        )}
      </div>
      <OptionList options={options} selected={selected} revealed={revealed} onSelect={select} />
    </div>
  );
}
