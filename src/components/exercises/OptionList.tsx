import type { ReactNode } from 'react';

export interface Option {
  id: string;
  content: ReactNode;
  correct: boolean;
}

type Props = {
  options: Option[];
  selected: string | null;
  revealed: boolean;
  onSelect: (id: string) => void;
  columns?: 1 | 2;
  /** Row trailing control rendered outside the selectable area (e.g. a speaker). */
  trailing?: (o: Option) => ReactNode;
};

/** Plain bordered rows (no shadows: the spell circle is the only loud element). */
export function OptionList({ options, selected, revealed, onSelect, columns = 1, trailing }: Props) {
  return (
    <ul className={`grid gap-2 ${columns === 2 ? 'grid-cols-2' : 'grid-cols-1'}`} role="listbox" aria-label="Opciones">
      {options.map((o) => {
        const isSel = selected === o.id;
        let tone = 'border-line bg-surface';
        if (revealed && o.correct) tone = 'border-moss-500 bg-moss-500/15';
        else if (revealed && isSel && !o.correct) tone = 'border-ember-500 bg-ember-500/10';
        else if (isSel) tone = 'border-primary bg-primary/10';
        return (
          <li key={o.id} className="flex items-stretch gap-2">
            <button
              type="button"
              role="option"
              aria-selected={isSel}
              disabled={revealed}
              onClick={() => onSelect(o.id)}
              className={`min-h-tap flex-1 rounded-stone border-2 px-4 py-3 text-left text-base transition-colors ${tone}`}
            >
              {o.content}
            </button>
            {trailing?.(o)}
          </li>
        );
      })}
    </ul>
  );
}
