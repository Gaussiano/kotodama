import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BLANK, PHRASE_BY_ID, PHRASES, ROUTE_HOTELS, type Category, type Phrase } from '@/content';
import { formatNumberEs, toJapaneseReading, toPriceReading } from '@/content/numbers';
import { normalizeAnswer } from '@/domain/answerCheck';
import { useProgressStore } from '@/store/progressStore';
import { useSettingsStore } from '@/store/settingsStore';
import { useSpeak } from '@/audio/useSpeak';
import { JpText } from '@/components/ui/JpText';
import { Star } from './Grimoire';
import { Furigana } from '@/components/ui/Furigana';

type TravelCat = Category | 'hear' | 'numbers' | 'route';
const CATS: { id: TravelCat; label: string; hint: string }[] = [
  { id: 'route', label: 'Tu ruta', hint: 'Hoteles para el taxi y trenes' },
  { id: 'basics', label: 'Básicos', hint: 'Saludos, gracias, perdón' },
  { id: 'restaurant', label: 'Restaurante', hint: 'Mesa, pedir, pagar' },
  { id: 'shopping', label: 'Tiendas y konbini', hint: 'Precios, bolsa, tarjeta' },
  { id: 'hotel', label: 'Hotel', hint: 'Check-in, desayuno, wifi' },
  { id: 'transport', label: 'Moverse', hint: 'Tren, taxi, ¿dónde está?' },
  { id: 'help', label: 'Ayuda y emergencias', hint: 'Repetir, fotos, perderse' },
  { id: 'hear', label: 'Lo que te dirán', hint: 'Para entenderles' },
  { id: 'numbers', label: 'Números y precios', hint: 'Calculadora de yenes' },
];

import { MAP_FLAG } from './travelFlag';

