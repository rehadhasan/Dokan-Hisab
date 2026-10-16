import type { DailyTotalRow, MonthlyTotalRow } from '@/db/repositories/entries';
import type { DigitFormat } from '@/types/models';
import { toBengaliDigits } from './numberFormat';

const BN_MONTH_SHORT = ['জানু', 'ফেব্রু', 'মার্চ', 'এপ্রিল', 'মে', 'জুন', 'জুলাই', 'আগস্ট', 'সেপ্ট', 'অক্টো', 'নভে', 'ডিসে'];

export interface TrendSeries {
  labels: string[];
  income: number[];
  expense: number[];
}

export function dailyRowsToSeries(rows: DailyTotalRow[], digitFormat: DigitFormat): TrendSeries {
  return {
    labels: rows.map((r) => {
      const day = r.day.slice(8, 10);
      return digitFormat === 'bn' ? toBengaliDigits(day) : day;
    }),
    income: rows.map((r) => r.income),
    expense: rows.map((r) => r.expense),
  };
}

export function monthlyRowsToSeries(rows: MonthlyTotalRow[]): TrendSeries {
  return {
    labels: rows.map((r) => BN_MONTH_SHORT[Number(r.month.slice(5, 7)) - 1]),
    income: rows.map((r) => r.income),
    expense: rows.map((r) => r.expense),
  };
}
