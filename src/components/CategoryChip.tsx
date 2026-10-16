import { Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useTheme } from '@/theme/useTheme';
import { AppText } from './AppText';

interface CategoryChipProps {
  label: string;
  icon: string | null;
  active: boolean;
  onPress: () => void;
  activeColor: string;
  activeBg: string;
}

export function CategoryChip({ label, icon, active, onPress, activeColor, activeBg }: CategoryChipProps) {
  const { colors, radii } = useTheme();

  return (
    <Pressable
      onPress={() => {
        Haptics.selectionAsync();
        onPress();
      }}
      style={[
        styles.chip,
        {
          backgroundColor: active ? activeBg : colors.surface,
          borderColor: active ? activeColor : colors.border,
          borderRadius: radii.pill,
        },
      ]}
    >
      <Ionicons name={(icon as any) || 'pricetag'} size={16} color={active ? activeColor : colors.textMuted} />
      <AppText weight={active ? 'semibold' : 'medium'} size={13} color={active ? activeColor : colors.text} style={{ marginLeft: 6 }}>
        {label}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderWidth: 1.5,
    marginRight: 8,
  },
});
