// Vidéos de l'accueil (table home_videos), réglées dans /admin/videos.
// Ce fichier ne lit pas la base : il sert au navigateur comme au serveur.
// La lecture est dans get-home-videos.ts.

export type HomeVideo = {
  id: string;
  video_url: string;
  poster_url: string | null;
  title: string;
  body: string;
  button_label: string;
  button_url: string;
};

export const MAX_HOME_VIDEOS = 5;
// Plafond du bucket « videos » (supabase/migrations/20261026150000_videos_accueil.sql).
export const VIDEO_MAX_MB = 50;
