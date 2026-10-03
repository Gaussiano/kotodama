import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { NODES, REGIONS, REGION_BY_ID, nodesOfRegion, type LessonNode } from '@/content';
import { nodeStatus, regionProgress, type NodeStatus } from '@/domain/unlock';
import { daysBehind, todayNode } from '@/domain/calendar';
import { localDayKey } from '@/domain/dates';
import { effectiveStreak } from '@/domain/streak';
import { useProgressStore } from '@/store/progressStore';
import { useSettingsStore } from '@/store/settingsStore';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { HeartBar } from '@/components/ui/HeartBar';
import { JpText } from '@/components/ui/JpText';

export function MapScreen() {
  const navigate = useNavigate();
  const completedNodes = useProgressStore((s) => s.completedNodes);
  const passedBosses = useProgressStore((s) => s.passedBosses);
  const xpTotal = useProgressStore((s) => s.xpTotal);
  const streak = useProgressStore((s) => s.streak);
  const currentHearts = useProgressStore((s) => s.currentHearts);
  const heartsEnabled = useSettingsStore((s) => s.heartsEnabled);
  const [selected, setSelected] = useState<LessonNode | null>(null);

  const snapshot = useMemo(() => ({ completedNodes, passedBosses }), [completedNodes, passedBosses]);
  const today = localDayKey();
  const todays = todayNode(today, snapshot);
  const behind = daysBehind(today, snapshot);
  const hearts = currentHearts();
  const canStart = !heartsEnabled || hearts > 0;

  const open = (n: LessonNode) => {
    const st = nodeStatus(n, snapshot);
    if (st === 'locked') return;
    setSelected(n);
  };

  return (
    <main className="pb-6">
      <header className="sticky top-0 z-20 border-b border-line bg-bg/95 backdrop-blur" style={{ paddingTop: 'var(--safe-top)' }}>
        <div className="mx-auto flex max-w-app items-center justify-between px-4 py-2">
          <div className="flex items-center gap-4 text-sm font-bold">
            <span className="flex items-center gap-1" aria-label={`Racha: ${effectiveStreak(streak, today)} días`}>
              <span aria-hidden="true">🔥</span> {effectiveStreak(streak, today)}
            </span>
            <span className="flex items-center gap-1 text-mana-500" aria-label={`Maná: ${xpTotal}`}>
              <span aria-hidden="true">◆</span> {xpTotal}
            </span>
            {heartsEnabled && <HeartBar count={hearts} compact />}
          </div>
          <button type="button" aria-label="Ajustes" className="flex h-12 w-12 items-center justify-center rounded-full text-ink-2" onClick={() => navigate('/settings')}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" />
            </svg>
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-app px-4">
        <h1 className="mt-4 font-display text-2xl">
          Kotodama <JpText variant="ui" className="text-ink-2">言霊</JpText>
        </h1>
        {behind > 3 && (
          <p className="mt-2 rounded-stone bg-rune-gold/15 px-4 py-3 text-sm">
            Vas {behind} días por detrás del plan. ¿Hacemos dos lecciones hoy?
          </p>
        )}
        {!canStart && (
          <p className="mt-2 rounded-stone bg-ember-500/10 px-4 py-3 text-sm">
            Te has quedado sin corazones. Haz un repaso para recuperarlos o espera 30 min.
          </p>
        )}

        {REGIONS.map((region) => {
          const prog = regionProgress(region.id, snapshot);
          return (
            <section key={region.id} className="mt-6">
              <div className="flex items-center justify-between rounded-stone px-4 py-3 text-white" style={{ background: `rgb(var(--c-region-${region.id}))` }}>
                <div>
                  <h2 className="font-display text-lg leading-tight">{region.name}</h2>
                  <p className="text-xs opacity-90">{region.theme} · {region.dateLabel}</p>
                </div>
                <p className="text-sm font-bold">
                  {prog.done}/{prog.total}
                </p>
              </div>
              <ol className="mt-3 flex flex-col gap-2">
                {nodesOfRegion(region.id).map((n) => (
                  <NodeRow key={n.id} node={n} status={nodeStatus(n, snapshot)} isToday={todays?.id === n.id} onOpen={() => open(n)} />
                ))}
              </ol>
            </section>
          );
        })}
      </div>

      <BottomSheet open={selected !== null} onClose={() => setSelected(null)} title={selected?.title}>
        {selected && (
          <>
            <p className="mt-1 text-sm text-ink-2">{REGION_BY_ID[selected.regionId].name} · {selected.dayLabel}</p>
            <p className="mt-3">{selected.summary}</p>
            <p className="mt-2 text-sm text-ink-2">{describeNode(selected)}</p>
            <button
              className="btn-primary mt-5"
              disabled={!canStart && selected.kind !== 'review' && selected.kind !== 'intro'}
              onClick={() => navigate(`/lesson/${selected.id}`)}
            >
              {nodeStatus(selected, snapshot) === 'completed' ? 'Practicar otra vez' : 'Empezar'}
            </button>
          </>
        )}
      </BottomSheet>
    </main>
  );
}

function describeNode(n: LessonNode): string {
  const parts: string[] = [];
  const visible = n.phraseIds.length;
  if (visible) parts.push(`${visible} ${n.kind === 'heard' ? 'frases que oirás' : 'frases nuevas'}`);
  if (n.kanaIds.length) parts.push(`${n.kanaIds.length} kana`);
  if (n.practiceWordIds?.length) parts.push(`${n.practiceWordIds.length} palabras de práctica`);
  if (n.kind === 'boss' || n.kind === 'finalBoss') parts.push('12–15 ejercicios sin tarjetas · apruebas con un 80 %');
  return parts.join(' · ');
}

function NodeRow({ node, status, isToday, onOpen }: { node: LessonNode; status: NodeStatus; isToday: boolean; onOpen: () => void }) {
  const isBoss = node.kind === 'boss' || node.kind === 'finalBoss';
  const ring = status === 'completed' ? 'bg-moss-500 text-white' : status === 'available' ? 'bg-leaf-300 text-forest-900 shadow-glow' : 'bg-ink/15 text-ink-2';
  return (
    <li>
      <button
        type="button"
        onClick={onOpen}
        disabled={status === 'locked'}
        aria-label={`${node.title}: ${status === 'locked' ? 'bloqueado' : status === 'completed' ? 'completado' : 'disponible'}`}
        className="flex w-full items-center gap-3 rounded-stone bg-surface px-3 py-2 text-left disabled:opacity-60"
      >
        <span className={`flex shrink-0 items-center justify-center rounded-full font-bold ${isBoss ? 'h-14 w-14 text-xl' : 'h-12 w-12 text-lg'} ${ring}`} aria-hidden="true">
          {status === 'completed' ? '★' : status === 'locked' ? '🔒' : isBoss ? '◈' : '◉'}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate font-bold">{node.title}</span>
          <span className="block text-xs text-ink-2">{node.dayLabel}</span>
        </span>
        {isToday && <span className="shrink-0 rounded-full bg-rune-gold/20 px-2 py-1 text-xs font-bold text-forest-900 dark:text-rune-gold">Hoy toca</span>}
      </button>
    </li>
  );
}

export const TOTAL_NODES = NODES.length;
