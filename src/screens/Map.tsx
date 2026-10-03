import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { REGIONS, REGION_BY_ID, nodesOfRegion, type LessonNode, type RegionId } from '@/content';
import { nodeStatus, regionProgress, isRegionOpen } from '@/domain/unlock';
import { daysBehind, todayNode } from '@/domain/calendar';
import { localDayKey } from '@/domain/dates';
import { useProgressStore } from '@/store/progressStore';
import { useSettingsStore } from '@/store/settingsStore';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { JpText } from '@/components/ui/JpText';
import { ForestBackdrop } from '@/components/map/ForestBackdrop';
import { ForestPath } from '@/components/map/ForestPath';
import { RegionBanner } from '@/components/map/RegionBanner';
import { Fuku } from '@/components/mascot/Fuku';
import { ensureVoicesLoaded, hasJapaneseVoice } from '@/audio/tts';
import { useSfx } from '@/audio/useSfx';

import { BLOOM_KEY } from './bloomFlag';

export function MapScreen() {
  const navigate = useNavigate();
  const completedNodes = useProgressStore((s) => s.completedNodes);
  const passedBosses = useProgressStore((s) => s.passedBosses);
  const currentHearts = useProgressStore((s) => s.currentHearts);
  const heartsEnabled = useSettingsStore((s) => s.heartsEnabled);
  const voiceNoticeDismissed = useSettingsStore((s) => s.voiceNoticeDismissed);
  const setSettings = useSettingsStore((s) => s.set);
  const [selected, setSelected] = useState<LessonNode | null>(null);
  const [noVoice, setNoVoice] = useState(false);
  const [bloomRegion, setBloomRegion] = useState<RegionId | null>(null);
  const play = useSfx();

  const snapshot = useMemo(() => ({ completedNodes, passedBosses }), [completedNodes, passedBosses]);
  const today = localDayKey();
  const todays = todayNode(today, snapshot);
  const behind = daysBehind(today, snapshot);
  const hearts = currentHearts();
  const canStart = !heartsEnabled || hearts > 0;

  useEffect(() => {
    void ensureVoicesLoaded().then(() => setNoVoice(!hasJapaneseVoice()));
  }, []);

  // A guardian beaten in the last session → bloom once (flag set by the results screen).
  useEffect(() => {
    try {
      const r = sessionStorage.getItem(BLOOM_KEY) as RegionId | null;
      if (r) {
        sessionStorage.removeItem(BLOOM_KEY);
        setBloomRegion(r);
        play('flowers');
        const el = document.getElementById(`region-${r}`);
        el?.scrollIntoView({ block: 'start', behavior: 'smooth' });
      }
    } catch {
      /* no session storage */
    }
  }, [play]);

  const open = (n: LessonNode) => {
    if (nodeStatus(n, snapshot) === 'locked') return;
    setSelected(n);
  };

  return (
    <main className="relative pb-6">
      <ForestBackdrop />
      <div className="relative z-10">
      <div className="mx-auto max-w-app px-4 pt-3">
        <h1 className="font-display text-2xl">
          Kotodama <JpText variant="ui" className="text-ink-2">言霊</JpText>
        </h1>
        {behind > 3 && (
          <p className="mt-2 rounded-stone bg-rune-gold/15 px-4 py-3 text-sm">
            Vas {behind} días por detrás del plan. ¿Hacemos dos lecciones hoy?
          </p>
        )}
        {!canStart && <p className="mt-2 rounded-stone bg-ember-500/10 px-4 py-3 text-sm">Te has quedado sin corazones. Haz un repaso para recuperarlos o espera 30 min.</p>}
        {noVoice && !voiceNoticeDismissed && (
          <div className="mt-2 rounded-stone border border-line bg-surface px-4 py-3 text-sm">
            <p className="font-bold">No hay voz japonesa en este dispositivo</p>
            <p className="mt-1 text-ink-2">iPhone: Ajustes → Accesibilidad → Contenido leído → Voces → Japonés. Android: ajustes de texto a voz de Google → instalar datos de japonés. Mientras tanto, los ejercicios solo de audio se sustituyen por otros.</p>
            <button type="button" className="mt-2 text-sm font-bold text-primary" onClick={() => setSettings({ voiceNoticeDismissed: true })}>
              Entendido
            </button>
          </div>
        )}
      </div>

      {REGIONS.map((region, ri) => {
        const prog = regionProgress(region.id, snapshot);
        const nodes = nodesOfRegion(region.id);
        const boss = nodes.find((n) => n.kind === 'boss');
        const canSkip = Boolean(boss) && isRegionOpen(region.id, snapshot) && !passedBosses.includes(region.id);
        const passed = passedBosses.includes(region.id);
        return (
          <section key={region.id} id={`region-${region.id}`} className="mt-6 scroll-mt-20">
            <RegionBanner region={region} done={prog.done} total={prog.total} canSkip={canSkip} onSkip={() => boss && navigate(`/lesson/${boss.id}?skip=1`)} />
            <ForestPath nodes={nodes} statusOf={(n) => nodeStatus(n, snapshot)} todayId={todays?.id} onOpen={open} bloom={passed ? (bloomRegion === region.id ? 'animate' : 'static') : 'none'} seed={ri + 1} />
          </section>
        );
      })}

      <div className="mx-auto mt-4 flex max-w-app items-center gap-3 px-6 text-sm text-ink-2">
        <Fuku state={completedNodes.length ? 'neutral' : 'happy'} size={64} />
        <p>{completedNodes.length ? 'Cada piedra rúnica es un hechizo del dossier. El camino sigue hasta el guardián final.' : 'Empieza por el campamento: pronunciación y las cinco vocales.'}</p>
      </div>

      </div>
      <BottomSheet open={selected !== null} onClose={() => setSelected(null)} title={selected?.title}>
        {selected && (
          <>
            <p className="mt-1 text-sm text-ink-2">
              {REGION_BY_ID[selected.regionId].name} · {selected.dayLabel}
            </p>
            <p className="mt-3">{selected.summary}</p>
            <p className="mt-2 text-sm text-ink-2">{describeNode(selected)}</p>
            <button className="btn-primary mt-5" disabled={!canStart && selected.kind !== 'review' && selected.kind !== 'intro'} onClick={() => navigate(`/lesson/${selected.id}`)}>
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
  if (n.kind === 'intro') parts.push('sin vidas');
  return parts.join(' · ');
}

