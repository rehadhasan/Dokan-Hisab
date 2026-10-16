import { Appearance } from 'react-native';
import { create } from 'zustand';
import { getAllSettings, setSetting } from '@/db/repositories/settings';
import type { DigitFormat, ThemeMode } from '@/types/models';

interface SettingsState {
  theme: ThemeMode;
  digitFormat: DigitFormat;
  activeShopId: number | null;
  onboardingSeen: boolean;
  isLoaded: boolean;
  loadSettings: () => Promise<void>;
  setTheme: (theme: ThemeMode) => Promise<void>;
  setDigitFormat: (format: DigitFormat) => Promise<void>;
  setActiveShopId: (shopId: number | null) => Promise<void>;
  setOnboardingSeen: (seen: boolean) => Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  theme: Appearance.getColorScheme() === 'dark' ? 'dark' : 'light',
  digitFormat: 'bn',
  activeShopId: null,
  onboardingSeen: false,
  isLoaded: false,

  loadSettings: async () => {
    const all = await getAllSettings();
    set({
      theme: (all.theme as ThemeMode) ?? get().theme,
      digitFormat: (all.digitFormat as DigitFormat) ?? 'bn',
      activeShopId: all.activeShopId ? Number(all.activeShopId) : null,
      onboardingSeen: all.onboardingSeen === '1',
      isLoaded: true,
    });
  },

  setTheme: async (theme) => {
    set({ theme });
    await setSetting('theme', theme);
  },

  setDigitFormat: async (digitFormat) => {
    set({ digitFormat });
    await setSetting('digitFormat', digitFormat);
  },

  setActiveShopId: async (activeShopId) => {
    set({ activeShopId });
    await setSetting('activeShopId', activeShopId ? String(activeShopId) : '');
  },

  setOnboardingSeen: async (onboardingSeen) => {
    set({ onboardingSeen });
    await setSetting('onboardingSeen', onboardingSeen ? '1' : '0');
  },
}));
