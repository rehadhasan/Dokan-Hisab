import { create } from 'zustand';
import * as creditsRepo from '@/db/repositories/credits';
import type { CreditDirection } from '@/types/models';

interface CreditState {
  refreshToken: number;
  bump: () => void;
  addCredit: (input: {
    shopId: number;
    direction: CreditDirection;
    personName: string;
    amount: number;
    creditDate: string;
    note: string | null;
  }) => Promise<void>;
  editCredit: (
    id: number,
    input: { personName: string; amount: number; creditDate: string; note: string | null }
  ) => Promise<void>;
  removeCredit: (id: number) => Promise<void>;
  addPayment: (input: { creditId: number; amount: number; paymentDate: string; note: string | null }) => Promise<void>;
  removePayment: (id: number, creditId: number) => Promise<void>;
}

export const useCreditStore = create<CreditState>((set, get) => ({
  refreshToken: 0,

  bump: () => set((state) => ({ refreshToken: state.refreshToken + 1 })),

  addCredit: async (input) => {
    await creditsRepo.createCredit(input);
    get().bump();
  },

  editCredit: async (id, input) => {
    await creditsRepo.updateCredit(id, input);
    get().bump();
  },

  removeCredit: async (id) => {
    await creditsRepo.deleteCredit(id);
    get().bump();
  },

  addPayment: async (input) => {
    await creditsRepo.addPayment(input);
    get().bump();
  },

  removePayment: async (id, creditId) => {
    await creditsRepo.deletePayment(id, creditId);
    get().bump();
  },
}));
