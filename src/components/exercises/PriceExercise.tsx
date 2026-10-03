import { useEffect, useState } from 'react';
import type { Exercise } from '@/domain/exercises';
import { formatNumberEs, toPriceReading } from '@/content/numbers';
import { JpText } from '@/components/ui/JpText';
import { SpeakerButton } from '@/components/ui/SpeakerButton';
import { useSpeak } from '@/audio/useSpeak';
import { OptionList, type Option } from './OptionList';
import type { ExerciseProps } from './types';

type E = Extract<Exercise, { type: 'E12' }>;

/** E12 «Precios»: pick the reading of a price, or hear a reading and type the figure. */
export function PriceExercise({ exercise, revealed, onReady, showRomaji }: ExerciseProps<E>) {
  const reading = toPriceReading(exercise.yen);
  const [selected, setSelected] = useState<string | null>(null);
  const [typed, setTyped] = useState('');
  const speak = useSpeak();

  useEffect(() => {
    setSelected(null);
    setTyped('');
    if (exercise.mode === 'type') {
      const t = window.setTimeout(() => void speak(reading.kana), 300);
      return () => window.clearTimeout(t);
    }
    return undefined;
  }, [exercise.uid]); // eslint-disable-line react-hooks/exhaustive-deps

  const expected = { jp: reading.kana, romaji: reading.romaji, es: `${formatNumberEs(exercise.yen)} ¥` };

  const options: Option[] = exercise.options.map((yen) => {
    const r = toPriceReading(yen);
    return {
      id: String(yen),
      correct: yen === exercise.yen,
      content: (
        <span className="block">
          <JpText className="text-lg">{r.kana}</JpText>
          {showRomaji && <span className="block text-sm text-ink-2">{r.romaji}</span>}
        </span>
      ),
    };
  });

  const select = (id: string) => {
    setSelected(id);
    onReady({ correct: Number(id) === exercise.yen, expected });
  };
  const onType = (v: string) => {
    setTyped(v);
    const n = Number(v.replace(/[^\d]/g, ''));
    if (!v.trim()) return onReady(null);
    onReady({ correct: n === exercise.yen, expected });
  };

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm font-semibold text-ink-2">Precios</p>
      {exercise.mode === 'choose' ? (
        <>
          <p className="text-3xl font-extrabold tracking-tight">{formatNumberEs(exercise.yen)} ¥</p>
          <p className="text-sm text-ink-2">¿Cómo se lee?</p>
          <OptionList options={options} selected={selected} revealed={revealed} onSelect={select} trailing={(o) => <SpeakerButton text={toPriceReading(Number(o.id)).kana} className="self-center" />} />
        </>
      ) : (
        <>
          <div className="flex flex-col items-center gap-2 py-2">
            <SpeakerButton text={reading.kana} size="lg" label="Escuchar el precio" />
            <p className="text-xs text-ink-2">Escucha el precio y escribe la cifra</p>
            {revealed && <JpText className="text-lg">{reading.kana}</JpText>}
          </div>
          <div className="flex items-center gap-2">
            <input
              type="text"
              inputMode="numeric"
              aria-label="Cifra en yenes"
              placeholder="0"
              value={typed}
              disabled={revealed}
              onChange={(e) => onType(e.target.value)}
              className={`min-h-tap w-full rounded-stone border-2 bg-surface px-4 text-right text-2xl font-bold ${revealed ? (Number(typed.replace(/[^\d]/g, '')) === exercise.yen ? 'border-moss-500' : 'border-ember-500') : 'border-line focus:border-primary'}`}
            />
            <span className="text-2xl font-bold">¥</span>
          </div>
        </>
      )}
    </div>
  );
}
