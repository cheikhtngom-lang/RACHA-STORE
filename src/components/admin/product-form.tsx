"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, X } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { Panel, Field, CheckboxField, ConfirmDialog, LoadError } from "@/components/admin/ui";
import { ImagesField } from "@/components/admin/images-field";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { removeImages } from "@/lib/admin/images";
import { dbErrorMessage, notifyCatalogChanged } from "@/lib/admin/utils";
import type { ProductColor } from "@/lib/types";
import { slugify } from "@/lib/utils";

// Ligne de la table products (supabase/migrations), telle que lue par l'administration.
export type ProductRecord = {
  id: string;
  slug: string;
  sku: string;
  name: string;
  category_id: string;
  subcategory: string | null;
  price: number;
  compare_at_price: number | null;
  short_description: string;
  description: string;
  details: string[];
  materials: string | null;
  care: string | null;
  images: string[];
  colors: ProductColor[];
  sizes: string[];
  stock: number;
  is_new: boolean;
  is_best_seller: boolean;
  is_limited: boolean;
  is_active: boolean;
  position: number;
};

// Les nombres restent en texte pendant la saisie (champ vide autorisé).
type FormState = {
  name: string;
  slug: string;
  sku: string;
  categoryId: string;
  subcategory: string;
  price: string;
  compareAtPrice: string;
  stock: string;
  shortDescription: string;
  description: string;
  details: string;
  materials: string;
  care: string;
  images: string[];
  colors: ProductColor[];
  sizes: string;
  isNew: boolean;
  isBestSeller: boolean;
  isLimited: boolean;
  isActive: boolean;
  position: string;
};

function toFormState(p?: ProductRecord): FormState {
  return {
    name: p?.name ?? "",
    slug: p?.slug ?? "",
    sku: p?.sku ?? "",
    categoryId: p?.category_id ?? "",
    subcategory: p?.subcategory ?? "",
    price: p ? String(p.price) : "",
    compareAtPrice: p?.compare_at_price != null ? String(p.compare_at_price) : "",
    stock: p ? String(p.stock) : "",
    shortDescription: p?.short_description ?? "",
    description: p?.description ?? "",
    details: p?.details.join("\n") ?? "",
    materials: p?.materials ?? "",
    care: p?.care ?? "",
    images: p?.images ?? [],
    colors: p?.colors ?? [],
    sizes: p?.sizes.join(", ") ?? "",
    isNew: p?.is_new ?? true,
    isBestSeller: p?.is_best_seller ?? false,
    isLimited: p?.is_limited ?? false,
    isActive: p?.is_active ?? true,
    position: p ? String(p.position) : "0",
  };
}

// Montant ou quantité saisi : entier positif, espaces tolérés (« 25 000 »).
function parseAmount(value: string) {
  const cleaned = value.replace(/\s/g, "");
  return /^\d+$/.test(cleaned) ? Number(cleaned) : null;
}

function lines(value: string) {
  return value
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
}

function generateSku() {
  return `RS-${crypto.randomUUID().slice(0, 6).toUpperCase()}`;
}

