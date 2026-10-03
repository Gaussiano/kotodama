import { useEffect, useState } from 'react';
import { PHRASE_BY_ID } from '@/content';
import type { Exercise } from '@/domain/exercises';
import { JpText } from '@/components/ui/JpText';
import { SpeakerButton } from '@/components/ui/SpeakerButton';
import { useSfx } from '@/audio/useSfx';
import type { ExerciseProps } from './types';

type E = Extract<Exercise, { type: 'E5' }>;

/** E5 «Construye la frase»: tap tiles to place them, tap again to remove. Exact segment order. */
export function BuildExercise({ exercise, revealed, onReady, showRomaji }: ExerciseProps<E>) {
  const p = PHRASE_BY_ID[exercise.phraseId]!;
  const [placed, setPlaced] = useState<number[]>([]); // indexes into tiles
  const play = useSfx();

  useEffect(() => setPlaced([]), [exercise.uid]);

  const update = (next: number[]) => {
    setPlaced(next);
    if (next.length === 0) return onReady(null);
    const built = next.map((i) => exercise.tiles[i]);
    const correct = built.length === p.segments.length && built.every((t, i) => t === p.segments[i]);
    onReady({ correct, expected: { jp: p.kana, romaji: p.romaji, es: p.es, note: p.note, speech: p.speech } });
  };

  const place = (i: number) => {
    if (revealed || placed.includes(i)) return;
    play('tick');
    update([...placed, i]);
  };
  const remove = (i: number) => {
    if (revealed) return;
    update(placed.filter((x) => x !== i));
  };

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm font-semibold text-ink-2">Construye la frase</p>
      <p className="text-lg font-bold">{p.es}</p>
      <div
        className={`flex min-h-[4.5rem] flex-wrap items-center gap-2 rounded-stone border-2 border-dashed px-3 py-2 ${revealed ? 'border-line' : 'border-primary/40'}`}
        aria-label="Tu frase"
      >
        {placed.length === 0 && <span className="text-sm text-ink-2">Toca las fichas en orden</span>}
        {placed.map((i) => (
          <button key={i} type="button" onClick={() => remove(i)} className="min-h-tap rounded-xl border-2 border-primary bg-primary/10 px-3 py-1" aria-label={`Quitar ${exercise.tiles[i]}`}>
            <JpText className="text-xl">{exercise.tiles[i]}</JpText>
          </button>
        ))}
      </div>
      <div className="flex flex-wrap gap-2" aria-label="Fichas">
        {exercise.tiles.map((t, i) => {
          const used = placed.includes(i);
          return (
            <button key={i} type="button" disabled={used || revealed} onClick={() => place(i)} className={`min-h-tap rounded-xl border-2 px-3 py-1 ${used ? 'border-transparent bg-ink/5 text-transparent' : 'border-line bg-surface'}`} aria-hidden={used}>
              <JpText className="text-xl">{t}</JpText>
            </button>
          );
        })}
      </div>
      {revealed && (
        <div className="flex items-center gap-2 text-sm text-ink-2">
          <SpeakerButton text={p.speech ?? p.kana} size="sm" />
          {showRomaji && <span>{p.romaji}</span>}
        </div>
      )}
    </div>
  );
}
