import { View } from 'react-native';
import { PieChart } from 'react-native-chart-kit';
import { useTheme } from '@/theme/useTheme';
import { chartPalette } from '@/theme/colors';
import { fonts } from '@/theme/typography';
import type { CategoryBreakdownRow } from '@/db/repositories/entries';
import { AppText } from './AppText';

interface CategoryPieChartProps {
  data: CategoryBreakdownRow[];
  width: number;
  height?: number;
}

export interface CategorySlice extends CategoryBreakdownRow {
  color: string;
  percent: number;
}

export function buildSlices(data: CategoryBreakdownRow[]): CategorySlice[] {
  const total = data.reduce((sum, d) => sum + d.total, 0);
  return data
    .filter((d) => d.total > 0)
    .map((d, i) => ({
      ...d,
      color: chartPalette[i % chartPalette.length],
      percent: total > 0 ? (d.total / total) * 100 : 0,
    }));
}

export function CategoryPieChart({ data, width, height = 200 }: CategoryPieChartProps) {
  const { colors } = useTheme();
  const slices = buildSlices(data);

  if (slices.length === 0) {
    return (
      <View style={{ height, alignItems: 'center', justifyContent: 'center' }}>
        <AppText color={colors.textMuted} size={13}>
          এই সময়ে কোনো তথ্য নেই
        </AppText>
      </View>
    );
  }

  const chartData = slices.map((s) => ({
    name: s.category_name ?? 'অন্যান্য',
    value: s.total,
    color: s.color,
    legendFontColor: colors.textMuted,
    legendFontSize: 12,
  }));

  return (
    <PieChart
      data={chartData}
      width={width}
      height={height}
      chartConfig={{
        color: () => colors.text,
        labelColor: () => colors.textMuted,
        propsForLabels: { fontFamily: fonts.regular },
      }}
      accessor="value"
      backgroundColor="transparent"
      paddingLeft="0"
      absolute={false}
    />
  );
}
