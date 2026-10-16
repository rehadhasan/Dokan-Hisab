import { useEffect, useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useTheme } from '@/theme/useTheme';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useShopStore } from '@/store/useShopStore';
import { useEntryStore } from '@/store/useEntryStore';
import { getSummary, getRecentEntries, getDailyTotals, type Summary } from '@/db/repositories/entries';
import { getPeriodRange, stepPeriod, type PeriodType } from '@/utils/period';
import { dailyRowsToSeries, type TrendSeries } from '@/utils/chartData';
import { todayIso, addDays } from '@/utils/dateFormat';
import { AppText } from '@/components/AppText';
import { ScreenContainer } from '@/components/ScreenContainer';
import { SummaryCard } from '@/components/SummaryCard';
import { ToggleTabs } from '@/components/ToggleTabs';
import { PeriodSelector } from '@/components/PeriodSelector';
import { IncomeExpenseTrendChart } from '@/components/IncomeExpenseTrendChart';
import { EntryListItem } from '@/components/EntryListItem';
import { FAB } from '@/components/FAB';
import type { MainTabParamList, RootStackParamList } from '@/navigation/types';
import type { EntryWithCategory } from '@/types/models';

type Props = CompositeScreenProps<BottomTabScreenProps<MainTabParamList, 'Home'>, NativeStackScreenProps<RootStackParamList>>;

const PERIOD_OPTIONS: Array<{ key: PeriodType; label: string }> = [
  { key: 'daily', label: 'দৈনিক' },
  { key: 'weekly', label: 'সাপ্তাহিক' },
  { key: 'monthly', label: 'মাসিক' },
];

export function HomeScreen({ navigation }: Props) {
  const { colors, spacing, radii } = useTheme();
  const { width: windowWidth } = useWindowDimensions();
  const chartWidth = windowWidth - spacing.lg * 2 - 14 * 2;
  const digitFormat = useSettingsStore((s) => s.digitFormat);
  const activeShopId = useSettingsStore((s) => s.activeShopId);
  const shops = useShopStore((s) => s.shops);
  const refreshToken = useEntryStore((s) => s.refreshToken);
  const shop = shops.find((sp) => sp.id === activeShopId);

  const [periodType, setPeriodType] = useState<PeriodType>('daily');
  const [referenceDate, setReferenceDate] = useState(todayIso());
  const [summary, setSummary] = useState<Summary>({ income: 0, expense: 0 });
  const [recentEntries, setRecentEntries] = useState<EntryWithCategory[]>([]);
  const [trend, setTrend] = useState<TrendSeries>({ labels: [], income: [], expense: [] });

  const today = todayIso();
  const range = useMemo(() => getPeriodRange(periodType, referenceDate, digitFormat), [periodType, referenceDate, digitFormat]);
  const isCurrentPeriod = range.to >= today;

  useEffect(() => {
    if (!activeShopId) return;
    getSummary(activeShopId, range.from, range.to).then(setSummary);
  }, [activeShopId, range.from, range.to, refreshToken]);

  useEffect(() => {
    if (!activeShopId) return;
    getRecentEntries(activeShopId, 5).then(setRecentEntries);
  }, [activeShopId, refreshToken]);

  useEffect(() => {
    if (!activeShopId) return;
    const from = addDays(today, -6);
    getDailyTotals(activeShopId, from, today).then((rows) => setTrend(dailyRowsToSeries(rows, digitFormat)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeShopId, refreshToken, digitFormat]);

  const handlePeriodStep = (direction: 1 | -1) => setReferenceDate((d) => stepPeriod(periodType, d, direction));

  if (!shop) return null;

  return (
    <ScreenContainer>
      <FlatList
        data={recentEntries}
        keyExtractor={(item) => String(item.id)}
        ListHeaderComponent={
          <View style={{ paddingHorizontal: spacing.lg }}>
            <View style={styles.header}>
              <Pressable style={styles.shopRow} onPress={() => navigation.navigate('ShopSelect')}>
                <View style={[styles.shopIcon, { backgroundColor: colors.incomeBg, borderRadius: radii.md }]}>
                  <Ionicons name={(shop.icon as any) || 'storefront'} size={20} color={colors.primary} />
                </View>
                <View style={{ marginLeft: 8 }}>
                  <AppText size={11} color={colors.textMuted}>
                    আপনার দোকান
                  </AppText>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <AppText weight="bold" size={17}>
                      {shop.name}
                    </AppText>
                    <Ionicons name="chevron-down" size={16} color={colors.textMuted} style={{ marginLeft: 4 }} />
                  </View>
                </View>
              </Pressable>
              <Pressable onPress={() => navigation.navigate('Settings')} hitSlop={10}>
                <Ionicons name="settings-outline" size={24} color={colors.text} />
              </Pressable>
            </View>

            <Animated.View entering={FadeInDown.duration(400)}>
              <SummaryCard income={summary.income} expense={summary.expense} />
            </Animated.View>

            <View style={{ marginTop: spacing.lg }}>
              <ToggleTabs options={PERIOD_OPTIONS} value={periodType} onChange={(k) => setPeriodType(k as PeriodType)} />
              <View style={{ marginTop: spacing.md }}>
                <PeriodSelector
                  label={range.label}
                  onPrev={() => handlePeriodStep(-1)}
                  onNext={() => handlePeriodStep(1)}
                  nextDisabled={isCurrentPeriod}
                />
              </View>
            </View>

            <Pressable
              onPress={() => navigation.navigate('Graph')}
              style={[styles.chartCard, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radii.lg }]}
            >
              <View style={styles.chartHeader}>
                <AppText weight="semibold" size={14}>
                  গত ৭ দিনের প্রবণতা
                </AppText>
                <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
              </View>
              <IncomeExpenseTrendChart {...trend} compact height={140} width={chartWidth} />
            </Pressable>

            <View style={styles.recentHeader}>
              <AppText weight="bold" size={16}>
                সাম্প্রতিক এন্ট্রি
              </AppText>
              <Pressable onPress={() => navigation.navigate('History')}>
                <AppText weight="semibold" size={13} color={colors.primary}>
                  সব দেখুন
                </AppText>
              </Pressable>
            </View>
          </View>
        }
        renderItem={({ item, index }) => (
          <Animated.View
            entering={FadeInDown.delay(index * 60).duration(300)}
            style={{ paddingHorizontal: spacing.lg, marginBottom: 10 }}
          >
            <EntryListItem entry={item} />
          </Animated.View>
        )}
        ListEmptyComponent={
          <View style={{ paddingHorizontal: spacing.lg, paddingVertical: 24, alignItems: 'center' }}>
            <AppText color={colors.textMuted} size={13}>
              এখনো কোনো এন্ট্রি নেই
            </AppText>
          </View>
        }
        contentContainerStyle={{ paddingBottom: 110 }}
      />
      <FAB onPress={() => navigation.navigate('AddEntry')} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12 },
  shopRow: { flexDirection: 'row', alignItems: 'center' },
  shopIcon: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  chartCard: { borderWidth: 1, padding: 14, marginTop: 20, overflow: 'hidden' },
  chartHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  recentHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 24, marginBottom: 12 },
});
