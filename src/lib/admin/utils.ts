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

export const DAY = 24 * 60 * 60 * 1000;

// Champs date des formulaires. La base stocke un instant ; l'écran parle en
// jours. « Jusqu'au 31 inclus » est enregistré comme le 1er à minuit.
export function toInputDate(iso: string | null, shiftDays = 0) {
  if (!iso) return "";
  const d = new Date(new Date(iso).getTime() + shiftDays * DAY);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function fromInputDate(value: string, shiftDays = 0) {
  if (!value) return null;
  const d = new Date(`${value}T00:00:00`);
  d.setDate(d.getDate() + shiftDays);
  return d.toISOString();
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
