// Speech recognition wrapper (Web Speech API SpeechRecognition). Used to score pronunciation.
// Availability: Chrome/Android (online, Google servers) and Safari/iOS 14.5+. Elsewhere → fallback.

type RecognitionCtor = new () => SpeechRecognitionLike;

interface SpeechRecognitionLike {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  continuous: boolean;
  onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string; confidence: number }>> }) => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
}

function ctor(): RecognitionCtor | null {
  if (typeof window === 'undefined') return null;
  const w = window as unknown as { SpeechRecognition?: RecognitionCtor; webkitSpeechRecognition?: RecognitionCtor };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export const isSttAvailable = () => ctor() !== null;

export type SttError = 'not-allowed' | 'no-speech' | 'network' | 'aborted' | 'unavailable' | 'other';

export interface SttResult {
  alternatives: string[];
  error?: SttError;
}

let active: SpeechRecognitionLike | null = null;

export function stopListening() {
  active?.abort();
  active = null;
}

/** Listens once in Japanese and resolves with up to 5 alternatives (empty on error). */
export function listenOnce(timeoutMs = 7000): Promise<SttResult> {
  const C = ctor();
  if (!C) return Promise.resolve({ alternatives: [], error: 'unavailable' });
  stopListening();
  return new Promise((resolve) => {
    const rec = new C();
    active = rec;
    rec.lang = 'ja-JP';
    rec.interimResults = false;
    rec.maxAlternatives = 5;
    rec.continuous = false;
    let settled = false;
    const done = (r: SttResult) => {
      if (settled) return;
      settled = true;
      active = null;
      window.clearTimeout(timer);
      resolve(r);
    };
    const timer = window.setTimeout(() => {
      try {
        rec.stop();
      } catch {
        /* ignore */
      }
      done({ alternatives: [], error: 'no-speech' });
    }, timeoutMs);
    rec.onresult = (e) => {
      const first = e.results[0];
      const alts: string[] = [];
      if (first) for (let i = 0; i < first.length; i++) alts.push(first[i]!.transcript);
      done({ alternatives: alts });
    };
    rec.onerror = (e) => {
      const map: Record<string, SttError> = { 'not-allowed': 'not-allowed', 'service-not-allowed': 'not-allowed', 'no-speech': 'no-speech', network: 'network', aborted: 'aborted' };
      done({ alternatives: [], error: map[e.error] ?? 'other' });
    };
    rec.onend = () => done({ alternatives: [], error: 'no-speech' });
    try {
      rec.start();
    } catch {
      done({ alternatives: [], error: 'other' });
    }
  });
}
