import Link from "next/link";
import { ArrowLeft } from "lucide-react";

// En tête des pages de connexion, d'inscription et de mot de passe.
export function BackToShop() {
  return (
    <Link href="/" className="inline-flex items-center gap-2 text-xs text-stone hover:text-ink transition-colors mb-10">
      <ArrowLeft size={14} strokeWidth={1.5} />
      Retour à la boutique
    </Link>
  );
}
