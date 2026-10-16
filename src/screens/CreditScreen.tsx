import { useEffect, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/theme/useTheme';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useCreditStore } from '@/store/useCreditStore';
import { listCredits, getCreditTotals, type CreditTotals } from '@/db/repositories/credits';
import { formatAmount } from '@/utils/numberFormat';
import { AppText } from '@/components/AppText';
import { ScreenContainer } from '@/components/ScreenContainer';
import { ToggleTabs } from '@/components/ToggleTabs';
import { CreditCard } from '@/components/CreditCard';
import { FAB } from '@/components/FAB';
import type { MainTabParamList, RootStackParamList } from '@/navigation/types';
import type { CreditDirection, CreditWithPaid } from '@/types/models';

type Props = CompositeScreenProps<BottomTabScreenProps<MainTabParamList, 'Credit'>, NativeStackScreenProps<RootStackParamList>>;

export function CreditScreen({ navigation }: Props) {
  const { colors, spacing, radii } = useTheme();
  const digitFormat = useSettingsStore((s) => s.digitFormat);
  const activeShopId = useSettingsStore((s) => s.activeShopId);
  const refreshToken = useCreditStore((s) => s.refreshToken);

  const [direction, setDirection] = useState<CreditDirection>('given');
  const [credits, setCredits] = useState<CreditWithPaid[]>([]);
  const [totals, setTotals] = useState<CreditTotals>({ totalGiven: 0, totalTaken: 0 });

  useEffect(() => {
    if (!activeShopId) return;
    listCredits(activeShopId, direction).then(setCredits);
  }, [activeShopId, direction, refreshToken]);

  useEffect(() => {
    if (!activeShopId) return;
    getCreditTotals(activeShopId).then(setTotals);
  }, [activeShopId, refreshToken]);

  return (
    <ScreenContainer>
      <View style={{ paddingHorizontal: spacing.lg, paddingTop: 8 }}>
        <AppText weight="bold" size={22} style={{ marginBottom: 14 }}>
          বাকি-দেনা
        </AppText>

        <View style={styles.summaryRow}>
          <View style={[styles.summaryCard, { backgroundColor: colors.incomeBg, borderRadius: radii.lg }]}>
            <AppText weight="medium" size={12} color={colors.income}>
              মোট পাওনা
            </AppText>
            <AppText weight="bold" size={19} color={colors.income} style={{ marginTop: 4 }}>
              {formatAmount(totals.totalGiven, digitFormat)}
            </AppText>
          </View>
          <View style={[styles.summaryCard, { backgroundColor: colors.expenseBg, borderRadius: radii.lg, marginLeft: 12 }]}>
            <AppText weight="medium" size={12} color={colors.expense}>
              মোট দেনা
            </AppText>
            <AppText weight="bold" size={19} color={colors.expense} style={{ marginTop: 4 }}>
              {formatAmount(totals.totalTaken, digitFormat)}
            </AppText>
          </View>
        </View>

        <View style={{ marginTop: spacing.lg }}>
          <ToggleTabs
            options={[
              { key: 'given', label: 'বাকি দিয়েছি' },
              { key: 'taken', label: 'বাকি নিয়েছি' },
            ]}
            value={direction}
            onChange={(k) => setDirection(k as CreditDirection)}
          />
        </View>
      </View>

      <FlatList
        data={credits}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={{ padding: spacing.lg, paddingBottom: 110 }}
        renderItem={({ item }) => <CreditCard credit={item} onPress={() => navigation.navigate('CreditDetail', { creditId: item.id })} />}
        ListEmptyComponent={
          <View style={{ paddingVertical: 60, alignItems: 'center' }}>
            <Ionicons name="people-outline" size={40} color={colors.textMuted} />
            <AppText color={colors.textMuted} size={13} style={{ marginTop: 10 }}>
              {direction === 'given' ? 'কাউকে বাকি দেওয়া হয়নি' : 'কারো কাছ থেকে বাকি নেওয়া হয়নি'}
            </AppText>
          </View>
        }
      />

      <FAB onPress={() => navigation.navigate('CreditForm', { direction })} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  summaryRow: { flexDirection: 'row' },
  summaryCard: { flex: 1, padding: 14 },
});
