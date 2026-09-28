"use client";

import { useEffect, useState } from "react";
import { Download } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { PageHeader, Loading, LoadError, EmptyState, ConfirmDialog } from "@/components/admin/ui";
import { Button } from "@/components/ui/button";
import { dbErrorMessage, formatDate } from "@/lib/admin/utils";

type Subscriber = { id: string; email: string; created_at: string };

// Fichier lisible par Excel, Google Sheets ou un outil d'envoi (Brevo, Mailchimp…).
function downloadCsv(subscribers: Subscriber[]) {
  const rows = [["email", "inscrit_le"], ...subscribers.map((s) => [s.email, s.created_at.slice(0, 10)])];
  const csv = rows.map((r) => r.join(",")).join("\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = `newsletter-racha-store-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

export default function AdminNewsletterPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [removing, setRemoving] = useState<Subscriber | null>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    createClient()
      .from("newsletter_subscribers")
      .select("id, email, created_at")
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (error) setFailed(true);
        else setSubscribers(data as Subscriber[]);
      });
  }, []);

  async function handleRemove() {
    if (!removing) return;
    setPending(true);
    const { error } = await createClient().from("newsletter_subscribers").delete().eq("id", removing.id);
    setPending(false);
    if (error) {
      toast.error(dbErrorMessage(error, "L'adresse n'a pas pu être retirée."));
    } else {
      setSubscribers((list) => list?.filter((s) => s.id !== removing.id) ?? null);
      toast.success("Adresse retirée de la liste");
    }
    setRemoving(null);
  }

  return (
    <>
      <PageHeader
        title="Newsletter"
        description={
          subscribers
            ? `${subscribers.length} adresse${subscribers.length > 1 ? "s" : ""} inscrite${subscribers.length > 1 ? "s" : ""} depuis le pied de page du site.`
            : undefined
        }
        action={
          subscribers &&
          subscribers.length > 0 && (
            <Button variant="outline" onClick={() => downloadCsv(subscribers)}>
              <Download size={15} strokeWidth={1.5} />
              Exporter (CSV)
            </Button>
          )
        }
      />

      {failed && <LoadError>Impossible de charger la liste. Actualisez la page.</LoadError>}
      {!failed && !subscribers && <Loading />}
      {subscribers && subscribers.length === 0 && <EmptyState>Personne ne s&apos;est encore inscrit.</EmptyState>}
      {subscribers && subscribers.length > 0 && (
        <ul className="border border-line divide-y divide-line">
          {subscribers.map((s) => (
            <li key={s.id} className="flex items-center justify-between gap-4 px-5 sm:px-6 py-3">
              <div className="min-w-0">
                <p className="text-sm text-ink break-all">{s.email}</p>
                <p className="text-xs text-stone-light mt-0.5">Inscrit le {formatDate(s.created_at)}</p>
              </div>
              <button
                type="button"
                onClick={() => setRemoving(s)}
                className="text-xs text-stone hover:text-[#6E2A32] underline underline-offset-2 cursor-pointer shrink-0"
              >
                Retirer
              </button>
            </li>
          ))}
        </ul>
      )}

      <ConfirmDialog
        open={removing !== null}
        onOpenChange={(open) => !open && setRemoving(null)}
        title="Retirer cette adresse ?"
        confirmLabel="Retirer"
        onConfirm={handleRemove}
        pending={pending}
      >
        {removing?.email} ne fera plus partie de la liste. À faire si la personne demande à se désinscrire.
      </ConfirmDialog>
    </>
  );
}
