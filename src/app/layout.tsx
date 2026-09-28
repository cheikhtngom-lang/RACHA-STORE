import type { Metadata } from "next";
import { Cormorant_Garamond, Jost, Inter } from "next/font/google";
import { Toaster } from "sonner";
import { siteUrl } from "@/lib/site";
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
  metadataBase: siteUrl ? new URL(siteUrl) : undefined,
  robots: siteUrl ? undefined : { index: false, follow: false },
  title: {
    default: "Racha Store | Vêtements, sacs, chaussures et bijoux",
    template: "%s | Racha Store",
  },
  description:
    "Prêt-à-porter, sacs, chaussures, bijoux et parfums. Livraison 7j/7 au Sénégal et partout dans le monde, offerte dès 100 000 F CFA.",
  openGraph: {
    title: "Racha Store | Vêtements, sacs, chaussures et bijoux",
    description:
      "Prêt-à-porter, sacs, chaussures, bijoux et parfums. Livraison 7j/7 au Sénégal et partout dans le monde, offerte dès 100 000 F CFA.",
    images: ["/brand/og-image.jpg"],
    locale: "fr_SN",
    type: "website",
  },
};

// Commun à la boutique et à l'administration : l'en-tête et le pied de page
// de la boutique sont dans (boutique)/layout.tsx.
export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="fr"
      className={`${cormorant.variable} ${jost.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-cream text-ink">
        {children}
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
