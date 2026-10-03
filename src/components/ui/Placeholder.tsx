/** Temporary screen body used while a phase is pending. Removed as screens are built. */
export function Placeholder({ title, phase }: { title: string; phase: number }) {
  return (
    <main className="screen py-6">
      <h1 className="font-display text-2xl">{title}</h1>
      <p className="mt-2 text-ink-2">Esta pantalla llega en la fase {phase}.</p>
    </main>
  );
}
