"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { PageHeader, Field, Loading, LoadError, EmptyState, ConfirmDialog } from "@/components/admin/ui";
import { ImagesField } from "@/components/admin/images-field";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { removeImages } from "@/lib/admin/images";
import { dbErrorMessage, notifyCatalogChanged } from "@/lib/admin/utils";
import { slugify } from "@/lib/utils";

type CategoryRow = {
  id: string;
  slug: string;
  name: string;
  description: string;
  image_url: string | null;
  position: number;
  products: { count: number }[];
};

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<CategoryRow[] | null>(null);
  const [failed, setFailed] = useState(false);
  // null : fermé ; "new" : création ; sinon la catégorie modifiée.
  const [editing, setEditing] = useState<CategoryRow | "new" | null>(null);
  const [deleting, setDeleting] = useState<CategoryRow | null>(null);
  const [pending, setPending] = useState(false);
  const [version, setVersion] = useState(0);

  useEffect(() => {
    createClient()
      .from("categories")
      .select("id, slug, name, description, image_url, position, products (count)")
      .order("position")
      .then(({ data, error }) => {
        if (error) setFailed(true);
        else setCategories(data as CategoryRow[]);
      });
  }, [version]);

  async function handleDelete() {
    if (!deleting) return;
    setPending(true);
    const { error } = await createClient().from("categories").delete().eq("id", deleting.id);
    setPending(false);
    if (error) {
      toast.error(
        error.code === "23503"
          ? "Cette catégorie contient encore des produits : déplacez-les ou supprimez-les d'abord."
          : dbErrorMessage(error, "La catégorie n'a pas pu être supprimée.")
      );
      setDeleting(null);
      return;
    }
    if (deleting.image_url) removeImages([deleting.image_url]).catch(() => {});
    notifyCatalogChanged();
    toast.success("Catégorie supprimée");
    setDeleting(null);
    setVersion((v) => v + 1);
  }

  return (
    <>
      <PageHeader
        title="Catégories"
        description="Menu de la boutique et rubriques de la page d'accueil, dans cet ordre."
        action={
          <Button variant="primary" onClick={() => setEditing("new")}>
            <Plus size={15} strokeWidth={1.5} />
            Ajouter une catégorie
          </Button>
        }
      />

      {failed && <LoadError>Impossible de charger les catégories. Actualisez la page.</LoadError>}
      {!failed && !categories && <Loading />}
      {categories && categories.length === 0 && <EmptyState>Aucune catégorie.</EmptyState>}
      {categories && categories.length > 0 && (
        <ul className="dash-card overflow-hidden divide-y divide-line">
          {categories.map((c) => {
            const count = c.products[0]?.count ?? 0;
            return (
              <li key={c.id} className="flex items-center gap-4 px-4 sm:px-6 py-4">
                <div className="relative h-20 w-16 shrink-0 bg-sand">
                  {c.image_url && <Image src={c.image_url} alt="" fill sizes="64px" className="object-cover" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-ink">{c.name}</p>
                  <p className="text-xs text-stone-light mt-0.5">
                    /boutique/{c.slug} · {count} produit{count > 1 ? "s" : ""}
                  </p>
                  {c.description && <p className="text-xs text-stone mt-1 clamp-2">{c.description}</p>}
                </div>
                <div className="flex flex-col sm:flex-row items-end sm:items-center gap-3 shrink-0">
                  <Button variant="outline" size="sm" onClick={() => setEditing(c)}>
                    Modifier
                  </Button>
                  {count === 0 && (
                    <button
                      type="button"
                      onClick={() => setDeleting(c)}
                      className="text-xs text-danger underline underline-offset-2 cursor-pointer"
                    >
                      Supprimer
                    </button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {editing && (
        <CategoryDialog
          category={editing === "new" ? null : editing}
          nextPosition={categories ? Math.max(-1, ...categories.map((c) => c.position)) + 1 : 0}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            setVersion((v) => v + 1);
          }}
        />
      )}

      <ConfirmDialog
        open={deleting !== null}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="Supprimer cette catégorie ?"
        confirmLabel="Supprimer"
        onConfirm={handleDelete}
        pending={pending}
      >
        « {deleting?.name} » disparaîtra du menu de la boutique. Son adresse /boutique/{deleting?.slug} ne fonctionnera plus.
      </ConfirmDialog>
    </>
  );
}

function CategoryDialog({
  category,
  nextPosition,
  onClose,
  onSaved,
}: {
  category: CategoryRow | null;
  nextPosition: number;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [name, setName] = useState(category?.name ?? "");
  const [description, setDescription] = useState(category?.description ?? "");
  const [images, setImages] = useState<string[]>(category?.image_url ? [category.image_url] : []);
  const [position, setPosition] = useState(String(category?.position ?? nextPosition));
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const uploadedRef = useRef<string[]>([]);
  // L'adresse d'une catégorie existante ne change pas : les liens partagés resteraient cassés.
  const slug = category?.slug ?? slugify(name);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!name.trim() || !slug) return setError("Indiquez un nom.");

    const values = {
      name: name.trim(),
      description: description.trim(),
      image_url: images[0] ?? null,
      position: Number.parseInt(position, 10) || 0,
    };

    setSaving(true);
    const supabase = createClient();
    const { error: saveError } = category
      ? await supabase.from("categories").update(values).eq("id", category.id)
      : await supabase.from("categories").insert({ ...values, slug });
    setSaving(false);

    if (saveError) {
      setError(
        saveError.code === "23505"
          ? "Une catégorie porte déjà ce nom ou cette adresse."
          : dbErrorMessage(saveError, "La catégorie n'a pas pu être enregistrée.")
      );
      return;
    }

    const unused = [category?.image_url, ...uploadedRef.current].filter((url): url is string => !!url && url !== values.image_url);
    removeImages(unused).catch(() => {});
    notifyCatalogChanged();
    toast.success(category ? "Catégorie enregistrée" : "Catégorie ajoutée");
    onSaved();
  }

  return (
    <Dialog open onOpenChange={(open) => !open && !saving && onClose()}>
      <DialogContent className="w-[calc(100%-2rem)] max-w-lg p-6 sm:p-8">
        <DialogTitle className="font-display text-2xl text-ink mb-6 pr-10">
          {category ? category.name : "Nouvelle catégorie"}
        </DialogTitle>
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <Field label="Nom" htmlFor="category-name" hint={`Adresse : /boutique/${slug || "…"}`}>
            <Input id="category-name" required value={name} onChange={(e) => setName(e.target.value)} />
          </Field>
          <Field label="Description" htmlFor="category-description" hint="Affichée en tête de la page de la catégorie.">
            <Textarea id="category-description" rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
          </Field>
          <Field label="Photo">
            <ImagesField
              images={images}
              onChange={(updater) => setImages(updater)}
              onUploaded={(url) => uploadedRef.current.push(url)}
              folder="categories"
              single
            />
          </Field>
          <Field label="Ordre d'affichage" htmlFor="category-position">
            <Input id="category-position" type="number" value={position} onChange={(e) => setPosition(e.target.value)} />
          </Field>
          {error && <LoadError>{error}</LoadError>}
          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 mt-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={saving}>
              Annuler
            </Button>
            <Button type="submit" variant="primary" disabled={saving}>
              {saving ? "Enregistrement…" : "Enregistrer"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
