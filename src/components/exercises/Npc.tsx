export type NpcRole = 'clerk' | 'receptionist' | 'waiter' | 'conductor' | 'passerby';

const LABEL: Record<NpcRole, string> = { clerk: 'Dependiente', receptionist: 'Recepcionista', waiter: 'Camarero', conductor: 'Revisor', passerby: 'Alguien por la calle' };

/** Generic silhouette with a neutral uniform (spec §6 E8, §10.8). No likeness to anyone. */
export function Npc({ role, size = 56 }: { role: NpcRole; size?: number }) {
  const uniform = role === 'waiter' ? '#2B2B2B' : role === 'conductor' ? '#2B4F72' : role === 'receptionist' ? '#4F3F86' : role === 'clerk' ? '#1D5C48' : '#6B5A2A';
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" role="img" aria-label={LABEL[role]}>
      <circle cx="32" cy="18" r="11" fill="rgb(var(--c-ink) / 0.55)" />
      <path d="M12 60c0-14 9-22 20-22s20 8 20 22z" fill={uniform} />
      {role === 'waiter' && <path d="M26 40h12l-6 10z" fill="#F3EAD3" />}
      {role === 'conductor' && <path d="M20 14h24l-2-5H22z" fill={uniform} />}
      {role === 'clerk' && <rect x="24" y="44" width="16" height="8" rx="2" fill="#A7C66B" opacity="0.8" />}
      {role === 'receptionist' && <path d="M26 42h12v3H26z" fill="#F3EAD3" />}
    </svg>
  );
}

export const NPC_LABEL = LABEL;
