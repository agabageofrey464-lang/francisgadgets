"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  productId: number;
  name: string;
  slug: string;
  price: number;
  image: string | null;
  quantity: number;
  stockQuantity: number;
}

interface CartState {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  removeItem: (productId: number) => void;
  setQuantity: (productId: number, quantity: number) => void;
  clear: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item, quantity = 1) => {
        const items = get().items;
        const existing = items.find((i) => i.productId === item.productId);
        if (existing) {
          const nextQty = Math.min(existing.quantity + quantity, existing.stockQuantity);
          set({
            items: items.map((i) => (i.productId === item.productId ? { ...i, quantity: nextQty } : i)),
          });
        } else {
          set({ items: [...items, { ...item, quantity: Math.min(quantity, item.stockQuantity) }] });
        }
      },
      removeItem: (productId) => set({ items: get().items.filter((i) => i.productId !== productId) }),
      setQuantity: (productId, quantity) =>
        set({
          items: get()
            .items.map((i) =>
              i.productId === productId ? { ...i, quantity: Math.max(1, Math.min(quantity, i.stockQuantity)) } : i
            ),
        }),
      clear: () => set({ items: [] }),
    }),
    { name: "fgt-cart" }
  )
);

export function cartCount(items: CartItem[]): number {
  return items.reduce((sum, i) => sum + i.quantity, 0);
}

export function cartSubtotal(items: CartItem[]): number {
  return items.reduce((sum, i) => sum + i.price * i.quantity, 0);
}
