"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { authErrorMessage } from "@/lib/auth";
import { toAccountUser, useAuthStore } from "@/store/auth-store";
import { Input, Label } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { img, pools } from "@/data/images";

export default function RegisterPage() {
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [emailSentTo, setEmailSentTo] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    const { data, error } = await createClient().auth.signUp({
      email,
      password,
      options: {
        data: { first_name: firstName.trim(), last_name: lastName.trim() },
        emailRedirectTo: `${window.location.origin}/auth/confirm?next=/compte`,
      },
    });
    setSubmitting(false);
    if (error) {
      setError(authErrorMessage(error));
      return;
    }
    // Sans confirmation par e-mail (réglage Supabase), la session est ouverte tout de suite.
    if (data.session && data.user) {
      useAuthStore.setState({ status: "authenticated", user: toAccountUser(data.user) });
      toast.success("Compte créé", { description: `Bienvenue chez Racha Store, ${firstName}` });
      router.push("/compte");
      return;
    }
    setEmailSentTo(email);
  }

  return (
    <div className="grid lg:grid-cols-2 min-h-[85vh]">
      <div className="flex items-center justify-center px-6 py-16 sm:py-24 order-2 lg:order-1">
        <div className="w-full max-w-sm">
          {emailSentTo ? (
            <div>
              <p className="eyebrow text-gold mb-3">Dernière étape</p>
              <h1 className="font-display text-3xl sm:text-4xl text-ink mb-4">Vérifiez votre boîte mail</h1>
              <p className="text-sm text-stone leading-relaxed">
                Nous avons envoyé un lien de confirmation à <span className="text-ink">{emailSentTo}</span>. Cliquez
                dessus pour activer votre compte. Pensez à regarder dans les courriers indésirables.
              </p>
            </div>
          ) : (
            <>
              <p className="eyebrow text-gold mb-3">Rejoignez-nous</p>
              <h1 className="font-display text-3xl sm:text-4xl text-ink mb-2">Créer un compte</h1>
              <p className="text-sm text-stone-light mb-10">
                Suivez vos commandes, gérez vos adresses et retrouvez votre liste de souhaits.
              </p>

              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="reg-firstname">Prénom</Label>
                    <Input id="reg-firstname" autoComplete="given-name" required value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                  </div>
                  <div>
                    <Label htmlFor="reg-lastname">Nom</Label>
                    <Input id="reg-lastname" autoComplete="family-name" required value={lastName} onChange={(e) => setLastName(e.target.value)} />
                  </div>
                </div>
                <div>
                  <Label htmlFor="reg-email">Adresse e-mail</Label>
                  <Input id="reg-email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div>
                  <Label htmlFor="reg-password">Mot de passe</Label>
                  <Input
                    id="reg-password"
                    type="password"
                    autoComplete="new-password"
                    required
                    minLength={8}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <p className="text-xs text-stone-light mt-2">8 caractères minimum.</p>
                </div>
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <Checkbox required className="mt-0.5" />
                  <span className="text-xs text-stone">
                    J&apos;accepte les{" "}
                    <Link href="/cgv" className="underline underline-offset-2">
                      conditions générales de vente
                    </Link>{" "}
                    et la politique de confidentialité.
                  </span>
                </label>
                {error && <p className="text-sm text-[#6E2A32]">{error}</p>}
                <Button type="submit" variant="primary" size="lg" className="mt-2" disabled={submitting}>
                  {submitting ? "Création du compte…" : "Créer mon compte"}
                </Button>
              </form>

              <p className="text-sm text-stone-light mt-8 text-center">
                Déjà client·e ?{" "}
                <Link href="/compte/connexion" className="text-ink underline underline-offset-2">
                  Se connecter
                </Link>
              </p>
            </>
          )}
        </div>
      </div>

      <div className="relative hidden lg:block bg-ink-dark order-1 lg:order-2">
        <Image src={img(pools.apparel[14], 1200, 1600)} alt="Racha Store" fill sizes="50vw" className="object-cover opacity-80" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-dark via-ink-dark/20 to-transparent" />
        <div className="absolute bottom-16 left-12 right-12">
          <p className="font-display text-3xl text-cream leading-snug">
            Un compte pour suivre vos commandes et retrouver vos adresses de livraison.
          </p>
        </div>
      </div>
    </div>
  );
}
