"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { Panel, Field, Loading, LoadError, ConfirmDialog } from "@/components/admin/ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const EMAIL_PATTERN = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const MIN_PASSWORD = 8;

// Compte de la personne connectée : identité, e-mail de connexion, mot de
// passe, sessions. Tout passe par Supabase Auth et la table profiles.
export function AccountSettings() {
  const [user, setUser] = useState<User | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data, error }) => {
      if (error || !data.user) setFailed(true);
      else setUser(data.user);
    });
    // Après un changement d'e-mail ou de nom, Supabase renvoie le compte à jour.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "USER_UPDATED" && session?.user) setUser(session.user);
    });
    return () => subscription.unsubscribe();
  }, []);

  if (failed) return <LoadError>Impossible de lire votre compte. Actualisez la page.</LoadError>;
  if (!user) return <Loading />;

  return (
    <div className="grid lg:grid-cols-2 gap-6 items-start">
      <ProfileForm user={user} />
      <EmailForm user={user} />
      <PasswordForm email={user.email ?? ""} />
      <SessionsPanel />
    </div>
  );
}

function FormFooter({ saving, label = "Enregistrer" }: { saving: boolean; label?: string }) {
  return (
    <div className="flex justify-end">
      <Button type="submit" variant="primary" size="sm" disabled={saving}>
        {saving ? "Enregistrement…" : label}
      </Button>
    </div>
  );
}

function ProfileForm({ user }: { user: User }) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    createClient()
      .from("profiles")
      .select("first_name, last_name, phone")
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        setFirstName(data?.first_name ?? user.user_metadata?.first_name ?? "");
        setLastName(data?.last_name ?? user.user_metadata?.last_name ?? "");
        setPhone(data?.phone ?? "");
        setLoaded(true);
      });
  }, [user.id, user.user_metadata]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const values = { first_name: firstName.trim(), last_name: lastName.trim(), phone: phone.trim() || null };
    if (!values.first_name || !values.last_name) return setError("Indiquez votre prénom et votre nom.");

    setSaving(true);
    const supabase = createClient();
    const [profile, auth] = await Promise.all([
      supabase.from("profiles").update(values).eq("id", user.id),
      // Le prénom affiché dans « Bonjour … » vient du compte Supabase.
      supabase.auth.updateUser({ data: { first_name: values.first_name, last_name: values.last_name } }),
    ]);
    setSaving(false);
    if (profile.error || auth.error) {
      setError("Vos informations n'ont pas pu être enregistrées. Réessayez.");
      return;
    }
    toast.success("Profil enregistré");
  }

  return (
    <Panel title="Profil">
      {!loaded ? (
        <div className="p-5 sm:p-6">
          <Loading />
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 flex flex-col gap-5">
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Prénom" htmlFor="profile-first-name">
              <Input id="profile-first-name" required maxLength={100} value={firstName} onChange={(e) => setFirstName(e.target.value)} autoComplete="given-name" />
            </Field>
            <Field label="Nom" htmlFor="profile-last-name">
              <Input id="profile-last-name" required maxLength={100} value={lastName} onChange={(e) => setLastName(e.target.value)} autoComplete="family-name" />
            </Field>
          </div>
          <Field label="Téléphone (facultatif)" htmlFor="profile-phone" hint="Pour vous joindre ; il n'est pas affiché sur le site.">
            <Input id="profile-phone" type="tel" maxLength={30} value={phone} onChange={(e) => setPhone(e.target.value)} autoComplete="tel" />
          </Field>
          {error && <LoadError>{error}</LoadError>}
          <FormFooter saving={saving} />
        </form>
      )}
    </Panel>
  );
}

function EmailForm({ user }: { user: User }) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  // Changement demandé mais pas encore confirmé par les liens reçus.
  const pending = sentTo ?? user.new_email ?? null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const next = email.trim().toLowerCase();
    if (!EMAIL_PATTERN.test(next)) return setError("Adresse e-mail invalide.");
    if (next === user.email) return setError("C'est déjà votre adresse actuelle.");

    setSaving(true);
    const { error: updateError } = await createClient().auth.updateUser(
      { email: next },
      { emailRedirectTo: `${window.location.origin}/auth/confirm?next=/admin/parametres` }
    );
    setSaving(false);
    if (updateError) {
      setError(
        updateError.code === "email_exists"
          ? "Cette adresse est déjà utilisée par un autre compte."
          : updateError.code === "over_email_send_rate_limit"
            ? "Trop de demandes : réessayez dans quelques minutes."
            : "Le changement n'a pas pu être demandé. Réessayez."
      );
      return;
    }
    setSentTo(next);
    setEmail("");
  }

  return (
    <Panel title="Adresse e-mail de connexion">
      <form onSubmit={handleSubmit} className="p-5 sm:p-6 flex flex-col gap-5">
        <div>
          <p className="font-sans-wide text-[0.65rem] uppercase text-stone mb-2">Adresse actuelle</p>
          <p className="text-sm text-ink break-all">{user.email}</p>
        </div>
        {pending && (
          <p className="text-sm text-ink border border-gold/30 bg-gold/10 rounded-[10px] p-4 leading-relaxed">
            Changement vers <b className="font-medium break-all">{pending}</b> en attente. Ouvrez le lien reçu à cette adresse,
            et celui reçu à l&apos;adresse actuelle si vous en avez un : le changement est fait une fois les liens confirmés.
          </p>
        )}
        <Field label="Nouvelle adresse" htmlFor="account-email" hint="Elle servira à vous connecter et à recevoir les e-mails du compte.">
          <Input id="account-email" type="email" required maxLength={254} value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
        </Field>
        {error && <LoadError>{error}</LoadError>}
        <FormFooter saving={saving} label="Changer l'adresse" />
      </form>
    </Panel>
  );
}

