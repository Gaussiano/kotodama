/**
 * Field of original SVG flowers that bloom staggered along a region's path when its guardian falls
 * (spec §3.4). Rendered inside the region section; purely decorative.
 */
export function FlowerField({ height, animate, seed }: { height: number; animate: boolean; seed: number }) {
  const flowers = Array.from({ length: Math.max(8, Math.floor(height / 36)) }, (_, i) => {
    const t = (Math.sin(seed * 7 + i * 13.7) + 1) / 2;
    const u = (Math.cos(seed * 3 + i * 9.1) + 1) / 2;
    return { x: 6 + t * 88, y: 20 + (i / Math.max(1, Math.floor(height / 36))) * (height - 40) + u * 14, c: i % 3, d: i * 70 };
  });
  const colors = ['rgb(var(--c-spell-glow))', 'rgb(var(--c-leaf-300))', '#E9B3C8'];
  return (
    <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox={`0 0 100 ${height}`} preserveAspectRatio="none" aria-hidden="true">
      {flowers.map((f, i) => (
        <g key={i} transform={`translate(${f.x} ${f.y})`} className={animate ? 'flower' : ''} style={{ animationDelay: `${f.d}ms` }}>
          <line x1="0" y1="0" x2="0" y2="-7" stroke="rgb(var(--c-moss-500))" strokeWidth="1" vectorEffect="non-scaling-stroke" />
          {[0, 72, 144, 216, 288].map((a) => (
            <ellipse key={a} cx="0" cy="-10" rx="1.6" ry="2.6" fill={colors[f.c]} transform={`rotate(${a} 0 -7)`} />
          ))}
          <circle cx="0" cy="-7" r="1.3" fill="rgb(var(--c-rune-gold))" />
        </g>
      ))}
    </svg>
  );
}
