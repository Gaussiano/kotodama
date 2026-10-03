import { NavLink } from 'react-router-dom';

const tabs = [
  { to: '/', label: 'Mapa', icon: MapIcon },
  { to: '/review', label: 'Repaso', icon: ReviewIcon },
  { to: '/kana', label: 'Kana', icon: KanaIcon },
  { to: '/grimoire', label: 'Grimorio', icon: BookIcon },
  { to: '/profile', label: 'Perfil', icon: ProfileIcon },
] as const;

export function TabBar() {
  return (
    <nav
      aria-label="Secciones"
      className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-surface/95 backdrop-blur"
      style={{ paddingBottom: 'var(--safe-bottom)' }}
    >
      <ul className="mx-auto flex max-w-app items-stretch justify-around">
        {tabs.map(({ to, label, icon: Icon }) => (
          <li key={to} className="flex-1">
            <NavLink
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `flex min-h-[56px] flex-col items-center justify-center gap-0.5 text-xs font-semibold ${
                  isActive ? 'text-primary' : 'text-ink-2'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon active={isActive} />
                  <span>{label}</span>
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}

type IconProps = { active: boolean };
const stroke = (active: boolean) => ({
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: active ? 2.2 : 1.8,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
});

function MapIcon({ active }: IconProps) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true" {...stroke(active)}>
      <path d="M4 19c3-2 4-6 2-9s0-7 3-7 3 5 6 6 4 5 2 8" />
      <circle cx="6" cy="19" r="1.6" fill={active ? 'currentColor' : 'none'} />
      <circle cx="17" cy="17" r="1.6" fill={active ? 'currentColor' : 'none'} />
    </svg>
  );
}
function ReviewIcon({ active }: IconProps) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true" {...stroke(active)}>
      <path d="M4 12a8 8 0 0 1 14-5.3M20 12a8 8 0 0 1-14 5.3" />
      <path d="M18 3v4h-4M6 21v-4h4" />
    </svg>
  );
}
function KanaIcon({ active }: IconProps) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true" {...stroke(active)}>
      <path d="M5 8c3 0 7-1 10-3M9 5c0 6-1 11-5 15M11 11c4 2 6 5 7 9M13 14c2-1 4-1 6 0" />
    </svg>
  );
}
function BookIcon({ active }: IconProps) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true" {...stroke(active)}>
      <path d="M4 5.5A1.5 1.5 0 0 1 5.5 4H12v15H5.5A1.5 1.5 0 0 0 4 20.5z" />
      <path d="M20 5.5A1.5 1.5 0 0 0 18.5 4H12v15h6.5a1.5 1.5 0 0 1 1.5 1.5z" />
    </svg>
  );
}
function ProfileIcon({ active }: IconProps) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true" {...stroke(active)}>
      <circle cx="12" cy="8.5" r="3.5" />
      <path d="M5 20c1-4 4-6 7-6s6 2 7 6" />
    </svg>
  );
}
