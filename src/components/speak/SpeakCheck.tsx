import { useEffect, useRef, useState } from 'react';
import { isSttAvailable, listenOnce, stopListening, type SttError } from '@/audio/stt';
import { scoreSpeech, type SpeechScore } from '@/domain/pronunciation';
import { JpText } from '@/components/ui/JpText';
import { useSfx } from '@/audio/useSfx';

export type SpeakOutcome = { ok: boolean; score: number; mode: 'stt' | 'self' };

type Props = {
  expected: { kana: string; kanji?: string; extra?: string[] };
  /** Called when the user passes (good) or confirms self-evaluation. */
  onResult: (o: SpeakOutcome) => void;
  /** Hide the expected text until judged (conversation level 2). */
  hideExpected?: boolean;
  autoStart?: boolean;
};

const ERR: Record<SttError, string> = {
  'not-allowed': 'Sin permiso para el micro. Actívalo en los ajustes del navegador.',
  'no-speech': 'No te he oído. Prueba otra vez, más cerca del micro.',
  network: 'El reconocimiento de voz necesita conexión. Sin red, evalúate tú.',
  aborted: 'Grabación cancelada.',
  unavailable: 'Este navegador no reconoce voz.',
  other: 'No se ha podido reconocer. Prueba otra vez.',
};

/**
 * Microphone check: listens once, scores the pronunciation and shows what it heard.
 * Falls back to self-evaluation when speech recognition is unavailable (Firefox, offline).
 */
export function SpeakCheck({ expected, onResult, hideExpected = false, autoStart = false }: Props) {
  const stt = isSttAvailable();
  const [state, setState] = useState<'idle' | 'listening' | 'done'>('idle');
  const [result, setResult] = useState<SpeechScore | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tries, setTries] = useState(0);
  const play = useSfx();
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    setState('idle');
    setResult(null);
    setError(null);
    setTries(0);
    if (autoStart && stt) void listen();
    return () => {
      mounted.current = false;
      stopListening();
    };
  }, [expected.kana]); // eslint-disable-line react-hooks/exhaustive-deps

  const listen = async () => {
    setError(null);
    setResult(null);
    setState('listening');
    const r = await listenOnce();
    if (!mounted.current) return;
    if (r.error && r.alternatives.length === 0) {
      setError(ERR[r.error]);
      setState('idle');
      return;
    }
    const s = scoreSpeech(r.alternatives, expected);
    setResult(s);
    setTries((t) => t + 1);
    setState('done');
    play(s.verdict === 'good' ? 'correct' : s.verdict === 'close' ? 'tick' : 'wrong');
    if (s.verdict === 'good') onResult({ ok: true, score: s.score, mode: 'stt' });
  };

  return (
    <div className="flex flex-col gap-3">
      {stt ? (
        <>
          <button
            type="button"
            onClick={() => void listen()}
            disabled={state === 'listening'}
            aria-label={state === 'listening' ? 'Escuchando' : 'Hablar'}
            className={`mx-auto flex h-20 w-20 items-center justify-center rounded-full text-white transition-transform ${state === 'listening' ? 'scale-110 bg-ember-500 animate-pulse' : 'bg-mana-500 active:scale-95'}`}
          >
            <MicIcon />
          </button>
          <p className="text-center text-xs text-ink-2">{state === 'listening' ? 'Escuchando… habla ahora' : tries ? 'Toca el micro para intentarlo otra vez' : 'Toca el micro y di la frase'}</p>
        </>
      ) : (
        <p className="rounded-stone bg-ink/5 px-3 py-2 text-xs text-ink-2">Este navegador no reconoce voz, así que te evalúas tú: escúchala, repítela y elige.</p>
      )}

      {error && (
        <p role="alert" className="text-center text-sm text-ember-500">
          {error}
        </p>
      )}

      {result && (
        <div className={`rounded-stone border-2 p-3 ${result.verdict === 'good' ? 'border-moss-500 bg-moss-500/10' : result.verdict === 'close' ? 'border-rune-gold bg-rune-gold/10' : 'border-ember-500 bg-ember-500/10'}`} role="status" aria-live="polite">
          <div className="flex items-center gap-3">
            <ScoreRing value={result.score} />
            <div className="min-w-0 flex-1">
              <p className="font-bold">{result.verdict === 'good' ? '¡Bien dicho!' : result.verdict === 'close' ? 'Casi: se entiende, pero afina' : 'No lo he reconocido así'}</p>
              {result.heard && (
                <p className="truncate text-sm text-ink-2">
                  He oído: <JpText>{result.heard}</JpText>
                </p>
              )}
              {!hideExpected && result.verdict !== 'good' && (
                <p className="text-sm">
                  Objetivo: <JpText>{expected.kana}</JpText>
                </p>
              )}
            </div>
          </div>
          {result.verdict !== 'good' && tries >= 2 && (
            <button type="button" className="btn-secondary mt-3" onClick={() => onResult({ ok: result.verdict === 'close', score: result.score, mode: 'stt' })}>
              {result.verdict === 'close' ? 'Darla por buena y seguir' : 'Seguir de todos modos'}
            </button>
          )}
        </div>
      )}

      {(!stt || (result && result.verdict !== 'good' && tries < 2)) && !result?.heard && !stt && (
        <div className="grid grid-cols-2 gap-2">
          <button type="button" className="btn-secondary" onClick={() => onResult({ ok: false, score: 0, mode: 'self' })}>
            Repetir luego
          </button>
          <button type="button" className="btn-primary" onClick={() => onResult({ ok: true, score: 1, mode: 'self' })}>
            Me ha salido bien
          </button>
        </div>
      )}
    </div>
  );
}

function ScoreRing({ value }: { value: number }) {
  const r = 18;
  const c = 2 * Math.PI * r;
  const pct = Math.round(value * 100);
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" role="img" aria-label={`Puntuación ${pct} %`}>
      <circle cx="24" cy="24" r={r} fill="none" stroke="rgb(var(--c-ink) / 0.12)" strokeWidth="5" />
      <circle cx="24" cy="24" r={r} fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - value)} transform="rotate(-90 24 24)" />
      <text x="24" y="28" textAnchor="middle" fontSize="12" fontWeight="800" fill="currentColor">
        {pct}
      </text>
    </svg>
  );
}

export function MicIcon({ size = 34 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="9" y="3" width="6" height="11" rx="3" />
      <path d="M5 11a7 7 0 0 0 14 0M12 18v3M9 21h6" />
    </svg>
  );
}
