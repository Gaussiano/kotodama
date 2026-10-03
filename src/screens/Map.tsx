import { JpText } from '@/components/ui/JpText';
import { useSettingsStore } from '@/store/settingsStore';

export function MapScreen() {
  const theme = useSettingsStore((s) => s.theme);
  const set = useSettingsStore((s) => s.set);
  return (
    <main className="screen py-6">
      <header className="flex items-baseline justify-between">
        <h1 className="font-display text-2xl">
          Kotodama <JpText variant="ui">言霊</JpText>
        </h1>
        <button
          className="min-h-tap rounded-full px-3 text-sm font-bold text-primary"
          onClick={() => set({ theme: theme === 'dark' ? 'light' : 'dark' })}
        >
          {theme === 'dark' ? 'Modo día' : 'Modo noche'}
        </button>
      </header>
      <p className="mt-2 text-ink-2">El mapa del bosque llega en la fase 1.</p>
      <section className="card mt-6">
        <h2 className="font-display text-lg">Prueba de tipografía</h2>
        <JpText as="p" className="mt-2 text-kana">
          おはようございます
        </JpText>
        <p className="text-sm text-ink-2">ohayō gozaimasu · Buenos días</p>
      </section>
    </main>
  );
}
