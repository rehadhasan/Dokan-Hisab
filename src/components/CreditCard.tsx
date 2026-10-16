import { Pressable, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/theme/useTheme';
import { useSettingsStore } from '@/store/useSettingsStore';
import { formatAmount } from '@/utils/numberFormat';
import { formatDisplayDate } from '@/utils/dateFormat';
import type { CreditWithPaid } from '@/types/models';
import { AppText } from './AppText';
import { StatusBadge } from './StatusBadge';

interface CreditCardProps {
  credit: CreditWithPaid;
  onPress: () => void;
}

export function CreditCard({ credit, onPress }: CreditCardProps) {
  const { colors, radii, spacing } = useTheme();
  const digitFormat = useSettingsStore((s) => s.digitFormat);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radii.lg, opacity: pressed ? 0.85 : 1 },
      ]}
    >
      <View style={[styles.avatar, { backgroundColor: colors.incomeBg, borderRadius: radii.pill }]}>
        <Ionicons name="person" size={20} color={colors.primary} />
      </View>
      <View style={{ flex: 1, marginLeft: spacing.sm }}>
        <AppText weight="semibold" size={16}>
          {credit.person_name}
        </AppText>
        <AppText size={12} color={colors.textMuted}>
          {formatDisplayDate(credit.credit_date, digitFormat)}
        </AppText>
      </View>
      <View style={{ alignItems: 'flex-end' }}>
        <AppText weight="bold" size={16}>
          {formatAmount(credit.remaining, digitFormat)}
        </AppText>
        <View style={{ marginTop: 6 }}>
          <StatusBadge status={credit.status} />
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: 'row', alignItems: 'center', padding: 14, borderWidth: 1, marginBottom: 10 },
  avatar: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
});
