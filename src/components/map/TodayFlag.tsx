/** «Hoy toca» marker: a small flag with a lantern over today's node (spec §3.6). */
export function TodayFlag() {
  return (
    <div className="flex flex-col items-center" aria-label="Hoy toca">
      <span className="rounded-full bg-rune-gold px-2 py-0.5 text-[11px] font-extrabold text-forest-900">Hoy toca</span>
      <svg width="22" height="30" viewBox="0 0 22 30" aria-hidden="true">
        <line x1="11" y1="0" x2="11" y2="8" stroke="rgb(var(--c-bark-600))" strokeWidth="2" />
        <rect x="5" y="8" width="12" height="16" rx="3" fill="rgb(var(--c-bark-600))" />
        <rect x="7.5" y="11" width="7" height="10" rx="2" fill="#F3CF6B" />
        <circle cx="11" cy="16" r="9" fill="#F3CF6B" opacity="0.2" />
        <path d="M11 24v6" stroke="rgb(var(--c-bark-600))" strokeWidth="2" />
      </svg>
    </div>
  );
}
