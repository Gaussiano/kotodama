import type { ReactNode } from 'react';

/** Minimal markdown for info cards: paragraphs, «- » bullets, **bold**, *italic*. Japanese gets lang="ja". */
function inline(text: string): ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**')) return <strong key={i}>{inline(part.slice(2, -2))}</strong>;
    if (part.startsWith('*')) return <em key={i}>{inline(part.slice(1, -1))}</em>;
    // Wrap runs of Japanese in a lang="ja" span so fonts and screen readers switch.
    const chunks = part.split(/([　-ヿ一-鿿！-～]+)/g);
    return chunks.map((c, j) => (/^[　-ヿ一-鿿！-～]+$/.test(c) ? <span key={`${i}-${j}`} lang="ja" className="font-kana">{c}</span> : c));
  });
}

export function Markdown({ text, className = '' }: { text: string; className?: string }) {
  const blocks = text.split(/\n\s*\n/);
  return (
    <div className={`space-y-3 ${className}`}>
      {blocks.map((block, i) => {
        const lines = block.split('\n');
        if (lines.every((l) => l.startsWith('- '))) {
          return (
            <ul key={i} className="list-disc space-y-1 pl-5">
              {lines.map((l, j) => (
                <li key={j}>{inline(l.slice(2))}</li>
              ))}
            </ul>
          );
        }
        return <p key={i}>{inline(block)}</p>;
      })}
    </div>
  );
}
