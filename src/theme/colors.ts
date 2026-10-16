export interface ThemeColors {
  background: string;
  surface: string;
  surfaceElevated: string;
  primary: string;
  primaryDark: string;
  onPrimary: string;
  text: string;
  textMuted: string;
  border: string;
  income: string;
  incomeBg: string;
  expense: string;
  expenseBg: string;
  warning: string;
  overlay: string;
  shadow: string;
}

export const lightColors: ThemeColors = {
  background: '#F5F7F6',
  surface: '#FFFFFF',
  surfaceElevated: '#FFFFFF',
  primary: '#0F766E',
  primaryDark: '#0B5B54',
  onPrimary: '#FFFFFF',
  text: '#1A2421',
  textMuted: '#6B7876',
  border: '#E4E9E7',
  income: '#16A34A',
  incomeBg: '#E7F7ED',
  expense: '#DC2626',
  expenseBg: '#FDECEC',
  warning: '#D97706',
  overlay: 'rgba(15, 23, 21, 0.45)',
  shadow: '#0F766E',
};

export const darkColors: ThemeColors = {
  background: '#12181A',
  surface: '#1C2426',
  surfaceElevated: '#232D2F',
  primary: '#2DD4BF',
  primaryDark: '#14B8A6',
  onPrimary: '#0A1210',
  text: '#EAF2F0',
  textMuted: '#93A3A0',
  border: '#2C3638',
  income: '#4ADE80',
  incomeBg: 'rgba(74, 222, 128, 0.14)',
  expense: '#F87171',
  expenseBg: 'rgba(248, 113, 113, 0.14)',
  warning: '#FBBF24',
  overlay: 'rgba(0, 0, 0, 0.6)',
  shadow: '#000000',
};

export const chartPalette = [
  '#0F766E',
  '#F59E0B',
  '#DC2626',
  '#6366F1',
  '#EC4899',
  '#16A34A',
  '#0EA5E9',
  '#A855F7',
  '#EA580C',
  '#64748B',
];

export const radii = {
  sm: 10,
  md: 16,
  lg: 20,
  xl: 28,
  pill: 999,
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};
