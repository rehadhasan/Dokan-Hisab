import { getDb } from './connection';

export const DEFAULT_INCOME_CATEGORIES: Array<{ name: string; icon: string }> = [
  { name: 'বিক্রয়', icon: 'cash' },
  { name: 'অন্যান্য আয়', icon: 'wallet' },
];

export const DEFAULT_EXPENSE_CATEGORIES: Array<{ name: string; icon: string }> = [
  { name: 'মাল ক্রয়', icon: 'cart' },
  { name: 'দোকান ভাড়া', icon: 'home' },
  { name: 'বিদ্যুৎ বিল', icon: 'flash' },
  { name: 'পরিবহন', icon: 'car' },
  { name: 'বেতন', icon: 'people' },
  { name: 'অন্যান্য', icon: 'ellipsis-horizontal' },
];

export async function seedDefaultCategories(shopId: number): Promise<void> {
  const db = await getDb();
  const now = new Date().toISOString();

  for (const cat of DEFAULT_INCOME_CATEGORIES) {
    await db.runAsync(
      `INSERT INTO categories (shop_id, name, type, icon, is_default, created_at) VALUES (?, ?, 'income', ?, 1, ?)`,
      [shopId, cat.name, cat.icon, now]
    );
  }
  for (const cat of DEFAULT_EXPENSE_CATEGORIES) {
    await db.runAsync(
      `INSERT INTO categories (shop_id, name, type, icon, is_default, created_at) VALUES (?, ?, 'expense', ?, 1, ?)`,
      [shopId, cat.name, cat.icon, now]
    );
  }
}
