"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutGrid, Package, MapPin, Heart, LogOut } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/store/auth-store";
import { cn } from "@/lib/utils";

const navItems = [
  { label: "Tableau de bord", href: "/compte", icon: LayoutGrid },
  { label: "Commandes", href: "/compte/commandes", icon: Package },
  { label: "Adresses", href: "/compte/adresses", icon: MapPin },
  { label: "Liste de souhaits", href: "/liste-de-souhaits", icon: Heart },
];

export function AccountShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const status = useAuthStore((s) => s.status);
  const user = useAuthStore((s) => s.user);

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
    return <div className="mx-auto max-w-[1600px] px-5 sm:px-8 py-28" />;
  }

  return (
    <div className="mx-auto max-w-[1600px] px-5 sm:px-8 py-10 sm:py-14">
      <div className="mb-10">
        <p className="eyebrow text-gold mb-2">Mon compte</p>
        <h1 className="font-display text-4xl sm:text-5xl text-ink">
          Bonjour{user.firstName ? ` ${user.firstName}` : ""}
        </h1>
        <p className="text-sm text-stone-light mt-2">{user.email}</p>
      </div>

      <div className="grid lg:grid-cols-[240px_1fr] gap-12">
        <aside>
          <nav className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible">
            {navItems.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 text-sm whitespace-nowrap transition-colors",
                    active ? "bg-ink text-cream" : "text-stone hover:bg-sand"
                  )}
                >
                  <item.icon size={16} strokeWidth={1.5} />
                  {item.label}
                </Link>
              );
            })}
            <button
              onClick={signOut}
              className="flex items-center gap-3 px-4 py-3 text-sm text-stone hover:bg-sand transition-colors cursor-pointer whitespace-nowrap"
            >
              <LogOut size={16} strokeWidth={1.5} />
              Se déconnecter
            </button>
          </nav>
        </aside>

        <div>{children}</div>
      </div>
    </div>
  );
}
