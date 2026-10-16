import { create } from 'zustand';
import * as categoriesRepo from '@/db/repositories/categories';
import type { Category, EntryType } from '@/types/models';

interface CategoryState {
  categoriesByShop: Record<number, Category[]>;
  reset: () => void;
  loadCategories: (shopId: number) => Promise<void>;
  getCategories: (shopId: number, type?: EntryType) => Category[];
  addCategory: (shopId: number, name: string, type: EntryType, icon: string | null) => Promise<Category>;
  editCategory: (shopId: number, id: number, name: string, icon: string | null) => Promise<void>;
  removeCategory: (shopId: number, id: number) => Promise<void>;
}

export const useCategoryStore = create<CategoryState>((set, get) => ({
  categoriesByShop: {},

  reset: () => set({ categoriesByShop: {} }),

  loadCategories: async (shopId) => {
    const categories = await categoriesRepo.listCategories(shopId);
    set((state) => ({ categoriesByShop: { ...state.categoriesByShop, [shopId]: categories } }));
  },

  getCategories: (shopId, type) => {
    const all = get().categoriesByShop[shopId] ?? [];
    return type ? all.filter((c) => c.type === type) : all;
  },

  addCategory: async (shopId, name, type, icon) => {
    const category = await categoriesRepo.createCategory(shopId, name, type, icon);
    await get().loadCategories(shopId);
    return category;
  },

  editCategory: async (shopId, id, name, icon) => {
    await categoriesRepo.updateCategory(id, name, icon);
    await get().loadCategories(shopId);
  },

  removeCategory: async (shopId, id) => {
    await categoriesRepo.deleteCategory(id);
    await get().loadCategories(shopId);
  },
}));
