import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/theme/useTheme';
import { AppText } from './AppText';
import { AnimatedNumber } from './AnimatedNumber';

interface SummaryCardProps {
  income: number;
  expense: number;
}

export function SummaryCard({ income, expense }: SummaryCardProps) {
  const { colors, radii, spacing } = useTheme();
  const net = income - expense;
  const isProfit = net >= 0;

  return (
    <View style={[styles.card, { backgroundColor: colors.primary, borderRadius: radii.xl, padding: spacing.lg }]}>
      <AppText weight="medium" size={13} color="rgba(255,255,255,0.85)">
        নিট {isProfit ? 'লাভ' : 'ক্ষতি'}
      </AppText>
      <AnimatedNumber value={Math.abs(net)} style={{ fontSize: 34, color: colors.onPrimary, marginTop: 4 }} />

      <View style={[styles.divider, { backgroundColor: 'rgba(255,255,255,0.2)' }]} />

      <View style={styles.row}>
        <View style={styles.rowItem}>
          <View style={styles.rowLabel}>
            <Ionicons name="arrow-down-circle" size={16} color="#4ADE80" />
            <AppText weight="medium" size={12} color="rgba(255,255,255,0.85)" style={{ marginLeft: 4 }}>
              আয়
            </AppText>
          </View>
          <AnimatedNumber value={income} style={{ fontSize: 18, color: colors.onPrimary, marginTop: 2 }} />
        </View>
        <View style={styles.rowItem}>
          <View style={styles.rowLabel}>
            <Ionicons name="arrow-up-circle" size={16} color="#FCA5A5" />
            <AppText weight="medium" size={12} color="rgba(255,255,255,0.85)" style={{ marginLeft: 4 }}>
              ব্যয়
            </AppText>
          </View>
          <AnimatedNumber value={expense} style={{ fontSize: 18, color: colors.onPrimary, marginTop: 2 }} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  divider: { height: 1, marginVertical: 16 },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  rowItem: { flex: 1 },
  rowLabel: { flexDirection: 'row', alignItems: 'center' },
});
