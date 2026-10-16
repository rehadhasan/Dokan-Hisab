import { create } from 'zustand';
import * as entriesRepo from '@/db/repositories/entries';
import type { EntryType } from '@/types/models';

interface EntryState {
  refreshToken: number;
  bump: () => void;
  addEntry: (input: {
    shopId: number;
    type: EntryType;
    amount: number;
    categoryId: number | null;
    entryDate: string;
    note: string | null;
  }) => Promise<void>;
  editEntry: (
    id: number,
    input: { type: EntryType; amount: number; categoryId: number | null; entryDate: string; note: string | null }
  ) => Promise<void>;
  removeEntry: (id: number) => Promise<void>;
}

export const useEntryStore = create<EntryState>((set, get) => ({
  refreshToken: 0,

  bump: () => set((state) => ({ refreshToken: state.refreshToken + 1 })),

  addEntry: async (input) => {
    await entriesRepo.createEntry({
      shopId: input.shopId,
      type: input.type,
      amount: input.amount,
      categoryId: input.categoryId,
      entryDate: input.entryDate,
      note: input.note,
    });
    get().bump();
  },

  editEntry: async (id, input) => {
    await entriesRepo.updateEntry(id, input);
    get().bump();
  },

  removeEntry: async (id) => {
    await entriesRepo.deleteEntry(id);
    get().bump();
  },
}));
