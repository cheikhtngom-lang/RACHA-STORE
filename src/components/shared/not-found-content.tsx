import Link from "next/link";
import { Button } from "@/components/ui/button";

export function NotFoundContent() {
  return (
    <div className="mx-auto max-w-xl px-6 py-28 sm:py-36 text-center flex flex-col items-center">
      <p className="font-display text-8xl sm:text-9xl text-gold mb-4">404</p>
      <h1 className="font-display text-3xl sm:text-4xl text-ink mb-4">Cette page s&apos;est égarée</h1>
      <p className="text-sm text-stone-light mb-10 max-w-sm">
        La page que vous recherchez n&apos;existe pas ou a été déplacée. Retournez à l&apos;accueil pour poursuivre
        votre exploration.
      </p>
      <div className="flex flex-col sm:flex-row gap-4">
        <Button asChild variant="primary" size="lg">
          <Link href="/">Retour à l&apos;accueil</Link>
        </Button>
        <Button asChild variant="outline" size="lg">
          <Link href="/boutique">Découvrir la boutique</Link>
        </Button>
      </div>
    </div>
  );
}
