"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Input, Textarea, Label } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PhoneLink } from "@/components/shared/phone-link";
import { useShopInfo } from "@/components/shop-info-provider";
import { createClient } from "@/lib/supabase/client";

export default function ContactPage() {
  const shop = useShopInfo();
  const infos: { title: string; value: string; href?: string }[] = [
    ...(shop.contactEmail ? [{ title: "E-mail", value: shop.contactEmail, href: `mailto:${shop.contactEmail}` }] : []),
    { title: "Adresse", value: shop.address },
    ...(shop.openingHours ? [{ title: "Horaires", value: shop.openingHours }] : []),
  ];
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (sending) return;
    const form = new FormData(e.currentTarget);
    const value = (name: string) => String(form.get(name) ?? "").trim();
    // Champ invisible rempli : c'est un robot. On fait comme si tout allait bien.
    if (value("website")) {
      setSent(true);
      return;
    }
    setSending(true);
    const { error } = await createClient().from("contact_messages").insert({
      first_name: value("firstName"),
      last_name: value("lastName"),
      email: value("email"),
      subject: value("subject"),
      message: value("message"),
    });
    setSending(false);
    if (error) {
      // P0001 : limite anti-spam de la base, message déjà rédigé pour le visiteur.
      toast.error("Le message n'a pas pu être envoyé", {
        description: error.code === "P0001" ? error.message : "Réessayez, ou appelez-nous.",
      });
      return;
    }
    setSent(true);
  }

  return (
    <div className="mx-auto max-w-[1400px] px-5 sm:px-8 py-16 sm:py-24">
      <div className="text-center max-w-xl mx-auto mb-16">
        <p className="eyebrow text-gold mb-4">Nous contacter</p>
        <h1 className="font-display text-4xl sm:text-5xl text-ink mb-4">Une question ?</h1>
        <p className="text-sm text-stone-light">
          Notre équipe est à votre écoute pour vous accompagner dans vos choix.
        </p>
      </div>

      <div className="grid lg:grid-cols-[1fr_1.2fr] gap-16">
        <div>
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="border border-line p-6">
              <p className="text-xs font-sans-wide uppercase text-stone-light mb-1">
                {shop.phones.length > 1 ? "Téléphones" : "Téléphone"}
              </p>
              <div className="flex flex-col gap-1">
                {shop.phones.map((number) => (
                  <PhoneLink key={number.tel} number={number} className="text-sm text-ink" showIcon={false} />
                ))}
              </div>
              <p className="text-xs text-stone-light mt-2">Appel ou WhatsApp</p>
            </div>
            {infos.map((info) => (
              <div key={info.title} className="border border-line p-6">
                <p className="text-xs font-sans-wide uppercase text-stone-light mb-1">{info.title}</p>
                {info.href ? (
                  <a
                    href={info.href}
                    target={info.href.startsWith("http") ? "_blank" : undefined}
                    rel="noopener noreferrer"
                    className="text-sm text-ink underline underline-offset-4 decoration-line hover:decoration-ink"
                  >
                    {info.value}
                  </a>
                ) : (
                  <p className="text-sm text-ink">{info.value}</p>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="border border-line p-8 sm:p-10">
          {sent ? (
            <div className="flex flex-col items-center text-center gap-4 py-16">
              <h2 className="font-display text-2xl text-ink">Message envoyé</h2>
              <p className="text-sm text-stone-light max-w-sm">
                Merci de nous avoir contactés. Nous vous répondrons par e-mail.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="contact-firstname">Prénom</Label>
                  <Input id="contact-firstname" name="firstName" autoComplete="given-name" maxLength={100} required />
                </div>
                <div>
                  <Label htmlFor="contact-lastname">Nom</Label>
                  <Input id="contact-lastname" name="lastName" autoComplete="family-name" maxLength={100} required />
                </div>
              </div>
              <div>
                <Label htmlFor="contact-email">Adresse e-mail</Label>
                <Input id="contact-email" name="email" type="email" autoComplete="email" maxLength={254} required />
              </div>
              <div>
                <Label htmlFor="contact-subject">Sujet</Label>
                <Input id="contact-subject" name="subject" maxLength={200} required placeholder="Question sur une commande, un produit…" />
              </div>
              <div>
                <Label htmlFor="contact-message">Message</Label>
                <Textarea id="contact-message" name="message" rows={6} maxLength={5000} required />
              </div>
              {/* Piège à robots : invisible pour un visiteur, rempli par les robots de spam. */}
              <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
                <label htmlFor="contact-website">Site web</label>
                <input id="contact-website" name="website" type="text" tabIndex={-1} autoComplete="off" />
              </div>
              <Button type="submit" variant="primary" size="lg" className="self-start mt-2" disabled={sending}>
                {sending ? "Envoi…" : "Envoyer le message"}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
