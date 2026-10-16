import { getDb } from '../connection';
import type { Credit, CreditDirection, CreditPayment, CreditWithPaid } from '@/types/models';

export async function listCredits(shopId: number, direction: CreditDirection): Promise<CreditWithPaid[]> {
  const db = await getDb();
  return db.getAllAsync<CreditWithPaid>(
    `SELECT cr.*, COALESCE((SELECT SUM(amount) FROM credit_payments WHERE credit_id = cr.id), 0) as paid_amount,
            cr.amount - COALESCE((SELECT SUM(amount) FROM credit_payments WHERE credit_id = cr.id), 0) as remaining
     FROM credits cr
     WHERE cr.shop_id = ? AND cr.direction = ?
     ORDER BY cr.status ASC, cr.credit_date DESC, cr.id DESC`,
    [shopId, direction]
  );
}

export async function getCredit(id: number): Promise<CreditWithPaid | null> {
  const db = await getDb();
  const row = await db.getFirstAsync<CreditWithPaid>(
    `SELECT cr.*, COALESCE((SELECT SUM(amount) FROM credit_payments WHERE credit_id = cr.id), 0) as paid_amount,
            cr.amount - COALESCE((SELECT SUM(amount) FROM credit_payments WHERE credit_id = cr.id), 0) as remaining
     FROM credits cr WHERE cr.id = ?`,
    [id]
  );
  return row ?? null;
}

export async function createCredit(input: {
  shopId: number;
  direction: CreditDirection;
  personName: string;
  amount: number;
  creditDate: string;
  note: string | null;
}): Promise<Credit> {
  const db = await getDb();
  const now = new Date().toISOString();
  const result = await db.runAsync(
    `INSERT INTO credits (shop_id, direction, person_name, amount, credit_date, note, status, created_at)
     VALUES (?, ?, ?, ?, ?, ?, 'due', ?)`,
    [input.shopId, input.direction, input.personName, input.amount, input.creditDate, input.note, now]
  );
  const row = await db.getFirstAsync<Credit>('SELECT * FROM credits WHERE id = ?', [result.lastInsertRowId]);
  if (!row) throw new Error('বাকি এন্ট্রি তৈরি করা যায়নি');
  return row;
}

export async function updateCredit(
  id: number,
  input: { personName: string; amount: number; creditDate: string; note: string | null }
): Promise<void> {
  const db = await getDb();
  await db.runAsync('UPDATE credits SET person_name = ?, amount = ?, credit_date = ?, note = ? WHERE id = ?', [
    input.personName,
    input.amount,
    input.creditDate,
    input.note,
    id,
  ]);
}

export async function deleteCredit(id: number): Promise<void> {
  const db = await getDb();
  await db.runAsync('DELETE FROM credits WHERE id = ?', [id]);
}

export async function listPayments(creditId: number): Promise<CreditPayment[]> {
  const db = await getDb();
  return db.getAllAsync<CreditPayment>(
    'SELECT * FROM credit_payments WHERE credit_id = ? ORDER BY payment_date ASC, id ASC',
    [creditId]
  );
}

async function refreshCreditStatus(creditId: number): Promise<void> {
  const db = await getDb();
  const credit = await getCredit(creditId);
  if (!credit) return;
  const status = credit.remaining <= 0 ? 'paid' : 'due';
  if (status !== credit.status) {
    await db.runAsync('UPDATE credits SET status = ? WHERE id = ?', [status, creditId]);
  }
}

export async function addPayment(input: {
  creditId: number;
  amount: number;
  paymentDate: string;
  note: string | null;
}): Promise<void> {
  const db = await getDb();
  const now = new Date().toISOString();
  await db.runAsync(
    'INSERT INTO credit_payments (credit_id, amount, payment_date, note, created_at) VALUES (?, ?, ?, ?, ?)',
    [input.creditId, input.amount, input.paymentDate, input.note, now]
  );
  await refreshCreditStatus(input.creditId);
}

export async function deletePayment(id: number, creditId: number): Promise<void> {
  const db = await getDb();
  await db.runAsync('DELETE FROM credit_payments WHERE id = ?', [id]);
  await refreshCreditStatus(creditId);
}

export interface CreditTotals {
  totalGiven: number;
  totalTaken: number;
}

export async function getCreditTotals(shopId: number): Promise<CreditTotals> {
  const db = await getDb();
  const rows = await db.getAllAsync<{ direction: CreditDirection; remaining: number }>(
    `SELECT cr.direction,
            SUM(cr.amount - COALESCE((SELECT SUM(cp.amount) FROM credit_payments cp WHERE cp.credit_id = cr.id), 0)) as remaining
     FROM credits cr
     WHERE cr.shop_id = ? AND cr.status = 'due'
     GROUP BY cr.direction`,
    [shopId]
  );
  const totals: CreditTotals = { totalGiven: 0, totalTaken: 0 };
  for (const row of rows) {
    if (row.direction === 'given') totals.totalGiven = row.remaining;
    else totals.totalTaken = row.remaining;
  }
  return totals;
}
