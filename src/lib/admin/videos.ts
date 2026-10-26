import { createClient } from "@/lib/supabase/client";
import { getSupabaseEnv } from "@/lib/supabase/env";
import { removeImages, uploadImage } from "@/lib/admin/images";
import { VIDEO_MAX_MB } from "@/lib/home-videos";

const BUCKET = "videos";
// Au-delà, la vidéo est jugée illisible par ce navigateur (codec non pris en charge).
const POSTER_TIMEOUT_MS = 15000;

// Envoi direct au stockage par une adresse signée, avec la progression : une
// vidéo de 50 Mo prend plusieurs minutes sur une petite connexion.
function putFile(url: string, file: File, onProgress: (p: number) => void) {
  return new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", url);
    xhr.setRequestHeader("Content-Type", "video/mp4");
    xhr.setRequestHeader("x-upsert", "false");
    xhr.upload.onprogress = (e) => e.lengthComputable && onProgress(e.loaded / e.total);
    xhr.onload = () => (xhr.status < 300 ? resolve() : reject(new Error(`L'envoi de la vidéo a échoué (erreur ${xhr.status}).`)));
    xhr.onerror = () => reject(new Error("Connexion coupée pendant l'envoi de la vidéo. Réessayez."));
    xhr.send(file);
  });
}

// Vérifie le fichier, l'envoie dans le bucket « videos » et renvoie son adresse publique.
export async function uploadVideo(file: File, onProgress: (p: number) => void) {
  if (file.type !== "video/mp4" && !file.name.toLowerCase().endsWith(".mp4")) {
    throw new Error(`« ${file.name} » n'est pas une vidéo MP4.`);
  }
  if (file.size > VIDEO_MAX_MB * 1024 * 1024) {
    throw new Error(`Vidéo trop lourde : ${VIDEO_MAX_MB} Mo au plus. Exportez-la en 720p ou en qualité moyenne.`);
  }
  const path = `accueil/${crypto.randomUUID()}.mp4`;
  const storage = createClient().storage.from(BUCKET);
  const { data, error } = await storage.createSignedUploadUrl(path);
  if (error || !data) throw new Error("L'envoi de la vidéo n'a pas pu commencer. Réessayez.");
  await putFile(data.signedUrl, file, onProgress);
  return storage.getPublicUrl(path).data.publicUrl;
}

function once(target: HTMLVideoElement, event: "loadeddata" | "seeked") {
  return new Promise<void>((resolve, reject) => {
    target.addEventListener(event, () => resolve(), { once: true });
    target.addEventListener("error", () => reject(new Error("Vidéo illisible")), { once: true });
  });
}

// Image d'attente : la vidéo à 1 s (ou à mi-parcours si elle est plus courte),
// envoyée comme une photo. Renvoie null si le navigateur ne sait pas lire la
// vidéo : elle s'affichera quand même, sur fond noir avant la lecture.
export async function uploadPoster(file: File): Promise<string | null> {
  const url = URL.createObjectURL(file);
  const video = document.createElement("video");
  video.muted = true;
  video.playsInline = true;
  video.preload = "auto";
  try {
    const capture = (async () => {
      video.src = url;
      await once(video, "loadeddata");
      video.currentTime = Number.isFinite(video.duration) ? Math.min(1, video.duration / 2) : 0;
      await once(video, "seeked");
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      canvas.getContext("2d")?.drawImage(video, 0, 0);
      return new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.85));
    })();
    const timeout = new Promise<null>((resolve) => window.setTimeout(() => resolve(null), POSTER_TIMEOUT_MS));
    const blob = await Promise.race([capture.catch(() => null), timeout]);
    if (!blob) return null;
    return await uploadImage(new File([blob], "affiche.jpg", { type: "image/jpeg" }), "accueil");
  } catch {
    return null;
  } finally {
    video.removeAttribute("src");
    URL.revokeObjectURL(url);
  }
}

// Supprime le fichier vidéo et son image d'attente. Un échec laisse seulement
// un fichier orphelin dans le stockage : on ne bloque pas la suppression pour ça.
export async function removeVideoFiles(video: { video_url: string; poster_url: string | null }) {
  const prefix = `${getSupabaseEnv().url}/storage/v1/object/public/${BUCKET}/`;
  if (video.video_url.startsWith(prefix)) {
    await createClient().storage.from(BUCKET).remove([decodeURIComponent(video.video_url.slice(prefix.length))]);
  }
  if (video.poster_url) await removeImages([video.poster_url]);
}
