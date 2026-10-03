import type { Region } from '@/content';

type Props = { region: Region; done: number; total: number; canSkip: boolean; onSkip: () => void };

/** Region banner (spec §3.6): colour band, name, recommended dates, progress and the exam shortcut. */
export function RegionBanner({ region, done, total, canSkip, onSkip }: Props) {
  return (
    <div className="relative mx-auto max-w-app px-4">
      <div className="flex items-center justify-between gap-3 rounded-stone px-4 py-3 text-[#F3EAD3]" style={{ background: `rgb(var(--c-region-${region.id}))` }}>
        <div className="min-w-0">
          <h2 className="font-display text-lg leading-tight">{region.name}</h2>
          <p className="text-xs opacity-90">
            {region.theme} · {region.dateLabel}
          </p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1">
          <p className="text-sm font-bold">
            <span className="sr-only">Progreso </span>
            {done}/{total}
          </p>
          {canSkip && (
            <button type="button" className="rounded-full bg-white/15 px-2.5 py-1 text-xs font-bold" onClick={onSkip}>
              Saltar con un examen
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
