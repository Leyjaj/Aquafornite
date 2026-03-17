import { create } from 'zustand'
import { showToast } from "nextjs-toast-notify";

import Skin, { SkinWithDiscount } from "@/interfaces/skin.interface";

interface SkinItem extends SkinWithDiscount {
  quantity: number;
  customPrice?: number; // 🔥 precio real
  currency?: string;    // 🔥 moneda
}

interface SkinStore {
  items: SkinItem[],
  addItem: (data: SkinItem) => void,
  removeItem: (id: string) => void,
  removeAll: () => void,
}

export const useSkinCart = create<SkinStore>((set, get) => ({
  items: [],

  addItem: (data: SkinItem) => {

    const currentItems = get().items;

    const existingItem = currentItems.find(
      (item) => item.devName === data.devName
    );

    if (existingItem) {
      return showToast.error("¡Producto ya está en el carrito!", {
        duration: 3000,
        position: "top-right",
      });
    }

    // 🔥 FORZAMOS EL PRECIO CORRECTO
    const itemFixed: SkinItem = {
      ...data,
      price: data.customPrice ?? data.price, // ← clave
      customPrice: data.customPrice ?? data.price,
      quantity: 1,
    };

    set({
      items: [...currentItems, itemFixed],
    });

    showToast.success("Producto agregado 😘", {
      duration: 2500,
      position: "top-right",
    });
  },

  removeItem: (id: string) => {
    set({
      items: get().items.filter(item => item.devName !== id),
    });
  },

  removeAll: () => set({ items: [] }),
}));