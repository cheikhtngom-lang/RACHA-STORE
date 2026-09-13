"use client";

import { create } from "zustand";

type UiState = {
  isCartOpen: boolean;
  isSearchOpen: boolean;
  isMobileNavOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  openSearch: () => void;
  closeSearch: () => void;
  openMobileNav: () => void;
  closeMobileNav: () => void;
};

export const useUiStore = create<UiState>()((set) => ({
  isCartOpen: false,
  isSearchOpen: false,
  isMobileNavOpen: false,
  openCart: () => set({ isCartOpen: true, isSearchOpen: false }),
  closeCart: () => set({ isCartOpen: false }),
  toggleCart: () => set((s) => ({ isCartOpen: !s.isCartOpen, isSearchOpen: false })),
  openSearch: () => set({ isSearchOpen: true, isCartOpen: false }),
  closeSearch: () => set({ isSearchOpen: false }),
  openMobileNav: () => set({ isMobileNavOpen: true }),
  closeMobileNav: () => set({ isMobileNavOpen: false }),
}));
