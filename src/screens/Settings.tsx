import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSettingsStore, type RomajiMode, type ThemeMode, type VoiceRate } from '@/store/settingsStore';
import { isValidProgress, progressSnapshot, useProgressStore, type Progress } from '@/store/progressStore';
import { ensureVoicesLoaded, getJapaneseVoices, speak } from '@/audio/tts';
import { localDayKey } from '@/domain/dates';

export function SettingsScreen() {
  const navigate = useNavigate();
  const s = useSettingsStore();
  const progress = useProgressStore();
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [confirm, setConfirm] = useState<'reset' | 'import' | null>(null);
  const [pendingImport, setPendingImport] = useState<{ progress: Progress; settings?: Record<string, unknown> } | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    void ensureVoicesLoaded().then(() => setVoices(getJapaneseVoices()));
  }, []);

  const exportProgress = () => {
    const data = { app: 'kotodama', exportedAt: new Date().toISOString(), settings: { ...s, set: undefined, reset: undefined }, progress: progressSnapshot() };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `kotodama-progreso-${localDayKey()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    progress.setLastExport(new Date().toISOString());
    setMessage('Copia guardada.');
  };

  const onFile = async (file: File | undefined) => {
    if (!file) return;
    try {
      const parsed = JSON.parse(await file.text()) as { progress?: unknown; settings?: Record<string, unknown> };
      const p = parsed.progress ?? parsed;
      if (!isValidProgress(p)) throw new Error('bad');
      setPendingImport({ progress: p, settings: parsed.settings });
      setConfirm('import');
    } catch {
      setMessage('Ese archivo no es una copia válida de Kotodama.');
    } finally {
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const applyImport = () => {
    if (!pendingImport) return;
    progress.importProgress(pendingImport.progress);
    if (pendingImport.settings) {
      const { set: _s, reset: _r, ...rest } = pendingImport.settings as Record<string, unknown> & { set?: unknown; reset?: unknown };
      s.set(rest as Partial<typeof s>);
    }
    setPendingImport(null);
    setConfirm(null);
    setMessage('Progreso importado.');
  };

  const resetAll = () => {
    progress.reset();
    s.reset();
    navigate('/onboarding', { replace: true });
  };

  return (
    <main className="screen pb-10">
      <header className="flex items-center gap-2 py-2">
        <button type="button" aria-label="Volver" className="flex h-11 w-11 items-center justify-center rounded-full text-ink-2" onClick={() => navigate(-1)}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M15 5l-7 7 7 7" /></svg>
        </button>
        <h1 className="font-display text-2xl">Ajustes</h1>
      </header>

      {message && (
        <p role="status" className="mt-2 rounded-stone bg-moss-500/15 px-4 py-2 text-sm">
          {message}
        </p>
      )}

      <Section title="Tu nombre">
        <input type="text" value={s.userName} onChange={(e) => s.set({ userName: e.target.value })} aria-label="Tu nombre" className="min-h-tap w-full rounded-stone border-2 border-line bg-surface px-4 text-base focus:border-primary" />
        <p className="mt-1 text-xs text-ink-2">Rellena el hueco de «わたしは ＿＿ です».</p>
      </Section>

      <Section title="Meta diaria">
        <Segmented options={[10, 20, 30, 50].map((v) => ({ value: v, label: `${v}` }))} value={s.dailyGoal} onChange={(v) => s.set({ dailyGoal: v as 10 | 20 | 30 | 50 })} />
        <p className="mt-1 text-xs text-ink-2">Maná (tu experiencia) que quieres ganar cada día.</p>
      </Section>

      <Section title="Romaji">
        <Segmented<RomajiMode> options={[{ value: 'auto', label: 'Automático' }, { value: 'always', label: 'Siempre' }, { value: 'after', label: 'Después' }, { value: 'never', label: 'Nunca' }]} value={s.romajiMode} onChange={(v) => s.set({ romajiMode: v })} />
        <p className="mt-1 text-xs text-ink-2">Automático: visible en R0–R2, oculto hasta responder en R3–R4 y en el dojo.</p>
      </Section>

      <Section title="Voz">
        {voices.length === 0 ? (
          <p className="text-sm text-ink-2">No hay voz japonesa. iPhone: Ajustes → Accesibilidad → Contenido leído → Voces → Japonés. Android: texto a voz de Google → instalar japonés.</p>
        ) : (
          <select aria-label="Voz japonesa" value={s.voiceURI ?? ''} onChange={(e) => s.set({ voiceURI: e.target.value || null })} className="min-h-tap w-full rounded-stone border-2 border-line bg-surface px-3 text-base">
            <option value="">Automática (la mejor disponible)</option>
            {voices.map((v) => (
              <option key={v.voiceURI} value={v.voiceURI}>
                {v.name} {v.localService ? '' : '(en línea)'}
              </option>
            ))}
          </select>
        )}
        <div className="mt-3 flex items-center gap-3">
          <Segmented<VoiceRate> options={[{ value: 0.6, label: 'Lenta' }, { value: 0.8, label: 'Media' }, { value: 1.0, label: 'Normal' }]} value={s.voiceRate} onChange={(v) => s.set({ voiceRate: v })} />
          <button type="button" className="btn-secondary !w-auto px-4" onClick={() => void speak('こんにちは。ようこそ、ことだまへ', { voiceURI: s.voiceURI, rate: s.voiceRate })}>
            Probar
          </button>
        </div>
      </Section>

      <Section title="Juego">
        <Toggle label="Efectos de sonido" checked={s.sfx} onChange={(v) => s.set({ sfx: v })} />
        <Toggle label="Vibración" checked={s.vibration} onChange={(v) => s.set({ vibration: v })} />
        <Toggle label="Vidas (corazones)" hint="Desactívalas para el Modo sereno: sin vidas, sin presión." checked={s.heartsEnabled} onChange={(v) => s.set({ heartsEnabled: v })} />
      </Section>

      <Section title="Aspecto">
        <Segmented<ThemeMode> options={[{ value: 'system', label: 'Sistema' }, { value: 'light', label: 'Día' }, { value: 'dark', label: 'Noche' }]} value={s.theme} onChange={(v) => s.set({ theme: v })} />
        <div className="mt-3">
          <Toggle label="Reducir animaciones" checked={s.reducedMotion} onChange={(v) => s.set({ reducedMotion: v })} />
        </div>
      </Section>

      <Section title="Tipo de cambio">
        <label className="flex items-center gap-2 text-sm">
          1 € =
          <input type="number" inputMode="decimal" min={50} max={400} value={s.exchangeRate} onChange={(e) => s.set({ exchangeRate: Number(e.target.value) || 170 })} aria-label="Yenes por euro" className="min-h-tap w-24 rounded-stone border-2 border-line bg-surface px-3 text-base" />
          ¥
        </label>
        <p className="mt-1 text-xs text-ink-2">Para la calculadora del Modo viaje. Sin conexión.</p>
      </Section>

      <Section title="Tu progreso">
        <div className="flex flex-col gap-2">
          <button type="button" className="btn-secondary" onClick={exportProgress}>
            Exportar progreso (JSON)
          </button>
          <button type="button" className="btn-secondary" onClick={() => fileRef.current?.click()}>
            Importar progreso
          </button>
          <input ref={fileRef} type="file" accept="application/json,.json" className="hidden" onChange={(e) => void onFile(e.target.files?.[0])} />
          <button type="button" className="min-h-tap rounded-stone border-2 border-ember-500 px-5 font-bold text-ember-500" onClick={() => setConfirm('reset')}>
            Reiniciar todo
          </button>
        </div>
      </Section>

      {confirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-forest-900/60 px-6" role="dialog" aria-modal="true">
          <div className="w-full max-w-sm rounded-stone bg-elevated p-5">
            <h2 className="font-display text-xl">{confirm === 'reset' ? '¿Reiniciar todo?' : '¿Importar este progreso?'}</h2>
            <p className="mt-2 text-sm text-ink-2">
              {confirm === 'reset' ? 'Se borran el progreso, la racha y los ajustes de este dispositivo. Exporta una copia antes si quieres conservarlos.' : `Sustituirá tu progreso actual (${progress.xpTotal} de maná, ${progress.completedNodes.length} nodos) por el del archivo (${pendingImport?.progress.xpTotal ?? 0} de maná, ${pendingImport?.progress.completedNodes.length ?? 0} nodos).`}
            </p>
            <div className="mt-4 flex gap-2">
              <button className="btn-secondary" onClick={() => { setConfirm(null); setPendingImport(null); }}>Cancelar</button>
              <button className={confirm === 'reset' ? 'min-h-tap w-full rounded-stone bg-ember-500 px-5 font-bold text-white' : 'btn-primary'} onClick={confirm === 'reset' ? resetAll : applyImport}>
                {confirm === 'reset' ? 'Reiniciar' : 'Importar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-5">
      <h2 className="mb-2 text-sm font-bold text-ink-2">{title}</h2>
      {children}
    </section>
  );
}

function Segmented<T extends string | number>({ options, value, onChange }: { options: { value: T; label: string }[]; value: T; onChange: (v: T) => void }) {
  return (
    <div className="flex flex-wrap gap-1 rounded-stone bg-ink/5 p-1" role="radiogroup">
      {options.map((o) => (
        <button key={String(o.value)} type="button" role="radio" aria-checked={o.value === value} onClick={() => onChange(o.value)} className={`min-h-10 flex-1 rounded-xl px-3 text-sm font-bold ${o.value === value ? 'bg-primary text-on-primary' : 'text-ink-2'}`}>
          {o.label}
        </button>
      ))}
    </div>
  );
}

function Toggle({ label, hint, checked, onChange }: { label: string; hint?: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex min-h-tap items-center justify-between gap-3 py-1">
      <span>
        <span className="block font-semibold">{label}</span>
        {hint && <span className="block text-xs text-ink-2">{hint}</span>}
      </span>
      <button type="button" role="switch" aria-checked={checked} onClick={() => onChange(!checked)} className={`relative h-8 w-14 shrink-0 rounded-full transition-colors ${checked ? 'bg-primary' : 'bg-ink/20'}`}>
        <span className={`absolute top-1 h-6 w-6 rounded-full bg-white transition-all ${checked ? 'left-7' : 'left-1'}`} />
        <span className="sr-only">{label}</span>
      </button>
    </label>
  );
}
