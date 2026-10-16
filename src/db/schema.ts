import { getDb } from './connection';
import { seedDefaultCategories } from './seed';

const SCHEMA_SQL = `
PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS shops (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  type TEXT,
  icon TEXT,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  shop_id INTEGER NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK(type IN ('income','expense')),
  icon TEXT,
  is_default INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS entries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  shop_id INTEGER NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK(type IN ('income','expense')),
  amount REAL NOT NULL,
  category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
  entry_date TEXT NOT NULL,
  note TEXT,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS credits (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  shop_id INTEGER NOT NULL REFERENCES shops(id) ON DELETE CASCADE,
  direction TEXT NOT NULL CHECK(direction IN ('given','taken')),
  person_name TEXT NOT NULL,
  amount REAL NOT NULL,
  credit_date TEXT NOT NULL,
  note TEXT,
  status TEXT NOT NULL DEFAULT 'due' CHECK(status IN ('due','paid')),
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS credit_payments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  credit_id INTEGER NOT NULL REFERENCES credits(id) ON DELETE CASCADE,
  amount REAL NOT NULL,
  payment_date TEXT NOT NULL,
  note TEXT,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT
);

CREATE INDEX IF NOT EXISTS idx_entries_shop_date ON entries(shop_id, entry_date);
CREATE INDEX IF NOT EXISTS idx_categories_shop ON categories(shop_id, type);
CREATE INDEX IF NOT EXISTS idx_credits_shop ON credits(shop_id, direction);
CREATE INDEX IF NOT EXISTS idx_credit_payments_credit ON credit_payments(credit_id);
`;

let initPromise: Promise<void> | null = null;

export function initDatabase(): Promise<void> {
  if (!initPromise) {
    initPromise = (async () => {
      const db = await getDb();
      await db.execAsync(SCHEMA_SQL);
    })();
  }
  return initPromise;
}

export async function seedShopDefaults(shopId: number): Promise<void> {
  await seedDefaultCategories(shopId);
}
