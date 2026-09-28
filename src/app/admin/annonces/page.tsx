"use client";

import { useEffect, useState } from "react";
import { ChevronDown, ChevronUp, Plus } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { PageHeader, Panel, Field, CheckboxField, Loading, LoadError, EmptyState, ConfirmDialog } from "@/components/admin/ui";
import { AnnouncementBar } from "@/components/layout/announcement-bar";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DAY, dbErrorMessage, formatDate, fromInputDate, notifyCatalogChanged, toInputDate } from "@/lib/admin/utils";
import { cn } from "@/lib/utils";

type AnnouncementRow = {
  id: string;
  message: string;
  link_url: string | null;
  is_active: boolean;
  starts_at: string | null;
  ends_at: string | null;
  position: number;
};

const MAX_LENGTH = 140;

function isLive(a: AnnouncementRow, now: number) {
  return (
    a.is_active &&
    (!a.starts_at || new Date(a.starts_at).getTime() <= now) &&
    (!a.ends_at || new Date(a.ends_at).getTime() > now)
  );
}

function announcementStatus(a: AnnouncementRow, now: number) {
  if (!a.is_active) return { label: "Masquée", className: "border border-ink/30 text-stone" };
  if (a.ends_at && new Date(a.ends_at).getTime() <= now) return { label: "Terminée", className: "border border-ink/30 text-stone" };
  if (a.starts_at && new Date(a.starts_at).getTime() > now) return { label: "Programmée", className: "bg-gold-pale text-ink" };
  return { label: "En ligne", className: "bg-gold text-ink-dark" };
}

function period(a: AnnouncementRow) {
  const until = a.ends_at ? formatDate(new Date(new Date(a.ends_at).getTime() - DAY).toISOString()) : null;
  const from = a.starts_at ? formatDate(a.starts_at) : null;
  if (from && until) return `Du ${from} au ${until} inclus`;
  if (from) return `À partir du ${from}`;
  if (until) return `Jusqu'au ${until} inclus`;
  return "Sans date limite";
}

