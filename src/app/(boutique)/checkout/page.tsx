"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShoppingBag } from "lucide-react";
import { useCartStore } from "@/store/cart-store";
import { Stepper } from "@/components/checkout/stepper";
import { OrderSummary } from "@/components/checkout/order-summary";
import { Input, Label } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useShopInfo } from "@/components/shop-info-provider";
import { formatPrice } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { discountAmount, shippingCost, SHIPPING_COSTS, type ShippingMethod } from "@/lib/pricing";
import { saveLastOrder } from "@/lib/last-order";
import { isMobileMoney, PAYMENT_METHODS, type PaymentMethod } from "@/lib/payment-methods";
import { orderWhatsappUrl } from "@/lib/order-whatsapp";
import { LastOrderNotice } from "@/components/checkout/last-order-notice";

const STEPS = ["Informations", "Livraison", "Paiement"];

// Messages levés par la fonction create_order : on peut les montrer tels quels.
const KNOWN_ORDER_ERRORS =
  /^(Stock insuffisant|Taille invalide|Couleur invalide|Produit introuvable|Code promo invalide|Coordonnées|Le panier est vide|Quantité invalide|Trop de commandes|Moyen de paiement)/;

type ContactForm = {
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
  addressComplement: string;
  postalCode: string;
  city: string;
  country: string;
};

