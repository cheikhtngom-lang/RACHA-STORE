"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Plus, Search } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { PageHeader, Loading, LoadError, EmptyState } from "@/components/admin/ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatPrice, cn } from "@/lib/utils";

type ProductRow = {
  id: string;
  name: string;
  sku: string;
  price: number;
  compare_at_price: number | null;
  stock: number;
  images: string[];
  is_active: boolean;
  category_id: string;
};

type CategoryOption = { id: string; name: string };

export default function AdminProductsPage() {
  const [products, setProducts] = useState<ProductRow[] | null>(null);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [failed, setFailed] = useState(false);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");

  useEffect(() => {
    const supabase = createClient();
    Promise.all([
      supabase
        .from("products")
        .select("id, name, sku, price, compare_at_price, stock, images, is_active, category_id")
        .order("position")
        .order("created_at", { ascending: false }),
      supabase.from("categories").select("id, name").order("position"),
    ]).then(([productsResult, categoriesResult]) => {
      if (productsResult.error || categoriesResult.error) {
        setFailed(true);
        return;
      }
      setProducts(productsResult.data as ProductRow[]);
      setCategories(categoriesResult.data as CategoryOption[]);
    });
  }, []);

  const categoryNames = useMemo(() => new Map(categories.map((c) => [c.id, c.name])), [categories]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (products ?? []).filter(
      (p) =>
        (category === "all" || p.category_id === category) &&
        (!q || p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q))
    );
  }, [products, query, category]);

  const inactive = products?.filter((p) => !p.is_active).length ?? 0;
  const summary = products
    ? `${products.length} produit${products.length > 1 ? "s" : ""}` +
      (inactive > 0 ? `, dont ${inactive} retiré${inactive > 1 ? "s" : ""} de la vente` : "")
    : undefined;

  return (
    <>
      <PageHeader
        title="Produits"
        description={summary}
        action={
          <Button asChild variant="primary">
            <Link href="/admin/produits/nouveau">
              <Plus size={15} strokeWidth={1.5} />
              Ajouter un produit
            </Link>
          </Button>
        }
      />

      {failed && <LoadError>Impossible de charger les produits. Actualisez la page.</LoadError>}
      {!failed && !products && <Loading />}
      {products && (
        <>
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1 max-w-md">
              <Search size={16} strokeWidth={1.5} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-light" />
              <Input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Nom ou SKU"
                className="pl-11"
                aria-label="Rechercher un produit"
              />
            </div>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="h-12 sm:w-64" aria-label="Filtrer par catégorie">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les catégories</SelectItem>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {visible.length === 0 ? (
            <EmptyState>
              {products.length === 0 ? "Aucun produit. Ajoutez votre premier article." : "Aucun produit ne correspond à ces filtres."}
            </EmptyState>
          ) : (
            <ul className="border border-line divide-y divide-line">
              {visible.map((p) => (
                <li key={p.id}>
                  <Link href={`/admin/produits/${p.id}`} className="flex items-center gap-4 px-4 sm:px-6 py-3 hover:bg-sand/50 transition-colors">
                    <div className={cn("relative h-16 w-13 shrink-0 bg-sand", !p.is_active && "opacity-50")}>
                      {p.images[0] && <Image src={p.images[0]} alt="" fill sizes="52px" className="object-cover" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={cn("text-sm truncate", p.is_active ? "text-ink" : "text-stone-light")}>{p.name}</p>
                      <p className="text-xs text-stone-light mt-0.5 truncate">
                        {p.sku} · {categoryNames.get(p.category_id) ?? ""}
                      </p>
                      {!p.is_active && <p className="font-sans-wide text-[0.6rem] uppercase text-stone mt-1">Retiré de la vente</p>}
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0 text-right">
                      <span className="text-sm tabular-nums">{formatPrice(p.price)}</span>
                      <span className={cn("text-xs", p.stock === 0 ? "text-[#6E2A32]" : p.stock <= 3 ? "text-gold" : "text-stone-light")}>
                        {p.stock === 0 ? "Épuisé" : `${p.stock} en stock`}
                      </span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </>
  );
}
