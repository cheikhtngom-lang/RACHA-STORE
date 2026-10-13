import { permanentRedirect } from "next/navigation";

// Ancienne liste « Mes commandes » : le suivi se fait sans compte, sur /suivi.
export default function AccountOrdersPage() {
  permanentRedirect("/suivi");
}
