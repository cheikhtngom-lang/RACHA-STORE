"use client";

import { useState } from "react";
import { Plus, MapPin, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AccountShell } from "@/components/account/account-shell";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

type Address = {
  id: string;
  label: string;
  fullName: string;
  address: string;
  postalCode: string;
  city: string;
  country: string;
  isDefault?: boolean;
};

const initialAddresses: Address[] = [
  {
    id: "addr-1",
    label: "Domicile",
    fullName: "Cliente Racha Store",
    address: "12 rue des Ateliers",
    postalCode: "75011",
    city: "Paris",
    country: "France",
    isDefault: true,
  },
];

function AddressBook() {
  const [addresses, setAddresses] = useState<Address[]>(initialAddresses);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ label: "", fullName: "", address: "", postalCode: "", city: "", country: "France" });

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setAddresses((prev) => [...prev, { id: `addr-${Date.now()}`, ...form }]);
    setDialogOpen(false);
    setForm({ label: "", fullName: "", address: "", postalCode: "", city: "", country: "France" });
    toast.success("Adresse ajoutée");
  }

  function remove(id: string) {
    setAddresses((prev) => prev.filter((a) => a.id !== id));
    toast("Adresse supprimée");
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-2xl text-ink">Mes adresses</h2>
        <Button variant="outline" size="sm" onClick={() => setDialogOpen(true)}>
          <Plus size={14} className="mr-1.5" /> Ajouter
        </Button>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {addresses.map((a) => (
          <div key={a.id} className="border border-line p-6 relative">
            {a.isDefault && (
              <span className="absolute top-4 right-4 font-sans-wide text-[0.6rem] uppercase text-gold">Par défaut</span>
            )}
            <MapPin size={18} strokeWidth={1.5} className="text-gold mb-3" />
            <p className="text-sm text-ink mb-1">{a.label}</p>
            <p className="text-sm text-stone leading-relaxed">
              {a.fullName}
              <br />
              {a.address}
              <br />
              {a.postalCode} {a.city}, {a.country}
            </p>
            <div className="flex gap-4 mt-4 pt-4 border-t border-line">
              <button className="flex items-center gap-1.5 text-xs text-stone-light hover:text-ink cursor-pointer">
                <Pencil size={13} strokeWidth={1.5} /> Modifier
              </button>
              <button
                onClick={() => remove(a.id)}
                className="flex items-center gap-1.5 text-xs text-stone-light hover:text-ink cursor-pointer"
              >
                <Trash2 size={13} strokeWidth={1.5} /> Supprimer
              </button>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="w-[92vw] max-w-md p-8">
          <DialogTitle className="font-display text-2xl text-ink mb-6">Ajouter une adresse</DialogTitle>
          <form onSubmit={submit} className="flex flex-col gap-5">
            <div>
              <Label htmlFor="addr-label">Nom de l&apos;adresse</Label>
              <Input id="addr-label" required placeholder="Domicile, Bureau…" value={form.label} onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))} />
            </div>
            <div>
              <Label htmlFor="addr-name">Nom complet</Label>
              <Input id="addr-name" required value={form.fullName} onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))} />
            </div>
            <div>
              <Label htmlFor="addr-address">Adresse</Label>
              <Input id="addr-address" required value={form.address} onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="addr-postal">Code postal</Label>
                <Input id="addr-postal" required value={form.postalCode} onChange={(e) => setForm((f) => ({ ...f, postalCode: e.target.value }))} />
              </div>
              <div>
                <Label htmlFor="addr-city">Ville</Label>
                <Input id="addr-city" required value={form.city} onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))} />
              </div>
            </div>
            <div>
              <Label htmlFor="addr-country">Pays</Label>
              <Input id="addr-country" required value={form.country} onChange={(e) => setForm((f) => ({ ...f, country: e.target.value }))} />
            </div>
            <Button type="submit" variant="primary" size="lg" className="w-full">
              Enregistrer l&apos;adresse
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
