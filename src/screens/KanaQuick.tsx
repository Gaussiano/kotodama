import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ALL_KANA, HIRAGANA, KANA_BY_ID } from '@/content';
import { learnedKanaIds } from '@/domain/lessonGenerator';
import { mulberry32, pick, sample, seedFromString, shuffle } from '@/domain/rng';
import { useProgressStore } from '@/store/progressStore';
import { useSfx } from '@/audio/useSfx';
import { JpText } from '@/components/ui/JpText';
import { Fuku } from '@/components/mascot/Fuku';

const SECONDS = 60;

interface Q {
  kanaId: string;
  options: string[]; // romaji
}

/** «Práctica rápida de 60 s» (spec §4.6): as many kana as you can; +1 mana per hit. */
export function KanaQuickScreen() {
  const navigate = useNavigate();
  const completedNodes = useProgressStore((s) => s.completedNodes);
  const finishLesson = useProgressStore((s) => s.finishLesson);
  const play = useSfx();
  const [left, setLeft] = useState(SECONDS);
  const [hits, setHits] = useState(0);
  const [misses, setMisses] = useState(0);
  const [q, setQ] = useState<Q | null>(null);
  const [flash, setFlash] = useState<{ id: string; ok: boolean } | null>(null);
  const [done, setDone] = useState(false);
  const rnd = useMemo(() => mulberry32(seedFromString(`quick-${Date.now()}`)), []);
  const started = useRef(false);

  const pool = useMemo(() => {
    const known = [...learnedKanaIds(completedNodes)];
    return known.length >= 5 ? known : HIRAGANA.filter((k) => k.group === 'basic').map((k) => k.id);
  }, [completedNodes]);

  const nextQ = () => {
    const kanaId = pick(pool, rnd);
    const k = KANA_BY_ID[kanaId]!;
    const same = ALL_KANA.filter((x) => x.script === k.script && x.romaji !== k.romaji);
    const options = shuffle([k.romaji, ...sample(same, 3, rnd).map((x) => x.romaji)], rnd);
    setQ({ kanaId, options });
  };

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    nextQ();
    const t = window.setInterval(() => setLeft((l) => l - 1), 1000);
    return () => window.clearInterval(t);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (left > 0 || done) return;
    setDone(true);
    finishLesson({ nodeId: 'kana:quick', kind: 'quick', items: {}, newItemIds: [], xp: hits, perfect: misses === 0, accuracy: hits + misses ? hits / (hits + misses) : 1, passed: true, durationSec: SECONDS, regionId: 'r1' });
  }, [left, done, hits, misses, finishLesson]);

  const answer = (romaji: string) => {
    if (!q || flash) return;
    const ok = romaji === KANA_BY_ID[q.kanaId]!.romaji;
    setFlash({ id: romaji, ok });
    play(ok ? 'tick' : 'wrong');
    if (ok) setHits((h) => h + 1);
    else setMisses((m) => m + 1);
    window.setTimeout(() => {
      setFlash(null);
      nextQ();
    }, ok ? 220 : 500);
  };

  if (done) {
    return (
      <main className="screen flex min-h-dvh flex-col items-center justify-center gap-4 text-center">
        <Fuku state={hits >= 15 ? 'happy' : 'neutral'} size={110} />
        <h1 className="font-display text-2xl">Práctica rápida</h1>
        <p className="text-3xl font-extrabold text-rune-gold">+{hits} de maná</p>
        <p className="text-ink-2">
          {hits} aciertos · {misses} fallos en 60 segundos
        </p>
        <button className="btn-primary" onClick={() => navigate(0)}>Otra vez</button>
        <button className="btn-secondary" onClick={() => navigate('/kana')}>Volver al dojo</button>
      </main>
    );
  }

  const k = q ? KANA_BY_ID[q.kanaId]! : null;
  return (
    <div className="fixed inset-0 flex flex-col bg-bg">
      <header className="mx-auto flex w-full max-w-app items-center justify-between px-4 pb-2" style={{ paddingTop: 'calc(var(--safe-top) + 0.5rem)' }}>
        <button type="button" aria-label="Salir" className="flex h-12 w-12 items-center justify-center rounded-full text-ink-2" onClick={() => navigate('/kana')}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" /></svg>
        </button>
        <p className={`text-2xl font-extrabold tabular-nums ${left <= 10 ? 'text-ember-500' : ''}`} aria-live="polite">
          {left}s
        </p>
        <p className="text-sm font-bold text-rune-gold">+{hits}</p>
      </header>
      <main className="mx-auto flex w-full max-w-app flex-1 flex-col justify-center px-4 pb-10">
        {k && (
          <>
            <JpText as="p" className="text-center text-[6rem] leading-none">
              {k.char}
            </JpText>
            <ul className="mt-8 grid grid-cols-2 gap-3">
              {q!.options.map((o) => {
                const tone = flash && flash.id === o ? (flash.ok ? 'border-moss-500 bg-moss-500/20' : 'border-ember-500 bg-ember-500/15') : flash && o === k.romaji ? 'border-moss-500' : 'border-line bg-surface';
                return (
                  <li key={o}>
                    <button type="button" onClick={() => answer(o)} className={`min-h-16 w-full rounded-stone border-2 text-xl font-bold ${tone}`}>
                      {o}
                    </button>
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </main>
    </div>
  );
}
