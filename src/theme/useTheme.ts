import { useSettingsStore } from '@/store/useSettingsStore';
import { darkColors, lightColors, radii, spacing, type ThemeColors } from './colors';

export interface Theme {
  colors: ThemeColors;
  isDark: boolean;
  spacing: typeof spacing;
  radii: typeof radii;
}

export function useTheme(): Theme {
  const mode = useSettingsStore((s) => s.theme);
  const isDark = mode === 'dark';
  return {
    colors: isDark ? darkColors : lightColors,
    isDark,
    spacing,
    radii,
  };
}
