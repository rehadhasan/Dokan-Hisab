import { create } from 'zustand';
import * as shopsRepo from '@/db/repositories/shops';
import type { Shop } from '@/types/models';

interface ShopState {
  shops: Shop[];
  isLoaded: boolean;
  loadShops: () => Promise<void>;
  addShop: (name: string, type: string | null, icon: string | null) => Promise<Shop>;
  editShop: (id: number, name: string, type: string | null, icon: string | null) => Promise<void>;
  removeShop: (id: number) => Promise<void>;
}

export const useShopStore = create<ShopState>((set, get) => ({
  shops: [],
  isLoaded: false,

  loadShops: async () => {
    const shops = await shopsRepo.listShops();
    set({ shops, isLoaded: true });
  },

  addShop: async (name, type, icon) => {
    const shop = await shopsRepo.createShop(name, type, icon);
    await get().loadShops();
    return shop;
  },

  editShop: async (id, name, type, icon) => {
    await shopsRepo.updateShop(id, name, type, icon);
    await get().loadShops();
  },

  removeShop: async (id) => {
    await shopsRepo.deleteShop(id);
    await get().loadShops();
  },
}));
