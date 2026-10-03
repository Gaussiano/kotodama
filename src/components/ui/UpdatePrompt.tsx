import { useRegisterSW } from 'virtual:pwa-register/react';

/** Spec §18.4: new service worker → «Hay una versión nueva · Actualizar». Progress is untouched. */
export function UpdatePrompt() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW();

  if (!needRefresh) return null;
  return (
    <div
      role="status"
      className="fixed inset-x-4 top-3 z-50 mx-auto flex max-w-app items-center justify-between gap-3 rounded-stone bg-elevated px-4 py-3 shadow-card"
      style={{ marginTop: 'var(--safe-top)' }}
    >
      <span className="text-sm font-semibold">Hay una versión nueva</span>
      <div className="flex gap-2">
        <button className="min-h-10 rounded-full px-3 text-sm font-bold text-ink-2" onClick={() => setNeedRefresh(false)}>
          Luego
        </button>
        <button
          className="min-h-10 rounded-full bg-primary px-4 text-sm font-bold text-on-primary"
          onClick={() => void updateServiceWorker(true)}
        >
          Actualizar
        </button>
      </div>
    </div>
  );
}
