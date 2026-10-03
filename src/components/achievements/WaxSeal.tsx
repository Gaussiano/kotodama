import type { AchievementDef } from '@/domain/achievements';

const TONES: Record<AchievementDef['tone'], string> = {
  gold: '#C9A13B',
  mana: '#7C6CE0',
  moss: '#5E8C3A',
  ember: '#C2493B',
  bark: '#6B4F35',
};

/** Original wax-seal badge (spec §5). Locked seals render grey and flat. */
export function WaxSeal({ def, unlocked, size = 64, pop = false }: { def: AchievementDef; unlocked: boolean; size?: number; pop?: boolean }) {
  const color = unlocked ? TONES[def.tone] : '#9AA59C';
  const initial = def.title.charAt(0);
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" role="img" aria-label={`${def.title}${unlocked ? '' : ' (bloqueado)'}`} className={pop ? 'seal-pop' : ''} style={{ opacity: unlocked ? 1 : 0.55 }}>
      <path d="M32 4c4 0 6 3 10 3s7-3 10 0 1 7 3 10 5 5 5 9-3 6-3 10 3 7 0 10-7 1-10 3-5 5-9 5-6-3-10-3-7 3-10 0-1-7-3-10-5-5-5-9 3-6 3-10-3-7 0-10 7-1 10-3 5-5 9-5z" fill={color} />
      <circle cx="32" cy="32" r="19" fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth="1.5" />
      <circle cx="32" cy="32" r="15" fill="none" stroke="rgba(0,0,0,0.18)" strokeWidth="1" />
      <text x="32" y="39" textAnchor="middle" fontFamily="'Shippori Mincho B1', serif" fontWeight="700" fontSize="20" fill="rgba(255,255,255,0.92)">
        {initial}
      </text>
      <ellipse cx="24" cy="20" rx="6" ry="3" fill="rgba(255,255,255,0.25)" transform="rotate(-30 24 20)" />
    </svg>
  );
}
