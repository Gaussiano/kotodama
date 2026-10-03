import { useCallback } from 'react';
import { useSettingsStore } from '@/store/settingsStore';
import { SLOW_RATE, speak } from './tts';

/** Speak with the user's voice settings. `slow` plays at 0.6. */
export function useSpeak() {
  const voiceURI = useSettingsStore((s) => s.voiceURI);
  const rate = useSettingsStore((s) => s.voiceRate);
  return useCallback(
    (text: string, opts: { slow?: boolean; fill?: string } = {}) =>
      speak(text, { voiceURI, rate: opts.slow ? SLOW_RATE : Math.min(rate, 0.9) + (rate >= 1 ? 0.1 : 0), fill: opts.fill }),
    [voiceURI, rate],
  );
}
