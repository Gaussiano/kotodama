import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ALL_KANA, PHRASES, PLAN } from '@/content';
import { addDays, diffDays, localDayKey, parseDayKey } from '@/domain/dates';
import { daysToJapan } from '@/domain/calendar';
import { effectiveStreak } from '@/domain/streak';
import { ACHIEVEMENTS } from '@/domain/achievements';
import { useProgressStore } from '@/store/progressStore';
import { useSettingsStore } from '@/store/settingsStore';
import { WaxSeal } from '@/components/achievements/WaxSeal';
import { FlameIcon, GemIcon } from '@/components/ui/TopBar';
import { Fuku } from '@/components/mascot/Fuku';

/** Perfil (spec §4.9): streak, mana, activity calendar, mastery, achievements, countdown. */
export function ProfileScreen() {
  const navigate = useNavigate();
  const p = useProgressStore();
  const dailyGoal = useSettingsStore((s) => s.dailyGoal);
  const userName = useSettingsStore((s) => s.userName);
  const today = localDayKey();
  const streakNow = effectiveStreak(p.streak, today);
  const toJapan = daysToJapan(today);

  const phrasesTotal = PHRASES.filter((x) => !x.hidden).length;
  const phrasesMastered = PHRASES.filter((x) => !x.hidden && (p.srs[x.id]?.box ?? 0) >= 5).length;
  const phrasesSeen = PHRASES.filter((x) => !x.hidden && p.srs[x.id]).length;
  const kanaTotal = ALL_KANA.filter((k) => k.group !== 'extended').length;
  const kanaMastered = ALL_KANA.filter((k) => (p.srs[k.id]?.box ?? 0) >= 5).length;
  const kanaSeen = ALL_KANA.filter((k) => p.srs[k.id]).length;

  const weeks = useMemo(() => {
    // Monday-first grid from 3 Oct to 16 Nov 2026.
    const start: string = PLAN.trainingStart;
    const end: string = PLAN.tripEnd;
    const first = parseDayKey(start);
    const pad = (first.getDay() + 6) % 7;
    const days: (string | null)[] = Array(pad).fill(null);
    for (let d = start; d <= end; d = addDays(d, 1)) days.push(d);
    while (days.length % 7) days.push(null);
    const out: (string | null)[][] = [];
    for (let i = 0; i < days.length; i += 7) out.push(days.slice(i, i + 7));
    return out;
  }, []);

  const exportStale = !p.lastExportAt ? p.lessonsCompleted > 3 : diffDays(p.lastExportAt.slice(0, 10), today) > 7;

  return (
    <main className="screen pb-8">
      <header className="flex items-center gap-3 py-3">
        <Fuku state={streakNow > 0 ? 'happy' : 'sleeping'} size={72} />
        <div>
          <h1 className="font-display text-2xl">{userName}</h1>
          <p className="text-sm text-ink-2">{toJapan > 0 ? `Faltan ${toJapan} días para Japón` : toJapan >= -14 ? '¡Estás en Japón!' : 'El viaje ya pasó. ¡Hasta la próxima!'}</p>
        </div>
      </header>

      {exportStale && (
        <button type="button" className="mb-3 w-full rounded-stone bg-rune-gold/15 px-4 py-3 text-left text-sm" onClick={() => navigate('/settings')}>
          Haz una copia de tu progreso antes del viaje. Toca para ir a Ajustes → Exportar.
        </button>
      )}

      <section className="grid grid-cols-3 gap-2 text-center">
        <div className="card py-3">
          <p className="flex items-center justify-center gap-1 text-2xl font-extrabold"><FlameIcon lit={streakNow > 0} /> {streakNow}</p>
          <p className="text-xs text-ink-2">racha · máx. {p.streak.best}</p>
        </div>
        <div className="card py-3">
          <p className="flex items-center justify-center gap-1 text-2xl font-extrabold text-mana-500"><GemIcon /> {p.xpTotal}</p>
          <p className="text-xs text-ink-2">maná total</p>
        </div>
        <div className="card py-3">
          <p className="text-2xl font-extrabold">{p.streak.freezes}</p>
          <p className="text-xs text-ink-2">amuletos</p>
        </div>
      </section>

      <section className="card mt-3">
        <p className="font-bold">Calendario</p>
        <p className="text-xs text-ink-2">Del 3 de octubre al 16 de noviembre. Hoja: día con actividad; hoja dorada: meta cumplida.</p>
        <div className="mt-2 grid grid-cols-7 gap-1 text-center text-[10px] text-ink-2">
          {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map((d) => (
            <span key={d}>{d}</span>
          ))}
        </div>
        <div className="mt-1 flex flex-col gap-1">
          {weeks.map((w, i) => (
            <div key={i} className="grid grid-cols-7 gap-1">
              {w.map((d, j) => {
                if (!d) return <span key={j} />;
                const xp = p.xpByDay[d] ?? 0;
                const state = xp >= dailyGoal ? 'gold' : xp > 0 ? 'leaf' : d > today ? 'future' : 'empty';
                const trip = d >= PLAN.tripStart;
                return (
                  <span key={d} title={`${d}: ${xp} de maná`} className={`flex h-8 items-center justify-center rounded-md text-[11px] ${d === today ? 'ring-2 ring-primary' : ''} ${trip ? 'bg-region-r4/15' : 'bg-ink/5'}`}>
                    {state === 'empty' || state === 'future' ? <span className={state === 'future' ? 'text-ink-2/50' : 'text-ink-2'}>{parseDayKey(d).getDate()}</span> : <Leaf gold={state === 'gold'} />}
                  </span>
                );
              })}
            </div>
          ))}
        </div>
      </section>

      <section className="mt-3 grid grid-cols-2 gap-2">
        <div className="card">
          <p className="text-2xl font-extrabold">{phrasesMastered}</p>
          <p className="text-xs text-ink-2">frases dominadas de {phrasesTotal} · {phrasesSeen} vistas</p>
        </div>
        <div className="card">
          <p className="text-2xl font-extrabold">{kanaMastered}</p>
          <p className="text-xs text-ink-2">kana dominados de {kanaTotal} · {kanaSeen} vistos</p>
        </div>
      </section>

      <section className="card mt-3">
        <p className="font-bold">Logros</p>
        <ul className="mt-2 grid grid-cols-4 gap-3">
          {ACHIEVEMENTS.map((a) => (
            <li key={a.id} className="flex flex-col items-center text-center">
              <WaxSeal def={a} unlocked={Boolean(p.achievements[a.id])} size={56} />
              <span className="mt-1 text-[11px] leading-tight">{a.title}</span>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}

function Leaf({ gold }: { gold: boolean }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-label={gold ? 'meta cumplida' : 'día activo'}>
      <path d="M4 20C6 10 12 5 20 4c-1 8-6 14-16 16z" fill={gold ? '#C9A13B' : '#5E8C3A'} />
      <path d="M6 18c3-5 7-9 12-12" stroke={gold ? '#F3EAD3' : '#A7C66B'} strokeWidth="1.2" fill="none" />
    </svg>
  );
}
