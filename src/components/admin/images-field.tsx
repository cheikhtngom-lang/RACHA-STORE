"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, ImagePlus, X } from "lucide-react";
import { toast } from "sonner";
import { uploadImage } from "@/lib/admin/images";
import { cn } from "@/lib/utils";

type Update = (updater: (images: string[]) => string[]) => void;

// Photos d'un produit (plusieurs, la première est la photo principale) ou d'une
// catégorie (une seule). Les photos sont envoyées dès qu'elles sont choisies ;
// le parent décide quoi supprimer du bucket à l'enregistrement.
export function ImagesField({
  images,
  onChange,
  folder,
  single = false,
  onUploaded,
}: {
  images: string[];
  onChange: Update;
  folder: "produits" | "categories";
  single?: boolean;
  onUploaded?: (url: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);

  async function handleFiles(fileList: FileList | null) {
    const files = Array.from(fileList ?? []);
    if (inputRef.current) inputRef.current.value = "";
    if (files.length === 0) return;

    setProgress({ done: 0, total: files.length });
    // Une par une : plus fiable sur une connexion mobile.
    for (const [i, file] of files.entries()) {
      try {
        const url = await uploadImage(file, folder);
        onUploaded?.(url);
        onChange((current) => (single ? [url] : [...current, url]));
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "L'envoi de la photo a échoué.");
      }
      setProgress({ done: i + 1, total: files.length });
    }
    setProgress(null);
  }

  function move(index: number, delta: number) {
    onChange((current) => {
      const next = [...current];
      const [item] = next.splice(index, 1);
      next.splice(index + delta, 0, item);
      return next;
    });
  }

  function remove(index: number) {
    onChange((current) => current.filter((_, i) => i !== index));
  }

  const canAdd = !single || images.length === 0;

  return (
    <div>
      <div className={cn("grid gap-3", single ? "grid-cols-2 sm:grid-cols-3" : "grid-cols-3 sm:grid-cols-4")}>
        {images.map((url, i) => (
          <div key={`${i}:${url}`} className="relative aspect-[4/5] bg-sand border border-line">
            <Image src={url} alt="" fill sizes="(min-width: 640px) 180px, 30vw" className="object-cover" />
            {!single && i === 0 && (
              <span className="absolute left-0 top-0 bg-ink text-cream font-sans-wide text-[0.55rem] uppercase px-2 py-1">
                Principale
              </span>
            )}
            <div className="absolute inset-x-0 bottom-0 flex justify-between bg-ink/70">
              {!single && (
                <button
                  type="button"
                  aria-label="Déplacer vers la gauche"
                  disabled={i === 0}
                  onClick={() => move(i, -1)}
                  className="h-8 w-8 flex items-center justify-center text-cream disabled:opacity-30 cursor-pointer"
                >
                  <ChevronLeft size={16} />
                </button>
              )}
              <button
                type="button"
                aria-label="Retirer la photo"
                onClick={() => remove(i)}
                className="h-8 w-8 flex items-center justify-center text-cream cursor-pointer mx-auto"
              >
                <X size={16} />
              </button>
              {!single && (
                <button
                  type="button"
                  aria-label="Déplacer vers la droite"
                  disabled={i === images.length - 1}
                  onClick={() => move(i, 1)}
                  className="h-8 w-8 flex items-center justify-center text-cream disabled:opacity-30 cursor-pointer"
                >
                  <ChevronRight size={16} />
                </button>
              )}
            </div>
          </div>
        ))}

        {canAdd && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={progress !== null}
            className="aspect-[4/5] border border-dashed border-stone-light flex flex-col items-center justify-center gap-2 text-stone hover:border-ink hover:text-ink transition-colors cursor-pointer disabled:cursor-wait"
          >
            <ImagePlus size={22} strokeWidth={1.25} />
            <span className="text-xs text-center px-2">
              {progress
                ? `Envoi ${Math.min(progress.done + 1, progress.total)}/${progress.total}…`
                : single
                  ? "Choisir une photo"
                  : "Ajouter des photos"}
            </span>
          </button>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple={!single}
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
    </div>
  );
}
