import { useEffect, type ReactNode } from 'react';

type Props = { open: boolean; onClose: () => void; title?: string; children: ReactNode };

export function BottomSheet({ open, onClose, title, children }: Props) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center" role="dialog" aria-modal="true" aria-label={title}>
      <button type="button" aria-label="Cerrar" className="absolute inset-0 bg-forest-900/50" onClick={onClose} />
      <div className="relative w-full max-w-app rounded-t-stone bg-elevated px-5 pt-3 shadow-card" style={{ paddingBottom: 'calc(var(--safe-bottom) + 1.25rem)' }}>
        <div className="mx-auto mb-3 h-1.5 w-10 rounded-full bg-ink/20" />
        {title && <h2 className="font-display text-xl">{title}</h2>}
        {children}
      </div>
    </div>
  );
}
