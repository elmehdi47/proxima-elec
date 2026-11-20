"use client";

import { useSyncExternalStore } from "react";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartLine } from "@/lib/types";

interface CartState {
  items: CartLine[];
  add: (line: Omit<CartLine, "quantity">, qty?: number) => void;
  setQty: (productId: string, qty: number) => void;
  remove: (productId: string) => void;
  clear: () => void;
}

const EMPTY_ITEMS: CartLine[] = [];

/** Max purchasable units for a line: its stock snapshot (when known), capped at 99. */
function lineCap(line: Pick<CartLine, "stock">): number {
  return line.stock && line.stock > 0 ? Math.min(line.stock, 99) : 99;
}

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      add: (line, qty = 1) =>
        set((state) => {
          const cap = lineCap(line);
          const existing = state.items.find((i) => i.productId === line.productId);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.productId === line.productId
                  ? // refresh the stock snapshot + clamp (auto-corrects stale carts)
                    { ...i, stock: line.stock, quantity: Math.min(i.quantity + qty, cap) }
                  : i
              ),
            };
          }
          return { items: [...state.items, { ...line, quantity: Math.min(qty, cap) }] };
        }),
      setQty: (productId, qty) =>
        set((state) => ({
          items:
            qty <= 0
              ? state.items.filter((i) => i.productId !== productId)
              : state.items.map((i) =>
                  i.productId === productId
                    ? { ...i, quantity: Math.min(qty, lineCap(i)) }
                    : i
                ),
        })),
      remove: (productId) =>
        set((state) => ({ items: state.items.filter((i) => i.productId !== productId) })),
      clear: () => set({ items: [] }),
    }),
    {
      name: "proxima-cart",
      version: 1,
      // normalize older persisted carts (no `stock` field) into the new shape
      migrate: (persisted) => {
        const state = persisted as { items?: CartLine[] } | undefined;
        return { items: Array.isArray(state?.items) ? state.items : [] };
      },
    }
  )
);

export function cartCount(items: CartLine[]): number {
  return items.reduce((acc, i) => acc + i.quantity, 0);
}

export function cartSubtotal(items: CartLine[]): number {
  return items.reduce((acc, i) => acc + i.price * i.quantity, 0);
}

/** Hydration-safe cart items (renders empty on server, real data after hydration) */
export function useCartItems(): CartLine[] {
  return useSyncExternalStore(
    useCart.subscribe,
    () => useCart.getState().items,
    () => EMPTY_ITEMS
  );
}

/** Hydration-safe cart item count */
export function useCartCount(): number {
  return useSyncExternalStore(
    useCart.subscribe,
    () => cartCount(useCart.getState().items),
    () => 0
  );
}
