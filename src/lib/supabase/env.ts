export function getSupabaseEnv() {
  // Accès littéral à process.env : Next.js remplace ces valeurs dans le code envoyé au navigateur.
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) {
    throw new Error(
      "Variables manquantes : NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY (voir .env.example)"
    );
  }
  return { url, key };
}
