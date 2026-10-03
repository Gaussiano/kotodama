import { useNavigate } from 'react-router-dom';
import { useSettingsStore } from '@/store/settingsStore';

/** Phase 0 stub: the real 3-step onboarding with Fuku arrives in phase 5. */
export function OnboardingScreen() {
  const set = useSettingsStore((s) => s.set);
  const navigate = useNavigate();
  return (
    <main className="screen flex min-h-dvh flex-col justify-center py-10">
      <h1 className="font-display text-3xl">Kotodama</h1>
      <p className="mt-3 text-ink-2">El poder que vive en las palabras. Aprende hechizos cotidianos para tu viaje.</p>
      <button
        className="btn-primary mt-8"
        onClick={() => {
          set({ onboarded: true });
          navigate('/', { replace: true });
        }}
      >
        Empezar en el campamento
      </button>
    </main>
  );
}
