"use client";

import "./globals.css";
import { DEFAULT_SHOP_INFO } from "@/lib/shop-info";

// Dernier recours, si la mise en page générale elle-même plante : remplace
// tout le document, d'où <html> et <body>.
export default function GlobalError({ retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return (
    <html lang="fr">
      <body className="min-h-screen flex items-center justify-center bg-cream text-ink px-6">
        <title>Racha Store</title>
        <div className="max-w-md text-center flex flex-col items-center gap-4">
          <p className="text-2xl tracking-[0.18em]">RACHA STORE</p>
          <h1 className="text-xl">Le site rencontre un problème momentané.</h1>
          <p className="text-sm text-stone-light">Réessayez dans un instant, ou appelez-nous au {DEFAULT_SHOP_INFO.phones[0]?.display}.</p>
          <button type="button" onClick={() => retry()} className="mt-4 h-12 px-8 bg-ink text-cream text-sm cursor-pointer">
            Réessayer
          </button>
        </div>
      </body>
    </html>
  );
}
