import type { DigitFormat } from '@/types/models';
import { toBengaliDigits } from './numberFormat';

const BN_MONTHS = [
  'জানুয়ারি',
  'ফেব্রুয়ারি',
  'মার্চ',
  'এপ্রিল',
  'মে',
  'জুন',
  'জুলাই',
  'আগস্ট',
  'সেপ্টেম্বর',
  'অক্টোবর',
  'নভেম্বর',
  'ডিসেম্বর',
];

const BN_WEEKDAYS = ['রবিবার', 'সোমবার', 'মঙ্গলবার', 'বুধবার', 'বৃহস্পতিবার', 'শুক্রবার', 'শনিবার'];

export function todayIso(): string {
  return toIsoDate(new Date());
}

export function toIsoDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function formatDisplayDate(isoDate: string, digitFormat: DigitFormat = 'bn'): string {
  const date = new Date(`${isoDate}T00:00:00`);
  const day = date.getDate();
  const month = BN_MONTHS[date.getMonth()];
  const year = date.getFullYear();
  const dayStr = digitFormat === 'bn' ? toBengaliDigits(day) : String(day);
  const yearStr = digitFormat === 'bn' ? toBengaliDigits(year) : String(year);
  return `${dayStr} ${month}, ${yearStr}`;
}

export function formatWeekday(isoDate: string): string {
  const date = new Date(`${isoDate}T00:00:00`);
  return BN_WEEKDAYS[date.getDay()];
}

export function addDays(isoDate: string, days: number): string {
  const date = new Date(`${isoDate}T00:00:00`);
  date.setDate(date.getDate() + days);
  return toIsoDate(date);
}

export function startOfWeek(isoDate: string): string {
  const date = new Date(`${isoDate}T00:00:00`);
  const day = date.getDay();
  date.setDate(date.getDate() - day);
  return toIsoDate(date);
}

export function endOfWeek(isoDate: string): string {
  return addDays(startOfWeek(isoDate), 6);
}

export function startOfMonth(isoDate: string): string {
  const date = new Date(`${isoDate}T00:00:00`);
  return toIsoDate(new Date(date.getFullYear(), date.getMonth(), 1));
}

export function endOfMonth(isoDate: string): string {
  const date = new Date(`${isoDate}T00:00:00`);
  return toIsoDate(new Date(date.getFullYear(), date.getMonth() + 1, 0));
}

export function startOfYear(isoDate: string): string {
  const date = new Date(`${isoDate}T00:00:00`);
  return toIsoDate(new Date(date.getFullYear(), 0, 1));
}

export function endOfYear(isoDate: string): string {
  const date = new Date(`${isoDate}T00:00:00`);
  return toIsoDate(new Date(date.getFullYear(), 11, 31));
}

export function addMonths(isoDate: string, months: number): string {
  const date = new Date(`${isoDate}T00:00:00`);
  return toIsoDate(new Date(date.getFullYear(), date.getMonth() + months, 1));
}

export function addYears(isoDate: string, years: number): string {
  const date = new Date(`${isoDate}T00:00:00`);
  return toIsoDate(new Date(date.getFullYear() + years, date.getMonth(), date.getDate()));
}

export function monthLabel(isoDate: string, digitFormat: DigitFormat = 'bn'): string {
  const date = new Date(`${isoDate}T00:00:00`);
  const year = date.getFullYear();
  const yearStr = digitFormat === 'bn' ? toBengaliDigits(year) : String(year);
  return `${BN_MONTHS[date.getMonth()]}, ${yearStr}`;
}

export function yearLabel(isoDate: string, digitFormat: DigitFormat = 'bn'): string {
  const date = new Date(`${isoDate}T00:00:00`);
  const year = date.getFullYear();
  return digitFormat === 'bn' ? toBengaliDigits(year) : String(year);
}

export function weekLabel(isoDate: string, digitFormat: DigitFormat = 'bn'): string {
  const from = startOfWeek(isoDate);
  const to = endOfWeek(isoDate);
  return `${formatDisplayDate(from, digitFormat)} - ${formatDisplayDate(to, digitFormat)}`;
}
