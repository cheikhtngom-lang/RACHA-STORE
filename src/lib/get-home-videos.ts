import { cache } from "react";
import { createPublicClient } from "@/lib/supabase/public";
import type { HomeVideo } from "@/lib/home-videos";

// Vidéos actives de l'accueil, dans l'ordre choisi par la gérante. Même cache
// que le catalogue (vidé à chaque modification dans l'administration). Sans la
// table (migration non exécutée), aucune vidéo : la section n'apparaît pas.
export const getHomeVideos = cache(async (): Promise<HomeVideo[]> => {
  const { data, error } = await createPublicClient()
    .from("home_videos")
    .select("id, video_url, poster_url, title, body, button_label, button_url")
    .eq("is_active", true)
    .order("position")
    .order("created_at");
  if (error || !data) return [];
  return data as HomeVideo[];
});
