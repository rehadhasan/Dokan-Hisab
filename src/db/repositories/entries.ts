import { getDb } from '../connection';
import type { Entry, EntryType, EntryWithCategory } from '@/types/models';

export interface EntryFilters {
  dateFrom?: string;
  dateTo?: string;
  type?: EntryType;
  categoryId?: number;
  search?: string;
}

function buildWhere(shopId: number, filters: EntryFilters): { clause: string; params: any[] } {
  const clauses = ['e.shop_id = ?'];
  const params: any[] = [shopId];

  if (filters.dateFrom) {
    clauses.push('e.entry_date >= ?');
    params.push(filters.dateFrom);
  }
  if (filters.dateTo) {
    clauses.push('e.entry_date <= ?');
    params.push(filters.dateTo);
  }
  if (filters.type) {
    clauses.push('e.type = ?');
    params.push(filters.type);
  }
  if (filters.categoryId) {
    clauses.push('e.category_id = ?');
    params.push(filters.categoryId);
  }
  if (filters.search) {
    clauses.push('(e.note LIKE ? OR c.name LIKE ?)');
    const like = `%${filters.search}%`;
    params.push(like, like);
  }

  return { clause: clauses.join(' AND '), params };
}

export async function listEntries(shopId: number, filters: EntryFilters = {}): Promise<EntryWithCategory[]> {
  const db = await getDb();
  const { clause, params } = buildWhere(shopId, filters);
  return db.getAllAsync<EntryWithCategory>(
    `SELECT e.*, c.name as category_name, c.icon as category_icon
     FROM entries e
     LEFT JOIN categories c ON c.id = e.category_id
     WHERE ${clause}
     ORDER BY e.entry_date DESC, e.id DESC`,
    params
  );
}

export async function getRecentEntries(shopId: number, limit: number): Promise<EntryWithCategory[]> {
  const db = await getDb();
  return db.getAllAsync<EntryWithCategory>(
    `SELECT e.*, c.name as category_name, c.icon as category_icon
     FROM entries e
     LEFT JOIN categories c ON c.id = e.category_id
     WHERE e.shop_id = ?
     ORDER BY e.entry_date DESC, e.id DESC
     LIMIT ?`,
    [shopId, limit]
  );
}

export async function getEntry(id: number): Promise<Entry | null> {
  const db = await getDb();
  const row = await db.getFirstAsync<Entry>('SELECT * FROM entries WHERE id = ?', [id]);
  return row ?? null;
}

