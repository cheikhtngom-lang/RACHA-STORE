import { createClient } from "@/lib/supabase/client";
import { getSupabaseEnv } from "@/lib/supabase/env";

const BUCKET = "products";

// Une photo de téléphone pèse 3 à 8 Mo : on l'envoie réduite à 1600 px de côté
// en JPEG, ce qui suffit pour la page produit et reste sous la limite du bucket.
const MAX_SIDE = 1600;
const JPEG_QUALITY = 0.85;

async function resizeImage(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas indisponible");
  // Fond blanc : le JPEG n'a pas de transparence (PNG détourés).
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  return new Promise((resolve, reject) =>
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("Conversion impossible"))), "image/jpeg", JPEG_QUALITY)
  );
}

// Envoie une photo dans Supabase Storage et renvoie son adresse publique.
export async function uploadImage(file: File, folder: "produits" | "categories" | "accueil" | "pages") {
  let blob: Blob;
  try {
    blob = await resizeImage(file);
  } catch {
    throw new Error(`« ${file.name} » n'est pas une image lisible. Utilisez une photo JPEG ou PNG.`);
  }
  const path = `${folder}/${crypto.randomUUID()}.jpg`;
  const storage = createClient().storage.from(BUCKET);
  const { error } = await storage.upload(path, blob, { contentType: "image/jpeg", cacheControl: "31536000" });
  if (error) throw new Error(`L'envoi de « ${file.name} » a échoué.`);
  return storage.getPublicUrl(path).data.publicUrl;
}

// Chemin dans le bucket, ou null pour une photo hébergée ailleurs (exemples du
// catalogue de départ) : celles-là ne sont jamais supprimées d'ici.
function storagePath(url: string) {
  const prefix = `${getSupabaseEnv().url}/storage/v1/object/public/${BUCKET}/`;
  return url.startsWith(prefix) ? decodeURIComponent(url.slice(prefix.length)) : null;
}

// Supprime des photos qui ne sont plus utilisées. Un échec laisse seulement un
// fichier orphelin dans le bucket : on ne bloque pas l'enregistrement pour ça.
export async function removeImages(urls: string[]) {
  const paths = urls.map(storagePath).filter((p): p is string => p !== null);
  if (paths.length === 0) return;
  await createClient().storage.from(BUCKET).remove(paths);
}
