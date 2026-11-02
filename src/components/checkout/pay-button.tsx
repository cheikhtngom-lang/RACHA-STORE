"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { requestPaymentUrl } from "@/lib/payment-client";
import { formatPrice } from "@/lib/utils";

// Bouton « Payer » de la page de suivi : rouvre la page PayDunya d'une
// commande à payer en ligne (paiement abandonné, ou page qui n'a pas pu s'ouvrir).
export function PayButton({ orderId, total, initialError }: { orderId: string; total: number; initialError: boolean }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<{ reason?: string } | null>(initialError ? {} : null);

  async function pay() {
    setPending(true);
    setError(null);
    const result = await requestPaymentUrl(orderId);
    if (result.url) {
      window.location.assign(result.url);
      return;
    }
    // La commande a peut-être été payée ou annulée entre-temps.
    router.refresh();
    setPending(false);
    setError({ reason: result.reason });
  }

  return (
    <div className="flex flex-col items-start gap-4">
      {error && (
        <p className="text-sm text-danger border border-danger/30 p-4">
          La page de paiement n&apos;a pas pu s&apos;ouvrir. Réessayez dans un instant, ou envoyez la commande sur WhatsApp pour
          payer autrement.
          {error.reason && <span className="block text-xs mt-2 break-words">Réponse de PayDunya : {error.reason}</span>}
        </p>
      )}
      <Button type="button" variant="primary" size="lg" onClick={pay} disabled={pending}>
        {pending ? "Redirection vers le paiement…" : `Payer ${formatPrice(total)} en ligne`}
      </Button>
    </div>
  );
}
