import type { LessonNode } from '@/content';
import type { NodeStatus } from '@/domain/unlock';

type Props = { node: LessonNode; status: NodeStatus; onOpen: () => void };

/** Rune stone (72 px) or guardian portal (96 px) — spec §3.6. */
export function NodeStone({ node, status, onOpen }: Props) {
  const isBoss = node.kind === 'boss' || node.kind === 'finalBoss';
  const size = isBoss ? 96 : 72;
  const label = `${node.title}: ${status === 'locked' ? 'bloqueado' : status === 'completed' ? 'completado' : 'disponible'}`;
  const fill = status === 'completed' ? 'rgb(var(--c-moss-500))' : status === 'available' ? 'rgb(var(--c-leaf-300))' : 'rgb(var(--c-ink) / 0.14)';
  const stroke = status === 'completed' ? 'rgb(var(--c-forest-700))' : status === 'available' ? 'rgb(var(--c-forest-700))' : 'rgb(var(--c-ink) / 0.25)';

  return (
    <button
      type="button"
      onClick={onOpen}
      disabled={status === 'locked'}
      aria-label={label}
      className={`relative flex items-center justify-center rounded-full ${status === 'available' ? 'node-available' : ''}`}
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} viewBox="0 0 96 96" aria-hidden="true">
        {isBoss ? (
          <g>
            <path d="M14 90V46a34 34 0 0 1 68 0v44z" fill={fill} stroke={stroke} strokeWidth="3" />
            <path d="M28 90V50a20 20 0 0 1 40 0v40z" fill="rgb(var(--c-bg))" opacity="0.7" />
            <g stroke={status === 'locked' ? 'rgb(var(--c-ink) / 0.35)' : 'rgb(var(--c-mana-500))'} strokeWidth="2.5" strokeLinecap="round" fill="none">
              <path d="M22 60l4-8 4 8M66 60l4-8 4 8M24 72h8M64 72h8M48 24v8M42 30l6-6 6 6" />
            </g>
            {status === 'completed' && <path d="M48 56l4 8 9 1-6 6 2 9-9-5-9 5 2-9-6-6 9-1z" fill="rgb(var(--c-rune-gold))" />}
            {status === 'locked' && <Lock />}
          </g>
        ) : (
          <g>
            <circle cx="48" cy="48" r="40" fill={fill} stroke={stroke} strokeWidth="3" />
            <circle cx="48" cy="48" r="31" fill="none" stroke={stroke} strokeWidth="1.5" strokeDasharray="4 5" opacity="0.6" />
            {status === 'completed' && <path d="M48 28l6 12 13 2-9 9 2 13-12-6-12 6 2-13-9-9 13-2z" fill="rgb(var(--c-rune-gold))" />}
            {status === 'available' && (
              <g stroke="rgb(var(--c-forest-700))" strokeWidth="3" strokeLinecap="round" fill="none">
                <path d="M48 32v32M36 48h24M40 38l16 20M56 38L40 58" opacity="0.7" />
              </g>
            )}
            {status === 'locked' && <Lock />}
          </g>
        )}
      </svg>
    </button>
  );
}

/** A lock made of a knotted root. */
function Lock() {
  return (
    <g transform="translate(48 50)" stroke="rgb(var(--c-bark-600))" strokeWidth="3" strokeLinecap="round" fill="none">
      <rect x="-11" y="-2" width="22" height="18" rx="4" fill="rgb(var(--c-bark-600))" stroke="none" opacity="0.9" />
      <path d="M-7-2v-6a7 7 0 0 1 14 0v6" />
      <path d="M-14 10c-4 2-6 6-4 9M14 10c4 2 6 6 4 9" opacity="0.6" />
    </g>
  );
}
