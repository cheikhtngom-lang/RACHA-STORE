"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutGrid, Package, Shirt, Layers, Ticket, Mail, Users, ExternalLink, LogOut, Menu } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { Sheet } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Access = "loading" | "anonymous" | "forbidden" | "error" | "admin";
type Counts = { orders: number; messages: number };

const navItems: { label: string; href: string; icon: typeof LayoutGrid; count?: keyof Counts }[] = [
  { label: "Tableau de bord", href: "/admin", icon: LayoutGrid },
  { label: "Commandes", href: "/admin/commandes", icon: Package, count: "orders" },
  { label: "Produits", href: "/admin/produits", icon: Shirt },
  { label: "Catégories", href: "/admin/categories", icon: Layers },
  { label: "Codes promo", href: "/admin/codes-promo", icon: Ticket },
  { label: "Messages", href: "/admin/messages", icon: Mail, count: "messages" },
  { label: "Newsletter", href: "/admin/newsletter", icon: Users },
];

function isActive(pathname: string, href: string) {
  return href === "/admin" ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
}

// L'accès réel est contrôlé par la base (RLS + public.is_admin) : cet écran
// évite seulement d'afficher une administration vide à un compte client.
export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [access, setAccess] = useState<Access>("loading");
  const [email, setEmail] = useState("");
  const [counts, setCounts] = useState<Counts>({ orders: 0, messages: 0 });
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session?.user) {
        setAccess("anonymous");
        return;
      }
      if (event === "TOKEN_REFRESHED") return;
      setEmail(session.user.email ?? "");
      // Supabase déconseille d'attendre un autre appel dans ce callback : on le diffère.
      setTimeout(async () => {
        const { data, error } = await supabase.rpc("is_admin");
        setAccess(error ? "error" : data === true ? "admin" : "forbidden");
      }, 0);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (access === "anonymous") {
      router.replace(`/compte/connexion?next=${encodeURIComponent(pathname)}`);
    }
  }, [access, pathname, router]);

  // Pastilles du menu, relues à chaque changement de page.
  useEffect(() => {
    if (access !== "admin") return;
    const supabase = createClient();
    Promise.all([
      supabase.from("orders").select("id", { count: "exact", head: true }).in("status", ["pending", "paid"]),
      supabase.from("contact_messages").select("id", { count: "exact", head: true }).eq("is_read", false),
    ]).then(([orders, messages]) => {
      setCounts({ orders: orders.count ?? 0, messages: messages.count ?? 0 });
    });
  }, [access, pathname]);

  async function signOut() {
    await createClient().auth.signOut();
    toast("Vous êtes déconnecté·e");
    router.push("/");
  }

  if (access === "loading" || access === "anonymous") {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-sm text-stone-light">Chargement…</p>
      </div>
    );
  }

  if (access === "forbidden" || access === "error") {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center px-6 py-28 gap-4">
        <p className="eyebrow text-gold">Administration</p>
        <h1 className="font-display text-3xl sm:text-4xl text-ink">
          {access === "error" ? "Vérification impossible" : "Accès réservé"}
        </h1>
        <p className="text-sm text-stone-light max-w-sm">
          {access === "error"
            ? "Les droits de ce compte n'ont pas pu être vérifiés. Vérifiez la connexion internet puis rechargez la page."
            : `Le compte ${email} n'est pas déclaré comme administrateur de la boutique.`}
        </p>
        <div className="flex flex-col sm:flex-row gap-3 mt-4">
          <Button asChild variant="primary">
            <Link href="/">Retour à la boutique</Link>
          </Button>
          <Button variant="outline" onClick={signOut}>
            Changer de compte
          </Button>
        </div>
      </div>
    );
  }

  const nav = (tone: "dark" | "light") => (
    <nav className="flex flex-col gap-0.5">
      {navItems.map((item) => {
        const active = isActive(pathname, item.href);
        const count = item.count ? counts[item.count] : 0;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setMenuOpen(false)}
            className={cn(
              "flex items-center gap-3 px-4 py-3 text-sm transition-colors",
              tone === "dark"
                ? active
                  ? "bg-cream/10 text-cream"
                  : "text-cream/70 hover:text-cream hover:bg-cream/5"
                : active
                  ? "bg-ink text-cream"
                  : "text-stone hover:bg-sand"
            )}
          >
            <item.icon size={16} strokeWidth={1.5} />
            <span className="flex-1">{item.label}</span>
            {count > 0 && (
              <span className="min-w-5 h-5 px-1.5 flex items-center justify-center bg-gold text-ink-dark text-[0.65rem] tabular-nums">
                {count}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );

  const footerLinks = (tone: "dark" | "light") => {
    const itemClass = cn(
      "flex items-center gap-3 px-4 py-3 text-sm transition-colors cursor-pointer",
      tone === "dark" ? "text-cream/70 hover:text-cream" : "text-stone hover:bg-sand"
    );
    return (
      <div className="flex flex-col gap-0.5">
        <Link href="/" target="_blank" className={itemClass}>
          <ExternalLink size={16} strokeWidth={1.5} />
          Voir la boutique
        </Link>
        <button type="button" onClick={signOut} className={itemClass}>
          <LogOut size={16} strokeWidth={1.5} />
          Se déconnecter
        </button>
        <p className={cn("px-4 pt-3 text-xs truncate", tone === "dark" ? "text-cream/40" : "text-stone-light")}>{email}</p>
      </div>
    );
  };

  return (
    <div className="flex-1 lg:grid lg:grid-cols-[256px_1fr]">
      <aside className="hidden lg:flex flex-col justify-between bg-ink text-cream sticky top-0 h-screen py-8 px-4">
        <div>
          <Link href="/admin" className="block px-4 mb-10">
            <span className="block font-display text-2xl tracking-[0.12em]">RACHA STORE</span>
            <span className="eyebrow text-gold-light">Administration</span>
          </Link>
          {nav("dark")}
        </div>
        {footerLinks("dark")}
      </aside>

      <header className="lg:hidden sticky top-0 z-30 h-16 bg-ink text-cream flex items-center gap-4 px-5">
        <button type="button" aria-label="Ouvrir le menu" onClick={() => setMenuOpen(true)} className="cursor-pointer">
          <Menu size={22} strokeWidth={1.5} />
        </button>
        <Link href="/admin" className="font-display text-xl tracking-[0.12em]">
          RACHA STORE
        </Link>
        {counts.orders > 0 && (
          <Link href="/admin/commandes" className="ml-auto text-xs text-gold-light">
            {counts.orders} commande{counts.orders > 1 ? "s" : ""} à traiter
          </Link>
        )}
      </header>

      <Sheet open={menuOpen} onOpenChange={setMenuOpen} side="left" title="Administration" widthClassName="w-[85vw] max-w-[320px]">
        <div className="flex flex-col justify-between h-full py-4 px-2">
          {nav("light")}
          <div className="border-t border-line pt-4 mt-6">{footerLinks("light")}</div>
        </div>
      </Sheet>

      <main className="min-w-0 px-5 sm:px-8 lg:px-12 py-8 lg:py-12">
        <div className="max-w-[1200px]">{children}</div>
      </main>
    </div>
  );
}
