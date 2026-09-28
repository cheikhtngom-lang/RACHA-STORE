"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutGrid, ChartLine, Package, Shirt, Layers, Ticket, Megaphone, Mail, Users, Settings, ExternalLink, LogOut, Menu } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { Sheet } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { AuroraBackdrop } from "@/components/dashboard/fx";
import { cn } from "@/lib/utils";

type Access = "loading" | "anonymous" | "forbidden" | "error" | "admin";
type Counts = { orders: number; messages: number };

const navItems: { label: string; href: string; icon: typeof LayoutGrid; count?: keyof Counts }[] = [
  { label: "Tableau de bord", href: "/admin", icon: LayoutGrid },
  { label: "Statistiques", href: "/admin/statistiques", icon: ChartLine },
  { label: "Commandes", href: "/admin/commandes", icon: Package, count: "orders" },
  { label: "Produits", href: "/admin/produits", icon: Shirt },
  { label: "Catégories", href: "/admin/categories", icon: Layers },
  { label: "Codes promo", href: "/admin/codes-promo", icon: Ticket },
  { label: "Annonces", href: "/admin/annonces", icon: Megaphone },
  { label: "Messages", href: "/admin/messages", icon: Mail, count: "messages" },
  { label: "Newsletter", href: "/admin/newsletter", icon: Users },
  { label: "Paramètres", href: "/admin/parametres", icon: Settings },
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
  const [name, setName] = useState("");
  const [counts, setCounts] = useState<Counts>({ orders: 0, messages: 0 });
  const [menuOpen, setMenuOpen] = useState(false);

  // Thème sombre sur tout le document : fenêtres, menus et listes déroulantes
  // sont affichés hors de la page et doivent le suivre.
  useEffect(() => {
    document.documentElement.classList.add("theme-dashboard");
    return () => document.documentElement.classList.remove("theme-dashboard");
  }, []);

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
      const meta = session.user.user_metadata ?? {};
      setName([meta.first_name, meta.last_name].filter(Boolean).join(" "));
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
      <div className="theme-dashboard flex-1 flex items-center justify-center bg-canvas text-ink">
        <p className="text-sm text-stone-light">Chargement…</p>
      </div>
    );
  }

  if (access === "forbidden" || access === "error") {
    return (
      <div className="theme-dashboard relative flex-1 flex flex-col items-center justify-center text-center px-6 py-28 gap-4 bg-canvas text-ink overflow-hidden">
        <AuroraBackdrop />
        <p className="relative eyebrow text-gold">Administration</p>
        <h1 className="relative font-display text-3xl sm:text-4xl text-ink">
          {access === "error" ? "Vérification impossible" : "Accès réservé"}
        </h1>
        <p className="relative text-sm text-stone-light max-w-sm">
          {access === "error"
            ? "Les droits de ce compte n'ont pas pu être vérifiés. Vérifiez la connexion internet puis rechargez la page."
            : `Le compte ${email} n'est pas déclaré comme administrateur de la boutique.`}
        </p>
        <div className="relative flex flex-col sm:flex-row gap-3 mt-4">
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

  const nav = () => (
    <nav className="flex flex-col gap-0.5">
      {navItems.map((item) => {
        const active = isActive(pathname, item.href);
        const count = item.count ? counts[item.count] : 0;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setMenuOpen(false)}
            aria-current={active ? "page" : undefined}
            className={cn(
              "relative flex items-center gap-3 px-4 py-2.5 rounded-[10px] text-sm transition-colors",
              active
                ? "bg-gradient-to-r from-gold/15 to-gold/0 text-ink"
                : "text-stone-light hover:text-ink hover:bg-ink/5",
              active && "before:absolute before:left-0 before:top-2 before:bottom-2 before:w-[2px] before:rounded-full before:bg-gold before:shadow-[0_0_12px_2px_rgb(201_161_94/0.6)]"
            )}
          >
            <item.icon size={16} strokeWidth={1.5} className={active ? "text-gold-light" : undefined} />
            <span className="flex-1">{item.label}</span>
            {count > 0 && (
              <span className="min-w-5 h-5 px-1.5 rounded-full flex items-center justify-center bg-gold text-ink-dark text-[0.65rem] font-medium tabular-nums shadow-[0_0_12px_-2px_rgb(201_161_94/0.7)]">
                {count}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );

  const footerLinks = () => {
    const itemClass = cn(
      "flex items-center gap-3 px-4 py-2.5 rounded-[10px] text-sm text-stone-light hover:text-ink hover:bg-ink/5 transition-colors cursor-pointer"
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
        <Link href="/admin/parametres" className="block px-4 pt-3 min-w-0 group">
          {name && <span className="block text-sm text-ink truncate group-hover:text-gold-light transition-colors">{name}</span>}
          <span className="block text-xs text-stone-light/70 truncate">{email}</span>
        </Link>
      </div>
    );
  };

  return (
    <div className="theme-dashboard flex-1 bg-canvas text-ink lg:grid lg:grid-cols-[264px_1fr]">
      <aside className="hidden lg:flex flex-col justify-between sticky top-0 h-screen py-8 px-4 border-r border-line bg-cream/60 backdrop-blur-xl z-10">
        <div>
          <Link href="/admin" className="block px-4 mb-10">
            <span className="fx-shine block font-display text-2xl tracking-[0.12em]">RACHA STORE</span>
            <span className="eyebrow text-stone-light">Administration</span>
          </Link>
          {nav()}
        </div>
        {footerLinks()}
      </aside>

      <header className="lg:hidden sticky top-0 z-30 h-16 bg-cream/80 backdrop-blur-xl border-b border-line flex items-center gap-4 px-5">
        <button type="button" aria-label="Ouvrir le menu" onClick={() => setMenuOpen(true)} className="cursor-pointer">
          <Menu size={22} strokeWidth={1.5} />
        </button>
        <Link href="/admin" className="fx-shine font-display text-xl tracking-[0.12em]">
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
          {nav()}
          <div className="border-t border-line pt-4 mt-6">{footerLinks()}</div>
        </div>
      </Sheet>

      <main className="relative min-w-0 px-5 sm:px-8 lg:px-12 py-8 lg:py-12">
        <AuroraBackdrop />
        <div className="relative max-w-[1280px]">{children}</div>
      </main>
    </div>
  );
}
