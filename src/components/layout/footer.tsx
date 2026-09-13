"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight } from "lucide-react";
import { Logo } from "@/components/shared/logo";
import { InstagramIcon, FacebookIcon, XIcon, TikTokIcon } from "@/components/shared/social-icons";
import { PhoneLink } from "@/components/shared/phone-link";
import { toast } from "sonner";

const columns = [
  {
    title: "Boutique",
    links: [
      { label: "Prêt-à-porter", href: "/boutique/pret-a-porter" },
      { label: "Sacs & Maroquinerie", href: "/boutique/sacs-maroquinerie" },
      { label: "Chaussures", href: "/boutique/chaussures" },
      { label: "Bijoux & Accessoires", href: "/boutique/bijoux-accessoires" },
      { label: "Beauté & Parfums", href: "/boutique/beaute-parfums" },
    ],
  },
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
    ],
  },
];

export function Footer() {
  const [email, setEmail] = useState("");

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
              onSubmit={(e) => {
                e.preventDefault();
                if (!email) return;
                toast.success("Merci pour votre inscription", {
                  description: "Vous recevrez bientôt nos actualités.",
                });
                setEmail("");
              }}
              className="flex items-stretch border-b border-cream/40 focus-within:border-gold transition-colors"
            >
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Votre adresse e-mail"
                className="flex-1 bg-transparent py-3 text-sm placeholder:text-cream/40 focus:outline-none"
              />
              <button type="submit" aria-label="S'inscrire" className="px-2 text-gold-light hover:text-gold cursor-pointer">
                <ArrowRight size={20} strokeWidth={1.5} />
              </button>
            </form>
            <PhoneLink className="text-sm text-cream/70 hover:text-cream transition-colors mt-6" />
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
              href="https://www.instagram.com/racha_store_221?stkn=MXV6YWh6a2Y5cm5tcw=="
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="text-cream/70 hover:text-gold-light transition-colors"
            >
              <InstagramIcon size={18} />
            </a>
            <a
              href="https://www.tiktok.com/@racha2200?_r=1&_t=ZS-99hUf0HvITw"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="TikTok"
              className="text-cream/70 hover:text-gold-light transition-colors"
            >
              <TikTokIcon size={18} />
            </a>
            <a href="#" aria-label="Facebook" className="text-cream/70 hover:text-gold-light transition-colors">
              <FacebookIcon size={18} />
            </a>
            <a href="#" aria-label="X" className="text-cream/70 hover:text-gold-light transition-colors">
              <XIcon size={18} />
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
