import { useId } from 'react';
import { useReducedMotion } from 'motion/react';

type Props = {
  /** Kana of the phrase just cast: becomes the middle ring. */
  kana?: string;
  size?: number;
  /** 'burst' = 900 ms bloom (correct answer); 'complete' = steady full circle (lesson finished). */
  mode?: 'burst' | 'complete';
  className?: string;
};

/**
 * Original spell circle (spec §3.4): three concentric rings, the middle one made of the kana of
 * the phrase, rotating slowly; a spell-glow flash and 8 leaves that scatter.
 */
export function SpellCircle({ kana = '言霊', size = 220, mode = 'burst', className = '' }: Props) {
  const reduced = useReducedMotion();
  const id = useId().replace(/:/g, '');
  const r = size / 2;
  const ringText = Array.from({ length: 6 }, () => kana.replace(/\s/g, '')).join('　');
  const burst = mode === 'burst';

  return (
    <div className={`pointer-events-none ${className}`} style={{ width: size, height: size }} aria-hidden="true">
      <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size} className={reduced ? 'spell-fade' : burst ? 'spell-burst' : 'spell-steady'}>
        <defs>
          <radialGradient id={`g${id}`}>
            <stop offset="0" stopColor="rgb(var(--c-spell-glow))" stopOpacity="0.55" />
            <stop offset="0.7" stopColor="rgb(var(--c-mana-500))" stopOpacity="0.1" />
            <stop offset="1" stopColor="rgb(var(--c-mana-500))" stopOpacity="0" />
          </radialGradient>
          <path id={`p${id}`} d={`M ${r} ${r} m -${r * 0.62} 0 a ${r * 0.62} ${r * 0.62} 0 1 1 ${r * 1.24} 0 a ${r * 0.62} ${r * 0.62} 0 1 1 -${r * 1.24} 0`} />
        </defs>
        <circle cx={r} cy={r} r={r * 0.95} fill={`url(#g${id})`} />
        <circle cx={r} cy={r} r={r * 0.9} fill="none" stroke="rgb(var(--c-spell-glow))" strokeWidth="2" opacity="0.9" />
        <g className={reduced ? '' : 'spell-rotate'} style={{ transformOrigin: `${r}px ${r}px` }}>
          <circle cx={r} cy={r} r={r * 0.8} fill="none" stroke="rgb(var(--c-mana-500))" strokeWidth="1.5" strokeDasharray="10 7" opacity="0.8" />
          <text fontSize={size * 0.085} fill="rgb(var(--c-mana-500))" lang="ja" fontFamily="'Klee One', serif" opacity="0.9">
            <textPath href={`#p${id}`} startOffset="0">
              {ringText}
            </textPath>
          </text>
        </g>
        <circle cx={r} cy={r} r={r * 0.42} fill="none" stroke="rgb(var(--c-spell-glow))" strokeWidth="2.5" opacity="0.8" />
        <g stroke="rgb(var(--c-spell-glow))" strokeWidth="2" strokeLinecap="round" opacity="0.9">
          {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
            <line key={a} x1={r} y1={r * 0.05} x2={r} y2={r * 0.12} transform={`rotate(${a} ${r} ${r})`} />
          ))}
        </g>
        {burst && !reduced && (
          <g>
            {[0, 40, 85, 130, 180, 220, 270, 320].map((a, i) => (
              <path
                key={a}
                className="spell-leaf"
                style={{ animationDelay: `${i * 35}ms`, transformOrigin: `${r}px ${r}px`, ['--a' as string]: `${a}deg` }}
                d={`M ${r} ${r - 10} q 6 -8 0 -16 q -6 8 0 16 z`}
                fill={i % 2 ? 'rgb(var(--c-leaf-300))' : 'rgb(var(--c-spell-glow))'}
              />
            ))}
          </g>
        )}
      </svg>
    </div>
  );
}
