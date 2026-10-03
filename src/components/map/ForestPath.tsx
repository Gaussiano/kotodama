import type { LessonNode } from '@/content';
import type { NodeStatus } from '@/domain/unlock';
import { NodeStone } from './NodeStone';
import { TodayFlag } from './TodayFlag';
import { FlowerField } from './FlowerField';

export const NODE_STEP = 112;

type Props = {
  nodes: LessonNode[];
  statusOf: (n: LessonNode) => NodeStatus;
  todayId?: string;
  onOpen: (n: LessonNode) => void;
  /** Guardian beaten: show flowers (animated right after the win). */
  bloom: 'none' | 'static' | 'animate';
  seed: number;
};

/** Winding vertical path with rune stones for one region (spec §3.6). */
export function ForestPath({ nodes, statusOf, todayId, onOpen, bloom, seed }: Props) {
  const TOP = 100;
  const height = nodes.length * NODE_STEP + TOP;
  const width = 100; // percentage space; x positions in %
  const points = nodes.map((_, i) => ({ x: 50 + Math.sin(i * 1.05 + seed) * 26, y: TOP + i * NODE_STEP }));
  const d = points.map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `C ${points[i - 1]!.x} ${points[i - 1]!.y + NODE_STEP * 0.5}, ${p.x} ${p.y - NODE_STEP * 0.5}, ${p.x} ${p.y}`)).join(' ');

  return (
    <div className="relative mx-auto max-w-app" style={{ height }}>
      <svg className="absolute inset-0 h-full w-full" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" aria-hidden="true">
        <path d={d} fill="none" stroke="rgb(var(--c-forest-700))" strokeWidth="10" strokeLinecap="round" opacity="0.18" vectorEffect="non-scaling-stroke" />
        <path d={d} fill="none" stroke="rgb(var(--c-bark-600))" strokeWidth="3" strokeDasharray="1 9" strokeLinecap="round" opacity="0.55" vectorEffect="non-scaling-stroke" />
      </svg>
      {bloom !== 'none' && <FlowerField height={height} animate={bloom === 'animate'} seed={seed} />}
      {nodes.map((n, i) => {
        const p = points[i]!;
        const status = statusOf(n);
        const isBoss = n.kind === 'boss' || n.kind === 'finalBoss';
        return (
          <div key={n.id} className="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center" style={{ left: `${p.x}%`, top: p.y }}>
            {todayId === n.id && (
              <div className="absolute -top-14">
                <TodayFlag />
              </div>
            )}
            <NodeStone node={n} status={status} onOpen={() => onOpen(n)} />
            <span className={`mt-1 max-w-[150px] text-center text-xs font-bold leading-tight ${status === 'locked' ? 'text-ink-2' : 'text-ink'} ${isBoss ? 'font-display text-sm' : ''}`}>{n.title}</span>
          </div>
        );
      })}
    </div>
  );
}
