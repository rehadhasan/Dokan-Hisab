import type { EntryWithCategory } from '@/types/models';
import { formatDisplayDate } from './dateFormat';

function csvEscape(value: string): string {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function buildEntriesCsv(entries: EntryWithCategory[]): string {
  const header = ['তারিখ', 'ধরন', 'ক্যাটাগরি', 'পরিমাণ', 'নোট'];
  const rows = entries.map((e) => [
    e.entry_date,
    e.type === 'income' ? 'আয়' : 'ব্যয়',
    e.category_name ?? 'অন্যান্য',
    String(e.amount),
    e.note ?? '',
  ]);
  const lines = [header, ...rows].map((cols) => cols.map(csvEscape).join(','));
  return '﻿' + lines.join('\n');
}

export function buildEntriesHtml(entries: EntryWithCategory[], shopName: string, income: number, expense: number): string {
  const rows = entries
    .map(
      (e) => `
      <tr>
        <td>${formatDisplayDate(e.entry_date, 'bn')}</td>
        <td style="color:${e.type === 'income' ? '#16A34A' : '#DC2626'}">${e.type === 'income' ? 'আয়' : 'ব্যয়'}</td>
        <td>${e.category_name ?? 'অন্যান্য'}</td>
        <td style="text-align:right">৳${e.amount.toLocaleString('en-US')}</td>
        <td>${e.note ?? ''}</td>
      </tr>`
    )
    .join('');

  return `
    <html>
      <head>
        <meta charset="utf-8" />
        <style>
          body { font-family: sans-serif; padding: 24px; color: #1A2421; }
          h1 { font-size: 20px; margin-bottom: 4px; }
          .subtitle { color: #6B7876; font-size: 12px; margin-bottom: 20px; }
          table { width: 100%; border-collapse: collapse; font-size: 12px; }
          th, td { border-bottom: 1px solid #E4E9E7; padding: 8px; text-align: left; }
          th { background: #F5F7F6; }
          .summary { display: flex; gap: 24px; margin-bottom: 20px; }
          .summary div { font-size: 13px; }
          .summary b { display: block; font-size: 16px; }
        </style>
      </head>
      <body>
        <h1>দোকান হিসাব — ${shopName}</h1>
        <div class="subtitle">রিপোর্ট তৈরি: ${formatDisplayDate(new Date().toISOString().slice(0, 10), 'bn')}</div>
        <div class="summary">
          <div>মোট আয়<b style="color:#16A34A">৳${income.toLocaleString('en-US')}</b></div>
          <div>মোট ব্যয়<b style="color:#DC2626">৳${expense.toLocaleString('en-US')}</b></div>
          <div>নিট<b>৳${(income - expense).toLocaleString('en-US')}</b></div>
        </div>
        <table>
          <thead>
            <tr><th>তারিখ</th><th>ধরন</th><th>ক্যাটাগরি</th><th>পরিমাণ</th><th>নোট</th></tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </body>
    </html>
  `;
}
