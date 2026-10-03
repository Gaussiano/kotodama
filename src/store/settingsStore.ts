import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ThemeMode = 'system' | 'light' | 'dark';
export type RomajiMode = 'auto' | 'always' | 'after' | 'never';
export type VoiceRate = 0.6 | 0.8 | 1.0;
export type Focus = 'balanced' | 'speaking';

export interface Settings {
  userName: string;
  dailyGoal: 10 | 20 | 30 | 50;
  romajiMode: RomajiMode;
  voiceURI: string | null;
  voiceRate: VoiceRate;
  sfx: boolean;
  vibration: boolean;
  heartsEnabled: boolean; // false = «Modo sereno»
  theme: ThemeMode;
  reducedMotion: boolean;
  exchangeRate: number; // JPY per 1 EUR
  onboarded: boolean;
  /** The one-time «no Japanese voice» notice was dismissed. */
  voiceNoticeDismissed: boolean;
  /** 'speaking': every new phrase is also said aloud and typing drills are replaced by speaking. */
  focus: Focus;
}

interface SettingsStore extends Settings {
  set: (patch: Partial<Settings>) => void;
  reset: () => void;
}

export const DEFAULT_SETTINGS: Settings = {
  userName: 'Alex',
  dailyGoal: 20,
  romajiMode: 'auto',
  voiceURI: null,
  voiceRate: 1.0,
  sfx: true,
  vibration: true,
  heartsEnabled: true,
  theme: 'system',
  reducedMotion: false,
  exchangeRate: 170,
  onboarded: false,
  voiceNoticeDismissed: false,
  focus: 'balanced',
};

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      ...DEFAULT_SETTINGS,
      set: (patch) => set(patch),
      reset: () => set({ ...DEFAULT_SETTINGS }),
    }),
    {
      name: 'kotodama-settings',
      version: 1,
      migrate: (state) => ({ ...DEFAULT_SETTINGS, ...(state as Partial<SettingsStore>) }) as SettingsStore,
      partialize: (s) => {
        const { set: _set, reset: _reset, ...rest } = s;
        return rest;
      },
    },
  ),
);
