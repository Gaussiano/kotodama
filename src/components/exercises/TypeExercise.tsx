import { useEffect, useRef, useState } from 'react';
import { bind, unbind } from 'wanakana';
import { PHRASE_BY_ID } from '@/content';
import type { Exercise } from '@/domain/exercises';
import { checkTyped, stripBlank } from '@/domain/answerCheck';
import { SpeakerButton } from '@/components/ui/SpeakerButton';
import type { ExerciseProps } from './types';

type E = Extract<Exercise, { type: 'E6' }>;

/** E6 «Escríbelo»: type romaji or kana (live conversion with wanakana.bind). */
export function TypeExercise({ exercise, revealed, onReady }: ExerciseProps<E>) {
  const p = PHRASE_BY_ID[exercise.phraseId]!;
  const [value, setValue] = useState('');
  const [kanaMode, setKanaMode] = useState(false);
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setValue('');
    setKanaMode(false);
    onReady(null);
  }, [exercise.uid]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (kanaMode) bind(el, { IMEMode: true });
    return () => {
      if (kanaMode) unbind(el);
    };
  }, [kanaMode]);

  const evaluate = (v: string) => {
    setValue(v);
    if (!v.trim()) return onReady(null);
    const r = checkTyped(v, stripBlank(p.romaji), [stripBlank(p.kana)]);
    onReady({ correct: r !== 'wrong', near: r === 'near', expected: { jp: p.kana, romaji: p.romaji, es: p.es, note: p.note, speech: p.speech } });
  };

  const state = revealed ? checkTyped(value, stripBlank(p.romaji), [stripBlank(p.kana)]) : null;

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm font-semibold text-ink-2">Escríbelo</p>
      <p className="text-lg font-bold">{p.es}</p>
      <input
        ref={ref}
        type="text"
        lang={kanaMode ? 'ja' : 'en'}
        autoCapitalize="none"
        autoCorrect="off"
        autoComplete="off"
        spellCheck={false}
        aria-label={kanaMode ? 'Escribe en kana' : 'Escribe en romaji'}
        placeholder={kanaMode ? 'Escribe (se convierte en kana)' : 'Escribe en romaji'}
        value={value}
        disabled={revealed}
        onChange={(e) => evaluate(e.target.value)}
        onInput={(e) => evaluate((e.target as HTMLInputElement).value)}
        className={`min-h-tap w-full rounded-stone border-2 bg-surface px-4 text-lg ${kanaMode ? 'font-kana' : ''} ${state ? (state !== 'wrong' ? 'border-moss-500' : 'border-ember-500') : 'border-line focus:border-primary'}`}
      />
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={kanaMode} onChange={(e) => setKanaMode(e.target.checked)} disabled={revealed} className="h-5 w-5 accent-[rgb(var(--c-primary))]" />
        Escribir en kana
      </label>
      {revealed && (
        <div className="flex items-center gap-2 text-sm text-ink-2">
          <SpeakerButton text={p.speech ?? p.kana} size="sm" />
          <span>Escúchalo otra vez</span>
        </div>
      )}
    </div>
  );
}
