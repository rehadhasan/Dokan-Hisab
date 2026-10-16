import type { DigitFormat } from '@/types/models';
import {
  addDays,
  addMonths,
  addYears,
  endOfMonth,
  endOfWeek,
  endOfYear,
  formatDisplayDate,
  monthLabel,
  startOfMonth,
  startOfWeek,
  startOfYear,
  weekLabel,
  yearLabel,
} from './dateFormat';

export type PeriodType = 'daily' | 'weekly' | 'monthly' | 'yearly';

export interface PeriodRange {
  from: string;
  to: string;
  label: string;
}

export function getPeriodRange(type: PeriodType, referenceDate: string, digitFormat: DigitFormat = 'bn'): PeriodRange {
  switch (type) {
    case 'daily':
      return { from: referenceDate, to: referenceDate, label: formatDisplayDate(referenceDate, digitFormat) };
    case 'weekly':
      return { from: startOfWeek(referenceDate), to: endOfWeek(referenceDate), label: weekLabel(referenceDate, digitFormat) };
    case 'monthly':
      return { from: startOfMonth(referenceDate), to: endOfMonth(referenceDate), label: monthLabel(referenceDate, digitFormat) };
    case 'yearly':
      return { from: startOfYear(referenceDate), to: endOfYear(referenceDate), label: yearLabel(referenceDate, digitFormat) };
  }
}

export function stepPeriod(type: PeriodType, referenceDate: string, direction: 1 | -1): string {
  switch (type) {
    case 'daily':
      return addDays(referenceDate, direction);
    case 'weekly':
      return addDays(referenceDate, direction * 7);
    case 'monthly':
      return addMonths(referenceDate, direction);
    case 'yearly':
      return addYears(referenceDate, direction);
  }
}
