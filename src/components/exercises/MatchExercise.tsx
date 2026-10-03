import { useEffect, useMemo, useState } from 'react';
import { KANA_BY_ID, PHRASE_BY_ID, WORD_BY_ID } from '@/content';
import type { Exercise } from '@/domain/exercises';
import { JpText } from '@/components/ui/JpText';
import { useSpeak } from '@/audio/useSpeak';
import type { ExerciseProps } from './types';

type E = Extract<Exercise, { type: 'E7' }>;

interface Card {
  pairId: string;
  side: 'left' | 'right';
  text: string;
  jp: boolean;
  speech?: string;
}

function pairsFor(ex: E): { id: string; left: string; right: string; speech?: string }[] {
  return ex.pairIds.map((id) => {
    if (ex.mode === 'kana') {
      const k = KANA_BY_ID[id]!;
      return { id, left: k.char, right: k.romaji, speech: k.char };
    }
    if (ex.mode === 'word') {
      const w = WORD_BY_ID[id]!;
      return { id, left: w.kana, right: w.romaji, speech: w.kana };
    }
    const p = PHRASE_BY_ID[id]!;
    return { id, left: p.kana, right: p.es, speech: p.speech ?? p.kana };
  });
}

function deterministicShuffle<T>(arr: T[], salt: string): T[] {
  // Stable per exercise uid so re-renders don't reshuffle.
  let h = 0;
  for (const ch of salt) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    h = (h * 1103515245 + 12345) >>> 0;
    const j = h % (i + 1);
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

/** E7 «Empareja»: two columns; matched pairs light up and vanish. One wrong pair = exercise failed. */
export function MatchExercise({ exercise, onAutoComplete }: ExerciseProps<E>) {
  const pairs = useMemo(() => pairsFor(exercise), [exercise]);
  const left = useMemo<Card[]>(() => deterministicShuffle(pairs.map((p) => ({ pairId: p.id, side: 'left' as const, text: p.left, jp: true, speech: p.speech })), exercise.uid + 'L'), [pairs, exercise.uid]);
  const right = useMemo<Card[]>(() => deterministicShuffle(pairs.map((p) => ({ pairId: p.id, side: 'right' as const, text: p.right, jp: false })), exercise.uid + 'R'), [pairs, exercise.uid]);
  const [picked, setPicked] = useState<Card | null>(null);
  const [done, setDone] = useState<Set<string>>(new Set());
  const [shake, setShake] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  const speak = useSpeak();

  useEffect(() => {
    setPicked(null);
    setDone(new Set());
    setFailed(false);
  }, [exercise.uid]);

  useEffect(() => {
    if (done.size === pairs.length && pairs.length > 0) {
      const t = window.setTimeout(() => onAutoComplete({ correct: !failed, expected: {} }), 350);
      return () => window.clearTimeout(t);
    }
    return undefined;
  }, [done, pairs.length, failed, onAutoComplete]);

  const tap = (card: Card) => {
    if (done.has(card.pairId)) return;
    if (card.jp && card.speech) void speak(card.speech);
    if (!picked || picked.side === card.side) {
      setPicked(card);
      return;
    }
    if (picked.pairId === card.pairId) {
      setDone((d) => new Set([...d, card.pairId]));
      setPicked(null);
    } else {
      setFailed(true);
      setShake(card.pairId + card.side);
      window.setTimeout(() => setShake(null), 400);
      setPicked(null);
    }
  };

  const render = (card: Card) => {
    const isDone = done.has(card.pairId);
    const isPicked = picked?.pairId === card.pairId && picked.side === card.side;
    const isShake = shake === card.pairId + card.side;
    const tone = isDone ? 'border-moss-500 bg-moss-500/20 opacity-40' : isShake ? 'border-ember-500 bg-ember-500/10' : isPicked ? 'border-primary bg-primary/10' : 'border-line bg-surface';
    return (
      <button
        key={card.side + card.pairId}
        type="button"
        disabled={isDone}
        onClick={() => tap(card)}
        aria-pressed={isPicked}
        className={`min-h-tap w-full rounded-stone border-2 px-3 py-2 text-left transition-all ${tone}`}
      >
        {card.jp ? <JpText className={exercise.mode === 'kana' ? 'text-2xl' : 'text-base leading-snug'}>{card.text}</JpText> : <span className="text-base">{card.text}</span>}
      </button>
    );
  };

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm font-semibold text-ink-2">Empareja</p>
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-2">{left.map(render)}</div>
        <div className="flex flex-col gap-2">{right.map(render)}</div>
      </div>
      {failed && <p className="text-sm text-ember-500">Un par no era. Sigue hasta emparejarlos todos.</p>}
    </div>
  );
}
