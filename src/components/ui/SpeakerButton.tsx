import { useRef } from 'react';
import { useSpeak } from '@/audio/useSpeak';

type Props = {
  text: string;
  fill?: string;
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  className?: string;
  /** Called with the pressed state so parents can show a pulse. */
  onSpeak?: () => void;
};

/** Speaker button: tap = normal speed, long press (450 ms) = slow (spec §6). */
export function SpeakerButton({ text, fill, size = 'md', label = 'Escuchar', className = '', onSpeak }: Props) {
  const speak = useSpeak();
  const timer = useRef<number | null>(null);
  const firedSlow = useRef(false);

  const start = () => {
    firedSlow.current = false;
    timer.current = window.setTimeout(() => {
      firedSlow.current = true;
      onSpeak?.();
      void speak(text, { slow: true, fill });
    }, 450);
  };
  const end = () => {
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = null;
    if (!firedSlow.current) {
      onSpeak?.();
      void speak(text, { fill });
    }
  };
  const cancel = () => {
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = null;
  };

  const dims = size === 'lg' ? 'h-24 w-24' : size === 'sm' ? 'h-10 w-10' : 'h-12 w-12';
  const icon = size === 'lg' ? 44 : size === 'sm' ? 20 : 24;
  return (
    <button
      type="button"
      aria-label={`${label} (mantén pulsado para oírlo despacio)`}
      className={`inline-flex shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary active:bg-primary/30 ${dims} ${className}`}
      onPointerDown={start}
      onPointerUp={end}
      onPointerLeave={cancel}
      onPointerCancel={cancel}
      onContextMenu={(e) => e.preventDefault()}
    >
      <svg width={icon} height={icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M4 9v6h4l5 4V5L8 9z" />
        <path d="M16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12" />
      </svg>
    </button>
  );
}
