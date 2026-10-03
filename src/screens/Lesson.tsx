import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { NODE_BY_ID, PHRASE_BY_ID, REGION_BY_ID } from '@/content';
import { generateLesson, retryExercise, type LessonPlan } from '@/domain/lessonGenerator';
import { buildVirtualPlan, parseVirtualId, virtualNode } from '@/domain/sessions';
import type { Exercise } from '@/domain/exercises';
import { mulberry32, seedFromString } from '@/domain/rng';
import { localDayKey } from '@/domain/dates';
import { computeXp } from '@/domain/xp';
import { romajiHintAvailable, romajiVisible } from '@/domain/romaji';
import { useProgressStore } from '@/store/progressStore';
import { useSettingsStore } from '@/store/settingsStore';
import { ensureVoicesLoaded, hasJapaneseVoice, cancelSpeech } from '@/audio/tts';
import { ExerciseView } from '@/components/exercises/ExerciseView';
import { FeedbackSheet } from '@/components/exercises/FeedbackSheet';
import type { Answer } from '@/components/exercises/types';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { HeartBar } from '@/components/ui/HeartBar';
import { ResultsScreen, type LessonSummary } from './Results';

type Status = 'loading' | 'running' | 'done' | 'noHearts';

interface ItemResult {
  failed: boolean;
  isNew: boolean;
}

