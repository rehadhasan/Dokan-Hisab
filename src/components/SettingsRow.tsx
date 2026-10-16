import type { ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/theme/useTheme';
import { AppText } from './AppText';

interface SettingsRowProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress?: () => void;
  right?: ReactNode;
  danger?: boolean;
}

export function SettingsRow({ icon, label, onPress, right, danger }: SettingsRowProps) {
  const { colors, radii, spacing } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => [
        styles.row,
        { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radii.md, opacity: pressed ? 0.8 : 1 },
      ]}
    >
      <View style={[styles.iconWrap, { backgroundColor: colors.background, borderRadius: radii.md }]}>
        <Ionicons name={icon} size={19} color={danger ? colors.expense : colors.primary} />
      </View>
      <AppText weight="medium" size={15} color={danger ? colors.expense : colors.text} style={{ flex: 1, marginLeft: spacing.sm }}>
        {label}
      </AppText>
      {right ?? (onPress && <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />)}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', padding: 12, borderWidth: 1, marginBottom: 10 },
  iconWrap: { width: 38, height: 38, alignItems: 'center', justifyContent: 'center' },
});
