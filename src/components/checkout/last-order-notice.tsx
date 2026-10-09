"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useLastOrder } from "@/lib/last-order";
import { cn } from "@/lib/utils";

// Panier vide après une commande : lien vers la page de cette commande, où le
// client peut la payer ou en envoyer le récapitulatif à la boutique sur WhatsApp.
export function LastOrderNotice({ onNavigate, className }: { onNavigate?: () => void; className?: string }) {
  const order = useLastOrder();
  if (!order) return null;
  return (
    <div className={cn("w-full max-w-sm border border-line p-5 text-left", className)}>
      <p className="text-sm text-ink">Votre commande n° {order.number} est enregistrée.</p>
      <p className="text-xs text-stone-light mt-1.5 leading-relaxed">
        Retrouvez-la pour la payer ou pour en envoyer le récapitulatif à la boutique sur WhatsApp.
      </p>
      <Button asChild variant="outline" size="sm" className="mt-4">
        <Link href={`/checkout/paiement/${order.id}`} onClick={onNavigate}>
          Voir ma commande
        </Link>
      </Button>
    </div>
  );
}
