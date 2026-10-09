import { useMemo, useSyncExternalStore } from "react";

// Dernière commande passée dans ce navigateur. Le panier est vidé dès que la
// commande est enregistrée : si le client quitte PayDunya avec le bouton
// « Retour » ou ferme la page, le panier vide lui redonne le lien vers sa
// commande (paiement, envoi du récapitulatif sur WhatsApp).
const KEY = "racha-store-last-order";
const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

export type LastOrder = { id: string; number: string; at: number };

export function saveLastOrder(id: string, number: string) {
  try {
    localStorage.setItem(KEY, JSON.stringify({ id, number, at: Date.now() } satisfies LastOrder));
  } catch {
    // Navigation privée ou stockage bloqué : le lien ne sera simplement pas proposé.
  }
}

function subscribe(onChange: () => void) {
  window.addEventListener("storage", onChange);
  return () => window.removeEventListener("storage", onChange);
}

// Texte brut du stockage : une chaîne, donc stable d'un appel à l'autre comme
// l'exige useSyncExternalStore. Une commande de plus de 7 jours est oubliée.
function readRaw() {
  try {
    const raw = localStorage.getItem(KEY);
    const at = raw ? (JSON.parse(raw) as Partial<LastOrder>).at : undefined;
    if (raw && (typeof at !== "number" || Date.now() - at > MAX_AGE_MS)) {
      localStorage.removeItem(KEY);
      return null;
    }
    return raw;
  } catch {
    return null;
  }
}

// null côté serveur et au premier affichage : le serveur ne connaît pas le stockage du navigateur.
export function useLastOrder(): LastOrder | null {
  const raw = useSyncExternalStore(subscribe, readRaw, () => null);
  return useMemo(() => {
    if (!raw) return null;
    const value = JSON.parse(raw) as LastOrder;
    return typeof value.id === "string" && typeof value.number === "string" ? value : null;
  }, [raw]);
}
