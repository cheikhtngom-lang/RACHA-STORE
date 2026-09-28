"use client";

import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AccountShell } from "@/components/account/account-shell";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { createClient } from "@/lib/supabase/client";
import { useAuthStore } from "@/store/auth-store";

type AddressRow = {
  id: string;
  label: string;
  full_name: string;
  phone: string | null;
  address: string;
  address_complement: string | null;
  postal_code: string | null;
  city: string;
  country: string;
  is_default: boolean;
};

const COLUMNS = "id, label, full_name, phone, address, address_complement, postal_code, city, country, is_default";

const emptyForm = {
  label: "",
  fullName: "",
  phone: "",
  address: "",
  addressComplement: "",
  postalCode: "",
  city: "Dakar",
  country: "Sénégal",
  isDefault: false,
};

function AddressBook() {
  const userId = useAuthStore((s) => s.user?.id);
  const [addresses, setAddresses] = useState<AddressRow[] | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const [reloadKey, setReloadKey] = useState(0);
  const reload = () => setReloadKey((k) => k + 1);

  useEffect(() => {
    let cancelled = false;
    createClient()
      .from("addresses")
      .select(COLUMNS)
      .order("is_default", { ascending: false })
      .order("created_at")
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error) toast.error("Impossible de charger vos adresses");
        else setAddresses(data as AddressRow[]);
      });
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  function openCreate() {
    setEditingId(null);
    setForm({ ...emptyForm, isDefault: (addresses?.length ?? 0) === 0 });
    setDialogOpen(true);
  }

  function openEdit(a: AddressRow) {
    setEditingId(a.id);
    setForm({
      label: a.label,
      fullName: a.full_name,
      phone: a.phone ?? "",
      address: a.address,
      addressComplement: a.address_complement ?? "",
      postalCode: a.postal_code ?? "",
      city: a.city,
      country: a.country,
      isDefault: a.is_default,
    });
    setDialogOpen(true);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!userId) return;
    setSaving(true);
    const supabase = createClient();
    const makeDefault = form.isDefault || (addresses?.length ?? 0) === 0;
    // Une seule adresse par défaut : on retire d'abord l'ancienne.
    if (makeDefault) {
      await supabase.from("addresses").update({ is_default: false }).eq("is_default", true);
    }
    const values = {
      label: form.label.trim(),
      full_name: form.fullName.trim(),
      phone: form.phone.trim() || null,
      address: form.address.trim(),
      address_complement: form.addressComplement.trim() || null,
      postal_code: form.postalCode.trim() || null,
      city: form.city.trim(),
      country: form.country.trim(),
      is_default: makeDefault,
    };
    const { error } = editingId
      ? await supabase.from("addresses").update(values).eq("id", editingId)
      : await supabase.from("addresses").insert({ ...values, user_id: userId });
    setSaving(false);
    if (error) {
      toast.error("L'adresse n'a pas pu être enregistrée");
      return;
    }
    setDialogOpen(false);
    toast.success(editingId ? "Adresse modifiée" : "Adresse ajoutée");
    reload();
  }

  async function makeDefault(id: string) {
    const supabase = createClient();
    await supabase.from("addresses").update({ is_default: false }).eq("is_default", true);
    const { error } = await supabase.from("addresses").update({ is_default: true }).eq("id", id);
    if (error) toast.error("Impossible de changer l'adresse par défaut");
    reload();
  }

  async function remove(id: string) {
    const { error } = await createClient().from("addresses").delete().eq("id", id);
    if (error) {
      toast.error("L'adresse n'a pas pu être supprimée");
      return;
    }
    toast("Adresse supprimée");
    reload();
  }

  function field<K extends keyof typeof emptyForm>(key: K, value: (typeof emptyForm)[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-2xl text-ink">Mes adresses</h2>
        <Button variant="outline" size="sm" onClick={openCreate}>
          <Plus size={14} className="mr-1.5" /> Ajouter
        </Button>
      </div>

      {!addresses ? (
        <p className="text-sm text-stone-light">Chargement…</p>
      ) : addresses.length === 0 ? (
        <p className="dash-card text-sm text-stone-light p-8">
          Aucune adresse enregistrée. Ajoutez-en une pour la retrouver automatiquement lors de vos commandes.
        </p>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {addresses.map((a) => (
            <div key={a.id} className="dash-card p-6">
              {a.is_default && (
                <span className="absolute top-4 right-4 font-sans-wide text-[0.6rem] uppercase text-gold">Par défaut</span>
              )}
              <p className="text-sm text-ink mb-1 pr-20">{a.label}</p>
              <p className="text-sm text-stone leading-relaxed">
                {a.full_name}
                {a.phone ? `, ${a.phone}` : ""}
                <br />
                {a.address}
                {a.address_complement ? `, ${a.address_complement}` : ""}
                <br />
                {[a.postal_code, a.city].filter(Boolean).join(" ")}, {a.country}
              </p>
              <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-line">
                <button onClick={() => openEdit(a)} className="flex items-center gap-1.5 text-xs text-stone-light hover:text-ink cursor-pointer">
                  <Pencil size={13} strokeWidth={1.5} /> Modifier
                </button>
                <button onClick={() => remove(a.id)} className="flex items-center gap-1.5 text-xs text-stone-light hover:text-ink cursor-pointer">
                  <Trash2 size={13} strokeWidth={1.5} /> Supprimer
                </button>
                {!a.is_default && (
                  <button onClick={() => makeDefault(a.id)} className="text-xs text-stone-light underline underline-offset-2 hover:text-ink cursor-pointer">
                    Utiliser par défaut
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="theme-dashboard text-ink w-[92vw] max-w-md p-8 max-h-[90vh] overflow-y-auto rounded-[14px] border border-line">
          <DialogTitle className="font-display text-2xl text-ink mb-6">
            {editingId ? "Modifier l'adresse" : "Ajouter une adresse"}
          </DialogTitle>
          <form onSubmit={save} className="flex flex-col gap-5">
            <div>
              <Label htmlFor="addr-label">Nom de l&apos;adresse</Label>
              <Input id="addr-label" required placeholder="Domicile, Bureau…" value={form.label} onChange={(e) => field("label", e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="addr-name">Nom complet</Label>
                <Input id="addr-name" required autoComplete="name" value={form.fullName} onChange={(e) => field("fullName", e.target.value)} />
              </div>
              <div>
                <Label htmlFor="addr-phone">Téléphone</Label>
                <Input id="addr-phone" type="tel" autoComplete="tel" placeholder="+221 77 000 00 00" value={form.phone} onChange={(e) => field("phone", e.target.value)} />
              </div>
            </div>
            <div>
              <Label htmlFor="addr-address">Adresse</Label>
              <Input id="addr-address" required placeholder="Quartier, rue, numéro de villa" value={form.address} onChange={(e) => field("address", e.target.value)} />
            </div>
            <div>
              <Label htmlFor="addr-complement">Complément (facultatif)</Label>
              <Input id="addr-complement" value={form.addressComplement} onChange={(e) => field("addressComplement", e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="addr-postal">Code postal (facultatif)</Label>
                <Input id="addr-postal" value={form.postalCode} onChange={(e) => field("postalCode", e.target.value)} />
              </div>
              <div>
                <Label htmlFor="addr-city">Ville</Label>
                <Input id="addr-city" required value={form.city} onChange={(e) => field("city", e.target.value)} />
              </div>
            </div>
            <div>
              <Label htmlFor="addr-country">Pays</Label>
              <Input id="addr-country" required value={form.country} onChange={(e) => field("country", e.target.value)} />
            </div>
            <label className="flex items-center gap-2.5 cursor-pointer">
              <Checkbox checked={form.isDefault} onCheckedChange={(v) => field("isDefault", !!v)} />
              <span className="text-sm text-stone">Utiliser comme adresse par défaut</span>
            </label>
            <Button type="submit" variant="primary" size="lg" className="w-full" disabled={saving}>
              {saving ? "Enregistrement…" : "Enregistrer l'adresse"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function AddressesPage() {
  return (
    <AccountShell>
      <AddressBook />
    </AccountShell>
  );
}
