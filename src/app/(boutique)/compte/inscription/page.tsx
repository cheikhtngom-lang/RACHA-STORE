import { permanentRedirect } from "next/navigation";

// Plus de création de compte client : seule la gérante se connecte.
export default function RegisterPage() {
  permanentRedirect("/compte/connexion");
}
