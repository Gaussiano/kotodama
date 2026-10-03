import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HIRAGANA, KATAKANA, ROW_ORDER, WORDS, type KanaChar } from '@/content';
import { EXTENDED_ROWS } from '@/content/kana';
import { useProgressStore } from '@/store/progressStore';
import { useSettingsStore } from '@/store/settingsStore';
import { useSpeak } from '@/audio/useSpeak';
import { JpText } from '@/components/ui/JpText';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { SpeakerButton } from '@/components/ui/SpeakerButton';

const GROUP_LABEL: Record<KanaChar['group'], string> = { basic: 'Básicos', dakuten: 'Tenten ゛', handakuten: 'Maru ゜', yoon: 'Combinadas', extended: 'Extendidas (katakana)' };

/** Dojo de kana (spec §4.6): the two tables with mastery rings, examples and practice shortcuts. */
export function KanaDojoScreen() {
  const navigate = useNavigate();
  const srs = useProgressStore((s) => s.srs);
  const romajiMode = useSettingsStore((s) => s.romajiMode);
  const [script, setScript] = useState<'hiragana' | 'katakana'>('hiragana');
  const [showRomaji, setShowRomaji] = useState(romajiMode === 'always');
  const [selected, setSelected] = useState<KanaChar | null>(null);
  const speak = useSpeak();

  const list = script === 'hiragana' ? HIRAGANA : KATAKANA;
  const mastery = (id: string) => srs[id]?.box ?? 0;
  const rows = useMemo(() => {
    const order = [...ROW_ORDER, ...(script === 'katakana' ? EXTENDED_ROWS : [])];
    return order.map((row) => ({ row, chars: list.filter((k) => k.row === row) })).filter((r) => r.chars.length);
  }, [list, script]);

  const seen = list.filter((k) => mastery(k.id) > 0).length;
  const mastered = list.filter((k) => mastery(k.id) >= 5).length;
  const examples = selected ? WORDS.filter((w) => w.requiredKana.includes(selected.id)).slice(0, 4) : [];
  const prefix = script === 'hiragana' ? 'h' : 'k';

  let lastGroup: KanaChar['group'] | null = null;

  return (
    <main className="screen pb-8">
      <div className="py-3">
        <h1 className="font-display text-2xl">Dojo de kana</h1>
        <p className="text-sm text-ink-2">
          {seen}/{list.length} vistos · {mastered} dominados
        </p>
      </div>

      <div className="flex gap-1 rounded-stone bg-ink/5 p-1" role="tablist">
        {(['hiragana', 'katakana'] as const).map((s) => (
          <button key={s} type="button" role="tab" aria-selected={script === s} onClick={() => setScript(s)} className={`min-h-10 flex-1 rounded-xl text-sm font-bold ${script === s ? 'bg-primary text-on-primary' : 'text-ink-2'}`}>
            {s === 'hiragana' ? 'Hiragana ひ' : 'Katakana カ'}
          </button>
        ))}
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <button className="btn-secondary !w-auto px-3 text-sm" onClick={() => navigate('/lesson/kana:weak')}>
          Practicar los más flojos
        </button>
        <button className="btn-primary !w-auto px-3 text-sm" onClick={() => navigate('/kana/quick')}>
          Práctica rápida de 60 s
        </button>
        <label className="ml-auto flex items-center gap-2 text-sm">
          <input type="checkbox" checked={showRomaji} onChange={(e) => setShowRomaji(e.target.checked)} className="h-5 w-5" />
          Romaji
        </label>
      </div>

      <div className="mt-4 flex flex-col gap-2">
        {rows.map(({ row, chars }) => {
          const group = chars[0]!.group;
          const header = group !== lastGroup;
          lastGroup = group;
          return (
            <div key={row}>
              {header && <p className="mb-1 mt-3 text-xs font-bold text-ink-2">{GROUP_LABEL[group]}</p>}
              <div className="flex items-center gap-1">
                <div className={`grid flex-1 gap-1 ${chars.length <= 3 ? 'grid-cols-5' : 'grid-cols-5'}`}>
                  {chars.map((k) => (
                    <button key={k.id} type="button" onClick={() => setSelected(k)} className="flex min-h-[64px] flex-col items-center justify-center rounded-xl border border-line bg-surface py-1" aria-label={`${k.char}, ${k.romaji}, dominio ${mastery(k.id)} de 5`}>
                      <JpText className="text-2xl leading-none">{k.char}</JpText>
                      {showRomaji && <span className="text-[11px] text-ink-2">{k.romaji}</span>}
                      <Rings level={mastery(k.id)} />
                    </button>
                  ))}
                </div>
                <button type="button" aria-label={`Practicar la fila ${row}`} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary" onClick={() => navigate(`/lesson/kana:${prefix}:${row}`)}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z" /></svg>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <BottomSheet open={selected !== null} onClose={() => setSelected(null)}>
        {selected && (
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-4">
              <JpText className="text-kana-lg leading-none">{selected.char}</JpText>
              <div>
                <p className="text-2xl font-extrabold">{selected.romaji}</p>
                <p className="text-sm text-ink-2">Dominio: {mastery(selected.id)} / 5</p>
              </div>
              <SpeakerButton text={selected.char} className="ml-auto" />
            </div>
            {examples.length > 0 && (
              <ul className="space-y-1">
                {examples.map((w) => (
                  <li key={w.id} className="flex items-center gap-2 rounded-xl bg-ink/5 px-3 py-2">
                    <button type="button" className="flex-1 text-left" onClick={() => void speak(w.kana)}>
                      <JpText className="text-lg">{w.kana}</JpText>
                      <span className="ml-2 text-sm text-ink-2">{w.romaji} · {w.es}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <button className="btn-primary" onClick={() => navigate(`/lesson/kana:${prefix}:${selected.row}`)}>
              Practicar esta fila
            </button>
          </div>
        )}
      </BottomSheet>
    </main>
  );
}

function Rings({ level }: { level: number }) {
  return (
    <span className="mt-0.5 flex gap-0.5" aria-hidden="true">
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} className={`h-1.5 w-1.5 rounded-full ${i <= level ? (level >= 5 ? 'bg-rune-gold' : 'bg-moss-500') : 'bg-ink/15'}`} />
      ))}
    </span>
  );
}
