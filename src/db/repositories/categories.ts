import { getDb } from '../connection';
import type { Category, EntryType } from '@/types/models';

export async function listCategories(shopId: number, type?: EntryType): Promise<Category[]> {
  const db = await getDb();
  if (type) {
    return db.getAllAsync<Category>(
      'SELECT * FROM categories WHERE shop_id = ? AND type = ? ORDER BY id ASC',
      [shopId, type]
    );
  }
  return db.getAllAsync<Category>('SELECT * FROM categories WHERE shop_id = ? ORDER BY id ASC', [shopId]);
}

export async function createCategory(
  shopId: number,
  name: string,
  type: EntryType,
  icon: string | null
): Promise<Category> {
  const db = await getDb();
  const now = new Date().toISOString();
  const result = await db.runAsync(
    'INSERT INTO categories (shop_id, name, type, icon, is_default, created_at) VALUES (?, ?, ?, ?, 0, ?)',
    [shopId, name, type, icon, now]
  );
  const row = await db.getFirstAsync<Category>('SELECT * FROM categories WHERE id = ?', [result.lastInsertRowId]);
  if (!row) throw new Error('ক্যাটাগরি তৈরি করা যায়নি');
  return row;
}

export async function updateCategory(id: number, name: string, icon: string | null): Promise<void> {
  const db = await getDb();
  await db.runAsync('UPDATE categories SET name = ?, icon = ? WHERE id = ?', [name, icon, id]);
}

export async function deleteCategory(id: number): Promise<void> {
  const db = await getDb();
  await db.runAsync('DELETE FROM categories WHERE id = ?', [id]);
}