export default function AdminAnnouncementsPage() {
  const [rows, setRows] = useState<AnnouncementRow[] | null>(null);
  const [failure, setFailure] = useState<"migration" | "error" | null>(null);
  const [editing, setEditing] = useState<AnnouncementRow | "new" | null>(null);
  const [deleting, setDeleting] = useState<AnnouncementRow | null>(null);
  const [pending, setPending] = useState(false);
  const [version, setVersion] = useState(0);
  // Heure de référence des statuts, relue à chaque chargement de la liste.
  const [now, setNow] = useState(0);

  useEffect(() => {
    createClient()
      .from("announcements")
      .select("id, message, link_url, is_active, starts_at, ends_at, position")
      .order("position")
      .order("created_at")
      .then(({ data, error }) => {
        if (error) {
          // Table absente : la migration n'a pas été exécutée.
          setFailure(error.code === "PGRST205" || error.code === "42P01" ? "migration" : "error");
          return;
        }
        setNow(Date.now());
        setRows(data as AnnouncementRow[]);
      });
  }, [version]);

  function changed(message: string) {
    toast.success(message);
    notifyCatalogChanged();
    setVersion((v) => v + 1);
  }

  async function toggleActive(a: AnnouncementRow) {
    const { error } = await createClient().from("announcements").update({ is_active: !a.is_active }).eq("id", a.id);
    if (error) {
      toast.error(dbErrorMessage(error, "L'annonce n'a pas pu être modifiée."));
      return;
    }
    changed(a.is_active ? "Annonce masquée" : "Annonce affichée");
  }

  // Échange deux annonces voisines ; les positions sont renumérotées 0, 1, 2…
  async function move(index: number, direction: -1 | 1) {
    if (!rows) return;
    const order = [...rows];
    const target = index + direction;
    [order[index], order[target]] = [order[target], order[index]];
    const updates = order
      .map((row, position) => ({ row, position }))
      .filter(({ row, position }) => row.position !== position);
    const supabase = createClient();
    const results = await Promise.all(
      updates.map(({ row, position }) => supabase.from("announcements").update({ position }).eq("id", row.id))
    );
    const error = results.find((r) => r.error)?.error;
    if (error) {
      toast.error(dbErrorMessage(error, "L'ordre n'a pas pu être enregistré."));
      setVersion((v) => v + 1);
      return;
    }
    changed("Ordre enregistré");
  }

  async function handleDelete() {
    if (!deleting) return;
    setPending(true);
    const { error } = await createClient().from("announcements").delete().eq("id", deleting.id);
    setPending(false);
    setDeleting(null);
    if (error) {
      toast.error(dbErrorMessage(error, "L'annonce n'a pas pu être supprimée."));
      return;
    }
    changed("Annonce supprimée");
  }

  const live = rows ? rows.filter((a) => isLive(a, now)) : [];

  return (
    <>
      <PageHeader
        title="Annonces"
        description="Messages du bandeau qui défile en haut de la boutique : soldes, nouvelle collection, fermeture exceptionnelle…"
        action={
          <Button variant="primary" onClick={() => setEditing("new")} disabled={failure !== null}>
            <Plus size={15} strokeWidth={1.5} />
            Nouvelle annonce
          </Button>
        }
      />

      {failure === "migration" && (
        <LoadError>
          Les annonces ne sont pas encore activées : exécutez le fichier supabase/migrations/20260928200000_announcements.sql
          dans Supabase → SQL Editor, puis rechargez la page.
        </LoadError>
      )}
      {failure === "error" && <LoadError>Impossible de charger les annonces. Actualisez la page.</LoadError>}
      {!failure && !rows && <Loading />}

      {rows && (
        <div className="flex flex-col gap-6">
          <Panel title="Aperçu du bandeau">
            <div className="p-5 sm:p-6">
              {live.length > 0 ? (
                <div className="overflow-hidden rounded-md border border-line">
                  <AnnouncementBar announcements={live} />
                </div>
              ) : (
                <p className="text-sm text-stone-light">
                  Aucune annonce en ligne : le bandeau est masqué sur la boutique.
                </p>
              )}
              <p className="text-xs text-stone-light mt-3">
                Ce que voient les visiteurs en ce moment. Chaque modification apparaît aussitôt sur le site.
              </p>
            </div>
          </Panel>

          {rows.length === 0 ? (
            <EmptyState>Aucune annonce pour le moment.</EmptyState>
          ) : (
            <ul className="dash-card overflow-hidden divide-y divide-line">
              {rows.map((a, i) => {
                const status = announcementStatus(a, now);
                return (
                  <li key={a.id} className="flex flex-col sm:flex-row sm:items-center gap-4 px-5 sm:px-6 py-4">
                    <div className="flex sm:flex-col gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => move(i, -1)}
                        disabled={i === 0}
                        aria-label="Monter"
                        className="h-7 w-7 flex items-center justify-center rounded-md text-stone-light hover:text-ink hover:bg-ink/5 disabled:opacity-25 disabled:pointer-events-none cursor-pointer"
                      >
                        <ChevronUp size={16} strokeWidth={1.5} />
                      </button>
                      <button
                        type="button"
                        onClick={() => move(i, 1)}
                        disabled={i === rows.length - 1}
                        aria-label="Descendre"
                        className="h-7 w-7 flex items-center justify-center rounded-md text-stone-light hover:text-ink hover:bg-ink/5 disabled:opacity-25 disabled:pointer-events-none cursor-pointer"
                      >
                        <ChevronDown size={16} strokeWidth={1.5} />
                      </button>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="text-sm text-ink">{a.message}</span>
                        <span className={cn("font-sans-wide text-[0.6rem] uppercase px-2.5 py-1", status.className)}>{status.label}</span>
                      </div>
                      <p className="text-xs text-stone-light mt-1.5 [overflow-wrap:anywhere]">
                        {period(a)}
                        {a.link_url ? ` · Lien : ${a.link_url}` : ""}
                      </p>
                    </div>
                    <div className="flex items-center gap-4 shrink-0">
                      <Button variant="outline" size="sm" onClick={() => setEditing(a)}>
                        Modifier
                      </Button>
                      <button
                        type="button"
                        onClick={() => toggleActive(a)}
                        className="text-xs text-stone hover:text-ink underline underline-offset-2 cursor-pointer"
                      >
                        {a.is_active ? "Masquer" : "Afficher"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleting(a)}
                        className="text-xs text-danger underline underline-offset-2 cursor-pointer"
                      >
                        Supprimer
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}

      {editing && (
        <AnnouncementDialog
          announcement={editing === "new" ? null : editing}
          nextPosition={rows && rows.length > 0 ? Math.max(...rows.map((r) => r.position)) + 1 : 0}
          onClose={() => setEditing(null)}
          onSaved={(message) => {
            setEditing(null);
            changed(message);
          }}
        />
      )}

      <ConfirmDialog
        open={deleting !== null}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="Supprimer cette annonce ?"
        confirmLabel="Supprimer"
        onConfirm={handleDelete}
        pending={pending}
      >
        « {deleting?.message} » disparaîtra du bandeau. Pour la retirer seulement un temps, utilisez plutôt « Masquer ».
      </ConfirmDialog>
    </>
  );
}

function AnnouncementDialog({
  announcement,
  nextPosition,
  onClose,
  onSaved,
}: {
  announcement: AnnouncementRow | null;
  nextPosition: number;
  onClose: () => void;
  onSaved: (message: string) => void;
}) {
  const [message, setMessage] = useState(announcement?.message ?? "");
  const [link, setLink] = useState(announcement?.link_url ?? "");
  const [startsAt, setStartsAt] = useState(toInputDate(announcement?.starts_at ?? null));
  const [endsOn, setEndsOn] = useState(toInputDate(announcement?.ends_at ?? null, -1));
  const [isActive, setIsActive] = useState(announcement?.is_active ?? true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const text = message.trim();
    const url = link.trim();

    if (!text) return setError("Écrivez le texte de l'annonce.");
    if (text.length > MAX_LENGTH) return setError(`L'annonce doit faire ${MAX_LENGTH} caractères au plus.`);
    if (url && !url.startsWith("/") && !url.startsWith("https://")) {
      return setError("Le lien doit être une page du site (commençant par /) ou une adresse complète commençant par https://.");
    }
    if (startsAt && endsOn && endsOn < startsAt) return setError("La date de fin est avant la date de début.");

    const values = {
      message: text,
      link_url: url || null,
      is_active: isActive,
      starts_at: fromInputDate(startsAt),
      ends_at: fromInputDate(endsOn, 1),
    };

    setSaving(true);
    const supabase = createClient();
    const { error: saveError } = announcement
      ? await supabase.from("announcements").update(values).eq("id", announcement.id)
      : await supabase.from("announcements").insert({ ...values, position: nextPosition });
    setSaving(false);

    if (saveError) {
      setError(dbErrorMessage(saveError, "L'annonce n'a pas pu être enregistrée."));
      return;
    }
    onSaved(announcement ? "Annonce enregistrée" : "Annonce ajoutée");
  }

  return (
    <Dialog open onOpenChange={(open) => !open && !saving && onClose()}>
      <DialogContent className="w-[calc(100%-2rem)] max-w-lg p-6 sm:p-8 rounded-[14px] border border-line">
        <DialogTitle className="font-display text-2xl text-ink mb-6 pr-10">
          {announcement ? "Modifier l'annonce" : "Nouvelle annonce"}
        </DialogTitle>
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <Field
            label="Texte"
            htmlFor="announcement-message"
            hint={`${message.trim().length} / ${MAX_LENGTH} caractères. Court et précis, ex. « Soldes : -30 % sur les sacs jusqu'au 15 octobre ».`}
          >
            <Input
              id="announcement-message"
              required
              maxLength={MAX_LENGTH}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              autoComplete="off"
            />
          </Field>
          <Field
            label="Lien (facultatif)"
            htmlFor="announcement-link"
            hint="Page ouverte au clic : une page du site, ex. /boutique/chaussures, ou une adresse complète https://…"
          >
            <Input id="announcement-link" value={link} onChange={(e) => setLink(e.target.value)} placeholder="/boutique" autoComplete="off" />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Début (facultatif)" htmlFor="announcement-start">
              <Input id="announcement-start" type="date" value={startsAt} onChange={(e) => setStartsAt(e.target.value)} />
            </Field>
            <Field label="Fin incluse (facultatif)" htmlFor="announcement-end">
              <Input id="announcement-end" type="date" value={endsOn} onChange={(e) => setEndsOn(e.target.value)} />
            </Field>
          </div>
          <CheckboxField
            label="Afficher sur le site"
            hint="Décochez pour garder l'annonce sans la montrer."
            checked={isActive}
            onChange={setIsActive}
          />
          {error && <LoadError>{error}</LoadError>}
          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 mt-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={saving}>
              Annuler
            </Button>
            <Button type="submit" variant="primary" disabled={saving}>
              {saving ? "Enregistrement…" : "Enregistrer"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
