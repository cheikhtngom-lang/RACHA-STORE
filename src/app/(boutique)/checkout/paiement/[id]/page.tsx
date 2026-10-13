import { notFound, permanentRedirect } from "next/navigation";
import { isUuid } from "@/lib/payment";

// Ancienne page de paiement PayDunya : les liens déjà envoyés (WhatsApp,
// retour de PayDunya) mènent désormais à la page de suivi de la commande.
export default async function LegacyPaymentPage({ params }: PageProps<"/checkout/paiement/[id]">) {
  const { id } = await params;
  if (!isUuid(id)) notFound();
  permanentRedirect(`/suivi/${id}`);
}
