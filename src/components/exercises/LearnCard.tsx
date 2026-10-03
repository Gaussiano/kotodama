import { useEffect } from 'react';
import { PHRASE_BY_ID, WORD_BY_ID, CARD_BY_ID } from '@/content';
import type { Exercise } from '@/domain/exercises';
import { JpText } from '@/components/ui/JpText';
import { SpeakerButton } from '@/components/ui/SpeakerButton';
import { Markdown } from '@/components/ui/Markdown';
import { useSpeak } from '@/audio/useSpeak';
import { useSettingsStore } from '@/store/settingsStore';
import type { ExerciseProps } from './types';

/** E1 «Nuevo hechizo»: kana big, romaji, translation, usage note, auto audio. */
export function LearnCard({ exercise, showRomaji }: ExerciseProps<Extract<Exercise, { type: 'E1' }>>) {
  const p = PHRASE_BY_ID[exercise.phraseId]!;
  const speak = useSpeak();
  const userName = useSettingsStore((s) => s.userName);
  const fill = p.id === 'r1-p13' ? userName : undefined;
  useEffect(() => {
    const t = window.setTimeout(() => void speak(p.speech ?? p.kana, { fill }), 250);
    return () => window.clearTimeout(t);
  }, [p, speak, fill]);

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm font-semibold text-ink-2">{exercise.listenMode ? 'Lo que te dirán' : 'Nuevo hechizo'}</p>
      <div className="rounded-stone border-2 border-primary/30 bg-surface p-5">
        <JpText as="p" className="text-kana leading-tight">
          {p.kana}
        </JpText>
        {showRomaji && <p className="mt-2 text-base text-ink-2">{p.romaji}</p>}
        <p className="mt-3 text-lg font-bold">{p.es}</p>
        {p.note && <p className="mt-2 text-sm text-ink-2">{p.note}</p>}
        <div className="mt-4 flex items-center gap-3">
          <SpeakerButton text={p.speech ?? p.kana} fill={fill} />
          <span className="text-xs text-ink-2">Mantén pulsado para oírlo despacio</span>
        </div>
      </div>
    </div>
  );
}

/** E1 for practice words (kana nodes). */
export function WordCard({ exercise, showRomaji }: ExerciseProps<Extract<Exercise, { type: 'E1word' }>>) {
  const w = WORD_BY_ID[exercise.wordId]!;
  const speak = useSpeak();
  useEffect(() => {
    const t = window.setTimeout(() => void speak(w.kana), 250);
    return () => window.clearTimeout(t);
  }, [w, speak]);
  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm font-semibold text-ink-2">Palabra de práctica</p>
      <div className="rounded-stone border-2 border-primary/30 bg-surface p-5 text-center">
        <JpText as="p" className="text-kana-lg leading-none">
          {w.kana}
        </JpText>
        {showRomaji && <p className="mt-3 text-lg text-ink-2">{w.romaji}</p>}
        <p className="mt-2 text-lg font-bold">{w.es}</p>
        <SpeakerButton text={w.kana} className="mt-4" />
      </div>
    </div>
  );
}

/** Grammar / culture / pronunciation / alert cards. */
export function InfoCardView({ exercise }: ExerciseProps<Extract<Exercise, { type: 'E1card' }>>) {
  const c = CARD_BY_ID[exercise.cardId]!;
  const label = { grammar: 'Gramática', culture: 'Saber del bosque', pronunciation: 'Pronunciación', alert: 'Aviso' }[c.type];
  const tone = c.type === 'alert' ? 'border-rune-gold bg-rune-gold/10' : c.type === 'culture' ? 'border-bark-600/40 bg-parchment-100 text-forest-900' : 'border-primary/30 bg-surface';
  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm font-semibold text-ink-2">{label}</p>
      <div className={`rounded-stone border-2 p-5 ${tone}`}>
        <h2 className="font-display text-xl">{c.title}</h2>
        <Markdown text={c.body} className="mt-3 text-base" />
        {c.examples && (
          <ul className="mt-4 space-y-2">
            {c.examples.map((ex, i) => (
              <li key={i} className="flex items-center gap-3 rounded-xl bg-ink/5 px-3 py-2">
                <SpeakerButton text={ex.jp} size="sm" />
                <div className="min-w-0">
                  <JpText as="p" className="text-lg leading-tight">
                    {ex.jp}
                  </JpText>
                  <p className="text-sm text-ink-2">
                    {ex.romaji} · {ex.es}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
