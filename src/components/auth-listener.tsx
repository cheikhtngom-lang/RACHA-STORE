"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { toAccountUser, useAuthStore } from "@/store/auth-store";
import { useWishlistStore } from "@/store/wishlist-store";
import { mergeWishlistWithAccount } from "@/lib/wishlist-sync";

// Tient useAuthStore à jour : ouverture du site, connexion, déconnexion,
// modification du compte, y compris depuis un autre onglet.
export function AuthListener() {
  useEffect(() => {
    const supabase = createClient();

    async function loadProfile(userId: string) {
      const { data } = await supabase.from("profiles").select("first_name, last_name").eq("id", userId).maybeSingle();
      if (!data) return;
      useAuthStore.setState((state) =>
        state.user?.id === userId
          ? { user: { ...state.user, firstName: data.first_name || state.user.firstName, lastName: data.last_name || state.user.lastName } }
          : state
      );
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session?.user) {
        useAuthStore.setState({ status: "anonymous", user: null });
        // Les favoris du compte ne doivent pas rester visibles après la déconnexion.
        if (event === "SIGNED_OUT") useWishlistStore.setState({ ids: [] });
        return;
      }
      if (event === "TOKEN_REFRESHED") return;
      const user = session.user;
      useAuthStore.setState({ status: "authenticated", user: toAccountUser(user) });
      // Supabase déconseille d'attendre un autre appel dans ce callback : on le diffère.
      setTimeout(() => {
        loadProfile(user.id);
        if (event === "SIGNED_IN" || event === "INITIAL_SESSION") mergeWishlistWithAccount(user.id);
      }, 0);
    });

    return () => subscription.unsubscribe();
  }, []);

  return null;
}
