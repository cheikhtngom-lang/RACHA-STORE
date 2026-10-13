import { permanentRedirect } from "next/navigation";

// Les clients commandent sans compte depuis octobre 2026 : l'ancien espace
// « Mon compte » mène au suivi des commandes passées depuis l'appareil. Seule
// la gérante se connecte encore (/compte/connexion, puis /admin).
export default function AccountPage() {
  permanentRedirect("/suivi");
}
