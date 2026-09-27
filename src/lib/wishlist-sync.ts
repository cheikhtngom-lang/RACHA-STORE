import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/store/auth-store";
import { useWishlistStore } from "@/store/wishlist-store";

// Les favoris restent dans le navigateur pour un visiteur. Une fois connecté,
// ils sont aussi enregistrés dans son compte (table wishlist_items).

// À la connexion : réunit les favoris de ce navigateur et ceux du compte.
export async function mergeWishlistWithAccount(userId: string) {
  await useWishlistStore.persist.rehydrate();
  const supabase = createClient();
  const { data, error } = await supabase.from("wishlist_items").select("product_id");
  if (error) return;

  const remote = data.map((row) => row.product_id as string);
  const local = useWishlistStore.getState().ids;
  // Un par un : un produit retiré de la vente ne doit pas bloquer les autres.
  await Promise.all(
    local
      .filter((id) => !remote.includes(id))
      .map((productId) => supabase.from("wishlist_items").insert({ user_id: userId, product_id: productId }))
  );
  useWishlistStore.setState({ ids: Array.from(new Set([...remote, ...local])) });
}

export async function saveWishlistChange(productId: string, added: boolean) {
  const user = useAuthStore.getState().user;
  if (!user) return;
  const supabase = createClient();
  if (added) {
    await supabase.from("wishlist_items").insert({ user_id: user.id, product_id: productId });
  } else {
    await supabase.from("wishlist_items").delete().eq("product_id", productId);
  }
}
