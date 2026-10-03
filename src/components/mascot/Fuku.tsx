export type FukuState = 'neutral' | 'happy' | 'thinking' | 'oops' | 'sleeping';

type Props = { state?: FukuState; size?: number; className?: string; title?: string };

/**
 * Fuku (ふくろう), the owl guide (spec §3.5): a small round owl with a moss cape closed by a leaf
 * brooch and a tiny lantern. Original, simple and geometric. Five states.
 */
export function Fuku({ state = 'neutral', size = 120, className = '', title = 'Fuku, el búho guía' }: Props) {
  const moss = '#5E8C3A';
  const mossDark = '#3F6428';
  const body = '#8C6A4B';
  const belly = '#E6D3B3';
  const beak = '#C9A13B';
  const ink = '#0E2419';
  const glow = '#F3CF6B';

  const eyes = () => {
    switch (state) {
      case 'happy':
        return (
          <g stroke={ink} strokeWidth="3" fill="none" strokeLinecap="round">
            <path d="M40 54q7-8 14 0" />
            <path d="M66 54q7-8 14 0" />
          </g>
        );
      case 'sleeping':
        return (
          <g stroke={ink} strokeWidth="3" fill="none" strokeLinecap="round">
            <path d="M40 56q7 6 14 0" />
            <path d="M66 56q7 6 14 0" />
          </g>
        );
      case 'thinking':
        return (
          <g>
            <circle cx="47" cy="55" r="7" fill="#fff" />
            <circle cx="48" cy="55" r="3.5" fill={ink} />
            <path d="M66 56q7-4 14 0" stroke={ink} strokeWidth="3" fill="none" strokeLinecap="round" />
          </g>
        );
      case 'oops':
        return (
          <g>
            <circle cx="47" cy="55" r="9" fill="#fff" />
            <circle cx="73" cy="55" r="9" fill="#fff" />
            <circle cx="47" cy="56" r="3" fill={ink} />
            <circle cx="73" cy="56" r="3" fill={ink} />
            <path d="M92 38q4 6 0 10" stroke="#7FB7D8" strokeWidth="3" fill="none" strokeLinecap="round" />
          </g>
        );
      default:
        return (
          <g>
            <circle cx="47" cy="55" r="8" fill="#fff" />
            <circle cx="73" cy="55" r="8" fill="#fff" />
            <circle cx="48" cy="56" r="3.5" fill={ink} />
            <circle cx="74" cy="56" r="3.5" fill={ink} />
          </g>
        );
    }
  };

  const wingsUp = state === 'happy';

  return (
    <svg width={size} height={size} viewBox="0 0 120 120" role="img" aria-label={title} className={className}>
      {/* lantern */}
      <g transform="translate(96 70)">
        <line x1="0" y1="-14" x2="0" y2="-4" stroke={mossDark} strokeWidth="2" />
        <rect x="-6" y="-4" width="12" height="16" rx="3" fill="#6B4F35" />
        <rect x="-4" y="-1" width="8" height="10" rx="2" fill={glow} opacity="0.95" />
        <circle cx="0" cy="4" r="7" fill={glow} opacity="0.25" />
      </g>
      {/* body */}
      <ellipse cx="60" cy="72" rx="34" ry="36" fill={body} />
      <ellipse cx="60" cy="80" rx="20" ry="22" fill={belly} />
      {/* cape */}
      <path d="M26 70q4 30 34 40q30-10 34-40q-10 14-34 14q-24 0-34-14z" fill={moss} />
      <path d="M30 72q6 22 30 30q24-8 30-30" fill="none" stroke={mossDark} strokeWidth="2" opacity="0.6" />
      {/* leaf brooch */}
      <path d="M60 66q-8 0-10 8q8 2 10-8z" fill="#A7C66B" stroke={mossDark} strokeWidth="1.5" />
      <path d="M60 66q8 0 10 8q-8 2-10-8z" fill="#A7C66B" stroke={mossDark} strokeWidth="1.5" />
      {/* wings */}
      <ellipse cx="30" cy={wingsUp ? 60 : 78} rx="9" ry="16" fill={body} transform={wingsUp ? 'rotate(-35 30 60)' : 'rotate(12 30 78)'} />
      <ellipse cx="90" cy={wingsUp ? 60 : 78} rx="9" ry="16" fill={body} transform={wingsUp ? 'rotate(35 90 60)' : 'rotate(-12 90 78)'} />
      {/* head */}
      <circle cx="60" cy="52" r="30" fill={body} />
      <path d="M36 32l6-12 8 10z" fill={body} />
      <path d="M84 32l-6-12-8 10z" fill={body} />
      <circle cx="47" cy="55" r="13" fill={belly} />
      <circle cx="73" cy="55" r="13" fill={belly} />
      {eyes()}
      <path d="M60 60l-5 7h10z" fill={beak} />
      {state === 'sleeping' && (
        <text x="92" y="30" fontFamily="Nunito, sans-serif" fontWeight="800" fontSize="12" fill={ink} opacity="0.7">
          z z
        </text>
      )}
      {/* feet */}
      <path d="M50 106l-4 6M54 106l0 7M70 106l4 6M66 106l0 7" stroke={beak} strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}
