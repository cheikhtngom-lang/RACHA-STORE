import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { AnnouncementBar } from "@/components/layout/announcement-bar";
import { CartDrawer } from "@/components/layout/cart-drawer";
import { SearchOverlay } from "@/components/layout/search-overlay";
import { MobileNav } from "@/components/layout/mobile-nav";
import { StoreHydration } from "@/components/store-hydration";
import { CatalogProvider } from "@/components/catalog-provider";
import { AuthListener } from "@/components/auth-listener";
import { getCatalog } from "@/lib/catalog";
import { getAnnouncements } from "@/lib/announcements";
import { Analytics } from "@vercel/analytics/next";
import { VisitTracker } from "@/components/visit-tracker";

// En-tête, pied de page, panier et catalogue de la boutique. Utilisé par le
// layout (boutique) et par la page 404, qui ne passe pas par ce layout.
export async function Storefront({ children }: { children: React.ReactNode }) {
  const [catalog, announcements] = await Promise.all([getCatalog(), getAnnouncements()]);

  return (
    <CatalogProvider catalog={catalog}>
      <StoreHydration />
      <AuthListener />
      <AnnouncementBar announcements={announcements} />
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <CartDrawer />
      <SearchOverlay />
      <MobileNav />
      {/* Mesure d'audience Vercel : sans cookie, donc sans bandeau de consentement. Boutique seulement. */}
      <Analytics />
      {/* Compteurs lus par la page Statistiques de l'administration. */}
      <VisitTracker />
    </CatalogProvider>
  );
}
