"use client";

import { create } from "zustand";

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  imageUrl?: string;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;

  addItem: (product: Omit<CartItem, "quantity">) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;

  totalItems: () => number;
  subtotal: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  isOpen: false,

  addItem: (product) =>
    set((s) => {
      const existing = s.items.find((i) => i.productId === product.productId);
      if (existing) {
        return {
          items: s.items.map((i) =>
            i.productId === product.productId ? { ...i, quantity: i.quantity + 1 } : i,
          ),
        };
      }
      return { items: [...s.items, { ...product, quantity: 1 }] };
    }),

  removeItem: (productId) =>
    set((s) => ({ items: s.items.filter((i) => i.productId !== productId) })),

  updateQuantity: (productId, quantity) =>
    set((s) => {
      if (quantity <= 0) return { items: s.items.filter((i) => i.productId !== productId) };
      return {
        items: s.items.map((i) => (i.productId === productId ? { ...i, quantity } : i)),
      };
    }),

  clearCart: () => set({ items: [] }),
  openCart: () => set({ isOpen: true }),
  closeCart: () => set({ isOpen: false }),

  totalItems: () => get().items.reduce((s, i) => s + i.quantity, 0),
  subtotal: () => get().items.reduce((s, i) => s + i.price * i.quantity, 0),
}));
