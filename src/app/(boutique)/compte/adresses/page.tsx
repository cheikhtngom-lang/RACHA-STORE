import { permanentRedirect } from "next/navigation";

// Ancien carnet d'adresses : les clients n'ont plus de compte.
export default function AccountAddressesPage() {
  permanentRedirect("/suivi");
}
