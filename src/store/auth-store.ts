"use client";

import { create } from "zustand";
import type { User } from "@supabase/supabase-js";

export type AccountUser = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
};

type AuthState = {
  // « loading » tant que la session Supabase n'a pas encore été lue.
  status: "loading" | "authenticated" | "anonymous";
  user: AccountUser | null;
};

// Alimenté par <AuthListener /> à partir de la session Supabase.
export const useAuthStore = create<AuthState>()(() => ({
  status: "loading",
  user: null,
}));

export function toAccountUser(user: User): AccountUser {
  return {
    id: user.id,
    email: user.email ?? "",
    firstName: user.user_metadata?.first_name ?? "",
    lastName: user.user_metadata?.last_name ?? "",
  };
}
