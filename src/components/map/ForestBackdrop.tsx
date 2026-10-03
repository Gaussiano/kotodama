import { useEffect, useRef } from 'react';
import { useReducedMotion } from 'motion/react';
import { useSettingsStore } from '@/store/settingsStore';

/**
 * Layered tree silhouettes behind the map with a subtle scroll parallax (spec §3.6).
 * Fixed-position SVG layers; the far layer moves slowest. Disabled under reduced motion.
 */
export function ForestBackdrop() {
  const reduced = useReducedMotion() || useSettingsStore((s) => s.reducedMotion);
  const far = useRef<SVGSVGElement>(null);
  const mid = useRef<SVGSVGElement>(null);
  const near = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (reduced) return;
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const y = window.scrollY;
        if (far.current) far.current.style.transform = `translate3d(0, ${(-y * 0.04).toFixed(1)}px, 0)`;
        if (mid.current) mid.current.style.transform = `translate3d(0, ${(-y * 0.09).toFixed(1)}px, 0)`;
        if (near.current) near.current.style.transform = `translate3d(0, ${(-y * 0.16).toFixed(1)}px, 0)`;
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(raf);
    };
  }, [reduced]);

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
      <Layer ref={far} opacity={0.07} trees={[[2, 26], [16, 18], [30, 30], [46, 20], [62, 28], [78, 17], [94, 26]]} scale={1} />
      <Layer ref={mid} opacity={0.1} trees={[[-2, 36], [12, 26], [26, 40], [42, 28], [58, 38], [74, 24], [90, 36], [104, 30]]} scale={1} />
      <Layer ref={near} opacity={0.14} trees={[[-4, 48], [8, 34], [92, 44], [106, 32]]} scale={1} />
    </div>
  );
}

import { forwardRef } from 'react';

type LayerProps = { opacity: number; trees: [x: number, h: number][]; scale: number };

const Layer = forwardRef<SVGSVGElement, LayerProps>(function Layer({ opacity, trees, scale }, ref) {
  return (
    <svg ref={ref} className="absolute bottom-0 left-0 h-[140vh] w-full will-change-transform" viewBox="0 0 100 160" preserveAspectRatio="xMidYMax slice" style={{ opacity }}>
      {trees.map(([x, h], i) => (
        <g key={i} transform={`translate(${x} 160) scale(${scale})`}>
          <path d={`M0 0 L-9 0 L-5 -${h * 0.35} L-7 -${h * 0.35} L-3 -${h * 0.65} L-5 -${h * 0.65} L0 -${h} L5 -${h * 0.65} L3 -${h * 0.65} L7 -${h * 0.35} L5 -${h * 0.35} L9 0 Z`} fill="rgb(var(--c-forest-900))" />
          <circle cx={i % 2 ? 9 : -9} cy={-h * 0.3} r={h * 0.11} fill="rgb(var(--c-forest-700))" />
        </g>
      ))}
    </svg>
  );
});
