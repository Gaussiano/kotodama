import { useEffect } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { JpText } from '@/components/ui/JpText';
import { SpeakerButton } from '@/components/ui/SpeakerButton';
import { SpellCircle } from '@/components/magic/SpellCircle';
import { useSfx } from '@/audio/useSfx';
import type { Answer } from './types';

const PRAISE = ['¡Bien lanzado!', 'Hechizo correcto', 'Eso es'];

type Props = { answer: Answer; index: number; onContinue: () => void; showRomaji: boolean };

/** Slides up from the bottom: moss when right, ember when wrong (spec §4.3, §3.7). */
export function FeedbackSheet({ answer, index, onContinue, showRomaji }: Props) {
  const ok = answer.correct;
  const reduced = useReducedMotion();
  const play = useSfx();
  useEffect(() => {
    play(ok ? 'correct' : 'wrong');
  }, [ok, play]);

  const title = ok ? (answer.near ? 'Casi perfecto' : PRAISE[index % PRAISE.length]) : 'Era:';
  const bg = ok ? 'bg-moss-500/15 border-moss-500' : 'bg-ember-500/10 border-ember-500';
  const jp = answer.expected.jp;
  return (
    <motion.div
      role="status"
      aria-live="polite"
      initial={reduced ? { opacity: 0 } : { y: 80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 420, damping: 34 }}
      className={`fixed inset-x-0 bottom-0 z-30 mx-auto max-w-app rounded-t-stone border-t-4 bg-elevated px-4 pt-4 ${bg}`}
      style={{ paddingBottom: 'calc(var(--safe-bottom) + 1rem)' }}
    >
      <p className={`text-lg font-extrabold ${ok ? 'text-moss-500' : 'text-ember-500'}`}>{title}</p>
      {jp && (ok ? answer.near : true) && (
        <div className="mt-2 flex items-center gap-3">
          <SpeakerButton text={answer.expected.speech ?? jp} size="sm" />
          <div className="min-w-0">
            <JpText as="p" className="text-xl leading-snug">
              {answer.near ? `Fíjate: ${jp}` : jp}
            </JpText>
            {showRomaji && answer.expected.romaji && <p className="text-sm text-ink-2">{answer.expected.romaji}</p>}
            {answer.expected.es && <p className="text-sm">{answer.expected.es}</p>}
          </div>
        </div>
      )}
      {!ok && answer.expected.note && <p className="mt-2 text-sm text-ink-2">{answer.expected.note}</p>}
      <div className="relative mt-4">
        {ok && (
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <SpellCircle kana={jp ?? '言霊'} size={240} mode="burst" />
          </div>
        )}
        <button className="btn-primary relative" onClick={onContinue} autoFocus>
          Continuar
        </button>
      </div>
    </motion.div>
  );
}
