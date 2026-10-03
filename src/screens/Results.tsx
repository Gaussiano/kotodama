import { useNavigate } from 'react-router-dom';
import { PHRASE_BY_ID, KANA_BY_ID, WORD_BY_ID, type LessonNode } from '@/content';
import { JpText } from '@/components/ui/JpText';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { useProgressStore } from '@/store/progressStore';
import { useSettingsStore } from '@/store/settingsStore';
import { localDayKey } from '@/domain/dates';

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
  const dailyGoal = useSettingsStore((s) => s.dailyGoal);
  const todayXp = useProgressStore((s) => s.xpByDay[localDayKey()] ?? 0);
  const streak = useProgressStore((s) => s.streak);
  const isBoss = summary.passThreshold > 0;
  const minutes = Math.floor(summary.durationSec / 60);
  const seconds = summary.durationSec % 60;

  return (
    <main className="screen flex min-h-dvh flex-col gap-5 py-8">
      <header className="text-center">
        <p className="text-sm font-semibold text-ink-2">{summary.node.title}</p>
        <h1 className="font-display text-2xl">
          {isBoss ? (summary.passed ? 'Guardián superado' : 'El guardián resiste') : 'Hechizo aprendido'}
          {summary.xp > 0 && <span className="text-rune-gold"> · +{summary.xp} de maná</span>}
        </h1>
        {summary.perfect && <p className="mt-1 text-sm font-bold text-moss-500">Lección perfecta</p>}
      </header>

      <section className="grid grid-cols-3 gap-2 text-center">
        <div className="card py-3">
          <p className="text-2xl font-extrabold text-rune-gold">{summary.xp}</p>
          <p className="text-xs text-ink-2">maná</p>
        </div>
        <div className="card py-3">
          <p className="text-2xl font-extrabold">{Math.round(summary.accuracy * 100)} %</p>
          <p className="text-xs text-ink-2">precisión</p>
        </div>
        <div className="card py-3">
          <p className="text-2xl font-extrabold">
            {minutes}:{String(seconds).padStart(2, '0')}
          </p>
          <p className="text-xs text-ink-2">tiempo</p>
        </div>
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
        <section className="card flex items-center gap-3">
          <span className="text-2xl" aria-hidden="true">🔥</span>
          <p className="font-bold">
            {streak.current} {streak.current === 1 ? 'día' : 'días seguidos'} junto a la hoguera
            {summary.usedFreeze && <span className="block text-sm font-normal text-ink-2">Un amuleto ha salvado el día que faltaba.</span>}
          </p>
        </section>
      )}

      {isBoss && !summary.passed && (
        <section className="card border-2 border-ember-500/40">
          <p className="font-bold">Necesitas un {Math.round(summary.passThreshold * 100)} %. Estos fallos entran en el repaso de errores:</p>
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
        <button className="btn-primary" onClick={() => navigate('/', { replace: true })}>
          Volver al mapa
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