function PasswordForm({ email }: { email: string }) {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (next.length < MIN_PASSWORD) return setError(`Le nouveau mot de passe doit faire au moins ${MIN_PASSWORD} caractères.`);
    if (next !== confirm) return setError("Les deux nouveaux mots de passe ne sont pas identiques.");
    if (next === current) return setError("Le nouveau mot de passe doit être différent de l'actuel.");

    setSaving(true);
    const supabase = createClient();
    // Vérifie le mot de passe actuel : un ordinateur resté ouvert ne suffit pas pour le changer.
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password: current });
    if (signInError) {
      setSaving(false);
      setError("Mot de passe actuel incorrect.");
      return;
    }
    const { error: updateError } = await supabase.auth.updateUser({ password: next });
    setSaving(false);
    if (updateError) {
      setError(
        updateError.code === "weak_password"
          ? "Mot de passe trop simple : mélangez lettres, chiffres et symboles."
          : updateError.code === "same_password"
            ? "Le nouveau mot de passe doit être différent de l'actuel."
            : "Le mot de passe n'a pas pu être changé. Réessayez."
      );
      return;
    }
    setCurrent("");
    setNext("");
    setConfirm("");
    toast.success("Mot de passe changé");
  }

  return (
    <Panel title="Mot de passe">
      <form onSubmit={handleSubmit} className="p-5 sm:p-6 flex flex-col gap-5">
        <Field label="Mot de passe actuel" htmlFor="password-current">
          <Input id="password-current" type="password" required value={current} onChange={(e) => setCurrent(e.target.value)} autoComplete="current-password" />
        </Field>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Nouveau mot de passe" htmlFor="password-new" hint={`${MIN_PASSWORD} caractères minimum.`}>
            <Input id="password-new" type="password" required minLength={MIN_PASSWORD} value={next} onChange={(e) => setNext(e.target.value)} autoComplete="new-password" />
          </Field>
          <Field label="Confirmer" htmlFor="password-confirm">
            <Input id="password-confirm" type="password" required minLength={MIN_PASSWORD} value={confirm} onChange={(e) => setConfirm(e.target.value)} autoComplete="new-password" />
          </Field>
        </div>
        {error && <LoadError>{error}</LoadError>}
        <FormFooter saving={saving} label="Changer le mot de passe" />
      </form>
    </Panel>
  );
}

function SessionsPanel() {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [pending, setPending] = useState(false);

  async function signOutEverywhere() {
    setPending(true);
    const { error } = await createClient().auth.signOut({ scope: "global" });
    setPending(false);
    setConfirming(false);
    if (error) {
      toast.error("La déconnexion n'a pas pu être faite. Réessayez.");
      return;
    }
    toast("Déconnecté·e de tous les appareils");
    router.push("/compte/connexion?next=/admin");
  }

  return (
    <Panel title="Appareils connectés">
      <div className="p-5 sm:p-6 flex flex-col gap-5">
        <p className="text-sm text-stone leading-relaxed">
          Téléphone perdu, ordinateur partagé : fermez la session sur tous les appareils où ce compte est ouvert, y compris
          celui-ci. Il faudra ensuite vous reconnecter.
        </p>
        <div className="flex justify-end">
          <Button type="button" variant="outline" size="sm" onClick={() => setConfirming(true)}>
            Se déconnecter partout
          </Button>
        </div>
      </div>
      <ConfirmDialog
        open={confirming}
        onOpenChange={setConfirming}
        title="Se déconnecter partout ?"
        confirmLabel="Se déconnecter"
        onConfirm={signOutEverywhere}
        pending={pending}
      >
        Toutes les sessions ouvertes avec ce compte seront fermées, y compris celle-ci.
      </ConfirmDialog>
    </Panel>
  );
}
