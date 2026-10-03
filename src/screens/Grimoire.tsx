import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CATEGORY_LABEL, NODES, PHRASES, type Category, type Phrase } from '@/content';
import { learnedPhraseIds } from '@/domain/lessonGenerator';
import { normalizeAnswer } from '@/domain/answerCheck';
import { useProgressStore } from '@/store/progressStore';
import { JpText } from '@/components/ui/JpText';
import { SpeakerButton } from '@/components/ui/SpeakerButton';
import { Furigana } from '@/components/ui/Furigana';
import { KanjiSheet } from '@/components/ui/KanjiSheet';

const ORDER: (Category | 'hear')[] = ['basics', 'restaurant', 'shopping', 'hotel', 'transport', 'help', 'hear'];

/** Grimorio (spec §4.7): every phrase as a parchment card; unlearned ones stay sealed. */
export function GrimoireScreen() {
  const navigate = useNavigate();
  const completedNodes = useProgressStore((s) => s.completedNodes);
  const favorites = useProgressStore((s) => s.favorites);
  const toggleFavorite = useProgressStore((s) => s.toggleFavorite);
  const [query, setQuery] = useState('');
  const [onlyFav, setOnlyFav] = useState(false);
  const [sheet, setSheet] = useState<string | null>(null);

  const learned = useMemo(() => learnedPhraseIds(completedNodes), [completedNodes]);
  const nodeOf = (p: Phrase) => NODES.find((n) => n.phraseIds.includes(p.id));

  const q = query.trim().toLowerCase();
  const qr = q ? normalizeAnswer(q) : '';
  const matches = (p: Phrase) => {
    if (onlyFav && !favorites.includes(p.id)) return false;
    if (!q) return true;
    return p.es.toLowerCase().includes(q) || p.romaji.toLowerCase().includes(q) || p.kana.includes(query.trim()) || (qr.length > 1 && normalizeAnswer(p.romaji).includes(qr));
  };

  const groups = ORDER.map((cat) => ({
    cat,
    phrases: PHRASES.filter((p) => !p.hidden && (cat === 'hear' ? p.kind === 'hear' : p.kind === 'say' && p.category === cat) && matches(p)),
  })).filter((g) => g.phrases.length);

  const total = PHRASES.filter((p) => !p.hidden).length;
  const known = PHRASES.filter((p) => !p.hidden && learned.has(p.id)).length;

  return (
    <main className="screen pb-8">
      <div className="flex items-baseline justify-between py-3">
        <h1 className="font-display text-2xl">Grimorio</h1>
        <p className="text-sm text-ink-2">
          {known}/{total} hechizos
        </p>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <button className="btn-secondary" onClick={() => navigate('/travel')}>
          Modo viaje
        </button>
        <button className="btn-secondary" onClick={() => navigate('/dictionary')}>
          Diccionario
        </button>
      </div>
      <div className="mt-3 flex gap-2">
        <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar en español, romaji o kana" aria-label="Buscar" className="min-h-tap flex-1 rounded-stone border-2 border-line bg-surface px-4 text-base focus:border-primary" />
        <button type="button" aria-pressed={onlyFav} aria-label="Solo favoritos" onClick={() => setOnlyFav(!onlyFav)} className={`flex h-12 w-12 items-center justify-center rounded-stone border-2 ${onlyFav ? 'border-rune-gold bg-rune-gold/15 text-rune-gold' : 'border-line text-ink-2'}`}>
          <Star filled={onlyFav} />
        </button>
      </div>

      {groups.length === 0 && <p className="mt-6 text-ink-2">Ningún hechizo coincide.</p>}

      {groups.map((g) => (
        <section key={g.cat} className="mt-5">
          <h2 className="mb-2 font-display text-lg">{CATEGORY_LABEL[g.cat]}</h2>
          <ul className="flex flex-col gap-2">
            {g.phrases.map((p) => {
              const open = learned.has(p.id);
              const fav = favorites.includes(p.id);
              if (!open) {
                return (
                  <li key={p.id} className="flex items-center gap-3 rounded-stone border border-dashed border-bark-600/40 bg-parchment-100/50 px-4 py-3 text-forest-900/70">
                    <Seal />
                    <span className="min-w-0">
                      <span className="block font-semibold">{p.es}</span>
                      <span className="block text-xs">Sellado · se aprende en «{nodeOf(p)?.title ?? '…'}»</span>
                    </span>
                  </li>
                );
              }
              return (
                <li key={p.id} className="rounded-stone border-2 border-bark-600/50 bg-parchment-100 px-4 py-3 text-forest-900">
                  <div className="flex items-start gap-3">
                    <div className="min-w-0 flex-1">
                      <JpText as="p" className="text-xl leading-snug">
                        {p.kana}
                      </JpText>
                      <p className="text-sm opacity-80">{p.romaji}</p>
                      {p.kanji && p.kanji !== p.kana && <Furigana as="p" text={p.kanji} className="mt-1 text-lg leading-loose" onKanji={setSheet} />}
                      <p className="mt-1 font-bold">{p.es}</p>
                      {p.note && <p className="mt-1 text-xs opacity-80">{p.note}</p>}
                    </div>
                    <div className="flex flex-col items-center gap-2">
                      <SpeakerButton text={p.speech ?? p.kana} size="sm" className="!bg-forest-700/15 !text-forest-700" />
                      <button type="button" aria-pressed={fav} aria-label={fav ? 'Quitar de favoritos' : 'Añadir a favoritos'} onClick={() => toggleFavorite(p.id)} className={`flex h-10 w-10 items-center justify-center rounded-full ${fav ? 'text-rune-gold' : 'text-bark-600/60'}`}>
                        <Star filled={fav} />
                      </button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
      <KanjiSheet run={sheet} onClose={() => setSheet(null)} />
    </main>
  );
}

export function Star({ filled, size = 22 }: { filled: boolean; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z" />
    </svg>
  );
}

function Seal() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="9" fill="#6B4F35" opacity="0.8" />
      <circle cx="12" cy="12" r="5.5" fill="none" stroke="#F3EAD3" strokeWidth="1.2" opacity="0.8" />
    </svg>
  );
}
