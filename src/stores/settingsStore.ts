import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { db, initializeSettings } from '@/lib/db';
import type { Settings } from '@/types';

interface SettingsState extends Omit<Settings, 'id'> {
  isLoaded: boolean;
  loadSettings: () => Promise<void>;
  updateSettings: (settings: Partial<Omit<Settings, 'id'>>) => Promise<void>;
  completeOnboarding: () => Promise<void>;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      hapticEnabled: true,
      soundEnabled: true,
      onboardingCompleted: false,
      isLoaded: false,

      loadSettings: async () => {
        try {
          const settings = await initializeSettings();
          set({
            hapticEnabled: settings.hapticEnabled,
            soundEnabled: settings.soundEnabled,
            onboardingCompleted: settings.onboardingCompleted,
            isLoaded: true,
          });
        } catch (error) {
          console.error('Failed to load settings:', error);
          set({ isLoaded: true });
        }
      },

      updateSettings: async (newSettings) => {
        const current = get();
        const updated = {
          id: 'app-settings' as const,
          hapticEnabled: newSettings.hapticEnabled ?? current.hapticEnabled,
          soundEnabled: newSettings.soundEnabled ?? current.soundEnabled,
          onboardingCompleted: newSettings.onboardingCompleted ?? current.onboardingCompleted,
        };

        await db.settings.put(updated);
        set(newSettings);
      },

      completeOnboarding: async () => {
        await get().updateSettings({ onboardingCompleted: true });
      },
    }),
    {
      name: 'safe-drive-settings',
      partialize: (state) => ({
        hapticEnabled: state.hapticEnabled,
        soundEnabled: state.soundEnabled,
        onboardingCompleted: state.onboardingCompleted,
      }),
    }
  )
);
