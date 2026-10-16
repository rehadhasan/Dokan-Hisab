import { Dimensions, View } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { useTheme } from '@/theme/useTheme';
import { fonts } from '@/theme/typography';
import { AppText } from './AppText';

interface IncomeExpenseTrendChartProps {
  labels: string[];
  income: number[];
  expense: number[];
  width?: number;
  height?: number;
  compact?: boolean;
}

export function IncomeExpenseTrendChart({ labels, income, expense, width, height = 180, compact = false }: IncomeExpenseTrendChartProps) {
  const { colors } = useTheme();
  const screenWidth = width ?? Dimensions.get('window').width - 48;

  const hasAnyValue = income.some((v) => v > 0) || expense.some((v) => v > 0);

  if (labels.length === 0 || !hasAnyValue) {
    return (
      <View style={{ height, alignItems: 'center', justifyContent: 'center' }}>
        <AppText color={colors.textMuted} size={13}>
          এই সময়ে কোনো তথ্য নেই
        </AppText>
      </View>
    );
  }

  const chartConfig = {
    backgroundGradientFrom: colors.surface,
    backgroundGradientTo: colors.surface,
    decimalPlaces: 0,
    color: (opacity = 1) => colors.textMuted,
    labelColor: () => colors.textMuted,
    propsForBackgroundLines: { stroke: colors.border, strokeDasharray: '4' },
    propsForLabels: { fontFamily: fonts.regular, fontSize: 10 },
    propsForDots: { r: compact ? '0' : '3' },
  };

  return (
    <LineChart
      data={{
        labels,
        legend: compact ? undefined : ['আয়', 'ব্যয়'],
        datasets: [
          { data: income, color: () => colors.income, strokeWidth: 2.5 },
          { data: expense, color: () => colors.expense, strokeWidth: 2.5 },
        ],
      }}
      width={screenWidth}
      height={height}
      fromZero
      bezier
      withInnerLines={!compact}
      withOuterLines={false}
      withHorizontalLabels={!compact}
      withVerticalLabels={!compact}
      withShadow={false}
      chartConfig={chartConfig}
      style={{ borderRadius: 16 }}
    />
  );
}
