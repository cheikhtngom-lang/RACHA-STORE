"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { AccountShell } from "@/components/account/account-shell";
import { useWishlistStore } from "@/store/wishlist-store";

function AccountDashboard() {
  const wishlistCount = useWishlistStore((s) => s.ids.length);

  const cards = [
    { title: "Commandes", detail: "Suivi et historique", href: "/compte/commandes" },
    {
      title: "Liste de souhaits",
      detail: `${wishlistCount} article${wishlistCount > 1 ? "s" : ""}`,
      href: "/liste-de-souhaits",
    },
    { title: "Adresses", detail: "Adresses de livraison", href: "/compte/adresses" },
  ];

  return (
    <div className="flex flex-col gap-10">
      <div className="grid sm:grid-cols-3 gap-4">
        {cards.map((c) => (
          <Link key={c.title} href={c.href} className="group border border-line p-6 hover:border-ink transition-colors">
            <p className="font-display text-2xl text-ink mb-1">{c.title}</p>
            <div className="flex items-center justify-between">
              <p className="text-xs text-stone-light">{c.detail}</p>
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
