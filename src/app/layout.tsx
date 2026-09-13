import type { Metadata } from "next";
import { Cormorant_Garamond, Jost, Inter } from "next/font/google";
import { Toaster } from "sonner";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { AnnouncementBar } from "@/components/layout/announcement-bar";
import { CartDrawer } from "@/components/layout/cart-drawer";
import { SearchOverlay } from "@/components/layout/search-overlay";
import { MobileNav } from "@/components/layout/mobile-nav";
import { StoreHydration } from "@/components/store-hydration";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const jost = Jost({
  variable: "--font-jost",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://racha-store.example.com"),
  title: {
    default: "Racha Store — Boutique en ligne de mode & accessoires de luxe",
    template: "%s — Racha Store",
  },
  description:
    "Racha Store, la maison de mode en ligne qui sublime chaque silhouette : prêt-à-porter, maroquinerie, chaussures, bijoux et parfums d'exception.",
  openGraph: {
    title: "Racha Store — Boutique en ligne de mode & accessoires de luxe",
    description:
      "Découvrez des pièces intemporelles façonnées dans des matières nobles. Livraison offerte dès 100 000 F CFA.",
    images: ["/brand/og-image.jpg"],
    locale: "fr_FR",
    type: "website",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="fr"
      className={`${cormorant.variable} ${jost.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-cream text-ink">
        <StoreHydration />
        <AnnouncementBar />
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <CartDrawer />
        <SearchOverlay />
        <MobileNav />
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: "#242c27",
              color: "#faf8f3",
              border: "1px solid #3a453d",
              borderRadius: 0,
              fontSize: "0.82rem",
            },
          }}
        />
      </body>
    </html>
  );
}
