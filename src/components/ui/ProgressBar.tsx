type Props = { value: number; max: number; label?: string; className?: string; tone?: 'primary' | 'gold' | 'mana' };

export function ProgressBar({ value, max, label = 'Progreso', className = '', tone = 'primary' }: Props) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  const fill = tone === 'gold' ? 'bg-rune-gold' : tone === 'mana' ? 'bg-mana-500' : 'bg-primary';
  return (
    <div role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={max} aria-valuenow={value} className={`h-3 w-full overflow-hidden rounded-full bg-ink/10 ${className}`}>
      <div className={`h-full rounded-full ${fill} transition-[width] duration-300`} style={{ width: `${pct}%` }} />
    </div>
  );
}