export async function createEntry(entry: {
  shopId: number;
  type: EntryType;
  amount: number;
  categoryId: number | null;
  entryDate: string;
  note: string | null;
}): Promise<Entry> {
  const db = await getDb();
  const now = new Date().toISOString();
  const result = await db.runAsync(
    `INSERT INTO entries (shop_id, type, amount, category_id, entry_date, note, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [entry.shopId, entry.type, entry.amount, entry.categoryId, entry.entryDate, entry.note, now]
  );
  const row = await getEntry(result.lastInsertRowId);
  if (!row) throw new Error('এন্ট্রি তৈরি করা যায়নি');
  return row;
}

export async function updateEntry(
  id: number,
  entry: { type: EntryType; amount: number; categoryId: number | null; entryDate: string; note: string | null }
): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    `UPDATE entries SET type = ?, amount = ?, category_id = ?, entry_date = ?, note = ? WHERE id = ?`,
    [entry.type, entry.amount, entry.categoryId, entry.entryDate, entry.note, id]
  );
}

export async function deleteEntry(id: number): Promise<void> {
  const db = await getDb();
  await db.runAsync('DELETE FROM entries WHERE id = ?', [id]);
}

export interface Summary {
  income: number;
  expense: number;
}

export async function getSummary(shopId: number, dateFrom: string, dateTo: string): Promise<Summary> {
  const db = await getDb();
  const rows = await db.getAllAsync<{ type: EntryType; total: number }>(
    `SELECT type, COALESCE(SUM(amount), 0) as total FROM entries
     WHERE shop_id = ? AND entry_date >= ? AND entry_date <= ?
     GROUP BY type`,
    [shopId, dateFrom, dateTo]
  );
  const summary: Summary = { income: 0, expense: 0 };
  for (const row of rows) {
    summary[row.type] = row.total;
  }
  return summary;
}

export interface CategoryBreakdownRow {
  category_id: number | null;
  category_name: string | null;
  category_icon: string | null;
  total: number;
}

export async function getCategoryBreakdown(
  shopId: number,
  dateFrom: string,
  dateTo: string,
  type: EntryType
): Promise<CategoryBreakdownRow[]> {
  const db = await getDb();
  return db.getAllAsync<CategoryBreakdownRow>(
    `SELECT e.category_id, c.name as category_name, c.icon as category_icon, COALESCE(SUM(e.amount), 0) as total
     FROM entries e
     LEFT JOIN categories c ON c.id = e.category_id
     WHERE e.shop_id = ? AND e.type = ? AND e.entry_date >= ? AND e.entry_date <= ?
     GROUP BY e.category_id
     ORDER BY total DESC`,
    [shopId, type, dateFrom, dateTo]
  );
}

export interface DailyTotalRow {
  day: string;
  income: number;
  expense: number;
}

export interface MonthlyTotalRow {
  month: string;
  income: number;
  expense: number;
}

export async function getMonthlyTotals(shopId: number, year: number): Promise<MonthlyTotalRow[]> {
  const db = await getDb();
  const from = `${year}-01-01`;
  const to = `${year}-12-31`;
  const rows = await db.getAllAsync<{ month: string; type: EntryType; total: number }>(
    `SELECT substr(entry_date, 1, 7) as month, type, COALESCE(SUM(amount), 0) as total
     FROM entries
     WHERE shop_id = ? AND entry_date >= ? AND entry_date <= ?
     GROUP BY month, type
     ORDER BY month ASC`,
    [shopId, from, to]
  );
  const map = new Map<string, MonthlyTotalRow>();
  for (const row of rows) {
    const existing = map.get(row.month) ?? { month: row.month, income: 0, expense: 0 };
    existing[row.type] = row.total;
    map.set(row.month, existing);
  }
  const result: MonthlyTotalRow[] = [];
  for (let m = 1; m <= 12; m++) {
    const key = `${year}-${String(m).padStart(2, '0')}`;
    result.push(map.get(key) ?? { month: key, income: 0, expense: 0 });
  }
  return result;
}

export async function getDailyTotals(shopId: number, dateFrom: string, dateTo: string): Promise<DailyTotalRow[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<{ day: string; type: EntryType; total: number }>(
    `SELECT entry_date as day, type, COALESCE(SUM(amount), 0) as total
     FROM entries
     WHERE shop_id = ? AND entry_date >= ? AND entry_date <= ?
     GROUP BY entry_date, type
     ORDER BY entry_date ASC`,
    [shopId, dateFrom, dateTo]
  );
  const map = new Map<string, DailyTotalRow>();
  for (const row of rows) {
    const existing = map.get(row.day) ?? { day: row.day, income: 0, expense: 0 };
    existing[row.type] = row.total;
    map.set(row.day, existing);
  }

  const result: DailyTotalRow[] = [];
  const cursor = new Date(`${dateFrom}T00:00:00`);
  const end = new Date(`${dateTo}T00:00:00`);
  while (cursor <= end) {
    const y = cursor.getFullYear();
    const m = String(cursor.getMonth() + 1).padStart(2, '0');
    const d = String(cursor.getDate()).padStart(2, '0');
    const key = `${y}-${m}-${d}`;
    result.push(map.get(key) ?? { day: key, income: 0, expense: 0 });
    cursor.setDate(cursor.getDate() + 1);
  }
  return result;
}
