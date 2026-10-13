"use client";

import Link from "next/link";
import { Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useShopInfo } from "@/components/shop-info-provider";
import { useSavedOrders } from "@/lib/last-order";
import { whatsappNumber } from "@/lib/utils";

// « Suivre ma commande », sans compte : les commandes passées depuis ce
// navigateur (gardées par saveLastOrder). Sur un autre appareil, le client
// retrouve le lien de suivi dans le message WhatsApp envoyé à la boutique.
export default function SavedOrdersPage() {
  const orders = useSavedOrders();
  const shop = useShopInfo();
  const phone = shop.phones[0];

  return (
    <div className="mx-auto max-w-2xl px-5 sm:px-8 py-20 sm:py-28">
      <p className="eyebrow text-gold mb-4 text-center">Sans compte</p>
      <h1 className="font-display text-4xl sm:text-5xl text-ink text-center mb-4">Suivre ma commande</h1>
      <p className="text-sm text-stone-light text-center max-w-md mx-auto mb-12">
        Vos commandes passées depuis ce téléphone ou cet ordinateur. Chacune a sa page de suivi, mise à jour à chaque étape.
      </p>

      {orders === null ? null : orders.length === 0 ? (
        <div className="border border-line p-8 text-center flex flex-col items-center gap-4">
          <Package size={36} strokeWidth={1} className="text-stone-light" />
          <p className="text-sm text-stone max-w-sm">
            Aucune commande sur cet appareil. Le lien de suivi se trouve aussi à la fin du message WhatsApp envoyé à la boutique après
            votre commande.
          </p>
          <Button asChild variant="outline" size="lg">
            <Link href="/boutique">Découvrir la boutique</Link>
          </Button>
        </div>
      ) : (
        <ul className="border border-line divide-y divide-line">
          {orders.map((o) => (
            <li key={o.id}>
              <Link href={`/suivi/${o.id}`} className="flex items-center justify-between gap-4 p-5 sm:p-6 hover:bg-sand/50 transition-colors">
                <div>
                  <p className="text-sm text-ink">Commande n° {o.number}</p>
                  <p className="text-xs text-stone-light mt-1">
                    Passée le {new Date(o.at).toLocaleDateString("fr-FR", { dateStyle: "long" })}
                  </p>
                </div>
                <span className="text-xs font-sans-wide uppercase text-ink underline underline-offset-4">Voir le suivi</span>
              </Link>
            </li>
          ))}
        </ul>
      )}

      {phone && (
        <p className="text-xs text-stone-light text-center mt-10">
          Une question ? Appelez ou écrivez sur WhatsApp au{" "}
          <a href={`https://wa.me/${whatsappNumber(phone.tel)}`} target="_blank" rel="noopener noreferrer" className="text-ink underline underline-offset-2">
            {phone.display}
          </a>
          .
        </p>
      )}
    </div>
  );
}
