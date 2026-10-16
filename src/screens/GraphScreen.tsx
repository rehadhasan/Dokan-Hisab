import { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { useTheme } from '@/theme/useTheme';
import { useSettingsStore } from '@/store/useSettingsStore';
import {
  getCategoryBreakdown,
  getDailyTotals,
  getMonthlyTotals,
  getSummary,
  type CategoryBreakdownRow,
  type Summary,
} from '@/db/repositories/entries';
import { useEntryStore } from '@/store/useEntryStore';
import { getPeriodRange, stepPeriod, type PeriodType } from '@/utils/period';
import { dailyRowsToSeries, monthlyRowsToSeries, type TrendSeries } from '@/utils/chartData';
import { addDays, todayIso } from '@/utils/dateFormat';
import { formatAmount, toBengaliDigits } from '@/utils/numberFormat';
import { AppText } from '@/components/AppText';
import { ScreenContainer } from '@/components/ScreenContainer';
import { SummaryCard } from '@/components/SummaryCard';
import { ToggleTabs } from '@/components/ToggleTabs';
import { PeriodSelector } from '@/components/PeriodSelector';
import { IncomeExpenseTrendChart } from '@/components/IncomeExpenseTrendChart';
import { CategoryPieChart, buildSlices } from '@/components/CategoryPieChart';
import type { EntryType } from '@/types/models';

const PERIOD_OPTIONS: Array<{ key: PeriodType; label: string }> = [
  { key: 'daily', label: 'দৈনিক' },
  { key: 'weekly', label: 'সাপ্তাহিক' },
  { key: 'monthly', label: 'মাসিক' },
  { key: 'yearly', label: 'বাৎসরিক' },
];

export function GraphScreen() {
  const { colors, spacing, radii } = useTheme();
  const { width: windowWidth } = useWindowDimensions();
  const digitFormat = useSettingsStore((s) => s.digitFormat);
  const activeShopId = useSettingsStore((s) => s.activeShopId);
  const refreshToken = useEntryStore((s) => s.refreshToken);

  const [periodType, setPeriodType] = useState<PeriodType>('weekly');
  const [referenceDate, setReferenceDate] = useState(todayIso());
  const [breakdownType, setBreakdownType] = useState<EntryType>('expense');
  const [summary, setSummary] = useState<Summary>({ income: 0, expense: 0 });
  const [trend, setTrend] = useState<TrendSeries>({ labels: [], income: [], expense: [] });
  const [breakdown, setBreakdown] = useState<CategoryBreakdownRow[]>([]);

  const today = todayIso();
  const range = useMemo(() => getPeriodRange(periodType, referenceDate, digitFormat), [periodType, referenceDate, digitFormat]);
  const isCurrentPeriod = range.to >= today;
  const chartWidth = windowWidth - spacing.lg * 2 - 28;

  useEffect(() => {
    if (!activeShopId) return;
    getSummary(activeShopId, range.from, range.to).then(setSummary);
  }, [activeShopId, range.from, range.to, refreshToken]);

  useEffect(() => {
    if (!activeShopId) return;
    if (periodType === 'yearly') {
      const year = Number(range.from.slice(0, 4));
      getMonthlyTotals(activeShopId, year).then((rows) => setTrend(monthlyRowsToSeries(rows)));
    } else if (periodType === 'daily') {
      const from = addDays(referenceDate, -13);
      getDailyTotals(activeShopId, from, referenceDate).then((rows) => setTrend(dailyRowsToSeries(rows, digitFormat)));
    } else {
      getDailyTotals(activeShopId, range.from, range.to).then((rows) => setTrend(dailyRowsToSeries(rows, digitFormat)));
    }
  }, [activeShopId, periodType, referenceDate, range.from, range.to, refreshToken, digitFormat]);

  useEffect(() => {
    if (!activeShopId) return;
    getCategoryBreakdown(activeShopId, range.from, range.to, breakdownType).then(setBreakdown);
  }, [activeShopId, range.from, range.to, breakdownType, refreshToken]);

  const slices = useMemo(() => buildSlices(breakdown), [breakdown]);
  const handlePeriodStep = (direction: 1 | -1) => setReferenceDate((d) => stepPeriod(periodType, d, direction));

  return (
    <ScreenContainer>
      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: 60 }}>
        <AppText weight="bold" size={22} style={{ marginBottom: 14 }}>
          গ্রাফ
        </AppText>

        <ToggleTabs options={PERIOD_OPTIONS} value={periodType} onChange={(k) => setPeriodType(k as PeriodType)} />

        <View style={{ marginTop: spacing.md }}>
          <PeriodSelector
            label={range.label}
            onPrev={() => handlePeriodStep(-1)}
            onNext={() => handlePeriodStep(1)}
            nextDisabled={isCurrentPeriod}
          />
        </View>

        <View style={{ marginTop: spacing.lg }}>
          <SummaryCard income={summary.income} expense={summary.expense} />
        </View>

        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radii.lg }]}>
          <AppText weight="semibold" size={15} style={{ marginBottom: 10 }}>
            আয়-ব্যয়ের প্রবণতা
          </AppText>
          <IncomeExpenseTrendChart {...trend} width={chartWidth} height={200} />
        </View>

        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radii.lg }]}>
          <View style={styles.breakdownHeader}>
            <AppText weight="semibold" size={15}>
              ক্যাটাগরি অনুযায়ী বিভাজন
            </AppText>
          </View>
          <ToggleTabs
            options={[
              { key: 'expense', label: 'ব্যয়' },
              { key: 'income', label: 'আয়' },
            ]}
            value={breakdownType}
            onChange={(k) => setBreakdownType(k as EntryType)}
            activeColor={breakdownType === 'expense' ? colors.expense : colors.income}
          />

          <View style={{ marginTop: spacing.md, alignItems: 'center' }}>
            <CategoryPieChart data={breakdown} width={chartWidth} />
          </View>

          {slices.length > 0 && (
            <View style={{ marginTop: spacing.md }}>
              {slices.map((slice, index) => (
                <View key={slice.category_id ?? 'none'} style={styles.rankRow}>
                  <View style={[styles.rankBadge, { backgroundColor: slice.color }]}>
                    <AppText weight="bold" size={11} color="#fff">
                      {toBengaliDigits(index + 1)}
                    </AppText>
                  </View>
                  <View style={{ flex: 1, marginLeft: 10 }}>
                    <View style={styles.rankTopRow}>
                      <AppText weight="medium" size={13}>
                        {slice.category_name ?? 'অন্যান্য'}
                      </AppText>
                      <AppText weight="semibold" size={13}>
                        {formatAmount(slice.total, digitFormat)}
                      </AppText>
                    </View>
                    <View style={[styles.progressTrack, { backgroundColor: colors.background }]}>
                      <View style={[styles.progressFill, { width: `${slice.percent}%`, backgroundColor: slice.color }]} />
                    </View>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 1, padding: 14, marginTop: 16 },
  breakdownHeader: { marginBottom: 10 },
  rankRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  rankBadge: { width: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  rankTopRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  progressTrack: { height: 6, borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: 6, borderRadius: 3 },
});
