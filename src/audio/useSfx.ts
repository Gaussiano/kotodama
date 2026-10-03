import { useCallback } from 'react';
import { useSettingsStore } from '@/store/settingsStore';
import { sfx } from './sfx';

export function useSfx() {
  const enabled = useSettingsStore((s) => s.sfx);
  return useCallback(
    (name: keyof typeof sfx) => {
      if (!enabled) return;
      try {
        sfx[name]();
      } catch {
        /* audio unavailable */
      }
    },
    [enabled],
  );
}
