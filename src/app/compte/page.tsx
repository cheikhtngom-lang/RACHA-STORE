"use client";

import Link from "next/link";
import { Package, Heart, MapPin, ArrowRight } from "lucide-react";
import { AccountShell } from "@/components/account/account-shell";
import { useWishlistStore } from "@/store/wishlist-store";

function AccountDashboard() {
  const wishlistCount = useWishlistStore((s) => s.ids.length);

  const cards = [
    { label: "Commandes", value: "—", icon: Package, href: "/compte/commandes" },
    { label: "Liste de souhaits", value: String(wishlistCount), icon: Heart, href: "/liste-de-souhaits" },
    { label: "Adresses enregistrées", value: "1", icon: MapPin, href: "/compte/adresses" },
  ];

  return (
    <div className="flex flex-col gap-10">
      <div className="grid sm:grid-cols-3 gap-4">
        {cards.map((c) => (
          <Link key={c.label} href={c.href} className="group border border-line p-6 hover:border-ink transition-colors">
            <c.icon size={20} strokeWidth={1.5} className="text-gold mb-4" />
            <p className="font-display text-3xl text-ink mb-1">{c.value}</p>
            <div className="flex items-center justify-between">
              <p className="text-xs text-stone-light">{c.label}</p>
              <ArrowRight size={14} className="text-stone-light group-hover:text-gold group-hover:translate-x-1 transition-all" />
            </div>
          </Link>
        ))}
      </div>

      <div className="border border-line p-8">
        <p className="font-sans-wide text-[0.68rem] uppercase text-stone-light mb-4">Aucune commande récente</p>
        <p className="text-sm text-stone leading-relaxed mb-6 max-w-md">
          Vous n&apos;avez pas encore passé de commande. Découvrez notre collection et trouvez les pièces qui vous
          ressemblent.
        </p>
        <Link href="/boutique" className="text-xs font-sans-wide uppercase underline underline-offset-4 text-ink">
          Découvrir la boutique
        </Link>
      </div>
    </div>
  );
}

export default function AccountPage() {
  return (
    <AccountShell>
      <AccountDashboard />
    </AccountShell>
  );
}