/** Modo viaje (spec §11): the offline cheat sheet, default home screen from 2 to 16 November. */
export function TravelModeScreen() {
  const navigate = useNavigate();
  const favorites = useProgressStore((s) => s.favorites);
  const toggleFavorite = useProgressStore((s) => s.toggleFavorite);
  const filledBlanks = useProgressStore((s) => s.filledBlanks);
  const setBlank = useProgressStore((s) => s.setBlank);
  const rate = useSettingsStore((s) => s.exchangeRate);
  const speak = useSpeak();
  const [cat, setCat] = useState<TravelCat | 'favorites' | null>(null);
  const [query, setQuery] = useState('');
  const [show, setShow] = useState<Phrase | null>(null);
  const [showFill, setShowFill] = useState<{ jp: string; es: string } | null>(null);

  const q = query.trim();
  const results = useMemo(() => {
    if (!q) return [];
    const ql = q.toLowerCase();
    const qr = normalizeAnswer(q);
    return PHRASES.filter((p) => !p.hidden && (p.es.toLowerCase().includes(ql) || p.romaji.toLowerCase().includes(ql) || p.kana.includes(q) || (p.kanji ?? '').includes(q) || (qr.length > 1 && normalizeAnswer(p.romaji).includes(qr)))).slice(0, 30);
  }, [q]);

  const listFor = (c: TravelCat | 'favorites'): Phrase[] => {
    if (c === 'favorites') return PHRASES.filter((p) => favorites.includes(p.id));
    if (c === 'numbers') return [];
    if (c === 'route') return PHRASES.filter((p) => p.regionId === 'r5' && p.kind === 'say' && p.category === 'transport');
    return PHRASES.filter((p) => !p.hidden && (c === 'hear' ? p.kind === 'hear' : p.kind === 'say' && p.category === c));
  };

  const goMap = () => {
    try {
      sessionStorage.setItem(MAP_FLAG, '1');
    } catch {
      /* ignore */
    }
    navigate('/');
  };

  if (show)
    return (
      <ShowStaff
        phrase={show}
        fill={showFill?.jp ?? filledBlanks[show.id]}
        esFill={showFill?.es}
        onClose={() => {
          setShow(null);
          setShowFill(null);
        }}
      />
    );

  return (
    <main className="screen pb-10">
      <header className="flex items-center justify-between py-3">
        <div>
          <h1 className="font-display text-2xl">Modo viaje</h1>
          <p className="text-xs text-ink-2">Funciona sin conexión. Toca el altavoz; mantenlo para oírlo despacio.</p>
        </div>
        <button type="button" className="min-h-10 rounded-full border-2 border-primary px-3 text-sm font-bold text-primary" onClick={goMap}>
          Mapa
        </button>
      </header>

      <section className="flex items-center gap-2 rounded-stone bg-ember-500/10 px-3 py-2" aria-label="Emergencias">
        <a href="tel:110" className="min-h-10 rounded-full bg-ember-500 px-3 py-2 text-sm font-extrabold text-white">110 Policía</a>
        <a href="tel:119" className="min-h-10 rounded-full bg-ember-500 px-3 py-2 text-sm font-extrabold text-white">119 Ambulancia</a>
        <button type="button" className="ml-auto flex min-h-10 items-center gap-1 rounded-full bg-surface px-3 text-sm font-bold" onClick={() => void speak('たすけて ください')}>
          <JpText>たすけて ください</JpText>
        </button>
      </section>

      <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar en español, romaji, kana o kanji" aria-label="Buscar" className="mt-3 min-h-tap w-full rounded-stone border-2 border-line bg-surface px-4 text-base focus:border-primary" />

      {q ? (
        <PhraseList phrases={results} favorites={favorites} onFav={toggleFavorite} onShow={setShow} filled={filledBlanks} setBlank={setBlank} emptyText="Nada coincide." />
      ) : cat === null ? (
        <>
          <ul className="mt-4 grid grid-cols-2 gap-2">
            {CATS.map((c) => (
              <li key={c.id}>
                <button type="button" onClick={() => setCat(c.id)} className="flex min-h-24 w-full flex-col justify-between rounded-stone border-2 border-line bg-surface p-3 text-left">
                  <span className="font-display text-lg leading-tight">{c.label}</span>
                  <span className="text-xs text-ink-2">{c.hint}</span>
                </button>
              </li>
            ))}
            <li className="col-span-2">
              <button type="button" onClick={() => setCat('favorites')} className="flex min-h-14 w-full items-center gap-2 rounded-stone border-2 border-rune-gold/60 bg-rune-gold/10 px-4 text-left font-bold">
                <span className="text-rune-gold"><Star filled size={20} /></span> Favoritos ({favorites.length})
              </button>
            </li>
          </ul>
        </>
      ) : (
        <>
          <button type="button" className="mt-3 flex min-h-10 items-center gap-1 text-sm font-bold text-primary" onClick={() => setCat(null)}>
            ← Categorías
          </button>
          <h2 className="mt-1 font-display text-xl">{cat === 'favorites' ? 'Favoritos' : CATS.find((c) => c.id === cat)?.label}</h2>
          {cat === 'route' && (
            <ul className="mt-3 flex flex-col gap-2">
              {ROUTE_HOTELS.map((h) => (
                <li key={h.city} className="rounded-stone border-2 border-region-r5/50 bg-surface px-4 py-3">
                  <p className="text-xs font-bold text-ink-2">
                    {h.city} · {h.dates}
                  </p>
                  <Furigana as="p" text={h.jp} className="text-xl leading-loose" />
                  <p className="text-sm text-ink-2">{h.es}</p>
                  <button
                    type="button"
                    className="mt-2 min-h-10 rounded-full bg-mana-500/15 px-3 text-sm font-bold text-mana-500"
                    onClick={() => {
                      setShowFill({ jp: h.jp, es: h.es });
                      setShow(PHRASE_BY_ID['r4-p11']!);
                    }}
                  >
                    Enseñar al taxista
                  </button>
                </li>
              ))}
              <li className="text-xs text-ink-2">Comprueba el nombre exacto en japonés en tu reserva: las cadenas a veces lo escriben distinto.</li>
            </ul>
          )}
          {cat === 'numbers' ? <PriceCalculator rate={rate} /> : <PhraseList phrases={listFor(cat)} favorites={favorites} onFav={toggleFavorite} onShow={setShow} filled={filledBlanks} setBlank={setBlank} emptyText="Marca frases con la estrella para tenerlas aquí." />}
        </>
      )}
    </main>
  );
}

function fillKana(p: Phrase, fill?: string) {
  return fill?.trim() ? p.kana.replace(/＿+/g, fill.trim()) : p.kana;
}

function PhraseList({ phrases, favorites, onFav, onShow, filled, setBlank, emptyText }: { phrases: Phrase[]; favorites: string[]; onFav: (id: string) => void; onShow: (p: Phrase) => void; filled: Record<string, string>; setBlank: (id: string, v: string) => void; emptyText: string }) {
  const speak = useSpeak();
  if (phrases.length === 0) return <p className="mt-4 text-ink-2">{emptyText}</p>;
  return (
    <ul className="mt-3 flex flex-col gap-2">
      {phrases.map((p) => {
        const fav = favorites.includes(p.id);
        const fill = filled[p.id];
        const kana = fillKana(p, fill);
        return (
          <li key={p.id} className="rounded-stone border-2 border-line bg-surface px-4 py-3">
            <JpText as="p" className="text-2xl leading-snug">
              {kana}
            </JpText>
            <p className="text-sm text-ink-2">{fill ? p.romaji.replace(/＿+/g, fill) : p.romaji}</p>
            {p.kanji && p.kanji !== p.kana && <Furigana as="p" text={fill?.trim() ? p.kanji.replace(/＿+/g, fill.trim()) : p.kanji} className="mt-1 text-lg leading-loose" />}
            <p className="mt-1 font-bold">{fill ? p.es.replace(/＿+/g, fill) : p.es}</p>
            {p.note && <p className="mt-1 text-xs text-ink-2">{p.note}</p>}
            {p.hasBlank && (
              <label className="mt-2 flex items-center gap-2 text-sm">
                <span className="text-ink-2">Hueco:</span>
                <input type="text" value={fill ?? ''} onChange={(e) => setBlank(p.id, e.target.value)} placeholder="p. ej. el hotel o la estación" aria-label={`Rellenar ${BLANK}`} className="min-h-10 flex-1 rounded-xl border-2 border-line bg-bg px-3" />
              </label>
            )}
            <div className="mt-2 flex items-center gap-2">
              <button type="button" className="min-h-10 rounded-full bg-primary/15 px-3 text-sm font-bold text-primary" onClick={() => void speak(p.speech ?? kana)}>
                Oír
              </button>
              <button type="button" className="min-h-10 rounded-full bg-primary/15 px-3 text-sm font-bold text-primary" onClick={() => void speak(p.speech ?? kana, { slow: true })}>
                Despacio
              </button>
              <button type="button" className="min-h-10 rounded-full bg-mana-500/15 px-3 text-sm font-bold text-mana-500" onClick={() => onShow(p)}>
                Enseñar
              </button>
              <button type="button" aria-pressed={fav} aria-label={fav ? 'Quitar de favoritos' : 'Guardar como favorito'} onClick={() => onFav(p.id)} className={`ml-auto flex h-10 w-10 items-center justify-center rounded-full ${fav ? 'text-rune-gold' : 'text-ink-2'}`}>
                <Star filled={fav} />
              </button>
            </div>
          </li>
        );
      })}
    </ul>
  );
}

