"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { Panel, Field, Loading, LoadError } from "@/components/admin/ui";
import { ImagesField } from "@/components/admin/images-field";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { dbErrorMessage, notifyCatalogChanged } from "@/lib/admin/utils";
import { removeImages } from "@/lib/admin/images";
import { DEFAULT_EDITORIAL_IMAGE, type HomeEditorialRow } from "@/lib/home-editorial";

// Bloc mis en avant de l'accueil (table home_editorial) : photo et textes.
export function HomeSettings() {
  const [row, setRow] = useState<HomeEditorialRow | null>(null);
  const [failure, setFailure] = useState<"migration" | "error" | null>(null);

  useEffect(() => {
    createClient()
      .from("home_editorial")
      .select("image_url, eyebrow, title, body, button_label, button_url")
      .maybeSingle()
      .then(({ data, error }) => {
        if (error || !data) {
          // Table absente : la migration n'a pas été exécutée.
          setFailure(error?.code === "PGRST205" || error?.code === "42P01" || !error ? "migration" : "error");
          return;
        }
        setRow(data as HomeEditorialRow);
      });
  }, []);

  if (failure === "migration") {
    return (
      <LoadError>
        Le bloc de l&apos;accueil n&apos;est pas encore modifiable : exécutez le fichier
        supabase/migrations/20260929160000_home_editorial.sql dans Supabase → SQL Editor, puis rechargez la page.
      </LoadError>
    );
  }
  if (failure === "error") return <LoadError>Impossible de charger le bloc de l&apos;accueil. Actualisez la page.</LoadError>;
  if (!row) return <Loading />;
  return <EditorialForm initial={row} />;
}

function EditorialForm({ initial }: { initial: HomeEditorialRow }) {
  const [images, setImages] = useState<string[]>(initial.image_url ? [initial.image_url] : []);
  const [eyebrow, setEyebrow] = useState(initial.eyebrow);
  const [title, setTitle] = useState(initial.title);
  const [body, setBody] = useState(initial.body);
  const [buttonLabel, setButtonLabel] = useState(initial.button_label);
  const [buttonUrl, setButtonUrl] = useState(initial.button_url);
  const [saved, setSaved] = useState(initial.image_url);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  // Photos envoyées pendant cette visite : celles qui ne sont pas gardées sont supprimées du stockage.
  const uploadedRef = useRef<string[]>([]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const values = {
      image_url: images[0] ?? null,
      eyebrow: eyebrow.trim(),
      title: title.trim(),
      body: body.trim(),
      button_label: buttonLabel.trim(),
      button_url: buttonUrl.trim(),
    };
    if (!values.title) return setError("Indiquez un titre.");
    if (values.button_url && !values.button_url.startsWith("/") && !values.button_url.startsWith("https://")) {
      return setError("Le lien du bouton doit être une page du site (commençant par /) ou une adresse complète https://");
    }
    if (values.button_label && !values.button_url) return setError("Indiquez la page ouverte par le bouton.");

    setSaving(true);
    const { error: saveError } = await createClient().from("home_editorial").update(values).eq("id", true);
    setSaving(false);
    if (saveError) {
      setError(dbErrorMessage(saveError, "Le bloc n'a pas pu être enregistré."));
      return;
    }
    const unused = [saved, ...uploadedRef.current].filter((url): url is string => !!url && url !== values.image_url);
    removeImages(unused).catch(() => {});
    uploadedRef.current = [];
    setSaved(values.image_url);
    notifyCatalogChanged();
    toast.success("Bloc de l'accueil enregistré", { description: "Il apparaît aussitôt sur la page d'accueil." });
  }

  return (
    <form onSubmit={handleSubmit} className="grid lg:grid-cols-[1fr_1.3fr] gap-6 items-start">
      <Panel title="Photo">
        <div className="p-5 sm:p-6 flex flex-col gap-4">
          <ImagesField
            images={images}
            onChange={(updater) => setImages(updater)}
            onUploaded={(url) => uploadedRef.current.push(url)}
            folder="accueil"
            single
          />
          {images.length === 0 && (
            <div className="flex items-center gap-4">
              <div className="relative h-24 w-20 shrink-0 overflow-hidden rounded-md bg-sand">
                <Image src={DEFAULT_EDITORIAL_IMAGE} alt="" fill sizes="80px" className="object-cover object-[50%_30%]" />
              </div>
              <p className="text-xs text-stone-light leading-relaxed">
                Aucune photo choisie : la photo par défaut (femme en grand boubou) est affichée. Ajoutez la vôtre pour la remplacer.
              </p>
            </div>
          )}
          {images.length > 0 && (
            <button
              type="button"
              onClick={() => setImages(() => [])}
              className="self-start text-xs text-stone underline underline-offset-2 hover:text-ink cursor-pointer"
            >
              Remettre la photo par défaut
            </button>
          )}
          <p className="text-xs text-stone-light">Une photo en hauteur (portrait) rend le mieux. Pensez à enregistrer.</p>
        </div>
      </Panel>

      <Panel title="Textes">
        <div className="p-5 sm:p-6 flex flex-col gap-5">
          <Field label="Petit titre (facultatif)" htmlFor="editorial-eyebrow" hint="Au-dessus du titre, en lettres dorées.">
            <Input id="editorial-eyebrow" maxLength={40} value={eyebrow} onChange={(e) => setEyebrow(e.target.value)} placeholder="Couture africaine" />
          </Field>
          <Field label="Titre" htmlFor="editorial-title">
            <Input id="editorial-title" required maxLength={120} value={title} onChange={(e) => setTitle(e.target.value)} />
          </Field>
          <Field label="Texte (facultatif)" htmlFor="editorial-body" hint={`${body.length} / 400 caractères.`}>
            <Textarea id="editorial-body" rows={4} maxLength={400} value={body} onChange={(e) => setBody(e.target.value)} />
          </Field>
          <div className="grid sm:grid-cols-2 gap-4 pt-5 border-t border-line">
            <Field label="Bouton (facultatif)" htmlFor="editorial-button-label">
              <Input id="editorial-button-label" maxLength={50} value={buttonLabel} onChange={(e) => setButtonLabel(e.target.value)} placeholder="Voir nos types de couture africaine" />
            </Field>
            <Field label="Page ouverte" htmlFor="editorial-button-url" hint="Ex. /boutique/tenues-africaines">
              <Input id="editorial-button-url" maxLength={300} value={buttonUrl} onChange={(e) => setButtonUrl(e.target.value)} placeholder="/boutique/tenues-africaines" />
            </Field>
          </div>
          {error && <LoadError>{error}</LoadError>}
          <div className="flex justify-end">
            <Button type="submit" variant="primary" size="sm" disabled={saving}>
              {saving ? "Enregistrement…" : "Enregistrer"}
            </Button>
          </div>
        </div>
      </Panel>
    </form>
  );
}