export function LessonScreen() {
  const { nodeId = '' } = useParams();
  const [searchParams] = useSearchParams();
  const skipExam = searchParams.get('skip') === '1';
  const navigate = useNavigate();
  const virtualSpec = parseVirtualId(nodeId);
  const node = NODE_BY_ID[nodeId] ?? (virtualSpec ? virtualNode(nodeId, virtualSpec) : undefined);

  const settings = useSettingsStore();
  const progress = useProgressStore();

  const [plan, setPlan] = useState<LessonPlan | null>(null);
  const [queue, setQueue] = useState<Exercise[]>([]);
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState<Answer | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [status, setStatus] = useState<Status>('loading');
  const [hintUsed, setHintUsed] = useState(false);
  const [hintShown, setHintShown] = useState(false);
  const [confirmQuit, setConfirmQuit] = useState(false);
  const [summary, setSummary] = useState<LessonSummary | null>(null);
  const results = useRef<Record<string, ItemResult>>({});
  const correctCount = useRef(0);
  const answeredCount = useRef(0);
  const reviewCorrect = useRef(0);
  const feedbackIndex = useRef(0);
  const spoken = useRef<Set<string>>(new Set());
  const startedAt = useRef(Date.now());
  const rng = useMemo(() => mulberry32(seedFromString(`${nodeId}-${Date.now()}`)), [nodeId]);

  const heartsOn = settings.heartsEnabled && (plan?.usesHearts ?? false);
  const hearts = progress.currentHearts();

  // Generate the lesson once voices are known (audio-only exercises need a ja-JP voice).
  useEffect(() => {
    if (!node) return;
    let cancelled = false;
    void ensureVoicesLoaded().then(() => {
      if (cancelled) return;
      const seed = seedFromString(`${node.id}-${Date.now()}`);
      const genOpts = { today: localDayKey(), audioAvailable: hasJapaneseVoice(), speakingFocus: settings.focus === 'speaking' };
      let p = virtualSpec
        ? buildVirtualPlan(nodeId, { srs: progress.srs, mistakesLog: progress.mistakesLog, completedNodes: progress.completedNodes }, seed, genOpts)!.plan
        : generateLesson(node, { completedNodes: progress.completedNodes, srs: progress.srs }, seed, genOpts);
      const only = searchParams.get('only'); // review aid: show only one exercise type
      if (only) p = { ...p, exercises: p.exercises.filter((e) => e.type === only) };
      if (p.exercises.length === 0) {
        navigate('/', { replace: true });
        return;
      }
      const items: Record<string, ItemResult> = {};
      for (const ex of p.exercises) if (ex.itemId) items[ex.itemId] = { failed: false, isNew: p.newItemIds.includes(ex.itemId) };
      results.current = items;
      progress.presentItems(p.newItemIds);
      setPlan(p);
      setQueue(p.exercises);
      setIndex(0);
      startedAt.current = Date.now();
      setStatus('running');
    });
    return () => {
      cancelled = true;
      cancelSpeech();
    };
  }, [node?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const current = queue[index];
  const evaluatedTotal = queue.filter((e) => e.evaluated).length;
  const evaluatedDone = queue.slice(0, index).filter((e) => e.evaluated).length;

  const regionId = node?.regionId ?? 'r1';
  const showRomaji = romajiVisible(settings.romajiMode, node?.kind === 'kana' ? 'dojo' : regionId, revealed || hintShown);
  const hintAvailable = !revealed && !hintShown && romajiHintAvailable(settings.romajiMode, node?.kind === 'kana' ? 'dojo' : regionId) && current?.type !== 'E1' && current?.type !== 'E1card';

  const finish = useCallback(
    (finalQueue: Exercise[]) => {
      if (!plan || !node) return;
      const perfect = Object.values(results.current).every((r) => !r.failed) && !hintUsed;
      const accuracy = answeredCount.current ? correctCount.current / answeredCount.current : 1;
      const kind = virtualSpec ? (virtualSpec.kind.startsWith('review') ? 'review' : 'quick') : node.kind === 'boss' ? 'boss' : node.kind === 'finalBoss' ? 'finalBoss' : node.kind === 'review' ? 'review' : 'lesson';
      const passed = plan.passThreshold ? accuracy >= plan.passThreshold : true;
      const xp = computeXp({ kind, perfect, reviewCorrect: kind === 'quick' ? correctCount.current : reviewCorrect.current, passed });
      const reviewedCorrect = kind === 'review' ? Object.entries(results.current).filter(([, r]) => !r.failed).map(([id]) => id) : undefined;
      const reviewedWrong = kind === 'review' ? Object.entries(results.current).filter(([, r]) => r.failed).map(([id]) => id) : undefined;
      if (virtualSpec?.kind === 'review-hearts' && reviewedWrong?.length === 0 && reviewedCorrect?.length) progress.gainHeart(1);
      const durationSec = Math.round((Date.now() - startedAt.current) / 1000);
      const res = progress.finishLesson({
        nodeId: node.id,
        kind,
        items: kind === 'review' ? {} : results.current,
        newItemIds: plan.newItemIds,
        reviewedCorrect,
        reviewedWrong,
        xp,
        perfect,
        accuracy,
        passed,
        durationSec,
        regionId: node.regionId,
        usedHint: hintUsed,
        spokenItems: [...spoken.current],
      });
      if (skipExam && passed && kind === 'boss') progress.markRegionComplete(node.regionId);
      const failedItems = Object.entries(results.current).filter(([, r]) => r.failed).map(([id]) => id);
      const lastPhrase = [...plan.newItemIds].reverse().map((id) => PHRASE_BY_ID[id]).find(Boolean);
      setSummary({
        node,
        xp,
        accuracy,
        durationSec,
        perfect,
        passed,
        passThreshold: plan.passThreshold,
        streakExtended: res.streakExtended,
        usedFreeze: res.usedFreeze,
        failedItems,
        exercisesDone: finalQueue.length,
        newAchievements: res.newAchievements,
        circleKana: lastPhrase?.kana ?? '言霊',
        skipExam,
        session: virtualSpec ? (virtualSpec.kind.startsWith('review') ? 'review' : 'kana') : 'lesson',
        heartRecovered: virtualSpec?.kind === 'review-hearts' && reviewedWrong?.length === 0 && Boolean(reviewedCorrect?.length),
      });
      setStatus('done');
    },
    [plan, node, progress, hintUsed, skipExam, virtualSpec, nodeId],
  );

  const advance = useCallback(
    (wasCorrect: boolean | null) => {
      setAnswer(null);
      setRevealed(false);
      setHintShown(false);
      let nextQueue = queue;
      if (wasCorrect === false && current) {
        nextQueue = [...queue, retryExercise(current, rng, { today: localDayKey(), audioAvailable: hasJapaneseVoice() })];
        setQueue(nextQueue);
      }
      if (index + 1 >= nextQueue.length) finish(nextQueue);
      else setIndex(index + 1);
    },
    [queue, index, current, rng, finish],
  );

  const check = () => {
    if (!current || !answer) return;
    setRevealed(true);
    feedbackIndex.current += 1;
    record(current, answer);
  };

  const record = (ex: Exercise, a: Answer) => {
    if (!ex.evaluated) return;
    answeredCount.current += 1;
    if (a.correct) {
      correctCount.current += 1;
      if (ex.isReview) reviewCorrect.current += 1;
    } else {
      if (ex.itemId) results.current[ex.itemId] = { ...(results.current[ex.itemId] ?? { isNew: false }), failed: true };
      if (heartsOn) {
        progress.loseHeart();
        if (progress.currentHearts() <= 0) {
          // Heart just lost → 0: end the lesson after the feedback.
          window.setTimeout(() => setStatus('noHearts'), 0);
        }
      }
      if (settings.vibration && 'vibrate' in navigator) navigator.vibrate(40);
    }
    if (a.correct && settings.vibration && 'vibrate' in navigator) navigator.vibrate(15);
  };

  const onAutoComplete = useCallback(
    (a: Answer) => {
      if (!current) return;
      if (current.evaluated) {
        record(current, a);
        setAnswer(a);
        setRevealed(true);
        feedbackIndex.current += 1;
      } else {
        if (current.type === 'E10' && a.correct && current.itemId) spoken.current.add(current.itemId);
        advance(null);
      }
    },
    [current, advance], // eslint-disable-line react-hooks/exhaustive-deps
  );

  if (!node) return <main className="screen py-6">Nodo desconocido.</main>;

  if (status === 'done' && summary) return <ResultsScreen summary={summary} />;

  if (status === 'noHearts') {
    return (
      <main className="screen flex min-h-dvh flex-col justify-center gap-4 py-10 text-center">
        <h1 className="font-display text-2xl">Te has quedado sin corazones</h1>
        <p className="text-ink-2">Haz un repaso para recuperarlos o espera 30 min.</p>
        <button className="btn-primary" onClick={() => navigate('/review')}>Ir a Repaso</button>
        <button className="btn-secondary" onClick={() => navigate('/')}>Volver al mapa</button>
      </main>
    );
  }

  if (status === 'loading' || !current) {
    return (
      <main className="screen flex min-h-dvh items-center justify-center">
        <p className="text-ink-2">Preparando el hechizo…</p>
      </main>
    );
  }

  const isCard = current.type === 'E1' || current.type === 'E1card' || current.type === 'E1word';
  const selfCompleting = current.type === 'E7' || current.type === 'E15' || current.type === 'E10';
  const mainLabel = isCard ? (current.type === 'E1' ? 'Lo tengo' : 'Continuar') : revealed ? 'Continuar' : 'Comprobar';

  return (
    <div className="fixed inset-0 flex flex-col bg-bg">
      <header className="mx-auto flex w-full max-w-app items-center gap-3 px-4 pb-2" style={{ paddingTop: 'calc(var(--safe-top) + 0.5rem)' }}>
        <button type="button" aria-label="Cerrar la lección" className="flex h-12 w-12 items-center justify-center rounded-full text-ink-2" onClick={() => setConfirmQuit(true)}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" /></svg>
        </button>
        <ProgressBar value={evaluatedDone} max={Math.max(1, evaluatedTotal)} className="flex-1" />
        {heartsOn ? <HeartBar count={hearts} compact /> : <span className="text-xs font-semibold text-ink-2">{plan?.usesHearts ? 'Modo sereno' : 'Sin vidas'}</span>}
      </header>

      <main className="mx-auto w-full max-w-app flex-1 overflow-y-auto px-4 pb-32 pt-2">
        <div className="mb-3 flex items-center justify-between text-xs text-ink-2">
          <span className="font-semibold" style={{ color: `rgb(var(--c-region-${node.regionId}))` }}>
            {REGION_BY_ID[node.regionId].name} · {node.title}
          </span>
          {hintAvailable && (
            <button type="button" className="font-bold text-mana-500" onClick={() => { setHintShown(true); setHintUsed(true); }}>
              Ver romaji
            </button>
          )}
        </div>
        <ExerciseView key={current.uid} exercise={current} revealed={revealed} onReady={setAnswer} onAutoComplete={onAutoComplete} showRomaji={showRomaji} />
      </main>

      {!revealed && !selfCompleting && (
        <footer className="fixed inset-x-0 bottom-0 mx-auto max-w-app bg-bg px-4 pt-2" style={{ paddingBottom: 'calc(var(--safe-bottom) + 1rem)' }}>
          <button className="btn-primary" disabled={!isCard && !answer} onClick={() => (isCard ? advance(null) : check())}>
            {mainLabel}
          </button>
        </footer>
      )}

      {revealed && answer && <FeedbackSheet answer={answer} index={feedbackIndex.current} showRomaji={showRomaji || revealed} onContinue={() => advance(answer.correct)} />}

      {confirmQuit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-forest-900/60 px-6" role="dialog" aria-modal="true">
          <div className="w-full max-w-sm rounded-stone bg-elevated p-5">
            <h2 className="font-display text-xl">¿Salir de la lección?</h2>
            <p className="mt-2 text-sm text-ink-2">Perderás el progreso de esta lección. Los corazones gastados no vuelven.</p>
            <div className="mt-4 flex gap-2">
              <button className="btn-secondary" onClick={() => setConfirmQuit(false)}>Seguir</button>
              <button className="btn-primary" onClick={() => navigate('/')}>Salir</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
