import { cache } from "react";
import { createPublicClient } from "@/lib/supabase/public";

export type Announcement = { id: string; message: string; link_url: string | null };

// Tant que la migration 20260928200000_announcements.sql n'a pas été
// exécutée, le bandeau garde son texte d'origine.
const FALLBACK: Announcement[] = [
  { id: "livraison", message: "Livraison offerte dès 100 000 F CFA", link_url: null },
  { id: "retours", message: "Retours gratuits sous 30 jours", link_url: null },
];

// Annonces du bandeau, écrites dans /admin/annonces. La base ne renvoie que
// celles qui sont actives et dans leurs dates. Même cache que le catalogue
// (60 s, vidé à chaque modification dans l'administration).
export const getAnnouncements = cache(async (): Promise<Announcement[]> => {
  const { data, error } = await createPublicClient()
    .from("announcements")
    .select("id, message, link_url")
    .order("position")
    .order("created_at");
  if (error) return FALLBACK;
  return data;
});
