import { MAX_HEARTS } from '@/domain/hearts';

export function HeartBar({ count, compact = false }: { count: number; compact?: boolean }) {
  return (
    <div className="flex items-center gap-0.5" role="img" aria-label={`${count} de ${MAX_HEARTS} corazones`}>
      {Array.from({ length: MAX_HEARTS }, (_, i) => (
        <svg key={i} width={compact ? 16 : 20} height={compact ? 16 : 20} viewBox="0 0 24 24" aria-hidden="true" className={i < count ? 'text-ember-500' : 'text-ink/20'}>
          <path d="M12 21s-7.5-4.6-9.5-9.2C1.2 8.6 3.3 5 6.8 5c2 0 3.4 1.1 5.2 3 1.8-1.9 3.2-3 5.2-3 3.5 0 5.6 3.6 4.3 6.8C19.5 16.4 12 21 12 21z" fill="currentColor" />
        </svg>
      ))}
    </div>
  );
}
