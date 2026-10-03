import { useEffect } from 'react';
import { useSettingsStore } from '@/store/settingsStore';

/** Applies the theme and motion preferences from settings to <html>. */
export function ThemeEffect() {
  const theme = useSettingsStore((s) => s.theme);
  const reducedMotion = useSettingsStore((s) => s.reducedMotion);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'system') delete root.dataset.theme;
    else root.dataset.theme = theme;
  }, [theme]);

  useEffect(() => {
    const root = document.documentElement;
    if (reducedMotion) root.dataset.motion = 'reduced';
    else delete root.dataset.motion;
  }, [reducedMotion]);

  return null;
}
