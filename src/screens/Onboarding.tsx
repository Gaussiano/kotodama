import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSettingsStore, type RomajiMode } from '@/store/settingsStore';
import { Fuku } from '@/components/mascot/Fuku';
import { JpText } from '@/components/ui/JpText';

/** Three steps, first run only (spec §4.1): Fuku and its pun → daily goal → romaji mode. */
export function OnboardingScreen() {
  const s = useSettingsStore();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);

  const finish = () => {
    s.set({ onboarded: true });
    try {
      void navigator.storage?.persist?.();
    } catch {
      /* unsupported */
    }
    navigate('/', { replace: true });
  };

  return (
    <main className="screen flex min-h-dvh flex-col py-8">
      <div className="flex items-center justify-center gap-1" aria-label={`Paso ${step + 1} de 3`}>
        {[0, 1, 2].map((i) => (
          <span key={i} className={`h-1.5 w-8 rounded-full ${i <= step ? 'bg-primary' : 'bg-ink/15'}`} />
        ))}
      </div>

      {step === 0 && (
        <section className="flex flex-1 flex-col items-center justify-center text-center">
          <Fuku state="happy" size={160} />
          <h1 className="mt-4 whitespace-nowrap font-display text-2xl">
            Kotodama <JpText variant="ui">言霊</JpText>
          </h1>
          <p className="mt-2 text-ink-2">El poder mágico que vive en las palabras. Aprenderás hechizos cotidianos para tu viaje a Japón.</p>
          <div className="mt-6 rounded-stone border border-bark-600/40 bg-parchment-100 p-4 text-left text-sm text-forest-900">
            <p className="font-bold">Este es Fuku, tu búho guía.</p>
            <p className="mt-1">
              En Japón el búho da suerte por un juego de palabras: <JpText>ふくろう</JpText> (<em>fukurō</em>, búho) suena como <JpText>不苦労</JpText>, «sin penurias». Fuku te acompañará sin tapar nunca los ejercicios.
            </p>
          </div>
        </section>
      )}

      {step === 1 && (
        <section className="flex flex-1 flex-col justify-center">
          <h1 className="font-display text-2xl">Tu meta diaria</h1>
          <p className="mt-2 text-ink-2">Maná es tu experiencia: 10 por lección, 5 más si no fallas y 1 por cada repaso acertado.</p>
          <div className="mt-6 grid grid-cols-2 gap-2">
            {[10, 20, 30, 50].map((g) => (
              <button key={g} type="button" onClick={() => s.set({ dailyGoal: g as 10 | 20 | 30 | 50 })} className={`min-h-16 rounded-stone border-2 px-4 py-2 text-left ${s.dailyGoal === g ? 'border-primary bg-primary/10' : 'border-line bg-surface'}`}>
                <span className="block text-xl font-extrabold">{g} de maná</span>
                <span className="block text-xs text-ink-2">{g === 10 ? 'Una lección al día' : g === 20 ? 'Lección y repaso (recomendado)' : g === 30 ? 'Dos lecciones' : 'Modo intensivo'}</span>
              </button>
            ))}
          </div>
        </section>
      )}

      {step === 2 && (
        <section className="flex flex-1 flex-col justify-center">
          <h1 className="font-display text-2xl">¿Cómo quieres ver el romaji?</h1>
          <p className="mt-2 text-ink-2">El romaji es una muleta: el plan la va retirando. Puedes cambiarlo en Ajustes.</p>
          <div className="mt-6 flex flex-col gap-2">
            {(
              [
                ['auto', 'Automático', 'Visible en las dos primeras regiones; luego solo tras responder.'],
                ['always', 'Siempre', 'Siempre visible junto al kana.'],
                ['after', 'Solo después de responder', 'Te obliga a leer kana desde el principio.'],
                ['never', 'Nunca', 'Solo kana. Para valientes.'],
              ] as [RomajiMode, string, string][]
            ).map(([v, label, hint]) => (
              <button key={v} type="button" onClick={() => s.set({ romajiMode: v })} className={`min-h-tap rounded-stone border-2 px-4 py-3 text-left ${s.romajiMode === v ? 'border-primary bg-primary/10' : 'border-line bg-surface'}`}>
                <span className="block font-bold">{label}</span>
                <span className="block text-xs text-ink-2">{hint}</span>
              </button>
            ))}
          </div>
        </section>
      )}

      <div className="mt-6 flex gap-2">
        {step > 0 && (
          <button className="btn-secondary" onClick={() => setStep(step - 1)}>
            Atrás
          </button>
        )}
        <button className="btn-primary" onClick={() => (step < 2 ? setStep(step + 1) : finish())}>
          {step < 2 ? 'Seguir' : 'Empezar en el campamento'}
        </button>
      </div>
    </main>
  );
}
