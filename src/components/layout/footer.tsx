"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Mail, MapPin } from "lucide-react";
import { Logo } from "@/components/shared/logo";
import { InstagramIcon, TikTokIcon } from "@/components/shared/social-icons";
import { PhoneLink } from "@/components/shared/phone-link";
import { address, footerContact, social } from "@/lib/site";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { useCatalog } from "@/components/catalog-provider";

// La colonne « Boutique » est construite avec les catégories de la base.
const staticColumns = [
  {
    title: "Service client",
    links: [
      { label: "Contact", href: "/contact" },
      { label: "FAQ", href: "/faq" },
      { label: "Livraison & retours", href: "/livraison-retours" },
      { label: "Guide des tailles", href: "/faq#tailles" },
      { label: "Suivre ma commande", href: "/compte/commandes" },
    ],
  },
  {
    title: "La maison",
    links: [
      { label: "Notre histoire", href: "/a-propos" },
      { label: "Éditions limitées", href: "/boutique?filter=edition-limitee" },
      { label: "Mentions légales", href: "/mentions-legales" },
      { label: "CGV", href: "/cgv" },
      { label: "Confidentialité", href: "/confidentialite" },
    ],
  },
];

export function Footer() {
  const { categories } = useCatalog();
  const [email, setEmail] = useState("");
  const [honeypot, setHoneypot] = useState("");
  const [subscribing, setSubscribing] = useState(false);

  const columns = [
    { title: "Boutique", links: categories.map((c) => ({ label: c.name, href: `/boutique/${c.slug}` })) },
    ...staticColumns,
  ];

  async function subscribe(e: React.FormEvent) {
    e.preventDefault();
    if (!email || subscribing) return;
    // Champ invisible rempli : c'est un robot. On fait comme si tout allait bien.
    if (honeypot) {
      setEmail("");
      toast.success("Merci pour votre inscription");
      return;
    }
    setSubscribing(true);
    const { error } = await createClient().rpc("subscribe_newsletter", { p_email: email });
    setSubscribing(false);
    if (error) {
      toast.error("Inscription impossible", {
        // P0001 : message de la base (adresse invalide, limite anti-spam), déjà rédigé pour le visiteur.
        description: error.code === "P0001" ? error.message : "Vérifiez votre adresse e-mail.",
      });
      return;
    }
    toast.success("Merci pour votre inscription", {
      description: "Vous recevrez nos prochaines nouveautés.",
    });
    setEmail("");
  }

  return (
    <footer className="bg-ink text-cream">
      <div className="mx-auto max-w-[1600px] px-5 sm:px-8 pt-20 pb-10">
        <div className="grid lg:grid-cols-[1.3fr_2fr] gap-16 pb-16 border-b border-cream/15">
          <div className="max-w-sm">
            <p className="eyebrow text-gold-light mb-4">Restez informé·e</p>
            <h3 className="font-display text-3xl mb-4">Rejoignez le cercle Racha</h3>
            <p className="text-sm text-cream/65 leading-relaxed mb-6">
              Recevez en avant-première nos nouvelles collections, nos éditions limitées et des offres exclusives.
            </p>
            <form
              onSubmit={subscribe}
              className="relative flex items-stretch border-b border-cream/40 focus-within:border-gold transition-colors"
            >
              <input
                type="email"
                required
                maxLength={254}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Votre adresse e-mail"
                aria-label="Votre adresse e-mail"
                className="flex-1 bg-transparent py-3 text-sm placeholder:text-cream/40 focus:outline-none"
              />
              {/* Piège à robots : invisible pour un visiteur. */}
              <input
                type="text"
                name="website"
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
                className="absolute -left-[9999px] h-px w-px"
              />
              <button
                type="submit"
                aria-label="S'inscrire"
                disabled={subscribing}
                className="px-2 text-gold-light hover:text-gold cursor-pointer disabled:opacity-40"
              >
                <ArrowRight size={20} strokeWidth={1.5} />
              </button>
            </form>
            <div className="mt-12">
              <p className="font-sans-wide text-[0.68rem] uppercase text-gold-light mb-5">Nous contacter</p>
              <ul className="flex flex-col gap-3 text-sm">
                <li>
                  <a
                    href={`mailto:${footerContact.email}`}
                    className="flex items-center gap-2 text-cream/70 hover:text-cream transition-colors [overflow-wrap:anywhere]"
                  >
                    <Mail size={14} strokeWidth={1.5} className="shrink-0" />
                    {footerContact.email}
                  </a>
                </li>
                {footerContact.phones.map((number) => (
                  <li key={number.tel}>
                    <PhoneLink number={number} className="text-cream/70 hover:text-cream transition-colors" />
                  </li>
                ))}
                <li>
                  <a
                    href={address.mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-cream/70 hover:text-cream transition-colors"
                  >
                    <MapPin size={14} strokeWidth={1.5} className="shrink-0" />
                    {address.full}
                  </a>
                </li>
              </ul>
              <p className="text-xs text-cream/50 mt-4">
                Cliquez sur un numéro pour appeler ou écrire sur WhatsApp.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-8">
            {columns.map((col) => (
              <div key={col.title}>
                <p className="font-sans-wide text-[0.68rem] uppercase text-gold-light mb-5">{col.title}</p>
                <ul className="flex flex-col gap-3">
                  {col.links.map((link) => (
                    <li key={link.href}>
                      <Link href={link.href} className="text-sm text-cream/70 hover:text-cream transition-colors">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <Logo light className="items-start sm:items-center" />
          <div className="flex items-center gap-5">
            <a
              href={social.instagram.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="text-cream/70 hover:text-gold-light transition-colors"
            >
              <InstagramIcon size={18} />
            </a>
            <a
              href={social.tiktok.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="TikTok"
              className="text-cream/70 hover:text-gold-light transition-colors"
            >
              <TikTokIcon size={18} />
            </a>
          </div>
          <p className="text-xs text-cream/50 text-center sm:text-right">
            © {new Date().getFullYear()} Racha Store. Tous droits réservés.
          </p>
        </div>
      </div>
    </footer>
  );
}
