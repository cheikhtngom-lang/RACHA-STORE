"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Lock, ShoppingBag } from "lucide-react";
import { useCartStore } from "@/store/cart-store";
import { Stepper } from "@/components/checkout/stepper";
import { OrderSummary } from "@/components/checkout/order-summary";
import { Input, Label } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { formatPrice } from "@/lib/utils";

const STEPS = ["Informations", "Livraison", "Paiement"];
const FREE_SHIPPING_THRESHOLD = 100000;

type ContactForm = {
  email: string;
  firstName: string;
  lastName: string;
  address: string;
  addressComplement: string;
  postalCode: string;
  city: string;
  country: string;
  phone: string;
};

export default function CheckoutPage() {
  const router = useRouter();
  const items = useCartStore((s) => s.items);
  const subtotal = useCartStore((s) => s.subtotal());
  const clear = useCartStore((s) => s.clear);

  const [step, setStep] = useState(1);
  const [shippingMethod, setShippingMethod] = useState<"standard" | "express">("standard");
  const [processing, setProcessing] = useState(false);
  const [contact, setContact] = useState<ContactForm>({
    email: "",
    firstName: "",
    lastName: "",
    address: "",
    addressComplement: "",
    postalCode: "",
    city: "",
    country: "France",
    phone: "",
  });

  const shippingCost =
    subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : shippingMethod === "express" ? 10000 : 5000;
  const total = subtotal + shippingCost;

  function update<K extends keyof ContactForm>(key: K, value: ContactForm[K]) {
    setContact((c) => ({ ...c, [key]: value }));
  }

  function handleStep1(e: React.FormEvent) {
    e.preventDefault();
    setStep(2);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleStep2(e: React.FormEvent) {
    e.preventDefault();
    setStep(3);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handlePayment(e: React.FormEvent) {
    e.preventDefault();
    setProcessing(true);
    const orderNumber = `RS-${Math.floor(100000 + Math.random() * 900000)}`;
    const order = {
      orderNumber,
      items,
      subtotal,
      shipping: shippingCost,
      total,
      contact,
      date: new Date().toISOString(),
    };
    setTimeout(() => {
      try {
        sessionStorage.setItem("racha-store-last-order", JSON.stringify(order));
      } catch {}
      clear();
      router.push("/checkout/confirmation");
    }, 1200);
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
            <form onSubmit={handleStep1} className="flex flex-col gap-6 max-w-xl">
              <div>
                <Label htmlFor="email">Adresse e-mail</Label>
                <Input id="email" type="email" required value={contact.email} onChange={(e) => update("email", e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">Prénom</Label>
                  <Input id="firstName" required value={contact.firstName} onChange={(e) => update("firstName", e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="lastName">Nom</Label>
                  <Input id="lastName" required value={contact.lastName} onChange={(e) => update("lastName", e.target.value)} />
                </div>
              </div>
              <div>
                <Label htmlFor="address">Adresse</Label>
                <Input id="address" required value={contact.address} onChange={(e) => update("address", e.target.value)} />
              </div>
              <div>
                <Label htmlFor="addressComplement">Complément d&apos;adresse (facultatif)</Label>
                <Input id="addressComplement" value={contact.addressComplement} onChange={(e) => update("addressComplement", e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="postalCode">Code postal</Label>
                  <Input id="postalCode" required value={contact.postalCode} onChange={(e) => update("postalCode", e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="city">Ville</Label>
                  <Input id="city" required value={contact.city} onChange={(e) => update("city", e.target.value)} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="country">Pays</Label>
                  <Input id="country" required value={contact.country} onChange={(e) => update("country", e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="phone">Téléphone</Label>
                  <Input id="phone" type="tel" required value={contact.phone} onChange={(e) => update("phone", e.target.value)} />
                </div>
              </div>
              <Button type="submit" variant="primary" size="lg" className="mt-2 self-start">
                Continuer vers la livraison
              </Button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleStep2} className="flex flex-col gap-6 max-w-xl">
              <RadioGroup value={shippingMethod} onValueChange={(v) => setShippingMethod(v as "standard" | "express")} className="flex flex-col gap-4">
                <label className="flex items-center justify-between gap-4 border border-line p-5 cursor-pointer has-[[data-state=checked]]:border-ink">
                  <div className="flex items-center gap-4">
                    <RadioGroupItem value="standard" />
                    <div>
                      <p className="text-sm text-ink">Livraison standard</p>
                      <p className="text-xs text-stone-light">2 à 4 jours ouvrés</p>
                    </div>
                  </div>
                  <span className="text-sm tabular-nums">
                    {subtotal >= FREE_SHIPPING_THRESHOLD ? "Offerte" : formatPrice(5000)}
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
                    {subtotal >= FREE_SHIPPING_THRESHOLD ? "Offerte" : formatPrice(10000)}
                  </span>
                </label>
              </RadioGroup>
              <div className="flex gap-4 mt-2">
                <Button type="button" variant="outline" size="lg" onClick={() => setStep(1)}>
                  Retour
                </Button>
                <Button type="submit" variant="primary" size="lg">
                  Continuer vers le paiement
                </Button>
              </div>
            </form>
          )}

          {step === 3 && (
            <form onSubmit={handlePayment} className="flex flex-col gap-6 max-w-xl">
              <div>
                <Label htmlFor="cardName">Nom sur la carte</Label>
                <Input id="cardName" required placeholder="J. Dupont" />
              </div>
              <div>
                <Label htmlFor="cardNumber">Numéro de carte</Label>
                <Input id="cardNumber" required placeholder="1234 5678 9012 3456" inputMode="numeric" maxLength={19} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="cardExpiry">Date d&apos;expiration</Label>
                  <Input id="cardExpiry" required placeholder="MM / AA" maxLength={7} />
                </div>
                <div>
                  <Label htmlFor="cardCvc">CVC</Label>
                  <Input id="cardCvc" required placeholder="123" inputMode="numeric" maxLength={4} />
                </div>
              </div>
              <p className="text-xs text-stone-light -mt-2">
                Environnement de démonstration — aucun paiement réel ne sera effectué.
              </p>
              <div className="flex gap-4 mt-2">
                <Button type="button" variant="outline" size="lg" onClick={() => setStep(2)} disabled={processing}>
                  Retour
                </Button>
                <Button type="submit" variant="primary" size="lg" disabled={processing}>
                  {processing ? "Traitement en cours…" : `Payer ${formatPrice(total)}`}
                </Button>
              </div>
            </form>
          )}
        </div>

        <div className="lg:sticky lg:top-28">
          <OrderSummary items={items} subtotal={subtotal} shipping={shippingCost} total={total} />
        </div>
      </div>
    </div>
  );
}