// Commande sans compte client : coordonnées, livraison, puis paiement par Wave
// ou Orange Money (envoi au numéro de la boutique) ou à la livraison. La
// commande arrive « À valider » dans l'administration ; le client l'envoie
// aussi sur WhatsApp et garde un lien de suivi (/suivi/[id]).
export default function CheckoutPage() {
  const router = useRouter();
  const shop = useShopInfo();
  const items = useCartStore((s) => s.items);
  const subtotal = useCartStore((s) => s.subtotal());
  const promo = useCartStore((s) => s.promo);
  const setPromo = useCartStore((s) => s.setPromo);
  const clear = useCartStore((s) => s.clear);

  const [step, setStep] = useState(1);
  const [shippingMethod, setShippingMethod] = useState<ShippingMethod>("standard");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | "">("");
  const [transaction, setTransaction] = useState("");
  // Champ invisible : seuls les robots le remplissent.
  const [website, setWebsite] = useState("");
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

  const discount = discountAmount(subtotal, promo?.percentOff);
  const shipping = shippingCost(subtotal, shippingMethod);
  const total = subtotal - discount + shipping;
  const paymentPhone = shop.paymentPhone;
  const whatsappPhone = shop.phones[0];

  function update<K extends keyof ContactForm>(key: K, value: ContactForm[K]) {
    setContact((c) => ({ ...c, [key]: value }));
  }

  function goToStep(next: number) {
    setStep(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function placeOrder(e: React.FormEvent) {
    e.preventDefault();
    if (submitting) return;
    if (!paymentMethod) {
      setError("Choisissez un moyen de paiement.");
      return;
    }
    setError(null);
    setSubmitting(true);

    // L'onglet WhatsApp s'ouvre dans le clic : après l'attente de la base, le navigateur le bloquerait.
    const whatsappTab = whatsappPhone ? window.open("", "_blank") : null;
    if (whatsappTab) {
      whatsappTab.opener = null;
      try {
        whatsappTab.document.title = "Racha Store";
        whatsappTab.document.body.textContent = "Ouverture de WhatsApp…";
      } catch {
        // Onglet déjà ailleurs : rien à afficher.
      }
    }

    const transactionRef = isMobileMoney(paymentMethod) ? transaction.trim() : "";
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
      p_payment_method: paymentMethod,
      p_transaction_ref: transactionRef || null,
      p_website: website || null,
    });

    const created = (data as { order_id: string; order_number: string; total: number }[] | null)?.[0];
    if (error || !created) {
      whatsappTab?.close();
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

    // Commande enregistrée, stock réservé : récapitulatif sur WhatsApp, panier
    // vidé, puis la page de suivi (qui propose aussi l'envoi sur WhatsApp).
    const trackingPath = `/suivi/${created.order_id}`;
    if (whatsappTab && whatsappPhone) {
      whatsappTab.location.href = orderWhatsappUrl(
        whatsappPhone.tel,
        {
          order_number: created.order_number,
          first_name: contact.firstName.trim(),
          city: contact.city.trim(),
          country: contact.country.trim() || "Sénégal",
          shipping_method: shippingMethod,
          discount,
          promo_code: promo?.code ?? null,
          shipping_cost: shipping,
          total: created.total,
          payment_method: paymentMethod,
          transaction_ref: transactionRef || null,
          order_items: items.map((i) => ({
            product_name: i.name,
            color: i.color ?? null,
            size: i.size ?? null,
            quantity: i.quantity,
            line_total: i.price * i.quantity,
          })),
        },
        `${window.location.origin}${trackingPath}`
      );
    }
    setPlaced(true);
    saveLastOrder(created.order_id, created.order_number);
    clear();
    router.push(`${trackingPath}?nouvelle=1`);
  }

  if (placed) {
    return (
      <div className="mx-auto max-w-[1600px] px-5 sm:px-8 py-28 text-center">
        <p className="text-sm text-stone-light">Commande enregistrée, ouverture du suivi…</p>
      </div>
    );
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
        <LastOrderNotice className="mt-4" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1600px] px-5 sm:px-8 py-10 sm:py-14">
      <div className="flex items-center justify-between mb-10">
        <h1 className="font-display text-3xl sm:text-4xl text-ink">Commande</h1>
        <p className="hidden sm:block text-xs text-stone-light">Sans compte, en 3 étapes</p>
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
                <p className="text-xs text-stone-light mt-2">La boutique vous appelle ou vous écrit sur WhatsApp à ce numéro pour la livraison.</p>
              </div>
              <div>
                <Label htmlFor="email">Adresse e-mail (facultatif)</Label>
                <Input id="email" type="email" autoComplete="email" value={contact.email} onChange={(e) => update("email", e.target.value)} />
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
              <div>
                <Label htmlFor="country">Pays</Label>
                <Input id="country" autoComplete="country-name" required value={contact.country} onChange={(e) => update("country", e.target.value)} />
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
                      <p className="text-xs text-stone-light">7j/7, au Sénégal et partout dans le monde</p>
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
                      <p className="text-xs text-stone-light">En priorité, 7j/7</p>
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
              <RadioGroup
                value={paymentMethod}
                onValueChange={(v) => {
                  setPaymentMethod(v as PaymentMethod);
                  setError(null);
                }}
                className="flex flex-col gap-4"
                aria-label="Moyen de paiement"
              >
                {PAYMENT_METHODS.map((m) => (
                  <label
                    key={m.id}
                    className="flex items-center gap-4 border border-line p-5 cursor-pointer has-[[data-state=checked]]:border-ink"
                  >
                    <RadioGroupItem value={m.id} />
                    <div>
                      <p className="text-sm text-ink">{m.label}</p>
                      <p className="text-xs text-stone-light">{m.hint}</p>
                    </div>
                  </label>
                ))}
              </RadioGroup>

              {isMobileMoney(paymentMethod) && (
                <div className="border border-line bg-sand/40 p-5 flex flex-col gap-4">
                  <p className="text-sm text-ink leading-relaxed">
                    Envoyez <strong className="font-medium tabular-nums">{formatPrice(total)}</strong> par{" "}
                    {paymentMethod === "wave" ? "Wave" : "Orange Money"}
                    {paymentPhone ? (
                      <>
                        {" "}
                        au <strong className="font-medium whitespace-nowrap">{paymentPhone.display}</strong>
                      </>
                    ) : (
                      " au numéro de la boutique"
                    )}
                    .
                  </p>
                  <div>
                    <Label htmlFor="transaction">Numéro de transaction (facultatif)</Label>
                    <Input
                      id="transaction"
                      maxLength={60}
                      value={transaction}
                      onChange={(e) => setTransaction(e.target.value)}
                      placeholder="Reçu par SMS après l'envoi"
                    />
                    <p className="text-xs text-stone-light mt-2">
                      Pas encore payé ? Vous pourrez envoyer la capture du paiement sur WhatsApp juste après la commande.
                    </p>
                  </div>
                </div>
              )}

              {paymentMethod === "cash" && (
                <p className="border border-line bg-sand/40 p-5 text-sm text-ink leading-relaxed">
                  Vous payez <strong className="font-medium tabular-nums">{formatPrice(total)}</strong> au livreur à la réception. La
                  boutique vous appelle avant de préparer le colis.
                </p>
              )}

              {/* Piège à robots : invisible pour les clients, toujours laissé vide. */}
              <label aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden opacity-0 pointer-events-none">
                Site web (laisser vide)
                <input name="website" tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} />
              </label>

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
              <p className="text-xs text-stone-light leading-relaxed">
                Après la commande, WhatsApp s&apos;ouvre avec votre récapitulatif déjà rédigé : envoyez-le à la boutique. Vous
                gardez aussi un lien pour suivre votre commande.
              </p>
              {error && <p className="text-sm text-danger border border-danger/30 p-4">{error}</p>}
              <div className="flex gap-4 mt-2">
                <Button type="button" variant="outline" size="lg" onClick={() => goToStep(2)} disabled={submitting}>
                  Retour
                </Button>
                <Button type="submit" variant="primary" size="lg" disabled={submitting}>
                  {submitting ? "Enregistrement…" : `Valider la commande · ${formatPrice(total)}`}
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
