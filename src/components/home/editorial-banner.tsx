import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { DEFAULT_EDITORIAL_IMAGE, type HomeEditorialRow } from "@/lib/home-editorial";

// Bloc mis en avant de l'accueil : photo et texte choisis dans /admin/parametres.
export function EditorialBanner({ content, categorySlugs }: { content: HomeEditorialRow; categorySlugs: string[] }) {
  // Lien vers une catégorie qui n'existe pas (encore) : la boutique entière plutôt qu'une page introuvable.
  const categoryLink = content.button_url.match(/^\/boutique\/([^/?#]+)/);
  const href = categoryLink && !categorySlugs.includes(categoryLink[1]) ? "/boutique" : content.button_url;

  return (
    <div className="grid lg:grid-cols-2 items-stretch">
      <div className="relative aspect-[4/3] lg:aspect-auto lg:min-h-[560px] bg-sand order-2 lg:order-1">
        <Image
          src={content.image_url ?? DEFAULT_EDITORIAL_IMAGE}
          alt={content.image_url ? content.title : "Femme en grand boubou brodé"}
          fill
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="object-cover object-[50%_30%]"
        />
      </div>
      <div className="order-1 lg:order-2 bg-ink flex items-center">
        <div className="px-8 py-16 sm:px-16 sm:py-24 max-w-lg">
          {content.eyebrow && <p className="eyebrow text-gold-light mb-5">{content.eyebrow}</p>}
          <h2 className="font-display text-3xl sm:text-4xl text-cream leading-tight mb-6">{content.title}</h2>
          {content.body && <p className="text-cream/70 text-sm leading-relaxed mb-8">{content.body}</p>}
          {content.button_label && href && (
            <Button asChild variant="outlineLight" size="lg">
              {href.startsWith("/") ? (
                <Link href={href}>{content.button_label}</Link>
              ) : (
                <a href={href} target="_blank" rel="noopener noreferrer">
                  {content.button_label}
                </a>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
