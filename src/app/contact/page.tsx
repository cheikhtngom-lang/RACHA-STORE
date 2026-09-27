"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Input, Textarea, Label } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PhoneLink } from "@/components/shared/phone-link";
import { address } from "@/lib/site";
import { createClient } from "@/lib/supabase/client";

const infos: { title: string; value: string; href?: string }[] = [
  { title: "E-mail", value: "contact@racha-store.com" },
  { title: "Adresse", value: address.full, href: address.mapsUrl },
  { title: "Horaires", value: "Du lundi au samedi, de 10h à 19h" },
];

export default function ContactPage() {
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const value = (name: string) => String(form.get(name) ?? "").trim();
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
      toast.error("Le message n'a pas pu être envoyé", { description: "Réessayez, ou appelez-nous." });
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
          Notre équipe est à votre écoute du lundi au samedi pour vous accompagner dans vos choix.
        </p>
      </div>

      <div className="grid lg:grid-cols-[1fr_1.2fr] gap-16">
        <div>
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="border border-line p-6">
              <p className="text-xs font-sans-wide uppercase text-stone-light mb-1">Téléphone</p>
              <PhoneLink className="text-sm text-ink" showIcon={false} />
            </div>
            {infos.map((info) => (
              <div key={info.title} className="border border-line p-6">
                <p className="text-xs font-sans-wide uppercase text-stone-light mb-1">{info.title}</p>
                {info.href ? (
                  <a
                    href={info.href}
                    target="_blank"
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
                  <Input id="contact-firstname" name="firstName" autoComplete="given-name" required />
                </div>
                <div>
                  <Label htmlFor="contact-lastname">Nom</Label>
                  <Input id="contact-lastname" name="lastName" autoComplete="family-name" required />
                </div>
              </div>
              <div>
                <Label htmlFor="contact-email">Adresse e-mail</Label>
                <Input id="contact-email" name="email" type="email" autoComplete="email" required />
              </div>
              <div>
                <Label htmlFor="contact-subject">Sujet</Label>
                <Input id="contact-subject" name="subject" required placeholder="Question sur une commande, un produit…" />
              </div>
              <div>
                <Label htmlFor="contact-message">Message</Label>
                <Textarea id="contact-message" name="message" rows={6} maxLength={5000} required />
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
