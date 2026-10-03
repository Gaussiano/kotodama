import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useReducedMotion } from 'motion/react';
import { PHRASE_BY_ID, KANA_BY_ID, WORD_BY_ID, type LessonNode } from '@/content';
import { JpText } from '@/components/ui/JpText';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { FlameIcon } from '@/components/ui/TopBar';
import { Fuku } from '@/components/mascot/Fuku';
import { SpellCircle } from '@/components/magic/SpellCircle';
import { WaxSeal } from '@/components/achievements/WaxSeal';
import { ACHIEVEMENT_BY_ID } from '@/domain/achievements';
import { useProgressStore } from '@/store/progressStore';
import { useSettingsStore } from '@/store/settingsStore';
import { localDayKey } from '@/domain/dates';
import { useSfx } from '@/audio/useSfx';
import { BLOOM_KEY } from './bloomFlag';

export interface LessonSummary {
  node: LessonNode;
  xp: number;
  accuracy: number;
  durationSec: number;
  perfect: boolean;
  passed: boolean;
  passThreshold: number;
  streakExtended: boolean;
  usedFreeze: boolean;
  failedItems: string[];
  exercisesDone: number;
  newAchievements: string[];
  /** Kana of the last phrase learned, for the completed spell circle. */
  circleKana: string;
  skipExam: boolean;
  session: 'lesson' | 'review' | 'kana' | 'listen';
  heartRecovered?: boolean;
}

function itemLabel(id: string) {
  const p = PHRASE_BY_ID[id];
  if (p) return { jp: p.kana, es: p.es };
  const k = KANA_BY_ID[id];
  if (k) return { jp: k.char, es: k.romaji };
  const w = WORD_BY_ID[id];
  if (w) return { jp: w.kana, es: w.es };
  return { jp: id, es: '' };
}