/** «Enseñar al personal»: full screen, light background, huge Japanese, small translation; keeps the screen on. */
function ShowStaff({ phrase, fill, esFill, onClose }: { phrase: Phrase; fill?: string; esFill?: string; onClose: () => void }) {
  const lock = useRef<{ release: () => Promise<void> } | null>(null);
  const text = phrase.kanji && fill?.trim() ? phrase.kanji.replace(/＿+/g, fill.trim()) : phrase.kanji ?? fillKana(phrase, fill);
  useEffect(() => {
    const nav = navigator as Navigator & { wakeLock?: { request: (t: 'screen') => Promise<{ release: () => Promise<void> }> } };
    nav.wakeLock?.request('screen').then((l) => (lock.current = l)).catch(() => undefined);
    return () => {
      void lock.current?.release();
    };
  }, []);
  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#FFFFFF] text-[#0E2419]" style={{ paddingTop: 'var(--safe-top)' }}>
      <button type="button" aria-label="Cerrar" className="absolute right-3 top-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#E9F0E6]" style={{ marginTop: 'var(--safe-top)' }} onClick={onClose}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" /></svg>
      </button>
      <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
        <Furigana as="p" text={text} className="text-[3.25rem] font-semibold leading-[1.6]" />
        <p className="mt-6 text-base text-[#425C50]">{fill ? phrase.es.replace(/＿+/g, esFill ?? fill) : phrase.es}</p>
      </div>
    </div>
  );
}

function PriceCalculator({ rate }: { rate: number }) {
  const [value, setValue] = useState('');
  const speak = useSpeak();
  const n = Number(value.replace(/[^\d]/g, ''));
  const valid = Number.isInteger(n) && n > 0 && n <= 99_999;
  const reading = valid ? toPriceReading(n) : null;
  const quick = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 100, 1000, 10000];
  return (
    <div className="mt-3 flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <input type="text" inputMode="numeric" value={value} onChange={(e) => setValue(e.target.value)} placeholder="Cifra en yenes" aria-label="Cifra en yenes" className="min-h-tap w-full rounded-stone border-2 border-line bg-surface px-4 text-right text-2xl font-bold focus:border-primary" />
        <span className="text-2xl font-bold">¥</span>
      </div>
      {reading && (
        <div className="rounded-stone border-2 border-line bg-surface p-4">
          <JpText as="p" className="text-2xl leading-snug">
            {reading.kana}
          </JpText>
          <p className="text-sm text-ink-2">{reading.romaji}</p>
          <p className="mt-2 text-xl font-extrabold">≈ {(n / rate).toLocaleString('es-ES', { maximumFractionDigits: 2 })} €</p>
          <p className="text-xs text-ink-2">1 € = {rate} ¥ (cambia el tipo en Ajustes)</p>
          <button type="button" className="btn-secondary mt-3" onClick={() => void speak(reading.kana)}>
            Oír el precio
          </button>
        </div>
      )}
      <p className="text-xs text-ink-2">{value && !valid ? 'Escribe una cifra entre 1 y 99.999.' : 'Escribe el precio que ves en la etiqueta para saber cómo suena y cuánto es en euros.'}</p>
      <ul className="grid grid-cols-2 gap-1 text-sm">
        {quick.map((v) => {
          const r = toJapaneseReading(v);
          return (
            <li key={v}>
              <button type="button" className="flex min-h-10 w-full items-center justify-between rounded-xl bg-surface px-3" onClick={() => void speak(r.kana)}>
                <span className="font-bold">{formatNumberEs(v)}</span>
                <JpText>{r.kana}</JpText>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
