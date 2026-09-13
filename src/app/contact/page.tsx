"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Mail, MapPin, Clock, Phone } from "lucide-react";
import { Input, Textarea, Label } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PhoneLink } from "@/components/shared/phone-link";

const infos = [
  { icon: Mail, title: "E-mail", value: "contact@racha-store.com" },
  { icon: MapPin, title: "Showroom", value: "12 rue des Ateliers, 75011 Paris" },
  { icon: Clock, title: "Horaires", value: "Lun–Sam, 10h–19h" },
];

export default function ContactPage() {
  const [sent, setSent] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSent(true);
    toast.success("Message envoyé", { description: "Notre équipe vous répondra sous 24 à 48h." });
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
          <div className="grid sm:grid-cols-2 gap-6 mb-10">
            <div className="border border-line p-6">
              <Phone size={18} strokeWidth={1.5} className="text-gold mb-3" />
              <p className="text-xs font-sans-wide uppercase text-stone-light mb-1">Téléphone</p>
              <PhoneLink className="text-sm text-ink" showIcon={false} />
            </div>
            {infos.map((info) => (
              <div key={info.title} className="border border-line p-6">
                <info.icon size={18} strokeWidth={1.5} className="text-gold mb-3" />
                <p className="text-xs font-sans-wide uppercase text-stone-light mb-1">{info.title}</p>
                <p className="text-sm text-ink">{info.value}</p>
              </div>
            ))}
          </div>
          <div className="relative aspect-[4/3] bg-sand flex items-center justify-center">
            <p className="eyebrow text-stone-light">Carte — 12 rue des Ateliers, Paris</p>
          </div>
        </div>

        <div className="border border-line p-8 sm:p-10">
          {sent ? (
            <div className="flex flex-col items-center text-center gap-4 py-16">
              <Mail size={36} strokeWidth={1} className="text-gold" />
              <h2 className="font-display text-2xl text-ink">Message envoyé</h2>
              <p className="text-sm text-stone-light max-w-sm">
                Merci de nous avoir contactés. Notre équipe vous répondra dans les meilleurs délais.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="contact-firstname">Prénom</Label>
                  <Input id="contact-firstname" required />
                </div>
                <div>
                  <Label htmlFor="contact-lastname">Nom</Label>
                  <Input id="contact-lastname" required />
                </div>
              </div>
              <div>
                <Label htmlFor="contact-email">Adresse e-mail</Label>
                <Input id="contact-email" type="email" required />
              </div>
              <div>
                <Label htmlFor="contact-subject">Sujet</Label>
                <Input id="contact-subject" required placeholder="Question sur une commande, un produit…" />
              </div>
              <div>
                <Label htmlFor="contact-message">Message</Label>
                <Textarea id="contact-message" rows={6} required />
              </div>
              <Button type="submit" variant="primary" size="lg" className="self-start mt-2">
                Envoyer le message
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
