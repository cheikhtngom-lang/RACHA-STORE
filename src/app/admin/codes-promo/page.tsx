"use client";

import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { PageHeader, Field, CheckboxField, Loading, LoadError, EmptyState, ConfirmDialog } from "@/components/admin/ui";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { dbErrorMessage, formatDate } from "@/lib/admin/utils";
import { cn } from "@/lib/utils";

type PromoCode = {
  code: string;
  percent_off: number;
  is_active: boolean;
  starts_at: string | null;
  expires_at: string | null;
  max_uses: number | null;
  times_used: number;
};

const DAY = 24 * 60 * 60 * 1000;

// La base stocke un instant ; l'écran parle en jours. « Jusqu'au 31 inclus »
// est enregistré comme le 1er à minuit.
function toInputDate(iso: string | null, shiftDays = 0) {
  if (!iso) return "";
  const d = new Date(new Date(iso).getTime() + shiftDays * DAY);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function fromInputDate(value: string, shiftDays = 0) {
  if (!value) return null;
  const d = new Date(`${value}T00:00:00`);
  d.setDate(d.getDate() + shiftDays);
  return d.toISOString();
}

function codeStatus(p: PromoCode) {
  const now = Date.now();
  if (!p.is_active) return { label: "Désactivé", className: "border border-ink/30 text-stone" };
  if (p.expires_at && new Date(p.expires_at).getTime() <= now) return { label: "Expiré", className: "border border-ink/30 text-stone" };
  if (p.max_uses !== null && p.times_used >= p.max_uses) return { label: "Épuisé", className: "border border-ink/30 text-stone" };
  if (p.starts_at && new Date(p.starts_at).getTime() > now) return { label: "Programmé", className: "bg-gold-pale text-ink" };
  return { label: "Actif", className: "bg-gold text-ink-dark" };
}

function validity(p: PromoCode) {
  const until = p.expires_at ? formatDate(new Date(new Date(p.expires_at).getTime() - DAY).toISOString()) : null;
  const from = p.starts_at ? formatDate(p.starts_at) : null;
  if (from && until) return `Du ${from} au ${until} inclus`;
  if (from) return `À partir du ${from}`;
  if (until) return `Jusqu'au ${until} inclus`;
  return "Sans date limite";
}

export default function AdminPromoCodesPage() {
  const [codes, setCodes] = useState<PromoCode[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [editing, setEditing] = useState<PromoCode | "new" | null>(null);
  const [deleting, setDeleting] = useState<PromoCode | null>(null);
  const [pending, setPending] = useState(false);
  const [version, setVersion] = useState(0);

  useEffect(() => {
    createClient()
      .from("promo_codes")
      .select("code, percent_off, is_active, starts_at, expires_at, max_uses, times_used")
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (error) setFailed(true);
        else setCodes(data as PromoCode[]);
      });
  }, [version]);

  async function toggleActive(p: PromoCode) {
    const { error } = await createClient().from("promo_codes").update({ is_active: !p.is_active }).eq("code", p.code);
    if (error) {
      toast.error(dbErrorMessage(error, "Le code n'a pas pu être modifié."));
      return;
    }
    toast.success(p.is_active ? `${p.code} désactivé` : `${p.code} activé`);
    setVersion((v) => v + 1);
  }

  async function handleDelete() {
    if (!deleting) return;
    setPending(true);
    const { error } = await createClient().from("promo_codes").delete().eq("code", deleting.code);
    setPending(false);
    setDeleting(null);
    if (error) {
      toast.error(dbErrorMessage(error, "Le code n'a pas pu être supprimé."));
      return;
    }
    toast.success("Code supprimé");
    setVersion((v) => v + 1);
  }

  return (
    <>
      <PageHeader
        title="Codes promo"
        description="Le client saisit le code dans son panier ; la remise s'applique sur les articles, hors livraison."
        action={
          <Button variant="primary" onClick={() => setEditing("new")}>
            <Plus size={15} strokeWidth={1.5} />
            Créer un code
          </Button>
        }
      />

      {failed && <LoadError>Impossible de charger les codes promo. Actualisez la page.</LoadError>}
      {!failed && !codes && <Loading />}
      {codes && codes.length === 0 && <EmptyState>Aucun code promo pour le moment.</EmptyState>}
      {codes && codes.length > 0 && (
        <ul className="dash-card overflow-hidden divide-y divide-line">
          {codes.map((p) => {
            const status = codeStatus(p);
            return (
              <li key={p.code} className="flex flex-col sm:flex-row sm:items-center gap-4 px-5 sm:px-6 py-4">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="font-sans-wide text-sm text-ink">{p.code}</span>
                    <span className="text-sm text-stone">−{p.percent_off} %</span>
                    <span className={cn("font-sans-wide text-[0.6rem] uppercase px-2.5 py-1", status.className)}>{status.label}</span>
                  </div>
                  <p className="text-xs text-stone-light mt-1.5">
                    {validity(p)} · {p.times_used}
                    {p.max_uses !== null ? ` / ${p.max_uses}` : ""} utilisation{p.times_used > 1 ? "s" : ""}
                  </p>
                </div>
                <div className="flex items-center gap-4 shrink-0">
                  <Button variant="outline" size="sm" onClick={() => setEditing(p)}>
                    Modifier
                  </Button>
                  <button type="button" onClick={() => toggleActive(p)} className="text-xs text-stone hover:text-ink underline underline-offset-2 cursor-pointer">
                    {p.is_active ? "Désactiver" : "Activer"}
                  </button>
                  {p.times_used === 0 && (
                    <button
                      type="button"
                      onClick={() => setDeleting(p)}
                      className="text-xs text-danger underline underline-offset-2 cursor-pointer"
                    >
                      Supprimer
                    </button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {editing && (
        <PromoDialog
          promo={editing === "new" ? null : editing}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            setVersion((v) => v + 1);
          }}
        />
      )}

      <ConfirmDialog
        open={deleting !== null}
        onOpenChange={(open) => !open && setDeleting(null)}
        title="Supprimer ce code ?"
        confirmLabel="Supprimer"
        onConfirm={handleDelete}
        pending={pending}
      >
        Le code {deleting?.code} n&apos;a jamais été utilisé. Il ne sera plus accepté dans le panier.
      </ConfirmDialog>
    </>
  );
}

function PromoDialog({ promo, onClose, onSaved }: { promo: PromoCode | null; onClose: () => void; onSaved: () => void }) {
  const [code, setCode] = useState(promo?.code ?? "");
  const [percent, setPercent] = useState(promo ? String(promo.percent_off) : "");
  const [startsAt, setStartsAt] = useState(toInputDate(promo?.starts_at ?? null));
  const [expiresOn, setExpiresOn] = useState(toInputDate(promo?.expires_at ?? null, -1));
  const [maxUses, setMaxUses] = useState(promo?.max_uses != null ? String(promo.max_uses) : "");
  const [isActive, setIsActive] = useState(promo?.is_active ?? true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const percentOff = Number(percent);
    const max = maxUses.trim() ? Number(maxUses) : null;
    const normalizedCode = code.trim().toUpperCase();

    if (!promo && !/^[A-Z0-9-]{3,30}$/.test(normalizedCode)) {
      return setError("Le code doit faire de 3 à 30 caractères : lettres, chiffres ou tirets, sans espace.");
    }
    if (!Number.isInteger(percentOff) || percentOff < 1 || percentOff > 100) {
      return setError("La remise doit être un nombre entier entre 1 et 100.");
    }
    if (max !== null && (!Number.isInteger(max) || max < 1)) {
      return setError("Le nombre d'utilisations doit être un entier supérieur à 0, ou vide pour illimité.");
    }
    if (startsAt && expiresOn && expiresOn < startsAt) {
      return setError("La date de fin est avant la date de début.");
    }

    const values = {
      percent_off: percentOff,
      is_active: isActive,
      starts_at: fromInputDate(startsAt),
      expires_at: fromInputDate(expiresOn, 1),
      max_uses: max,
    };

    setSaving(true);
    const supabase = createClient();
    const { error: saveError } = promo
      ? await supabase.from("promo_codes").update(values).eq("code", promo.code)
      : await supabase.from("promo_codes").insert({ ...values, code: normalizedCode });
    setSaving(false);

    if (saveError) {
      setError(saveError.code === "23505" ? "Ce code existe déjà." : dbErrorMessage(saveError, "Le code n'a pas pu être enregistré."));
      return;
    }
    toast.success(promo ? "Code enregistré" : `Code ${normalizedCode} créé`);
    onSaved();
  }

  return (
    <Dialog open onOpenChange={(open) => !open && !saving && onClose()}>
      <DialogContent className="w-[calc(100%-2rem)] max-w-lg p-6 sm:p-8">
        <DialogTitle className="font-display text-2xl text-ink mb-6 pr-10">{promo ? promo.code : "Nouveau code promo"}</DialogTitle>
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {!promo && (
            <Field label="Code" htmlFor="promo-code" hint="Ce que le client tape dans son panier, ex. TABASKI15.">
              <Input
                id="promo-code"
                required
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                autoCapitalize="characters"
                autoComplete="off"
              />
            </Field>
          )}
          <Field label="Remise (%)" htmlFor="promo-percent">
            <Input id="promo-percent" inputMode="numeric" required value={percent} onChange={(e) => setPercent(e.target.value)} placeholder="15" />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Début (facultatif)" htmlFor="promo-start">
              <Input id="promo-start" type="date" value={startsAt} onChange={(e) => setStartsAt(e.target.value)} />
            </Field>
            <Field label="Fin incluse (facultatif)" htmlFor="promo-end">
              <Input id="promo-end" type="date" value={expiresOn} onChange={(e) => setExpiresOn(e.target.value)} />
            </Field>
          </div>
          <Field label="Nombre d'utilisations (facultatif)" htmlFor="promo-max" hint="Vide : illimité. Chaque commande compte pour une utilisation.">
            <Input id="promo-max" inputMode="numeric" value={maxUses} onChange={(e) => setMaxUses(e.target.value)} />
          </Field>
          <CheckboxField label="Code actif" checked={isActive} onChange={setIsActive} />
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
