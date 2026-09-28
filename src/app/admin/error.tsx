"use client";

import { Button } from "@/components/ui/button";
import { LoadError } from "@/components/admin/ui";

export default function AdminError({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return (
    <div className="flex flex-col gap-6 max-w-lg">
      <h1 className="font-display text-3xl text-ink">Cette page n&apos;a pas pu s&apos;afficher</h1>
      <LoadError>
        Réessayez. Si le problème continue, notez la référence ci-dessous : elle permet de retrouver l&apos;erreur dans
        les journaux de Vercel.
      </LoadError>
      <Button variant="primary" className="self-start" onClick={() => retry()}>
        Réessayer
      </Button>
      {error.digest && <p className="text-xs text-stone-light">Référence : {error.digest}</p>}
    </div>
  );
}
