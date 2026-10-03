import { BLANK } from '@/content';

// Web Speech API wrapper (spec §12). Voices can arrive late: load them robustly.

let voicesCache: SpeechSynthesisVoice[] = [];
let loadPromise: Promise<SpeechSynthesisVoice[]> | null = null;

const hasSynth = () => typeof window !== 'undefined' && 'speechSynthesis' in window;

export function ensureVoicesLoaded(): Promise<SpeechSynthesisVoice[]> {
  if (!hasSynth()) return Promise.resolve([]);
  const now = window.speechSynthesis.getVoices();
  if (now.length) {
    voicesCache = now;
    return Promise.resolve(now);
  }
  if (loadPromise) return loadPromise;
  loadPromise = new Promise((resolve) => {
    let tries = 0;
    const done = (v: SpeechSynthesisVoice[]) => {
      voicesCache = v;
      resolve(v);
    };
    const onChange = () => {
      const v = window.speechSynthesis.getVoices();
      if (v.length) {
        window.speechSynthesis.removeEventListener('voiceschanged', onChange);
        done(v);
      }
    };
    window.speechSynthesis.addEventListener('voiceschanged', onChange);
    const poll = () => {
      const v = window.speechSynthesis.getVoices();
      if (v.length) return done(v);
      if (++tries < 20) setTimeout(poll, 250);
      else done([]);
    };
    poll();
  });
  return loadPromise;
}

export function getJapaneseVoices(): SpeechSynthesisVoice[] {
  const all = voicesCache.length ? voicesCache : hasSynth() ? window.speechSynthesis.getVoices() : [];
  return all.filter((v) => v.lang.toLowerCase().replace('_', '-').startsWith('ja'));
}

export const hasJapaneseVoice = () => getJapaneseVoices().length > 0;

/** Best default: prefer Google/Kyoko/Otoya, then any local, then any ja voice. */
export function pickDefaultVoice(): SpeechSynthesisVoice | undefined {
  const v = getJapaneseVoices();
  const score = (x: SpeechSynthesisVoice) =>
    (/google/i.test(x.name) ? 4 : 0) + (/kyoko|otoya|o-ren|hattori/i.test(x.name) ? 3 : 0) + (x.localService ? 1 : 0) + (/enhanced|premium|natural/i.test(x.name) ? 2 : 0);
  return [...v].sort((a, b) => score(b) - score(a))[0];
}

export interface SpeakOptions {
  rate?: number;
  voiceURI?: string | null;
  /** Text to read inside ＿＿; a pause when empty. */
  fill?: string;
}

let current: SpeechSynthesisUtterance | null = null;

export function cancelSpeech() {
  if (hasSynth()) window.speechSynthesis.cancel();
  current = null;
}

/** Speaks Japanese text. Resolves when finished (or immediately when speech is unavailable). */
export function speak(text: string, opts: SpeakOptions = {}): Promise<void> {
  if (!hasSynth()) return Promise.resolve();
  const clean = text.replace(new RegExp(BLANK, 'g'), opts.fill?.trim() ? opts.fill.trim() : '、').replace(/＿+/g, '、');
  cancelSpeech();
  return new Promise((resolve) => {
    const u = new SpeechSynthesisUtterance(clean);
    u.lang = 'ja-JP';
    u.rate = opts.rate ?? 0.9;
    u.pitch = 1;
    const voices = getJapaneseVoices();
    const chosen = (opts.voiceURI && voices.find((v) => v.voiceURI === opts.voiceURI)) || pickDefaultVoice();
    if (chosen) u.voice = chosen;
    u.onend = () => {
      current = null;
      resolve();
    };
    u.onerror = () => {
      current = null;
      resolve();
    };
    current = u;
    window.speechSynthesis.speak(u);
    // Safari sometimes needs a kick when paused.
    if (window.speechSynthesis.paused) window.speechSynthesis.resume();
  });
}

export const isSpeaking = () => current !== null;

export const SLOW_RATE = 0.6;
