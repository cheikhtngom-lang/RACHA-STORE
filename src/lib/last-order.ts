import { useMemo, useSyncExternalStore } from "react";

// Commandes passées depuis ce navigateur, sans compte client. La dernière est
// proposée quand le panier est vide (le panier est vidé dès que la commande
// est enregistrée) ; toutes sont listées sur /suivi. Chaque lien mène à la
// page de suivi de la commande, dont l'identifiant aléatoire sert de clé.
const KEY = "racha-store-last-order";
const LIST_KEY = "racha-store-orders";
const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;
const MAX_SAVED = 10;

export type LastOrder = { id: string; number: string; at: number };

export function saveLastOrder(id: string, number: string) {
  const order: LastOrder = { id, number, at: Date.now() };
  try {
    localStorage.setItem(KEY, JSON.stringify(order));
    const list = parseList(localStorage.getItem(LIST_KEY)).filter((o) => o.id !== id);
    localStorage.setItem(LIST_KEY, JSON.stringify([order, ...list].slice(0, MAX_SAVED)));
  } catch {
    // Navigation privée ou stockage bloqué : le lien ne sera simplement pas proposé.
  }
}

function subscribe(onChange: () => void) {
  window.addEventListener("storage", onChange);
  return () => window.removeEventListener("storage", onChange);
}

function isOrder(value: unknown): value is LastOrder {
  const o = value as Partial<LastOrder> | null;
  return typeof o?.id === "string" && typeof o.number === "string" && typeof o.at === "number";
}

function parseList(raw: string | null): LastOrder[] {
  try {
    const list: unknown = JSON.parse(raw ?? "[]");
    return Array.isArray(list) ? list.filter(isOrder) : [];
  } catch {
    return [];
  }
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

function readListRaw() {
  try {
    return localStorage.getItem(LIST_KEY);
  } catch {
    return null;
  }
}

// null côté serveur et au premier affichage : le serveur ne connaît pas le stockage du navigateur.
export function useLastOrder(): LastOrder | null {
  const raw = useSyncExternalStore(subscribe, readRaw, () => null);
  return useMemo(() => {
    if (!raw) return null;
    const value: unknown = JSON.parse(raw);
    return isOrder(value) ? value : null;
  }, [raw]);
}

// null tant que le navigateur n'a pas été lu (premier affichage).
export function useSavedOrders(): LastOrder[] | null {
  const raw = useSyncExternalStore<string | null | undefined>(subscribe, readListRaw, () => undefined);
  return useMemo(() => (raw === undefined ? null : parseList(raw)), [raw]);
}
