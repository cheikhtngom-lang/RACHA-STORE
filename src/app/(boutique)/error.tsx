"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PhoneLink } from "@/components/shared/phone-link";

// Erreur inattendue dans une page de la boutique. En production, le détail
// technique n'est jamais envoyé au navigateur (seulement une référence).
export default function ShopError({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return (
    <div className="mx-auto max-w-xl px-6 py-28 sm:py-36 text-center flex flex-col items-center">
      <p className="eyebrow text-gold mb-4">Erreur</p>
      <h1 className="font-display text-3xl sm:text-4xl text-ink mb-4">Cette page n&apos;a pas pu s&apos;afficher</h1>
      <p className="text-sm text-stone-light mb-2 max-w-sm">
        Réessayez dans un instant. Si le problème continue, appelez-nous :
      </p>
      <PhoneLink className="text-sm text-ink mb-10" />
      <div className="flex flex-col sm:flex-row gap-4">
        <Button variant="primary" size="lg" onClick={() => retry()}>
          Réessayer
        </Button>
        <Button asChild variant="outline" size="lg">
          <Link href="/">Retour à l&apos;accueil</Link>
        </Button>
      </div>
      {error.digest && <p className="text-xs text-stone-light mt-10">Référence : {error.digest}</p>}
    </div>
  );
}
