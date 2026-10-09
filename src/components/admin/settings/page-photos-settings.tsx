"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { Panel, Loading, LoadError } from "@/components/admin/ui";
import { ImagesField } from "@/components/admin/images-field";
import { Button } from "@/components/ui/button";
import { dbErrorMessage, notifyCatalogChanged } from "@/lib/admin/utils";
import { removeImages } from "@/lib/admin/images";
import { DEFAULT_PAGE_PHOTOS, type PagePhotosRow } from "@/lib/page-photos";

// Photos des pages Connexion et Inscription (table page_photos).
export function PagePhotosSettings() {
  const [row, setRow] = useState<PagePhotosRow | null>(null);
  const [failure, setFailure] = useState<"migration" | "error" | null>(null);

  useEffect(() => {
    createClient()
      .from("page_photos")
      .select("login_image_url, signup_image_url")
      .maybeSingle()
      .then(({ data, error }) => {
        if (error || !data) {
          // Table absente : la migration n'a pas été exécutée.
          setFailure(error?.code === "PGRST205" || error?.code === "42P01" || !error ? "migration" : "error");
          return;
        }
        setRow(data as PagePhotosRow);
      });
  }, []);

  if (failure === "migration") {
    return (
      <LoadError>
        Les photos des pages ne sont pas encore modifiables : exécutez le fichier
        supabase/migrations/20261009120000_page_photos.sql dans Supabase → SQL Editor, puis rechargez la page.
      </LoadError>
    );
  }
  if (failure === "error") return <LoadError>Impossible de charger les photos des pages. Actualisez la page.</LoadError>;
  if (!row) return <Loading />;
  return <PagePhotosForm initial={row} />;
}

function PagePhotosForm({ initial }: { initial: PagePhotosRow }) {
  const [login, setLogin] = useState<string[]>(initial.login_image_url ? [initial.login_image_url] : []);
  const [signup, setSignup] = useState<string[]>(initial.signup_image_url ? [initial.signup_image_url] : []);
  const [saved, setSaved] = useState(initial);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  // Photos envoyées pendant cette visite : celles qui ne sont pas gardées sont supprimées du stockage.
  const uploadedRef = useRef<string[]>([]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const values: PagePhotosRow = { login_image_url: login[0] ?? null, signup_image_url: signup[0] ?? null };

    setSaving(true);
    const { error: saveError } = await createClient().from("page_photos").update(values).eq("id", true);
    setSaving(false);
    if (saveError) {
      setError(dbErrorMessage(saveError, "Les photos n'ont pas pu être enregistrées."));
      return;
    }
    const kept = [values.login_image_url, values.signup_image_url];
    const unused = [saved.login_image_url, saved.signup_image_url, ...uploadedRef.current].filter(
      (url): url is string => !!url && !kept.includes(url)
    );
    removeImages(unused).catch(() => {});
    uploadedRef.current = [];
    setSaved(values);
    notifyCatalogChanged();
    toast.success("Photos enregistrées", { description: "Elles apparaissent aussitôt sur le site." });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <p className="text-xs text-stone-light -mt-2">
        Grande photo affichée à côté du formulaire, sur ordinateur et tablette (elle est masquée sur téléphone).
      </p>
      <div className="grid lg:grid-cols-2 gap-6 items-start">
        <PhotoPanel
          title="Page Connexion"
          images={login}
          setImages={setLogin}
          fallback={DEFAULT_PAGE_PHOTOS.login}
          onUploaded={(url) => uploadedRef.current.push(url)}
        />
        <PhotoPanel
          title="Page Inscription"
          images={signup}
          setImages={setSignup}
          fallback={DEFAULT_PAGE_PHOTOS.signup}
          onUploaded={(url) => uploadedRef.current.push(url)}
        />
      </div>
      {error && <LoadError>{error}</LoadError>}
      <div className="flex justify-end">
        <Button type="submit" variant="primary" size="sm" disabled={saving}>
          {saving ? "Enregistrement…" : "Enregistrer"}
        </Button>
      </div>
    </form>
  );
}

function PhotoPanel({
  title,
  images,
  setImages,
  fallback,
  onUploaded,
}: {
  title: string;
  images: string[];
  setImages: React.Dispatch<React.SetStateAction<string[]>>;
  fallback: string;
  onUploaded: (url: string) => void;
}) {
  return (
    <Panel title={title}>
      <div className="p-5 sm:p-6 flex flex-col gap-4">
        <ImagesField images={images} onChange={setImages} onUploaded={onUploaded} folder="pages" single />
        {images.length === 0 ? (
          <div className="flex items-center gap-4">
            <div className="relative h-24 w-20 shrink-0 overflow-hidden rounded-md bg-sand">
              <Image src={fallback} alt="" fill sizes="80px" className="object-cover" />
            </div>
            <p className="text-xs text-stone-light leading-relaxed">
              Aucune photo choisie : la photo par défaut ci-contre est affichée. Ajoutez la vôtre pour la remplacer.
            </p>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setImages([])}
            className="self-start text-xs text-stone underline underline-offset-2 hover:text-ink cursor-pointer"
          >
            Remettre la photo par défaut
          </button>
        )}
        <p className="text-xs text-stone-light">Une photo en hauteur (portrait) rend le mieux. Pensez à enregistrer.</p>
      </div>
    </Panel>
  );
}
