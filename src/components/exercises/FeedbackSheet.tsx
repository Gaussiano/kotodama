import { JpText } from '@/components/ui/JpText';
import { SpeakerButton } from '@/components/ui/SpeakerButton';
import type { Answer } from './types';

const PRAISE = ['¡Bien lanzado!', 'Hechizo correcto', 'Eso es'];

type Props = { answer: Answer; index: number; onContinue: () => void; showRomaji: boolean };

/** Slides up from the bottom: moss when right, ember when wrong (spec §4.3, §3.7). */
export function FeedbackSheet({ answer, index, onContinue, showRomaji }: Props) {
  const ok = answer.correct;
  const title = ok ? (answer.near ? 'Casi perfecto' : PRAISE[index % PRAISE.length]) : 'Era:';
  const bg = ok ? 'bg-moss-500/15 border-moss-500' : 'bg-ember-500/10 border-ember-500';
  const jp = answer.expected.jp;
  return (
    <div
      role="status"
      aria-live="polite"
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
      <button className="btn-primary mt-4" onClick={onContinue} autoFocus>
        Continuar
      </button>
    </div>
  );
}
