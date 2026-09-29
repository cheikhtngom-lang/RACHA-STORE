"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { requestPaymentUrl } from "@/lib/payment-client";
import { useAuthStore } from "@/store/auth-store";
import { formatPrice } from "@/lib/utils";

// Bouton « Payer » de /checkout/paiement/[id] : rouvre la page PayDunya.
export function PayButton({ orderId, total, initialError }: { orderId: string; total: number; initialError: boolean }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(initialError);

  async function pay() {
    setPending(true);
    setError(false);
    const url = await requestPaymentUrl(orderId);
    if (url) {
      window.location.assign(url);
      return;
    }
    // La commande a peut-être été payée ou annulée entre-temps.
    router.refresh();
    setPending(false);
    setError(true);
  }

  return (
    <div className="flex flex-col items-center gap-4">
      {error && (
        <p className="text-sm text-danger border border-danger/30 p-4 max-w-md">
          La page de paiement n&apos;a pas pu s&apos;ouvrir. Réessayez dans un instant.
        </p>
      )}
      <Button type="button" variant="primary" size="lg" onClick={pay} disabled={pending}>
        {pending ? "Redirection vers le paiement…" : `Payer ${formatPrice(total)}`}
      </Button>
    </div>
  );
}

export function AccountOrdersLink() {
  const isAuthenticated = useAuthStore((s) => s.status === "authenticated");
  if (!isAuthenticated) return null;
  return (
    <Button asChild variant="outline" size="lg">
      <Link href="/compte/commandes">Voir mes commandes</Link>
    </Button>
  );
}
