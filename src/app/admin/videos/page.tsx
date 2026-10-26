"use client";

import { useEffect, useState } from "react";
import { ChevronDown, ChevronUp, Plus } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { PageHeader, Panel, Field, CheckboxField, Loading, LoadError, EmptyState, ConfirmDialog } from "@/components/admin/ui";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { dbErrorMessage, notifyCatalogChanged } from "@/lib/admin/utils";
import { removeVideoFiles, uploadPoster, uploadVideo } from "@/lib/admin/videos";
import { MAX_HOME_VIDEOS, VIDEO_MAX_MB } from "@/lib/home-videos";
import { cn } from "@/lib/utils";

type VideoRow = {
  id: string;
  video_url: string;
  poster_url: string | null;
  title: string;
  body: string;
  button_label: string;
  button_url: string;
  is_active: boolean;
  position: number;
};

const COLUMNS = "id, video_url, poster_url, title, body, button_label, button_url, is_active, position";

export default function AdminVideosPage() {
  const [rows, setRows] = useState<VideoRow[] | null>(null);
  const [failure, setFailure] = useState<"migration" | "error" | null>(null);
  const [editing, setEditing] = useState<VideoRow | null>(null);
  const [deleting, setDeleting] = useState<VideoRow | null>(null);
  const [pending, setPending] = useState(false);
  // Envoi en cours : nom du fichier et avancement de 0 à 1.
  const [upload, setUpload] = useState<{ name: string; progress: number } | null>(null);
  const [version, setVersion] = useState(0);

  useEffect(() => {
    createClient()
      .from("home_videos")
      .select(COLUMNS)
      .order("position")
      .order("created_at")
      .then(({ data, error }) => {
        if (error) {
          // Table absente : la migration n'a pas été exécutée.
          setFailure(error.code === "PGRST205" || error.code === "42P01" ? "migration" : "error");
          return;
        }
        setRows(data as VideoRow[]);
      });
  }, [version]);

  function changed(message: string) {
    toast.success(message);
    notifyCatalogChanged();
    setVersion((v) => v + 1);
  }

  // La vidéo part dans le stockage, son image d'attente est tirée de la vidéo,
  // puis la ligne est créée et la fenêtre des textes s'ouvre.
  async function handleFile(file: File) {
    if (!rows) return;
    setUpload({ name: file.name, progress: 0 });
    try {
      const videoUrl = await uploadVideo(file, (progress) => setUpload({ name: file.name, progress }));
      const posterUrl = await uploadPoster(file);
      const position = rows.length > 0 ? Math.max(...rows.map((r) => r.position)) + 1 : 0;
      const { data, error } = await createClient()
        .from("home_videos")
        .insert({ video_url: videoUrl, poster_url: posterUrl, position })
        .select(COLUMNS)
        .single();
      if (error || !data) {
        removeVideoFiles({ video_url: videoUrl, poster_url: posterUrl }).catch(() => {});
        toast.error(error ? dbErrorMessage(error, "La vidéo n'a pas pu être enregistrée.") : "La vidéo n'a pas pu être enregistrée.");
        return;
      }
      changed("Vidéo en ligne sur l'accueil");
      setEditing(data as VideoRow);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "L'envoi de la vidéo a échoué.");
    } finally {
      setUpload(null);
    }
  }

  async function toggleActive(v: VideoRow) {
    const { error } = await createClient().from("home_videos").update({ is_active: !v.is_active }).eq("id", v.id);
    if (error) {
      toast.error(dbErrorMessage(error, "La vidéo n'a pas pu être modifiée."));
      return;
    }
    changed(v.is_active ? "Vidéo masquée" : "Vidéo affichée");
  }

  // Échange deux vidéos voisines ; les positions sont renumérotées 0, 1, 2…
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
      updates.map(({ row, position }) => supabase.from("home_videos").update({ position }).eq("id", row.id))
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
    const { error } = await createClient().from("home_videos").delete().eq("id", deleting.id);
    setPending(false);
    if (error) {
      toast.error(dbErrorMessage(error, "La vidéo n'a pas pu être supprimée."));
      setDeleting(null);
      return;
    }
    removeVideoFiles(deleting).catch(() => {});
    setDeleting(null);
    changed("Vidéo supprimée");
  }

  const full = rows !== null && rows.length >= MAX_HOME_VIDEOS;

  return (
    <>
      <PageHeader
        title="Vidéos"
        description="Vidéos de la page d'accueil : présentation d'un produit, motion design, publicité. Elles passent l'une après l'autre, dans cet ordre."
        action={
          <Button asChild variant="primary" className={cn((failure !== null || upload !== null || full) && "opacity-40 pointer-events-none")}>
            <label>
              <Plus size={15} strokeWidth={1.5} />
              Ajouter une vidéo
              <input
                type="file"
                accept="video/mp4,.mp4"
                className="sr-only"
                disabled={failure !== null || upload !== null || full}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  e.target.value = "";
                  if (file) handleFile(file);
                }}
              />
            </label>
          </Button>
        }
      />

      {failure === "migration" && (
        <LoadError>
          Les vidéos ne sont pas encore activées : exécutez le fichier supabase/migrations/20261026150000_videos_accueil.sql
          dans Supabase → SQL Editor, puis rechargez la page.
        </LoadError>
      )}
      {failure === "error" && <LoadError>Impossible de charger les vidéos. Actualisez la page.</LoadError>}
      {!failure && !rows && <Loading />}

      {rows && (
        <div className="flex flex-col gap-6">
          <Panel title="Format conseillé">
            <p className="p-5 sm:p-6 text-sm text-stone leading-relaxed">
              Fichier <b>MP4</b>, {VIDEO_MAX_MB} Mo au plus, {MAX_HOME_VIDEOS} vidéos au plus. Exportez en 720p, de 10 à 15 Mo,
              de préférence en moins d&apos;une minute : la vidéo démarre plus vite et consomme moins de données, pour les
              visiteurs comme pour le stockage. Elle passe sans le son tant que le visiteur ne l&apos;active pas.
            </p>
          </Panel>

          {upload && (
            <div className="dash-card px-5 sm:px-6 py-4" role="status">
              <p className="text-sm text-ink [overflow-wrap:anywhere]">
                Envoi de « {upload.name} » : {Math.round(upload.progress * 100)} %. Gardez cette page ouverte.
              </p>
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-line">
                <div className="h-full bg-gold transition-[width] duration-200" style={{ width: `${Math.round(upload.progress * 100)}%` }} />
              </div>
            </div>
          )}

          {rows.length === 0 ? (
            <EmptyState>Aucune vidéo : la section n&apos;apparaît pas sur l&apos;accueil.</EmptyState>
          ) : (
            <ul className="dash-card overflow-hidden divide-y divide-line">
              {rows.map((v, i) => (
                <li key={v.id} className="flex flex-col sm:flex-row sm:items-center gap-4 px-5 sm:px-6 py-4">
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
                  <video
                    src={v.video_url}
                    poster={v.poster_url ?? undefined}
                    controls
                    muted
                    playsInline
                    preload="none"
                    className="w-full sm:w-48 aspect-video shrink-0 rounded-md bg-black object-contain"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="text-sm text-ink">{v.title || "Sans titre"}</span>
                      <span
                        className={cn(
                          "font-sans-wide text-[0.6rem] uppercase px-2.5 py-1",
                          v.is_active ? "bg-gold text-ink-dark" : "border border-ink/30 text-stone"
                        )}
                      >
                        {v.is_active ? "En ligne" : "Masquée"}
                      </span>
                    </div>
                    <p className="text-xs text-stone-light mt-1.5 [overflow-wrap:anywhere]">
                      {v.button_label && v.button_url ? `Bouton « ${v.button_label} » : ${v.button_url}` : "Sans bouton"}
                    </p>
                  </div>
                  <div className="flex items-center gap-4 shrink-0">
                    <Button variant="outline" size="sm" onClick={() => setEditing(v)}>
                      Modifier
                    </Button>
                    <button
                      type="button"
                      onClick={() => toggleActive(v)}
                      className="text-xs text-stone hover:text-ink underline underline-offset-2 cursor-pointer"
                    >
                      {v.is_active ? "Masquer" : "Afficher"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleting(v)}
                      className="text-xs text-danger underline underline-offset-2 cursor-pointer"
                    >
                      Supprimer
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {editing && (
        <VideoDialog
          video={editing}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            changed("Vidéo enregistrée");
          }}
        />
      )}

      <ConfirmDialog
        open={deleting !== null}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="Supprimer cette vidéo ?"
        confirmLabel="Supprimer"
        onConfirm={handleDelete}
        pending={pending}
      >
        La vidéo disparaîtra de l&apos;accueil et son fichier sera effacé. Pour la retirer seulement un temps, utilisez plutôt
        « Masquer ».
      </ConfirmDialog>
    </>
  );
}

function VideoDialog({ video, onClose, onSaved }: { video: VideoRow; onClose: () => void; onSaved: () => void }) {
  const [title, setTitle] = useState(video.title);
  const [body, setBody] = useState(video.body);
  const [buttonLabel, setButtonLabel] = useState(video.button_label);
  const [buttonUrl, setButtonUrl] = useState(video.button_url);
  const [isActive, setIsActive] = useState(video.is_active);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const label = buttonLabel.trim();
    const url = buttonUrl.trim();

    if (label && !url) return setError("Indiquez la page ouverte par le bouton, ou videz son libellé.");
    if (url && !label) return setError("Indiquez le libellé du bouton, ou videz le lien.");
    if (url && !url.startsWith("/") && !url.startsWith("https://")) {
      return setError("Le lien doit être une page du site (commençant par /) ou une adresse complète commençant par https://.");
    }

    setSaving(true);
    const { error: saveError } = await createClient()
      .from("home_videos")
      .update({ title: title.trim(), body: body.trim(), button_label: label, button_url: url, is_active: isActive })
      .eq("id", video.id);
    setSaving(false);

    if (saveError) {
      setError(dbErrorMessage(saveError, "La vidéo n'a pas pu être enregistrée."));
      return;
    }
    onSaved();
  }

  return (
    <Dialog open onOpenChange={(open) => !open && !saving && onClose()}>
      <DialogContent className="w-[calc(100%-2rem)] max-w-lg p-6 sm:p-8 rounded-[14px] border border-line max-h-[90svh] overflow-y-auto">
        <DialogTitle className="font-display text-2xl text-ink mb-6 pr-10">Textes de la vidéo</DialogTitle>
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <Field label="Titre (facultatif)" htmlFor="video-title" hint={`${title.trim().length} / 60 caractères. Ex. « Robe wax Awa, coupe droite ».`}>
            <Input id="video-title" maxLength={60} value={title} onChange={(e) => setTitle(e.target.value)} autoComplete="off" />
          </Field>
          <Field label="Texte (facultatif)" htmlFor="video-body" hint={`${body.trim().length} / 200 caractères.`}>
            <Textarea id="video-body" maxLength={200} rows={3} value={body} onChange={(e) => setBody(e.target.value)} />
          </Field>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Bouton (facultatif)" htmlFor="video-button-label" hint="Ex. « Voir la robe ».">
              <Input id="video-button-label" maxLength={40} value={buttonLabel} onChange={(e) => setButtonLabel(e.target.value)} autoComplete="off" />
            </Field>
            <Field label="Page ouverte" htmlFor="video-button-url" hint="Ex. /produit/robe-wax ou https://…">
              <Input id="video-button-url" maxLength={300} value={buttonUrl} onChange={(e) => setButtonUrl(e.target.value)} placeholder="/boutique" autoComplete="off" />
            </Field>
          </div>
          <CheckboxField
            label="Afficher sur l'accueil"
            hint="Décochez pour garder la vidéo sans la montrer."
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
