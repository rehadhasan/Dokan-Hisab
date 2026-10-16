export type EntryType = 'income' | 'expense';
export type CreditDirection = 'given' | 'taken';
export type CreditStatus = 'due' | 'paid';

export interface Shop {
  id: number;
  name: string;
  type: string | null;
  icon: string | null;
  created_at: string;
}

export interface Category {
  id: number;
  shop_id: number;
  name: string;
  type: EntryType;
  icon: string | null;
  is_default: number;
  created_at: string;
}

export interface Entry {
  id: number;
  shop_id: number;
  type: EntryType;
  amount: number;
  category_id: number | null;
  entry_date: string;
  note: string | null;
  created_at: string;
}

export interface EntryWithCategory extends Entry {
  category_name: string | null;
  category_icon: string | null;
}

export interface Credit {
  id: number;
  shop_id: number;
  direction: CreditDirection;
  person_name: string;
  amount: number;
  credit_date: string;
  note: string | null;
  status: CreditStatus;
  created_at: string;
}

export interface CreditPayment {
  id: number;
  credit_id: number;
  amount: number;
  payment_date: string;
  note: string | null;
  created_at: string;
}

export interface CreditWithPaid extends Credit {
  paid_amount: number;
  remaining: number;
}

export type ThemeMode = 'light' | 'dark';
export type DigitFormat = 'bn' | 'en';

export interface AppSettings {
  theme: ThemeMode;
  digitFormat: DigitFormat;
  activeShopId: number | null;
  onboardingSeen: boolean;
}
