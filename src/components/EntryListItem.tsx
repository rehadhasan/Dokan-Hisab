import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/theme/useTheme';
import { useSettingsStore } from '@/store/useSettingsStore';
import { formatAmount } from '@/utils/numberFormat';
import type { EntryWithCategory } from '@/types/models';
import { AppText } from './AppText';

interface EntryListItemProps {
  entry: EntryWithCategory;
  onPress?: () => void;
}

export function EntryListItem({ entry, onPress }: EntryListItemProps) {
  const { colors, radii, spacing } = useTheme();
  const digitFormat = useSettingsStore((s) => s.digitFormat);
  const isIncome = entry.type === 'income';

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.container,
        {
          backgroundColor: colors.surface,
          borderRadius: radii.md,
          borderColor: colors.border,
          opacity: pressed ? 0.85 : 1,
        },
      ]}
    >
      <View
        style={[
          styles.iconWrap,
          { backgroundColor: isIncome ? colors.incomeBg : colors.expenseBg, borderRadius: radii.md },
        ]}
      >
        <Ionicons name={(entry.category_icon as any) || 'pricetag'} size={20} color={isIncome ? colors.income : colors.expense} />
      </View>
      <View style={{ flex: 1, marginLeft: spacing.sm }}>
        <AppText weight="semibold" size={15}>
          {entry.category_name ?? 'অন্যান্য'}
        </AppText>
        {!!entry.note && (
          <AppText size={12} color={colors.textMuted} numberOfLines={1}>
            {entry.note}
          </AppText>
        )}
      </View>
      <AppText weight="bold" size={15} color={isIncome ? colors.income : colors.expense}>
        {isIncome ? '+' : '-'}
        {formatAmount(entry.amount, digitFormat)}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderWidth: 1,
  },
  iconWrap: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
});
