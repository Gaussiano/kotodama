import { useEffect, useMemo, useState } from 'react';
import { PHRASE_BY_ID, SCENE_BY_ID, type SceneTurn } from '@/content';
import type { Exercise } from '@/domain/exercises';
import { formatNumberEs, randomPrice, toPriceReading } from '@/content/numbers';
import { JpText } from '@/components/ui/JpText';
import { SpeakerButton } from '@/components/ui/SpeakerButton';
import { useSpeak } from '@/audio/useSpeak';
import { useSfx } from '@/audio/useSfx';
import { useSettingsStore } from '@/store/settingsStore';
import { Npc, NPC_LABEL } from './Npc';
import type { ExerciseProps } from './types';

type E = Extract<Exercise, { type: 'E15' }>;

interface TurnLog {
  npc?: { kana: string; es: string };
  you?: { kana: string; es: string; ok: boolean };
}

function npcLine(turn: SceneTurn, fill: string | undefined) {
  if (!turn.npc) return null;
  if ('phraseId' in turn.npc) {
    const p = PHRASE_BY_ID[turn.npc.phraseId]!;
    const kana = fill ? p.kana.replace(/＿+/g, fill) : p.kana;
    return { kana, romaji: p.romaji, es: fill ? p.es.replace(/＿+/g, fill) : p.es, speech: p.speech, generated: false };
  }
  return { ...turn.npc };
}

