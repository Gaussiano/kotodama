import { DEFAULT_SETTINGS, useSettingsStore } from '@/store/settingsStore';

describe('settingsStore', () => {
  beforeEach(() => useSettingsStore.getState().reset());

  it('starts with spec defaults (goal 20, romaji auto, hearts on)', () => {
    const s = useSettingsStore.getState();
    expect(s.dailyGoal).toBe(20);
    expect(s.romajiMode).toBe('auto');
    expect(s.heartsEnabled).toBe(true);
    expect(s.userName).toBe(DEFAULT_SETTINGS.userName);
  });

  it('patches and resets', () => {
    useSettingsStore.getState().set({ theme: 'dark', dailyGoal: 50 });
    expect(useSettingsStore.getState().theme).toBe('dark');
    useSettingsStore.getState().reset();
    expect(useSettingsStore.getState().theme).toBe('system');
  });
});
