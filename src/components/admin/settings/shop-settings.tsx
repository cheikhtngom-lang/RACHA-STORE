"use client";

import { useEffect, useState } from "react";
import { Plus, X } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { Panel, Field, Loading, LoadError } from "@/components/admin/ui";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { dbErrorMessage, notifyCatalogChanged } from "@/lib/admin/utils";
import type { ShopSettingsRow } from "@/lib/shop-info";
import { whatsappNumber } from "@/lib/utils";

const EMAIL_PATTERN = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const MAX_ITEMS = 5;

// Informations de la boutique (table shop_settings, affichées sur le site) et
// réglages internes (table admin_settings).
export function ShopSettings() {
  const [shop, setShop] = useState<ShopSettingsRow | null>(null);
  const [orderEmails, setOrderEmails] = useState<string[] | null>(null);
  const [failure, setFailure] = useState<"migration" | "error" | null>(null);

  useEffect(() => {
    const supabase = createClient();
    Promise.all([
      supabase.from("shop_settings").select("contact_email, phones, address, opening_hours, instagram_url, tiktok_url").maybeSingle(),
      supabase.from("admin_settings").select("order_emails").maybeSingle(),
    ]).then(([shopResult, adminResult]) => {
      const error = shopResult.error ?? adminResult.error;
      if (error || !shopResult.data || !adminResult.data) {
        // Tables absentes : la migration n'a pas été exécutée.
        setFailure(error?.code === "PGRST205" || error?.code === "42P01" || !error ? "migration" : "error");
        return;
      }
      setShop(shopResult.data as ShopSettingsRow);
      setOrderEmails(adminResult.data.order_emails as string[]);
    });
  }, []);

  if (failure === "migration") {
    return (
      <LoadError>
        Les paramètres de la boutique ne sont pas encore activés : exécutez le fichier
        supabase/migrations/20260929090000_settings.sql dans Supabase → SQL Editor, puis rechargez la page.
      </LoadError>
    );
  }
  if (failure === "error") return <LoadError>Impossible de charger les paramètres. Actualisez la page.</LoadError>;
  if (!shop || !orderEmails) return <Loading />;

  return (
    <div className="grid lg:grid-cols-[1.4fr_1fr] gap-6 items-start">
      <ContactForm initial={shop} />
      <OrderEmailsForm initial={orderEmails} />
    </div>
  );
}

// Liste de champs (téléphones, e-mails) : ajout et retrait, au plus MAX_ITEMS.
function ListField({
  label,
  hint,
  values,
  onChange,
  type,
  addLabel,
  firstNote,
}: {
  label: string;
  hint: string;
  values: string[];
  onChange: (values: string[]) => void;
  type: "tel" | "email";
  addLabel: string;
  firstNote?: string;
}) {
  return (
    <div>
      <Label>{label}</Label>
      <div className="flex flex-col gap-2">
        {values.map((value, i) => (
          <div key={i} className="flex items-center gap-2">
            <Input
              type={type}
              value={value}
              maxLength={type === "email" ? 254 : 30}
              aria-label={`${label} ${i + 1}`}
              onChange={(e) => onChange(values.map((v, j) => (j === i ? e.target.value : v)))}
            />
            {i === 0 && firstNote && values.length > 1 && (
              <span className="hidden sm:block shrink-0 text-[0.65rem] font-sans-wide uppercase text-gold-light">{firstNote}</span>
            )}
            <button
              type="button"
              onClick={() => onChange(values.filter((_, j) => j !== i))}
              aria-label={`Retirer ${value || "cette ligne"}`}
              className="h-12 w-10 shrink-0 flex items-center justify-center text-stone-light hover:text-ink cursor-pointer"
            >
              <X size={16} strokeWidth={1.5} />
            </button>
          </div>
        ))}
      </div>
      {values.length < MAX_ITEMS && (
        <button
          type="button"
          onClick={() => onChange([...values, ""])}
          className="mt-3 inline-flex items-center gap-2 text-xs text-ink underline underline-offset-2 cursor-pointer"
        >
          <Plus size={14} />
          {addLabel}
        </button>
      )}
      <p className="text-xs text-stone-light mt-2">{hint}</p>
    </div>
  );
}

