import { Storefront } from "@/components/layout/storefront";

export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return <Storefront>{children}</Storefront>;
}
