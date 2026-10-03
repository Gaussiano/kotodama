import { useNavigate } from 'react-router-dom';
import { useProgressStore } from '@/store/progressStore';
import { useSettingsStore } from '@/store/settingsStore';
import { effectiveStreak } from '@/domain/streak';
import { localDayKey } from '@/domain/dates';
import { HeartBar } from './HeartBar';

/** Fixed top bar (spec §3.6): streak (campfire flame), mana (violet gem), hearts, settings. */
export function TopBar() {
  const navigate = useNavigate();
  const streak = useProgressStore((s) => s.streak);
  const xpTotal = useProgressStore((s) => s.xpTotal);
  const heartsState = useProgressStore((s) => s.hearts);
  const currentHearts = useProgressStore((s) => s.currentHearts);
  const heartsEnabled = useSettingsStore((s) => s.heartsEnabled);
  const days = effectiveStreak(streak, localDayKey());
  void heartsState; // subscribe so the bar re-renders when hearts change
  const hearts = currentHearts();

  return (
    <header className="sticky top-0 z-20 border-b border-line bg-bg/95 backdrop-blur" style={{ paddingTop: 'var(--safe-top)' }}>
      <div className="mx-auto flex max-w-app items-center justify-between px-4 py-1.5">
        <div className="flex items-center gap-4 text-sm font-bold">
          <span className="flex items-center gap-1" title="Racha" role="img" aria-label={`Racha: ${days} días`}>
            <FlameIcon lit={days > 0} /> {days}
          </span>
          <span className="flex items-center gap-1 text-mana-500" title="Maná: tu experiencia" role="img" aria-label={`Maná: ${xpTotal}`}>
            <GemIcon /> {xpTotal}
          </span>
          {heartsEnabled ? <HeartBar count={hearts} compact /> : <span className="text-xs font-semibold text-ink-2">Modo sereno</span>}
        </div>
        <button type="button" aria-label="Ajustes" className="flex h-11 w-11 items-center justify-center rounded-full text-ink-2" onClick={() => navigate('/settings')}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="3" />
            <path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M4.9 19.1 7 17M17 7l2.1-2.1" />
          </svg>
        </button>
      </div>
    </header>
  );
}

export function FlameIcon({ lit, size = 20 }: { lit: boolean; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 2c1 4 5 5 5 11a5 5 0 0 1-10 0c0-2 1-3 1-3s0 3 2 3c1-3-1-6 2-11z" fill={lit ? '#E0792B' : '#9AA59C'} />
      <path d="M12 12c1 2 2 3 2 5a2 2 0 0 1-4 0c0-2 1-3 2-5z" fill={lit ? '#F3CF6B' : '#C8D0C8'} />
    </svg>
  );
}

export function GemIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 2l7 7-7 13L5 9z" fill="#7C6CE0" />
      <path d="M12 2l7 7H5z" fill="#9FF0E4" opacity="0.7" />
      <path d="M12 22L5 9h14z" fill="none" stroke="#4F3F86" strokeWidth="1" opacity="0.6" />
    </svg>
  );
}
