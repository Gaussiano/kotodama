import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ALL_KANA, CATEGORY_LABEL, PHRASES, WORDS, type Category } from '@/content';
import { learnedKanaIds, learnedPhraseIds, learnedWordIds } from '@/domain/lessonGenerator';
import { mulberry32, sample, seedFromString } from '@/domain/rng';
import { romajiVisible } from '@/domain/romaji';
import { useProgressStore } from '@/store/progressStore';
import { useSettingsStore } from '@/store/settingsStore';
import { useSpeak } from '@/audio/useSpeak';
import { JpText } from '@/components/ui/JpText';
import { SpeakerButton } from '@/components/ui/SpeakerButton';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { SpeakCheck, type SpeakOutcome } from '@/components/speak/SpeakCheck';
import { Fuku } from '@/components/mascot/Fuku';

interface Item {
  id: string;
  kana: string;
  romaji: string;
  es: string;
  kanji?: string;
  speech?: string;
  regionId: 'r0' | 'r1' | 'r2' | 'r3' | 'r4';
}

/** Pronunciation session by topic: up to 10 learned phrases, each judged by the microphone. */
export function PronounceScreen() {
  const { topic = 'basics' } = useParams();
  const navigate = useNavigate();
  const progress = useProgressStore();
  const romajiMode = useSettingsStore((s) => s.romajiMode);
  const speak = useSpeak();
  const [i, setI] = useState(0);
  const [results, setResults] = useState<Record<string, SpeakOutcome>>({});
  const [done, setDone] = useState(false);

  const items = useMemo<Item[]>(() => {
    const rnd = mulberry32(seedFromString(`${topic}-${Date.now()}`));
    if (topic === 'kana') {
      const known = learnedKanaIds(progress.completedNodes);
      const kanaPool = ALL_KANA.filter((k) => known.has(k.id));
      const wordPool = WORDS.filter((w) => learnedWordIds(progress.completedNodes).has(w.id));
      const pool: Item[] = [
        ...wordPool.map((w) => ({ id: w.id, kana: w.kana, romaji: w.romaji, es: w.es, regionId: w.regionId })),
        ...kanaPool.map((k) => ({ id: k.id, kana: k.char, romaji: k.romaji, es: `sílaba ${k.romaji}`, regionId: 'r0' as const })),
      ];
      const base = pool.length ? pool : WORDS.slice(0, 8).map((w) => ({ id: w.id, kana: w.kana, romaji: w.romaji, es: w.es, regionId: w.regionId }));
      return sample(base, 10, rnd);
    }
    const learned = learnedPhraseIds(progress.completedNodes);
    const all = PHRASES.filter((p) => !p.hidden && (topic === 'hear' ? p.kind === 'hear' : p.kind === 'say' && p.category === topic));
    const known = all.filter((p) => learned.has(p.id));
    const pool = known.length >= 5 ? known : all;
    return sample(pool, 10, rnd).map((p) => ({ id: p.id, kana: p.kana, romaji: p.romaji, es: p.es, kanji: p.kanji, speech: p.speech, regionId: p.regionId }));
  }, [topic]); // eslint-disable-line react-hooks/exhaustive-deps

  const current = items[i];

  useEffect(() => {
    if (!current) return;
    const t = window.setTimeout(() => void speak(current.speech ?? current.kana), 300);
    return () => window.clearTimeout(t);
  }, [current, speak]);

  const onResult = (o: SpeakOutcome) => {
    if (!current) return;
    const next = { ...results, [current.id]: o };
    setResults(next);
    if (i + 1 >= items.length) {
      const passed = Object.entries(next).filter(([, r]) => r.ok).map(([id]) => id);
      const score = items.length ? Object.values(next).reduce((a, r) => a + r.score, 0) / items.length : 0;
      progress.finishLesson({
        nodeId: `pronounce-${topic}`,
        kind: 'talk',
        items: {},
        newItemIds: [],
        xp: 0,
        perfect: passed.length === items.length,
        accuracy: score,
        passed: true,
        durationSec: 0,
        regionId: current.regionId,
        spokenItems: passed,
        pronouncedCount: Object.values(next).filter((r) => r.ok && r.mode === 'stt').length,
        pronounceTopic: { topic, score },
      });
      setDone(true);
    } else setI(i + 1);
  };

  const title = topic === 'kana' ? 'Sonidos y kana' : CATEGORY_LABEL[topic as Category | 'hear'];

  if (items.length === 0) {
    return (
      <main className="screen py-8">
        <p>Aún no has aprendido frases de este tema.</p>
        <button className="btn-primary mt-4" onClick={() => navigate('/talk')}>Volver</button>
      </main>
    );
  }

  if (done) {
    const ok = Object.values(results).filter((r) => r.ok).length;
    return (
      <main className="screen flex min-h-dvh flex-col gap-5 py-8">
        <div className="flex flex-col items-center text-center">
          <Fuku state={ok >= items.length * 0.7 ? 'happy' : 'neutral'} size={110} />
          <h1 className="mt-3 font-display text-2xl">Pronunciación · {title}</h1>
          <p className="mt-1 text-ink-2">
            {ok} de {items.length} frases bien dichas · +{ok} de maná (una vez al día por frase)
          </p>
        </div>
        <ul className="space-y-2">
          {items.map((it) => {
            const r = results[it.id];
            return (
              <li key={it.id} className="flex items-center justify-between gap-2 rounded-stone bg-surface px-3 py-2">
                <span>
                  <JpText className="text-lg">{it.kana}</JpText>
                  <span className="block text-xs text-ink-2">{it.es}</span>
                </span>
                <span className={`text-sm font-bold ${r?.ok ? 'text-moss-500' : 'text-ember-500'}`}>{r ? `${Math.round(r.score * 100)} %` : '—'}</span>
              </li>
            );
          })}
        </ul>
        <div className="mt-auto flex flex-col gap-2">
          <button className="btn-primary" onClick={() => navigate(0)}>Otra ronda</button>
          <button className="btn-secondary" onClick={() => navigate('/talk')}>Volver a Hablar</button>
        </div>
      </main>
    );
  }

  const showRomaji = romajiVisible(romajiMode, current!.regionId, false);

  return (
    <div className="fixed inset-0 flex flex-col bg-bg">
      <header className="mx-auto flex w-full max-w-app items-center gap-3 px-4 pb-2" style={{ paddingTop: 'calc(var(--safe-top) + 0.5rem)' }}>
        <button type="button" aria-label="Salir" className="flex h-12 w-12 items-center justify-center rounded-full text-ink-2" onClick={() => navigate('/talk')}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" /></svg>
        </button>
        <ProgressBar value={i} max={items.length} className="flex-1" tone="mana" />
        <span className="text-xs font-bold text-ink-2">{i + 1}/{items.length}</span>
      </header>
      <main className="mx-auto w-full max-w-app flex-1 overflow-y-auto px-4 pb-10 pt-2">
        <p className="text-sm font-semibold text-ink-2">Pronunciación · {title}</p>
        <div className="mt-3 rounded-stone border-2 border-mana-500/40 bg-surface p-5 text-center">
          <JpText as="p" className={`${current!.kana.length <= 2 ? 'text-kana-lg' : 'text-kana'} leading-tight`}>
            {current!.kana}
          </JpText>
          {showRomaji && <p className="mt-2 text-base text-ink-2">{current!.romaji}</p>}
          <p className="mt-1 text-sm">{current!.es}</p>
          <SpeakerButton text={current!.speech ?? current!.kana} size="lg" className="mt-4" label="Escuchar el modelo" />
        </div>
        <div className="mt-4">
          <SpeakCheck key={current!.id} expected={{ kana: current!.kana, kanji: current!.kanji }} onResult={onResult} />
        </div>
        <button type="button" className="mt-4 w-full text-center text-sm text-ink-2 underline" onClick={() => onResult({ ok: false, score: 0, mode: 'self' })}>
          Saltar esta frase
        </button>
      </main>
    </div>
  );
}
