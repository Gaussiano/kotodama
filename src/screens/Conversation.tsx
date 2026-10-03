import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PHRASE_BY_ID, type SceneTurn } from '@/content';
import { CONVERSATION_BY_ID, LEVEL_LABEL, LEVEL_PASS, type TalkLevel } from '@/content/conversations';
import { formatNumberEs, randomPrice, toPriceReading } from '@/content/numbers';
import { checkTyped, stripBlank } from '@/domain/answerCheck';
import { romajiVisible } from '@/domain/romaji';
import { useProgressStore } from '@/store/progressStore';
import { useSettingsStore } from '@/store/settingsStore';
import { useSpeak } from '@/audio/useSpeak';
import { useSfx } from '@/audio/useSfx';
import { JpText } from '@/components/ui/JpText';
import { SpeakerButton } from '@/components/ui/SpeakerButton';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { SpeakCheck } from '@/components/speak/SpeakCheck';
import { Npc, NPC_LABEL } from '@/components/exercises/Npc';
import { Fuku } from '@/components/mascot/Fuku';

interface Log {
  npc?: { kana: string; es: string };
  you?: { text: string; es: string; ok: boolean };
}

function expectedFor(turn: SceneTurn, fill: string | undefined) {
  const ids = (turn.correct ?? []).filter((c): c is string => c !== 'gesture');
  const phrases = ids.map((id) => PHRASE_BY_ID[id]!);
  const withFill = (s: string) => (fill ? s.replace(/＿+/g, fill) : s);
  return {
    phrases,
    gesture: (turn.correct ?? []).includes('gesture'),
    kana: phrases.map((p) => withFill(p.kana)),
    kanji: phrases.map((p) => (p.kanji ? withFill(p.kanji) : undefined)),
    romaji: phrases.map((p) => withFill(p.romaji)),
    es: phrases[0]?.es.replace(/＿+/g, fill ?? '…') ?? '',
  };
}

