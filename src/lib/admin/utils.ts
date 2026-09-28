import type { PostgrestError } from "@supabase/supabase-js";
import { refreshCatalog } from "@/app/admin/actions";

export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("fr-SN", { day: "numeric", month: "short", year: "numeric" });
}

export function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("fr-SN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Numéro pour wa.me : chiffres seuls, indicatif 221 ajouté aux numéros
// sénégalais saisis sans indicatif (9 chiffres commençant par 7).
export function whatsappNumber(phone: string) {
  let digits = phone.replace(/\D/g, "");
  if (digits.startsWith("00")) digits = digits.slice(2);
  if (digits.length === 9 && digits.startsWith("7")) digits = `221${digits}`;
  return digits;
}

// Traduit les erreurs de la base. Les messages levés par nos fonctions SQL
// (code P0001) sont déjà rédigés en français.
export function dbErrorMessage(error: PostgrestError, fallback: string) {
  if (error.code === "P0001") return error.message;
  if (error.code === "42501") return "Action refusée : ce compte n'est pas administrateur.";
  return fallback;
}

// La boutique relit le catalogue au plus tard 60 s après une modification ;
// ceci l'oblige à le relire tout de suite. Un échec n'a donc rien de grave.
export function notifyCatalogChanged() {
  refreshCatalog().catch(() => {});
}
