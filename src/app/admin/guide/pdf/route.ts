import { renderToBuffer } from "@react-pdf/renderer";
import { GuideDocument } from "@/lib/admin-guide-pdf";

// Bouton « Télécharger en PDF » de /admin/guide. Le guide ne change qu'à une
// mise en ligne : le PDF est créé une fois, au build, puis servi tel quel.
export const dynamic = "force-static";

export async function GET() {
  const pdf = await renderToBuffer(GuideDocument({ date: new Date() }));
  return new Response(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": 'attachment; filename="guide-administration-racha-store.pdf"',
    },
  });
}