export function ProductForm({ product }: { product?: ProductRecord }) {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(() => toFormState(product));
  const [slugTouched, setSlugTouched] = useState(Boolean(product));
  const [categories, setCategories] = useState<{ id: string; name: string }[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  // Photos envoyées pendant cette saisie : supprimées du bucket si on les retire avant d'enregistrer.
  const uploadedRef = useRef<string[]>([]);

  useEffect(() => {
    createClient()
      .from("categories")
      .select("id, name")
      .order("position")
      .then(({ data }) => setCategories(data ?? []));
  }, []);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function updateName(name: string) {
    setForm((f) => ({ ...f, name, slug: slugTouched ? f.slug : slugify(name) }));
  }

  function updateColor(index: number, patch: Partial<ProductColor>) {
    setForm((f) => ({ ...f, colors: f.colors.map((c, i) => (i === index ? { ...c, ...patch } : c)) }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const price = parseAmount(form.price);
    const stock = parseAmount(form.stock);
    const compareAtPrice = form.compareAtPrice.trim() ? parseAmount(form.compareAtPrice) : null;
    const position = Number.parseInt(form.position, 10);
    const slug = slugify(form.slug || form.name);
    const colors = form.colors.map((c) => ({ name: c.name.trim(), hex: c.hex })).filter((c) => c.name);
    const sizes = [...new Set(form.sizes.split(",").map((s) => s.trim()).filter(Boolean))];

    if (!form.name.trim()) return setError("Indiquez le nom du produit.");
    if (!slug) return setError("L'adresse de la page doit contenir au moins une lettre ou un chiffre.");
    if (!form.categoryId) return setError("Choisissez une catégorie.");
    if (price === null) return setError("Le prix doit être un nombre entier en F CFA, sans centimes.");
    if (stock === null) return setError("Le stock doit être un nombre entier (0 si épuisé).");
    if (form.compareAtPrice.trim() && (compareAtPrice === null || compareAtPrice <= price)) {
      return setError("Le prix barré doit être un nombre plus élevé que le prix de vente.");
    }

    const values = {
      name: form.name.trim(),
      slug,
      sku: form.sku.trim().toUpperCase() || generateSku(),
      category_id: form.categoryId,
      subcategory: form.subcategory.trim() || null,
      price,
      compare_at_price: compareAtPrice,
      stock,
      short_description: form.shortDescription.trim(),
      description: form.description.trim(),
      details: lines(form.details),
      materials: form.materials.trim() || null,
      care: form.care.trim() || null,
      images: form.images,
      colors,
      sizes,
      is_new: form.isNew,
      is_best_seller: form.isBestSeller,
      is_limited: form.isLimited,
      is_active: form.isActive,
      position: Number.isNaN(position) ? 0 : position,
    };

    setSaving(true);
    const supabase = createClient();
    const { error: saveError } = product
      ? await supabase.from("products").update(values).eq("id", product.id)
      : await supabase.from("products").insert(values);

    if (saveError) {
      setSaving(false);
      if (saveError.code === "23505" && saveError.message.includes("slug")) {
        setError("Un autre produit utilise déjà cette adresse de page. Modifiez-la dans « Adresse de la page ».");
      } else if (saveError.code === "23505" && saveError.message.includes("sku")) {
        setError("Un autre produit utilise déjà ce SKU.");
      } else {
        setError(dbErrorMessage(saveError, "Le produit n'a pas pu être enregistré. Réessayez."));
      }
      return;
    }

    const unused = [...(product?.images ?? []), ...uploadedRef.current].filter((url) => !values.images.includes(url));
    removeImages(unused).catch(() => {});
    notifyCatalogChanged();
    toast.success(product ? "Produit enregistré" : "Produit ajouté");
    router.push("/admin/produits");
  }

  async function handleDelete() {
    if (!product) return;
    setDeleting(true);
    const { error: deleteError } = await createClient().from("products").delete().eq("id", product.id);
    if (deleteError) {
      setDeleting(false);
      setConfirmDelete(false);
      toast.error(dbErrorMessage(deleteError, "Le produit n'a pas pu être supprimé."));
      return;
    }
    removeImages([...product.images, ...uploadedRef.current]).catch(() => {});
    notifyCatalogChanged();
    toast.success("Produit supprimé");
    router.push("/admin/produits");
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div className="grid lg:grid-cols-[1fr_340px] gap-6 items-start">
        <div className="flex flex-col gap-6 min-w-0">
          <Panel title="Informations">
            <div className="p-5 sm:p-6 flex flex-col gap-5">
              <Field label="Nom" htmlFor="name">
                <Input id="name" required value={form.name} onChange={(e) => updateName(e.target.value)} placeholder="Robe midi en soie" />
              </Field>
              <Field label="Accroche" htmlFor="short" hint="Une phrase, affichée sous le prix et dans les résultats Google.">
                <Input id="short" value={form.shortDescription} onChange={(e) => update("shortDescription", e.target.value)} />
              </Field>
              <Field label="Description" htmlFor="description">
                <Textarea id="description" rows={5} value={form.description} onChange={(e) => update("description", e.target.value)} />
              </Field>
            </div>
          </Panel>

          <Panel title="Photos">
            <div className="p-5 sm:p-6">
              <ImagesField
                images={form.images}
                onChange={(updater) => setForm((f) => ({ ...f, images: updater(f.images) }))}
                onUploaded={(url) => uploadedRef.current.push(url)}
                folder="produits"
              />
              <p className="text-xs text-stone-light mt-3">
                La première photo est celle des listes de produits. Format portrait conseillé (4:5).
              </p>
            </div>
          </Panel>

          <Panel title="Couleurs et tailles">
            <div className="p-5 sm:p-6 flex flex-col gap-6">
              <div>
                <p className="font-sans-wide text-[0.65rem] uppercase text-stone mb-2">Couleurs</p>
                <div className="flex flex-col gap-2">
                  {form.colors.map((color, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <input
                        type="color"
                        value={color.hex}
                        onChange={(e) => updateColor(i, { hex: e.target.value })}
                        aria-label={`Teinte de la couleur ${i + 1}`}
                        className="h-12 w-12 shrink-0 border border-line bg-cream p-1 cursor-pointer"
                      />
                      <Input
                        value={color.name}
                        onChange={(e) => updateColor(i, { name: e.target.value })}
                        placeholder="Nom affiché, ex. Camel"
                        aria-label={`Nom de la couleur ${i + 1}`}
                      />
                      <button
                        type="button"
                        aria-label="Retirer la couleur"
                        onClick={() => update("colors", form.colors.filter((_, j) => j !== i))}
                        className="h-12 w-12 shrink-0 flex items-center justify-center text-stone hover:text-ink cursor-pointer"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => update("colors", [...form.colors, { name: "", hex: "#1a1a1a" }])}
                  className="mt-3 inline-flex items-center gap-2 text-xs text-ink underline underline-offset-2 cursor-pointer"
                >
                  <Plus size={14} />
                  Ajouter une couleur
                </button>
                <p className="text-xs text-stone-light mt-2">Sans couleur, le client n&apos;a pas de choix à faire.</p>
              </div>
              <Field label="Tailles" htmlFor="sizes" hint="Séparées par des virgules : XS, S, M, L ou 38, 39, 40. Laissez vide pour une taille unique.">
                <Input id="sizes" value={form.sizes} onChange={(e) => update("sizes", e.target.value)} />
              </Field>
            </div>
          </Panel>

          <Panel title="Détails">
            <div className="p-5 sm:p-6 flex flex-col gap-5">
              <Field label="Points clés" htmlFor="details" hint="Un point par ligne.">
                <Textarea id="details" rows={4} value={form.details} onChange={(e) => update("details", e.target.value)} />
              </Field>
              <Field label="Matières" htmlFor="materials">
                <Input id="materials" value={form.materials} onChange={(e) => update("materials", e.target.value)} placeholder="100 % coton" />
              </Field>
              <Field label="Entretien" htmlFor="care">
                <Input id="care" value={form.care} onChange={(e) => update("care", e.target.value)} placeholder="Lavage à 30 °C" />
              </Field>
            </div>
          </Panel>
        </div>

        <div className="flex flex-col gap-6">
          <Panel title="Prix et stock">
            <div className="p-5 sm:p-6 flex flex-col gap-5">
              <Field label="Prix (F CFA)" htmlFor="price">
                <Input id="price" inputMode="numeric" required value={form.price} onChange={(e) => update("price", e.target.value)} placeholder="25000" />
              </Field>
              <Field label="Prix barré (facultatif)" htmlFor="compare" hint="Ancien prix, affiché barré à côté du prix.">
                <Input id="compare" inputMode="numeric" value={form.compareAtPrice} onChange={(e) => update("compareAtPrice", e.target.value)} />
              </Field>
              <Field label="Stock" htmlFor="stock" hint="Diminue à chaque commande, remonte si elle est annulée.">
                <Input id="stock" inputMode="numeric" required value={form.stock} onChange={(e) => update("stock", e.target.value)} placeholder="0" />
              </Field>
              <Field label="SKU (facultatif)" htmlFor="sku" hint="Référence interne. Créée automatiquement si vide.">
                <Input id="sku" value={form.sku} onChange={(e) => update("sku", e.target.value)} />
              </Field>
            </div>
          </Panel>

          <Panel title="Rangement">
            <div className="p-5 sm:p-6 flex flex-col gap-5">
              <Field label="Catégorie">
                {categories === null ? (
                  <p className="text-sm text-stone-light">Chargement…</p>
                ) : (
                  <Select value={form.categoryId} onValueChange={(v) => update("categoryId", v)}>
                    <SelectTrigger className="h-12 w-full" aria-label="Catégorie">
                      <SelectValue placeholder="Choisir" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </Field>
              <Field label="Type (facultatif)" htmlFor="subcategory" hint="Ex. Robes, Sacs bandoulière. Affiché au-dessus du nom.">
                <Input id="subcategory" value={form.subcategory} onChange={(e) => update("subcategory", e.target.value)} />
              </Field>
              <Field label="Ordre d'affichage" htmlFor="position" hint="Du plus petit au plus grand dans la boutique.">
                <Input id="position" type="number" value={form.position} onChange={(e) => update("position", e.target.value)} />
              </Field>
              <Field
                label="Adresse de la page"
                htmlFor="slug"
                hint={product ? "La modifier casse les liens déjà partagés vers ce produit." : "Créée à partir du nom."}
              >
                <Input
                  id="slug"
                  value={form.slug}
                  onChange={(e) => {
                    setSlugTouched(true);
                    update("slug", e.target.value);
                  }}
                  onBlur={() => update("slug", slugify(form.slug))}
                />
                <p className="text-xs text-stone-light mt-1.5 break-all">/produit/{form.slug || "…"}</p>
              </Field>
            </div>
          </Panel>

          <Panel title="Visibilité">
            <div className="p-5 sm:p-6 flex flex-col gap-4">
              <CheckboxField
                label="En vente sur le site"
                hint="Décoché, le produit est masqué mais conservé."
                checked={form.isActive}
                onChange={(v) => update("isActive", v)}
              />
              <CheckboxField label="Badge « Nouveau »" checked={form.isNew} onChange={(v) => update("isNew", v)} />
              <CheckboxField label="Badge « Édition limitée »" checked={form.isLimited} onChange={(v) => update("isLimited", v)} />
              <CheckboxField
                label="Meilleure vente"
                hint="Filtre « Meilleures ventes » de la boutique."
                checked={form.isBestSeller}
                onChange={(v) => update("isBestSeller", v)}
              />
            </div>
          </Panel>

          {product && (
            <button
              type="button"
              onClick={() => setConfirmDelete(true)}
              className="self-start text-xs text-danger underline underline-offset-2 cursor-pointer"
            >
              Supprimer le produit
            </button>
          )}
        </div>
      </div>

      <div className="sticky bottom-0 -mx-5 sm:-mx-8 lg:mx-0 px-5 sm:px-8 lg:px-0 py-4 bg-cream/95 backdrop-blur-sm border-t border-line flex flex-col sm:flex-row sm:items-center gap-3">
        {error && <LoadError>{error}</LoadError>}
        <div className="flex gap-3 sm:ml-auto">
          <Button type="button" variant="outline" onClick={() => router.push("/admin/produits")} disabled={saving}>
            Annuler
          </Button>
          <Button type="submit" variant="primary" disabled={saving} className="flex-1 sm:flex-none">
            {saving ? "Enregistrement…" : product ? "Enregistrer" : "Ajouter le produit"}
          </Button>
        </div>
      </div>

      {product && (
        <ConfirmDialog
          open={confirmDelete}
          onOpenChange={setConfirmDelete}
          title="Supprimer ce produit ?"
          confirmLabel="Supprimer"
          onConfirm={handleDelete}
          pending={deleting}
        >
          « {product.name} » et ses photos seront supprimés. Les commandes passées gardent leur détail. Pour le masquer
          sans perdre sa fiche, décochez plutôt « En vente sur le site ».
        </ConfirmDialog>
      )}
    </form>
  );
}
