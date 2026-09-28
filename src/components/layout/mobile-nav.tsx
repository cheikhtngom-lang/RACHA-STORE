"use client";

import Link from "next/link";
import { User, UserPlus, Heart, MapPin, Settings } from "lucide-react";
import { Sheet } from "@/components/ui/sheet";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { PhoneLink } from "@/components/shared/phone-link";
import { useUiStore } from "@/store/ui-store";
import { useAuthStore } from "@/store/auth-store";
import { useCatalog } from "@/components/catalog-provider";
import { address } from "@/lib/site";

export function MobileNav() {
  const isOpen = useUiStore((s) => s.isMobileNavOpen);
  const close = useUiStore((s) => s.closeMobileNav);
  const { categories } = useCatalog();
  const isLoggedIn = useAuthStore((s) => s.status === "authenticated");
  const isAdmin = useAuthStore((s) => s.isAdmin);

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && close()} side="left" title="Menu" widthClassName="w-full sm:w-[380px]">
      <nav className="flex flex-col">
        <Accordion type="single" collapsible className="px-6">
          <AccordionItem value="boutique">
            <AccordionTrigger>Boutique</AccordionTrigger>
            <AccordionContent>
              <ul className="flex flex-col gap-3">
                {categories.map((c) => (
                  <li key={c.id}>
                    <Link href={`/boutique/${c.slug}`} onClick={close} className="text-sm text-stone hover:text-ink">
                      {c.name}
                    </Link>
                  </li>
                ))}
                <li>
                  <Link href="/boutique" onClick={close} className="text-sm text-gold">
                    Voir tout
                  </Link>
                </li>
              </ul>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <div className="flex flex-col px-6 py-6 gap-5 border-t border-line mt-2">
          <Link href="/boutique?filter=nouveautes" onClick={close} className="font-sans-wide text-xs uppercase text-ink">
            Nouveautés
          </Link>
          <Link href="/boutique?filter=bestsellers" onClick={close} className="font-sans-wide text-xs uppercase text-ink">
            Meilleures ventes
          </Link>
          <Link href="/a-propos" onClick={close} className="font-sans-wide text-xs uppercase text-ink">
            Notre histoire
          </Link>
          <Link href="/contact" onClick={close} className="font-sans-wide text-xs uppercase text-ink">
            Contact
          </Link>
        </div>

        <div className="flex flex-col px-6 py-6 gap-5 border-t border-line">
          {isLoggedIn ? (
            <>
              {isAdmin && (
                <Link href="/admin" onClick={close} className="flex items-center gap-3 text-sm text-stone">
                  <Settings size={17} strokeWidth={1.5} /> Administration
                </Link>
              )}
              <Link href="/compte" onClick={close} className="flex items-center gap-3 text-sm text-stone">
                <User size={17} strokeWidth={1.5} /> Mon compte
              </Link>
            </>
          ) : (
            <>
              <Link href="/compte/connexion" onClick={close} className="flex items-center gap-3 text-sm text-stone">
                <User size={17} strokeWidth={1.5} /> Se connecter
              </Link>
              <Link href="/compte/inscription" onClick={close} className="flex items-center gap-3 text-sm text-stone">
                <UserPlus size={17} strokeWidth={1.5} /> Créer un compte
              </Link>
            </>
          )}
          <Link href="/liste-de-souhaits" onClick={close} className="flex items-center gap-3 text-sm text-stone">
            <Heart size={17} strokeWidth={1.5} /> Liste de souhaits
          </Link>
        </div>

        <div className="flex flex-col px-6 py-6 gap-3 border-t border-line text-xs text-stone-light">
          <p className="flex items-center gap-2">
            <MapPin size={14} strokeWidth={1.5} /> {address.district}, {address.city}
          </p>
          <PhoneLink className="text-xs text-stone-light" iconSize={14} />
        </div>
      </nav>
    </Sheet>
  );
}
