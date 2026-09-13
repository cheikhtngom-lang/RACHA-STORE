"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

/**
 * Client-only demo session so the account UI (dashboard, orders, addresses)
 * can be fully previewed before real authentication is wired to Supabase.
 */
type AuthState = {
  isAuthenticated: boolean;
  user: { firstName: string; lastName: string; email: string } | null;
  hasHydrated: boolean;
  signIn: (user: { firstName: string; lastName: string; email: string }) => void;
  signOut: () => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      user: null,
      hasHydrated: false,
      signIn: (user) => set({ isAuthenticated: true, user }),
      signOut: () => set({ isAuthenticated: false, user: null }),
    }),
    {
      name: "racha-store-demo-auth",
      skipHydration: true,
      onRehydrateStorage: () => () => {
        useAuthStore.setState({ hasHydrated: true });
      },
    }
  )
);
