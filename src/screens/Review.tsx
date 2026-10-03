import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { localDayKey } from '@/domain/dates';
import { isDue } from '@/domain/srs';
import { recentMistakes } from '@/domain/sessions';
import { MAX_HEARTS, msToNextHeart } from '@/domain/hearts';
import { useProgressStore } from '@/store/progressStore';
import { useSettingsStore } from '@/store/settingsStore';
import { Fuku } from '@/components/mascot/Fuku';

/** Repaso (spec §4.5): due cards, error review and heart recovery. */
export function ReviewScreen() {
  const navigate = useNavigate();
  const srs = useProgressStore((s) => s.srs);
  const mistakesLog = useProgressStore((s) => s.mistakesLog);
  const completedNodes = useProgressStore((s) => s.completedNodes);
  const heartsState = useProgressStore((s) => s.hearts);
  const currentHearts = useProgressStore((s) => s.currentHearts);
  const heartsEnabled = useSettingsStore((s) => s.heartsEnabled);
  const today = localDayKey();

  const due = useMemo(() => Object.values(srs).filter((s) => isDue(s, today)).length, [srs, today]);
  const errors = useMemo(() => recentMistakes({ srs, mistakesLog, completedNodes }, today).length, [srs, mistakesLog, completedNodes, today]);
  const hearts = currentHearts();
  const nextHeartMin = Math.ceil(msToNextHeart(heartsState, new Date()) / 60000);
  const tracked = Object.keys(srs).length;

  return (
    <main className="screen pb-8">
      <h1 className="py-3 font-display text-2xl">Repaso</h1>

      {tracked === 0 ? (
        <div className="card flex items-center gap-4">
          <Fuku state="sleeping" size={80} />
          <p className="text-ink-2">No tienes nada pendiente. Vuelve mañana o aprende un hechizo nuevo.</p>
        </div>
      ) : (
        <>
          <section className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-3xl font-extrabold text-mana-500">{due}</p>
                <p className="text-sm text-ink-2">{due === 1 ? 'tarjeta pendiente' : 'tarjetas pendientes'} hoy</p>
              </div>
              <Fuku state={due > 0 ? 'neutral' : 'happy'} size={72} />
            </div>
            {due > 0 ? (
              <button className="btn-primary mt-4" onClick={() => navigate('/lesson/review:due')}>
                Repasar ahora{due > 15 ? ' (15)' : ''}
              </button>
            ) : (
              <p className="mt-3 text-sm text-ink-2">No tienes nada pendiente. Vuelve mañana o aprende un hechizo nuevo.</p>
            )}
            <p className="mt-2 text-xs text-ink-2">Sin vidas: aquí no se pierden corazones. +1 de maná por acierto.</p>
          </section>

          <section className="card mt-3">
            <p className="font-bold">Repaso de errores</p>
            <p className="text-sm text-ink-2">{errors === 0 ? 'Ningún fallo en los últimos 7 días.' : `${errors} ${errors === 1 ? 'elemento fallado' : 'elementos fallados'} en los últimos 7 días.`}</p>
            <button className="btn-secondary mt-3" disabled={errors === 0} onClick={() => navigate('/lesson/review:errors')}>
              Repasar errores
            </button>
          </section>

          {heartsEnabled && (
            <section className="card mt-3">
              <p className="font-bold">Recuperar corazones</p>
              <p className="text-sm text-ink-2">
                {hearts >= MAX_HEARTS ? 'Tienes los cinco corazones.' : `Tienes ${hearts} de ${MAX_HEARTS}. Un repaso de 10 elementos sin fallos devuelve 1 corazón. El siguiente llega solo en ${nextHeartMin} min.`}
              </p>
              <button className="btn-secondary mt-3" disabled={hearts >= MAX_HEARTS} onClick={() => navigate('/lesson/review:hearts')}>
                Repaso para recuperar
              </button>
            </section>
          )}
        </>
      )}

      <section className="mt-6 text-sm text-ink-2">
        <p className="font-bold text-ink">Cómo funciona el repaso</p>
        <p className="mt-1">Cinco cajas: 1 (hoy) → 2 (+1 día) → 3 (+3) → 4 (+7) → 5 (+14, dominado). Acierto: sube una caja. Fallo: vuelve a la 1. Del 26 de octubre al 1 de noviembre, las cajas 4 y 5 se repasan al doble de ritmo para llegar frescos.</p>
      </section>
    </main>
  );
}
