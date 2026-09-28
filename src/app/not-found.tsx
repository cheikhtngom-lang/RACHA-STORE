import { Storefront } from "@/components/layout/storefront";
import { NotFoundContent } from "@/components/shared/not-found-content";

// Adresse qui ne correspond à aucune page : rendu hors du layout (boutique),
// d'où l'en-tête et le pied de page ajoutés ici.
export default function NotFound() {
  return (
    <Storefront>
      <NotFoundContent />
    </Storefront>
  );
}
