import { furiganaSegments } from '@/content/dictionary';

type Props = {
  text: string;
  className?: string;
  /** Tapping a kanji run opens its dictionary sheet. */
  onKanji?: (run: string) => void;
  /** Hide the readings (e.g. «Enseñar al personal» for staff). */
  hideReadings?: boolean;
  as?: 'span' | 'p';
};

/** Japanese text with hiragana readings above every kanji run (ruby). Always lang="ja". */
export function Furigana({ text, className = '', onKanji, hideReadings = false, as: Tag = 'span' }: Props) {
  const segs = furiganaSegments(text);
  return (
    <Tag lang="ja" className={`font-kana ${className}`}>
      {segs.map((s, i) =>
        s.reading && !hideReadings ? (
          <ruby key={i} className={onKanji ? 'cursor-pointer rounded-sm underline decoration-dotted decoration-mana-500/60 underline-offset-4' : ''} onClick={onKanji ? () => onKanji(s.text) : undefined} role={onKanji ? 'button' : undefined} tabIndex={onKanji ? 0 : undefined} onKeyDown={onKanji ? (e) => (e.key === 'Enter' || e.key === ' ') && onKanji(s.text) : undefined}>
            {s.text}
            <rp>(</rp>
            <rt className="text-[0.5em] font-sans font-semibold text-ink-2">{s.reading}</rt>
            <rp>)</rp>
          </ruby>
        ) : (
          <span key={i}>{s.text}</span>
        ),
      )}
    </Tag>
  );
}
