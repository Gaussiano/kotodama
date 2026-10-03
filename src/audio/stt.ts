// Speech recognition wrapper used to score pronunciation.
// Web: SpeechRecognition (Chrome/Android online, Safari/iOS 14.5+). Native APK: the Android
// WebView has no web recognizer, so the Capacitor speech-recognition plugin is used instead.
// Anywhere else → `isSttAvailable()` is false and the UI falls back to self-evaluation.

import { Capacitor } from '@capacitor/core';

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

const isNative = () => Capacitor.isNativePlatform();
let nativeAvailable: boolean | null = null;

export const isSttAvailable = () => (isNative() ? nativeAvailable !== false : ctor() !== null);

/** Resolves native availability once (call early, e.g. on the Hablar tab). */
export async function probeStt(): Promise<boolean> {
  if (!isNative()) return ctor() !== null;
  try {
    const { SpeechRecognition } = await import('@capacitor-community/speech-recognition');
    const r = await SpeechRecognition.available();
    nativeAvailable = r.available;
  } catch {
    nativeAvailable = false;
  }
  return nativeAvailable;
}

export type SttError = 'not-allowed' | 'no-speech' | 'network' | 'aborted' | 'unavailable' | 'other';

export interface SttResult {
  alternatives: string[];
  error?: SttError;
}

let active: SpeechRecognitionLike | null = null;

export function stopListening() {
  active?.abort();
  active = null;
  if (isNative()) void import('@capacitor-community/speech-recognition').then(({ SpeechRecognition }) => SpeechRecognition.stop()).catch(() => undefined);
}

async function listenNative(): Promise<SttResult> {
  try {
    const { SpeechRecognition } = await import('@capacitor-community/speech-recognition');
    const perm = await SpeechRecognition.requestPermissions();
    if (perm.speechRecognition !== 'granted') return { alternatives: [], error: 'not-allowed' };
    const r = await SpeechRecognition.start({ language: 'ja-JP', maxResults: 5, partialResults: false, popup: false });
    const matches = r.matches ?? [];
    return matches.length ? { alternatives: matches } : { alternatives: [], error: 'no-speech' };
  } catch (e) {
    const msg = String((e as Error)?.message ?? e).toLowerCase();
    return { alternatives: [], error: msg.includes('permission') ? 'not-allowed' : msg.includes('network') ? 'network' : 'other' };
  }
}

/** Listens once in Japanese and resolves with up to 5 alternatives (empty on error). */
export function listenOnce(timeoutMs = 7000): Promise<SttResult> {
  if (isNative()) return listenNative();
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
