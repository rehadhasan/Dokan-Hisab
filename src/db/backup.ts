import { getDb } from './connection';

export const BACKUP_VERSION = 1;

export interface BackupData {
  version: number;
  exportedAt: string;
  shops: any[];
  categories: any[];
  entries: any[];
  credits: any[];
  creditPayments: any[];
  settings: any[];
}

export async function exportAllData(): Promise<BackupData> {
  const db = await getDb();
  const [shops, categories, entries, credits, creditPayments, settings] = await Promise.all([
    db.getAllAsync('SELECT * FROM shops'),
    db.getAllAsync('SELECT * FROM categories'),
    db.getAllAsync('SELECT * FROM entries'),
    db.getAllAsync('SELECT * FROM credits'),
    db.getAllAsync('SELECT * FROM credit_payments'),
    db.getAllAsync('SELECT * FROM settings'),
  ]);
  return {
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    shops,
    categories,
    entries,
    credits,
    creditPayments,
    settings,
  };
}

function insertRows(db: Awaited<ReturnType<typeof getDb>>, table: string, rows: any[]) {
  return rows.reduce(async (prevPromise, row) => {
    await prevPromise;
    const columns = Object.keys(row);
    const placeholders = columns.map(() => '?').join(', ');
    const values = columns.map((c) => row[c]);
    await db.runAsync(`INSERT INTO ${table} (${columns.join(', ')}) VALUES (${placeholders})`, values);
  }, Promise.resolve());
}

export async function restoreAllData(data: BackupData): Promise<void> {
  const db = await getDb();
  await db.execAsync('PRAGMA foreign_keys = OFF;');
  await db.withTransactionAsync(async () => {
    await db.execAsync(`
      DELETE FROM credit_payments;
      DELETE FROM credits;
      DELETE FROM entries;
      DELETE FROM categories;
      DELETE FROM shops;
      DELETE FROM settings;
    `);
    await insertRows(db, 'shops', data.shops ?? []);
    await insertRows(db, 'categories', data.categories ?? []);
    await insertRows(db, 'entries', data.entries ?? []);
    await insertRows(db, 'credits', data.credits ?? []);
    await insertRows(db, 'credit_payments', data.creditPayments ?? []);
    await insertRows(db, 'settings', data.settings ?? []);
  });
  await db.execAsync('PRAGMA foreign_keys = ON;');
}
