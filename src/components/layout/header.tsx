"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Search, User, Heart, ShoppingBag, ChevronDown } from "lucide-react";
import { Logo } from "@/components/shared/logo";
import { useCatalog } from "@/components/catalog-provider";
import { useUiStore } from "@/store/ui-store";
import { useCartStore } from "@/store/cart-store";
import { useWishlistStore } from "@/store/wishlist-store";
import { cn } from "@/lib/utils";

const navLinks = [
  { label: "Nouveautés", href: "/boutique?filter=nouveautes" },
  { label: "Meilleures ventes", href: "/boutique?filter=bestsellers" },
  { label: "Notre histoire", href: "/a-propos" },
];

export function Header() {
  const pathname = usePathname();
  const { categories } = useCatalog();
  const isHome = pathname === "/";
  const [scrolled, setScrolled] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);

  const openMobileNav = useUiStore((s) => s.openMobileNav);
  const openSearch = useUiStore((s) => s.openSearch);
  const openCart = useUiStore((s) => s.openCart);
  const cartCount = useCartStore((s) => s.totalItems());
  const wishlistCount = useWishlistStore((s) => s.ids.length);

  useEffect(() => {
    if (!isHome) return;
    const onScroll = () => setScrolled(window.scrollY > 60);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [isHome]);

  const transparent = isHome && !scrolled;

  return (
    <header
      className={cn(
        "sticky top-0 z-40 transition-colors duration-500",
        transparent ? "bg-transparent" : "bg-cream/95 backdrop-blur-md border-b border-line shadow-[0_1px_0_0_rgba(0,0,0,0.02)]"
      )}
      onMouseLeave={() => setMegaOpen(false)}
    >
      <div className="mx-auto max-w-[1600px] px-5 sm:px-8 h-20 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <button
            aria-label="Ouvrir le menu"
            onClick={openMobileNav}
            className={cn("lg:hidden cursor-pointer", transparent ? "text-cream" : "text-ink")}
          >
            <Menu size={22} strokeWidth={1.5} />
          </button>

          <nav className={cn("hidden lg:flex items-center gap-8", transparent ? "text-cream" : "text-ink")}>
            <div className="relative" onMouseEnter={() => setMegaOpen(true)}>
              <button className="flex items-center gap-1.5 font-sans-wide text-[0.72rem] uppercase cursor-pointer">
                Boutique
                <ChevronDown size={13} strokeWidth={1.5} className={cn("transition-transform", megaOpen && "rotate-180")} />
              </button>
            </div>
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} className="font-sans-wide text-[0.72rem] uppercase hover:text-gold transition-colors">
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className={cn("absolute left-1/2 -translate-x-1/2", transparent ? "text-cream" : "text-ink")}>
          <Logo light={transparent} />
        </div>

        <div className={cn("flex items-center gap-5", transparent ? "text-cream" : "text-ink")}>
          <button aria-label="Rechercher" onClick={openSearch} className="hidden sm:flex cursor-pointer hover:text-gold transition-colors">
            <Search size={19} strokeWidth={1.5} />
          </button>
          <Link href="/compte" aria-label="Mon compte" className="hidden sm:flex cursor-pointer hover:text-gold transition-colors">
            <User size={19} strokeWidth={1.5} />
          </Link>
          <Link href="/liste-de-souhaits" aria-label="Liste de souhaits" className="relative cursor-pointer hover:text-gold transition-colors">
            <Heart size={19} strokeWidth={1.5} />
            {wishlistCount > 0 && (
              <span className="absolute -top-2 -right-2 h-4 w-4 rounded-full bg-gold text-ink-dark text-[0.6rem] flex items-center justify-center">
                {wishlistCount}
              </span>
            )}
          </Link>
          <button aria-label="Panier" onClick={openCart} className="relative cursor-pointer hover:text-gold transition-colors">
            <ShoppingBag size={19} strokeWidth={1.5} />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 h-4 w-4 rounded-full bg-gold text-ink-dark text-[0.6rem] flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Mega menu */}
      <div
        className={cn(
          "absolute left-0 right-0 top-full bg-cream border-b border-line shadow-xl overflow-hidden transition-all duration-300",
          megaOpen ? "max-h-[420px] opacity-100" : "max-h-0 opacity-0 pointer-events-none"
        )}
        onMouseEnter={() => setMegaOpen(true)}
      >
        <div className="mx-auto max-w-[1600px] px-8 py-10 grid grid-cols-4 gap-10">
          <div className="col-span-1 flex flex-col gap-3">
            <p className="eyebrow text-gold mb-1">Catégories</p>
            {categories.map((c) => (
              <Link
                key={c.id}
                href={`/boutique/${c.slug}`}
                onClick={() => setMegaOpen(false)}
                className="font-display text-lg text-ink hover:text-gold transition-colors"
              >
                {c.name}
              </Link>
            ))}
            <Link
              href="/boutique"
              onClick={() => setMegaOpen(false)}
              className="font-sans-wide text-[0.68rem] uppercase text-ink underline underline-offset-4 mt-2"
            >
              Voir toute la boutique
            </Link>
          </div>
          <div className="col-span-3 grid grid-cols-3 gap-5">
            {categories.slice(0, 3).map((c) => (
              <Link key={c.id} href={`/boutique/${c.slug}`} onClick={() => setMegaOpen(false)} className="group relative aspect-[4/5] overflow-hidden bg-sand block">
                {c.image && <Image src={c.image} alt={c.name} fill sizes="300px" className="object-cover transition-transform duration-700 group-hover:scale-105" />}
                <div className="absolute inset-0 bg-gradient-to-t from-ink-dark/60 via-transparent to-transparent" />
                <span className="absolute bottom-4 left-4 font-display text-xl text-cream">{c.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}
