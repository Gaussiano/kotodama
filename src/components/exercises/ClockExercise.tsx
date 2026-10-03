import { useEffect, useState } from 'react';
import type { Exercise } from '@/domain/exercises';
import { toClockReading } from '@/content/clock';
import { JpText } from '@/components/ui/JpText';
import { SpeakerButton } from '@/components/ui/SpeakerButton';
import { OptionList, type Option } from './OptionList';
import type { ExerciseProps } from './types';

type E = Extract<Exercise, { type: 'E13' }>;

/** E13 «Horas»: a simple analog clock → choose the reading. */
export function ClockExercise({ exercise, revealed, onReady, showRomaji }: ExerciseProps<E>) {
  const target = toClockReading(exercise.hour, exercise.half);
  const [selected, setSelected] = useState<string | null>(null);
  useEffect(() => setSelected(null), [exercise.uid]);

  const key = (h: number, half: boolean) => `${h}-${half ? 30 : 0}`;
  const options: Option[] = exercise.options.map((o) => {
    const r = toClockReading(o.hour, o.half);
    return {
      id: key(o.hour, o.half),
      correct: o.hour === exercise.hour && o.half === exercise.half,
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
    onReady({ correct: id === key(exercise.hour, exercise.half), expected: { jp: target.kana, romaji: target.romaji, es: `las ${target.es}` } });
  };

  const hourAngle = ((exercise.hour % 12) + (exercise.half ? 0.5 : 0)) * 30;
  const minuteAngle = exercise.half ? 180 : 0;

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm font-semibold text-ink-2">Horas</p>
      <div className="flex items-center justify-center gap-6">
        <svg width="150" height="150" viewBox="0 0 100 100" role="img" aria-label={`Reloj: las ${target.es}`}>
          <circle cx="50" cy="50" r="46" fill="rgb(var(--c-surface))" stroke="rgb(var(--c-bark-600))" strokeWidth="3" />
          {Array.from({ length: 12 }, (_, i) => (
            <line key={i} x1="50" y1="8" x2="50" y2={i % 3 === 0 ? 16 : 12} stroke="rgb(var(--c-ink))" strokeWidth={i % 3 === 0 ? 3 : 1.5} transform={`rotate(${i * 30} 50 50)`} />
          ))}
          <line x1="50" y1="50" x2="50" y2="26" stroke="rgb(var(--c-ink))" strokeWidth="4" strokeLinecap="round" transform={`rotate(${hourAngle} 50 50)`} />
          <line x1="50" y1="50" x2="50" y2="16" stroke="rgb(var(--c-forest-700))" strokeWidth="2.5" strokeLinecap="round" transform={`rotate(${minuteAngle} 50 50)`} />
          <circle cx="50" cy="50" r="3" fill="rgb(var(--c-rune-gold))" />
        </svg>
        <div className="text-center">
          <p className="text-3xl font-extrabold">
            {exercise.hour}:{exercise.half ? '30' : '00'}
          </p>
          {revealed && <SpeakerButton text={target.kana} size="sm" />}
        </div>
      </div>
      <OptionList options={options} selected={selected} revealed={revealed} onSelect={select} columns={2} />
    </div>
  );
}
