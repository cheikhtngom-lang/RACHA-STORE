"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutGrid, Package, MapPin, Heart, LogOut, Settings } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/store/auth-store";
import { AuroraBackdrop } from "@/components/dashboard/fx";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Tableau de bord", href: "/compte", icon: LayoutGrid },
  { label: "Commandes", href: "/compte/commandes", icon: Package },
  { label: "Adresses", href: "/compte/adresses", icon: MapPin },
  { label: "Liste de souhaits", href: "/liste-de-souhaits", icon: Heart },
];

const itemClass =
  "relative flex items-center gap-3 px-4 py-2.5 rounded-[10px] text-sm whitespace-nowrap transition-colors cursor-pointer";

// Espace client en thème sombre (.theme-dashboard), entre l'en-tête et le
// pied de page de la boutique qui gardent le leur.
export function AccountShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const status = useAuthStore((s) => s.status);
  const user = useAuthStore((s) => s.user);
  const isAdmin = useAuthStore((s) => s.isAdmin);

  useEffect(() => {
    if (status === "anonymous") {
      router.replace(`/compte/connexion?next=${encodeURIComponent(pathname)}`);
    }
  }, [status, pathname, router]);

  async function signOut() {
    await createClient().auth.signOut();
    toast("Vous êtes déconnecté·e");
    router.push("/");
  }

  if (status !== "authenticated" || !user) {
    return <div className="theme-dashboard flex-1 bg-canvas min-h-[70vh]" />;
  }

  return (
    <div className="theme-dashboard relative flex-1 bg-canvas text-ink overflow-hidden border-b border-line">
      <AuroraBackdrop />
      <div className="relative mx-auto max-w-[1400px] px-5 sm:px-8 py-12 sm:py-16">
        <div className="mb-10 sm:mb-12">
          <p className="eyebrow text-gold-light mb-3">Mon compte</p>
          <h1 className="font-display text-5xl sm:text-6xl text-ink leading-none">
            Bonjour{user.firstName ? ` ${user.firstName}` : ""}
          </h1>
          <p className="text-sm text-stone-light mt-3">{user.email}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[250px_1fr] gap-8 lg:gap-10 items-start">
          <aside className="dash-card min-w-0 p-2 lg:sticky lg:top-28">
            <nav className="flex lg:flex-col gap-1 overflow-x-auto">
              {navItems.map((item) => {
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      itemClass,
                      active
                        ? "bg-gradient-to-r from-gold/15 to-gold/0 text-ink before:absolute before:left-0 before:top-2 before:bottom-2 before:w-[2px] before:rounded-full before:bg-gold before:shadow-[0_0_12px_2px_rgb(201_161_94/0.6)]"
                        : "text-stone-light hover:text-ink hover:bg-ink/5"
                    )}
                  >
                    <item.icon size={16} strokeWidth={1.5} className={active ? "text-gold-light" : undefined} />
                    {item.label}
                  </Link>
                );
              })}
              {isAdmin && (
                <Link href="/admin" className={cn(itemClass, "text-stone-light hover:text-ink hover:bg-ink/5")}>
                  <Settings size={16} strokeWidth={1.5} />
                  Administration
                </Link>
              )}
              <button onClick={signOut} className={cn(itemClass, "text-stone-light hover:text-ink hover:bg-ink/5")}>
                <LogOut size={16} strokeWidth={1.5} />
                Se déconnecter
              </button>
            </nav>
          </aside>

          <div className="min-w-0">{children}</div>
        </div>
      </div>
    </div>
  );
}
