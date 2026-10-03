import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PHRASE_BY_ID } from '@/content';
import { DICT_ENTRIES, type DictEntry, type DictKind } from '@/content/dictionary';
import { normalizeAnswer } from '@/domain/answerCheck';
import { useProgressStore } from '@/store/progressStore';
import { JpText } from '@/components/ui/JpText';
import { Furigana } from '@/components/ui/Furigana';
import { SpeakerButton } from '@/components/ui/SpeakerButton';
import { KanjiSheet } from '@/components/ui/KanjiSheet';
import { Fuku } from '@/components/mascot/Fuku';

/** Diccionario: the words and kanji met in exercises, collected automatically, plus manual saves. */
export function DictionaryScreen() {
  const navigate = useNavigate();
  const dict = useProgressStore((s) => s.dictionary);
  const add = useProgressStore((s) => s.addToDictionary);
  const [kind, setKind] = useState<DictKind>('kanji');
  const [query, setQuery] = useState('');
  const [showAll, setShowAll] = useState(false);
  const [sheet, setSheet] = useState<string | null>(null);

  const q = query.trim().toLowerCase();
  const qr = q ? normalizeAnswer(q) : '';
  const matches = (e: DictEntry) => !q || e.jp.includes(query.trim()) || e.es.toLowerCase().includes(q) || e.reading.toLowerCase().includes(q) || (qr.length > 1 && normalizeAnswer(e.reading).includes(qr));

  const entries = useMemo(() => {
    const list = DICT_ENTRIES.filter((e) => e.kind === kind && matches(e));
    const learned = list.filter((e) => dict[e.id]).sort((a, b) => (dict[b.id]! > dict[a.id]! ? 1 : -1));
    const rest = showAll ? list.filter((e) => !dict[e.id]) : [];
    return { learned, rest };
  }, [kind, dict, showAll, q]); // eslint-disable-line react-hooks/exhaustive-deps

  const counts = { word: DICT_ENTRIES.filter((e) => e.kind === 'word' && dict[e.id]).length, kanji: DICT_ENTRIES.filter((e) => e.kind === 'kanji' && dict[e.id]).length };
  const totals = { word: DICT_ENTRIES.filter((e) => e.kind === 'word').length, kanji: DICT_ENTRIES.filter((e) => e.kind === 'kanji').length };

  const row = (e: DictEntry, learned: boolean) => {
    const example = e.examplePhraseId ? PHRASE_BY_ID[e.examplePhraseId] : undefined;
    return (
      <li key={e.id} className={`rounded-stone border-2 bg-surface px-4 py-3 ${learned ? 'border-line' : 'border-dashed border-line opacity-70'}`}>
        <div className="flex items-start gap-3">
          <button type="button" className="min-w-0 flex-1 text-left" onClick={() => e.kind === 'kanji' && setSheet(e.jp)}>
            {e.kind === 'kanji' ? (
              <span className="flex items-baseline gap-3">
                <JpText variant="ui" className="text-3xl font-bold leading-none">{e.jp}</JpText>
                <JpText className="text-lg">{e.reading}</JpText>
              </span>
            ) : (
              <span className="flex items-baseline gap-3">
                <JpText className="text-2xl leading-none">{e.jp}</JpText>
                <span className="text-sm text-ink-2">{e.reading}</span>
              </span>
            )}
            <span className="mt-1 block">{e.es}</span>
            {example && e.kind === 'kanji' && (
              <span className="mt-1 block text-sm text-ink-2">
                <Furigana text={example.kanji ?? example.kana} /> · {example.es}
              </span>
            )}
            {learned && <span className="mt-1 block text-xs text-ink-2">Aprendido el {dict[e.id]!.slice(0, 10)}</span>}
          </button>
          <div className="flex flex-col items-center gap-1">
            <SpeakerButton text={e.kind === 'kanji' ? e.reading : e.jp} size="sm" />
            {!learned && (
              <button type="button" className="text-xs font-bold text-primary" onClick={() => add([e.id])}>
                Guardar
              </button>
            )}
          </div>
        </div>
      </li>
    );
  };

  return (
    <main className="screen pb-8">
      <header className="flex items-center gap-2 py-2">
        <button type="button" aria-label="Volver" className="flex h-11 w-11 items-center justify-center rounded-full text-ink-2" onClick={() => navigate(-1)}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M15 5l-7 7 7 7" /></svg>
        </button>
        <div>
          <h1 className="font-display text-2xl">Diccionario</h1>
          <p className="text-xs text-ink-2">Se rellena solo con lo que aparece en tus ejercicios. Toca un kanji para ver su lectura.</p>
        </div>
      </header>

      <div className="flex gap-1 rounded-stone bg-ink/5 p-1" role="tablist">
        {(['kanji', 'word'] as DictKind[]).map((k) => (
          <button key={k} type="button" role="tab" aria-selected={kind === k} onClick={() => setKind(k)} className={`min-h-10 flex-1 rounded-xl text-sm font-bold ${kind === k ? 'bg-primary text-on-primary' : 'text-ink-2'}`}>
            {k === 'kanji' ? `Kanji ${counts.kanji}/${totals.kanji}` : `Palabras ${counts.word}/${totals.word}`}
          </button>
        ))}
      </div>

      <div className="mt-3 flex items-center gap-2">
        <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar" aria-label="Buscar en el diccionario" className="min-h-tap flex-1 rounded-stone border-2 border-line bg-surface px-4 text-base focus:border-primary" />
        <label className="flex items-center gap-1 text-sm">
          <input type="checkbox" checked={showAll} onChange={(e) => setShowAll(e.target.checked)} className="h-5 w-5" /> Ver todo
        </label>
      </div>

      {entries.learned.length === 0 && !showAll && (
        <div className="card mt-4 flex items-center gap-3">
          <Fuku state="thinking" size={64} />
          <p className="text-sm text-ink-2">Aún no hay {kind === 'kanji' ? 'kanji' : 'palabras'} aquí. Aparecen solos al hacer lecciones, o marca «Ver todo» y guarda los que quieras.</p>
        </div>
      )}
      <ul className="mt-3 flex flex-col gap-2">{entries.learned.map((e) => row(e, true))}</ul>
      {entries.rest.length > 0 && (
        <>
          <p className="mt-4 text-xs font-bold text-ink-2">Todavía no aprendidos</p>
          <ul className="mt-2 flex flex-col gap-2">{entries.rest.map((e) => row(e, false))}</ul>
        </>
      )}

      <KanjiSheet run={sheet} onClose={() => setSheet(null)} />
    </main>
  );
}
