import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CartItem = {
  id: string;
  name: string;
  price_cents: number;
  image_url?: string | null;
  quantity: number;
};

type CartState = {
  items: CartItem[];
  add: (item: Omit<CartItem, "quantity">) => void;
  remove: (id: string) => void;
  setQty: (id: string, qty: number) => void;
  clear: () => void;
  totalCents: () => number;
  totalCount: () => number;
};

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      add: (item) =>
        set((s) => {
          const ex = s.items.find((i) => i.id === item.id);
          if (ex) return { items: s.items.map((i) => (i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i)) };
          return { items: [...s.items, { ...item, quantity: 1 }] };
        }),
      remove: (id) => set((s) => ({ items: s.items.filter((i) => i.id !== id) })),
      setQty: (id, qty) =>
        set((s) => ({
          items: qty <= 0 ? s.items.filter((i) => i.id !== id) : s.items.map((i) => (i.id === id ? { ...i, quantity: qty } : i)),
        })),
      clear: () => set({ items: [] }),
      totalCents: () => get().items.reduce((a, i) => a + i.price_cents * i.quantity, 0),
      totalCount: () => get().items.reduce((a, i) => a + i.quantity, 0),
    }),
    { name: "ours-cart" }
  )
);

export const formatPrice = (cents: number) => `$${(cents / 100).toFixed(2)}`;