export function ResultsScreen({ summary }: { summary: LessonSummary }) {
  const navigate = useNavigate();
  const reduced = useReducedMotion();
  const play = useSfx();
  const dailyGoal = useSettingsStore((s) => s.dailyGoal);
  const todayXp = useProgressStore((s) => s.xpByDay[localDayKey()] ?? 0);
  const streak = useProgressStore((s) => s.streak);
  const isBoss = summary.passThreshold > 0;
  const minutes = Math.floor(summary.durationSec / 60);
  const seconds = summary.durationSec % 60;
  const won = !isBoss || summary.passed;

  useEffect(() => {
    if (won) play('lessonEnd');
    if (isBoss && summary.passed && summary.node.kind === 'boss') {
      try {
        sessionStorage.setItem(BLOOM_KEY, summary.node.regionId);
      } catch {
        /* ignore */
      }
    }
  }, [won, isBoss, summary, play]);

  return (
    <main className="screen flex min-h-dvh flex-col gap-5 py-8">
      <header className="relative flex flex-col items-center text-center">
        <div className="relative flex h-44 w-full items-center justify-center">
          {won && (
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
              <SpellCircle kana={summary.circleKana} size={200} mode="complete" />
            </div>
          )}
          <Fuku state={won ? 'happy' : 'oops'} size={120} className="relative" />
        </div>
        <p className="text-sm font-semibold text-ink-2">{summary.node.title}</p>
        <h1 className="font-display text-2xl">
          {isBoss ? (summary.passed ? 'Guardián superado' : 'El guardián resiste') : summary.session === 'review' ? 'Repaso completado' : summary.session === 'kana' || summary.session === 'listen' ? 'Práctica completada' : 'Hechizo aprendido'}
          {summary.xp > 0 && <span className="text-rune-gold"> · +{summary.xp} de maná</span>}
        </h1>
        {summary.perfect && won && <p className="mt-1 text-sm font-bold text-moss-500">Lección perfecta: +5 de maná extra</p>}
        {summary.skipExam && summary.passed && <p className="mt-1 text-sm text-ink-2">Examen superado: toda la región queda completada.</p>}
        {summary.heartRecovered && <p className="mt-1 text-sm font-bold text-ember-500">Has recuperado un corazón.</p>}
      </header>

      <section className="grid grid-cols-3 gap-2 text-center">
        <Stat value={String(summary.xp)} label="maná" tone="text-rune-gold" />
        <Stat value={`${Math.round(summary.accuracy * 100)} %`} label="precisión" />
        <Stat value={`${minutes}:${String(seconds).padStart(2, '0')}`} label="tiempo" />
      </section>

      <section className="card">
        <div className="flex items-baseline justify-between">
          <p className="font-bold">Meta diaria</p>
          <p className="text-sm text-ink-2">
            {Math.min(todayXp, dailyGoal)} / {dailyGoal} de maná
          </p>
        </div>
        <ProgressBar value={todayXp} max={dailyGoal} tone="gold" className="mt-2" label="Meta diaria" />
        {todayXp >= dailyGoal && <p className="mt-2 text-sm font-semibold text-rune-gold">Meta cumplida: hoja dorada en el calendario.</p>}
      </section>

      {summary.streakExtended && (
        <motion.section initial={reduced ? false : { scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 300, damping: 18 }} className="card flex items-center gap-3">
          <FlameIcon lit size={40} />
          <p className="font-bold">
            {streak.current} {streak.current === 1 ? 'día' : 'días seguidos'} junto a la hoguera
            {summary.usedFreeze && <span className="block text-sm font-normal text-ink-2">Un amuleto ha salvado el día que faltaba.</span>}
            {streak.freezes > 0 && !summary.usedFreeze && <span className="block text-sm font-normal text-ink-2">Amuletos de protección: {streak.freezes}</span>}
          </p>
        </motion.section>
      )}

      {summary.newAchievements.length > 0 && (
        <section className="card">
          <p className="font-bold">Logros nuevos</p>
          <ul className="mt-2 flex flex-wrap gap-3">
            {summary.newAchievements.map((id) => {
              const def = ACHIEVEMENT_BY_ID[id];
              if (!def) return null;
              return (
                <li key={id} className="flex items-center gap-2">
                  <WaxSeal def={def} unlocked pop size={48} />
                  <span className="text-sm font-semibold">{def.title}</span>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {isBoss && !summary.passed && (
        <section className="card border-2 border-ember-500/40">
          <p className="font-bold">Necesitas un {Math.round(summary.passThreshold * 100)} %. Estos fallos entran en el repaso de errores.</p>
        </section>
      )}

      {summary.failedItems.length > 0 && (
        <section className="card">
          <p className="font-bold">Para repasar</p>
          <ul className="mt-2 space-y-2">
            {summary.failedItems.map((id) => {
              const l = itemLabel(id);
              return (
                <li key={id} className="flex items-baseline gap-2">
                  <JpText className="text-lg">{l.jp}</JpText>
                  <span className="text-sm text-ink-2">{l.es}</span>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      <div className="mt-auto flex flex-col gap-2">
        <button className="btn-primary" onClick={() => navigate(summary.session === 'review' ? '/review' : summary.session === 'kana' ? '/kana' : summary.session === 'listen' ? '/talk' : '/', { replace: true })}>
          {summary.session === 'review' ? 'Volver a Repaso' : summary.session === 'kana' ? 'Volver al dojo' : summary.session === 'listen' ? 'Volver a Hablar' : 'Volver al mapa'}
        </button>
        {isBoss && !summary.passed && (
          <button className="btn-secondary" onClick={() => navigate(0)}>
            Intentarlo otra vez
          </button>
        )}
      </div>
    </main>
  );
}

function Stat({ value, label, tone = '' }: { value: string; label: string; tone?: string }) {
  return (
    <div className="card py-3">
      <p className={`text-2xl font-extrabold ${tone}`}>{value}</p>
      <p className="text-xs text-ink-2">{label}</p>
    </div>
  );
}
