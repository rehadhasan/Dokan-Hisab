import type { DigitFormat } from '@/types/models';

const BN_DIGITS = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];

export function toBengaliDigits(input: string | number): string {
  return String(input).replace(/[0-9]/g, (d) => BN_DIGITS[Number(d)]);
}

export function formatNumber(value: number, digitFormat: DigitFormat): string {
  const rounded = Math.round(value * 100) / 100;
  const formatted = rounded.toLocaleString('en-US', {
    maximumFractionDigits: 2,
    minimumFractionDigits: rounded % 1 === 0 ? 0 : 2,
  });
  return digitFormat === 'bn' ? toBengaliDigits(formatted) : formatted;
}

export function formatAmount(value: number, digitFormat: DigitFormat): string {
  return `৳${formatNumber(value, digitFormat)}`;
}