function ContactForm({ initial }: { initial: ShopSettingsRow }) {
  const [email, setEmail] = useState(initial.contact_email);
  const [phones, setPhones] = useState(initial.phones.length ? initial.phones : [""]);
  const [address, setAddress] = useState(initial.address);
  const [hours, setHours] = useState(initial.opening_hours);
  const [instagram, setInstagram] = useState(initial.instagram_url ?? "");
  const [tiktok, setTiktok] = useState(initial.tiktok_url ?? "");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const values = {
      contact_email: email.trim().toLowerCase(),
      phones: phones.map((p) => p.trim()).filter(Boolean),
      address: address.trim(),
      opening_hours: hours.trim(),
      instagram_url: instagram.trim() || null,
      tiktok_url: tiktok.trim() || null,
    };

    if (!EMAIL_PATTERN.test(values.contact_email)) return setError("L'e-mail de contact est invalide.");
    const badPhone = values.phones.find((p) => whatsappNumber(p).length < 8);
    if (badPhone) return setError(`Numéro incomplet : ${badPhone}. Indiquez l'indicatif pour un numéro étranger (+33…).`);
    if (values.address.length < 3) return setError("Indiquez l'adresse de la boutique.");
    for (const [name, url] of [
      ["Instagram", values.instagram_url],
      ["TikTok", values.tiktok_url],
    ] as const) {
      if (url && !url.startsWith("https://")) return setError(`Le lien ${name} doit commencer par https://`);
    }

    setSaving(true);
    const { error: saveError } = await createClient().from("shop_settings").update(values).eq("id", true);
    setSaving(false);
    if (saveError) {
      setError(dbErrorMessage(saveError, "Les informations n'ont pas pu être enregistrées."));
      return;
    }
    setPhones(values.phones.length ? values.phones : [""]);
    notifyCatalogChanged();
    toast.success("Informations de la boutique enregistrées", { description: "Elles apparaissent aussitôt sur le site." });
  }

  return (
    <Panel title="Coordonnées affichées sur le site">
      <form onSubmit={handleSubmit} className="p-5 sm:p-6 flex flex-col gap-5">
        <p className="text-xs text-stone-light -mt-1">Pied de page, page Contact, menu mobile et politique de confidentialité.</p>
        <Field label="E-mail de contact" htmlFor="shop-email">
          <Input id="shop-email" type="email" required maxLength={254} value={email} onChange={(e) => setEmail(e.target.value)} />
        </Field>
        <ListField
          label="Téléphones"
          hint="Tels qu'ils seront affichés, avec l'indicatif pour l'étranger (+33…). Chaque numéro propose l'appel et WhatsApp ; le premier est le numéro principal."
          values={phones}
          onChange={setPhones}
          type="tel"
          addLabel="Ajouter un numéro"
          firstNote="Principal"
        />
        <Field label="Adresse" htmlFor="shop-address" hint="Sert aussi à la carte et à l'itinéraire Google Maps de la page Contact.">
          <Input id="shop-address" required maxLength={200} value={address} onChange={(e) => setAddress(e.target.value)} />
        </Field>
        <Field label="Horaires (facultatif)" htmlFor="shop-hours">
          <Input id="shop-hours" maxLength={120} value={hours} onChange={(e) => setHours(e.target.value)} placeholder="Du lundi au samedi, de 10h à 19h" />
        </Field>
        <div className="grid sm:grid-cols-2 gap-4 pt-5 border-t border-line">
          <Field label="Instagram (facultatif)" htmlFor="shop-instagram">
            <Input id="shop-instagram" type="url" maxLength={200} value={instagram} onChange={(e) => setInstagram(e.target.value)} placeholder="https://www.instagram.com/…" />
          </Field>
          <Field label="TikTok (facultatif)" htmlFor="shop-tiktok">
            <Input id="shop-tiktok" type="url" maxLength={200} value={tiktok} onChange={(e) => setTiktok(e.target.value)} placeholder="https://www.tiktok.com/@…" />
          </Field>
        </div>
        {error && <LoadError>{error}</LoadError>}
        <div className="flex justify-end">
          <Button type="submit" variant="primary" size="sm" disabled={saving}>
            {saving ? "Enregistrement…" : "Enregistrer"}
          </Button>
        </div>
      </form>
    </Panel>
  );
}

function OrderEmailsForm({ initial }: { initial: string[] }) {
  const [emails, setEmails] = useState(initial.length ? initial : [""]);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const list = [...new Set(emails.map((v) => v.trim().toLowerCase()).filter(Boolean))];
    if (list.length === 0) return setError("Indiquez au moins une adresse.");
    const bad = list.find((v) => !EMAIL_PATTERN.test(v));
    if (bad) return setError(`Adresse invalide : ${bad}`);

    setSaving(true);
    const { error: saveError } = await createClient().from("admin_settings").update({ order_emails: list }).eq("id", true);
    setSaving(false);
    if (saveError) {
      setError(dbErrorMessage(saveError, "Les adresses n'ont pas pu être enregistrées."));
      return;
    }
    setEmails(list);
    toast.success("Destinataires enregistrés");
  }

  return (
    <Panel title="E-mail « Nouvelle commande »">
      <form onSubmit={handleSubmit} className="p-5 sm:p-6 flex flex-col gap-5">
        <ListField
          label="Envoyé à"
          hint="Chaque nouvelle commande est envoyée à ces adresses, avec les coordonnées du client. Elles ne sont pas affichées sur le site."
          values={emails}
          onChange={setEmails}
          type="email"
          addLabel="Ajouter une adresse"
        />
        {error && <LoadError>{error}</LoadError>}
        <div className="flex justify-end">
          <Button type="submit" variant="primary" size="sm" disabled={saving}>
            {saving ? "Enregistrement…" : "Enregistrer"}
          </Button>
        </div>
      </form>
    </Panel>
  );
}