/** E15 «Escena»: a guided 5–8 turn dialogue; each turn is checked; a summary closes the scene. */
export function SceneExercise({ exercise, onAutoComplete, showRomaji }: ExerciseProps<E>) {
  const scene = SCENE_BY_ID[exercise.sceneId]!;
  const userName = useSettingsStore((s) => s.userName);
  const speak = useSpeak();
  const play = useSfx();
  const [i, setI] = useState(0);
  const [log, setLog] = useState<TurnLog[]>([]);
  const [failed, setFailed] = useState(false);
  const [feedback, setFeedback] = useState<{ ok: boolean; correctKana?: string } | null>(null);
  const [finished, setFinished] = useState(false);

  // Random price for the «＿えんに なります» turn, stable per scene run.
  const price = useMemo(() => {
    let x = exercise.uid.length * 7919;
    const rnd = () => ((x = (x * 9301 + 49297) % 233280) / 233280);
    return randomPrice('konbini', rnd);
  }, [exercise.uid]);

  const turn = scene.turns[i];
  const fillFor = (t: SceneTurn | undefined) => (t?.fill === 'userName' ? userName : t?.fill === 'price' ? toPriceReading(price).kana : t?.fill);
  const npc = turn ? npcLine(turn, turn.fill === 'price' ? toPriceReading(price).kana : fillFor(turn) && 'phraseId' in (turn.npc ?? {}) ? fillFor(turn) : undefined) : null;

  useEffect(() => {
    if (!npc) return;
    const t = window.setTimeout(() => void speak(npc.speech ?? npc.kana), 350);
    return () => window.clearTimeout(t);
  }, [i]); // eslint-disable-line react-hooks/exhaustive-deps

  const priceOptions = useMemo(() => {
    if (turn?.fill !== 'price') return [];
    let x = price * 31;
    const rnd = () => ((x = (x * 9301 + 49297) % 233280) / 233280);
    const set = new Set<number>([price]);
    while (set.size < 4) set.add(randomPrice('konbini', rnd));
    return [...set].sort(() => rnd() - 0.5);
  }, [turn, price]);

  const answer = (choice: { phraseId?: string; gesture?: string; price?: number }) => {
    if (!turn || feedback) return;
    let ok: boolean;
    let youKana = '';
    let youEs = '';
    if (choice.price !== undefined) {
      ok = choice.price === price;
      youKana = `${formatNumberEs(choice.price)} ¥`;
      youEs = ok ? 'Has entendido la cifra' : `Era ${formatNumberEs(price)} ¥`;
    } else if (choice.gesture) {
      ok = (turn.correct ?? []).includes('gesture');
      youKana = choice.gesture;
      youEs = '';
    } else {
      const p = PHRASE_BY_ID[choice.phraseId!]!;
      ok = (turn.correct ?? []).includes(p.id);
      const fill = fillFor(turn);
      youKana = fill && p.hasBlank ? p.kana.replace(/＿+/g, fill) : p.kana;
      youEs = p.es;
      if (ok) void speak(p.speech ?? youKana);
    }
    play(ok ? 'tick' : 'wrong');
    if (!ok) setFailed(true);
    const correctId = (turn.correct ?? []).find((c) => c !== 'gesture');
    const correctKana = correctId ? PHRASE_BY_ID[correctId]?.kana : turn.correct?.includes('gesture') ? 'Un gesto bastaba' : turn.fill === 'price' ? `${formatNumberEs(price)} ¥` : undefined;
    setFeedback({ ok, correctKana });
    setLog((l) => [...l, { npc: npc ? { kana: npc.kana, es: npc.es } : undefined, you: { kana: youKana, es: youEs, ok } }]);
  };

  const next = () => {
    setFeedback(null);
    if (i + 1 >= scene.turns.length) setFinished(true);
    else setI(i + 1);
  };

  if (finished) {
    return (
      <div className="flex flex-col gap-4">
        <p className="text-sm font-semibold text-ink-2">Escena · {scene.title}</p>
        <p className="font-bold">{failed ? 'Escena completada con algún tropiezo.' : 'Escena completada sin fallos.'}</p>
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
                  Tú: <JpText>{l.you.kana}</JpText> {l.you.es && `· ${l.you.es}`}
                </p>
              )}
            </li>
          ))}
        </ol>
        <button className="btn-primary" onClick={() => onAutoComplete({ correct: !failed, expected: {} })}>
          Terminar la escena
        </button>
      </div>
    );
  }

  if (!turn) return null;

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm font-semibold text-ink-2">
        Escena · {scene.title} · {i + 1}/{scene.turns.length}
      </p>
      {i === 0 && <p className="rounded-stone bg-parchment-100 px-4 py-2 text-sm text-forest-900">{scene.setting}</p>}
      {turn.narration && <p className="text-sm italic text-ink-2">{turn.narration}</p>}
      {npc && (
        <div className="flex items-start gap-3">
          <Npc role={scene.npcRole} />
          <div className="flex-1 rounded-stone rounded-tl-none border-2 border-line bg-surface p-3">
            <p className="text-xs text-ink-2">{NPC_LABEL[scene.npcRole]}</p>
            <div className="flex items-center gap-2">
              <SpeakerButton text={npc.speech ?? npc.kana} size="sm" />
              <JpText as="p" className="text-xl leading-snug">
                {npc.kana}
              </JpText>
            </div>
            {(showRomaji || feedback) && <p className="mt-1 text-sm text-ink-2">{npc.romaji}{feedback ? ` · ${npc.es}` : ''}</p>}
          </div>
        </div>
      )}

      {!feedback && turn.fill === 'price' && (
        <ul className="grid grid-cols-2 gap-2">
          {priceOptions.map((yen) => (
            <li key={yen}>
              <button type="button" className="min-h-tap w-full rounded-stone border-2 border-line bg-surface px-3 text-lg font-bold" onClick={() => answer({ price: yen })}>
                {formatNumberEs(yen)} ¥
              </button>
            </li>
          ))}
        </ul>
      )}
      {!feedback && turn.options && (
        <ul className="flex flex-col gap-2">
          {turn.options.map((o, k) => (
            <li key={k} className="flex items-stretch gap-2">
              <button type="button" className="min-h-tap flex-1 rounded-stone border-2 border-line bg-surface px-4 py-3 text-left" onClick={() => answer('gesture' in o ? { gesture: o.gesture } : { phraseId: o.phraseId })}>
                {'gesture' in o ? (
                  <span className="italic">{o.gesture}</span>
                ) : (
                  <span className="block">
                    <JpText className="text-lg leading-snug">{fillFor(turn) && PHRASE_BY_ID[o.phraseId]!.hasBlank ? PHRASE_BY_ID[o.phraseId]!.kana.replace(/＿+/g, fillFor(turn)!) : PHRASE_BY_ID[o.phraseId]!.kana}</JpText>
                    <span className="block text-sm text-ink-2">{showRomaji ? `${PHRASE_BY_ID[o.phraseId]!.romaji} · ` : ''}{PHRASE_BY_ID[o.phraseId]!.es}</span>
                  </span>
                )}
              </button>
              {!('gesture' in o) && <SpeakerButton text={PHRASE_BY_ID[o.phraseId]!.speech ?? PHRASE_BY_ID[o.phraseId]!.kana} className="self-center" />}
            </li>
          ))}
        </ul>
      )}

      {feedback && (
        <div className={`rounded-stone border-2 p-3 ${feedback.ok ? 'border-moss-500 bg-moss-500/10' : 'border-ember-500 bg-ember-500/10'}`} role="status">
          <p className={`font-bold ${feedback.ok ? 'text-moss-500' : 'text-ember-500'}`}>{feedback.ok ? 'Eso es' : 'No era eso.'}</p>
          {!feedback.ok && feedback.correctKana && (
            <p className="mt-1">
              Mejor: <JpText className="text-lg">{feedback.correctKana}</JpText>
            </p>
          )}
          <button className="btn-primary mt-3" onClick={next} autoFocus>
            {i + 1 >= scene.turns.length ? 'Ver el resumen' : 'Siguiente'}
          </button>
        </div>
      )}
    </div>
  );
}
