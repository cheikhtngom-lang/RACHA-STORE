import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { InstagramIcon } from "@/components/shared/social-icons";
import { Price } from "@/components/shared/price";
import type { Product } from "@/lib/types";

// Bas de l'accueil : de vraies pièces de la boutique (pas de photos d'illustration),
// chacune menant à sa fiche, puis le lien vers le compte Instagram.
export function InstagramGallery({ url, handle, products }: { url: string; handle: string | null; products: Product[] }) {
  return (
    <div className="flex flex-col items-center gap-10 sm:gap-12">
      {products.length > 0 && (
        <ul className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-x-3 gap-y-6 sm:gap-x-4">
          {products.map((product) => (
            <li key={product.id}>
              <Link href={`/produit/${product.slug}`} className="group block">
                <div className="relative aspect-[4/5] overflow-hidden bg-sand">
                  <Image
                    src={product.images[0]}
                    alt={product.name}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                  />
                </div>
                <p className="mt-3 text-sm text-ink truncate">{product.name}</p>
                <Price amount={product.price} compareAt={product.compareAtPrice} size="sm" className="mt-1 text-stone" />
              </Link>
            </li>
          ))}
        </ul>
      )}
      <Button asChild variant="outline" size="md">
        <a href={url} target="_blank" rel="noopener noreferrer">
          <InstagramIcon size={16} />
          {handle ? `Suivre ${handle}` : "Suivre Racha Store"}
        </a>
      </Button>
    </div>
  );
}
