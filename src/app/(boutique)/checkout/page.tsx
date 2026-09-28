"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Lock, ShoppingBag } from "lucide-react";
import { useCartStore } from "@/store/cart-store";
import { useAuthStore } from "@/store/auth-store";
import { Stepper } from "@/components/checkout/stepper";
import { OrderSummary } from "@/components/checkout/order-summary";
import { Input, Label } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { formatPrice } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { discountAmount, shippingCost, SHIPPING_COSTS, type ShippingMethod } from "@/lib/pricing";
import { LAST_ORDER_KEY, type LastOrder } from "@/lib/last-order";

const STEPS = ["Informations", "Livraison", "Paiement"];

// Messages levés par la fonction create_order : on peut les montrer tels quels.
const KNOWN_ORDER_ERRORS =
  /^(Stock insuffisant|Taille invalide|Couleur invalide|Produit introuvable|Code promo invalide|Coordonnées|Le panier est vide|Quantité invalide|Trop de commandes)/;

type ContactForm = LastOrder["contact"];

export default function CheckoutPage() {
  const router = useRouter();
  const items = useCartStore((s) => s.items);
  const subtotal = useCartStore((s) => s.subtotal());
  const promo = useCartStore((s) => s.promo);
  const setPromo = useCartStore((s) => s.setPromo);
  const clear = useCartStore((s) => s.clear);
  const authStatus = useAuthStore((s) => s.status);
  const user = useAuthStore((s) => s.user);

  const [step, setStep] = useState(1);
  const [shippingMethod, setShippingMethod] = useState<ShippingMethod>("standard");
  const [submitting, setSubmitting] = useState(false);
  const [placed, setPlaced] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [contact, setContact] = useState<ContactForm>({
    email: "",
    firstName: "",
    lastName: "",
    phone: "",
    address: "",
    addressComplement: "",
    postalCode: "",
    city: "",
    country: "Sénégal",
  });

  // Client connecté : on préremplit avec son compte et son adresse par défaut.
  useEffect(() => {
    if (authStatus !== "authenticated" || !user) return;
    let cancelled = false;
    createClient()
      .from("addresses")
      .select("full_name, phone, address, address_complement, postal_code, city, country")
      .eq("is_default", true)
      .maybeSingle()
      .then(({ data }) => {
        if (cancelled) return;
        setContact((c) => ({
          ...c,
          email: c.email || user.email,
          firstName: c.firstName || user.firstName,
          lastName: c.lastName || user.lastName,
          phone: c.phone || data?.phone || "",
          address: c.address || data?.address || "",
          addressComplement: c.addressComplement || data?.address_complement || "",
          postalCode: c.postalCode || data?.postal_code || "",
          city: c.city || data?.city || "",
          country: data?.country || c.country,
        }));
      });
    return () => {
      cancelled = true;
    };
  }, [authStatus, user]);

  const discount = discountAmount(subtotal, promo?.percentOff);
  const shipping = shippingCost(subtotal, shippingMethod);
  const total = subtotal - discount + shipping;

  function update<K extends keyof ContactForm>(key: K, value: ContactForm[K]) {
    setContact((c) => ({ ...c, [key]: value }));
  }

  function goToStep(next: number) {
    setStep(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function placeOrder(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const { data, error } = await createClient().rpc("create_order", {
      p_customer: {
        email: contact.email,
        first_name: contact.firstName,
        last_name: contact.lastName,
        phone: contact.phone,
        address: contact.address,
        address_complement: contact.addressComplement,
        postal_code: contact.postalCode,
        city: contact.city,
        country: contact.country,
      },
      p_items: items.map((i) => ({
        product_id: i.productId,
        quantity: i.quantity,
        color: i.color ?? null,
        size: i.size ?? null,
      })),
      p_shipping_method: shippingMethod,
      p_promo_code: promo?.code ?? null,
    });

    const created = (data as { order_number: string; total: number }[] | null)?.[0];
    if (error || !created) {
      const message = error?.message ?? "";
      if (message.startsWith("Code promo invalide")) setPromo(null);
      setError(
        KNOWN_ORDER_ERRORS.test(message)
          ? message
          : "La commande n'a pas pu être enregistrée. Réessayez dans un instant."
      );
      setSubmitting(false);
      return;
    }

    const order: LastOrder = {
      orderNumber: created.order_number,
      date: new Date().toISOString(),
      items,
      subtotal,
      discount,
      promoCode: promo?.code,
      shipping,
      total: created.total,
      contact,
    };
    try {
      sessionStorage.setItem(LAST_ORDER_KEY, JSON.stringify(order));
    } catch {}
    setPlaced(true);
    clear();
    router.push("/checkout/confirmation");
  }

  if (placed) {
    return <div className="mx-auto max-w-[1600px] px-5 sm:px-8 py-28" />;
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-[1600px] px-5 sm:px-8 py-28 flex flex-col items-center text-center gap-5">
        <ShoppingBag size={44} strokeWidth={1} className="text-stone-light" />
        <h1 className="font-display text-3xl text-ink">Votre panier est vide</h1>
        <p className="text-sm text-stone-light max-w-sm">Ajoutez des articles à votre panier avant de passer commande.</p>
        <Button asChild variant="primary" size="lg">
          <Link href="/boutique">Découvrir la boutique</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1600px] px-5 sm:px-8 py-10 sm:py-14">
      <div className="flex items-center justify-between mb-10">
        <h1 className="font-display text-3xl sm:text-4xl text-ink">Commande</h1>
        <p className="hidden sm:flex items-center gap-1.5 text-xs text-stone-light">
          <Lock size={13} strokeWidth={1.5} /> Paiement sécurisé
        </p>
      </div>

      <div className="mb-12 max-w-2xl">
        <Stepper steps={STEPS} current={step} />
      </div>

      <div className="grid lg:grid-cols-[1fr_400px] gap-12 items-start">
        <div>
          {step === 1 && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                goToStep(2);
              }}
              className="flex flex-col gap-6 max-w-xl"
            >
              {authStatus === "anonymous" && (
                <p className="text-sm text-stone">
                  Déjà client·e ?{" "}
                  <Link href="/compte/connexion?next=/checkout" className="text-ink underline underline-offset-2">
                    Connectez-vous
                  </Link>{" "}
                  pour retrouver vos adresses et suivre cette commande.
                </p>
              )}
              <div>
                <Label htmlFor="email">Adresse e-mail</Label>
                <Input id="email" type="email" autoComplete="email" required value={contact.email} onChange={(e) => update("email", e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">Prénom</Label>
                  <Input id="firstName" autoComplete="given-name" required value={contact.firstName} onChange={(e) => update("firstName", e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="lastName">Nom</Label>
                  <Input id="lastName" autoComplete="family-name" required value={contact.lastName} onChange={(e) => update("lastName", e.target.value)} />
                </div>
              </div>
              <div>
                <Label htmlFor="address">Adresse</Label>
                <Input
                  id="address"
                  autoComplete="street-address"
                  required
                  placeholder="Quartier, rue, numéro de villa"
                  value={contact.address}
                  onChange={(e) => update("address", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="addressComplement">Complément d&apos;adresse (facultatif)</Label>
                <Input id="addressComplement" value={contact.addressComplement} onChange={(e) => update("addressComplement", e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="postalCode">Code postal (facultatif)</Label>
                  <Input id="postalCode" autoComplete="postal-code" value={contact.postalCode} onChange={(e) => update("postalCode", e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="city">Ville</Label>
                  <Input id="city" autoComplete="address-level2" required placeholder="Dakar" value={contact.city} onChange={(e) => update("city", e.target.value)} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="country">Pays</Label>
                  <Input id="country" autoComplete="country-name" required value={contact.country} onChange={(e) => update("country", e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="phone">Téléphone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    autoComplete="tel"
                    required
                    placeholder="+221 77 000 00 00"
                    value={contact.phone}
                    onChange={(e) => update("phone", e.target.value)}
                  />
                </div>
              </div>
              <Button type="submit" variant="primary" size="lg" className="mt-2 self-start">
                Continuer vers la livraison
              </Button>
            </form>
          )}

          {step === 2 && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                goToStep(3);
              }}
              className="flex flex-col gap-6 max-w-xl"
            >
              <RadioGroup value={shippingMethod} onValueChange={(v) => setShippingMethod(v as ShippingMethod)} className="flex flex-col gap-4">
                <label className="flex items-center justify-between gap-4 border border-line p-5 cursor-pointer has-[[data-state=checked]]:border-ink">
                  <div className="flex items-center gap-4">
                    <RadioGroupItem value="standard" />
                    <div>
                      <p className="text-sm text-ink">Livraison standard</p>
                      <p className="text-xs text-stone-light">2 à 4 jours ouvrés</p>
                    </div>
                  </div>
                  <span className="text-sm tabular-nums">
                    {shippingCost(subtotal, "standard") === 0 ? "Offerte" : formatPrice(SHIPPING_COSTS.standard)}
                  </span>
                </label>
                <label className="flex items-center justify-between gap-4 border border-line p-5 cursor-pointer has-[[data-state=checked]]:border-ink">
                  <div className="flex items-center gap-4">
                    <RadioGroupItem value="express" />
                    <div>
                      <p className="text-sm text-ink">Livraison express</p>
                      <p className="text-xs text-stone-light">1 à 2 jours ouvrés</p>
                    </div>
                  </div>
                  <span className="text-sm tabular-nums">
                    {shippingCost(subtotal, "express") === 0 ? "Offerte" : formatPrice(SHIPPING_COSTS.express)}
                  </span>
                </label>
              </RadioGroup>
              <div className="flex gap-4 mt-2">
                <Button type="button" variant="outline" size="lg" onClick={() => goToStep(1)}>
                  Retour
                </Button>
                <Button type="submit" variant="primary" size="lg">
                  Continuer vers le paiement
                </Button>
              </div>
            </form>
          )}

          {step === 3 && (
            <form onSubmit={placeOrder} className="flex flex-col gap-6 max-w-xl">
              <div className="border border-line p-5">
                <p className="text-sm text-ink mb-1">Wave, Orange Money ou carte bancaire</p>
                <p className="text-xs text-stone-light leading-relaxed">
                  Le paiement en ligne est en cours de mise en place. Votre commande est enregistrée et reste en
                  attente de paiement.
                </p>
              </div>
              <div className="text-sm text-stone leading-relaxed">
                <p className="text-xs font-sans-wide uppercase text-stone-light mb-2">Livraison à</p>
                <p>
                  {contact.firstName} {contact.lastName}, {contact.phone}
                  <br />
                  {contact.address}
                  {contact.addressComplement ? `, ${contact.addressComplement}` : ""}
                  <br />
                  {[contact.postalCode, contact.city].filter(Boolean).join(" ")}, {contact.country}
                </p>
              </div>
              {error && <p className="text-sm text-danger border border-danger/30 p-4">{error}</p>}
              <div className="flex gap-4 mt-2">
                <Button type="button" variant="outline" size="lg" onClick={() => goToStep(2)} disabled={submitting}>
                  Retour
                </Button>
                <Button type="submit" variant="primary" size="lg" disabled={submitting}>
                  {submitting ? "Enregistrement…" : `Valider la commande (${formatPrice(total)})`}
                </Button>
              </div>
            </form>
          )}
        </div>

        <div className="lg:sticky lg:top-28">
          <OrderSummary
            items={items}
            subtotal={subtotal}
            discount={discount}
            promoCode={promo?.code}
            shipping={shipping}
            total={total}
          />
        </div>
      </div>
    </div>
  );
}