/** Full conversation in three levels: 1 choose · 2 speak · 3 type (user request). */
export function ConversationScreen() {
  const { convId = '', level = '1' } = useParams();
  const lvl = (Math.min(3, Math.max(1, Number(level))) || 1) as TalkLevel;
  const navigate = useNavigate();
  const conv = CONVERSATION_BY_ID[convId];
  const progress = useProgressStore();
  const userName = useSettingsStore((s) => s.userName);
  const romajiMode = useSettingsStore((s) => s.romajiMode);
  const speak = useSpeak();
  const play = useSfx();
  const [i, setI] = useState(0);
  const [log, setLog] = useState<Log[]>([]);
  const [feedback, setFeedback] = useState<{ ok: boolean; expected?: string; es?: string } | null>(null);
  const [typed, setTyped] = useState('');
  const [typedPrice, setTypedPrice] = useState('');
  const [finished, setFinished] = useState(false);

  const price = useMemo(() => {
    let x = seedOf(convId) + 17;
    const rnd = () => ((x = (x * 9301 + 49297) % 233280) / 233280);
    return randomPrice('konbini', rnd);
  }, [convId]);

  const turn = conv?.turns[i];
  const fill = turn?.fill === 'userName' ? userName : turn?.fill === 'price' ? toPriceReading(price).kana : turn?.fill;
  const npc = turn?.npc ? ('phraseId' in turn.npc ? { ...PHRASE_BY_ID[turn.npc.phraseId]!, kana: turn.fill === 'price' ? PHRASE_BY_ID[turn.npc.phraseId]!.kana.replace(/＿+/g, fill!) : PHRASE_BY_ID[turn.npc.phraseId]!.kana } : turn.npc) : null;
  const exp = turn ? expectedFor(turn, turn.fill === 'price' ? undefined : fill) : null;
  const showRomaji = conv ? romajiVisible(romajiMode, conv.regionId, Boolean(feedback)) : true;

  useEffect(() => {
    if (!npc) return;
    const t = window.setTimeout(() => void speak(('speech' in npc && npc.speech) || npc.kana), 350);
    return () => window.clearTimeout(t);
  }, [i]); // eslint-disable-line react-hooks/exhaustive-deps

  const priceOptions = useMemo(() => {
    if (turn?.fill !== 'price') return [];
    let x = price * 13 + lvl;
    const rnd = () => ((x = (x * 9301 + 49297) % 233280) / 233280);
    const set = new Set<number>([price]);
    while (set.size < 4) set.add(randomPrice('konbini', rnd));
    return [...set].sort(() => rnd() - 0.5);
  }, [turn, price, lvl]);

  if (!conv || !turn) return <main className="screen py-8">Conversación desconocida.</main>;

  const settle = (ok: boolean, youText: string) => {
    play(ok ? 'tick' : 'wrong');
    setFeedback({ ok, expected: exp?.kana[0] ?? (exp?.gesture ? 'Un gesto bastaba' : turn.fill === 'price' ? `${formatNumberEs(price)} ¥` : undefined), es: exp?.es });
    setLog((l) => [...l, { npc: npc ? { kana: npc.kana, es: npc.es } : undefined, you: { text: youText, es: exp?.es ?? '', ok } }]);
  };

  const next = () => {
    setFeedback(null);
    setTyped('');
    setTypedPrice('');
    if (i + 1 >= conv.turns.length) {
      const total = log.length + 0;
      const correct = log.filter((l) => l.you?.ok).length;
      const accuracy = total ? correct / total : 0;
      const passed = accuracy >= LEVEL_PASS;
      progress.finishLesson({
        nodeId: `talk-${conv.id}-${lvl}`,
        kind: 'talk',
        items: {},
        newItemIds: [],
        xp: passed ? 10 + (accuracy === 1 ? 5 : 0) : Math.round(correct / 2),
        perfect: accuracy === 1,
        accuracy,
        passed,
        durationSec: 0,
        regionId: conv.regionId,
        talkResult: { convId: conv.id, level: lvl, accuracy },
        seenItemIds: conv.turns.flatMap((t) => (t.correct ?? []).filter((c): c is string => c !== 'gesture')),
      });
      setFinished(true);
    } else setI(i + 1);
  };

  if (finished) {
    const correct = log.filter((l) => l.you?.ok).length;
    const accuracy = log.length ? correct / log.length : 0;
    const passed = accuracy >= LEVEL_PASS;
    return (
      <main className="screen flex min-h-dvh flex-col gap-5 py-8">
        <div className="flex flex-col items-center text-center">
          <Fuku state={passed ? 'happy' : 'oops'} size={110} />
          <h1 className="mt-3 font-display text-2xl">{conv.title}</h1>
          <p className="text-ink-2">
            Nivel {lvl} · {LEVEL_LABEL[lvl].title} · {Math.round(accuracy * 100)} %
          </p>
          <p className="mt-2 font-bold">{passed ? (lvl < 3 ? `Nivel ${lvl + 1} desbloqueado` : 'Conversación dominada') : 'Necesitas un 80 % para abrir el siguiente nivel'}</p>
        </div>
        <ol className="space-y-2 text-sm">
          {log.map((l, k) => (
            <li key={k} className="rounded-stone bg-surface p-3">
              {l.npc && (
                <p className="text-ink-2">
                  <JpText>{l.npc.kana}</JpText> · {l.npc.es}
                </p>
              )}
              {l.you && (
                <p className={l.you.ok ? 'text-moss-500' : 'text-ember-500'}>
                  Tú: <JpText>{l.you.text}</JpText> {l.you.es && `· ${l.you.es}`}
                </p>
              )}
            </li>
          ))}
        </ol>
        <div className="mt-auto flex flex-col gap-2">
          {passed && lvl < 3 && (
            <button className="btn-primary" onClick={() => navigate(`/talk/conversation/${conv.id}/${lvl + 1}`, { replace: true })}>
              Pasar al nivel {lvl + 1}
            </button>
          )}
          <button className={passed && lvl < 3 ? 'btn-secondary' : 'btn-primary'} onClick={() => navigate(0)}>
            Repetir
          </button>
          <button className="btn-secondary" onClick={() => navigate('/talk')}>Volver a Hablar</button>
        </div>
      </main>
    );
  }

  const isPriceTurn = turn.fill === 'price';
  const cue = exp?.gesture && exp.phrases.length === 0 ? 'Aquí basta un gesto.' : exp?.es;

  return (
    <div className="fixed inset-0 flex flex-col bg-bg">
      <header className="mx-auto flex w-full max-w-app items-center gap-3 px-4 pb-2" style={{ paddingTop: 'calc(var(--safe-top) + 0.5rem)' }}>
        <button type="button" aria-label="Salir" className="flex h-12 w-12 items-center justify-center rounded-full text-ink-2" onClick={() => navigate('/talk')}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" /></svg>
        </button>
        <ProgressBar value={i} max={conv.turns.length} className="flex-1" tone="mana" />
        <span className="text-xs font-bold text-ink-2">Nivel {lvl}</span>
      </header>
      <main className="mx-auto w-full max-w-app flex-1 overflow-y-auto px-4 pb-10 pt-2">
        <p className="text-sm font-semibold text-ink-2">
          {conv.title} · {LEVEL_LABEL[lvl].title} · {i + 1}/{conv.turns.length}
        </p>
        {i === 0 && <p className="mt-2 rounded-stone bg-parchment-100 px-4 py-2 text-sm text-forest-900">{conv.setting}</p>}
        {turn.narration && <p className="mt-2 text-sm italic text-ink-2">{turn.narration}</p>}
        {npc && (
          <div className="mt-3 flex items-start gap-3">
            <Npc role={conv.npcRole} />
            <div className="flex-1 rounded-stone rounded-tl-none border-2 border-line bg-surface p-3">
              <p className="text-xs text-ink-2">{NPC_LABEL[conv.npcRole]}</p>
              <div className="flex items-center gap-2">
                <SpeakerButton text={('speech' in npc && npc.speech) || npc.kana} size="sm" />
                <JpText as="p" className="text-xl leading-snug">
                  {npc.kana}
                </JpText>
              </div>
              {(showRomaji || feedback) && <p className="mt-1 text-sm text-ink-2">{npc.romaji}{feedback ? ` · ${npc.es}` : ''}</p>}
            </div>
          </div>
        )}

        {!feedback && (
          <div className="mt-4">
            {/* Price turns: choose (L1) or type the figure (L2/L3). */}
            {isPriceTurn &&
              (lvl === 1 ? (
                <ul className="grid grid-cols-2 gap-2">
                  {priceOptions.map((yen) => (
                    <li key={yen}>
                      <button type="button" className="min-h-tap w-full rounded-stone border-2 border-line bg-surface px-3 text-lg font-bold" onClick={() => settle(yen === price, `${formatNumberEs(yen)} ¥`)}>
                        {formatNumberEs(yen)} ¥
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="flex flex-col gap-2">
                  <p className="text-sm text-ink-2">¿Cuánto ha dicho? Escribe la cifra.</p>
                  <div className="flex items-center gap-2">
                    <input type="text" inputMode="numeric" aria-label="Cifra en yenes" value={typedPrice} onChange={(e) => setTypedPrice(e.target.value)} className="min-h-tap w-full rounded-stone border-2 border-line bg-surface px-4 text-right text-2xl font-bold focus:border-primary" />
                    <span className="text-2xl font-bold">¥</span>
                  </div>
                  <button className="btn-primary" disabled={!typedPrice.trim()} onClick={() => settle(Number(typedPrice.replace(/[^\d]/g, '')) === price, `${typedPrice} ¥`)}>
                    Comprobar
                  </button>
                </div>
              ))}

            {!isPriceTurn && lvl === 1 && turn.options && (
              <ul className="flex flex-col gap-2">
                {turn.options.map((o, k) => (
                  <li key={k} className="flex items-stretch gap-2">
                    <button
                      type="button"
                      className="min-h-tap flex-1 rounded-stone border-2 border-line bg-surface px-4 py-3 text-left"
                      onClick={() => ('gesture' in o ? settle((turn.correct ?? []).includes('gesture'), o.gesture) : settle((turn.correct ?? []).includes(o.phraseId), fill && PHRASE_BY_ID[o.phraseId]!.hasBlank ? PHRASE_BY_ID[o.phraseId]!.kana.replace(/＿+/g, fill) : PHRASE_BY_ID[o.phraseId]!.kana))}
                    >
                      {'gesture' in o ? (
                        <span className="italic">{o.gesture}</span>
                      ) : (
                        <span className="block">
                          <JpText className="text-lg leading-snug">{fill && PHRASE_BY_ID[o.phraseId]!.hasBlank ? PHRASE_BY_ID[o.phraseId]!.kana.replace(/＿+/g, fill) : PHRASE_BY_ID[o.phraseId]!.kana}</JpText>
                          <span className="block text-sm text-ink-2">{showRomaji ? `${PHRASE_BY_ID[o.phraseId]!.romaji} · ` : ''}{PHRASE_BY_ID[o.phraseId]!.es}</span>
                        </span>
                      )}
                    </button>
                    {!('gesture' in o) && <SpeakerButton text={PHRASE_BY_ID[o.phraseId]!.speech ?? PHRASE_BY_ID[o.phraseId]!.kana} className="self-center" />}
                  </li>
                ))}
              </ul>
            )}

            {!isPriceTurn && lvl >= 2 && exp && (
              <div className="flex flex-col gap-3">
                <p className="rounded-stone bg-mana-500/10 px-4 py-3">
                  <span className="block text-xs font-bold text-mana-500">{lvl === 2 ? 'Di en japonés:' : 'Escribe en japonés:'}</span>
                  <span className="block text-lg font-bold">{cue}</span>
                  {exp.phrases.length > 1 && <span className="block text-xs text-ink-2">Valen varias respuestas.</span>}
                </p>
                {exp.gesture && exp.phrases.length === 0 ? (
                  <button className="btn-primary" onClick={() => settle(true, 'Un gesto')}>
                    Hago el gesto y sigo
                  </button>
                ) : lvl === 2 ? (
                  <SpeakCheck
                    key={`${i}-${lvl}`}
                    expected={{ kana: exp.kana[0]!, kanji: exp.kanji[0], extra: [...exp.kana.slice(1), ...exp.kanji.slice(1).filter((x): x is string => Boolean(x))] }}
                    hideExpected
                    onResult={(o) => settle(o.ok, o.ok ? exp.kana[0]! : '(no reconocida)')}
                  />
                ) : (
                  <div className="flex flex-col gap-2">
                    <input
                      type="text"
                      autoCapitalize="none"
                      autoCorrect="off"
                      spellCheck={false}
                      aria-label="Tu réplica en romaji o kana"
                      placeholder="romaji o kana"
                      value={typed}
                      onChange={(e) => setTyped(e.target.value)}
                      className="min-h-tap w-full rounded-stone border-2 border-line bg-surface px-4 text-lg focus:border-primary"
                    />
                    <button
                      className="btn-primary"
                      disabled={!typed.trim()}
                      onClick={() => {
                        const ok = exp.romaji.some((r, k) => checkTyped(typed, stripBlank(r), [stripBlank(exp.kana[k]!)]) !== 'wrong');
                        settle(ok, typed);
                      }}
                    >
                      Comprobar
                    </button>
                  </div>
                )}
                {lvl === 2 && exp.phrases.length > 0 && (
                  <button type="button" className="text-center text-sm text-ink-2 underline" onClick={() => settle(false, '(saltada)')}>
                    No me sale: ver la respuesta
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {feedback && (
          <div className={`mt-4 rounded-stone border-2 p-3 ${feedback.ok ? 'border-moss-500 bg-moss-500/10' : 'border-ember-500 bg-ember-500/10'}`} role="status">
            <p className={`font-bold ${feedback.ok ? 'text-moss-500' : 'text-ember-500'}`}>{feedback.ok ? 'Eso es' : 'No era eso.'}</p>
            {feedback.expected && (
              <div className="mt-1 flex items-center gap-2">
                {exp?.kana[0] && <SpeakerButton text={exp.kana[0]} size="sm" />}
                <p>
                  <JpText className="text-lg">{feedback.expected}</JpText>
                  {feedback.es && <span className="block text-sm text-ink-2">{feedback.es}</span>}
                </p>
              </div>
            )}
            <button className="btn-primary mt-3" onClick={next} autoFocus>
              {i + 1 >= conv.turns.length ? 'Ver el resumen' : 'Siguiente'}
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

function seedOf(s: string): number {
  let h = 7;
  for (const ch of s) h = (h * 31 + ch.charCodeAt(0)) % 100000;
  return h;
}
