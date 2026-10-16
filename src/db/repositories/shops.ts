import { getDb } from '../connection';
import { seedShopDefaults } from '../schema';
import type { Shop } from '@/types/models';

export async function listShops(): Promise<Shop[]> {
  const db = await getDb();
  return db.getAllAsync<Shop>('SELECT * FROM shops ORDER BY created_at ASC');
}

export async function getShop(id: number): Promise<Shop | null> {
  const db = await getDb();
  const row = await db.getFirstAsync<Shop>('SELECT * FROM shops WHERE id = ?', [id]);
  return row ?? null;
}

export async function createShop(name: string, type: string | null, icon: string | null): Promise<Shop> {
  const db = await getDb();
  const now = new Date().toISOString();
  const result = await db.runAsync(
    'INSERT INTO shops (name, type, icon, created_at) VALUES (?, ?, ?, ?)',
    [name, type, icon, now]
  );
  const shopId = result.lastInsertRowId;
  await seedShopDefaults(shopId);
  const shop = await getShop(shopId);
  if (!shop) throw new Error('দোকান তৈরি করা যায়নি');
  return shop;
}

export async function updateShop(id: number, name: string, type: string | null, icon: string | null): Promise<void> {
  const db = await getDb();
  await db.runAsync('UPDATE shops SET name = ?, type = ?, icon = ? WHERE id = ?', [name, type, icon, id]);
}

export async function deleteShop(id: number): Promise<void> {
  const db = await getDb();
  await db.runAsync('DELETE FROM shops WHERE id = ?', [id]);
}
