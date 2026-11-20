"use client";

import { create } from "zustand";
import type { Product } from "@/lib/types";

interface UIState {
  cartOpen: boolean;
  checkoutOpen: boolean;
  selectedProduct: Product | null;
  selectedCategory: string;
  /** True while the CMS draft in the Content tab has unsaved changes. */
  cmsDirty: boolean;
  setCartOpen: (open: boolean) => void;
  setCheckoutOpen: (open: boolean) => void;
  setSelectedProduct: (product: Product | null) => void;
  setSelectedCategory: (category: string) => void;
  setCmsDirty: (dirty: boolean) => void;
}

export const useUI = create<UIState>((set) => ({
  cartOpen: false,
  checkoutOpen: false,
  selectedProduct: null,
  selectedCategory: "all",
  cmsDirty: false,
  setCartOpen: (open) => set({ cartOpen: open }),
  setCheckoutOpen: (open) => set({ checkoutOpen: open }),
  setSelectedProduct: (product) => set({ selectedProduct: product }),
  setSelectedCategory: (category) => set({ selectedCategory: category }),
  setCmsDirty: (dirty) => set({ cmsDirty: dirty }),
}));
